import type {
  PredefinedPassphraseId,
  TrainingSectionId,
} from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '4.23.0';

export type S07OpenConnectionKind = 'none' | 'similar' | 'identical';

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-26 · direkter Abschluss nach Campusgram-Wechsel',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s07-direkter-abschluss-nach-campusgram-wechsel-26-august-2026',
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
      'Jetzt nutzen wir die Idee von vorhin: sechs zufällige, voneinander unabhängige Wörter. Ein solches Passwort nennt man Passphrase.',
    searchIntro:
      'Öffne den neuen Tab und lass dir dort eine Passphrase generieren. Danach setzt du sie bei Campusgram ein.',
    generating: 'Passphrase wird erstellt …',
    mnemonicIntro:
      'Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.',
    mnemonic: (sentence: string) => `Beispiel: ${sentence}`,
    campusgramSuccess:
      'Das Campusgram-Passwort ist ersetzt. Selbst wenn das alte später aus den gestohlenen Passwortdaten ermittelt wird, funktioniert es dort nicht mehr.',
    remainingPlan:
      'Die übrigen offenen Punkte siehst du gleich wieder im Netzwerk. Verwende dort bei jedem markierten Konto eine eigene Passphrase, bis alle offenen Punkte behoben sind.',
    nothingOpen: 'Bei den anderen Konten ist hier nichts mehr offen.',
    finishAttack: 'Angriff abschließen',
    continueAttack: 'Offene Punkte beheben',
  },
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S07, Passphrase erstellen',
    campusgramIncidentNotice: {
      title: 'Datenleck bei Campusgram',
      body: 'Bei Campusgram ist eine alte Datei mit gespeicherten Passwortdaten abgeflossen. Das Passwort stand darin nicht im Klartext.',
      advisory:
        'Mit diesen Daten können Angreifer trotzdem weiter mögliche Passwörter prüfen. Ändere deshalb dein Campusgram-Passwort.',
    },
    passwordChangeTitle: 'Passwort ändern',
    campusgramPasswordChangeCompleted: {
      title: 'Campusgram-Passwort wurde erfolgreich ersetzt',
      shieldLabels: {
        green: 'Nur für dieses Konto',
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
          ids: {
            '-': 'passphrase-01-hyphen',
            '.': 'passphrase-01-dot',
            _: 'passphrase-01-underscore',
            ' ': 'passphrase-01-space',
          },
          words: ['Plexiglas', 'Dorffest', 'Knirps', 'Monieren', 'Eistee', 'Bergbahn'],
          passWoMnemonic:
            'Beim Dorffest moniert ein Knirps am Plexiglas, weil sein Eistee in der Bergbahn verschüttet wurde.',
        },
        {
          ids: {
            '-': 'passphrase-02-hyphen',
            '.': 'passphrase-02-dot',
            _: 'passphrase-02-underscore',
            ' ': 'passphrase-02-space',
          },
          words: ['Infekt', 'Festbesuch', 'Textstellen', 'Gehirn', 'Korrumpiert', 'Physik'],
          passWoMnemonic:
            'Nach dem Festbesuch korrumpiert ein Infekt Textstellen im Gehirn. Das ist offenbar Physik.',
        },
        {
          ids: {
            '-': 'passphrase-03-hyphen',
            '.': 'passphrase-03-dot',
            _: 'passphrase-03-underscore',
            ' ': 'passphrase-03-space',
          },
          words: ['Haartracht', 'Sommer', 'Seiltanz', 'Kennwort', 'Mythisch', 'Verfiel'],
          passWoMnemonic:
            'Im Sommer schwankt beim Seiltanz eine Haartracht. Ein Kennwort leuchtete darin mythisch und verfiel.',
        },
        {
          ids: {
            '-': 'passphrase-04-hyphen',
            '.': 'passphrase-04-dot',
            _: 'passphrase-04-underscore',
            ' ': 'passphrase-04-space',
          },
          words: [
            'Popkultur',
            'Wohnsiedlung',
            'Holzarbeiten',
            'Drohung',
            'Streng',
            'Knieprobleme',
          ],
          passWoMnemonic:
            'Für Popkultur entstehen Holzarbeiten in der Wohnsiedlung. Nach einer Drohung heißt es streng: Knieprobleme, Schluss.',
        },
        {
          ids: {
            '-': 'passphrase-05-hyphen',
            '.': 'passphrase-05-dot',
            _: 'passphrase-05-underscore',
            ' ': 'passphrase-05-space',
          },
          words: ['Nirgendwo', 'Querkommen', 'Finster', 'Appell', 'Ersuchen', 'Bleistift'],
          passWoMnemonic:
            'Im Nirgendwo wird es beim Querkommen finster. Einen Appell und ein Ersuchen notiere ich mit Bleistift.',
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
            'Praktische Orientierung zu Länge, eigenen Passwörtern und Merkbarkeit – ohne echte Konten oder persönliche Angaben zu verwenden.',
        },
        {
          id: 'privacy-labor',
          siteName: 'Privacy Labor',
          domain: 'https://privacy-labor.example/kompakt/passphrase',
          title: 'Passphrase kompakt: zufällig, lang und für jedes Konto anders',
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

const predefinedPassphraseSeparators = ['-', '.', '_', ' '] as const;

export function predefinedPassphraseIdFor(
  passphraseIndex: number,
  separator: string,
): PredefinedPassphraseId {
  const phrase = s07PassphraseSearchContent.browser.generatorPage.passphrases[passphraseIndex];
  const supportedSeparator = predefinedPassphraseSeparators.find(
    (candidate) => candidate === separator,
  );
  if (phrase === undefined || supportedSeparator === undefined) {
    throw new Error('predefined-passphrase-selection-invalid');
  }
  return phrase.ids[supportedSeparator];
}

export function resolvePredefinedPassphrase(id: PredefinedPassphraseId): string {
  for (const phrase of s07PassphraseSearchContent.browser.generatorPage.passphrases) {
    for (const separator of predefinedPassphraseSeparators) {
      if (phrase.ids[separator] === id) return phrase.words.join(separator);
    }
  }
  throw new Error('predefined-passphrase-id-not-found');
}

export function deriveAdditionalPassphraseIds(
  campusgramId: PredefinedPassphraseId,
): readonly [masterCampus: PredefinedPassphraseId, campusEmail: PredefinedPassphraseId] {
  const phrases = s07PassphraseSearchContent.browser.generatorPage.passphrases;
  const campusgramIndex = phrases.findIndex((phrase) =>
    predefinedPassphraseSeparators.some((separator) => phrase.ids[separator] === campusgramId),
  );
  if (campusgramIndex < 0) throw new Error('predefined-campusgram-passphrase-not-found');
  const masterCampus = phrases[(campusgramIndex + 1) % phrases.length];
  const campusEmail = phrases[(campusgramIndex + 2) % phrases.length];
  if (masterCampus === undefined || campusEmail === undefined) {
    throw new Error('predefined-additional-passphrases-not-found');
  }
  return [masterCampus.ids['-'], campusEmail.ids['-']];
}
