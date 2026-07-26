import type { TrainingSectionId } from '@passwo/contracts';

export const s02AccountIds = ['campus-id', 'campus-mail', 'campus-board-archive'] as const;
export type S02AccountId = (typeof s02AccountIds)[number];

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
  readonly position: { readonly x: number; readonly y: number };
  readonly detailKind: 'service' | 'function' | 'content';
  readonly edgeKind: 'dependency' | 'association' | null;
  readonly edgeLabel: string | null;
  readonly unlockAnimationId: string;
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
    readonly preview: string;
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
    readonly globalProgress: (understood: number) => string;
    readonly localProgress: (accountLabel: string, opened: number, total: number) => string;
    readonly previewTitle: string;
    readonly previewEmpty: string;
    readonly completion: string;
  };
  readonly controls: {
    readonly continue: string;
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
  readonly narration: {
    readonly guideName: string;
    readonly introId: string;
    readonly messages: Readonly<Record<string, string>>;
  };
  readonly scene: {
    readonly id: string;
    readonly summaries: {
      readonly initial: string;
      readonly complete: string;
    };
    readonly accounts: readonly S02AccountContent[];
  };
  readonly animations: readonly S02AnimationSequence[];
}

export const S02_CONTENT_VERSION = '2.0.0';

const introId = 's02.accounts.intro';

const accounts = [
  {
    id: 'campus-id',
    label: 'CampusID',
    position: { x: 0.02, y: 0.04 },
    detailKind: 'service',
    edgeKind: 'dependency',
    edgeLabel: 'Mit CampusID geöffnet',
    unlockAnimationId: 's02-unlock-campus-id',
    narrationIds: {
      open: 's02.campus-id.open',
      understood: 's02.campus-id.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'CampusID wird geöffnet …',
      open: 'Verbundene Dienste ansehen',
      understood: 'CampusID verstanden',
    },
    summaries: {
      locked: 'CampusID ist geschlossen.',
      opening: 'CampusID wird geöffnet. Die verbundenen Dienste erscheinen nacheinander.',
      progress: '{opened} von {total} Details zu CampusID geöffnet.',
      checking: '{detail} wird mit CampusID geprüft.',
      understood: 'CampusID verstanden. Alle drei verbundenen Dienste wurden geöffnet.',
    },
    details: [
      {
        id: 'campus-id-learnspace',
        label: 'LearnSpace',
        preview: 'Kurszugänge, Vorlesungsunterlagen, Abgaben',
        position: { x: 0.08, y: 0.43 },
        animationId: 's02-check-campus-id-learnspace',
        narrationId: 's02.campus-id.learnspace',
        descriptions: {
          available: 'Mit CampusID öffnen',
          checking: 'CampusID wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-id-exam-portal',
        label: 'Prüfungsportal',
        preview: 'Anmeldungen, Termine, Ergebnisübersichten',
        position: { x: 0.39, y: 0.43 },
        animationId: 's02-check-campus-id-exam-portal',
        narrationId: 's02.campus-id.exam-portal',
        descriptions: {
          available: 'Mit CampusID öffnen',
          checking: 'CampusID wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
      {
        id: 'campus-id-cloud-notes',
        label: 'Cloud Notes',
        preview: 'Notizen, Entwürfe, Arbeitsdateien, Projektmaterial',
        position: { x: 0.7, y: 0.43 },
        animationId: 's02-check-campus-id-cloud-notes',
        narrationId: 's02.campus-id.cloud-notes',
        descriptions: {
          available: 'Mit CampusID öffnen',
          checking: 'CampusID wird geprüft …',
          opened: 'Vorschau erneut öffnen',
        },
      },
    ],
  },
  {
    id: 'campus-mail',
    label: 'CampusMail',
    position: { x: 0.35, y: 0.04 },
    detailKind: 'function',
    edgeKind: 'association',
    edgeLabel: 'Mit CampusMail verbunden',
    unlockAnimationId: 's02-unlock-campus-mail',
    narrationIds: {
      open: 's02.campus-mail.open',
      understood: 's02.campus-mail.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'CampusMail wird geöffnet …',
      open: 'Funktionen ansehen',
      understood: 'CampusMail verstanden',
    },
    summaries: {
      locked: 'CampusMail ist geschlossen.',
      opening: 'CampusMail wird geöffnet. Vier Funktionen erscheinen nacheinander.',
      progress: '{opened} von {total} Details zu CampusMail geöffnet.',
      checking: '{detail} in CampusMail wird geöffnet.',
      understood: 'CampusMail verstanden. Alle vier Funktionen wurden angesehen.',
    },
    details: [
      {
        id: 'campus-mail-notifications',
        label: 'Benachrichtigungen',
        preview: 'Neue Kursnachricht, Terminänderung, Systemhinweis',
        position: { x: 0.08, y: 0.4 },
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
        preview: 'Bestätigung für Anmeldung oder Änderung',
        position: { x: 0.52, y: 0.4 },
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
        preview: 'Passwort zurücksetzen angefordert → Link liegt im Postfach',
        position: { x: 0.08, y: 0.72 },
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
        preview: 'Nachricht verfassen',
        position: { x: 0.52, y: 0.72 },
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
    label: 'CampusBoard Archiv',
    position: { x: 0.68, y: 0.04 },
    detailKind: 'content',
    edgeKind: null,
    edgeLabel: null,
    unlockAnimationId: 's02-unlock-campus-board-archive',
    narrationIds: {
      open: 's02.campus-board.open',
      understood: 's02.campus-board.understood',
    },
    descriptions: {
      locked: 'Konto öffnen',
      opening: 'CampusBoard Archiv wird geöffnet …',
      open: 'Archivierte Inhalte ansehen',
      understood: 'CampusBoard Archiv verstanden',
    },
    summaries: {
      locked: 'CampusBoard Archiv ist geschlossen.',
      opening: 'CampusBoard Archiv wird geöffnet. Drei archivierte Inhalte erscheinen.',
      progress: '{opened} von {total} Details im CampusBoard Archiv geöffnet.',
      checking: '{detail} wird geöffnet.',
      understood: 'CampusBoard Archiv verstanden. Alle drei archivierten Inhalte wurden angesehen.',
    },
    details: [
      {
        id: 'campus-board-old-announcements',
        label: 'Alte Ankündigungen',
        preview: 'Ältere Hinweise und Informationen',
        position: { x: 0.08, y: 0.43 },
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
        preview: 'Fragen, Antworten, kurze Projektabsprachen',
        position: { x: 0.39, y: 0.43 },
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
        preview: 'Diskussionsverlauf aus früheren Kursen',
        position: { x: 0.7, y: 0.43 },
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
  const steps: S02AnimationStep[] = [
    {
      type: 'move-character',
      pose: 'flight',
      from: 'bottom-left',
      to: 'focused-node',
      durationMs: 320,
    },
    { type: 'announce', messageId: account.narrationIds.open },
  ];
  account.details.forEach((detail, index) => {
    if (index > 0) steps.push({ type: 'pause', durationMs: 60 });
    steps.push({ type: 'reveal', targetId: detail.id, durationMs: 140 });
  });
  return {
    id: account.unlockAnimationId,
    steps,
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 320 + account.details.length * 140 + (account.details.length - 1) * 60,
  };
}

function detailAnimation(detail: S02AccountContent['details'][number]): S02AnimationSequence {
  return {
    id: detail.animationId,
    steps: [
      { type: 'highlight', targetId: detail.id, emphasis: 'positive', durationMs: 220 },
      { type: 'announce', messageId: detail.narrationId },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 220,
  };
}

const animations = accounts.flatMap((account) => [
  unlockAnimation(account),
  ...account.details.map(detailAnimation),
]);

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
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S02, Konten verstehen',
    address: 'campus.example/konten-verstehen',
    tab: {
      id: 'account-map',
      label: 'Konten verstehen',
      enabled: true,
    },
  },
  page: {
    eyebrow: 'Konten verstehen',
    title: 'Was hängt an deinen Konten?',
    instruction:
      'Öffne die drei Konten in beliebiger Reihenfolge und sieh dir jeweils alle Details an.',
    globalProgress: (understood) => `Konten verstehen: ${understood}/3 angesehen`,
    localProgress: (accountLabel, opened, total) =>
      `${accountLabel}: ${opened}/${total} Details angesehen`,
    previewTitle: 'Vorschau',
    previewEmpty: 'Öffne ein Konto und wähle danach ein Detail für die Vorschau aus.',
    completion: 'Alle drei Konten verstanden',
  },
  controls: {
    continue: 'Weiter',
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    retry: 'Erneut versuchen',
  },
  narration: {
    guideName: 'PassWo',
    introId,
    messages: {
      [introId]:
        'Du hast jetzt drei Passwörter, Schlüssel wie mich, die dir Türen zu Konten öffnen. Klicke auf die Konten, um zu sehen, welche Dienste oder Inhalte daran hängen.',
      's02.campus-id.open': 'Die Campusservices brauchen den Zugang über deine CampusID.',
      's02.campus-id.understood':
        'Zusammengefasst steckt hinter dem einen Passwort nicht nur die CampusID, sondern drei weitere persönliche Dienste.',
      's02.campus-id.learnspace': 'LearnSpace wurde mit CampusID geöffnet.',
      's02.campus-id.exam-portal': 'Prüfungsportal wurde mit CampusID geöffnet.',
      's02.campus-id.cloud-notes': 'Cloud Notes wurde mit CampusID geöffnet.',
      's02.campus-mail.open':
        'CampusMail verbindet Nachrichten, Bestätigungen, Zurücksetzungen und Kommunikation.',
      's02.campus-mail.understood':
        'CampusMail ist die Brücke zu persönlichen Informationen, Zurücksetzungen und Kommunikation in deinem Namen.',
      's02.campus-mail.notifications':
        'CampusMail sammelt hier Nachrichten, die im Studienalltag relevant sein können.',
      's02.campus-mail.confirmations':
        'Viele Vorgänge werden per E-Mail bestätigt. Wer Zugriff auf Mail hat, sieht solche Bestätigungen.',
      's02.campus-mail.reset-links':
        'E-Mail ist besonders wichtig, weil manche Dienste darüber Änderungen bestätigen oder Passwörter zurücksetzen.',
      's02.campus-mail.impersonation':
        'Mit Zugriff auf Mail könnte jemand in diesem Szenario auch Nachrichten in deinem Namen schreiben.',
      's02.campus-board.open':
        'Im CampusBoard Archiv liegen lokale Inhalte ohne Verbindungen zu weiteren Campusdiensten.',
      's02.campus-board.understood':
        'CampusBoard öffnet hier keine weiteren Campusdienste und enthält typische archivierte Informationen.',
      's02.campus-board.old-announcements':
        'CampusBoard enthält hier ältere Ankündigungen und Informationen.',
      's02.campus-board.project-questions':
        'Hier können informelle Projektfragen oder ältere Absprachen liegen.',
      's02.campus-board.archived-discussions':
        'CampusBoard öffnet hier keine weiteren Campusdienste und wird für typische Informationssammlung genutzt. Es ist weniger zentral als CampusID oder CampusMail.',
    },
  },
  scene: {
    id: 's02-account-exploration',
    summaries: {
      initial: 'Drei Konten sind sichtbar und können in beliebiger Reihenfolge geöffnet werden.',
      complete: 'Alle drei Konten wurden mit ihren Details angesehen und verstanden.',
    },
    accounts,
  },
  animations,
};

export function getS02Animation(animationId: string): S02AnimationSequence | undefined {
  return s02Content.animations.find(({ id }) => id === animationId);
}
