import { describe, expect, it } from 'vitest';
import { S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('S03 content traceability', () => {
  it('keeps the scripted retrieval sequence and login labels versioned', () => {
    expect(S03_CONTENT_VERSION).toBe('1.5.0');
    expect(s03Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [8, 9, 10, 11],
      revision: 'Userauftrag vom 2026-07-29',
    });
    expect(s03Content.controls.accountDataLabel).toBe('Benutzername');
    expect(s03Content.controls.passwordLabel).toBe('Passwort');
    expect(s03Content.controls.openLogin('Master Campus')).toBe('Anmelden mit Master Campus');
    expect(s03Content.controls.assistedLogin).toBe('Für mich anmelden');
    expect(Object.keys(s03Content.narration.completionByRememberedCount)).toEqual([
      '0',
      '1',
      '2',
      '3',
    ]);
  });
});
