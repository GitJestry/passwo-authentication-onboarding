import type { TrainingSectionId } from '@passwo/contracts';

export const S09_PASSWORD_SUMMARY_CONTENT_VERSION = '1.0.0';

export const s09PasswordSummaryContent = {
  version: S09_PASSWORD_SUMMARY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-15 · Abschlusszusammenfassung nach dem Angriffsrücklauf',
    copyReference:
      'docs/design/S08-S09-COPY-AUDIT.md#copy--und-ablaufdelta-s08-rücklauf-und-s09-abschluss-15-august-2026',
  },
  segment: {
    id: 'S09',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'password-principles-summary',
  },
  trainingAriaLabel: 'Training, Segment S09, wichtigste Passwortprinzipien',
  eyebrow: 'Dein Passwort-Fundament',
  title: 'Das Wichtigste für deine Passwörter',
  principles: [
    {
      id: 'strong',
      label: 'Stark',
      text: 'Nutze lange Passphrasen aus mindestens sechs zufälligen, unzusammenhängenden Wörtern.',
    },
    {
      id: 'unique',
      label: 'Einzigartig',
      text: 'Verwende für jedes Konto eine eigene Passphrase.',
    },
    {
      id: 'retrievable',
      label: 'Abrufbar',
      text: 'Eine kleine Geschichte kann helfen, die zufälligen Wörter wieder abzurufen.',
    },
  ],
} as const;
