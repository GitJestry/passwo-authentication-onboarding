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
    readonly paragraphs: readonly [string, string, string];
    readonly continueLabel: string;
    readonly completedLabel: string;
  };
  readonly controls: {
    readonly timingFailure: string;
    readonly timingSaving: string;
    readonly retry: string;
  };
}

export const S04_CONTENT_VERSION = '1.9.0';

export const s04Content: S04SegmentContent = {
  version: S04_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [12],
    revision: 'Userauftrag vom 2026-08-10 · Angreiferperspektive als Übergang',
    copyReference:
      'docs/design/S00-S05-COPY-AUDIT.md#copy-delta-s04-angreiferperspektive-10-august-2026',
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
      'Wie schwer wäre es für einen Angreifer, dein Passwort herauszufinden?',
      'Dafür schauen wir uns an, wie der Angreifer dabei vorgeht.',
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
