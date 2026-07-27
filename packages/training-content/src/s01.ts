import type { TrainingSectionId } from '@passwo/contracts';

export const s01AccountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;
export type S01AccountId = (typeof s01AccountIds)[number];

export interface S01SegmentContent {
  readonly version: string;
  readonly trainingAriaLabel: string;
  readonly source: {
    readonly document: string;
    readonly internalPage: 3;
  };
  readonly segment: {
    readonly id: 'S01';
    readonly sectionId: TrainingSectionId;
  };
  readonly browser: {
    readonly ariaLabel: string;
    readonly identityName: string;
    readonly fictionalBadge: string;
    readonly accounts: readonly {
      readonly id: S01AccountId;
      readonly label: string;
      readonly address: string;
      readonly accountDataLabel: string;
      readonly accountData: string;
      readonly role: string;
    }[];
  };
  readonly progress: {
    readonly label: string;
    readonly accountRoleLabel: string;
    readonly status: (configuredCount: number) => string;
  };
  readonly quest: {
    readonly helpLabel: string;
    readonly nextAccount: (accountLabel: string) => string;
    readonly readyToContinue: string;
  };
  readonly controls: {
    readonly passwordLabel: string;
    readonly showPassword: (accountLabel: string) => string;
    readonly hidePassword: (accountLabel: string) => string;
    readonly show: string;
    readonly hide: string;
    readonly configure: string;
    readonly continue: string;
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
  readonly completion: {
    readonly tabStatus: string;
    readonly accountStatus: string;
    readonly guideName: string;
    readonly guideMessage: string;
  };
}

export const S01_CONTENT_VERSION = '2.0.0';

export const s01Content: S01SegmentContent = {
  version: S01_CONTENT_VERSION,
  trainingAriaLabel: 'PassWo Training, Segment S01',
  source: {
    document: 'research/private/training-script.pdf',
    internalPage: 3,
  },
  segment: {
    id: 'S01',
    sectionId: 'passwords',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S01',
    identityName: 'Campusraum',
    fictionalBadge: 'Fiktive Übungsseite',
    accounts: [
      {
        id: 'campus-id',
        label: 'CampusID',
        address: 'campus.example/campus-id',
        accountDataLabel: 'Kontodaten',
        accountData: 'alex27@campus.example',
        role: 'Zentrales Campus-Konto.',
      },
      {
        id: 'campus-mail',
        label: 'CampusMail',
        address: 'mail.campus.example',
        accountDataLabel: 'Kontodaten',
        accountData: 'alex27@mail.campus.example',
        role: 'Campusbezogene Nachrichten, Bestätigungen und Zurücksetzungslinks.',
      },
      {
        id: 'campus-board-archive',
        label: 'CampusBoard Archiv',
        address: 'campus.example/board-archiv',
        accountDataLabel: 'Kontodaten',
        accountData: 'alex_board',
        role: 'Ältere Ankündigungen, Projektfragen und informelle Campus-Diskussionen.',
      },
    ],
  },
  progress: {
    label: 'Einrichtungsfortschritt',
    accountRoleLabel: 'Wofür steht dieses Konto?',
    status: (configuredCount) => `${configuredCount}/3 Konten eingerichtet`,
  },
  quest: {
    helpLabel: 'Nächsten Schritt anzeigen',
    nextAccount: (accountLabel) => `Richte das Passwort für ${accountLabel} ein.`,
    readyToContinue: 'Alle drei Konten sind eingerichtet. Wähle Weiter.',
  },
  controls: {
    passwordLabel: 'Fiktives Passwort',
    showPassword: (accountLabel) => `Passwort für ${accountLabel} anzeigen`,
    hidePassword: (accountLabel) => `Passwort für ${accountLabel} verbergen`,
    show: 'Anzeigen',
    hide: 'Verbergen',
    configure: 'Konto einrichten',
    continue: 'Weiter',
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    retry: 'Erneut versuchen',
  },
  completion: {
    tabStatus: 'Abgeschlossen',
    accountStatus: 'Konto eingerichtet',
    guideName: 'PassWo',
    guideMessage:
      'Die drei Konten sind eingerichtet. Bevor du dich erneut anmeldest, schauen wir kurz an, wofür diese Konten im Campusalltag stehen.',
  },
};
