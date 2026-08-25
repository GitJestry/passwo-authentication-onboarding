import type { TrainingSectionId } from '@passwo/contracts';
import { s07PassphraseSearchContent } from './s07.js';

export const S12_PASSWORD_MANAGER_CONTENT_VERSION = '1.8.0';

const familiarPassphrase =
  s07PassphraseSearchContent.browser.generatorPage.passphrases[0]?.words ?? [];

export const s12PasswordManagerContent = {
  version: S12_PASSWORD_MANAGER_CONTENT_VERSION,
  source: {
    revision:
      'Useraufträge vom 2026-08-25 · Passwortmanager-Visuals, lesbarer Tresor und Browserüberleitung',
    copyReference:
      'docs/design/S12-COPY-AUDIT.md#folgeauftrag-lesbare-tresoreinträge-und-visuelle-präzisierung-25-august-2026',
  },
  segment: {
    id: 'S12',
    sectionId: 'password-manager' as TrainingSectionId,
    slice: 'password-manager-functions-and-types',
  },
  trainingAriaLabel:
    'Training, Segment S12, Funktionen und Varianten eines Passwortmanagers',
  flow: [
    { id: 'generate', label: 'Erzeugen' },
    { id: 'store', label: 'Speichern' },
    { id: 'fill', label: 'Ausfüllen' },
  ],
  flowAriaLabel: 'Funktionen eines Passwortmanagers',
  completedAriaLabel: 'abgeschlossen',
  generator: {
    fieldLabel: 'Passwort',
    password: 'q7$Lm2!vP9#xR4@k',
    passwordLength: 16,
    passwordLengthLabel: '16 Stellen',
    alphabetLabel: 'alle Zeichentypen',
    duration: '16,5 Milliarden Jahre',
    durationLead: '16,5 Milliarden',
    durationUnit: 'Jahre',
    informationLabel: 'Berechnungsannahmen anzeigen',
    alphabetSize: 72,
    attemptsPerSecond: '1 Billion',
    combinations: '5,2 × 10²⁹',
    information: {
      passwordLength: 'Passwortlänge',
      alphabetSize: 'Zeichenraumgröße',
      combinations: 'Mögliche Kombinationen',
      attemptsPerSecond: 'Berechnungen pro Sekunde',
    },
    durationExplanation:
      'bis alle Zeichenfolgen der Länge 16 ausprobiert worden sind',
  },
  vault: {
    label: 'Passwortmanager-Tresor',
    storedCount: {
      initial: '8 Einträge',
      withGenerated: '9 Einträge',
    },
    states: {
      open: 'geöffnet',
      closed: 'geschlossen',
      stored: 'gespeichert',
    },
    initialEntries: [
      { account: 'Campus Cloud', identifier: 'konto@cloud.example' },
      { account: 'Lernportal', identifier: 'konto@lernen.example' },
      { account: 'Fotobox', identifier: 'konto@foto.example' },
      { account: 'Musikstream', identifier: 'konto@musik.example' },
      { account: 'Reiseplaner', identifier: 'konto@reise.example' },
      { account: 'Ticketshop', identifier: 'konto@tickets.example' },
      { account: 'Spielewelt', identifier: 'konto@spiele.example' },
      { account: 'Marktplatz', identifier: 'konto@markt.example' },
    ],
    entry: {
      account: 'Anmeldebeispiel',
      username: 'benutzername',
      maskedPassword: '••••••••••••••••',
    },
  },
  login: {
    title: 'Anmeldebeispiel',
    usernameLabel: 'Benutzername',
    passwordLabel: 'Passwort',
    submitLabel: 'Anmelden',
  },
  variants: {
    integrated: {
      id: 'integrated',
      title: 'Integrierter Passwortmanager',
      bullets: [
        'bereits vorhanden',
        'an Browser, Gerät oder Plattform gekoppelt',
        'Zugang meist über Gerät/Plattform',
      ],
    },
    separate: {
      id: 'separate',
      title: 'Eigenständiger Passwortmanager',
      bullets: [
        'separat eingerichtet',
        'derselbe Tresor über verschiedene Browser und Systeme nutzbar',
        'meist mit Masterpasswort geschützt',
      ],
    },
    passphrasePreview: familiarPassphrase,
    passphrasePreviewAriaLabel: 'Bekannte Passphrase aus Abschnitt 1',
  },
  guide: {
    name: 'PassWo',
    taskLabel: 'Passwortmanager',
    steps: {
      intro:
        'Ein Passwortmanager kann für jedes Konto ein eigenes Passwort erzeugen, speichern und beim Anmelden wieder ausfüllen.',
      generate:
        'Weil du dieses Passwort nicht selbst auswendig lernen musst, kann der Manager ein langes, zufällig erzeugtes Passwort für dich verwenden.',
      store:
        'Im Tresor speichert er, welches Passwort zu welchem Konto gehört.',
      fill:
        'Beim nächsten Anmelden kann der Passwortmanager den passenden Eintrag wieder für dich einsetzen.',
      access:
        'Die einzelnen Passwörter musst du dir damit nicht mehr merken. Dafür schützt du den Zugang zu deinem Passwortmanager.',
      variants:
        'Viele Browser und Geräte enthalten bereits einen Passwortmanager. Daneben gibt es eigenständige Passwortmanager.',
      separate:
        'Eigenständige Passwortmanager schützen ihren Tresor meist mit einem Masterpasswort. Dafür kannst du zum Beispiel die Passphrase aus Abschnitt 1 verwenden.',
      integrated:
        'Bei integrierten Passwortmanagern übernimmt häufig dein geschützter Geräte- oder Plattformzugang diese Aufgabe.',
      practice: [
        'Für die Übung nutzen wir den Passwortmanager direkt im Browser.',
        'Probier den Ablauf jetzt selbst aus, indem du mit dem Passwortmanager im Browser ein neues Konto anlegst.',
      ],
    },
  },
} as const;
