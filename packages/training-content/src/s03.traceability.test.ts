import { describe, expect, it } from 'vitest';
import { S03_CONTENT_VERSION, s03Content } from './s03.js';

describe('S03 content traceability', () => {
  it('keeps the scripted retrieval sequence and login labels versioned', () => {
    expect(S03_CONTENT_VERSION).toBe('1.10.0');
    expect(s03Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [8, 9, 10, 11],
      revision: 'Userauftrag vom 2026-08-01 und UX-Konzeptboards vom 2026-07-31',
    });
    expect(s03Content.controls.accountDataLabel).toBe('Benutzername');
    expect(s03Content.controls.passwordLabel).toBe('Passwort');
    expect(s03Content.controls.openLogin('Master Campus')).toBe('Anmelden mit Master Campus');
    expect(s03Content.controls.assistedLogin).toBe('Für mich anmelden');
    expect(s03Content.narration.thirdFailedLogin).toBe(
      'Wenn du dich nicht an das richtige Passwort erinnern kannst, klicke als Lösung auf „Passwort vergessen?“.',
    );
    expect(Object.keys(s03Content.narration.completionByRememberedCount)).toEqual([
      '0',
      '1',
      '2',
      '3',
    ]);
    expect(s03Content.accountPages['campus-id'].modules[1]?.value).toBe(
      'Campus Workspace · Campus Services · Campus Cloud',
    );
    expect(s03Content.accountPages['campus-board-archive'].modules).toEqual([
      { label: 'Bereiche', value: 'Direktnachrichten · Gruppen und Kontakte' },
      { label: 'Aktivitäten', value: 'Beiträge und Reaktionen' },
    ]);
  });
});
