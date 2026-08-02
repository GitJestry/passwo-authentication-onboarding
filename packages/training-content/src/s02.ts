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
  | { readonly type: 'reveal'; readonly targetId: string; readonly durationMs: number }
  | {
      readonly type: 'highlight';
      readonly targetId: string;
      readonly emphasis: 'positive';
      readonly durationMs: number;
    }
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
  readonly coreAction: {
    readonly id: string;
    readonly animationId: string;
    readonly targetDetailIds: readonly string[];
    readonly actionLabel: string;
    readonly checkingLabel: string;
    readonly takeaway: string;
  };
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
    readonly previewTitle: string;
    readonly completion: string;
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

export const S02_CONTENT_VERSION = '4.0.0';

const introId = 's02.accounts.intro';
const completeId = 's02.accounts.complete';

const accounts = [
  {
    id: 'master-campus',
    label: 'Master Campus',
    symbolId: 'master-campus',
    position: { x: 0.12, y: 0.08 },
    detailKind: 'service',
    edgeKind: 'dependency',
    edgeLabel: 'Mit Master Campus geöffnet',
    unlockAnimationId: 's02-unlock-master-campus',
    detailRevealAnimationId: 's02-reveal-master-campus-details',
    coreAction: {
      id: 's02-master-campus-open-service',
      animationId: 's02-open-master-campus-service',
      targetDetailIds: ['master-campus-workspace'],
      actionLabel: 'Mit Master Campus öffnen',
      checkingLabel: 'Master Campus wird geprüft …',
      takeaway: 'Ein Master-Campus-Zugang kann mehrere verbundene Campusdienste öffnen.',
    },
    narrationId: 's02.master-campus',
    descriptions: {
      locked: 'Konto zum Kennenlernen öffnen',
      opening: 'Master Campus wird geöffnet …',
      ready: 'Einen verbundenen Dienst über Master Campus öffnen',
      viewed: 'Master Campus angesehen',
    },
    summaries: {
      locked: 'Master Campus ist noch geschlossen.',
      opening: 'Master Campus wird geöffnet. Die verbundenen Dienste erscheinen.',
      ready: 'Wähle einen Dienst und öffne ihn mit Master Campus.',
      checking: '{detail} wird mit Master Campus geprüft.',
      viewed: 'Master Campus wurde angesehen. Weitere Dienste bleiben optional.',
    },
    details: [
      {
        id: 'master-campus-workspace',
        label: 'Campus Workspace',
        symbolId: 'campus-workspace',
        preview: { kind: 'campus-workspace' },
        position: { x: 0.03, y: 0.4 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'master-campus-services',
        label: 'Campus Services',
        symbolId: 'campus-services',
        preview: { kind: 'campus-services' },
        position: { x: 0.22, y: 0.58 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'master-campus-campus-cloud',
        label: 'Campus Cloud',
        symbolId: 'campus-cloud',
        preview: { kind: 'campus-cloud' },
        position: { x: 0.04, y: 0.79 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
  },
  {
    id: 'campus-email',
    label: 'Campus E-Mail',
    symbolId: 'campus-email',
    position: { x: 0.72, y: 0.06 },
    detailKind: 'function',
    edgeKind: 'association',
    edgeLabel: 'In Campus E-Mail',
    unlockAnimationId: 's02-unlock-campus-email',
    detailRevealAnimationId: 's02-reveal-campus-email-details',
    coreAction: {
      id: 's02-campus-email-open-reset-link',
      animationId: 's02-open-campus-email-reset-link',
      targetDetailIds: ['campus-email-reset-links'],
      actionLabel: 'Zurücksetzungslink im Postfach öffnen',
      checkingLabel: 'Kontovorgang wird im Postfach geöffnet …',
      takeaway: 'Über Campus E-Mail laufen Nachrichten, Bestätigungen und wichtige Kontovorgänge.',
    },
    narrationId: 's02.campus-email',
    descriptions: {
      locked: 'Konto zum Kennenlernen öffnen',
      opening: 'Campus E-Mail wird geöffnet …',
      ready: 'Beispielvorgang im Postfach starten',
      viewed: 'Campus E-Mail angesehen',
    },
    summaries: {
      locked: 'Campus E-Mail ist noch geschlossen.',
      opening: 'Campus E-Mail wird geöffnet. Vier Funktionen erscheinen.',
      ready: 'Starte den Beispielvorgang über den Zurücksetzungslink im Postfach.',
      checking: '{detail} wird im Postfach geöffnet.',
      viewed: 'Campus E-Mail wurde angesehen. Weitere Funktionen bleiben optional.',
    },
    details: [
      {
        id: 'campus-email-notifications',
        label: 'Benachrichtigungen',
        symbolId: 'notifications',
        preview: { kind: 'mail-list' },
        position: { x: 0.87, y: 0.34 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-email-confirmations',
        label: 'Bestätigungen',
        symbolId: 'confirmations',
        preview: { kind: 'confirmation' },
        position: { x: 0.67, y: 0.36 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-email-reset-links',
        label: 'Zurücksetzungslinks',
        symbolId: 'reset-links',
        preview: { kind: 'reset-link' },
        position: { x: 0.87, y: 0.7 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-email-impersonation',
        label: 'Nachrichten schreiben',
        symbolId: 'compose-message',
        preview: { kind: 'compose' },
        position: { x: 0.67, y: 0.74 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
  },
  {
    id: 'campusgram',
    label: 'Campusgram',
    symbolId: 'campusgram',
    position: { x: 0.43, y: 0.34 },
    detailKind: 'content',
    edgeKind: 'association',
    edgeLabel: 'In Campusgram',
    unlockAnimationId: 's02-unlock-campusgram',
    detailRevealAnimationId: 's02-reveal-campusgram-details',
    coreAction: {
      id: 's02-campusgram-open-direct-message',
      animationId: 's02-open-campusgram-direct-message',
      targetDetailIds: ['campusgram-direct-messages'],
      actionLabel: 'Direktnachricht öffnen',
      checkingLabel: 'Direktnachricht wird geöffnet …',
      takeaway: 'Campusgram enthält persönliche Beiträge und Kommunikation mit anderen Personen.',
    },
    narrationId: 's02.campusgram',
    descriptions: {
      locked: 'Konto zum Kennenlernen öffnen',
      opening: 'Campusgram wird geöffnet …',
      ready: 'Persönliche Kommunikationsansicht öffnen',
      viewed: 'Campusgram angesehen',
    },
    summaries: {
      locked: 'Campusgram ist noch geschlossen.',
      opening: 'Campusgram wird geöffnet. Die Kommunikationsbereiche erscheinen.',
      ready: 'Öffne die Direktnachricht in der persönlichen Kommunikationsansicht.',
      checking: '{detail} wird geöffnet.',
      viewed: 'Campusgram wurde angesehen. Weitere Bereiche bleiben optional.',
    },
    details: [
      {
        id: 'campusgram-direct-messages',
        label: 'Direktnachrichten',
        symbolId: 'direct-messages',
        preview: { kind: 'direct-messages' },
        position: { x: 0.27, y: 0.76 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campusgram-groups-contacts',
        label: 'Gruppen und Kontakte',
        symbolId: 'groups-contacts',
        preview: { kind: 'groups-contacts' },
        position: { x: 0.46, y: 0.81 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campusgram-posts-reactions',
        label: 'Beiträge und Reaktionen',
        symbolId: 'posts-reactions',
        preview: { kind: 'posts-reactions' },
        position: { x: 0.52, y: 0.58 },
        descriptions: {
          available: 'Optionale Vorschau öffnen',
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
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 1160,
  };
}

function revealDetailsAnimation(account: S02AccountContent): S02AnimationSequence {
  return {
    id: account.detailRevealAnimationId,
    steps: account.details.map((detail) => ({
      type: 'reveal',
      targetId: detail.id,
      durationMs: 420,
    })),
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 420,
  };
}

function coreActionAnimation(account: S02AccountContent): S02AnimationSequence {
  const targetId = account.coreAction.targetDetailIds[0];
  if (targetId === undefined) {
    throw new Error(`S02 core action requires a target detail: ${account.id}`);
  }
  return {
    id: account.coreAction.animationId,
    steps: [
      { type: 'highlight', targetId, emphasis: 'positive', durationMs: 420 },
      { type: 'reveal', targetId, durationMs: 440 },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 860,
  };
}

function introAnimation(): S02AnimationSequence {
  return {
    id: 's02-reveal-accounts',
    steps: [
      { type: 'announce', messageId: introId },
      ...accounts.map((account) => ({
        type: 'reveal' as const,
        targetId: account.id,
        durationMs: 340,
      })),
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
    coreActionAnimation(account),
  ]),
];

export const s02Content: S02SegmentContent = {
  version: S02_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [4, 5, 6, 7],
    copyReference: 'docs/design/S00-S05-COPY-AUDIT.md#s02----konten-kennenlernen',
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
    eyebrow: 'Konten kennenlernen',
    title: 'Drei Konten erkunden',
    globalProgress: (viewed) => `Konten kennenlernen: ${viewed}/3 angesehen`,
    previewTitle: 'Optionale Vorschau',
    completion: 'Alle drei Konten angesehen',
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
    masterCampusSignInLabel: 'Mit Master Campus öffnen',
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
      'reset-link': {
        app: 'Campus E-Mail',
        title: 'Zurücksetzungslink im Postfach',
        category: 'mail',
      },
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
        'Schau dir kurz an, was hinter den drei Konten liegt. Du musst dir keine Einzelheiten merken und kannst die Reihenfolge selbst wählen.',
      [completeId]:
        'Du hast alle drei Konten angesehen. Klicke unten im Dock auf den Browser, wenn du weitergehen möchtest.',
      's02.master-campus':
        'Öffne einen Dienst über die sichtbare Master-Campus-Anmeldung.',
      's02.campus-email':
        'Starte die kurze Beispielsimulation über den Zurücksetzungslink im Postfach.',
      's02.campusgram':
        'Öffne die Direktnachricht in der persönlichen Kommunikationsansicht.',
    },
  },
  scene: {
    id: 's02-account-exploration',
    introAnimationId: 's02-reveal-accounts',
    summaries: {
      initial: 'Drei Konten sind sichtbar und können in beliebiger Reihenfolge angesehen werden.',
      complete: 'Alle drei Konten wurden angesehen. Optionale Vorschauen bleiben verfügbar.',
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
