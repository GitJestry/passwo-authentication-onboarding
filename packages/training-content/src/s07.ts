import type { TrainingSectionId } from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '4.1.0';

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-14 · neuer Tab vor der Passphrasensuche',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s07-neuer-tab-vor-der-suche-14-august-2026',
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
      'Wir ersetzen das betroffene Passwort jetzt durch eine starke Passphrase. Dabei werden mehrere zufällig ausgewählte Wörter zu einem langen Passwort kombiniert.',
    searchIntro: 'Dafür schauen wir nach einem Passphrase-Generator.',
    searchAction: 'Suche nach einem Generator für eine Passphrase.',
    generatorExplanation: [
      'Mit mehreren Wörtern kommt man schnell auf ein langes Passwort. Angreifer können solche Passphrasen aber auch wortweise ausprobieren.',
      'Bei sechs zufällig ausgewählten Wörtern gibt es sehr viele mögliche Kombinationen. Wichtig ist, dass die Wörter nicht als vorhersehbarer Satz oder nach einem gemeinsamen Thema ausgewählt werden.',
      'Der Generator wählt sie deshalb zufällig aus. Wenn du Passphrasen selbst bildest, solltest du darauf achten, keinen solchen Zusammenhang hineinzubauen.',
    ],
    mnemonicExplanation: [
      'Sechs zufällige Wörter können erst einmal schwer zu merken wirken. Dafür kannst du dir im Nachhinein einen Merksatz oder ein ungewöhnliches Bild dazu vorstellen.',
      'Wichtig: Erst kommen die zufälligen Wörter. Der Merksatz hilft nur beim Erinnern und bestimmt nicht, welche Wörter du auswählst.',
    ],
    copied:
      'Die Passphrase ist kopiert. Geh jetzt zurück zu Campusgram und setze sie als neues Passwort ein.',
    pasteNew: 'Setze deine kopierte Passphrase hier als neues Passwort ein.',
    pasteConfirm: 'Setze dieselbe Passphrase jetzt zur Bestätigung noch einmal ein.',
    submitChange: 'Beide Felder stimmen überein. Ändere jetzt das Passwort.',
    campusgramSuccess:
      'Du hast das betroffene Campusgram-Passwort durch eine starke, einzigartige Passphrase ersetzt. Das alte Passwort aus der Datenleck-Datei funktioniert jetzt nicht mehr für Campusgram.',
    allUnique:
      'Damit hast du gleichzeitig die bestehende Wiederverwendung beendet. Jedes deiner Konten hat jetzt ein eigenes Passwort.',
    remainingRisk: (accounts: string) =>
      `Bei ${accounts} sind Passwörter noch gleich oder ähnlich. Das geleakte Passwort könnte dort also weiterhin ausprobiert werden.`,
    remainingPlan:
      'Deshalb würden wir auch diese Wiederverwendung beenden und für jedes betroffene Konto eine eigene Passphrase verwenden.',
    openAccount: (account: string) =>
      `Wechsle jetzt zum Tab ${account} und öffne dort die Passwortänderung.`,
    openPasswordChange: 'Öffne jetzt die Passwortänderung.',
    returnToGenerator:
      'Wechsle zurück zum geöffneten Tab „Passphrase generieren“ und erzeuge eine neue Passphrase für dieses Konto.',
    generateForAccount: (account: string) =>
      `Erzeuge jetzt eine neue Passphrase für ${account}.`,
    returnToAccount: (account: string) =>
      `Die neue Passphrase ist kopiert. Geh zurück zu ${account} und setze sie dort ein.`,
    allResolved:
      'Jetzt hat jedes Konto ein eigenes starkes Passwort. Schauen wir uns noch einmal an, was beim gleichen Angriff passiert.',
    replayAttack: 'Angriff erneut ansehen',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Passphrase erstellen',
    campusgramPasswordChangeCompleted: {
      title: 'Passwort geändert',
      body: 'Die neue Passphrase wird jetzt für Campusgram verwendet.',
    },
    otherAccountPasswordChange: {
      open: 'Passwort ändern',
      completedTitle: 'Passwort geändert',
      completedBody: (account: string) => `Die neue Passphrase wird jetzt für ${account} verwendet.`,
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
