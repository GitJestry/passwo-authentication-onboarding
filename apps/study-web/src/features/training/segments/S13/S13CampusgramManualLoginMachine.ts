import { assign, setup } from 'xstate';

export type S13CampusgramTabId =
  | 'campusgram'
  | 'browser-settings'
  | 'browser-password-manager';

export type S13CampusgramSettingsPage = 'general' | 'passwords';

interface S13CampusgramManualLoginContext {
  readonly activeTabId: S13CampusgramTabId;
  readonly clipboardPassword: string | null;
  readonly correctPassword: string;
  readonly failedLoginAttempts: number;
  readonly fillUnavailableDelayMs: number;
  readonly loginErrorVisible: boolean;
  readonly passwordManagerTabOpen: boolean;
  readonly passwordValue: string;
  readonly settingsPage: S13CampusgramSettingsPage;
  readonly settingsTabOpen: boolean;
}

type S13CampusgramManualLoginEvent =
  | { readonly type: 'PASSWORD_FIELD_FOCUSED' }
  | { readonly type: 'CONTINUE_FILL_EXPLANATION' }
  | { readonly type: 'OPEN_SETTINGS' }
  | { readonly type: 'OPEN_PASSWORD_MANAGER' }
  | {
      readonly type: 'OPEN_SETTINGS_PAGE';
      readonly page: S13CampusgramSettingsPage;
    }
  | { readonly type: 'SELECT_TAB'; readonly tabId: S13CampusgramTabId }
  | { readonly type: 'COPY_PASSWORD'; readonly value: string }
  | { readonly type: 'INSERT_PASSWORD' }
  | { readonly type: 'EDIT_PASSWORD'; readonly value: string }
  | { readonly type: 'LOGIN' };

function removesOnlyExistingPasswordCharacters(
  currentValue: string,
  nextValue: string,
): boolean {
  if (nextValue.length > currentValue.length) return false;
  if (nextValue === currentValue) return true;

  const removedLength = currentValue.length - nextValue.length;
  for (let splitIndex = 0; splitIndex <= nextValue.length; splitIndex += 1) {
    const valueAfterDeletion =
      currentValue.slice(0, splitIndex) +
      currentValue.slice(splitIndex + removedLength);
    if (valueAfterDeletion === nextValue) return true;
  }
  return false;
}

export const s13CampusgramManualLoginMachine = setup({
  types: {
    context: {} as S13CampusgramManualLoginContext,
    events: {} as S13CampusgramManualLoginEvent,
    input: {} as {
      readonly correctPassword: string;
      readonly fillUnavailableDelayMs: number;
    },
  },
  delays: {
    fillUnavailableDelay: ({ context }) => context.fillUnavailableDelayMs,
  },
  guards: {
    canSelectTab: ({ context, event }) => {
      if (event.type !== 'SELECT_TAB') return false;
      if (event.tabId === 'campusgram') return true;
      if (event.tabId === 'browser-settings') return context.settingsTabOpen;
      return context.passwordManagerTabOpen;
    },
    hasClipboardPassword: ({ context }) => context.clipboardPassword !== null,
    isPasswordDeletion: ({ context, event }) =>
      event.type === 'EDIT_PASSWORD' &&
      removesOnlyExistingPasswordCharacters(context.passwordValue, event.value),
    passwordMatches: ({ context }) => context.passwordValue === context.correctPassword,
  },
  actions: {
    openSettings: assign({
      activeTabId: () => 'browser-settings' as const,
      settingsPage: () => 'general' as const,
      settingsTabOpen: () => true,
    }),
    openPasswordManager: assign({
      activeTabId: () => 'browser-password-manager' as const,
      passwordManagerTabOpen: () => true,
    }),
    openSettingsPage: assign({
      activeTabId: () => 'browser-settings' as const,
      settingsPage: ({ event }) =>
        event.type === 'OPEN_SETTINGS_PAGE' ? event.page : 'general',
      settingsTabOpen: () => true,
    }),
    selectTab: assign({
      activeTabId: ({ context, event }) =>
        event.type === 'SELECT_TAB' ? event.tabId : context.activeTabId,
    }),
    storeClipboardPassword: assign({
      clipboardPassword: ({ context, event }) =>
        event.type === 'COPY_PASSWORD' ? event.value : context.clipboardPassword,
      loginErrorVisible: () => false,
    }),
    insertClipboardPassword: assign({
      clipboardPassword: () => null,
      passwordValue: ({ context }) => context.clipboardPassword ?? context.passwordValue,
      loginErrorVisible: () => false,
    }),
    editPassword: assign({
      passwordValue: ({ context, event }) =>
        event.type === 'EDIT_PASSWORD' ? event.value : context.passwordValue,
      loginErrorVisible: () => false,
    }),
    showLoginError: assign({
      failedLoginAttempts: ({ context }) => context.failedLoginAttempts + 1,
      loginErrorVisible: () => true,
    }),
  },
}).createMachine({
  id: 's13CampusgramManualLogin',
  initial: 'awaitingPasswordFocus',
  context: ({ input }) => ({
    activeTabId: 'campusgram',
    clipboardPassword: null,
    correctPassword: input.correctPassword,
    failedLoginAttempts: 0,
    fillUnavailableDelayMs: input.fillUnavailableDelayMs,
    loginErrorVisible: false,
    passwordManagerTabOpen: false,
    passwordValue: '',
    settingsPage: 'general',
    settingsTabOpen: false,
  }),
  on: {
    SELECT_TAB: { guard: 'canSelectTab', actions: 'selectTab' },
    OPEN_SETTINGS_PAGE: { actions: 'openSettingsPage' },
  },
  states: {
    awaitingPasswordFocus: {
      on: { PASSWORD_FIELD_FOCUSED: { target: 'waitingForFillUnavailable' } },
    },
    waitingForFillUnavailable: {
      after: { fillUnavailableDelay: { target: 'fillUnavailable' } },
    },
    fillUnavailable: {
      on: { CONTINUE_FILL_EXPLANATION: { target: 'copyInstruction' } },
    },
    copyInstruction: {
      on: {
        OPEN_SETTINGS: { target: 'browsing', actions: 'openSettings' },
        OPEN_PASSWORD_MANAGER: {
          target: 'browsing',
          actions: 'openPasswordManager',
        },
      },
    },
    browsing: {
      on: {
        OPEN_SETTINGS: { actions: 'openSettings' },
        OPEN_PASSWORD_MANAGER: { actions: 'openPasswordManager' },
        COPY_PASSWORD: { actions: 'storeClipboardPassword' },
        INSERT_PASSWORD: {
          guard: 'hasClipboardPassword',
          actions: 'insertClipboardPassword',
        },
        EDIT_PASSWORD: { guard: 'isPasswordDeletion', actions: 'editPassword' },
        LOGIN: [
          { guard: 'passwordMatches', target: 'signedIn' },
          { actions: 'showLoginError' },
        ],
      },
    },
    signedIn: {},
  },
});
