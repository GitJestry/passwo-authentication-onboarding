import type { PasswordAnalysisResult, TrainingSectionId } from '@passwo/contracts';

export type S05DesignLabFixtureId = 'common-suffix' | 'account-year' | 'no-simple-component';

export interface S05DesignLabFixture {
  readonly id: S05DesignLabFixtureId;
  readonly routeId: `s05-${S05DesignLabFixtureId}`;
  readonly label: string;
  readonly fictionalPassword: string;
  readonly authoredAccountTerms: readonly string[];
  readonly analysis: PasswordAnalysisResult;
}

export const S05_CONTENT_VERSION = '1.0.0';

export const s05Content = {
  version: S05_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [12, 13, 14, 15, 16, 17, 18, 19] as const,
  },
  segment: {
    id: 'S05',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 's05-0-to-s05-1',
  },
  trainingAriaLabel: 'PassWo Training, Segment S05, lokale Analyse-Demonstration',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S05, lokale Analyse-Demonstration',
    address: 'campus.example/lokale-passwortanalyse',
    tab: { id: 'analysis', label: 'Lokale Analyse', enabled: true },
  },
  page: {
    eyebrow: 'Einzelanalyse · S05.0 bis S05.1',
    title: 'Wie entstehen wahrscheinliche Kandidaten?',
    fixtureNotice: 'Fiktives Passwort · wird nur lokal ausgewertet',
    start: 'Animation starten',
    replay: 'Animation wiederholen',
    continue: 'Weiter',
  },
  intro: {
    title: 'Erzeugen und vergleichen',
    explanation:
      'Ein Programm erzeugt Kandidaten und prüft sie gegen einen abstrakten Vergleichsmarker.',
    freeSearchLabel: 'Freies Durchprobieren',
    freeSearchBody: 'Viele Zeichenkombinationen werden unabhängig voneinander erzeugt.',
    likelyLabel: 'Wahrscheinliche Bestandteile',
    likelyBody: 'Bekannte Kerne und typische Veränderungen liefern gezieltere Kandidaten.',
    candidates: ['campus2026!', 'qwertz123', 'rQ7mL2vX', 'Passwort1!'],
    markerLabel: 'Vergleichsmarker · passt nicht',
  },
  theoreticalSearchSpace: {
    id: 's05-theoretical-free-search',
    label: 'Theoretisches Suchraummodell',
    characterGroups: ['Buchstaben', 'Ziffern', 'Symbole'],
    notice:
      'Dieses Modell erklärt freies Durchprobieren. Es berechnet keine Zeit für das fiktive Passwort.',
  },
  componentDemonstrations: [
    {
      id: 'common-components',
      title: 'Häufige Kerne',
      examples: ['passwort', 'qwertz', '123456789', '2026', 'sommer', 'admin'],
      note: 'Authored Beispiele, die bei vielen Menschen bereits verwendet wurden.',
    },
    {
      id: 'personal-examples',
      title: 'Persönliche Angaben',
      examples: ['Luna', 'BVB', 'Hochzeit2005'],
      note: 'Allgemeine authored Demonstration · keine Ableitung aus Anzeigename oder Nutzerdaten.',
    },
    {
      id: 'account-context',
      title: 'Konto-Kontext',
      examples: ['Campus', 'Campusgram', 'Prüfung', 'Semester', 'Archiv'],
      note: 'Authored Begriffe, die durch das fiktive Konto nahegelegt werden.',
    },
    {
      id: 'typical-changes',
      title: 'Typische Veränderungen',
      examples: ['Passwort → Passw0rt1!', 'Campus → C4mpus2026?'],
      note: 'Großschreibung, Ersetzung sowie Zahlen- oder Symbolanhang.',
    },
  ],
  findingLabels: {
    'common-password-core': 'häufiger Passwortkern',
    year: 'Jahreszahl',
    'simple-number-sequence': 'einfache Zahlenfolge',
    'repeated-component': 'wiederholter Bestandteil',
    'account-or-service-term': 'Konto- oder Dienstbegriff',
    'typical-suffix': 'typischer Zahlen- oder Symbolanhang',
    'no-simple-component-recognized': 'kein einfacher Bestandteil erkannt',
  },
  result: {
    title: 'Lokaler Befund für das fiktive Fixture',
    boundedNotice:
      'Die Befunde zeigen nur erkannte Ausgangspunkte. Sie sind kein Score und keine Produktionsbewertung.',
  },
  fixtures: [
    {
      id: 'common-suffix',
      routeId: 's05-common-suffix',
      label: 'Häufiger Kern plus typischer Anhang',
      fictionalPassword: 'Passwort123!',
      authoredAccountTerms: [],
      analysis: {
        kind: 'fictional-password-analysis',
        findings: [
          {
            id: 'single:common-password-core:0-8:0',
            kind: 'common-password-core',
            evidence: [{ type: 'span', start: 0, end: 8, token: 'Passwort' }],
            explanationId: 's05.common-password-core',
            confidence: 'authored-exact-match',
          },
          {
            id: 'single:typical-suffix:8-12:0',
            kind: 'typical-suffix',
            evidence: [{ type: 'span', start: 8, end: 12, token: '123!' }],
            explanationId: 's05.typical-suffix',
            confidence: 'bounded-heuristic',
          },
        ],
        disclaimerId: 'simulation-not-production-strength',
      },
    },
    {
      id: 'account-year',
      routeId: 's05-account-year',
      label: 'Campusgram-Begriff plus Jahreszahl',
      fictionalPassword: 'Campusgram2026',
      authoredAccountTerms: ['Campusgram'],
      analysis: {
        kind: 'fictional-password-analysis',
        findings: [
          {
            id: 'single:account-or-service-term:0-10:0',
            kind: 'account-or-service-term',
            evidence: [{ type: 'span', start: 0, end: 10, token: 'Campusgram' }],
            explanationId: 's05.account-or-service-term',
            confidence: 'bounded-heuristic',
          },
          {
            id: 'single:year:10-14:0',
            kind: 'year',
            evidence: [{ type: 'span', start: 10, end: 14, token: '2026' }],
            explanationId: 's05.year',
            confidence: 'bounded-heuristic',
          },
        ],
        disclaimerId: 'simulation-not-production-strength',
      },
    },
    {
      id: 'no-simple-component',
      routeId: 's05-no-simple-component',
      label: 'Kein einfacher Bestandteil erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      authoredAccountTerms: ['Campusgram'],
      analysis: {
        kind: 'fictional-password-analysis',
        findings: [
          {
            id: 'single:no-simple-component-recognized',
            kind: 'no-simple-component-recognized',
            evidence: [],
            explanationId: 's05.no-simple-component-recognized',
            confidence: 'bounded-heuristic',
          },
        ],
        disclaimerId: 'simulation-not-production-strength',
      },
    },
  ] as const satisfies readonly S05DesignLabFixture[],
  animations: [
    { id: 's05-candidate-check', targetId: 'candidate-marker', emphasis: 'info' },
    { id: 's05-component-analysis', targetId: 'analysis-result', emphasis: 'warning' },
  ] as const,
} as const;

export function getS05DesignLabFixture(fixtureId: S05DesignLabFixtureId): S05DesignLabFixture {
  return s05Content.fixtures.find(({ id }) => id === fixtureId) ?? s05Content.fixtures[0];
}

export function getS05Animation(animationId: string) {
  const authored = s05Content.animations.find(({ id }) => id === animationId);
  if (authored === undefined) return undefined;
  return {
    id: authored.id,
    steps: [
      {
        type: 'highlight' as const,
        targetId: authored.targetId,
        emphasis: authored.emphasis,
        durationMs: 520,
      },
    ],
    reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
    maxDurationMs: 520,
  };
}
