import type {
  S06AccountId,
  S07IncidentStatus,
  S07ProblemClass,
  S07RecommendationId,
  S07Retrievability,
  TrainingSectionId,
} from '@passwo/contracts';

export const S07_EVALUATION_CONTENT_VERSION = '1.2.0';

export const s07EvaluationContent = {
  version: S07_EVALUATION_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [44, 45, 46, 47, 48, 49, 50] as const,
    revision:
      'Userauftrag vom 2026-08-11 · Vollpasswort-Treffer statt numerischer Guess-Schwelle',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-s07-vollpasswort-treffer-statt-guess-schwelle-11-august-2026',
  },
  segment: {
    id: 'S07',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'account-evaluation',
  },
  trainingAriaLabel: 'PassWo, Segment S07, Auswertung',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Auswertung',
    address: 'campus.example/auswertung',
    tab: { id: 'evaluation', label: 'Auswertung', enabled: true },
  },
  page: {
    eyebrow: 'PassWo · S07',
    title: 'Was zeigen deine drei Passwörter?',
    instruction:
      'Die Auswertung fasst ausschließlich bereits gezeigte lokale Befunde zusammen.',
    nextAccount: 'Nächste Kontokarte',
    showSummary: 'Gesamtauswertung ansehen',
    continue: 'Weiter zur Überarbeitung',
    overviewAriaLabel: 'Kompakte Übersicht',
    overviewLabels: {
      noWholePasswordRecognition: 'Kein vollständiger früher Kandidat erkannt',
      noPasswordConnection: 'Ohne exakte oder abgeleitete Passwortverbindung',
      remembered: 'Im Login erinnert',
    },
  },
  accounts: {
    'master-campus': {
      label: 'Master Campus',
      role: 'Öffnet Campus Workspace, Campus Services und Campus Cloud.',
    },
    'campus-email': {
      label: 'Campus E-Mail',
      role:
        'Enthält Benachrichtigungen, Bestätigungen, Zurücksetzungslinks und ermöglicht Kommunikation in deinem Namen.',
    },
    campusgram: {
      label: 'Campusgram',
      role:
        'Enthält Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen und war Ausgangspunkt des dargestellten Vorfalls.',
    },
  } as const satisfies Readonly<Record<S06AccountId, unknown>>,
  dispositionLabels: {
    'whole-password-recognized-value':
      'Ein einzelner früher Kandidat deckte das vollständige Passwort ab.',
    'whole-password-recognized-bounded-variant':
      'Ein früher Kandidat mit begrenzter typischer Veränderung deckte das vollständige Passwort ab.',
    none:
      'Die begrenzte Prüfung erkannte keinen vollständigen frühen Kandidaten.',
  },
  relationLabels: {
    'exact-match': 'exakt wiederverwendet',
    'derived-variant-match': 'konkreter abgeleiteter Kandidatenweg erkannt',
    'no-derived-path-recognized': 'kein direkter Ableitungsweg erkannt',
  },
  incidentLabels: {
    'source-of-incident': 'Ausgangspunkt des dargestellten Vorfalls',
    'reached-via-exact-reuse': 'durch exakte Wiederverwendung erreicht',
    'reached-via-derived-variant': 'durch einen vollständigen abgeleiteten Kandidatentreffer erreicht',
    'not-reached': 'nicht erreicht',
    'hypothetical-only': 'nur in einem hypothetischen Weg betrachtet',
  } as const satisfies Readonly<Record<S07IncidentStatus, string>>,
  retrievalLabels: {
    remembered: 'im Login erinnert',
    'not-remembered': 'im Login nicht erinnert',
    skipped: 'übersprungen',
  } as const satisfies Readonly<Record<S07Retrievability, string>>,
  notRememberedFeedback:
    'Das ist kein persönliches Versagen. Es zeigt nur, dass die bisherige Strategie in dieser Übung gerade nicht gut abrufbar war.',
  recommendationLabels: {
    'replace-exposed-password':
      'Ersetze dieses offengelegte oder in der Simulation erreichte Passwort durch ein vollständig neues, einzigartiges Passwort.',
    'separate-exact-reuse': 'Trenne dieses Konto vollständig vom exakt wiederverwendeten Passwort.',
    'rebuild-predictable-password':
      'Baue dieses Passwort auf einer neuen Grundlage auf, statt nur einzelne Zeichen zu verändern.',
    'rebuild-below-length-orientation':
      'Baue dieses selbst erstellte Passwort mit mindestens 15 Zeichen neu auf.',
    'replace-derived-pattern':
      'Ersetze die gemeinsame Grundlage; ändere nicht nur Zahl, Jahr oder Dienstname.',
    'improve-retrievability': 'Verwende eine praktikablere Merkmethode für dieses Konto.',
    'no-change-practice-method':
      'Wende die neue Methode nur an einem zusätzlichen Übungsbeispiel an.',
  } as const satisfies Readonly<Record<S07RecommendationId, string>>,
  problemStatements: {
    'local-whole-password-recognized':
      'Mindestens ein vollständiges Passwort wurde in der begrenzten Prüfung als früher Kandidat erkannt.',
    'below-length-orientation':
      'Mindestens ein selbst erstelltes Passwort lag unter der 15-Zeichen-Orientierung.',
    'exact-reuse': 'Zwischen mindestens zwei Konten besteht eine exakte Passwortwiederverwendung.',
    'derived-variant':
      'Zwischen mindestens zwei Passwörtern wurde ein konkreter abgeleiteter Kandidatenweg erkannt.',
    retrievability: 'Mindestens ein Passwort war im Login nicht direkt abrufbar.',
  } as const satisfies Readonly<Record<S07ProblemClass, string>>,
  noProblemStatement:
    'In dieser begrenzten Übung wurde kein Änderungsbedarf erkannt. Die neue Methode wird im nächsten Schritt an einem zusätzlichen Beispiel geübt.',
} as const;
