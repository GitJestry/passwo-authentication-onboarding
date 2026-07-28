import {
  type S06ConsequenceExplanation,
  type S06ConsequenceFixtureId,
  s06ConsequenceContent,
} from '@passwo/training-content';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import { BrowserSegmentTimingAdapter } from '../../../../adapters/animation/BrowserSegmentTimingAdapter.js';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  getS06InitialNetworkPresentation,
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

function ResultExplanation({ content }: { readonly content: S06ConsequenceExplanation }) {
  return (
    <>
      <p>{content.body}</p>
      {content.listItems.length === 0 ? null : (
        <ul>
          {content.listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export function S06ConsequenceTraining({
  fixtureId,
}: {
  readonly fixtureId: S06ConsequenceFixtureId;
}) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S06ConsequenceControllerSnapshot | null>(null);

  useEffect(() => {
    let controller: S06ConsequenceController | null = null;
    const initialPresentation = getS06InitialNetworkPresentation(fixtureId);
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: initialPresentation.initialNodeId,
      initialRevealedNodeIds: initialPresentation.initialRevealedNodeIds,
      applySnapshot: (presentation) => controller?.updatePresentation(presentation),
      getCharacterElement: () => null,
      getActiveNodeElement: () =>
        networkHostRef.current?.querySelector<HTMLElement>(
          '[data-active="true"] [data-scene-node-button]',
        ) ?? null,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      prefersReducedMotion,
    });
    controller = new S06ConsequenceController({
      fixtureId,
      animationPlayer,
      timingPort: new BrowserSegmentTimingAdapter(),
    });
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

          {snapshot.participant.hypotheticalNotice === null ? null : (
            <p className={styles.hypotheticalBanner} role="status">
              ◇ {snapshot.participant.hypotheticalNotice}
            </p>
          )}

          <div className={styles.workspace}>
            <div ref={networkHostRef} className={styles.networkPanel}>
              <ReactFlowNetwork
                adapter={runtime.renderer}
                presentation={snapshot.presentation}
                onNodeSelect={() => undefined}
              />
            </div>
            <aside className={styles.sidebar} aria-labelledby="s06-result-title">
              <p className={styles.cardLabel}>{snapshot.participant.scenarioLabel}</p>
              <h2 id="s06-result-title">{snapshot.participant.comparisonTitle}</h2>
              <ResultExplanation content={snapshot.participant.explanation} />
              {snapshot.participant.semantic === null ? null : (
                <p
                  className={styles.semanticStatus}
                  data-emphasis={snapshot.participant.semantic.emphasis}
                  role="status"
                >
                  <span aria-hidden="true">{snapshot.participant.semantic.symbol}</span>
                  <span>{snapshot.participant.semantic.label}</span>
                </p>
              )}
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  disabled={!snapshot.controls.canStart}
                  onClick={() => runtime.controller.startComparison()}
                >
                  {s06ConsequenceContent.page.start}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={!snapshot.controls.canReplay}
                  onClick={() => runtime.controller.replayComparison()}
                >
                  {s06ConsequenceContent.page.replay}
                </button>
                <button
                  type="button"
                  disabled={!snapshot.controls.canContinue}
                  onClick={() => void runtime.controller.continue()}
                >
                  {s06ConsequenceContent.page.continue}
                </button>
              </div>
            </aside>
          </div>
        </article>
      </BrowserShell>
    </section>
  );
}
