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
    'scormcontent/lib/lzwcompress.js',
  ],
  [
    'scormcontent/lib/rise/089c1887.js',
    'scormcontent/lib/learn_dist/entry.js',
    'scormcontent/lib/mondrian/entry.js',
  ],
  [
    'scormcontent/lib/rise/bb36bef0.js',
    'scormcontent/lib/rise/d9b9ec3d.js',
    'scormcontent/lib/rise/64b25d98.css',
  ],
  [
    'scormcontent/lib/rise/79bcdede.css',
    'scormcontent/assets/aBcORCWLh3hZzWVI.png',
  ],
] as const;

let warmupStarted = false;

async function warmTarget(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${REFERENCE_ARTIFACT_ROUTE_PREFIX}${path}`, {
      cache: 'force-cache',
      credentials: 'same-origin',
    });
    if (!response.ok) return false;
    await response.arrayBuffer();
    return true;
  } catch {
    return false;
  }
}

async function warmInBoundedGroups(): Promise<void> {
  for (const group of referenceWarmupGroups) {
    const results = await Promise.all(group.map((path) => warmTarget(path)));
    if (results.includes(false)) return;
  }
}

export function prefetchReferenceArtifact(): void {
  if (warmupStarted) return;
  warmupStarted = true;
  const start = () => {
    void warmInBoundedGroups();
  };
  scheduleIdleWork(start);
}
