import { describe, expect, it } from 'vitest';
import { S04_CONTENT_VERSION, s04Content } from './s04.js';

describe('S04 content traceability', () => {
  it('keeps the leak explanation within its copy audit and research boundary', () => {
    expect(S04_CONTENT_VERSION).toBe('1.12.0');
    expect(s04Content.source).toMatchObject({
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s04-direkter-campusgram-passworthinweis-24-august-2026',
    });
    expect(s04Content.segment).toEqual({ id: 'S04', sectionId: 'passwords' });
    expect(s04Content.notice.paragraphs[1]).toBe(
      'Wie geht ein Angreifer vor, um das Campusgram-Passwort herauszufinden?',
    );
    expect(s04Content.notice.paragraphs).toHaveLength(2);
    expect(s04Content.notice.continueLabel).toBe('Angreiferperspektive');
    expect(s04Content.notice.advisory).toBe('Ändere deshalb dein Campusgram-Passwort.');
    expect(s04Content.notice.passwordChange).toMatchObject({
      currentPasswordLabel: 'Aktuelles Passwort',
      newPasswordLabel: 'Neues Passwort',
      confirmPasswordLabel: 'Neues Passwort bestätigen',
    });
    expect(JSON.stringify(s04Content)).not.toMatch(
      /kontoübergreifend|Passwortstärke|stark genug|absolut sicher/iu,
    );
  });
});
