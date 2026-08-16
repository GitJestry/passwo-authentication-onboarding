import type {
  PasswordComparisonResult,
  PasswordRelationKind,
  S06AccountId,
  S06PairComparison,
} from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import {
  projectPasswordConsequenceScenePlan,
  type S06LocalAccountAnalysis,
} from './password-consequence-scene.js';

const accountDefinitions = [
  {
    accountId: 'campusgram',
    label: 'Campusgram',
    detailKind: 'content',
    details: [],
  },
  {
    accountId: 'master-campus',
    label: 'Master Campus',
    detailKind: 'service',
    details: [],
  },
  {
    accountId: 'campus-email',
    label: 'Campus E-Mail',
    detailKind: 'function',
    details: [],
  },
] as const;

const accountIds = [
  'campusgram',
  'master-campus',
  'campus-email',
] as const satisfies readonly S06AccountId[];

const accounts: readonly S06LocalAccountAnalysis[] = accountIds.map(
  (accountId) =>
    ({
      accountId,
      fictionalPassword: `fixture-${accountId}`,
      disposition: {
        kind: 'no-whole-password-recognized',
        lengthOrientation: 'at-least-15',
        analysisVersion: 'passwo-bounded-whole-recognition-v11',
        explanationId: 's05.disposition.no-whole-password-recognized',
      },
      retrievalStatus: 'retrievable',
    }) as const satisfies S06LocalAccountAnalysis,
);

function comparison(kind: PasswordRelationKind): PasswordComparisonResult {
  if (kind === 'derived-variant-match') {
    return {
      kind: 'fictional-password-comparison',
      relation: {
        kind,
        relationId: 'relation:bounded-year-changed:fixture',
        transformationId: 'bounded-year-changed',
        sourceEvidence: [],
        targetEvidence: [],
        candidate: 'fixture-candidate',
        explanationId: 's06.relation.bounded-year-changed',
      },
      disclaimerId: 'simulation-not-production-strength',
    };
  }
  return {
    kind: 'fictional-password-comparison',
    relation: {
      kind: 'no-derived-path-recognized',
      relationId: 'relation:no-derived-path-recognized',
      sourceEvidence: [],
      targetEvidence: [],
      explanationId: 's06.relation.no-derived-path-recognized',
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

describe('password consequence scene projection', () => {
  it('does not mark a hypothetical derived-variant hit as actually affected', () => {
    const comparisons: readonly S06PairComparison[] = [
      {
        sourceAccountId: 'campusgram',
        targetAccountId: 'master-campus',
        result: comparison('derived-variant-match'),
      },
      {
        sourceAccountId: 'campusgram',
        targetAccountId: 'campus-email',
        result: comparison('no-derived-path-recognized'),
      },
      {
        sourceAccountId: 'master-campus',
        targetAccountId: 'campusgram',
        result: comparison('no-derived-path-recognized'),
      },
      {
        sourceAccountId: 'master-campus',
        targetAccountId: 'campus-email',
        result: comparison('no-derived-path-recognized'),
      },
      {
        sourceAccountId: 'campus-email',
        targetAccountId: 'master-campus',
        result: comparison('no-derived-path-recognized'),
      },
      {
        sourceAccountId: 'campus-email',
        targetAccountId: 'campusgram',
        result: comparison('no-derived-path-recognized'),
      },
    ];
    const plan = projectPasswordConsequenceScenePlan({
      id: 'hypothetical-derived-variant',
      incidentSource: 'campusgram',
      accounts,
      comparisons,
      accountDefinitions,
    });
    const comparisonStep = plan.steps.find(({ id }) => id === 's06-step-campusgram-master-campus');
    const reverseComparisonStep = plan.steps.find(
      ({ id }) => id === 's06-step-master-campus-campusgram',
    );
    const emailComparisonSteps = plan.steps.filter(
      ({ sourceAccountId, targetAccountId }) =>
        sourceAccountId === 'campus-email' && targetAccountId !== null,
    );
    const summaryStep = plan.steps.find(({ id }) => id === 's06-step-summary');

    expect(comparisonStep?.network.nodes).toContainEqual(
      expect.objectContaining({ id: 'master-campus', status: 'hypothetical' }),
    );
    expect(summaryStep?.network.nodes).toContainEqual(
      expect.objectContaining({ id: 'master-campus', status: 'protected' }),
    );
    expect(reverseComparisonStep).toEqual(
      expect.objectContaining({
        sourceAccountId: 'master-campus',
        targetAccountId: 'campusgram',
      }),
    );
    expect(emailComparisonSteps).toHaveLength(2);
    expect(plan.resolvedResult.paths).toContainEqual(
      expect.objectContaining({
        sourceAccountId: 'campusgram',
        targetAccountId: 'master-campus',
        relationKind: 'derived-variant-match',
        mode: 'hypothetical',
        targetReached: false,
      }),
    );
    expect(plan.resolvedResult.affectedAccountIds).not.toContain('master-campus');
  });
});
