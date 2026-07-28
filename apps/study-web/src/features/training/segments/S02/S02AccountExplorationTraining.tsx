import { s02Content } from '@passwo/training-content';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import passWoDockAsset from '../../../../assets/passwo/passwo-dock.png';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  S02AccountExplorationController,
  type S02AccountExplorationControllerSnapshot,
} from './S02AccountExplorationController.js';
import {
  PassWoSpeechBubble,
  type PassWoSpeechPlacement,
} from '../../PassWoSpeechBubble.js';
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

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Runtime {
  readonly controller: S02AccountExplorationController;
  readonly renderer: ReactFlowNetworkAdapter;
}

interface PreviewPosition {
  readonly nodeId: string;
  readonly left: number;
  readonly top: number;
  readonly side: 'left' | 'right';
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function S02AccountExplorationTraining({
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onAllAccountsUnderstood,
  onContinue,
  onRetryTiming,
}: S02AccountExplorationTrainingProps) {
  const characterAnimationAnchorRef = useRef<HTMLDivElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const onAllAccountsUnderstoodRef = useRef(onAllAccountsUnderstood);
  onAllAccountsUnderstoodRef.current = onAllAccountsUnderstood;
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S02AccountExplorationControllerSnapshot | null>(null);
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);
  const [speechPlacement, setSpeechPlacement] = useState<PassWoSpeechPlacement>('right');

  useEffect(() => {
    let controller: S02AccountExplorationController | null = null;
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: definition.accounts[0]?.id ?? '',
      initialRevealedNodeIds: definition.accounts.map(({ id }) => id),
      applySnapshot: (presentation) => controller?.updatePresentation(presentation),
      getCharacterElement: () => characterAnimationAnchorRef.current,
      getActiveNodeElement: () =>
        networkHostRef.current?.querySelector<HTMLElement>(
          '[data-active="true"] [data-scene-node-button]',
        ) ?? null,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      getEdgeElement: (targetNodeId) =>
        networkHostRef.current?.querySelector<SVGPathElement>(
          `[data-network-edge-target="${targetNodeId}"] .react-flow__edge-path`,
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

  useLayoutEffect(() => {
    const activeAccountId = snapshot?.scene.activeAccountId ?? null;
    const previewNodeId = snapshot?.scene.activePreviewDetailId ?? null;
    const sceneElement = sceneRef.current;
    if (sceneElement === null) return;

    const updateGeometry = () => {
      const sceneRect = sceneElement.getBoundingClientRect();
      if (activeAccountId !== null) {
        const accountElement = networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${activeAccountId}"]`,
        );
        if (accountElement !== null && accountElement !== undefined) {
          const accountRect = accountElement.getBoundingClientRect();
          const availableLeft = accountRect.left - sceneRect.left;
          const availableRight = sceneRect.right - accountRect.right;
          setSpeechPlacement(availableRight >= availableLeft ? 'right' : 'left');
        }
      } else {
        setSpeechPlacement('right');
      }

      const previewElement = previewRef.current;
      if (previewNodeId === null || previewElement === null) {
        setPreviewPosition(null);
        return;
      }
      const nodeElement = networkHostRef.current?.querySelector<HTMLElement>(
        `[data-scene-node-button="${previewNodeId}"]`,
      );
      if (nodeElement === null || nodeElement === undefined) return;

      const nodeRect = nodeElement.getBoundingClientRect();
      const previewRect = previewElement.getBoundingClientRect();
      const gap = 18;
      const margin = 16;
      const availableRight = sceneRect.right - nodeRect.right;
      const availableLeft = nodeRect.left - sceneRect.left;
      const clampedTop = Math.round(
        clamp(
          nodeRect.top - sceneRect.top + nodeRect.height / 2 - previewRect.height / 2,
          margin,
          Math.max(margin, sceneRect.height - previewRect.height - margin),
        ),
      );
      const leftBySide = {
        right: Math.round(
          clamp(
            nodeRect.right - sceneRect.left + gap,
            margin,
            Math.max(margin, sceneRect.width - previewRect.width - margin),
          ),
        ),
        left: Math.round(
          clamp(
            nodeRect.left - sceneRect.left - previewRect.width - gap,
            margin,
            Math.max(margin, sceneRect.width - previewRect.width - margin),
          ),
        ),
      };
      const preferredSide =
        availableRight >= previewRect.width + gap || availableRight >= availableLeft
          ? 'right'
          : 'left';
      const completionRect = sceneElement
        .querySelector<HTMLElement>(`[aria-label="${s02Content.page.completion}"]`)
        ?.getBoundingClientRect();
      const overlapsCompletion = (side: 'left' | 'right') =>
        completionRect !== undefined &&
        leftBySide[side] + previewRect.width > completionRect.left - sceneRect.left &&
        leftBySide[side] < completionRect.right - sceneRect.left &&
        clampedTop + previewRect.height > completionRect.top - sceneRect.top &&
        clampedTop < completionRect.bottom - sceneRect.top;
      const alternateSide = preferredSide === 'right' ? 'left' : 'right';
      const side =
        overlapsCompletion(preferredSide) && !overlapsCompletion(alternateSide)
          ? alternateSide
          : preferredSide;
      setPreviewPosition({
        nodeId: previewNodeId,
        side,
        left: leftBySide[side],
        top: clampedTop,
      });
    };

    const frame = requestAnimationFrame(updateGeometry);
    window.addEventListener('resize', updateGeometry);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateGeometry);
    };
  }, [snapshot?.scene.activeAccountId, snapshot?.scene.activePreviewDetailId]);

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
  const timingFailure =
    externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed';
  const interactionBlocked = timingState !== 'active' || externalTimingError !== null;
  const positionedPreview =
    activePreview !== undefined && previewPosition?.nodeId === activePreview.id;
  const previewStyle: CSSProperties | undefined = positionedPreview
    ? { left: previewPosition.left, top: previewPosition.top }
    : undefined;

  return (
    <section className={styles.training} aria-label={s02Content.trainingAriaLabel}>
      <article className={styles.scene} aria-labelledby="s02-account-title">
        <header className={styles.sceneHeader}>
          <div>
            <p className={styles.eyebrow}>{s02Content.page.eyebrow}</p>
            <h1 id="s02-account-title">{s02Content.page.title}</h1>
          </div>
          <p className={styles.taskTracker} role="status">
            {s02Content.page.globalProgress(understoodCount)}
          </p>
        </header>

        <div ref={sceneRef} className={styles.voidScene}>
          <div ref={networkHostRef} className={styles.networkPanel}>
            <ReactFlowNetwork
              adapter={renderer}
              presentation={presentation}
              onNodeSelect={(nodeId) => controller.selectNode(nodeId)}
              ariaLabel={s02Content.accessibility.networkLabel}
              canvasAriaLabel={s02Content.accessibility.canvasLabel}
              interactionDisabled={interactionBlocked}
              visualVariant="void"
              activeNodeId={scene.activeAccountId}
              showEdgeLabels={false}
            />
          </div>

          {activeAccount !== undefined ? (
            <p className={styles.localStatus} role="status">
              <span aria-hidden="true">
                {scene.understoodAccountIds.includes(activeAccount.id) ? '✓' : '○'}
              </span>
              {s02Content.page.localProgress(activeAccount.label, localOpened, localTotal)}
            </p>
          ) : null}

          {activePreview !== undefined ? (
            <section
              ref={previewRef}
              className={styles.preview}
              data-positioned={positionedPreview}
              data-side={positionedPreview ? previewPosition.side : 'right'}
              style={previewStyle}
              aria-labelledby="s02-preview-title"
            >
              <p className={styles.cardLabel}>{s02Content.page.previewTitle}</p>
              <h2 id="s02-preview-title">{activePreview.label}</h2>
              <p>{activePreview.preview}</p>
            </section>
          ) : null}

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

          <div
            ref={characterAnimationAnchorRef}
            className={styles.passWo}
            data-passwo-placement={presentation.character.placement}
            data-speech-side={speechPlacement === 'left' ? 'left' : 'right'}
          >
            <img
              className={styles.passWoImage}
              data-passwo-character
              src={passWoDockAsset}
              alt={s02Content.accessibility.characterLabel}
            />
            <PassWoSpeechBubble
              className={styles.narration}
              speaker={s02Content.narration.guideName}
              paragraphs={[
                narration,
                ...(completionNarration !== '' && completionNarration !== narration
                  ? [completionNarration]
                  : []),
              ]}
              speechKey={`${scene.narrationId}-${completionNarration}`}
              placement={speechPlacement}
              tone="dark"
            />
          </div>
        </div>

        {(timingState === 'starting' || timingState === 'ending') && externalTimingError === null ? (
          <p className={styles.timingStatus} role="status">
            {s02Content.controls.timingSaving}
          </p>
        ) : null}
        {timingFailure ? (
          <section className={styles.timingError} role="alert">
            <p>{s02Content.controls.timingFailure}</p>
            <p>
              {s02Content.controls.timingErrorCode}: {externalTimingError ?? timingErrorCode}
            </p>
            <button type="button" onClick={onRetryTiming}>
              {s02Content.controls.retry}
            </button>
          </section>
        ) : null}
        <p className={styles.screenReaderOnly} aria-live="polite" aria-atomic="true">
          {animationAnnouncement}
        </p>
      </article>
    </section>
  );
}
