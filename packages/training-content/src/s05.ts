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

export const S05_CONTENT_VERSION = '2.24.0';

export const s05Content = {
  version: S05_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
      35,
    ] as const,
    revision:
      'Userauftrag vom 2026-08-04 · Einheitliche Kategorienleiste und gestufte Erklärungen',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-einheitliche-kategorienleiste-und-gestufte-erklärungen-4-august-2026',
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
    title: 'Häufig verwendete Passwörter und Zeichenfolgen',
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
    generatedPassword: 'rQ7mL2vX9pK4',
    memorablePassword: 'MeinStarkesUniPasswort2005!',
    memorablePasswordParts: ['Mein', 'Starkes', 'Uni', 'Passwort', '2005', '!'],
    strategyAnnotations: {
      sentenceStructure: 'Satzbau',
      probability: 'sehr häufig',
      personalDetail: 'Naheliegende Jahreszahl',
      typicalEnding: 'Typische Endung',
    },
    fixedCommonPasswordFrame: {
      parts: ['•••••', '123456789', '••••'] as const,
      highlightedIndex: 1,
    },
    componentLeadIn: {
      fixedBlockAria:
        'Dreiteiliges Passwort: verdeckter Bestandteil, hervorgehobene häufig verwendete Zahlenfolge 123456789, verdeckter Bestandteil.',
    },
    narration: {
      candidateCheck: [
        'Für den Angreifer ist dein Passwort verdeckt. Sein Programm erzeugt mögliche Passwörter und prüft, ob eines davon passt.',
        'Grundsätzlich könnte das Programm jede denkbare Zeichenfolge ausprobieren.',
      ],
      randomSequence: [
        'Zufällige Zeichenfolgen sind für Menschen jedoch schwer zu merken. Selbst gewählte Passwörter enthalten deshalb oft merkbare Elemente, wie Wörter, Zahlen oder Zeichenfolgen.',
      ],
      recognizableCombination: [
        'Wahrscheinlich erkennst du darin bereits einzelne Teile und Zusammenhänge.',
      ],
      buildingBlocks: [
        'Für die Erklärung betrachten wir diese Teile vereinfacht wie aneinandergesetzte Bausteine.',
      ],
      strategyTargeting: [
        'Der Angreifer kennt sie nicht. Bevor er alle Zeichen systematisch durchprobiert, kann er aber Passwortteile kombinieren, um dein Campusgram-Passwort zu erraten.',
      ],
      componentCategoryOverview: [
        'Als ersten Ausgangspunkt nutzt er, dass manche Passwörter und Zeichenfolgen besonders häufig verwendet werden.',
      ],
    },
  },
  componentStrategy: {
    title: 'Häufig verwendete Passwörter und Zeichenfolgen',
    categories: [
      { id: 'common-components', title: 'Häufig verwendete Passwörter und Zeichenfolgen' },
      { id: 'personal-details', title: 'Persönliche Angaben' },
      { id: 'account-context', title: 'Bezug zum Konto und Umfeld' },
      { id: 'typical-changes', title: 'Typische Veränderungen' },
    ] as const,
    statusLabels: {
      pending: 'noch nicht geprüft',
      current: 'wird geprüft',
      'checked-none': 'geprüft, kein Hinweis erkannt',
      'checked-findings': 'geprüft, Befund vorhanden',
    },
    moreFindings: '+ weitere',
    presentation: {
      categoriesAriaLabel:
        'Drei Arten von Passwortbestandteilen und die verbindende Prüfung typischer Veränderungen',
      canonicalAriaLabel: 'Stabile Bausteinansicht des fiktiven Passworts',
      blockLabel: 'Baustein',
      changesAriaLabel: 'Gebundene typische Veränderungen',
      boundToComponent: 'an den markierten Grundbestandteil gebunden',
      boundToPassword: 'an die Zeichenfolge angehängt',
      findingChips: {
        commonPassword: 'häufig verwendetes Passwort',
        commonWord: 'häufig verwendetes Wort',
        keyboardSequence: 'Tastaturfolge',
        numberSequence: 'Zahlenfolge',
        nearbyYear: 'naheliegende Jahreszahl',
        personalComponent: 'persönliche Angabe',
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
        'Dazu gehören häufig verwendete Passwörter und Wörter, einfache Tastatur- und Zahlenfolgen wie „123456“ oder „qwertz“ oder naheliegende Jahreszahlen.',
        'Ein Wort ist nicht grundsätzlich ungeeignet. Ein häufig verwendetes Wort wird jedoch früh getestet.',
        'Dabei testet der Angreifer nicht nur die ursprüngliche Schreibweise. Er rechnet auch mit typischen Veränderungen, etwa Großschreibung, Zeichenersetzungen sowie ergänzte Zahlen oder Symbole.\n\nUnd das sowohl bei einzelnen Bestandteilen als auch bei bereits zusammengesetzten Passwortkandidaten.',
        'Prüfen wir nun dein gewähltes Passwort auf häufig verwendete Passwörter und Zeichenfolgen.',
      ],
      machine: {
        ariaLabel:
          'Laufbandmaschine mit häufig verwendeten Passwörtern und Zeichenfolgen sowie typischen Veränderungen',
        generatorLabel: 'Typische Veränderungen generieren',
        conveyorBlocks: [
          'passwort',
          '123456789',
          'qwertz',
          'admin',
          'willkommen',
          '2005',
          'hallo',
          '111111',
          'sommer',
          'campus',
          'letmein',
          'abc123',
        ] as const,
      },
      check: 'Passwort prüfen',
      results: {
        none: [
          'Hier wurde kein früh geprüfter Bestandteil erkannt.',
          'Das entscheidet noch nicht über die gesamte Zeichenfolge.',
        ],
        foundOne: '[Teile] wurde durch die Prüfung erkannt.',
        foundMany: '[Teile] wurden durch die Prüfung erkannt.',
        boundary: 'Das kann dem Angreifer einen Ausgangspunkt geben.',
        complete:
          'Der Angreifer hätte hier schon dein Passwort gefunden. Wir schauen uns dennoch weiter an, wie der Angreifer vorgeht.',
      },
      transition:
        'Als Nächstes schauen wir, ob im Passwort persönliche Angaben enthalten sind.',
    },
    personalDetails: {
      opening: [
        'Persönliche Angaben können leicht zu merken sein und wirken oft geheim, weil sie für dich eine besondere Bedeutung haben.',
      ],
      derivation: [
        'Bei gezielten Angriffen können Namen, Geburtstage, Vereine oder andere persönliche Angaben aber manchmal aus öffentlichen Profilen, früheren Datenlecks oder dem Umfeld ableitbar sein.',
      ],
      explanation: [
        'Ein Angreifer könnte es wissen, aber dieses Trainingsmodul kann das nicht zuverlässig bestimmen. Bitte wähle deine persönlichen Angaben manuell aus.',
      ],
      machine: {
        conveyorBlocks: [
          'Name',
          'Geburtstag',
          'Verein',
          'Profil',
          'Umfeld',
          'Hochzeitstag',
          'Abschlussjahr',
        ] as const,
      },
      begin: 'Persönliche Angaben markieren',
      selectionLabel: 'Als persönliche Angabe markieren',
      privacyNote:
        'Die Auswahl bleibt nur in dieser laufenden Übung und wird nicht als Forschungsangabe gespeichert oder exportiert.',
      applyNone: 'Keine Persönliche Angabe',
      apply: 'Einordnung übernehmen',
      results: {
        selected: 'Du hast [Angaben] als persönliche Angabe eingeordnet.',
        none: 'Du hast keine persönliche Angabe eingeordnet.',
        boundary: 'Für den Angreifer ist das auch hier erst nur ein Ausgangspunkt.',
      },
      transition: 'Als Nächstes prüfen wir, ob Begriffe direkt zum Konto passen.',
    },
    accountContext: {
      machine: {
        conveyorBlocks: [
          'campusgram',
          'campus',
          'nachricht',
          'gruppe',
          'kontakte',
          'beitrag',
        ] as const,
      },
      opening: [
        'Der Bezug zum Konto und Umfeld kann dem Angreifer Ideen für dein Passwort liefern.',
        'Bei Campusgram wären zum Beispiel Begriffe wie Campus, Nachricht, Gruppe oder der Dienstname naheliegend.',
      ],
      explanation: [
        'Bei einem WLAN könnten es „WLAN“, „Router“ oder „Fritzbox“ sein.',
        'Prüfen wir deswegen nun dein Passwort auf einen möglichen Bezug zum Konto und Umfeld.',
      ],
      check: 'Im Passwort prüfen',
      results: {
        none: [
          'Hier wurde kein direkter Bezug zu Campusgram erkannt.',
          'Das entscheidet noch nicht über die gesamte Zeichenfolge.',
        ],
        foundOne:
          'In deinem Passwort wurde [Begriffe] als Begriff erkannt, der zu Campusgram passt.',
        foundMany:
          'In deinem Passwort wurden [Begriffe] als Begriffe erkannt, die zu Campusgram passen.',
        boundary:
          'Solche Begriffe kann ein Angreifer aus dem Kontokontext ableiten und gezielt ausprobieren.',
      },
      transition:
        'Zum Schluss schauen wir, ob die gesamte Zeichenfolge typisch verändert wurde.',
    },
    typicalChanges: {
      machine: {
        conveyorBlocks: [
          'passwort',
          'Passwort1',
          'p4sswort',
          'campus2005',
          'qwertz!',
          'admin123',
        ] as const,
      },
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
      title: 'Häufig verwendete Passwörter und Zeichenfolgen',
      found:
        'Bei der Prüfung wurden früh geprüfte Bestandteile in [Kategorienamen] erkannt.',
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
    'common-password-core': 'häufig verwendetes Passwort',
    'common-word': 'häufig verwendetes Wort',
    'common-name': 'häufig verwendetes Wort',
    'keyboard-pattern': 'Tastaturfolge',
    year: 'naheliegende Jahreszahl',
    date: 'naheliegende Jahreszahl',
    'simple-character-sequence': 'Zahlenfolge',
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
        id: 'components',
        title: 'Häufig verwendete Passwörter und Zeichenfolgen',
        body: 'Kein bekannter, persönlicher oder konto-bezogener Kern.',
      },
      {
        id: 'structure',
        title: 'Vorhersehbarer Aufbau',
        body: 'Kein leicht vorhersehbarer Aufbau.',
      },
      {
        id: 'free-search',
        title: 'Freies Ausprobieren',
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
      label: 'Häufig verwendeter Bestandteil mit später offengelegten Veränderungen',
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
    ['s05-component-category-overview', 'component-start', 'info'],
    ['s05-common-components-start', 'component-conveyor', 'info'],
    ['s05-common-components-examples', 'component-conveyor', 'info'],
    ['s05-common-components-changes', 'component-conveyor', 'info'],
    ['s05-common-components-intro', 'component-strategy', 'info'],
    ['s05-common-components-result', 'component-strategy', 'warning'],
    ['s05-personal-details-opening', 'component-conveyor', 'info'],
    ['s05-personal-details-derivation', 'component-conveyor', 'info'],
    ['s05-personal-details-intro', 'component-conveyor', 'info'],
    ['s05-personal-details-check', 'component-strategy', 'info'],
    ['s05-personal-details-result', 'component-strategy', 'warning'],
    ['s05-account-context-opening', 'component-conveyor', 'info'],
    ['s05-account-context-intro', 'component-conveyor', 'info'],
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
