import { getS02CampusIdAnimation, s02CampusIdContent } from '@passwo/training-content';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import {
  type AccountServiceSceneEvent,
  type AccountServiceSceneSnapshot,
  createAccountServiceScene,
  type NetworkRendererPort,
  transitionAccountServiceScene,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';

export interface S02CampusIdControllerSnapshot {
  readonly scene: AccountServiceSceneSnapshot;
  readonly presentation: NetworkPresentationSnapshot;
}

export interface S02CampusIdControllerOptions {
  readonly animationPlayer: AnimationPlayerPort;
}

type ControllerListener = (snapshot: S02CampusIdControllerSnapshot) => void;

interface PendingAnimation {
  readonly animationId: string;
  readonly runId: number;
}

type S02CampusIdControllerEvent =
  | { readonly type: 'node-selected'; readonly nodeId: string }
  | {
      readonly type: 'animation-finished';
      readonly animationId: string;
      readonly runId: number;
    }
  | {
      readonly type: 'animation-recovered';
      readonly animationId: string;
      readonly runId: number;
      readonly reasonCode: string;
    };

const definition = s02CampusIdContent.scene;

function createInitialPresentation(): NetworkPresentationSnapshot {
  return {
    character: {
      placement: 'bottom-left',
      pose: 'dock',
    },
    revealedNodeIds: [definition.account.id],
    highlightedNodeId: null,
    announcedMessageId: null,
  };
}

function revealSceneNodes(
  presentation: NetworkPresentationSnapshot,
  scene: AccountServiceSceneSnapshot,
): NetworkPresentationSnapshot {
  const revealedNodeIds = new Set(presentation.revealedNodeIds);
  for (const node of scene.network.nodes) revealedNodeIds.add(node.id);

  if (revealedNodeIds.size === presentation.revealedNodeIds.length) return presentation;
  return { ...presentation, revealedNodeIds: [...revealedNodeIds] };
}

export class S02CampusIdController {
  readonly #animationPlayer: AnimationPlayerPort;
  #renderer: NetworkRendererPort | null = null;
  readonly #listeners = new Set<ControllerListener>();
  #snapshot: S02CampusIdControllerSnapshot;
  #pendingAnimation: PendingAnimation | null = null;
  #nextRunId = 0;
  #disposed = false;

  constructor({ animationPlayer }: S02CampusIdControllerOptions) {
    this.#animationPlayer = animationPlayer;
    this.#snapshot = {
      scene: createAccountServiceScene(definition),
      presentation: createInitialPresentation(),
    };
  }

  getSnapshot = (): S02CampusIdControllerSnapshot => this.#snapshot;

  subscribe = (listener: ControllerListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  selectNode(nodeId: string): void {
    this.#send({ type: 'node-selected', nodeId });
  }

  attachRenderer(renderer: NetworkRendererPort): void {
    if (this.#disposed) return;
    this.#renderer = renderer;
    renderer.render(this.#snapshot.scene.network);
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

  #send(event: S02CampusIdControllerEvent): void {
    if (this.#disposed) return;

    if (event.type === 'node-selected') {
      this.#applySceneEvent({ type: 'node-selected', nodeId: event.nodeId });
      return;
    }

    if (!this.#isCurrentAnimation(event.animationId, event.runId)) return;
    this.#pendingAnimation = null;

    if (event.type === 'animation-finished' || event.type === 'animation-recovered') {
      this.#applySceneEvent(
        { type: 'animation-settled', animationId: event.animationId },
        event.type === 'animation-recovered' && event.animationId === definition.unlockAnimationId,
      );
    }
  }

  #applySceneEvent(event: AccountServiceSceneEvent, revealSettledSceneNodes = false): void {
    const transition = transitionAccountServiceScene(definition, this.#snapshot.scene, event);
    if (transition.snapshot !== this.#snapshot.scene) {
      const presentation = revealSettledSceneNodes
        ? revealSceneNodes(this.#snapshot.presentation, transition.snapshot)
        : this.#snapshot.presentation;
      this.#snapshot = { scene: transition.snapshot, presentation };
      this.#renderer?.render(transition.snapshot.network);
      this.#emit();
    }

    for (const effect of transition.effects) {
      if (effect.type === 'focus-node') {
        this.#renderer?.focusNode(effect.nodeId);
      } else {
        this.#playAnimation(effect.animationId);
      }
    }
  }

  #playAnimation(animationId: string): void {
    const animation = getS02CampusIdAnimation(animationId);
    const pendingAnimation: PendingAnimation = {
      animationId,
      runId: this.#nextRunId,
    };
    this.#nextRunId += 1;
    this.#pendingAnimation = pendingAnimation;

    if (animation === undefined) {
      this.#recoverAnimation(pendingAnimation, 'missing-s02-animation');
      return;
    }

    void this.#runAnimation(pendingAnimation, animation);
  }

  async #runAnimation(
    pendingAnimation: PendingAnimation,
    animation: AnimationSequence,
  ): Promise<void> {
    try {
      const result = await this.#animationPlayer.play(animation);
      this.#handleAnimationResult(pendingAnimation, result);
    } catch {
      this.#recoverAnimation(pendingAnimation, 'animation-player-threw');
    }
  }

  #handleAnimationResult(pendingAnimation: PendingAnimation, result: AnimationResult): void {
    if (result.status === 'finished') {
      this.#send({
        type: 'animation-finished',
        animationId: pendingAnimation.animationId,
        runId: pendingAnimation.runId,
      });
      return;
    }

    if (result.status === 'failed') {
      this.#recoverAnimation(pendingAnimation, result.reasonCode ?? 's02-animation-adapter-failed');
      return;
    }

    if (result.status === 'cancelled') return;
  }

  #recoverAnimation(pendingAnimation: PendingAnimation, reasonCode: string): void {
    // A missing sequence has no adapter end state, so the controller restores the scene itself.
    this.#send({
      type: 'animation-recovered',
      animationId: pendingAnimation.animationId,
      runId: pendingAnimation.runId,
      reasonCode,
    });
  }

  #isCurrentAnimation(animationId: string, runId: number): boolean {
    return (
      !this.#disposed &&
      this.#pendingAnimation?.animationId === animationId &&
      this.#pendingAnimation.runId === runId
    );
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
