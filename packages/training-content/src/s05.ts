import type {
  AuthoredStructureDemonstration,
  DesignLabScenarioId,
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
} from '@passwo/contracts';
import { accountContextTerms } from './account-context-terms.js';

const campusgramContextConveyorBlocks = [
  ...new Map(
    accountContextTerms.campusgram.map((term) => {
      const normalized = term.trim().normalize('NFKC').toLocaleLowerCase('de-DE');
      return [normalized, normalized] as const;
    }),
  ).values(),
];

const characterMixVariationStems = [
  'meinPasswort',
  'MeinPasswort',
  'MEINPasswort',
  'meinpasswort',
  'mEinPasswort',
  'meinPaSSwort',
  'meinPassw0rt',
  'me1nPasswort',
  'm3inPa55wort',
  'mEinPa55w0rt',
] as const;

const characterMixVariationSuffixes = [
  '',
  '1',
  '!',
  '?',
  '12',
  '123',
  '2026',
  '!1',
  '?1',
  '!?',
] as const;

const characterMixFinalVariation = 'mEin!Pa55w0rt?';

const germanWordPackageInformation =
  'Für diese vereinfachte Rechnung nehmen wir an, dass ein Sprachpaket etwa 80.000 Wörter enthält, die sich sinnvoll als merkbare Passwortwörter verwenden lassen. Der deutsche Duden enthält beispielsweise rund 151.000 Stichwörter, von denen wir hier nur einen Teil berücksichtigen.';

const characterMixVariations = [
  ...characterMixVariationStems.flatMap((stem) =>
    characterMixVariationSuffixes.map((suffix) => `${stem}${suffix}`),
  ).slice(0, 99),
  characterMixFinalVariation,
] as const;

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

export const S05_CONTENT_VERSION = '2.100.0';

export const s05Content = {
  version: S05_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
      35,
    ] as const,
    revision: 'Userauftrag vom 2026-08-17 · S05 Übungsentscheidung und Diagnosen gekürzt',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-übungsentscheidung-und-diagnosen-gekürzt-17-august-2026',
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
    authoredAccountTerms: accountContextTerms.campusgram,
  },
  page: {
    title: 'Häufig verwendete Passwörter und Zeichenfolgen',
    fixtureNotice:
      'Diese Simulation betrachtet nur das fiktive Passwort und ist keine allgemeine Sicherheitsbewertung.',
    continue: 'Weiter',
  },
  intro: {
    campusgramPassword: {
      accessibleLabel: 'Campusgram-Passwort',
      visibleSuffix: 'Campusgram-Passwort',
    },
    generatedPassword: 'rQ7mL2vX9pK4',
    memorablePassword: 'MeinStarkesUniPasswort2005!!!',
    memorablePasswordParts: ['Mein', 'Starkes', 'Uni', 'Passwort', '2005', '!!!'],
    strategyAnnotations: {
      relationship: 'Zusammenhängend',
      repetitionCount: 3,
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
        'Der Angreifer kann grundsätzlich jede denkbare Zeichenfolge ausprobieren.',
      ],
      randomSequence: [
        'Zufällige Zeichenfolgen sind jedoch schwer zu merken. Selbst gewählte Passwörter enthalten deshalb oft merkbare Elemente wie Wörter, Zahlen oder einfache Zeichenfolgen.',
      ],
      buildingBlocks: [
        "Du kannst dir diese Teile vereinfacht wie einzelne 'Bausteine' vorstellen.",
      ],
      strategyTargeting: [
        "Der Angreifer kann solche 'Bausteine' kombinieren und die daraus entstehenden Passwörter ausprobieren.",
      ],
      componentCategoryOverview: [
        'Dabei beginnt er mit Passwörtern und Zeichenfolgen, die besonders häufig verwendet werden.',
        'Bitte beachte: Das Modul kann Bestandteile übersehen oder falsch einordnen. Es dient nur zum Verständnis, nicht zur Sicherheitsbewertung.',
      ],
    },
  },
  componentStrategy: {
    title: 'Häufig verwendete Passwörter und Zeichenfolgen',
    categories: [
      { id: 'common-components', title: 'Häufig verwendete Passwörter und Zeichenfolgen' },
      { id: 'personal-details', title: 'Persönliche Angaben' },
      { id: 'account-context', title: 'Bezug zum Konto, Dienst oder Umfeld' },
    ] as const,
    statusLabels: {
      pending: 'noch nicht geprüft',
      current: 'wird geprüft',
      'checked-none': 'geprüft, kein Hinweis erkannt',
      'checked-findings': 'geprüft, Befund vorhanden',
    },
    moreFindings: '+ weitere',
    presentation: {
      categoriesAriaLabel: 'Drei Arten von Passwortbestandteilen',
      canonicalAriaLabel: 'Stabile Bausteinansicht des fiktiven Passworts',
      reviewCardTitle: 'Zusammenfassung',
      blockLabel: 'Baustein',
      findingChips: {
        commonPassword: 'häufig verwendetes Passwort',
        commonWord: 'häufig verwendetes Wort',
        keyboardSequence: 'Tastaturfolge',
        numberSequence: 'Zahlenfolge',
        nearbyYear: 'naheliegende Jahreszahl',
        personalComponent: 'Persönliche Angabe',
        containedFinding: '[Befund] enthalten',
        typicalVariant: 'typische Variante: [Details]',
        typicalEnding: 'typische Endung: +[Wert]',
      },
      findingCategories: {
        password: 'häufiges Passwort',
        word: 'häufiges Wort',
        keyboard: 'häufige Tastaturfolge',
        numberSequence: 'häufige Zahlenfolge',
        date: 'häufiges Datum',
        sequence: 'häufige Zeichenfolge',
      },
    },
    commonComponents: {
      explanation: [
        'Dazu gehören häufig verwendete Passwörter und Wörter, einfache Tastatur- und Zahlenfolgen wie „123456“ oder „qwertz“ oder naheliegende Jahreszahlen.',
        'Wörter sind nicht grundsätzlich unsicher. Geläufige Wörter, etwa aus Wörterbüchern, können Angreifer jedoch früh ausprobieren.',
        'Bei selbst gewählten Passwörtern kommen außerdem oft Veränderungen wie Großschreibung, Zeichenersetzungen, Zahlen oder Symbole vor. Auch solche typischen Varianten werden ausprobiert.',
        'Prüfen wir nun dein gewähltes Passwort auf häufig verwendete Passwörter und Zeichenfolgen.',
      ],
      machine: {
        ariaLabel:
          'Laufbandmaschine mit häufig verwendeten Passwörtern und Zeichenfolgen sowie typischen Varianten',
        generatorLabel: 'Typische Varianten generieren',
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
        none: ['Hier wurde kein früh geprüfter Bestandteil erkannt.'],
        foundOne: '[Teile] wird häufig verwendet.',
        foundMany: '[Teile] werden häufig verwendet.',
        completeSingleCandidate:
          'Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.',
        completeCombinedMatches:
          'Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.',
      },
    },
    personalDetails: {
      opening: [
        'Persönliche Angaben sind vertraut und meist leicht zu merken. Gerade weil sie persönlich sind, können sie schwer erratbar wirken.',
      ],
      derivation: [
        'Bei einem Datenleck können jedoch Kennungen wie Benutzername, E-Mail-Adresse oder Telefonnummer offengelegt werden.',
      ],
      examples: [
        'Angreifer können damit nach öffentlich verfügbaren Angaben wie Name, Geburtsdatum oder Interessen suchen und diese als mögliche Passwortbestandteile ausprobieren.',
      ],
      explanation: [
        'Deine Auswahl wird weder gespeichert noch exportiert. Markiere für den Selbstcheck mögliche persönliche Angaben im fiktiven Passwort.',
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
      selectionHint:
        'Wenn du eine persönliche Angabe erkennst, ziehe über die zugehörigen Zeichen, um sie zu markieren. Tippe auf eine Markierung, um sie wieder zu entfernen.',
      selectionStatus: {
        started: 'Auswahl gestartet. Wähle das letzte Zeichen des Bereichs.',
        added: 'Persönliche Angabe markiert.',
        removed: 'Markierung entfernt.',
        invalid: 'Dieser Bereich überschneidet sich mit einer bestehenden Markierung.',
        cancelled: 'Auswahl abgebrochen.',
      },
      applyNone: 'Keine persönliche Angabe',
      apply: 'Einordnung übernehmen',
      results: {
        selected: 'Du hast [Angaben] als persönliche Angabe eingeordnet.',
        none: 'Du hast keine persönliche Angabe eingeordnet.',
        completeSingleCandidate:
          'Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.',
        completeCombinedMatches:
          'Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.',
      },
    },
    accountContext: {
      machine: {
        conveyorBlocks: campusgramContextConveyorBlocks,
      },
      opening: [
        'Um sich leichter zu merken, welches Passwort zu welchem Konto gehört, werden oft Begriffe mit Bezug zum Konto, zum Dienst oder zu dessen Umfeld eingebaut. Solche Bezüge kann ein Angreifer gezielt mitprüfen.',
      ],
      explanation: [
        'Bei Campusgram wären das zum Beispiel der Benutzername, ‚Campus‘, ‚Nachricht‘ oder der Dienstname, bei einem WLAN-Passwort etwa ‚WLAN‘, ‚Router‘ oder ‚Fritzbox‘.',
        'Prüfen wir nun dein gewähltes Passwort auf einen möglichen Bezug zu Campusgram.',
      ],
      check: 'Im Passwort prüfen',
      results: {
        none: ['Hier wurde kein direkter Bezug zu Campusgram erkannt.'],
        foundOne:
          '[Begriffe] wurde in deinem Passwort als Begriff mit Bezug zu Campusgram erkannt.',
        foundMany:
          '[Begriffe] wurden in deinem Passwort als Begriffe mit Bezug zu Campusgram erkannt.',
        completeSingleCandidate:
          'Die gefundene Übereinstimmung deckt bereits die gesamte Zeichenfolge ab.',
        completeCombinedMatches:
          'Mehrere gefundene Übereinstimmungen decken gemeinsam die gesamte Zeichenfolge ab.',
      },
    },
    summary: {
      title: 'Häufig verwendete Passwörter und Zeichenfolgen',
      singleCandidateMatch:
        'Das Campusgram-Passwort wurde bei dieser Prüfung bereits gefunden. Die Simulation zeigt dennoch weitere typische Vorgehensweisen.',
      combinedMatches:
        'Mehrere frühe Übereinstimmungen decken zusammen das ganze Passwort ab. Erraten ist es dadurch noch nicht. Die Simulation zeigt noch weitere typische Vorgehensweisen.',
      partialMatches:
        'Bei den bisherigen Prüfungen wurden Teile des Passworts erkannt. Erraten ist es dadurch noch nicht. Die Simulation zeigt noch weitere typische Vorgehensweisen.',
      none: 'Bei den bisherigen Prüfungen wurde keine Übereinstimmung gefunden. Das bedeutet jedoch nicht, dass bereits alle Angriffsmöglichkeiten geprüft wurden.',
      nothingFound: 'Nichts gefunden',
      continue: 'Weiter',
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
    'typical-transformation': 'typische Variante',
    'typical-suffix': 'typischer Zahlen- oder Symbolanhang',
    'no-simple-component-recognized': 'kein einfacher Bestandteil erkannt',
  } satisfies Readonly<Record<PasswordSingleFindingKind, string>>,
  result: {
    title: 'Was die Übung erkennt',
    boundedNotice: 'Die markierten Stellen zeigen, wo ein Angreifer früh ansetzen könnte.',
  },
  structure: {
    intro: [
      'Angreifer prüfen nämlich nicht nur häufige Zeichenfolgen, persönliche Angaben oder Kontobezüge. Sie berücksichtigen auch typische Muster, mit denen solche Elemente zu leichter merkbaren Passwörtern kombiniert werden.',
    ],
    demonstrations: [
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-theme',
        relation: 'thematic-relation',
        title: 'Naheliegende Zusammenhänge',
        tokens: ['WLAN', 'W0hnzimmer', 'Familie', '5'],
        connectionLabel: 'inhaltlich verbundene Bestandteile',
        passWoExplanation:
          'Mehrere verschiedene Wörter können durch einen naheliegenden Zusammenhang vorhersehbar bleiben.',
        boundaryNote:
          'Das Beispiel zeigt einen möglichen Zusammenhang. Es leitet keine Bedeutung aus dem fiktiven Passwort ab.',
      },
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-sentence',
        relation: 'sentence-structure',
        title: 'Vorhersehbare Satz- und Phrasenstrukturen',
        tokens: ['Ohne', 'Kaffee', 'geht', 'nichts'],
        connectionLabel: 'sprachlich passende Folge',
        passWoExplanation:
          'Bekannte oder sprachlich naheliegende Formulierungen machen ihre Fortsetzung wahrscheinlicher.',
        boundaryNote: 'Das Beispiel prüft nicht, ob das fiktive Passwort eine Satzstruktur hat.',
      },
      {
        kind: 'authoredStructureDemonstration',
        id: 's05-structure-repetition',
        relation: 'exact-repetition',
        title: 'Wiederholungsmuster',
        tokens: ['1213', '1213', '1213', '1213'],
        connectionLabel: 'derselbe Bestandteil mehrfach',
        passWoExplanation:
          'Wiederholungen machen ein Passwort länger, ohne dass jeder Teil neu gewählt wurde.',
        boundaryNote:
          'Die Übung markiert nur ausreichend lange, exakt wiederholte Bestandteile.',
      },
    ] as const satisfies readonly AuthoredStructureDemonstration[],
    presentationExamples: {
      theme: {
        title: 'Naheliegende Zusammenhänge',
        rows: [
          ['WLAN', 'W0hnzimmer', 'Familie', '5'],
          ['Uni', 'Campus', 'Mensa', '2026'],
          ['Hochz3it', 'Schloss', '1995', '!!'],
        ],
      },
      sentence: {
        title: 'Vorhersehbare Satz- und Phrasenstrukturen',
        rows: [
          ['An', 'Tagen', 'wie', 'diesen'],
          ['Ohne', 'Kaffee', 'geht', 'nichts'],
          ['Home', 'Sweet', 'Home'],
        ],
      },
      repetition: {
        title: 'Wiederholungsmuster',
        rows: [
          ['1213', '1213', '1213', '1213'],
          ['F3rien#27', 'F3rien#27'],
          ['D7!kP2?', 'D7!kP2?'],
        ],
      },
    },
    narration: {
      theme: [
        'Auch verschiedene Wörter können zusammen vorhersehbar sein. „WLAN“, „Wohnzimmer“ und „Familie“ passen beispielsweise inhaltlich zusammen.',
        'Je naheliegender der Zusammenhang, desto besser kann der Angreifer einschätzen, welche Kombinationen sich zuerst zu testen lohnen.',
      ],
      sentence: [
        'Auch bekannte oder sprachlich naheliegende Formulierungen machen Bestandteile vorhersagbarer.',
        'Nach „Ohne Kaffee geht“ liegt etwa „nichts“ als Fortsetzung nahe. Solche Muster kommen zum Beispiel bei Redewendungen, Liedzeilen oder anderen geläufigen Formulierungen vor.',
      ],
      repetition: [
        'Auch Wiederholungen können ein Passwort länger wirken lassen, obwohl sich Teile nur wiederholen.',
        'Erkennt oder vermutet ein Angreifer den wiederholten Grundbaustein, kann er gezielt solche Wiederholungsmuster prüfen.',
      ],
    },
    findingLabels: {
      'exact-component-repetition': 'exakte Wiederholung eines Bestandteils',
      'recognized-repetition-pattern': 'erkanntes Wiederholungsmuster',
      'predictable-component-sequence': 'vorhersehbare Folge von Bestandteilen',
      'account-context-with-qualifier':
        'Konto- oder Kontextbegriff mit Jahr, Zahlenfolge oder Anhang',
      'number-marker-with-typical-suffix': 'erkannter Zahlenmarker mit typischem Anhang',
      'no-simple-structure-recognized': 'kein einfacher Zusammenhang erkannt',
    } satisfies Readonly<Record<RuntimeStructureFindingKind, string>>,
    reflection: {
      themeQuestion: 'Welche Teile gehören für dich inhaltlich zusammen?',
      sentenceQuestion: 'Welche Teile bilden für dich eine Satz- oder Phrasenstruktur?',
      groupLabel: 'Gruppe',
      newGroup: 'Neue Gruppe',
      deleteGroup: 'Löschen',
      finish: 'Fertig',
      confirmTitle: 'Auswahl übernehmen?',
      confirmBack: 'Zurück',
      confirmContinue: 'Weiter',
    },
    application: {
      passwordLabel: 'Campusgram-Passwort',
      repetitionFound:
        'Dein Campusgram-Passwort enthielt genau so eine Wiederholung.',
      repetitionNotFound: 'Dein Campusgram-Passwort enthielt so eine Wiederholung nicht.',
    },
  },
  freeSearch: {
    passphraseGenerator: {
      title: 'Passphrasen-Generator',
      wordCount: '6 Wörter',
      generate: '↻ Generieren',
      password: 'Kaktus-Fenster-Regen-Komet-Wodurch-Knochen',
      strengthLabel: 'Vollständig gefüllter grüner Beispielbalken',
      copy: 'Kopieren',
      narration:
        'Wichtig: Passphrasen, also Passwörter aus mehreren Wörtern, können sehr stark sein. Werden genug Wörter zufällig erzeugt, fehlen dem Angreifer genau die Zusammenhänge, die ihm eben noch geholfen haben. Wie das praktisch geht, schauen wir uns später an.',
    },
    transition: {
      explanation:
        'Hier erfüllt Passw0rt123! alle angezeigten Regeln und wird als stark bewertet.',
    },
    characterMix: {
      panelTitle: 'Passwort erstellen',
      strengthTitle: 'Passwortstärke',
      strengthRating: 'Stark',
      strengthBarLabel: 'Vollständig gefüllte grüne Stärkeanzeige',
      earlyHit: 'Früher Treffer',
      checks: ['mindestens 12 Zeichen', 'Großbuchstabe', 'Kleinbuchstabe', 'Zahl', 'Sonderzeichen'],
      predictablePassword: 'Passw0rt123!',
      randomPassword: 'rQ7!m2vX9?pK',
      finalVariation: characterMixFinalVariation,
      finalVariationStatus: '(Variation getestet)',
      variations: characterMixVariations,
      narration: [
        'Das rechte Passwort ist genauso lang und enthält ebenfalls alle vier Zeichentypen, besteht aber aus zwölf zufällig erzeugten Zeichen.',
        'Deshalb kann ein Passwort als stark markiert werden, obwohl es typischen Mustern folgt und vom Angreifer früh ausprobiert wird.',
        'Verschiedene Zeichentypen können ein Passwort stärker machen, werden bei selbst gewählten Passwörtern aber oft vorhersehbar eingesetzt.',
        'Darauf zu hoffen, dass der Angreifer eine komplizierte Variante wie „mEin!Pa55w0rt?“ nicht prüft, ist riskant.',
        'Das musst du auch nicht. Deshalb setzt die aktuelle Empfehlung bei selbst gewählten Passwörtern vor allem auf Länge.',
        'Wie lang sollte ein solches Passwort mindestens sein? Dafür lassen wir andere Zeichentypen zunächst bewusst weg und verwenden nur zufällig erzeugte Kleinbuchstaben.',
      ],
    },
    estimate: {
      title: 'Deine Schätzung',
      alphabetLabel: 'zufällig gewählt',
      question:
        'Was glaubst du: Ab welcher Länge wird es für einen Angreifer zu aufwendig, alle Möglichkeiten durchzuprobieren?',
      options: [12, 13, 14, 15, 16, 17, 18, 19, 20] as const,
      marker: 'Deine Schätzung',
      confirm: 'Schätzung bestätigen',
      confirmed: 'Schätzung bestätigt',
    },
    theoreticalModel: {
      assumptions: [
        'Jede Stelle unabhängig und zufällig ausgewählt',
        'Festgelegter Zeichenvorrat',
        'Vollständiges Durchprobieren',
        'Eine Billion Versuche pro Sekunde',
      ],
      lowercaseMeasurements: [
        { length: 8, durationLabel: 'unter 1 Sekunde' },
        { length: 9, durationLabel: 'ca. 5 Sekunden' },
        { length: 10, durationLabel: 'ca. 2 Minuten' },
        { length: 11, durationLabel: 'ca. 1 Stunde' },
        { length: 12, durationLabel: 'ca. 1 Tag' },
        { length: 13, durationLabel: 'ca. 29 Tage' },
        { length: 14, durationLabel: 'ca. 2 Jahre' },
        { length: 15, durationLabel: 'ca. 53 Jahre' },
        { length: 16, durationLabel: 'ca. 1.380 Jahre' },
        { length: 17, durationLabel: 'ca. 36.000 Jahre' },
        { length: 18, durationLabel: 'ca. 940.000 Jahre' },
        { length: 19, durationLabel: 'ca. 24 Millionen Jahre' },
        { length: 20, durationLabel: 'über 635 Millionen Jahre' },
      ],
      mixedCharacterMeasurement: {
        length: 12,
        alphabetLabel: 'alle Ze1chentypen!',
        durationLabel: 'ca. 615 Jahre',
      },
      interactiveScale: {
        accessibleLabel: 'Interaktive Messskala für zufällig erzeugte Kleinbuchstaben',
        comparisonAccessibleLabel:
          'Vergleich von 15 zufälligen Kleinbuchstaben mit 12 zufälligen Zeichen aus allen Zeichentypen',
        durationExplanation: 'bis alle Zeichenfolgen der Länge [Länge] geprüft wären',
        minimumOrientation: 'Mindeststandard',
        removeCharacter: 'Zufälligen Kleinbuchstaben entfernen',
        addCharacter: 'Zufälligen Kleinbuchstaben hinzufügen',
        finish: 'Ansicht abschließen',
        lockedHint: 'Bitte erkunde es bis 16 Zeichen.',
        informationLabel: 'Berechnungsannahmen des Angreifers anzeigen',
        information: {
          passwordLength: 'Passwortlänge',
          alphabetSize: 'Zeichenraumgröße',
          combinations: 'Mögliche Kombinationen',
          attemptsPerSecond: 'Berechnungen pro Sekunde',
          attemptsPerSecondValue: '1 Billion',
        },
      },
    },
    lengthExamples: {
      mixedCharacterComparison:
        'Die gelbe Kugel zeigt, warum zwölf Zeichen aus mehreren Zeichentypen bei wirklich zufälliger Auswahl wie k7#M!9p$2Lq& vom Aufwand so vielversprechend sind.',
      orientation:
        'Bei selbstgewählten Passwörtern lässt sich diese Zufälligkeit jedoch nicht voraussetzen. Deshalb liegt die aktuelle Orientierung bei mindestens 15 Zeichen.',
      reasonsIntroduction:
        'Es gibt noch zwei weitere Gründe, warum Länge so wichtig ist.',
      memorability:
        'Selbstgewählte Passwörter wie Datensicherheit sind merkbar und erreichen 15 Zeichen, bestehen aber nur aus einem Wort.',
      fullWordAttack:
        'Der Angreifer muss dafür nur dieses Wort aus einem deutschen Wörterpaket Pool prüfen.',
      shortWordComparison:
        'Wir könnten stattdessen fünf zufällige Wörter mit zwei bis drei Buchstaben verwenden. Davon gibt es aber deutlich weniger, der mögliche Pool pro Wort wäre also sehr klein.',
      sufficientPools:
        'Für mehrere zufällige und trotzdem merkbare Bestandteile brauchen wir jeweils einen ausreichend großen Pool. Und dafür brauchen sie Platz.',
      lengthTakeaway:
        'So wird ein Passwort schnell länger als 15 Zeichen, wenn wir es dem Angreifer wirklich schwer machen wollen.',
      secondReasonTransition: 'Nun zur zweiten Sache.',
      wordPoolDemonstration: {
        minimumLengthLabel: 'Mindestlänge',
        longWord: {
          password: 'Datensicherheit',
          parts: ['Datensicherheit'],
          length: 15,
          passwordLabel: '1 Wort',
          durationLabel: '80 Nanosekunden',
          packageCaption: 'Alle Wörterlängen',
          packageLabel: '80.000 🇩🇪 Wörter',
          poolSize: 80_000,
          modelInformation: {
            passwordParts: '1 Wort',
            pool: '80.000 Wörter',
            combinations: '80.000',
            attemptsPerSecond: '1 Billion',
          },
          packageTooltip: germanWordPackageInformation,
        },
        shortWords: {
          password: 'HatBinKuhIchTee',
          parts: ['Hat', 'Bin', 'Kuh', 'Ich', 'Tee'],
          length: 15,
          passwordLabel: '5 Wörter',
          durationLabel: '5,25 Sekunden',
          packageCaption: '2-3 Buchstabenwörter',
          packageLabel: 'nur 350 🇩🇪 Wörter',
          poolSizePerWord: 350,
          wordCount: 5,
          modelInformation: {
            passwordParts: '5 Wörter',
            pool: 'je nur 350 Wörter',
            combinations: '5.252.187.500.000',
            attemptsPerSecond: '1 Billion',
          },
        },
      },
      secondLengthReason: {
        germanWordsIntroduction:
          'Statt eines Wortes nehmen wir drei weitere zufällige Wörter aus demselben deutschen Wörterpool.',
        germanEffort:
          'Er braucht dann maximal ca. 1,3 Jahre. Vielleicht können wir den Aufwand mit einem größeren Wörterpool erhöhen.',
        languagePoolIntroduction:
          'Dafür legen wir deutsche, spanische, französische und japanische Wörter zusammen.',
        multilingualSelection:
          'Jedes Wort kann nun zufällig aus diesem gemeinsamen Pool stammen.',
        multilingualEffort: 'Der Wörterpool ist damit etwa viermal so groß.',
        fifthWordIntroduction:
          'Jetzt füge ich einfach ein weiteres zufälliges Wort aus demselben Pool hinzu. Und schon steigt der Aufwand auf 106 Millionen Jahre!',
        fifthWordAction: 'Schätzfrage',
        languagePoolEstimate: {
          question:
            'Wie viele Sprachpakete bräuchten wir insgesamt, damit vier Wörter ungefähr denselben Aufwand erzeugen wie diese fünf?',
          minimum: 4,
          maximum: 195,
          target: 95,
          inputLabel: 'Anzahl der Sprachpakete',
          valueUnit: 'Sprachpakete',
          decrementLabel: 'Ein Sprachpaket weniger',
          incrementLabel: 'Ein Sprachpaket mehr',
          submitAction: 'Schätzung abgeben',
          solutionLabel: '95 Sprachpakete',
          legend: {
            missing: 'Bis zur Lösung ergänzt',
            excess: 'Über der Lösung zurückgesetzt',
          },
          result:
            'Von vier auf fast 95 Sprachpakete, nur um ein zusätzliches Wort auszugleichen.',
          takeaway:
            'Das ist der zweite Grund: Ein weiteres zufälliges Wort kann viel mehr bringen als ein größerer Wörterpool.',
        },
        charsetAnalogy: {
          characterTypes:
            'Bei Zeichen ist es ähnlich: Mehr Zeichentypen vergrößern den Pool pro Zeichen.',
          additionalCharacter:
            'Ein weiteres Zeichen wirkt nach demselben Prinzip wie ein weiteres Wort.',
          predictability:
            'Einfach vorhersehbare Zeichen oder Wörter anzuhängen bringt diesen großen Zuwachs dagegen nicht.',
          passphraseOutlook:
            'Wie man mit zufälligen Wörtern ein starkes und trotzdem gut merkbares Passwort erstellt, schauen wir uns später praktisch an.',
        },
        germanWords: {
          password: 'DatensicherheitLobotomieZugspitzeUnbefugt',
          parts: ['Datensicherheit', 'Lobotomie', 'Zugspitze', 'Unbefugt'],
          passwordLabel: '4 Wörter',
          durationLabel: '1,3 Jahre',
          modelInformation: {
            passwordParts: '4 Wörter',
            pool: 'je 80.000 Wörter',
            combinations: '40.960.000.000.000.000.000',
            attemptsPerSecond: '1 Billion',
          },
        },
        multilingualWords: {
          password: 'DatensicherheitOscuridadYutoriSomnolent',
          parts: ['Datensicherheit', 'Oscuridad', 'Yutori', 'Somnolent'],
          passwordLabel: '4 Wörter',
          durationLabel: '332 Jahre',
          modelInformation: {
            passwordParts: '4 Wörter',
            pool: 'je 320.000 Wörter',
            combinations: '10.485.760.000.000.000.000.000',
            attemptsPerSecond: '1 Billion',
          },
        },
        fiveWords: {
          password: 'DatensicherheitOscuridadYutoriSomnolentCapez',
          parts: ['Datensicherheit', 'Oscuridad', 'Yutori', 'Somnolent', 'Capez'],
          passwordLabel: '5 Wörter',
          durationLabel: '106,3 Millionen Jahre',
          modelInformation: {
            passwordParts: '5 Wörter',
            pool: 'je 320.000 Wörter',
            combinations: '3.355.443.200.000.000.000.000.000.000',
            attemptsPerSecond: '1 Billion',
          },
        },
        languagePackages: [
          {
            id: 'de',
            label: 'Sprachpaket 🇩🇪',
            information: germanWordPackageInformation,
          },
          {
            id: 'es',
            label: 'Sprachpaket 🇪🇸',
            information:
              'Für diese vereinfachte Rechnung nehmen wir für das spanische Sprachpaket ebenfalls etwa 80.000 Wörter an.',
          },
          {
            id: 'fr',
            label: 'Sprachpaket 🇫🇷',
            information:
              'Für diese vereinfachte Rechnung nehmen wir für das französische Sprachpaket ebenfalls etwa 80.000 Wörter an.',
          },
          {
            id: 'ja',
            label: 'Sprachpaket 🇯🇵',
            information:
              'Für diese vereinfachte Rechnung nehmen wir für das japanische Sprachpaket ebenfalls etwa 80.000 Wörter an.',
          },
        ],
      },
    },
    application: {
      assessmentIntroduction: [
        'Für diese Übung entscheiden wir jetzt grob, ob dein Passwort bei den bisherigen Prüfungen gefunden wurde.',
        'Das ist keine Bewertung der Passwortstärke oder Sicherheitsgarantie.',
      ],
      result: {
        recognizedValue:
          'Die gesamte Zeichenfolge wurde als früher Kandidat erkannt. Deshalb gilt dein Campusgram-Passwort hier als gefunden.',
        recognizedBoundedVariant:
          'Eine einfache Veränderung führte zur gesamten Zeichenfolge. Deshalb gilt dein Campusgram-Passwort hier als gefunden.',
        recognizedSemanticPath:
          'Die bisherigen Prüfungen und die von dir markierten Zusammenhänge ergeben einen nachvollziehbaren Weg zur gesamten Zeichenfolge. Deshalb gilt dein Campusgram-Passwort hier als gefunden.',
        notRecognized:
          'Kein erkannter Weg deckt die gesamte Zeichenfolge ab. Deshalb gilt dein Campusgram-Passwort hier als nicht gefunden. Das ist kein Sicherheitsnachweis.',
      },
      length: {
        belowOrientation:
          'Unabhängig davon: Mit [Anzahl] Zeichen liegt das Campusgram-Passwort unter der Orientierung von mindestens 15 Zeichen für selbst gewählte Passwörter.',
        reachesOrientation:
          'Unabhängig davon: Mit [Anzahl] Zeichen erreicht das Campusgram-Passwort die Orientierung von mindestens 15 Zeichen für selbst gewählte Passwörter.',
      },
      shieldMeaning:
        'Das Schild steht für den Schutz durch das Passwort als einen Faktor, nicht für absolute Kontosicherheit.',
      reuseTakeaway:
        'Selbst gewählte Passwörter werden oft für mehrere Konten wiederverwendet oder nur leicht verändert, weil man sich so weniger merken muss.',
      attackerTakeaway:
        'Wird eines davon herausgefunden, können Angreifer diese Varianten auch bei anderen Konten ausprobieren.',
      otherAccountsAction: 'Andere Konten prüfen',
      network: {
        foundSummary:
          'Campusgram wurde gefunden. Nur seine direkt angebundenen Knoten und Verbindungen werden rot.',
        protectedSummary:
          'Der simulierte Prüfweg zu Campusgram wurde durch den Passwortfaktor blockiert. Blaue Schutzlinien und Schilde markieren nur die direkt angebundenen Campusgram-Knoten.',
      },
    },
  },
  fixtures: [
    {
      id: 'common-suffix',
      routeId: 's05-common-suffix',
      label: 'Häufig verwendeter Bestandteil mit später offengelegten Varianten',
      fictionalPassword: 'Passw0rt123!',
      analysisContext: { accountTerms: [] },
      startSection: 'components',
    },
    {
      id: 'all-categories',
      routeId: 's05-all-categories',
      label: 'Alle drei Prüfungen mit lokaler persönlicher Einordnung',
      fictionalPassword: 'CampusPassw0rt123!',
      analysisContext: { accountTerms: ['Campus'] },
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
    ['s05-strategy-targeting', 'strategy-targeting', 'info'],
    ['s05-component-category-overview', 'component-start', 'info'],
    ['s05-common-components-start', 'component-conveyor', 'info'],
    ['s05-common-components-examples', 'component-conveyor', 'info'],
    ['s05-common-components-changes', 'component-conveyor', 'info'],
    ['s05-common-components-intro', 'component-strategy', 'info'],
    ['s05-common-components-result', 'component-strategy', 'warning'],
    ['s05-personal-details-opening', 'component-conveyor', 'info'],
    ['s05-personal-details-derivation', 'component-conveyor', 'info'],
    ['s05-personal-details-examples', 'component-conveyor', 'info'],
    ['s05-personal-details-intro', 'component-conveyor', 'info'],
    ['s05-personal-details-check', 'component-strategy', 'info'],
    ['s05-personal-details-result', 'component-strategy', 'warning'],
    ['s05-account-context-opening', 'component-conveyor', 'info'],
    ['s05-account-context-examples', 'component-conveyor', 'info'],
    ['s05-account-context-intro', 'component-strategy', 'info'],
    ['s05-account-context-result', 'component-strategy', 'warning'],
    ['s05-components-summary', 'component-strategy', 'info'],
    ['s05-structure-intro', 'strategy-targeting', 'info'],
    ['s05-structure-theme', 'structure-theme', 'info'],
    ['s05-structure-theme-guessing', 'structure-theme', 'info'],
    ['s05-structure-theme-reflection', 'structure-theme-reflection', 'info'],
    ['s05-structure-sentence', 'structure-sentence', 'info'],
    ['s05-structure-sentence-guessing', 'structure-sentence', 'info'],
    ['s05-structure-sentence-reflection', 'structure-sentence-reflection', 'info'],
    ['s05-structure-repetition', 'structure-repetition', 'warning'],
    ['s05-structure-repetition-guessing', 'structure-repetition', 'warning'],
    ['s05-structure-application', 'structure-application', 'warning'],
    ['s05-free-search-transition', 'character-mix', 'info'],
    ['s05-character-mix-first', 'character-mix', 'info'],
    ['s05-character-mix-comparison', 'character-mix', 'info'],
    ['s05-character-mix-difference', 'character-mix', 'warning'],
    ['s05-character-mix-types', 'character-mix', 'info'],
    ['s05-character-mix-strategy', 'character-mix', 'warning'],
    ['s05-character-mix-takeaway', 'character-mix', 'info'],
    ['s05-estimate', 'estimate', 'info'],
    ['s05-lowercase-clock', 'lowercase-clock', 'info'],
    ['s05-length-model-comparison', 'length-model-comparison', 'info'],
    ['s05-length-orientation', 'length-orientation', 'info'],
    ['s05-length-reasons-intro', 'length-word-pools', 'info'],
    ['s05-length-memorability', 'length-word-pools', 'info'],
    ['s05-length-full-word-attack', 'length-word-pools', 'warning'],
    ['s05-length-short-word-comparison', 'length-word-pools', 'info'],
    ['s05-length-sufficient-pools', 'length-word-pools', 'info'],
    ['s05-length-takeaway', 'length-word-pools', 'info'],
    ['s05-length-second-reason-transition', 'length-word-pools', 'info'],
    ['s05-length-four-german-words', 'length-second-reason', 'info'],
    ['s05-length-four-german-effort', 'length-second-reason', 'info'],
    ['s05-length-language-pool-stack', 'length-second-reason', 'info'],
    ['s05-length-multilingual-words', 'length-second-reason', 'info'],
    ['s05-length-fifth-word-comparison', 'length-second-reason', 'info'],
    ['s05-length-language-pool-question', 'length-language-map', 'info'],
    ['s05-length-language-pool-result', 'length-language-map', 'info'],
    ['s05-length-language-pool-takeaway', 'length-language-map', 'info'],
    ['s05-length-charset-analogy-types', 'length-model-comparison', 'info'],
    ['s05-length-charset-analogy-position', 'length-model-comparison', 'info'],
    ['s05-length-charset-predictability', 'length-model-comparison', 'warning'],
    ['s05-length-passphrase-outlook', 'length-model-comparison', 'info'],
    ['s05-final-components', 'final-components', 'info'],
    ['s05-final-result', 'final-result', 'warning'],
    ['s05-final-length', 'final-length', 'info'],
    ['s05-final-spread', 'final-spread', 'warning'],
    ['s05-final-takeaway', 'final-takeaway', 'info'],
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
  const durationMs = id === 's05-final-takeaway' ? 3200 : id === 's05-final-result' ? 1400 : 520;
  return {
    id,
    steps: [{ type: 'highlight' as const, targetId, emphasis, durationMs }],
    reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
    maxDurationMs: durationMs,
  };
}
