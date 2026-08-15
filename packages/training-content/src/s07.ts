import type { TrainingSectionId } from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '4.7.0';

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-15 · S07 Schilde beschriften',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy--und-darstellungsdelta-s07-beschriftete-erfolgsschilde-15-august-2026',
  },
  segment: {
    id: 'S07',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'passphrase-search',
  },
  trainingAriaLabel: 'PassWo Training, Segment S07, Passphrase erstellen',
  guide: {
    taskLabel: 'Passphrase erstellen',
    methodIntro:
      'Für ein starkes Passwort können wir mehrere zufällige Wörter zu einer langen Passphrase verbinden. So erreichen wir schnell mindestens 15 Zeichen, ohne ein selbst gewähltes Muster zu verwenden.',
    randomnessIntro:
      'Wichtig ist, dass die Wörter zufällig gewählt werden. Dafür verwenden wir hier eine Passphrase aus mindestens sechs zufälligen Wörtern.',
    searchIntro:
      'Du musst sie dir für diese Übung nicht merken. Suche nach einem Passphrase-Generator, erzeuge eine Passphrase und verwende sie für Campusgram.',
    generating: 'Passphrase wird erstellt …',
    mnemonicIntro:
      'Eine zufällige Passphrase kann zuerst ungewohnt wirken. Zum Merken kannst du aus den Wörtern ein kleines Bild oder einen Merksatz bauen.',
    mnemonic: (sentence: string) => `Möglicher Merksatz: ${sentence}`,
    campusgramSuccess:
      'Sehr gut geschützt. Dein altes Campusgram-Passwort ist ersetzt. Der Angreifer kann den Treffer aus dem Datenleck für dieses Konto jetzt nicht mehr verwenden.',
    remainingRisk: (account: string) =>
      `Bei ${account} besteht noch ein Treffer oder eine Verbindung zum alten Passwort. Auch dort ersetzen wir das Passwort durch eine eigene, einzigartige Passphrase.`,
    remainingPlan:
      'Dafür können wir wieder die Kontenübersicht als Abkürzung nutzen. Schließe das Browserfenster.',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Passphrase erstellen',
    passwordChangeTitle: 'Passwort ändern',
    campusgramPasswordChangeCompleted: {
      title: 'Passwort geändert',
      body: 'Die neue Passphrase wird jetzt für Campusgram verwendet.',
      shieldLabels: {
        green: 'Einzigartig',
        blue: 'Stark',
      },
    },
    searchTab: {
      id: 'passphrase-search',
      landingLabel: 'Neuer Tab',
      label: 'Passphrase generieren',
      homeAddress: 'search.example',
      address: 'search.example/?q=passphrase+generieren',
    },
    generatorPage: {
      ariaLabel: 'Fiktive Website Passphrase-Werkstatt',
      address: 'www.passphrase-werkstatt.example/generator',
      siteName: 'Passphrase-Werkstatt',
      navigation: ['Generator', 'So funktioniert es', 'Datenschutz'],
      title: 'Passphrase-Generator',
      wordCount: '6 Wörter',
      separatorLegend: 'Trennzeichen wählen',
      separators: [
        { label: 'Bindestrich', value: '-' },
        { label: 'Punkt', value: '.' },
        { label: 'Unterstrich', value: '_' },
        { label: 'Leerzeichen', value: ' ' },
      ],
      outputAriaLabel: 'Generierte Passphrase für die Übung',
      generate: 'Neu generieren',
      copy: 'Kopieren',
      copied: 'Kopiert',
      paste: 'Einsetzen',
      generationDelayMs: 500,
      passphrases: [
        {
          words: ['Kaktus', 'Fenster', 'Regen', 'Komet', 'Lampe', 'Knochen'],
          passWoMnemonic:
            'Ein Kaktus sitzt am Fenster und es regnet Kometen. Meine Lampe sieht aus wie ein Knochen.',
        },
        {
          words: ['Infekt', 'Festbesuch', 'Textstellen', 'Gehirn', 'Korrumpiert', 'Physik'],
          passWoMnemonic:
            'Es gab ein Infekt am Festbesuch. Ganz viele Textstellen im Gehirn wurden korrumpiert. Das ist alles Physik.',
        },
        {
          words: ['Haartracht', 'Sommer', 'Seiltanz', 'Kennwort', 'Mythisch', 'Verfiel'],
          passWoMnemonic:
            'Eine riesige Haartracht schwankt im Sommer beim Seiltanz. Darin steht ein Kennwort, das mythisch leuchtet und plötzlich verfiel.',
        },
        {
          words: ['Pinguin', 'Leiter', 'Mango', 'Wolke', 'Fahrrad', 'Koffer'],
          passWoMnemonic:
            'Ein Pinguin steigt auf der Leiter mit einer Mango in der Hand bis zur Wolke. Dort oben ist ein Fahrrad im Koffer.',
        },
        {
          words: ['Nirgendwo', 'Querkommen', 'Finster', 'Appell', 'Ersuchen', 'Bleistift'],
          passWoMnemonic:
            'Im Nirgendwo versuche ich querzukommen, doch plötzlich wird es finster. Ich höre einen Appell, daraus wird ein Ersuchen, das ich mit einem Bleistift notiere.',
        },
      ],
    },
    searchPage: {
      landingAriaLabel: 'Fiktive Suchseite für Passphrase generieren',
      ariaLabel: 'Fiktive Suchergebnisse für Passphrase generieren',
      brand: 'Search',
      query: 'passphrase generieren',
      submitLabel: 'Nach passphrase generieren suchen',
      resultsLoadingLabel: 'Suchergebnisse werden geladen',
      resultsDelayMs: 900,
      navigation: ['Ergebnisse', 'Anleitungen', 'Wissen', 'Werkzeuge'],
      primaryResultId: 'passphrase-werkstatt',
      results: [
        {
          id: 'passphrase-werkstatt',
          siteName: 'Passphrase-Werkstatt',
          domain: 'https://www.passphrase-werkstatt.example/generator',
          title: 'Passphrase-Generator – Wörter einfach kombinieren',
          description:
            'Erstelle aus sechs zufällig ausgewählten Wörtern eine lange, gut merkbare Passphrase und wähle ein Trennzeichen.',
        },
        {
          id: 'wortanker',
          siteName: 'Wortanker',
          domain: 'https://www.wortanker.example/passphrase-erstellen',
          title: 'Passphrase erstellen: Schritt für Schritt erklärt',
          description:
            'Ein verständlicher Einstieg in Wortauswahl, Länge und den Umgang mit zufälligen Begriffen – mit einem vollständig fiktiven Beispiel.',
        },
        {
          id: 'digitaler-selbstschutz',
          siteName: 'Digitaler Selbstschutz',
          domain: 'https://ratgeber.digitaler-selbstschutz.example/passphrasen',
          title: 'Passphrasen statt kurzer Passwörter: Das ist wichtig',
          description:
            'Der Ratgeber zeigt, warum mehrere zufällige Wörter hilfreich sein können und welche leicht erratbaren Muster vermieden werden sollten.',
        },
        {
          id: 'netzblick',
          siteName: 'Netzblick Magazin',
          domain: 'https://www.netzblick.example/wissen/gute-passphrase',
          title: 'Wie finde ich eine gute Passphrase?',
          description:
            'Praktische Orientierung zu Länge, Einzigartigkeit und Merkbarkeit – ohne echte Konten oder persönliche Angaben zu verwenden.',
        },
        {
          id: 'privacy-labor',
          siteName: 'Privacy Labor',
          domain: 'https://privacy-labor.example/kompakt/passphrase',
          title: 'Passphrase kompakt: zufällig, lang und einzigartig',
          description:
            'Eine kurze Checkliste für neue Passphrasen und Hinweise dazu, weshalb bekannte Zitate oder persönliche Daten ungeeignet sind.',
        },
        {
          id: 'konto-klar',
          siteName: 'KontoKlar',
          domain: 'https://www.kontoklar.example/hilfe/passphrase-generatoren',
          title: 'Passphrase-Generatoren sinnvoll verwenden',
          description:
            'Worauf du bei Wortgeneratoren achten kannst und warum jede Passphrase nur für ein einzelnes Konto verwendet werden sollte.',
        },
        {
          id: 'sicherheitsfaden',
          siteName: 'Sicherheitsfaden',
          domain: 'https://sicherheitsfaden.example/lernen/mehrere-woerter',
          title: 'Mehrere Wörter, eine Passphrase: Beispiele und Tipps',
          description:
            'Fiktive Beispiele veranschaulichen den Aufbau langer Passphrasen, ohne daraus eine Garantie für Kontosicherheit abzuleiten.',
        },
        {
          id: 'technik-atelier',
          siteName: 'Technik Atelier',
          domain: 'https://technik-atelier.example/anleitungen/passphrase',
          title: 'Anleitung: Eine neue Passphrase zusammenstellen',
          description:
            'Von der zufälligen Wortliste bis zur fertigen Eingabe: eine übersichtliche Anleitung für eine eigenständige neue Passwortgrundlage.',
        },
        {
          id: 'login-lotse',
          siteName: 'Login-Lotse',
          domain: 'https://login-lotse.example/fragen/passphrasen',
          title: 'Häufige Fragen zu Passphrasen',
          description:
            'Antworten zu Wortanzahl, Leerzeichen, Sonderzeichen und der Nutzung verschiedener Passphrasen für verschiedene Konten.',
        },
      ],
      questions: [
        'Wie viele Wörter sollte eine Passphrase haben?',
        'Was ist der Unterschied zwischen Passwort und Passphrase?',
        'Dürfen Leerzeichen in einer Passphrase vorkommen?',
        'Warum sollten die Wörter zufällig sein?',
      ],
      relatedSearches: [
        'Passphrase Beispiele',
        'Passphrase mit 5 Wörtern',
        'Zufällige Wörter generieren',
        'Passphrase oder Passwort',
        'Passphrase einfach erklärt',
        'Starke Passphrase erstellen',
      ],
      resultCollectionSummary: {
        title: 'Mehr Wege zum Thema',
        description:
          'Diese Auswahl verbindet praktische Werkzeuge, verständliche Anleitungen und Hintergrundwissen.',
        topics: ['Werkzeuge', 'Anleitungen', 'Wissen'],
      },
      footerLocation: 'Deutschland',
      footerLinks: ['Hilfe', 'Datenschutz', 'Nutzungsbedingungen'],
    },
  },
} as const;
