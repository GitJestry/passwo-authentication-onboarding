import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type AssignmentMode,
  REFERENCE_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_VERSION,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';
import type { StudyRandomSource } from './random-source.js';
import {
  createSession,
  createSessionBody,
  recordSupportiveSegmentsThroughEnd,
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

function deterministicRandomSource(): StudyRandomSource {
  let identity = 0;
  return {
    randomUuid: () => {
      identity += 1;
      return `00000000-0000-4000-8000-${identity.toString().padStart(12, '0')}`;
    },
    participantToken: () => `A${identity.toString().padStart(7, '0')}`,
    randomIndex: () => 0,
  };
}

function createServer(
  assignmentMode: AssignmentMode,
  databasePath = ':memory:',
  randomSource = deterministicRandomSource(),
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
    expect(clientCondition?.statusCode).toBe(400);
  });

  it('persists only approved research session fields and condition-derived versions', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-core-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const randomSource = deterministicRandomSource();
    const supportiveServer = createServer('forced-supportive', databasePath, randomSource);
    await createSession(supportiveServer, 1);
    const referenceServer = createServer('forced-reference', databasePath, randomSource);
    await createSession(referenceServer, 2);

    const database = new Database(databasePath, { readonly: true });
    const sessions = database
      .prepare(
        `SELECT
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
        condition: 'reference',
        contentVersion: REFERENCE_ARTIFACT_VERSION,
        referenceArtifactVersion: REFERENCE_ARTIFACT_VERSION,
      },
      {
        condition: 'supportive',
        contentVersion: SUPPORTIVE_ARTIFACT_VERSION,
        referenceArtifactVersion: null,
      },
    ]);
    expect(JSON.stringify(sessionColumns)).not.toMatch(/display.?name|password|training.?input/iu);
  });

  it('persists the supportive timing sequence through completion and preserves completed reloads', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-core-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const server = createServer('forced-supportive', databasePath);
    const session = await recordSupportiveSegmentsThroughEnd(server, ['S00', 'S01', 'S02', 'S03']);
    const artifactEnd = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: {
        sequence: 9,
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
    for (const instrumentId of ['post-placeholder', 'guardrail-placeholder'] as const) {
      await server.inject({
        method: 'POST',
        url: `/api/study/sessions/${session.sessionId}/responses`,
        payload: { instrumentId, itemId: 'placeholder-complete', value: true },
      });
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
      { sequence: 9, segmentId: null, eventType: 'end' },
    ]);
    expect(completion.json()).toEqual({ completionStatus: 'completed' });
    expect(reload.json()).toEqual({ completionStatus: 'completed' });
  });
});
