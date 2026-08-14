import type { TrainingSectionId } from '@passwo/contracts';

export const S08_NETWORK_REPLAY_CONTENT_VERSION = '1.1.0';

export const s08NetworkReplayContent = {
  version: S08_NETWORK_REPLAY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-14 · einzigartige Passphrasen vor dem Angriffsrücklauf',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy--und-ablaufdelta-s07-passphrasenwechsel-und-s08-ubergang-14-august-2026',
  },
  segment: {
    id: 'S08',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'protected-attack-replay',
  },
  trainingAriaLabel: 'PassWo Training, Segment S08, Angriff erneut ansehen',
  taskLabels: {
    protection: 'Passphrasen schützen',
    replay: 'Angriff erneut ansehen',
  },
  protectionAction: 'Einzigartige Passphrase erstellen',
  protectionActionDescription:
    'Einzigartige Passphrase für dieses betroffene Konto erstellen.',
  protectionSummaries: {
    pending:
      'Noch betroffene Konten können mit jeweils einer eigenen Passphrase geschützt werden.',
    complete: 'Alle betroffenen Konten sind mit eigenen Passphrasen geschützt.',
  },
  allProtected:
    'Damit sind die betroffenen Konten mit eigenen Passphrasen geschützt. Jetzt spielen wir den Angriff ein letztes Mal durch und schauen, was sich verändert hat.',
  replayLabels: {
    attack: 'Das alte Campusgram-Passwort wird erneut ausprobiert.',
    whatIf: 'Was wäre, wenn? Auch die anderen Konten bleiben geschützt.',
  },
  result:
    'Diesmal endet der Angriff bei dem alten geleakten Passwort. Es funktioniert nicht mehr bei Campusgram und kann auch nicht über Wiederverwendung auf deine anderen Konten übertragen werden.',
} as const;
