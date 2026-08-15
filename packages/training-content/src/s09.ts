import type { TrainingSectionId } from '@passwo/contracts';

export const S09_PASSWORD_SUMMARY_CONTENT_VERSION = '3.4.0';

export const s09PasswordSummaryContent = {
  version: S09_PASSWORD_SUMMARY_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-15 · Kontenskalierung von 134 auf 80',
    copyReference:
      'docs/design/S08-S09-COPY-AUDIT.md#ablauf--und-darstellungsdelta-s09-kontenskalierung-von-134-auf-80-15-august-2026',
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
  scaling: {
    studyAccountCount: 134,
    accountCount: 80,
    answer: 'Super easy!',
  },
  passWo: {
    guideName: 'PassWo',
    steps: [
      'Für drei Konten hast du bereits gesehen, was zusammenkommen muss: Jedes Passwort soll stark, einzigartig und später wieder abrufbar sein.',
      'Im Alltag bleibt es aber nicht bei drei Konten. Banking, Kommunikation, Shopping, Uni, Social Media, Weiterbildung und Arbeit summieren sich schnell. Eine aktuelle CHI-Studie (2026) schätzt, dass eine typische Person im Laufe der Zeit Accounts bei rund 134 verschiedenen Online-Diensten hatte.',
      'Wir bleiben etwas konservativer: Wie realistisch wäre es für dich, für 80 Konten jeweils ein starkes und einzigartiges Passwort zu erstellen und dauerhaft im Kopf zu behalten?',
      'Genau das ist die Schwierigkeit: So viele einzelne Passwörter dauerhaft im Kopf zu behalten, ist nicht realistisch. Deshalb ist es nachvollziehbar, sie wiederzuverwenden, leicht abzuwandeln oder selbst in Listen festzuhalten.',
      'Wir haben aber bereits gesehen, wie Wiederverwendung und ähnliche Passwörter dazu führen können, dass ein getroffenes Konto weitere Konten gefährdet. Ungeschützte Passwortlisten können wiederum leicht zugänglich sein.',
      'Die Lösung ist, dass wir uns diese vielen Passwörter gar nicht selbst merken müssen.',
      'Dafür bräuchten wir einen sicheren Tresor, der für alle 80 Konten starke, einzigartige Passwörter erzeugt, geschützt speichert und beim Anmelden wieder einfügt. Dann müssten wir uns nur noch ein einziges starkes Passwort für den Tresor merken. Und genau das gibt es schon.',
    ],
  },
  passwordManagerTransition: {
    sectionLabel: 'Sektion 2 von 3',
    title: 'Passwortmanager',
    parts: [{ id: 'password-vault', label: 'Ein Tresor für alle deine Passwörter' }],
    holdDurationMs: 3500,
  },
} as const;
