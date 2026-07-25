import { assign, setup } from 'xstate';

export interface PasswordModuleContext {
  readonly accountIds: readonly string[];
  readonly activeAccountId: string | null;
  readonly passwordValues: Readonly<Record<string, string>>;
  readonly timingErrorCode: string | null;
}

export interface PasswordModuleInput {
  readonly accountIds: readonly string[];
}

export type PasswordModuleEvent =
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
  | { readonly type: 'CONFIGURE_ACCOUNTS' }
  | { readonly type: 'CONTINUE' }
  | { readonly type: 'S01_END_RECORDED' }
  | { readonly type: 'S01_END_FAILED'; readonly errorCode: string }
  | { readonly type: 'RETRY_S01_END' }
  | { readonly type: 'DISCARD' };

function emptyPasswordValues(accountIds: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const accountId of accountIds) values[accountId] = '';
  return values;
}

export const passwordModuleMachine = setup({
  types: {
    context: {} as PasswordModuleContext,
    events: {} as PasswordModuleEvent,
    input: {} as PasswordModuleInput,
  },
  guards: {
    hasAllPasswordValues: ({ context }) =>
      context.accountIds.every((accountId) => (context.passwordValues[accountId] ?? '').length > 0),
  },
  actions: {
    clearTimingError: assign({ timingErrorCode: () => null }),
    storeTimingError: assign({
      timingErrorCode: ({ event }) =>
        event.type === 'S01_START_FAILED' || event.type === 'S01_END_FAILED'
          ? event.errorCode
          : null,
    }),
    selectAccount: assign({
      activeAccountId: ({ event }) => (event.type === 'SELECT_ACCOUNT' ? event.accountId : null),
    }),
    setPasswordValue: assign({
      passwordValues: ({ context, event }) => {
        if (event.type !== 'SET_PASSWORD_VALUE') return context.passwordValues;
        return { ...context.passwordValues, [event.accountId]: event.value };
      },
    }),
    discardPasswordValues: assign({
      passwordValues: ({ context }) => emptyPasswordValues(context.accountIds),
    }),
  },
}).createMachine({
  id: 'passwordModule',
  initial: 's00',
  context: ({ input }) => ({
    accountIds: [...input.accountIds],
    activeAccountId: input.accountIds[0] ?? null,
    passwordValues: emptyPasswordValues(input.accountIds),
    timingErrorCode: null,
  }),
  on: {
    DISCARD: { target: '.discarded', actions: 'discardPasswordValues' },
  },
  states: {
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
            SELECT_ACCOUNT: { actions: 'selectAccount' },
            SET_PASSWORD_VALUE: { actions: 'setPasswordValue' },
            CONFIGURE_ACCOUNTS: { guard: 'hasAllPasswordValues', target: 'configured' },
          },
        },
        configured: {
          on: {
            SELECT_ACCOUNT: { actions: 'selectAccount' },
            CONTINUE: { target: 'ending', actions: 'clearTimingError' },
          },
        },
        ending: {
          on: {
            SELECT_ACCOUNT: { actions: 'selectAccount' },
            S01_END_RECORDED: { target: '#passwordModule.complete' },
            S01_END_FAILED: { target: 'endFailed', actions: 'storeTimingError' },
          },
        },
        endFailed: {
          on: {
            SELECT_ACCOUNT: { actions: 'selectAccount' },
            RETRY_S01_END: { target: 'ending', actions: 'clearTimingError' },
          },
        },
      },
    },
    complete: { type: 'final', entry: 'discardPasswordValues' },
    discarded: { type: 'final' },
  },
});

export function getConfiguredAccountCount(context: PasswordModuleContext): number {
  return context.accountIds.filter(
    (accountId) => (context.passwordValues[accountId] ?? '').length > 0,
  ).length;
}
