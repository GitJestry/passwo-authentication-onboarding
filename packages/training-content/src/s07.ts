import type { TrainingSectionId } from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '2.0.0';

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision:
      'Userauftrag vom 2026-08-13 · S07 als eingeloggte Browseransicht mit Passphrasen-Suche',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy--und-ablaufdelta-s07-passphrasen-suche-13-august-2026',
  },
  segment: {
    id: 'S07',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'passphrase-search',
  },
  trainingAriaLabel: 'PassWo Training, Segment S07, Passphrase erstellen',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Passphrase erstellen',
    searchTab: {
      id: 'passphrase-search',
      label: 'Passphrase generieren',
      address: 'suche.example/?q=Passphrase+generieren',
    },
    emptySearchPageAriaLabel: 'Leere Suchseite für Passphrase generieren',
  },
} as const;
