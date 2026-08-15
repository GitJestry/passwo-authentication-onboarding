import type { TrainingSectionId } from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '4.11.0';

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-15 · S07 Passphrasen eins und vier',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s07-passphrasen-eins-und-vier-15-august-2026',
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
      'Dafür nutzen wir eine Passphrase: eine einfache Methode, starke Passwörter nur aus Wörtern zu bilden.',
    randomnessIntro:
      'Ein geläufiges Wort kann zwar lang sein, wird von Angreifern aber früh ausprobiert. Eine Passphrase aus mindestens sechs zufälligen, unzusammenhängenden Wörtern macht das Erraten dagegen deutlich aufwendiger.',
    searchIntro:
      'Lass dir online eine Passphrase generieren und ersetze damit das betroffene Passwort.',
    generating: 'Passphrase wird erstellt …',
    mnemonicIntro:
      'Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.',
    mnemonic: (sentence: string) => `Beispiel: ${sentence}`,
    campusgramSuccess:
      'Campusgram ist jetzt geschützt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.',
    accountFeedback: {
      strongSimilar: (account: string, connection: string) =>
        `Das Passwort von ${account} ist für sich betrachtet stark, ähnelt aber noch ${connection}.`,
      uniqueGuessable: (account: string) =>
        `Das Passwort von ${account} ist einzigartig, lässt sich aber noch leicht erraten.`,
      similarGuessable: (account: string, connection: string) =>
        `Das Passwort von ${account} ähnelt noch ${connection} und lässt sich außerdem leicht erraten.`,
    },
    allAccountsProtected:
      'Auch deine anderen Konten sind bereits stark und einzigartig. Schau dir jetzt an, wie der Angriff mit deinen geschützten Konten endet.',
    remainingPlan:
      'Schau dir jetzt an, was der Angriff noch erreichen kann. Offene Konten kannst du dort direkt mit einer eigenen Passphrase absichern.',
    finishAttack: 'Angriff abschließen',
    continueAttack: 'Angriff fortsetzen',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Passphrase erstellen',
    passwordChangeTitle: 'Passwort ändern',
    campusgramPasswordChangeCompleted: {
      title: 'Campusgram-Passwort wurde erfolgreich ersetzt',
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
          words: ['Plexiglas', 'Dorffest', 'Knirps', 'Monieren', 'Eistee', 'Bergbahn'],
          passWoMnemonic:
            'Am Plexiglas beim Dorffest steht ein Knirps und beginnt zu monieren, weil sein Eistee in der Bergbahn verschüttet wurde.',
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
          words: [
            'Popkultur',
            'Wohnsiedlung',
            'Holzarbeiten',
            'Drohung',
            'Streng',
            'Knieprobleme',
          ],
          passWoMnemonic:
            'Für die Popkultur-Ausstellung in der Wohnsiedlung mache ich Holzarbeiten. Nach einer Drohung werde ich streng ermahnt, wegen meiner Knieprobleme aufzuhören.',
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
