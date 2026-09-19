import { afterEach, describe, expect, it, vi } from 'vitest';

const nativeSegmenter = Intl.Segmenter;

afterEach(() => {
  Object.defineProperty(Intl, 'Segmenter', {
    configurable: true,
    value: nativeSegmenter,
  });
  vi.resetModules();
});

describe('password comparison without Intl.Segmenter', () => {
  it('keeps bounded Unicode comparisons available in older browsers', async () => {
    Object.defineProperty(Intl, 'Segmenter', {
      configurable: true,
      value: undefined,
    });
    vi.resetModules();

    const { compareFictionalPasswords } = await import('./index.js');
    const comparison = compareFictionalPasswords({
      sourcePassword: 'Cafe\u0301-2026',
      targetPassword: 'Caf\u00e9-2027',
      sourceAccountIdentifiers: [],
      targetAccountIdentifiers: [],
    });

    expect(comparison.relation.kind).toBe('derived-variant-match');
  });
});
