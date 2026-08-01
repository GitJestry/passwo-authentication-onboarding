import { describe, expect, it } from 'vitest';
import type { PasswordAnalysisResult, PasswordEvidenceSpan } from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
  compareFictionalPasswords,
} from './index.js';

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
    for (const span of result.findings.flatMap(({ evidence }) => evidence)) {
      expect(fictionalPassword.slice(span.start, span.end)).toBe(span.token);
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

  it.each([
    ['Campus2026!', 'Campus2026!', 'identical'],
    ['Campus2025!', 'Campus2026?', 'similar'],
    ['Passw0rt1!', 'Passwort2?', 'similar'],
    ['MorgenKaffee7', 'MorgenTasse7', 'no-derived-path-recognized'],
    ['rQ7mL2vX', 'rQ7mL2vY', 'no-derived-path-recognized'],
  ] as const)('classifies %s and %s without generic edit distance', (source, target, outcome) => {
    expect(compareFictionalPasswords(source, target).outcome).toBe(outcome);
  });

  it('grounds comparison evidence in the two concrete passwords', () => {
    const sourcePassword = 'Campus2025!';
    const targetPassword = 'Campus2026?';
    const finding = compareFictionalPasswords(sourcePassword, targetPassword).findings[0];
    const spans = finding?.evidence.filter((evidence) => evidence.type === 'span') ?? [];

    expect(spans).toHaveLength(2);
    expect(sourcePassword.slice(spans[0]?.start, spans[0]?.end)).toBe(spans[0]?.token);
    expect(targetPassword.slice(spans[1]?.start, spans[1]?.end)).toBe(spans[1]?.token);
    expect(finding?.evidence.some((evidence) => evidence.type === 'token')).toBe(false);
  });
});
