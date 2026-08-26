import type {
  S06AccountId,
  S06PairComparison,
} from '@passwo/contracts';
import type {
  PasswordConsequenceScenePlan,
  S06LocalAccountAnalysis,
} from '@passwo/visualization';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
  deriveS07AccountFeedback,
  s07RecommendedResolutionAccountIds,
  s07PassphraseSearchMachine,
} from './S07PassphraseSearchMachine.js';

type RemainingAccountId = Exclude<S06AccountId, 'campusgram'>;

const remainingAccountIds = ['master-campus', 'campus-email'] as const;

function account(
  accountId: RemainingAccountId,
  easyToGuess: boolean,
): S06LocalAccountAnalysis {
  return {
    accountId,
    fictionalPassword: `fiktiv-${accountId}`,
    retrievalStatus: 'retrievable',
    disposition: easyToGuess
      ? {
          kind: 'whole-password-recognized',
          lengthOrientation: 'below-15',
          analysisVersion: 's07-routing-test',
          ruleId: 'whole-password-recognized-value',
          findingIds: ['test-finding'],
          explanationId: 's05.disposition.whole-password-recognized-value',
        }
      : {
          kind: 'no-whole-password-recognized',
          lengthOrientation: 'at-least-15',
          analysisVersion: 's07-routing-test',
          explanationId: 's05.disposition.no-whole-password-recognized',
        },
  };
}

function comparison(
  sourceAccountId: S06AccountId,
  targetAccountId: S06AccountId,
): S06PairComparison {
  return {
    sourceAccountId,
    targetAccountId,
    result: {
      kind: 'fictional-password-comparison',
      relation: {
        kind: 'exact-match',
        relationId: `test:${sourceAccountId}:${targetAccountId}`,
        sourceEvidence: [],
        targetEvidence: [],
        explanationId: 's06.relation.exact-match',
      },
      disclaimerId: 'simulation-not-production-strength',
    },
  };
}

function routingPlan({
  connections = [],
  easyToGuess = [],
}: {
  readonly connections?: readonly (readonly [S06AccountId, S06AccountId])[];
  readonly easyToGuess?: readonly RemainingAccountId[];
}): Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'> {
  return {
    accounts: remainingAccountIds.map((accountId) =>
      account(accountId, easyToGuess.includes(accountId)),
    ),
    comparisons: connections.map(([sourceAccountId, targetAccountId]) =>
      comparison(sourceAccountId, targetAccountId),
    ),
  };
}

function recommendedAccounts(
  plan: Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'>,
): readonly RemainingAccountId[] {
  return s07RecommendedResolutionAccountIds(deriveS07AccountFeedback(plan));
}

async function reachCampusgramSuccess(hasRemainingAccountRisk: boolean) {
  const actor = createActor(s07PassphraseSearchMachine, {
    input: {
      generationDelayMs: 0,
      hasRemainingAccountRisk,
      passphraseOrder: [0],
      resultsDelayMs: 0,
    },
  });
  actor.start();
  actor.send({ type: 'OPEN_CAMPUSGRAM_CHANGE' });
  actor.send({ type: 'NEXT' });
  actor.send({ type: 'OPEN_SEARCH_TAB' });
  actor.send({ type: 'SUBMIT_SEARCH' });
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  actor.send({ type: 'OPEN_GENERATOR' });
  actor.send({ type: 'GENERATE' });
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  actor.send({ type: 'NEXT' });
  actor.send({ type: 'COPY', passphrase: 'fiktive-passphrase' });
  actor.send({ type: 'SELECT_TAB', tabId: 'campusgram' });
  actor.send({ type: 'PASTE_NEW' });
  actor.send({ type: 'PASTE_CONFIRM' });
  actor.send({ type: 'SUBMIT_PASSWORD_CHANGE' });
  return actor;
}

describe('S07 password change routing', () => {
  it('recommends every non-Campusgram account connected to Campusgram', () => {
    const plan = routingPlan({
      connections: [
        ['campusgram', 'master-campus'],
        ['campusgram', 'campus-email'],
      ],
    });

    expect(recommendedAccounts(plan)).toEqual(['master-campus', 'campus-email']);
  });

  it.each(remainingAccountIds)(
    'recommends local finding account %s without a connection',
    (accountId) => {
      const plan = routingPlan({ easyToGuess: [accountId] });

      expect(recommendedAccounts(plan)).toEqual([accountId]);
    },
  );

  it('defaults to Master Campus for the only relation between remaining accounts', () => {
    const plan = routingPlan({
      connections: [['master-campus', 'campus-email']],
    });

    expect(recommendedAccounts(plan)).toEqual(['master-campus']);
  });

  it('recommends the local finding account for a relation between remaining accounts', () => {
    const plan = routingPlan({
      connections: [['master-campus', 'campus-email']],
      easyToGuess: ['campus-email'],
    });

    expect(recommendedAccounts(plan)).toEqual(['campus-email']);
  });

  it('routes directly to the remaining plan when another account needs action', async () => {
    const actor = await reachCampusgramSuccess(true);

    actor.send({ type: 'NEXT' });

    expect(actor.getSnapshot().matches('remainingPlan')).toBe(true);
    actor.stop();
  });

  it('finishes from the positive completion feedback when nothing remains open', async () => {
    const actor = await reachCampusgramSuccess(false);

    actor.send({ type: 'NEXT' });

    expect(actor.getSnapshot().matches('nothingOpen')).toBe(true);
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().status).toBe('done');
    actor.stop();
  });
});
