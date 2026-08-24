import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type AssignmentMode,
  instrumentRuntimeManifest,
  mainInstrumentBlocks,
  REFERENCE_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_VERSION,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildStudyServer } from './app.js';
import { openStudyDatabase } from './database.js';
import {
  createSession,
  createSessionBody,
  deterministicTestRandomSource,
  recordSupportiveSegmentsThroughEnd,
  submitBlock,
  validSubmission,
} from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createServer(
  assignmentMode: AssignmentMode,
  databasePath = ':memory:',
  randomSource = deterministicTestRandomSource(),
): FastifyInstance {
  const server = buildStudyServer({
    version: '0.1.2',
    assignmentMode,
    databasePath,
    randomSource,
    referenceArtifactDirectory: referenceArtifactFixtureDirectory,
    nowIso: () => '2026-07-24T12:00:00.000Z',
  });
  servers.push(server);
  return server;
}

function parsePresentationOrder(json: string): string[] {
  const parsed: unknown = JSON.parse(json);
  return z.array(z.string()).length(4).parse(parsed);
}

describe('study server research core', () => {
  it('assigns the condition only from server configuration', async () => {
    const supportive = await createSession(createServer('forced-supportive'), 1);
    const reference = await createSession(createServer('forced-reference'), 2);
    const clientCondition = await servers[0]?.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: { ...createSessionBody(3), condition: 'reference' },
    });

    expect(supportive).toMatchObject({
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
    });
    expect(reference).toMatchObject({ condition: 'reference', assignmentMode: 'forced-reference' });
    expect(Object.keys(supportive)).not.toEqual(
      expect.arrayContaining(['researchCode', 'researchId', 'deletionCode', 'deletionCodeHash']),
    );
    expect(clientCondition?.statusCode).toBe(400);
  });

  it('binds idempotent session creation to the deletion-code hash', async () => {
    const server = createServer('forced-supportive');
    const request = createSessionBody(1, false);
    const first = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: request,
    });
    const retry = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: request,
    });
    const conflictingRetry = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: { ...request, deletionCodeHash: 'f'.repeat(64) },
    });

    expect(first.statusCode).toBe(201);
    expect(retry.statusCode).toBe(201);
    expect(retry.json()).toEqual(first.json());
    expect(conflictingRetry.statusCode).toBe(409);
  });

  it('persists only approved research session fields and condition-derived versions', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-core-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const randomSource = deterministicTestRandomSource();
    const supportiveServer = createServer('forced-supportive', databasePath, randomSource);
    await createSession(supportiveServer, 1);
    const referenceServer = createServer('forced-reference', databasePath, randomSource);
    await createSession(referenceServer, 2);

    const database = new Database(databasePath, { readonly: true });
    const sessions = database
      .prepare(
        `SELECT
          research_code AS researchCode,
          deletion_code_hash AS deletionCodeHash,
          condition,
          content_version AS contentVersion,
          reference_artifact_version AS referenceArtifactVersion
         FROM study_sessions
         ORDER BY condition`,
      )
      .all();
    const sessionColumns = database.prepare('PRAGMA table_info(study_sessions)').all();
    database.close();

    expect(sessions).toEqual([
      {
        researchCode: 'RS-A000000000000002',
        deletionCodeHash: '2'.padStart(64, '0'),
        condition: 'reference',
        contentVersion: REFERENCE_ARTIFACT_VERSION,
        referenceArtifactVersion: REFERENCE_ARTIFACT_VERSION,
      },
      {
        researchCode: 'RS-A000000000000001',
        deletionCodeHash: '1'.padStart(64, '0'),
        condition: 'supportive',
        contentVersion: SUPPORTIVE_ARTIFACT_VERSION,
        referenceArtifactVersion: null,
      },
    ]);
    expect(sessionColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'research_code' }),
        expect.objectContaining({ name: 'deletion_code_hash' }),
      ]),
    );
    expect(JSON.stringify(sessionColumns)).not.toMatch(
      /participant_code|display.?name|password|training.?input/iu,
    );
  });

  it('persists the supportive timing sequence through completion and preserves completed reloads', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-core-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const server = createServer('forced-supportive', databasePath);
    const session = await recordSupportiveSegmentsThroughEnd(server, [
      'S00',
      'S01',
      'S02',
      'S03',
      'S04',
      'S05',
      'S06',
      'S07',
    ]);
    const artifactEnd = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: {
        sequence: 17,
        phase: 'artifact',
        sectionId: null,
        segmentId: null,
        eventType: 'end',
        clientMonotonicMs: 1_000,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: 900,
        reasonCode: null,
      },
    });
    for (const block of mainInstrumentBlocks.filter(
      (candidate) => candidate.instrumentId !== 'pre-v1',
    )) {
      expect(
        (await submitBlock(server, session.sessionId, block.instrumentId, block.sectionId))
          .statusCode,
      ).toBe(200);
    }
    const completion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/complete`,
      payload: { debriefAcknowledged: true },
    });
    const reload = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/incomplete-reload`,
    });

    const database = new Database(databasePath, { readonly: true });
    const timing = database
      .prepare(
        `SELECT sequence, segment_id AS segmentId, event_type AS eventType
         FROM timing_events
         WHERE session_id = ?
         ORDER BY sequence`,
      )
      .all(session.sessionId);
    database.close();

    expect(artifactEnd.statusCode).toBe(200);
    expect(timing).toEqual([
      { sequence: 0, segmentId: null, eventType: 'start' },
      { sequence: 1, segmentId: 'S00', eventType: 'start' },
      { sequence: 2, segmentId: 'S00', eventType: 'end' },
      { sequence: 3, segmentId: 'S01', eventType: 'start' },
      { sequence: 4, segmentId: 'S01', eventType: 'end' },
      { sequence: 5, segmentId: 'S02', eventType: 'start' },
      { sequence: 6, segmentId: 'S02', eventType: 'end' },
      { sequence: 7, segmentId: 'S03', eventType: 'start' },
      { sequence: 8, segmentId: 'S03', eventType: 'end' },
      { sequence: 9, segmentId: 'S04', eventType: 'start' },
      { sequence: 10, segmentId: 'S04', eventType: 'end' },
      { sequence: 11, segmentId: 'S05', eventType: 'start' },
      { sequence: 12, segmentId: 'S05', eventType: 'end' },
      { sequence: 13, segmentId: 'S06', eventType: 'start' },
      { sequence: 14, segmentId: 'S06', eventType: 'end' },
      { sequence: 15, segmentId: 'S07', eventType: 'start' },
      { sequence: 16, segmentId: 'S07', eventType: 'end' },
      { sequence: 17, segmentId: null, eventType: 'end' },
    ]);
    expect(completion.json()).toEqual({ completionStatus: 'completed' });
    expect(reload.json()).toEqual({ completionStatus: 'completed' });
  });

  it('applies numbered schema and guardrail assignment migrations', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-migration-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const legacy = new Database(databasePath);
    legacy.exec(`
      CREATE TABLE study_sessions (
        session_id TEXT PRIMARY KEY,
        create_request_id TEXT NOT NULL UNIQUE,
        participant_code TEXT NOT NULL UNIQUE,
        condition TEXT NOT NULL,
        assignment_mode TEXT NOT NULL,
        study_version TEXT NOT NULL,
        content_version TEXT NOT NULL,
        questionnaire_version TEXT NOT NULL,
        guardrail_version TEXT NOT NULL,
        consent_version TEXT NOT NULL,
        reference_artifact_version TEXT,
        consent_accepted INTEGER NOT NULL,
        completion_status TEXT NOT NULL,
        technical_error_code TEXT,
        created_at_iso TEXT NOT NULL,
        completed_at_iso TEXT
      );
      CREATE TABLE responses (
        session_id TEXT NOT NULL REFERENCES study_sessions(session_id),
        instrument_id TEXT NOT NULL,
        instrument_version TEXT NOT NULL,
        item_id TEXT NOT NULL,
        json_value TEXT NOT NULL,
        created_at_iso TEXT NOT NULL,
        PRIMARY KEY (session_id, instrument_id, item_id)
      );
      INSERT INTO study_sessions VALUES (
        '00000000-0000-4000-8000-000000000001',
        '10000000-0000-4000-8000-000000000001',
        'PW-LEGACY01',
        'supportive',
        'forced-supportive',
        'walking-skeleton-v1',
        'supportive-v1',
        '${instrumentRuntimeManifest.questionnaireVersion}',
        '${instrumentRuntimeManifest.guardrailVersion}',
        '${instrumentRuntimeManifest.consentVersion}',
        NULL,
        1,
        'in-progress',
        NULL,
        '2026-07-24T12:00:00.000Z',
        NULL
      );
    `);
    legacy.close();

    const migrated = openStudyDatabase(databasePath, ':memory:', () => 'A1B2C3D4E5F60718');
    const migrationVersions = migrated
      .prepare(`SELECT version FROM schema_migrations ORDER BY version`)
      .all();
    const responseColumns = migrated.prepare(`PRAGMA table_info(responses)`).all();
    const session = migrated
      .prepare(
        `SELECT
          research_code AS researchCode,
          deletion_code_hash AS deletionCodeHash,
          guardrail_form_id AS guardrailFormId,
          follow_up_consent AS followUpConsent
         FROM study_sessions`,
      )
      .get();
    const guardrailSlot = migrated
      .prepare(
        `SELECT condition, block_number AS blockNumber, slot_index AS slotIndex,
                form_id AS formId, session_id AS sessionId
         FROM guardrail_form_slots
         WHERE session_id IS NOT NULL`,
      )
      .get();
    const tableNames = migrated
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table'
         ORDER BY name`,
      )
      .all();
    migrated.close();

    expect(migrationVersions).toEqual([
      { version: 1 },
      { version: 2 },
      { version: 3 },
      { version: 4 },
      { version: 5 },
      { version: 6 },
      { version: 7 },
      { version: 8 },
    ]);
    expect(responseColumns).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'section_id', notnull: 1 })]),
    );
    expect(session).toEqual({
      researchCode: 'RS-A1B2C3D4E5F60718',
      deletionCodeHash: createHash('sha256').update('PW-LEGACY01', 'utf8').digest('hex'),
      guardrailFormId: 'F1',
      followUpConsent: 0,
    });
    expect(guardrailSlot).toEqual({
      condition: 'supportive',
      blockNumber: 0,
      slotIndex: 0,
      formId: 'F1',
      sessionId: '00000000-0000-4000-8000-000000000001',
    });
    expect(tableNames).toEqual(
      expect.arrayContaining([
        { name: 'guardrail_form_slots' },
        { name: 'instrument_submissions' },
        { name: 'response_presentations' },
        { name: 'web_artifact_intervals' },
        { name: 'web_artifact_visibility_events' },
        { name: 'web_resume_tokens' },
        { name: 'web_segment_timing_events' },
      ]),
    );
  });

  it('balances F1 through F6 independently within each assigned condition', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-form-balance-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const server = createServer('permuted-block', databasePath);
    for (let identity = 1; identity <= 12; identity += 1) {
      await createSession(server, identity);
    }
    const requestedForm = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: { ...createSessionBody(13), guardrailFormId: 'F3' },
    });
    const database = new Database(databasePath, { readonly: true });
    const assignments = z
      .array(
        z.object({
          condition: z.enum(['supportive', 'reference']),
          guardrailFormId: z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6']),
        }),
      )
      .parse(
        database
          .prepare(
            `SELECT condition, guardrail_form_id AS guardrailFormId
             FROM study_sessions
             ORDER BY session_id`,
          )
          .all(),
      );
    const presentationOrders = z
      .array(z.object({ optionIdsJson: z.string() }))
      .parse(
        database
          .prepare(
            `SELECT option_ids_json AS optionIdsJson
             FROM response_presentations`,
          )
          .all(),
      )
      .map((row) => parsePresentationOrder(row.optionIdsJson));
    database.close();

    for (const condition of ['supportive', 'reference'] as const) {
      const conditionSessions = assignments.filter((session) => session.condition === condition);
      expect(conditionSessions).toHaveLength(6);
      expect(
        conditionSessions.reduce<Record<string, number>>((counts, session) => {
          counts[session.guardrailFormId] = (counts[session.guardrailFormId] ?? 0) + 1;
          return counts;
        }, {}),
      ).toEqual({ F1: 1, F2: 1, F3: 1, F4: 1, F5: 1, F6: 1 });
    }
    expect(presentationOrders).toHaveLength(72);
    expect(presentationOrders.every((optionIds) => optionIds.at(-1) === 'unsure')).toBe(true);
    expect(requestedForm.statusCode).toBe(400);
  });

  it('stores one atomic block idempotently and rejects a conflicting retry', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-submission-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const server = createServer('forced-supportive', databasePath);
    const session = await createSession(server);
    const submission = validSubmission('pre-v1', 'sample');
    const first = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/instrument-submissions`,
      payload: submission,
    });
    const retry = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/instrument-submissions`,
      payload: submission,
    });
    const conflictingSubmission = {
      ...submission,
      responses: submission.responses.map((response) =>
        response.itemId === 'PRE_ROLE' ? { ...response, value: 'graduate' } : response,
      ),
    };
    const conflict = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/instrument-submissions`,
      payload: conflictingSubmission,
    });
    const database = new Database(databasePath, { readonly: true });
    const storedRole = database
      .prepare(
        `SELECT json_value AS value, instrument_version AS instrumentVersion
         FROM responses
         WHERE session_id = ? AND item_id = 'PRE_ROLE'`,
      )
      .get(session.sessionId);
    const responseCount = database
      .prepare(`SELECT COUNT(*) AS count FROM responses WHERE session_id = ?`)
      .get(session.sessionId);
    database.close();

    expect(first.statusCode).toBe(200);
    expect(retry.statusCode).toBe(200);
    expect(conflict.statusCode).toBe(409);
    expect(storedRole).toEqual({
      value: '"undergraduate"',
      instrumentVersion: instrumentRuntimeManifest.questionnaireVersion,
    });
    expect(responseCount).toEqual({ count: submission.responses.length });
  });

  it('enforces pre, artifact end, immediate post, scenarios, recognition, post-guardrail, and completion order', async () => {
    const server = createServer('forced-reference');
    const session = await createSession(server);
    const earlyPost = await submitBlock(server, session.sessionId, 'post-v1', 'ueqs');
    expect(earlyPost.statusCode).toBe(409);

    for (const block of mainInstrumentBlocks.filter(
      (candidate) => candidate.instrumentId === 'pre-v1',
    )) {
      expect(
        (await submitBlock(server, session.sessionId, block.instrumentId, block.sectionId))
          .statusCode,
      ).toBe(200);
    }
    const artifactStart = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: {
        sequence: 0,
        phase: 'artifact',
        sectionId: null,
        segmentId: null,
        eventType: 'start',
        clientMonotonicMs: 100,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: null,
        reasonCode: null,
      },
    });
    const postBeforeArtifactEnd = await submitBlock(server, session.sessionId, 'post-v1', 'ueqs');
    const artifactEnd = await server.inject({
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
    });
    expect(artifactStart.statusCode).toBe(200);
    expect(postBeforeArtifactEnd.statusCode).toBe(409);
    expect(artifactEnd.statusCode).toBe(200);

    for (const block of mainInstrumentBlocks.filter(
      (candidate) => candidate.instrumentId !== 'pre-v1',
    )) {
      expect(
        (await submitBlock(server, session.sessionId, block.instrumentId, block.sectionId))
          .statusCode,
      ).toBe(200);
    }
    const completion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/complete`,
      payload: { debriefAcknowledged: true },
    });
    expect(completion.statusCode).toBe(200);
    expect(completion.json()).toEqual({ completionStatus: 'completed' });
  });
});
