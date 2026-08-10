import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ArtifactViewport.module.css';

const MINIMUM_STANDARD_WIDTH = 1152;
const MINIMUM_STANDARD_HEIGHT = 720;
const REFERENCE_WIDTH = 1440;
const REFERENCE_HEIGHT = 900;
const EXPANSIVE_WIDTH = 1680;

type ArtifactLayout = 'compact' | 'constrained' | 'standard' | 'expansive';

const initialLayout: ArtifactLayout = 'standard';

function layoutForSize(width: number, height: number): ArtifactLayout {
  if (width < MINIMUM_STANDARD_WIDTH || height < MINIMUM_STANDARD_HEIGHT) return 'compact';
  if (width < REFERENCE_WIDTH || height < REFERENCE_HEIGHT) return 'constrained';
  if (width >= EXPANSIVE_WIDTH) return 'expansive';
  return 'standard';
}

export function ArtifactViewport({ children }: { readonly children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<ArtifactLayout>(initialLayout);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;

    const update = () => {
      const next = layoutForSize(viewport.clientWidth, viewport.clientHeight);
      setLayout((current) => (current === next ? current : next));
    };
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={viewportRef} className={styles.viewport} data-artifact-viewport="">
      <div className={styles.stage} data-artifact-stage="" data-artifact-layout={layout}>
        {children}
      </div>
    </div>
  );
}
