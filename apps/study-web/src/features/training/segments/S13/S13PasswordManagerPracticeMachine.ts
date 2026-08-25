import { assign, setup } from 'xstate';

export type S13AutofillEntryId =
  | 'my-shop'
  | 'campusgram'
  | 'master-campus'
  | 'campus-email';

interface S13PasswordManagerPracticeContext {
  readonly autofillDurationMs: number;
  readonly registrationDurationMs: number;
  readonly saveConfirmationDurationMs: number;
  readonly saveRestoreDurationMs: number;
  readonly selectedAutofillEntryId: S13AutofillEntryId | null;
}

type S13PasswordManagerPracticeInput = Omit<
  S13PasswordManagerPracticeContext,
  'selectedAutofillEntryId'
>;

type S13PasswordManagerPracticeEvent =
  | { readonly type: 'PASSWORD_FIELD_SELECTED' }
  | { readonly type: 'PASSWORD_FIELD_DESELECTED' }
  | { readonly type: 'PASSWORD_SUGGESTION_SELECTED' }
  | { readonly type: 'REGISTER' }
  | { readonly type: 'SAVE_PASSWORD' }
  | { readonly type: 'DISMISS_SAVE_PROMPT' }
  | { readonly type: 'CONTINUE_SAVE_GUIDANCE' }
  | { readonly type: 'OPEN_SAVE_PROMPT' }
  | { readonly type: 'CONTINUE_TO_LOGIN' }
  | { readonly type: 'LOGIN_FIELD_SELECTED' }
  | { readonly type: 'LOGIN_FIELD_DESELECTED' }
  | { readonly type: 'LOGIN_FIELD_EDITED' }
  | {
      readonly type: 'STORED_ENTRY_SELECTED';
      readonly entryId: S13AutofillEntryId;
    }
  | { readonly type: 'LOGIN' };

export const s13PasswordManagerPracticeMachine = setup({
  types: {
    context: {} as S13PasswordManagerPracticeContext,
    events: {} as S13PasswordManagerPracticeEvent,
    input: {} as S13PasswordManagerPracticeInput,
  },
  delays: {
    autofillDuration: ({ context }) => context.autofillDurationMs,
    registrationDuration: ({ context }) => context.registrationDurationMs,
    saveConfirmationDuration: ({ context }) => context.saveConfirmationDurationMs,
    saveRestoreDuration: ({ context }) => context.saveRestoreDurationMs,
  },
  actions: {
    selectAutofillEntry: assign({
      selectedAutofillEntryId: ({ event }) =>
        event.type === 'STORED_ENTRY_SELECTED' ? event.entryId : null,
    }),
  },
}).createMachine({
  id: 's13PasswordManagerPractice',
  initial: 'registration',
  context: ({ input }) => ({ ...input, selectedAutofillEntryId: null }),
  states: {
    registration: {
      on: { PASSWORD_FIELD_SELECTED: { target: 'passwordSuggestion' } },
    },
    passwordSuggestion: {
      on: {
        PASSWORD_FIELD_DESELECTED: { target: 'registration' },
        PASSWORD_SUGGESTION_SELECTED: { target: 'passwordGenerated' },
      },
    },
    passwordGenerated: {
      on: { REGISTER: { target: 'registering' } },
    },
    registering: {
      after: { registrationDuration: { target: 'savePrompt' } },
    },
    savePrompt: {
      on: {
        SAVE_PASSWORD: { target: 'saveConfirmation' },
        DISMISS_SAVE_PROMPT: { target: 'saveGuidanceFirst' },
      },
    },
    saveGuidanceFirst: {
      on: { CONTINUE_SAVE_GUIDANCE: { target: 'saveGuidanceSecond' } },
    },
    saveGuidanceSecond: {
      on: { OPEN_SAVE_PROMPT: { target: 'savePromptRetry' } },
    },
    saveDeferred: {
      on: { OPEN_SAVE_PROMPT: { target: 'savePromptRetry' } },
    },
    savePromptRetry: {
      on: {
        SAVE_PASSWORD: { target: 'saveConfirmation' },
        DISMISS_SAVE_PROMPT: { target: 'saveDeferred' },
      },
    },
    saveConfirmation: {
      after: { saveConfirmationDuration: { target: 'saveIconRestored' } },
    },
    saveIconRestored: {
      after: { saveRestoreDuration: { target: 'passwordSaved' } },
    },
    passwordSaved: {
      on: { CONTINUE_TO_LOGIN: { target: 'loginIdle' } },
    },
    loginIdle: {
      on: { LOGIN_FIELD_SELECTED: { target: 'loginOffer' } },
    },
    loginOffer: {
      on: {
        LOGIN_FIELD_DESELECTED: { target: 'loginIdle' },
        LOGIN_FIELD_EDITED: { target: 'loginIdle' },
        STORED_ENTRY_SELECTED: {
          target: 'autofilling',
          actions: 'selectAutofillEntry',
        },
      },
    },
    autofilling: {
      after: { autofillDuration: { target: 'loginReady' } },
      on: { LOGIN: { target: 'signedIn' } },
    },
    loginReady: {
      on: {
        LOGIN_FIELD_SELECTED: { target: 'loginOffer' },
        LOGIN: { target: 'signedIn' },
      },
    },
    signedIn: {},
  },
});
