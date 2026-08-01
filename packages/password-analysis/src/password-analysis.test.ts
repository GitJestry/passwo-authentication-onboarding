import { describe, expect, it } from 'vitest';
import type {
  LocalPasswordDisposition,
  PasswordAnalysisResult,
  PasswordConsequenceSceneMode,
  PasswordEvidenceSpan,
  PasswordRelationKind,
  S06AccountId,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
  compareFictionalPasswords,
  createLowercaseSearchSpaceModel,
  createSystemGeneratedSearchSpaceModel,
  createTheoreticalSearchSpaceModel,
  determinePasswordSimulationDisposition,
  projectS07Recommendations,
} from './index.js';

describe('exact theoretical search-space demonstrations', () => {
  it.each([
    [8, 208_827_064_576n],
    [12, 95_428_956_661_682_176n],
    [14, 64_509_974_703_297_150_976n],
    [15, 1_677_259_342_285_725_925_376n],
    [16, 43_608_742_899_428_874_059_776n],
  ] as const)(
    'models 26 independently random lowercase characters at length %i',
    (length, count) => {
      const model = createLowercaseSearchSpaceModel(length);
      expect(model).toMatchObject({
        alphabetSize: 26,
        length,
        attemptsPerSecond: 1_000_000_000_000n,
        totalCandidateCount: count,
        exhaustiveSearchDuration: {
          wholeSeconds: count / 1_000_000_000_000n,
          remainingCandidates: count % 1_000_000_000_000n,
          attemptsPerSecond: 1_000_000_000_000n,
        },
        assumptions: {
          independentlyRandomCharacters: true,
          fixedAlphabet: true,
          exhaustiveSearch: true,
        },
      });
    },
  );

  it('places the authored lowercase durations in their displayed ranges', () => {
    const secondsPerDay = 86_400n;
    const secondsPerYear = 31_557_600n;
    expect(createLowercaseSearchSpaceModel(8).exhaustiveSearchDuration.wholeSeconds).toBe(0n);
    expect(
      createLowercaseSearchSpaceModel(12).exhaustiveSearchDuration.wholeSeconds,
    ).toBeGreaterThan(secondsPerDay);
    expect(
      createLowercaseSearchSpaceModel(14).exhaustiveSearchDuration.wholeSeconds,
    ).toBeGreaterThan(secondsPerYear * 2n);
    expect(
      createLowercaseSearchSpaceModel(15).exhaustiveSearchDuration.wholeSeconds,
    ).toBeGreaterThan(secondsPerYear * 53n);
    expect(
      createLowercaseSearchSpaceModel(16).exhaustiveSearchDuration.wholeSeconds,
    ).toBeGreaterThan(secondsPerYear * 1_000n);
  });

  it('models the authored 72-character demonstration exactly', () => {
    const generated = createSystemGeneratedSearchSpaceModel(12);
    const lowercase = createLowercaseSearchSpaceModel(15);
    expect(generated.totalCandidateCount).toBe(19_408_409_961_765_342_806_016n);
    expect(generated.totalCandidateCount).toBeGreaterThan(lowercase.totalCandidateCount);
    expect(generated.totalCandidateCount * 10n).toBeGreaterThan(
      lowercase.totalCandidateCount * 115n,
    );
    const completeYears = generated.exhaustiveSearchDuration.wholeSeconds / 31_557_600n;
    expect(completeYears).toBe(615n);
  });

  it.each([
    [{ alphabetSize: 0, length: 12, attemptsPerSecond: 1n }, 'alphabetSize'],
    [{ alphabetSize: 26, length: 0, attemptsPerSecond: 1n }, 'length'],
    [{ alphabetSize: 26, length: 12, attemptsPerSecond: 0n }, 'attemptsPerSecond'],
  ] as const)('rejects invalid model parameter %s', (input, parameter) => {
    expect(() => createTheoreticalSearchSpaceModel(input)).toThrow(parameter);
  });
});

const s07AccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;
const s07Pairs = [
  ['campusgram', 'master-campus'],
  ['campusgram', 'campus-email'],
  ['master-campus', 'campus-email'],
] as const;

function s07Disposition(quickPath: boolean): LocalPasswordDisposition {
  return quickPath
    ? {
        kind: 'quick-path-recognized',
        ruleId: 'very-short-string',
        explanationId: 's05.disposition.very-short-string',
      }
    : {
        kind: 'no-quick-path-recognized',
        explanationId: 's05.disposition.no-quick-path-recognized',
      };
}

function s07Input(
  options: {
    readonly quickPathAccounts?: readonly S06AccountId[];
    readonly retrieval?: Partial<
      Readonly<Record<S06AccountId, 'retrievable' | 'not-remembered' | 'assisted'>>
    >;
    readonly relations?: readonly [
      PasswordRelationKind,
      PasswordRelationKind,
      PasswordRelationKind,
    ];
    readonly modes?: readonly [
      PasswordConsequenceSceneMode,
      PasswordConsequenceSceneMode,
      PasswordConsequenceSceneMode,
    ];
  } = {},
): S07RecommendationProjectionInput {
  const relations = options.relations ?? [
    'no-derived-path-recognized',
    'no-derived-path-recognized',
    'no-derived-path-recognized',
  ];
  const modes = options.modes ?? ['hypothetical', 'hypothetical', 'hypothetical'];
  return {
    incidentSource: 'campusgram',
    accounts: s07AccountIds.map((accountId) => ({
      accountId,
      disposition: s07Disposition(options.quickPathAccounts?.includes(accountId) ?? false),
      retrievalStatus: options.retrieval?.[accountId] ?? 'retrievable',
    })),
    paths: s07Pairs.map(([sourceAccountId, targetAccountId], index) => ({
      sourceAccountId,
      targetAccountId,
      mode: modes[index] ?? 'hypothetical',
      relationKind: relations[index] ?? 'no-derived-path-recognized',
      targetReached: modes[index] === 'actual' && relations[index] !== 'no-derived-path-recognized',
    })),
    affectedAccountIds: [],
  };
}

function recommendationFor(input: S07RecommendationProjectionInput, accountId: S06AccountId) {
  return projectS07Recommendations(input).accounts.find(
    (account) => account.accountId === accountId,
  )?.recommendationId;
}

describe('S07 recommendation projection', () => {
  it('projects directly from the resolved S06 boundary without analysis inputs', () => {
    const input = s07Input();
    expect(input.accounts.every((account) => !('fictionalPassword' in account))).toBe(true);
    expect(input.paths.every((path) => !('result' in path))).toBe(true);
    expect(projectS07Recommendations(input).accounts).toHaveLength(3);
  });

  it('applies the six stable recommendation priorities from resolved S06 findings', () => {
    expect(
      recommendationFor(
        s07Input({
          quickPathAccounts: ['campusgram'],
          relations: ['exact-match', 'no-derived-path-recognized', 'no-derived-path-recognized'],
        }),
        'campusgram',
      ),
    ).toBe('replace-exposed-password');
    expect(
      recommendationFor(
        s07Input({
          relations: ['exact-match', 'no-derived-path-recognized', 'no-derived-path-recognized'],
        }),
        'master-campus',
      ),
    ).toBe('separate-exact-reuse');
    expect(
      recommendationFor(s07Input({ quickPathAccounts: ['campus-email'] }), 'campus-email'),
    ).toBe('rebuild-predictable-password');
    expect(
      recommendationFor(
        s07Input({
          relations: [
            'no-derived-path-recognized',
            'derived-variant-match',
            'no-derived-path-recognized',
          ],
        }),
        'campus-email',
      ),
    ).toBe('replace-derived-pattern');
    expect(
      recommendationFor(s07Input({ retrieval: { 'master-campus': 'assisted' } }), 'master-campus'),
    ).toBe('improve-retrievability');
    const noChangeProjection = projectS07Recommendations(s07Input());
    expect(recommendationFor(s07Input(), 'master-campus')).toBe('no-change-practice-method');
    expect(JSON.stringify(noChangeProjection)).not.toMatch(/fictionalPassword|candidate|evidence/u);
  });

  it('maps an actual resolved S06 derived hit to reached-via-derived-variant', () => {
    const actual = projectS07Recommendations(
      s07Input({
        relations: [
          'no-derived-path-recognized',
          'derived-variant-match',
          'no-derived-path-recognized',
        ],
        modes: ['actual', 'actual', 'actual'],
      }),
    );
    expect(
      actual.accounts.find(({ accountId }) => accountId === 'campus-email')?.incidentStatus,
    ).toBe('reached-via-derived-variant');
  });

  it('keeps a hypothetical resolved S06 derived hit hypothetical', () => {
    const hypothetical = projectS07Recommendations(
      s07Input({
        relations: [
          'no-derived-path-recognized',
          'derived-variant-match',
          'no-derived-path-recognized',
        ],
      }),
    );
    expect(
      hypothetical.accounts.find(({ accountId }) => accountId === 'campus-email')?.incidentStatus,
    ).toBe('hypothetical-only');
    expect(
      hypothetical.accounts.find(({ accountId }) => accountId === 'campus-email')?.recommendationId,
    ).toBe('replace-derived-pattern');
  });

  it('creates one recommendation per account and only present adaptive problem classes', () => {
    const projection = projectS07Recommendations(
      s07Input({
        quickPathAccounts: ['campusgram'],
        retrieval: { 'master-campus': 'not-remembered' },
        relations: ['exact-match', 'derived-variant-match', 'no-derived-path-recognized'],
      }),
    );
    expect(projection.accounts).toHaveLength(3);
    expect(new Set(projection.accounts.map(({ accountId }) => accountId)).size).toBe(3);
    expect(projection.summary.problemClasses).toEqual([
      'local-quick-path',
      'exact-reuse',
      'derived-variant',
      'retrievability',
    ]);
  });
});

describe('local fictional password analysis', () => {
  it.each([
    ['Passwort123!', [], ['common-password-core', 'typical-suffix']],
    ['Campusgram2026', ['Campusgram'], ['account-or-service-term', 'year']],
    ['qwertz9876x', [], ['common-password-core', 'simple-number-sequence']],
    ['KaffeeKaffee7', [], ['repeated-component', 'typical-suffix']],
    ['rQ7mL2vX9pK4', [], ['no-simple-component-recognized']],
  ] as const)(
    'returns bounded findings for %s',
    (fictionalPassword, authoredAccountTerms, kinds) => {
      const result = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
      });
      expect(result.findings.map(({ kind }) => kind)).toEqual(kinds);
      for (const finding of result.findings) {
        expect(finding.id).toMatch(/^single:/u);
        expect(finding.explanationId).toMatch(/^s05\./u);
        expect(['authored-exact-match', 'bounded-heuristic']).toContain(finding.confidence);
      }
    },
  );

  it.each([
    ['kurz', [], 'very-short-string'],
    ['Passwort123!', [], 'common-password-core-with-typical-change'],
    ['Campusgram2026!', ['Campusgram'], 'account-context-with-predictable-qualifier'],
    ['KaffeeKaffeeKaffee7', [], 'clearly-repeated-explainable-structure'],
  ] as const)(
    'names a concrete quick path for %s',
    (fictionalPassword, authoredAccountTerms, expectedRuleId) => {
      const componentAnalysis = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
      });
      const structureAnalysis = analyzeFictionalPasswordStructure({
        fictionalPassword,
        componentAnalysis,
      });
      expect(
        determinePasswordSimulationDisposition({
          fictionalPassword,
          componentAnalysis,
          structureAnalysis,
        }),
      ).toEqual({
        kind: 'quick-path-recognized',
        ruleId: expectedRuleId,
        explanationId: `s05.disposition.${expectedRuleId}`,
      });
    },
  );

  it('uses the bounded no-quick-path disposition without inferring strength', () => {
    const fictionalPassword = 'rQ7mL2vX9pK4';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const structureAnalysis = analyzeFictionalPasswordStructure({
      fictionalPassword,
      componentAnalysis,
    });
    expect(
      determinePasswordSimulationDisposition({
        fictionalPassword,
        componentAnalysis,
        structureAnalysis,
      }),
    ).toEqual({
      kind: 'no-quick-path-recognized',
      explanationId: 's05.disposition.no-quick-path-recognized',
    });
  });

  it.each([
    [
      'KaffeeKaffeeKaffee7',
      ['Campusgram'],
      ['exact-component-repetition'],
      ['Kaffee', 'Kaffee', 'Kaffee'],
    ],
    [
      'Campusgram2026!',
      ['Campusgram'],
      ['account-context-with-qualifier', 'number-marker-with-typical-suffix'],
      ['Campusgram', '2026', '2026!', '2026', '2026!'],
    ],
    ['rQ7mL2vX9pK4', ['Campusgram'], ['no-simple-structure-recognized'], []],
  ] as const)(
    'returns only concrete bounded structure paths for %s',
    (fictionalPassword, authoredAccountTerms, findingKinds, evidenceTokens) => {
      const componentAnalysis = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
      });
      const result = analyzeFictionalPasswordStructure({
        fictionalPassword,
        componentAnalysis,
      });

      expect(result.findings.map(({ findingKind }) => findingKind)).toEqual(findingKinds);
      expect(result.findings.flatMap(({ evidence }) => evidence.map(({ token }) => token))).toEqual(
        evidenceTokens,
      );
      for (const finding of result.findings) {
        expect(finding.kind).toBe('runtimeStructureFinding');
        expect(finding.id).toMatch(/^structure:/u);
        expect(finding.explanationId).toMatch(/^s05\.structure\./u);
        expect(finding.confidence).toBe('bounded-heuristic');
      }
    },
  );

  it('does not infer authored relations or non-exact repetition at runtime', () => {
    for (const fictionalPassword of [
      'KaffeeTasseMorgen',
      'IchTrinkeMorgensKaffee',
      'KaffeeKAFFEE',
    ]) {
      const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
      expect(
        analyzeFictionalPasswordStructure({
          fictionalPassword,
          componentAnalysis,
        }).findings.map(({ findingKind }) => findingKind),
      ).toEqual(['no-simple-structure-recognized']);
    }
  });

  function structureAnalysisFromAccountEvidence(
    fictionalPassword: string,
    accountEvidence: readonly PasswordEvidenceSpan[],
    yearStart: number,
  ) {
    const componentAnalysis: PasswordAnalysisResult = {
      kind: 'fictional-password-analysis',
      findings: [
        {
          id: 'single:account-or-service-term:test',
          kind: 'account-or-service-term',
          evidence: accountEvidence,
          explanationId: 's05.account-or-service-term',
          confidence: 'bounded-heuristic',
        },
        {
          id: 'single:year:test',
          kind: 'year',
          evidence: [
            {
              type: 'span',
              start: yearStart,
              end: yearStart + 4,
              token: fictionalPassword.slice(yearStart, yearStart + 4),
            },
          ],
          explanationId: 's05.year',
          confidence: 'bounded-heuristic',
        },
      ],
      disclaimerId: 'simulation-not-production-strength',
    };
    return analyzeFictionalPasswordStructure({ fictionalPassword, componentAnalysis });
  }

  it('accepts one or more entirely valid evidence spans', () => {
    const fictionalPassword = 'CampusCampus2026';
    const result = structureAnalysisFromAccountEvidence(
      fictionalPassword,
      [
        { type: 'span', start: 0, end: 6, token: 'Campus' },
        { type: 'span', start: 6, end: 12, token: 'Campus' },
      ],
      12,
    );

    expect(result.findings.map(({ findingKind }) => findingKind)).toEqual([
      'account-context-with-qualifier',
    ]);
    for (const evidence of result.findings.flatMap(({ evidence }) => evidence)) {
      expect(evidence.type).toBe('span');
      if (evidence.type === 'span') {
        expect(fictionalPassword.slice(evidence.start, evidence.end)).toBe(evidence.token);
      }
    }
  });

  it.each([
    [
      'one valid and one fabricated span',
      [
        { type: 'span', start: 0, end: 6, token: 'Campus' },
        { type: 'span', start: 0, end: 6, token: 'Ghost!' },
      ],
    ],
    ['a negative start', [{ type: 'span', start: -1, end: 6, token: 'Campus' }]],
    ['an end outside the original', [{ type: 'span', start: 0, end: 99, token: 'Campus' }]],
    ['a wrong evidence token', [{ type: 'span', start: 0, end: 6, token: 'Campuz' }]],
  ] as const)('rejects an entire component finding with %s', (_case, accountEvidence) => {
    const result = structureAnalysisFromAccountEvidence('Campus2026', accountEvidence, 6);

    expect(result.findings.map(({ findingKind }) => findingKind)).toEqual([
      'no-simple-structure-recognized',
    ]);
  });

  it.each([
    ['Campus2026', 'Campus'],
    ['MÜNCHEN2026', 'München'],
    ['İKonto2026', 'İKonto'],
  ] as const)(
    'keeps case-insensitive evidence on original UTF-16 offsets for %s',
    (original, term) => {
      const result = analyzeFictionalPassword({
        fictionalPassword: original,
        authoredAccountTerms: [term],
      });
      const finding = result.findings.find(({ kind }) => kind === 'account-or-service-term');
      expect(finding).toBeDefined();
      for (const span of finding?.evidence ?? []) {
        if (span.type !== 'span') continue;
        expect(original.slice(span.start, span.end)).toBe(span.token);
      }
    },
  );

  const comparisonTerms = ['Campusgram', 'MasterCampus', 'CampusMail', 'Mail'] as const;

  it.each([
    ['LunaCampusgram2026!', 'LunaCampusgram2026!', 'exact-match'],
    ['LunaCampusgram2026!', 'LunaCampusgram2027?', 'derived-variant-match'],
    ['LunaCampusgram2026', 'LunaCampusgram2026!', 'derived-variant-match'],
    ['LunaCampusgram2026!', 'LunaMail2027?', 'derived-variant-match'],
    ['MorgenKaffee7', 'MorgenTasse7', 'no-derived-path-recognized'],
    ['rQ7mL2vX', 'rQ7mL2vY', 'no-derived-path-recognized'],
  ] as const)(
    'classifies %s and %s only through concrete candidate paths',
    (sourcePassword, targetPassword, relationKind) => {
      expect(
        compareFictionalPasswords({
          sourcePassword,
          targetPassword,
          authoredAccountAndServiceTerms: comparisonTerms,
        }).relation.kind,
      ).toBe(relationKind);
    },
  );

  it('returns the concrete generated candidate and grounded evidence for a derived relation', () => {
    const sourcePassword = 'LunaCampusgram2026!';
    const targetPassword = 'LunaMail2027?';
    const relation = compareFictionalPasswords({
      sourcePassword,
      targetPassword,
      authoredAccountAndServiceTerms: comparisonTerms,
    }).relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.candidate).toBe(targetPassword);
    expect(relation.transformationId).toBe('account-term-year-and-suffix-changed');
    expect(relation.relationId).toMatch(/^relation:account-term-year-and-suffix-changed:/u);
    for (const span of relation.sourceEvidence) {
      expect(sourcePassword.slice(span.start, span.end)).toBe(span.token);
    }
    for (const span of relation.targetEvidence) {
      expect(targetPassword.slice(span.start, span.end)).toBe(span.token);
    }
  });

  it.each([
    ['common substring only', 'MorgenKaffee7', 'MorgenTasse7'],
    ['single edit only', 'rQ7mL2vX', 'rQ7mL2vY'],
    ['character substitution only', 'Passw0rt1!', 'Passwort1!'],
    ['unbounded year change', 'LunaCampusgram2020!', 'LunaCampusgram2026!'],
  ] as const)('does not treat %s as a derived path', (_case, sourcePassword, targetPassword) => {
    expect(
      compareFictionalPasswords({
        sourcePassword,
        targetPassword,
        authoredAccountAndServiceTerms: comparisonTerms,
      }).relation.kind,
    ).toBe('no-derived-path-recognized');
  });
});
