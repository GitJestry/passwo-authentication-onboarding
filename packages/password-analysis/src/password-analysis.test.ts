import { describe, expect, it } from 'vitest';
import { analyzeFictionalPassword, compareFictionalPasswords } from './index.js';

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
      const result = analyzeFictionalPassword({ fictionalPassword, authoredAccountTerms });
      expect(result.findings.map(({ kind }) => kind)).toEqual(kinds);
      for (const finding of result.findings) {
        expect(finding.id).toMatch(/^single:/u);
        expect(finding.explanationId).toMatch(/^s05\./u);
        expect(['authored-exact-match', 'bounded-heuristic']).toContain(finding.confidence);
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
});
