import type {
  AssignmentMode,
  CreateSessionResponse,
  PlaceholderInstrumentId,
  StudyCondition,
} from '@passwo/contracts';
import { assign, fromCallback, fromPromise, setup } from 'xstate';

export interface StudyRuntimePorts {
  createSession(): Promise<CreateSessionResponse>;
  savePlaceholder(sessionId: string, instrumentId: PlaceholderInstrumentId): Promise<void>;
  startArtifact(sessionId: string): Promise<void>;
  endArtifact(sessionId: string): Promise<number>;
  recordArtifactVisibility(sessionId: string, visible: boolean): Promise<void>;
  retryArtifactTiming(sessionId: string): Promise<number | null>;
  markIncompleteReload(sessionId: string): void;
  observeArtifactLifecycle(input: ArtifactLifecycleInput): () => void;
  completeSession(sessionId: string): Promise<void>;
}

export interface ArtifactLifecycleInput {
  readonly sessionId: string;
  readonly condition: StudyCondition;
  onVisibilityChange(visible: boolean): void;
  onReload(): void;
}

export interface StudyContext {
  readonly sessionId: string | null;
  readonly participantCode: string | null;
  readonly condition: StudyCondition | null;
  readonly assignmentMode: AssignmentMode | null;
  readonly displayName: string | null;
  readonly artifactWallClockMs: number | null;
  readonly pendingArtifactTimingWrites: number;
  readonly artifactCompletionRequested: boolean;
  readonly artifactTimingErrorKind: 'visibility' | 'end' | null;
  readonly researchErrorCode: string | null;
  readonly fatalErrorCode: string | null;
}

export type StudyEvent =
  | { readonly type: 'ACCEPT_CONSENT' }
  | { readonly type: 'SUBMIT_PRE' }
  | { readonly type: 'DISPLAY_NAME_ENTERED'; readonly displayName: string }
  | { readonly type: 'ARTIFACT_COMPLETED' }
  | { readonly type: 'SUBMIT_POST' }
  | { readonly type: 'SUBMIT_GUARDRAILS' }
  | { readonly type: 'DEBRIEF_ACKNOWLEDGED' }
  | { readonly type: 'RETRY_SESSION' }
  | { readonly type: 'RETRY_PRE' }
  | { readonly type: 'RETRY_ARTIFACT_START' }
  | { readonly type: 'RETRY_ARTIFACT_END' }
  | { readonly type: 'RETRY_POST' }
  | { readonly type: 'RETRY_GUARDRAILS' }
  | { readonly type: 'RETRY_COMPLETION' }
  | { readonly type: 'ARTIFACT_VISIBILITY_CHANGED'; readonly visible: boolean }
  | { readonly type: 'ARTIFACT_TIMING_WRITE_SUCCEEDED' }
  | {
      readonly type: 'ARTIFACT_TIMING_WRITE_FAILED';
      readonly errorCode: string;
    }
  | { readonly type: 'ARTIFACT_RELOAD' }
  | { readonly type: 'TECHNICAL_ABORT'; readonly errorCode: string }
  | { readonly type: 'RESET' };

const initialContext: StudyContext = {
  sessionId: null,
  participantCode: null,
  condition: null,
  assignmentMode: null,
  displayName: null,
  artifactWallClockMs: null,
  pendingArtifactTimingWrites: 0,
  artifactCompletionRequested: false,
  artifactTimingErrorKind: null,
  researchErrorCode: null,
  fatalErrorCode: null,
};

function requiredSessionId(context: StudyContext): string {
  if (context.sessionId === null) {
    throw new Error('missing-session');
  }
  return context.sessionId;
}

function requiredCondition(context: StudyContext): StudyCondition {
  if (context.condition === null) {
    throw new Error('missing-condition');
  }
  return context.condition;
}

function errorCode(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.slice(0, 80);
  }
  return 'research-data-write-failed';
}

export function createStudyMachine(ports: StudyRuntimePorts) {
  const machineSetup = setup({
    types: {
      context: {} as StudyContext,
      events: {} as StudyEvent,
    },
    actors: {
      createSession: fromPromise(async () => ports.createSession()),
      savePre: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.savePlaceholder(input.sessionId, 'pre-placeholder'),
      ),
      startArtifact: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.startArtifact(input.sessionId),
      ),
      endArtifact: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.endArtifact(input.sessionId),
      ),
      retryArtifactTiming: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.retryArtifactTiming(input.sessionId),
      ),
      observeArtifactLifecycle: fromCallback(
        ({
          input,
          sendBack,
        }: {
          input: { sessionId: string; condition: StudyCondition };
          sendBack: (event: StudyEvent) => void;
        }) =>
          ports.observeArtifactLifecycle({
            ...input,
            onVisibilityChange: (visible) =>
              sendBack({ type: 'ARTIFACT_VISIBILITY_CHANGED', visible }),
            onReload: () => sendBack({ type: 'ARTIFACT_RELOAD' }),
          }),
      ),
      savePost: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.savePlaceholder(input.sessionId, 'post-placeholder'),
      ),
      saveGuardrails: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.savePlaceholder(input.sessionId, 'guardrail-placeholder'),
      ),
      completeSession: fromPromise(async ({ input }: { input: { sessionId: string } }) =>
        ports.completeSession(input.sessionId),
      ),
    },
    guards: {
      isSupportive: ({ context }) => context.condition === 'supportive',
      acceptsArtifactVisibility: ({ context }) =>
        context.condition === 'supportive' && !context.artifactCompletionRequested,
      artifactCompletionReady: ({ context }) =>
        context.artifactCompletionRequested && context.pendingArtifactTimingWrites === 0,
      visibilityTimingFailed: ({ context }) => context.artifactTimingErrorKind === 'visibility',
      endTimingFailed: ({ context }) => context.artifactTimingErrorKind === 'end',
    },
    actions: {
      storeDisplayName: assign({
        displayName: ({ event }) =>
          event.type === 'DISPLAY_NAME_ENTERED' ? event.displayName.trim() : null,
        researchErrorCode: () => null,
      }),
      clearDisplayName: assign({ displayName: () => null }),
      clearResearchError: assign({ researchErrorCode: () => null }),
      requestArtifactCompletion: assign({
        artifactCompletionRequested: () => true,
      }),
      incrementPendingArtifactTimingWrites: assign({
        pendingArtifactTimingWrites: ({ context }) => context.pendingArtifactTimingWrites + 1,
      }),
      decrementPendingArtifactTimingWrites: assign({
        pendingArtifactTimingWrites: ({ context }) =>
          Math.max(0, context.pendingArtifactTimingWrites - 1),
      }),
      recordArtifactVisibility: ({ context, event, self }) => {
        if (event.type !== 'ARTIFACT_VISIBILITY_CHANGED') return;
        void ports.recordArtifactVisibility(requiredSessionId(context), event.visible).then(
          () => self.send({ type: 'ARTIFACT_TIMING_WRITE_SUCCEEDED' }),
          (error: unknown) =>
            self.send({
              type: 'ARTIFACT_TIMING_WRITE_FAILED',
              errorCode: errorCode(error),
            }),
        );
      },
      markIncompleteReload: ({ context }) => {
        ports.markIncompleteReload(requiredSessionId(context));
      },
      storeVisibilityTimingError: assign({
        artifactTimingErrorKind: () => 'visibility' as const,
        researchErrorCode: ({ event }) =>
          event.type === 'ARTIFACT_TIMING_WRITE_FAILED'
            ? event.errorCode
            : 'research-data-write-failed',
      }),
      storeEndTimingError: assign({
        artifactTimingErrorKind: () => 'end' as const,
        researchErrorCode: ({ event }) =>
          'error' in event ? errorCode(event.error) : 'research-data-write-failed',
      }),
      clearArtifactTimingError: assign({
        artifactTimingErrorKind: () => null,
        researchErrorCode: () => null,
      }),
      storeFatalError: assign({
        fatalErrorCode: ({ event }) =>
          event.type === 'TECHNICAL_ABORT' ? event.errorCode : 'unknown',
        displayName: () => null,
      }),
      resetContext: assign(() => initialContext),
    },
  });

  return machineSetup.createMachine({
    id: 'study',
    initial: 'consent',
    context: initialContext,
    on: {
      TECHNICAL_ABORT: { target: '.fatalError', actions: 'storeFatalError' },
    },
    states: {
      consent: { on: { ACCEPT_CONSENT: 'creatingSession' } },
      creatingSession: {
        invoke: {
          id: 'createSession',
          src: 'createSession',
          onDone: {
            target: 'preQuestionnaire',
            actions: assign({
              sessionId: ({ event }) => event.output.sessionId,
              participantCode: ({ event }) => event.output.participantCode,
              condition: ({ event }) => event.output.condition,
              assignmentMode: ({ event }) => event.output.assignmentMode,
              researchErrorCode: () => null,
            }),
          },
          onError: {
            target: 'sessionError',
            actions: assign({
              researchErrorCode: ({ event }) => errorCode(event.error),
            }),
          },
        },
      },
      sessionError: {
        on: {
          RETRY_SESSION: { target: 'creatingSession', actions: 'clearResearchError' },
        },
      },
      preQuestionnaire: {
        initial: 'editing',
        states: {
          editing: { on: { SUBMIT_PRE: 'saving' } },
          saving: {
            invoke: {
              id: 'savePre',
              src: 'savePre',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: { target: '#study.nameEntry' },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: { RETRY_PRE: { target: 'saving', actions: 'clearResearchError' } },
          },
        },
      },
      nameEntry: {
        on: {
          DISPLAY_NAME_ENTERED: {
            target: 'artifactLifecycle',
            actions: 'storeDisplayName',
          },
        },
      },
      artifactLifecycle: {
        tags: ['artifactActive'],
        initial: 'starting',
        invoke: {
          id: 'observeArtifactLifecycle',
          src: 'observeArtifactLifecycle',
          input: ({ context }) => ({
            sessionId: requiredSessionId(context),
            condition: requiredCondition(context),
          }),
        },
        on: {
          ARTIFACT_RELOAD: { actions: 'markIncompleteReload' },
          ARTIFACT_VISIBILITY_CHANGED: {
            guard: 'acceptsArtifactVisibility',
            actions: ['incrementPendingArtifactTimingWrites', 'recordArtifactVisibility'],
          },
          ARTIFACT_TIMING_WRITE_SUCCEEDED: {
            actions: 'decrementPendingArtifactTimingWrites',
          },
          ARTIFACT_TIMING_WRITE_FAILED: {
            target: '.endError',
            actions: 'storeVisibilityTimingError',
          },
        },
        states: {
          starting: {
            invoke: {
              id: 'startArtifact',
              src: 'startArtifact',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: { target: 'artifact' },
              onError: {
                target: 'startError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          startError: {
            on: {
              RETRY_ARTIFACT_START: {
                target: 'retryingStartTiming',
                actions: 'clearResearchError',
              },
            },
          },
          retryingStartTiming: {
            invoke: {
              id: 'retryArtifactStartTiming',
              src: 'retryArtifactTiming',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: 'artifact',
                actions: 'clearArtifactTimingError',
              },
              onError: {
                target: 'startError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          artifact: {
            initial: 'routing',
            always: {
              guard: 'artifactCompletionReady',
              target: '#artifact-ending',
            },
            on: {
              ARTIFACT_COMPLETED: {
                actions: 'requestArtifactCompletion',
              },
            },
            states: {
              routing: {
                always: [{ guard: 'isSupportive', target: 'supportive' }, { target: 'reference' }],
              },
              supportive: {
                type: 'atomic',
              },
              reference: {
                type: 'atomic',
              },
            },
          },
          ending: {
            id: 'artifact-ending',
            entry: 'clearDisplayName',
            invoke: {
              id: 'endArtifact',
              src: 'endArtifact',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: '#study.postQuestionnaire',
                actions: assign({
                  artifactWallClockMs: ({ event }) => event.output,
                  researchErrorCode: () => null,
                }),
              },
              onError: {
                target: 'endError',
                actions: 'storeEndTimingError',
              },
            },
          },
          endError: {
            on: {
              RETRY_ARTIFACT_END: [
                {
                  guard: 'visibilityTimingFailed',
                  target: 'retryingVisibilityTiming',
                  actions: 'clearResearchError',
                },
                {
                  guard: 'endTimingFailed',
                  target: 'retryingEndTiming',
                  actions: 'clearResearchError',
                },
              ],
            },
          },
          retryingVisibilityTiming: {
            invoke: {
              id: 'retryArtifactVisibilityTiming',
              src: 'retryArtifactTiming',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: 'artifact',
                actions: ['decrementPendingArtifactTimingWrites', 'clearArtifactTimingError'],
              },
              onError: {
                target: 'endError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          retryingEndTiming: {
            invoke: {
              id: 'retryArtifactEndTiming',
              src: 'retryArtifactTiming',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: {
                target: '#study.postQuestionnaire',
                actions: assign({
                  artifactWallClockMs: ({ event }) => event.output,
                  artifactTimingErrorKind: () => null,
                  researchErrorCode: () => null,
                }),
              },
              onError: {
                target: 'endError',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
        },
      },
      postQuestionnaire: {
        initial: 'editing',
        states: {
          editing: { on: { SUBMIT_POST: 'saving' } },
          saving: {
            invoke: {
              id: 'savePost',
              src: 'savePost',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: { target: '#study.guardrails' },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: { RETRY_POST: { target: 'saving', actions: 'clearResearchError' } },
          },
        },
      },
      guardrails: {
        initial: 'editing',
        states: {
          editing: { on: { SUBMIT_GUARDRAILS: 'saving' } },
          saving: {
            invoke: {
              id: 'saveGuardrails',
              src: 'saveGuardrails',
              input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
              onDone: { target: '#study.debrief' },
              onError: {
                target: 'error',
                actions: assign({
                  researchErrorCode: ({ event }) => errorCode(event.error),
                }),
              },
            },
          },
          error: {
            on: {
              RETRY_GUARDRAILS: { target: 'saving', actions: 'clearResearchError' },
            },
          },
        },
      },
      debrief: { on: { DEBRIEF_ACKNOWLEDGED: 'completing' } },
      completing: {
        invoke: {
          id: 'completeSession',
          src: 'completeSession',
          input: ({ context }) => ({ sessionId: requiredSessionId(context) }),
          onDone: { target: 'complete' },
          onError: {
            target: 'completionError',
            actions: assign({
              researchErrorCode: ({ event }) => errorCode(event.error),
            }),
          },
        },
      },
      completionError: {
        on: {
          RETRY_COMPLETION: { target: 'completing', actions: 'clearResearchError' },
        },
      },
      complete: { type: 'final' },
      fatalError: {
        on: { RESET: { target: 'consent', actions: 'resetContext' } },
      },
    },
  });
}
