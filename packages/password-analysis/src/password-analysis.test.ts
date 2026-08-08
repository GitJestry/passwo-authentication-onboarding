import type {
  LocalPasswordDisposition,
  PasswordAnalysisResult,
  PasswordConsequenceSceneMode,
  PasswordEvidenceSpan,
  PasswordRelationKind,
  S06AccountId,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
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

function s07Disposition(
  quickPath: boolean,
  belowLengthOrientation = false,
): LocalPasswordDisposition {
  const base = {
    estimatedGuesses: quickPath ? 1_000 : 1_000_000,
    quickPathThreshold: 100_000,
    lengthOrientation: belowLengthOrientation ? 'below-15' : 'at-least-15',
    analysisVersion: 'passwo-bounded-guess-path-v2',
  } as const;
  return quickPath
    ? {
        ...base,
        kind: 'quick-path-recognized',
        ruleId: 'bounded-complete-guess-path',
        explanationId: 's05.disposition.bounded-complete-guess-path',
      }
    : {
        ...base,
        kind: 'no-quick-path-recognized',
        explanationId: 's05.disposition.no-quick-path-recognized',
      };
}

function s07Input(
  options: {
    readonly quickPathAccounts?: readonly S06AccountId[];
    readonly belowLengthAccounts?: readonly S06AccountId[];
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
      disposition: s07Disposition(
        options.quickPathAccounts?.includes(accountId) ?? false,
        options.belowLengthAccounts?.includes(accountId) ?? false,
      ),
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

  it('applies the seven stable recommendation priorities from resolved S06 findings', () => {
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
      recommendationFor(s07Input({ belowLengthAccounts: ['campus-email'] }), 'campus-email'),
    ).toBe('rebuild-below-length-orientation');
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
        belowLengthAccounts: ['campusgram'],
        retrieval: { 'master-campus': 'not-remembered' },
        relations: ['exact-match', 'derived-variant-match', 'no-derived-path-recognized'],
      }),
    );
    expect(projection.accounts).toHaveLength(3);
    expect(new Set(projection.accounts.map(({ accountId }) => accountId)).size).toBe(3);
    expect(projection.summary.problemClasses).toEqual([
      'local-quick-path',
      'below-length-orientation',
      'exact-reuse',
      'derived-variant',
      'retrievability',
    ]);
  });
});

function passwordAnalysisWithEstimatedGuesses(estimatedGuesses: number): PasswordAnalysisResult {
  return {
    kind: 'fictional-password-analysis',
    findings: [
      {
        id: 'single:no-simple-component-recognized',
        kind: 'no-simple-component-recognized',
        evidence: [],
        explanationId: 's05.no-simple-component-recognized',
        confidence: 'bounded-heuristic',
      },
    ],
    guessPath: {
      engineId: 'zxcvbn-ts',
      configurationVersion: 'passwo-bounded-guess-path-v8',
      estimatedGuesses,
      estimatedGuessesLog10: Math.log10(estimatedGuesses),
      matches: [],
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

describe('local fictional password analysis', () => {
  it('reports a bounded trailing variant even without another recognized component', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'Fantasiebegriff123!' });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'typical-suffix',
          evidence: [
            { type: 'span', start: 15, end: 19, token: '123!' },
          ],
        }),
      ]),
    );
  });

  it.each(['123!', '!!!', '123456'])('does not treat %s as a letter-based typical ending', (input) => {
    const result = analyzeFictionalPassword({ fictionalPassword: input });

    expect(result.findings.some(({ kind }) => kind === 'typical-suffix')).toBe(false);
  });

  it('recognizes a bounded numbered repetition as a predictable word sequence', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'wort1-wort2-wort3' });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'predictable-word-sequence' }),
      ]),
    );
  });

  it.each([
    ['wort1wort1', 'common-word'],
    ['password1password1', 'common-password-core'],
    ['zümra1zümra1', 'common-name'],
    ['qwertz9876xqwertz9876x', 'keyboard-pattern'],
    ['2026-2026-', 'year'],
    ['12.03.2012-12.03.2012-', 'date'],
    ['abcd1abcd1', 'simple-character-sequence'],
    ['einszweidrei-einszweidrei-', 'predictable-word-sequence'],
  ] as const)(
    'keeps the zxcvbn base finding for %s beside its repeated-component finding',
    (fictionalPassword, baseKind) => {
      const result = analyzeFictionalPassword({ fictionalPassword });

      expect(result.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'repeated-component' }),
          expect.objectContaining({ kind: baseKind }),
        ]),
      );
    },
  );

  it('uses transient fictional account identifiers as local zxcvbn inputs', () => {
    const result = analyzeFictionalPassword({
      fictionalPassword: 'mira.campusgram',
      transientAccountIdentifiers: ['mira.campusgram', 'mira@mail.campus.example'],
    });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'account-or-service-term',
          confidence: 'authored-exact-match',
        }),
      ]),
    );
  });

  it.each([
    ['chat', 'chat'],
    ['ch4t!', 'ch4t'],
    ['scoials', 'scoials'],
  ] as const)('recognizes bounded fuzzy account terms in %s', (fictionalPassword, token) => {
    const result = analyzeFictionalPassword({
      fictionalPassword,
      authoredAccountTerms: [fictionalPassword === 'scoials' ? 'Socials' : 'Chat'],
    });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'account-or-service-term',
          evidence: [expect.objectContaining({ token })],
        }),
      ]),
    );
  });

  it.each([
    ['C4mpus', 'Campus'],
    ['C4ampus', 'Campus'],
    ['M4sterC4mpus', 'MasterCampus'],
    ['C4mpusM4il', 'CampusMail'],
    ['C4mpusgr4m', 'Campusgram'],
    ['Ca^^pus', 'Campus'],
    ['Cmapus', 'Campus'],
  ] as const)(
    'recognizes the bounded account-context variant %s for %s',
    (fictionalPassword, authoredAccountTerm) => {
      const result = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms: [authoredAccountTerm],
      });

      expect(result.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'account-or-service-term',
            evidence: [
              {
                type: 'span',
                start: 0,
                end: fictionalPassword.length,
                token: fictionalPassword,
              },
            ],
          }),
          expect.objectContaining({
            kind: 'typical-transformation',
            evidence: [
              {
                type: 'span',
                start: 0,
                end: fictionalPassword.length,
                token: fictionalPassword,
              },
            ],
          }),
        ]),
      );
    },
  );

  it.each([
    ['Chqt', 'Chat'],
    ['Cxxpus', 'Campus'],
  ] as const)(
    'does not broaden authored matching beyond the bounded rule for %s',
    (fictionalPassword, authoredAccountTerm) => {
      const result = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms: [authoredAccountTerm],
      });

      expect(result.findings.some(({ kind }) => kind === 'account-or-service-term')).toBe(false);
    },
  );

  it.each([
    'ichliebe-Campusgram4',
    'ichliebe_Campusgram4',
    'ichliebe#Campusgram4',
  ] as const)('keeps connector-bound common words visible in %s', (fictionalPassword) => {
    const result = analyzeFictionalPassword({
      fictionalPassword,
      authoredAccountTerms: ['Campusgram'],
    });

    expect(
      result.findings.some(
        ({ kind, evidence }) =>
          (kind === 'common-word' || kind === 'common-password-core') &&
          evidence.some((item) => item.type === 'span' && item.token === 'liebe'),
      ),
    ).toBe(true);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'account-or-service-term',
          evidence: [expect.objectContaining({ token: 'Campusgram' })],
        }),
      ]),
    );
  });

  it('projects a complete concatenated dictionary partition without changing the guess path', () => {
    const fictionalPassword = 'ichliebe-Campusgram4';
    const result = analyzeFictionalPassword({
      fictionalPassword,
      authoredAccountTerms: ['Campusgram'],
    });
    const tokens = result.findings.flatMap(({ evidence }) =>
      evidence.flatMap((item) => (item.type === 'span' ? [item.token] : [])),
    );

    expect(tokens).toEqual(expect.arrayContaining(['ich', 'liebe', 'Campusgram', '4']));
    expect(
      result.guessPath.matches.every(
        ({ start, end }) => start >= 0 && end <= fictionalPassword.length,
      ),
    ).toBe(true);
  });

  it.each(['-', '_', ';', '#'] as const)(
    'keeps complete dictionary words around the %s connector visible',
    (connector) => {
      const fictionalPassword = ['Kaktus', 'Fenster', 'Regen', 'Komet', 'Wodurch', 'Knochen'].join(
        connector,
      );
      const result = analyzeFictionalPassword({ fictionalPassword });
      const tokens = result.findings.flatMap(({ evidence }) =>
        evidence.flatMap((item) => (item.type === 'span' ? [item.token] : [])),
      );

      expect(tokens).toEqual(
        expect.arrayContaining(['Kaktus', 'Fenster', 'Regen', 'Komet', 'Wodurch', 'Knochen']),
      );
      expect(tokens).not.toContain(connector);
    },
  );

  it('keeps year and punctuation spans intact beside account context', () => {
    const result = analyzeFictionalPassword({
      fictionalPassword: 'Campusgram2026',
      authoredAccountTerms: ['Campusgram'],
    });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'account-or-service-term',
          evidence: [expect.objectContaining({ token: 'Campusgram' })],
        }),
        expect.objectContaining({
          kind: 'year',
          evidence: [{ type: 'span', start: 10, end: 14, token: '2026' }],
        }),
      ]),
    );
  });

  it.each([
    ['Passw0rt123!', ['123!']],
    ['mEin!Pa55w0rt?', ['!', '?']],
    ['Wort!Fenster?Regen_', ['!', '?', '_']],
    ['Wort#', ['#']],
    ['Wort$', ['$']],
  ] as const)('assigns typical endings to every bounded component in %s', (input, endings) => {
    const result = analyzeFictionalPassword({ fictionalPassword: input });
    const actualEndings = result.findings.flatMap(({ kind, evidence }) =>
      kind === 'typical-suffix'
        ? evidence.flatMap((item) => (item.type === 'span' ? [item.token] : []))
        : [],
    );

    expect(actualEndings).toEqual(endings);
  });

  it('preserves original UTF-16 offsets for a complete Unicode dictionary partition', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'ÄpfelStraße' });
    const spans = result.findings.flatMap(({ evidence }) =>
      evidence.flatMap((item) => (item.type === 'span' ? [item] : [])),
    );

    expect(spans).toEqual(
      expect.arrayContaining([
        { type: 'span', start: 0, end: 5, token: 'Äpfel' },
        { type: 'span', start: 5, end: 11, token: 'Straße' },
      ]),
    );
  });

  it('keeps every projected span inside the 128-code-unit analysis boundary', () => {
    const fictionalPassword = 'Kaktus-Fenster-Regen-'.repeat(8).slice(0, 128);
    const result = analyzeFictionalPassword({ fictionalPassword });

    expect(fictionalPassword).toHaveLength(128);
    for (const evidence of result.findings.flatMap(({ evidence }) => evidence)) {
      if (evidence.type !== 'span') continue;
      expect(evidence.start).toBeGreaterThanOrEqual(0);
      expect(evidence.end).toBeLessThanOrEqual(128);
      expect(fictionalPassword.slice(evidence.start, evidence.end)).toBe(evidence.token);
    }
  });

  it('does not add a free inner dictionary substring to an otherwise complete word', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'Liebling' });
    const tokens = result.findings.flatMap(({ evidence }) =>
      evidence.flatMap((item) =>
        item.type === 'span' ? [item.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toContain('liebling');
    expect(tokens).not.toContain('lieb');
  });

  it.each([
    ['Passwort123!', [], ['common-password-core']],
    ['Campusgram2026', ['Campusgram'], ['account-or-service-term']],
    ['qwertz9876x', [], ['keyboard-pattern', 'common-password-core', 'simple-character-sequence']],
    ['KaffeeKaffee7', [], ['repeated-component', 'common-word']],
    ['rQ7mL2vX9pK4', [], ['typical-suffix']],
  ] as const)(
    'returns grounded bounded evidence for %s',
    (fictionalPassword, authoredAccountTerms, expectedKinds) => {
      const result = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
      });
      const actualKinds = result.findings.map(({ kind }) => kind);
      expect(expectedKinds.some((expectedKind) => actualKinds.includes(expectedKind))).toBe(true);
      expect(result.guessPath).toMatchObject({
        engineId: 'zxcvbn-ts',
        configurationVersion: 'passwo-bounded-guess-path-v8',
      });
      expect(result.guessPath.estimatedGuesses).toBeGreaterThan(0);
      for (const finding of result.findings) {
        expect(finding.id).toMatch(/^single:/u);
        expect(finding.explanationId).toMatch(/^s05\./u);
        expect(['authored-exact-match', 'bounded-heuristic']).toContain(finding.confidence);
      }
      for (const match of result.guessPath.matches) {
        expect(match.start).toBeGreaterThanOrEqual(0);
        expect(match.end).toBeGreaterThan(match.start);
        expect(match.sourceId === null || match.sourceId.length > 0).toBe(true);
      }
    },
  );

  it.each([
    [100_000, 'quick-path-recognized'],
    [100_001, 'no-quick-path-recognized'],
  ] as const)(
    'applies the frozen complete-path boundary at %i guesses',
    (estimatedGuesses, expectedKind) => {
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword: 'fiktives-passwort',
        componentAnalysis: passwordAnalysisWithEstimatedGuesses(estimatedGuesses),
      });
      expect(disposition.kind).toBe(expectedKind);
    },
  );

  it('keeps the length orientation separate from the complete-path decision', () => {
    const shortNoQuickPath = determinePasswordSimulationDisposition({
      fictionalPassword: 'kurz',
      componentAnalysis: passwordAnalysisWithEstimatedGuesses(100_001),
    });
    const longQuickPath = determinePasswordSimulationDisposition({
      fictionalPassword: 'fuenfzehnzeichen',
      componentAnalysis: passwordAnalysisWithEstimatedGuesses(100_000),
    });

    expect(shortNoQuickPath).toMatchObject({
      kind: 'no-quick-path-recognized',
      lengthOrientation: 'below-15',
    });
    expect(longQuickPath).toMatchObject({
      kind: 'quick-path-recognized',
      lengthOrientation: 'at-least-15',
    });
  });

  it.each([
    ['kurz', [], 'quick-path-recognized'],
    ['Passwort123!', [], 'no-quick-path-recognized'],
    ['Campusgram2026!', ['Campusgram'], 'no-quick-path-recognized'],
  ] as const)(
    'uses only the complete bounded guess path for a quick-path decision for %s',
    (fictionalPassword, authoredAccountTerms, expectedKind) => {
      const componentAnalysis = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
      });
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword,
        componentAnalysis,
      });
      expect(disposition).toMatchObject({
        kind: expectedKind,
        quickPathThreshold: 100_000,
        analysisVersion: 'passwo-bounded-guess-path-v8',
      });
      if (disposition.kind === 'quick-path-recognized') {
        expect(disposition.ruleId).toBe('bounded-complete-guess-path');
        expect(disposition.estimatedGuesses).toBeLessThanOrEqual(disposition.quickPathThreshold);
      } else {
        expect(disposition.estimatedGuesses).toBeGreaterThan(disposition.quickPathThreshold);
      }
    },
  );

  it('keeps length as a separate orientation when no short complete path is recognized', () => {
    const fictionalPassword = 'rQ7mL2vX9pK4';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
    });
    expect(disposition).toMatchObject({
      kind: 'no-quick-path-recognized',
      quickPathThreshold: 100_000,
      lengthOrientation: 'below-15',
      analysisVersion: 'passwo-bounded-guess-path-v8',
      explanationId: 's05.disposition.no-quick-path-recognized',
    });
    expect(disposition.estimatedGuesses).toBeGreaterThan(disposition.quickPathThreshold);
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
    for (const fictionalPassword of ['KaffeeTasseMorgen', 'IchTrinkeMorgensKaffee']) {
      const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
      expect(
        analyzeFictionalPasswordStructure({
          fictionalPassword,
          componentAnalysis,
        }).findings.map(({ findingKind }) => findingKind),
      ).toEqual(['no-simple-structure-recognized']);
    }
  });

  it.each([
    ['repeated-component', 'recognized-repetition-pattern'],
    ['predictable-word-sequence', 'predictable-component-sequence'],
  ] as const)(
    'projects a concrete %s finding into the bounded structure view',
    (kind, expected) => {
      const fictionalPassword = 'Abcdefgh';
      const componentAnalysis: PasswordAnalysisResult = {
        kind: 'fictional-password-analysis',
        findings: [
          {
            id: `single:${kind}:0-8:0`,
            kind,
            evidence: [{ type: 'span', start: 0, end: 8, token: fictionalPassword }],
            explanationId: `s05.${kind}`,
            confidence: 'bounded-heuristic',
          },
        ],
        guessPath: {
          engineId: 'zxcvbn-ts',
          configurationVersion: 'passwo-bounded-guess-path-v2',
          estimatedGuesses: 1_000,
          estimatedGuessesLog10: 3,
          matches: [],
        },
        disclaimerId: 'simulation-not-production-strength',
      };

      expect(
        analyzeFictionalPasswordStructure({ fictionalPassword, componentAnalysis }).findings.map(
          ({ findingKind }) => findingKind,
        ),
      ).toEqual([expected]);
    },
  );

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
      guessPath: {
        engineId: 'zxcvbn-ts',
        configurationVersion: 'passwo-bounded-guess-path-v2',
        estimatedGuesses: 1_000_000,
        estimatedGuessesLog10: 6,
        matches: [],
      },
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
      'exact-component-repetition',
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
