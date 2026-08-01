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
  };
  readonly source: {
    readonly document: string;
    readonly internalPage: 2;
    readonly uxReference: string;
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
      readonly title: string;
      readonly description: string;
      readonly identityName: string;
      readonly navigation: readonly string[];
      readonly modules: readonly {
        readonly title: string;
        readonly description: string;
      }[];
    };
  };
  readonly narration: {
    readonly guideName: string;
    readonly greeting: string;
    readonly safetyWarning: string;
    readonly openGuideLabel: string;
    readonly closeGuideLabel: string;
    readonly accountExplanations: readonly {
      readonly accountId: 'campus-mail' | 'campus-board-archive';
      readonly text: string;
    }[];
  };
  readonly controls: {
    readonly continue: string;
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

export const S00_CONTENT_VERSION = '1.14.0';

export const s00Content: S00SegmentContent = {
  version: S00_CONTENT_VERSION,
  trainingAriaLabel: 'PassWo Training, Segment S00',
  entry: {
    title: 'Passwörter & Authentifizierung',
    paragraphs: [
      'Aloha! Ich bin PassWo und begleite dich heute durch das Training.',
      'Stell dir vor, du hast an einer Hochschule gerade neue Campuszugänge erhalten und musst nun drei Campuskonten einrichten.',
      'In der ersten Sektion entscheidest du selbst, welche Passwörter du für diese Konten verwendest. Überlege wie du die Konten in so einer Situation schützen würdest, und erstelle dafür starke Passwörter, die du dir gut merken kannst.',
      'Nach einem kurzen Zwischenschritt meldest du dich noch einmal bei allen drei Konten an. Wähle deine Passwörter deshalb so, dass du sie später wieder abrufen kannst.',
      'Du arbeitest gleich in einem virtuellen PC. Wähle gerne das Betriebssystem, das deinem Alltag am nächsten kommt.',
    ],
    nameLabel: 'Wie soll PassWo dich ansprechen?',
    startLabel: 'Training starten',
  },
  sectionTransition: {
    label: 'Sektion 1',
    title: 'Starke Passwörter',
    holdDurationMs: 3500,
  },
  source: {
    document: 'research/private/training-script.pdf',
    internalPage: 2,
    uxReference: 'Vom Nutzer bereitgestellte UX-Konzeptboards, 2026-07-31',
  },
  segment: {
    id: 'S00',
    sectionId: 'passwords',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S00',
    address: 'campus.example/start',
    tabs: [
      { id: 'campus-id', label: 'Master Campus', enabled: true },
      { id: 'campus-mail', label: 'Campus E-Mail', enabled: false },
      { id: 'campus-board-archive', label: 'Campusgram', enabled: false },
    ],
    page: {
      title: 'Zentraler Zugang zum Campus',
      description: 'Verwalte deinen Zugang zu zentralen Campusdiensten an einem Ort.',
      identityName: 'Master Campus',
      navigation: ['Übersicht', 'Dienste', 'Hilfe'],
      modules: [
        {
          title: 'Campusdienste',
          description: 'Zentrale Bereiche werden für dich bereitgestellt.',
        },
        {
          title: 'Aktuelle Hinweise',
          description: 'Neue Informationen erscheinen hier in einer Übersicht.',
        },
      ],
    },
  },
  narration: {
    guideName: 'PassWo',
    greeting:
      'Das ist dein Browser. Bevor du die Passwörter erstellst, erkläre ich dir kurz, wofür die drei Konten überhaupt stehen.\n\nMaster Campus ist dein zentraler Zugang. Mit dem Konto meldest du dich auch bei Campus Workspace für Projekt- und Arbeitsräume, Campus Services für Anträge, Termine und Dokumente sowie Campus Cloud für persönliche Dateien, Notizen und Entwürfe an.',
    accountExplanations: [
      {
        accountId: 'campus-mail',
        text: 'Campus E-Mail ist dein Postfach für Campus-Nachrichten, Bestätigungen und Zurücksetzungslinks.',
      },
      {
        accountId: 'campus-board-archive',
        text: 'Campusgram ist ein Community-Konto für persönliche Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen.',
      },
    ],
    safetyWarning:
      'Nutze bitte keine eigenen Passwörter oder Varianten davon. Und keine Sorge, die Eingaben werden nur lokal für diese fiktive Übung ausgewertet und nicht dauerhaft gespeichert.\nViel Erfolg!',
    openGuideLabel: 'PassWo-Hilfe öffnen',
    closeGuideLabel: 'PassWo-Hilfe schließen',
  },
  controls: {
    continue: 'Weiter',
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
