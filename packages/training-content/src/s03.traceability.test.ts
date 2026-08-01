import { describe, expect, it } from 'vitest';
import { S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('S03 content traceability', () => {
  it('keeps S03 linked to its named pages and canonical account structure', () => {
    expect(S03_CONTENT_VERSION).toBe('1.14.0');
    expect(s03Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [8, 9, 10, 11],
    });
    expect(s03Content.segment.id).toBe('S03');
    expect(Object.keys(s03Content.accountPages)).toEqual([
      'master-campus',
      'campus-email',
      'campusgram',
    ]);
    expect(s03Content.animations.slice(0, 3).map(({ id }) => id)).toEqual([
      's03-result-master-campus',
      's03-result-campus-email',
      's03-result-campusgram',
    ]);
    expect(s03Content.narration.warning).toContain('Campusgram');
    expect(s03Content.narration.warning).not.toContain('Tab');
    expect(s03Content.animations.at(-1)?.id).toBe('s03-completion-timeskip');
  });
});
