import {
  getS06ConsequenceAnimation,
  getS06ConsequenceFixture,
  type S06ConsequenceFixtureId,
  s06ConsequenceContent,
} from '@passwo/training-content';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import {
  createPasswordConsequenceScene,
  type NetworkRendererPort,
  type PasswordConsequenceSceneDefinition,
  type PasswordConsequenceSceneSnapshot,
  transitionPasswordConsequenceScene,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';

export interface S06ConsequenceControllerSnapshot {
  readonly scene: PasswordConsequenceSceneSnapshot;
  readonly presentation: NetworkPresentationSnapshot;
}

export interface S06ConsequenceControllerOptions {
  readonly fixtureId: S06ConsequenceFixtureId;
  readonly animationPlayer: AnimationPlayerPort;
}

type ControllerListener = (snapshot: S06ConsequenceControllerSnapshot) => void;

interface PendingAnimation {
  readonly animationId: string;
  readonly runId: number;
}

export function createS06ConsequenceDefinition(
  fixtureId: S06ConsequenceFixtureId,
): PasswordConsequenceSceneDefinition {
  const fixture = getS06ConsequenceFixture(fixtureId);
  const authored = s06ConsequenceContent.scene;
  return {
    id: fixture.analysis.fixtureId,
    analysis: fixture.analysis,
    animationId: fixture.animationId,
    sourceAccount: authored.sourceAccount,
    targetAccount: {
      label: fixture.targetLabel,
      position: authored.targetPosition,
    },
    shieldPosition: authored.shieldPosition,
    structurePosition: authored.structurePosition,
    hypotheticalPosition: authored.hypotheticalPosition,
    labels: authored.labels,
    summaries: authored.summaries,
  };
}

export class S06ConsequenceController {
  readonly #animationPlayer: AnimationPlayerPort;
  readonly #definition: PasswordConsequenceSceneDefinition;
  readonly #listeners = new Set<ControllerListener>();
  #renderer: NetworkRendererPort | null = null;
  #snapshot: S06ConsequenceControllerSnapshot;
  #pendingAnimation: PendingAnimation | null = null;
  #nextRunId = 0;
  #disposed = false;

  constructor({ fixtureId, animationPlayer }: S06ConsequenceControllerOptions) {
    this.#animationPlayer = animationPlayer;
    this.#definition = createS06ConsequenceDefinition(fixtureId);
    const scene = createPasswordConsequenceScene(this.#definition);
    this.#snapshot = {
      scene,
      presentation: {
        character: { placement: 'bottom-left', pose: 'dock' },
        revealedNodeIds: scene.network.nodes.map(({ id }) => id),
        highlightedNodeId: null,
        announcedMessageId: null,
      },
    };
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
    if (this.#disposed) return;
    const transition = transitionPasswordConsequenceScene(this.#definition, this.#snapshot.scene, {
      type: 'comparison-started',
    });
    this.#applyTransition(transition.snapshot);
    for (const effect of transition.effects) this.#playAnimation(effect.animationId);
  }

  updatePresentation(presentation: NetworkPresentationSnapshot): void {
    if (this.#disposed || presentation === this.#snapshot.presentation) return;
    this.#snapshot = { ...this.#snapshot, presentation };
    this.#emit();
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    this.#pendingAnimation = null;
    await this.#animationPlayer.cancel();
    this.#listeners.clear();
  }

  #playAnimation(animationId: string): void {
    const animation = getS06ConsequenceAnimation(animationId);
    const pending: PendingAnimation = {
      animationId,
      runId: this.#nextRunId,
    };
    this.#nextRunId += 1;
    this.#pendingAnimation = pending;

    if (animation === undefined) {
      this.#settleAnimation(pending);
      return;
    }
    void this.#runAnimation(pending, animation);
  }

  async #runAnimation(pending: PendingAnimation, animation: AnimationSequence): Promise<void> {
    try {
      const result = await this.#animationPlayer.play(animation);
      this.#handleAnimationResult(pending, result);
    } catch {
      this.#settleAnimation(pending);
    }
  }

  #handleAnimationResult(pending: PendingAnimation, result: AnimationResult): void {
    if (result.status === 'finished' || result.status === 'failed') {
      this.#settleAnimation(pending);
    }
  }

  #settleAnimation(pending: PendingAnimation): void {
    if (
      this.#disposed ||
      this.#pendingAnimation?.animationId !== pending.animationId ||
      this.#pendingAnimation.runId !== pending.runId
    ) {
      return;
    }
    this.#pendingAnimation = null;
    const transition = transitionPasswordConsequenceScene(this.#definition, this.#snapshot.scene, {
      type: 'animation-settled',
      animationId: pending.animationId,
    });
    this.#applyTransition(transition.snapshot);
  }

  #applyTransition(scene: PasswordConsequenceSceneSnapshot): void {
    if (scene === this.#snapshot.scene) return;
    const revealedNodeIds = new Set(this.#snapshot.presentation.revealedNodeIds);
    for (const node of scene.network.nodes) revealedNodeIds.add(node.id);
    this.#snapshot = {
      scene,
      presentation: {
        ...this.#snapshot.presentation,
        revealedNodeIds: [...revealedNodeIds],
      },
    };
    this.#renderer?.render(scene.network);
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
