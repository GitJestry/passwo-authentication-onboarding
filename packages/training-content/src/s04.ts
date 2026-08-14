import type { TrainingSectionId } from '@passwo/contracts';

export interface S04SegmentContent {
  readonly version: string;
  readonly source: {
    readonly document: string;
    readonly internalPages: readonly [12];
    readonly revision: string;
    readonly copyReference: string;
  };
  readonly segment: {
    readonly id: 'S04';
    readonly sectionId: TrainingSectionId;
  };
  readonly trainingAriaLabel: string;
  readonly browser: {
    readonly ariaLabel: string;
    readonly address: string;
    readonly tabWarningLabel: string;
  };
  readonly notice: {
    readonly title: string;
    readonly paragraphs: readonly [string, string];
    readonly advisory: string;
    readonly passwordChangeLabel: string;
    readonly passwordChange: {
      readonly address: string;
      readonly tabLabel: string;
      readonly backLabel: string;
      readonly securityContext: string;
      readonly settingsAriaLabel: string;
      readonly settingsTitle: string;
      readonly settingsNavigation: readonly [string, string, string];
      readonly title: string;
      readonly safetyNote: string;
      readonly currentPasswordLabel: string;
      readonly newPasswordLabel: string;
      readonly confirmPasswordLabel: string;
      readonly submitLabel: string;
      readonly mismatchError: string;
      readonly unchangedError: string;
      readonly completedTitle: string;
      readonly completedBody: string;
      readonly completedAction: string;
    };
    readonly continueLabel: string;
    readonly completedLabel: string;
  };
  readonly controls: {
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
}

export const S04_CONTENT_VERSION = '1.10.0';

export const s04Content: S04SegmentContent = {
  version: S04_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [12],
    revision: 'Userauftrag vom 2026-08-14 · Campusgram-Passwortwechsel',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s04-campusgram-passwortwechsel-14-august-2026',
  },
  segment: {
    id: 'S04',
    sectionId: 'passwords',
  },
  trainingAriaLabel: 'PassWo Training, Segment S04, Datenleck bei Campusgram',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S04, Campusgram-Warnung',
    address: 'campusgram.campus.example/sicherheitswarnung',
    tabWarningLabel: 'Warnung bei Campusgram',
  },
  notice: {
    title: 'Datenleck bei Campusgram',
    paragraphs: [
      'Bei Campusgram gab es ein Datenleck. Eine alte Datei mit gespeicherten Passwortdaten ist in fremde Hände geraten.',
      'Wie geht ein Angreifer vor, um das Campusgram-Passwort herauszufinden?',
    ],
    advisory:
      'Um dein Konto zu schützen, solltest du das fiktive Campusgram-Passwort jetzt ersetzen.',
    passwordChangeLabel: 'Passwort jetzt ändern',
    passwordChange: {
      address: 'campusgram.campus.example/konto/passwort',
      tabLabel: 'Passwort ändern',
      backLabel: 'Zurück zu Campusgram',
      securityContext: 'Konto und Sicherheit',
      settingsAriaLabel: 'Kontoeinstellungen',
      settingsTitle: 'Kontoeinstellungen',
      settingsNavigation: ['Passwort', 'Privatsphäre', 'Benachrichtigungen'],
      title: 'Campusgram-Passwort ändern',
      safetyNote:
        'Verwende hier ausschließlich das fiktive Campusgram-Passwort aus dieser Übung. Deine Eingaben bleiben flüchtig und werden nicht gespeichert.',
      currentPasswordLabel: 'Aktuelles fiktives Passwort',
      newPasswordLabel: 'Neues fiktives Passwort',
      confirmPasswordLabel: 'Neues fiktives Passwort bestätigen',
      submitLabel: 'Passwort ändern',
      mismatchError: 'Die beiden neuen Passwörter stimmen nicht überein.',
      unchangedError: 'Das neue Passwort muss sich vom bisherigen fiktiven Passwort unterscheiden.',
      completedTitle: 'Passwortwechsel simuliert',
      completedBody: 'Die Eingaben wurden verworfen und nicht gespeichert.',
      completedAction: 'Zurück zu Campusgram',
    },
    continueLabel: 'Angreiferperspektive',
    completedLabel: 'Die Erklärung zum Datenleck ist abgeschlossen.',
  },
  controls: {
    timingFailure:
      'Das Speichern des Zeitereignisses ist fehlgeschlagen. Der nächste Schritt bleibt gesperrt.',
    timingSaving: 'Zeitereignis wird gespeichert …',
    retry: 'Erneut versuchen',
  },
};
