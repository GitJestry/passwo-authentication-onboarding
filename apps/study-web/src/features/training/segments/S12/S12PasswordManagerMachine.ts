import { setup } from 'xstate';

interface S12PasswordManagerContext {
  readonly vaultOpeningDurationMs: number;
  readonly generationDurationMs: number;
  readonly storageDurationMs: number;
  readonly autofillDurationMs: number;
  readonly variantsTransitionDurationMs: number;
  readonly variantsRevealDurationMs: number;
}

type S12PasswordManagerEvent = { readonly type: 'NEXT' };

export const s12PasswordManagerMachine = setup({
  types: {
    context: {} as S12PasswordManagerContext,
    events: {} as S12PasswordManagerEvent,
    input: {} as S12PasswordManagerContext,
  },
  delays: {
    vaultOpeningDuration: ({ context }) => context.vaultOpeningDurationMs,
    generationDuration: ({ context }) => context.generationDurationMs,
    storageDuration: ({ context }) => context.storageDurationMs,
    autofillDuration: ({ context }) => context.autofillDurationMs,
    variantsTransitionDuration: ({ context }) => context.variantsTransitionDurationMs,
    variantsRevealDuration: ({ context }) => context.variantsRevealDurationMs,
  },
}).createMachine({
  id: 's12PasswordManager',
  initial: 'vaultOpening',
  context: ({ input }) => input,
  states: {
    vaultOpening: {
      after: { vaultOpeningDuration: { target: 'intro' } },
    },
    intro: {
      on: { NEXT: { target: 'generating' } },
    },
    generating: {
      after: { generationDuration: { target: 'generated' } },
    },
    generated: {
      on: { NEXT: { target: 'storing' } },
    },
    storing: {
      after: { storageDuration: { target: 'stored' } },
    },
    stored: {
      on: { NEXT: { target: 'filling' } },
    },
    filling: {
      after: { autofillDuration: { target: 'filled' } },
    },
    filled: {
      on: { NEXT: { target: 'access' } },
    },
    access: {
      on: { NEXT: { target: 'variantsTransition' } },
    },
    variantsTransition: {
      after: { variantsTransitionDuration: { target: 'variantsReveal' } },
    },
    variantsReveal: {
      after: { variantsRevealDuration: { target: 'variants' } },
    },
    variants: {
      on: { NEXT: { target: 'separate' } },
    },
    separate: {
      on: { NEXT: { target: 'integrated' } },
    },
    integrated: {
      on: { NEXT: { target: 'practice' } },
    },
    practice: {},
  },
});
