import type { TrainingSectionId } from '@passwo/contracts';
import { s12PasswordManagerContent } from './s12.js';

export const S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION = '1.4.0';

export const s13PasswordManagerPracticeContent = {
  version: S13_PASSWORD_MANAGER_PRACTICE_CONTENT_VERSION,
  source: {
    revision:
      'Nutzerauftrag, Gestaltungs- und Interaktionspräzisierung vom 2026-08-25 · 12.3 Ein neues Konto',
    copyReference: 'docs/design/S13-COPY-AUDIT.md',
  },
  segment: {
    id: 'S13',
    sectionId: 'password-manager' as TrainingSectionId,
    slice: 'integrated-password-manager-practice',
  },
  trainingAriaLabel:
    'Training, Segment S13, ein neues Konto mit dem integrierten Passwortmanager anlegen',
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
    suggestAction: 'Starkes Passwort vorschlagen',
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
  },
} as const;
