import { describe, expect, it } from 'vitest';
import { S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('S03 training-content traceability', () => {
  it('keeps the scripted retrieval choice, account identities, and S04 boundary', () => {
    expect(S03_CONTENT_VERSION).toBe('1.1.0');
    expect(s03Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [8, 9, 10, 11],
    });
    expect(s03Content.controls.passwordLabel).toBe('Passwort');
    expect(s03Content.controls.skip).toBe('Ich weiß es nicht mehr — weiter');
    expect(Object.keys(s03Content.accountPages)).toEqual([
      'campus-id',
      'campus-mail',
      'campus-board-archive',
    ]);
    expect(s03Content.page.resultLine).not.toContain('Datenleck');
    expect(s03Content.narration.warning).not.toContain('Datenleck');
  });
});
