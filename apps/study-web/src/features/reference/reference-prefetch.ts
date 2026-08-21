import { REFERENCE_ARTIFACT_ROUTE_PREFIX } from '@passwo/contracts';
import { scheduleIdleWork } from '../../app/idle-prefetch.js';

const referenceWarmupGroups = [
  [
    'scormdriver/indexAPI.html?StandAlone=true',
    'scormdriver/driverOptions.js',
    'scormdriver/scormdriver.js',
  ],
  [
    'scormdriver/preloadIntegrity.js',
    'scormcontent/index.html',
    'scormcontent/lib/rise/089c1887.js',
  ],
  [
    'scormcontent/lib/lzwcompress.js',
    'scormcontent/lib/learn_dist/entry.js',
    'scormcontent/lib/mondrian/entry.js',
  ],
] as const;

let warmupStarted = false;
let warmupAbortController: AbortController | null = null;
let cancelScheduledWarmup: (() => void) | null = null;

async function warmTarget(path: string, signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`${REFERENCE_ARTIFACT_ROUTE_PREFIX}${path}`, {
      cache: 'force-cache',
      credentials: 'same-origin',
      signal,
    });
    if (!response.ok) return false;
    await response.arrayBuffer();
    return true;
  } catch {
    return false;
  }
}

async function warmInBoundedGroups(signal: AbortSignal): Promise<void> {
  for (const group of referenceWarmupGroups) {
    if (signal.aborted) return;
    const results = await Promise.all(group.map((path) => warmTarget(path, signal)));
    if (signal.aborted || results.includes(false)) return;
  }
}

export function prefetchReferenceArtifact(): void {
  if (warmupStarted) return;
  warmupStarted = true;
  warmupAbortController = new AbortController();
  const signal = warmupAbortController.signal;
  const start = () => {
    cancelScheduledWarmup = null;
    void warmInBoundedGroups(signal);
  };
  cancelScheduledWarmup = scheduleIdleWork(start);
}

export function cancelReferenceArtifactPrefetch(): void {
  warmupAbortController?.abort();
  warmupAbortController = null;
  cancelScheduledWarmup?.();
  cancelScheduledWarmup = null;
}
