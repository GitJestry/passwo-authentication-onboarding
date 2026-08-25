import type { TrainingSectionId } from '@passwo/contracts';

export const S09_PASSWORD_SUMMARY_CONTENT_VERSION = '4.7.0';

export const s09PasswordSummaryContent = {
  version: S09_PASSWORD_SUMMARY_CONTENT_VERSION,
  source: {
    revision:
      'Userauftrag vom 2026-08-25 · direkter Netzwerkübergang in den Passwortmanager',
    copyReference:
      'docs/design/S12-COPY-AUDIT.md#copy-und-ablaufdelta-s12-passwortmanager-25-august-2026',
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
        { text: 'Merkbare Methode:', emphasis: 'strong' },
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
  scaling: {
    studyAccountCount: 134,
    accountCount: 80,
    riskFindingShare: 0.6,
    answer: 'Weiter',
  },
  passWo: {
    guideName: 'PassWo',
    steps: [
      'Für die drei Konten sind die offenen Probleme aufgelöst: Die Passwörter sind stark und keines ist mehr mit einem anderen verbunden.',
      'Im Alltag sind es aber deutlich mehr. Eine CHI-Studie von 2026 schätzt, dass eine typische Person im Laufe der Zeit Accounts bei rund 134 Online-Diensten hatte.',
      'Bleiben wir darunter: Wie realistisch wäre es für dich, für 80 Konten jeweils ein starkes, eigenes Passwort dauerhaft im Kopf zu behalten?',
      'Bei so vielen Konten wird die eigene Passwortverwaltung schnell unüberschaubar.',
      'Deshalb ist es nachvollziehbar, dass Passwörter wiederverwendet, leicht abgewandelt oder selbst notiert werden.',
      'Die Risiken davon hast du gerade gesehen. Auch ungeschützte Passwortlisten können selbst zum Risiko werden.',
      'Die gute Nachricht: Du musst dir all diese Passwörter auch gar nicht selbst merken.',
    ],
  },
  passwordManagerAction: {
    title: 'Passwortmanager',
    detail: 'kennenlernen',
    ariaLabel: 'Passwortmanager kennenlernen',
  },
} as const;
