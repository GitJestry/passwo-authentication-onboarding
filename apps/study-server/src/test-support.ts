import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  artifactIntervalStartResponseSchema,
  type CreateSessionResponse,
  type InstrumentResponseValue,
  type InstrumentRuntimeItem,
  type InstrumentSubmissionRequest,
  type InstrumentSubmissionBlock,
  mainInstrumentBlocks,
  type SupportiveArtifactSegmentId,
  type SupportiveS08ResumeState,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  WEB_STUDY_REQUEST_HEADER,
  WEB_STUDY_REQUEST_HEADER_VALUE,
  webCreateSessionResponseSchema,
  type WebCreateSessionResponse,
} from '@passwo/contracts';
import type { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify';
import { expect } from 'vitest';
import type { StudyRandomSource } from './random-source.js';

interface TestCloseableResource {
  close(): Promise<void>;
}

export interface TestResourceScope {
  createTemporaryDirectory(prefix: string): string;
  track<Resource extends TestCloseableResource>(resource: Resource): Resource;
  close(resource: TestCloseableResource): Promise<void>;
  cleanup(): Promise<void>;
}

export function createTestResourceScope(): TestResourceScope {
  const resources = new Set<TestCloseableResource>();
  const temporaryDirectories = new Set<string>();

  return {
    createTemporaryDirectory(prefix) {
      const directory = mkdtempSync(join(tmpdir(), prefix));
      temporaryDirectories.add(directory);
      return directory;
    },
    track<Resource extends TestCloseableResource>(resource: Resource): Resource {
      resources.add(resource);
      return resource;
    },
    async close(resource) {
      await resource.close();
      resources.delete(resource);
    },
    async cleanup() {
      const pendingResources = [...resources];
      resources.clear();
      const closeResults = await Promise.allSettled(
        pendingResources.map((resource) => resource.close()),
      );
      for (const directory of temporaryDirectories) {
        rmSync(directory, { recursive: true, force: true });
      }
      temporaryDirectories.clear();

      const closeErrors: unknown[] = [];
      for (const result of closeResults) {
        if (result.status === 'rejected') closeErrors.push(result.reason);
      }
      if (closeErrors.length > 0) {
        throw new AggregateError(closeErrors, 'test-resource-close-failed');
      }
    },
  };
}

const supportiveSegmentTimingBounds = {
  S00: { startSequence: 1, startMs: 125, endSequence: 2, endMs: 425 },
  S01: { startSequence: 3, startMs: 500, endSequence: 4, endMs: 700 },
  S02: { startSequence: 5, startMs: 725, endSequence: 6, endMs: 850 },
  S03: { startSequence: 7, startMs: 860, endSequence: 8, endMs: 875 },
  S04: { startSequence: 9, startMs: 880, endSequence: 10, endMs: 925 },
  S05: { startSequence: 11, startMs: 930, endSequence: 12, endMs: 960 },
  S06: { startSequence: 13, startMs: 965, endSequence: 14, endMs: 1_005 },
  S07: { startSequence: 15, startMs: 1_010, endSequence: 16, endMs: 1_055 },
} satisfies Record<
  SupportiveArtifactSegmentId,
  {
    readonly startSequence: number;
    readonly startMs: number;
    readonly endSequence: number;
    readonly endMs: number;
  }
>;

export function createSessionBody(identity: number, followUpConsent = true) {
  return {
    requestId: `10000000-0000-4000-8000-${identity.toString().padStart(12, '0')}`,
    consentAccepted: true,
    followUpConsent,
    deletionCodeHash: identity.toString(16).padStart(64, '0'),
  };
}

export const supportiveS08ResumeStateFixture = {
  schemaVersion: 'supportive-s08-resume-v1',
  passphraseIds: {
    campusgram: 'passphrase-01-hyphen',
    masterCampus: 'passphrase-02-hyphen',
    campusEmail: 'passphrase-03-hyphen',
  },
  weakAccountIds: ['master-campus'],
  relationships: [
    { id: 'campusgram--master-campus', kind: 'identical' },
    { id: 'master-campus--campus-email', kind: 'similar' },
  ],
} as const satisfies SupportiveS08ResumeState;

export function deterministicTestRandomSource(): StudyRandomSource {
  let uuidIdentity = 0;
  let researchIdentity = 0;
  return {
    randomUuid: () => {
      uuidIdentity += 1;
      return `00000000-0000-4000-8000-${uuidIdentity.toString().padStart(12, '0')}`;
    },
    researchToken: () => {
      researchIdentity += 1;
      return `A${researchIdentity.toString(16).toUpperCase().padStart(15, '0')}`;
    },
    randomIndex: () => 0,
  };
}

export async function createSession(
  server: FastifyInstance,
  identity = 1,
  registerRecontact = true,
  followUpConsent = registerRecontact,
): Promise<CreateSessionResponse> {
  const response = await server.inject({
    method: 'POST',
    url: '/api/study/sessions',
    payload: createSessionBody(identity, followUpConsent),
  });
  expect(response.statusCode).toBe(201);
  const session = response.json<CreateSessionResponse>();
  if (registerRecontact) {
    const registration = await server.inject({
      method: 'POST',
      url: `/api/study/sessions/${session.sessionId}/recontact`,
      payload: {
        requestId: `20000000-0000-4000-8000-${identity.toString().padStart(12, '0')}`,
        email: `participant-${identity}@example.org`,
      },
    });
    expect(registration.statusCode).toBe(200);
  }
  return session;
}

function validValue(item: InstrumentRuntimeItem): InstrumentResponseValue {
  if (item.type === 'integer') return item.min ?? 1;
  if (item.type === 'scale' || item.type === 'semanticDifferential') return 1;
  if (item.type === 'text') return null;
  const optionId = item.options?.[0]?.id;
  if (optionId === undefined) throw new Error(`missing-test-option-${item.id}`);
  return item.type === 'multiChoice' ? [optionId] : optionId;
}

export function validSubmission(
  instrumentId: string,
  sectionId: string,
): InstrumentSubmissionRequest {
  const block = mainInstrumentBlocks.find(
    (candidate) => candidate.instrumentId === instrumentId && candidate.sectionId === sectionId,
  );
  if (block === undefined) throw new Error(`missing-test-block-${instrumentId}-${sectionId}`);
  return {
    instrumentId: block.instrumentId,
    sectionId: block.sectionId,
    responses: block.items.map((item) => ({ itemId: item.id, value: validValue(item) })),
  };
}

export async function submitBlock(
  server: FastifyInstance,
  sessionId: string,
  instrumentId: string,
  sectionId: string,
) {
  return server.inject({
    method: 'POST',
    url: `/api/study/sessions/${sessionId}/instrument-submissions`,
    payload: validSubmission(instrumentId, sectionId),
  });
}

export async function savePreAndStartArtifact(
  server: FastifyInstance,
  sessionId: string,
): Promise<void> {
  for (const block of mainInstrumentBlocks.filter(
    (candidate) => candidate.instrumentId === 'pre-v1',
  )) {
    const response = await submitBlock(server, sessionId, block.instrumentId, block.sectionId);
    expect(response.statusCode).toBe(200);
  }
  const artifactStart = await server.inject({
    method: 'POST',
    url: `/api/study/sessions/${sessionId}/timing`,
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
  expect(artifactStart.statusCode).toBe(200);
}

export async function recordSupportiveSegmentsThroughEnd(
  server: FastifyInstance,
  segmentIds: readonly SupportiveArtifactSegmentId[],
  identity = 1,
): Promise<CreateSessionResponse> {
  const session = await createSession(server, identity);
  await savePreAndStartArtifact(server, session.sessionId);

  for (const segmentId of segmentIds) {
    const timing = supportiveSegmentTimingBounds[segmentId];
    const timingEvents = [
      {
        sequence: timing.startSequence,
        eventType: 'start',
        clientMonotonicMs: timing.startMs,
        elapsedMs: null,
      },
      {
        sequence: timing.endSequence,
        eventType: 'end',
        clientMonotonicMs: timing.endMs,
        elapsedMs: timing.endMs - timing.startMs,
      },
    ] as const;

    for (const event of timingEvents) {
      const response = await server.inject({
        method: 'POST',
        url: `/api/study/sessions/${session.sessionId}/timing`,
        payload: {
          sequence: event.sequence,
          phase: 'artifact',
          sectionId: 'passwords',
          segmentId,
          eventType: event.eventType,
          clientMonotonicMs: event.clientMonotonicMs,
          clientWallClockIso: '2026-07-24T12:00:00.000Z',
          elapsedMs: event.elapsedMs,
          reasonCode: null,
        },
      });
      expect(response.statusCode).toBe(200);
    }
  }

  return session;
}

export const webStudyWriteHeaders = {
  [WEB_STUDY_REQUEST_HEADER]: WEB_STUDY_REQUEST_HEADER_VALUE,
} as const;

export interface CreatedWebTestSession {
  readonly cookie: string;
  readonly session: WebCreateSessionResponse;
  readonly setCookieHeader: string;
}

function responseCookieHeader(response: LightMyRequestResponse): string {
  const header = response.headers['set-cookie'];
  const serialized = Array.isArray(header) ? header[0] : header;
  if (typeof serialized !== 'string') throw new Error('missing-web-test-cookie');
  return serialized;
}

function responseCookie(response: LightMyRequestResponse): string {
  const cookie = responseCookieHeader(response).split(';', 1)[0];
  if (cookie === undefined) throw new Error('invalid-web-test-cookie');
  return cookie;
}

export async function webPost(
  server: FastifyInstance,
  cookie: string | null,
  url: string,
  payload: NonNullable<InjectOptions['payload']>,
  expectedStatusCode = 200,
): Promise<LightMyRequestResponse> {
  const response = await server.inject({
    method: 'POST',
    url,
    headers: {
      ...webStudyWriteHeaders,
      ...(cookie === null ? {} : { cookie }),
    },
    payload,
  });
  expect(response.statusCode, `${url}: ${response.body}`).toBe(expectedStatusCode);
  return response;
}

export async function createWebTestSession(
  server: FastifyInstance,
  identity: number,
  followUpConsent = true,
  recruitmentId: string | null = null,
): Promise<CreatedWebTestSession> {
  const suffix = identity.toString().padStart(12, '0');
  const response = await webPost(
    server,
    null,
    '/api/study/sessions',
    {
      requestId: `30000000-0000-4000-8000-${suffix}`,
      consentAccepted: true,
      followUpConsent,
      recruitmentId,
      recontact: followUpConsent
        ? {
            requestId: `40000000-0000-4000-8000-${suffix}`,
            email: `web-participant-${identity}@example.org`,
          }
        : null,
    },
    201,
  );
  return {
    cookie: responseCookie(response),
    session: webCreateSessionResponseSchema.parse(response.json()),
    setCookieHeader: responseCookieHeader(response),
  };
}

export async function submitWebInstrumentBlocks(
  server: FastifyInstance,
  cookie: string,
  sessionId: string,
  blocks: readonly InstrumentSubmissionBlock[],
): Promise<void> {
  for (const block of blocks) {
    await webPost(
      server,
      cookie,
      `/api/study/sessions/${sessionId}/instrument-submissions`,
      validSubmission(block.instrumentId, block.sectionId),
    );
  }
}

export async function openWebArtifactInterval(
  server: FastifyInstance,
  cookie: string,
  sessionId: string,
  requestId: string,
) {
  const response = await webPost(
    server,
    cookie,
    `/api/study/sessions/${sessionId}/artifact-intervals`,
    { requestId },
  );
  return artifactIntervalStartResponseSchema.parse(response.json());
}

export async function recordWebSupportiveSegments(
  server: FastifyInstance,
  cookie: string,
  sessionId: string,
  intervalId: string,
  segmentIds: readonly SupportiveArtifactSegmentId[],
  firstEventIdentity = 1,
): Promise<number> {
  let elapsedMs = firstEventIdentity;
  for (const segmentId of segmentIds) {
    const eventSuffix = elapsedMs.toString().padStart(12, '0');
    await webPost(server, cookie, `/api/study/sessions/${sessionId}/segment-timing`, {
      eventId: `50000000-0000-4000-8000-${eventSuffix}`,
      intervalId,
      segmentId,
      eventType: 'segment-start',
      elapsedMs: null,
    });
    elapsedMs += 1;
    await webPost(server, cookie, `/api/study/sessions/${sessionId}/segment-timing`, {
      eventId: `60000000-0000-4000-8000-${elapsedMs.toString().padStart(12, '0')}`,
      intervalId,
      segmentId,
      eventType: 'segment-end',
      elapsedMs,
    });
    elapsedMs += 1;
  }
  return elapsedMs;
}

export async function completeWebArtifact(
  server: FastifyInstance,
  created: CreatedWebTestSession,
  intervalRequestId: string,
  firstSegmentEventIdentity = 2,
): Promise<void> {
  const { cookie, session } = created;
  const interval = await openWebArtifactInterval(
    server,
    cookie,
    session.sessionId,
    intervalRequestId,
  );
  await webPost(server, cookie, `/api/study/sessions/${session.sessionId}/artifact-visibility`, {
    eventId: `70000000-0000-4000-8000-${intervalRequestId.slice(-12)}`,
    intervalId: interval.intervalId,
    visibility: 'hidden',
    elapsedMs: 1,
  });
  let elapsedMs = 2;
  if (session.condition === 'supportive') {
    elapsedMs = await recordWebSupportiveSegments(
      server,
      cookie,
      session.sessionId,
      interval.intervalId,
      SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
      firstSegmentEventIdentity,
    );
    await webPost(server, cookie, `/api/study/sessions/${session.sessionId}/artifact-checkpoint`, {
      intervalId: interval.intervalId,
      checkpoint: 'supportive:S08',
      resumeState: supportiveS08ResumeStateFixture,
    });
    await webPost(server, cookie, `/api/study/sessions/${session.sessionId}/artifact-checkpoint`, {
      intervalId: interval.intervalId,
      checkpoint: 'supportive:complete',
    });
  } else {
    await webPost(server, cookie, `/api/study/sessions/${session.sessionId}/artifact-checkpoint`, {
      intervalId: interval.intervalId,
      checkpoint: 'reference:mfa',
    });
  }
  await webPost(server, cookie, `/api/study/sessions/${session.sessionId}/artifact-intervals/end`, {
    intervalId: interval.intervalId,
    elapsedMs,
  });
}

export async function completeWebTestStudy(
  server: FastifyInstance,
  created: CreatedWebTestSession,
  intervalRequestId: string,
  firstSegmentEventIdentity = 2,
): Promise<void> {
  const preBlocks = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1');
  await submitWebInstrumentBlocks(server, created.cookie, created.session.sessionId, preBlocks);
  await completeWebArtifact(server, created, intervalRequestId, firstSegmentEventIdentity);
  await submitWebInstrumentBlocks(
    server,
    created.cookie,
    created.session.sessionId,
    mainInstrumentBlocks.slice(preBlocks.length),
  );
}
