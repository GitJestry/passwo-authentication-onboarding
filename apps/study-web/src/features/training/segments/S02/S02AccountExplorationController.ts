import { getS02Animation, s02Content } from '@passwo/training-content';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';
import {
  type AccountExplorationSceneEvent,
  type AccountExplorationSceneSnapshot,
  createAccountExplorationScene,
  type NetworkRendererPort,
  transitionAccountExplorationScene,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';

const definition = {
  ...s02Content.scene,
  initialNarrationId: s02Content.narration.introId,
};

export interface S02AccountExplorationControllerSnapshot {
  readonly scene: AccountExplorationSceneSnapshot;
  readonly presentation: NetworkPresentationSnapshot;
  readonly introState: 'ready' | 'playing' | 'complete';
}

export interface S02AccountExplorationControllerOptions {
  readonly animationPlayer: AnimationPlayerPort;
  readonly onAllAccountsViewed?: () => void;
}

type ControllerListener = (snapshot: S02AccountExplorationControllerSnapshot) => void;

interface PendingAnimation {
  readonly animationId: string;
  readonly runId: number;
}

type ControllerEvent =
  | { readonly type: 'node-selected'; readonly nodeId: string }
  | {
      readonly type: 'core-action-started';
      readonly accountId: string;
      readonly targetDetailId: string;
    }
  | {
      readonly type: 'animation-finished' | 'animation-recovered';
      readonly animationId: string;
      readonly runId: number;
    };

function createInitialPresentation(): NetworkPresentationSnapshot {
  return {
    character: {
      placement: 'bottom-left',
      pose: 'dock',
    },
    revealedNodeIds: [],
    highlightedNodeId: null,
    emphasis: null,
    announcedMessageId: null,
  };
}

function revealSceneNodes(
  presentation: NetworkPresentationSnapshot,
  scene: AccountExplorationSceneSnapshot,
): NetworkPresentationSnapshot {
  const revealedNodeIds = new Set(presentation.revealedNodeIds);
  for (const node of scene.network.nodes) revealedNodeIds.add(node.id);
  if (revealedNodeIds.size === presentation.revealedNodeIds.length) return presentation;
  return { ...presentation, revealedNodeIds: [...revealedNodeIds] };
}

export class S02AccountExplorationController {
  readonly #animationPlayer: AnimationPlayerPort;
  readonly #onAllAccountsViewed: () => void;
  #renderer: NetworkRendererPort | null = null;
  readonly #listeners = new Set<ControllerListener>();
  #snapshot: S02AccountExplorationControllerSnapshot;
  #pendingAnimation: PendingAnimation | null = null;
  #introRunId: number | null = null;
  #nextRunId = 0;
  #completionNotified = false;
  #disposed = false;

  constructor({
    animationPlayer,
    onAllAccountsViewed = () => undefined,
  }: S02AccountExplorationControllerOptions) {
    this.#animationPlayer = animationPlayer;
    this.#onAllAccountsViewed = onAllAccountsViewed;
    this.#snapshot = {
      scene: createAccountExplorationScene(definition),
      presentation: createInitialPresentation(),
      introState: 'ready',
    };
  }

  getSnapshot = (): S02AccountExplorationControllerSnapshot => this.#snapshot;

  subscribe = (listener: ControllerListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  selectNode(nodeId: string): void {
    if (this.#snapshot.introState !== 'complete') return;
    this.#send({ type: 'node-selected', nodeId });
  }

  performCoreAction(accountId: string, targetDetailId: string): void {
    if (this.#snapshot.introState !== 'complete') return;
    this.#send({ type: 'core-action-started', accountId, targetDetailId });
  }

  startIntro(): void {
    if (this.#disposed || this.#snapshot.introState !== 'ready') return;
    const animation = getS02Animation(definition.introAnimationId);
    if (animation === undefined) {
      this.#snapshot = { ...this.#snapshot, introState: 'complete' };
      this.#emit();
      return;
    }
    const runId = this.#nextRunId;
    this.#nextRunId += 1;
    this.#introRunId = runId;
    this.#snapshot = { ...this.#snapshot, introState: 'playing' };
    this.#emit();
    void this.#runIntroAnimation(animation, runId);
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
    this.#introRunId = null;
    await this.#animationPlayer.cancel();
    this.#listeners.clear();
  }

  #send(event: ControllerEvent): void {
    if (this.#disposed) return;

    if (event.type === 'node-selected' || event.type === 'core-action-started') {
      this.#applySceneEvent(event);
      return;
    }

    if (!this.#isCurrentAnimation(event.animationId, event.runId)) return;
    this.#pendingAnimation = null;
    this.#applySceneEvent(
      { type: 'animation-settled', animationId: event.animationId },
      event.type === 'animation-recovered',
    );
  }

  #applySceneEvent(event: AccountExplorationSceneEvent, revealSettledNodes = false): void {
    const transition = transitionAccountExplorationScene(definition, this.#snapshot.scene, event);
    if (transition.snapshot !== this.#snapshot.scene) {
      const presentation = revealSettledNodes
        ? revealSceneNodes(this.#snapshot.presentation, transition.snapshot)
        : this.#snapshot.presentation;
      this.#snapshot = {
        scene: transition.snapshot,
        presentation,
        introState: this.#snapshot.introState,
      };
      this.#renderer?.render(transition.snapshot.network);
      this.#emit();
      this.#notifyCompleteIfNeeded();
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
    const animation = getS02Animation(animationId);
    const pendingAnimation = {
      animationId,
      runId: this.#nextRunId,
    };
    this.#nextRunId += 1;
    this.#pendingAnimation = pendingAnimation;

    if (animation === undefined) {
      this.#recoverAnimation(pendingAnimation);
      return;
    }
    void this.#runAnimation(pendingAnimation, animation);
  }

  async #runIntroAnimation(animation: AnimationSequence, runId: number): Promise<void> {
    try {
      const result = await this.#animationPlayer.play(animation);
      if (result.status !== 'cancelled') this.#completeIntro(runId);
    } catch {
      this.#completeIntro(runId);
    }
  }

  #completeIntro(runId: number): void {
    if (this.#disposed || this.#introRunId !== runId) return;
    this.#introRunId = null;
    this.#snapshot = { ...this.#snapshot, introState: 'complete' };
    this.#emit();
  }

  async #runAnimation(
    pendingAnimation: PendingAnimation,
    animation: AnimationSequence,
  ): Promise<void> {
    try {
      const result = await this.#animationPlayer.play(animation);
      this.#handleAnimationResult(pendingAnimation, result);
    } catch {
      this.#recoverAnimation(pendingAnimation);
    }
  }

  #handleAnimationResult(pendingAnimation: PendingAnimation, result: AnimationResult): void {
    if (result.status === 'finished') {
      this.#send({
        type: 'animation-finished',
        animationId: pendingAnimation.animationId,
        runId: pendingAnimation.runId,
      });
    } else if (result.status === 'failed') {
      this.#recoverAnimation(pendingAnimation);
    }
  }

  #recoverAnimation(pendingAnimation: PendingAnimation): void {
    this.#send({
      type: 'animation-recovered',
      animationId: pendingAnimation.animationId,
      runId: pendingAnimation.runId,
    });
  }

  #isCurrentAnimation(animationId: string, runId: number): boolean {
    return (
      !this.#disposed &&
      this.#pendingAnimation?.animationId === animationId &&
      this.#pendingAnimation.runId === runId
    );
  }

  #notifyCompleteIfNeeded(): void {
    if (
      this.#completionNotified ||
      !this.#snapshot.scene.isComplete
    ) {
      return;
    }
    this.#completionNotified = true;
    this.#onAllAccountsViewed();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
