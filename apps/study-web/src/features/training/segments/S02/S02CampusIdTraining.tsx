import { s02CampusIdContent } from '@passwo/training-content';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import { useEffect, useRef, useState } from 'react';
import {
  PassWoCharacterRenderer,
  PassWoNetworkCharacter,
  toCharacterRendererState,
} from '../../../../adapters/character/PassWoCharacterAdapter.js';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  S02CampusIdController,
  type S02CampusIdControllerSnapshot,
} from './S02CampusIdController.js';
import styles from './S02CampusIdTraining.module.css';

const definition = s02CampusIdContent.scene;

const browserSnapshot: BrowserShellSnapshot = {
  tabs: [s02CampusIdContent.browser.tab],
  activeTabId: s02CampusIdContent.browser.tab.id,
  address: s02CampusIdContent.browser.address,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface S02CampusIdRuntime {
  readonly controller: S02CampusIdController;
  readonly renderer: ReactFlowNetworkAdapter;
}

export function S02CampusIdTraining() {
  const characterRef = useRef<HTMLDivElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [characterRenderer] = useState(() => new PassWoCharacterRenderer());
  const [runtime, setRuntime] = useState<S02CampusIdRuntime | null>(null);
  const [snapshot, setSnapshot] = useState<S02CampusIdControllerSnapshot | null>(null);

  useEffect(() => {
    let controller: S02CampusIdController | null = null;
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: definition.account.id,
      applySnapshot: (presentation) => controller?.updatePresentation(presentation),
      getCharacterElement: () => characterRef.current,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      prefersReducedMotion,
    });
    controller = new S02CampusIdController({
      animationPlayer,
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
  }, []);

  const pendingPresentation = snapshot?.presentation ?? null;
  useEffect(() => {
    if (pendingPresentation !== null) {
      characterRenderer.render(toCharacterRendererState(pendingPresentation.character));
    }
  }, [characterRenderer, pendingPresentation]);

  if (runtime === null || snapshot === null) return null;

  const { controller, renderer } = runtime;
  const { scene, presentation } = snapshot;

  const activePreview = s02CampusIdContent.scene.services.find(
    ({ id }) => id === scene.activePreviewServiceId,
  );
  const narration = s02CampusIdContent.narration.messages[scene.narrationId] ?? '';
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02CampusIdContent.narration.messages[presentation.announcedMessageId] ?? '');

  return (
    <section className={styles.training} aria-label={s02CampusIdContent.trainingAriaLabel}>
      <BrowserShell
        snapshot={browserSnapshot}
        ariaLabel={s02CampusIdContent.browser.ariaLabel}
        onTabSelect={() => undefined}
      >
        <article className={styles.page} aria-labelledby="s02-campus-id-title">
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{s02CampusIdContent.page.eyebrow}</p>
              <h1 id="s02-campus-id-title">{s02CampusIdContent.page.title}</h1>
              <p className={styles.pageInstruction}>{s02CampusIdContent.page.instruction}</p>
            </div>
            <div className={styles.progressBlock}>
              <strong>
                {scene.openedServiceIds.length} / {definition.services.length}
              </strong>
              <span>{s02CampusIdContent.page.progressLabel}</span>
              <progress
                max={definition.services.length}
                value={scene.openedServiceIds.length}
                aria-label={`${scene.openedServiceIds.length} von ${definition.services.length} Vorschauen geöffnet`}
              />
            </div>
          </header>

          <div className={styles.workspace}>
            <div ref={networkHostRef} className={styles.networkPanel}>
              <ReactFlowNetwork
                adapter={renderer}
                presentation={presentation}
                onNodeSelect={(nodeId) => controller.selectNode(nodeId)}
              />
              <PassWoNetworkCharacter renderer={characterRenderer} characterRef={characterRef} />
            </div>

            <aside className={styles.sidebar} aria-label="CampusID-Erklärung und Vorschau">
              <section className={styles.narration} aria-labelledby="s02-passwo-title">
                <p className={styles.cardLabel}>{s02CampusIdContent.narration.guideName}</p>
                <h2 id="s02-passwo-title">Ein Konto, mehrere Dienste</h2>
                <p>{narration}</p>
              </section>

              {scene.phase === 'understood' ? (
                <p className={styles.completion} role="status">
                  <span aria-hidden="true">✓</span>
                  {s02CampusIdContent.page.completion}
                </p>
              ) : null}

              <section className={styles.preview} aria-labelledby="s02-preview-title">
                <p className={styles.cardLabel}>{s02CampusIdContent.page.previewTitle}</p>
                <h2 id="s02-preview-title">
                  {activePreview?.label ?? 'Noch keine Vorschau geöffnet'}
                </h2>
                <p>
                  {activePreview?.preview ??
                    (scene.phase === 'locked' || scene.phase === 'opening-account'
                      ? s02CampusIdContent.page.previewLocked
                      : s02CampusIdContent.page.previewEmpty)}
                </p>
              </section>
            </aside>
          </div>
          <p className={styles.screenReaderOnly} aria-live="polite" aria-atomic="true">
            {animationAnnouncement}
          </p>
        </article>
      </BrowserShell>
    </section>
  );
}
