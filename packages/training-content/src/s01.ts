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
    readonly accounts: readonly {
      readonly id: S01AccountId;
      readonly label: string;
      readonly address: string;
      readonly accountDataLabel: string;
      readonly accountData: string;
      readonly role: string;
      readonly symbolId: string;
      readonly navigation: readonly string[];
      readonly overview: {
        readonly title: string;
        readonly description: string;
        readonly activityTitle: string;
        readonly activityItems: readonly string[];
      };
    }[];
  };
  readonly progress: {
    readonly label: string;
    readonly accountRoleLabel: string;
    readonly status: (configuredCount: number) => string;
  };
  readonly quest: {
    readonly helpLabel: string;
    readonly closeHelpLabel: string;
    readonly nextAccount: (accountLabel: string) => string;
    readonly readyToContinue: string;
  };
  readonly controls: {
    readonly passwordLabel: string;
    readonly showPassword: (accountLabel: string) => string;
    readonly hidePassword: (accountLabel: string) => string;
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

export const S01_CONTENT_VERSION = '2.3.0';

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
    accounts: [
      {
        id: 'campus-id',
        label: 'CampusID',
        address: 'campus.example/campus-id',
        accountDataLabel: 'Kontodaten',
        accountData: 'alex27@campus.example',
        role: 'Zentrales Campus-Konto.',
        symbolId: 'campus-id',
        navigation: ['Übersicht', 'Dienste', 'Einstellungen'],
        overview: {
          title: 'Kontoübersicht',
          description: 'Dein Zugang zu zentralen Campusdiensten.',
          activityTitle: 'Aktuelle Bereiche',
          activityItems: ['Campusdienste werden geladen', 'Kontostatus wird vorbereitet'],
        },
      },
      {
        id: 'campus-mail',
        label: 'CampusMail',
        address: 'mail.campus.example',
        accountDataLabel: 'Kontodaten',
        accountData: 'alex27@mail.campus.example',
        role: 'Campusbezogene Nachrichten, Bestätigungen und Zurücksetzungslinks.',
        symbolId: 'campus-mail',
        navigation: ['Posteingang', 'Ordner', 'Einstellungen'],
        overview: {
          title: 'Postfachübersicht',
          description: 'Campusbezogene Nachrichten und Bestätigungen.',
          activityTitle: 'Neue Einträge',
          activityItems: ['Nachrichten werden geladen', 'Ordner werden vorbereitet'],
        },
      },
      {
        id: 'campus-board-archive',
        label: 'CampusBoard Archiv',
        address: 'campus.example/board-archiv',
        accountDataLabel: 'Kontodaten',
        accountData: 'alex_board',
        role: 'Ältere Ankündigungen, Projektfragen und informelle Campus-Diskussionen.',
        symbolId: 'campus-board-archive',
        navigation: ['Archiv', 'Themen', 'Suche'],
        overview: {
          title: 'Archivübersicht',
          description: 'Ältere Beiträge und Diskussionen aus dem Campusalltag.',
          activityTitle: 'Archivierte Inhalte',
          activityItems: ['Beiträge werden geladen', 'Themen werden vorbereitet'],
        },
      },
    ],
  },
  progress: {
    label: 'Einrichtungsfortschritt',
    accountRoleLabel: 'Wofür steht dieses Konto?',
    status: (configuredCount) => `${configuredCount}/3 Konten eingerichtet`,
  },
  quest: {
    helpLabel: 'PassWo-Hinweis öffnen',
    closeHelpLabel: 'PassWo-Hinweis schließen',
    nextAccount: (accountLabel) => `Richte das Passwort für ${accountLabel} ein.`,
    readyToContinue:
      'Die drei Konten sind eingerichtet. Bevor du dich erneut anmeldest, schauen wir kurz an, wofür diese Konten im Campusalltag stehen.',
  },
  controls: {
    passwordLabel: 'Passwort',
    showPassword: (accountLabel) => `Passwort für ${accountLabel} anzeigen`,
    hidePassword: (accountLabel) => `Passwort für ${accountLabel} verbergen`,
    configure: 'Konto einrichten',
    continue: 'Zum Desktop',
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
