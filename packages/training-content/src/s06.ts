import type {
  PasswordTransformationId,
  PasswordTransformationStepKind,
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
  | 's06.local-reflection.marking-guide'
  | 's06.perspective.master-campus-found'
  | 's06.perspective.master-campus-exhaustive-found'
  | 's06.perspective.master-campus-blocked'
  | 's06.transition.master-campus-email-exact-match'
  | 's06.transition.master-campus-email-derived-variant-match'
  | 's06.transition.master-campus-email-no-match'
  | 's06.transition.campus-email-local-check'
  | 's06.local-check.campus-email-found'
  | 's06.local-check.campus-email-exhaustive-found'
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

export const S06_CONSEQUENCE_CONTENT_VERSION = '2.51.0';

export const s06ConsequenceContent = {
  version: S06_CONSEQUENCE_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [36, 37, 38, 39, 40, 41, 42, 43, 44] as const,
    revision: 'Userauftrag vom 2026-08-26 · erlebnisnahe Konsequenzcopy gestrafft',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s06-erlebnisnahe-konsequenzcopy-26-august-2026',
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
    connectionCheck: 'Verbindung prüfen',
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
      groupLabel: 'Zusammenhang',
      newGroup: 'Neuer Zusammenhang',
      maxGroupCount: 3,
      maxGroups: 'Max. 3 Zusammenhänge',
      structureMode: 'Struktur',
      requiresMultipleComponents: 'Nur ein Teil erkannt.',
      personalMode: 'Persönliches',
      personalSelectionLabel: 'Persönliche Angaben im fiktiven Passwort markieren',
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
      comparisonIdentifiers: [
        'MasterCampus',
        'Master Campus',
        'CampusWorkspace',
        'Campus Workspace',
        'CampusCloud',
        'Campus Cloud',
      ],
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
      comparisonIdentifiers: [
        'CampusMail',
        'Campus Mail',
        'CampusEmail',
        'Campus Email',
        'Campus E-Mail',
        'Postfach',
      ],
    },
    campusgram: {
      label: 'Campusgram',
      roleSummary: 'Direktnachrichten, Gruppen und Kontakte sowie Beiträge und Reaktionen',
      details: ['Direktnachrichten', 'Gruppen und Kontakte', 'Beiträge und Reaktionen'],
      accountTerms: accountContextTerms.campusgram,
      comparisonIdentifiers: ['Campusgram', 'Campus Gram', 'Instagram', 'Insta'],
    },
  } as const satisfies Readonly<Record<S06AccountId, unknown>>,
  relationLabels: {
    'exact-match': 'Exakte Wiederverwendung · Ziel in dieser Simulation erreicht',
    'derived-variant-match':
      'Geordneter Änderungsweg · erzeugter Kandidat trifft das Zielpasswort',
    'no-derived-path-recognized':
      'Mit den festgelegten Distanz- und Kontobegriffsgrenzen wurde kein direkter Weg erkannt',
    blockedShield: 'Dieser Angriffsweg ist blockiert.',
  },
  comparisonResultLabels: {
    'exact-match': 'Dasselbe Passwort',
    'derived-variant-match': 'Leicht abgewandelt',
    'no-derived-path-recognized': 'Keine leichte Abwandlung erkannt',
  },
  transformationLabels: {
    'account-or-service-term-replaced': 'Konto- oder Dienstbegriff wurde ausgetauscht.',
    'bounded-year-changed': 'Die Jahreszahl wurde innerhalb des begrenzten Wegs verändert.',
    'bounded-number-component-changed': 'Ein kurzer Zahlenbestandteil wurde verändert.',
    'typical-suffix-changed-added-or-removed':
      'Ein kurzer typischer Anhang wurde verändert, ergänzt oder entfernt.',
    'separator-changed': 'Ein übliches Trennzeichen wurde verändert, ergänzt oder entfernt.',
    'capitalization-changed': 'Die Groß- und Kleinschreibung wurde verändert.',
    'typical-leetspeak-changed': 'Eine typische Zeichenersetzung wurde verändert.',
    'single-character-changed':
      'Ein einzelnes Zeichen wurde ergänzt, entfernt, ausgetauscht oder vertauscht.',
    'repeated-character-pattern-changed':
      'Das gleiche Wiederholungsmuster wurde mit einem anderen Zeichen verwendet.',
    'leading-or-trailing-component-removed':
      'Ein vollständiger vorangestellter oder angehängter Bestandteil wurde entfernt.',
    'bounded-component-replaced':
      'Ein einzelner klar abgegrenzter Bestandteil wurde innerhalb desselben Musters ausgetauscht.',
    'bounded-surface-changes':
      'Der gezeigte Änderungsweg liegt innerhalb der festgelegten Distanzgrenze.',
    'account-term-and-year-changed': 'Konto- oder Dienstbegriff und Jahreszahl wurden verändert.',
    'account-term-and-suffix-changed': 'Konto- oder Dienstbegriff und Anhang wurden verändert.',
    'year-and-suffix-changed': 'Jahreszahl und typischer Anhang wurden verändert.',
    'account-term-year-and-suffix-changed':
      'Konto- oder Dienstbegriff, Jahreszahl und typischer Anhang wurden begrenzt verändert.',
    'account-term-with-small-surface-changes':
      'Ein vollständiger Kontobegriff und höchstens zwei weitere Zeichenänderungen bilden den gezeigten Weg.',
    'repeated-pattern-with-small-surface-changes':
      'Das Wiederholungsmuster und bis zu drei kleine typische Merkmale wurden verändert.',
    'component-removal-with-small-surface-changes':
      'Ein vollständiger Randbestandteil und bis zu drei kleine typische Merkmale wurden verändert.',
    'component-replacement-with-small-surface-changes':
      'Ein einzelner klar abgegrenzter Bestandteil und bis zu drei kleine typische Merkmale wurden verändert.',
  } as const satisfies Readonly<Record<PasswordTransformationId, string>>,
  transformationStepLabels: {
    'account-term-replacement': 'Kontobegriff ersetzt',
    'year-change': 'Jahreszahl verändert',
    'number-change': 'Zahlenbestandteil verändert',
    'suffix-change': 'Endzeichen oder kurzer Anhang verändert',
    'separator-change': 'Trennzeichen verändert',
    'capitalization-change': 'Groß- und Kleinschreibung verändert',
    'leet-substitution': 'Typische Zeichenersetzung',
    'character-substitution': 'Zeichen ersetzt',
    'character-insertion': 'Zeichen ergänzt',
    'character-deletion': 'Zeichen entfernt',
    'adjacent-transposition': 'Benachbarte Zeichen vertauscht',
  } as const satisfies Readonly<Record<PasswordTransformationStepKind, string>>,
  comparisonPathLabels: {
    heading: 'Angreiferweg',
    emptyValue: 'nichts',
    exactValue: 'unverändert',
  },
  dispositionLabels: {
    'whole-password-recognized':
      'Vollständiges Passwort in dieser begrenzten Simulation gefunden',
    'no-whole-password-recognized':
      'Vollständiges Passwort in dieser begrenzten Simulation nicht gefunden',
  },
  retrievalLabels: {
    retrievable: 'direkt abrufbar',
    'not-remembered': 'nicht direkt erinnert',
    assisted: 'mit lokaler Hilfe abgerufen',
  },
  narrations: {
    's06.incident.campusgram-found': {
      heading: 'Erster Vorfall: Campusgram',
      body: 'Beim Campusgram-Datenleck stand das Passwort nicht im Klartext. Unsere Übung konnte es trotzdem ermitteln. Jetzt prüfen wir, ob dasselbe Passwort oder leichte Abwandlungen auch zu den anderen Konten führen.',
    },
    's06.incident.campusgram-blocked': {
      heading: 'Erster Vorfall: Campusgram',
      body: 'Beim Campusgram-Datenleck stand das Passwort nicht im Klartext, und unsere Übung hat es nicht ermittelt. Mit den gestohlenen Passwortdaten kann aber weiter versucht werden, es zu ermitteln. Deshalb schauen wir kurz, was passiert, falls es später bekannt wird.',
    },
    's06.compare.exact-match': {
      heading: 'Dasselbe Passwort',
      body: 'Wird dieses Passwort bekannt, kann es auch beim anderen Konto ausprobiert werden.',
    },
    's06.compare.derived-variant-match': {
      heading: 'Leicht abgewandelt',
      body: 'Wird dieses Passwort bekannt, liegt die leichte Abwandlung beim anderen Konto nahe.',
    },
    's06.compare.no-derived-path-recognized': {
      heading: 'Keine leichte Abwandlung erkannt',
      body: 'Die hier geprüften Varianten führen nicht zum anderen Passwort.',
    },
    's06.local-reflection.marking-guide': {
      heading: 'Master Campus für sich',
      body: 'Markiere kurz Muster oder persönliche Angaben, die dir im Master-Campus-Passwort auffallen.',
    },
    's06.perspective.master-campus-found': {
      heading: 'Master Campus für sich',
      body: 'Auch das Master-Campus-Passwort wird in unserer Übung gefunden. Unabhängig davon prüfen wir jetzt seine Verbindung zur Campus E-Mail.',
    },
    's06.perspective.master-campus-exhaustive-found': {
      heading: 'Master Campus für sich',
      body: 'Das vollständige Durchprobieren findet auch das Master-Campus-Passwort. Jetzt prüfen wir noch seine Verbindung zur Campus E-Mail.',
    },
    's06.perspective.master-campus-blocked': {
      heading: 'Master Campus für sich',
      body: 'Das Master-Campus-Passwort wurde hier nicht gefunden. Ob es mit der Campus E-Mail verbunden ist, prüfen wir trotzdem.',
    },
    's06.transition.master-campus-email-exact-match': {
      heading: 'Dasselbe Passwort',
      body: 'Master Campus und Campus E-Mail verwenden dasselbe Passwort. Wird eines bekannt, kann es auch beim anderen ausprobiert werden.',
    },
    's06.transition.master-campus-email-derived-variant-match': {
      heading: 'Leicht abgewandelt',
      body: 'Die beiden Passwörter sind leicht abgewandelt. Wird eines bekannt, liegt auch die andere Variante nahe.',
    },
    's06.transition.master-campus-email-no-match': {
      heading: 'Keine leichte Abwandlung erkannt',
      body: 'Zwischen den beiden wurde keine leichte Abwandlung erkannt.',
    },
    's06.transition.campus-email-local-check': {
      heading: 'Campus E-Mail für sich',
      body: 'Zum Schluss prüfen wir das Campus-E-Mail-Passwort noch für sich.',
    },
    's06.local-check.campus-email-found': {
      heading: 'Campus E-Mail für sich',
      body: 'Auch das Campus-E-Mail-Passwort wird in unserer Übung gefunden. Es sollte deshalb später ersetzt werden.',
    },
    's06.local-check.campus-email-exhaustive-found': {
      heading: 'Campus E-Mail für sich',
      body: 'Das vollständige Durchprobieren findet auch das Campus-E-Mail-Passwort. Es sollte deshalb später ersetzt werden.',
    },
    's06.local-check.campus-email-blocked': {
      heading: 'Campus E-Mail für sich',
      body: 'Für sich wurde das Campus-E-Mail-Passwort in unserer Prüfung nicht gefunden.',
    },
    's06.summary': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Ein Passwort wirkt für sich und durch seine konkrete Beziehung zu anderen Passwörtern.',
    },
    's06.summary.actual-none': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Von Campusgram führt hier weder dasselbe Passwort noch eine leichte Abwandlung zu den anderen Konten.',
    },
    's06.summary.actual-one': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Von Campusgram führt dasselbe Passwort oder eine leichte Abwandlung zu einem weiteren Konto.',
    },
    's06.summary.actual-both': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Von Campusgram führen dasselbe Passwort oder leichte Abwandlungen zu beiden anderen Konten.',
    },
    's06.summary.hypothetical-none': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Falls das Campusgram-Passwort später bekannt wird, bleibt dieser Weg auf Campusgram begrenzt.',
    },
    's06.summary.hypothetical-one': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Falls das Campusgram-Passwort später bekannt wird, ist über dasselbe Passwort oder eine leichte Abwandlung auch ein weiteres Konto gefährdet.',
    },
    's06.summary.hypothetical-both': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Falls das Campusgram-Passwort später bekannt wird, sind über dasselbe Passwort oder leichte Abwandlungen auch beide anderen Konten gefährdet.',
    },
    's06.transition': {
      heading: 'Gemeinsame Endübersicht',
      body: 'Ein Datenleck kann bei jedem Konto passieren. Deshalb prüfen wir jetzt Master Campus für sich und seine Verbindung zur Campus E-Mail.',
    },
    's06.transition.s07': {
      heading: 'Campusgram-Passwort ersetzen',
      body: 'Das Campusgram-Passwort ersetzen wir jetzt wegen des Datenlecks, unabhängig davon, wie schwer es hier zu erraten war. Die übrigen offenen Punkte beheben wir danach.',
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
