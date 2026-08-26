import type { TrainingSectionId } from '@passwo/contracts';

export const S15_S17_MFA_CONCLUSION_CONTENT_VERSION = '1.2.0';

export const s15ToS17MfaConclusionContent = {
  version: S15_S17_MFA_CONCLUSION_CONTENT_VERSION,
  source: {
    revision:
      'Nutzerauftrag vom 2026-08-26 · MFA-Hervorhebungen, Knotenpuls und zentraler Abschluss',
    scriptPages: '67-71',
    copyReference: 'docs/design/S15-S17-COPY-AUDIT.md',
  },
  segments: [
    {
      id: 'S15',
      sectionId: 'mfa' as TrainingSectionId,
      slice: 'second-factor-effect',
    },
    {
      id: 'S16',
      sectionId: 'mfa' as TrainingSectionId,
      slice: 'prioritize-and-expand',
    },
    {
      id: 'S17',
      sectionId: 'mfa' as TrainingSectionId,
      slice: 'integrated-conclusion',
    },
  ],
  trainingAriaLabel: 'Training, Segmente S15 bis S17, 2FA ausweiten und abschließen',
  timings: {
    resultCelebrationDurationMs: 2_600,
    reducedResultConfirmationDurationMs: 1_100,
  },
  status: {
    activated: '2FA aktiviert',
  },
  network: {
    knownAccountIds: [
      'master-campus',
      'campus-email',
      'campusgram',
      'my-shop',
      'muster-bank',
    ],
    additionalAccountStride: 4,
    masterCampusProtectedAriaLabel:
      'Master Campus trägt nach der 2FA-Aktivierung einen blauen Schutzschild mit lilafarbenen Ketten. Die zuvor gezeigten grünen Wege sind verschwunden.',
    expandedProtectionAriaLabel:
      'Die bekannten Trainingskonten und ein Teil der weiteren Beispielkonten tragen lilafarbene Ketten für aktivierte Zwei-Faktor-Authentifizierung.',
  },
  guide: {
    name: 'PassWo',
    taskLabel: '2FA',
    openHelpLabel: 'PassWo-Hinweis öffnen',
    outcome: {
      passwordAlone: 'Jetzt reicht das Passwort allein nicht mehr für die Anmeldung.',
      secondFactor:
        'Selbst wenn es bekannt wird, müsste der Angreifer zusätzlich an deinen zweiten Faktor gelangen.',
    },
    prioritize: {
      effort:
        'Es kann sich zuerst nach viel anfühlen, 2FA für viele Konten einzurichten. Das ist völlig normal.',
      importantAccounts: 'Fang deshalb auch hier zuerst bei deinen wichtigen Konten an.',
    },
    expandAction: 'Schutz auf weitere Konten ausweiten',
    expanded: {
      howTo:
        'Bei anderen Konten kannst du genauso vorgehen: Prüfe, ob 2FA angeboten wird, und suche in den Sicherheits- oder Kontoeinstellungen nach der Aktivierung.',
      summary:
        'Unsere Konten haben jetzt eigene starke Passwörter. Und bei wichtigen Konten reicht das Passwort für den Angreifer allein nicht mehr aus.',
    },
    completeAction: 'Training abschließen',
  },
} as const;
