import type { TrainingSectionId } from '@passwo/contracts';
import { s12PasswordManagerContent } from './s12.js';

export const S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION = '2.2.0';

export const s13PasswordManagerPracticeContent = {
  version: S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION,
  source: {
    revision:
      'Nutzeraufträge vom 2026-08-25 · robuste Autofill-Auswahl und präzisierter Muster-Bank-Abschluss',
    copyReference: 'docs/design/S13-COPY-AUDIT.md',
  },
  segment: {
    id: 'S13',
    sectionId: 'password-manager' as TrainingSectionId,
    slice: 'integrated-password-manager-practice',
  },
  trainingAriaLabel:
    'Training, Segment S13, ein neues Konto und Passwortwechsel bei Muster Bank mit dem Passwortmanager',
  browser: {
    ariaLabel: 'Fiktiver Browser mit My Shop',
    tabId: 'my-shop',
    tabLabel: 'My Shop',
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
      loginAction: 'Weiter',
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
} as const;
