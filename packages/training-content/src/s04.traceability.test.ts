import { describe, expect, it } from 'vitest';
import { S04_CONTENT_VERSION, s04Content } from './s04.js';

describe('S04 content traceability', () => {
  it('keeps the leak explanation within its named source and research boundary', () => {
    expect(S04_CONTENT_VERSION).toBe('1.2.0');
    expect(s04Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPages: [12],
    });
    expect(s04Content.segment).toEqual({ id: 'S04', sectionId: 'passwords' });
    expect(s04Content.notice.paragraphs.join(' ')).toMatch(/offline getestet/iu);
    expect(s04Content.notice.paragraphs.join(' ')).toMatch(/wie der Angreifer vorgeht/iu);
    expect(s04Content.notice.continueLabel).toBe('Passwort prüfen');
    expect(JSON.stringify(s04Content)).not.toMatch(
      /kontoübergreifend|Passwortstärke|absolut sicher/iu,
    );
  });
});
