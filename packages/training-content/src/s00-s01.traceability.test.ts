import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';

describe('S00 and S01 training-content traceability', () => {
  it('keeps the S00 safety boundary in PassWo narration from the named script page', () => {
    expect(S00_CONTENT_VERSION).toBe('1.2.0');
    expect(s00Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
    });
    const safetyText = `${s00Content.narration.greetingTemplate} ${s00Content.narration.instruction}`;
    expect(safetyText).toContain('keine eigenen Passwörter');
    expect(safetyText).toContain('Varianten davon');
    expect(safetyText).toContain('neue, ausgedachte Passwörter');
    expect(safetyText).toContain('Kontodaten sind bereits eingetragen');
    expect(s00Content.browser.page.title).not.toBe('Dein Campus-Start');
  });

  it('keeps the S01 account order and account-specific website identity from the named script page', () => {
    expect(S01_CONTENT_VERSION).toBe('2.2.0');
    expect(s01Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
    });
    expect(s01Content.browser.accounts.map(({ label }) => label)).toEqual([
      'CampusID',
      'CampusMail',
      'CampusBoard Archiv',
    ]);
    expect(s01Content.browser.accounts.map(({ symbolId }) => symbolId)).toEqual([
      'campus-id',
      'campus-mail',
      'campus-board-archive',
    ]);
  });
});
