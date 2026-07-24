import type { AuthoredPasswordComparisonResult, TrainingSectionId } from '@passwo/contracts';

export type S06ConsequenceFixtureId = 'identical' | 'similar' | 'unique' | 'hypothetical';

export interface S06ConsequenceFixture {
  readonly id: S06ConsequenceFixtureId;
  readonly routeId: string;
  readonly label: string;
  readonly targetLabel: string;
  readonly analysis: AuthoredPasswordComparisonResult;
  readonly animationId: string;
}

export const S06_CONSEQUENCE_CONTENT_VERSION = '1.0.0';

const commonAnalysis = {
  source: 'authored-fixture',
  sourceAccountId: 'campus-board',
  targetAccountId: 'target-account',
} as const;

export const s06ConsequenceContent = {
  version: S06_CONSEQUENCE_CONTENT_VERSION,
  source: {
    document: 'research/private/training-script.pdf',
    internalPages: [36, 37, 38, 39, 40] as const,
  },
  segment: {
    id: 'S06',
    sectionId: 'passwords' as TrainingSectionId,
    slice: 'consequence-comparison',
  },
  trainingAriaLabel: 'PassWo Training, Segment S06, Passwortfolgen',
  browser: {
    ariaLabel: 'Fiktive Browseranwendung, Segment S06, Passwortfolgen',
    address: 'campus.example/passwortfolgen',
    tab: {
      id: 'consequence',
      label: 'Einzigartigkeit',
      enabled: true,
    },
  },
  page: {
    eyebrow: 'Einzigartigkeit und Ausbreitung',
    title: 'Wohin kann ein bekanntes Passwort führen?',
    instruction: 'Vergleiche das bekannte CampusBoard-Passwort mit dem ausgewählten Zielkonto.',
    fixtureNotice: 'Deterministische Testszene — keine echte Passwortbewertung',
    start: 'Vergleich starten',
    replay: 'Vergleich wiederholen',
    comparing: 'Passwörter werden anhand des vorgegebenen Ergebnisses verglichen …',
  },
  scene: {
    sourceAccount: {
      label: 'CampusBoard',
      position: { x: 0.05, y: 0.31 },
    },
    targetPosition: { x: 0.63, y: 0.31 },
    shieldPosition: { x: 0.48, y: 0.31 },
    structurePosition: { x: 0.35, y: 0.68 },
    hypotheticalPosition: { x: 0.29, y: 0.01 },
    labels: {
      sourceKnown: 'Passwort in dieser Simulation bekannt',
      targetReady: 'Zielkonto für den Vergleich',
      comparing: 'Vergleich läuft',
      identical: '⚠ Gleiches Passwort · Zugang betroffen',
      similar: '≈ Ähnliche Struktur · Zugang betroffen',
      unique: 'Keine ableitbare Verbindung zu diesem Zielkonto',
      blocked: 'Dieser Angriffsweg ist blockiert',
      structure: 'Gemeinsame Struktur sichtbar',
      structureDescription: 'Gemeinsamer Kern · ähnlicher Aufbau',
      hypothetical: 'Hypothetisches Beispiel — nicht deine Auswahl',
      hypotheticalDescription: 'Diese Szene zeigt dauerhaft eine nicht reale Auswahl.',
    },
    summaries: {
      ready: 'CampusBoard-Passwort bekannt. Der Vergleich mit dem Zielkonto ist bereit.',
      comparing: 'Das vorgegebene Analyseergebnis wird auf die Szene angewendet.',
      identical:
        'Gleiches Passwort: Eine rote direkte Verbindung zeigt, dass der Zugang betroffen ist.',
      similar:
        'Ähnliches Passwort: Eine orange gestrichelte Verbindung und die gemeinsame Struktur zeigen, dass der Zugang betroffen ist.',
      unique:
        'Einzigartiges Passwort: Die Linie stoppt am Schild. Dieser Angriffsweg ist blockiert.',
      hypothetical:
        'Hypothetisches Beispiel, nicht die reale Auswahl: Ein direkter Angriffsweg wird nur als Gegenbeispiel gezeigt.',
    },
  },
  fixtures: [
    {
      id: 'identical',
      routeId: 's06-identical',
      label: 'Gleich',
      targetLabel: 'CampusID',
      analysis: {
        ...commonAnalysis,
        fixtureId: 's06-identical',
        outcome: 'identical',
        context: 'actual-selection',
        cues: ['complete-match'],
      },
      animationId: 's06-compare-identical',
    },
    {
      id: 'similar',
      routeId: 's06-similar',
      label: 'Ähnlich',
      targetLabel: 'CampusMail',
      analysis: {
        ...commonAnalysis,
        fixtureId: 's06-similar',
        outcome: 'similar',
        context: 'actual-selection',
        cues: ['shared-core', 'similar-construction'],
      },
      animationId: 's06-compare-similar',
    },
    {
      id: 'unique',
      routeId: 's06-unique',
      label: 'Einzigartig',
      targetLabel: 'CampusMail',
      analysis: {
        ...commonAnalysis,
        fixtureId: 's06-unique',
        outcome: 'unique',
        context: 'actual-selection',
        cues: [],
      },
      animationId: 's06-compare-unique',
    },
    {
      id: 'hypothetical',
      routeId: 's06-hypothetical',
      label: 'Hypothetisch',
      targetLabel: 'CampusID',
      analysis: {
        ...commonAnalysis,
        fixtureId: 's06-hypothetical',
        outcome: 'identical',
        context: 'hypothetical-example',
        cues: ['complete-match'],
      },
      animationId: 's06-compare-hypothetical',
    },
  ] as const satisfies readonly S06ConsequenceFixture[],
  animations: [
    {
      id: 's06-compare-identical',
      targetId: 'target-account',
      emphasis: 'danger',
    },
    {
      id: 's06-compare-similar',
      targetId: 'target-account',
      emphasis: 'warning',
    },
    {
      id: 's06-compare-unique',
      targetId: 'target-account',
      emphasis: 'positive',
    },
    {
      id: 's06-compare-hypothetical',
      targetId: 'target-account',
      emphasis: 'info',
    },
  ] as const,
} as const;

export function getS06ConsequenceFixture(
  fixtureId: S06ConsequenceFixtureId,
): S06ConsequenceFixture {
  return (
    s06ConsequenceContent.fixtures.find(({ id }) => id === fixtureId) ??
    s06ConsequenceContent.fixtures[0]
  );
}

export function getS06ConsequenceAnimation(animationId: string) {
  const authored = s06ConsequenceContent.animations.find(({ id }) => id === animationId);
  if (authored === undefined) return undefined;
  return {
    id: authored.id,
    steps: [
      {
        type: 'highlight' as const,
        targetId: authored.targetId,
        emphasis: authored.emphasis,
        durationMs: 360,
      },
    ],
    reducedMotion: {
      strategy: 'instant-end-state' as const,
      maxDurationMs: 0,
    },
    maxDurationMs: 360,
  };
}
