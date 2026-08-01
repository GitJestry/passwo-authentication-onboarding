import type {
  S06AccountId,
  S06ResolvedConsequenceResult,
  TrainingSectionId,
} from '@passwo/contracts';

export type S06ConsequenceFixtureId =
  | 'reuse-and-derived'
  | 'incident-not-found'
  | 'incident-found-blocked'
  | 'mixed-actual-hypothetical';

export interface S06ConsequenceFixture {
  readonly id: S06ConsequenceFixtureId;
  readonly routeId:
    | 's06-reuse-and-derived'
    | 's06-incident-not-found'
    | 's06-incident-found-blocked'
    | 's06-mixed-actual-hypothetical';
  readonly accounts: Readonly<
    Record<
      S06AccountId,
      {
        readonly fictionalPassword: string;
        readonly retrievalStatus: 'retrievable' | 'not-remembered' | 'assisted';
      }
    >
  >;
}

export type S06NarrationId =
  | 's06.incident.campusgram-found'
  | 's06.incident.campusgram-blocked'
  | 's06.compare.exact-match'
  | 's06.compare.derived-variant-match'
  | 's06.compare.no-derived-path-recognized'
  | 's06.perspective.master-campus-found'
  | 's06.perspective.master-campus-blocked'
  | 's06.local-check.campus-email-found'
  | 's06.local-check.campus-email-blocked'
  | 's06.summary';

export interface S06NarrationContent {
  readonly heading: string;
  readonly body: string;
}

export const S06_CONSEQUENCE_CONTENT_VERSION = '2.2.0';

export const s06ConsequenceContent = {
  version: S06_CONSEQUENCE_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [36, 37, 38, 39, 40, 41, 42, 43, 44] as const,
  },
  segment: {
    id: 'S06',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'dynamic-consequence-simulation',
  },
  trainingAriaLabel: 'PassWo, Segment S06, dynamische Konsequenzsimulation',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S06, Passwortfolgen',
    address: 'campus.example/passwortfolgen',
    tab: { id: 'consequence', label: 'Passwortfolgen', enabled: true },
  },
  page: {
    eyebrow: 'PassWo · S06',
    title: 'Wohin kann ein bekanntes Passwort führen?',
    instruction:
      'Die Übung zeigt ausschließlich fiktive Passwörter und begrenzte, konkrete Ableitungswege.',
    fixtureNotice: 'Fiktive Übungswerte · nur lokal im Design Lab',
    runtimeNotice: 'Deine drei fiktiven Übungswerte · bleiben nur lokal',
    start: 'Simulation starten',
    replay: 'Animation wiederholen',
    continue: 'Weiter',
    complete: 'Endübersicht erreicht',
    showPassword: 'Fiktives Passwort anzeigen',
    hidePassword: 'Fiktives Passwort verbergen',
  },
  modes: {
    actual: {
      heading: 'Tatsächliche Darstellung dieser Übung',
      status: 'Tatsächlicher Simulationspfad',
      overlay: 'Tatsächlich · mit den drei fiktiven Übungswerten',
    },
    hypothetical: {
      heading: 'Was wäre, wenn das Ausgangspasswort bekannt wäre?',
      status: 'Hypothetischer Simulationspfad',
      overlay: 'Hypothetisches Beispiel · nicht als tatsächlicher Vorfall dargestellt',
    },
  },
  accounts: {
    'master-campus': {
      label: 'Master Campus',
      roleSummary: 'Campus Workspace, Campus Services und Campus Cloud',
      details: ['Campus Workspace', 'Campus Services', 'Campus Cloud'],
      accountTerms: ['MasterCampus', 'Master Campus', 'Campus'],
    },
    'campus-email': {
      label: 'Campus E-Mail',
      roleSummary:
        'Benachrichtigungen, Bestätigungen, Zurücksetzungslinks und Kommunikation in deinem Namen',
      details: [
        'Benachrichtigungen',
        'Bestätigungen',
        'Zurücksetzungslinks',
        'Kommunikation in deinem Namen',
      ],
      accountTerms: ['CampusMail', 'Campus E-Mail', 'Mail', 'E-Mail'],
    },
    campusgram: {
      label: 'Campusgram',
      roleSummary: 'Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen',
      details: ['Direktnachrichten', 'Gruppen und Kontakte', 'Beiträge und Reaktionen'],
      accountTerms: ['Campusgram', 'Gram'],
    },
  } as const satisfies Readonly<Record<S06AccountId, unknown>>,
  relationLabels: {
    'exact-match': 'Exakte Wiederverwendung · Ziel in dieser Simulation erreicht',
    'derived-variant-match':
      'Konkrete abgeleitete Variante · erzeugter Kandidat trifft das Zielpasswort',
    'no-derived-path-recognized':
      'Mit den begrenzten Transformationswegen wurde kein direkter Weg erkannt',
    blockedShield: 'Dieser Angriffsweg ist blockiert.',
  },
  transformationLabels: {
    'account-or-service-term-replaced': 'Konto- oder Dienstbegriff wurde ausgetauscht.',
    'bounded-year-changed': 'Die Jahreszahl wurde innerhalb des begrenzten Wegs verändert.',
    'typical-suffix-changed-or-added': 'Ein typischer Anhang wurde verändert oder ergänzt.',
    'account-term-and-year-changed': 'Konto- oder Dienstbegriff und Jahreszahl wurden verändert.',
    'account-term-and-suffix-changed': 'Konto- oder Dienstbegriff und Anhang wurden verändert.',
    'year-and-suffix-changed': 'Jahreszahl und typischer Anhang wurden verändert.',
    'account-term-year-and-suffix-changed':
      'Konto- oder Dienstbegriff, Jahreszahl und typischer Anhang wurden begrenzt verändert.',
  },
  dispositionLabels: {
    'quick-path-recognized': 'Schneller Weg in dieser begrenzten Simulation erkannt',
    'no-quick-path-recognized': 'Kein schnellerer Weg in dieser begrenzten Simulation erkannt',
  },
  retrievalLabels: {
    retrievable: 'direkt abrufbar',
    'not-remembered': 'nicht direkt erinnert',
    assisted: 'mit lokaler Hilfe abgerufen',
  },
  narrations: {
    's06.incident.campusgram-found': {
      heading: 'Erster Vorfall: Campusgram',
      body: 'Das Campusgram-Passwort wurde über einen schnellen Weg dieser Simulation gefunden.',
    },
    's06.incident.campusgram-blocked': {
      heading: 'Erster Vorfall: Campusgram',
      body: 'Das Datenleck allein reicht hier nicht aus. Dieser tatsächliche Weg stoppt zunächst.',
    },
    's06.compare.exact-match': {
      heading: 'Vollständige Werte stimmen überein',
      body: 'Das bekannte Passwort kann ohne Veränderung beim Zielkonto ausprobiert werden.',
    },
    's06.compare.derived-variant-match': {
      heading: 'Ein begrenzter Kandidatenweg trifft den Zielwert',
      body: 'Die sichtbare Transformation erzeugt das vollständige fiktive Zielpasswort.',
    },
    's06.compare.no-derived-path-recognized': {
      heading: 'Kein direkter Weg erkannt',
      body: 'Die Prüflinie stoppt vor dem Ziel. Das ist keine allgemeine Sicherheitsgarantie.',
    },
    's06.perspective.master-campus-found': {
      heading: 'Perspektivwechsel zu Master Campus',
      body: 'Auch Master Campus kann Ausgangspunkt eines Vorfalls sein. Der lokale Einzelcheck findet hier einen schnellen Weg.',
    },
    's06.perspective.master-campus-blocked': {
      heading: 'Perspektivwechsel zu Master Campus',
      body: 'Der tatsächliche Weg stoppt zunächst; der anschließende Vergleich ist klar hypothetisch.',
    },
    's06.local-check.campus-email-found': {
      heading: 'Lokaler Einzelcheck von Campus E-Mail',
      body: 'Die begrenzte Einzelanalyse erkennt bei diesem fiktiven Passwort einen schnellen Weg.',
    },
    's06.local-check.campus-email-blocked': {
      heading: 'Lokaler Einzelcheck von Campus E-Mail',
      body: 'Mit den begrenzten Wegen wurde hier kein schneller Weg erkannt.',
    },
    's06.summary': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Ein Passwort wirkt für sich und durch seine konkrete Beziehung zu anderen Passwörtern.',
    },
  } as const satisfies Readonly<Record<S06NarrationId, S06NarrationContent>>,
  fixtures: [
    {
      id: 'reuse-and-derived',
      routeId: 's06-reuse-and-derived',
      accounts: {
        campusgram: { fictionalPassword: 'LunaCampusgram2026!', retrievalStatus: 'retrievable' },
        'master-campus': {
          fictionalPassword: 'LunaCampusgram2026!',
          retrievalStatus: 'retrievable',
        },
        'campus-email': { fictionalPassword: 'LunaMail2027?', retrievalStatus: 'assisted' },
      },
    },
    {
      id: 'incident-not-found',
      routeId: 's06-incident-not-found',
      accounts: {
        campusgram: { fictionalPassword: 'rQ7mL2vX9pK4', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'N8vT2kR6mZ4q', retrievalStatus: 'assisted' },
        'campus-email': { fictionalPassword: 'B3xJ9pW5dF7s', retrievalStatus: 'not-remembered' },
      },
    },
    {
      id: 'incident-found-blocked',
      routeId: 's06-incident-found-blocked',
      accounts: {
        campusgram: { fictionalPassword: 'Passwort123!', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'N8vT2kR6mZ4q', retrievalStatus: 'assisted' },
        'campus-email': { fictionalPassword: 'B3xJ9pW5dF7s', retrievalStatus: 'retrievable' },
      },
    },
    {
      id: 'mixed-actual-hypothetical',
      routeId: 's06-mixed-actual-hypothetical',
      accounts: {
        campusgram: { fictionalPassword: 'LunaCampusgram2026!', retrievalStatus: 'retrievable' },
        'master-campus': { fictionalPassword: 'rQ7mL2vX9pK4', retrievalStatus: 'assisted' },
        'campus-email': { fictionalPassword: 'LunaMail2027?', retrievalStatus: 'retrievable' },
      },
    },
  ] as const satisfies readonly S06ConsequenceFixture[],
} as const;

export function getS06ConsequenceFixture(
  fixtureId: S06ConsequenceFixtureId,
): S06ConsequenceFixture {
  return (
    s06ConsequenceContent.fixtures.find(({ id }) => id === fixtureId) ??
    s06ConsequenceContent.fixtures[0]
  );
}

export function getS06ConsequenceFixtureByRouteId(
  routeId: string,
): S06ConsequenceFixture | undefined {
  return s06ConsequenceContent.fixtures.find((fixture) => fixture.routeId === routeId);
}

export type S06PreparedS07EvaluationFixtureId =
  | 'directly-reached'
  | 'exact-reuse'
  | 'derived-variant'
  | 'retrievability-only'
  | 'no-change';

export interface S06PreparedS07EvaluationFixture {
  readonly id: S06PreparedS07EvaluationFixtureId;
  readonly routeId:
    | 's07-directly-reached'
    | 's07-exact-reuse'
    | 's07-derived-variant'
    | 's07-retrievability-only'
    | 's07-no-change';
  readonly resolvedResult: S06ResolvedConsequenceResult;
}

const noQuickPathDisposition = {
  kind: 'no-quick-path-recognized',
  explanationId: 's05.disposition.no-quick-path-recognized',
} as const;

const commonPasswordQuickPathDisposition = {
  kind: 'quick-path-recognized',
  ruleId: 'common-password-core-with-typical-change',
  explanationId: 's05.disposition.common-password-core-with-typical-change',
} as const;

export const s06PreparedS07EvaluationFixtures = [
  {
    id: 'directly-reached',
    routeId: 's07-directly-reached',
    resolvedResult: {
      incidentSource: 'campusgram',
      accounts: [
        {
          accountId: 'master-campus',
          disposition: commonPasswordQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campus-email',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campusgram',
          disposition: commonPasswordQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
      ],
      paths: [
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'master-campus',
          mode: 'actual',
          relationKind: 'exact-match',
          targetReached: true,
        },
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'campus-email',
          mode: 'actual',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'master-campus',
          targetAccountId: 'campus-email',
          mode: 'actual',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
      ],
      affectedAccountIds: ['campusgram', 'master-campus'],
    },
  },
  {
    id: 'exact-reuse',
    routeId: 's07-exact-reuse',
    resolvedResult: {
      incidentSource: 'campusgram',
      accounts: [
        {
          accountId: 'master-campus',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campus-email',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campusgram',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
      ],
      paths: [
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'master-campus',
          mode: 'hypothetical',
          relationKind: 'exact-match',
          targetReached: false,
        },
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'master-campus',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
      ],
      affectedAccountIds: [],
    },
  },
  {
    id: 'derived-variant',
    routeId: 's07-derived-variant',
    resolvedResult: {
      incidentSource: 'campusgram',
      accounts: [
        {
          accountId: 'master-campus',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campus-email',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campusgram',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
      ],
      paths: [
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'master-campus',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'derived-variant-match',
          targetReached: false,
        },
        {
          sourceAccountId: 'master-campus',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
      ],
      affectedAccountIds: [],
    },
  },
  {
    id: 'retrievability-only',
    routeId: 's07-retrievability-only',
    resolvedResult: {
      incidentSource: 'campusgram',
      accounts: [
        {
          accountId: 'master-campus',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'assisted',
        },
        {
          accountId: 'campus-email',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campusgram',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
      ],
      paths: [
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'master-campus',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'master-campus',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
      ],
      affectedAccountIds: [],
    },
  },
  {
    id: 'no-change',
    routeId: 's07-no-change',
    resolvedResult: {
      incidentSource: 'campusgram',
      accounts: [
        {
          accountId: 'master-campus',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campus-email',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
        {
          accountId: 'campusgram',
          disposition: noQuickPathDisposition,
          retrievalStatus: 'retrievable',
        },
      ],
      paths: [
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'master-campus',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'campusgram',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
        {
          sourceAccountId: 'master-campus',
          targetAccountId: 'campus-email',
          mode: 'hypothetical',
          relationKind: 'no-derived-path-recognized',
          targetReached: false,
        },
      ],
      affectedAccountIds: [],
    },
  },
] as const satisfies readonly S06PreparedS07EvaluationFixture[];

export function getS06PreparedS07EvaluationFixtureByRouteId(
  routeId: string,
): S06PreparedS07EvaluationFixture | undefined {
  return s06PreparedS07EvaluationFixtures.find((fixture) => fixture.routeId === routeId);
}
