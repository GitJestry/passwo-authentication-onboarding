import type {
  AuthoredStructureDemonstration,
  DesignLabScenarioId,
  TrainingSectionId,
} from '@passwo/contracts';

export type S05ComponentDesignLabFixtureId =
  | 'common-suffix'
  | 'account-year'
  | 'no-simple-component';
export type S05StructureDesignLabFixtureId =
  | 'structure-repetition'
  | 'structure-context'
  | 'structure-none';
export type S05DesignLabFixtureId = S05ComponentDesignLabFixtureId | S05StructureDesignLabFixtureId;

interface S05DesignLabFixtureBase {
  readonly id: S05DesignLabFixtureId;
  readonly routeId: `s05-${S05DesignLabFixtureId}`;
  readonly label: string;
  readonly fictionalPassword: string;
  readonly analysisContext: {
    readonly accountTerms: readonly string[];
  };
}

export interface S05ComponentDesignLabFixture extends S05DesignLabFixtureBase {
  readonly slice: 'component-analysis';
  readonly id: S05ComponentDesignLabFixtureId;
  readonly routeId: `s05-${S05ComponentDesignLabFixtureId}`;
}

export interface S05StructureDesignLabFixture extends S05DesignLabFixtureBase {
  readonly slice: 'structure-analysis';
  readonly id: S05StructureDesignLabFixtureId;
  readonly routeId: `s05-${S05StructureDesignLabFixtureId}`;
}

export type S05DesignLabFixture = S05ComponentDesignLabFixture | S05StructureDesignLabFixture;

export const S05_CONTENT_VERSION = '1.1.0';

export const s05Content = {
  version: S05_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] as const,
  },
  segment: {
    id: 'S05',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 's05-0-to-s05-2',
  },
  trainingAriaLabel: 'PassWo Training, Segment S05, lokale Analyse-Demonstration',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S05, lokale Analyse-Demonstration',
    address: 'campus.example/lokale-passwortanalyse',
    tab: { id: 'analysis', label: 'Lokale Analyse', enabled: true },
  },
  page: {
    eyebrow: 'Einzelanalyse · S05.0 bis S05.2',
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
  structure: {
    intro: 'Jetzt schauen wir nacheinander, wie Menschen Bestandteile miteinander verbinden.',
    demonstrations: [
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-theme',
        relation: 'thematic-relation',
        title: 'Thematischer Zusammenhang',
        tokens: ['Kaffee', 'Tasse', 'Morgen'],
        connectionLabel: 'Morgenroutine',
        passWoExplanation:
          'Ein gemeinsames Thema kann mehrere Bestandteile leichter merkbar verbinden.',
        boundaryNote:
          'Diese feste Demonstration erklärt den Zusammenhang. Die lokale Analyse leitet keine allgemeine Wortsemantik ab.',
      },
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-sentence',
        relation: 'sentence-structure',
        title: 'Satzstruktur',
        tokens: ['Ich', 'trinke', 'morgens', 'Kaffee'],
        connectionLabel: 'sprachlich passende Folge',
        passWoExplanation:
          'Sätze lassen sich gut merken, weil ihre Teile sprachlich zusammenpassen.',
        boundaryNote: 'Diese feste Demonstration ist keine Sprachanalyse des fiktiven Passworts.',
      },
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-repetition',
        relation: 'exact-repetition',
        title: 'Wiederholung',
        tokens: ['Kaffee', 'Kaffee', 'Kaffee'],
        connectionLabel: 'derselbe Bestandteil · 3×',
        passWoExplanation:
          'Nach dem ersten Treffer muss ein exakt wiederholter Bestandteil nicht neu erraten werden.',
        boundaryNote:
          'Die Laufzeitanalyse markiert nur konkrete, ausreichend lange exakte Wiederholungen.',
      },
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-context',
        relation: 'password-context',
        title: 'Passwortkontext',
        tokens: ['Campusgram', 'Campus', '2026', '!'],
        connectionLabel: 'Konto · Campusbezug · Jahr · Anhang',
        passWoExplanation:
          'Zum Konto passende Teile können gemeinsam einen gezielteren Suchweg bilden.',
        boundaryNote:
          'Die Laufzeitanalyse verwendet nur feste Konto- oder Kontextbegriffe des fiktiven Fixtures.',
      },
    ] as const satisfies readonly AuthoredStructureDemonstration[],
    findingLabels: {
      'exact-component-repetition': 'exakte Wiederholung eines Bestandteils',
      'account-context-with-qualifier':
        'Konto- oder Kontextbegriff mit Jahr, Zahlenfolge oder Anhang',
      'number-marker-with-typical-suffix': 'erkannter Zahlenmarker mit typischem Anhang',
      'no-simple-structure-recognized': 'kein einfacher Zusammenhang erkannt',
    },
    application: {
      title: 'Anwendung auf das fiktive Passwort',
      recognizedExplanation:
        'Nur die konkret erkannten Stellen werden markiert. Die begrenzten Regeln benennen höchstens zwei Wege gleichzeitig.',
      noneExplanation:
        'Die begrenzten Regeln haben hier keinen einfachen Zusammenhang erkannt. Das ist keine Aussage über Zufälligkeit, Stärke oder Sicherheit.',
      boundedNotice:
        'Die Struktur-Befunde sind lokale Simulationsergebnisse und keine Gesamtbewertung.',
    },
  },
  fixtures: [
    {
      slice: 'component-analysis',
      id: 'common-suffix',
      routeId: 's05-common-suffix',
      label: 'Häufiger Kern plus typischer Anhang',
      fictionalPassword: 'Passwort123!',
      analysisContext: { accountTerms: [] },
    },
    {
      slice: 'component-analysis',
      id: 'account-year',
      routeId: 's05-account-year',
      label: 'Campusgram-Begriff plus Jahreszahl',
      fictionalPassword: 'Campusgram2026',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      slice: 'component-analysis',
      id: 'no-simple-component',
      routeId: 's05-no-simple-component',
      label: 'Kein einfacher Bestandteil erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      slice: 'structure-analysis',
      id: 'structure-repetition',
      routeId: 's05-structure-repetition',
      label: 'Wiederholter Bestandteil',
      fictionalPassword: 'KaffeeKaffeeKaffee7',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      slice: 'structure-analysis',
      id: 'structure-context',
      routeId: 's05-structure-context',
      label: 'Campusgram-Kontext plus Jahr und Anhang',
      fictionalPassword: 'Campusgram2026!',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      slice: 'structure-analysis',
      id: 'structure-none',
      routeId: 's05-structure-none',
      label: 'Kein einfacher Zusammenhang erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
  ] as const satisfies readonly S05DesignLabFixture[],
  animations: [
    {
      id: 's05-candidate-check',
      targetId: 'candidate-marker',
      emphasis: 'info',
    },
    {
      id: 's05-component-analysis',
      targetId: 'analysis-result',
      emphasis: 'warning',
    },
    {
      id: 's05-structure-theme',
      targetId: 'structure-theme',
      emphasis: 'info',
    },
    {
      id: 's05-structure-sentence',
      targetId: 'structure-sentence',
      emphasis: 'info',
    },
    {
      id: 's05-structure-repetition',
      targetId: 'structure-repetition',
      emphasis: 'warning',
    },
    {
      id: 's05-structure-context',
      targetId: 'structure-context',
      emphasis: 'warning',
    },
    {
      id: 's05-structure-application',
      targetId: 'structure-application',
      emphasis: 'warning',
    },
  ] as const,
} as const;

export function getS05DesignLabFixture(fixtureId: S05DesignLabFixtureId): S05DesignLabFixture {
  return s05Content.fixtures.find(({ id }) => id === fixtureId) ?? s05Content.fixtures[0];
}

export function getS05DesignLabFixtureByRouteId(
  routeId: DesignLabScenarioId,
): S05DesignLabFixture | undefined {
  return s05Content.fixtures.find((fixture) => fixture.routeId === routeId);
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
