import { setup } from 'xstate';

interface S14MfaIntroductionContext {
  readonly cleanDesktopDurationMs: number;
  readonly combinationRevealDurationMs: number;
}

type S14MfaIntroductionEvent = { readonly type: 'NEXT' };

export const s14MfaIntroductionMachine = setup({
  types: {
    context: {} as S14MfaIntroductionContext,
    events: {} as S14MfaIntroductionEvent,
    input: {} as S14MfaIntroductionContext,
  },
  delays: {
    cleanDesktopDuration: ({ context }) => context.cleanDesktopDurationMs,
    combinationRevealDuration: ({ context }) =>
      context.combinationRevealDurationMs,
  },
}).createMachine({
  id: 's14MfaIntroduction',
  initial: 'cleanDesktop',
  context: ({ input }) => input,
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
      on: { NEXT: { target: 'browser' } },
    },
    browser: {},
  },
});
