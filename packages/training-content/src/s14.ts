import type { TrainingSectionId } from '@passwo/contracts';

export const S14_MFA_CONTENT_VERSION = '1.1.0';

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
    revision: 'Nutzerauftrag vom 2026-08-26 · S14.0 MFA und ein zweiter Faktor',
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
  },
  concepts: {
    mfa: {
      title: 'Multi-Faktor-Authentisierung',
      abbreviation: 'MFA',
    },
    twoFactor: {
      title: 'Zwei-Faktor-Authentisierung',
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
      'Bei der Multi-Faktor-Authentifizierung (MFA) werden für die Anmeldung mehrere unterschiedliche Faktoren miteinander kombiniert.',
    twoFactor:
      'Eine besonders häufige Form ist die Zwei-Faktor-Authentifizierung (2FA). Dabei kommen genau zwei unterschiedliche Faktoren zusammen.',
    factors: {
      knowledge:
        'Es gibt drei Faktoren: Erstens Wissen, wie dein Passwort, deine PIN oder Sicherheitsfragen.',
      possession:
        'Zweitens etwas, das du besitzt, wie deine Authenticator-App auf dem Handy oder einen zusätzlichen USB-Sicherheitsschlüssel zum Verifizieren.',
      biometrics:
        'Und drittens ein Körpermerkmal, das du schon tagtäglich nutzt, wie Gesichtserkennung oder Fingerabdrücke.',
    },
    distinct:
      'Entscheidend ist, dass die beiden Faktoren unterschiedlich sind.',
  },
  browser: {
    ariaLabel: 'Fiktiver Browser mit Master Campus und einem Suchtab',
    masterCampusTab: {
      id: 'master-campus',
      label: 'Master Campus',
      disabledReason: 'Master Campus wird erst im nächsten Schritt geöffnet.',
    },
    searchTab: {
      id: 'mfa-search',
      label: 'Neuer Tab',
      address: 'search.example',
    },
    searchPage: {
      ariaLabel: 'Startseite der fiktiven Suche',
      brand: 'Search',
    },
  },
} as const;
