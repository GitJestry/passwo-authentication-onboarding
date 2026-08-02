import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

const canonicalAccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;

describe('S00 to S02 training-content traceability', () => {
  it('keeps S00 linked to its named source page and canonical accounts', () => {
    expect(S00_CONTENT_VERSION).toBe('1.16.0');
    expect(s00Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#s00----einstieg-und-browserorientierung',
    });
    expect(s00Content.segment.id).toBe('S00');
    expect(s00Content.browser.tabs.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s00Content.entry.paragraphs[0]).toBe(
      'Aloha! Ich bin PassWo und begleite dich heute durch das Training.',
    );
    expect(s00Content.narration.greeting).toBe(
      'Das ist dein virtueller Browser: Oben wechselst du zwischen drei Konten und richtest alle drei ein.',
    );
    expect(s00Content.narration).not.toHaveProperty('accountExplanations');
    expect(s00Content.narration.safetyWarning).toContain(
      'Nutze keine echten Passwörter oder Varianten davon.',
    );
    expect(s00Content.narration.safetyWarning).toContain(
      'nur lokal für diese fiktive Übung ausgewertet und nicht dauerhaft gespeichert',
    );
  });

  it('keeps S01 linked to its named source page and canonical account order', () => {
    expect(S01_CONTENT_VERSION).toBe('2.15.0');
    expect(s01Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#s01----konten-einrichten-und-browser-verlassen',
    });
    expect(s01Content.segment.id).toBe('S01');
    expect(s01Content.browser.accounts.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s01Content.completion.guideMessage).toBe(
      'Die drei Konten sind eingerichtet. Schließe jetzt das Browserfenster über die Schließen-Schaltfläche in der Fenstersteuerung.',
    );
    expect(s01Content.completion.guideMessage).not.toMatch(/Knoten|Dienste|Funktionen/u);
    expect(s01Content.quest).not.toHaveProperty('readyToContinue');
  });

  it('keeps S02 linked to its named pages and essential account-node structure', () => {
    expect(S02_CONTENT_VERSION).toBe('3.11.0');
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
    });
    expect(s02Content.segment.id).toBe('S02');
    expect(s02Content.scene.accounts.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s02Content.scene.accounts.map(({ details }) => details.map(({ id }) => id))).toEqual([
      [
        'master-campus-workspace',
        'master-campus-services',
        'master-campus-campus-cloud',
      ],
      [
        'campus-email-notifications',
        'campus-email-confirmations',
        'campus-email-reset-links',
        'campus-email-impersonation',
      ],
      [
        'campusgram-direct-messages',
        'campusgram-groups-contacts',
        'campusgram-posts-reactions',
      ],
    ]);
  });
});
