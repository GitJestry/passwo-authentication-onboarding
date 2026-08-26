import { assign, setup } from 'xstate';

export type S14BrowserTabId = 'master-campus' | 'mfa-search';

interface S14MfaIntroductionContext {
  readonly activeTabId: S14BrowserTabId;
  readonly cleanDesktopDurationMs: number;
  readonly combinationRevealDurationMs: number;
  readonly searchResultsDelayMs: number;
}

type S14MfaIntroductionInput = Omit<
  S14MfaIntroductionContext,
  'activeTabId'
>;

type S14MfaIntroductionEvent =
  | { readonly type: 'NEXT' }
  | { readonly type: 'SUBMIT_SEARCH' }
  | { readonly type: 'OPEN_HELP' }
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
  },
}).createMachine({
  id: 's14MfaIntroduction',
  initial: 'cleanDesktop',
  context: ({ input }) => ({
    ...input,
    activeTabId: 'mfa-search',
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
      on: { SELECT_TAB: { actions: 'selectTab' } },
    },
  },
});
