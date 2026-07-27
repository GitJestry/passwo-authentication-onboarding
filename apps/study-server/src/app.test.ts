import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type AssignmentMode,
  REFERENCE_ARTIFACT_ENTRY_POINT,
  REFERENCE_ARTIFACT_ROUTE_PREFIX,
  REFERENCE_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_VERSION,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';
import type { StudyRandomSource } from './random-source.js';
import { resolveStudyDatabasePath } from './runtime.js';
import { registerStudyWeb } from './static-web.js';
import {
  createSession,
  createSessionBody,
  recordSupportiveSegmentsThroughEnd,
  savePreAndStartArtifact,
} from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);

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

describe('Study Runtime paths', () => {
  it('keeps the canonical database below the user home directory', () => {
    expect(resolveStudyDatabasePath({}, '/Users/participant')).toBe(
      '/Users/participant/.passwo-study/study.sqlite',
    );
    expect(
      resolveStudyDatabasePath({ STUDY_DATA_DIR: '/tmp/passwo-study-test' }, '/Users/participant'),
    ).toBe('/tmp/passwo-study-test/study.sqlite');
  });
});

function createServer(
  assignmentMode: AssignmentMode,
  databasePath = ':memory:',
  randomSource = deterministicRandomSource(),
  referenceArtifactDirectory = referenceArtifactFixtureDirectory,
): FastifyInstance {
  const server = buildStudyServer({
    version: '0.1.2',
    assignmentMode,
    databasePath,
    randomSource,
    referenceArtifactDirectory,
    nowIso: () => '2026-07-24T12:00:00.000Z',
  });
  servers.push(server);
  return server;
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
        contentVersion: REFERENCE_ARTIFACT_VERSION,
        referenceArtifactVersion: REFERENCE_ARTIFACT_VERSION,
      },
      {
        condition: 'supportive',
        contentVersion: SUPPORTIVE_ARTIFACT_VERSION,
        referenceArtifactVersion: null,
      },
    ]);
  });

  it('blocks a reference study when its configured artifact is missing', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'passwo-missing-reference-test-'));
    temporaryDirectories.push(temporaryDirectory);
    const missingArtifactDirectory = join(temporaryDirectory, 'missing');
    const server = createServer(
      'forced-reference',
      ':memory:',
      deterministicRandomSource(),
      missingArtifactDirectory,
    );

    const session = await server.inject({
      method: 'POST',
      url: '/api/study/sessions',
      payload: createSessionBody(1),
    });
    const artifact = await server.inject({
      method: 'GET',
      url: `${REFERENCE_ARTIFACT_ROUTE_PREFIX}${REFERENCE_ARTIFACT_ENTRY_POINT}`,
    });

    expect(session.statusCode).toBe(503);
    expect(session.json()).toEqual({ errorCode: 'reference-artifact-unavailable' });
    expect(artifact.statusCode).toBe(503);
    expect(artifact.json()).toEqual({ errorCode: 'reference-artifact-unavailable' });
  });

  it('serves only fixture files from the configured reference route', async () => {
    const server = createServer('forced-reference');
    const entryUrl = `${REFERENCE_ARTIFACT_ROUTE_PREFIX}${REFERENCE_ARTIFACT_ENTRY_POINT}`;

    const entry = await server.inject({ method: 'GET', url: entryUrl });
    const head = await server.inject({ method: 'HEAD', url: entryUrl });
    const directory = await server.inject({
      method: 'GET',
      url: REFERENCE_ARTIFACT_ROUTE_PREFIX,
    });
    const missing = await server.inject({
      method: 'GET',
      url: `${REFERENCE_ARTIFACT_ROUTE_PREFIX}missing.html`,
    });
    const post = await server.inject({ method: 'POST', url: entryUrl });
    const traversal = await server.inject({
      method: 'GET',
      url: `${REFERENCE_ARTIFACT_ROUTE_PREFIX}%2e%2e/%2e%2e/package.json`,
    });

    expect(entry.statusCode).toBe(200);
    expect(entry.body).toContain('Passwörter &amp; Authentifizierung');
    expect(entry.headers['content-security-policy']).toContain("connect-src 'self'");
    expect(entry.headers['content-security-policy']).toContain("frame-src 'self'");
    expect(entry.headers['content-security-policy']).toContain("frame-ancestors 'self'");
    expect(entry.headers['content-security-policy']).toContain("object-src 'none'");
    expect(entry.headers['content-security-policy']).toContain("form-action 'none'");
    expect(entry.headers['content-security-policy']).toContain("base-uri 'none'");
    expect(entry.headers['content-security-policy']).not.toMatch(
      /(?:connect|frame|media|script)-src[^;]*https?:/u,
    );
    expect(head.statusCode).toBe(200);
    expect(head.body).toBe('');
    expect([403, 404]).toContain(directory.statusCode);
    expect(missing.statusCode).toBe(404);
    expect(post.statusCode).toBe(404);
    expect(traversal.statusCode).not.toBe(200);
    expect(traversal.body).not.toContain('"name": "passwo-authentication-onboarding"');
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
    const server = createServer('forced-reference');
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

  it('persists only the serial supportive S00 to S03 boundaries in the shared timing sequence', async () => {
    const supportiveServer = createServer('forced-supportive');
    const supportiveSession = await createSession(supportiveServer);
    await savePreAndStartArtifact(supportiveServer, supportiveSession.sessionId);
    const s00Start = {
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
    const s00End = {
      ...s00Start,
      sequence: 2,
      eventType: 'end',
      clientMonotonicMs: 425,
      elapsedMs: 300,
    };
    const s01Start = {
      ...s00Start,
      sequence: 3,
      segmentId: 'S01',
      clientMonotonicMs: 500,
    };
    const s01End = {
      ...s01Start,
      sequence: 4,
      eventType: 'end',
      clientMonotonicMs: 700,
      elapsedMs: 200,
    };
    const s02Start = {
      ...s00Start,
      sequence: 5,
      segmentId: 'S02',
      clientMonotonicMs: 725,
    };
    const s02End = {
      ...s02Start,
      sequence: 6,
      eventType: 'end',
      clientMonotonicMs: 850,
      elapsedMs: 125,
    };
    const s03Start = {
      ...s00Start,
      sequence: 7,
      segmentId: 'S03',
      clientMonotonicMs: 875,
    };
    const s03End = {
      ...s03Start,
      sequence: 8,
      eventType: 'end',
      clientMonotonicMs: 880,
      elapsedMs: 5,
    };

    const start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s00Start,
    });
    const repeatedStart = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s00Start,
    });
    const prematureS01Start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: { ...s01Start, sequence: 2, clientMonotonicMs: 150 },
    });
    const end = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s00End,
    });
    const rejectedSecondS00Start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: { ...s00Start, sequence: 3, clientMonotonicMs: 450 },
    });
    const prematureS02Start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: { ...s02Start, sequence: 3, clientMonotonicMs: 475 },
    });
    const s01StartResponse = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s01Start,
    });
    const s01EndResponse = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s01End,
    });
    const repeatedS01End = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s01End,
    });
    const rejectedSecondS01Start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: { ...s01Start, sequence: 5, clientMonotonicMs: 750 },
    });
    const s02StartResponse = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s02Start,
    });
    const prematureS03Start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: { ...s03Start, sequence: 6, clientMonotonicMs: 800 },
    });
    const s02EndResponse = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s02End,
    });
    const s03StartResponse = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s03Start,
    });
    const s03EndResponse = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s03End,
    });
    const repeatedS03End = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
      payload: s03End,
    });
    const artifactEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${supportiveSession.sessionId}/timing`,
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

    expect(start.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedStart.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(prematureS01Start.statusCode).toBe(409);
    expect(prematureS01Start.json()).toEqual({ errorCode: 'segment-already-active' });
    expect(end.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(rejectedSecondS00Start.json()).toEqual({ errorCode: 'segment-start-already-recorded' });
    expect(prematureS02Start.json()).toEqual({ errorCode: 'segment-start-required' });
    expect(s01StartResponse.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(s01EndResponse.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedS01End.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(rejectedSecondS01Start.json()).toEqual({ errorCode: 'segment-start-already-recorded' });
    expect(s02StartResponse.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(prematureS03Start.json()).toEqual({ errorCode: 'segment-already-active' });
    expect(s02EndResponse.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(s03StartResponse.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(s03EndResponse.json()).toEqual({ recorded: true, artifactWallClockMs: null });
    expect(repeatedS03End.json()).toEqual({ recorded: false, artifactWallClockMs: null });
    expect(artifactEnd.json()).toEqual({ recorded: true, artifactWallClockMs: 800 });

    const unorderedSession = await createSession(supportiveServer, 3);
    await savePreAndStartArtifact(supportiveServer, unorderedSession.sessionId);
    const rejectedUnorderedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${unorderedSession.sessionId}/timing`,
      payload: { ...s01End, sequence: 1 },
    });
    expect(rejectedUnorderedEnd.statusCode).toBe(409);
    expect(rejectedUnorderedEnd.json()).toEqual({ errorCode: 'segment-start-required' });

    const referenceServer = createServer('forced-reference');
    const referenceSession = await createSession(referenceServer, 2);
    await savePreAndStartArtifact(referenceServer, referenceSession.sessionId);
    const rejectedReferenceSegment = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/timing`,
      payload: { ...s01Start, sequence: 1 },
    });

    expect(rejectedReferenceSegment.statusCode).toBe(409);
    expect(rejectedReferenceSegment.json()).toEqual({
      errorCode: 'segment-timing-not-supported',
    });
  });

  it('keeps the artifact lease active after every supportive segment end', async () => {
    const server = createServer('forced-supportive');
    const s00Session = await recordSupportiveSegmentsThroughEnd(server, ['S00']);
    const s01Session = await recordSupportiveSegmentsThroughEnd(server, ['S00', 'S01']);
    const s02Session = await recordSupportiveSegmentsThroughEnd(server, ['S00', 'S01', 'S02'], 3);
    const s03Session = await recordSupportiveSegmentsThroughEnd(
      server,
      ['S00', 'S01', 'S02', 'S03'],
      4,
    );

    const heartbeatAfterS00 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s00Session.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    const heartbeatAfterS01 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s01Session.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    const heartbeatAfterS02 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s02Session.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    const heartbeatAfterS03 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s03Session.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });

    expect(heartbeatAfterS00.json()).toEqual({ active: true });
    expect(heartbeatAfterS01.json()).toEqual({ active: true });
    expect(heartbeatAfterS02.json()).toEqual({ active: true });
    expect(heartbeatAfterS03.json()).toEqual({ active: true });
  });

  it('requires completed supportive S00 through S03 before ending the artifact', async () => {
    const supportiveServer = createServer('forced-supportive');

    const withoutSegments = await createSession(supportiveServer, 11);
    await savePreAndStartArtifact(supportiveServer, withoutSegments.sessionId);
    const endWithoutSegments = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${withoutSegments.sessionId}/timing`,
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
    const heartbeatAfterRejectedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${withoutSegments.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });
    const statusAfterRejectedEnd = await supportiveServer.inject({
      method: 'GET',
      url: `/api/study/sessions/${withoutSegments.sessionId}/status`,
    });

    expect(endWithoutSegments.statusCode).toBe(409);
    expect(endWithoutSegments.json()).toEqual({ errorCode: 'supportive-segments-incomplete' });
    expect(heartbeatAfterRejectedEnd.json()).toEqual({ active: true });
    expect(statusAfterRejectedEnd.json()).toEqual({ completionStatus: 'in-progress' });

    const afterS00 = await recordSupportiveSegmentsThroughEnd(supportiveServer, ['S00'], 12);
    const endAfterS00 = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${afterS00.sessionId}/timing`,
      payload: {
        sequence: 3,
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

    expect(endAfterS00.statusCode).toBe(409);
    expect(endAfterS00.json()).toEqual({ errorCode: 'supportive-segments-incomplete' });

    const duringS01 = await recordSupportiveSegmentsThroughEnd(supportiveServer, ['S00'], 13);
    const s01Start = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${duringS01.sessionId}/timing`,
      payload: {
        sequence: 3,
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S01',
        eventType: 'start',
        clientMonotonicMs: 500,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: null,
        reasonCode: null,
      },
    });
    const endDuringS01 = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${duringS01.sessionId}/timing`,
      payload: {
        sequence: 4,
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

    expect(s01Start.statusCode).toBe(200);
    expect(endDuringS01.statusCode).toBe(409);
    expect(endDuringS01.json()).toEqual({ errorCode: 'supportive-segments-incomplete' });

    const beforeS02 = await recordSupportiveSegmentsThroughEnd(
      supportiveServer,
      ['S00', 'S01'],
      14,
    );
    const endBeforeS02 = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${beforeS02.sessionId}/timing`,
      payload: {
        sequence: 5,
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
    expect(endBeforeS02.statusCode).toBe(409);
    expect(endBeforeS02.json()).toEqual({ errorCode: 'supportive-segments-incomplete' });

    const afterS02 = await recordSupportiveSegmentsThroughEnd(
      supportiveServer,
      ['S00', 'S01', 'S02'],
      15,
    );
    const endAfterS02 = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${afterS02.sessionId}/timing`,
      payload: {
        sequence: 7,
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
    expect(endAfterS02.statusCode).toBe(409);
    expect(endAfterS02.json()).toEqual({ errorCode: 'supportive-segments-incomplete' });

    const completedSegments = await recordSupportiveSegmentsThroughEnd(
      supportiveServer,
      ['S00', 'S01', 'S02', 'S03'],
      16,
    );
    const artifactEnd = {
      sequence: 9,
      phase: 'artifact',
      sectionId: null,
      segmentId: null,
      eventType: 'end',
      clientMonotonicMs: 900,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: 800,
      reasonCode: null,
    } as const;
    const acceptedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedSegments.sessionId}/timing`,
      payload: artifactEnd,
    });
    const repeatedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedSegments.sessionId}/timing`,
      payload: artifactEnd,
    });
    const heartbeatAfterAcceptedEnd = await supportiveServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${completedSegments.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });

    expect(acceptedEnd.json()).toEqual({ recorded: true, artifactWallClockMs: 800 });
    expect(repeatedEnd.json()).toEqual({ recorded: false, artifactWallClockMs: 800 });
    expect(heartbeatAfterAcceptedEnd.statusCode).toBe(409);
    expect(heartbeatAfterAcceptedEnd.json()).toEqual({ errorCode: 'artifact-lease-not-active' });

    const referenceServer = createServer('forced-reference');
    const referenceSession = await createSession(referenceServer, 15);
    await savePreAndStartArtifact(referenceServer, referenceSession.sessionId);
    const referenceEnd = await referenceServer.inject({
      method: 'POST',
      url: `/api/study/sessions/${referenceSession.sessionId}/timing`,
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

    expect(referenceEnd.json()).toEqual({ recorded: true, artifactWallClockMs: 800 });
  });

  it('marks reload after every supportive segment end incomplete', async () => {
    const server = createServer('forced-supportive');
    const s00Session = await recordSupportiveSegmentsThroughEnd(server, ['S00']);
    const s01Session = await recordSupportiveSegmentsThroughEnd(server, ['S00', 'S01']);
    const s02Session = await recordSupportiveSegmentsThroughEnd(server, ['S00', 'S01', 'S02'], 3);
    const s03Session = await recordSupportiveSegmentsThroughEnd(
      server,
      ['S00', 'S01', 'S02', 'S03'],
      4,
    );

    const reloadAfterS00 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s00Session.sessionId}/incomplete-reload`,
    });
    const reloadAfterS01 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s01Session.sessionId}/incomplete-reload`,
    });
    const reloadAfterS02 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s02Session.sessionId}/incomplete-reload`,
    });
    const reloadAfterS03 = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${s03Session.sessionId}/incomplete-reload`,
    });
    const s01Status = await server.inject({
      method: 'GET',
      url: `/api/study/sessions/${s01Session.sessionId}/status`,
    });

    expect(reloadAfterS00.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(reloadAfterS01.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(reloadAfterS02.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(reloadAfterS03.json()).toEqual({ completionStatus: 'incomplete-reload' });
    expect(s01Status.json()).toEqual({ completionStatus: 'incomplete-reload' });
  });

  it('closes the artifact lease only after the global artifact end', async () => {
    const server = createServer('forced-supportive');
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
    const heartbeat = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/artifact-lease/heartbeat`,
      payload: {},
    });

    expect(artifactEnd.json()).toEqual({ recorded: true, artifactWallClockMs: 800 });
    expect(heartbeat.statusCode).toBe(409);
    expect(heartbeat.json()).toEqual({ errorCode: 'artifact-lease-not-active' });
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

    const completedArtifactServer = createServer('forced-reference');
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
