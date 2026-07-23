import type { AssignmentMode, StudyCondition } from '@passwo/contracts';
import { assign, setup } from 'xstate';

export interface StudyContext {
  readonly sessionId: string | null;
  readonly participantCode: string | null;
  readonly condition: StudyCondition | null;
  readonly assignmentMode: AssignmentMode | null;
  readonly displayName: string | null;
  readonly fatalErrorCode: string | null;
}

export type StudyEvent =
  | { readonly type: 'ACCEPT_CONSENT' }
  | {
      readonly type: 'SESSION_CREATED';
      readonly sessionId: string;
      readonly participantCode: string;
      readonly condition: StudyCondition;
      readonly assignmentMode: AssignmentMode;
    }
  | { readonly type: 'SESSION_FAILED'; readonly errorCode: string }
  | { readonly type: 'PRE_COMPLETED' }
  | { readonly type: 'DISPLAY_NAME_ENTERED'; readonly displayName: string }
  | { readonly type: 'ARTIFACT_COMPLETED' }
  | { readonly type: 'POST_COMPLETED' }
  | { readonly type: 'GUARDRAILS_COMPLETED' }
  | { readonly type: 'DEBRIEF_ACKNOWLEDGED' }
  | { readonly type: 'TECHNICAL_ABORT'; readonly errorCode: string }
  | { readonly type: 'RESET' };

const initialContext: StudyContext = {
  sessionId: null,
  participantCode: null,
  condition: null,
  assignmentMode: null,
  displayName: null,
  fatalErrorCode: null,
};

export const studyMachine = setup({
  types: {
    context: {} as StudyContext,
    events: {} as StudyEvent,
  },
  guards: {
    isSupportive: ({ context }) => context.condition === 'supportive',
  },
  actions: {
    storeSession: assign({
      sessionId: ({ event }) => (event.type === 'SESSION_CREATED' ? event.sessionId : null),
      participantCode: ({ event }) =>
        event.type === 'SESSION_CREATED' ? event.participantCode : null,
      condition: ({ event }) => (event.type === 'SESSION_CREATED' ? event.condition : null),
      assignmentMode: ({ event }) =>
        event.type === 'SESSION_CREATED' ? event.assignmentMode : null,
      fatalErrorCode: () => null,
    }),
    storeDisplayName: assign({
      displayName: ({ event }) =>
        event.type === 'DISPLAY_NAME_ENTERED' ? event.displayName.trim() : null,
    }),
    clearDisplayName: assign({ displayName: () => null }),
    storeFatalError: assign({
      fatalErrorCode: ({ event }) =>
        event.type === 'SESSION_FAILED' || event.type === 'TECHNICAL_ABORT'
          ? event.errorCode
          : 'unknown',
      displayName: () => null,
    }),
    resetContext: assign(() => initialContext),
  },
}).createMachine({
  id: 'study',
  initial: 'consent',
  context: initialContext,
  on: {
    TECHNICAL_ABORT: { target: '.fatalError', actions: 'storeFatalError' },
  },
  states: {
    consent: { on: { ACCEPT_CONSENT: 'creatingSession' } },
    creatingSession: {
      on: {
        SESSION_CREATED: { target: 'preQuestionnaire', actions: 'storeSession' },
        SESSION_FAILED: { target: 'fatalError', actions: 'storeFatalError' },
      },
    },
    preQuestionnaire: { on: { PRE_COMPLETED: 'nameEntry' } },
    nameEntry: {
      on: {
        DISPLAY_NAME_ENTERED: { target: 'artifact', actions: 'storeDisplayName' },
      },
    },
    artifact: {
      initial: 'routing',
      states: {
        routing: {
          always: [
            { guard: 'isSupportive', target: 'supportive' },
            { target: 'reference' },
          ],
        },
        supportive: {
          on: {
            ARTIFACT_COMPLETED: {
              target: '#study.postQuestionnaire',
              actions: 'clearDisplayName',
            },
          },
        },
        reference: {
          on: {
            ARTIFACT_COMPLETED: {
              target: '#study.postQuestionnaire',
              actions: 'clearDisplayName',
            },
          },
        },
      },
    },
    postQuestionnaire: { on: { POST_COMPLETED: 'guardrails' } },
    guardrails: { on: { GUARDRAILS_COMPLETED: 'debrief' } },
    debrief: { on: { DEBRIEF_ACKNOWLEDGED: 'complete' } },
    complete: { type: 'final' },
    fatalError: {
      on: { RESET: { target: 'consent', actions: 'resetContext' } },
    },
  },
});
