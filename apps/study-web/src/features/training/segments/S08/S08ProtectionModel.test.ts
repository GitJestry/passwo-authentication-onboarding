import type {
  LocalPasswordDisposition,
  S06AccountId,
  S06PairComparison,
} from '@passwo/contracts';
import type {
  NetworkSceneSnapshot,
  PasswordConsequenceScenePlan,
  SceneEdge,
  SceneNode,
  S06LocalAccountAnalysis,
} from '@passwo/visualization';
import { describe, expect, it } from 'vitest';
import {
  activeS08PasswordRelationships,
  createS08ProtectionRiskModelFromResumeState,
  createS08ProtectionNetwork,
  createS08ProtectionRiskModel,
  createSupportiveS08ResumeState,
  s08AccountHasOpenActionNeed,
  s08HasOpenActionNeed,
  type S08ProtectionRiskModel,
} from '../account-network.js';

function relationship(
  sourceId: S06AccountId,
  targetId: S06AccountId,
): SceneEdge {
  return {
    id: `relation:${sourceId}:${targetId}`,
    sourceId,
    targetId,
    kind: 'similar-pattern',
    status: 'similar',
    label: null,
  };
}

function riskModel({
  localFindingAccountIds = [],
  relationships = [],
}: Partial<S08ProtectionRiskModel> = {}): S08ProtectionRiskModel {
  return { localFindingAccountIds, relationships };
}

function disposition(easyToGuess: boolean): LocalPasswordDisposition {
  return easyToGuess
    ? {
        kind: 'whole-password-recognized',
        lengthOrientation: 'below-15',
        analysisVersion: 's08-risk-model-test',
        ruleId: 'whole-password-recognized-value',
        findingIds: ['test-finding'],
        explanationId: 's05.disposition.whole-password-recognized-value',
      }
    : {
        kind: 'no-whole-password-recognized',
        lengthOrientation: 'at-least-15',
        analysisVersion: 's08-risk-model-test',
        explanationId: 's05.disposition.no-whole-password-recognized',
      };
}

function account(
  accountId: S06AccountId,
  easyToGuess: boolean,
): S06LocalAccountAnalysis {
  return {
    accountId,
    fictionalPassword: `fiktiv-${accountId}`,
    disposition: disposition(easyToGuess),
    retrievalStatus: 'retrievable',
  };
}

function comparison(
  sourceAccountId: S06AccountId,
  targetAccountId: S06AccountId,
  relationKind: 'exact-match' | 'derived-variant-match',
): S06PairComparison {
  return {
    sourceAccountId,
    targetAccountId,
    result: {
      kind: 'fictional-password-comparison',
      relation:
        relationKind === 'exact-match'
          ? {
              kind: 'exact-match',
              relationId: `exact:${sourceAccountId}:${targetAccountId}`,
              sourceEvidence: [],
              targetEvidence: [],
              explanationId: 's06.relation.exact-match',
            }
          : {
              kind: 'derived-variant-match',
              relationId: `similar:${sourceAccountId}:${targetAccountId}`,
              transformationId: 'bounded-surface-changes',
              basis: 'normalized-restricted-damerau-levenshtein',
              rawDistance: 1,
              normalizedDistance: 0.1,
              pathCost: 1,
              steps: [
                {
                  id: `transformation:${sourceAccountId}:${targetAccountId}`,
                  kind: 'character-substitution',
                  operation: 'replace',
                  sourceEvidence: { type: 'span', start: 0, end: 1, token: 'a' },
                  targetEvidence: { type: 'span', start: 0, end: 1, token: 'b' },
                  cost: 1,
                  resultingCandidate: `fiktiv-${targetAccountId}`,
                  explanationId: 's06.transformation.character-substitution',
                },
              ],
              sourceEvidence: [{ type: 'span', start: 0, end: 1, token: 'a' }],
              targetEvidence: [{ type: 'span', start: 0, end: 1, token: 'b' }],
              candidate: `fiktiv-${targetAccountId}`,
              explanationId: 's06.relation.bounded-surface-changes',
            },
      disclaimerId: 'simulation-not-production-strength',
    },
  };
}

function completePlan(): Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'> {
  return {
    accounts: [
      account('master-campus', true),
      account('campus-email', true),
      account('campusgram', false),
    ],
    comparisons: [
      comparison('campusgram', 'master-campus', 'derived-variant-match'),
      comparison('campusgram', 'campus-email', 'exact-match'),
      comparison('master-campus', 'campusgram', 'derived-variant-match'),
      comparison('master-campus', 'campus-email', 'derived-variant-match'),
      comparison('campus-email', 'master-campus', 'derived-variant-match'),
      comparison('campus-email', 'campusgram', 'exact-match'),
    ],
  };
}

function staleSourceNetwork(): NetworkSceneSnapshot {
  const accountIds: readonly S06AccountId[] = [
    'master-campus',
    'campus-email',
    'campusgram',
  ];
  return {
    id: 'stale-s06-summary',
    nodes: accountIds.map((accountId, index): SceneNode => ({
      id: accountId,
      kind: 'account',
      symbolId: accountId,
      label: accountId,
      description: `Fiktives Konto ${accountId}`,
      status: 'protected',
      position: { x: 0.2 + index * 0.3, y: 0.5 },
      selectable: false,
    })),
    edges: [relationship('master-campus', 'campus-email')],
    accessibleSummary: 'Veralteter S06-Snapshot mit nur einer Beziehung.',
  };
}

describe('S08 open action needs', () => {
  it('allows either endpoint to resolve a relationship-only finding', () => {
    const model = riskModel({
      relationships: [relationship('master-campus', 'campus-email')],
    });

    expect(s08AccountHasOpenActionNeed(model, [], 'master-campus')).toBe(true);
    expect(s08AccountHasOpenActionNeed(model, [], 'campus-email')).toBe(true);
    expect(activeS08PasswordRelationships(model, ['master-campus'])).toEqual([]);
    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'campus-email')).toBe(false);
    expect(s08HasOpenActionNeed(model, ['master-campus'])).toBe(false);
  });

  it('keeps the other account open when it has its own local finding', () => {
    const model = riskModel({
      localFindingAccountIds: ['campus-email'],
      relationships: [relationship('master-campus', 'campus-email')],
    });

    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'campus-email')).toBe(true);
    expect(s08HasOpenActionNeed(model, ['master-campus'])).toBe(true);
  });

  it('keeps the other account open while another relationship remains', () => {
    const model = riskModel({
      relationships: [
        relationship('master-campus', 'campus-email'),
        relationship('campus-email', 'campusgram'),
      ],
    });

    expect(activeS08PasswordRelationships(model, ['master-campus'])).toEqual([
      relationship('campus-email', 'campusgram'),
    ]);
    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'campus-email')).toBe(true);
  });

  it('keeps a local finding bound to its own account', () => {
    const model = riskModel({ localFindingAccountIds: ['master-campus'] });

    expect(s08AccountHasOpenActionNeed(model, [], 'master-campus')).toBe(true);
    expect(s08AccountHasOpenActionNeed(model, [], 'campus-email')).toBe(false);
    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'master-campus')).toBe(false);
  });

  it('uses the complete S06 plan instead of stale snapshot relationships', () => {
    const source = staleSourceNetwork();
    const model = createS08ProtectionRiskModel(source, completePlan());
    const network = createS08ProtectionNetwork(source, [], model);

    expect(model.localFindingAccountIds).toEqual(['master-campus', 'campus-email']);
    expect(model.relationships).toHaveLength(3);
    expect(model.relationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: 'campusgram',
          targetId: 'master-campus',
          kind: 'similar-pattern',
        }),
        expect.objectContaining({
          sourceId: 'campusgram',
          targetId: 'campus-email',
          kind: 'identical-reuse',
        }),
        expect.objectContaining({
          sourceId: 'master-campus',
          targetId: 'campus-email',
          kind: 'similar-pattern',
        }),
      ]),
    );
    expect(
      network.edges.filter(
        ({ kind }) => kind === 'identical-reuse' || kind === 'similar-pattern',
      ),
    ).toHaveLength(3);
    expect(network.nodes.find(({ id }) => id === 'master-campus')).toMatchObject({
      status: 'affected',
      selectable: true,
    });
    expect(network.nodes.find(({ id }) => id === 'campus-email')).toMatchObject({
      status: 'affected',
      selectable: true,
    });
    expect(network.nodes.find(({ id }) => id === 'campusgram')).toMatchObject({
      status: 'protected',
      selectable: false,
    });
  });

  it('uses snapshot relationships only when no S06 plan is available', () => {
    const source = staleSourceNetwork();

    expect(createS08ProtectionRiskModel(source).relationships).toEqual(source.edges);
  });

  it('projects S06 findings into a non-reconstructive S08 resume state', () => {
    const resumeState = createSupportiveS08ResumeState(
      completePlan(),
      'passphrase-01-dot',
    );

    expect(resumeState).toMatchObject({
      schemaVersion: 'supportive-s08-resume-v1',
      passphraseIds: {
        campusgram: 'passphrase-01-dot',
        masterCampus: 'passphrase-02-hyphen',
        campusEmail: 'passphrase-03-hyphen',
      },
      weakAccountIds: ['master-campus', 'campus-email'],
    });
    expect(resumeState.relationships).toHaveLength(3);
    expect(JSON.stringify(resumeState)).not.toMatch(
      /fiktiv-|sourceEvidence|targetEvidence|candidate|password/iu,
    );
    expect(createS08ProtectionRiskModelFromResumeState(resumeState)).toMatchObject({
      localFindingAccountIds: ['master-campus', 'campus-email'],
      relationships: [
        expect.objectContaining({
          sourceId: 'campusgram',
          targetId: 'master-campus',
          kind: 'similar-pattern',
        }),
        expect.objectContaining({
          sourceId: 'campusgram',
          targetId: 'campus-email',
          kind: 'identical-reuse',
        }),
        expect.objectContaining({
          sourceId: 'master-campus',
          targetId: 'campus-email',
          kind: 'similar-pattern',
        }),
      ],
    });
  });

  it('keeps a relationship-only account protected but actionable', () => {
    const source = staleSourceNetwork();
    const model = riskModel({
      localFindingAccountIds: ['campus-email'],
      relationships: [relationship('master-campus', 'campus-email')],
    });
    const network = createS08ProtectionNetwork(source, [], model);

    expect(network.nodes.find(({ id }) => id === 'master-campus')).toMatchObject({
      status: 'protected',
      selectable: true,
    });
    expect(network.nodes.find(({ id }) => id === 'campus-email')).toMatchObject({
      status: 'neutral',
      selectable: true,
    });
  });
});
