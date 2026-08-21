import { REFERENCE_ARTIFACT_ROUTE_PREFIX } from '@passwo/contracts';

const referenceWarmupTargets = [
  'scormdriver/indexAPI.html?StandAlone=true',
  'scormdriver/driverOptions.js',
  'scormdriver/preloadIntegrity.js',
  'scormdriver/scormdriver.js',
  'scormcontent/index.html',
  'scormcontent/lib/lzwcompress.js',
  'scormcontent/lib/rise/089c1887.js',
  'scormcontent/lib/learn_dist/entry.js',
  'scormcontent/lib/mondrian/entry.js',
] as const;

let warmupStarted = false;
let warmupAbortController: AbortController | null = null;
let scheduledWarmup: number | null = null;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { readonly timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

async function warmSequentially(signal: AbortSignal): Promise<void> {
  for (const path of referenceWarmupTargets) {
    if (signal.aborted) return;
    try {
      const response = await fetch(`${REFERENCE_ARTIFACT_ROUTE_PREFIX}${path}`, {
        cache: 'force-cache',
        credentials: 'same-origin',
        signal,
      });
      if (!response.ok) return;
      await response.arrayBuffer();
    } catch {
      if (signal.aborted) return;
      return;
    }
  }
}

export function prefetchReferenceArtifact(): void {
  if (warmupStarted) return;
  warmupStarted = true;
  warmupAbortController = new AbortController();
  const signal = warmupAbortController.signal;
  const idleWindow = window as IdleWindow;
  const start = () => {
    scheduledWarmup = null;
    void warmSequentially(signal);
  };

  if (idleWindow.requestIdleCallback !== undefined) {
    scheduledWarmup = idleWindow.requestIdleCallback(start, { timeout: 1_500 });
    return;
  }
  scheduledWarmup = window.setTimeout(start, 750);
}

export function cancelReferenceArtifactPrefetch(): void {
  warmupAbortController?.abort();
  warmupAbortController = null;
  if (scheduledWarmup !== null) {
    const idleWindow = window as IdleWindow;
    idleWindow.cancelIdleCallback?.(scheduledWarmup);
    window.clearTimeout(scheduledWarmup);
    scheduledWarmup = null;
  }
}
