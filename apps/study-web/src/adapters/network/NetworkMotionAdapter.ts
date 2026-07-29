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

export type NetworkPresentationEmphasis = Extract<
  AnimationStep,
  { readonly type: 'highlight' }
>['emphasis'];

export interface NetworkPresentationSnapshot {
  readonly character: {
    readonly placement: PassWoPlacement;
    readonly pose: PassWoPose;
  };
  readonly revealedNodeIds: readonly string[];
  readonly drawingTargetNodeId?: string | null;
  readonly highlightedNodeId: string | null;
  readonly emphasis?: NetworkPresentationEmphasis | null;
  readonly announcedMessageId: string | null;
}

export interface NetworkMotionAdapterOptions {
  readonly initialNodeId: string;
  readonly initialRevealedNodeIds?: readonly string[];
  readonly applySnapshot: (snapshot: NetworkPresentationSnapshot) => void;
  readonly getCharacterElement: () => HTMLElement | null;
  readonly getActiveNodeElement: () => HTMLElement | null;
  readonly getNodeElement: (nodeId: string) => HTMLElement | null;
  readonly getEdgeElement?: (targetNodeId: string) => SVGPathElement | null;
  readonly prefersReducedMotion: () => boolean;
}

export function createInitialNetworkPresentation(
  initialNodeId: string,
  initialRevealedNodeIds: readonly string[] = [initialNodeId],
): NetworkPresentationSnapshot {
  return {
    character: {
      placement: 'bottom-left',
      pose: 'dock',
    },
    revealedNodeIds: [...new Set(initialRevealedNodeIds)],
    drawingTargetNodeId: null,
    highlightedNodeId: null,
    emphasis: null,
    announcedMessageId: null,
  };
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function currentTranslation(element: HTMLElement): Readonly<{ x: number; y: number }> {
  const transform = window.getComputedStyle(element).transform;
  if (transform === 'none') return { x: 0, y: 0 };
  try {
    const matrix = new DOMMatrixReadOnly(transform);
    return { x: matrix.m41, y: matrix.m42 };
  } catch {
    return { x: 0, y: 0 };
  }
}

export class NetworkMotionAdapter implements AnimationPlayerPort {
  readonly #applySnapshot: (snapshot: NetworkPresentationSnapshot) => void;
  readonly #getCharacterElement: () => HTMLElement | null;
  readonly #getActiveNodeElement: () => HTMLElement | null;
  readonly #getNodeElement: (nodeId: string) => HTMLElement | null;
  readonly #getEdgeElement: (targetNodeId: string) => SVGPathElement | null;
  readonly #prefersReducedMotion: () => boolean;
  #activeAnimation: AnimationPlaybackControlsWithThen | null = null;
  #activeSequence: AnimationSequence | null = null;
  #cancelled = false;
  #snapshot: NetworkPresentationSnapshot;

  constructor({
    initialNodeId,
    initialRevealedNodeIds,
    applySnapshot,
    getCharacterElement,
    getActiveNodeElement,
    getNodeElement,
    getEdgeElement = () => null,
    prefersReducedMotion,
  }: NetworkMotionAdapterOptions) {
    this.#snapshot = createInitialNetworkPresentation(initialNodeId, initialRevealedNodeIds);
    this.#applySnapshot = applySnapshot;
    this.#getCharacterElement = getCharacterElement;
    this.#getActiveNodeElement = getActiveNodeElement;
    this.#getNodeElement = getNodeElement;
    this.#getEdgeElement = getEdgeElement;
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
        const destination =
          step.to === 'bottom-left' ? 'translate3d(0px, 0px, 0px)' : this.#transformToActiveNode(character);
        if (destination === null) throw new Error('missing-active-network-node');
        await this.#animate(character, step.durationMs, {
          opacity: [0.7, 1],
          transform: [character.style.transform || 'translate3d(0px, 0px, 0px)', destination],
        });
        character.style.opacity = '1';
        if (step.to === 'bottom-left') {
          character.style.removeProperty('transform');
        } else {
          character.style.transform = destination;
        }
        return;
      }
      case 'reveal': {
        this.#setSnapshot({
          ...this.#snapshot,
          drawingTargetNodeId: step.targetId,
        });
        await nextFrame();
        const edge = this.#getEdgeElement(step.targetId);
        if (edge !== null) await this.#drawEdge(edge, step.durationMs);
        this.#setSnapshot({
          ...this.#snapshot,
          revealedNodeIds: [...new Set([...this.#snapshot.revealedNodeIds, step.targetId])],
          drawingTargetNodeId: null,
        });
        await nextFrame();
        const node = this.#getNodeElement(step.targetId);
        if (node === null) throw new Error(`missing-network-node:${step.targetId}`);
        await this.#animate(node, Math.min(step.durationMs, 180), {
          opacity: [0, 1],
          transform: ['scale(0.72)', 'scale(1.04)', 'scale(1)'],
        });
        node.style.removeProperty('opacity');
        node.style.removeProperty('transform');
        return;
      }
      case 'highlight': {
        this.#setSnapshot({
          ...this.#snapshot,
          highlightedNodeId: step.targetId,
          emphasis: step.emphasis,
        });
        await nextFrame();
        const node = this.#getNodeElement(step.targetId);
        if (node === null) throw new Error(`missing-network-node:${step.targetId}`);
        const lockShackle = node.querySelector<SVGPathElement>('[data-lock-shackle]');
        if (lockShackle !== null) {
          lockShackle.style.transformBox = 'fill-box';
          lockShackle.style.transformOrigin = 'left bottom';
          await this.#animate(lockShackle, Math.min(step.durationMs, 360), {
            transform: [
              'translate3d(0, 0, 0) rotate(0deg) scale(1)',
              'translate3d(-2px, -7px, 0) rotate(-32deg) scale(1.06)',
            ],
          });
        }
        await this.#animate(node, Math.min(step.durationMs, 420), {
          transform: ['scale(0.94)', 'scale(1.055)', 'scale(1)'],
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
    element: HTMLElement | SVGElement,
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

  async #drawEdge(edge: SVGPathElement, durationMs: number): Promise<void> {
    const length = edge.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return;
    edge.style.strokeDasharray = `${length}`;
    edge.style.strokeDashoffset = `${length}`;
    edge.style.opacity = '1';
    const animation = animate(edge, {
      strokeDashoffset: [length, 0],
    }, {
      duration: durationMs / 1000,
      ease: 'easeInOut',
    });
    this.#activeAnimation = animation;
    await animation;
    if (this.#activeAnimation === animation) this.#activeAnimation = null;
    edge.style.removeProperty('stroke-dasharray');
    edge.style.removeProperty('stroke-dashoffset');
    edge.style.removeProperty('opacity');
  }

  #applyEndState(sequence: AnimationSequence): void {
    for (const step of sequence.steps) {
      if (step.type === 'move-character') {
        this.#snapshot = {
          ...this.#snapshot,
          character: { placement: step.to, pose: step.pose },
        };
        requestAnimationFrame(() => {
          const character = this.#getCharacterElement();
          if (character === null) return;
          if (step.to === 'bottom-left') {
            character.style.removeProperty('transform');
            return;
          }
          const destination = this.#transformToActiveNode(character);
          if (destination !== null) character.style.transform = destination;
        });
      } else if (step.type === 'reveal') {
        this.#snapshot = {
          ...this.#snapshot,
          revealedNodeIds: [...new Set([...this.#snapshot.revealedNodeIds, step.targetId])],
          drawingTargetNodeId: null,
        };
      } else if (step.type === 'highlight') {
        this.#snapshot = { ...this.#snapshot, emphasis: step.emphasis };
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

  #transformToActiveNode(character: HTMLElement): string | null {
    const activeNode = this.#getActiveNodeElement();
    if (activeNode === null) return null;

    const characterAnchor =
      character.querySelector<HTMLElement>('[data-passwo-character]') ?? character;
    const characterRect = characterAnchor.getBoundingClientRect();
    const nodeRect = activeNode.getBoundingClientRect();
    const current = currentTranslation(character);
    const placeOnRight = nodeRect.left + nodeRect.width / 2 < window.innerWidth / 2;
    const targetX = placeOnRight
      ? nodeRect.right + characterRect.width * 0.3
      : nodeRect.left - characterRect.width * 0.3;
    const targetY = nodeRect.top + nodeRect.height * 0.68;
    const characterAnchorX = characterRect.left + characterRect.width * 0.5;
    const characterAnchorY = characterRect.top + characterRect.height * 0.62;
    const x = Math.round(current.x + targetX - characterAnchorX);
    const y = Math.round(current.y + targetY - characterAnchorY);
    return `translate3d(${x}px, ${y}px, 0px)`;
  }
}
