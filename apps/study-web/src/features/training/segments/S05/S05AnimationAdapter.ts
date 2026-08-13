import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';

export interface S05AnimationAdapterOptions {
  readonly getElement: (targetId: string) => HTMLElement | null;
  readonly prefersReducedMotion: () => boolean;
}

export class S05AnimationAdapter implements AnimationPlayerPort {
  readonly #getElement: S05AnimationAdapterOptions['getElement'];
  readonly #prefersReducedMotion: S05AnimationAdapterOptions['prefersReducedMotion'];
  #activeAnimation: Animation | null = null;
  #cancelled = false;
  #previousSequenceId: string | null = null;
  #previousTarget: HTMLElement | null = null;

  constructor({ getElement, prefersReducedMotion }: S05AnimationAdapterOptions) {
    this.#getElement = getElement;
    this.#prefersReducedMotion = prefersReducedMotion;
  }

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    await this.cancel();
    this.#cancelled = false;
    if (this.#prefersReducedMotion()) return { status: 'finished' };

    for (const step of sequence.steps) {
      if (step.type !== 'highlight' && step.type !== 'reveal') continue;
      if (step.targetId === 'component-conveyor' || step.targetId === 'component-strategy') {
        continue;
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (this.#cancelled) return { status: 'cancelled' };
      const element = this.#getElement(step.targetId);
      if (element === null) return { status: 'failed', reasonCode: 's05-animation-target-missing' };
      if (step.targetId === 'final-components') {
        // The assessment canvas owns its authored node positions. Scaling the complete
        // canvas during its first frame makes React Flow recompute and visibly shift edges.
        this.#previousSequenceId = sequence.id;
        this.#previousTarget = element;
        continue;
      }
      if (step.targetId === 'final-result' || step.targetId === 'final-takeaway') {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const animations = element
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation.playState !== 'finished' &&
              animation.effect?.getTiming().iterations !== Number.POSITIVE_INFINITY,
          );
        if (animations.length > 0) {
          await Promise.allSettled(animations.map((animation) => animation.finished));
          if (this.#cancelled) return { status: 'cancelled' };
          continue;
        }
      }
      // Consecutive narration steps can retarget the same persistent scene. Replaying the
      // whole-scene entrance in that case makes already visible cards appear to reload.
      const sharesVisibleScene =
        this.#previousTarget !== null &&
        (element === this.#previousTarget ||
          element.contains(this.#previousTarget) ||
          this.#previousTarget.contains(element));
      const advancesWithinScene =
        this.#previousSequenceId !== null && this.#previousSequenceId !== sequence.id;
      this.#previousSequenceId = sequence.id;
      this.#previousTarget = element;

      if (sharesVisibleScene && advancesWithinScene) continue;

      this.#activeAnimation = element.animate(
        [
          { opacity: 0.45, transform: 'scale(0.98)' },
          { opacity: 1, transform: 'scale(1.015)', offset: 0.55 },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: step.durationMs, easing: 'ease-out' },
      );
      try {
        await this.#activeAnimation.finished;
      } catch {
        return { status: this.#cancelled ? 'cancelled' : 'failed' };
      } finally {
        this.#activeAnimation = null;
      }
    }
    return { status: 'finished' };
  }

  async cancel(): Promise<void> {
    this.#cancelled = true;
    this.#activeAnimation?.cancel();
    this.#activeAnimation = null;
  }
}
