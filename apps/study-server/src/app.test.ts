import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type AssignmentMode,
  REFERENCE_PLACEHOLDER_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_VERSION,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';
import { loadStudyServerConfig } from './config.js';
import type { StudyRandomSource } from './random-source.js';
import { registerStudyWeb } from './static-web.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true });
  });
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
    nowIso: () => '2026-07-24T12:00:00.000Z',
  });
  servers.push(server);
  return server;
}

function createSessionBody(identity: number) {
  return {
    requestId: `10000000-0000-4000-8000-${identity.toString().padStart(12, '0')}`,
    consentAccepted: true,
  };
}

async function createSession(server: FastifyInstance, identity = 1) {
  const response = await server.inject({
    method: 'POST',
    url: '/api/study/sessions',
    payload: createSessionBody(identity),
  });
  expect(response.statusCode).toBe(201);
  return response.json<{
    sessionId: string;
    participantCode: string;
    condition: 'supportive' | 'reference';
    assignmentMode: AssignmentMode;
  }>();
}

describe('study server walking skeleton', () => {
  it('exposes only a non-identifying health response', async () => {
    const server = createServer('permuted-block');

    const response = await server.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: 'passwo-study-server',
      status: 'ok',
      version: '0.1.2',
    });
  });

  it.each([
    ['forced-supportive', 'supportive'],
    ['forced-reference', 'reference'],
  ] as const)('assigns %s exclusively from server configuration', async (mode, condition) => {
    const server = createServer(mode);

    const session = await createSession(server);

    expect(session).toMatchObject({ assignmentMode: mode, condition });
  });

  it('rejects a client-supplied content version during session creation', async () => {
    const server = createServer('forced-supportive');

    const response = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: { ...createSessionBody(1), contentVersion: SUPPORTIVE_ARTIFACT_VERSION },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ errorCode: 'invalid-research-data' });
  });

  it('persists the artifact version resolved from the assigned condition', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-artifact-version-test-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const randomSource = deterministicRandomSource();
    const supportiveServer = createServer('forced-supportive', databasePath, randomSource);
    const supportiveSession = await createSession(supportiveServer, 1);
    await supportiveServer.close();
    servers.splice(servers.indexOf(supportiveServer), 1);

    const referenceServer = createServer('forced-reference', databasePath, randomSource);
    const referenceSession = await createSession(referenceServer, 2);

    expect(referenceSession.sessionId).not.toBe(supportiveSession.sessionId);
    expect(referenceSession.participantCode).not.toBe(supportiveSession.participantCode);

    const database = new Database(databasePath, { readonly: true });
    const rows = database
      .prepare(
        `SELECT
          condition,
          content_version AS contentVersion,
          reference_artifact_version AS referenceArtifactVersion
         FROM study_sessions
         ORDER BY condition`,
      )
      .all();
    database.close();

    expect(rows).toEqual([
      {
        condition: 'reference',
        contentVersion: REFERENCE_PLACEHOLDER_ARTIFACT_VERSION,
        referenceArtifactVersion: REFERENCE_PLACEHOLDER_ARTIFACT_VERSION,
      },
      {
        condition: 'supportive',
        contentVersion: SUPPORTIVE_ARTIFACT_VERSION,
        referenceArtifactVersion: null,
      },
    ]);
  });

  it('loads forced modes only from the server environment', () => {
    expect(
      loadStudyServerConfig({
        STUDY_ASSIGNMENT_MODE: 'forced-reference',
        STUDY_DATA_DIR: '/tmp/passwo-study-test',
        STUDY_PORT: '4174',
      }).assignmentMode,
    ).toBe('forced-reference');
  });

  it('creates a session idempotently and balances a permuted block', async () => {
    const server = createServer('permuted-block');

    const first = await createSession(server, 1);
    const repeated = await createSession(server, 1);
    const remaining = await Promise.all([
      createSession(server, 2),
      createSession(server, 3),
      createSession(server, 4),
    ]);

    expect(repeated).toEqual(first);
    const conditions = [first, ...remaining].map(({ condition }) => condition);
    expect(conditions.filter((condition) => condition === 'supportive')).toHaveLength(2);
    expect(conditions.filter((condition) => condition === 'reference')).toHaveLength(2);
  });

  it('enforces persisted study prerequisites and completes a valid run idempotently', async () => {
    const server = createServer('forced-supportive');
    const session = await createSession(server);

    const startEvent = {
      sequence: 0,
      phase: 'artifact',
      sectionId: null,
      segmentId: null,
      eventType: 'start',
      clientMonotonicMs: 100,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: null,
      reasonCode: null,
    };
    const pre = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    expect(pre.statusCode).toBe(200);

    const start = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: startEvent,
    });
    const repeatedStart = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: startEvent,
    });
    const prematurePost = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'post-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    const prematureGuardrail = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'guardrail-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    const incompleteCompletion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/complete`,
      payload: { debriefAcknowledged: true },
    });
    const endEvent = {
      ...startEvent,
      sequence: 1,
      eventType: 'end',
      clientMonotonicMs: 850,
      elapsedMs: 750,
    };
    const end = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: endEvent,
    });
    const repeatedEnd = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: endEvent,
    });
    const post = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'post-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    const repeatedPost = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'post-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    const guardrail = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'guardrail-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });

    expect(start.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedStart.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(prematurePost.statusCode).toBe(409);
    expect(prematurePost.json()).toEqual({ errorCode: 'artifact-end-required' });
    expect(prematureGuardrail.statusCode).toBe(409);
    expect(prematureGuardrail.json()).toEqual({ errorCode: 'post-response-required' });
    expect(incompleteCompletion.statusCode).toBe(409);
    expect(incompleteCompletion.json()).toEqual({ errorCode: 'artifact-end-required' });
    expect(end.json()).toEqual({ recorded: true, artifactWallClockMs: 750 });
    expect(repeatedEnd.json()).toEqual({
      recorded: false,
      artifactWallClockMs: 750,
    });
    expect(post.statusCode).toBe(200);
    expect(repeatedPost.statusCode).toBe(200);
    expect(guardrail.statusCode).toBe(200);

    const completion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/complete`,
      payload: { debriefAcknowledged: true },
    });
    const repeatedCompletion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/complete`,
      payload: { debriefAcknowledged: true },
    });
    const reloadAfterCompletion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/incomplete-reload`,
    });
    const heartbeatAfterCompletion = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    expect(completion.json()).toEqual({ completionStatus: 'completed' });
    expect(repeatedCompletion.json()).toEqual({ completionStatus: 'completed' });
    expect(reloadAfterCompletion.json()).toEqual({ completionStatus: 'completed' });
    expect(heartbeatAfterCompletion.statusCode).toBe(409);
  });

  it('persists supportive visibility events with ordered idempotent timing writes', async () => {
    const server = createServer('forced-supportive');
    const session = await createSession(server);

    const pre = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    expect(pre.statusCode).toBe(200);
    const start = await server.inject({
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
    const hiddenEvent = {
      sequence: 1,
      phase: 'artifact',
      sectionId: null,
      segmentId: null,
      eventType: 'visibility-hidden',
      clientMonotonicMs: 200,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: null,
      reasonCode: null,
    };
    const hidden = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: hiddenEvent,
    });
    const repeatedHidden = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: hiddenEvent,
    });
    const visible = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/timing`,
      payload: {
        ...hiddenEvent,
        sequence: 2,
        eventType: 'visibility-visible',
        clientMonotonicMs: 300,
      },
    });

    expect(start.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(hidden.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedHidden.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(visible.json()).toEqual({ recorded: true, artifactWallClockMs: null });
  });

  it('persists only serial supportive S00 segment boundaries in the shared timing sequence', async () => {
    const supportiveServer = createServer('forced-supportive');
    const supportiveSession = await createSession(supportiveServer);
    await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
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
    const segmentStart = {
      sequence: 1,
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S00',
      eventType: 'start',
      clientMonotonicMs: 125,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: null,
      reasonCode: null,
    };
    const start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: segmentStart,
    });
    const repeatedStart = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: segmentStart,
    });
    const concurrentStart = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: { ...segmentStart, sequence: 2, clientMonotonicMs: 150 },
    });
    const segmentEnd = {
      ...segmentStart,
      sequence: 2,
      eventType: 'end',
      clientMonotonicMs: 425,
      elapsedMs: 300,
    };
    const end = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: segmentEnd,
    });
    const repeatedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: segmentEnd,
    });
    const artifactEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: {
        sequence: 3,
        phase: 'artifact',
        sectionId: null,
        segmentId: null,
        eventType: 'end',
        clientMonotonicMs: 600,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: 500,
        reasonCode: null,
      },
    });

    expect(start.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedStart.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(concurrentStart.statusCode).toBe(409);
    expect(concurrentStart.json()).toEqual({ errorCode: 'segment-already-active' });
    expect(end.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedEnd.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(artifactEnd.json()).toEqual({ recorded: true, artifactWallClockMs: 500 });

    const unorderedSession = await createSession(supportiveServer, 3);
    await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${unorderedSession.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${unorderedSession.sessionId}/timing`,
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
    const rejectedUnorderedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${unorderedSession.sessionId}/timing`,
      payload: { ...segmentEnd, sequence: 1 },
    });
    expect(rejectedUnorderedEnd.statusCode).toBe(409);
    expect(rejectedUnorderedEnd.json()).toEqual({ errorCode: 'segment-start-required' });

    const referenceServer = createServer('forced-reference');
    const referenceSession = await createSession(referenceServer, 2);
    await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/timing`,
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
    const rejectedReferenceSegment = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/timing`,
      payload: segmentStart,
    });

    expect(rejectedReferenceSegment.statusCode).toBe(409);
    expect(rejectedReferenceSegment.json()).toEqual({
      errorCode: 'segment-timing-not-supported',
    });
  });

  it('rejects reference visibility timing and marks only active artifacts incomplete', async () => {
    const referenceServer = createServer('forced-reference');
    const referenceSession = await createSession(referenceServer);
    const pre = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    expect(pre.statusCode).toBe(200);
    await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/timing`,
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
    const rejectedVisibility = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/timing`,
      payload: {
        sequence: 1,
        phase: 'artifact',
        sectionId: null,
        segmentId: null,
        eventType: 'visibility-hidden',
        clientMonotonicMs: 200,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: null,
        reasonCode: null,
      },
    });
    const firstReload = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/incomplete-reload`,
    });
    const repeatedReload = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/incomplete-reload`,
    });

    expect(rejectedVisibility.statusCode).toBe(409);
    expect(rejectedVisibility.json()).toEqual({ errorCode: 'visibility-timing-not-supported' });
    expect(firstReload.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(repeatedReload.json()).toEqual({ completionStatus: 'incomplete-reload' });
    const persistedReload = await referenceServer.inject({
      method: 'GET',
      url: `/api/study/sessions/${referenceSession.sessionId}/status`,
    });
    expect(persistedReload.json()).toEqual({ completionStatus: 'incomplete-reload' });

    const completedArtifactServer = createServer('forced-supportive');
    const completedArtifactSession = await createSession(completedArtifactServer);
    await completedArtifactServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedArtifactSession.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    await completedArtifactServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedArtifactSession.sessionId}/timing`,
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
    await completedArtifactServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedArtifactSession.sessionId}/timing`,
      payload: {
        sequence: 1,
        phase: 'artifact',
        sectionId: null,
        segmentId: null,
        eventType: 'end',
        clientMonotonicMs: 200,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: 100,
        reasonCode: null,
      },
    });
    const reloadAfterEnd = await completedArtifactServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedArtifactSession.sessionId}/incomplete-reload`,
    });

    expect(reloadAfterEnd.json()).toEqual({ completionStatus: 'in-progress' });
    const heartbeatAfterEnd = await completedArtifactServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedArtifactSession.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    expect(heartbeatAfterEnd.statusCode).toBe(409);
    expect(heartbeatAfterEnd.json()).toEqual({ errorCode: 'artifact-lease-not-active' });
  });

  it('marks leased artifacts incomplete on reload without requiring an artifact start event', async () => {
    const server = createServer('forced-supportive');
    const startingSession = await createSession(server);
    const startErrorSession = await createSession(server, 2);

    for (const session of [startingSession, startErrorSession]) {
      const pre = await server.inject({
        method: 'POST',
        url: `/api/study/sessions/${session.sessionId}/responses`,
        payload: {
          instrumentId: 'pre-placeholder',
          itemId: 'placeholder-complete',
          value: true,
        },
      });
      expect(pre.statusCode).toBe(200);
      const lease = await server.inject({
        method: 'POST',
        url: `/api/study/sessions/${session.sessionId}/artifact-lease`,
        payload: {},
      });
      expect(lease.json()).toEqual({ active: true });
    }

    const failedStart = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${startErrorSession.sessionId}/timing`,
      payload: {
        sequence: 1,
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
    expect(failedStart.statusCode).toBe(409);
    expect(failedStart.json()).toEqual({ errorCode: 'timing-sequence-conflict' });

    const duringStarting = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${startingSession.sessionId}/incomplete-reload`,
    });
    const afterStartError = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${startErrorSession.sessionId}/incomplete-reload`,
    });
    const repeatedReload = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${startingSession.sessionId}/incomplete-reload`,
    });
    const heartbeatAfterReload = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${startingSession.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });

    expect(duringStarting.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(afterStartError.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(repeatedReload.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(heartbeatAfterReload.statusCode).toBe(409);
  });

  it('expires only inactive leases and keeps a heartbeating artifact active beyond 30 minutes', async () => {
    let nowIso = '2026-07-24T12:00:00.000Z';
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath: ':memory:',
      randomSource: deterministicRandomSource(),
      nowIso: () => nowIso,
    });
    servers.push(server);
    const session = await createSession(server);
    await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/responses`,
      payload: {
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      },
    });
    const lease = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/artifact-lease`,
      payload: {},
    });
    expect(lease.json()).toEqual({ active: true });

    for (let minute = 1; minute <= 31; minute += 1) {
      nowIso = new Date(Date.parse('2026-07-24T12:00:00.000Z') + minute * 60_000).toISOString();
      const heartbeat = await server.inject({
        method: 'POST',
        url: `/api/study/sessions/${session.sessionId}/artifact-lease/heartbeat`,
        payload: {},
      });
      expect(heartbeat.json()).toEqual({ active: true });
    }

    const active = await server.inject({
      method: 'GET',
      url: `/api/study/sessions/${session.sessionId}/status`,
    });
    expect(active.json()).toEqual({ completionStatus: 'in-progress' });

    nowIso = '2026-07-24T12:37:00.000Z';
    const recovered = await server.inject({
      method: 'GET',
      url: `/api/study/sessions/${session.sessionId}/status`,
    });

    expect(recovered.json()).toEqual({ completionStatus: 'incomplete-reload' });
    const repeatedRecovery = await server.inject({
      method: 'GET',
      url: `/api/study/sessions/${session.sessionId}/status`,
    });
    expect(repeatedRecovery.json()).toEqual({ completionStatus: 'incomplete-reload' });
  });

  it('serves the built app for known client routes without swallowing API or asset paths', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-static-web-test-'));
    temporaryDirectories.push(temporaryDirectory);
    const webBuildDirectory = join(temporaryDirectory, 'web');
    mkdirSync(join(webBuildDirectory, 'assets'), { recursive: true });
    writeFileSync(join(webBuildDirectory, 'index.html'), '<!doctype html><title>PassWo</title>');
    writeFileSync(join(webBuildDirectory, 'assets', 'app.js'), 'window.passwo = true;');
    const server = createServer('forced-supportive');
    await registerStudyWeb(server, { webBuildDirectory });

    for (const url of [
      '/',
      '/index.html',
      '/design-lab/s00',
      '/design-lab/s02-campus-id',
      '/design-lab/s06-similar',
    ]) {
      const response = await server.inject({ method: 'GET', url });
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.body).toContain('<title>PassWo</title>');
    }

    const asset = await server.inject({ method: 'GET', url: '/assets/app.js' });
    const missingAsset = await server.inject({ method: 'GET', url: '/assets/missing.js' });
    const missingApi = await server.inject({ method: 'GET', url: '/api/study/export' });
    const unknownPath = await server.inject({ method: 'GET', url: '/unknown-path' });
    const unknownDesignLab = await server.inject({ method: 'GET', url: '/design-lab/unknown' });
    const removedS02Alias = await server.inject({ method: 'GET', url: '/design-lab/s02' });
    const removedS06Alias = await server.inject({ method: 'GET', url: '/design-lab/s06' });

    expect(asset.body).toBe('window.passwo = true;');
    expect(missingAsset.statusCode).toBe(404);
    expect(missingApi.statusCode).toBe(404);
    expect(unknownPath.statusCode).toBe(404);
    expect(unknownDesignLab.statusCode).toBe(404);
    expect(removedS02Alias.statusCode).toBe(404);
    expect(removedS06Alias.statusCode).toBe(404);
  });

  it('keeps operational leases outside the research tables and participant input columns', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-study-test-'));
    temporaryDirectories.push(temporaryDirectory);
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const server = createServer('forced-supportive', databasePath);
    await createSession(server);

    const database = new Database(databasePath, { readonly: true });
    const tables = database
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name`,
      )
      .all();
    const sessionColumns = database.prepare(`PRAGMA table_info(study_sessions)`).all();
    database.close();

    expect(tables).toEqual([
      { name: 'artifact_leases' },
      { name: 'assignment_slots' },
      { name: 'responses' },
      { name: 'study_sessions' },
      { name: 'timing_events' },
    ]);
    expect(JSON.stringify(sessionColumns)).not.toMatch(/display.?name|password|training.?input/iu);
  });
});
