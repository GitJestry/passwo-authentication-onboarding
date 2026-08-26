import type { TrainingSectionId } from '@passwo/contracts';

export const S14_MFA_CONTENT_VERSION = '1.4.0';

export type S14FactorId = 'knowledge' | 'possession' | 'biometrics';

export type S14FactorIconId =
  | 'password'
  | 'security-question'
  | 'authenticator-app'
  | 'security-key'
  | 'fingerprint'
  | 'face-recognition';

export const s14MfaContent = {
  version: S14_MFA_CONTENT_VERSION,
  source: {
    revision:
      'Nutzerauftrag vom 2026-08-26 · S14.3 einheitliche Authentifizierungsbegriffe',
    scriptPages: '66-67',
    copyReference: 'docs/design/S14-COPY-AUDIT.md',
  },
  segment: {
    id: 'S14',
    sectionId: 'mfa' as TrainingSectionId,
    slice: 'mfa-and-second-factor',
  },
  trainingAriaLabel: 'Training, Segment S14, MFA und ein zweiter Faktor',
  timings: {
    cleanDesktopDurationMs: 900,
    combinationRevealDurationMs: 620,
    searchResultsDelayMs: 900,
  },
  concepts: {
    mfa: {
      title: 'Multi-Faktor-Authentifizierung',
      abbreviation: 'MFA',
    },
    twoFactor: {
      title: 'Zwei-Faktor-Authentifizierung',
      abbreviation: '2FA',
    },
  },
  factors: [
    {
      id: 'knowledge',
      title: 'Wissen',
      items: [
        { id: 'password', label: 'Passwort', iconId: 'password' },
        {
          id: 'security-question',
          label: 'Sicherheitsfragen',
          iconId: 'security-question',
        },
      ],
    },
    {
      id: 'possession',
      title: 'Besitz',
      items: [
        {
          id: 'authenticator-app',
          label: 'Authenticator-App',
          iconId: 'authenticator-app',
        },
        {
          id: 'security-key',
          label: 'Sicherheitsschlüssel',
          iconId: 'security-key',
        },
      ],
    },
    {
      id: 'biometrics',
      title: 'Biometrie',
      items: [
        {
          id: 'fingerprint',
          label: 'Fingerabdruck',
          iconId: 'fingerprint',
        },
        {
          id: 'face-recognition',
          label: 'Gesichtserkennung',
          iconId: 'face-recognition',
        },
      ],
    },
  ],
  combinations: [
    {
      id: 'password-authenticator-app',
      label: 'Passwort + Authenticator-App',
      valid: true,
    },
    {
      id: 'password-security-key',
      label: 'Passwort + Sicherheitsschlüssel',
      valid: true,
    },
    {
      id: 'password-password',
      label: 'Passwort + Passwort',
      valid: false,
    },
  ],
  guide: {
    name: 'PassWo',
    taskLabel: 'MFA',
    openHelpLabel: 'PassWo-Hinweis öffnen',
    mfa:
      'Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren kombiniert.',
    twoFactor:
      'Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei werden genau zwei unterschiedliche Faktoren kombiniert.',
    factors: {
      knowledge:
        'Der erste Faktor ist Wissen, zum Beispiel dein Passwort, eine PIN oder die Antwort auf eine Sicherheitsfrage.',
      possession:
        'Der zweite Faktor ist Besitz, zum Beispiel eine Authenticator-App auf deinem Handy oder ein Sicherheitsschlüssel.',
      biometrics:
        'Der dritte Faktor ist Biometrie, zum Beispiel Gesichtserkennung oder ein Fingerabdruck.',
    },
    distinct:
      'Entscheidend ist, dass die beiden Faktoren unterschiedlich sind.',
    serviceVariation:
      'Wo du 2FA einschaltest, sieht bei jedem Dienst etwas anders aus.',
    findAvailability:
      'Finde zuerst heraus, ob Master Campus Zwei-Faktor-Authentifizierung anbietet und wo du sie aktivieren kannst.',
    helpFound: 'Gefunden. Aktiviere 2FA jetzt bei Master Campus.',
  },
  browser: {
    ariaLabel: 'Fiktiver Browser mit Master Campus und einem Suchtab',
    masterCampusTab: {
      id: 'master-campus',
      label: 'Master Campus',
      disabledReason:
        'Master Campus wird nach dem Lesen der Hilfeseite freigegeben.',
    },
    searchTab: {
      id: 'mfa-search',
      label: 'Neuer Tab',
      queryLabel: 'Master Campus 2FA aktivieren',
      helpLabel: 'Master Campus Hilfe',
      homeAddress: 'search.example',
      resultsAddress: 'search.example/?q=master+campus+2fa+aktivieren',
      helpAddress: 'hilfe.mastercampus.example/sicherheit/2fa-aktivieren',
    },
    searchPage: {
      landingAriaLabel: 'Fiktive Suchseite für Master Campus 2FA',
      resultsAriaLabel: 'Fiktive Suchergebnisse für Master Campus 2FA',
      brand: 'Search',
      query: 'Master Campus 2FA aktivieren',
      submitLabel: 'Nach Master Campus 2FA aktivieren suchen',
      resultsLoadingLabel: 'Suchergebnisse werden geladen',
      navigation: ['Ergebnisse', 'Anleitungen', 'Videos', 'Foren'],
      primaryResultId: 'master-campus-help',
      results: [
        {
          id: 'master-campus-help',
          siteName: 'Master Campus Hilfe',
          domain: 'https://hilfe.mastercampus.example/sicherheit/2fa-aktivieren',
          title:
            'Zwei-Faktor-Authentifizierung (2FA) aktivieren – Master Campus',
          description:
            'Erfahre, wie du die Zwei-Faktor-Authentifizierung (2FA) für dein Master-Campus-Konto einrichtest und damit die Sicherheit erhöhst.',
        },
        {
          id: 'secure-study',
          siteName: 'Sicheres Studium',
          domain: 'https://www.sicheresstudium.example/ratgeber/2fa',
          title: '2FA im Studium: So schützt du dein Konto',
          description:
            'Warum Zwei-Faktor-Authentifizierung wichtig ist und wie du sie bei Master Campus aktivierst.',
        },
        {
          id: 'tech-campus-blog',
          siteName: 'Tech Campus Blog',
          domain: 'https://blog.techcampus.example/2fa-master-campus',
          title: 'Master Campus: 2FA Schritt für Schritt einrichten',
          description:
            'Eine kurze Anleitung mit Abbildungen zur Aktivierung der Zwei-Faktor-Authentifizierung.',
        },
        {
          id: 'campus-forum',
          siteName: 'Campus Forum',
          domain: 'https://forum.campus.example/t/2fa-master-campus',
          title: '2FA aktivieren – wo finde ich die Einstellung?',
          description:
            'Fragen und Antworten aus der Community zu den Sicherheitseinstellungen von Master Campus.',
        },
      ],
    },
    helpPage: {
      ariaLabel: 'Master-Campus-Hilfeseite zur Zwei-Faktor-Authentifizierung',
      siteName: 'Master Campus',
      searchPlaceholder: 'Hilfe durchsuchen …',
      navigation: ['Startseite', 'Services'],
      breadcrumbs: ['Hilfe', 'Kontosicherheit', 'Zwei-Faktor-Authentifizierung'],
      title: 'Zwei-Faktor-Authentifizierung (2FA) aktivieren',
      locationQuestion: 'Wo aktiviere ich die Zwei-Faktor-Authentifizierung?',
      locationPath: [
        'Einstellungen',
        'Sicherheit',
        'Zwei-Faktor-Authentifizierung',
      ],
      locationAnswer:
        'Öffne in Master Campus die Einstellungen und wähle dort den Bereich Sicherheit.',
      requirementsQuestion: 'Was brauche ich dafür?',
      requirementsAnswer: 'Eine Authenticator-App auf deinem Smartphone.',
      feedbackQuestion: 'War dieser Artikel hilfreich?',
      positiveFeedback: 'Ja',
      negativeFeedback: 'Nein',
    },
  },
} as const;
