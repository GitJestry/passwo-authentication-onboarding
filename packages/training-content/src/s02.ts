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
  readonly symbolId: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly detailKind: 'service' | 'function' | 'content';
  readonly edgeKind: 'dependency' | 'association' | null;
  readonly edgeLabel: string | null;
  readonly unlockAnimationId: string;
  readonly detailRevealAnimationId: string;
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

export const S02_CONTENT_VERSION = '3.0.0';

const introId = 's02.accounts.intro';

const accounts = [
  {
    id: 'campus-id',
    label: 'CampusID',
    symbolId: 'campus-id',
    position: { x: 0.12, y: 0.13 },
    detailKind: 'service',
    edgeKind: 'dependency',
    edgeLabel: 'Mit CampusID geöffnet',
    unlockAnimationId: 's02-unlock-campus-id',
    detailRevealAnimationId: 's02-reveal-campus-id-details',
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
        symbolId: 'learnspace',
        preview: 'Kurszugänge, Vorlesungsunterlagen, Abgaben',
        position: { x: 0.03, y: 0.43 },
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
        symbolId: 'exam-portal',
        preview: 'Anmeldungen, Termine, Ergebnisübersichten',
        position: { x: 0.22, y: 0.64 },
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
        symbolId: 'cloud-notes',
        preview: 'Notizen, Entwürfe, Arbeitsdateien, Projektmaterial',
        position: { x: 0.04, y: 0.8 },
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
    symbolId: 'campus-mail',
    position: { x: 0.7, y: 0.1 },
    detailKind: 'function',
    edgeKind: 'association',
    edgeLabel: 'Mit CampusMail verbunden',
    unlockAnimationId: 's02-unlock-campus-mail',
    detailRevealAnimationId: 's02-reveal-campus-mail-details',
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
        symbolId: 'notifications',
        preview: 'Neue Kursnachricht, Terminänderung, Systemhinweis',
        position: { x: 0.85, y: 0.38 },
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
        preview: 'Bestätigung für Anmeldung oder Änderung',
        position: { x: 0.65, y: 0.45 },
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
        preview: 'Passwort zurücksetzen angefordert → Link liegt im Postfach',
        position: { x: 0.82, y: 0.7 },
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
        preview: 'Nachricht verfassen',
        position: { x: 0.62, y: 0.77 },
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
    symbolId: 'campus-board-archive',
    position: { x: 0.42, y: 0.43 },
    detailKind: 'content',
    edgeKind: null,
    edgeLabel: null,
    unlockAnimationId: 's02-unlock-campus-board-archive',
    detailRevealAnimationId: 's02-reveal-campus-board-archive-details',
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
        symbolId: 'announcements',
        preview: 'Ältere Hinweise und Informationen',
        position: { x: 0.25, y: 0.78 },
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
        symbolId: 'project-questions',
        preview: 'Fragen, Antworten, kurze Projektabsprachen',
        position: { x: 0.45, y: 0.8 },
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
        symbolId: 'archived-discussions',
        preview: 'Diskussionsverlauf aus früheren Kursen',
        position: { x: 0.57, y: 0.62 },
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
  return {
    id: account.unlockAnimationId,
    steps: [
      {
        type: 'move-character',
        pose: 'flight',
        from: 'bottom-left',
        to: 'focused-node',
        durationMs: 320,
      },
      { type: 'highlight', targetId: account.id, emphasis: 'positive', durationMs: 180 },
      { type: 'announce', messageId: account.narrationIds.open },
    ],
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: 500,
  };
}

function revealDetailsAnimation(account: S02AccountContent): S02AnimationSequence {
  const steps: S02AnimationStep[] = [];
  account.details.forEach((detail, index) => {
    if (index > 0) steps.push({ type: 'pause', durationMs: 60 });
    steps.push({ type: 'reveal', targetId: detail.id, durationMs: 140 });
  });
  return {
    id: account.detailRevealAnimationId,
    steps,
    reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
    maxDurationMs: account.details.length * 140 + (account.details.length - 1) * 60,
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
  revealDetailsAnimation(account),
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
  narration: {
    guideName: 'PassWo',
    introId,
    messages: {
      [introId]:
        'Du hast jetzt drei Passwörter, Schlüssel wie mich, die dir Türen zu Konten öffnen. Klicke auf die Konten, um zu sehen, welche Dienste oder Inhalte daran hängen.',
      's02.campus-id.open': 'Die Campusservices brauchen den Zugang über deine CampusID.',
      's02.campus-id.understood':
        'Zusammengefasst steckt hinter dem einen Passwort nicht nur die CampusID, sondern drei weitere persönliche Dienste.',
      's02.campus-id.learnspace': 'Die Campusservices brauchen den Zugang über deine CampusID.',
      's02.campus-id.exam-portal': 'Die Campusservices brauchen den Zugang über deine CampusID.',
      's02.campus-id.cloud-notes': 'Die Campusservices brauchen den Zugang über deine CampusID.',
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
