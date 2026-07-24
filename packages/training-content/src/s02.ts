import type { PassWoPlacement, PassWoPose, TrainingSectionId } from '@passwo/contracts';

export type S02AnimationStep =
  | {
      readonly type: 'move-character';
      readonly pose: PassWoPose;
      readonly from: PassWoPlacement;
      readonly to: PassWoPlacement;
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

export interface S02CampusIdContent {
  readonly version: string;
  readonly source: {
    readonly document: string;
    readonly internalPages: readonly [4, 5];
  };
  readonly segment: {
    readonly id: 'S02';
    readonly sectionId: TrainingSectionId;
    readonly slice: 'campus-id';
  };
  readonly trainingAriaLabel: string;
  readonly browser: {
    readonly ariaLabel: string;
    readonly address: string;
    readonly tab: {
      readonly id: string;
      readonly label: string;
      readonly enabled: true;
    };
  };
  readonly page: {
    readonly eyebrow: string;
    readonly title: string;
    readonly instruction: string;
    readonly progressLabel: string;
    readonly previewTitle: string;
    readonly previewLocked: string;
    readonly previewEmpty: string;
    readonly completion: string;
  };
  readonly narration: {
    readonly guideName: string;
    readonly messages: Readonly<Record<string, string>>;
  };
  readonly scene: {
    readonly id: string;
    readonly account: {
      readonly id: string;
      readonly label: string;
      readonly position: { readonly x: number; readonly y: number };
      readonly descriptions: {
        readonly locked: string;
        readonly opening: string;
        readonly open: string;
        readonly understood: string;
      };
    };
    readonly services: readonly {
      readonly id: string;
      readonly label: string;
      readonly preview: string;
      readonly position: { readonly x: number; readonly y: number };
      readonly animationId: string;
      readonly descriptions: {
        readonly available: string;
        readonly checking: string;
        readonly opened: string;
      };
    }[];
    readonly unlockAnimationId: string;
    readonly edgeLabel: string;
    readonly narrationIds: {
      readonly locked: string;
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
  };
  readonly animations: readonly S02AnimationSequence[];
}

export const S02_CAMPUS_ID_CONTENT_VERSION = '1.0.0';

const narrationIds = {
  locked: 's02.campus-id.intro',
  open: 's02.campus-id.services',
  understood: 's02.campus-id.complete',
} as const;

export const s02CampusIdContent: S02CampusIdContent = {
  version: S02_CAMPUS_ID_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [4, 5],
  },
  segment: {
    id: 'S02',
    sectionId: 'passwords',
    slice: 'campus-id',
  },
  trainingAriaLabel: 'PassWo Training, Segment S02, CampusID',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S02, CampusID',
    address: 'campus.example/konten/campus-id',
    tab: {
      id: 'account-map',
      label: 'Konten verstehen',
      enabled: true,
    },
  },
  page: {
    eyebrow: 'Konten verstehen',
    title: 'Was hängt an deiner CampusID?',
    instruction: 'Öffne CampusID und sieh dir danach alle drei verbundenen Dienste an.',
    progressLabel: 'Vorschauen geöffnet',
    previewTitle: 'Vorschau',
    previewLocked: 'Öffne zuerst CampusID, um die verbundenen Dienste zu sehen.',
    previewEmpty: 'Öffne einen Dienst, um seine kurze Vorschau anzusehen.',
    completion: 'CampusID verstanden',
  },
  narration: {
    guideName: 'PassWo',
    messages: {
      [narrationIds.locked]:
        'Du hast jetzt drei Passwörter, Schlüssel wie mich, die dir Türen zu Konten öffnen. Klicke auf die Konten, um zu sehen, welche Dienste oder Inhalte daran hängen.',
      [narrationIds.open]: 'Die Campusservices brauchen den Zugang über deine CampusID.',
      [narrationIds.understood]:
        'Zusammengefasst steckt hinter dem einen Passwort nicht nur die CampusID, sondern drei weitere persönliche Dienste.',
      's02.campus-id.learnspace-opened': 'LearnSpace wurde mit CampusID geöffnet.',
      's02.campus-id-exam-portal-opened': 'Prüfungsportal wurde mit CampusID geöffnet.',
      's02.campus-id-cloud-notes-opened': 'Cloud Notes wurde mit CampusID geöffnet.',
    },
  },
  scene: {
    id: 's02-campus-id',
    account: {
      id: 'campus-id',
      label: 'CampusID',
      position: { x: 0.08, y: 0.39 },
      descriptions: {
        locked: 'Konto öffnen',
        opening: 'CampusID wird geöffnet …',
        open: 'Drei verbundene Dienste',
        understood: 'CampusID verstanden',
      },
    },
    services: [
      {
        id: 'learnspace',
        label: 'LearnSpace',
        preview: 'Kurszugänge, Vorlesungsunterlagen, Abgaben',
        position: { x: 0.59, y: 0.04 },
        animationId: 's02-check-learnspace',
        descriptions: {
          available: 'Mit CampusID öffnen',
          checking: 'CampusID wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'exam-portal',
        label: 'Prüfungsportal',
        preview: 'Anmeldungen, Termine, Ergebnisübersichten',
        position: { x: 0.59, y: 0.38 },
        animationId: 's02-check-exam-portal',
        descriptions: {
          available: 'Mit CampusID öffnen',
          checking: 'CampusID wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'cloud-notes',
        label: 'Cloud Notes',
        preview: 'Notizen, Entwürfe, Arbeitsdateien, Projektmaterial',
        position: { x: 0.59, y: 0.72 },
        animationId: 's02-check-cloud-notes',
        descriptions: {
          available: 'Mit CampusID öffnen',
          checking: 'CampusID wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
    unlockAnimationId: 's02-unlock-campus-id',
    edgeLabel: 'Mit CampusID geöffnet',
    narrationIds,
    summaries: {
      locked: 'CampusID ist geschlossen. Die drei verbundenen Dienste sind noch nicht sichtbar.',
      opening: 'CampusID wird geöffnet. Die verbundenen Dienste erscheinen nacheinander.',
      progress: '{opened} von {total} CampusID-Vorschauen geöffnet.',
      checking: '{service} wird mit CampusID geprüft.',
      understood: 'CampusID verstanden. Alle drei verbundenen Dienste wurden geöffnet.',
    },
  },
  animations: [
    {
      id: 's02-unlock-campus-id',
      steps: [
        {
          type: 'move-character',
          pose: 'flight',
          from: 'bottom-left',
          to: 'focused-node',
          durationMs: 320,
        },
        { type: 'announce', messageId: narrationIds.open },
        { type: 'reveal', targetId: 'learnspace', durationMs: 180 },
        { type: 'pause', durationMs: 80 },
        { type: 'reveal', targetId: 'exam-portal', durationMs: 180 },
        { type: 'pause', durationMs: 80 },
        { type: 'reveal', targetId: 'cloud-notes', durationMs: 180 },
      ],
      reducedMotion: {
        strategy: 'instant-end-state',
        maxDurationMs: 0,
      },
      maxDurationMs: 1020,
    },
    {
      id: 's02-check-learnspace',
      steps: [
        {
          type: 'highlight',
          targetId: 'learnspace',
          emphasis: 'positive',
          durationMs: 260,
        },
        { type: 'announce', messageId: 's02.campus-id.learnspace-opened' },
      ],
      reducedMotion: {
        strategy: 'instant-end-state',
        maxDurationMs: 0,
      },
      maxDurationMs: 260,
    },
    {
      id: 's02-check-exam-portal',
      steps: [
        {
          type: 'highlight',
          targetId: 'exam-portal',
          emphasis: 'positive',
          durationMs: 260,
        },
        { type: 'announce', messageId: 's02.campus-id-exam-portal-opened' },
      ],
      reducedMotion: {
        strategy: 'instant-end-state',
        maxDurationMs: 0,
      },
      maxDurationMs: 260,
    },
    {
      id: 's02-check-cloud-notes',
      steps: [
        {
          type: 'highlight',
          targetId: 'cloud-notes',
          emphasis: 'positive',
          durationMs: 260,
        },
        { type: 'announce', messageId: 's02.campus-id-cloud-notes-opened' },
      ],
      reducedMotion: {
        strategy: 'instant-end-state',
        maxDurationMs: 0,
      },
      maxDurationMs: 260,
    },
  ],
};

export function getS02CampusIdAnimation(animationId: string): S02AnimationSequence | undefined {
  return s02CampusIdContent.animations.find(({ id }) => id === animationId);
}
