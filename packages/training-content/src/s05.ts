import type {
  AuthoredStructureDemonstration,
  DesignLabScenarioId,
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
  SimulationQuickPathRuleId,
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

export const S05_CONTENT_VERSION = '2.56.1';

export const s05Content = {
  version: S05_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
      35,
    ] as const,
    revision: 'Userauftrag vom 2026-08-10 · Kurze vorhersehbare Formulierung',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s05-kurze-vorhersehbare-formulierung-10-august-2026',
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
    start: 'Animation starten',
    replay: 'Animation wiederholen',
    continue: 'Weiter',
  },
  intro: {
    campusgramPassword: {
      accessibleLabel: 'Campusgram-Passwort',
      visibleSuffix: 'Campusgram-Passwort',
    },
    generatedPassword: 'rQ7mL2vX9pK4',
    memorablePassword: 'MeinStarkesUniPasswort2005!',
    memorablePasswordParts: ['Mein', 'Starkes', 'Uni', 'Passwort', '2005', '!'],
    strategyAnnotations: {
      sentenceStructure: 'Kurze vorhersehbare Formulierung',
      probability: 'sehr häufig',
      personalDetail: 'Naheliegende Jahreszahl',
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
        'Grundsätzlich könnte es dabei jede denkbare Zeichenfolge ausprobieren.',
      ],
      randomSequence: [
        'Zufällige Zeichenfolgen sind jedoch schwer zu merken. Selbst gewählte Passwörter enthalten deshalb oft merkbare Elemente wie Wörter, Zahlen oder einfache Zeichenfolgen.',
      ],
      buildingBlocks: [
        'Für die Erklärung betrachten wir diese Teile vereinfacht wie aneinandergesetzte Bausteine.',
      ],
      strategyTargeting: [
        'Der Angreifer sieht diese Bestandteile nicht. Sein Programm kann aber mögliche Bestandteile auswählen, kombinieren und daraus vollständige Passwortkandidaten bilden.',
      ],
      componentCategoryOverview: [
        'Dabei probiert das Programm zunächst Passwörter und Zeichenfolgen aus, die besonders häufig verwendet werden.',
        'Bitte beachte: Das Modul kann Bestandteile im Passwort übersehen oder falsch einordnen. Es dient nur zum Verständnis und ist keine Sicherheitsbewertung.',
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
        'Ein Wort ist nicht grundsätzlich ungeeignet. Ein häufig verwendetes Wort wird jedoch früh getestet.',
        'Bei selbst gewählten Passwörtern kommen häufig Veränderungen wie Großschreibung, Zeichenersetzungen, Zahlen oder Symbole vor. Angreiferprogramme erzeugen deshalb typische Varianten sowohl einzelner Bestandteile als auch bereits zusammengesetzter Passwörter.',
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
        'Persönliche Angaben sind leicht zu merken und wirken oft geheim. Es ist deshalb nachvollziehbar, sie für etwas zu halten, das andere nur schwer erraten können.',
      ],
      derivation: [
        'Bei einem Datenleck liegen deine Passwortdaten oft zusammen mit deinem Benutzernamen, deiner E-Mail-Adresse oder Kontohinweisen vor.',
      ],
      examples: [
        'Angreifer können dadurch persönliche Angaben wie Namen, Geburtsdaten oder dem Lieblingsverein aus öffentlichen Profilen oder deinem Umfeld gezielt als Passwortkandidaten testen.',
      ],
      explanation: [
        'Für den Selbstcheck: Wähle die persönlichen Angaben aus, die für dein Beispiel in Frage kommen.',
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
        'Wenn du eine persönliche Angabe erkennst, ziehe über die zugehörigen Zeichen, um sie zu markieren. Weitere Angaben kannst du genauso markieren. Tippe auf eine Markierung, um sie wieder zu entfernen.',
      selectionStatus: {
        started: 'Auswahl gestartet. Wähle das letzte Zeichen des Bereichs.',
        added: 'Persönliche Angabe markiert.',
        removed: 'Markierung entfernt.',
        invalid: 'Dieser Bereich überschneidet sich mit einer bestehenden Markierung.',
        cancelled: 'Auswahl abgebrochen.',
      },
      privacyNote:
        'Die Auswahl bleibt nur in dieser laufenden Übung und wird nicht als Forschungsangabe gespeichert oder exportiert.',
      applyNone: 'Keine Persönliche Angabe',
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
        'Der Bezug zum Konto, Dienst oder Umfeld kann dem Angreifer Ideen für dein Passwort liefern.',
        'Bei Campusgram wären zum Beispiel Begriffe wie Campus, Nachricht, dein Benutzername oder der Dienstname naheliegend.',
      ],
      explanation: [
        'Bei einem WLAN-Passwort könnten es „WLAN“, „Router“ oder „Fritzbox“ sein.',
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
        'Dein Passwort wurde bereits unter einen einzigen frühen Kandidaten gefunden. Wir verfolgen den Angriff trotzdem weiter.',
      combinedMatches:
        'Dein Passwort besteht komplett aus frühen Anhaltspunkten. Erraten ist es dadurch noch nicht. Wir verfolgen den Angriff deshalb weiter.',
      partialMatches:
        'Dein Passwort besteht zum Teil aus frühen Anhaltspunkten. Erraten ist es dadurch noch nicht. Wir verfolgen den Angriff weiter.',
      none: 'Bei den bisherigen Prüfungen wurde keine Übereinstimmung gefunden. Der Angreifer hat damit aber noch nicht alle Möglichkeiten ausgeschöpft.',
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
        'Solche Anzeigen kennst du vielleicht aus deinem Alltag. Hier erfüllt Passw0rt123! alle angezeigten Regeln und wird als stark bewertet.',
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
        'Darauf zu setzen, mit einer komplizierten Mischung wie „mEin!Pa55w0rt?“ eine Variante zu finden, die der Angreifer nicht prüft, ist deshalb riskant.',
        'Keine Sorge, darauf musst du dich nicht verlassen. Für ein starkes Passwort brauchst du vor allem genügend Länge.',
        'Die bisherigen Beispiele haben aber auch gezeigt: Gleiche Länge bedeutet nicht automatisch gleiche Sicherheit.',
        'Um also ein Gefühl dafür zu bekommen, welche Mindestlänge dein Passwort haben sollte, gehen wir von einem Passwort aus, das nur aus zufällig gewählten Kleinbuchstaben besteht.',
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
        { length: 16, durationLabel: 'über 1000 Jahre' },
      ],
      interactiveScale: {
        accessibleLabel: 'Interaktive Messskala für zufällig erzeugte Kleinbuchstaben',
        title: 'Zeit, bis alle Möglichkeiten geprüft wären',
        introduction:
          'Die Zeit in den Kreisen zeigt, wie lange es dauern würde, alle Möglichkeiten zu prüfen.',
        passwordLabel: 'Passwort',
        minimumOrientation: 'Mindeststandard',
        removeCharacter: 'Zufälligen Kleinbuchstaben entfernen',
        addCharacter: 'Zufälligen Kleinbuchstaben hinzufügen',
        finish: 'Ansicht abschließen',
        lockedTitle: 'Mindestens 16 Zeichen ansehen',
        lockedBody:
          'Erhöhe das Beispielpasswort auf 16 Zeichen, bevor du diese Ansicht abschließt.',
        keepViewing: 'Weiter ansehen',
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
    ['s05-structure-sentence', 'structure-sentence', 'info'],
    ['s05-structure-sentence-guessing', 'structure-sentence', 'info'],
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
