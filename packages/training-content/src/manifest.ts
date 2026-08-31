import type { TrainingSegmentDefinition } from '@passwo/contracts';

export { SUPPORTIVE_ARTIFACT_VERSION } from '@passwo/contracts';

export const trainingSegments = [
  {
    id: 'S00',
    title: 'Entry and safety boundary',
    section: 'passwords',
    foci: ['TF1', 'TF2', 'TF6'],
    learningObjective: 'Fiktive Übungsgrenze, unterstützende Rolle und Aufgabe verstehen.',
  },
  {
    id: 'S01',
    title: 'Ordinary account setup',
    section: 'passwords',
    foci: ['TF2', 'TF3'],
    learningObjective: 'Drei selbst erzeugte fiktive Passwortentscheidungen treffen.',
  },
  {
    id: 'S02',
    title: 'Konten kennenlernen',
    section: 'passwords',
    foci: ['TF2', 'TF3', 'TF4'],
    learningObjective: 'Verbundene Dienste, Kontovorgänge und Kommunikationsbereiche erkunden.',
  },
  {
    id: 'S03',
    title: 'Wieder anmelden',
    section: 'passwords',
    foci: ['TF1', 'TF3', 'TF6'],
    learningObjective: 'Praktische Abrufbarkeit ohne beschämendes Feedback prüfen.',
  },
  {
    id: 'S04',
    title: 'Datenleck bei Campusgram',
    section: 'passwords',
    foci: ['TF4'],
    learningObjective: 'Das Datenleck als Ausgangspunkt für die Angreiferperspektive einordnen.',
  },
  {
    id: 'S05',
    title: 'Einzelstärke des Passworts',
    section: 'passwords',
    foci: ['TF3', 'TF4', 'TF6'],
    learningObjective: 'Bestandteile, Aufbau und freies Ausprobieren gemeinsam einordnen.',
  },
  {
    id: 'S06',
    title: 'Einzigartigkeit und Ausbreitung',
    section: 'passwords',
    foci: ['TF3', 'TF4'],
    learningObjective:
      'Exakte Wiederverwendung, konkret abgeleitete Varianten und nicht erkannte Wege unterscheiden.',
  },
  {
    id: 'S07',
    title: 'Auswertung',
    section: 'passwords',
    foci: ['TF1', 'TF4', 'TF6'],
    learningObjective: 'Pro Konto einen priorisierten nächsten Schritt ableiten.',
  },
  {
    id: 'S08',
    title: 'Passwörter überarbeiten',
    section: 'passwords',
    foci: ['TF3', 'TF5', 'TF6'],
    learningObjective: 'Sechs unabhängig zufällig erzeugte Wörter anwenden.',
  },
  {
    id: 'S09',
    title: 'Von drei zu vielen Konten',
    section: 'passwords',
    foci: ['TF4', 'TF5'],
    learningObjective:
      'Stärke, Einzigartigkeit und Abrufbarkeit zusammenführen und das Erinnerungsproblem vieler Konten erkennen.',
  },
  {
    id: 'S10',
    title: 'Zusammenfassung Passwort',
    section: 'passwords',
    foci: ['TF6'],
    learningObjective: 'Stärke, Einzigartigkeit und Abrufbarkeit trennen.',
  },
  {
    id: 'S11',
    title: 'Von drei zu vielen Konten',
    section: 'passwords',
    foci: ['TF1', 'TF2', 'TF4', 'TF6'],
    learningObjective: 'Skalierungsproblem menschlicher Erinnerung erkennen.',
  },
  {
    id: 'S12',
    title: 'Passwortmanager',
    section: 'password-manager',
    foci: ['TF2', 'TF3', 'TF4', 'TF6'],
    learningObjective: 'Erzeugen, Speichern, Ausfüllen und Recovery einordnen.',
  },
  {
    id: 'S13',
    title: 'Ein neues und ein bestehendes Konto',
    section: 'password-manager',
    foci: ['TF2', 'TF3'],
    learningObjective:
      'Neue Zugangsdaten mit einem Passwortmanager anwenden und die Dienstgrenze bei importierten Zugangsdaten erkennen.',
  },
  {
    id: 'S14',
    title: 'Mehrere Faktoren',
    section: 'mfa',
    foci: ['TF2', 'TF3', 'TF6'],
    learningObjective: 'Wissen, Besitz und Inhärenz unterscheiden und MFA aktivieren.',
  },
  {
    id: 'S15',
    title: 'Wirkung des zweiten Faktors',
    section: 'mfa',
    foci: ['TF6'],
    learningObjective:
      'Verstehen, warum das Passwort allein nach der 2FA-Aktivierung nicht reicht.',
  },
  {
    id: 'S16',
    title: 'Priorisierung und Ausweitung',
    section: 'mfa',
    foci: ['TF1', 'TF6'],
    learningObjective: 'Mit weitreichenden Konten beginnen und MFA ausweiten.',
  },
  {
    id: 'S17',
    title: 'Integrierte Zusammenfassung',
    section: 'mfa',
    foci: ['TF4', 'TF6'],
    learningObjective:
      'Eigene starke Passwörter und 2FA bei wichtigen Konten zusammenführen.',
  },
] as const satisfies readonly TrainingSegmentDefinition[];
