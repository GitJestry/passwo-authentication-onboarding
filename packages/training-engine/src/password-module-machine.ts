import { assign, setup } from 'xstate';

export type RetrievalResult = 'pending' | 'retrievable' | 'not-remembered';

export interface PasswordModuleContext {
  readonly accountIds: readonly string[];
  readonly displayName: string | null;
  readonly activeAccountId: string | null;
  readonly passwordValues: Readonly<Record<string, string>>;
  readonly configuredAccountIds: readonly string[];
  readonly s02ContentCompleted: boolean;
  readonly retrievalPasswordValues: Readonly<Record<string, string>>;
  readonly retrievalResults: Readonly<Record<string, RetrievalResult>>;
  readonly timingErrorCode: string | null;
}

export interface PasswordModuleInput {
  readonly accountIds: readonly string[];
}

export type PasswordModuleEvent =
  | { readonly type: 'DISPLAY_NAME_ENTERED'; readonly displayName: string }
  | { readonly type: 'S00_COMPLETED' }
  | { readonly type: 'S01_START_RECORDED' }
  | { readonly type: 'S01_START_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S01_START' }
  | { readonly type: 'SELECT_ACCOUNT'; readonly accountId: string }
  | {
      readonly type: 'SET_PASSWORD_VALUE';
      readonly accountId: string;
      readonly value: string;
    }
  | { readonly type: 'CONFIGURE_ACCOUNT'; readonly accountId: string }
  | { readonly type: 'CONTINUE' }
  | { readonly type: 'S01_END_RECORDED' }
  | { readonly type: 'S01_END_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S01_END' }
  | { readonly type: 'S02_START_RECORDED' }
  | { readonly type: 'S02_START_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S02_START' }
  | { readonly type: 'S02_CONTENT_COMPLETED' }
  | { readonly type: 'S02_END_RECORDED' }
  | { readonly type: 'S02_END_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S02_END' }
  | { readonly type: 'S03_START_RECORDED' }
  | { readonly type: 'S03_START_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S03_START' }
  | {
      readonly type: 'SET_RETRIEVAL_PASSWORD_VALUE';
      readonly accountId: string;
      readonly value: string;
    }
  | { readonly type: 'SUBMIT_RETRIEVAL_LOGIN'; readonly accountId: string }
  | { readonly type: 'SKIP_RETRIEVAL'; readonly accountId: string }
  | { readonly type: 'S03_WARNING_SEQUENCE_COMPLETED' }
  | { readonly type: 'S03_END_RECORDED' }
  | { readonly type: 'S03_END_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S03_END' }
  | { readonly type: 'DISCARD' };

function emptyPasswordValues(accountIds: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const accountId of accountIds) values[accountId] = '';
  return values;
}

function emptyRetrievalResults(accountIds: readonly string[]): Record<string, RetrievalResult> {
  const results: Record<string, RetrievalResult> = {};
  for (const accountId of accountIds) results[accountId] = 'pending';
  return results;
}

const emojiSequencePattern =
  /(?:[#*0-9]\uFE0F?\u20E3|[\u{1F1E6}-\u{1F1FF}]{1,2}|(?:\p{Extended_Pictographic}|\p{Emoji_Modifier})(?:\uFE0E|\uFE0F)?(?:\u200D(?:\p{Extended_Pictographic}|\p{Emoji_Modifier})(?:\uFE0E|\uFE0F)?)*[\u{E0020}-\u{E007F}]*)/gu;

/** Keeps fictional values local while removing unsupported invisible and emoji input. */
export function sanitizePasswordValue(value: string): string {
  return value.replace(emojiSequencePattern, '').replace(/[\p{White_Space}\p{Cc}\u200D]/gu, '');
}

function isKnownAccount(context: PasswordModuleContext, accountId: string): boolean {
  return context.accountIds.includes(accountId);
}

function isConfiguredAccount(context: PasswordModuleContext, accountId: string): boolean {
  return context.configuredAccountIds.includes(accountId);
}

function canConfigureAccount(context: PasswordModuleContext, accountId: string): boolean {
  return (
    isKnownAccount(context, accountId) &&
    !isConfiguredAccount(context, accountId) &&
    (context.passwordValues[accountId] ?? '').length > 0
  );
}

function canProcessRetrieval(context: PasswordModuleContext, accountId: string): boolean {
  return (
    isKnownAccount(context, accountId) &&
    isConfiguredAccount(context, accountId) &&
    context.retrievalResults[accountId] === 'pending'
  );
}

function matchesRetrievalPassword(context: PasswordModuleContext, accountId: string): boolean {
  return (
    canProcessRetrieval(context, accountId) &&
    context.retrievalPasswordValues[accountId] === context.passwordValues[accountId]
  );
}

export const passwordModuleMachine = setup({
  types: {
    context: {} as PasswordModuleContext,
    events: {} as PasswordModuleEvent,
    input: {} as PasswordModuleInput,
  },
  guards: {
    hasDisplayName: ({ event }) =>
      event.type === 'DISPLAY_NAME_ENTERED' && event.displayName.trim().length > 0,
    isKnownAccount: ({ context, event }) =>
      event.type === 'SELECT_ACCOUNT' && isKnownAccount(context, event.accountId),
    canEditAccount: ({ context, event }) =>
      event.type === 'SET_PASSWORD_VALUE' &&
      isKnownAccount(context, event.accountId) &&
      !isConfiguredAccount(context, event.accountId),
    canConfigureAccount: ({ context, event }) =>
      event.type === 'CONFIGURE_ACCOUNT' && canConfigureAccount(context, event.accountId),
    configuresLastAccount: ({ context, event }) =>
      event.type === 'CONFIGURE_ACCOUNT' &&
      canConfigureAccount(context, event.accountId) &&
      getConfiguredAccountCount(context) + 1 === context.accountIds.length,
    hasCompletedS02Content: ({ context }) => context.s02ContentCompleted,
    canEditRetrieval: ({ context, event }) =>
      event.type === 'SET_RETRIEVAL_PASSWORD_VALUE' &&
      canProcessRetrieval(context, event.accountId),
    matchesRetrievalPassword: ({ context, event }) =>
      event.type === 'SUBMIT_RETRIEVAL_LOGIN' && matchesRetrievalPassword(context, event.accountId),
    completesRetrieval: ({ context, event }) =>
      (event.type === 'SUBMIT_RETRIEVAL_LOGIN' || event.type === 'SKIP_RETRIEVAL') &&
      canProcessRetrieval(context, event.accountId) &&
      getRetrievedAccountCount(context) + 1 === context.accountIds.length,
  },
  actions: {
    storeDisplayName: assign({
      displayName: ({ event }) =>
        event.type === 'DISPLAY_NAME_ENTERED' ? event.displayName.trim() : null,
    }),
    clearTimingError: assign({ timingErrorCode: () => null }),
    storeTimingError: assign({
      timingErrorCode: ({ event }) =>
        event.type === 'S01_START_FAILED' ||
        event.type === 'S01_END_FAILED' ||
        event.type === 'S02_START_FAILED' ||
        event.type === 'S02_END_FAILED' ||
        event.type === 'S03_START_FAILED' ||
        event.type === 'S03_END_FAILED'
          ? event.errorCode
          : null,
    }),
    selectAccount: assign({
      activeAccountId: ({ event }) => (event.type === 'SELECT_ACCOUNT' ? event.accountId : null),
    }),
    setPasswordValue: assign({
      passwordValues: ({ context, event }) => {
        if (event.type !== 'SET_PASSWORD_VALUE') return context.passwordValues;
        return {
          ...context.passwordValues,
          [event.accountId]: sanitizePasswordValue(event.value),
        };
      },
    }),
    configureAccount: assign({
      configuredAccountIds: ({ context, event }) => {
        if (event.type !== 'CONFIGURE_ACCOUNT') return context.configuredAccountIds;
        return [...context.configuredAccountIds, event.accountId];
      },
    }),
    setRetrievalPasswordValue: assign({
      retrievalPasswordValues: ({ context, event }) => {
        if (event.type !== 'SET_RETRIEVAL_PASSWORD_VALUE') return context.retrievalPasswordValues;
        return {
          ...context.retrievalPasswordValues,
          [event.accountId]: sanitizePasswordValue(event.value),
        };
      },
    }),
    markRetrievable: assign({
      retrievalResults: ({ context, event }) => {
        if (event.type !== 'SUBMIT_RETRIEVAL_LOGIN') return context.retrievalResults;
        return { ...context.retrievalResults, [event.accountId]: 'retrievable' };
      },
      retrievalPasswordValues: ({ context, event }) => {
        if (event.type !== 'SUBMIT_RETRIEVAL_LOGIN') return context.retrievalPasswordValues;
        return { ...context.retrievalPasswordValues, [event.accountId]: '' };
      },
    }),
    markNotRemembered: assign({
      retrievalResults: ({ context, event }) => {
        if (event.type !== 'SKIP_RETRIEVAL') return context.retrievalResults;
        return { ...context.retrievalResults, [event.accountId]: 'not-remembered' };
      },
      retrievalPasswordValues: ({ context, event }) => {
        if (event.type !== 'SKIP_RETRIEVAL') return context.retrievalPasswordValues;
        return { ...context.retrievalPasswordValues, [event.accountId]: '' };
      },
    }),
    discardTransientTrainingData: assign({
      displayName: () => null,
      activeAccountId: () => null,
      passwordValues: ({ context }) => emptyPasswordValues(context.accountIds),
      configuredAccountIds: () => [],
      s02ContentCompleted: () => false,
      retrievalPasswordValues: ({ context }) => emptyPasswordValues(context.accountIds),
      retrievalResults: ({ context }) => emptyRetrievalResults(context.accountIds),
      timingErrorCode: () => null,
    }),
    markS02ContentCompleted: assign({ s02ContentCompleted: () => true }),
  },
}).createMachine({
  id: 'passwordModule',
  initial: 'entry',
  context: ({ input }) => ({
    accountIds: [...input.accountIds],
    displayName: null,
    activeAccountId: input.accountIds[0] ?? null,
    passwordValues: emptyPasswordValues(input.accountIds),
    configuredAccountIds: [],
    s02ContentCompleted: false,
    retrievalPasswordValues: emptyPasswordValues(input.accountIds),
    retrievalResults: emptyRetrievalResults(input.accountIds),
    timingErrorCode: null,
  }),
  on: {
    DISCARD: { target: '.discarded', actions: 'discardTransientTrainingData' },
  },
  states: {
    entry: {
      on: {
        DISPLAY_NAME_ENTERED: {
          guard: 'hasDisplayName',
          target: 's00',
          actions: 'storeDisplayName',
        },
      },
    },
    s00: {
      on: { S00_COMPLETED: { target: 's01.starting', actions: 'clearTimingError' } },
    },
    s01: {
      initial: 'starting',
      states: {
        starting: {
          on: {
            S01_START_RECORDED: { target: 'editing', actions: 'clearTimingError' },
            S01_START_FAILED: { target: 'startFailed', actions: 'storeTimingError' },
          },
        },
        startFailed: {
          on: { RETRY_S01_START: { target: 'starting', actions: 'clearTimingError' } },
        },
        editing: {
          on: {
            SELECT_ACCOUNT: { guard: 'isKnownAccount', actions: 'selectAccount' },
            SET_PASSWORD_VALUE: { guard: 'canEditAccount', actions: 'setPasswordValue' },
            CONFIGURE_ACCOUNT: [
              {
                guard: 'configuresLastAccount',
                target: 'configured',
                actions: 'configureAccount',
              },
              { guard: 'canConfigureAccount', actions: 'configureAccount' },
            ],
          },
        },
        configured: {
          on: {
            SELECT_ACCOUNT: { guard: 'isKnownAccount', actions: 'selectAccount' },
            CONTINUE: { target: 'ending', actions: 'clearTimingError' },
          },
        },
        ending: {
          on: {
            SELECT_ACCOUNT: { guard: 'isKnownAccount', actions: 'selectAccount' },
            S01_END_RECORDED: { target: '#passwordModule.s02.starting' },
            S01_END_FAILED: { target: 'endFailed', actions: 'storeTimingError' },
          },
        },
        endFailed: {
          on: {
            SELECT_ACCOUNT: { guard: 'isKnownAccount', actions: 'selectAccount' },
            RETRY_S01_END: { target: 'ending', actions: 'clearTimingError' },
          },
        },
      },
    },
    s02: {
      initial: 'starting',
      states: {
        starting: {
          on: {
            S02_START_RECORDED: { target: 'active', actions: 'clearTimingError' },
            S02_START_FAILED: { target: 'startFailed', actions: 'storeTimingError' },
          },
        },
        startFailed: {
          on: { RETRY_S02_START: { target: 'starting', actions: 'clearTimingError' } },
        },
        active: {
          on: {
            S02_CONTENT_COMPLETED: { actions: 'markS02ContentCompleted' },
            CONTINUE: {
              guard: 'hasCompletedS02Content',
              target: 'ending',
              actions: 'clearTimingError',
            },
          },
        },
        ending: {
          on: {
            S02_END_RECORDED: { target: '#passwordModule.s03.starting' },
            S02_END_FAILED: { target: 'endFailed', actions: 'storeTimingError' },
          },
        },
        endFailed: {
          on: { RETRY_S02_END: { target: 'ending', actions: 'clearTimingError' } },
        },
      },
    },
    s03: {
      initial: 'starting',
      states: {
        starting: {
          on: {
            S03_START_RECORDED: { target: 'active', actions: 'clearTimingError' },
            S03_START_FAILED: { target: 'startFailed', actions: 'storeTimingError' },
          },
        },
        startFailed: {
          on: { RETRY_S03_START: { target: 'starting', actions: 'clearTimingError' } },
        },
        active: {
          on: {
            SELECT_ACCOUNT: { guard: 'isKnownAccount', actions: 'selectAccount' },
            SET_RETRIEVAL_PASSWORD_VALUE: {
              guard: 'canEditRetrieval',
              actions: 'setRetrievalPasswordValue',
            },
            SUBMIT_RETRIEVAL_LOGIN: [
              {
                guard: ({ context, event }) =>
                  event.type === 'SUBMIT_RETRIEVAL_LOGIN' &&
                  matchesRetrievalPassword(context, event.accountId) &&
                  getRetrievedAccountCount(context) + 1 === context.accountIds.length,
                target: 'completionSequence',
                actions: 'markRetrievable',
              },
              { guard: 'matchesRetrievalPassword', actions: 'markRetrievable' },
            ],
            SKIP_RETRIEVAL: [
              {
                guard: 'completesRetrieval',
                target: 'completionSequence',
                actions: 'markNotRemembered',
              },
              {
                guard: ({ context, event }) =>
                  event.type === 'SKIP_RETRIEVAL' && canProcessRetrieval(context, event.accountId),
                actions: 'markNotRemembered',
              },
            ],
          },
        },
        completionSequence: {
          on: {
            S03_WARNING_SEQUENCE_COMPLETED: { target: 'ending', actions: 'clearTimingError' },
          },
        },
        ending: {
          on: {
            S03_END_RECORDED: { target: '#passwordModule.awaitingS04' },
            S03_END_FAILED: { target: 'endFailed', actions: 'storeTimingError' },
          },
        },
        endFailed: {
          on: { RETRY_S03_END: { target: 'ending', actions: 'clearTimingError' } },
        },
      },
    },
    awaitingS04: {},
    discarded: { type: 'final' },
  },
});

export function getConfiguredAccountCount(context: PasswordModuleContext): number {
  return context.accountIds.filter((accountId) => context.configuredAccountIds.includes(accountId))
    .length;
}

export function getRetrievedAccountCount(context: PasswordModuleContext): number {
  return context.accountIds.filter((accountId) => context.retrievalResults[accountId] !== 'pending')
    .length;
}
