type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { readonly timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function scheduleIdleWork(callback: () => void): () => void {
  const idleWindow: IdleWindow = window;
  if (idleWindow.requestIdleCallback !== undefined) {
    const handle = idleWindow.requestIdleCallback(callback, { timeout: 1_500 });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(callback, 750);
  return () => window.clearTimeout(handle);
}
