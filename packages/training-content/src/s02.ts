import type { TrainingSectionId } from '@passwo/contracts';

export const s02AccountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;
export type S02AccountId = (typeof s02AccountIds)[number];
export type S02VisualPreviewKind =
  | 'course-space'
  | 'exam-list'
  | 'cloud-files'
  | 'mail-list'
  | 'confirmation'
  | 'reset-link'
  | 'compose'
  | 'announcement'
  | 'discussion'
  | 'message-thread';

export type S02AnimationStep =
  | {
      readonly type: 'move-character';
      readonly pose: 'flight';
      readonly from: 'bottom-left';
      readonly to: 'focused-node';
      readonly durationMs: number;
    }
  | {
      readonly type: 'move-character';
      readonly pose: 'flight';
      readonly from: 'focused-node';
      readonly to: 'bottom-left';
      readonly durationMs: number;
    }
  | {
      readonly type: 'move-character';
      readonly pose: 'flight';
      readonly from: 'focused-node';
      readonly to: 'focused-node';
      readonly durationMs: number;
    }
  | { readonly type: 'reveal'; readonly targetId: string; readonly durationMs: number }
  | {
      readonly type: 'highlight';
      readonly targetId: string;
      readonly emphasis: 'positive';
      readonly durationMs: number;
    }
  | { readonly type: 'pause'; readonly durationMs: number }
  | { readonly type: 'announce'; readonly messageId: string };

export interface S02AnimationSequence {
  readonly id: string;
  readonly steps: readonly S02AnimationStep[];
  readonly reducedMotion: {
    readonly strategy: 'instant-end-state';
    readonly maxDurationMs: 0;
  };
  readonly maxDurationMs: number;
}

export interface S02AccountContent {
  readonly id: S02AccountId;
  readonly label: string;
  readonly symbolId: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly detailKind: 'service' | 'function' | 'content';
  readonly edgeKind: 'dependency' | 'association' | null;
  readonly edgeLabel: string | null;
  readonly unlockAnimationId: string;
  readonly detailRevealAnimationId: string;
  readonly returnToDockAnimationId: string;
  readonly narrationIds: {
    readonly open: string;
    readonly understood: string;
  };
  readonly descriptions: {
    readonly locked: string;
    readonly opening: string;
    readonly open: string;
    readonly understood: string;
  };
  readonly summaries: {
    readonly locked: string;
    readonly opening: string;
    readonly progress: string;
    readonly checking: string;
    readonly understood: string;
  };
  readonly details: readonly {
    readonly id: string;
    readonly label: string;
    readonly symbolId: string;
    readonly preview: {
      readonly kind: S02VisualPreviewKind;
    };
    readonly position: { readonly x: number; readonly y: number };
    readonly animationId: string;
    readonly narrationId: string;
    readonly descriptions: {
      readonly available: string;
      readonly checking: string;
      readonly opened: string;
    };
  }[];
}

export interface S02SegmentContent {
  readonly version: string;
  readonly source: {
    readonly document: string;
    readonly internalPages: readonly [4, 5, 6, 7];
  };
  readonly segment: {
    readonly id: 'S02';
    readonly sectionId: TrainingSectionId;
  };
  readonly trainingAriaLabel: string;
  readonly accessibility: {
    readonly networkLabel: string;
    readonly canvasLabel: string;
    readonly currentContextLabel: string;
    readonly characterLabel: string;
  };
  readonly page: {
    readonly eyebrow: string;
    readonly title: string;
    readonly globalProgress: (understood: number) => string;
    readonly localProgress: (accountLabel: string, opened: number, total: number) => string;
    readonly previewTitle: string;
    readonly completion: string;
  };
  readonly controls: {
    readonly continue: string;
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly timingErrorCode: string;
    readonly retry: string;
  };
  readonly previewSimulation: {
    readonly address: string;
    readonly welcomeLabel: string;
    readonly masterCampusSignInLabel: string;
    readonly serviceSender: string;
    readonly serviceMessage: string;
    readonly projectSender: string;
    readonly projectMessage: string;
    readonly sendMessageLabel: string;
    readonly projectQuestionLabel: string;
    readonly archivedPostLabel: string;
    readonly projectQuestionText: string;
    readonly archivedPostText: string;
    readonly replyLabel: string;
    readonly replyText: string;
    readonly variants: Readonly<
      Record<
        S02VisualPreviewKind,
        {
          readonly app: string;
          readonly title: string;
          readonly category: 'login' | 'mail' | 'social';
        }
      >
    >;
  };
  readonly narration: {
    readonly guideName: string;
    readonly introId: string;
    readonly completeId: string;
    readonly messages: Readonly<Record<string, string>>;
  };
  readonly scene: {
    readonly id: string;
    readonly introAnimationId: string;
    readonly summaries: {
      readonly initial: string;
      readonly complete: string;
    };
    readonly accounts: readonly S02AccountContent[];
  };
  readonly desktop: {
    readonly browserDockLabel: string;
    readonly browserDockReadyLabel: string;
  };
  readonly animations: readonly S02AnimationSequence[];
}

export const S02_CONTENT_VERSION = '3.7.0';

const introId = 's02.accounts.intro';
const completeId = 's02.accounts.complete';

const accounts = [
  {
    id: 'campus-id',
    label: 'Master Campus',
    symbolId: 'campus-id',
    position: { x: 0.12, y: 0.08 },
    detailKind: 'service',
    edgeKind: 'dependency',
    edgeLabel: 'Mit Master Campus geöffnet',
    unlockAnimationId: 's02-unlock-campus-id',
    detailRevealAnimationId: 's02-reveal-campus-id-details',
    returnToDockAnimationId: 's02-return-campus-id-to-dock',
    narrationIds: {
      open: 's02.campus-id.open',
      understood: 's02.campus-id.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'Master Campus wird geöffnet …',
      open: 'Verbundene Dienste ansehen',
      understood: 'Master Campus verstanden',
    },
    summaries: {
      locked: 'Master Campus ist geschlossen.',
      opening: 'Master Campus wird geöffnet. Die verbundenen Dienste erscheinen gemeinsam.',
      progress: '{opened} von {total} Details zu Master Campus geöffnet.',
      checking: '{detail} wird mit Master Campus geprüft.',
      understood: 'Master Campus verstanden. Alle drei verbundenen Dienste wurden geöffnet.',
    },
    details: [
      {
        id: 'campus-id-learnspace',
        label: 'LearnSpace',
        symbolId: 'learnspace',
        preview: { kind: 'course-space' },
        position: { x: 0.03, y: 0.4 },
        animationId: 's02-check-campus-id-learnspace',
        narrationId: 's02.campus-id.learnspace',
        descriptions: {
          available: 'Mit Master Campus öffnen',
          checking: 'Master Campus wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-id-exam-portal',
        label: 'Prüfungsportal',
        symbolId: 'exam-portal',
        preview: { kind: 'exam-list' },
        position: { x: 0.22, y: 0.58 },
        animationId: 's02-check-campus-id-exam-portal',
        narrationId: 's02.campus-id.exam-portal',
        descriptions: {
          available: 'Mit Master Campus öffnen',
          checking: 'Master Campus wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-id-cloud-notes',
        label: 'Cloud Notes',
        symbolId: 'cloud-notes',
        preview: { kind: 'cloud-files' },
        position: { x: 0.04, y: 0.79 },
        animationId: 's02-check-campus-id-cloud-notes',
        narrationId: 's02.campus-id.cloud-notes',
        descriptions: {
          available: 'Mit Master Campus öffnen',
          checking: 'Master Campus wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
  },
  {
    id: 'campus-mail',
    label: 'Campus E-Mail',
    symbolId: 'campus-mail',
    position: { x: 0.72, y: 0.06 },
    detailKind: 'function',
    edgeKind: 'association',
    edgeLabel: 'Mit Campus E-Mail verbunden',
    unlockAnimationId: 's02-unlock-campus-mail',
    detailRevealAnimationId: 's02-reveal-campus-mail-details',
    returnToDockAnimationId: 's02-return-campus-mail-to-dock',
    narrationIds: {
      open: 's02.campus-mail.open',
      understood: 's02.campus-mail.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'Campus E-Mail wird geöffnet …',
      open: 'Funktionen ansehen',
      understood: 'Campus E-Mail verstanden',
    },
    summaries: {
      locked: 'Campus E-Mail ist geschlossen.',
      opening: 'Campus E-Mail wird geöffnet. Vier Funktionen erscheinen gemeinsam.',
      progress: '{opened} von {total} Details zu Campus E-Mail geöffnet.',
      checking: '{detail} in Campus E-Mail wird geöffnet.',
      understood: 'Campus E-Mail verstanden. Alle vier Funktionen wurden angesehen.',
    },
    details: [
      {
        id: 'campus-mail-notifications',
        label: 'Benachrichtigungen',
        symbolId: 'notifications',
        preview: { kind: 'mail-list' },
        position: { x: 0.87, y: 0.34 },
        animationId: 's02-check-campus-mail-notifications',
        narrationId: 's02.campus-mail.notifications',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Benachrichtigungen werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-mail-confirmations',
        label: 'Bestätigungen',
        symbolId: 'confirmations',
        preview: { kind: 'confirmation' },
        position: { x: 0.67, y: 0.36 },
        animationId: 's02-check-campus-mail-confirmations',
        narrationId: 's02.campus-mail.confirmations',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Bestätigungen werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-mail-reset-links',
        label: 'Zurücksetzungslinks',
        symbolId: 'reset-links',
        preview: { kind: 'reset-link' },
        position: { x: 0.87, y: 0.7 },
        animationId: 's02-check-campus-mail-reset-links',
        narrationId: 's02.campus-mail.reset-links',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Zurücksetzungslinks werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-mail-impersonation',
        label: 'Kommunikation in deinem Namen',
        symbolId: 'compose-message',
        preview: { kind: 'compose' },
        position: { x: 0.67, y: 0.74 },
        animationId: 's02-check-campus-mail-impersonation',
        narrationId: 's02.campus-mail.impersonation',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Kommunikationsvorschau wird geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
  },
  {
    id: 'campus-board-archive',
    label: 'Campusgram',
    symbolId: 'campus-board-archive',
    position: { x: 0.43, y: 0.34 },
    detailKind: 'content',
    edgeKind: 'association',
    edgeLabel: 'Lokaler Inhalt in Campusgram',
    unlockAnimationId: 's02-unlock-campus-board-archive',
    detailRevealAnimationId: 's02-reveal-campus-board-archive-details',
    returnToDockAnimationId: 's02-return-campus-board-archive-to-dock',
    narrationIds: {
      open: 's02.campus-board.open',
      understood: 's02.campus-board.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'Campusgram wird geöffnet …',
      open: 'Archivierte Inhalte ansehen',
      understood: 'Campusgram verstanden',
    },
    summaries: {
      locked: 'Campusgram ist geschlossen.',
      opening: 'Campusgram wird geöffnet. Drei archivierte Inhalte erscheinen.',
      progress: '{opened} von {total} Details in Campusgram geöffnet.',
      checking: '{detail} wird geöffnet.',
      understood: 'Campusgram verstanden. Alle drei archivierten Inhalte wurden angesehen.',
    },
    details: [
      {
        id: 'campus-board-old-announcements',
        label: 'Alte Ankündigungen',
        symbolId: 'announcements',
        preview: { kind: 'announcement' },
        position: { x: 0.27, y: 0.76 },
        animationId: 's02-check-campus-board-old-announcements',
        narrationId: 's02.campus-board.old-announcements',
        descriptions: {
          available: 'Archivvorschau öffnen',
          checking: 'Alte Ankündigungen werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-board-project-questions',
        label: 'Projektfragen',
        symbolId: 'project-questions',
        preview: { kind: 'discussion' },
        position: { x: 0.46, y: 0.81 },
        animationId: 's02-check-campus-board-project-questions',
        narrationId: 's02.campus-board.project-questions',
        descriptions: {
          available: 'Archivvorschau öffnen',
          checking: 'Projektfragen werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-board-archived-discussions',
        label: 'Archivierte Diskussionen',
        symbolId: 'archived-discussions',
        preview: { kind: 'message-thread' },
        position: { x: 0.52, y: 0.58 },
        animationId: 's02-check-campus-board-archived-discussions',
        narrationId: 's02.campus-board.archived-discussions',
        descriptions: {
          available: 'Archivvorschau öffnen',
          checking: 'Archivierte Diskussionen werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
  },
] as const satisfies readonly S02AccountContent[];

function unlockAnimation(account: S02AccountContent): S02AnimationSequence {
  return {
    id: account.unlockAnimationId,
    steps: [
      {
        type: 'move-character',
        pose: 'flight',
        from: 'bottom-left',
        to: 'focused-node',
        durationMs: 520,
      },
      { type: 'highlight', targetId: account.id, emphasis: 'positive', durationMs: 640 },
      { type: 'announce', messageId: account.narrationIds.open },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 1940,
  };
}

function revealDetailsAnimation(account: S02AccountContent): S02AnimationSequence {
  const steps: S02AnimationStep[] = account.details.map((detail) => ({
    type: 'reveal',
    targetId: detail.id,
    durationMs: 420,
  }));
  return {
    id: account.detailRevealAnimationId,
    steps,
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 420,
  };
}

function returnToDockAnimation(account: S02AccountContent): S02AnimationSequence {
  return {
    id: account.returnToDockAnimationId,
    steps: [
      {
        type: 'move-character',
        pose: 'flight',
        from: 'focused-node',
        to: 'bottom-left',
        durationMs: 540,
      },
      { type: 'announce', messageId: account.narrationIds.understood },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 540,
  };
}

function introAnimation(): S02AnimationSequence {
  const steps: S02AnimationStep[] = [
    { type: 'announce', messageId: introId },
    ...accounts.map((account) => ({
      type: 'reveal' as const,
      targetId: account.id,
      durationMs: 340,
    })),
  ];
  return {
    id: 's02-reveal-accounts',
    steps,
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 340,
  };
}

function detailAnimation(detail: S02AccountContent['details'][number]): S02AnimationSequence {
  return {
    id: detail.animationId,
    steps: [
      {
        type: 'move-character',
        pose: 'flight',
        from: 'focused-node',
        to: 'focused-node',
        durationMs: 420,
      },
      { type: 'highlight', targetId: detail.id, emphasis: 'positive', durationMs: 320 },
      { type: 'announce', messageId: detail.narrationId },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 740,
  };
}

const animations = [
  introAnimation(),
  ...accounts.flatMap((account) => [
    unlockAnimation(account),
    revealDetailsAnimation(account),
    returnToDockAnimation(account),
    ...account.details.map(detailAnimation),
  ]),
];

export const s02Content: S02SegmentContent = {
  version: S02_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [4, 5, 6, 7],
  },
  segment: {
    id: 'S02',
    sectionId: 'passwords',
  },
  trainingAriaLabel: 'PassWo Training, Segment S02, Konten verstehen',
  accessibility: {
    networkLabel: 'Knotennetz zum Erkunden der drei Konten',
    canvasLabel: 'Frei angeordnete Karte mit drei fiktiven Konten',
    currentContextLabel: 'Aktueller Hinweis von PassWo',
    characterLabel: 'PassWo, Begleiter im Training',
  },
  page: {
    eyebrow: 'Konten verstehen',
    title: 'Was hängt an deinen Konten?',
    globalProgress: (understood) => `Konten verstehen: ${understood}/3 angesehen`,
    localProgress: (accountLabel, opened, total) =>
      `${accountLabel}: ${opened}/${total} Details angesehen`,
    previewTitle: 'Vorschau',
    completion: 'Alle drei Konten verstanden',
  },
  controls: {
    continue: 'Weiter',
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    timingErrorCode: 'Fehlercode',
    retry: 'Erneut versuchen',
  },
  previewSimulation: {
    address: 'campus.local',
    welcomeLabel: 'Willkommen bei',
    masterCampusSignInLabel: 'Anmelden mit Master Campus',
    serviceSender: 'Campus Service',
    serviceMessage: 'Informationen zu deinem Konto',
    projectSender: 'Projektteam',
    projectMessage: 'Neue Nachricht im Verlauf',
    sendMessageLabel: 'Nachricht senden',
    projectQuestionLabel: 'Frage zum Projekt',
    archivedPostLabel: 'Beitrag aus dem Archiv',
    projectQuestionText: 'Wie teilen wir die Projektaufgaben auf?',
    archivedPostText: 'Diese Information bleibt im Konto sichtbar.',
    replyLabel: 'Antwort',
    replyText: 'Ich übernehme Recherche und Zusammenfassung.',
    variants: {
      'course-space': { app: 'LearnSpace', title: 'Meine Kurse', category: 'login' },
      'exam-list': { app: 'Prüfungsportal', title: 'Meine Prüfungen', category: 'login' },
      'cloud-files': { app: 'Cloud Notes', title: 'Meine Dateien', category: 'login' },
      'mail-list': { app: 'Campus E-Mail', title: 'Benachrichtigungen', category: 'mail' },
      confirmation: { app: 'Campus E-Mail', title: 'Bestätigungen', category: 'mail' },
      'reset-link': { app: 'Campus E-Mail', title: 'Zurücksetzungslink', category: 'mail' },
      compose: { app: 'Campus E-Mail', title: 'Neue Nachricht', category: 'mail' },
      announcement: { app: 'Campusgram', title: 'Alte Ankündigungen', category: 'social' },
      discussion: { app: 'Campusgram', title: 'Projektfragen', category: 'social' },
      'message-thread': {
        app: 'Campusgram',
        title: 'Archivierte Diskussion',
        category: 'social',
      },
    },
  },
  narration: {
    guideName: 'PassWo',
    introId,
    completeId,
    messages: {
      [introId]:
        'Dein Passwort ist oft die letzte Hürde, die Angreifer daran hindert, an deine persönlichen Daten zu kommen. Wähle eines der drei Hauptkonten aus. Danach führt dich „Nächste“ Schritt für Schritt durch die verbundenen Inhalte.',
      [completeId]:
        'Du hast die Konten erkundet. Klicke unten im Dock auf den Browser, wenn du bereit bist weiterzugehen.',
      's02.campus-id.open':
        'Master Campus ist dein zentrales Konto: Mit einem Passwort kannst du dich bei mehreren verbundenen Diensten anmelden.',
      's02.campus-id.understood':
        'Zusammengefasst steckt hinter dem einen Passwort nicht nur Master Campus, sondern drei weitere persönliche Dienste.',
      's02.campus-id.learnspace':
        'Hier sammeln sich deine Kurse, Materialien und Abgaben. Darin können auch persönliche Notizen und Dateien liegen.',
      's02.campus-id.exam-portal':
        'Hier stehen Anmeldungen, Termine und Ergebnisse. Diese Informationen zeigen, wie dein Studienalltag organisiert ist.',
      's02.campus-id.cloud-notes':
        'Hier liegen Notizen, Entwürfe und Arbeitsdateien – zum Beispiel auch persönliche Fotos, wenn du sie dort abgelegt hast.',
      's02.campus-mail.open':
        'Campus E-Mail verbindet Nachrichten, Bestätigungen, Zurücksetzungen und Kommunikation.',
      's02.campus-mail.understood':
        'Campus E-Mail ist die Brücke zu persönlichen Informationen, Zurücksetzungen und Kommunikation in deinem Namen.',
      's02.campus-mail.notifications':
        'Hier landen Hinweise zu Kursen, Terminen und Systemen. Sie zeigen, welche Vorgänge dich gerade betreffen.',
      's02.campus-mail.confirmations':
        'Hier kommen Bestätigungen für Anmeldungen oder Änderungen an. Sie können verraten, was du gerade organisiert hast.',
      's02.campus-mail.reset-links':
        'Hier erscheinen Links, mit denen manche Dienste Änderungen bestätigen oder ein Passwort zurücksetzen lassen.',
      's02.campus-mail.impersonation':
        'Über dieses Postfach könnten in diesem Szenario Nachrichten in deinem Namen geschrieben werden.',
      's02.campus-board.open':
        'In Campusgram liegen lokale Inhalte ohne Verbindungen zu weiteren Campusdiensten.',
      's02.campus-board.understood':
        'Campusgram öffnet hier keine weiteren Campusdienste und enthält typische archivierte Informationen.',
      's02.campus-board.old-announcements':
        'Hier liegen ältere Hinweise und Informationen, die zeigen können, welche Themen oder Veranstaltungen dich betroffen haben.',
      's02.campus-board.project-questions':
        'Hier können Projektfragen, Antworten und kurze Absprachen gesammelt sein – auch wenn sie schon etwas zurückliegen.',
      's02.campus-board.archived-discussions':
        'Hier bleiben Diskussionen aus früheren Kursen erhalten. Das Archiv öffnet keine weiteren Dienste, kann aber trotzdem persönliche Informationen enthalten.',
    },
  },
  scene: {
    id: 's02-account-exploration',
    introAnimationId: 's02-reveal-accounts',
    summaries: {
      initial: 'Drei Konten sind sichtbar und können in beliebiger Reihenfolge geöffnet werden.',
      complete: 'Alle drei Konten wurden mit ihren Details angesehen und verstanden.',
    },
    accounts,
  },
  desktop: {
    browserDockLabel: 'Browser — wird nach dem Erkunden verfügbar',
    browserDockReadyLabel: 'Browser öffnen und zum nächsten Schritt gehen',
  },
  animations,
};

export function getS02Animation(animationId: string): S02AnimationSequence | undefined {
  return s02Content.animations.find(({ id }) => id === animationId);
}
