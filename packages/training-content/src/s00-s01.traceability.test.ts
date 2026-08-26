import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

const canonicalAccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;

describe('S00 to S02 training-content traceability', () => {
  it('keeps S00 linked to its named source page and canonical accounts', () => {
    expect(S00_CONTENT_VERSION).toBe('1.25.0');
    expect(s00Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s00-eigene-passwoerter-23-august-2026',
    });
    expect(s00Content.segment.id).toBe('S00');
    expect(s00Content.sectionTransition).toMatchObject({
      label: 'Sektion 1 von 3',
      title: 'Starke Passwörter',
      holdDurationMs: 3500,
      parts: [
        { id: 'account-setup', label: 'Konten einrichten' },
        { id: 'password-strength', label: 'Passwortstärke verstehen' },
        { id: 'unique-passwords', label: 'Für jedes Konto ein eigenes Passwort' },
        { id: 'change-passwords', label: 'Passwort sicher ersetzen' },
      ],
    });
    expect(s00Content.browser.tabs.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s00Content.entry.paragraphs[0]).toBe(
      'Aloha! Ich bin PassWo und begleite dich heute durch das Training.',
    );
    expect(s00Content.entry.paragraphs[1]).toContain('sicher schützen würdest');
    expect(s00Content.entry.paragraphs[2]).toBe(
      'Später meldest du dich noch einmal bei allen drei Konten an. Wähle die Passwörter daher so, dass du sie wieder abrufen kannst.',
    );
    expect(s00Content.entry.nameLabel).toBe(
      'Welchen fiktiven Benutzernamen möchtest du verwenden?',
    );
    expect(s00Content.narration.greeting).toBe(
      'Das ist dein virtueller Browser: Oben wechselst du zwischen drei Konten und richtest alle drei ein.',
    );
    expect(s00Content.narration).not.toHaveProperty('accountExplanations');
    expect(s00Content.narration.safetyWarning).toContain(
      'Bitte keine echten Passwörter oder Varianten davon verwenden.',
    );
    expect(s00Content.narration.safetyWarning).toContain(
      'nur für diese Übung verarbeitet und nicht gespeichert',
    );
  });

  it('keeps S01 linked to its named source page and canonical account order', () => {
    expect(S01_CONTENT_VERSION).toBe('2.16.5');
    expect(s01Content.source).toMatchObject({
      document: 'research/private/training-script.pdf',
      internalPage: 3,
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s01-einheitliche-master-campus-navigation-26-august-2026',
    });
    expect(s01Content.segment.id).toBe('S01');
    expect(s01Content.browser.accounts.map(({ id }) => id)).toEqual(canonicalAccountIds);
    expect(s01Content.completion.guideMessage).toBe(
      'Die drei Konten sind eingerichtet. Schließe jetzt das simulierte Browserfenster. Bevor du dich wieder anmeldest, schauen wir uns kurz an, was hinter den Konten steckt.',
    );
    expect(s01Content.completion.guideMessage).not.toMatch(/Knoten|Dienste|Funktionen/u);
    expect(s01Content.quest).not.toHaveProperty('readyToContinue');
    expect(s01Content.quest.guideMessage).toContain('merken kannst');
    expect(s01Content.controls.passwordTooLong).toBe('max. 128 Zeichen');
  });

  it('keeps S02 linked to its named pages and essential account-node structure', () => {
    expect(S02_CONTENT_VERSION).toBe('5.4.1');
    expect(s02Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPages: [4, 5, 6, 7],
      copyReference:
        'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s02-entlastender-auswahlhinweis-11-august-2026',
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
    expect(s02Content.page.completion).toBe('Konten erkundet');
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
      'Im Alltag ist oft nicht sichtbar, was alles mit einem Konto verbunden ist.',
    );
    expect(s02Content.narration.messages[s02Content.narration.introModelId]).toBe(
      'Du kannst dir jedes Konto als Knoten in einem Netzwerk vorstellen. Die Verbindungen zeigen, was dazugehört.',
    );
    expect(s02Content.narration.messages[s02Content.narration.introReadyId]).toBe(
      'Du musst dir dabei keine Einzelheiten merken. Wähle aus, welches Konto du zuerst erkunden möchtest.',
    );
    expect(s02Content.narration.remainingDetails(['Bestätigungen', 'Zurücksetzungslinks'])).toBe(
      'Sieh dir noch Bestätigungen und Zurücksetzungslinks an.',
    );
    expect(s02Content.narration.finishAccount('Campus E-Mail')).toBe(
      'Alles in Campus E-Mail angesehen. Wähle „Fertig“.',
    );
    expect(s02Content.narration.remainingAccounts(['Campus E-Mail', 'Campusgram'])).toBe(
      'Wähle noch Campus E-Mail und Campusgram aus.',
    );
    expect(s02Content.scene.accounts.map(({ previewSequence }) => previewSequence)).toEqual([
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
    const resetLink = s02Content.previewSimulation.variants['reset-link'];
    expect(resetLink.category).toBe('mail');
    if (resetLink.category !== 'mail') throw new Error('missing mail preview');
    expect(resetLink.items).toContain(
      'Wenn du das nicht angefordert hast, ignoriere diese E-Mail. Dein Passwort bleibt unverändert.',
    );
    expect(resetLink.header).toEqual({
      from: 'Master Campus <konto@campus.example>',
      to: '{campusEmail}',
      cc: 'Campus IT-Service <it-service@campus.example>',
      sentAt: 'Heute, 12:07 Uhr',
    });
    const composedMail = s02Content.previewSimulation.variants.compose;
    expect(composedMail.category).toBe('mail');
    if (composedMail.category !== 'mail') throw new Error('missing composed mail preview');
    expect(composedMail.header.to).toBe(
      'Max Mustermann <max.mustermann@campus.example>',
    );
    const directMessages = s02Content.previewSimulation.variants['direct-messages'];
    expect(directMessages.category).toBe('social');
    if (directMessages.category !== 'social') throw new Error('missing social preview');
    expect(directMessages.primaryItem.text).toBe(
      'Hi, hast du das neue Video vom Campusfest gesehen?',
    );
  });
});
