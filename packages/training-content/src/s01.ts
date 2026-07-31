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

export const S01_CONTENT_VERSION = '2.10.0';

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
        role: 'Zentrales Campus-Konto.',
        symbolId: 'campus-id',
        landingNavigation: ['Überblick', 'Sicherheit', 'Hilfe'],
        authenticationNavigation: ['Hilfe'],
        overview: {
          title: 'Kontoübersicht',
          description: 'Dein Zugang zu zentralen Campusdiensten.',
          activityTitle: 'Aktuelle Bereiche',
          activityItems: ['Campusdienste werden geladen', 'Kontostatus wird vorbereitet'],
        },
        landing: {
          headline: 'Dein Zugang zum Campus.',
          description:
            'Master Campus ist dein zentraler Schlüssel zu allen digitalen Diensten der Hochschule.',
          benefits: [
            'Ein Konto für alle Campusdienste',
            'Sichere Anmeldung mit starken Standards',
            'Verwaltung deiner Daten und Geräte',
          ],
          registerLabel: 'Registrieren',
          loginLabel: 'Anmelden',
        },
        dashboard: {
          navigation: ['Übersicht', 'Dienste', 'Sicherheit', 'Profil', 'Geräte', 'Einstellungen'],
          summaryCards: [
            { title: 'Kontoübersicht', detail: 'Benutzername, E-Mail und Kontostatus' },
            { title: 'Sicherheit', detail: 'Passwort und zweistufige Anmeldung' },
            { title: 'Meine Dienste', detail: 'E-Mail, Cloud Notes und LearnSpace' },
          ],
          activityTitle: 'Aktuelle Aktivitäten',
          activities: [
            { title: 'Anmeldung erfolgreich', meta: 'Heute · Browser' },
            { title: 'Kontozugang eingerichtet', meta: 'Master Campus' },
            { title: 'Campusdienste verbunden', meta: 'Diensteübersicht' },
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
            { title: 'LearnSpace ist bereit', meta: 'Lernplattform · Montag' },
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
        address: 'campus.example/board-archiv',
        accountDataLabel: 'Benutzername',
        accountData: 'alex_board',
        role: 'Ältere Ankündigungen, Projektfragen und informelle Campus-Diskussionen.',
        symbolId: 'campus-board-archive',
        landingNavigation: ['Archiv', 'Themen', 'Suche'],
        authenticationNavigation: ['Archiv', 'Themen', 'Suche'],
        overview: {
          title: 'Archivübersicht',
          description: 'Ältere Beiträge und Diskussionen aus dem Campusalltag.',
          activityTitle: 'Archivierte Inhalte',
          activityItems: ['Beiträge werden geladen', 'Themen werden vorbereitet'],
        },
        landing: {
          headline: 'Deine Community. Dein Campus. Dein Wissen.',
          description:
            'Campusgram verbindet Studierende und Mitarbeitende, um Fragen zu stellen, Erfahrungen zu teilen und voneinander zu lernen.',
          benefits: [
            'Fragen stellen und Antworten finden',
            'Diskussionen führen und Wissen teilen',
            'Projekte und Gruppen vernetzen',
            'Wichtige Infos und Ankündigungen erhalten',
          ],
          registerLabel: 'Registrieren',
          loginLabel: 'Anmelden',
        },
        dashboard: {
          navigation: [
            'Übersicht',
            'Ankündigungen',
            'Projektfragen',
            'Gruppen',
            'Diskussionen',
            'Archiv',
            'Gespeichert',
          ],
          summaryCards: [
            { title: 'Ankündigungen', detail: 'Wichtige Neuigkeiten aus dem Campusalltag' },
            { title: 'Projektfragen', detail: 'Aktuelle Fragen aus Kursen und Projekten' },
            { title: 'Aktive Gruppen', detail: 'Communities und Lerngruppen entdecken' },
          ],
          activityTitle: 'Diskussionen',
          activities: [
            { title: 'KI im Studium: Chance oder Risiko?', meta: '23 Antworten · vor 5 Std.' },
            { title: 'Laptop-Empfehlungen fürs Studium', meta: '18 Antworten · vor 1 Tag' },
            { title: 'Lernmethoden: Was hilft wirklich?', meta: '31 Antworten · vor 2 Tagen' },
          ],
          lowerCards: [
            { title: 'Trendthemen', detail: 'Prüfungen, Python und Designsysteme' },
            { title: 'Archiv-Highlights', detail: 'Beliebte Beiträge aus vergangenen Semestern' },
            { title: 'Neueste Aktivitäten', detail: 'Antworten, Kommentare und gespeicherte Beiträge' },
            { title: 'Empfohlene Gruppen', detail: 'Passende Communities für deinen Campusstart' },
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
      topicsAriaLabel: 'Aktive Themen',
      topics: ['Informatik', 'Design Lab', 'Mathe 1', 'AStA', 'Career Hub'],
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
      'Erstelle starke und merkbare Passwörter, da wir uns später wieder anmelden müssen und unsere Accounts schützen wollen.',
    readyToContinue:
      'Die drei Konten sind eingerichtet. Bevor du dich erneut anmeldest, müssen wir schauen, was du gerade mit deinen Passwörtern schützt und ob vielleicht mehr als nur ein Konto auf den ersten Blick dahinter steckt. Schließe dafür bitte den Browser.',
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
    guideMessage:
      'Die drei Konten sind eingerichtet. Bevor du dich erneut anmeldest, müssen wir schauen, was du gerade mit deinen Passwörtern schützt und ob vielleicht mehr als nur ein Konto auf den ersten Blick dahinter steckt. Schließe dafür bitte den Browser.',
  },
};
