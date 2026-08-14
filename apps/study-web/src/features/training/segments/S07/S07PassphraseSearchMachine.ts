import type { S01AccountId } from '@passwo/training-content';
import { assign, setup } from 'xstate';

export type S07RemainingAccountId = Exclude<S01AccountId, 'campusgram'>;

interface S07PassphraseSearchInput {
  readonly generationDelayMs: number;
  readonly passphraseOrder: readonly number[];
  readonly remainingAccountIds: readonly S07RemainingAccountId[];
  readonly resultsDelayMs: number;
}

export interface S07PassphraseSearchContext {
  readonly copiedPassword: string | null;
  readonly currentPassphraseIndex: number | null;
  readonly generatedCount: number;
  readonly generationDelayMs: number;
  readonly passphraseOrder: readonly number[];
  readonly pendingAccountIds: readonly S07RemainingAccountId[];
  readonly resultsDelayMs: number;
  readonly separator: string;
}

type S07PassphraseSearchEvent =
  | { readonly type: 'OPEN_CAMPUSGRAM_CHANGE' }
  | { readonly type: 'NEXT' }
  | { readonly type: 'OPEN_SEARCH_TAB' }
  | { readonly type: 'SUBMIT_SEARCH' }
  | { readonly type: 'OPEN_GENERATOR' }
  | { readonly type: 'GENERATE' }
  | { readonly type: 'CHANGE_SEPARATOR'; readonly separator: string }
  | { readonly type: 'COPY'; readonly passphrase: string }
  | { readonly type: 'SELECT_TAB'; readonly tabId: string }
  | { readonly type: 'PASTE_NEW' }
  | { readonly type: 'PASTE_CONFIRM' }
  | { readonly type: 'SUBMIT_PASSWORD_CHANGE' }
  | { readonly type: 'CLOSE_BROWSER' }
  | { readonly type: 'WINDOW_CLOSED' };

function canGenerateAnother(context: S07PassphraseSearchContext): boolean {
  return context.generatedCount < context.passphraseOrder.length;
}

export const s07PassphraseSearchMachine = setup({
  types: {
    context: {} as S07PassphraseSearchContext,
    events: {} as S07PassphraseSearchEvent,
    input: {} as S07PassphraseSearchInput,
  },
  delays: {
    generationDelay: ({ context }) => context.generationDelayMs,
    resultsDelay: ({ context }) => context.resultsDelayMs,
  },
  guards: {
    canGenerateAnother: ({ context }) => canGenerateAnother(context),
    hasPendingAccounts: ({ context }) => context.pendingAccountIds.length > 0,
    selectedCampusgram: ({ event }) =>
      event.type === 'SELECT_TAB' && event.tabId === 'campusgram',
  },
  actions: {
    changeSeparator: assign({
      separator: ({ context, event }) =>
        event.type === 'CHANGE_SEPARATOR' ? event.separator : context.separator,
    }),
    clearCopiedPassword: assign({ copiedPassword: () => null }),
    finishGeneration: assign({
      currentPassphraseIndex: ({ context }) =>
        context.passphraseOrder[context.generatedCount] ?? null,
      generatedCount: ({ context }) => context.generatedCount + 1,
      copiedPassword: () => null,
    }),
    storeCopiedPassword: assign({
      copiedPassword: ({ context, event }) =>
        event.type === 'COPY' && context.currentPassphraseIndex !== null
          ? event.passphrase
          : context.copiedPassword,
    }),
  },
}).createMachine({
  id: 's07PassphraseSearch',
  initial: 'incident',
  context: ({ input }) => ({
    copiedPassword: null,
    currentPassphraseIndex: null,
    generatedCount: 0,
    generationDelayMs: input.generationDelayMs,
    passphraseOrder: input.passphraseOrder,
    pendingAccountIds: [...input.remainingAccountIds],
    resultsDelayMs: input.resultsDelayMs,
    separator: '-',
  }),
  states: {
    incident: {
      on: { OPEN_CAMPUSGRAM_CHANGE: { target: 'campusgramMethodIntro' } },
    },
    campusgramMethodIntro: {
      on: { NEXT: { target: 'campusgramRandomnessIntro' } },
    },
    campusgramRandomnessIntro: {
      on: { NEXT: { target: 'campusgramSearchIntro' } },
    },
    campusgramSearchIntro: {
      on: { OPEN_SEARCH_TAB: { target: 'searchLanding' } },
    },
    searchLanding: {
      on: { SUBMIT_SEARCH: { target: 'searchLoading' } },
    },
    searchLoading: {
      after: { resultsDelay: { target: 'searchResults' } },
    },
    searchResults: {
      on: { OPEN_GENERATOR: { target: 'generatorReady' } },
    },
    generatorReady: {
      on: {
        CHANGE_SEPARATOR: { actions: 'changeSeparator' },
        GENERATE: { guard: 'canGenerateAnother', target: 'generating' },
      },
    },
    generating: {
      after: {
        generationDelay: { target: 'mnemonicIntro', actions: 'finishGeneration' },
      },
    },
    mnemonicIntro: {
      on: { NEXT: { target: 'mnemonic' } },
    },
    mnemonic: {
      on: {
        CHANGE_SEPARATOR: { actions: 'changeSeparator' },
        GENERATE: { guard: 'canGenerateAnother', target: 'regenerating' },
        COPY: { target: 'copiedCampusgram', actions: 'storeCopiedPassword' },
      },
    },
    regenerating: {
      after: {
        generationDelay: { target: 'mnemonic', actions: 'finishGeneration' },
      },
    },
    copiedCampusgram: {
      on: {
        SELECT_TAB: { guard: 'selectedCampusgram', target: 'pasteNewPassword' },
      },
    },
    pasteNewPassword: {
      on: { PASTE_NEW: { target: 'pasteConfirmedPassword' } },
    },
    pasteConfirmedPassword: {
      on: {
        PASTE_CONFIRM: { target: 'passwordChangeReady', actions: 'clearCopiedPassword' },
      },
    },
    passwordChangeReady: {
      on: {
        SUBMIT_PASSWORD_CHANGE: {
          target: 'campusgramSuccess',
        },
      },
    },
    campusgramSuccess: {
      on: { NEXT: { target: 'postCampusgramRouting' } },
    },
    postCampusgramRouting: {
      always: [
        { guard: 'hasPendingAccounts', target: 'remainingRisk' },
        { target: 'closingBrowser' },
      ],
    },
    remainingRisk: {
      on: { NEXT: { target: 'remainingPlan' } },
    },
    remainingPlan: {
      on: { CLOSE_BROWSER: { target: 'closingBrowser' } },
    },
    closingBrowser: {
      on: { WINDOW_CLOSED: { target: 'complete' } },
    },
    complete: { type: 'final' },
  },
});

export function shuffledPassphraseOrder(
  count: number,
  randomValue: () => number,
): readonly number[] {
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomValue() * (index + 1));
    const current = order[index];
    const swap = order[swapIndex];
    if (current === undefined || swap === undefined) continue;
    order[index] = swap;
    order[swapIndex] = current;
  }
  return order;
}
