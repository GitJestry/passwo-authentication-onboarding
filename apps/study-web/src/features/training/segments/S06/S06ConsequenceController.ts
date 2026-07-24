import {
  getS06ConsequenceAnimation,
  getS06ConsequenceFixture,
  getS06ConsequenceResultContent,
  type S06ConsequenceExplanation,
  type S06ConsequenceFixtureId,
  type S06ConsequenceResultContent,
  type S06ConsequenceSemanticContent,
  s06ConsequenceContent,
} from '@passwo/training-content';
import {
  type AnimationPlayerPort,
  MissionController,
  type MissionDefinition,
  type MissionSnapshot,
  type SegmentTimingPort,
} from '@passwo/training-engine';
import {
  createPasswordConsequenceScene,
  type NetworkRendererPort,
  type PasswordConsequenceSceneDefinition,
  type PasswordConsequenceSceneSnapshot,
  transitionPasswordConsequenceScene,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';

export interface S06ConsequenceParticipantSnapshot {
  readonly scenarioLabel: string;
  readonly comparisonTitle: string;
  readonly hypotheticalNotice: string | null;
  readonly explanation: S06ConsequenceExplanation;
  readonly semantic: S06ConsequenceSemanticContent | null;
}

export interface S06ConsequenceControllerSnapshot {
  readonly scene: PasswordConsequenceSceneSnapshot;
  readonly presentation: NetworkPresentationSnapshot;
  readonly participant: S06ConsequenceParticipantSnapshot;
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

export interface S06ConsequenceControllerOptions {
  readonly fixtureId: S06ConsequenceFixtureId;
  readonly animationPlayer: AnimationPlayerPort;
  readonly timingPort?: SegmentTimingPort;
  readonly onComplete?: () => void;
}

type ControllerListener = (snapshot: S06ConsequenceControllerSnapshot) => void;

export function createS06ConsequenceDefinition(
  fixtureId: S06ConsequenceFixtureId,
): PasswordConsequenceSceneDefinition {
  const fixture = getS06ConsequenceFixture(fixtureId);
  const result = getS06ConsequenceResultContent(fixture.resultKey);
  const authored = s06ConsequenceContent.scene;
  return {
    id: fixture.analysis.fixtureId,
    analysis: fixture.analysis,
    animationId: fixture.animationId,
    sourceAccount: authored.sourceAccount,
    targetAccount: {
      label: result.targetLabel,
      position: authored.targetPosition,
    },
    shieldPosition: authored.shieldPosition,
    structurePosition: authored.structurePosition,
    hypotheticalPosition: authored.hypotheticalPosition,
    labels: authored.labels,
    summaries: authored.summaries,
  };
}

export function getS06InitialNetworkPresentation(fixtureId: S06ConsequenceFixtureId): {
  readonly initialNodeId: string;
  readonly initialRevealedNodeIds: readonly string[];
} {
  const scene = createPasswordConsequenceScene(createS06ConsequenceDefinition(fixtureId));
  return {
    initialNodeId: scene.analysis.sourceAccountId,
    initialRevealedNodeIds: scene.network.nodes.map(({ id }) => id),
  };
}

function createS06Mission(
  fixtureId: S06ConsequenceFixtureId,
  animationId: string,
): MissionDefinition {
  const animation = getS06ConsequenceAnimation(animationId);
  if (animation === undefined) {
    throw new Error(`Missing authored S06 animation: ${animationId}`);
  }
  return {
    id: `s06-consequence-${fixtureId}`,
    segmentId: s06ConsequenceContent.segment.id,
    sectionId: s06ConsequenceContent.segment.sectionId,
    requiresSafetyAcknowledgement: false,
    steps: [
      {
        id: animation.id,
        narrationId: animation.id,
        animation,
      },
    ],
  };
}

function createParticipantSnapshot(
  result: S06ConsequenceResultContent,
  scene: PasswordConsequenceSceneSnapshot,
  presentation: NetworkPresentationSnapshot,
): S06ConsequenceParticipantSnapshot {
  return {
    scenarioLabel: result.scenarioLabel,
    comparisonTitle: result.comparisonTitle,
    hypotheticalNotice: result.hypotheticalNotice,
    explanation: result.explanations[scene.phase],
    semantic:
      presentation.emphasis === null || presentation.emphasis === undefined
        ? null
        : result.semantic,
  };
}

export class S06ConsequenceController {
  readonly #definition: PasswordConsequenceSceneDefinition;
  readonly #result: S06ConsequenceResultContent;
  readonly #missionController: MissionController;
  readonly #mission: MissionDefinition;
  readonly #listeners = new Set<ControllerListener>();
  readonly #unsubscribeMission: () => void;
  #renderer: NetworkRendererPort | null = null;
  #snapshot: S06ConsequenceControllerSnapshot;
  #disposed = false;

  constructor({
    fixtureId,
    animationPlayer,
    timingPort,
    onComplete,
  }: S06ConsequenceControllerOptions) {
    const fixture = getS06ConsequenceFixture(fixtureId);
    this.#definition = createS06ConsequenceDefinition(fixtureId);
    this.#result = getS06ConsequenceResultContent(fixture.resultKey);
    this.#mission = createS06Mission(fixtureId, fixture.animationId);
    const scene = createPasswordConsequenceScene(this.#definition);
    const presentation: NetworkPresentationSnapshot = {
      character: { placement: 'bottom-left', pose: 'dock' },
      revealedNodeIds: scene.network.nodes.map(({ id }) => id),
      highlightedNodeId: null,
      emphasis: null,
      announcedMessageId: null,
    };
    this.#snapshot = {
      scene,
      presentation,
      participant: createParticipantSnapshot(this.#result, scene, presentation),
      controls: { canStart: true, canReplay: false, canContinue: false },
    };
    this.#missionController = new MissionController({
      animationPlayer,
      ...(timingPort === undefined ? {} : { timingPort }),
      onComplete: onComplete ?? (() => undefined),
    });
    this.#unsubscribeMission = this.#missionController.subscribe((snapshot) =>
      this.#handleMissionSnapshot(snapshot),
    );
  }

  getSnapshot = (): S06ConsequenceControllerSnapshot => this.#snapshot;

  subscribe = (listener: ControllerListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  attachRenderer(renderer: NetworkRendererPort): void {
    if (this.#disposed) return;
    this.#renderer = renderer;
    renderer.render(this.#snapshot.scene.network);
  }

  startComparison(): void {
    if (this.#disposed || !this.#snapshot.controls.canStart) return;
    const transition = transitionPasswordConsequenceScene(this.#definition, this.#snapshot.scene, {
      type: 'comparison-started',
    });
    if (transition.effects.length === 0) return;
    this.#setControls({ canStart: false, canReplay: false, canContinue: false });
    this.#applyTransition(transition.snapshot);
    this.#missionController.start(this.#mission);
  }

  replayComparison(): void {
    if (this.#disposed || !this.#snapshot.controls.canReplay) return;
    this.#missionController.replay();
  }

  continue(): Promise<void> {
    if (this.#disposed || !this.#snapshot.controls.canContinue) return Promise.resolve();
    return this.#missionController.continue();
  }

  updatePresentation(presentation: NetworkPresentationSnapshot): void {
    if (this.#disposed || presentation === this.#snapshot.presentation) return;
    this.#snapshot = {
      ...this.#snapshot,
      presentation,
      participant: createParticipantSnapshot(this.#result, this.#snapshot.scene, presentation),
    };
    this.#emit();
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    this.#unsubscribeMission();
    await this.#missionController.dispose();
    this.#listeners.clear();
  }

  #handleMissionSnapshot(missionSnapshot: MissionSnapshot): void {
    if (this.#disposed) return;
    const awaitingDecision = missionSnapshot.matches({ active: 'awaitingDecision' });
    this.#setControls({
      canStart: false,
      canReplay: awaitingDecision,
      canContinue: awaitingDecision,
    });
    if (awaitingDecision && this.#snapshot.scene.phase === 'comparing') {
      const transition = transitionPasswordConsequenceScene(
        this.#definition,
        this.#snapshot.scene,
        {
          type: 'animation-settled',
          animationId: this.#definition.animationId,
        },
      );
      this.#applyTransition(transition.snapshot);
      return;
    }
    this.#emit();
  }

  #setControls(controls: S06ConsequenceControllerSnapshot['controls']): void {
    this.#snapshot = { ...this.#snapshot, controls };
  }

  #applyTransition(scene: PasswordConsequenceSceneSnapshot): void {
    if (scene === this.#snapshot.scene) return;
    const revealedNodeIds = new Set(this.#snapshot.presentation.revealedNodeIds);
    for (const node of scene.network.nodes) revealedNodeIds.add(node.id);
    const presentation = {
      ...this.#snapshot.presentation,
      revealedNodeIds: [...revealedNodeIds],
    };
    this.#snapshot = {
      ...this.#snapshot,
      scene,
      presentation,
      participant: createParticipantSnapshot(this.#result, scene, presentation),
    };
    this.#renderer?.render(scene.network);
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
