import type { S01AccountId } from '@passwo/training-content';
import type { PasswordConsequenceScenePlan } from '@passwo/visualization';
import { assign, setup } from 'xstate';

export type S07RemainingAccountId = Exclude<S01AccountId, 'campusgram'>;

export type S07AccountFeedbackKind =
  | 'strong-similar'
  | 'unique-guessable'
  | 'similar-guessable';

export interface S07AccountFeedback {
  readonly accountId: S07RemainingAccountId;
  readonly connectionAccountIds: readonly S01AccountId[];
  readonly kind: S07AccountFeedbackKind;
  readonly requiresPassphraseChange: boolean;
}

export function s07AccountsRequiringPassphraseChange(
  feedback: readonly S07AccountFeedback[],
): readonly S07RemainingAccountId[] {
  return feedback
    .filter(({ requiresPassphraseChange }) => requiresPassphraseChange)
    .map(({ accountId }) => accountId);
}

export function deriveS07AccountFeedback(
  plan: Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'>,
): readonly S07AccountFeedback[] {
  const remainingAccountIds = ['master-campus', 'campus-email'] as const;
  const isEasyToGuess = (accountId: S07RemainingAccountId): boolean =>
    plan.accounts.find((account) => account.accountId === accountId)?.disposition.kind ===
    'whole-password-recognized';
  const hasRecognizedConnection = (
    firstAccountId: S01AccountId,
    secondAccountId: S01AccountId,
  ): boolean =>
    plan.comparisons.some(
      ({ sourceAccountId, targetAccountId, result }) =>
        ((sourceAccountId === firstAccountId && targetAccountId === secondAccountId) ||
          (sourceAccountId === secondAccountId && targetAccountId === firstAccountId)) &&
        result.relation.kind !== 'no-derived-path-recognized',
    );

  const requiredChanges = new Set<S07RemainingAccountId>(
    remainingAccountIds.filter((accountId) => isEasyToGuess(accountId)),
  );
  for (const accountId of remainingAccountIds) {
    if (hasRecognizedConnection(accountId, 'campusgram')) requiredChanges.add(accountId);
  }

  if (
    hasRecognizedConnection('master-campus', 'campus-email') &&
    !remainingAccountIds.some((accountId) => requiredChanges.has(accountId))
  ) {
    requiredChanges.add('master-campus');
  }

  return remainingAccountIds.flatMap((accountId): readonly S07AccountFeedback[] => {
    const otherAccountId =
      accountId === 'master-campus' ? 'campus-email' : 'master-campus';
    const connectionAccountIds = (['campusgram', otherAccountId] as const).filter(
      (connectionAccountId) => hasRecognizedConnection(accountId, connectionAccountId),
    );
    const easyToGuess = isEasyToGuess(accountId);
    if (!easyToGuess && connectionAccountIds.length === 0) return [];
    return [
      {
        accountId,
        connectionAccountIds,
        kind:
          connectionAccountIds.length === 0
            ? 'unique-guessable'
            : easyToGuess
              ? 'similar-guessable'
              : 'strong-similar',
        requiresPassphraseChange: requiredChanges.has(accountId),
      },
    ];
  });
}

interface S07PassphraseSearchInput {
  readonly generationDelayMs: number;
  readonly passphraseOrder: readonly number[];
  readonly accountFeedback: readonly S07AccountFeedback[];
  readonly resultsDelayMs: number;
}

export interface S07PassphraseSearchContext {
  readonly copiedPassword: string | null;
  readonly currentPassphraseIndex: number | null;
  readonly generatedCount: number;
  readonly generationDelayMs: number;
  readonly passphraseOrder: readonly number[];
  readonly accountFeedback: readonly S07AccountFeedback[];
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
  | { readonly type: 'CONTINUE_ATTACK' };

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
    hasPendingAccounts: ({ context }) => context.accountFeedback.length > 0,
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
    accountFeedback: [...input.accountFeedback],
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
        { target: 'remainingPlan' },
      ],
    },
    remainingRisk: {
      on: { NEXT: { target: 'remainingPlan' } },
    },
    remainingPlan: {
      on: { CONTINUE_ATTACK: { target: 'complete' } },
    },
    complete: { type: 'final' },
  },
});
