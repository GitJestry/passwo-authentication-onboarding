import type { TrainingSectionId } from '@passwo/contracts';

export const S09_PASSWORD_SUMMARY_CONTENT_VERSION = '4.2.0';

export const s09PasswordSummaryContent = {
  version: S09_PASSWORD_SUMMARY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-23 · S09 Passphrasenmethode umbenannt',
    copyReference:
      'docs/design/S08-S09-COPY-AUDIT.md#copy-delta-s09-passphrasenmethode-umbenannt-23-august-2026',
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
    answer: 'Super easy!',
  },
  passWo: {
    guideName: 'PassWo',
    steps: [
      'Hier im kleinen Szenario waren es nur drei Konten.',
      'Im Alltag sind es aber deutlich mehr: Eine aktuelle CHI-Studie (2026) kommt auf rund 134 Online-Dienste pro Person.',
      'Bleiben wir unter dem Wert: Wie realistisch wäre es für dich, dir selbst „nur“ 80 starke und einzigartige Passwörter dauerhaft zu merken?',
      'So viele einzelne Passwörter dauerhaft im Kopf zu behalten, ist nicht realistisch. Deshalb ist es auch nachvollziehbar, dass Menschen dasselbe Passwort für mehrere Konten verwenden, es leicht abwandeln oder Passwörter in eigenen Listen festhalten.',
      'Welche Risiken dabei entstehen können, hast du gerade gesehen. Auch ungeschützte Passwortlisten können selbst zum Risiko werden.',
      'Die gute Nachricht: Du musst dir all diese Passwörter auch gar nicht selbst merken.',
    ],
  },
  passwordManagerAction: {
    title: 'Passwortmanager',
    detail: 'kennenlernen',
    ariaLabel: 'Passwortmanager kennenlernen',
  },
  passwordManagerTransition: {
    sectionLabel: 'Sektion 2 von 3',
    title: 'Passwortmanager',
    parts: [{ id: 'password-vault', label: 'Ein Tresor für alle deine Passwörter' }],
    holdDurationMs: 3500,
  },
} as const;
