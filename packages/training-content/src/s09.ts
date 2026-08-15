import type { TrainingSectionId } from '@passwo/contracts';

export const S09_PASSWORD_SUMMARY_CONTENT_VERSION = '2.3.0';

export const s09PasswordSummaryContent = {
  version: S09_PASSWORD_SUMMARY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-15 · textbasierte Hervorhebungen ohne Kategoriesymbole',
    copyReference:
      'docs/design/S08-S09-COPY-AUDIT.md#darstellungsdelta-s09-ohne-kategoriesymbole-15-august-2026',
  },
  segment: {
    id: 'S09',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'password-principles-summary',
  },
  trainingAriaLabel: 'Training, Segment S09, wichtigste Passwortprinzipien',
  title: 'Starke Passwörter auf einen Blick',
  principles: [
    {
      id: 'minimum-length',
      parts: [
        { text: 'Mindestens 15 Zeichen', emphasis: 'info' },
        { text: ' verwenden.', emphasis: 'none' },
      ],
    },
    {
      id: 'length-over-mix',
      parts: [
        { text: 'Kein bestimmter Zeichenmix nötig:', emphasis: 'strong' },
        { text: ' Länge ist wichtiger.', emphasis: 'none' },
      ],
    },
    {
      id: 'avoid-personal-context',
      parts: [
        {
          text: 'Persönliche Angaben',
          emphasis: 'strong',
        },
        { text: ' sowie ', emphasis: 'strong' },
        {
          text: 'Konto- oder Dienstbezüge',
          emphasis: 'strong',
        },
        { text: ' vermeiden', emphasis: 'info' },
        { text: '.', emphasis: 'strong' },
      ],
    },
    {
      id: 'unrelated-components',
      parts: [
        { text: 'Bestandteile ', emphasis: 'strong' },
        { text: 'ohne Zusammenhang', emphasis: 'info' },
        { text: ' wählen.', emphasis: 'strong' },
      ],
    },
    {
      id: 'unique-per-account',
      parts: [
        { text: 'Für jedes Konto ein ', emphasis: 'strong' },
        { text: 'eigenes', emphasis: 'positive-strong' },
        { text: ' Passwort verwenden.', emphasis: 'strong' },
      ],
    },
    {
      id: 'six-word-passphrase',
      parts: [
        { text: 'Einfache Methode:', emphasis: 'strong' },
        {
          text: ' mindestens sechs zufällig gewählte Wörter als ',
          emphasis: 'none',
        },
        { text: 'Passphrase', emphasis: 'info' },
        { text: '.', emphasis: 'none' },
      ],
    },
  ],
  finishAction: 'Abschließen',
} as const;
