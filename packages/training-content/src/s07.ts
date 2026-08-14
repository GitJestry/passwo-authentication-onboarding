import type { TrainingSectionId } from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '2.6.0';

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision:
      'Userauftrag vom 2026-08-13 · 20 weitere unverbundene Passphrasen-Wortfolgen',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#inhaltsdelta-s07-weitere-passphrasen-wortfolgen-13-august-2026',
  },
  segment: {
    id: 'S07',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'passphrase-search',
  },
  trainingAriaLabel: 'PassWo Training, Segment S07, Passphrase erstellen',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Passphrase erstellen',
    searchTab: {
      id: 'passphrase-search',
      label: 'Passphrase generieren',
      address: 'search.example/?q=passphrase+generieren',
    },
    generatorPage: {
      ariaLabel: 'Fiktive Website Passphrase-Werkstatt',
      address: 'www.passphrase-werkstatt.example/generator',
      siteName: 'Passphrase-Werkstatt',
      navigation: ['Generator', 'So funktioniert es', 'Datenschutz'],
      eyebrow: 'Mehr Länge, weniger Muster',
      title: 'Passphrase-Generator',
      securityMessage:
        'Eine lange Passphrase aus zufällig gewählten Wörtern ist schwerer zu erraten und trotzdem gut merkbar.',
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
      wordSets: [
        ['Anker', 'Birke', 'Kompass', 'Morgen', 'Wolke', 'Zeder'],
        ['Feder', 'Hafen', 'Kiesel', 'Pfad', 'Sonne', 'Wiese'],
        ['Atlas', 'Garten', 'Laterne', 'Segel', 'Ufer', 'Wald'],
        ['Quaste', 'Mergel', 'Oboe', 'Zinne', 'Tiegel', 'Brache'],
        ['Dohle', 'Firnis', 'Kufe', 'Mohn', 'Reede', 'Zwirn'],
        ['Ampel', 'Bims', 'Foliant', 'Natter', 'Spindel', 'Wehr'],
        ['Balg', 'Eibe', 'Kummet', 'Quarz', 'Tenne', 'Viola'],
        ['Düne', 'Gamasche', 'Lot', 'Nessel', 'Prisma', 'Zuber'],
        ['Barke', 'Fasan', 'Kreide', 'Orgel', 'Sicke', 'Wams'],
        ['Dolde', 'Giebel', 'Kokon', 'Polder', 'Talar', 'Zange'],
        ['Bürde', 'Flöte', 'Krater', 'Pergola', 'Spule', 'Wachtel'],
        ['Degen', 'Garbe', 'Linse', 'Palisade', 'Tülle', 'Zobel'],
        ['Bast', 'Fuge', 'Kanne', 'Ocker', 'Raupe', 'Weiche'],
        ['Druse', 'Glocke', 'Loden', 'Priel', 'Trommel', 'Zyste'],
        ['Bütte', 'Falter', 'Kobalt', 'Ornat', 'Reuse', 'Wendel'],
        ['Draisine', 'Gneis', 'Lunte', 'Pappel', 'Tresse', 'Zügel'],
        ['Borke', 'Fibel', 'Kassette', 'Otter', 'Ried', 'Woge'],
        ['Dattel', 'Gondel', 'Marder', 'Plinthe', 'Trense', 'Zunder'],
        ['Bohle', 'Fächer', 'Kralle', 'Opal', 'Rüsche', 'Winde'],
        ['Drossel', 'Granne', 'Muffe', 'Pinsel', 'Tunika', 'Zarge'],
        ['Binsen', 'Fresko', 'Kardätsche', 'Odem', 'Riegel', 'Wabe'],
        ['Damaszener', 'Grummet', 'Mole', 'Punze', 'Torf', 'Zimbel'],
        ['Brosche', 'Flachs', 'Kern', 'Orlog', 'Rinne', 'Wimpel'],
        ['Dingi', 'Gouache', 'Mistel', 'Pikee', 'Trift', 'Zäsur'],
      ],
    },
    searchPage: {
      ariaLabel: 'Fiktive Suchergebnisse für Passphrase generieren',
      brand: 'Search',
      query: 'passphrase generieren',
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
