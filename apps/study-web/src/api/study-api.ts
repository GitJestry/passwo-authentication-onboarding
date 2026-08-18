import {
  artifactIntervalEndRequestSchema,
  artifactIntervalEndResponseSchema,
  artifactIntervalHeartbeatRequestSchema,
  artifactIntervalHeartbeatResponseSchema,
  artifactIntervalStartRequestSchema,
  artifactIntervalStartResponseSchema,
  type ArtifactCheckpoint,
  completeSessionRequestSchema,
  type ConfirmArtifactCheckpointRequest,
  confirmArtifactCheckpointRequestSchema,
  confirmArtifactCheckpointResponseSchema,
  createSessionResponseSchema,
  type DeletionCode,
  deletionCodeSchema,
  hashDeletionCode,
  type InstrumentSubmissionRequest,
  instrumentSubmissionRequestSchema,
  type RegisterRecontactRequest,
  saveResponseResponseSchema,
  sessionStatusResponseSchema,
  WEB_ARTIFACT_HEARTBEAT_INTERVAL_MS,
  WEB_STUDY_REQUEST_HEADER,
  WEB_STUDY_REQUEST_HEADER_VALUE,
  webArtifactVisibilityRequestSchema,
  webArtifactVisibilityResponseSchema,
  webCreateSessionRequestSchema,
  type WebArtifactVisibilityRequest,
  type WebResumeSession,
  webResumeResponseSchema,
  webSegmentTimingRequestSchema,
  webSegmentTimingResponseSchema,
  type WebSegmentTimingRequest,
} from '@passwo/contracts';
import type { ArtifactRuntimeStart, StudyRuntimePorts } from '@passwo/study-engine';
import type { SegmentTimingEvent, SegmentTimingPort } from '@passwo/training-engine';

export const artifactHeartbeatIntervalMs = WEB_ARTIFACT_HEARTBEAT_INTERVAL_MS;

export interface StudyApi extends StudyRuntimePorts {
  restoreSession(): Promise<WebResumeSession | null>;
  createSegmentTimingPort(sessionId: string): SegmentTimingPort;
  confirmArtifactCheckpoint(
    sessionId: string,
    checkpoint: ConfirmArtifactCheckpointRequest['checkpoint'],
  ): Promise<ArtifactCheckpoint>;
}

interface ActiveInterval {
  readonly intervalId: string;
  readonly startedAtMonotonicMs: number;
}

interface PendingSegmentWrite {
  readonly request: WebSegmentTimingRequest;
  readonly event: SegmentTimingEvent;
}

function apiErrorCode(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'errorCode' in value &&
    typeof value.errorCode === 'string' &&
    value.errorCode.trim().length > 0 &&
    value.errorCode.length <= 80
  ) return value.errorCode;
  return 'research-data-write-failed';
}

function generateDeletionCode(): DeletionCode {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return deletionCodeSchema.parse(
    `PW-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`,
  );
}

function writeHeaders(): HeadersInit {
  return {
    'content-type': 'application/json',
    [WEB_STUDY_REQUEST_HEADER]: WEB_STUDY_REQUEST_HEADER_VALUE,
  };
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function postJson(url: string, body: unknown, keepalive = false): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: writeHeaders(),
    body: JSON.stringify(body),
    keepalive,
  });
  const responseBody = await readJson(response);
  if (!response.ok) throw new Error(apiErrorCode(responseBody));
  return responseBody;
}

function elapsed(interval: ActiveInterval): number {
  return Math.max(0, performance.now() - interval.startedAtMonotonicMs);
}

export function createStudyApi(): StudyApi {
  const createRequestId = globalThis.crypto.randomUUID();
  const deletionCode = generateDeletionCode();
  const deletionHashPromise = hashDeletionCode(deletionCode);
  let restorePromise: Promise<WebResumeSession | null> | null = null;
  let selectedSessionId: string | null = null;
  let pendingStartRequestId: string | null = null;
  let activeInterval: ActiveInterval | null = null;
  let pendingEndRequest: ReturnType<typeof artifactIntervalEndRequestSchema.parse> | null = null;
  const pendingVisibilityWrites: WebArtifactVisibilityRequest[] = [];
  let pendingSegmentWrite: PendingSegmentWrite | null = null;
  const segmentStartedAt = new Map<string, number>();

  function selectSession(sessionId: string): void {
    if (selectedSessionId !== null && selectedSessionId !== sessionId) {
      throw new Error('study-session-mismatch');
    }
    selectedSessionId = sessionId;
  }

  function requireInterval(sessionId: string): ActiveInterval {
    selectSession(sessionId);
    if (activeInterval === null) throw new Error('artifact-interval-not-active');
    return activeInterval;
  }

  async function writeSegment(sessionId: string, pending: PendingSegmentWrite): Promise<void> {
    webSegmentTimingResponseSchema.parse(
      await postJson(`/api/study/sessions/${sessionId}/segment-timing`, pending.request),
    );
    if (pending.event.eventType === 'segment-start') {
      segmentStartedAt.set(pending.event.segmentId, performance.now());
    } else {
      segmentStartedAt.delete(pending.event.segmentId);
    }
    pendingSegmentWrite = null;
  }

  const api: StudyApi = {
    restoreSession: () => {
      restorePromise ??= postJson('/api/study/session/resume', {})
        .then((body) => webResumeResponseSchema.parse(body).session)
        .catch((error: unknown) => {
          restorePromise = null;
          throw error;
        });
      return restorePromise;
    },

    createSegmentTimingPort: (sessionId: string): SegmentTimingPort => {
      selectSession(sessionId);
      return {
        blocksMissionTiming: true,
        record: async (event) => {
          const interval = requireInterval(sessionId);
          if (pendingSegmentWrite !== null) throw new Error('segment-timing-retry-required');
          const startedAt = segmentStartedAt.get(event.segmentId);
          if (event.eventType === 'segment-end' && startedAt === undefined) {
            throw new Error('segment-start-not-confirmed');
          }
          const request = webSegmentTimingRequestSchema.parse({
            eventId: globalThis.crypto.randomUUID(),
            intervalId: interval.intervalId,
            segmentId: event.segmentId,
            eventType: event.eventType,
            elapsedMs:
              event.eventType === 'segment-start'
                ? null
                : Math.max(0, performance.now() - (startedAt ?? performance.now())),
          });
          const pending = { request, event } satisfies PendingSegmentWrite;
          pendingSegmentWrite = pending;
          await writeSegment(sessionId, pending);
        },
        retry: async () => {
          const pending = pendingSegmentWrite;
          if (pending === null) throw new Error('segment-timing-retry-missing');
          await writeSegment(sessionId, pending);
        },
      };
    },

    confirmArtifactCheckpoint: async (sessionId, checkpoint) => {
      const interval = requireInterval(sessionId);
      const request = confirmArtifactCheckpointRequestSchema.parse({
        intervalId: interval.intervalId,
        checkpoint,
      });
      return confirmArtifactCheckpointResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/artifact-checkpoint`, request),
      ).checkpoint;
    },

    createSession: async (
      followUpConsent: boolean,
      recontact: RegisterRecontactRequest | null,
    ) => {
      const request = webCreateSessionRequestSchema.parse({
        requestId: createRequestId,
        consentAccepted: true,
        followUpConsent,
        deletionCodeHash: await deletionHashPromise,
        recontact,
      });
      const response = createSessionResponseSchema.parse(
        await postJson('/api/study/sessions', request),
      );
      selectSession(response.sessionId);
      return { ...response, deletionCode };
    },

    registerRecontact: async () => {
      throw new Error('web-recontact-registration-is-atomic');
    },
    abandonRecontact: async () => {
      throw new Error('web-recontact-registration-is-atomic');
    },

    saveInstrumentSubmission: async (
      sessionId: string,
      submission: InstrumentSubmissionRequest,
    ) => {
      selectSession(sessionId);
      const request = instrumentSubmissionRequestSchema.parse(submission);
      saveResponseResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/instrument-submissions`, request),
      );
    },

    startArtifact: async (sessionId: string): Promise<ArtifactRuntimeStart> => {
      selectSession(sessionId);
      if (activeInterval !== null) throw new Error('artifact-interval-already-active');
      pendingStartRequestId ??= globalThis.crypto.randomUUID();
      const response = artifactIntervalStartResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/artifact-intervals`,
          artifactIntervalStartRequestSchema.parse({ requestId: pendingStartRequestId })),
      );
      activeInterval = {
        intervalId: response.intervalId,
        startedAtMonotonicMs: performance.now(),
      };
      pendingStartRequestId = null;
      return response;
    },

    endArtifact: async (sessionId: string) => {
      const interval = requireInterval(sessionId);
      pendingEndRequest ??= artifactIntervalEndRequestSchema.parse({
        intervalId: interval.intervalId,
        elapsedMs: elapsed(interval),
      });
      const response = artifactIntervalEndResponseSchema.parse(
        await postJson(
          `/api/study/sessions/${sessionId}/artifact-intervals/end`,
          pendingEndRequest,
        ),
      );
      pendingEndRequest = null;
      activeInterval = null;
      segmentStartedAt.clear();
      return response.artifactSessionElapsedMs;
    },

    recordArtifactVisibility: async (sessionId: string, visible: boolean) => {
      const interval = requireInterval(sessionId);
      const request = webArtifactVisibilityRequestSchema.parse({
        eventId: globalThis.crypto.randomUUID(),
        intervalId: interval.intervalId,
        visibility: visible ? 'visible' : 'hidden',
        elapsedMs: elapsed(interval),
      });
      try {
        webArtifactVisibilityResponseSchema.parse(
          await postJson(`/api/study/sessions/${sessionId}/artifact-visibility`, request),
        );
      } catch (error) {
        pendingVisibilityWrites.push(request);
        throw error;
      }
    },

    retryArtifactTiming: async (sessionId: string) => {
      selectSession(sessionId);
      if (pendingEndRequest !== null) {
        const response = artifactIntervalEndResponseSchema.parse(
          await postJson(
            `/api/study/sessions/${sessionId}/artifact-intervals/end`,
            pendingEndRequest,
          ),
        );
        pendingEndRequest = null;
        activeInterval = null;
        segmentStartedAt.clear();
        return response.artifactSessionElapsedMs;
      }
      const request = pendingVisibilityWrites[0];
      if (request === undefined) throw new Error('artifact-timing-retry-missing');
      webArtifactVisibilityResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/artifact-visibility`, request),
      );
      pendingVisibilityWrites.shift();
      return null;
    },

    observeArtifactLifecycle: ({ sessionId, condition, onVisibilityChange }) => {
      selectSession(sessionId);
      const heartbeat = (keepalive = false) => {
        const interval = activeInterval;
        if (interval === null) return;
        const request = artifactIntervalHeartbeatRequestSchema.parse({
          intervalId: interval.intervalId,
          elapsedMs: elapsed(interval),
        });
        if (keepalive) {
          void fetch(`/api/study/sessions/${sessionId}/artifact-intervals/heartbeat`, {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: writeHeaders(),
            body: JSON.stringify(request),
            keepalive: true,
          }).catch(() => undefined);
          return;
        }
        void postJson(`/api/study/sessions/${sessionId}/artifact-intervals/heartbeat`, request)
          .then((body) => artifactIntervalHeartbeatResponseSchema.parse(body))
          .catch(() => undefined);
      };
      const visibility = () => {
        const visible = document.visibilityState === 'visible';
        if (visible) heartbeat();
        if (condition === 'supportive') onVisibilityChange(visible);
      };
      const pagehide = () => heartbeat(true);
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('pagehide', pagehide);
      const timer = window.setInterval(() => heartbeat(), artifactHeartbeatIntervalMs);
      return () => {
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('pagehide', pagehide);
        window.clearInterval(timer);
      };
    },

    completeSession: async (sessionId: string) => {
      selectSession(sessionId);
      sessionStatusResponseSchema.parse(
        await postJson(
          `/api/study/sessions/${sessionId}/complete`,
          completeSessionRequestSchema.parse({ debriefAcknowledged: true }),
        ),
      );
    },
  };

  return api;
}
