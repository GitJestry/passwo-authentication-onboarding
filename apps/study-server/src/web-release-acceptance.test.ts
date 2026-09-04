import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hashDeletionCode,
  mainInstrumentBlocks,
  recruitmentSourceSchema,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  supportiveS08ResumeStateSchema,
  supportiveSectionResumeTargetFor,
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
  createTestResourceScope,
  createWebTestSession,
  deterministicTestRandomSource,
  openWebArtifactInterval,
  recordWebSupportiveSegments,
  submitWebInstrumentBlocks,
  supportiveS08ResumeStateFixture,
  webPost,
  webStudyWriteHeaders,
} from './test-support.js';

const resources = createTestResourceScope();
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

afterEach(() => resources.cleanup());

function temporaryDatabasePaths(prefix: string) {
  const directory = resources.createTemporaryDirectory(prefix);
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
  nowIso = fixedNowIso,
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
    nowIso: () => nowIso,
    webRuntime: {
      resumeCloseAtIso,
      secureCookies,
      createResumeToken: () => {
        resumeTokenIdentity += 1;
        return resumeTokenIdentity.toString(36).padStart(43, 'A');
      },
    },
  });
  return resources.track(server);
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

it('persists the canonical recruitment source across create, resume and export', async () => {
  const paths = temporaryDatabasePaths('passwo-recruitment-source-');
  const firstServer = createWebServer('forced-supportive', paths.study, paths.recontact);
  const createdDefault = await createWebTestSession(firstServer, 91, false);
  const createdUb = await createWebTestSession(firstServer, 92, false, 'ub');
  const createdTu = await createWebTestSession(firstServer, 93, false, 'tu');
  const createdOther = await createWebTestSession(firstServer, 94, false, 'other-university');
  const createdInvalid = await createWebTestSession(firstServer, 95, false, 'not valid!');

  const sourceRowSchema = z
    .object({
      sessionId: z.uuid(),
      researchId: z.string(),
      recruitmentSource: recruitmentSourceSchema,
    })
    .strict();
  const database = new Database(paths.study, { readonly: true, fileMustExist: true });
  const sourceRows = z.array(sourceRowSchema).parse(
    database
      .prepare(
        `SELECT session_id AS sessionId, research_code AS researchId,
                recruitment_source AS recruitmentSource
         FROM study_sessions
         ORDER BY created_at_iso, session_id`,
      )
      .all(),
  );
  database.close();
  expect(
    sourceRows.map(({ sessionId, recruitmentSource }) => ({
      sessionId,
      recruitmentSource,
    })),
  ).toEqual([
    { sessionId: createdDefault.session.sessionId, recruitmentSource: 'ub' },
    { sessionId: createdUb.session.sessionId, recruitmentSource: 'ub' },
    { sessionId: createdTu.session.sessionId, recruitmentSource: 'tu' },
    {
      sessionId: createdOther.session.sessionId,
      recruitmentSource: 'other-university',
    },
    { sessionId: createdInvalid.session.sessionId, recruitmentSource: 'ub' },
  ]);

  await resources.close(firstServer);
  const restartedServer = createWebServer('forced-supportive', paths.study, paths.recontact);
  const resumedResponse = await webPost(
    restartedServer,
    createdTu.cookie,
    '/api/study/session/resume',
    {},
  );
  expect(webResumeResponseSchema.parse(resumedResponse.json()).session?.sessionId).toBe(
    createdTu.session.sessionId,
  );
  await resources.close(restartedServer);

  const resumedDatabase = new Database(paths.study, { readonly: true, fileMustExist: true });
  expect(
    sourceRowSchema.parse(
      resumedDatabase
        .prepare(
          `SELECT session_id AS sessionId, research_code AS researchId,
                  recruitment_source AS recruitmentSource
           FROM study_sessions WHERE session_id = ?`,
        )
        .get(createdTu.session.sessionId),
    ).recruitmentSource,
  ).toBe('tu');
  resumedDatabase.close();

  const exportedSourceRows = sourceRows.filter(({ sessionId }) =>
    [createdTu.session.sessionId, createdOther.session.sessionId].includes(sessionId),
  );
  const exportDirectory = join(paths.directory, 'research-export');
  await exportResearchData({ databasePath: paths.study, outputDirectory: exportDirectory });
  const exportedSessionsRaw: unknown = JSON.parse(
    readFileSync(join(exportDirectory, 'sessions.json'), 'utf8'),
  );
  const exportedSessions = z
    .array(
      z
        .object({
          researchId: z.string(),
          recruitmentSource: recruitmentSourceSchema,
        })
        .passthrough(),
    )
    .parse(exportedSessionsRaw);
  expect(
    exportedSourceRows.map(({ researchId, recruitmentSource }) =>
      exportedSessions.find(
        (session) =>
          session.researchId === researchId && session.recruitmentSource === recruitmentSource,
      ),
    ),
  ).toEqual([
    expect.objectContaining({ recruitmentSource: 'tu' }),
    expect.objectContaining({ recruitmentSource: 'other-university' }),
  ]);
});

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
    const automaticCompletion = await server.inject({
      method: 'GET',
      url: `/api/study/sessions/${created.session.sessionId}/status`,
      headers: { cookie: created.cookie },
    });
    expect(automaticCompletion.json()).toEqual({ completionStatus: 'completed' });
    const finalBlock = mainInstrumentBlocks.at(-1);
    if (finalBlock === undefined) throw new Error('missing-final-instrument-block');
    await submitWebInstrumentBlocks(server, created.cookie, created.session.sessionId, [
      finalBlock,
    ]);
    expect(
      (
        await webPost(
          server,
          created.cookie,
          `/api/study/sessions/${created.session.sessionId}/complete`,
          { debriefAcknowledged: true },
        )
      ).json(),
    ).toEqual({ completionStatus: 'completed' });
    await resources.close(server);

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
    const exported = await exportResearchData({
      databasePath: paths.study,
      outputDirectory: exportDirectory,
      exportedAtIso: '2026-08-24T13:00:00.000Z',
    });
    expect(exported.manifest.schemaVersion).toBe('research-export-v10');
    const exportedText = exported.files
      .filter((file) => file !== 'study-export.xlsx')
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
  it('persists the first Reference checkpoint when its artifact interval opens', async () => {
    const paths = temporaryDatabasePaths('passwo-reference-entry-checkpoint-');
    const server = createWebServer('forced-reference', paths.study, paths.recontact);
    const created = await createWebTestSession(server, 198, false);
    const preBlocks = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1');
    await submitWebInstrumentBlocks(server, created.cookie, created.session.sessionId, preBlocks);
    await openWebArtifactInterval(
      server,
      created.cookie,
      created.session.sessionId,
      '81000000-0000-4000-8000-000000000198',
    );
    await resources.close(server);

    const database = new Database(paths.study, { readonly: true });
    expect(
      database
        .prepare(
          `SELECT progress_checkpoint AS progressCheckpoint
         FROM study_sessions WHERE session_id = ?`,
        )
        .get(created.session.sessionId),
    ).toEqual({ progressCheckpoint: 'reference:passwords' });
    database.close();
  });

  it('reconciles a legacy data-complete session at its final submission timestamp', async () => {
    const paths = temporaryDatabasePaths('passwo-data-complete-reconciliation-');
    const firstServer = createWebServer('forced-reference', paths.study, paths.recontact);
    const created = await createWebTestSession(firstServer, 199);
    await completeWebTestStudy(firstServer, created, '81000000-0000-4000-8000-000000000199');
    await resources.close(firstServer);

    const legacyStudyDatabase = new Database(paths.study);
    legacyStudyDatabase
      .prepare(
        `UPDATE study_sessions
       SET completion_status = 'in-progress', completed_at_iso = NULL,
           progress_checkpoint = 'session-closure'
       WHERE session_id = ?`,
      )
      .run(created.session.sessionId);
    legacyStudyDatabase
      .prepare(
        `UPDATE web_resume_tokens
       SET invalidated_at_iso = NULL
       WHERE session_id = ?`,
      )
      .run(created.session.sessionId);
    legacyStudyDatabase.close();
    const legacyRecontactDatabase = new Database(paths.recontact);
    legacyRecontactDatabase
      .prepare(
        `UPDATE registrations
       SET first_invitation_at_iso = NULL, reminder_at_iso = NULL, closes_at_iso = NULL
       WHERE session_id = ?`,
      )
      .run(created.session.sessionId);
    legacyRecontactDatabase.close();

    const restartedServer = createWebServer(
      'forced-reference',
      paths.study,
      paths.recontact,
      false,
      '2026-08-29T12:00:00.000Z',
    );
    await resources.close(restartedServer);

    const reconciledStudyDatabase = new Database(paths.study, { readonly: true });
    expect(
      reconciledStudyDatabase
        .prepare(
          `SELECT completion_status AS completionStatus,
                progress_checkpoint AS progressCheckpoint,
                completed_at_iso AS completedAtIso
         FROM study_sessions WHERE session_id = ?`,
        )
        .get(created.session.sessionId),
    ).toEqual({
      completionStatus: 'completed',
      progressCheckpoint: 'complete',
      completedAtIso: fixedNowIso,
    });
    reconciledStudyDatabase.close();
    const reconciledRecontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(
      reconciledRecontactDatabase
        .prepare(
          `SELECT first_invitation_at_iso AS firstInvitationAtIso
         FROM registrations WHERE session_id = ?`,
        )
        .get(created.session.sessionId),
    ).toEqual({ firstInvitationAtIso: '2026-09-03T12:00:00.000Z' });
    reconciledRecontactDatabase.close();
  });

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
    await resources.close(firstServer);

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
    await resources.close(restartedServer);

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

  it('accepts an exact S01-S07 reload checkpoint while preserving the S01 fallback', async () => {
    const paths = temporaryDatabasePaths('passwo-exact-reload-resume-');
    const firstServer = createWebServer('forced-supportive', paths.study, paths.recontact);
    const exact = await createWebTestSession(firstServer, 211, false);
    const fallback = await createWebTestSession(firstServer, 212, false);
    const legacy = await createWebTestSession(firstServer, 213, false);
    const preBlocks = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1');

    for (const created of [exact, fallback, legacy]) {
      await submitWebInstrumentBlocks(
        firstServer,
        created.cookie,
        created.session.sessionId,
        preBlocks,
      );
    }

    const exactInterval = await openWebArtifactInterval(
      firstServer,
      exact.cookie,
      exact.session.sessionId,
      '82000000-0000-4000-8000-000000000211',
    );
    const fallbackInterval = await openWebArtifactInterval(
      firstServer,
      fallback.cookie,
      fallback.session.sessionId,
      '82000000-0000-4000-8000-000000000212',
    );
    const throughS04 = SUPPORTIVE_ARTIFACT_SEGMENT_IDS.slice(0, 5);
    await recordWebSupportiveSegments(
      firstServer,
      exact.cookie,
      exact.session.sessionId,
      exactInterval.intervalId,
      throughS04,
      1,
    );
    await recordWebSupportiveSegments(
      firstServer,
      fallback.cookie,
      fallback.session.sessionId,
      fallbackInterval.intervalId,
      throughS04,
      101,
    );
    const legacyInterval = await openWebArtifactInterval(
      firstServer,
      legacy.cookie,
      legacy.session.sessionId,
      '82000000-0000-4000-8000-000000000215',
    );
    await recordWebSupportiveSegments(
      firstServer,
      legacy.cookie,
      legacy.session.sessionId,
      legacyInterval.intervalId,
      throughS04,
      201,
    );
    await resources.close(firstServer);

    const legacyDatabase = new Database(paths.study);
    legacyDatabase
      .prepare('UPDATE study_sessions SET consent_version = ? WHERE session_id = ?')
      .run('consent-v13-pilot', legacy.session.sessionId);
    legacyDatabase.close();

    const restartedServer = createWebServer('forced-supportive', paths.study, paths.recontact);
    for (const created of [exact, fallback, legacy]) {
      const resumedResponse = await webPost(
        restartedServer,
        created.cookie,
        '/api/study/session/resume',
        {},
      );
      expect(webResumeResponseSchema.parse(resumedResponse.json()).session?.checkpoint).toBe(
        'supportive:S05',
      );
    }

    const exactResumeInterval = await openWebArtifactInterval(
      restartedServer,
      exact.cookie,
      exact.session.sessionId,
      '82000000-0000-4000-8000-000000000213',
    );
    await webPost(
      restartedServer,
      exact.cookie,
      `/api/study/sessions/${exact.session.sessionId}/segment-timing`,
      {
        eventId: '50000000-0000-4000-8000-000000000211',
        intervalId: exactResumeInterval.intervalId,
        segmentId: 'S05',
        eventType: 'segment-start',
        elapsedMs: null,
      },
    );

    const fallbackResumeInterval = await openWebArtifactInterval(
      restartedServer,
      fallback.cookie,
      fallback.session.sessionId,
      '82000000-0000-4000-8000-000000000214',
    );
    await webPost(
      restartedServer,
      fallback.cookie,
      `/api/study/sessions/${fallback.session.sessionId}/segment-timing`,
      {
        eventId: '50000000-0000-4000-8000-000000000212',
        intervalId: fallbackResumeInterval.intervalId,
        segmentId: 'S01',
        eventType: 'segment-start',
        elapsedMs: null,
      },
    );

    const legacyResumeInterval = await openWebArtifactInterval(
      restartedServer,
      legacy.cookie,
      legacy.session.sessionId,
      '82000000-0000-4000-8000-000000000216',
    );
    await webPost(
      restartedServer,
      legacy.cookie,
      `/api/study/sessions/${legacy.session.sessionId}/segment-timing`,
      {
        eventId: '50000000-0000-4000-8000-000000000213',
        intervalId: legacyResumeInterval.intervalId,
        segmentId: 'S05',
        eventType: 'segment-start',
        elapsedMs: null,
      },
      409,
    );
    await webPost(
      restartedServer,
      legacy.cookie,
      `/api/study/sessions/${legacy.session.sessionId}/segment-timing`,
      {
        eventId: '50000000-0000-4000-8000-000000000214',
        intervalId: legacyResumeInterval.intervalId,
        segmentId: 'S01',
        eventType: 'segment-start',
        elapsedMs: null,
      },
    );
    await resources.close(restartedServer);
  });

  it('resumes at the last confirmed post-S08 segment with only minimal simulation state', async () => {
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
    await webPost(
      firstServer,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/artifact-checkpoint`,
      {
        intervalId: interval.intervalId,
        checkpoint: 'supportive:S15',
      },
    );
    await resources.close(firstServer);

    const database = new Database(paths.study, { readonly: true });
    const persistedState = z.object({ encoded: z.string() }).parse(
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
      checkpoint: 'supportive:S15',
      resumeTarget: 'artifact',
      supportiveS08ResumeState: supportiveS08ResumeStateFixture,
    });
    await resources.close(restartedServer);
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

    await resources.close(server);
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
    await resources.close(replacementServer);

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
