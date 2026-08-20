import { REFERENCE_ARTIFACT_ROUTE_PREFIX } from '@passwo/contracts';

interface ReferencePrefetchTarget {
  readonly path: string;
  readonly as?: 'document' | 'font' | 'script' | 'style' | 'video';
}

const referencePrefetchTargets: readonly ReferencePrefetchTarget[] = [
  { path: 'scormdriver/indexAPI.html?StandAlone=true', as: 'document' },
  { path: 'scormdriver/scormdriver.js', as: 'script' },
  { path: 'scormdriver/driverOptions.js', as: 'script' },
  { path: 'scormdriver/preloadIntegrity.js', as: 'script' },
  { path: 'scormcontent/index.html', as: 'document' },
  { path: 'scormcontent/lib/lzwcompress.js', as: 'script' },
  { path: 'scormcontent/lib/rise/089c1887.js', as: 'script' },
  { path: 'scormcontent/lib/rise/4a460832.js', as: 'script' },
  { path: 'scormcontent/lib/rise/48427b49.js', as: 'script' },
  { path: 'scormcontent/lib/rise/bb36bef0.js', as: 'script' },
  { path: 'scormcontent/lib/rise/d9b9ec3d.js', as: 'script' },
  { path: 'scormcontent/lib/rise/64b25d98.css', as: 'style' },
  { path: 'scormcontent/lib/rise/79bcdede.css', as: 'style' },
  { path: 'scormcontent/lib/mondrian/entry.js', as: 'script' },
  { path: 'scormcontent/lib/learn_dist/entry.js', as: 'script' },
  { path: 'scormcontent/assets/U4w9PDNngJxwB5_j/story.html', as: 'document' },
  {
    path: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/bootstrapper.min.js',
    as: 'script',
  },
  {
    path: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/slides.min.js',
    as: 'script',
  },
  {
    path: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/frame.desktop.min.js',
    as: 'script',
  },
  {
    path: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/data/css/output.min.css',
    as: 'style',
  },
  { path: 'scormcontent/assets/U4w9PDNngJxwB5_j/lms/scormdriver.js', as: 'script' },
  { path: 'scormcontent/assets/VRuCzkjdJavVemQT/story.html', as: 'document' },
  {
    path: 'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/bootstrapper.min.js',
    as: 'script',
  },
  {
    path: 'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/slides.min.js',
    as: 'script',
  },
  {
    path: 'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/frame.desktop.min.js',
    as: 'script',
  },
  {
    path: 'scormcontent/assets/VRuCzkjdJavVemQT/html5/data/css/output.min.css',
    as: 'style',
  },
  { path: 'scormcontent/assets/250326_SA_StarkePasswoerte.mp4', as: 'video' },
  { path: 'scormcontent/assets/230620_SA_PasswortManager_.mp4', as: 'video' },
  { path: 'scormcontent/assets/230623_SA_MultiFaktorAuthe.mp4', as: 'video' },
];

let prefetchStarted = false;

export function prefetchReferenceArtifact(): void {
  if (prefetchStarted) return;
  prefetchStarted = true;

  for (const target of referencePrefetchTargets) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `${REFERENCE_ARTIFACT_ROUTE_PREFIX}${target.path}`;
    if (target.as !== undefined) link.as = target.as;
    link.setAttribute('fetchpriority', 'low');
    link.dataset.passwoReferencePrefetch = '';
    document.head.append(link);
  }
}
