import {
  getS06ConsequenceFixture,
  type S06ConsequenceFixtureId,
  s06ConsequenceContent,
} from '@passwo/training-content';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  createS06ConsequenceDefinition,
  S06ConsequenceController,
  type S06ConsequenceControllerSnapshot,
} from './S06ConsequenceController.js';
import styles from './S06ConsequenceTraining.module.css';

const browserSnapshot: BrowserShellSnapshot = {
  tabs: [s06ConsequenceContent.browser.tab],
  activeTabId: s06ConsequenceContent.browser.tab.id,
  address: s06ConsequenceContent.browser.address,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Runtime {
  readonly controller: S06ConsequenceController;
  readonly renderer: ReactFlowNetworkAdapter;
}

function ResultExplanation({ snapshot }: { readonly snapshot: S06ConsequenceControllerSnapshot }) {
  const { analysis } = snapshot.scene;
  if (snapshot.scene.phase === 'ready') {
    return (
      <p>Das Ergebnis ist als Fixture vorgegeben und wird erst durch das Scene-Event sichtbar.</p>
    );
  }
  if (snapshot.scene.phase === 'comparing') {
    return <p>{s06ConsequenceContent.page.comparing}</p>;
  }
  if (analysis.context === 'hypothetical-example') {
    return (
      <p>
        Dieses direkte Ergebnis gehört nur zum hypothetischen Gegenbeispiel und nicht zu einer
        realen Auswahl.
      </p>
    );
  }
  if (analysis.outcome === 'identical') {
    return <p>⚠ Gleiches Passwort: Der Zugang zum Zielkonto ist in dieser Szene betroffen.</p>;
  }
  if (analysis.outcome === 'similar') {
    return (
      <>
        <p>≈ Ähnliche Struktur: Der Zugang zum Zielkonto ist in dieser Szene betroffen.</p>
        <ul aria-label="Sichtbare gemeinsame Struktur">
          <li>Gemeinsamer Kern</li>
          <li>Ähnlicher Aufbau</li>
        </ul>
      </>
    );
  }
  return (
    <p>
      <strong>{s06ConsequenceContent.scene.labels.blocked}</strong>. Die Aussage gilt nur für diesen
      dargestellten Weg.
    </p>
  );
}

export function S06ConsequenceTraining({
  fixtureId,
}: {
  readonly fixtureId: S06ConsequenceFixtureId;
}) {
  const fixture = getS06ConsequenceFixture(fixtureId);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S06ConsequenceControllerSnapshot | null>(null);

  useEffect(() => {
    let controller: S06ConsequenceController | null = null;
    const definition = createS06ConsequenceDefinition(fixtureId);
    const initialNodeIds =
      definition.analysis.context === 'hypothetical-example'
        ? [
            definition.analysis.sourceAccountId,
            definition.analysis.targetAccountId,
            `${definition.id}-hypothetical`,
          ]
        : [definition.analysis.sourceAccountId, definition.analysis.targetAccountId];
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: definition.analysis.sourceAccountId,
      initialRevealedNodeIds: initialNodeIds,
      applySnapshot: (presentation) => controller?.updatePresentation(presentation),
      getCharacterElement: () => null,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      prefersReducedMotion,
    });
    controller = new S06ConsequenceController({ fixtureId, animationPlayer });
    const renderer = new ReactFlowNetworkAdapter(controller.getSnapshot().scene.network);
    controller.attachRenderer(renderer);
    const unsubscribe = controller.subscribe(setSnapshot);
    setRuntime({ controller, renderer });
    setSnapshot(controller.getSnapshot());

    return () => {
      unsubscribe();
      void controller?.dispose();
    };
  }, [fixtureId]);

  if (runtime === null || snapshot === null) return null;

  const hypothetical = fixture.analysis.context === 'hypothetical-example';

  return (
    <section className={styles.training} aria-label={s06ConsequenceContent.trainingAriaLabel}>
      <BrowserShell
        snapshot={browserSnapshot}
        ariaLabel={s06ConsequenceContent.browser.ariaLabel}
        onTabSelect={() => undefined}
      >
        <article className={styles.page} aria-labelledby="s06-consequence-title">
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{s06ConsequenceContent.page.eyebrow}</p>
              <h1 id="s06-consequence-title">{s06ConsequenceContent.page.title}</h1>
              <p>{s06ConsequenceContent.page.instruction}</p>
            </div>
            <span className={styles.fixtureNotice}>{s06ConsequenceContent.page.fixtureNotice}</span>
          </header>

          {hypothetical ? (
            <p className={styles.hypotheticalBanner} role="status">
              ◇ {s06ConsequenceContent.scene.labels.hypothetical}
            </p>
          ) : null}

          <div className={styles.workspace}>
            <div ref={networkHostRef} className={styles.networkPanel}>
              <ReactFlowNetwork
                adapter={runtime.renderer}
                presentation={snapshot.presentation}
                onNodeSelect={() => undefined}
              />
            </div>
            <aside className={styles.sidebar} aria-labelledby="s06-result-title">
              <p className={styles.cardLabel}>Szenario: {fixture.label}</p>
              <h2 id="s06-result-title">Vergleich mit {fixture.targetLabel}</h2>
              <ResultExplanation snapshot={snapshot} />
              <button
                type="button"
                disabled={snapshot.scene.phase !== 'ready'}
                onClick={() => runtime.controller.startComparison()}
              >
                {s06ConsequenceContent.page.start}
              </button>
            </aside>
          </div>
        </article>
      </BrowserShell>
    </section>
  );
}
