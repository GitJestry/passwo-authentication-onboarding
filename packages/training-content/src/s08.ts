import type { TrainingSectionId } from '@passwo/contracts';

export const S08_NETWORK_REPLAY_CONTENT_VERSION = '3.5.0';

export const s08NetworkReplayContent = {
  version: S08_NETWORK_REPLAY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-17 · S08-Risikoverbindungen auflösen',
    copyReference:
      'docs/design/S08-S09-COPY-AUDIT.md#copy--und-darstellungsdelta-s08-risikoverbindungen-auflösen-17-august-2026',
  },
  segment: {
    id: 'S08',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'protected-attack-replay',
  },
  trainingAriaLabel: 'Training, Segment S08, Angriff erneut ansehen',
  protectionAction: 'Einzigartige Passphrase verwenden',
  protectionActionDescription:
    'Das fiktive Passwort dieses betroffenen Kontos automatisch durch eine einzigartige Passphrase ersetzen.',
  protectionSummaries: {
    pending:
      'Noch betroffene Konten können mit jeweils einer eigenen Passphrase geschützt werden.',
    complete: 'Alle betroffenen Konten sind mit eigenen Passphrasen geschützt.',
  },
  relationLabels: {
    campusgramReuse: 'altes wiederverwendet',
    campusgramSimilar: 'ähnlich zum alten',
    reuse: 'wiederverwendet',
    similar: 'ähnlich',
  },
  replayActions: {
    attack: 'Angriff starten',
    finish: 'Weiter',
  },
  replayCompletion: 'Konten wieder geschützt',
} as const;
