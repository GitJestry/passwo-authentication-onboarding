import type { TrainingSectionId } from '@passwo/contracts';

export const s02AccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;
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

interface S02MailHeader {
  readonly from: string;
  readonly to: string;
  readonly cc: string;
  readonly sentAt: string;
}

export type S02VisualPreview =
  | {
      readonly app: string;
      readonly title: string;
      readonly category: 'login';
      readonly primaryLabel: string;
      readonly items: readonly string[];
      readonly resultLabel: string;
    }
  | {
      readonly app: string;
      readonly title: string;
      readonly category: 'mail';
      readonly primaryLabel: string;
      readonly items: readonly string[];
      readonly resultLabel: string;
      readonly header: S02MailHeader;
    }
  | {
      readonly app: string;
      readonly title: string;
      readonly category: 'social';
      readonly primaryLabel: string;
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
      readonly resultLabel: string;
    };

export type S02AnimationStep =
  | {
      readonly type: 'move-character';
      readonly pose: 'flight';
      readonly from: 'bottom-left';
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
  readonly previewSequence: readonly string[];
  readonly takeaway: string;
  readonly narrationId: string;
  readonly descriptions: {
    readonly locked: string;
    readonly opening: string;
    readonly ready: string;
    readonly viewed: string;
  };
  readonly summaries: {
    readonly locked: string;
    readonly opening: string;
    readonly ready: string;
    readonly checking: string;
    readonly viewed: string;
  };
  readonly details: readonly {
    readonly id: string;
    readonly label: string;
    readonly symbolId: string;
    readonly preview: {
      readonly kind: S02VisualPreviewKind;
      readonly animationId: string;
    };
    readonly position: { readonly x: number; readonly y: number };
    readonly descriptions: {
      readonly available: string;
      readonly opened: string;
    };
  }[];
}

export interface S02SegmentContent {
  readonly version: string;
  readonly source: {
    readonly document: string;
    readonly internalPages: readonly [4, 5, 6, 7];
    readonly copyReference: string;
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
    readonly globalProgress: (viewed: number) => string;
    readonly openTaskHelp: string;
    readonly previewTitle: string;
    readonly completion: string;
    readonly previewReplay: string;
    readonly previewNext: string;
    readonly previewFinish: string;
  };
  readonly controls: {
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly timingErrorCode: string;
    readonly retry: string;
  };
  readonly previewSimulation: {
    readonly address: string;
    readonly welcomeLabel: string;
    readonly authProgressLabel: string;
    readonly variants: Readonly<Record<S02VisualPreviewKind, S02VisualPreview>>;
  };
  readonly narration: {
    readonly guideName: string;
    readonly introId: string;
    readonly introModelId: string;
    readonly introReadyId: string;
    readonly completeId: string;
    readonly messages: Readonly<Record<string, string>>;
    readonly remainingDetails: (labels: readonly string[]) => string;
    readonly finishAccount: (accountLabel: string) => string;
    readonly remainingAccounts: (labels: readonly string[]) => string;
    readonly completion: (platform: S02DesktopPlatform) => string;
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

export type S02DesktopPlatform = 'mac' | 'linux' | 'windows';

export const S02_CONTENT_VERSION = '5.4.1';

function formatGermanList(labels: readonly string[]): string {
  if (labels.length <= 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} und ${labels.at(-1) ?? ''}`;
}

const introId = 's02.accounts.intro';
const introModelId = 's02.accounts.intro-model';
const introReadyId = 's02.accounts.intro-ready';
const completeId = 's02.accounts.complete';

const accounts = [
  {
    id: 'master-campus',
    label: 'Master Campus',
    symbolId: 'master-campus',
    position: { x: 0.42, y: 0.25 },
    detailKind: 'service',
    edgeKind: 'dependency',
    edgeLabel: 'Mit Master Campus geöffnet',
    unlockAnimationId: 's02-unlock-master-campus',
    detailRevealAnimationId: 's02-reveal-master-campus-details',
    previewSequence: [
      'master-campus-workspace',
      'master-campus-services',
      'master-campus-campus-cloud',
    ],
    takeaway: 'Ein Master-Campus-Zugang kann mehrere verbundene Campusdienste öffnen.',
    narrationId: 's02.master-campus',
    descriptions: {
      locked: 'Konto zum Kennenlernen öffnen',
      opening: 'Master Campus wird geöffnet …',
      ready: 'Verbundene Campusdienste nacheinander ansehen',
      viewed: 'Master Campus angesehen',
    },
    summaries: {
      locked: 'Master Campus ist noch geschlossen.',
      opening: 'Master Campus wird geöffnet. Die verbundenen Dienste erscheinen.',
      ready: 'Sieh dir die verbundenen Campusdienste nacheinander an.',
      checking: '{detail} wird in der Vorschau gezeigt.',
      viewed: 'Master Campus und seine verbundenen Dienste wurden angesehen.',
    },
    details: [
      {
        id: 'master-campus-workspace',
        label: 'Campus Workspace',
        symbolId: 'campus-workspace',
        preview: {
          kind: 'campus-workspace',
          animationId: 's02-preview-master-campus-workspace',
        },
        position: { x: 0.25, y: 0.1 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'master-campus-services',
        label: 'Campus Services',
        symbolId: 'campus-services',
        preview: {
          kind: 'campus-services',
          animationId: 's02-preview-master-campus-services',
        },
        position: { x: 0.26, y: 0.31 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'master-campus-campus-cloud',
        label: 'Campus Cloud',
        symbolId: 'campus-cloud',
        preview: {
          kind: 'campus-cloud',
          animationId: 's02-preview-master-campus-cloud',
        },
        position: { x: 0.18, y: 0.36 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
    ],
  },
  {
    id: 'campus-email',
    label: 'Campus E-Mail',
    symbolId: 'campus-email',
    position: { x: 0.42, y: 0.77 },
    detailKind: 'function',
    edgeKind: 'association',
    edgeLabel: 'In Campus E-Mail',
    unlockAnimationId: 's02-unlock-campus-email',
    detailRevealAnimationId: 's02-reveal-campus-email-details',
    previewSequence: [
      'campus-email-notifications',
      'campus-email-confirmations',
      'campus-email-reset-links',
      'campus-email-impersonation',
    ],
    takeaway: 'Über Campus E-Mail laufen Nachrichten, Bestätigungen und wichtige Kontovorgänge.',
    narrationId: 's02.campus-email',
    descriptions: {
      locked: 'Konto zum Kennenlernen öffnen',
      opening: 'Campus E-Mail wird geöffnet …',
      ready: 'Nachrichten und Kontovorgänge nacheinander ansehen',
      viewed: 'Campus E-Mail angesehen',
    },
    summaries: {
      locked: 'Campus E-Mail ist noch geschlossen.',
      opening: 'Campus E-Mail wird geöffnet. Vier Funktionen erscheinen.',
      ready: 'Sieh dir typische Nachrichten und Kontovorgänge nacheinander an.',
      checking: '{detail} wird im Postfach gezeigt.',
      viewed: 'Campus E-Mail und die zugehörigen Kontovorgänge wurden angesehen.',
    },
    details: [
      {
        id: 'campus-email-notifications',
        label: 'Benachrichtigungen',
        symbolId: 'notifications',
        preview: { kind: 'mail-list', animationId: 's02-preview-campus-email-notifications' },
        position: { x: 0.18, y: 0.58 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'campus-email-confirmations',
        label: 'Bestätigungen',
        symbolId: 'confirmations',
        preview: { kind: 'confirmation', animationId: 's02-preview-campus-email-confirmations' },
        position: { x: 0.32, y: 0.58 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'campus-email-reset-links',
        label: 'Zurücksetzungslinks',
        symbolId: 'reset-links',
        preview: { kind: 'reset-link', animationId: 's02-preview-campus-email-reset-links' },
        position: { x: 0.18, y: 0.81 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'campus-email-impersonation',
        label: 'Nachrichten schreiben',
        symbolId: 'compose-message',
        preview: { kind: 'compose', animationId: 's02-preview-campus-email-compose' },
        position: { x: 0.32, y: 0.81 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
    ],
  },
  {
    id: 'campusgram',
    label: 'Campusgram',
    symbolId: 'campusgram',
    position: { x: 0.8, y: 0.5 },
    detailKind: 'content',
    edgeKind: 'association',
    edgeLabel: 'In Campusgram',
    unlockAnimationId: 's02-unlock-campusgram',
    detailRevealAnimationId: 's02-reveal-campusgram-details',
    previewSequence: [
      'campusgram-direct-messages',
      'campusgram-groups-contacts',
      'campusgram-posts-reactions',
    ],
    takeaway: 'Campusgram enthält persönliche Beiträge und Kommunikation mit anderen Personen.',
    narrationId: 's02.campusgram',
    descriptions: {
      locked: 'Konto zum Kennenlernen öffnen',
      opening: 'Campusgram wird geöffnet …',
      ready: 'Persönliche Kommunikation und Beiträge nacheinander ansehen',
      viewed: 'Campusgram angesehen',
    },
    summaries: {
      locked: 'Campusgram ist noch geschlossen.',
      opening: 'Campusgram wird geöffnet. Die Kommunikationsbereiche erscheinen.',
      ready: 'Sieh dir persönliche Nachrichten, Kontakte und Beiträge nacheinander an.',
      checking: '{detail} wird in der Vorschau gezeigt.',
      viewed: 'Campusgram und seine Kommunikationsbereiche wurden angesehen.',
    },
    details: [
      {
        id: 'campusgram-direct-messages',
        label: 'Direktnachrichten',
        symbolId: 'direct-messages',
        preview: { kind: 'direct-messages', animationId: 's02-preview-campusgram-messages' },
        position: { x: 0.66, y: 0.82 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'campusgram-groups-contacts',
        label: 'Gruppen und Kontakte',
        symbolId: 'groups-contacts',
        preview: { kind: 'groups-contacts', animationId: 's02-preview-campusgram-contacts' },
        position: { x: 0.8, y: 0.82 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
        },
      },
      {
        id: 'campusgram-posts-reactions',
        label: 'Beiträge und Reaktionen',
        symbolId: 'posts-reactions',
        preview: { kind: 'posts-reactions', animationId: 's02-preview-campusgram-posts' },
        position: { x: 0.94, y: 0.82 },
        descriptions: {
          available: 'Vorschau noch nicht angesehen',
          opened: 'Vorschau angesehen',
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
        durationMs: 347,
      },
      { type: 'highlight', targetId: account.id, emphasis: 'positive', durationMs: 427 },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 774,
  };
}

function revealDetailsAnimation(account: S02AccountContent): S02AnimationSequence {
  return {
    id: account.detailRevealAnimationId,
    steps: account.details.flatMap((detail, index) => [
      { type: 'reveal' as const, targetId: detail.id, durationMs: 210 },
      ...(index === account.details.length - 1
        ? []
        : [{ type: 'pause' as const, durationMs: 60 }]),
    ]),
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: account.details.length * 270,
  };
}

function previewAnimation(
  detail: S02AccountContent['details'][number],
): S02AnimationSequence {
  const target = (part: string) => `${detail.id}:${part}`;
  if (detail.id.startsWith('master-campus-')) {
    return {
      id: detail.preview.animationId,
      steps: [
        { type: 'reveal', targetId: target('surface'), durationMs: 250 },
        { type: 'reveal', targetId: target('cursor'), durationMs: 800 },
        { type: 'highlight', targetId: target('primary'), emphasis: 'positive', durationMs: 250 },
        { type: 'reveal', targetId: target('auth-status'), durationMs: 1200 },
        { type: 'reveal', targetId: target('result'), durationMs: 500 },
      ],
      reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
      maxDurationMs: 3000,
    };
  }
  return {
    id: detail.preview.animationId,
    steps: [
      { type: 'reveal', targetId: target('surface'), durationMs: 320 },
      { type: 'pause', durationMs: 180 },
      { type: 'highlight', targetId: target('primary'), emphasis: 'positive', durationMs: 520 },
      { type: 'reveal', targetId: target('result'), durationMs: 620 },
      { type: 'reveal', targetId: target('secondary'), durationMs: 300 },
      { type: 'highlight', targetId: target('secondary'), emphasis: 'positive', durationMs: 420 },
      { type: 'pause', durationMs: 240 },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 2600,
  };
}

function introAnimation(): S02AnimationSequence {
  return {
    id: 's02-reveal-accounts',
    steps: [
      ...accounts.map((account) => ({
        type: 'reveal' as const,
        targetId: account.id,
        durationMs: 340,
      })),
      { type: 'announce', messageId: introModelId },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 340,
  };
}

const animations = [
  introAnimation(),
  ...accounts.flatMap((account) => [
    unlockAnimation(account),
    revealDetailsAnimation(account),
    ...account.details.map((detail) => previewAnimation(detail)),
  ]),
];

export const s02Content: S02SegmentContent = {
  version: S02_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [4, 5, 6, 7],
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s02-entlastender-auswahlhinweis-11-august-2026',
  },
  segment: {
    id: 'S02',
    sectionId: 'passwords',
  },
  trainingAriaLabel: 'PassWo Training, Segment S02, Konten kennenlernen',
  accessibility: {
    networkLabel: 'Knotennetz zum Erkunden der drei Konten',
    canvasLabel: 'Frei angeordnete Karte mit drei fiktiven Konten',
    currentContextLabel: 'Aktueller Hinweis von PassWo',
    characterLabel: 'PassWo, Begleiter im Training',
  },
  page: {
    eyebrow: 'Konten erkundet',
    title: 'Drei Konten erkunden',
    globalProgress: (viewed) => `Konten erkundet: ${viewed}/3 angesehen`,
    openTaskHelp: 'Aufgabe noch einmal anzeigen',
    previewTitle: 'Vorschau',
    completion: 'Konten erkundet',
    previewReplay: 'Wiederholen',
    previewNext: 'Nächstes',
    previewFinish: 'Fertig',
  },
  controls: {
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    timingErrorCode: 'Fehlercode',
    retry: 'Erneut versuchen',
  },
  previewSimulation: {
    address: 'campus.local',
    welcomeLabel: 'Willkommen bei',
    authProgressLabel: 'Anmeldung läuft …',
    variants: {
      'campus-workspace': {
        app: 'Campus Workspace',
        title: 'Projekte und Arbeitsräume',
        category: 'login',
        primaryLabel: 'Mit Master Campus anmelden',
        items: ['Campus-App', 'Planung', 'Arbeitsgruppe', 'Projektplan.pdf'],
        resultLabel: 'Projektplan.pdf wurde für die Arbeitsgruppe freigegeben.',
      },
      'campus-services': {
        app: 'Campus Services',
        title: 'Persönliche Vorgänge und Dokumente',
        category: 'login',
        primaryLabel: 'Mit Master Campus anmelden',
        items: ['Persönliche Angaben', 'Anträge', 'Termine', 'Dokumente'],
        resultLabel: 'Semesterticket – eingereicht',
      },
      'campus-cloud': {
        app: 'Campus Cloud',
        title: 'Persönliche Dateien, Notizen und Entwürfe',
        category: 'login',
        primaryLabel: 'Mit Master Campus anmelden',
        items: ['Persönliche Dateien', 'Notizen', 'Entwürfe', 'Ideen Seminar'],
        resultLabel: 'Ideen Seminar – gespeichert',
      },
      'mail-list': {
        app: 'Campus E-Mail',
        title: 'Benachrichtigungen',
        category: 'mail',
        primaryLabel: 'Terminänderung für deine Campus-Beratung',
        header: {
          from: 'Campus Beratung <beratung@campus.example>',
          to: '{campusEmail}',
          cc: 'Studierendenservice <service@campus.example>',
          sentAt: 'Heute, 10:18 Uhr',
        },
        items: [
          'Campus Beratung',
          'Dein Termin am Donnerstag beginnt um 14:30 Uhr statt um 14:00 Uhr.',
        ],
        resultLabel: 'Terminänderung geöffnet',
      },
      confirmation: {
        app: 'Campus E-Mail',
        title: 'Bestätigungen',
        category: 'mail',
        primaryLabel: 'Bestätige deine Anmeldung',
        header: {
          from: 'Campus Veranstaltungen <events@campus.example>',
          to: '{campusEmail}',
          cc: 'Veranstaltungsbüro <veranstaltungen@campus.example>',
          sentAt: 'Heute, 11:42 Uhr',
        },
        items: ['Fast geschafft …', 'Bestätige deine Anmeldung'],
        resultLabel: 'Ja, ich möchte mich anmelden',
      },
      'reset-link': {
        app: 'Campus E-Mail',
        title: 'Passwort zurücksetzen',
        category: 'mail',
        primaryLabel: 'Passwort für Master Campus zurücksetzen',
        header: {
          from: 'Master Campus <konto@campus.example>',
          to: '{campusEmail}',
          cc: 'Campus IT-Service <it-service@campus.example>',
          sentAt: 'Heute, 12:07 Uhr',
        },
        items: [
          'Jemand hat das Zurücksetzen deines Passworts für das folgende Konto angefordert:',
          'Dienst: Master Campus',
          'Benutzername: {username}',
          'Wenn du das nicht angefordert hast, ignoriere diese E-Mail. Dein Passwort bleibt unverändert.',
        ],
        resultLabel: 'Passwort zurücksetzen',
      },
      compose: {
        app: 'Campus E-Mail',
        title: 'Neue Nachricht',
        category: 'mail',
        primaryLabel: 'Nachricht schreiben',
        header: {
          from: '{campusEmail}',
          to: 'Max Mustermann <max.mustermann@campus.example>',
          cc: 'Prüfungsamt <pruefungsamt@campus.example>',
          sentAt: 'Entwurf · heute, 14:26 Uhr',
        },
        items: [
          'Sehr geehrter Herr Mustermann,',
          'ich wollte Sie wegen der vertraulichen Unterlagen kontaktieren.',
          'Viele Grüße',
          '{username}',
        ],
        resultLabel: 'Nachricht senden',
      },
      'direct-messages': {
        app: 'Campusgram',
        title: 'Direktnachrichten',
        category: 'social',
        primaryLabel: 'Chat mit Lea',
        primaryItem: {
          authorInitial: 'L',
          label: 'Lea',
          text: 'Hi, hast du das neue Video vom Campusfest gesehen?',
        },
        replyItem: {
          authorInitial: 'B',
          label: '{username}',
          text: 'Ja, das mit der Band war richtig gut!',
        },
        resultLabel: 'Videovorschau vom Campusfest',
      },
      'groups-contacts': {
        app: 'Campusgram',
        title: 'Gruppen und Kontakte',
        category: 'social',
        primaryLabel: 'Kontakte',
        primaryItem: {
          authorInitial: 'P',
          label: 'Projekt Nachhaltigkeit',
          text: '12 Mitglieder · 3 neue Beiträge',
        },
        replyItem: {
          authorInitial: 'T',
          label: 'Tutorium Informatik',
          text: '8 Kontakte · Treffen am Freitag',
        },
        resultLabel: 'Lea Sommer · Tobias Kern · Mina Yilmaz',
      },
      'posts-reactions': {
        app: 'Campusgram',
        title: 'Beiträge und Reaktionen',
        category: 'social',
        primaryLabel: 'Campus-Feed',
        primaryItem: {
          authorInitial: 'C',
          label: 'Video vom Campusfest',
          text: 'Live-Musik auf dem Innenhof · 18 Reaktionen',
        },
        replyItem: {
          authorInitial: 'B',
          label: 'Neuer Beitrag',
          text: 'Hat jemand Tipps für die Projektpräsentation am Freitag?',
        },
        resultLabel: 'Beitrag veröffentlicht',
      },
    },
  },
  narration: {
    guideName: 'PassWo',
    introId,
    introModelId,
    introReadyId,
    completeId,
    messages: {
      [introId]:
        'Im Alltag ist oft nicht sichtbar, was alles mit einem Konto verbunden ist.',
      [introModelId]:
        'Du kannst dir jedes Konto als Knoten in einem Netzwerk vorstellen. Die Verbindungen zeigen, was dazugehört.',
      [introReadyId]:
        'Du musst dir dabei keine Einzelheiten merken. Wähle aus, welches Konto du zuerst erkunden möchtest.',
      's02.master-campus':
        'Sieh dir nacheinander an, welche Campusdienste du mit Master Campus öffnest.',
      's02.campus-email':
        'Sieh dir nacheinander typische Nachrichten und Kontovorgänge im Postfach an.',
      's02.campusgram':
        'Sieh dir nacheinander persönliche Nachrichten, Kontakte und Beiträge an.',
    },
    remainingDetails: (labels) => `Sieh dir noch ${formatGermanList(labels)} an.`,
    finishAccount: (accountLabel) =>
      `Alles in ${accountLabel} angesehen. Wähle „Fertig“.`,
    remainingAccounts: (labels) => `Wähle noch ${formatGermanList(labels)} aus.`,
    completion: (platform) => {
      switch (platform) {
        case 'mac':
          return 'Du hast dir alle drei Konten angesehen. Klicke unten im Dock auf den Browser, um dich wieder anzumelden.';
        case 'linux':
          return 'Du hast dir alle drei Konten angesehen. Klicke links in der Taskleiste auf den Browser, um dich wieder anzumelden.';
        case 'windows':
          return 'Du hast dir alle drei Konten angesehen. Klicke unten in der Taskleiste auf den Browser, um dich wieder anzumelden.';
      }
    },
  },
  scene: {
    id: 's02-account-exploration',
    introAnimationId: 's02-reveal-accounts',
    summaries: {
      initial: 'Drei Konten sind sichtbar und können in beliebiger Reihenfolge angesehen werden.',
      complete: 'Alle drei Konten und ihre Vorschauen wurden angesehen.',
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
