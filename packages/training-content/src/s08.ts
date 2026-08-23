import type { TrainingSectionId } from '@passwo/contracts';

export const S08_NETWORK_REPLAY_CONTENT_VERSION = '3.8.0';

export const s08NetworkReplayContent = {
  version: S08_NETWORK_REPLAY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-23 · sichtbare Texte zu eigenen Passphrasen präzisiert',
    copyReference:
      'docs/design/S08-S09-COPY-AUDIT.md#copy-delta-s08-s09-eigene-passwoerter-23-august-2026',
  },
  segment: {
    id: 'S08',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'protected-attack-replay',
  },
  trainingAriaLabel: 'Training, Segment S08, Angriff erneut ansehen',
  protectionAction: 'Eigene Passphrase verwenden',
  protectionActionDescription:
    'Das fiktive Passwort dieses betroffenen Kontos automatisch durch eine eigene Passphrase ersetzen.',
  protectionSummaries: {
    pending:
      'Auch für die noch betroffenen Konten können wir jeweils eine eigene Passphrase verwenden.',
    complete: 'Alle betroffenen Konten verwenden jetzt eigene Passphrasen.',
  },
  relationLabels: {
    campusgramReuse: 'Dasselbe wie das alte',
    campusgramSimilar: 'Leicht abgewandelt zum alten',
    reuse: 'Dasselbe',
    similar: 'Leicht abgewandelt',
  },
  replayActions: {
    attack: 'Angriff starten',
    finish: 'Zur Zusammenfassung',
  },
  replayCompletion: 'Eigene Passphrasen eingerichtet',
} as const;
