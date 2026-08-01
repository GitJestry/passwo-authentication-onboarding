import type { TrainingSectionId } from '@passwo/contracts';
import type { S01AccountId } from './s01.js';

export type S03RetrievalResult = 'pending' | 'retrievable' | 'not-remembered' | 'assisted';

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
    readonly revision: string;
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
    readonly title: string;
    readonly progress: (completed: number) => string;
    readonly resultLine: string;
  };
  readonly controls: {
    readonly accountDataLabel: string;
    readonly passwordLabel: string;
    readonly incorrectPassword: string;
    readonly showPassword: (accountLabel: string) => string;
    readonly hidePassword: (accountLabel: string) => string;
    readonly openLogin: (accountLabel: string) => string;
    readonly login: string;
    readonly forgotPassword: string;
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
    readonly assistedLogin: string;
  };
  readonly narration: {
    readonly guideName: string;
    readonly intro: string;
    readonly accountSuccess: Readonly<Record<S01AccountId, string>>;
    readonly accountAssisted: Readonly<Record<S01AccountId, string>>;
    readonly thirdFailedLogin: string;
    readonly retrievalHelp: string;
    readonly completionByRememberedCount: Readonly<Record<0 | 1 | 2 | 3, string>>;
    readonly campusStart: string;
    readonly warning: string;
  };
  readonly accountLoginTitles: Readonly<Record<S01AccountId, string>>;
  readonly accountPages: Readonly<
    Record<
      S01AccountId,
      {
        readonly areaLabel: string;
        readonly signedInLabel: string;
        readonly modules: readonly {
          readonly label: string;
          readonly value: string;
        }[];
      }
    >
  >;
  readonly statuses: {
    readonly pending: string;
    readonly retrievable: string;
    readonly notRemembered: string;
    readonly assisted: string;
    readonly cancelledLogin: string;
  };
  readonly animations: readonly S03AnimationSequence[];
}

export const S03_CONTENT_VERSION = '1.13.0';

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
  resultAnimation('master-campus', [
    'master-campus-workspace',
    'master-campus-services',
    'master-campus-campus-cloud',
  ]),
  resultAnimation('campus-email', [
    'campus-email-notifications',
    'campus-email-confirmations',
    'campus-email-reset-links',
    'campus-email-impersonation',
  ]),
  resultAnimation('campusgram', [
    'campusgram-direct-messages',
    'campusgram-groups-contacts',
    'campusgram-posts-reactions',
  ]),
  {
    id: 's03-completion-timeskip',
    steps: [
      { type: 'announce', messageId: 's03.completion.timeskip' },
      { type: 'pause', durationMs: 5_000 },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 5_000,
  },
] as const satisfies readonly S03AnimationSequence[];

export const s03Content: S03SegmentContent = {
  version: S03_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [8, 9, 10, 11],
    revision: 'Userauftrag vom 2026-08-01 und UX-Konzeptboards vom 2026-07-31',
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
    title: 'Wieder anmelden',
    progress: (completed) => `Wieder anmelden: ${completed}/3 abgeschlossen`,
    resultLine: 'Alle drei Konten sind wieder geöffnet. Gleich geht es weiter.',
  },
  controls: {
    accountDataLabel: 'Benutzername',
    passwordLabel: 'Passwort',
    incorrectPassword: 'Das Passwort ist nicht korrekt.',
    showPassword: (accountLabel) => `Passwort für ${accountLabel} anzeigen`,
    hidePassword: (accountLabel) => `Passwort für ${accountLabel} verbergen`,
    openLogin: (accountLabel) => `Anmelden mit ${accountLabel}`,
    login: 'Anmelden',
    forgotPassword: 'Passwort vergessen?',
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    retry: 'Erneut versuchen',
    assistedLogin: 'Für mich anmelden',
  },
  narration: {
    guideName: 'PassWo',
    intro: 'Melde dich jetzt mit den eben gewählten Passwörtern erneut an.',
    accountSuccess: {
      'master-campus': 'Master Campus ist wieder geöffnet.',
      'campus-email': 'Campus E-Mail ist wieder geöffnet.',
      'campusgram': 'Campusgram ist wieder geöffnet.',
    },
    accountAssisted: {
      'master-campus': 'Master Campus ist mit Unterstützung wieder geöffnet.',
      'campus-email': 'Campus E-Mail ist mit Unterstützung wieder geöffnet.',
      'campusgram': 'Campusgram ist mit Unterstützung wieder geöffnet.',
    },
    thirdFailedLogin:
      'Wenn du dich nicht an das richtige Passwort erinnern kannst, klicke als Lösung auf „Passwort vergessen?“.',
    retrievalHelp:
      'Keine Panik – dein fiktives Konto ist nicht verloren. Das zeigt aber: Ein Passwort muss nicht nur stark sein, sondern später auch wieder abrufbar bleiben.\n\nDass du dich nicht erinnern konntest, ist eine hilfreiche Beobachtung. Ich melde dich jetzt mit dem richtigen Passwort wieder an, damit wir unseren Campusalltag fortsetzen können.',
    completionByRememberedCount: {
      0: 'Du konntest diesmal keines der drei Passwörter selbst abrufen. Das ist eine hilfreiche Beobachtung.\n\nAlle drei fiktiven Konten sind wieder geöffnet. Nimm mit: Ein Passwort muss stark und im Alltag abrufbar sein.',
      1: 'Du konntest dich bei einem von drei Konten selbst wieder anmelden. Bei zwei Konten war Unterstützung nötig.\n\nAlle drei fiktiven Konten sind wieder geöffnet. Der Unterschied zeigt: Stärke allein reicht nicht, wenn ein Passwort im Alltag nicht abrufbar bleibt.',
      2: 'Du konntest dich bei zwei von drei Konten selbst wieder anmelden. Bei einem Konto war Unterstützung nötig.\n\nAlle drei fiktiven Konten sind wieder geöffnet. Auch ein einzelnes schwer abrufbares Passwort kann den Alltag unterbrechen.',
      3: 'Du konntest dich bei allen drei Konten selbst wieder anmelden. Deine drei Passwörter waren diesmal abrufbar.\n\nAlle drei fiktiven Konten sind wieder geöffnet. Behalte trotzdem im Blick: Abrufbarkeit ist nur eine von mehreren Anforderungen an ein Passwort.',
    },
    campusStart: 'Wir können jetzt in Ruhe unseren Campusstart fortsetzen.',
    warning:
      'Warte, bei Campusgram gibt es eine Warnung. Kannst du sie dir bitte über den hervorgehobenen Campusgram-Tab ansehen?',
  },
  accountLoginTitles: {
    'master-campus': 'Melde dich bei Master Campus an.',
    'campus-email': 'Melde dich bei Campus E-Mail an.',
    'campusgram': 'Melde dich bei Campusgram an.',
  },
  accountPages: {
    'master-campus': {
      areaLabel: 'Campuszugang',
      signedInLabel: 'Angemeldet',
      modules: [
        { label: 'Profil', value: 'Campuszugang aktiv' },
        { label: 'Dienste', value: 'Campus Workspace · Campus Services · Campus Cloud' },
      ],
    },
    'campus-email': {
      areaLabel: 'Posteingang',
      signedInLabel: 'Angemeldet',
      modules: [
        { label: 'Postfach', value: 'Campus E-Mail ist geöffnet' },
        { label: 'Heute', value: 'Bestätigungen · Benachrichtigungen' },
      ],
    },
    'campusgram': {
      areaLabel: 'Community und Austausch',
      signedInLabel: 'Angemeldet',
      modules: [
        { label: 'Bereiche', value: 'Direktnachrichten · Gruppen und Kontakte' },
        { label: 'Aktivitäten', value: 'Beiträge und Reaktionen' },
      ],
    },
  },
  statuses: {
    pending: 'Bereit',
    retrievable: 'abrufbar',
    notRemembered: 'nicht erinnert',
    assisted: 'mit Unterstützung geöffnet',
    cancelledLogin: 'Anmeldung abgebrochen',
  },
  animations,
};

export function getS03Animation(animationId: string): S03AnimationSequence | undefined {
  return s03Content.animations.find(({ id }) => id === animationId);
}
