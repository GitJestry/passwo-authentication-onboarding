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
  createFictionalPasswordExhaustiveSearchModel,
  createLowercaseSearchSpaceModel,
  createSystemGeneratedSearchSpaceModel,
  createTheoreticalSearchSpaceModel,
  determinePasswordSimulationDisposition,
  MAX_EXHAUSTIVE_SEARCH_CANDIDATES,
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

  it('uses the displayed twelve-lowercase example as the exhaustive-search boundary', () => {
    expect(MAX_EXHAUSTIVE_SEARCH_CANDIDATES).toBe(95_428_956_661_682_176n);
    expect(
      createFictionalPasswordExhaustiveSearchModel('kfxqztmpvlbw')?.totalCandidateCount,
    ).toBe(MAX_EXHAUSTIVE_SEARCH_CANDIDATES);
  });

  it.each([
    ['qzmpvx', 26, 6],
    ['qZ4!m2', 72, 6],
    ['aA0~bB1?', 95, 8],
    ['😀😀😀😀', 128, 4],
  ] as const)(
    'derives a finite complete-search family for %s',
    (fictionalPassword, alphabetSize, length) => {
      expect(createFictionalPasswordExhaustiveSearchModel(fictionalPassword)).toMatchObject({
        alphabetSize,
        length,
        attemptsPerSecond: 1_000_000_000_000n,
      });
    },
  );

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
  wholeRecognition: boolean,
  belowLengthOrientation = false,
): LocalPasswordDisposition {
  const base = {
    lengthOrientation: belowLengthOrientation ? 'below-15' : 'at-least-15',
    analysisVersion: 'passwo-bounded-whole-recognition-v13',
  } as const;
  return wholeRecognition
    ? {
        ...base,
        kind: 'whole-password-recognized',
        ruleId: 'whole-password-recognized-value',
        findingIds: ['fixture:whole-password'],
        explanationId: 's05.disposition.whole-password-recognized-value',
      }
    : {
        ...base,
        kind: 'no-whole-password-recognized',
        explanationId: 's05.disposition.no-whole-password-recognized',
      };
}

function s07Input(
  options: {
    readonly wholeRecognitionAccounts?: readonly S06AccountId[];
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
        options.wholeRecognitionAccounts?.includes(accountId) ?? false,
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
          wholeRecognitionAccounts: ['campusgram'],
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
      recommendationFor(s07Input({ wholeRecognitionAccounts: ['campus-email'] }), 'campus-email'),
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
        wholeRecognitionAccounts: ['campusgram'],
        belowLengthAccounts: ['campusgram'],
        retrieval: { 'master-campus': 'not-remembered' },
        relations: ['exact-match', 'derived-variant-match', 'no-derived-path-recognized'],
      }),
    );
    expect(projection.accounts).toHaveLength(3);
    expect(new Set(projection.accounts.map(({ accountId }) => accountId)).size).toBe(3);
    expect(projection.summary.problemClasses).toEqual([
      'local-whole-password-recognized',
      'below-length-orientation',
      'exact-reuse',
      'derived-variant',
      'retrievability',
    ]);
  });
});

function passwordAnalysisWithFindings(
  findings: PasswordAnalysisResult['findings'],
): PasswordAnalysisResult {
  return {
    kind: 'fictional-password-analysis',
    findings,
    guessPath: {
      engineId: 'zxcvbn-ts',
      configurationVersion: 'passwo-bounded-whole-recognition-v13',
      matches: [],
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

function passwordAnalysisWithoutRecognizedCandidate(): PasswordAnalysisResult {
  return passwordAnalysisWithFindings([
    {
      id: 'single:no-simple-component-recognized',
      kind: 'no-simple-component-recognized',
      evidence: [],
      explanationId: 's05.no-simple-component-recognized',
      confidence: 'bounded-heuristic',
    },
  ]);
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
    ['Passw0rt123!', ['!']],
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

  it('does not shift a complete partition across a visible CamelCase boundary', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'IchBinEisSieIstRot' });
    const dictionaryTokens = result.findings.flatMap((finding) =>
      finding.segmentationRole !== 'candidate-only' &&
      (finding.kind === 'common-password-core' || finding.kind === 'common-word')
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
          )
        : [],
    );

    expect(dictionaryTokens).toEqual(
      expect.arrayContaining(['ich', 'bin', 'eis', 'sie', 'ist', 'rot']),
    );
    expect(dictionaryTokens).not.toContain('ichbin');
    expect(dictionaryTokens).not.toContain('is');
    expect(dictionaryTokens).not.toContain('trot');
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'common-password-core',
          segmentationRole: 'candidate-only',
          evidence: [{ type: 'span', start: 0, end: 6, token: 'IchBin' }],
        }),
      ]),
    );
  });

  it('keeps an opaque password-list value for recognition but exposes its German words', () => {
    const fictionalPassword = 'IchBin';
    const result = analyzeFictionalPassword({ fictionalPassword });
    const candidateOnlyFinding = result.findings.find(
      (finding) =>
        finding.kind === 'common-password-core' &&
        finding.segmentationRole === 'candidate-only' &&
        finding.evidence.some(
          (evidence) =>
            evidence.type === 'span' &&
            evidence.start === 0 &&
            evidence.end === fictionalPassword.length,
        ),
    );
    const componentTokens = result.findings.flatMap((finding) =>
      finding.segmentationRole !== 'candidate-only' && finding.kind === 'common-word'
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token] : [],
          )
        : [],
    );
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis: result,
    });

    expect(candidateOnlyFinding).toBeDefined();
    expect(componentTokens).toEqual(expect.arrayContaining(['Ich', 'Bin']));
    expect(componentTokens).not.toContain('IchBin');
    expect(disposition).toMatchObject({ kind: 'whole-password-recognized' });
    if (disposition.kind === 'whole-password-recognized' && candidateOnlyFinding !== undefined) {
      expect(disposition.findingIds).toContain(candidateOnlyFinding.id);
    }
  });

  it.each(['Maiden', 'MaiDen'])(
    'keeps the complete English word %s instead of inventing a German partition',
    (fictionalPassword) => {
      const result = analyzeFictionalPassword({ fictionalPassword });
      const componentTokens = result.findings.flatMap((finding) =>
        finding.segmentationRole !== 'candidate-only' &&
        (finding.kind === 'common-password-core' || finding.kind === 'common-word')
          ? finding.evidence.flatMap((evidence) =>
              evidence.type === 'span'
                ? [evidence.token.toLocaleLowerCase('en-US')]
                : [],
            )
          : [],
      );

      expect(componentTokens).toContain('maiden');
      expect(componentTokens).not.toContain('mai');
      expect(componentTokens).not.toContain('den');
      expect(
        result.findings.some(
          (finding) =>
            finding.segmentationRole === 'candidate-only' &&
            finding.evidence.some(
              (evidence) =>
                evidence.type === 'span' &&
                evidence.start === 0 &&
                evidence.end === fictionalPassword.length,
            ),
        ),
      ).toBe(false);
    },
  );

  it('rejects a mixed or reversed word-sequence candidate before it can cut canonical words', () => {
    const fictionalPassword = 'IchBinMeinStarkesUniPassw0rt123!!!!';
    const result = analyzeFictionalPassword({
      fictionalPassword,
      authoredAccountTerms: ['Uni', 'Insta'],
    });
    const tokensByKind = new Map<string, string[]>();
    for (const finding of result.findings) {
      const tokens = finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token] : [],
      );
      tokensByKind.set(finding.kind, [
        ...(tokensByKind.get(finding.kind) ?? []),
        ...tokens,
      ]);
    }

    expect(tokensByKind.get('predictable-word-sequence') ?? []).not.toContain('einStar');
    expect(tokensByKind.get('account-or-service-term')).toEqual(['Uni']);
    expect(tokensByKind.get('common-word')).toEqual(
      expect.arrayContaining(['Ich', 'Bin', 'Mein', 'Starkes']),
    );
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'common-password-core',
          segmentationRole: 'candidate-only',
          evidence: [{ type: 'span', start: 0, end: 6, token: 'IchBin' }],
        }),
      ]),
    );
    expect(
      result.findings.flatMap((finding) =>
        finding.kind === 'typical-transformation' &&
        finding.segmentationRole !== 'candidate-only'
          ? finding.evidence.flatMap((evidence) =>
              evidence.type === 'span' ? [evidence.token] : [],
            )
          : [],
      ),
    ).toEqual(['Passw0rt']);
    expect(
      result.guessPath.matches.map((match) =>
        fictionalPassword.slice(match.start, match.end),
      ),
    ).not.toContain('einStar');
  });

  it('uses canonical lexical boundaries for lowercase account terms', () => {
    const result = analyzeFictionalPassword({
      fictionalPassword: 'meinstarkesunipasswort2026!',
      authoredAccountTerms: ['Uni', 'Insta'],
    });
    const accountTokens = result.findings.flatMap((finding) =>
      finding.kind === 'account-or-service-term'
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
          )
        : [],
    );

    expect(accountTokens).toEqual(['uni']);
  });

  it.each([
    'einszweidrei',
    'eins-zwei-drei',
    'oneTwoThree',
    'MontagDienstagMittwoch',
  ])('retains the direct contiguous predictable sequence %s', (fictionalPassword) => {
    const result = analyzeFictionalPassword({ fictionalPassword });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'predictable-word-sequence' }),
      ]),
    );
    expect(result.guessPath.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pattern: 'sequence',
          start: 0,
          end: fictionalPassword.length,
        }),
      ]),
    );
  });

  it.each(['einsrot', 'einszehn'])(
    'rejects the non-contiguous or mixed predictable sequence %s',
    (fictionalPassword) => {
      const result = analyzeFictionalPassword({ fictionalPassword });

      expect(
        result.findings.some(({ kind }) => kind === 'predictable-word-sequence'),
      ).toBe(false);
      expect(
        result.guessPath.matches.some(
          ({ pattern, start, end }) =>
            pattern === 'sequence' &&
            start === 0 &&
            end === fictionalPassword.length,
        ),
      ).toBe(false);
    },
  );

  it('keeps the CamelCase partition stable when an adjacent punctuation repeat follows it', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'IchBinEisSieIstRot????' });
    const dictionaryTokens = result.findings.flatMap((finding) =>
      finding.segmentationRole !== 'candidate-only' &&
      (finding.kind === 'common-password-core' || finding.kind === 'common-word')
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
          )
        : [],
    );

    expect(dictionaryTokens).toEqual(
      expect.arrayContaining(['ich', 'bin', 'eis', 'sie', 'ist', 'rot']),
    );
    expect(dictionaryTokens).not.toContain('ichbin');
    expect(dictionaryTokens).not.toContain('is');
    expect(dictionaryTokens).not.toContain('trot');
  });

  it('retains repeat unit metadata without splitting the repeated-component evidence', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: '????' });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'repeated-component',
          evidence: [{ type: 'span', start: 0, end: 4, token: '????' }],
        }),
      ]),
    );
    expect(result.guessPath.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pattern: 'repeat',
          start: 0,
          end: 4,
          baseToken: '?',
          repeatCount: 4,
        }),
      ]),
    );
  });

  it('retains the recognized repeat base instead of minimizing it again downstream', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'KaffeeKaffeeKaffee' });

    expect(result.guessPath.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pattern: 'repeat',
          start: 0,
          end: 18,
          baseToken: 'Kaffee',
          repeatCount: 3,
        }),
      ]),
    );
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
        configurationVersion: 'passwo-bounded-whole-recognition-v19',
      });
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

  it('does not turn a random-looking 15-letter lowercase string into a full recognition', () => {
    const fictionalPassword = 'kfxqztmpvlbwhrd';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
    });

    expect(disposition).toEqual({
      kind: 'no-whole-password-recognized',
      lengthOrientation: 'at-least-15',
      analysisVersion: 'passwo-bounded-whole-recognition-v19',
      explanationId: 's05.disposition.no-whole-password-recognized',
    });
  });

  it.each(['rQ7mL2vX9pK4', 'rQ7!m2vX9?pK'] as const)(
    'does not project short alphabetic runs from the authored random example %s as dictionary findings',
    (fictionalPassword) => {
      const result = analyzeFictionalPassword({ fictionalPassword });
      const dictionaryTokens = result.findings.flatMap((finding) =>
        finding.kind === 'common-password-core' ||
        finding.kind === 'common-word' ||
        finding.kind === 'common-name'
          ? finding.evidence.flatMap((evidence) =>
              evidence.type === 'span' ? [evidence.token] : [],
            )
          : [],
      );

      expect(dictionaryTokens).toEqual([]);
    },
  );

  it.each([
    ['passwort', []],
    ['qwertz', []],
    ['Campusgram', ['Campusgram']],
    ['C4mpusgr4m', ['Campusgram']],
    ['Campusgram2026', ['Campusgram']],
    ['Campusgram-2026!', ['Campusgram']],
    ['Passwort123!', []],
  ] as const)(
    'recognizes one complete early candidate or bounded variant for %s',
    (fictionalPassword, authoredAccountTerms) => {
      const componentAnalysis = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
      });
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword,
        componentAnalysis,
      });

      expect(disposition).toMatchObject({
        kind: 'whole-password-recognized',
        analysisVersion: 'passwo-bounded-whole-recognition-v19',
      });
    },
  );

  it('classifies an exact full candidate as a direct whole-password recognition', () => {
    const fictionalPassword = 'Campusgram';
    const componentAnalysis = passwordAnalysisWithFindings([
      {
        id: 'single:account-or-service-term:0-10:0',
        kind: 'account-or-service-term',
        evidence: [{ type: 'span', start: 0, end: 10, token: fictionalPassword }],
        explanationId: 's05.account-or-service-term',
        confidence: 'authored-exact-match',
      },
    ]);

    expect(
      determinePasswordSimulationDisposition({ fictionalPassword, componentAnalysis }),
    ).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-value',
      findingIds: ['single:account-or-service-term:0-10:0'],
    });
  });

  it('classifies one known anchor plus an authored typical suffix as a bounded variant', () => {
    const fictionalPassword = 'Campusgram123!';
    const componentAnalysis = passwordAnalysisWithFindings([
      {
        id: 'single:account-or-service-term:0-10:0',
        kind: 'account-or-service-term',
        evidence: [{ type: 'span', start: 0, end: 10, token: 'Campusgram' }],
        explanationId: 's05.account-or-service-term',
        confidence: 'authored-exact-match',
      },
      {
        id: 'single:typical-suffix:10-14:1',
        kind: 'typical-suffix',
        evidence: [{ type: 'span', start: 10, end: 14, token: '123!' }],
        explanationId: 's05.typical-suffix',
        confidence: 'bounded-heuristic',
      },
    ]);

    expect(
      determinePasswordSimulationDisposition({ fictionalPassword, componentAnalysis }),
    ).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-bounded-variant',
      findingIds: [
        'single:account-or-service-term:0-10:0',
        'single:typical-suffix:10-14:1',
      ],
    });
  });

  it('does not turn an ordinary multi-word decomposition into a strength formula', () => {
    const fictionalPassword = 'KaffeeMorgen';
    const componentAnalysis = passwordAnalysisWithFindings([
      {
        id: 'single:common-word:0-6:0',
        kind: 'common-word',
        evidence: [{ type: 'span', start: 0, end: 6, token: 'Kaffee' }],
        explanationId: 's05.common-word',
        confidence: 'bounded-heuristic',
      },
      {
        id: 'single:common-word:6-12:1',
        kind: 'common-word',
        evidence: [{ type: 'span', start: 6, end: 12, token: 'Morgen' }],
        explanationId: 's05.common-word',
        confidence: 'bounded-heuristic',
      },
    ]);

    expect(
      determinePasswordSimulationDisposition({ fictionalPassword, componentAnalysis }),
    ).toMatchObject({ kind: 'no-whole-password-recognized' });
  });

  it('uses a confirmed relation as a transient semantic candidate path', () => {
    const fictionalPassword = 'KaffeeMorgen';
    const componentAnalysis = passwordAnalysisWithFindings([
      {
        id: 'single:common-word:0-6:0',
        kind: 'common-word',
        evidence: [{ type: 'span', start: 0, end: 6, token: 'Kaffee' }],
        explanationId: 's05.common-word',
        confidence: 'bounded-heuristic',
      },
      {
        id: 'single:common-word:6-12:1',
        kind: 'common-word',
        evidence: [{ type: 'span', start: 6, end: 12, token: 'Morgen' }],
        explanationId: 's05.common-word',
        confidence: 'bounded-heuristic',
      },
    ]);

    expect(
      determinePasswordSimulationDisposition({
        fictionalPassword,
        componentAnalysis,
        semanticEvidence: {
          kind: 'transient-password-semantic-evidence',
          confirmed: true,
          relations: [
            {
              id: 'semantic:content:1',
              kind: 'shared-content',
              evidence: [
                { type: 'span', start: 0, end: 6, token: 'Kaffee' },
                { type: 'span', start: 6, end: 12, token: 'Morgen' },
              ],
            },
          ],
        },
      }),
    ).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-semantic-path',
      semanticRelationIds: ['semantic:content:1'],
    });
  });

  it.each([
    {
      label: 'unconfirmed evidence',
      confirmed: false,
      token: 'Kaffee',
    },
    {
      label: 'stale evidence whose token no longer matches the password',
      confirmed: true,
      token: 'Kaktus',
    },
  ] as const)('ignores $label', ({ confirmed, token }) => {
    const fictionalPassword = 'KaffeeMorgen';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
      semanticEvidence: {
        kind: 'transient-password-semantic-evidence',
        confirmed,
        relations: [
          {
            id: 'semantic:content:invalid',
            kind: 'shared-content',
            evidence: [
              { type: 'span', start: 0, end: 6, token },
              { type: 'span', start: 6, end: 12, token: 'Morgen' },
            ],
          },
        ],
      },
    });

    expect(disposition.kind).toBe('no-whole-password-recognized');
  });

  it.each([
    ['qzmpvx', 'whole-password-recognized'],
    ['qZ4!m2', 'whole-password-recognized'],
    ['kfxqztmpvlbw', 'whole-password-recognized'],
    ['kfxqztmpvlbwh', 'no-whole-password-recognized'],
    ['aA0~bB1?', 'whole-password-recognized'],
    ['aA0~bB1?c', 'no-whole-password-recognized'],
    ['😀😀😀😀', 'whole-password-recognized'],
  ] as const)(
    'applies the final exhaustive-search boundary to %s',
    (fictionalPassword, expectedKind) => {
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword,
        componentAnalysis: passwordAnalysisWithoutRecognizedCandidate(),
      });

      expect(disposition.kind).toBe(expectedKind);
      if (expectedKind === 'whole-password-recognized') {
        expect(disposition).toMatchObject({
          ruleId: 'whole-password-recognized-exhaustive-search',
          findingIds: [],
          explanationId: 's05.disposition.whole-password-recognized-exhaustive-search',
        });
      }
    },
  );

  it('keeps a concrete candidate explanation ahead of exhaustive search', () => {
    const fictionalPassword = 'passwort';
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis: analyzeFictionalPassword({ fictionalPassword }),
    });

    expect(disposition).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-value',
    });
  });

  it('keeps the 15-character orientation separate from whole-password recognition', () => {
    const shortRandom = 'qZ4!m2V?x8P#';
    const shortDisposition = determinePasswordSimulationDisposition({
      fictionalPassword: shortRandom,
      componentAnalysis: passwordAnalysisWithoutRecognizedCandidate(),
    });
    const longKnown = 'passwortpasswort';
    const longDisposition = determinePasswordSimulationDisposition({
      fictionalPassword: longKnown,
      componentAnalysis: passwordAnalysisWithFindings([
        {
          id: 'single:repeated-component:0-16:0',
          kind: 'repeated-component',
          evidence: [{ type: 'span', start: 0, end: 16, token: longKnown }],
          explanationId: 's05.repeated-component',
          confidence: 'bounded-heuristic',
        },
      ]),
    });

    expect(shortDisposition).toMatchObject({
      kind: 'no-whole-password-recognized',
      lengthOrientation: 'below-15',
    });
    expect(longDisposition).toMatchObject({
      kind: 'whole-password-recognized',
      lengthOrientation: 'at-least-15',
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
      ['Campusgram', '2026', '!', '2026', '!'],
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

  it('does not infer a repetition from unrelated lexical components', () => {
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
    ['IchWiederholeZwischenIchWiederhole', ['IchWiederhole', 'IchWiederhole']],
    ['haha242424haha', ['haha', '242424', 'haha']],
    ['DatensicherheitDatens1cherheit', ['Datensicherheit', 'Datens1cherheit']],
    ['datensicherheitdatensxicherheit', ['datensicherheit', 'datensxicherheit']],
  ] as const)('recognizes separated or once-modified repetition in %s', (fictionalPassword, tokens) => {
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const repeatedTokens = componentAnalysis.findings.flatMap((finding) =>
      finding.kind === 'repeated-component'
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token] : [],
          )
        : [],
    );
    const structure = analyzeFictionalPasswordStructure({
      fictionalPassword,
      componentAnalysis,
    });

    expect(repeatedTokens).toEqual(expect.arrayContaining([...tokens]));
    expect(structure.findings.map(({ findingKind }) => findingKind)).toContain(
      'recognized-repetition-pattern',
    );
  });

  it('keeps Datensicherheit intact when the second occurrence has one leet change', () => {
    const result = analyzeFictionalPassword({
      fictionalPassword: 'DatensicherheitDatens1cherheit',
    });
    const tokens = result.findings.flatMap((finding) =>
      finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toContain('datensicherheit');
    expect(tokens).toContain('datens1cherheit');
    expect(tokens).not.toContain('date');
    expect(tokens).not.toContain('n');
  });

  it.each([
    ['ichliebedichbiszummond', ['ich', 'liebe', 'dich', 'bis', 'zum', 'mond']],
    ['IchLiebeDichBisZumMond', ['ich', 'liebe', 'dich', 'bis', 'zum', 'mond']],
    ['meinstarkesunipasswort2026!', ['mein', 'starkes', 'uni', 'passwort', '2026', '!']],
    ['MeinStarkesUniPasswort2026!', ['mein', 'starkes', 'uni', 'passwort', '2026', '!']],
  ] as const)('keeps the complete canonical lexical path for %s', (fictionalPassword, expected) => {
    const result = analyzeFictionalPassword({
      fictionalPassword,
      authoredAccountTerms: ['Uni', 'Universität', 'Universitaet'],
    });
    const tokens = result.findings.flatMap((finding) =>
      finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toEqual(expect.arrayContaining([...expected]));
    expect(tokens).not.toContain('zummo');
    expect(tokens).not.toContain('nd');
    expect(tokens).not.toContain('date');
    expect(tokens).not.toContain('n');
    expect(tokens).not.toContain('2026!');
  });

  it('uses an embedded keyboard path as a boundary without hiding adjacent words', () => {
    const result = analyzeFictionalPassword({
      fictionalPassword: 'MeinqwertzStarkesPasswort',
    });
    const tokens = result.findings.flatMap((finding) =>
      finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toEqual(expect.arrayContaining(['mein', 'qwertz', 'starkes', 'passwort']));
    expect(tokens).not.toContain('meinqwertz');
  });

  it('prefers the curated full compound Datensicherheit over nested dictionary parts', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'Datensicherheit' });
    const tokens = result.findings.flatMap((finding) =>
      finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toContain('datensicherheit');
    expect(tokens).not.toContain('daten');
    expect(tokens).not.toContain('sicherheit');
  });

  it.each([
    ['eisichbintotpo', ['eis', 'ich', 'bin', 'tot', 'po']],
    ['ichbineineispo', ['ich', 'bin', 'ein', 'eis', 'po']],
    ['ichhabeineispo', ['ich', 'habe', 'in', 'eis', 'po']],
    ['eisölindapo', ['eis', 'öl', 'in', 'da', 'po']],
  ] as const)('keeps a complete short-word partition for %s', (fictionalPassword, expected) => {
    const result = analyzeFictionalPassword({ fictionalPassword });
    const tokens = result.findings.flatMap((finding) =>
      finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toEqual(expect.arrayContaining([...expected]));
  });

  it.each(['LKW', 'DVD', 'LOL', 'DHL'] as const)(
    'recognizes the curated short abbreviation %s only as an exact lexical unit',
    (fictionalPassword) => {
      const result = analyzeFictionalPassword({ fictionalPassword });
      const tokens = result.findings.flatMap((finding) =>
        finding.evidence.flatMap((evidence) =>
          evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
        ),
      );

      expect(tokens).toContain(fictionalPassword.toLocaleLowerCase('de-DE'));
    },
  );

  it.each([
    ['es', ['es']],
    ['in', ['in']],
    ['ich', ['ich']],
    ['du', ['du']],
    ['bis', ['bis']],
    ['zum', ['zum']],
    ['öl', ['öl']],
    ['po', ['po']],
    ['the', ['the']],
    ['and', ['and']],
    ['you', ['you']],
    ['for', ['for']],
    ['may', ['may']],
    ['sind', ['sind']],
  ] as const)(
    'keeps the intended exact lexical candidate for %s without selecting a shorter inner word',
    (fictionalPassword, expectedTokens) => {
      const result = analyzeFictionalPassword({ fictionalPassword });
      const dictionaryTokens = result.findings.flatMap((finding) =>
        finding.kind === 'common-password-core' ||
        finding.kind === 'common-word' ||
        finding.kind === 'common-name'
          ? finding.evidence.flatMap((evidence) =>
              evidence.type === 'span'
                ? [evidence.token.toLocaleLowerCase('de-DE')]
                : [],
            )
          : [],
      );

      expect(dictionaryTokens).toEqual(expectedTokens);
    },
  );

  it.each([
    'ml',
    'vx',
    'pk',
    'tte',
    'lch',
    'aii',
    'unh',
    'chte',
    'fãœr',
    'chffffff',
    'cctv',
    'stiii',
  ] as const)(
    'does not project the audited corpus artefact %s as an ordinary word',
    (fictionalPassword) => {
      const result = analyzeFictionalPassword({ fictionalPassword });
      const ordinaryWordTokens = result.findings.flatMap((finding) =>
        finding.kind === 'common-word'
          ? finding.evidence.flatMap((evidence) =>
              evidence.type === 'span' ? [evidence.token] : [],
            )
          : [],
      );

      expect(ordinaryWordTokens).toEqual([]);
    },
  );

  it('does not reinterpret a leet-modified short abbreviation as an exact lexical unit', () => {
    const result = analyzeFictionalPassword({ fictionalPassword: 'L0L' });
    const dictionarySpans = result.findings.flatMap((finding) =>
      finding.kind === 'common-password-core' ||
      finding.kind === 'common-word' ||
      finding.kind === 'common-name'
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token] : [],
          )
        : [],
    );

    expect(dictionarySpans).not.toContain('L0L');
  });

  it('keeps separator-connected words visible without treating word count as a hit', () => {
    const fictionalPassword = 'Ich-liebe--dich---meine';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
    });

    expect(disposition.kind).toBe('no-whole-password-recognized');
    expect(
      componentAnalysis.findings.flatMap((finding) =>
        finding.evidence.flatMap((evidence) =>
          evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
        ),
      ),
    ).toEqual(expect.arrayContaining(['ich', 'liebe', 'dich', 'meine']));
  });

  it('uses confirmed sentence links across separator-connected words', () => {
    const fictionalPassword = 'Ich-liebe--dich---meine';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
      semanticEvidence: {
        kind: 'transient-password-semantic-evidence',
        confirmed: true,
        relations: [
          {
            id: 'semantic:sentence:0',
            kind: 'sentence-or-phrase',
            evidence: [
              { type: 'span', start: 0, end: 3, token: 'Ich' },
              { type: 'span', start: 4, end: 9, token: 'liebe' },
              { type: 'span', start: 11, end: 15, token: 'dich' },
              { type: 'span', start: 18, end: 23, token: 'meine' },
            ],
          },
        ],
      },
    });

    expect(disposition).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-semantic-path',
    });
  });

  it('does not let one relation explain unrelated short lexical components', () => {
    const fictionalPassword = 'eisichbintotpo';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
      semanticEvidence: {
        kind: 'transient-password-semantic-evidence',
        confirmed: true,
        relations: [
          {
            id: 'semantic:partial-short-words',
            kind: 'shared-content',
            evidence: [
              { type: 'span', start: 0, end: 3, token: 'eis' },
              { type: 'span', start: 8, end: 11, token: 'tot' },
            ],
          },
        ],
      },
    });

    expect(disposition.kind).toBe('no-whole-password-recognized');
  });

  it('uses a participant-marked personal span without treating it as an automatic dictionary fact', () => {
    const fictionalPassword = 'BVBKaffee';
    const componentAnalysis = analyzeFictionalPassword({ fictionalPassword });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword,
      componentAnalysis,
      semanticEvidence: {
        kind: 'transient-password-semantic-evidence',
        confirmed: true,
        relations: [
          {
            id: 'semantic:personal:bvb',
            kind: 'personal-context',
            evidence: [{ type: 'span', start: 0, end: 3, token: 'BVB' }],
          },
          {
            id: 'semantic:content:bvb-kaffee',
            kind: 'shared-content',
            evidence: [
              { type: 'span', start: 0, end: 3, token: 'BVB' },
              { type: 'span', start: 3, end: 9, token: 'Kaffee' },
            ],
          },
        ],
      },
    });

    expect(disposition).toMatchObject({
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-semantic-path',
      semanticRelationIds: ['semantic:personal:bvb', 'semantic:content:bvb-kaffee'],
    });
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
          configurationVersion: 'passwo-bounded-whole-recognition-v13',
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
        configurationVersion: 'passwo-bounded-whole-recognition-v13',
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

  const campusgramIdentifiers = ['Campusgram', 'Campus Gram', 'Instagram', 'Insta'] as const;
  const masterCampusIdentifiers = [
    'MasterCampus',
    'Master Campus',
    'CampusWorkspace',
    'Campus Workspace',
    'CampusCloud',
    'Campus Cloud',
  ] as const;
  const campusEmailIdentifiers = [
    'CampusMail',
    'Campus Mail',
    'CampusEmail',
    'Campus Email',
    'Campus E-Mail',
    'Postfach',
  ] as const;

  function comparePasswords(
    sourcePassword: string,
    targetPassword: string,
    sourceAccountIdentifiers: readonly string[] = [],
    targetAccountIdentifiers: readonly string[] = [],
  ) {
    return compareFictionalPasswords({
      sourcePassword,
      targetPassword,
      sourceAccountIdentifiers,
      targetAccountIdentifiers,
    });
  }

  it.each([
    ['LunaCampusgram2026!', 'LunaCampusgram2026!', 'exact-match'],
    ['LunaCampusgram2026!', 'LunaCampusgram2027?', 'derived-variant-match'],
    ['LunaCampusgram2026', 'LunaCampusgram2026!', 'derived-variant-match'],
    ['hallo', 'hallo1', 'derived-variant-match'],
    ['hallo1', 'hallo', 'derived-variant-match'],
    ['Passwort1', 'Passwort2!', 'derived-variant-match'],
    ['HandyPasswort', 'Handy-Passwort', 'derived-variant-match'],
    ['Handy-Passwort', 'HandyPasswort', 'derived-variant-match'],
    ['rQ7mL2vX', 'rQ7mL2vY', 'derived-variant-match'],
    ['Passwrot', 'Passwort', 'derived-variant-match'],
    ['Passw0rt1!', 'Passwort1!', 'derived-variant-match'],
    ['LunaCampusgram2020!', 'LunaCampusgram2026!', 'derived-variant-match'],
    ['Passwort2020', 'Passwort2026', 'derived-variant-match'],
    ['hallo', 'hallo12!', 'no-derived-path-recognized'],
    ['hallo1!', 'Hallo2?', 'no-derived-path-recognized'],
    ['11111111!', '22222222?', 'no-derived-path-recognized'],
    ['Passwort49u52u', 'Passwort', 'no-derived-path-recognized'],
    ['Passwort', 'Passwort49u52u', 'no-derived-path-recognized'],
    ['MorgenKaffee7', 'MorgenTasse7', 'no-derived-path-recognized'],
    ['MorgenKaffee7', 'MorgenXqzpt7', 'no-derived-path-recognized'],
    ['a1b2c3d', 'x1y2z3d', 'no-derived-path-recognized'],
  ] as const)(
    'classifies general bounded edit path %s → %s through the fixed distance policy',
    (sourcePassword, targetPassword, relationKind) => {
      expect(comparePasswords(sourcePassword, targetPassword).relation.kind).toBe(relationKind);
    },
  );

  it('recognizes one bounded account-identifier replacement plus at most two residual edits', () => {
    const relation = comparePasswords(
      'LunaCampusgram2026!',
      'LunaMasterCampus2027?',
      campusgramIdentifiers,
      masterCampusIdentifiers,
    ).relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.basis).toBe('bounded-account-transformation');
    expect(relation.rawDistance).toBe(2);
    expect(relation.normalizedDistance).toBeCloseTo(2 / 9);
    expect(relation.pathCost).toBe(3);
    expect(relation.candidate).toBe('LunaMasterCampus2027?');
    expect(relation.transformationId).toBe('account-term-year-and-suffix-changed');
    expect(relation.steps.map(({ kind }) => kind)).toEqual([
      'account-term-replacement',
      'year-change',
      'suffix-change',
    ]);
    expect(relation.steps.map(({ sourceEvidence }) => sourceEvidence.token)).toEqual([
      'Campusgram',
      '2026',
      '!',
    ]);
    expect(relation.steps.map(({ targetEvidence }) => targetEvidence.token)).toEqual([
      'MasterCampus',
      '2027',
      '?',
    ]);
    expect(relation.steps.map(({ resultingCandidate }) => resultingCandidate)).toEqual([
      'LunaMasterCampus2026!',
      'LunaMasterCampus2027!',
      'LunaMasterCampus2027?',
    ]);
  });

  it('accepts account identifiers after a visible symbol connector', () => {
    const relation = comparePasswords(
      'Luna@Campusgram2026!',
      'Luna@MasterCampus2027?',
      campusgramIdentifiers,
      masterCampusIdentifiers,
    ).relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.basis).toBe('bounded-account-transformation');
    expect(relation.steps[0]?.kind).toBe('account-term-replacement');
  });

  it('accepts the visible acronym-to-word boundary of a bounded account identifier', () => {
    const relation = comparePasswords(
      'LunaABCCampusgram2026!',
      'LunaABCMasterCampus2027?',
      campusgramIdentifiers,
      masterCampusIdentifiers,
    ).relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.basis).toBe('bounded-account-transformation');
    expect(relation.steps[0]?.sourceEvidence.token).toBe('Campusgram');
    expect(relation.steps[0]?.targetEvidence.token).toBe('MasterCampus');
  });

  it('recognizes a narrow Campusgram-to-Campus-Mail identifier replacement', () => {
    const relation = comparePasswords(
      'LunaCampusgram2026!',
      'LunaCampusMail2027?',
      campusgramIdentifiers,
      campusEmailIdentifiers,
    ).relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.basis).toBe('bounded-account-transformation');
    expect(relation.steps[0]?.kind).toBe('account-term-replacement');
    expect(relation.steps[0]?.sourceEvidence.token).toBe('Campusgram');
    expect(relation.steps[0]?.targetEvidence.token).toBe('CampusMail');
  });

  it('rejects an account macro with three residual edits or without a four-character common core', () => {
    const tooManyResidualEdits = comparePasswords(
      'lunaCampusgram2026!',
      'LunaCampusMail2027?',
      campusgramIdentifiers,
      campusEmailIdentifiers,
    ).relation;
    const noCommonCore = comparePasswords(
      'Campusgram2026!',
      'MasterCampus2027?',
      campusgramIdentifiers,
      masterCampusIdentifiers,
    ).relation;

    expect(tooManyResidualEdits.kind).toBe('no-derived-path-recognized');
    expect(noCommonCore.kind).toBe('no-derived-path-recognized');
  });

  it('does not let broad context fragments create an account-specific replacement', () => {
    const relation = comparePasswords(
      'MeinStarkesPasswort',
      'MeMailrkesPasswort',
      campusgramIdentifiers,
      campusEmailIdentifiers,
    ).relation;

    expect(relation.kind).toBe('no-derived-path-recognized');
  });

  it('exposes the general edit metrics and paired semantic steps', () => {
    const sourcePassword = 'Passwort2026!';
    const targetPassword = 'Passwort2027?';
    const relation = comparePasswords(sourcePassword, targetPassword).relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.basis).toBe('normalized-restricted-damerau-levenshtein');
    expect(relation.rawDistance).toBe(2);
    expect(relation.normalizedDistance).toBeCloseTo(2 / 13);
    expect(relation.pathCost).toBe(2);
    expect(relation.transformationId).toBe('year-and-suffix-changed');
    expect(relation.steps.map(({ kind }) => kind)).toEqual(['year-change', 'suffix-change']);
    expect(relation.steps.map(({ sourceEvidence }) => sourceEvidence.token)).toEqual(['2026', '!']);
    expect(relation.steps.map(({ targetEvidence }) => targetEvidence.token)).toEqual(['2027', '?']);
    expect(relation.steps.map(({ resultingCandidate }) => resultingCandidate)).toEqual([
      'Passwort2027!',
      'Passwort2027?',
    ]);
    for (const step of relation.steps) {
      expect(sourcePassword.slice(step.sourceEvidence.start, step.sourceEvidence.end)).toBe(
        step.sourceEvidence.token,
      );
      expect(targetPassword.slice(step.targetEvidence.start, step.targetEvidence.end)).toBe(
        step.targetEvidence.token,
      );
    }
  });

  it.each([
    ['numeric insertion', 'hallo', 'hallo1', 'character-insertion'],
    ['numeric deletion', 'hallo1', 'hallo', 'character-deletion'],
    ['number component inserted', 'LangesPasswort!', 'LangesPasswort12!', 'number-change'],
    ['bounded terminal year', 'Passwort2020', 'Passwort2021', 'year-change'],
    ['separator inserted', 'HandyPasswort', 'Handy-Passwort', 'separator-change'],
    ['capitalization changed', 'HandyPasswort', 'handyPasswort', 'capitalization-change'],
    ['typical leetspeak changed', 'Passw0rt1!', 'Passwort1!', 'leet-substitution'],
    ['one character changed', 'rQ7mL2vX', 'rQ7mL2vY', 'character-substitution'],
    ['adjacent characters transposed', 'Passwrot', 'Passwort', 'adjacent-transposition'],
  ] as const)(
    'annotates %s from the accepted edit path',
    (_case, sourcePassword, targetPassword, stepKind) => {
      const relation = comparePasswords(sourcePassword, targetPassword).relation;
      expect(relation.kind).toBe('derived-variant-match');
      if (relation.kind !== 'derived-variant-match') return;
      expect(relation.steps.some(({ kind }) => kind === stepKind)).toBe(true);
      expect(relation.candidate).toBe(targetPassword);
    },
  );

  it('keeps adjacent insertions ordered and exposes each intermediate candidate', () => {
    const relation = comparePasswords('abcdefghij', 'abcXYZdefghij').relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.rawDistance).toBe(3);
    expect(relation.steps.map(({ kind }) => kind)).toEqual([
      'character-insertion',
      'character-insertion',
      'character-insertion',
    ]);
    expect(relation.steps.map(({ resultingCandidate }) => resultingCandidate)).toEqual([
      'abcXdefghij',
      'abcXYdefghij',
      'abcXYZdefghij',
    ]);
    expect(relation.steps.at(-1)?.resultingCandidate).toBe(relation.candidate);
  });

  it('keeps a multi-character frozen leetspeak substitution as one explained step', () => {
    const relation = comparePasswords('Langeswort2026', 'Langesvvort2026').relation;

    expect(relation.kind).toBe('derived-variant-match');
    if (relation.kind !== 'derived-variant-match') return;
    expect(relation.rawDistance).toBe(2);
    expect(relation.steps).toEqual([
      expect.objectContaining({
        kind: 'leet-substitution',
        sourceEvidence: expect.objectContaining({ token: 'w' }),
        targetEvidence: expect.objectContaining({ token: 'vv' }),
        cost: 2,
        resultingCandidate: 'Langesvvort2026',
      }),
    ]);
  });

  it.each([
    [
      'same sentence frame with two arbitrary word replacements',
      'IchAnanasBinSuperTraurig',
      'IchBananeBinSuperGlücklich',
    ],
    ['arbitrary word replacement', 'MorgenKaffee7', 'MorgenTasse7'],
    ['target-derived random component', 'MorgenKaffee7', 'MorgenXqzpt7'],
    ['three edits across a short password', 'a1b2c3d', 'x1y2z3d'],
    ['arbitrary longer target suffix', 'Passwort', 'Passwort49u52u'],
  ] as const)(
    'does not treat %s as a light derived path',
    (_case, sourcePassword, targetPassword) => {
      expect(comparePasswords(sourcePassword, targetPassword).relation.kind).toBe(
        'no-derived-path-recognized',
      );
    },
  );
});
