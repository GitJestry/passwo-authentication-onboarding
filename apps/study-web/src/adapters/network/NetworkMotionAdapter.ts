import type { PassWoPlacement, PassWoPose } from '@passwo/contracts';
import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
  AnimationStep,
} from '@passwo/training-engine';
import {
  type AnimationPlaybackControlsWithThen,
  animate,
  type DOMKeyframesDefinition,
} from 'motion';

export interface NetworkPresentationSnapshot {
  readonly character: {
    readonly placement: PassWoPlacement;
    readonly pose: PassWoPose;
  };
  readonly revealedNodeIds: readonly string[];
  readonly highlightedNodeId: string | null;
  readonly announcedMessageId: string | null;
}

export interface NetworkMotionAdapterOptions {
  readonly initialNodeId: string;
  readonly applySnapshot: (snapshot: NetworkPresentationSnapshot) => void;
  readonly getCharacterElement: () => HTMLElement | null;
  readonly getNodeElement: (nodeId: string) => HTMLElement | null;
  readonly prefersReducedMotion: () => boolean;
}

export function createInitialNetworkPresentation(
  initialNodeId: string,
): NetworkPresentationSnapshot {
  return {
    character: {
      placement: 'bottom-left',
      pose: 'dock',
    },
    revealedNodeIds: [initialNodeId],
    highlightedNodeId: null,
    announcedMessageId: null,
  };
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function moveTransform(step: Extract<AnimationStep, { readonly type: 'move-character' }>): string {
  if (step.to === 'focused-node') return 'translate3d(-18vw, 30vh, 0)';
  if (step.to === 'bottom-left') return 'translate3d(18vw, -30vh, 0)';
  return 'translate3d(0, 0, 0)';
}

export class NetworkMotionAdapter implements AnimationPlayerPort {
  readonly #applySnapshot: (snapshot: NetworkPresentationSnapshot) => void;
  readonly #getCharacterElement: () => HTMLElement | null;
  readonly #getNodeElement: (nodeId: string) => HTMLElement | null;
  readonly #prefersReducedMotion: () => boolean;
  #activeAnimation: AnimationPlaybackControlsWithThen | null = null;
  #activeSequence: AnimationSequence | null = null;
  #cancelled = false;
  #snapshot: NetworkPresentationSnapshot;

  constructor({
    initialNodeId,
    applySnapshot,
    getCharacterElement,
    getNodeElement,
    prefersReducedMotion,
  }: NetworkMotionAdapterOptions) {
    this.#snapshot = createInitialNetworkPresentation(initialNodeId);
    this.#applySnapshot = applySnapshot;
    this.#getCharacterElement = getCharacterElement;
    this.#getNodeElement = getNodeElement;
    this.#prefersReducedMotion = prefersReducedMotion;
  }

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    this.#cancelled = false;
    this.#activeSequence = sequence;

    if (this.#prefersReducedMotion()) {
      this.#applyEndState(sequence);
      this.#activeSequence = null;
      return { status: 'finished' };
    }

    try {
      for (const step of sequence.steps) {
        if (this.#cancelled) return { status: 'cancelled' };
        await this.#playStep(step);
      }
      return this.#cancelled ? { status: 'cancelled' } : { status: 'finished' };
    } catch {
      this.#applyEndState(sequence);
      return { status: 'failed', reasonCode: 'network-motion-adapter-failed' };
    } finally {
      this.#activeAnimation = null;
      this.#activeSequence = null;
    }
  }

  async cancel(): Promise<void> {
    this.#cancelled = true;
    this.#activeAnimation?.stop();
    if (this.#activeSequence !== null) this.#applyEndState(this.#activeSequence);
  }

  async #playStep(step: AnimationStep): Promise<void> {
    switch (step.type) {
      case 'move-character': {
        this.#setSnapshot({
          ...this.#snapshot,
          character: { placement: step.to, pose: step.pose },
        });
        await nextFrame();
        const character = this.#getCharacterElement();
        if (character === null) throw new Error('missing-network-character');
        await this.#animate(character, step.durationMs, {
          opacity: [0.7, 1],
          transform: [moveTransform(step), 'translate3d(0, 0, 0)'],
        });
        character.style.removeProperty('opacity');
        character.style.removeProperty('transform');
        return;
      }
      case 'reveal': {
        this.#setSnapshot({
          ...this.#snapshot,
          revealedNodeIds: [...new Set([...this.#snapshot.revealedNodeIds, step.targetId])],
        });
        await nextFrame();
        const node = this.#getNodeElement(step.targetId);
        if (node === null) throw new Error(`missing-network-node:${step.targetId}`);
        await this.#animate(node, step.durationMs, {
          opacity: [0, 1],
          transform: ['translate3d(14px, 0, 0)', 'translate3d(0, 0, 0)'],
        });
        node.style.removeProperty('opacity');
        node.style.removeProperty('transform');
        return;
      }
      case 'highlight': {
        this.#setSnapshot({ ...this.#snapshot, highlightedNodeId: step.targetId });
        await nextFrame();
        const node = this.#getNodeElement(step.targetId);
        if (node === null) throw new Error(`missing-network-node:${step.targetId}`);
        await this.#animate(node, step.durationMs, {
          transform: ['scale(0.97)', 'scale(1.025)', 'scale(1)'],
        });
        node.style.removeProperty('transform');
        this.#setSnapshot({ ...this.#snapshot, highlightedNodeId: null });
        return;
      }
      case 'announce':
        this.#setSnapshot({ ...this.#snapshot, announcedMessageId: step.messageId });
        return;
      case 'pause': {
        const character = this.#getCharacterElement();
        if (character === null) throw new Error('missing-network-character');
        await this.#animate(character, step.durationMs, { opacity: [0.99, 1] });
        character.style.removeProperty('opacity');
        return;
      }
    }
  }

  async #animate(
    element: HTMLElement,
    durationMs: number,
    keyframes: DOMKeyframesDefinition,
  ): Promise<void> {
    const animation = animate(element, keyframes, {
      duration: durationMs / 1000,
      ease: 'easeOut',
    });
    this.#activeAnimation = animation;
    await animation;
    if (this.#activeAnimation === animation) this.#activeAnimation = null;
  }

  #applyEndState(sequence: AnimationSequence): void {
    for (const step of sequence.steps) {
      if (step.type === 'move-character') {
        this.#snapshot = {
          ...this.#snapshot,
          character: { placement: step.to, pose: step.pose },
        };
      } else if (step.type === 'reveal') {
        this.#snapshot = {
          ...this.#snapshot,
          revealedNodeIds: [...new Set([...this.#snapshot.revealedNodeIds, step.targetId])],
        };
      } else if (step.type === 'announce') {
        this.#snapshot = { ...this.#snapshot, announcedMessageId: step.messageId };
      }
    }
    this.#snapshot = { ...this.#snapshot, highlightedNodeId: null };
    this.#applySnapshot(this.#snapshot);
  }

  #setSnapshot(snapshot: NetworkPresentationSnapshot): void {
    this.#snapshot = snapshot;
    this.#applySnapshot(snapshot);
  }
}
