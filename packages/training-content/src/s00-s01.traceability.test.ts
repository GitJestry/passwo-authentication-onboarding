import { describe, expect, it } from 'vitest';
import { S00_CONTENT_VERSION, s00Content } from './s00.js';
import { S01_CONTENT_VERSION, s01Content } from './s01.js';
import { S02_CONTENT_VERSION, s02Content } from './s02.js';

describe('S00 to S02 training-content traceability', () => {
  it('keeps the S00 safety boundary in PassWo narration from the named script page', () => {
    expect(S00_CONTENT_VERSION).toBe('1.14.0');
    expect(s00Content.source).toEqual({
      document: 'research/private/training-script.pdf',
      internalPage: 2,
      uxReference: 'Vom Nutzer bereitgestellte UX-Konzeptboards, 2026-07-31',
    });
    const safetyText = s00Content.narration.safetyWarning;
    expect(safetyText).toBe(
      'Nutze bitte keine eigenen Passwörter oder Varianten davon. Und keine Sorge, die Eingaben werden nur lokal für diese fiktive Übung ausgewertet und nicht dauerhaft gespeichert.\nViel Erfolg!',
    );
    expect(s00Content.entry.paragraphs).toEqual([
      'Aloha! Ich bin PassWo und begleite dich heute durch das Training.',
      'Stell dir vor, du hast an einer Hochschule gerade neue Campuszugänge erhalten und musst nun drei Campuskonten einrichten.',
      'In der ersten Sektion entscheidest du selbst, welche Passwörter du für diese Konten verwendest. Überlege wie du die Konten in so einer Situation schützen würdest, und erstelle dafür starke Passwörter, die du dir gut merken kannst.',
      'Nach einem kurzen Zwischenschritt meldest du dich noch einmal bei allen drei Konten an. Wähle deine Passwörter deshalb so, dass du sie später wieder abrufen kannst.',
      'Du arbeitest gleich in einem virtuellen PC. Wähle gerne das Betriebssystem, das deinem Alltag am nächsten kommt.',
    ]);
    expect(s00Content.entry.nameLabel).toBe('Wie soll PassWo dich ansprechen?');
    expect(s00Content.narration.greeting).toBe(
      'Das ist dein Browser. Bevor du die Passwörter erstellst, erkläre ich dir kurz, wofür die drei Konten überhaupt stehen.\n\nMaster Campus ist dein zentraler Zugang. Mit dem Konto meldest du dich auch bei Campus Workspace für Projekt- und Arbeitsräume, Campus Services für Anträge, Termine und Dokumente sowie Campus Cloud für persönliche Dateien, Notizen und Entwürfe an.',
    );
    expect(s00Content.narration.accountExplanations.map(({ accountId }) => accountId)).toEqual([
      'campus-mail',
      'campus-board-archive',
    ]);
    expect(s00Content.narration.accountExplanations[1]?.text).toBe(
      'Campusgram ist ein Community-Konto für persönliche Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen.',
    );
    expect(s00Content.browser.page.title).not.toBe('Dein Campus-Start');
    expect(s00Content.sectionTransition).toEqual({
      label: 'Sektion 1',
      title: 'Starke Passwörter',
      holdDurationMs: 3500,
    });
  });

  it('keeps the S01 account order and account-specific website identity from the named script page', () => {
    expect(S01_CONTENT_VERSION).toBe('2.13.0');
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
      ['Nachrichten', 'Gruppen und Kontakte', 'Beiträge', 'Aktivitäten'],
    ]);
    expect(s01Content.browser.accounts[0]?.dashboard.summaryCards).toEqual([
      {
        title: 'Campus Workspace',
        detail: 'Projekt- und Arbeitsräume, geteilte Dateien und Gruppenmitgliedschaften.',
      },
      {
        title: 'Campus Services',
        detail: 'Persönliche Angaben, Anträge, Termine und Dokumente.',
      },
      {
        title: 'Campus Cloud',
        detail: 'Persönliche Dateien, Notizen und Entwürfe.',
      },
    ]);
    expect(s01Content.browser.accounts[2]?.address).toBe('campus.example/campusgram');
    const readyToContinueMessage =
      'Die drei Konten sind eingerichtet. Bevor du dich wieder anmeldest, betrachten wir sie aus einer anderen Perspektive: als Knoten-Netzwerk. So wird sichtbar, welche Dienste und Funktionen mit jedem Kontozugang verbunden sind. Schließe dafür bitte zunächst den Browser.';
    expect(s01Content.quest.readyToContinue).toBe(readyToContinueMessage);
    expect(s01Content.completion.guideMessage).toBe(readyToContinueMessage);
  });

  it('keeps the S02 account map and content-oriented PassWo narration versioned', () => {
    expect(S02_CONTENT_VERSION).toBe('3.10.0');
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
    expect(s02Content.scene.accounts[0]?.details.map(({ label }) => label)).toEqual([
      'Campus Workspace',
      'Campus Services',
      'Campus Cloud',
    ]);
    expect(s02Content.scene.accounts[0]?.details[2]).toMatchObject({
      id: 'campus-id-campus-cloud',
      symbolId: 'campus-cloud',
      preview: { kind: 'campus-cloud' },
    });
    expect(s02Content.narration.messages['s02.campus-id.open']).toBe(
      'Master Campus ist dein zentraler Zugang. Mit einem Passwort öffnest du Campus Workspace, Campus Services und Campus Cloud.',
    );
    expect(s02Content.narration.messages['s02.campus-mail.notifications']).toContain(
      'Benachrichtigungen',
    );
    expect(s02Content.narration.messages['s02.campus-mail.confirmations']).toContain(
      'Bestätigungen',
    );
    expect(s02Content.narration.messages['s02.campus-mail.reset-links']).toContain(
      'Zurücksetzungslinks',
    );
    expect(s02Content.narration.messages['s02.campus-mail.impersonation']).toContain(
      'Kommunikation in deinem Namen',
    );
    expect(s02Content.scene.accounts[2]?.details.map(({ label }) => label)).toEqual([
      'Direktnachrichten',
      'Gruppen und Kontakte',
      'Beiträge und Reaktionen',
    ]);
    expect(s02Content.narration.messages['s02.campusgram.understood']).toBe(
      'Die drei Bereiche zeigen persönliche Kommunikation, Kontakte sowie Beiträge und Reaktionen.',
    );
  });
});
