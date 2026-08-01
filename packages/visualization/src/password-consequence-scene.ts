import type {
  AuthoredPasswordComparisonFixture,
  PasswordComparisonResult,
} from '@passwo/contracts';
import type { AuthoredPosition, NetworkSceneSnapshot, SceneEdge, SceneNode } from './scene.js';

export interface PasswordConsequenceSceneDefinition {
  readonly id: string;
  readonly comparisonFixture: AuthoredPasswordComparisonFixture;
  readonly animationId: string;
  readonly sourceAccount: {
    readonly label: string;
    readonly position: AuthoredPosition;
  };
  readonly targetAccount: {
    readonly label: string;
    readonly position: AuthoredPosition;
  };
  readonly structurePosition: AuthoredPosition;
  readonly hypotheticalPosition: AuthoredPosition;
  readonly labels: {
    readonly sourceKnown: string;
    readonly targetReady: string;
    readonly comparing: string;
    readonly identical: string;
    readonly similar: string;
    readonly noDerivedPath: string;
    readonly structure: string;
    readonly structureDescription: string;
    readonly hypothetical: string;
    readonly hypotheticalDescription: string;
  };
  readonly summaries: {
    readonly ready: string;
    readonly comparing: string;
    readonly identical: string;
    readonly similar: string;
    readonly noDerivedPath: string;
    readonly hypothetical: string;
  };
}

export type PasswordConsequenceScenePhase = 'ready' | 'comparing' | 'complete';

export interface PasswordConsequenceSceneSnapshot {
  readonly phase: PasswordConsequenceScenePhase;
  readonly analysis: PasswordComparisonResult;
  readonly network: NetworkSceneSnapshot;
  readonly pendingAnimationId: string | null;
}

export type PasswordConsequenceSceneEvent =
  | { readonly type: 'comparison-started' }
  | { readonly type: 'animation-settled'; readonly animationId: string };

export type PasswordConsequenceSceneEffect = {
  readonly type: 'play-animation';
  readonly animationId: string;
};

export interface PasswordConsequenceSceneTransition {
  readonly snapshot: PasswordConsequenceSceneSnapshot;
  readonly effects: readonly PasswordConsequenceSceneEffect[];
}

function createAccountNodes(
  definition: PasswordConsequenceSceneDefinition,
  phase: PasswordConsequenceScenePhase,
): readonly SceneNode[] {
  const { comparisonResult: analysis, sceneContext } = definition.comparisonFixture;
  const { labels } = definition;
  const complete = phase === 'complete';
  const hypothetical = sceneContext.context === 'hypothetical-example';
  const targetStatus = !complete
    ? hypothetical
      ? 'hypothetical'
      : 'neutral'
    : hypothetical
      ? 'hypothetical'
      : analysis.outcome === 'no-derived-path-recognized'
        ? 'neutral'
        : 'affected';

  const nodes: SceneNode[] = [
    {
      id: sceneContext.sourceAccountId,
      kind: 'account',
      symbolId: sceneContext.sourceAccountId,
      label: definition.sourceAccount.label,
      description: labels.sourceKnown,
      status: hypothetical ? 'hypothetical' : 'exposed',
      position: definition.sourceAccount.position,
      selectable: false,
    },
    {
      id: sceneContext.targetAccountId,
      kind: 'account',
      symbolId: sceneContext.targetAccountId,
      label: definition.targetAccount.label,
      description:
        phase === 'comparing'
          ? labels.comparing
          : complete
            ? analysis.outcome === 'identical'
              ? labels.identical
              : analysis.outcome === 'similar'
                ? labels.similar
                : labels.noDerivedPath
            : labels.targetReady,
      status: targetStatus,
      position: definition.targetAccount.position,
      selectable: false,
    },
  ];

  if (complete && analysis.outcome === 'similar') {
    nodes.push({
      id: `${definition.id}-structure`,
      kind: 'annotation',
      symbolId: 'structure',
      label: labels.structure,
      description: labels.structureDescription,
      status: 'affected',
      position: definition.structurePosition,
      selectable: false,
    });
  }

  if (hypothetical) {
    nodes.push({
      id: `${definition.id}-hypothetical`,
      kind: 'annotation',
      symbolId: 'hypothetical',
      label: labels.hypothetical,
      description: labels.hypotheticalDescription,
      status: 'hypothetical',
      position: definition.hypotheticalPosition,
      selectable: false,
    });
  }

  return nodes;
}

function createEdges(
  definition: PasswordConsequenceSceneDefinition,
  phase: PasswordConsequenceScenePhase,
): readonly SceneEdge[] {
  const { comparisonResult: analysis, sceneContext } = definition.comparisonFixture;
  const { labels } = definition;
  if (phase !== 'complete') {
    return [
      {
        id: `${definition.id}-comparison`,
        sourceId: sceneContext.sourceAccountId,
        targetId: sceneContext.targetAccountId,
        kind: 'check',
        status: phase === 'comparing' ? 'checking' : 'neutral',
        label: phase === 'comparing' ? labels.comparing : labels.targetReady,
      },
    ];
  }

  if (analysis.outcome === 'no-derived-path-recognized') {
    return [];
  }

  return [
    {
      id: `${definition.id}-result`,
      sourceId: sceneContext.sourceAccountId,
      targetId: sceneContext.targetAccountId,
      kind: analysis.outcome === 'identical' ? 'identical-reuse' : 'similar-pattern',
      status:
        sceneContext.context === 'hypothetical-example'
          ? 'hypothetical'
          : analysis.outcome === 'identical'
            ? 'direct'
            : 'similar',
      label: analysis.outcome === 'identical' ? labels.identical : labels.similar,
    },
  ];
}

function createNetwork(
  definition: PasswordConsequenceSceneDefinition,
  phase: PasswordConsequenceScenePhase,
): NetworkSceneSnapshot {
  const summary =
    phase === 'ready'
      ? definition.summaries.ready
      : phase === 'comparing'
        ? definition.summaries.comparing
        : definition.comparisonFixture.sceneContext.context === 'hypothetical-example'
          ? definition.summaries.hypothetical
          : definition.comparisonFixture.comparisonResult.outcome ===
              'no-derived-path-recognized'
            ? definition.summaries.noDerivedPath
            : definition.summaries[definition.comparisonFixture.comparisonResult.outcome];

  return {
    id: definition.id,
    nodes: createAccountNodes(definition, phase),
    edges: createEdges(definition, phase),
    accessibleSummary: summary,
  };
}

function createSnapshot(
  definition: PasswordConsequenceSceneDefinition,
  phase: PasswordConsequenceScenePhase,
  pendingAnimationId: string | null,
): PasswordConsequenceSceneSnapshot {
  return {
    phase,
    analysis: definition.comparisonFixture.comparisonResult,
    network: createNetwork(definition, phase),
    pendingAnimationId,
  };
}

export function createPasswordConsequenceScene(
  definition: PasswordConsequenceSceneDefinition,
): PasswordConsequenceSceneSnapshot {
  return createSnapshot(definition, 'ready', null);
}

export function transitionPasswordConsequenceScene(
  definition: PasswordConsequenceSceneDefinition,
  snapshot: PasswordConsequenceSceneSnapshot,
  event: PasswordConsequenceSceneEvent,
): PasswordConsequenceSceneTransition {
  if (event.type === 'comparison-started') {
    if (snapshot.phase !== 'ready') return { snapshot, effects: [] };
    return {
      snapshot: createSnapshot(definition, 'comparing', definition.animationId),
      effects: [{ type: 'play-animation', animationId: definition.animationId }],
    };
  }

  if (snapshot.phase !== 'comparing' || snapshot.pendingAnimationId !== event.animationId) {
    return { snapshot, effects: [] };
  }

  return {
    snapshot: createSnapshot(definition, 'complete', null),
    effects: [],
  };
}
