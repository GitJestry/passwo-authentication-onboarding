import { s02Content, type S01AccountId, type S02VisualPreviewKind } from '@passwo/training-content';
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
import { S02DesktopSurface } from './S02DesktopSurface.js';
import styles from './S02AccountExplorationTraining.module.css';
import { S03InitialBrowserSurface } from '../S03/S03RetrievalTraining.js';

export type S02TimingState = 'starting' | 'startFailed' | 'active' | 'ending' | 'endFailed';

export interface S02AccountExplorationTrainingProps {
  readonly timingState?: S02TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onAllAccountsUnderstood?: () => void;
  readonly onContinue?: () => void;
  readonly onRetryTiming?: () => void;
  readonly nextActiveAccountId?: S01AccountId;
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

function VisualPreview({ kind }: { readonly kind: S02VisualPreviewKind }) {
  return (
    <div
      className={styles.visualPreview}
      data-preview-kind={kind}
      data-preview-ready
      aria-hidden="true"
    >
      <span className={styles.previewChrome}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.previewNavigation} />
      <span className={styles.previewContent}>
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export function S02AccountExplorationTraining({
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onAllAccountsUnderstood,
  onContinue,
  onRetryTiming,
  nextActiveAccountId,
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
  const [introNarrationFinished, setIntroNarrationFinished] = useState(false);
  const [returningToBrowser, setReturningToBrowser] = useState(false);
  const resolvedNextActiveAccountId = nextActiveAccountId ?? 'campus-id';

  useEffect(() => {
    if (
      returningToBrowser &&
      (externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed')
    ) {
      setReturningToBrowser(false);
    }
  }, [externalTimingError, returningToBrowser, timingState]);

  useEffect(() => {
    let controller: S02AccountExplorationController | null = null;
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: definition.accounts[0]?.id ?? '',
      initialRevealedNodeIds: [],
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

  useEffect(() => {
    if (
      runtime === null ||
      snapshot === null ||
      !introNarrationFinished ||
      timingState !== 'active' ||
      externalTimingError !== null
    ) {
      return;
    }
    runtime.controller.startIntro();
  }, [externalTimingError, introNarrationFinished, runtime, snapshot, timingState]);

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
      setPreviewPosition({
        nodeId: previewNodeId,
        side: preferredSide,
        left: leftBySide[preferredSide],
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

  if (runtime === null || snapshot === null) {
    return (
      <section className={styles.training} aria-label={s02Content.trainingAriaLabel}>
        <article className={styles.scene}>
          <S02DesktopSurface
            browserDock={{
              active: false,
              enabled: false,
              label: s02Content.desktop.browserDockLabel,
            }}
          />
        </article>
      </section>
    );
  }

  const { controller, renderer } = runtime;
  const { scene, presentation } = snapshot;
  const activeAccount = definition.accounts.find(({ id }) => id === scene.activeAccountId);
  const activePreview = activeAccount?.details.find(({ id }) => id === scene.activePreviewDetailId);
  const understoodCount = scene.understoodAccountIds.length;
  const complete = understoodCount === definition.accounts.length;
  const narration = complete
    ? (s02Content.narration.messages[s02Content.narration.completeId] ?? '')
    : (s02Content.narration.messages[scene.narrationId] ?? '');
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02Content.narration.messages[presentation.announcedMessageId] ?? '');
  const timingFailure =
    externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed';
  const interactionBlocked = timingState !== 'active' || externalTimingError !== null;
  const positionedPreview =
    activePreview !== undefined && previewPosition?.nodeId === activePreview.id;
  const previewStyle: CSSProperties | undefined = positionedPreview
    ? { left: previewPosition.left, top: previewPosition.top }
    : undefined;

  function returnToBrowser(): void {
    if (!complete || interactionBlocked || scene.pendingAnimationId !== null || returningToBrowser) {
      return;
    }
    if (prefersReducedMotion()) {
      onContinue?.();
      return;
    }
    setReturningToBrowser(true);
  }

  return (
    <section
      className={styles.training}
      aria-label={s02Content.trainingAriaLabel}
      data-browser-returning={returningToBrowser}
    >
      <div className={styles.browserHandoff}>
        <S03InitialBrowserSurface activeAccountId={resolvedNextActiveAccountId} inert />
      </div>
      <article
        className={styles.scene}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && returningToBrowser) onContinue?.();
        }}
      >
        <S02DesktopSurface
          sceneRef={sceneRef}
          browserDock={{
            active: complete,
            enabled:
              complete &&
              !interactionBlocked &&
              scene.pendingAnimationId === null &&
              !returningToBrowser,
            label: complete
              ? s02Content.desktop.browserDockReadyLabel
              : s02Content.desktop.browserDockLabel,
            onClick: returnToBrowser,
          }}
        >
          <div ref={networkHostRef} className={styles.networkPanel}>
            <ReactFlowNetwork
              adapter={renderer}
              presentation={presentation}
              onNodeSelect={(nodeId) => controller.selectNode(nodeId)}
              ariaLabel={s02Content.accessibility.networkLabel}
              canvasAriaLabel={s02Content.accessibility.canvasLabel}
              interactionDisabled={interactionBlocked || snapshot.introState !== 'complete' || complete}
              visualVariant="account-map"
              activeNodeId={scene.activeAccountId}
              showEdgeLabels={false}
            />
          </div>

          {activePreview !== undefined ? (
            <section
              ref={previewRef}
              className={styles.preview}
              data-positioned={positionedPreview}
              data-side={positionedPreview ? previewPosition.side : 'right'}
              style={previewStyle}
              aria-label={`Visuelle Vorschau für ${activePreview.label}`}
            >
              <VisualPreview key={activePreview.id} kind={activePreview.preview.kind} />
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
              ]}
              speechKey={`${scene.narrationId}-${complete}`}
              placement={speechPlacement}
              onComplete={() => {
                if (scene.narrationId === s02Content.narration.introId) {
                  setIntroNarrationFinished(true);
                }
              }}
            />
          </div>

          <p className={styles.screenReaderOnly} role="status">
            {complete ? s02Content.page.completion : ''}
          </p>
        </S02DesktopSurface>

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
      {returningToBrowser ? (
        <img className={styles.passWoReturnFlight} src={passWoDockAsset} alt="" />
      ) : null}
    </section>
  );
}
