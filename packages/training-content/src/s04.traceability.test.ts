import { describe, expect, it } from 'vitest';
import { S04_CONTENT_VERSION, s04Content } from './s04.js';

describe('S04 content traceability', () => {
  it('keeps the leak explanation within its named source and research boundary', () => {
    expect(S04_CONTENT_VERSION).toBe('1.7.0');
    expect(s04Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [12],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s04s05-neuer-angreiferübergang-und-häufig-verwendete-passwörter-4-august-2026',
    });
    expect(s04Content.segment).toEqual({ id: 'S04', sectionId: 'passwords' });
    expect(s04Content.notice.paragraphs.join(' ')).toMatch(/Angreiferperspektive/iu);
    expect(s04Content.notice.paragraphs[1]).toBe(
      'Wie schwer wäre es für den Angreifer, dein Passwort herauszufinden?',
    );
    expect(s04Content.notice.paragraphs[2]).toBe(
      'Dafür nehmen wir jetzt die Angreiferperspektive ein.',
    );
    expect(s04Content.notice.continueLabel).toBe('Angreiferperspektive');
    expect(JSON.stringify(s04Content)).not.toMatch(
      /kontoübergreifend|Passwortstärke|stark genug|absolut sicher/iu,
    );
  });
});
