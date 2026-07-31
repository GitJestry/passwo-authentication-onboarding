import {
  type CreateSessionResponse,
  type InstrumentResponseValue,
  type InstrumentRuntimeItem,
  type InstrumentSubmissionRequest,
  mainInstrumentBlocks,
  type SupportiveArtifactSegmentId,
} from '@passwo/contracts';
import type { FastifyInstance } from 'fastify';
import { expect } from 'vitest';

const supportiveSegmentTimingBounds = {
  S00: { startSequence: 1, startMs: 125, endSequence: 2, endMs: 425 },
  S01: { startSequence: 3, startMs: 500, endSequence: 4, endMs: 700 },
  S02: { startSequence: 5, startMs: 725, endSequence: 6, endMs: 850 },
  S03: { startSequence: 7, startMs: 860, endSequence: 8, endMs: 875 },
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
