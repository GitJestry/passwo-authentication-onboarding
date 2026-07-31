import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

describe('S00 to S02 training-content traceability', () => {
  it('keeps the S00 safety boundary in PassWo narration from the named script page', () => {
    expect(S00_CONTENT_VERSION).toBe('1.11.0');
    expect(s00Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
      uxReference: 'Vom Nutzer bereitgestellte UX-Konzeptboards, 2026-07-31',
    });
    const safetyText = s00Content.narration.safetyWarning;
    expect(safetyText).toContain('keine eigenen Passwörter');
    expect(safetyText).toContain('Varianten davon');
    expect(s00Content.narration.accountExplanations.map(({ accountId }) => accountId)).toEqual([
      'campus-mail',
      'campus-board-archive',
    ]);
    expect(s00Content.browser.page.title).not.toBe('Dein Campus-Start');
    expect(s00Content.sectionTransition).toEqual({
      label: 'Sektion 1',
      title: 'Starke Passwörter',
      holdDurationMs: 3500,
    });
  });

  it('keeps the S01 account order and account-specific website identity from the named script page', () => {
    expect(S01_CONTENT_VERSION).toBe('2.10.0');
    expect(s01Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
      uxReference: 'Vom Nutzer bereitgestellte UX-Konzeptboards, 2026-07-31',
    });
    expect(s01Content.browser.accounts.map(({ label }) => label)).toEqual([
      'Master Campus',
      'Campus E-Mail',
      'Campusgram',
    ]);
    expect(s01Content.browser.accounts.map(({ symbolId }) => symbolId)).toEqual([
      'campus-id',
      'campus-mail',
      'campus-board-archive',
    ]);
    expect(s01Content.browser.accounts.map(({ landing }) => landing.registerLabel)).toEqual([
      'Registrieren',
      'Registrieren',
      'Registrieren',
    ]);
    expect(s01Content.browser.accounts.map(({ landingNavigation }) => landingNavigation)).toEqual([
      ['Überblick', 'Sicherheit', 'Hilfe'],
      ['Posteingang', 'Ordner', 'Einstellungen', 'Hilfe'],
      ['Archiv', 'Themen', 'Suche'],
    ]);
  });

  it('keeps the S02 account map and content-oriented PassWo narration versioned', () => {
    expect(S02_CONTENT_VERSION).toBe('3.7.0');
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
    });
    expect(s02Content.scene.accounts.map(({ label }) => label)).toEqual([
      'Master Campus',
      'Campus E-Mail',
      'Campusgram',
    ]);
    expect(s02Content.narration.messages[s02Content.narration.introId]).toContain(
      'drei Hauptkonten',
    );
    expect(s02Content.narration.messages[s02Content.narration.introId]).toContain('„Nächste“');
    expect(s02Content.narration.messages['s02.campus-id.cloud-notes']).toContain(
      'persönliche Fotos',
    );
    expect(s02Content.scene.accounts[0]?.details[2]?.preview).toEqual({ kind: 'cloud-files' });
  });
});
