import type {
  AuthoredStructureDemonstration,
  DesignLabScenarioId,
  PasswordSemanticReflectionSelection,
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
  SimulationQuickPathRuleId,
} from '@passwo/contracts';

export type S05DesignLabFixtureId =
  | 'common-suffix'
  | 'all-categories'
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
  readonly startSection: 'intro' | 'components' | 'structure';
}

export const S05_CONTENT_VERSION = '2.16.0';

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
    revision:
      'Userauftrag vom 2026-08-03 · Gemeinsame Bausteinprüfung und verbindende Veränderungsebene',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-gemeinsame-bausteinprüfung-und-verbindende-veränderungsebene-3-august-2026',
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
  analysis: {
    authoredAccountTerms: [
      'Campusgram',
      'Campus',
      'Nachrichten',
      'Gruppen',
      'Kontakte',
      'Beiträge',
    ] as const,
  },
  page: {
    introTitle: 'Wie der Angreifer dein Passwort rät',
    title: 'Naheliegende Bestandteile',
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
      probability: 'sehr häufig',
      personalDetail: 'Persönliche Angaben',
      typicalEnding: 'Typische Endung',
    },
    strategies: s05StrategyCards,
    componentFrames: [
      { partLengths: [4, 8, 3] },
      { partLengths: [2, 6, 4, 9, 3, 5, 7] },
      { partLengths: [10, 3, 6, 4] },
      { partLengths: [5, 3, 8, 4, 6] },
      { partLengths: [2, 7, 3, 5, 9, 4, 6, 3] },
      { partLengths: [11, 4, 7] },
      { partLengths: [3, 8, 5, 2, 7, 4] },
      { partLengths: [6, 3, 9, 5] },
    ] as const,
    fixedCommonPasswordFrame: {
      parts: ['•••••', '123456789', '••••'] as const,
      highlightedIndex: 1,
    },
    componentLeadIn: {
      changingBlocksAria:
        'Wechselnde Folge aus drei bis acht unterschiedlich langen verdeckten blauen Bestandteilen.',
      fixedBlockAria:
        'Dreiteiliges Passwort: verdeckter Bestandteil, hervorgehobener häufig gewählter Bestandteil 123456789, verdeckter Bestandteil.',
    },
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
      componentStartQuestion: [
        'Die Strategie beginnt mit der Frage: Bei welchen Bestandteilen soll der Angreifer anfangen?',
      ],
      componentFrequency: [
        'Er könnte alle Zeichenfolgen, Wörter und Begriffe der Welt ausprobieren. Aber nicht alle Bestandteile werden in Passwörtern gleich häufig verwendet.',
      ],
      componentCategoryOverview: [
        'Bestimmte Bestandteile – und sehr häufige vollständige Passwörter wie „123456789“ – kann er früh abgleichen.',
        'Somit kommen wir zur ersten von drei Arten naheliegender Bestandteile: Häufig gewählte Bestandteile.',
      ],
    },
  },
  componentStrategy: {
    title: 'Naheliegende Bestandteile',
    categories: [
      { id: 'common-components', title: 'Häufig gewählte Bestandteile' },
      { id: 'personal-details', title: 'Persönliche Angaben' },
      { id: 'account-context', title: 'Kontobezug' },
      { id: 'typical-changes', title: 'Typische Veränderungen' },
    ] as const,
    statusLabels: {
      pending: 'noch nicht geprüft',
      current: 'aktuell',
      'checked-none': 'geprüft, kein Hinweis erkannt',
      'checked-findings': 'geprüft, Befund vorhanden',
    },
    moreFindings: '+ weitere',
    presentation: {
      categoriesAriaLabel:
        'Drei Arten naheliegender Bestandteile und die querschnittliche Prüfung typischer Veränderungen',
      crossCuttingLabel: 'betrifft alle drei Arten',
      highlightFindings: 'Befunde hervorheben',
      showAllCategories: 'Alle Kategorien zeigen',
      canonicalAriaLabel: 'Stabile Bausteinansicht des fiktiven Passworts',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort verbergen',
      blockLabel: 'Baustein',
      hiddenBlockLabel: 'Zeichen verborgen',
      changesAriaLabel: 'Gebundene typische Veränderungen',
      boundToComponent: 'an den markierten Grundbestandteil gebunden',
      boundToPassword: 'an die Zeichenfolge angehängt',
      findingChips: {
        commonComponent: 'verbreiteter Passwortbestandteil',
        keyboardSequence: 'Tastaturfolge',
        year: 'Jahreszahl',
        date: 'Datumsfolge',
        numberSequence: 'Zahlenfolge',
        characterSequence: 'Zeichenfolge',
        personalComponent: 'persönlich eingeordneter Bestandteil',
        replacement: '[Quelle] → [Ziel]',
        replacementDescription: 'das Zeichen „[Quelle]“ durch „[Ziel]“ ersetzt',
        changedCapitalization: 'veränderte Großschreibung',
        changedCapitalizationDescription: 'die Großschreibung verändert',
        genericChange: 'typische Zeichenveränderung',
        genericChangeDescription: 'eine typische Zeichenveränderung erkannt',
        appendedYear: 'Jahreszahl „[Wert]“ angehängt',
        appendedYearDescription: 'die Jahreszahl „[Wert]“ angehängt',
        appendedNumberSequence: 'Zahlenfolge „[Wert]“ angehängt',
        appendedNumberSequenceDescription: 'die Zahlenfolge „[Wert]“ angehängt',
        appendedSymbol: 'Symbol „[Wert]“ angehängt',
        appendedSymbolDescription: 'das Symbol „[Wert]“ angehängt',
      },
    },
    commonComponents: {
      explanation: [
        'Angreifer beginnen häufig mit Passwörtern und Bestandteilen, die viele Menschen bereits verwendet haben.',
        'Dazu gehören verbreitete Passwörter, Tastatur- und Zahlenfolgen sowie naheliegende Jahreszahlen.',
        'Wörter sind nicht grundsätzlich ungeeignet. Ein häufig gewähltes Wort kann einem Angreifer aber einen naheliegenden Bestandteil liefern. Ob daraus ein einfacher Weg für die gesamte Zeichenfolge entsteht, prüfen wir erst später.',
        'Dabei testen Angreifer auch typische Veränderungen, etwa Großschreibung, ersetzte Zeichen sowie angehängte Zahlen oder Symbole.',
        'Prüfen wir nun dein gewähltes Passwort auf häufig gewählte Bestandteile.',
      ],
      machine: {
        ariaLabel:
          'Laufbandmaschine mit häufig gewählten Bestandteilen und daraus abgeleiteten typischen Veränderungen',
        inputLabel: 'Häufig gewählte Bestandteile',
        machineLabel: 'Varianten',
        outputLabel: 'Typische Veränderungen',
        examples: [
          { base: 'passwort', variants: ['Passwort', 'p4sswort', 'passwort1', 'passwort!'] },
          {
            base: '123456789',
            variants: ['123456789!', '1234567891', '123456789?'],
          },
          { base: 'admin', variants: ['Admin', '4dmin', 'admin1', 'admin!'] },
        ] as const,
      },
      check: 'Passwort prüfen',
      results: {
        none: [
          'Hier wurde kein häufig gewählter Bestandteil erkannt.',
          'Das entscheidet noch nicht über die gesamte Zeichenfolge.',
        ],
        one: [
          'In deinem Passwort wurde ein häufig gewählter Bestandteil erkannt.',
          'Dieser Bestandteil kann einem Angreifer einen Ausgangspunkt geben. Er entscheidet aber noch nicht über die gesamte Zeichenfolge.',
        ],
        many: [
          'In deinem Passwort wurden mehrere häufig gewählte Bestandteile erkannt.',
          'Diese Bestandteile können einem Angreifer Ausgangspunkte geben. Wie sie zusammenwirken, prüfen wir erst später.',
        ],
        complete: [
          'Hier besteht die gesamte Zeichenfolge aus einem häufig gewählten Passwort.',
          'Ein Angreifer kann diesen vollständigen Kandidaten früh ausprobieren.',
        ],
      },
      transition:
        'Als Nächstes schauen wir, ob Bestandteile für dich eine persönliche Bedeutung haben.',
    },
    personalDetails: {
      explanation: [
        'Persönliche Angaben können leicht zu merken sein und wirken oft geheim, weil sie für dich eine besondere Bedeutung haben.',
        'Bei gezielten Angriffen können Namen, Geburtstage, Vereine oder andere persönliche Angaben aber manchmal aus öffentlichen Profilen, früheren Datenlecks oder dem Umfeld ableitbar sein.',
        'Ordne nun ein, ob einer der Bausteine deiner fiktiven Passwortidee persönlich gemeint war. Du musst nicht angeben, worauf er sich bezieht.',
      ],
      begin: 'Bausteine einordnen',
      question: 'Welche Bausteine waren persönlich gemeint?',
      groupSelection: 'Ausgewählte Bausteine gemeinsam einordnen.',
      privacyNote:
        'Die Auswahl bleibt nur in dieser laufenden Übung und wird nicht als Forschungsangabe gespeichert oder exportiert.',
      none: 'Kein Bestandteil war persönlich gemeint.',
      unsure: 'Unsicher.',
      apply: 'Einordnung übernehmen',
      results: {
        one: 'Du hast diesen Bestandteil als persönlich gemeint eingeordnet.',
        many: 'Du hast mehrere Bestandteile als persönlich gemeint eingeordnet.',
        none: 'Du hast keinen Bestandteil als persönliche Angabe eingeordnet.',
        unsure: 'Hier bleibt offen, ob ein Bestandteil eine persönliche Bedeutung hat.',
        boundary:
          'Solche Angaben können für einen gezielten Angreifer manchmal ableitbar sein. Sie entscheiden aber noch nicht über die gesamte Zeichenfolge.',
      },
      transition: 'Als Nächstes prüfen wir, ob Begriffe direkt zum Konto passen.',
    },
    accountContext: {
      explanation: [
        'Auch das Konto selbst kann Ideen für ein Passwort liefern.',
        'Bei Campusgram wären zum Beispiel Begriffe wie Campus, Nachricht, Gruppe oder der Dienstname naheliegend.',
        'Ein solcher Begriff entscheidet nicht allein über die gesamte Zeichenfolge. Er ist aber ein Bestandteil, den ein Angreifer früh berücksichtigen kann.',
        'Prüfen wir nun dein Passwort auf einen möglichen Kontobezug.',
      ],
      check: 'Im Passwort prüfen',
      results: {
        none: [
          'Hier wurde kein direkter Bezug zu Campusgram erkannt.',
          'Das entscheidet noch nicht über die gesamte Zeichenfolge.',
        ],
        one: [
          'In deinem Passwort wurde ein Begriff erkannt, der zu Campusgram passt.',
          'Solche Begriffe kann ein Angreifer aus dem Kontokontext ableiten und gezielt ausprobieren.',
        ],
        many: [
          'In deinem Passwort wurden mehrere Begriffe erkannt, die zum Konto passen.',
          'Solche Begriffe kann ein Angreifer aus dem Kontokontext ableiten und gezielt ausprobieren.',
        ],
      },
      transition:
        'Zum Schluss schauen wir, ob Bestandteile oder die gesamte Zeichenfolge typisch verändert wurden.',
    },
    typicalChanges: {
      explanation: [
        'Viele Menschen verändern Bestandteile, damit das Passwort weniger vorhersehbar wirkt.',
        'Dabei testen Angreifer auch typische Veränderungen, etwa Großschreibung, ersetzte Zeichen sowie angehängte Zahlen oder Symbole.',
        'Eine solche Veränderung macht aus einem naheliegenden Bestandteil nicht automatisch eine völlig neue Idee.',
        'Prüfen wir nun, ob solche Veränderungen in deinem Passwort vorkommen.',
      ],
      check: 'Veränderungen prüfen',
      results: {
        none: [
          'Hier wurde keine der geprüften typischen Veränderungen erkannt.',
          'Das entscheidet noch nicht über die gesamte Zeichenfolge.',
        ],
        found: 'In deinem Passwort wurden typische Veränderungen erkannt.',
        dynamicPrefix: 'Dabei wurden',
        dynamicSuffix: '.',
        suffix: 'Solche Varianten werden von Angreifern häufig mitgeprüft.',
        overflow: 'weitere typische Veränderung',
        overflowDescription: 'eine weitere typische Veränderung zusammengefasst',
      },
    },
    summary: {
      title: 'Naheliegende Bestandteile',
      found:
        'Bei der Prüfung wurden naheliegende Bestandteile in [Kategorienamen] erkannt.',
      foundChanges: 'Zusätzlich wurden typische Veränderungen erkannt.',
      foundBoundary:
        'Diese Hinweise können einem Angreifer Ausgangspunkte geben. Sie entscheiden aber noch nicht, wie aufwendig die gesamte Zeichenfolge zu erraten ist.',
      foundTransition:
        'Als Nächstes betrachten wir, wie die Bestandteile miteinander zusammenhängen.',
      none: 'In den drei Arten wurde kein naheliegender Bestandteil erkannt.',
      noneTransition:
        'Das entscheidet noch nicht über die gesamte Zeichenfolge. Als Nächstes betrachten wir ihren Aufbau.',
      continue: 'Weiter zum Aufbau',
    },
  },
  findingLabels: {
    'common-password-core': 'verbreiteter Passwortbestandteil',
    'common-word': 'verbreiteter Passwortbestandteil',
    'common-name': 'verbreiteter Passwortbestandteil',
    'keyboard-pattern': 'Tastaturmuster',
    year: 'Jahreszahl',
    date: 'Datumsmuster',
    'simple-character-sequence': 'einfache Zeichenfolge',
    'predictable-word-sequence': 'bekannte Wortfolge',
    'repeated-component': 'wiederholter Bestandteil',
    'account-or-service-term': 'Konto- oder Dienstbegriff',
    'typical-transformation': 'typische Veränderung',
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
      'recognized-repetition-pattern': 'erkanntes Wiederholungsmuster',
      'predictable-component-sequence': 'vorhersehbare Folge von Bestandteilen',
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
      reflection: {
        title: 'Deine lokale Einordnung',
        question: 'Trifft etwas davon auf deine fiktive Passwortidee zu?',
        privacyNote:
          'Du musst nicht angeben, um welche Information es geht. Die Auswahl bleibt nur in der laufenden Übung und verändert nicht die Simulationsentscheidung.',
        options: {
          'personal-meaning': 'Mindestens ein Bestandteil war als persönliche Angabe gedacht.',
          'shared-theme': 'Mehrere Bestandteile gehören für mich zu demselben Thema.',
          'sentence-or-familiar-phrase':
            'Mehrere Bestandteile bilden einen Satz oder eine vertraute Formulierung.',
          'none-or-unsure': 'Nichts davon oder unsicher.',
        } satisfies Readonly<Record<PasswordSemanticReflectionSelection, string>>,
        confirm: 'Einordnung bestätigen',
        confirmed: 'Für diese Übung bestätigt',
      },
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
      boundary: 'Die Übersicht zeigt keine Crack-Zeit und keine Sicherheitsgarantie.',
      dispositionLabels: {
        'bounded-complete-guess-path':
          'Die erkannten Hinweise ergeben zusammen einen entsprechend kurzen vollständigen Prüfweg.',
      } satisfies Readonly<Record<SimulationQuickPathRuleId, string>>,
      noQuickPath:
        'Die erkannten Hinweise ergaben in dieser begrenzten Analyse keinen entsprechend kurzen vollständigen Prüfweg.',
      noQuickPathBoundary: 'Das bedeutet nicht stark, sicher, zufällig oder unangreifbar.',
      lengthOrientationLabels: {
        'below-15': 'unter der 15-Zeichen-Orientierung für selbst erstellte Passwörter',
        'at-least-15': 'mindestens 15 sichtbare Zeichen',
      },
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
    noScore:
      'Der Angreifer kombiniert die drei Blickwinkel zu vollständigen Kandidatenwegen. Die 15-Zeichen-Orientierung bleibt davon getrennt.',
  },
  fixtures: [
    {
      id: 'common-suffix',
      routeId: 's05-common-suffix',
      label: 'Häufig gewählter Bestandteil mit später offengelegten Veränderungen',
      fictionalPassword: 'Passw0rt123!',
      analysisContext: { accountTerms: [] },
      startSection: 'components',
    },
    {
      id: 'all-categories',
      routeId: 's05-all-categories',
      label: 'Alle vier Prüfungen mit lokaler persönlicher Einordnung',
      fictionalPassword: 'CampusgramPassw0rt123!',
      analysisContext: { accountTerms: ['Campusgram'] },
      startSection: 'components',
    },
    {
      id: 'account-year',
      routeId: 's05-account-year',
      label: 'Campusgram-Begriff plus Jahreszahl',
      fictionalPassword: 'Campusgram2026',
      analysisContext: { accountTerms: ['Campusgram'] },
      startSection: 'components',
    },
    {
      id: 'no-simple-component',
      routeId: 's05-no-simple-component',
      label: 'Kein einfacher Bestandteil erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      analysisContext: { accountTerms: ['Campusgram'] },
      startSection: 'components',
    },
    {
      id: 'structure-repetition',
      routeId: 's05-structure-repetition',
      label: 'Wiederholter Bestandteil',
      fictionalPassword: 'KaffeeKaffeeKaffee7',
      analysisContext: { accountTerms: ['Campusgram'] },
      startSection: 'structure',
    },
    {
      id: 'structure-context',
      routeId: 's05-structure-context',
      label: 'Campusgram-Kontext plus Jahr und Anhang',
      fictionalPassword: 'Campusgram2026!',
      analysisContext: { accountTerms: ['Campusgram'] },
      startSection: 'structure',
    },
    {
      id: 'structure-none',
      routeId: 's05-structure-none',
      label: 'Kein einfacher Zusammenhang erkannt',
      fictionalPassword: 'rQ7mL2vX9pK4',
      analysisContext: { accountTerms: ['Campusgram'] },
      startSection: 'structure',
    },
  ] as const satisfies readonly S05DesignLabFixture[],
  animations: [
    ['s05-candidate-check', 'attacker-attempt', 'info'],
    ['s05-random-sequence', 'random-sequence', 'info'],
    ['s05-recognizable-combination', 'recognizable-password', 'info'],
    ['s05-building-blocks', 'building-blocks', 'info'],
    ['s05-strategy-targeting', 'strategy-targeting', 'info'],
    ['s05-strategy-overview', 'strategy-overview', 'info'],
    ['s05-component-start-question', 'component-start', 'info'],
    ['s05-component-frequency', 'component-start', 'info'],
    ['s05-component-category-overview', 'component-start', 'info'],
    ['s05-common-components-start', 'component-conveyor', 'info'],
    ['s05-common-components-examples', 'component-conveyor', 'info'],
    ['s05-common-components-boundary', 'component-conveyor', 'info'],
    ['s05-common-components-changes', 'component-conveyor', 'info'],
    ['s05-common-components-intro', 'component-strategy', 'info'],
    ['s05-common-components-result', 'component-strategy', 'warning'],
    ['s05-personal-details-intro', 'component-strategy', 'info'],
    ['s05-personal-details-check', 'component-strategy', 'info'],
    ['s05-personal-details-result', 'component-strategy', 'warning'],
    ['s05-account-context-intro', 'component-strategy', 'info'],
    ['s05-account-context-result', 'component-strategy', 'warning'],
    ['s05-typical-changes-intro', 'component-strategy', 'info'],
    ['s05-typical-changes-result', 'component-strategy', 'warning'],
    ['s05-components-summary', 'component-strategy', 'info'],
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
