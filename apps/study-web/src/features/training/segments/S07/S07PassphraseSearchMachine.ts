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
  readonly changedAccountIds: readonly S01AccountId[];
  readonly copiedPassword: string | null;
  readonly currentPassphraseIndex: number | null;
  readonly generatedCount: number;
  readonly generationDelayMs: number;
  readonly passphraseOrder: readonly number[];
  readonly pendingAccountIds: readonly S07RemainingAccountId[];
  readonly resultsDelayMs: number;
  readonly separator: string;
  readonly targetAccountId: S01AccountId;
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
  | { readonly type: 'OPEN_OTHER_PASSWORD_CHANGE' }
  | { readonly type: 'PASTE_NEW' }
  | { readonly type: 'PASTE_CONFIRM' }
  | { readonly type: 'SUBMIT_PASSWORD_CHANGE' }
  | { readonly type: 'START_S08' };

function canGenerateAnother(context: S07PassphraseSearchContext): boolean {
  const reservedOutputs =
    context.targetAccountId === 'campusgram'
      ? context.pendingAccountIds.length
      : Math.max(0, context.pendingAccountIds.length - 1);
  return context.generatedCount < context.passphraseOrder.length - reservedOutputs;
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
    copiedForCampusgram: ({ context }) => context.targetAccountId === 'campusgram',
    firstCampusgramGeneration: ({ context }) =>
      context.targetAccountId === 'campusgram' && context.generatedCount === 1,
    hasPendingAccounts: ({ context }) => context.pendingAccountIds.length > 0,
    selectedCampusgram: ({ event }) =>
      event.type === 'SELECT_TAB' && event.tabId === 'campusgram',
    selectedGenerator: ({ event }) =>
      event.type === 'SELECT_TAB' && event.tabId === 'passphrase-search',
    selectedTargetAccount: ({ context, event }) =>
      event.type === 'SELECT_TAB' && event.tabId === context.targetAccountId,
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
    markCampusgramChanged: assign({
      changedAccountIds: ({ context }) => [...context.changedAccountIds, 'campusgram'],
    }),
    markTargetChanged: assign({
      changedAccountIds: ({ context }) => [
        ...context.changedAccountIds,
        context.targetAccountId,
      ],
      pendingAccountIds: ({ context }) => context.pendingAccountIds.slice(1),
      targetAccountId: ({ context }) => context.pendingAccountIds[1] ?? context.targetAccountId,
    }),
    selectFirstPendingAccount: assign({
      targetAccountId: ({ context }) => context.pendingAccountIds[0] ?? 'campusgram',
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
    changedAccountIds: [],
    copiedPassword: null,
    currentPassphraseIndex: null,
    generatedCount: 0,
    generationDelayMs: input.generationDelayMs,
    passphraseOrder: input.passphraseOrder,
    pendingAccountIds: [...input.remainingAccountIds],
    resultsDelayMs: input.resultsDelayMs,
    separator: '-',
    targetAccountId: 'campusgram',
  }),
  states: {
    incident: {
      on: { OPEN_CAMPUSGRAM_CHANGE: { target: 'campusgramMethodIntro' } },
    },
    campusgramMethodIntro: {
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
      on: { OPEN_GENERATOR: { target: 'generatorExplanationOne' } },
    },
    generatorExplanationOne: {
      on: { NEXT: { target: 'generatorExplanationTwo' } },
    },
    generatorExplanationTwo: {
      on: { NEXT: { target: 'generatorExplanationThree' } },
    },
    generatorExplanationThree: {
      on: { NEXT: { target: 'generatorReady' } },
    },
    generatorReady: {
      on: {
        CHANGE_SEPARATOR: { actions: 'changeSeparator' },
        GENERATE: { guard: 'canGenerateAnother', target: 'generating' },
      },
    },
    generatorAccountReady: {
      on: {
        CHANGE_SEPARATOR: { actions: 'changeSeparator' },
        GENERATE: { guard: 'canGenerateAnother', target: 'generating' },
      },
    },
    generating: {
      after: {
        generationDelay: { target: 'generatedRouting', actions: 'finishGeneration' },
      },
    },
    generatedRouting: {
      always: [
        { guard: 'firstCampusgramGeneration', target: 'mnemonicExplanationOne' },
        { target: 'mnemonic' },
      ],
    },
    mnemonicExplanationOne: {
      on: { NEXT: { target: 'mnemonicExplanationTwo' } },
    },
    mnemonicExplanationTwo: {
      on: { NEXT: { target: 'mnemonic' } },
    },
    mnemonic: {
      on: {
        CHANGE_SEPARATOR: { actions: 'changeSeparator' },
        GENERATE: { guard: 'canGenerateAnother', target: 'generating' },
        COPY: [
          {
            guard: 'copiedForCampusgram',
            target: 'copiedCampusgram',
            actions: 'storeCopiedPassword',
          },
          { target: 'copiedOtherAccount', actions: 'storeCopiedPassword' },
        ],
      },
    },
    copiedCampusgram: {
      on: {
        SELECT_TAB: { guard: 'selectedCampusgram', target: 'pasteNewPassword' },
      },
    },
    copiedOtherAccount: {
      on: {
        SELECT_TAB: { guard: 'selectedTargetAccount', target: 'pasteNewPassword' },
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
        SUBMIT_PASSWORD_CHANGE: [
          {
            guard: 'copiedForCampusgram',
            target: 'campusgramSuccess',
            actions: 'markCampusgramChanged',
          },
          { target: 'otherAccountChanged', actions: 'markTargetChanged' },
        ],
      },
    },
    campusgramSuccess: {
      on: { NEXT: { target: 'postCampusgramRouting' } },
    },
    postCampusgramRouting: {
      always: [
        { guard: 'hasPendingAccounts', target: 'remainingRisk' },
        { target: 'allUnique' },
      ],
    },
    allUnique: {
      on: { NEXT: { target: 'readyForReplay' } },
    },
    remainingRisk: {
      on: { NEXT: { target: 'remainingPlan' } },
    },
    remainingPlan: {
      on: {
        NEXT: { target: 'accountTabReady', actions: 'selectFirstPendingAccount' },
      },
    },
    accountTabReady: {
      on: {
        SELECT_TAB: { guard: 'selectedTargetAccount', target: 'accountDashboard' },
      },
    },
    accountDashboard: {
      on: { OPEN_OTHER_PASSWORD_CHANGE: { target: 'accountPasswordChangeOpen' } },
    },
    accountPasswordChangeOpen: {
      on: {
        SELECT_TAB: { guard: 'selectedGenerator', target: 'generatorAccountReady' },
      },
    },
    otherAccountChanged: {
      always: [
        { guard: 'hasPendingAccounts', target: 'accountTabReady' },
        { target: 'readyForReplay' },
      ],
    },
    readyForReplay: {
      on: { START_S08: { target: 'complete' } },
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
