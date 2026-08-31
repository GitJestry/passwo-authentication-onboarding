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
  readonly entry: {
    readonly title: string;
    readonly paragraphs: readonly string[];
    readonly nameLabel: string;
    readonly startLabel: string;
  };
  readonly sectionTransition: {
    readonly label: string;
    readonly title: string;
    readonly holdDurationMs: number;
    readonly parts: readonly {
      readonly id:
        | 'account-setup'
        | 'password-strength'
        | 'unique-passwords'
        | 'change-passwords';
      readonly label: string;
    }[];
  };
  readonly source: {
    readonly uxReference: string;
    readonly copyReference: string;
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
  };
  readonly narration: {
    readonly guideName: string;
    readonly greeting: string;
    readonly safetyWarning: string;
    readonly openGuideLabel: string;
  };
  readonly controls: {
    readonly animationError: string;
  };
  readonly mission: {
    readonly id: 's00-entry-and-safety';
    readonly requiresSafetyAcknowledgement: false;
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

export const S00_CONTENT_VERSION = '1.25.1';

export const s00Content: S00SegmentContent = {
  version: S00_CONTENT_VERSION,
  trainingAriaLabel: 'PassWo Training, Segment S00',
  entry: {
    title: 'Passwörter & Authentifizierung',
    paragraphs: [
      'Aloha! Ich bin PassWo und begleite dich heute durch das Training.',
      'Stell dir vor, du hast an einer Hochschule drei neue Campuskonten erhalten. Überlege, wie du solche Konten sicher schützen würdest, und wähle für jedes ein starkes Passwort, das du dir gut merken kannst.',
      'Später meldest du dich noch einmal bei allen drei Konten an. Wähle die Passwörter daher so, dass du sie wieder abrufen kannst.',
      'Du arbeitest gleich in einem virtuellen PC. Wähle dafür das Betriebssystem, das deinem Alltag am nächsten kommt.',
    ],
    nameLabel: 'Welchen fiktiven Benutzernamen möchtest du verwenden?',
    startLabel: 'Training starten',
  },
  sectionTransition: {
    label: 'Sektion 1 von 3',
    title: 'Starke Passwörter',
    holdDurationMs: 3500,
    parts: [
      { id: 'account-setup', label: 'Konten einrichten' },
      { id: 'password-strength', label: 'Passwortstärke verstehen' },
      { id: 'unique-passwords', label: 'Für jedes Konto ein eigenes Passwort' },
      { id: 'change-passwords', label: 'Passwort sicher ersetzen' },
    ],
  },
  source: {
    uxReference: 'Vom Nutzer bereitgestellte UX-Konzeptboards, 2026-07-31',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s00-eigene-passwoerter-23-august-2026',
  },
  segment: {
    id: 'S00',
    sectionId: 'passwords',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S00',
    address: 'campus.example/start',
    tabs: [
      { id: 'master-campus', label: 'Master Campus', enabled: true },
      { id: 'campus-email', label: 'Campus E-Mail', enabled: false },
      { id: 'campusgram', label: 'Campusgram', enabled: false },
    ],
  },
  narration: {
    guideName: 'PassWo',
    greeting:
      'Das ist dein virtueller Browser: Oben wechselst du zwischen drei Konten und richtest alle drei ein.',
    safetyWarning:
      'Bitte keine echten Passwörter oder Varianten davon verwenden. Deine Eingaben werden nur für diese Übung verarbeitet und nicht dauerhaft gespeichert. Viel Spaß beim Ausprobieren!',
    openGuideLabel: 'PassWo-Hilfe öffnen',
  },
  controls: {
    animationError:
      'Die Animation wurde beendet. Du kannst fortfahren.',
  },
  mission: {
    id: 's00-entry-and-safety',
    requiresSafetyAcknowledgement: false,
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
          maxDurationMs: 800,
        },
      },
    ],
  },
};
