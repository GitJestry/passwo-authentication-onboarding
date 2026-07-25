import { describe, expect, it } from 'vitest';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';

describe('S01 content', () => {
  it('traces the ordinary account setup content to internal page 3', () => {
    expect(s01Content.version).toBe(S01_CONTENT_VERSION);
    expect(s01Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
    });
    expect(s01Content.segment).toEqual({ id: 'S01', sectionId: 'passwords' });
  });

  it('defines exactly the three authored fictional accounts and the completion message', () => {
    expect(s01Content.browser.accounts).toEqual([
      expect.objectContaining({ id: 'campus-id', accountData: 'alex27@campus.example' }),
      expect.objectContaining({ id: 'campus-mail', accountData: 'alex27@mail.campus.example' }),
      expect.objectContaining({ id: 'campus-board-archive', accountData: 'alex_board' }),
    ]);
    expect(s01Content.completion.guideMessage).toContain('Die drei Konten sind eingerichtet.');
  });
});
