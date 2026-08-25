import { assign, setup } from 'xstate';

export type S13BankNavigationPage =
  | 'overview'
  | 'accounts'
  | 'transfers'
  | 'cards'
  | 'settings';

export type S13BankPage = S13BankNavigationPage | 'security' | 'password';

export type S13BankAutofillEntryId =
  | 'muster-bank'
  | 'my-shop'
  | 'campusgram'
  | 'master-campus'
  | 'campus-email';

interface S13MusterBankPasswordChangeContext {
  readonly autofillDurationMs: number;
  readonly expectedCurrentPassword: string;
  readonly expectedNewPassword: string;
  readonly expectedUsername: string;
  readonly failedLoginAttempts: number;
  readonly passwordChangeDurationMs: number;
  readonly passwordChangedToastDurationMs: number;
  readonly passwordUpdatedStatusDurationMs: number;
  readonly page: S13BankPage;
  readonly selectedAutofillEntryId: S13BankAutofillEntryId | null;
}

type S13MusterBankPasswordChangeInput = Omit<
  S13MusterBankPasswordChangeContext,
  'failedLoginAttempts' | 'page' | 'selectedAutofillEntryId'
>;

type S13MusterBankPasswordChangeEvent =
  | { readonly type: 'NAVIGATE'; readonly page: S13BankNavigationPage }
  | { readonly type: 'OPEN_SECURITY' }
  | { readonly type: 'OPEN_PASSWORD' }
  | { readonly type: 'LOGIN_FIELD_SELECTED' }
  | { readonly type: 'LOGIN_FIELD_DESELECTED' }
  | { readonly type: 'LOGIN_FIELD_EDITED' }
  | { readonly type: 'AUTOFILL_COMPLETE' }
  | {
      readonly type: 'STORED_ENTRY_SELECTED';
      readonly entryId: S13BankAutofillEntryId;
    }
  | { readonly type: 'LOGIN'; readonly username: string; readonly password: string }
  | { readonly type: 'NEW_PASSWORD_FIELD_SELECTED' }
  | { readonly type: 'NEW_PASSWORD_FIELD_DESELECTED' }
  | { readonly type: 'PASSWORD_SUGGESTION_SELECTED' }
  | { readonly type: 'CHANGE_PASSWORD' }
  | { readonly type: 'DISMISS_UPDATE_PROMPT' }
  | { readonly type: 'CONTINUE_UPDATE_GUIDANCE' }
  | { readonly type: 'OPEN_UPDATE_PROMPT' }
  | { readonly type: 'UPDATE_PASSWORD' }
  | { readonly type: 'CONTINUE_TO_LOGOUT' }
  | { readonly type: 'REQUEST_LOGOUT' }
  | { readonly type: 'CANCEL_LOGOUT' }
  | { readonly type: 'CONFIRM_LOGOUT' };

export const s13MusterBankPasswordChangeMachine = setup({
  types: {
    context: {} as S13MusterBankPasswordChangeContext,
    events: {} as S13MusterBankPasswordChangeEvent,
    input: {} as S13MusterBankPasswordChangeInput,
  },
  delays: {
    passwordChangeDuration: ({ context }) => context.passwordChangeDurationMs,
    passwordChangedToastDuration: ({ context }) =>
      context.passwordChangedToastDurationMs,
    passwordUpdatedStatusDuration: ({ context }) =>
      context.passwordUpdatedStatusDurationMs,
  },
  guards: {
    passwordMatchesCurrent: ({ context, event }) =>
      event.type === 'LOGIN' &&
      context.selectedAutofillEntryId === 'muster-bank' &&
      event.username === context.expectedUsername &&
      event.password === context.expectedCurrentPassword,
    passwordMatchesNew: ({ context, event }) =>
      event.type === 'LOGIN' &&
      event.username === context.expectedUsername &&
      event.password === context.expectedNewPassword,
  },
  actions: {
    recordFailedLogin: assign({
      failedLoginAttempts: ({ context }) => context.failedLoginAttempts + 1,
    }),
    selectAutofillEntry: assign({
      selectedAutofillEntryId: ({ event }) =>
        event.type === 'STORED_ENTRY_SELECTED' ? event.entryId : null,
    }),
    clearAutofillEntry: assign({ selectedAutofillEntryId: () => null }),
    showNavigationPage: assign({
      page: ({ event, context }) =>
        event.type === 'NAVIGATE' ? event.page : context.page,
    }),
    showOverview: assign({ page: () => 'overview' as const }),
    showSecurity: assign({ page: () => 'security' as const }),
    showPassword: assign({ page: () => 'password' as const }),
  },
}).createMachine({
  id: 's13MusterBankPasswordChange',
  initial: 'initialLoginIdle',
  context: ({ input }) => ({
    ...input,
    failedLoginAttempts: 0,
    page: 'overview',
    selectedAutofillEntryId: null,
  }),
  states: {
    initialLoginIdle: {
      on: {
        LOGIN_FIELD_SELECTED: { target: 'initialLoginOffer' },
        LOGIN_FIELD_EDITED: { actions: 'clearAutofillEntry' },
        LOGIN: [
          {
            guard: 'passwordMatchesCurrent',
            target: 'banking',
            actions: 'showOverview',
          },
          { target: 'initialLoginInvalid', actions: 'recordFailedLogin' },
        ],
      },
    },
    initialLoginOffer: {
      on: {
        LOGIN_FIELD_DESELECTED: { target: 'initialLoginIdle' },
        LOGIN_FIELD_EDITED: {
          target: 'initialLoginIdle',
          actions: 'clearAutofillEntry',
        },
        STORED_ENTRY_SELECTED: {
          target: 'initialLoginAutofilling',
          actions: 'selectAutofillEntry',
        },
        LOGIN: [
          {
            guard: 'passwordMatchesCurrent',
            target: 'banking',
            actions: 'showOverview',
          },
          { target: 'initialLoginInvalid', actions: 'recordFailedLogin' },
        ],
      },
    },
    initialLoginAutofilling: {
      on: { AUTOFILL_COMPLETE: { target: 'initialLoginReady' } },
    },
    initialLoginReady: {
      on: {
        LOGIN_FIELD_SELECTED: { target: 'initialLoginOffer' },
        LOGIN_FIELD_EDITED: {
          target: 'initialLoginIdle',
          actions: 'clearAutofillEntry',
        },
        LOGIN: [
          {
            guard: 'passwordMatchesCurrent',
            target: 'banking',
            actions: 'showOverview',
          },
          { target: 'initialLoginInvalid', actions: 'recordFailedLogin' },
        ],
      },
    },
    initialLoginInvalid: {
      on: {
        LOGIN_FIELD_SELECTED: { target: 'initialLoginOffer' },
        LOGIN_FIELD_EDITED: {
          target: 'initialLoginIdle',
          actions: 'clearAutofillEntry',
        },
        STORED_ENTRY_SELECTED: {
          target: 'initialLoginAutofilling',
          actions: 'selectAutofillEntry',
        },
        LOGIN: [
          {
            guard: 'passwordMatchesCurrent',
            target: 'banking',
            actions: 'showOverview',
          },
          {
            target: 'initialLoginInvalid',
            reenter: true,
            actions: 'recordFailedLogin',
          },
        ],
      },
    },
    banking: {
      on: {
        NAVIGATE: { actions: 'showNavigationPage' },
        OPEN_SECURITY: { actions: 'showSecurity' },
        OPEN_PASSWORD: { target: 'passwordPage', actions: 'showPassword' },
      },
    },
    passwordPage: {
      on: {
        NAVIGATE: { target: 'banking', actions: 'showNavigationPage' },
        OPEN_SECURITY: { target: 'banking', actions: 'showSecurity' },
        NEW_PASSWORD_FIELD_SELECTED: { target: 'passwordSuggestion' },
      },
    },
    passwordSuggestion: {
      on: {
        NAVIGATE: { target: 'banking', actions: 'showNavigationPage' },
        OPEN_SECURITY: { target: 'banking', actions: 'showSecurity' },
        NEW_PASSWORD_FIELD_DESELECTED: { target: 'passwordPage' },
        PASSWORD_SUGGESTION_SELECTED: { target: 'passwordGenerated' },
      },
    },
    passwordGenerated: {
      on: {
        NAVIGATE: { target: 'banking', actions: 'showNavigationPage' },
        OPEN_SECURITY: { target: 'banking', actions: 'showSecurity' },
        CHANGE_PASSWORD: { target: 'passwordChanging' },
      },
    },
    passwordChanging: {
      after: {
        passwordChangeDuration: {
          target: 'passwordChangedToast',
          actions: 'showSecurity',
        },
      },
    },
    passwordChangedToast: {
      after: { passwordChangedToastDuration: { target: 'updatePrompt' } },
      on: {
        UPDATE_PASSWORD: { target: 'updateConfirmation' },
        DISMISS_UPDATE_PROMPT: { target: 'updateGuidanceFirst' },
      },
    },
    updatePrompt: {
      on: {
        UPDATE_PASSWORD: { target: 'updateConfirmation' },
        DISMISS_UPDATE_PROMPT: { target: 'updateGuidanceFirst' },
      },
    },
    updateGuidanceFirst: {
      on: { CONTINUE_UPDATE_GUIDANCE: { target: 'updateGuidanceSecond' } },
    },
    updateGuidanceSecond: {
      on: { OPEN_UPDATE_PROMPT: { target: 'updatePromptRetry' } },
    },
    updateReminder: {
      on: {
        NAVIGATE: { actions: 'showNavigationPage' },
        OPEN_SECURITY: { actions: 'showSecurity' },
        OPEN_PASSWORD: { actions: 'showPassword' },
        OPEN_UPDATE_PROMPT: { target: 'updatePromptRetry' },
      },
    },
    updatePromptRetry: {
      on: {
        UPDATE_PASSWORD: { target: 'updateConfirmation' },
        DISMISS_UPDATE_PROMPT: { target: 'updateReminder' },
      },
    },
    updateConfirmation: {
      after: {
        passwordUpdatedStatusDuration: {
          target: 'updateConfirmationStatusCleared',
        },
      },
      on: { CONTINUE_TO_LOGOUT: { target: 'awaitingLogout' } },
    },
    updateConfirmationStatusCleared: {
      on: { CONTINUE_TO_LOGOUT: { target: 'awaitingLogout' } },
    },
    awaitingLogout: {
      on: {
        NAVIGATE: { actions: 'showNavigationPage' },
        OPEN_SECURITY: { actions: 'showSecurity' },
        OPEN_PASSWORD: { actions: 'showPassword' },
        REQUEST_LOGOUT: { target: 'logoutConfirmation' },
      },
    },
    logoutConfirmation: {
      on: {
        CANCEL_LOGOUT: { target: 'awaitingLogout' },
        CONFIRM_LOGOUT: { target: 'returnLoginAutofilling' },
      },
    },
    returnLoginAutofilling: {
      on: { AUTOFILL_COMPLETE: { target: 'returnLoginReady' } },
    },
    returnLoginReady: {
      on: {
        LOGIN_FIELD_SELECTED: { target: 'returnLoginOffer' },
        LOGIN_FIELD_EDITED: { actions: 'clearAutofillEntry' },
        LOGIN: [
          {
            guard: 'passwordMatchesNew',
            target: 'signedIn',
            actions: 'showOverview',
          },
          { target: 'returnLoginInvalid', actions: 'recordFailedLogin' },
        ],
      },
    },
    returnLoginOffer: {
      on: {
        LOGIN_FIELD_DESELECTED: { target: 'returnLoginReady' },
        LOGIN_FIELD_EDITED: {
          target: 'returnLoginReady',
          actions: 'clearAutofillEntry',
        },
        STORED_ENTRY_SELECTED: {
          target: 'returnLoginManualAutofilling',
          actions: 'selectAutofillEntry',
        },
        LOGIN: [
          {
            guard: 'passwordMatchesNew',
            target: 'signedIn',
            actions: 'showOverview',
          },
          { target: 'returnLoginInvalid', actions: 'recordFailedLogin' },
        ],
      },
    },
    returnLoginManualAutofilling: {
      on: { AUTOFILL_COMPLETE: { target: 'returnLoginReady' } },
    },
    returnLoginInvalid: {
      on: {
        LOGIN_FIELD_SELECTED: { target: 'returnLoginOffer' },
        LOGIN_FIELD_EDITED: {
          target: 'returnLoginReady',
          actions: 'clearAutofillEntry',
        },
        LOGIN: [
          {
            guard: 'passwordMatchesNew',
            target: 'signedIn',
            actions: 'showOverview',
          },
          {
            target: 'returnLoginInvalid',
            reenter: true,
            actions: 'recordFailedLogin',
          },
        ],
      },
    },
    signedIn: {
      on: {
        NAVIGATE: { actions: 'showNavigationPage' },
        OPEN_SECURITY: { actions: 'showSecurity' },
        OPEN_PASSWORD: { actions: 'showPassword' },
      },
    },
  },
});
