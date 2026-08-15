import type {
  S06AccountId,
  S06PairComparison,
} from '@passwo/contracts';
import type {
  PasswordConsequenceScenePlan,
  S06LocalAccountAnalysis,
} from '@passwo/visualization';
import { describe, expect, it } from 'vitest';
import {
  deriveS07AccountFeedback,
  s07AccountsRequiringPassphraseChange,
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

function requiredAccounts(
  plan: Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'>,
): readonly RemainingAccountId[] {
  return s07AccountsRequiringPassphraseChange(deriveS07AccountFeedback(plan));
}

describe('S07 password change routing', () => {
  it('changes every non-Campusgram account connected to Campusgram', () => {
    const plan = routingPlan({
      connections: [
        ['campusgram', 'master-campus'],
        ['campusgram', 'campus-email'],
      ],
    });

    expect(requiredAccounts(plan)).toEqual(['master-campus', 'campus-email']);
  });

  it.each(remainingAccountIds)('changes weak account %s without a connection', (accountId) => {
    const plan = routingPlan({ easyToGuess: [accountId] });

    expect(requiredAccounts(plan)).toEqual([accountId]);
  });

  it('changes Master Campus for the only strong connection between remaining accounts', () => {
    const plan = routingPlan({
      connections: [['master-campus', 'campus-email']],
    });

    expect(requiredAccounts(plan)).toEqual(['master-campus']);
  });

  it('changes the already weak account for a connection between remaining accounts', () => {
    const plan = routingPlan({
      connections: [['master-campus', 'campus-email']],
      easyToGuess: ['campus-email'],
    });

    expect(requiredAccounts(plan)).toEqual(['campus-email']);
  });
});
