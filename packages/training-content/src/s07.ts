import type {
  S06AccountId,
  S06LocalAccountAnalysis,
  S07IncidentStatus,
  S07ProblemClass,
  S07RecommendationId,
  S07Retrievability,
  TrainingSectionId,
} from '@passwo/contracts';

type S07FixtureAccountInputs = Readonly<
  Record<
    S06AccountId,
    {
      readonly fictionalPassword: string;
      readonly retrievalStatus: S06LocalAccountAnalysis['retrievalStatus'];
    }
  >
>;

export type S07EvaluationFixtureId =
  | 'directly-reached'
  | 'exact-reuse'
  | 'derived-variant'
  | 'retrievability-only'
  | 'no-change';

export interface S07EvaluationFixture {
  readonly id: S07EvaluationFixtureId;
  readonly routeId:
    | 's07-directly-reached'
    | 's07-exact-reuse'
    | 's07-derived-variant'
    | 's07-retrievability-only'
    | 's07-no-change';
  readonly accounts: S07FixtureAccountInputs;
}

export const S07_EVALUATION_CONTENT_VERSION = '1.0.0';

export const s07EvaluationContent = {
  version: S07_EVALUATION_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [44, 45, 46, 47, 48, 49, 50] as const,
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
    'very-short-string': 'Ein naheliegender Prüfweg wurde erkannt.',
    'common-password-core-with-typical-change': 'Ein naheliegender Prüfweg wurde erkannt.',
    'account-context-with-predictable-qualifier': 'Ein vorhersehbarer Aufbau wurde erkannt.',
    'clearly-repeated-explainable-structure': 'Ein vorhersehbarer Aufbau wurde erkannt.',
    none: 'Mit den begrenzten Wegen dieser Simulation wurde kein schnellerer Weg erkannt.',
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
    'replace-derived-pattern':
      'Ersetze die gemeinsame Grundlage; ändere nicht nur Zahl, Jahr oder Dienstname.',
    'improve-retrievability': 'Verwende eine praktikablere Merkmethode für dieses Konto.',
    'no-change-practice-method':
      'Wende die neue Methode nur an einem zusätzlichen Übungsbeispiel an.',
  } as const satisfies Readonly<Record<S07RecommendationId, string>>,
  problemStatements: {
    'local-quick-path':
      'Mindestens ein Passwort bot in der begrenzten Simulation einen schnelleren lokalen Weg.',
    'exact-reuse': 'Zwischen mindestens zwei Konten besteht eine exakte Passwortwiederverwendung.',
    'derived-variant':
      'Zwischen mindestens zwei Passwörtern wurde ein konkreter abgeleiteter Kandidatenweg erkannt.',
    retrievability: 'Mindestens ein Passwort war im Login nicht direkt abrufbar.',
  } as const satisfies Readonly<Record<S07ProblemClass, string>>,
  noProblemStatement:
    'In dieser begrenzten Übung wurde kein Änderungsbedarf erkannt. Die neue Methode wird im nächsten Schritt an einem zusätzlichen Beispiel geübt.',
  fixtures: [
    {
      id: 'directly-reached',
      routeId: 's07-directly-reached',
      accounts: {
        campusgram: { fictionalPassword: 'Passwort123!', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'Passwort123!', retrievalStatus: 'retrievable' },
        'campus-email': { fictionalPassword: 'B3xJ9pW5dF7s', retrievalStatus: 'retrievable' },
      },
    },
    {
      id: 'exact-reuse',
      routeId: 's07-exact-reuse',
      accounts: {
        campusgram: { fictionalPassword: 'rQ7mL2vX9pK4', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'rQ7mL2vX9pK4', retrievalStatus: 'retrievable' },
        'campus-email': { fictionalPassword: 'B3xJ9pW5dF7s', retrievalStatus: 'retrievable' },
      },
    },
    {
      id: 'derived-variant',
      routeId: 's07-derived-variant',
      accounts: {
        campusgram: { fictionalPassword: 'LunaCampusgramRiver', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'N8vT2kR6mZ4q', retrievalStatus: 'retrievable' },
        'campus-email': { fictionalPassword: 'LunaMailRiver', retrievalStatus: 'retrievable' },
      },
    },
    {
      id: 'retrievability-only',
      routeId: 's07-retrievability-only',
      accounts: {
        campusgram: { fictionalPassword: 'rQ7mL2vX9pK4', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'N8vT2kR6mZ4q', retrievalStatus: 'assisted' },
        'campus-email': { fictionalPassword: 'B3xJ9pW5dF7s', retrievalStatus: 'retrievable' },
      },
    },
    {
      id: 'no-change',
      routeId: 's07-no-change',
      accounts: {
        campusgram: { fictionalPassword: 'rQ7mL2vX9pK4', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'N8vT2kR6mZ4q', retrievalStatus: 'retrievable' },
        'campus-email': { fictionalPassword: 'B3xJ9pW5dF7s', retrievalStatus: 'retrievable' },
      },
    },
  ] as const satisfies readonly S07EvaluationFixture[],
} as const;

export function getS07EvaluationFixtureByRouteId(
  routeId: string,
): S07EvaluationFixture | undefined {
  return s07EvaluationContent.fixtures.find((fixture) => fixture.routeId === routeId);
}
