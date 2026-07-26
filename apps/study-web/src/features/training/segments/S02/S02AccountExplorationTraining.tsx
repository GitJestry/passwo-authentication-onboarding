import { s02Content } from '@passwo/training-content';
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
  S02AccountExplorationController,
  type S02AccountExplorationControllerSnapshot,
} from './S02AccountExplorationController.js';
import styles from './S02AccountExplorationTraining.module.css';

export type S02TimingState = 'starting' | 'startFailed' | 'active' | 'ending' | 'endFailed';

export interface S02AccountExplorationTrainingProps {
  readonly timingState?: S02TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onAllAccountsUnderstood?: () => void;
  readonly onContinue?: () => void;
  readonly onRetryTiming?: () => void;
}

const definition = s02Content.scene;
const browserSnapshot: BrowserShellSnapshot = {
  tabs: [s02Content.browser.tab],
  activeTabId: s02Content.browser.tab.id,
  address: s02Content.browser.address,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Runtime {
  readonly controller: S02AccountExplorationController;
  readonly renderer: ReactFlowNetworkAdapter;
}

export function S02AccountExplorationTraining({
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onAllAccountsUnderstood,
  onContinue,
  onRetryTiming,
}: S02AccountExplorationTrainingProps) {
  const characterRef = useRef<HTMLDivElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const onAllAccountsUnderstoodRef = useRef(onAllAccountsUnderstood);
  onAllAccountsUnderstoodRef.current = onAllAccountsUnderstood;
  const [characterRenderer] = useState(() => new PassWoCharacterRenderer());
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S02AccountExplorationControllerSnapshot | null>(null);

  useEffect(() => {
    let controller: S02AccountExplorationController | null = null;
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: definition.accounts[0]?.id ?? '',
      initialRevealedNodeIds: definition.accounts.map(({ id }) => id),
      applySnapshot: (presentation) => controller?.updatePresentation(presentation),
      getCharacterElement: () => characterRef.current,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      prefersReducedMotion,
    });
    controller = new S02AccountExplorationController({
      animationPlayer,
      onAllAccountsUnderstood: () => onAllAccountsUnderstoodRef.current?.(),
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
  const activeAccount = definition.accounts.find(({ id }) => id === scene.activeAccountId);
  const activeProgress = scene.accountProgress.find(
    ({ accountId }) => accountId === scene.activeAccountId,
  );
  const activePreview = activeAccount?.details.find(({ id }) => id === scene.activePreviewDetailId);
  const narration = s02Content.narration.messages[scene.narrationId] ?? '';
  const completionNarration =
    activeAccount !== undefined && scene.understoodAccountIds.includes(activeAccount.id)
      ? (s02Content.narration.messages[activeAccount.narrationIds.understood] ?? '')
      : '';
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02Content.narration.messages[presentation.announcedMessageId] ?? '');
  const understoodCount = scene.understoodAccountIds.length;
  const complete = understoodCount === definition.accounts.length;
  const localOpened = activeProgress?.openedDetailIds.length ?? 0;
  const localTotal = activeAccount?.details.length ?? 0;
  const localProgress =
    activeAccount === undefined
      ? 'Noch kein Konto ausgewählt'
      : s02Content.page.localProgress(activeAccount.label, localOpened, localTotal);
  const timingFailure =
    externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed';
  const interactionBlocked = timingState !== 'active' || externalTimingError !== null;

  return (
    <section className={styles.training} aria-label={s02Content.trainingAriaLabel}>
      <BrowserShell
        snapshot={browserSnapshot}
        ariaLabel={s02Content.browser.ariaLabel}
        onTabSelect={() => undefined}
      >
        <article className={styles.page} aria-labelledby="s02-account-title">
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{s02Content.page.eyebrow}</p>
              <h1 id="s02-account-title">{s02Content.page.title}</h1>
              <p className={styles.pageInstruction}>{s02Content.page.instruction}</p>
            </div>
            <div className={styles.progressBlock}>
              <strong aria-live="polite">{s02Content.page.globalProgress(understoodCount)}</strong>
              <span>{localProgress}</span>
              <progress
                max={definition.accounts.length}
                value={understoodCount}
                aria-label={s02Content.page.globalProgress(understoodCount)}
              />
            </div>
          </header>

          <div className={styles.workspace}>
            <div ref={networkHostRef} className={styles.networkPanel}>
              <ReactFlowNetwork
                adapter={renderer}
                presentation={presentation}
                onNodeSelect={(nodeId) => controller.selectNode(nodeId)}
                ariaLabel="Knotennetz zum Erkunden der drei Konten"
                canvasAriaLabel="Deterministisch angeordnetes Knotennetz mit drei Hauptkonten"
                interactionDisabled={interactionBlocked}
              />
              <PassWoNetworkCharacter renderer={characterRenderer} characterRef={characterRef} />
            </div>

            <aside className={styles.sidebar} aria-label="Kontenerklärung und Vorschau">
              <section className={styles.narration} aria-labelledby="s02-passwo-title">
                <p className={styles.cardLabel}>{s02Content.narration.guideName}</p>
                <h2 id="s02-passwo-title">
                  {activeAccount?.label ?? 'Drei Konten, unterschiedliche Bedeutung'}
                </h2>
                <p>{narration}</p>
                {completionNarration !== '' && completionNarration !== narration ? (
                  <p>{completionNarration}</p>
                ) : null}
              </section>

              {activeAccount !== undefined ? (
                <p className={styles.localStatus} role="status">
                  <span aria-hidden="true">
                    {scene.understoodAccountIds.includes(activeAccount.id) ? '✓' : '○'}
                  </span>
                  {localProgress}
                </p>
              ) : null}

              <section className={styles.preview} aria-labelledby="s02-preview-title">
                <p className={styles.cardLabel}>{s02Content.page.previewTitle}</p>
                <h2 id="s02-preview-title">
                  {activePreview?.label ?? 'Noch keine Vorschau geöffnet'}
                </h2>
                <p>{activePreview?.preview ?? s02Content.page.previewEmpty}</p>
              </section>

              {complete ? (
                <section className={styles.completion} aria-label={s02Content.page.completion}>
                  <p role="status">
                    <span aria-hidden="true">✓</span>
                    {s02Content.page.completion}
                  </p>
                  <button type="button" disabled={interactionBlocked} onClick={onContinue}>
                    {s02Content.controls.continue}
                  </button>
                </section>
              ) : null}
            </aside>
          </div>

          {(timingState === 'starting' || timingState === 'ending') &&
          externalTimingError === null ? (
            <p className={styles.timingStatus} role="status">
              {s02Content.controls.timingSaving}
            </p>
          ) : null}
          {timingFailure ? (
            <section className={styles.timingError} role="alert">
              <p>{s02Content.controls.timingFailure}</p>
              <p>Fehlercode: {externalTimingError ?? timingErrorCode}</p>
              <button type="button" onClick={onRetryTiming}>
                {s02Content.controls.retry}
              </button>
            </section>
          ) : null}
          <p className={styles.screenReaderOnly} aria-live="polite" aria-atomic="true">
            {animationAnnouncement}
          </p>
        </article>
      </BrowserShell>
    </section>
  );
}
