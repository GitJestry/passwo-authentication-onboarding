import { assign, setup } from 'xstate';

export type S14BrowserTabId = 'master-campus' | 'mfa-search';

interface S14MfaIntroductionContext {
  readonly activeTabId: S14BrowserTabId;
  readonly authenticatorCodeIndex: number;
  readonly authenticatorCodeCount: number;
  readonly authenticatorCodeRefreshMs: number;
  readonly cleanDesktopDurationMs: number;
  readonly combinationRevealDurationMs: number;
  readonly loginAutofillDurationMs: number;
  readonly searchResultsDelayMs: number;
}

type S14MfaIntroductionInput = Omit<
  S14MfaIntroductionContext,
  'activeTabId' | 'authenticatorCodeIndex'
>;

type S14MfaIntroductionEvent =
  | { readonly type: 'NEXT' }
  | { readonly type: 'SUBMIT_SEARCH' }
  | { readonly type: 'OPEN_HELP' }
  | { readonly type: 'OPEN_OVERVIEW' }
  | { readonly type: 'OPEN_SETTINGS' }
  | { readonly type: 'OPEN_SECURITY' }
  | { readonly type: 'OPEN_TWO_FACTOR' }
  | { readonly type: 'SCAN_QR_CODE' }
  | { readonly type: 'USE_AUTHENTICATOR_CODE' }
  | { readonly type: 'ACTIVATE_MFA' }
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
    authenticatorCodeRefresh: ({ context }) =>
      context.authenticatorCodeRefreshMs,
    searchResultsDelay: ({ context }) => context.searchResultsDelayMs,
  },
  guards: {
    selectedMasterCampus: ({ event }) =>
      event.type === 'SELECT_TAB' && event.tabId === 'master-campus',
  },
  actions: {
    selectTab: assign({
      activeTabId: ({ context, event }) =>
        event.type === 'SELECT_TAB' ? event.tabId : context.activeTabId,
    }),
    selectMasterCampusTab: assign({ activeTabId: () => 'master-campus' as const }),
    advanceAuthenticatorCode: assign({
      authenticatorCodeIndex: ({ context }) =>
        (context.authenticatorCodeIndex + 1) % context.authenticatorCodeCount,
    }),
  },
}).createMachine({
  id: 's14MfaIntroduction',
  initial: 'cleanDesktop',
  context: ({ input }) => ({
    ...input,
    activeTabId: 'mfa-search',
    authenticatorCodeIndex: 0,
  }),
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
      on: { NEXT: { target: 'browserServiceVariation' } },
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
        SCAN_QR_CODE: { target: 'mfaSetupScanned' },
      },
    },
    mfaSetupScanned: {
      after: {
        authenticatorCodeRefresh: {
          target: 'mfaSetupScanned',
          reenter: true,
          actions: 'advanceAuthenticatorCode',
        },
      },
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: { target: 'settings' },
        USE_AUTHENTICATOR_CODE: { target: 'mfaSetupCodeEntered' },
      },
    },
    mfaSetupCodeEntered: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        OPEN_OVERVIEW: { target: 'freeNavigation' },
        OPEN_SETTINGS: { target: 'settings' },
        ACTIVATE_MFA: { target: 'mfaActivated' },
      },
    },
    mfaActivated: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        NEXT: {
          target: 'loginAutofilling',
          actions: 'selectMasterCampusTab',
        },
      },
    },
    loginAutofilling: {
      after: { loginAutofillDuration: { target: 'secondFactor' } },
      on: { SELECT_TAB: { actions: 'selectTab' } },
    },
    secondFactor: {
      after: {
        authenticatorCodeRefresh: {
          target: 'secondFactor',
          reenter: true,
          actions: 'advanceAuthenticatorCode',
        },
      },
      on: {
        SELECT_TAB: { actions: 'selectTab' },
        USE_AUTHENTICATOR_CODE: { target: 'secondFactorCodeEntered' },
      },
    },
    secondFactorCodeEntered: {
      on: {
        SELECT_TAB: { actions: 'selectTab' },
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
