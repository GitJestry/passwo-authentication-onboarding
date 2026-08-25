import type { TrainingSectionId } from '@passwo/contracts';
import { s07PassphraseSearchContent } from './s07.js';

export const S12_PASSWORD_MANAGER_CONTENT_VERSION = '1.1.0';

const familiarPassphrase =
  s07PassphraseSearchContent.browser.generatorPage.passphrases[0]?.words ?? [];

export const s12PasswordManagerContent = {
  version: S12_PASSWORD_MANAGER_CONTENT_VERSION,
  source: {
    revision:
      'Useraufträge vom 2026-08-25 · Passwortmanager-Funktionen, Systemvarianten und My-Shop-Überleitung',
    copyReference:
      'docs/design/S12-COPY-AUDIT.md#copy-und-ablaufdelta-s12-passwortmanager-25-august-2026',
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
    fieldLabel: 'Zufällig erzeugtes Passwort',
    password: 'q7$Lm2!vP9#xR4@k',
    passwordLength: 16,
    passwordLengthLabel: '16 Zeichen',
    duration: '1,2-mal das Alter des Universums',
    alphabetSize: '72 mögliche Zeichen',
    attemptsPerSecond: '1 Billion Versuche pro Sekunde',
    combinations: '5,2 × 10²⁹ mögliche Kombinationen',
    durationExplanation:
      'bis alle Zeichenfolgen der Länge 16 ausprobiert worden sind',
  },
  vault: {
    label: 'Passwortmanager-Tresor',
    storedCount: '1 Eintrag',
    states: {
      open: 'geöffnet',
      closed: 'geschlossen',
      stored: 'gespeichert',
    },
    entry: {
      account: 'My Shop',
      usernameDomain: 'my-shop.example',
      maskedPassword: '••••••••••••••••',
    },
  },
  login: {
    title: 'Bei My Shop anmelden',
    usernameLabel: 'Benutzername',
    passwordLabel: 'Passwort',
    submitLabel: 'Anmelden',
  },
  variants: {
    integrated: {
      id: 'integrated',
      title: 'In Browser oder Gerät integriert',
      bullets: [
        'bereits im Browser oder Gerät vorhanden',
        'teilweise zusätzlich mit Masterpasswort',
      ],
    },
    separate: {
      id: 'separate',
      title: 'Separater Passwortmanager',
      bullets: [
        'separat eingerichtet',
        'häufig über verschiedene Browser und Betriebssysteme nutzbar',
        'Tresor meist mit einem Masterpasswort geschützt',
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
        'Viele Browser und Geräte enthalten bereits einen Passwortmanager. Daneben gibt es separate Passwortmanager.',
      separate:
        'Separate Passwortmanager schützen ihren Tresor meist mit einem Masterpasswort. Dafür kannst du zum Beispiel die Passphrase aus Abschnitt 1 verwenden.',
      integrated:
        'Bei integrierten Passwortmanagern übernimmt häufig dein geschützter Geräte- oder Plattformzugang diese Aufgabe.',
      practice: [
        'Für die Übung nutzen wir den Passwortmanager direkt im Browser.',
        'Probier den Ablauf jetzt selbst aus indem du mit dem Password Manager bei My Shop ein neues Konto anlegst.',
      ],
    },
  },
} as const;
