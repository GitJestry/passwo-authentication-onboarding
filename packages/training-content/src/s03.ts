import type { TrainingSectionId } from '@passwo/contracts';
import type { S01AccountId } from './s01.js';

export type S03RetrievalResult = 'pending' | 'retrievable' | 'not-remembered';

export type S03AnimationStep =
  | {
      readonly type: 'highlight';
      readonly targetId: string;
      readonly emphasis: 'info' | 'positive' | 'warning' | 'danger';
      readonly durationMs: number;
    }
  | { readonly type: 'pause'; readonly durationMs: number }
  | { readonly type: 'announce'; readonly messageId: string };

export interface S03AnimationSequence {
  readonly id: string;
  readonly steps: readonly S03AnimationStep[];
  readonly reducedMotion: {
    readonly strategy: 'instant-end-state';
    readonly maxDurationMs: 0;
  };
  readonly maxDurationMs: number;
}

export interface S03SegmentContent {
  readonly version: string;
  readonly source: {
    readonly document: string;
    readonly internalPages: readonly [8, 9, 10, 11];
  };
  readonly segment: {
    readonly id: 'S03';
    readonly sectionId: TrainingSectionId;
  };
  readonly trainingAriaLabel: string;
  readonly browser: {
    readonly ariaLabel: string;
  };
  readonly page: {
    readonly eyebrow: string;
    readonly title: string;
    readonly instruction: string;
    readonly progress: (completed: number) => string;
    readonly resultLine: string;
  };
  readonly controls: {
    readonly passwordLabel: string;
    readonly showPassword: (accountLabel: string) => string;
    readonly hidePassword: (accountLabel: string) => string;
    readonly show: string;
    readonly hide: string;
    readonly login: string;
    readonly skip: string;
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
  readonly narration: {
    readonly guideName: string;
    readonly intro: string;
    readonly accountSuccess: Readonly<Record<S01AccountId, string>>;
    readonly accountSkipped: Readonly<Record<S01AccountId, string>>;
    readonly warning: string;
  };
  readonly accountLoginTitles: Readonly<Record<S01AccountId, string>>;
  readonly statuses: {
    readonly retrievable: string;
    readonly notRemembered: string;
  };
  readonly animations: readonly S03AnimationSequence[];
}

export const S03_CONTENT_VERSION = '1.0.0';

const resultAnimation = (
  accountId: S01AccountId,
  detailIds: readonly string[],
): S03AnimationSequence => ({
  id: `s03-result-${accountId}`,
  steps: [
    { type: 'highlight', targetId: accountId, emphasis: 'positive', durationMs: 180 },
    ...detailIds.map((targetId) => ({
      type: 'highlight' as const,
      targetId,
      emphasis: 'positive' as const,
      durationMs: 140,
    })),
  ],
  reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
  maxDurationMs: 180 + detailIds.length * 140,
});

const animations = [
  resultAnimation('campus-id', [
    'campus-id-learnspace',
    'campus-id-exam-portal',
    'campus-id-cloud-notes',
  ]),
  resultAnimation('campus-mail', [
    'campus-mail-notifications',
    'campus-mail-confirmations',
    'campus-mail-reset-links',
    'campus-mail-impersonation',
  ]),
  resultAnimation('campus-board-archive', [
    'campus-board-old-announcements',
    'campus-board-project-questions',
    'campus-board-archived-discussions',
  ]),
  {
    id: 's03-completion-timeskip',
    steps: [
      { type: 'announce', messageId: 's03.completion.result' },
      { type: 'highlight', targetId: 'campus-id', emphasis: 'info', durationMs: 180 },
      { type: 'highlight', targetId: 'campus-mail', emphasis: 'info', durationMs: 180 },
      { type: 'highlight', targetId: 'campus-board-archive', emphasis: 'info', durationMs: 180 },
      { type: 'pause', durationMs: 10_000 },
      {
        type: 'highlight',
        targetId: 'campus-board-archive',
        emphasis: 'danger',
        durationMs: 360,
      },
      { type: 'announce', messageId: 's03.campus-board.warning' },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 10_900,
  },
] as const satisfies readonly S03AnimationSequence[];

export const s03Content: S03SegmentContent = {
  version: S03_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [8, 9, 10, 11],
  },
  segment: {
    id: 'S03',
    sectionId: 'passwords',
  },
  trainingAriaLabel: 'PassWo Training, Segment S03, Wieder anmelden',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S03, Wieder anmelden',
  },
  page: {
    eyebrow: 'Wieder anmelden',
    title: 'Melde dich erneut an',
    instruction:
      'Du hast jetzt gesehen, was an den Konten hängt. Versuche nun, dich bei allen drei Konten wieder anzumelden. Wenn du ein Passwort nicht mehr weißt, ist das in Ordnung — wähle dann „Ich weiß es nicht mehr — weiter“.',
    progress: (completed) => `Wieder anmelden: ${completed}/3 abgeschlossen`,
    resultLine:
      'Du hast dich bei allen 3 Konten angemeldet und kannst somti deine universitäre Praxis weiter fortführen.',
  },
  controls: {
    passwordLabel: 'Fiktives Passwort',
    showPassword: (accountLabel) => `Passwort für ${accountLabel} anzeigen`,
    hidePassword: (accountLabel) => `Passwort für ${accountLabel} verbergen`,
    show: 'Anzeigen',
    hide: 'Verbergen',
    login: 'Einloggen',
    skip: 'Ich weiß es nicht mehr — weiter',
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    retry: 'Erneut versuchen',
  },
  narration: {
    guideName: 'PassWo',
    intro:
      'Du hast jetzt gesehen, was an den Konten hängt. Versuche nun, dich bei allen drei Konten wieder anzumelden. Wenn du ein Passwort nicht mehr weißt, ist das in Ordnung — wähle dann „Ich weiß es nicht mehr — weiter“.',
    accountSuccess: {
      'campus-id': 'CampusID ist wieder geöffnet.',
      'campus-mail': 'CampusMail ist wieder geöffnet.',
      'campus-board-archive': 'CampusBoard Archiv ist wieder geöffnet.',
    },
    accountSkipped: {
      'campus-id':
        'Kein Problem für die Übung. Wir merken nur: Dieses Passwort war gerade nicht abrufbar.',
      'campus-mail':
        'Das ist in Ordnung. Ein Passwort muss nicht nur stark sein, sondern später auch wieder abrufbar bleiben.',
      'campus-board-archive':
        'Auch das ist eine nützliche Beobachtung für die spätere Passwortauswertung.',
    },
    warning:
      'STOP - bei campusboard bgibt es eine sicherheitsmeldung. Kannst du es dir bitte ansehen?',
  },
  accountLoginTitles: {
    'campus-id': 'Melde dich bei CampusID an.',
    'campus-mail': 'Melde dich bei CampusMail an.',
    'campus-board-archive': 'Melde dich bei CampusBoard Archiv an.',
  },
  statuses: {
    retrievable: 'abrufbar',
    notRemembered: 'nicht erinnert',
  },
  animations,
};

export function getS03Animation(animationId: string): S03AnimationSequence | undefined {
  return s03Content.animations.find(({ id }) => id === animationId);
}
