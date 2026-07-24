import {
  artifactTimingEventSchema,
  completeSessionRequestSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  type PlaceholderInstrumentId,
  placeholderResponseRequestSchema,
  saveResponseResponseSchema,
  sessionStatusResponseSchema,
  type TimingEvent,
  timingWriteResponseSchema,
} from '@passwo/contracts';
import {
  browserClock,
  type StudyRuntimePorts,
  StudyTimerController,
  type TimingSink,
} from '@passwo/study-engine';

const artifactScope = { phase: 'artifact' as const };

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

export interface StudyClientApi extends StudyRuntimePorts {
  markIncompleteReload(sessionId: string): void;
}

export function createStudyApi(): StudyClientApi {
  const createRequest = createSessionRequestSchema.parse({
    requestId: globalThis.crypto.randomUUID(),
    consentAccepted: true,
  });
  let timingSessionId: string | null = null;

  const timingSink: TimingSink = {
    record: async (event: TimingEvent) => {
      if (timingSessionId === null) throw new Error('missing-session');
      const safeEvent = artifactTimingEventSchema.parse(event);
      timingWriteResponseSchema.parse(
        await postJson(`/api/study/sessions/${timingSessionId}/timing`, safeEvent),
      );
    },
  };
  const timer = new StudyTimerController(browserClock, timingSink);

  return {
    createSession: async () =>
      createSessionResponseSchema.parse(await postJson('/api/study/sessions', createRequest)),

    savePlaceholder: async (sessionId: string, instrumentId: PlaceholderInstrumentId) => {
      const request = placeholderResponseRequestSchema.parse({
        instrumentId,
        itemId: 'placeholder-complete',
        value: true,
      });
      saveResponseResponseSchema.parse(
        await postJson(`/api/study/sessions/${sessionId}/responses`, request),
      );
    },

    startArtifact: async (sessionId: string) => {
      timingSessionId = sessionId;
      await timer.start(artifactScope);
    },

    endArtifact: async (sessionId: string) => {
      timingSessionId = sessionId;
      return timer.end(artifactScope);
    },

    recordArtifactVisibility: async (sessionId: string, visible: boolean) => {
      timingSessionId = sessionId;
      await timer.markVisibility(artifactScope, visible);
    },

    observeArtifactLifecycle: ({ condition, onVisibilityChange, onReload }) => {
      let reloadMarked = false;
      const markReload = () => {
        if (reloadMarked) return;
        reloadMarked = true;
        onReload();
      };
      const reportVisibility = () => {
        onVisibilityChange(document.visibilityState === 'visible');
      };

      window.addEventListener('beforeunload', markReload);
      window.addEventListener('pagehide', markReload);
      if (condition === 'supportive') {
        document.addEventListener('visibilitychange', reportVisibility);
      }

      return () => {
        window.removeEventListener('beforeunload', markReload);
        window.removeEventListener('pagehide', markReload);
        if (condition === 'supportive') {
          document.removeEventListener('visibilitychange', reportVisibility);
        }
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
      void fetch(url, { method: 'POST', keepalive: true }).catch(() => undefined);
    },
  };
}
