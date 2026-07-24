import type { PassWoPlacement, PassWoPose, TrainingSectionId } from '@passwo/contracts';

export type S00AnimationStep =
  | {
      readonly type: 'move-character';
      readonly pose: PassWoPose;
      readonly from: PassWoPlacement;
      readonly to: PassWoPlacement;
      readonly durationMs: number;
    }
  | { readonly type: 'reveal'; readonly targetId: string; readonly durationMs: number }
  | { readonly type: 'pause'; readonly durationMs: number }
  | { readonly type: 'announce'; readonly messageId: string };

export interface S00SegmentContent {
  readonly version: string;
  readonly trainingAriaLabel: string;
  readonly source: {
    readonly document: string;
    readonly internalPage: 2;
  };
  readonly segment: {
    readonly id: 'S00';
    readonly sectionId: TrainingSectionId;
  };
  readonly browser: {
    readonly ariaLabel: string;
    readonly address: string;
    readonly tabs: readonly {
      readonly id: string;
      readonly label: string;
      readonly enabled: boolean;
    }[];
    readonly page: {
      readonly eyebrow: string;
      readonly title: string;
      readonly description: string;
      readonly identityName: string;
      readonly fictionalBadge: string;
    };
  };
  readonly narration: {
    readonly guideName: string;
    readonly title: string;
    readonly greetingTemplate: string;
    readonly followUp: string;
    readonly dockedHelp: string;
    readonly openGuideLabel: string;
    readonly closeGuideLabel: string;
  };
  readonly safety: {
    readonly targetId: 's00-safety-boundary';
    readonly label: string;
    readonly title: string;
    readonly body: string;
    readonly acknowledgement: string;
  };
  readonly controls: {
    readonly replay: string;
    readonly continue: string;
    readonly continueReason: string;
    readonly animationError: string;
  };
  readonly mission: {
    readonly id: 's00-entry-and-safety';
    readonly requiresSafetyAcknowledgement: true;
    readonly steps: readonly {
      readonly id: string;
      readonly narrationId: string;
      readonly animation: {
        readonly id: string;
        readonly steps: readonly S00AnimationStep[];
        readonly reducedMotion: {
          readonly strategy: 'instant-end-state';
          readonly maxDurationMs: 0;
        };
        readonly maxDurationMs: number;
      };
    }[];
  };
}

export const S00_CONTENT_VERSION = '1.0.0';

export const s00Content: S00SegmentContent = {
  version: S00_CONTENT_VERSION,
  trainingAriaLabel: 'PassWo Training, Segment S00',
  source: {
    document: 'research/private/training-script.pdf',
    internalPage: 2,
  },
  segment: {
    id: 'S00',
    sectionId: 'passwords',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S00',
    address: 'campus.example/start',
    tabs: [
      { id: 'campus-id', label: 'Campus-ID', enabled: true },
      { id: 'mail', label: 'Campus-Mail', enabled: false },
      { id: 'learning', label: 'Lernportal', enabled: false },
    ],
    page: {
      eyebrow: 'Willkommen',
      title: 'Dein Campus-Start',
      description:
        'Diese fiktive Übung begleitet dich beim Einrichten von drei Campus-Konten. Dafür werden hier keine Passwörter abgefragt.',
      identityName: 'Campusraum',
      fictionalBadge: 'Fiktive Übungsseite',
    },
  },
  narration: {
    guideName: 'PassWo',
    title: 'Willkommen im Training',
    greetingTemplate:
      'Hallo {displayName}, ich bin PassWo. Ich begleite dich heute Schritt für Schritt beim Einrichten deiner fiktiven Campus-Konten.',
    followUp:
      'Du wählst später für jedes Konto ein neu ausgedachtes Passwort, das stark und merkbar erscheint.',
    dockedHelp: 'Wenn du Fragen hast, bin ich unten links für dich da.',
    openGuideLabel: 'PassWo-Hilfe öffnen',
    closeGuideLabel: 'PassWo-Hilfe schließen',
  },
  safety: {
    targetId: 's00-safety-boundary',
    label: 'Safety Note',
    title: 'Hinweis für die Übung',
    body: 'Bitte verwende nur neue, ausgedachte Passwörter. Nutze keine echten Passwörter und keine Varianten davon. Eingaben dienen nur dieser fiktiven Übung und werden nicht dauerhaft gespeichert.',
    acknowledgement: 'Ich verwende nur ausgedachte Passwörter.',
  },
  controls: {
    replay: 'Animation wiederholen',
    continue: 'Weiter',
    continueReason: 'Bestätige zuerst den Hinweis für die Übung.',
    animationError: 'Die Animation wurde beendet. Du kannst den Hinweis bestätigen und fortfahren.',
  },
  mission: {
    id: 's00-entry-and-safety',
    requiresSafetyAcknowledgement: true,
    steps: [
      {
        id: 's00-arrival',
        narrationId: 's00.greeting',
        animation: {
          id: 's00-passwo-arrival',
          steps: [
            {
              type: 'move-character',
              pose: 'flight',
              from: 'offscreen-right',
              to: 'center',
              durationMs: 420,
            },
            { type: 'announce', messageId: 's00.greeting' },
            { type: 'reveal', targetId: 's00-safety-boundary', durationMs: 240 },
            {
              type: 'move-character',
              pose: 'dock',
              from: 'center',
              to: 'bottom-left',
              durationMs: 380,
            },
          ],
          reducedMotion: {
            strategy: 'instant-end-state',
            maxDurationMs: 0,
          },
          maxDurationMs: 1040,
        },
      },
    ],
  },
};

export function formatS00Greeting(displayName: string): string {
  return s00Content.narration.greetingTemplate.replace('{displayName}', displayName);
}
