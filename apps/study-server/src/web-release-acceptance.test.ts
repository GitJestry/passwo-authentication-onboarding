import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hashDeletionCode,
  mainInstrumentBlocks,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  supportiveSectionResumeTargetFor,
  supportiveS08ResumeStateSchema,
  webCreateSessionResponseSchema,
  webResumeResponseSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildStudyServer } from './app.js';
import { exportResearchData } from './research-export.js';
import { runStudyDataDeletion } from './study-data-deletion.js';
import {
  completeWebTestStudy,
  createWebTestSession,
  deterministicTestRandomSource,
  openWebArtifactInterval,
  recordWebSupportiveSegments,
  supportiveS08ResumeStateFixture,
  submitWebInstrumentBlocks,
  webPost,
  webStudyWriteHeaders,
} from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);
const fixedNowIso = '2026-08-24T12:00:00.000Z';
const resumeCloseAtIso = '2099-01-01T00:00:00.000Z';

const sessionPersistenceSchema = z
  .object({
    sessionId: z.uuid(),
    researchCode: z.string().regex(/^RS-[A-F0-9]{16}$/u),
    deletionCodeHash: z.string().regex(/^[a-f0-9]{64}$/u),
    condition: z.enum(['supportive', 'reference']),
    completionStatus: z.literal('completed'),
    progressCheckpoint: z.literal('complete'),
    followUpConsent: z.literal(1),
    artifactElapsedMs: z.number().nonnegative(),
    interruptionCount: z.number().int().nonnegative(),
  })
  .strict();
const countSchema = z.object({ count: z.number().int().nonnegative() }).strict();

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function temporaryDatabasePaths(prefix: string) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  temporaryDirectories.push(directory);
  return {
    directory,
    study: join(directory, 'study.sqlite'),
    recontact: join(directory, 'recontact.sqlite'),
  };
}

function createWebServer(
  assignmentMode: 'forced-supportive' | 'forced-reference' | 'permuted-block',
  databasePath: string,
  recontactDatabasePath: string,
  secureCookies = false,
): FastifyInstance {
  let resumeTokenIdentity = 0;
  const server = buildStudyServer({
    version: '0.1.2-web-release-acceptance',
    assignmentMode,
    databasePath,
    recontactDatabasePath,
    randomSource: deterministicTestRandomSource(),
    createRecontactToken: () => 'R'.repeat(43),
    referenceArtifactDirectory: referenceArtifactFixtureDirectory,
    nowIso: () => fixedNowIso,
    webRuntime: {
      resumeCloseAtIso,
      secureCookies,
      createResumeToken: () => {
        resumeTokenIdentity += 1;
        return resumeTokenIdentity.toString(36).padStart(43, 'A');
      },
    },
  });
  servers.push(server);
  return server;
}

async function closeTrackedServer(server: FastifyInstance): Promise<void> {
  await server.close();
  const index = servers.indexOf(server);
  if (index >= 0) servers.splice(index, 1);
}

function rowCount(database: Database.Database, table: string, sessionId: string): number {
  return countSchema.parse(
    database.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE session_id = ?`).get(sessionId),
  ).count;
}

function rawResumeToken(cookie: string): string {
  const separator = cookie.indexOf('=');
  if (separator < 1) throw new Error('invalid-resume-cookie');
  return cookie.slice(separator + 1);
}

function groupBy<Key, Value>(
  values: readonly Value[],
  keyFor: (value: Value) => Key,
): ReadonlyMap<Key, readonly Value[]> {
  const groups = new Map<Key, Value[]>();
  for (const value of values) {
    const key = keyFor(value);
    const group = groups.get(key);
    if (group === undefined) groups.set(key, [value]);
    else group.push(value);
  }
  return groups;
}

for (const assignmentMode of ['forced-supportive', 'forced-reference'] as const) {
  const expectedCondition = assignmentMode === 'forced-supportive' ? 'supportive' : 'reference';

  it(`persists, pseudonymizes, exports and deletes a complete ${expectedCondition} Web run`, async () => {
    const paths = temporaryDatabasePaths(`passwo-${expectedCondition}-release-`);
    const server = createWebServer(assignmentMode, paths.study, paths.recontact);
    const created = await createWebTestSession(
      server,
      expectedCondition === 'supportive' ? 101 : 102,
    );
    expect(created.session.condition).toBe(expectedCondition);

    await completeWebTestStudy(
      server,
      created,
      expectedCondition === 'supportive'
        ? '81000000-0000-4000-8000-000000000101'
        : '81000000-0000-4000-8000-000000000102',
    );
    await closeTrackedServer(server);

    const studyDatabase = new Database(paths.study, { readonly: true, fileMustExist: true });
    const persisted = sessionPersistenceSchema.parse(
      studyDatabase
        .prepare(
          `SELECT session_id AS sessionId, research_code AS researchCode,
                  deletion_code_hash AS deletionCodeHash, condition,
                  completion_status AS completionStatus,
                  progress_checkpoint AS progressCheckpoint,
                  follow_up_consent AS followUpConsent,
                  (SELECT COALESCE(SUM(interval.confirmed_elapsed_ms), 0)
                   FROM web_artifact_intervals AS interval
                   WHERE interval.session_id = study_sessions.session_id) AS artifactElapsedMs,
                  web_interruption_count AS interruptionCount
           FROM study_sessions WHERE session_id = ?`,
        )
        .get(created.session.sessionId),
    );
    expect(persisted.condition).toBe(expectedCondition);
    expect(persisted.sessionId).not.toBe(persisted.researchCode);
    expect(persisted.deletionCodeHash).toBe(await hashDeletionCode(created.session.deletionCode));
    expect(persisted.artifactElapsedMs).toBeGreaterThan(0);
    expect(persisted.interruptionCount).toBe(0);
    expect(rowCount(studyDatabase, 'instrument_submissions', persisted.sessionId)).toBe(
      mainInstrumentBlocks.length,
    );
    expect(rowCount(studyDatabase, 'responses', persisted.sessionId)).toBe(
      mainInstrumentBlocks.reduce((sum, block) => sum + block.items.length, 0),
    );
    expect(rowCount(studyDatabase, 'web_resume_tokens', persisted.sessionId)).toBe(1);
    expect(rowCount(studyDatabase, 'web_artifact_intervals', persisted.sessionId)).toBe(1);
    expect(rowCount(studyDatabase, 'web_artifact_visibility_events', persisted.sessionId)).toBe(1);
    expect(rowCount(studyDatabase, 'web_segment_timing_events', persisted.sessionId)).toBe(
      expectedCondition === 'supportive' ? SUPPORTIVE_ARTIFACT_SEGMENT_IDS.length * 2 : 0,
    );

    const resumeToken = rawResumeToken(created.cookie);
    const persistedResumeToken = z
      .object({ tokenHash: z.string().regex(/^[a-f0-9]{64}$/u), invalidatedAtIso: z.string() })
      .strict()
      .parse(
        studyDatabase
          .prepare(
            `SELECT token_hash AS tokenHash, invalidated_at_iso AS invalidatedAtIso
             FROM web_resume_tokens WHERE session_id = ?`,
          )
          .get(persisted.sessionId),
      );
    expect(persistedResumeToken.tokenHash).toBe(
      createHash('sha256').update(resumeToken, 'utf8').digest('hex'),
    );
    const studySchema = JSON.stringify(
      studyDatabase.prepare(`SELECT sql FROM sqlite_master WHERE sql IS NOT NULL`).all(),
    );
    expect(studySchema).not.toMatch(
      /display_name|password_value|raw_token|\bemail\b|user_agent|ip_address/iu,
    );
    studyDatabase.close();

    const recontactDatabase = new Database(paths.recontact, {
      readonly: true,
      fileMustExist: true,
    });
    expect(
      recontactDatabase
        .prepare(
          `SELECT email, consent_version AS consentVersion FROM registrations WHERE session_id = ?`,
        )
        .get(persisted.sessionId),
    ).toMatchObject({
      email: `web-participant-${expectedCondition === 'supportive' ? 101 : 102}@example.org`,
    });
    recontactDatabase.close();

    const exportDirectory = join(paths.directory, 'research-export');
    const exported = exportResearchData({
      databasePath: paths.study,
      outputDirectory: exportDirectory,
      exportedAtIso: '2026-08-24T13:00:00.000Z',
    });
    expect(exported.manifest.schemaVersion).toBe('research-export-v7');
    const exportedText = exported.files
      .map((file) => readFileSync(join(exportDirectory, file), 'utf8'))
      .join('\n');
    expect(exportedText).toContain(persisted.researchCode);
    expect(exportedText).not.toContain(persisted.sessionId);
    expect(exportedText).not.toContain(created.session.deletionCode);
    expect(exportedText).not.toContain(persisted.deletionCodeHash);
    expect(exportedText).not.toContain(resumeToken);
    expect(exportedText).not.toContain('web-participant-');
    expect(exportedText).not.toContain('passphrase-01-hyphen');
    expect(exportedText).not.toContain('campusgram--master-campus');

    const dryRun = runStudyDataDeletion({
      databasePath: paths.study,
      recontactDatabasePath: paths.recontact,
      deletionCodeHash: persisted.deletionCodeHash,
      mode: 'dry-run',
    });
    const deletionCounts = Object.fromEntries(
      dryRun.tables.map(({ table, count }) => [table, count]),
    );
    expect(deletionCounts).toMatchObject({
      study_sessions: 1,
      assignment_slots: 0,
      guardrail_form_slots: 1,
      instrument_submissions: mainInstrumentBlocks.length,
      web_resume_tokens: 1,
      web_artifact_intervals: 1,
      web_segment_timing_events:
        expectedCondition === 'supportive' ? SUPPORTIVE_ARTIFACT_SEGMENT_IDS.length * 2 : 0,
      web_artifact_visibility_events: 1,
      'recontact.registrations': 1,
    });
    expect(
      runStudyDataDeletion({
        databasePath: paths.study,
        recontactDatabasePath: paths.recontact,
        deletionCodeHash: persisted.deletionCodeHash,
        mode: 'delete',
      }),
    ).toEqual(dryRun);

    const deletedStudyDatabase = new Database(paths.study, { readonly: true });
    for (const table of [
      'study_sessions',
      'assignment_slots',
      'guardrail_form_slots',
      'artifact_leases',
      'timing_events',
      'instrument_submissions',
      'responses',
      'response_presentations',
      'web_resume_tokens',
      'web_artifact_intervals',
      'web_segment_timing_events',
      'web_artifact_visibility_events',
    ]) {
      expect(rowCount(deletedStudyDatabase, table, persisted.sessionId)).toBe(0);
    }
    deletedStudyDatabase.close();
    const deletedRecontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(rowCount(deletedRecontactDatabase, 'registrations', persisted.sessionId)).toBe(0);
    deletedRecontactDatabase.close();
  });
}

describe('Web resume and concurrency acceptance', () => {
  it('issues only the opaque production return key as a Secure HttpOnly first-party cookie', async () => {
    const paths = temporaryDatabasePaths('passwo-secure-cookie-');
    const server = createWebServer('forced-supportive', paths.study, paths.recontact, true);
    const created = await createWebTestSession(server, 200, false);

    expect(created.setCookieHeader).toMatch(/^__Host-passwo-resume=[A-Za-z0-9_-]{43};/u);
    expect(created.setCookieHeader).toContain('Path=/');
    expect(created.setCookieHeader).toContain('HttpOnly');
    expect(created.setCookieHeader).toContain('SameSite=Lax');
    expect(created.setCookieHeader).toContain('Secure');
    expect(Object.keys(created.session)).not.toEqual(
      expect.arrayContaining(['researchCode', 'deletionCodeHash', 'resumeToken']),
    );
  });

  it('restarts a persisted PassWo run at the beginning of its last section after a server restart', async () => {
    const paths = temporaryDatabasePaths('passwo-section-resume-');
    const firstServer = createWebServer('forced-supportive', paths.study, paths.recontact);
    const created = await createWebTestSession(firstServer, 201, false);
    const preBlocks = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1');
    await submitWebInstrumentBlocks(
      firstServer,
      created.cookie,
      created.session.sessionId,
      preBlocks,
    );
    const firstInterval = await openWebArtifactInterval(
      firstServer,
      created.cookie,
      created.session.sessionId,
      '82000000-0000-4000-8000-000000000201',
    );
    await recordWebSupportiveSegments(
      firstServer,
      created.cookie,
      created.session.sessionId,
      firstInterval.intervalId,
      ['S00'],
      1,
    );
    await webPost(
      firstServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/artifact-intervals/heartbeat`,
      { intervalId: firstInterval.intervalId, elapsedMs: 125 },
    );
    await closeTrackedServer(firstServer);

    const restartedServer = createWebServer('forced-supportive', paths.study, paths.recontact);
    const resumedResponse = await webPost(
      restartedServer,
      created.cookie,
      '/api/study/session/resume',
      {},
    );
    const resumed = webResumeResponseSchema.parse(resumedResponse.json()).session;
    expect(resumed).not.toBeNull();
    if (resumed === null) throw new Error('missing-resumed-session');
    expect(resumed).toMatchObject({
      sessionId: created.session.sessionId,
      checkpoint: 'supportive:S01',
      resumeTarget: 'artifact',
      interrupted: true,
      artifactSessionElapsedMs: 125,
      deletionCode: created.session.deletionCode,
    });
    expect(supportiveSectionResumeTargetFor('S01')).toEqual({
      sectionId: 'passwords',
      segmentId: 'S01',
    });

    const secondInterval = await openWebArtifactInterval(
      restartedServer,
      created.cookie,
      created.session.sessionId,
      '82000000-0000-4000-8000-000000000202',
    );
    expect(secondInterval).toMatchObject({
      checkpoint: 'supportive:S01',
      interrupted: true,
      artifactSessionElapsedMs: 125,
    });
    await recordWebSupportiveSegments(
      restartedServer,
      created.cookie,
      created.session.sessionId,
      secondInterval.intervalId,
      SUPPORTIVE_ARTIFACT_SEGMENT_IDS.slice(1),
      100,
    );
    await webPost(
      restartedServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/artifact-checkpoint`,
      {
        intervalId: secondInterval.intervalId,
        checkpoint: 'supportive:S08',
        resumeState: supportiveS08ResumeStateFixture,
      },
    );
    await webPost(
      restartedServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/artifact-checkpoint`,
      { intervalId: secondInterval.intervalId, checkpoint: 'supportive:complete' },
    );
    await webPost(
      restartedServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/artifact-intervals/end`,
      { intervalId: secondInterval.intervalId, elapsedMs: 200 },
    );
    await submitWebInstrumentBlocks(
      restartedServer,
      created.cookie,
      created.session.sessionId,
      mainInstrumentBlocks.slice(preBlocks.length),
    );
    await webPost(
      restartedServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/complete`,
      { debriefAcknowledged: true },
    );
    await closeTrackedServer(restartedServer);

    const database = new Database(paths.study, { readonly: true });
    expect(
      database
        .prepare(
          `SELECT progress_checkpoint AS checkpoint,
                  (SELECT COALESCE(SUM(interval.confirmed_elapsed_ms), 0)
                   FROM web_artifact_intervals AS interval
                   WHERE interval.session_id = study_sessions.session_id) AS artifactElapsedMs,
                  web_interruption_count AS interruptionCount
           FROM study_sessions WHERE session_id = ?`,
        )
        .get(created.session.sessionId),
    ).toEqual({ checkpoint: 'complete', artifactElapsedMs: 325, interruptionCount: 1 });
    expect(
      database
        .prepare(
          `SELECT confirmed_elapsed_ms AS elapsedMs, close_reason AS closeReason
           FROM web_artifact_intervals WHERE session_id = ? ORDER BY rowid`,
        )
        .all(created.session.sessionId),
    ).toEqual([
      { elapsedMs: 125, closeReason: 'interrupted' },
      { elapsedMs: 200, closeReason: 'completed' },
    ]);
    database.close();
  });

  it('resumes at S08 with only the minimal predefined simulation state', async () => {
    const paths = temporaryDatabasePaths('passwo-s08-resume-');
    const firstServer = createWebServer('forced-supportive', paths.study, paths.recontact);
    const created = await createWebTestSession(firstServer, 202, false);
    const preBlocks = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1');
    await submitWebInstrumentBlocks(
      firstServer,
      created.cookie,
      created.session.sessionId,
      preBlocks,
    );
    const interval = await openWebArtifactInterval(
      firstServer,
      created.cookie,
      created.session.sessionId,
      '82000000-0000-4000-8000-000000000203',
    );
    await recordWebSupportiveSegments(
      firstServer,
      created.cookie,
      created.session.sessionId,
      interval.intervalId,
      SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
      1,
    );
    await webPost(
      firstServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/artifact-checkpoint`,
      {
        intervalId: interval.intervalId,
        checkpoint: 'supportive:S08',
        resumeState: supportiveS08ResumeStateFixture,
      },
    );
    await closeTrackedServer(firstServer);

    const database = new Database(paths.study, { readonly: true });
    const persistedState = z
      .object({ encoded: z.string() })
      .parse(
        database
          .prepare(
            `SELECT supportive_s08_resume_state_json AS encoded
             FROM study_sessions WHERE session_id = ?`,
          )
          .get(created.session.sessionId),
      );
    const decodedState = supportiveS08ResumeStateSchema.parse(JSON.parse(persistedState.encoded));
    expect(decodedState).toEqual(supportiveS08ResumeStateFixture);
    expect(Object.keys(decodedState)).toEqual([
      'schemaVersion',
      'passphraseIds',
      'weakAccountIds',
      'relationships',
    ]);
    database.close();

    const restartedServer = createWebServer('forced-supportive', paths.study, paths.recontact);
    const resumedResponse = await webPost(
      restartedServer,
      created.cookie,
      '/api/study/session/resume',
      {},
    );
    const resumed = webResumeResponseSchema.parse(resumedResponse.json()).session;
    expect(resumed).toMatchObject({
      checkpoint: 'supportive:S08',
      resumeTarget: 'artifact',
      supportiveS08ResumeState: supportiveS08ResumeStateFixture,
    });
    await closeTrackedServer(restartedServer);
  });

  it('keeps condition and form blocks balanced under simultaneous Web session creation', async () => {
    const paths = temporaryDatabasePaths('passwo-concurrent-randomization-');
    const server = createWebServer('permuted-block', paths.study, paths.recontact);
    const sessions = await Promise.all(
      Array.from({ length: 48 }, (_, index) => createWebTestSession(server, 1_000 + index, false)),
    );
    expect(new Set(sessions.map(({ session }) => session.sessionId)).size).toBe(48);
    expect(sessions.filter(({ session }) => session.condition === 'supportive')).toHaveLength(24);
    expect(sessions.filter(({ session }) => session.condition === 'reference')).toHaveLength(24);

    const rejectedCondition = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      headers: webStudyWriteHeaders,
      payload: {
        requestId: '83000000-0000-4000-8000-000000000001',
        consentAccepted: true,
        followUpConsent: false,
        recontact: null,
        condition: 'supportive',
      },
    });
    const rejectedForm = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      headers: webStudyWriteHeaders,
      payload: {
        requestId: '83000000-0000-4000-8000-000000000002',
        consentAccepted: true,
        followUpConsent: false,
        recontact: null,
        guardrailFormId: 'F1',
      },
    });
    expect(rejectedCondition.statusCode).toBe(400);
    expect(rejectedForm.statusCode).toBe(400);

    const deletedSession = sessions[0]?.session;
    if (deletedSession === undefined) throw new Error('missing-session-for-randomization-deletion');

    const retryIdentity = 1_000;
    const retryPayload = {
      requestId: `30000000-0000-4000-8000-${retryIdentity.toString().padStart(12, '0')}`,
      consentAccepted: true,
      followUpConsent: false,
      recontact: null,
    };
    const retryResponses = await Promise.all([
      webPost(server, sessions[0]?.cookie ?? '', '/api/study/sessions', retryPayload, 201),
      webPost(server, sessions[0]?.cookie ?? '', '/api/study/sessions', retryPayload, 201),
    ]);
    expect(
      retryResponses.map(
        (response) => webCreateSessionResponseSchema.parse(response.json()).sessionId,
      ),
    ).toEqual([sessions[0]?.session.sessionId, sessions[0]?.session.sessionId]);

    await closeTrackedServer(server);
    runStudyDataDeletion({
      databasePath: paths.study,
      recontactDatabasePath: paths.recontact,
      deletionCodeHash: await hashDeletionCode(deletedSession.deletionCode),
      mode: 'delete',
    });
    const replacementServer = createWebServer('permuted-block', paths.study, paths.recontact);
    const replacement = await createWebTestSession(replacementServer, 2_000, false);
    expect(replacement.session.condition).toBe(deletedSession.condition);
    expect(replacement.session.guardrailFormId).toBe(deletedSession.guardrailFormId);
    await closeTrackedServer(replacementServer);

    const database = new Database(paths.study, { readonly: true });
    expect(
      countSchema.parse(database.prepare('SELECT COUNT(*) AS count FROM study_sessions').get())
        .count,
    ).toBe(48);
    const assignmentRows = z
      .array(
        z.object({
          blockNumber: z.number().int(),
          condition: z.enum(['supportive', 'reference']),
        }),
      )
      .parse(
        database
          .prepare(
            `SELECT block_number AS blockNumber, condition
             FROM assignment_slots WHERE session_id IS NOT NULL
             ORDER BY block_number, slot_index`,
          )
          .all(),
      );
    const assignmentBlocks = groupBy(assignmentRows, (row) => row.blockNumber);
    expect(assignmentBlocks.size).toBe(12);
    for (const rows of assignmentBlocks.values()) {
      expect(rows.filter((row) => row.condition === 'supportive')).toHaveLength(2);
      expect(rows.filter((row) => row.condition === 'reference')).toHaveLength(2);
    }

    const formRows = z
      .array(
        z.object({
          condition: z.enum(['supportive', 'reference']),
          blockNumber: z.number().int(),
          formId: z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6']),
        }),
      )
      .parse(
        database
          .prepare(
            `SELECT condition, block_number AS blockNumber, form_id AS formId
             FROM guardrail_form_slots WHERE session_id IS NOT NULL
             ORDER BY condition, block_number, slot_index`,
          )
          .all(),
      );
    const formBlocks = groupBy(formRows, (row) => `${row.condition}:${row.blockNumber}`);
    expect(formBlocks.size).toBe(8);
    for (const rows of formBlocks.values()) {
      expect(rows.map((row) => row.formId).toSorted()).toEqual([
        'F1',
        'F2',
        'F3',
        'F4',
        'F5',
        'F6',
      ]);
    }
    database.close();
  });
});
