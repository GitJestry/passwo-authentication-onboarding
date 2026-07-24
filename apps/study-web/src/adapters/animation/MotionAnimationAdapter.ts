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
import { createInitialS00SceneSnapshot, type S00SceneSnapshot } from './s00-scene.js';

export interface MotionAnimationAdapterOptions {
  readonly applySnapshot: (snapshot: S00SceneSnapshot) => void;
  readonly getCharacterElement: () => HTMLElement | null;
  readonly getRevealTargetElement: (targetId: string) => HTMLElement | null;
  readonly prefersReducedMotion: () => boolean;
  readonly forceFailure?: boolean;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function moveTransform(step: Extract<AnimationStep, { readonly type: 'move-character' }>): string {
  return step.to === 'center' ? 'translate3d(120vw, 0, 0)' : 'translate3d(46vw, -34vh, 0)';
}

export class MotionAnimationAdapter implements AnimationPlayerPort {
  readonly #applySnapshot: (snapshot: S00SceneSnapshot) => void;
  readonly #getCharacterElement: () => HTMLElement | null;
  readonly #getRevealTargetElement: (targetId: string) => HTMLElement | null;
  readonly #prefersReducedMotion: () => boolean;
  readonly #forceFailure: boolean;
  #activeAnimation: AnimationPlaybackControlsWithThen | null = null;
  #activeSequence: AnimationSequence | null = null;
  #cancelled = false;
  #snapshot = createInitialS00SceneSnapshot();

  constructor({
    applySnapshot,
    getCharacterElement,
    getRevealTargetElement,
    prefersReducedMotion,
    forceFailure = false,
  }: MotionAnimationAdapterOptions) {
    this.#applySnapshot = applySnapshot;
    this.#getCharacterElement = getCharacterElement;
    this.#getRevealTargetElement = getRevealTargetElement;
    this.#prefersReducedMotion = prefersReducedMotion;
    this.#forceFailure = forceFailure;
  }

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    this.#cancelled = false;
    this.#activeSequence = sequence;
    this.#setSnapshot(createInitialS00SceneSnapshot());

    if (this.#prefersReducedMotion()) {
      this.#applyEndState(sequence);
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
      return { status: 'failed', reasonCode: 'motion-adapter-failed' };
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
    if (this.#forceFailure) throw new Error('forced-motion-adapter-failure');

    switch (step.type) {
      case 'move-character': {
        this.#setSnapshot({
          ...this.#snapshot,
          character: { placement: step.to, pose: step.pose },
        });
        await nextFrame();
        const character = this.#getCharacterElement();
        if (character === null) throw new Error('missing-character-element');
        await this.#animate(character, step.durationMs, {
          opacity: [0, 1],
          transform: [moveTransform(step), 'translate3d(0, 0, 0)'],
        });
        character.style.removeProperty('opacity');
        character.style.removeProperty('transform');
        return;
      }
      case 'reveal': {
        this.#setSnapshot({
          ...this.#snapshot,
          revealedTargetIds: [...this.#snapshot.revealedTargetIds, step.targetId],
        });
        await nextFrame();
        const target = this.#getRevealTargetElement(step.targetId);
        if (target === null) throw new Error(`missing-reveal-target:${step.targetId}`);
        await this.#animate(target, step.durationMs, {
          opacity: [0, 1],
          transform: ['translate3d(0, 12px, 0)', 'translate3d(0, 0, 0)'],
        });
        target.style.removeProperty('opacity');
        target.style.removeProperty('transform');
        return;
      }
      case 'announce':
        this.#setSnapshot({ ...this.#snapshot, announcedMessageId: step.messageId });
        return;
      case 'pause': {
        const character = this.#getCharacterElement();
        if (character === null) throw new Error('missing-character-element');
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
          revealedTargetIds: [...new Set([...this.#snapshot.revealedTargetIds, step.targetId])],
        };
      } else if (step.type === 'announce') {
        this.#snapshot = { ...this.#snapshot, announcedMessageId: step.messageId };
      }
    }
    this.#applySnapshot(this.#snapshot);
  }

  #setSnapshot(snapshot: S00SceneSnapshot): void {
    this.#snapshot = snapshot;
    this.#applySnapshot(snapshot);
  }
}
