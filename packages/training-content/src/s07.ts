import type { TrainingSectionId } from '@passwo/contracts';

export const S07_PASSPHRASE_SEARCH_CONTENT_VERSION = '4.14.0';

export type S07OpenConnectionKind = 'none' | 'similar' | 'identical';

export interface S07AccountSituation {
  readonly masterCampusCampusgram: S07OpenConnectionKind;
  readonly campusEmailCampusgram: S07OpenConnectionKind;
  readonly masterCampusCampusEmail: S07OpenConnectionKind;
  readonly masterCampusEasyToGuess: boolean;
  readonly campusEmailEasyToGuess: boolean;
}

function relationshipSummary(situation: S07AccountSituation): string {
  let masterCampusCampusgram = situation.masterCampusCampusgram;
  let campusEmailCampusgram = situation.campusEmailCampusgram;

  if (situation.masterCampusCampusEmail === 'identical') {
    if (masterCampusCampusgram !== 'none' && campusEmailCampusgram === 'none') {
      campusEmailCampusgram = masterCampusCampusgram;
    } else if (campusEmailCampusgram !== 'none' && masterCampusCampusgram === 'none') {
      masterCampusCampusgram = campusEmailCampusgram;
    }
  } else if (situation.masterCampusCampusEmail === 'similar') {
    if (masterCampusCampusgram === 'identical' && campusEmailCampusgram === 'none') {
      campusEmailCampusgram = 'similar';
    } else if (campusEmailCampusgram === 'identical' && masterCampusCampusgram === 'none') {
      masterCampusCampusgram = 'similar';
    }
  }

  if (masterCampusCampusgram !== 'none' && campusEmailCampusgram !== 'none') {
    if (masterCampusCampusgram === 'identical' && campusEmailCampusgram === 'identical') {
      return 'Master Campus und Campus E-Mail verwenden noch das alte Campusgram-Passwort.';
    }
    if (masterCampusCampusgram === 'identical') {
      return 'Master Campus verwendet noch das alte Campusgram-Passwort, und das Passwort der Campus E-Mail ähnelt ihm noch.';
    }
    if (campusEmailCampusgram === 'identical') {
      return 'Die Campus E-Mail verwendet noch das alte Campusgram-Passwort, und das Passwort von Master Campus ähnelt ihm noch.';
    }
    return 'Die Passwörter von Master Campus und Campus E-Mail ähneln noch dem alten Campusgram-Passwort.';
  }

  if (masterCampusCampusgram !== 'none') {
    if (situation.masterCampusCampusEmail === 'similar') {
      return 'Das Passwort von Master Campus ähnelt noch dem alten Campusgram-Passwort und dem Passwort der Campus E-Mail.';
    }
    return masterCampusCampusgram === 'identical'
      ? 'Master Campus verwendet noch das alte Campusgram-Passwort.'
      : 'Das Passwort von Master Campus ähnelt noch dem alten Campusgram-Passwort.';
  }

  if (campusEmailCampusgram !== 'none') {
    if (situation.masterCampusCampusEmail === 'similar') {
      return 'Das Passwort der Campus E-Mail ähnelt noch dem alten Campusgram-Passwort und dem Passwort von Master Campus.';
    }
    return campusEmailCampusgram === 'identical'
      ? 'Die Campus E-Mail verwendet noch das alte Campusgram-Passwort.'
      : 'Das Passwort der Campus E-Mail ähnelt noch dem alten Campusgram-Passwort.';
  }

  if (situation.masterCampusCampusEmail === 'identical') {
    return 'Master Campus und Campus E-Mail verwenden noch dasselbe Passwort.';
  }
  if (situation.masterCampusCampusEmail === 'similar') {
    return 'Die Passwörter von Master Campus und Campus E-Mail ähneln sich noch.';
  }
  return 'Zwischen Master Campus, Campus E-Mail und dem alten Campusgram-Passwort gibt es keine offene Verbindung mehr.';
}

function guessabilitySummary(situation: S07AccountSituation): string | null {
  if (situation.masterCampusEasyToGuess && situation.campusEmailEasyToGuess) {
    return 'Beide Passwörter lassen sich außerdem leicht erraten.';
  }
  if (situation.masterCampusEasyToGuess) {
    return 'Das Passwort von Master Campus lässt sich außerdem leicht erraten.';
  }
  if (situation.campusEmailEasyToGuess) {
    return 'Das Passwort der Campus E-Mail lässt sich außerdem leicht erraten.';
  }
  return null;
}

export function summarizeS07AccountSituation(situation: S07AccountSituation): string {
  const relationship = relationshipSummary(situation);
  const guessability = guessabilitySummary(situation);
  return guessability === null ? relationship : `${relationship} ${guessability}`;
}

export const s07PassphraseSearchContent = {
  version: S07_PASSPHRASE_SEARCH_CONTENT_VERSION,
  source: {
    revision: 'Userauftrag vom 2026-08-17 · priorisierte S07-Relationsverdichtung',
    copyReference:
      'docs/design/S06-S07-COPY-AUDIT.md#copy-delta-s07-priorisierte-relationsverdichtung-17-august-2026',
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
      'Die Passphrase ist genau die Methode für starke Passwörter aus Wörtern, die wir heute schon angesprochen haben. Sie besteht aus mindestens sechs zufällig ausgewählten, voneinander unabhängigen Wörtern.',
    searchIntro:
      'Lass dir online eine Passphrase generieren und ersetze damit das betroffene Passwort.',
    generating: 'Passphrase wird erstellt …',
    mnemonicIntro:
      'Für jetzt musst du sie dir nicht merken. Im Alltag kann eine kleine Geschichte das Erinnern erleichtern.',
    mnemonic: (sentence: string) => `Beispiel: ${sentence}`,
    campusgramSuccess:
      'Campusgram ist jetzt geschützt. Das alte Passwort aus dem Datenleck kann dort nicht mehr verwendet werden.',
    accountSummary: summarizeS07AccountSituation,
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
