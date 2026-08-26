import type { TrainingSectionId } from '@passwo/contracts';
import { s12PasswordManagerContent } from './s12.js';

export const S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION = '4.8.0';

export const s13PasswordManagerPracticeContent = {
  version: S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION,
  source: {
    revision:
      'Nutzerauftrag vom 2026-08-26 · eigener Sprechschritt für den Campusgram-Abschlussauftrag',
    copyReference:
      'docs/design/S13-COPY-AUDIT.md#copy--und-ablaufdelta-eigener-campusgram-abschlussauftrag-26-august-2026',
  },
  segment: {
    id: 'S13',
    sectionId: 'password-manager' as TrainingSectionId,
    slice: 'integrated-password-manager-practice',
  },
  trainingAriaLabel:
    'Training, Segment S13, Passwortmanager anwenden, vergleichen und wiederherstellen sowie Übergang zu MFA',
  browser: {
    ariaLabel: 'Fiktiver Browser mit My Shop',
    tabId: 'my-shop',
    tabLabel: 'MyShop',
    addresses: {
      register: 'myshop.example.com/register',
      login: 'myshop.example.com/login',
      signedIn: 'myshop.example.com',
    },
    passwordManagerLabel: 'Integrierter Passwortmanager',
  },
  website: {
    name: 'My Shop',
    registrationTitle: 'Registrieren',
    loginTitle: 'Anmelden',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'E-Mail-Adresse',
    passwordLabel: 'Passwort',
    passwordPlaceholder: 'Ihr Passwort',
    autofilledStatusLabel: 'automatisch ausgefüllt',
    showPasswordLabel: 'Passwort anzeigen',
    hidePasswordLabel: 'Passwort verbergen',
    registerAction: 'Registrieren',
    registeringLabel: 'Registrierung läuft …',
    loginAction: 'Anmelden',
    incorrectPassword: 'Dieses Passwort passt nicht zum Konto.',
    signedInStatus: 'Angemeldet',
    shop: {
      searchPlaceholder: 'Suche nach Produkten, Marken und mehr ...',
      searchCategory: 'Alle Kategorien',
      accountLabel: 'Konto',
      wishlistLabel: 'Wunschliste',
      wishlistDetail: '12 Artikel',
      cartLabel: 'Warenkorb',
      cartDetail: '2 Artikel',
      categoryHeading: 'Alle Kategorien',
      categories: [
        'Elektronik & Computer',
        'Handy & Zubehör',
        'Mode & Accessoires',
        'Haus & Wohnen',
        'Küche & Haushalt',
        'Sport & Freizeit',
        'Beauty & Gesundheit',
        'Spielzeug & Kinder',
        'Bücher & Medien',
        'Auto & Motorrad',
        'Baumarkt & Garten',
      ],
      weeklyOffer: {
        title: 'Angebote der Woche',
        detail: 'Bis zu 40% Rabatt auf ausgewählte Produkte',
        action: 'Jetzt entdecken',
      },
      hero: {
        eyebrow: 'Sommer-Sale',
        title: 'Bis zu 40% sparen!',
        detail: 'Entdecke unsere besten Angebote',
        action: 'Jetzt shoppen',
      },
      serviceHighlights: [
        { title: 'Kostenloser Versand', detail: 'Ab 50 € Bestellwert' },
        { title: 'Sichere Bezahlung', detail: '100% Käuferschutz' },
        { title: '30 Tage Rückgabe', detail: 'Einfach & kostenlos' },
        { title: '24/7 Kundenservice', detail: 'Wir sind für dich da' },
      ],
      popularHeading: 'Beliebte Kategorien',
      showAllAction: 'Alle anzeigen',
      popularCategories: [
        'Elektronik',
        'Mode',
        'Haus & Garten',
        'Sport',
        'Beauty',
        'Spielzeug',
      ],
      recommendedHeading: 'Empfohlene Produkte',
      recommendedProducts: [
        { name: 'Kabellose Kopfhörer', detail: 'SoundPro X1', price: '59,99 €', rating: '128' },
        { name: 'Fitnessuhr', detail: 'Active Watch 4', price: '89,90 €', rating: '84' },
        { name: 'Reiserucksack', detail: 'Urban Explorer', price: '44,95 €', rating: '206' },
        { name: 'Tischleuchte', detail: 'Nordic Light', price: '32,50 €', rating: '61' },
        { name: 'Trinkflasche', detail: 'Steel 750', price: '18,99 €', rating: '143' },
        { name: 'Bluetooth-Lautsprecher', detail: 'Mini Beat', price: '39,90 €', rating: '97' },
      ],
    },
  },
  passwordManager: {
    generatedPassword: s12PasswordManagerContent.generator.password,
    maskedPassword: s12PasswordManagerContent.vault.entry.maskedPassword,
    suggestAction: 'Sicher erzeugtes Passwort verwenden',
    saveTitle: 'Passwort für My Shop speichern?',
    usernameLabel: 'Benutzername',
    passwordLabel: 'Passwort',
    saveAction: 'Speichern',
    dismissSaveAction: 'Nicht jetzt',
    savedStatus: 'Passwort gespeichert',
    storedEntryLabel: 'Gespeicherter My-Shop-Eintrag',
    autofillListLabel: 'Einträge des Passwortmanagers',
    autofillAccounts: [
      { id: 'my-shop', label: 'My Shop' },
      { id: 'campusgram', label: 'Campusgram' },
      { id: 'master-campus', label: 'Master Campus' },
      { id: 'campus-email', label: 'Campus E-Mail' },
    ],
  },
  flow: [
    { id: 'generate', label: 'Erzeugen' },
    { id: 'store', label: 'Speichern' },
    { id: 'fill', label: 'Ausfüllen' },
  ],
  progressLabel: (completed: number) =>
    `Passwortmanager-Übung: ${completed}/3 Schritte abgeschlossen`,
  guide: {
    name: 'PassWo',
    helpLabel: 'PassWo-Hinweis öffnen',
    hints: {
      generate:
        'Klicke in das Passwortfeld und wähle den Vorschlag des integrierten Passwortmanagers.',
      store:
        'Registriere das Konto und bestätige danach den Speichern-Hinweis des Browsers.',
      fill:
        'Wähle den gespeicherten Eintrag aus und klicke nach dem Ausfüllen selbst auf Anmelden.',
    },
    saved: 'Der Eintrag ist im Tresor gespeichert. Melde dich noch einmal an.',
    saveDeclined: {
      first: 'Das Passwort ist damit noch nicht im Passwortmanager gespeichert.',
      second:
        'Dann kann er es beim nächsten Anmelden auch nicht wieder für dich einsetzen. Öffne den Speicherhinweis noch einmal und speichere den Eintrag.',
    },
    complete:
      'Geschafft! Schließe den Browser und schau, was sich im Netzwerk verändert hat.',
  },
  network: {
    accountLabel: 'My Shop',
    accountDescription:
      'Neu angelegtes fiktives Konto mit einem im Browser gespeicherten Passwort.',
    existingAccount: {
      label: 'Muster Bank',
      description:
        'Bestehendes fiktives Konto mit einer noch nicht geänderten Passwortbeziehung.',
    },
    importedVault: {
      title: 'Gespeicherte Zugangsdaten',
      ariaLabel: 'Geöffneter Passwortmanager-Tresor mit gespeicherten Zugangsdaten',
      maskedPassword: '••••••••••••',
      entries: [
        { id: 'my-shop', label: 'My Shop', symbolId: 'my-shop' },
        { id: 'campusgram', label: 'Campusgram', symbolId: 'campusgram' },
        { id: 'master-campus', label: 'Master Campus', symbolId: 'master-campus' },
        { id: 'campus-email', label: 'Campus E-Mail', symbolId: 'campus-email' },
        { id: 'muster-bank', label: 'Muster Bank', symbolId: 'muster-bank' },
        { id: 'campus-cloud', label: 'Campus Cloud', symbolId: 'campus-cloud' },
        { id: 'lernportal', label: 'Lernportal', symbolId: 'account' },
        { id: 'fotobox', label: 'Fotobox', symbolId: 'account' },
        { id: 'musikstream', label: 'Musikstream', symbolId: 'account' },
      ],
      moreLabel: 'Weitere gespeicherte Zugangsdaten …',
    },
    guide: {
      newAccount:
        'Das neue Konto startet direkt mit einem eigenen starken Passwort.',
      existingAccount:
        'Viele Passwortmanager können vorhandene Zugangsdaten auch importieren. In unserer Übung sind sie bereits gespeichert.',
      unchangedAtService:
        'Dadurch ändert sich das Passwort beim jeweiligen Dienst aber noch nicht.',
      reusedPassword:
        'Muster Bank verwendet zum Beispiel noch dasselbe Passwort wie ein anderes Konto.',
      replaceAtService:
        'Um das zu ändern, musst du das Passwort direkt bei Muster Bank in den Einstellungen ersetzen. Lass dir dafür vom Passwortmanager ein neues erzeugen.',
      passwordChanged:
        'Muster Bank hat jetzt ein eigenes Passwort. Der bisherige Verbindungsweg ist weg.',
      campusgramTransition:
        'Versuch dich zum Abschluss noch einmal bei Campusgram anzumelden. Deine Passphrase ist bereits im Passwortmanager gespeichert.',
    },
  },
  conclusion: {
    remainingAccounts: {
      guide: {
        intro: 'Die übrigen Konten musst du nicht alle auf einmal umstellen.',
        pace:
          'Neue Konten kannst du ab jetzt direkt so anlegen. Bestehende kannst du nach und nach ändern, wenn du sie ohnehin wieder benutzt.',
      },
    },
    variants: {
      returnGuide:
        'Bleibt noch die Frage, welcher Passwortmanager eher zu deinem Alltag passt.',
      integrated: {
        id: 'integrated',
        title: 'Integriert passt eher, wenn …',
        bullets: [
          'du möglichst wenig zusätzlich einrichten möchtest',
          'du überwiegend denselben Browser oder dasselbe Plattform-Ökosystem nutzt',
        ],
      },
      separate: {
        id: 'separate',
        title: 'Eigenständig passt eher, wenn …',
        bullets: [
          'du zwischen verschiedenen Browsern oder Betriebssystemen wechselst',
          'du denselben Tresor unabhängig vom einzelnen Browser nutzen möchtest',
        ],
      },
      fitGuide: 'Beide Wege können starke und einzigartige Passwörter für dich verwalten.',
      question: 'Was würde eher zu deinem Alltag passen?',
      options: {
        integrated: 'Integriert',
        separate: 'Separat',
      },
    },
    recovery: {
      title: 'Was passiert, wenn dein Gerät verloren geht?',
      oldDevice: {
        label: 'Altes Gerät',
        status: 'Gerät verloren',
      },
      path: {
        label: 'Wiederherstellungsweg',
      },
      newDevice: {
        label: 'Neues Gerät',
        status: 'Tresor wieder verfügbar',
      },
      guide: {
        lost:
          'Ein verlorenes Gerät heißt nicht automatisch, dass dein Passwort-Tresor verloren ist.',
        path:
          'Viele Passwortmanager bieten einen Weg, ihn auf einem neuen Gerät wieder zu nutzen.',
        restored:
          'Schau bei deinem eigenen nach, wie dieser Weg aussieht und was du dafür brauchst.',
      },
      continueAction: 'Weiter',
    },
    network: {
      guide: {
        repaired:
          'So sieht das Netzwerk aus, wenn jedes Konto ein eigenes starkes Passwort verwendet.',
      },
      repairAction: 'Alle Passwörter beheben',
      repairedAriaLabel:
        'Geordnetes Kontonetzwerk: Jedes Konto verwendet ein eigenes starkes Passwort und trägt einen Schutzschild.',
    },
    mfa: {
      previewTitle: 'Angreifer kennt das korrekte Master Campus-Passwort',
      previewLead: 'Bekannt',
      previewAccountSymbolId: 'master-campus',
      protectionPath: {
        shieldLabel: 'Zweite Hürde',
        shieldDescription:
          'Eine zusätzliche Hürde schützt den Zugang zu diesem anderen Konto.',
      },
      guide: {
        passwordKnown:
          'Passwörter können nicht nur erraten werden, sondern auch auf anderen Wegen bekannt werden.',
        passwordInsufficient:
          'Ist ein Passwort einem Angreifer bekannt, reicht selbst ein sehr starkes Passwort allein nicht mehr aus.',
        secondHurdle:
          'Um den Zugang auch dann zu schützen, brauchen wir eine zweite Hürde.',
      },
      transition: {
        title: 'Multi-Faktor-Authentifizierung',
        detail: 'kennenlernen',
        ariaLabel: 'Multi-Faktor-Authentifizierung kennenlernen',
        sectionTransition: {
          sectionLabel: 'Sektion 3 von 3',
          title: 'Multi-Faktor-Authentifizierung',
          parts: [
            {
              id: 'distinguish-factors',
              label: 'Faktoren unterscheiden',
            },
            {
              id: 'set-up-two-factor-authentication',
              label: '2FA einrichten',
            },
          ],
          holdDurationMs: 3500,
        },
      },
    },
  },
  bank: {
    trainingAriaLabel: 'Muster Bank, Passwort mit dem Passwortmanager ändern',
    browser: {
      ariaLabel: 'Fiktiver Browser mit Muster Bank',
      tabId: 'muster-bank',
      tabLabel: 'Muster Bank',
      addresses: {
        login: 'bank.musterbank.example/login',
        overview: 'bank.musterbank.example/uebersicht',
        accounts: 'bank.musterbank.example/konten',
        transfers: 'bank.musterbank.example/ueberweisungen',
        cards: 'bank.musterbank.example/karten',
        settings: 'bank.musterbank.example/einstellungen',
        security: 'bank.musterbank.example/einstellungen/sicherheit',
        password: 'bank.musterbank.example/einstellungen/sicherheit/passwort',
      },
      passwordManagerLabel: 'Integrierter Passwortmanager',
    },
    website: {
      name: 'Muster Bank',
      loginTitle: 'Anmelden',
      usernameLabel: 'Benutzername',
      passwordLabel: 'Passwort',
      loginAction: 'Anmelden',
      incorrectPassword: 'Dieser gespeicherte Eintrag passt nicht zu Muster Bank.',
      signedInStatus: 'Angemeldet',
      welcomeTitle: (username: string) => `Willkommen zurück, ${username}`,
      welcomeDetail: 'Schön, dass Sie wieder da sind.',
      navigationLabel: 'Muster-Bank-Navigation',
      navigation: [
        { id: 'overview', label: 'Übersicht' },
        { id: 'accounts', label: 'Konten' },
        { id: 'transfers', label: 'Überweisungen' },
        { id: 'cards', label: 'Karten' },
        { id: 'settings', label: 'Einstellungen' },
      ],
      logoutLabel: 'Abmelden',
      logoutConfirmation: {
        title: 'Von Muster Bank abmelden?',
        detail: 'Sie gelangen zurück zur Anmeldung.',
        cancelAction: 'Abbrechen',
        confirmAction: 'Abmelden',
      },
      hiddenValue: 'Ausgeblendet',
      maskedBalance: '••••,•• €',
      maskedAccountNumber: 'DE•• •••• •••• •••• ••',
      overview: {
        balanceTitle: 'Gesamtsaldo',
        allAccountsLabel: 'Alle Konten',
        accountsTitle: 'Meine Konten',
        accountCountLabel: 'Kontenübersicht',
        privacyTitle: 'Geschützte Kontodarstellung',
        privacyDetail:
          'Salden, Kontonummern und Buchungsdetails bleiben in dieser Übung verdeckt.',
        quickActionsTitle: 'Direkt erledigen',
        quickActions: [
          { title: 'Überweisen', detail: 'Neue Überweisung vorbereiten' },
          { title: 'Daueraufträge', detail: 'Regelmäßige Aufträge verwalten' },
          { title: 'Karten', detail: 'Karten und Funktionen aufrufen' },
          { title: 'Dokumente', detail: 'Mitteilungen und Unterlagen ansehen' },
        ],
        activityTitle: 'Letzte Aktivitäten',
        activityPlaceholder: 'Kontobewegungen sind in dieser Übung ausgeblendet.',
        activityGroups: ['Kartenzahlungen', 'Überweisungen', 'Lastschriften'],
      },
      accounts: {
        title: 'Konten',
        detail: 'Hier sehen Sie Ihre Konten und deren Details.',
        items: [
          {
            title: 'Girokonto',
            detail: 'Zahlungsverkehr und regelmäßige Aufträge',
            status: 'Hauptkonto',
          },
          {
            title: 'Tagesgeldkonto',
            detail: 'Flexible Rücklage mit separater Übersicht',
            status: 'Rücklage',
          },
          {
            title: 'Sparkonto',
            detail: 'Langfristige Sparziele verwalten',
            status: 'Sparen',
          },
        ],
        availableLabel: 'Verfügbar',
        accountNumberLabel: 'IBAN',
      },
      transfers: {
        title: 'Überweisungen',
        detail: 'Verwalten Sie Überweisungen und Vorlagen.',
        sectionTitle: 'Neue Überweisung',
        sourceAccountLabel: 'Von Konto',
        recipientLabel: 'Empfänger',
        maskedRecipient: '••••••••••',
        ibanLabel: 'IBAN',
        amountLabel: 'Betrag',
        purposeLabel: 'Verwendungszweck',
        reviewAction: 'Weiter zur Prüfung',
        placeholder:
          'Empfänger-, Konto- und Betragsdaten sind in dieser Übung ausgeblendet.',
        templatesTitle: 'Vorlagen',
        templatesDetail: 'Gespeicherte Empfänger und Angaben bleiben verdeckt.',
        scheduledTitle: 'Geplante Aufträge',
        scheduledDetail: 'Daueraufträge und Terminüberweisungen verwalten.',
      },
      cards: {
        title: 'Karten',
        detail: 'Ihre Karten auf einen Blick.',
        items: [
          { title: 'Debitkarte' },
          { title: 'Kreditkarte' },
        ],
        cardNumber: '•••• •••• •••• ••••',
        limitLabel: 'Verfügbares Limit',
        neutralLogoLabel: 'Neutrales Kartenlogo',
        hiddenDetails:
          'Kontozahlen und Umsätze sind in dieser Übung ausgeblendet.',
      },
      settings: {
        title: 'Einstellungen',
        items: [
          {
            id: 'personal',
            title: 'Persönliche Daten',
            detail: 'Name, Adresse und Kontaktdaten',
          },
          {
            id: 'security',
            title: 'Sicherheit',
            detail: 'Passwort, 2-Faktor-Authentifizierung und mehr',
          },
          {
            id: 'notifications',
            title: 'Benachrichtigungen',
            detail: 'E-Mail und Push-Benachrichtigungen verwalten',
          },
          {
            id: 'appearance',
            title: 'Anzeige',
            detail: 'Sprache, Design und Anzeigeoptionen',
          },
          {
            id: 'access',
            title: 'Zugriffsverwaltung',
            detail: 'Verwaltung von Geräten und Sitzungen',
          },
        ],
        securityTitle: 'Sicherheit',
        securityItems: [
          { id: 'password', title: 'Passwort', detail: 'Passwort bei Muster Bank ändern' },
          {
            id: 'two-factor',
            title: '2-Faktor-Authentifizierung',
            detail: 'Zusätzlichen Anmeldeschritt verwalten',
          },
          {
            id: 'devices',
            title: 'Anmeldung und Geräte',
            detail: 'Aktive Sitzungen und Geräte verwalten',
          },
          {
            id: 'security-questions',
            title: 'Sicherheitsfragen',
            detail: 'Hinterlegte Sicherheitsfragen verwalten',
          },
        ],
        passwordTitle: 'Passwort ändern',
        passwordAdvice:
          'Wählen Sie ein starkes Passwort aus, das Sie nicht für andere Konten verwenden.',
        passwordMoreInformationLabel: 'Weitere Informationen',
        passwordMoreInformation:
          'Ein eigenes Passwort trennt die Anmeldung bei Muster Bank von den Zugangsdaten anderer Konten.',
        currentPasswordLabel: 'Altes Passwort',
        newPasswordLabel: 'Neues Passwort',
        confirmNewPasswordLabel: 'Neues Passwort bestätigen',
        changePasswordAction: 'Passwort ändern',
        changingPasswordLabel: 'Passwort wird geändert …',
        passwordChangedStatus: 'Passwort geändert',
      },
    },
    passwordManager: {
      currentPassword: 'Passw0rtGeheim!?',
      generatedPassword: 'M4!rK8#uZ2@pL7$x',
      maskedPassword: s12PasswordManagerContent.vault.entry.maskedPassword,
      suggestAction: 'Sicher erzeugtes Passwort verwenden',
      autofillListLabel: 'Gespeicherte Einträge des Passwortmanagers',
      autofillAccounts: [
        { id: 'muster-bank', label: 'Muster Bank' },
        { id: 'my-shop', label: 'My Shop' },
        { id: 'campusgram', label: 'Campusgram' },
        { id: 'master-campus', label: 'Master Campus' },
        { id: 'campus-email', label: 'Campus E-Mail' },
      ],
      updateTitle: 'Gespeichertes Passwort für Muster Bank aktualisieren?',
      usernameLabel: 'Benutzername',
      passwordLabel: 'Passwort',
      updateAction: 'Aktualisieren',
      dismissUpdateAction: 'Nicht jetzt',
      updatedStatus: 'Passwort aktualisiert',
      storedEntryLabel: 'Gespeicherter Muster-Bank-Eintrag',
    },
    progressLabel: (completed: number) =>
      `Passwort ändern: ${completed}/3 Schritte abgeschlossen`,
    guide: {
      taskLabel: 'Passwort ändern',
      helpLabel: 'PassWo-Hinweis öffnen',
      hints: {
        login:
          'Öffne das Passwortfeld und wähle den gespeicherten Eintrag für Muster Bank.',
        navigate:
          'Öffne Einstellungen, dann Sicherheit und anschließend Passwort.',
        password:
          'Verwende für beide neuen Passwortfelder den Vorschlag des Passwortmanagers und bestätige mit „Passwort ändern“.',
      },
      updateDeclined: {
        first: 'Im Passwortmanager ist damit noch das alte Passwort gespeichert.',
        second:
          'Damit er beim nächsten Anmelden das neue verwendet, öffne den Hinweis noch einmal und aktualisiere den Eintrag.',
        reminder:
          'Aktualisiere den Eintrag, damit der Passwortmanager das neue Passwort verwendet.',
      },
      updated:
        'Jetzt ist auch im Passwortmanager das neue Passwort gespeichert. Melde dich ab und anschließend mit dem neuen Passwort wieder an.',
      autofill:
        'Vorhin hast du den gespeicherten Eintrag noch selbst ausgewählt. Diesmal hat ihn der Passwortmanager direkt ausgefüllt. Bei vielen Anmeldungen kann er das automatisch übernehmen.',
      complete:
        'Schließe den Browser wieder und schau, was die Änderung bei Muster Bank im Netzwerk bewirkt.',
    },
  },
  campusgram: {
    trainingAriaLabel:
      'Campusgram-Anmeldung ohne Autofill über Browser-Einstellungen und Passwortmanager',
    browser: {
      ariaLabel: 'Fiktiver Browser mit Campusgram, Einstellungen und Passwortmanager',
      tabs: {
        campusgram: { id: 'campusgram', label: 'Campusgram' },
        settings: { id: 'browser-settings', label: 'Einstellungen' },
        passwordManager: { id: 'browser-password-manager', label: 'Passwortmanager' },
      },
      addresses: {
        campusgram: 'campusgram.example/login',
        campusgramDashboard: 'campusgram.example',
        settingsGeneral: 'browser.example/einstellungen/allgemein',
        settingsPasswords: 'browser.example/einstellungen/passwoerter',
        passwordManager: 'passwoerter.browser.example',
      },
      menu: {
        label: 'Browsermenü',
        newTabAction: 'Neuer Tab',
        newTabShortcut: '⌘T',
        historyAction: 'Verlauf',
        downloadsAction: 'Downloads',
        downloadsShortcut: '⌘J',
        settingsAction: 'Einstellungen',
        passwordManagerAction: 'Passwortmanager',
        helpAction: 'Hilfe',
      },
    },
    website: {
      interactionLabel: 'Campusgram wieder anmelden',
      dashboardInteractionLabel: 'Campusgram, angemeldet',
      loginTitle: 'Anmelden',
      emailLabel: 'E-Mail',
      passwordLabel: 'Passwort',
      passwordPlaceholder: 'Ihr Passwort',
      showPasswordLabel: 'Passwort anzeigen',
      hidePasswordLabel: 'Passwort verbergen',
      insertAction: 'Einsetzen',
      loginAction: 'Anmelden',
      signedInStatus: 'Angemeldet',
    },
    settings: {
      navigationLabel: 'Einstellungsbereiche',
      activeStatus: 'Aktiv',
      navigation: [
        { id: 'general', label: 'Allgemein' },
        { id: 'account', label: 'Konto & Profil' },
        { id: 'privacy', label: 'Datenschutz & Sicherheit' },
        { id: 'passwords', label: 'Passwörter' },
        { id: 'language', label: 'Sprache & Region' },
        { id: 'appearance', label: 'Darstellung' },
        { id: 'extensions', label: 'Erweiterungen' },
        { id: 'help', label: 'Hilfe' },
      ],
      general: {
        title: 'Allgemein',
        items: [
          {
            title: 'Startseite',
            detail: 'Lege fest, welche Seite beim Start geöffnet wird.',
            value: 'Campusgram Startseite',
          },
          {
            title: 'Neue Tabs',
            detail: 'Lege fest, was in neuen Tabs geöffnet wird.',
            value: 'Neuer Tab – Schnellzugriff',
          },
          {
            title: 'Downloads',
            detail: 'Lege fest, wo heruntergeladene Dateien gespeichert werden.',
            value: 'Download-Ordner',
          },
          {
            title: 'Benachrichtigungen',
            detail: 'Benachrichtigungen im Browser anzeigen.',
            value: 'Aktiv',
          },
          {
            title: 'Standardbrowser',
            detail: 'Diesen Browser als Standard verwenden.',
            value: 'Festlegen',
          },
        ],
      },
      passwords: {
        title: 'Passwörter',
        options: [
          {
            title: 'Passwörter speichern',
            detail: 'Gespeicherte Zugangsdaten im Passwortmanager verwalten.',
          },
          {
            title: 'Automatisches Ausfüllen',
            detail: 'Gespeicherte Passwörter in Anmeldeformularen anbieten.',
          },
          {
            title: 'Passwort-Warnungen',
            detail: 'Hinweise zu erkannten Sicherheitsrisiken anzeigen.',
          },
        ],
        openManagerAction: 'Passwortmanager öffnen',
        openManagerDetail: 'Gespeicherte Zugangsdaten anzeigen und verwalten.',
        informationTitle: 'Eigene Passwörter für jedes Konto',
        informationDetail:
          'Der Passwortmanager ordnet jedem gespeicherten Konto seinen eigenen Eintrag zu.',
      },
    },
    passwordManager: {
      navigationLabel: 'Passwortmanager-Bereiche',
      navigation: [
        { id: 'all', label: 'Alle Passwörter', detail: '' },
        { id: 'checkup', label: 'Check-up', detail: '3' },
        { id: 'alerts', label: 'Passwort-Hinweise', detail: '2' },
        { id: 'notes', label: 'Notizen', detail: '' },
        { id: 'payments', label: 'Zahlungsmethoden', detail: '' },
        { id: 'folders', label: 'Ordner', detail: '' },
        { id: 'settings', label: 'Einstellungen', detail: '' },
      ],
      title: 'Gespeicherte Passwörter',
      searchLabel: 'Passwörter durchsuchen',
      searchPlaceholder: 'Passwörter suchen',
      columns: {
        account: 'Website oder App',
        username: 'Benutzername',
        password: 'Passwort',
        actions: 'Aktionen',
      },
      selectEntry: (account: string) => `${account}-Eintrag auswählen`,
      showPassword: (account: string) => `Passwort für ${account} anzeigen`,
      hidePassword: (account: string) => `Passwort für ${account} verbergen`,
      copyPassword: (account: string) => `Passwort für ${account} kopieren`,
      copyAction: 'Kopieren',
      copiedStatus: 'Kopiert',
      knownAccounts: [
        { id: 'campusgram', label: 'Campusgram', symbolId: 'campusgram' },
        { id: 'master-campus', label: 'Master Campus', symbolId: 'master-campus' },
        { id: 'campus-email', label: 'Campus E-Mail', symbolId: 'campus-email' },
        { id: 'muster-bank', label: 'Muster Bank', symbolId: 'muster-bank' },
        { id: 'my-shop', label: 'My Shop', symbolId: 'my-shop' },
      ],
      additionalUsername: (index: number) =>
        `konto${String(index + 1).padStart(2, '0')}@beispiel.example`,
      additionalPassword: (index: number, label: string) =>
        `Beispiel-${String(index + 1).padStart(2, '0')}-${label.replaceAll(' ', '-')}-Nur-Simulation!`,
      additionalAccounts: [
        'Campus Cloud',
        'Lernportal',
        'Bibliothek Online',
        'Campus Sport',
        'Wohnheim Portal',
        'Mensa Karte',
        'Prüfungsamt',
        'Hochschulforum',
        'Projektboard',
        'Notizbuch',
        'Dateibox',
        'Kalender Plus',
        'Video Campus',
        'Musikraum',
        'Fotobox',
        'Reiseplaner',
        'Ticketportal',
        'Stadtbibliothek',
        'Mobilitätskonto',
        'Energieportal',
        'Versicherungsordner',
        'Terminplaner',
        'Vereinsportal',
        'Nachbarschaftsnetz',
        'Streaming Box',
        'Podcast Studio',
        'Sprachkurs',
        'Lernkarten',
        'Aufgabenplaner',
        'Teamraum',
        'Dokumentenablage',
        'Bewerbungsportal',
        'Karrierenetz',
        'Alumni Portal',
        'Forschungsdaten',
        'Laborbuch',
        'Konferenzkonto',
        'Workshop Planer',
        'Umfrageportal',
        'Ideenboard',
        'Schreibwerkstatt',
        'Druckkonto',
        'Medienausleihe',
        'Raumbuchung',
        'Fahrgemeinschaft',
        'Fahrradstation',
        'Paketstation',
        'Kulturkalender',
        'Stadtpass',
        'Freizeitportal',
        'Kochbuch',
        'Einkaufsliste',
        'Haushaltsplaner',
        'Reisekasse',
        'Wetterarchiv',
        'Leseliste',
        'Filmclub',
        'Musikschule',
        'Sportverein',
        'Kursbuchung',
        'Eventkalender',
        'Gästeportal',
        'Servicekonto',
        'Kundenbereich',
        'Lieferkonto',
        'Reservierungsportal',
        'Werkstattkonto',
        'Gartenplaner',
        'Tierbetreuung',
        'Spendenportal',
        'Ehrenamtsbörse',
        'Community Radio',
        'Cloud Archiv',
        'Digitales Regal',
        'Ideenspeicher',
      ],
    },
    guide: {
      taskLabel: 'Campusgram anmelden',
      fillUnavailable: 'Bei Campusgram klappt das Ausfüllen hier nicht.',
      copyInstruction:
        'Öffne über die Browser-Einstellungen den Passwortmanager und kopiere dort das Campusgram-Passwort zum Anmelden.',
      complete:
        'Wenn Autofill einmal nicht klappt, kannst du das gespeicherte Passwort also auch selbst kopieren und einsetzen. Merken musst du es dir trotzdem nicht.',
    },
  },
} as const;
