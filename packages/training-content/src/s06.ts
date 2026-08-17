import type {
  S06AccountId,
  TrainingSectionId,
} from '@passwo/contracts';
import { accountContextTerms } from './account-context-terms.js';

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
  | 's06.transition.master-campus-email-match'
  | 's06.transition.master-campus-email-no-match'
  | 's06.local-check.campus-email-found'
  | 's06.local-check.campus-email-blocked'
  | 's06.summary'
  | 's06.summary.actual-none'
  | 's06.summary.actual-one'
  | 's06.summary.actual-both'
  | 's06.summary.hypothetical-none'
  | 's06.summary.hypothetical-one'
  | 's06.summary.hypothetical-both'
  | 's06.transition'
  | 's06.transition.s07';

export interface S06NarrationContent {
  readonly heading: string;
  readonly body: string;
}

export const S06_CONSEQUENCE_CONTENT_VERSION = '2.24.0';

export const s06ConsequenceContent = {
  version: S06_CONSEQUENCE_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [36, 37, 38, 39, 40, 41, 42, 43, 44] as const,
    revision: 'Userauftrag vom 2026-08-17 · persönliche Bereichsauswahl ergänzt',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy--und-darstellungsdelta-s06-persönliche-bereiche-17-august-2026',
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
    attackStart: 'Angriff starten',
    dataLeak: 'Datenleck',
    replay: 'Animation wiederholen',
    continue: 'Weiter',
    replacePassword: 'Passwort ersetzen',
    finish: 'Fertig',
    complete: 'Endübersicht erreicht',
    showPassword: 'Fiktives Passwort anzeigen',
    hidePassword: 'Fiktives Passwort verbergen',
    localReflection: {
      passwordLabel: 'Fiktives Passwort',
      modeLabel: 'Modus:',
      groupLabel: 'Gruppe',
      newGroup: 'Neue Gruppe',
      structureMode: 'Struktur',
      personalMode: 'Persönliches',
      personalSelectionLabel: 'Persönliche Angaben im fiktiven Passwort markieren',
      personalApply: 'Übernehmen',
      passwordTitles: {
        'master-campus': 'Master Campus-Passwort',
        'campus-email': 'Campus E-Mail-Passwort',
      },
    },
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
      overlay: 'Was wäre, wenn?',
    },
  },
  accounts: {
    'master-campus': {
      label: 'Master Campus',
      roleSummary: 'Campus Workspace, Campus Services und Campus Cloud',
      details: ['Campus Workspace', 'Campus Services', 'Campus Cloud'],
      accountTerms: accountContextTerms['master-campus'],
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
      accountTerms: accountContextTerms['campus-email'],
    },
    campusgram: {
      label: 'Campusgram',
      roleSummary: 'Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen',
      details: ['Direktnachrichten', 'Gruppen und Kontakte', 'Beiträge und Reaktionen'],
      accountTerms: accountContextTerms.campusgram,
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
  comparisonResultLabels: {
    'exact-match': 'Wiederverwendet',
    'derived-variant-match': 'Ähnlich',
    'no-derived-path-recognized': 'Keine Übereinstimmung',
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
    'whole-password-recognized':
      'Vollständiges Passwort als frühen Kandidaten in dieser begrenzten Simulation erkannt',
    'no-whole-password-recognized':
      'Kein vollständiger früher Kandidat in dieser begrenzten Simulation erkannt',
  },
  retrievalLabels: {
    retrievable: 'direkt abrufbar',
    'not-remembered': 'nicht direkt erinnert',
    assisted: 'mit lokaler Hilfe abgerufen',
  },
  narrations: {
    's06.incident.campusgram-found': {
      heading: 'Erster Vorfall: Campusgram',
      body: 'Das Campusgram-Passwort ist nun bekannt. Der Angreifer kann es und ähnliche Varianten jetzt auch bei den anderen Konten ausprobieren.',
    },
    's06.incident.campusgram-blocked': {
      heading: 'Erster Vorfall: Campusgram',
      body: 'Das Campusgram-Passwort wurde hier nicht gefunden. Schauen wir trotzdem kurz, was passiert wäre, wenn es bekannt geworden wäre.',
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
      body: 'Das Master-Campus-Passwort gilt hier ebenfalls als gefunden. Prüfen wir, ob es bei Campus E-Mail weiterführt.',
    },
    's06.perspective.master-campus-blocked': {
      heading: 'Perspektivwechsel zu Master Campus',
      body: 'Das Master-Campus-Passwort wurde hier nicht gefunden. Für den Vergleich nehmen wir kurz an, es wäre bekannt geworden.',
    },
    's06.transition.master-campus-email-match': {
      heading: 'Übergang zu Campus E-Mail',
      body: 'Zwischen Master Campus und Campus E-Mail wurde ein gleiches oder ähnliches Passwort erkannt. Dieser Weg könnte den Angriff auf Campus E-Mail ausweiten. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.',
    },
    's06.transition.master-campus-email-no-match': {
      heading: 'Übergang zu Campus E-Mail',
      body: 'Zwischen Master Campus und Campus E-Mail wurde hier keine solche Übereinstimmung erkannt. Dieser Weg führt in dieser Übung nicht weiter. Schauen wir uns das Campus-E-Mail-Passwort jetzt noch für sich an.',
    },
    's06.local-check.campus-email-found': {
      heading: 'Lokaler Einzelcheck von Campus E-Mail',
      body: 'Auch dieses Passwort gilt hier als gefunden. Einzigartigkeit verhindert die Ausbreitung zwischen Konten, trotzdem sollte jedes Passwort auch für sich stark sein.',
    },
    's06.local-check.campus-email-blocked': {
      heading: 'Lokaler Einzelcheck von Campus E-Mail',
      body: 'Dieses Passwort wurde hier nicht gefunden. Das ist ein gutes Ergebnis für diese Übung.',
    },
    's06.summary': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Ein Passwort wirkt für sich und durch seine konkrete Beziehung zu anderen Passwörtern.',
    },
    's06.summary.actual-none': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Hier bleibt der Angriff auf Campusgram begrenzt. Bei den anderen Konten führen diese Versuche nicht weiter.',
    },
    's06.summary.actual-one': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Bei einem weiteren Konto führt ein gleiches oder ähnliches Passwort weiter. So kann aus einem betroffenen Konto ein zweites werden.',
    },
    's06.summary.actual-both': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Bei beiden anderen Konten führt ein gleiches oder ähnliches Passwort weiter. So kann sich ein Datenleck auf mehrere Konten ausweiten.',
    },
    's06.summary.hypothetical-none': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Wäre das Campusgram-Passwort bekannt geworden, wäre der Angriff hier auf Campusgram begrenzt geblieben.',
    },
    's06.summary.hypothetical-one': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Wäre das Campusgram-Passwort bekannt geworden, hätte sich der Angriff auf ein weiteres Konto ausweiten können.',
    },
    's06.summary.hypothetical-both': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Wäre das Campusgram-Passwort bekannt geworden, hätte sich der Angriff auf beide anderen Konten ausweiten können.',
    },
    's06.transition': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Ein Datenleck kann bei jedem Konto beginnen. Schauen wir deshalb noch von Master Campus aus.',
    },
    's06.transition.s07': {
      heading: 'Passwort sicher ersetzen',
      body: 'Ein Datenleck lässt sich nicht immer verhindern. Danach zählt, die Folgen zu begrenzen: das betroffene Passwort zügig ersetzen und Wiederverwendung stoppen. Genau das machen wir jetzt bei Campusgram.',
    },
  } as const satisfies Readonly<Record<S06NarrationId, S06NarrationContent>>,
  fixtures: [
    {
      id: 'reuse-and-derived',
      routeId: 's06-reuse-and-derived',
      accounts: {
        campusgram: { fictionalPassword: 'LunaCampusgram2026!', retrievalStatus: 'retrievable' },
        'master-campus': {
          fictionalPassword: 'LunaMasterCampus2027?',
          retrievalStatus: 'retrievable',
        },
        'campus-email': {
          fictionalPassword: 'LunaCampusgram2026!',
          retrievalStatus: 'assisted',
        },
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
        'master-campus': { fictionalPassword: 'rQ7mL2vX9pK4!', retrievalStatus: 'assisted' },
        'campus-email': { fictionalPassword: 'rQ7mL2vX9pK4?', retrievalStatus: 'retrievable' },
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
