import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

const canonicalAccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;

describe('S00 to S02 training-content traceability', () => {
  it('keeps S00 linked to its named source page and canonical accounts', () => {
    expect(S00_CONTENT_VERSION).toBe('1.17.2');
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
    expect(s00Content.entry.paragraphs[2]).toContain('sicher schützen würdest');
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
    expect(S01_CONTENT_VERSION).toBe('2.16.1');
    expect(s01Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#s01----konten-einrichten-und-browser-verlassen',
    });
    expect(s01Content.segment.id).toBe('S01');
    expect(s01Content.browser.accounts.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s01Content.completion.guideMessage).toBe(
      'Die drei Konten sind eingerichtet. Schließe jetzt das Browserfenster. Bevor du dich wieder anmeldest, schauen wir uns kurz an, was hinter den Konten steckt.',
    );
    expect(s01Content.completion.guideMessage).not.toMatch(/Knoten|Dienste|Funktionen/u);
    expect(s01Content.quest).not.toHaveProperty('readyToContinue');
    expect(s01Content.quest.guideMessage).toContain('merken kannst');
  });

  it('keeps S02 linked to its named pages and essential account-node structure', () => {
    expect(S02_CONTENT_VERSION).toBe('4.3.3');
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s02-netzwerk-orientierung-3-august-2026',
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
    expect(s02Content.page.globalProgress(2)).toBe('Konten erkundet: 2/3 angesehen');
    expect(s02Content.page.eyebrow).toBe('Konten erkundet');
    expect(s02Content.page.completion).toBe('Konto erkundet');
    expect(s02Content.narration.completion('mac')).toBe(
      'Du hast dir alle drei Konten angesehen. Klicke unten im Dock auf den Browser, um dich wieder anzumelden.',
    );
    expect(s02Content.narration.completion('linux')).toBe(
      'Du hast dir alle drei Konten angesehen. Klicke links in der Taskleiste auf den Browser, um dich wieder anzumelden.',
    );
    expect(s02Content.narration.completion('windows')).toBe(
      'Du hast dir alle drei Konten angesehen. Klicke unten in der Taskleiste auf den Browser, um dich wieder anzumelden.',
    );
    expect(s02Content.narration.messages[s02Content.narration.introId]).toBe(
      'Im Alltag ist nicht immer sichtbar, welche Funktionen mit einem Konto verbunden sind. Deshalb habe ich die drei Konten als Netzwerk dargestellt.',
    );
    expect(s02Content.narration.messages[s02Content.narration.introReadyId]).toBe(
      'Du musst dir keine Einzelheiten merken – vieles kommt dir wahrscheinlich bekannt vor. Wähle einen Kontoknoten aus, den du zuerst erkunden möchtest.',
    );
    expect(s02Content.scene.accounts.map(({ coreAction }) => coreAction.targetDetailIds)).toEqual([
      ['master-campus-workspace'],
      ['campus-email-reset-links'],
      ['campusgram-direct-messages'],
    ]);
  });
});
