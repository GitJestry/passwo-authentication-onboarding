import type { TrainingSectionId } from '@passwo/contracts';

export const s02AccountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;
export type S02AccountId = (typeof s02AccountIds)[number];
export type S02VisualPreviewKind =
  | 'campus-workspace'
  | 'campus-services'
  | 'campus-cloud'
  | 'mail-list'
  | 'confirmation'
  | 'reset-link'
  | 'compose'
  | 'direct-messages'
  | 'groups-contacts'
  | 'posts-reactions';

export type S02VisualPreview =
  | {
      readonly app: string;
      readonly title: string;
      readonly category: 'login' | 'mail';
    }
  | {
      readonly app: string;
      readonly title: string;
      readonly category: 'social';
      readonly primaryItem: {
        readonly authorInitial: string;
        readonly label: string;
        readonly text: string;
      };
      readonly replyItem: {
        readonly authorInitial: string;
        readonly label: string;
        readonly text: string;
      };
    };

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
    readonly variants: Readonly<Record<S02VisualPreviewKind, S02VisualPreview>>;
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

export const S02_CONTENT_VERSION = '3.10.0';

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
      opening:
        'Master Campus wird geöffnet. Campus Workspace, Campus Services und Campus Cloud erscheinen gemeinsam.',
      progress: '{opened} von {total} Details zu Master Campus geöffnet.',
      checking: '{detail} wird mit Master Campus geprüft.',
      understood:
        'Master Campus verstanden. Campus Workspace, Campus Services und Campus Cloud wurden geöffnet.',
    },
    details: [
      {
        id: 'campus-id-workspace',
        label: 'Campus Workspace',
        symbolId: 'campus-workspace',
        preview: { kind: 'campus-workspace' },
        position: { x: 0.03, y: 0.4 },
        animationId: 's02-check-campus-id-workspace',
        narrationId: 's02.campus-id.workspace',
        descriptions: {
          available: 'Mit Master Campus öffnen',
          checking: 'Master Campus wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-id-services',
        label: 'Campus Services',
        symbolId: 'campus-services',
        preview: { kind: 'campus-services' },
        position: { x: 0.22, y: 0.58 },
        animationId: 's02-check-campus-id-services',
        narrationId: 's02.campus-id.services',
        descriptions: {
          available: 'Mit Master Campus öffnen',
          checking: 'Master Campus wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-id-campus-cloud',
        label: 'Campus Cloud',
        symbolId: 'campus-cloud',
        preview: { kind: 'campus-cloud' },
        position: { x: 0.04, y: 0.79 },
        animationId: 's02-check-campus-id-campus-cloud',
        narrationId: 's02.campus-id.campus-cloud',
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
      open: 's02.campusgram.open',
      understood: 's02.campusgram.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'Campusgram wird geöffnet …',
      open: 'Lokale Inhaltsbereiche ansehen',
      understood: 'Campusgram verstanden',
    },
    summaries: {
      locked: 'Campusgram ist geschlossen.',
      opening: 'Campusgram wird geöffnet. Drei lokale Inhaltsbereiche erscheinen.',
      progress: '{opened} von {total} Details in Campusgram geöffnet.',
      checking: '{detail} wird geöffnet.',
      understood: 'Campusgram verstanden. Alle drei lokalen Inhaltsbereiche wurden angesehen.',
    },
    details: [
      {
        id: 'campusgram-direct-messages',
        label: 'Direktnachrichten',
        symbolId: 'direct-messages',
        preview: { kind: 'direct-messages' },
        position: { x: 0.27, y: 0.76 },
        animationId: 's02-check-campusgram-direct-messages',
        narrationId: 's02.campusgram.direct-messages',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Direktnachrichten werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campusgram-groups-contacts',
        label: 'Gruppen und Kontakte',
        symbolId: 'groups-contacts',
        preview: { kind: 'groups-contacts' },
        position: { x: 0.46, y: 0.81 },
        animationId: 's02-check-campusgram-groups-contacts',
        narrationId: 's02.campusgram.groups-contacts',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Gruppen und Kontakte werden geöffnet …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campusgram-posts-reactions',
        label: 'Beiträge und Reaktionen',
        symbolId: 'posts-reactions',
        preview: { kind: 'posts-reactions' },
        position: { x: 0.52, y: 0.58 },
        animationId: 's02-check-campusgram-posts-reactions',
        narrationId: 's02.campusgram.posts-reactions',
        descriptions: {
          available: 'Vorschau öffnen',
          checking: 'Beiträge und Reaktionen werden geöffnet …',
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
    variants: {
      'campus-workspace': { app: 'Campus Workspace', title: 'Arbeitsräume', category: 'login' },
      'campus-services': {
        app: 'Campus Services',
        title: 'Persönliche Vorgänge',
        category: 'login',
      },
      'campus-cloud': {
        app: 'Campus Cloud',
        title: 'Persönliche Dateien, Notizen und Entwürfe',
        category: 'login',
      },
      'mail-list': { app: 'Campus E-Mail', title: 'Benachrichtigungen', category: 'mail' },
      confirmation: { app: 'Campus E-Mail', title: 'Bestätigungen', category: 'mail' },
      'reset-link': { app: 'Campus E-Mail', title: 'Zurücksetzungslink', category: 'mail' },
      compose: { app: 'Campus E-Mail', title: 'Neue Nachricht', category: 'mail' },
      'direct-messages': {
        app: 'Campusgram',
        title: 'Direktnachrichten',
        category: 'social',
        primaryItem: {
          authorInitial: 'L',
          label: 'Private Nachricht',
          text: 'Kannst du die Datei heute noch freigeben?',
        },
        replyItem: {
          authorInitial: 'M',
          label: 'Antwort',
          text: 'Ja, ich teile sie gleich mit dem Team.',
        },
      },
      'groups-contacts': {
        app: 'Campusgram',
        title: 'Gruppen und Kontakte',
        category: 'social',
        primaryItem: {
          authorInitial: 'T',
          label: 'Team Nachhaltigkeit',
          text: '12 Kontakte und zwei gemeinsame Initiativen.',
        },
        replyItem: {
          authorInitial: 'R',
          label: 'Kontakt aktualisiert',
          text: 'Neue Verbindung in der Arbeitsgruppe.',
        },
      },
      'posts-reactions': {
        app: 'Campusgram',
        title: 'Beiträge und Reaktionen',
        category: 'social',
        primaryItem: {
          authorInitial: 'V',
          label: 'Beitrag zur Veranstaltung',
          text: 'Die Rückmeldung zur gemeinsamen Veranstaltung ist veröffentlicht.',
        },
        replyItem: {
          authorInitial: 'K',
          label: 'Neue Reaktion',
          text: 'Kommentar und Reaktion wurden hinzugefügt.',
        },
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
        'Master Campus ist dein zentraler Zugang. Mit einem Passwort öffnest du Campus Workspace, Campus Services und Campus Cloud.',
      's02.campus-id.understood':
        'Hinter diesem einen Zugang liegen Projekt- und Arbeitsräume, persönliche Verwaltungsvorgänge sowie persönliche Dateien, Notizen und Entwürfe.',
      's02.campus-id.workspace':
        'Campus Workspace enthält Projekt- und Arbeitsräume, geteilte Dateien und Gruppenmitgliedschaften.',
      's02.campus-id.services':
        'Campus Services enthält persönliche Angaben, Anträge, Termine und Dokumente.',
      's02.campus-id.campus-cloud':
        'Campus Cloud enthält persönliche Dateien, Notizen und Entwürfe.',
      's02.campus-mail.open':
        'Campus E-Mail verbindet Nachrichten, Bestätigungen, Zurücksetzungen und Kommunikation.',
      's02.campus-mail.understood':
        'Campus E-Mail ist die Brücke zu persönlichen Informationen, Zurücksetzungen und Kommunikation in deinem Namen.',
      's02.campus-mail.notifications':
        'Benachrichtigungen zu Kursen, Terminen und Systemen zeigen, welche Vorgänge dich gerade betreffen.',
      's02.campus-mail.confirmations':
        'Bestätigungen für Anmeldungen oder Änderungen können verraten, was du gerade organisiert hast.',
      's02.campus-mail.reset-links':
        'Zurücksetzungslinks ermöglichen bei manchen Diensten, Änderungen zu bestätigen oder ein Passwort zurückzusetzen.',
      's02.campus-mail.impersonation':
        'Kommunikation in deinem Namen bedeutet in diesem Szenario, dass über dieses Postfach Nachrichten als du geschrieben werden könnten.',
      's02.campusgram.open':
        'Campusgram ist ein Community-Konto für persönliche Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen.',
      's02.campusgram.understood':
        'Die drei Bereiche zeigen persönliche Kommunikation, Kontakte sowie Beiträge und Reaktionen.',
      's02.campusgram.direct-messages':
        'Direktnachrichten können das Lesen privater Gespräche und Anhänge sowie Schreiben im Namen der Person ermöglichen.',
      's02.campusgram.groups-contacts':
        'Gruppen und Kontakte können Teams, Initiativen und Kontaktbeziehungen sichtbar machen.',
      's02.campusgram.posts-reactions':
        'Beiträge und Reaktionen können Beiträge, Kommentare, Interessen und Veranstaltungsaktivitäten sichtbar machen oder verändern.',
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
