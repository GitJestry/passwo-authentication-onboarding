import type { MouseEvent } from 'react';

/** Keeps blur-dismissed controls mounted until click, including in Safari. */
export function focusButtonOnMouseDown(event: MouseEvent<HTMLButtonElement>): void {
  if (event.button !== 0) return;

  // Safari does not focus clicked buttons. Prevent its default focus clearing,
  // then move focus inside the control before the enclosing blur handler runs.
  // Activation stays on click so dragging away and keyboard activation still work.
  event.preventDefault();
  event.currentTarget.focus({ preventScroll: true });
}
