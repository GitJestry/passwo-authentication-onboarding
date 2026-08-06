import {
  abandonRecontactRequestSchema,
  abandonRecontactResponseSchema,
  artifactLeaseResponseSchema,
  completeSessionRequestSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  type DeletionCode,
  deletionCodeSchema,
  hashDeletionCode,
  type InstrumentSubmissionRequest,
  instrumentSubmissionRequestSchema,
  type RegisterRecontactRequest,
  registerRecontactRequestSchema,
  registerRecontactResponseSchema,
  saveResponseResponseSchema,
  sessionStatusResponseSchema,
  studyTimingEventSchema,
  type TimingEvent,
  timingWriteResponseSchema,
} from '@passwo/contracts';
import {
  browserClock,
  type StudyRuntimePorts,
  StudyTimerController,
  type TimingSink,
} from '@passwo/study-engine';
import type { SegmentTimingEvent, SegmentTimingPort } from '@passwo/training-engine';

const artifactScope = { phase: 'artifact' as const };
export const artifactHeartbeatIntervalMs = 60_000;

export interface StudyApi extends StudyRuntimePorts {
  createSegmentTimingPort(sessionId: string): SegmentTimingPort;
}

function apiErrorCode(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'errorCode' in value &&
    typeof value.errorCode === 'string' &&
    value.errorCode.trim().length > 0 &&
    value.errorCode.length <= 80
  ) {
    return value.errorCode;
  }
  return 'research-data-write-failed';
}

function generateDeletionCode(): DeletionCode {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  const hexadecimal = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  const groups = [
    hexadecimal.slice(0, 4),
    hexadecimal.slice(4, 8),
    hexadecimal.slice(8, 12),
    hexadecimal.slice(12, 16),
  ];
  return deletionCodeSchema.parse(`PW-${groups.join('-')}`);
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const responseBody: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(apiErrorCode(responseBody));
  }

  return responseBody;
}

export function createStudyApi(): StudyApi {
  const createRequestId = globalThis.crypto.randomUUID();
  const deletionCode = generateDeletionCode();
  const deletionCodeHash = hashDeletionCode(deletionCode);
  let timingSessionId: string | null = null;

  function selectTimingSession(sessionId: string): void {
    if (timingSessionId !== null && timingSessionId !== sessionId) {
      throw new Error('timing-session-mismatch');
    }
    timingSessionId = sessionId;
  }

  const timingSink: TimingSink = {
    record: async (event: TimingEvent) => {
      if (timingSessionId === null) throw new Error('missing-session');
      const safeEvent = studyTimingEventSchema.parse(event);
      timingWriteResponseSchema.parse(
        await postJson(`/api/study/sessions/${timingSessionId}/timing`, safeEvent),
      );
    },
  };
  const timer = new StudyTimerController(browserClock, timingSink);

  function createSegmentTimingPort(sessionId: string): SegmentTimingPort {
    selectTimingSession(sessionId);
    return {
      retry: async () => {
        await timer.retryFailed();
      },
      record: async (event: SegmentTimingEvent) => {
        selectTimingSession(sessionId);
        const scope = {
          phase: 'artifact' as const,
          sectionId: event.sectionId,
          segmentId: event.segmentId,
        };
        if (event.eventType === 'segment-start') {
          await timer.start(scope);
          return;
        }
        await timer.end(scope);
      },
    };
  }

  return {
    createSegmentTimingPort,
    createSession: async (followUpConsent: boolean) => {
      const createRequest = createSessionRequestSchema.parse({
        requestId: createRequestId,
        consentAccepted: true,
        followUpConsent,
        deletionCodeHash: await deletionCodeHash,
      });
      const response = createSessionResponseSchema.parse(
        await postJson('/api/study/sessions', createRequest),
      );
      return { ...response, deletionCode };
    },

    registerRecontact: async (sessionId: string, registration: RegisterRecontactRequest) => {
      const request = registerRecontactRequestSchema.parse(registration);
      registerRecontactResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/recontact`, request),
      );
    },

    abandonRecontact: async (sessionId: string) => {
      const request = abandonRecontactRequestSchema.parse({});
      abandonRecontactResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/recontact/abandon`, request),
      );
    },

    saveInstrumentSubmission: async (
      sessionId: string,
      submission: InstrumentSubmissionRequest,
    ) => {
      const request = instrumentSubmissionRequestSchema.parse(submission);
      saveResponseResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/instrument-submissions`, request),
      );
    },

    startArtifact: async (sessionId: string) => {
      selectTimingSession(sessionId);
      artifactLeaseResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/artifact-lease`, {}),
      );
      await timer.start(artifactScope);
    },

    endArtifact: async (sessionId: string) => {
      selectTimingSession(sessionId);
      return timer.end(artifactScope);
    },

    recordArtifactVisibility: async (sessionId: string, visible: boolean) => {
      selectTimingSession(sessionId);
      await timer.markVisibility(artifactScope, visible);
    },

    retryArtifactTiming: async (sessionId: string) => {
      selectTimingSession(sessionId);
      const event = await timer.retryFailed();
      return event.eventType === 'end' ? event.elapsedMs : null;
    },

    observeArtifactLifecycle: ({ sessionId, condition, onVisibilityChange, onReload }) => {
      let reloadMarked = false;
      const markReload = () => {
        if (reloadMarked) return;
        reloadMarked = true;
        onReload();
      };
      const heartbeat = () => {
        void postJson(`/api/study/sessions/${sessionId}/artifact-lease/heartbeat`, {})
          .then((response) => artifactLeaseResponseSchema.parse(response))
          .catch(() => undefined);
      };
      const reportVisibility = () => {
        const visible = document.visibilityState === 'visible';
        if (visible) heartbeat();
        if (condition === 'supportive') onVisibilityChange(visible);
      };

      window.addEventListener('beforeunload', markReload);
      window.addEventListener('pagehide', markReload);
      document.addEventListener('visibilitychange', reportVisibility);
      const heartbeatInterval = window.setInterval(heartbeat, artifactHeartbeatIntervalMs);

      return () => {
        window.removeEventListener('beforeunload', markReload);
        window.removeEventListener('pagehide', markReload);
        document.removeEventListener('visibilitychange', reportVisibility);
        window.clearInterval(heartbeatInterval);
      };
    },

    completeSession: async (sessionId: string) => {
      const request = completeSessionRequestSchema.parse({
        debriefAcknowledged: true,
      });
      sessionStatusResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/complete`, request),
      );
    },

    markIncompleteReload: (sessionId: string) => {
      const url = `/api/study/sessions/${sessionId}/incomplete-reload`;
      if (typeof navigator !== 'undefined' && navigator.sendBeacon(url)) return;
      void fetch(url, { method: 'POST', keepalive: true }).catch(() => undefined);
    },
  };
}
