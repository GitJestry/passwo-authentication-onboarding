import type {
  S01AccountId,
  S07OpenConnectionKind,
} from '@passwo/training-content';
import type { PasswordConsequenceScenePlan } from '@passwo/visualization';
import { assign, setup } from 'xstate';

export type S07RemainingAccountId = Exclude<S01AccountId, 'campusgram'>;

export interface S07OpenConnection {
  readonly accountId: S01AccountId;
  readonly kind: Exclude<S07OpenConnectionKind, 'none'>;
}

export interface S07AccountFeedback {
  readonly accountId: S07RemainingAccountId;
  readonly connections: readonly S07OpenConnection[];
  readonly easyToGuess: boolean;
  readonly recommendedForChange: boolean;
}

export function s07RecommendedResolutionAccountIds(
  feedback: readonly S07AccountFeedback[],
): readonly S07RemainingAccountId[] {
  return feedback
    .filter(({ recommendedForChange }) => recommendedForChange)
    .map(({ accountId }) => accountId);
}

export function deriveS07AccountFeedback(
  plan: Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'>,
): readonly S07AccountFeedback[] {
  const remainingAccountIds = ['master-campus', 'campus-email'] as const;
  const isEasyToGuess = (accountId: S07RemainingAccountId): boolean =>
    plan.accounts.find((account) => account.accountId === accountId)?.disposition.kind ===
    'whole-password-recognized';
  const recognizedConnectionKind = (
    firstAccountId: S01AccountId,
    secondAccountId: S01AccountId,
  ): Exclude<S07OpenConnectionKind, 'none'> | null => {
    const relations = plan.comparisons
      .filter(
        ({ sourceAccountId, targetAccountId }) =>
        ((sourceAccountId === firstAccountId && targetAccountId === secondAccountId) ||
          (sourceAccountId === secondAccountId && targetAccountId === firstAccountId)),
      )
      .map(({ result }) => result.relation.kind);
    if (relations.includes('exact-match')) return 'identical';
    if (relations.includes('derived-variant-match')) return 'similar';
    return null;
  };
  const hasRecognizedConnection = (
    firstAccountId: S01AccountId,
    secondAccountId: S01AccountId,
  ): boolean => recognizedConnectionKind(firstAccountId, secondAccountId) !== null;

  const recommendedChanges = new Set<S07RemainingAccountId>(
    remainingAccountIds.filter((accountId) => isEasyToGuess(accountId)),
  );
  for (const accountId of remainingAccountIds) {
    if (hasRecognizedConnection(accountId, 'campusgram')) recommendedChanges.add(accountId);
  }

  if (
    hasRecognizedConnection('master-campus', 'campus-email') &&
    !remainingAccountIds.some((accountId) => recommendedChanges.has(accountId))
  ) {
    recommendedChanges.add('master-campus');
  }

  return remainingAccountIds.flatMap((accountId): readonly S07AccountFeedback[] => {
    const otherAccountId =
      accountId === 'master-campus' ? 'campus-email' : 'master-campus';
    const connections = (['campusgram', otherAccountId] as const).flatMap(
      (connectionAccountId): readonly S07OpenConnection[] => {
        const kind = recognizedConnectionKind(accountId, connectionAccountId);
        return kind === null ? [] : [{ accountId: connectionAccountId, kind }];
      },
    );
    const easyToGuess = isEasyToGuess(accountId);
    if (!easyToGuess && connections.length === 0) return [];
    return [
      {
        accountId,
        connections,
        easyToGuess,
        recommendedForChange: recommendedChanges.has(accountId),
      },
    ];
  });
}

interface S07PassphraseSearchInput {
  readonly generationDelayMs: number;
  readonly hasRemainingAccountRisk: boolean;
  readonly passphraseOrder: readonly number[];
  readonly resultsDelayMs: number;
}

export interface S07PassphraseSearchContext {
  readonly copiedPassword: string | null;
  readonly currentPassphraseIndex: number | null;
  readonly generatedCount: number;
  readonly generationDelayMs: number;
  readonly hasRemainingAccountRisk: boolean;
  readonly passphraseOrder: readonly number[];
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
    hasRemainingAccountRisk: ({ context }) => context.hasRemainingAccountRisk,
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
    hasRemainingAccountRisk: input.hasRemainingAccountRisk,
    passphraseOrder: input.passphraseOrder,
    resultsDelayMs: input.resultsDelayMs,
    separator: '-',
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
      always: { target: 'remainingRisk' },
    },
    remainingRisk: {
      on: {
        NEXT: [
          { guard: 'hasRemainingAccountRisk', target: 'remainingPlan' },
          { target: 'complete' },
        ],
      },
    },
    remainingPlan: {
      on: { CONTINUE_ATTACK: { target: 'complete' } },
    },
    complete: { type: 'final' },
  },
});
