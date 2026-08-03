import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mainInstrumentBlocks } from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';
import { exportFollowUpSchedule } from './followup-schedule-export.js';
import { createSession, savePreAndStartArtifact, submitBlock } from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);
const requestId = 'f5d74d44-f700-4dc7-ac00-5e251a8890c3';

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function temporaryDatabasePaths(): {
  readonly directory: string;
  readonly study: string;
  readonly recontact: string;
} {
  const root = mkdtempSync(join(tmpdir(), 'passwo-recontact-'));
  temporaryDirectories.push(root);
  const directory = join(root, 'data');
  return {
    directory,
    study: join(directory, 'study.sqlite'),
    recontact: join(directory, 'recontact.sqlite'),
  };
}

function createServer(
  databasePath: string,
  recontactDatabasePath: string,
  createRecontactToken?: () => string,
): FastifyInstance {
  const server = buildStudyServer({
    version: '0.1.2',
    assignmentMode: 'forced-supportive',
    databasePath,
    recontactDatabasePath,
    nowIso: () => '2026-07-24T12:00:00.000Z',
    ...(createRecontactToken === undefined ? {} : { createRecontactToken }),
  });
  servers.push(server);
  return server;
}

describe('follow-up recontact boundary', () => {
  it('keeps contact data in a protected second database and recovers idempotently after restart', async () => {
    const paths = temporaryDatabasePaths();
    const token = 'A'.repeat(43);
    const firstServer = createServer(paths.study, paths.recontact, () => token);
    const session = await createSession(firstServer, 1, false, true);
    const registration = {
      requestId,
      email: 'Person@Example.org',
    };

    expect((await submitBlock(firstServer, session.sessionId, 'pre-v1', 'sample')).statusCode).toBe(
      409,
    );
    const firstRegistration = await firstServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/recontact`,
      payload: registration,
    });
    const retry = await firstServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/recontact`,
      payload: { ...registration, email: 'person@example.org' },
    });
    const conflict = await firstServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/recontact`,
      payload: { ...registration, email: 'different@example.org' },
    });

    expect(firstRegistration.json()).toEqual({ registered: true });
    expect(retry.json()).toEqual({ registered: true });
    expect(conflict.statusCode).toBe(409);

    await firstServer.close();
    servers.splice(servers.indexOf(firstServer), 1);
    const restartedServer = createServer(paths.study, paths.recontact, () => 'B'.repeat(43));
    const recoveredRetry = await restartedServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/recontact`,
      payload: { ...registration, email: 'person@example.org' },
    });
    expect(recoveredRetry.json()).toEqual({ registered: true });

    const studyDatabase = new Database(paths.study, { readonly: true });
    const studyRow = studyDatabase
      .prepare(
        `SELECT
          condition,
          follow_up_consent AS followUpConsent,
          follow_up_version AS followUpVersion,
          follow_up_token_hash AS followUpTokenHash
         FROM study_sessions
         WHERE session_id = ?`,
      )
      .get(session.sessionId);
    const studyColumns = studyDatabase.prepare('PRAGMA table_info(study_sessions)').all();
    studyDatabase.close();
    const recontactDatabase = new Database(paths.recontact, { readonly: true });
    const recontactRow = recontactDatabase
      .prepare(
        `SELECT
          email,
          raw_token AS rawToken,
          token_hash AS tokenHash,
          consent_version AS consentVersion,
          registration_request_id AS requestId
         FROM registrations`,
      )
      .get();
    const recontactSchema = recontactDatabase
      .prepare(`SELECT sql FROM sqlite_master WHERE type IN ('table', 'index')`)
      .all();
    recontactDatabase.close();
    const expectedHash = createHash('sha256').update(token, 'utf8').digest('hex');

    expect(studyRow).toEqual({
      condition: 'supportive',
      followUpConsent: 1,
      followUpVersion: 'follow-up-v3-draft',
      followUpTokenHash: expectedHash,
    });
    expect(JSON.stringify(studyColumns)).not.toMatch(/email|raw_token/iu);
    expect(recontactRow).toEqual({
      email: 'person@example.org',
      rawToken: token,
      tokenHash: expectedHash,
      consentVersion: 'consent-v6-draft',
      requestId,
    });
    expect(JSON.stringify(recontactSchema)).not.toMatch(
      /condition|response|timing|training|password/iu,
    );
    expect(statSync(paths.directory).mode & 0o777).toBe(0o700);
    expect(statSync(paths.study).mode & 0o777).toBe(0o600);
    expect(statSync(paths.recontact).mode & 0o777).toBe(0o600);
  });

  it('migrates existing token hashes or registry entries to explicit follow-up consent', async () => {
    const paths = temporaryDatabasePaths();
    const firstServer = createServer(paths.study, paths.recontact, () => 'F'.repeat(43));
    const session = await createSession(firstServer, 5);
    await firstServer.close();
    servers.splice(servers.indexOf(firstServer), 1);

    const legacyStudyDatabase = new Database(paths.study);
    legacyStudyDatabase.exec(`
      ALTER TABLE study_sessions DROP COLUMN follow_up_consent;
      DELETE FROM schema_migrations WHERE version = 5;
      UPDATE study_sessions SET follow_up_token_hash = NULL;
    `);
    legacyStudyDatabase.close();

    createServer(paths.study, paths.recontact);
    const migratedStudyDatabase = new Database(paths.study, { readonly: true });
    expect(
      migratedStudyDatabase
        .prepare(
          `SELECT
             follow_up_consent AS followUpConsent,
             follow_up_token_hash AS followUpTokenHash
           FROM study_sessions
           WHERE session_id = ?`,
        )
        .get(session.sessionId),
    ).toEqual({
      followUpConsent: 1,
      followUpTokenHash: createHash('sha256').update('F'.repeat(43), 'utf8').digest('hex'),
    });
    migratedStudyDatabase.close();
  });

  it('calculates completion-relative dates and exports a protected local token schedule', async () => {
    const paths = temporaryDatabasePaths();
    const token = 'C'.repeat(43);
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-reference',
      databasePath: paths.study,
      recontactDatabasePath: paths.recontact,
      referenceArtifactDirectory: referenceArtifactFixtureDirectory,
      nowIso: () => '2026-07-24T12:00:00.000Z',
      createRecontactToken: () => token,
    });
    servers.push(server);
    const session = await createSession(server, 2, false, true);
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/recontact`,
          payload: { requestId, email: 'followup@example.org' },
        })
      ).statusCode,
    ).toBe(200);
    await savePreAndStartArtifact(server, session.sessionId);
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/timing`,
          payload: {
            sequence: 1,
            phase: 'artifact',
            sectionId: null,
            segmentId: null,
            eventType: 'end',
            clientMonotonicMs: 900,
            clientWallClockIso: '2026-07-24T12:00:00.000Z',
            elapsedMs: 800,
            reasonCode: null,
          },
        })
      ).statusCode,
    ).toBe(200);
    for (const block of mainInstrumentBlocks.filter(
      (candidate) => candidate.instrumentId !== 'pre-v1',
    )) {
      expect(
        (await submitBlock(server, session.sessionId, block.instrumentId, block.sectionId))
          .statusCode,
      ).toBe(200);
    }
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/complete`,
          payload: { debriefAcknowledged: true },
        })
      ).json(),
    ).toEqual({ completionStatus: 'completed' });

    const recontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(
      recontactDatabase
        .prepare(
          `SELECT
            first_invitation_at_iso AS firstInvitationAtIso,
            reminder_at_iso AS reminderAtIso,
            closes_at_iso AS closesAtIso
           FROM registrations`,
        )
        .get(),
    ).toEqual({
      firstInvitationAtIso: '2026-08-03T12:00:00.000Z',
      reminderAtIso: '2026-08-05T12:00:00.000Z',
      closesAtIso: '2026-08-07T12:00:00.000Z',
    });
    recontactDatabase.close();

    const outputPath = join(paths.directory, 'schedule.json');
    expect(
      exportFollowUpSchedule({
        databasePath: paths.recontact,
        outputPath,
        baseUrl: 'https://survey.example.org/follow-up',
      }),
    ).toEqual({ recordCount: 1 });
    const exported: unknown = JSON.parse(readFileSync(outputPath, 'utf8'));
    expect(exported).toEqual([
      {
        email: 'followup@example.org',
        tokenLink: `https://survey.example.org/follow-up?token=${token}`,
        firstInvitationAtIso: '2026-08-03T12:00:00.000Z',
        reminderAtIso: '2026-08-05T12:00:00.000Z',
        closesAtIso: '2026-08-07T12:00:00.000Z',
      },
    ]);
    expect(readFileSync(outputPath, 'utf8')).not.toMatch(/condition/iu);
    expect(statSync(outputPath).mode & 0o777).toBe(0o600);
    expect(readFileSync(outputPath, 'utf8')).not.toMatch(/smtp|gmail|credential/iu);

    const csvOutputPath = join(paths.directory, 'schedule.csv');
    expect(
      exportFollowUpSchedule({
        databasePath: paths.recontact,
        outputPath: csvOutputPath,
        baseUrl: 'https://survey.example.org/follow-up',
      }),
    ).toEqual({ recordCount: 1 });
    expect(readFileSync(csvOutputPath, 'utf8')).toContain(
      'email,tokenLink,firstInvitationAtIso,reminderAtIso,closesAtIso',
    );
    expect(statSync(csvOutputPath).mode & 0o777).toBe(0o600);
  });

  it('completes the main study without a recontact registration', async () => {
    const paths = temporaryDatabasePaths();
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-reference',
      databasePath: paths.study,
      recontactDatabasePath: paths.recontact,
      referenceArtifactDirectory: referenceArtifactFixtureDirectory,
      nowIso: () => '2026-07-24T12:00:00.000Z',
    });
    servers.push(server);
    const session = await createSession(server, 3, false);
    await savePreAndStartArtifact(server, session.sessionId);
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/timing`,
          payload: {
            sequence: 1,
            phase: 'artifact',
            sectionId: null,
            segmentId: null,
            eventType: 'end',
            clientMonotonicMs: 900,
            clientWallClockIso: '2026-07-24T12:00:00.000Z',
            elapsedMs: 800,
            reasonCode: null,
          },
        })
      ).statusCode,
    ).toBe(200);
    for (const block of mainInstrumentBlocks.filter(
      (candidate) => candidate.instrumentId !== 'pre-v1',
    )) {
      expect(
        (await submitBlock(server, session.sessionId, block.instrumentId, block.sectionId))
          .statusCode,
      ).toBe(200);
    }

    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/complete`,
          payload: { debriefAcknowledged: true },
        })
      ).json(),
    ).toEqual({ completionStatus: 'completed' });

    const recontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(recontactDatabase.prepare('SELECT COUNT(*) AS count FROM registrations').get()).toEqual({
      count: 0,
    });
    recontactDatabase.close();

    const schedulePath = join(paths.directory, 'empty-schedule.json');
    expect(
      exportFollowUpSchedule({
        databasePath: paths.recontact,
        outputPath: schedulePath,
        baseUrl: 'https://survey.example.org/follow-up',
      }),
    ).toEqual({ recordCount: 0 });
    expect(JSON.parse(readFileSync(schedulePath, 'utf8'))).toEqual([]);
  });

  it('abandons optional recontact idempotently without changing the research identity', async () => {
    const paths = temporaryDatabasePaths();
    const server = createServer(paths.study, paths.recontact, () => 'E'.repeat(43));
    const session = await createSession(server, 4);

    const abandon = () =>
      server.inject({
        method: 'POST',
        url: `/api/study/sessions/${session.sessionId}/recontact/abandon`,
        payload: {},
      });
    expect((await abandon()).json()).toEqual({ abandoned: true });
    expect((await abandon()).json()).toEqual({ abandoned: true });

    const studyDatabase = new Database(paths.study, { readonly: true });
    expect(
      studyDatabase
        .prepare(
          `SELECT
            session_id AS sessionId,
            research_code AS researchCode,
            deletion_code_hash AS deletionCodeHash,
            condition,
            follow_up_consent AS followUpConsent,
            follow_up_token_hash AS followUpTokenHash
           FROM study_sessions
           WHERE session_id = ?`,
        )
        .get(session.sessionId),
    ).toEqual({
      sessionId: session.sessionId,
      researchCode: expect.stringMatching(/^RS-[A-F0-9]{16}$/u),
      deletionCodeHash: '4'.padStart(64, '0'),
      condition: session.condition,
      followUpConsent: 0,
      followUpTokenHash: null,
    });
    studyDatabase.close();

    const recontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(recontactDatabase.prepare('SELECT COUNT(*) AS count FROM registrations').get()).toEqual({
      count: 0,
    });
    recontactDatabase.close();

    expect((await submitBlock(server, session.sessionId, 'pre-v1', 'sample')).statusCode).toBe(200);
  });
});
