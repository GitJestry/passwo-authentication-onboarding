import { describe, expect, it } from 'vitest';
import { S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('S03 content traceability', () => {
  it('keeps the scripted retrieval sequence and login labels versioned', () => {
    expect(S03_CONTENT_VERSION).toBe('1.2.0');
    expect(s03Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [8, 9, 10, 11],
    });
    expect(s03Content.controls.accountDataLabel).toBe('Kontodaten');
    expect(s03Content.controls.passwordLabel).toBe('Passwort');
    expect(s03Content.controls.openLogin('CampusID')).toBe('Anmelden mit CampusID');
  });
});
