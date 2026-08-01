import type { TrainingSectionId } from '@passwo/contracts';

export type S06ConsequenceFixtureId =
  | 'identical'
  | 'similar'
  | 'no-derived-path'
  | 'hypothetical';
export type S06ConsequenceResultKey =
  | 'equal'
  | 'similar'
  | 'no-derived-path'
  | 'hypothetical';
export type S06ConsequenceEmphasis = 'danger' | 'warning' | 'neutral' | 'info';
export type S06ConsequenceContentPhase = 'ready' | 'comparing' | 'complete';

export interface S06ConsequenceExplanation {
  readonly body: string;
  readonly listItems: readonly string[];
}

export interface S06ConsequenceSemanticContent {
  readonly emphasis: S06ConsequenceEmphasis;
  readonly symbolId: 'annotation' | 'structure' | 'hypothetical';
  readonly label: string;
}

export interface S06ConsequenceResultContent {
  readonly key: S06ConsequenceResultKey;
  readonly scenarioLabel: string;
  readonly comparisonTitle: string;
  readonly targetLabel: string;
  readonly hypotheticalNotice: string | null;
  readonly explanations: Readonly<Record<S06ConsequenceContentPhase, S06ConsequenceExplanation>>;
  readonly semantic: S06ConsequenceSemanticContent;
}

export interface S06ConsequenceFixture {
  readonly id: S06ConsequenceFixtureId;
  readonly kind: 'authored-fixture';
  readonly routeId: string;
  readonly resultKey: S06ConsequenceResultKey;
  readonly sourcePassword: string;
  readonly targetPassword: string;
  readonly sourceAccountId: string;
  readonly targetAccountId: string;
  readonly context: 'actual-selection' | 'hypothetical-example';
  readonly animationId: string;
}

export const S06_CONSEQUENCE_CONTENT_VERSION = '1.4.0';

const commonScene = {
  sourceAccountId: 'campus-board',
  targetAccountId: 'target-account',
} as const;

const results: Record<S06ConsequenceResultKey, S06ConsequenceResultContent> = {
  equal: {
    key: 'equal',
    scenarioLabel: 'Szenario: Gleich',
    comparisonTitle: 'Vergleich mit Master Campus',
    targetLabel: 'Master Campus',
    hypotheticalNotice: null,
    explanations: {
      ready: { body: 'Der Vergleich ist bereit.', listItems: [] },
      comparing: {
        body: 'Die beiden fiktiven Passwörter werden mit den begrenzten Regeln verglichen …',
        listItems: [],
      },
      complete: {
        body: 'Gleiches Passwort: Der Zugang zum Zielkonto ist in dieser Szene betroffen.',
        listItems: [],
      },
    },
    semantic: {
      emphasis: 'danger',
      symbolId: 'annotation',
      label: 'Direkter Weg · gleiches Passwort',
    },
  },
  similar: {
    key: 'similar',
    scenarioLabel: 'Szenario: Ähnlich',
    comparisonTitle: 'Vergleich mit Campus E-Mail',
    targetLabel: 'Campus E-Mail',
    hypotheticalNotice: null,
    explanations: {
      ready: { body: 'Der Vergleich ist bereit.', listItems: [] },
      comparing: {
        body: 'Die beiden fiktiven Passwörter werden mit den begrenzten Regeln verglichen …',
        listItems: [],
      },
      complete: {
        body: 'Ähnliche Struktur: Der Zugang zum Zielkonto ist in dieser Szene betroffen.',
        listItems: ['Gemeinsamer Kern', 'Ähnlicher Aufbau'],
      },
    },
    semantic: {
      emphasis: 'warning',
      symbolId: 'structure',
      label: 'Ähnliche Struktur · gestrichelter Weg',
    },
  },
  'no-derived-path': {
    key: 'no-derived-path',
    scenarioLabel: 'Szenario: Begrenzter Vergleich',
    comparisonTitle: 'Kein ableitbarer Weg erkannt',
    targetLabel: 'Campus E-Mail',
    hypotheticalNotice: null,
    explanations: {
      ready: { body: 'Der Vergleich ist bereit.', listItems: [] },
      comparing: {
        body: 'Die beiden fiktiven Passwörter werden mit den begrenzten Regeln verglichen …',
        listItems: [],
      },
      complete: {
        body: 'Mit den begrenzten Vergleichsregeln dieser Simulation wurde kein ableitbarer Weg zwischen den beiden Passwörtern erkannt.',
        listItems: [],
      },
    },
    semantic: {
      emphasis: 'neutral',
      symbolId: 'annotation',
      label: 'Kein ableitbarer Weg erkannt.',
    },
  },
  hypothetical: {
    key: 'hypothetical',
    scenarioLabel: 'Szenario: Hypothetisch',
    comparisonTitle: 'Vergleich mit Master Campus',
    targetLabel: 'Master Campus',
    hypotheticalNotice: 'Hypothetisches Beispiel — nicht deine Auswahl',
    explanations: {
      ready: { body: 'Der Vergleich ist bereit.', listItems: [] },
      comparing: {
        body: 'Die beiden fiktiven Passwörter werden mit den begrenzten Regeln verglichen …',
        listItems: [],
      },
      complete: {
        body: 'Dieses direkte Ergebnis gehört nur zum hypothetischen Gegenbeispiel und nicht zu einer realen Auswahl.',
        listItems: [],
      },
    },
    semantic: {
      emphasis: 'info',
      symbolId: 'hypothetical',
      label: 'Hypothetischer Weg · nicht reale Auswahl',
    },
  },
};

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
      label: 'Passwortvergleich',
      enabled: true,
    },
  },
  page: {
    eyebrow: 'Vergleich und Ausbreitung',
    title: 'Wohin kann ein bekanntes Passwort führen?',
    instruction: 'Vergleiche das bekannte Campusgram-Passwort mit dem ausgewählten Zielkonto.',
    fixtureNotice: 'Vorgegebenes Beispiel — keine echte Passwortbewertung',
    start: 'Vergleich starten',
    replay: 'Vergleich wiederholen',
    continue: 'Weiter',
  },
  scene: {
    sourceAccount: {
      label: 'Campusgram',
      position: { x: 0.05, y: 0.31 },
    },
    targetPosition: { x: 0.63, y: 0.31 },
    structurePosition: { x: 0.35, y: 0.68 },
    hypotheticalPosition: { x: 0.29, y: 0.01 },
    labels: {
      sourceKnown: 'Passwort in dieser Simulation bekannt',
      targetReady: 'Zielkonto für den Vergleich',
      comparing: 'Vergleich läuft',
      identical: 'Gleiches Passwort · Zugang betroffen',
      similar: 'Ähnliche Struktur · Zugang betroffen',
      noDerivedPath: 'Kein ableitbarer Weg erkannt.',
      structure: 'Gemeinsame Struktur sichtbar',
      structureDescription: 'Gemeinsamer Kern · ähnlicher Aufbau',
      hypothetical: 'Hypothetisches Beispiel — nicht deine Auswahl',
      hypotheticalDescription: 'Diese Szene zeigt dauerhaft eine nicht reale Auswahl.',
    },
    summaries: {
      ready: 'Campusgram-Passwort bekannt. Der Vergleich mit dem Zielkonto ist bereit.',
      comparing: 'Die begrenzten Vergleichsregeln werden auf die fiktiven Passwörter angewendet.',
      identical:
        'Gleiches Passwort: Eine rote direkte Verbindung zeigt, dass der Zugang betroffen ist.',
      similar:
        'Ähnliches Passwort: Eine orange gestrichelte Verbindung und die gemeinsame Struktur zeigen, dass der Zugang betroffen ist.',
      noDerivedPath:
        'Mit den begrenzten Vergleichsregeln dieser Simulation wurde kein ableitbarer Weg zwischen den beiden Passwörtern erkannt.',
      hypothetical:
        'Hypothetisches Beispiel, nicht die reale Auswahl: Ein direkter Angriffsweg wird nur als Gegenbeispiel gezeigt.',
    },
  },
  fixtures: [
    {
      id: 'identical',
      kind: 'authored-fixture',
      routeId: 's06-identical',
      resultKey: 'equal',
      sourcePassword: 'Campus2026!',
      targetPassword: 'Campus2026!',
      ...commonScene,
      context: 'actual-selection',
      animationId: 's06-compare-identical',
    },
    {
      id: 'similar',
      kind: 'authored-fixture',
      routeId: 's06-similar',
      resultKey: 'similar',
      sourcePassword: 'Campus2025!',
      targetPassword: 'Campus2026?',
      ...commonScene,
      context: 'actual-selection',
      animationId: 's06-compare-similar',
    },
    {
      id: 'no-derived-path',
      kind: 'authored-fixture',
      routeId: 's06-no-derived-path',
      resultKey: 'no-derived-path',
      sourcePassword: 'MorgenKaffee7',
      targetPassword: 'MorgenTasse7',
      ...commonScene,
      context: 'actual-selection',
      animationId: 's06-compare-no-derived-path',
    },
    {
      id: 'hypothetical',
      kind: 'authored-fixture',
      routeId: 's06-hypothetical',
      resultKey: 'hypothetical',
      sourcePassword: 'Campus2026!',
      targetPassword: 'Campus2026!',
      ...commonScene,
      context: 'hypothetical-example',
      animationId: 's06-compare-hypothetical',
    },
  ] as const satisfies readonly S06ConsequenceFixture[],
  results,
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
      id: 's06-compare-no-derived-path',
      targetId: 'target-account',
      emphasis: 'info',
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

export function getS06ConsequenceResultContent(
  resultKey: S06ConsequenceResultKey,
): S06ConsequenceResultContent {
  return s06ConsequenceContent.results[resultKey];
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
