import type {
  AnimationPlayerPort,
  AnimationResult,
  AnimationSequence,
} from '@passwo/training-engine';

export interface S02PreviewMotionAdapterOptions {
  readonly getPreviewElement: () => HTMLElement | null;
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
  #cancelled = false;

  constructor({ getPreviewElement }: S02PreviewMotionAdapterOptions) {
    this.#getPreviewElement = getPreviewElement;
  }

  async play(sequence: AnimationSequence): Promise<AnimationResult> {
    this.#cancelled = false;
    await nextFrame();
    const root = this.#getPreviewElement();
    if (root === null) {
      return { status: 'failed', reasonCode: 'missing-s02-preview' };
    }
    this.#applyEndState(root, sequence);
    return this.#cancelled ? { status: 'cancelled' } : { status: 'finished' };
  }

  async cancel(): Promise<void> {
    this.#cancelled = true;
  }

  #applyEndState(root: HTMLElement, sequence: AnimationSequence): void {
    for (const step of sequence.steps) {
      if (step.type !== 'reveal' && step.type !== 'highlight') continue;
      const element = targetElement(root, step.targetId);
      if (element === null) continue;
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.removeProperty('filter');
    }
    root.dataset.previewAnimationComplete = 'true';
  }
}
