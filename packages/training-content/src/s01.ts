import type { TrainingSectionId } from '@passwo/contracts';

export const s01AccountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;
export type S01AccountId = (typeof s01AccountIds)[number];

export interface S01SegmentContent {
  readonly version: string;
  readonly trainingAriaLabel: string;
  readonly source: {
    readonly document: string;
    readonly internalPage: 3;
    readonly uxReference: string;
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
      readonly landingNavigation: readonly string[];
      readonly authenticationNavigation: readonly string[];
      readonly overview: {
        readonly title: string;
        readonly description: string;
        readonly activityTitle: string;
        readonly activityItems: readonly string[];
      };
      readonly landing: {
        readonly headline: string;
        readonly description: string;
        readonly benefits: readonly string[];
        readonly registerLabel: string;
        readonly loginLabel: string;
      };
      readonly dashboard: {
        readonly navigation: readonly string[];
        readonly summaryCards: readonly {
          readonly title: string;
          readonly detail: string;
        }[];
        readonly activityTitle: string;
        readonly activities: readonly {
          readonly title: string;
          readonly meta: string;
        }[];
        readonly lowerCards: readonly {
          readonly title: string;
          readonly detail: string;
        }[];
      };
    }[];
  };
  readonly siteUi: {
    readonly language: string;
    readonly backLabel: string;
    readonly previewUnavailable: string;
    readonly registrationUnavailable: string;
    readonly loginUnavailable: string;
    readonly greeting: (name: string) => string;
    readonly viewLabel: string;
    readonly showAllLabel: string;
    readonly moreLabel: string;
    readonly summaryAriaLabel: string;
    readonly lowerAriaLabel: string;
    readonly mailbox: {
      readonly folderAriaLabel: string;
      readonly toolbarAriaLabel: string;
      readonly composeLabel: string;
      readonly searchLabel: string;
      readonly messageCount: (count: number) => string;
      readonly latestFirst: string;
      readonly newLabel: string;
      readonly previousLabel: string;
      readonly selectedMessageLabel: string;
      readonly senderLabel: string;
      readonly replyLabel: string;
      readonly forwardLabel: string;
    };
    readonly community: {
      readonly topicsAriaLabel: string;
      readonly topics: readonly string[];
      readonly newCount: (count: number) => string;
      readonly searchLabel: string;
      readonly createLabel: string;
    };
  };
  readonly progress: {
    readonly label: string;
    readonly accountRoleLabel: string;
    readonly status: (configuredCount: number) => string;
  };
  readonly quest: {
    readonly helpLabel: string;
    readonly closeHelpLabel: string;
    readonly guideMessage: string;
    readonly readyToContinue: string;
  };
  readonly controls: {
    readonly registrationTitle: string;
    readonly passwordLabel: string;
    readonly showPassword: (accountLabel: string) => string;
    readonly hidePassword: (accountLabel: string) => string;
    readonly configure: string;
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
  readonly completion: {
    readonly overlayLabel: (accountLabel: string) => string;
    readonly guideName: string;
    readonly guideMessage: string;
  };
}

export const S01_CONTENT_VERSION = '2.13.0';

const readyToContinueMessage =
  'Die drei Konten sind eingerichtet. Bevor du dich wieder anmeldest, betrachten wir sie aus einer anderen Perspektive: als Knoten-Netzwerk. So wird sichtbar, welche Dienste und Funktionen mit jedem Kontozugang verbunden sind. Schließe dafür bitte zunächst den Browser.';

export const s01Content: S01SegmentContent = {
  version: S01_CONTENT_VERSION,
  trainingAriaLabel: 'PassWo Training, Segment S01',
  source: {
    document: 'research/private/training-script.pdf',
    internalPage: 3,
    uxReference: 'Vom Nutzer bereitgestellte UX-Konzeptboards, 2026-07-31',
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
        label: 'Master Campus',
        address: 'campus.example/campus-id',
        accountDataLabel: 'Benutzername',
        accountData: 'alex27@campus.example',
        role: 'Zentraler Zugang zu Campus Workspace, Campus Services und Campus Cloud.',
        symbolId: 'campus-id',
        landingNavigation: ['Überblick', 'Sicherheit', 'Hilfe'],
        authenticationNavigation: ['Hilfe'],
        overview: {
          title: 'Kontoübersicht',
          description: 'Dein Zugang zu Campus Workspace, Campus Services und Campus Cloud.',
          activityTitle: 'Aktuelle Bereiche',
          activityItems: [
            'Campus Workspace wird vorbereitet',
            'Campus Services werden vorbereitet',
            'Campus Cloud wird vorbereitet',
          ],
        },
        landing: {
          headline: 'Dein Zugang zum Campus.',
          description:
            'Master Campus ist dein zentraler Zugang zu Campus Workspace, Campus Services und Campus Cloud.',
          benefits: [
            'Campus Workspace: Projekt- und Arbeitsräume, geteilte Dateien und Gruppenmitgliedschaften.',
            'Campus Services: Persönliche Angaben, Anträge, Termine und Dokumente.',
            'Campus Cloud: Persönliche Dateien, Notizen und Entwürfe.',
          ],
          registerLabel: 'Registrieren',
          loginLabel: 'Anmelden',
        },
        dashboard: {
          navigation: [
            'Übersicht',
            'Campus Workspace',
            'Campus Services',
            'Campus Cloud',
            'Sicherheit',
            'Profil',
          ],
          summaryCards: [
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
          ],
          activityTitle: 'Aktuelle Aktivitäten',
          activities: [
            { title: 'Campus Workspace', meta: 'Arbeitsräume und Gruppen sind verbunden' },
            { title: 'Campus Services', meta: 'Persönliche Vorgänge sind erreichbar' },
            { title: 'Campus Cloud', meta: 'Persönliche Dateien, Notizen und Entwürfe.' },
          ],
          lowerCards: [
            { title: 'Verknüpfte Geräte', detail: 'Laptop und Smartphone verwalten' },
            { title: 'Kontostatus', detail: 'Alle verbundenen Dienste sind erreichbar' },
            { title: 'Support & Hilfe', detail: 'Anleitungen und Kontakt zum IT-Service' },
            { title: 'Mitteilungen', detail: 'Wartungen und neue Campusfunktionen' },
          ],
        },
      },
      {
        id: 'campus-mail',
        label: 'Campus E-Mail',
        address: 'mail.campus.example',
        accountDataLabel: 'Benutzername',
        accountData: 'alex27@mail.campus.example',
        role: 'Campusbezogene Nachrichten, Bestätigungen und Zurücksetzungslinks.',
        symbolId: 'campus-mail',
        landingNavigation: ['Posteingang', 'Ordner', 'Einstellungen', 'Hilfe'],
        authenticationNavigation: ['Hilfe'],
        overview: {
          title: 'Postfachübersicht',
          description: 'Campusbezogene Nachrichten und Bestätigungen.',
          activityTitle: 'Neue Einträge',
          activityItems: ['Nachrichten werden geladen', 'Ordner werden vorbereitet'],
        },
        landing: {
          headline: 'Deine E-Mail für den Campus.',
          description:
            'Sicher. Persönlich. Hochschulweit. Campus E-Mail verbindet dich mit Lehrenden und der Hochschule – zuverlässig und überall verfügbar.',
          benefits: [
            'Deine @campus-mail Adresse',
            'Spam- und Virenschutz',
            'Großer Speicher und Cloud-Integration',
            'Auf allen Geräten synchron',
          ],
          registerLabel: 'Registrieren',
          loginLabel: 'Anmelden',
        },
        dashboard: {
          navigation: ['Posteingang', 'Markiert', 'Gesendet', 'Entwürfe', 'Archiv', 'Papierkorb'],
          summaryCards: [
            { title: 'E-Mail-Status', detail: 'Postfach und verbundene Dienste funktionieren' },
            { title: 'Schnellzugriff', detail: 'Neue Nachricht, Kontakte und Einstellungen' },
            { title: 'Konto & Sicherheit', detail: 'Letzte Anmeldung und Passwortstatus' },
          ],
          activityTitle: 'Posteingang',
          activities: [
            { title: 'Willkommen bei Campus E-Mail', meta: 'Campus IT-Service · 09:15' },
            { title: 'Deine Anmeldung wurde bestätigt', meta: 'Master Campus · Gestern' },
            { title: 'Neue Informationen zum Campusstart', meta: 'Studierendenwerk · Montag' },
            { title: 'Neue Campusinformation', meta: 'Campus IT-Service · Montag' },
          ],
          lowerCards: [
            { title: 'Letzte Aktivitäten', detail: 'Anmeldungen und geöffnete Nachrichten' },
            { title: 'Speicherplatz', detail: '2,4 GB von 10 GB verwendet' },
            { title: 'Archivierte E-Mails', detail: 'Ältere Nachrichten bleiben durchsuchbar' },
          ],
        },
      },
      {
        id: 'campus-board-archive',
        label: 'Campusgram',
        address: 'campus.example/campusgram',
        accountDataLabel: 'Benutzername',
        accountData: 'alex_board',
        role:
          'Eigenständiges Community-Konto für Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen.',
        symbolId: 'campus-board-archive',
        landingNavigation: ['Nachrichten', 'Gruppen und Kontakte', 'Beiträge', 'Aktivitäten'],
        authenticationNavigation: ['Nachrichten', 'Gruppen und Kontakte', 'Beiträge', 'Aktivitäten'],
        overview: {
          title: 'Community-Übersicht',
          description: 'Aktuelle Kommunikation, Kontakte und Aktivitäten aus deiner Community.',
          activityTitle: 'Aktuelle Aktivitäten',
          activityItems: [
            'Direktnachrichten werden geladen',
            'Gruppen und Kontakte werden vorbereitet',
            'Beiträge und Reaktionen werden aktualisiert',
          ],
        },
        landing: {
          headline: 'Deine Community. Dein Campus. Dein Wissen.',
          description:
            'Campusgram verbindet Studierende, Lehrende, Forschende und weitere Beschäftigte für Austausch, Zusammenarbeit und gemeinsame Aktivitäten.',
          benefits: [
            'Direktnachrichten: Private Unterhaltungen, Anhänge und informelle Absprachen.',
            'Gruppen und Kontakte: Projektgruppen, Teams, Initiativen und Kontaktbeziehungen.',
            'Beiträge und Reaktionen: Beiträge, Kommentare, Reaktionen und Veranstaltungsaktivitäten.',
          ],
          registerLabel: 'Registrieren',
          loginLabel: 'Anmelden',
        },
        dashboard: {
          navigation: [
            'Nachrichten',
            'Gruppen und Kontakte',
            'Beiträge',
            'Aktivitäten',
          ],
          summaryCards: [
            {
              title: 'Direktnachrichten',
              detail: 'Private Unterhaltungen, Anhänge und informelle Absprachen.',
            },
            {
              title: 'Gruppen und Kontakte',
              detail: 'Projektgruppen, Teams, Initiativen und Kontaktbeziehungen.',
            },
            {
              title: 'Beiträge und Reaktionen',
              detail: 'Beiträge, Kommentare, Reaktionen und Veranstaltungsaktivitäten.',
            },
          ],
          activityTitle: 'Aktivitäten',
          activities: [
            { title: 'Neue Direktnachricht', meta: 'Team Nachhaltigkeit · vor 15 Min.' },
            { title: 'Kontaktbeziehung aktualisiert', meta: 'Initiative Campusleben · vor 2 Std.' },
            { title: 'Neue Reaktion auf einen Beitrag', meta: 'Veranstaltungsgruppe · vor 1 Tag' },
          ],
          lowerCards: [
            { title: 'Aktive Kontakte', detail: 'Kontakte aus Teams, Initiativen und Arbeitsgruppen' },
            { title: 'Meine Gruppen', detail: 'Aktuelle Gruppen und gemeinsame Bereiche' },
            { title: 'Neueste Beiträge', detail: 'Beiträge, Kommentare und Reaktionen aus der Community' },
            { title: 'Veranstaltungen', detail: 'Aktivitäten und Rückmeldungen aus deinen Gruppen' },
          ],
        },
      },
    ],
  },
  siteUi: {
    language: 'DE',
    backLabel: 'Zurück zur Startseite',
    previewUnavailable: 'Diese Aktion wird im nächsten Trainingsabschnitt verfügbar.',
    registrationUnavailable: 'Dieses Konto ist in diesem Trainingsabschnitt bereits vorhanden.',
    loginUnavailable: 'Die Anmeldung folgt in einem späteren Trainingsabschnitt.',
    greeting: (name) => `Guten Tag, ${name}`,
    viewLabel: 'Ansehen',
    showAllLabel: 'Alle anzeigen',
    moreLabel: 'Mehr erfahren',
    summaryAriaLabel: 'Schnellübersicht',
    lowerAriaLabel: 'Weitere Übersicht',
    mailbox: {
      folderAriaLabel: 'Postfachordner',
      toolbarAriaLabel: 'Postfachwerkzeuge',
      composeLabel: 'Neue Nachricht',
      searchLabel: 'Suche in E-Mails',
      messageCount: (count) => `${count} Nachrichten`,
      latestFirst: 'Neueste zuerst',
      newLabel: 'Neu',
      previousLabel: 'Gestern',
      selectedMessageLabel: 'Ausgewählte Nachricht',
      senderLabel: 'Campus IT-Service',
      replyLabel: 'Antworten',
      forwardLabel: 'Weiterleiten',
    },
    community: {
      topicsAriaLabel: 'Aktive Community-Themen',
      topics: ['Arbeitsgruppen', 'Forschung', 'Initiativen', 'Veranstaltungen', 'Campusleben'],
      newCount: (count) => `${count} neu`,
      searchLabel: 'Suche in Campusgram',
      createLabel: 'Beitrag erstellen',
    },
  },
  progress: {
    label: 'Einrichtungsfortschritt',
    accountRoleLabel: 'Wofür steht dieses Konto?',
    status: (configuredCount) => `Einrichten ${configuredCount}/3`,
  },
  quest: {
    helpLabel: 'PassWo-Hinweis öffnen',
    closeHelpLabel: 'PassWo-Hinweis schließen',
    guideMessage:
      'Erstelle für jedes der drei Konten ein starkes Passwort, das du dir für die spätere erneute Anmeldung merken kannst.',
    readyToContinue: readyToContinueMessage,
  },
  controls: {
    registrationTitle: 'Konto registrieren',
    passwordLabel: 'Passwort',
    showPassword: (accountLabel) => `Passwort für ${accountLabel} anzeigen`,
    hidePassword: (accountLabel) => `Passwort für ${accountLabel} verbergen`,
    configure: 'Konto erstellen',
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    retry: 'Erneut versuchen',
  },
  completion: {
    overlayLabel: (accountLabel) => `${accountLabel} eingerichtet`,
    guideName: 'PassWo',
    guideMessage: readyToContinueMessage,
  },
};
