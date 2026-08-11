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
    readonly continueLabel: string;
    readonly completedLabel: string;
  };
  readonly controls: {
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
}

export const S04_CONTENT_VERSION = '1.9.2';

export const s04Content: S04SegmentContent = {
  version: S04_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [12],
    revision: 'Userauftrag vom 2026-08-11 · direkte Angreiferfrage',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s03-bis-s05-direktes-szenarioframing-11-august-2026',
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
