import type { CreateSessionResponse, SupportiveArtifactSegmentId } from '@passwo/contracts';
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

export function createSessionBody(identity: number) {
  return {
    requestId: `10000000-0000-4000-8000-${identity.toString().padStart(12, '0')}`,
    consentAccepted: true,
  };
}

export async function createSession(
  server: FastifyInstance,
  identity = 1,
): Promise<CreateSessionResponse> {
  const response = await server.inject({
    method: 'POST',
    url: '/api/study/sessions',
    payload: createSessionBody(identity),
  });
  expect(response.statusCode).toBe(201);
  return response.json<CreateSessionResponse>();
}

export async function savePreAndStartArtifact(
  server: FastifyInstance,
  sessionId: string,
): Promise<void> {
  await server.inject({
    method: 'POST',
    url: `/api/study/sessions/${sessionId}/responses`,
    payload: {
      instrumentId: 'pre-placeholder',
      itemId: 'placeholder-complete',
      value: true,
    },
  });
  await server.inject({
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
