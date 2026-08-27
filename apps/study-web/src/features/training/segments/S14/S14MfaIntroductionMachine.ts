import { assign, fromCallback, setup } from 'xstate';

export type S14BrowserTabId = 'master-campus' | 'mfa-search';

interface S14MfaIntroductionContext {
  readonly activeTabId: S14BrowserTabId;
  readonly authenticatorCodeIndex: number;
  readonly authenticatorCodeInput: readonly string[];
  readonly authenticatorCodes: readonly string[];
  readonly authenticatorCodeDurationSeconds: number;
  readonly authenticatorCodeTickMs: number;
  readonly authenticatorSecondsRemaining: number;
  readonly cleanDesktopDurationMs: number;
  readonly combinationRevealDurationMs: number;
  readonly loginAutofillDurationMs: number;
  readonly scanConfirmationDurationMs: number;
  readonly scanRecognitionDurationMs: number;
  readonly searchResultsDelayMs: number;
}

type S14MfaIntroductionInput = Omit<
  S14MfaIntroductionContext,
  | 'activeTabId'
  | 'authenticatorCodeIndex'
  | 'authenticatorCodeInput'
  | 'authenticatorSecondsRemaining'
>;

type S14MfaIntroductionEvent =
  | { readonly type: 'AUTHENTICATOR_TICK' }
  | { readonly type: 'NEXT' }
  | { readonly type: 'TRANSITION_COMPLETE' }
  | { readonly type: 'SUBMIT_SEARCH' }
  | { readonly type: 'OPEN_HELP' }
  | { readonly type: 'OPEN_OVERVIEW' }
  | { readonly type: 'OPEN_SETTINGS' }
  | { readonly type: 'OPEN_SECURITY' }
  | { readonly type: 'OPEN_TWO_FACTOR' }
  | { readonly type: 'SCAN_QR_CODE' }
  | { readonly type: 'ENTER_AUTHENTICATOR_CODE'; readonly value: readonly string[] }
  | { readonly type: 'ACTIVATE_MFA' }
  | { readonly type: 'SUBMIT_LOGIN' }
  | { readonly type: 'CONFIRM_SECOND_FACTOR' }
  | { readonly type: 'SUCCESS_OVERLAY_COMPLETE' }
  | { readonly type: 'BROWSER_CLOSED' }
  | { readonly type: 'SELECT_TAB'; readonly tabId: S14BrowserTabId };

export const s14MfaIntroductionMachine = setup({
  types: {
    context: {} as S14MfaIntroductionContext,
    events: {} as S14MfaIntroductionEvent,
    input: {} as S14MfaIntroductionInput,
  },
  delays: {
    cleanDesktopDuration: ({ context }) => context.cleanDesktopDurationMs,
    combinationRevealDuration: ({ context }) =>
      context.combinationRevealDurationMs,
    loginAutofillDuration: ({ context }) => context.loginAutofillDurationMs,
    scanConfirmationDuration: ({ context }) => context.scanConfirmationDurationMs,
    scanRecognitionDuration: ({ context }) => context.scanRecognitionDurationMs,
    searchResultsDelay: ({ context }) => context.searchResultsDelayMs,
  },
  actors: {
    authenticatorTicker: fromCallback(
      ({
        input,
        sendBack,
      }: {
        input: { readonly tickMs: number };
        sendBack: (event: S14MfaIntroductionEvent) => void;
      }) => {
        const intervalId = window.setInterval(
          () => sendBack({ type: 'AUTHENTICATOR_TICK' }),
          input.tickMs,
        );
        return () => window.clearInterval(intervalId);
      },
    ),
  },
  guards: {
    selectedMasterCampus: ({ event }) =>
      event.type === 'SELECT_TAB' && event.tabId === 'master-campus',
    authenticatorCodeMatches: ({ context, event }) =>
      event.type === 'ENTER_AUTHENTICATOR_CODE' &&
      event.value.join('') === context.authenticatorCodes[context.authenticatorCodeIndex],
    authenticatorCountdownFinished: ({ context }) =>
      context.authenticatorSecondsRemaining === 0,
  },
  actions: {
    selectTab: assign({
      activeTabId: ({ context, event }) =>
        event.type === 'SELECT_TAB' ? event.tabId : context.activeTabId,
    }),
    selectMasterCampusTab: assign({ activeTabId: () => 'master-campus' as const }),
    setAuthenticatorCodeInput: assign({
      authenticatorCodeInput: ({ context, event }) =>
        event.type === 'ENTER_AUTHENTICATOR_CODE'
          ? event.value
          : context.authenticatorCodeInput,
    }),
    clearAuthenticatorCodeInput: assign({
      authenticatorCodeInput: () => Array.from({ length: 6 }, () => ''),
    }),
    decrementAuthenticatorCountdown: assign({
      authenticatorSecondsRemaining: ({ context }) =>
        Math.max(0, context.authenticatorSecondsRemaining - 1),
    }),
    refreshAuthenticatorCode: assign({
      authenticatorCodeIndex: ({ context }) =>
        (context.authenticatorCodeIndex + 1) % context.authenticatorCodes.length,
      authenticatorCodeInput: () => Array.from({ length: 6 }, () => ''),
      authenticatorSecondsRemaining: ({ context }) =>
        context.authenticatorCodeDurationSeconds,
    }),
  },
}).createMachine({
  id: 's14MfaIntroduction',
  initial: 'cleanDesktop',
  context: ({ input }) => ({
    ...input,
    activeTabId: 'mfa-search',
    authenticatorCodeIndex: 0,
    authenticatorCodeInput: Array.from({ length: 6 }, () => ''),
    authenticatorSecondsRemaining: input.authenticatorCodeDurationSeconds,
  }),
  on: {
    AUTHENTICATOR_TICK: [
      {
        guard: 'authenticatorCountdownFinished',
        actions: 'refreshAuthenticatorCode',
      },
      { actions: 'decrementAuthenticatorCountdown' },
    ],
  },
  states: {
    cleanDesktop: {
      after: { cleanDesktopDuration: { target: 'mfa' } },
    },
    mfa: {
      on: { NEXT: { target: 'twoFactor' } },
    },
    twoFactor: {
      on: { NEXT: { target: 'knowledge' } },
    },
    knowledge: {
      on: { NEXT: { target: 'possession' } },
    },
    possession: {
      on: { NEXT: { target: 'biometrics' } },
    },
    biometrics: {
      on: { NEXT: { target: 'firstCombination' } },
    },
    firstCombination: {
      after: { combinationRevealDuration: { target: 'secondCombination' } },
    },
    secondCombination: {
      after: { combinationRevealDuration: { target: 'thirdCombination' } },
    },
    thirdCombination: {
      after: { combinationRevealDuration: { target: 'distinctFactors' } },
    },
    distinctFactors: {
      on: { NEXT: { target: 'setupTransition' } },
    },
    setupTransition: {
      on: { TRANSITION_COMPLETE: { target: 'browserServiceVariation' } },
    },
    browserServiceVariation: {
      on: { NEXT: { target: 'browserSearchTask' } },
    },
    browserSearchTask: {
      on: { SUBMIT_SEARCH: { target: 'searchLoading' } },
    },
    searchLoading: {
      after: { searchResultsDelay: { target: 'searchResults' } },
    },
    searchResults: {
      on: { OPEN_HELP: { target: 'helpFound' } },
    },
    helpFound: {
      on: {
        SELECT_TAB: [
          {
            guard: 'selectedMasterCampus',
            target: 'freeNavigation',
            actions: 'selectTab',
          },
          { actions: 'selectTab' },
        ],
      },
    },
    freeNavigation: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: {},
        OPEN_SETTINGS: { target: 'settings' },
      },
    },
    settings: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: {},
        OPEN_SECURITY: { target: 'security' },
      },
    },
    security: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: { target: 'settings' },
        OPEN_TWO_FACTOR: { target: 'mfaSetupAwaitingScan' },
      },
    },
    mfaSetupAwaitingScan: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: { target: 'settings' },
        SCAN_QR_CODE: {
          target: 'mfaSetupRecognizing',
          actions: 'clearAuthenticatorCodeInput',
        },
      },
    },
    mfaSetupRecognizing: {
      after: { scanRecognitionDuration: { target: 'mfaSetupScanConfirmed' } },
      on: { SELECT_TAB: { actions: 'selectTab' } },
    },
    mfaSetupScanConfirmed: {
      after: { scanConfirmationDuration: { target: 'mfaSetupScanned' } },
      on: { SELECT_TAB: { actions: 'selectTab' } },
    },
    mfaSetupScanned: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: { target: 'settings' },
        ENTER_AUTHENTICATOR_CODE: [
          {
            guard: 'authenticatorCodeMatches',
            target: 'mfaSetupCodeEntered',
            actions: 'setAuthenticatorCodeInput',
          },
          { actions: 'setAuthenticatorCodeInput' },
        ],
      },
    },
    mfaSetupCodeEntered: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      on: {
        AUTHENTICATOR_TICK: [
          {
            guard: 'authenticatorCountdownFinished',
            target: 'mfaSetupScanned',
            actions: 'refreshAuthenticatorCode',
          },
          { actions: 'decrementAuthenticatorCountdown' },
        ],
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: { target: 'settings' },
        ENTER_AUTHENTICATOR_CODE: [
          {
            guard: 'authenticatorCodeMatches',
            actions: 'setAuthenticatorCodeInput',
          },
          {
            target: 'mfaSetupScanned',
            actions: 'setAuthenticatorCodeInput',
          },
        ],
        ACTIVATE_MFA: { target: 'mfaActivated' },
      },
    },
    mfaActivated: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        NEXT: {
          target: 'loginAutofilling',
          actions: ['selectMasterCampusTab', 'refreshAuthenticatorCode'],
        },
      },
    },
    loginAutofilling: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      after: { loginAutofillDuration: { target: 'loginReady' } },
      on: { SELECT_TAB: { actions: 'selectTab' } },
    },
    loginReady: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        SUBMIT_LOGIN: {
          target: 'secondFactor',
          actions: 'clearAuthenticatorCodeInput',
        },
      },
    },
    secondFactor: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        ENTER_AUTHENTICATOR_CODE: [
          {
            guard: 'authenticatorCodeMatches',
            target: 'secondFactorCodeEntered',
            actions: 'setAuthenticatorCodeInput',
          },
          { actions: 'setAuthenticatorCodeInput' },
        ],
      },
    },
    secondFactorCodeEntered: {
      invoke: {
        src: 'authenticatorTicker',
        input: ({ context }) => ({ tickMs: context.authenticatorCodeTickMs }),
      },
      on: {
        AUTHENTICATOR_TICK: [
          {
            guard: 'authenticatorCountdownFinished',
            target: 'secondFactor',
            actions: 'refreshAuthenticatorCode',
          },
          { actions: 'decrementAuthenticatorCountdown' },
        ],
        SELECT_TAB: { actions: 'selectTab' },
        ENTER_AUTHENTICATOR_CODE: [
          {
            guard: 'authenticatorCodeMatches',
            actions: 'setAuthenticatorCodeInput',
          },
          {
            target: 'secondFactor',
            actions: 'setAuthenticatorCodeInput',
          },
        ],
        CONFIRM_SECOND_FACTOR: { target: 'loginSuccess' },
      },
    },
    loginSuccess: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        SUCCESS_OVERLAY_COMPLETE: { target: 'signedIn' },
      },
    },
    signedIn: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        BROWSER_CLOSED: { target: 'complete' },
      },
    },
    complete: {
      type: 'final',
    },
  },
});
