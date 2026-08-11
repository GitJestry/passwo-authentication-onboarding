import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';

export interface S02PreviewMotionAdapterOptions {
  readonly getPreviewElement: () => HTMLElement | null;
  readonly prefersReducedMotion: () => boolean;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function targetElement(root: HTMLElement, targetId: string): HTMLElement | null {
  return (
    [...root.querySelectorAll<HTMLElement>('[data-preview-target]')].find(
      (element) => element.dataset.previewTarget === targetId,
    ) ?? null
  );
}

export class S02PreviewMotionAdapter implements AnimationPlayerPort {
  readonly #getPreviewElement: () => HTMLElement | null;
  readonly #prefersReducedMotion: () => boolean;
  #activeAnimations: Animation[] = [];
  #cancelled = false;

  constructor({
    getPreviewElement,
    prefersReducedMotion,
  }: S02PreviewMotionAdapterOptions) {
    this.#getPreviewElement = getPreviewElement;
    this.#prefersReducedMotion = prefersReducedMotion;
  }

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    this.#cancelled = false;
    await nextFrame();
    const root = this.#getPreviewElement();
    if (root === null) {
      return { status: 'failed', reasonCode: 'missing-s02-preview' };
    }
    this.#reset(root, sequence);
    if (root.dataset.previewCategory !== 'login' || this.#prefersReducedMotion()) {
      this.#applyEndState(root, sequence);
      return { status: 'finished' };
    }

    for (const step of sequence.steps) {
      if (this.#cancelled) return { status: 'cancelled' };
      if (step.type === 'announce') continue;
      if (step.type === 'pause') {
        await this.#animate(root, [{ opacity: 1 }, { opacity: 1 }], step.durationMs);
        continue;
      }
      if (step.type !== 'reveal' && step.type !== 'highlight') continue;
      const element = targetElement(root, step.targetId);
      if (element === null) continue;
      await this.#playStep(element, step.targetId, step.durationMs);
    }
    if (!this.#cancelled) this.#applyEndState(root, sequence);
    return this.#cancelled ? { status: 'cancelled' } : { status: 'finished' };
  }

  async cancel(): Promise<void> {
    this.#cancelled = true;
    this.#clearAnimations();
  }

  async #playStep(
    element: HTMLElement,
    targetId: string,
    durationMs: number,
  ): Promise<void> {
    const targetPart = targetId.slice(targetId.lastIndexOf(':') + 1);
    if (targetPart === 'cursor') {
      await this.#animate(
        element,
        [
          { opacity: 0, transform: 'translate(-9rem, -7rem)' },
          { opacity: 1, transform: 'translate(-8rem, -6.5rem)', offset: 0.14 },
          { opacity: 1, transform: 'translate(0, 0)' },
        ],
        durationMs,
        'cubic-bezier(0.22, 0.72, 0.28, 1)',
      );
      return;
    }
    if (targetPart === 'primary') {
      await this.#animate(
        element,
        [
          { transform: 'scale(1)', filter: 'brightness(1)' },
          { transform: 'scale(0.97)', filter: 'brightness(0.92)', offset: 0.48 },
          { transform: 'scale(1)', filter: 'brightness(1)' },
        ],
        durationMs,
        'ease-out',
      );
      return;
    }
    if (targetPart === 'auth-status') {
      await this.#animate(
        element,
        [
          { opacity: 0, transform: 'translateY(0.3rem)' },
          { opacity: 1, transform: 'translateY(0)', offset: 0.18 },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        durationMs,
        'ease-out',
      );
      return;
    }
    if (targetPart === 'result') {
      await this.#animate(
        element,
        [
          { opacity: 0, transform: 'scale(0.985)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        durationMs,
        'ease-out',
      );
      return;
    }
    await this.#animate(
      element,
      [
        { opacity: 0, transform: 'translateY(0.25rem)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      durationMs,
      'ease-out',
    );
  }

  async #animate(
    element: HTMLElement,
    keyframes: Keyframe[],
    durationMs: number,
    easing = 'linear',
  ): Promise<void> {
    const animation = element.animate(keyframes, {
      duration: durationMs,
      easing,
      fill: 'forwards',
    });
    this.#activeAnimations.push(animation);
    try {
      await animation.finished;
    } catch {
      // Cancellation is reported through the adapter result.
    }
  }

  #reset(root: HTMLElement, sequence: AnimationSequence): void {
    this.#clearAnimations();
    root.removeAttribute('data-preview-animation-complete');
    for (const step of sequence.steps) {
      if (step.type !== 'reveal' && step.type !== 'highlight') continue;
      const element = targetElement(root, step.targetId);
      if (element === null) continue;
      for (const animation of element.getAnimations()) animation.cancel();
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
      element.style.removeProperty('filter');
    }
  }

  #applyEndState(root: HTMLElement, sequence: AnimationSequence): void {
    for (const step of sequence.steps) {
      if (step.type !== 'reveal' && step.type !== 'highlight') continue;
      const element = targetElement(root, step.targetId);
      if (element === null) continue;
      const targetPart = step.targetId.slice(step.targetId.lastIndexOf(':') + 1);
      element.style.opacity =
        targetPart === 'cursor' || targetPart === 'auth-status' ? '0' : '1';
      element.style.transform = 'none';
      element.style.removeProperty('filter');
    }
    this.#clearAnimations();
    root.dataset.previewAnimationComplete = 'true';
  }

  #clearAnimations(): void {
    for (const animation of this.#activeAnimations) animation.cancel();
    this.#activeAnimations = [];
  }
}
