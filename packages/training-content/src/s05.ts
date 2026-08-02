import type {
  AuthoredStructureDemonstration,
  DesignLabScenarioId,
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
  SimulationQuickPathRuleId,
} from '@passwo/contracts';

export type S05DesignLabFixtureId =
  | 'common-suffix'
  | 'account-year'
  | 'no-simple-component'
  | 'structure-repetition'
  | 'structure-context'
  | 'structure-none';

export interface S05DesignLabFixture {
  readonly id: S05DesignLabFixtureId;
  readonly routeId: `s05-${S05DesignLabFixtureId}`;
  readonly label: string;
  readonly fictionalPassword: string;
  readonly analysisContext: {
    readonly accountTerms: readonly string[];
  };
}

export const S05_CONTENT_VERSION = '2.6.0';

const s05StrategyCards = [
  { id: 'components', title: 'Naheliegende Bestandteile' },
  { id: 'structure', title: 'Vorhersehbarer Aufbau' },
  { id: 'free-search', title: 'Freies Ausprobieren' },
] as const;

export const s05Content = {
  version: S05_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
      35,
    ] as const,
    revision: 'Userauftrag vom 2026-08-02 · animierte Bausteinannotation',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-bausteinannotation-und-strategiebrücke-2-august-2026',
  },
  segment: {
    id: 'S05',
    sectionId: 'passwords',
    slice: 'complete-design-lab-only',
  },
  trainingAriaLabel: 'PassWo Training, Segment S05, Passwortwege verstehen',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S05, Passwortwege',
    address: 'campus.example/passwortwege',
    tab: { id: 'analysis', label: 'Passwortwege', enabled: true },
  },
  page: {
    title: 'Wie der Angreifer dein Passwort rät',
    fixtureNotice:
      'Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.',
    start: 'Animation starten',
    replay: 'Animation wiederholen',
    continue: 'Weiter',
  },
  intro: {
    campusgramPassword: {
      accessibleLabel: 'Campusgram – Passwort',
      visibleSuffix: '– Passwort',
    },
    candidateFailure: 'passt nicht',
    generatedPassword: 'rQ7mL2vX9pK4',
    memorablePassword: 'MeinStarkesUniPasswort2005!',
    memorablePasswordParts: ['Mein', 'Starkes', 'Uni', 'Passwort', '2005', '!'],
    strategyAnnotations: {
      sentenceStructure: 'Satzbau',
      probability: 'Wahrscheinlichkeit ↑',
      personalDetail: 'Persönliche Angaben',
      typicalEnding: 'Typische Endung',
    },
    strategies: s05StrategyCards,
    narration: {
      candidateCheck: [
        'Für den Angreifer ist das Passwort verdeckt. Sein Programm muss mögliche Passwörter erzeugen und prüfen, ob eines davon passt.',
      ],
      randomSequence: [
        'Völlig zufällige Folgen von Zeichen sind aber enorm schwierig für Menschen zu merken. Deswegen nutzen die meisten eine merkbare Kombination.',
      ],
      recognizableCombination: [
        'Bei diesem Passwort erkennt deine eigene Intuition wahrscheinlich schon einen Aufbau.',
      ],
      buildingBlocks: [
        'Vereinfacht kannst du dir Passwörter wie mehrere aneinandergesetzte Bausteine vorstellen.',
      ],
      strategyTargeting: [
        'Angreifer kennen diese Bausteine noch nicht.',
        'Einige Passwortteile sind aber wahrscheinlicher als andere, da Menschen oft naheliegende Bestandteile verwenden oder ihr Passwort vorhersehbar aufbauen, um es sich leichter zu merken.',
      ],
      strategyOverview: [
        'Und dieses Wissen nutzen Angreifer aus. Wir schauen uns nun drei Strategien an, die Angreifer miteinander kombinieren, um dein Campusgram-Passwort herauszufinden. Als ersten Ausgangspunkt beginnen Angreifer mit Dingen, die bei vielen Menschen schon funktioniert haben.',
      ],
    },
  },
  componentDemonstrations: [
    {
      id: 'common-components',
      title: 'Häufige Kerne',
      examples: ['passwort', 'qwertz', '123456789', '2026', 'sommer', 'admin'],
      note: 'Beispiele für häufig verwendete Bestandteile.',
    },
    {
      id: 'personal-examples',
      title: 'Persönliche Angaben',
      examples: ['Luna', 'BVB', 'Hochzeit2005'],
      note: 'Diese Beispiele stammen nicht aus persönlichen Angaben.',
    },
    {
      id: 'account-context',
      title: 'Konto-Kontext',
      examples: ['Campus', 'Campusgram', 'Prüfung', 'Semester', 'Archiv'],
      note: 'Begriffe, die zum fiktiven Konto passen können.',
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
  } satisfies Readonly<Record<PasswordSingleFindingKind, string>>,
  result: {
    title: 'Was die Übung erkennt',
    boundedNotice: 'Die markierten Stellen zeigen, wo ein Angreifer früh ansetzen könnte.',
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
          'Das Beispiel zeigt einen möglichen Zusammenhang. Es leitet keine Bedeutung aus dem fiktiven Passwort ab.',
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
        boundaryNote: 'Das Beispiel prüft nicht, ob das fiktive Passwort eine Satzstruktur hat.',
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
          'Die Übung markiert nur ausreichend lange, exakt wiederholte Bestandteile.',
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
          'Die Übung nutzt nur festgelegte Begriffe zum fiktiven Konto.',
      },
    ] as const satisfies readonly AuthoredStructureDemonstration[],
    findingLabels: {
      'exact-component-repetition': 'exakte Wiederholung eines Bestandteils',
      'account-context-with-qualifier':
        'Konto- oder Kontextbegriff mit Jahr, Zahlenfolge oder Anhang',
      'number-marker-with-typical-suffix': 'erkannter Zahlenmarker mit typischem Anhang',
      'no-simple-structure-recognized': 'kein einfacher Zusammenhang erkannt',
    } satisfies Readonly<Record<RuntimeStructureFindingKind, string>>,
    application: {
      title: 'Anwendung auf das fiktive Passwort',
      recognizedExplanation:
        'Markiert sind nur konkret erkannte Stellen. Die Übung zeigt höchstens zwei Wege zugleich.',
      noneExplanation:
        'Die Übung hat hier keinen einfachen Zusammenhang erkannt. Das bedeutet nicht, dass das Passwort zufällig, stark oder sicher ist.',
      boundedNotice: 'Die Markierungen zeigen konkrete Zusammenhänge im fiktiven Passwort.',
    },
  },
  freeSearch: {
    transition: {
      title: 'Freies Ausprobieren',
      explanation:
        'Bekannte Bestandteile und vorhersehbare Zusammenhänge geben einfachere Wege. Für dadurch nicht erklärte Bereiche bleibt freies Ausprobieren.',
    },
    sameLength: {
      title: 'Gleiche Länge, unterschiedliche Arbeit',
      predictable: {
        password: 'CampusBoard2026',
        parts: ['CampusBoard', '2026'],
        label: 'Dienstname und Jahreszahl',
      },
      independentlyRandom: {
        password: 'ruevokdampzqitl',
        parts: ['r', 'u', 'e', 'v', 'o', 'k', 'd', 'a', 'm', 'p', 'z', 'q', 'i', 't', 'l'],
        label: '15 unabhängig zufällig erzeugte Kleinbuchstaben',
      },
      explanation:
        'Beide Beispiele haben 15 Zeichen. Länge schützt vor freiem Ausprobieren, gleicht einen bekannten Aufbau aber nicht automatisch aus.',
    },
    estimate: {
      title: 'Deine Schätzung',
      explanation:
        'Wir betrachten absichtlich nur den Längeneffekt: Jede Stelle wird unabhängig zufällig aus 26 Kleinbuchstaben gewählt.',
      question:
        'Ab welcher Länge wird das vollständige Durchprobieren für einen sehr schnellen Angreifer zu aufwendig?',
      options: [8, 9, 10, 11, 12, 13, 14, 15, 16] as const,
      overflowLabel: '16+',
      confirm: 'Schätzung bestätigen',
      confirmed: 'Schätzung bestätigt. Sie bleibt in dieser Übung.',
    },
    theoreticalModel: {
      title: 'Angreifer-Uhr',
      assumptions: [
        'Jede Stelle unabhängig und zufällig ausgewählt',
        'Festgelegter Zeichenvorrat',
        'Vollständiges Durchprobieren',
        'Eine Billion Versuche pro Sekunde',
      ],
      boundary: 'Die Uhr vergleicht nur die gezeigten Zeichenfolgen.',
      lowercaseMeasurements: [
        { length: 8, durationLabel: 'unter einer Sekunde' },
        { length: 12, durationLabel: 'ungefähr ein Tag' },
        { length: 14, durationLabel: 'ungefähr zwei Jahre' },
        { length: 15, durationLabel: 'ungefähr 53 Jahre' },
        { length: 16, durationLabel: 'mehr als 1.000 Jahre' },
      ],
      lowercaseExplanation:
        'Für selbst erstellte Passwörter gilt deshalb: mindestens 15 Zeichen. Zahlen oder Sonderzeichen sind dafür keine Pflicht.',
    },
    generatedCharacters: {
      title: 'Zufällig erzeugt — nicht nur gemischt',
      example: 'rQ7!m2vX9?pK',
      alphabetParts: ['26 Kleinbuchstaben', '26 Großbuchstaben', '10 Ziffern', '10 Sonderzeichen'],
      durationLabel: 'ungefähr 615 Jahre',
      explanation:
        'Zwölf unabhängig aus 72 Zeichen gezogene Stellen haben hier einen größeren theoretischen Suchraum als 15 zufällige Kleinbuchstaben.',
    },
    predictableMix: {
      title: 'Zeichenmix als vorhersehbare Veränderung',
      password: 'Passwort123!',
      parts: ['passwort', '123', '!'],
      labels: ['bekannter Kern', 'Zahlenfolge', 'typischer Anhang'],
      explanation:
        'Alle Zeichenarten sind vorhanden, aber nicht unabhängig gewählt. Der bekannte Kern kann gemeinsam mit Zahlenfolge und Anhang getestet werden.',
    },
    chosenWords: {
      title: 'Selbst gewählte Wörter',
      examples: ['Datensicherheit', 'DatensicherheitFantasie'],
      explanation:
        'Mehr Länge hilft. Ein oder zwei selbst ausgewählte Wörter sind aber nicht dasselbe wie viele unabhängig zufällig ausgewählte Wörter.',
    },
    authoredWords: {
      title: 'Sechs unabhängig gezogene Beispielwörter',
      words: ['Kaktus', 'Fenster', 'Regen', 'Komet', 'Lampe', 'Knochen'],
      joined: 'Kaktus-Fenster-Regen-Komet-Lampe-Knochen',
      badge: 'Beispiel für zufällig ausgewählte Wörter',
      explanation:
        'Die Stärke stammt aus der unabhängigen zufälligen Auswahl. Einzelne Wörter müssen nicht selten sein.',
      hyphenNote: 'Bindestriche unterstützen die Lesbarkeit. Sie erzeugen nicht die Stärke.',
      outlook: 'Den echten Wortgenerator und die Methode üben wir erst in S08.',
    },
    application: {
      title: 'Was die Übung beim fiktiven Passwort zeigt',
      visibleLength: 'Sichtbare Länge',
      componentFindings: 'Erkannte Bestandteile',
      structureFindings: 'Erkannte Zusammenhänge',
      unexplainedAreas: 'Bereiche ohne erkannte einfachere Erklärung',
      noUnexplainedArea: 'Kein weiterer Bereich',
      boundary: 'Die Übersicht zeigt keine Zeitprognose und kein einzelnes Gesamturteil.',
      dispositionLabels: {
        'very-short-string': 'konkreter Weg: sehr kurze Zeichenfolge',
        'common-password-core-with-typical-change':
          'konkreter Weg: häufiger Passwortkern mit typischer Veränderung',
        'account-context-with-predictable-qualifier':
          'konkreter Weg: Konto- oder Kontextbegriff mit vorhersehbarem Jahr oder Anhang',
        'clearly-repeated-explainable-structure':
          'konkreter Weg: klar wiederholter, leicht erklärbarer Aufbau',
      } satisfies Readonly<Record<SimulationQuickPathRuleId, string>>,
      noQuickPath: 'Mit den gezeigten Prüfwegen wurde kein schnellerer Weg erkannt.',
      noQuickPathBoundary: 'Das bedeutet nicht stark, sicher, zufällig oder unangreifbar.',
    },
  },
  summary: {
    title: 'Drei gleichrangige Blickwinkel',
    intro:
      'Schaue ein Passwort nicht nur wie eine Checkliste aus Länge, Zahlen und Sonderzeichen an.',
    cards: [
      {
        ...s05StrategyCards[0],
        body: 'Kein bekannter, persönlicher oder konto-bezogener Kern.',
      },
      {
        ...s05StrategyCards[1],
        body: 'Kein leicht vorhersehbarer Aufbau.',
      },
      {
        ...s05StrategyCards[2],
        body: 'Mindestens 15 Zeichen für selbst erstellte Passwörter.',
      },
    ],
    generatedNote:
      'Systemseitig zufällig erzeugte Zeichenfolgen werden nach ihrem Erzeugungsprozess eingeordnet, nicht nach Zeichenarten-Häkchen.',
    noScore: 'Die drei Blickwinkel ergänzen einander. Sie werden nicht zu einem einzelnen Urteil verrechnet.',
  },
  fixtures: [
    {
      id: 'common-suffix',
      routeId: 's05-common-suffix',
      label: 'Häufiger Kern plus typischer Anhang',
      fictionalPassword: 'Passwort123!',
      analysisContext: { accountTerms: [] },
    },
    {
      id: 'account-year',
      routeId: 's05-account-year',
      label: 'Campusgram-Begriff plus Jahreszahl',
      fictionalPassword: 'Campusgram2026',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      id: 'no-simple-component',
      routeId: 's05-no-simple-component',
      label: 'Kein einfacher Bestandteil erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      id: 'structure-repetition',
      routeId: 's05-structure-repetition',
      label: 'Wiederholter Bestandteil',
      fictionalPassword: 'KaffeeKaffeeKaffee7',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      id: 'structure-context',
      routeId: 's05-structure-context',
      label: 'Campusgram-Kontext plus Jahr und Anhang',
      fictionalPassword: 'Campusgram2026!',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
    {
      id: 'structure-none',
      routeId: 's05-structure-none',
      label: 'Kein einfacher Zusammenhang erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      analysisContext: { accountTerms: ['Campusgram'] },
    },
  ] as const satisfies readonly S05DesignLabFixture[],
  animations: [
    ['s05-candidate-check', 'attacker-attempt', 'info'],
    ['s05-random-sequence', 'random-sequence', 'info'],
    ['s05-recognizable-combination', 'recognizable-password', 'info'],
    ['s05-building-blocks', 'building-blocks', 'info'],
    ['s05-strategy-targeting', 'strategy-targeting', 'info'],
    ['s05-strategy-overview', 'strategy-overview', 'info'],
    ['s05-component-analysis', 'strategy-components-focus', 'warning'],
    ['s05-structure-theme', 'structure-theme', 'info'],
    ['s05-structure-sentence', 'structure-sentence', 'info'],
    ['s05-structure-repetition', 'structure-repetition', 'warning'],
    ['s05-structure-context', 'structure-context', 'warning'],
    ['s05-structure-application', 'structure-application', 'warning'],
    ['s05-free-search-transition', 'free-search-transition', 'info'],
    ['s05-same-length', 'same-length', 'info'],
    ['s05-estimate', 'estimate', 'info'],
    ['s05-lowercase-clock', 'lowercase-clock', 'info'],
    ['s05-generated-characters', 'generated-characters', 'info'],
    ['s05-predictable-mix', 'predictable-mix', 'warning'],
    ['s05-chosen-words', 'chosen-words', 'warning'],
    ['s05-authored-words', 'authored-words', 'info'],
    ['s05-free-search-application', 'free-search-application', 'warning'],
    ['s05-summary-components', 'summary-components', 'info'],
    ['s05-summary-structure', 'summary-structure', 'info'],
    ['s05-summary-free-search', 'summary-free-search', 'info'],
    ['s05-summary-memory', 'summary-memory', 'info'],
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
  const authored = s05Content.animations.find(([id]) => id === animationId);
  if (authored === undefined) return undefined;
  const [id, targetId, emphasis] = authored;
  return {
    id,
    steps: [{ type: 'highlight' as const, targetId, emphasis, durationMs: 520 }],
    reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
    maxDurationMs: 520,
  };
}
