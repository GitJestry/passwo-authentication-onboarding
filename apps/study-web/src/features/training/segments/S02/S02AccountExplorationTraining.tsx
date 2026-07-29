import { s02Content, type S02VisualPreviewKind } from '@passwo/training-content';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
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
import { PassWoSpeechBubble } from '../../PassWoSpeechBubble.js';
import { S02DesktopSurface } from './S02DesktopSurface.js';
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

type OverlaySide = 'left' | 'right' | 'above' | 'below';

interface OverlayPosition {
  readonly anchorId: string;
  readonly left: number;
  readonly top: number;
  readonly side: OverlaySide;
}

interface OverlayLayout {
  readonly guide: OverlayPosition | null;
  readonly preview: OverlayPosition | null;
}

interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface PlacementCandidate {
  readonly left: number;
  readonly top: number;
  readonly side: OverlaySide;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function relativeBounds(rect: DOMRect, containerRect: DOMRect, padding = 0): Bounds {
  return {
    left: rect.left - containerRect.left - padding,
    top: rect.top - containerRect.top - padding,
    right: rect.right - containerRect.left + padding,
    bottom: rect.bottom - containerRect.top + padding,
  };
}

function overlapArea(
  left: number,
  top: number,
  width: number,
  height: number,
  obstacle: Bounds,
): number {
  return (
    Math.max(0, Math.min(left + width, obstacle.right) - Math.max(left, obstacle.left)) *
    Math.max(0, Math.min(top + height, obstacle.bottom) - Math.max(top, obstacle.top))
  );
}

function placementCandidates(
  anchor: Bounds,
  width: number,
  height: number,
  availableWidth: number,
  availableBottom: number,
  margin: number,
  gap: number,
): readonly PlacementCandidate[] {
  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;
  const maxLeft = Math.max(margin, availableWidth - width - margin);
  const maxTop = Math.max(margin, availableBottom - height);
  const position = (
    side: OverlaySide,
    proposedLeft: number,
    proposedTop: number,
  ): PlacementCandidate => ({
    side,
    left: Math.round(clamp(proposedLeft, margin, maxLeft)),
    top: Math.round(clamp(proposedTop, margin, maxTop)),
  });

  return [
    position('right', anchor.right + gap, centerY - height / 2),
    position('left', anchor.left - width - gap, centerY - height / 2),
    position('below', centerX - width / 2, anchor.bottom + gap),
    position('above', centerX - width / 2, anchor.top - height - gap),
  ];
}

function bestPlacement(
  candidates: readonly PlacementCandidate[],
  width: number,
  height: number,
  obstacles: readonly Bounds[],
  anchor: Bounds,
): PlacementCandidate {
  const scored = candidates.map((candidate, preference) => ({
    ...candidate,
    score:
      overlapArea(candidate.left, candidate.top, width, height, anchor) * 10_000 +
      obstacles.reduce(
        (score, obstacle) =>
          score + overlapArea(candidate.left, candidate.top, width, height, obstacle),
        0,
      ) +
      preference * 40,
  }));
  return scored.reduce((best, candidate) => (candidate.score < best.score ? candidate : best));
}

function samePosition(
  current: OverlayPosition | null,
  next: OverlayPosition | null,
): boolean {
  if (current === null || next === null) return current === next;
  return (
    current.anchorId === next.anchorId &&
    current.left === next.left &&
    current.top === next.top &&
    current.side === next.side
  );
}

function VisualPreview({ kind }: { readonly kind: S02VisualPreviewKind }) {
  const previewContent = s02Content.previewSimulation;
  const preview = previewContent.variants[kind];

  return (
    <div
      className={styles.visualPreview}
      data-preview-kind={kind}
      data-preview-category={preview.category}
      data-preview-ready
      aria-hidden="true"
    >
      <span className={styles.previewChrome}>
        <span className={styles.previewWindowControls}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.previewAddress}>{previewContent.address}</span>
      </span>
      <span className={styles.previewAppBar}>
        <strong>{preview.app}</strong>
        <i />
      </span>
      {preview.category === 'login' ? (
        <span className={styles.loginPreview}>
          <span className={styles.loginCard}>
            <small>
              {previewContent.welcomeLabel} {preview.app}
            </small>
            <strong>{preview.title}</strong>
            <i className={styles.loginField} />
            <i className={styles.loginField} />
            <span className={styles.masterCampusButton}>
              <i>MC</i>
              {previewContent.masterCampusSignInLabel}
            </span>
          </span>
          <span className={styles.previewPointer} />
          <span className={styles.previewClickPulse} />
        </span>
      ) : null}
      {preview.category === 'mail' ? (
        <span className={styles.mailPreview}>
          <span className={styles.mailSidebar}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.mailList}>
            <strong>{preview.title}</strong>
            <span className={styles.mailRow}>
              <i />
              <span>
                <b>{previewContent.serviceSender}</b>
                <small>{previewContent.serviceMessage}</small>
              </span>
            </span>
            <span className={styles.mailRow}>
              <i />
              <span>
                <b>{previewContent.projectSender}</b>
                <small>{previewContent.projectMessage}</small>
              </span>
            </span>
            <span className={styles.mailDetail}>
              <b>{kind === 'compose' ? previewContent.sendMessageLabel : preview.title}</b>
              <i />
              <i />
            </span>
          </span>
          <span className={styles.previewPointer} />
          <span className={styles.previewClickPulse} />
        </span>
      ) : null}
      {preview.category === 'social' ? (
        <span className={styles.socialPreview}>
          <span className={styles.socialNavigation}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.socialFeed}>
            <strong>{preview.title}</strong>
            <span className={styles.socialPost}>
              <i className={styles.socialAvatar}>L</i>
              <span>
                <b>
                  {kind === 'discussion'
                    ? previewContent.projectQuestionLabel
                    : previewContent.archivedPostLabel}
                </b>
                <small>
                  {kind === 'discussion'
                    ? previewContent.projectQuestionText
                    : previewContent.archivedPostText}
                </small>
              </span>
            </span>
            <span className={styles.socialReply}>
              <i className={styles.socialAvatar}>M</i>
              <span>
                <b>{previewContent.replyLabel}</b>
                <small>{previewContent.replyText}</small>
              </span>
            </span>
          </span>
          <span className={styles.previewPointer} />
          <span className={styles.previewClickPulse} />
        </span>
      ) : null}
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
}: S02AccountExplorationTrainingProps) {
  const characterAnimationAnchorRef = useRef<HTMLSpanElement | null>(null);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const cursorKeyRef = useRef<HTMLDivElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const onAllAccountsUnderstoodRef = useRef(onAllAccountsUnderstood);
  onAllAccountsUnderstoodRef.current = onAllAccountsUnderstood;
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S02AccountExplorationControllerSnapshot | null>(null);
  const [overlayLayout, setOverlayLayout] = useState<OverlayLayout>({
    guide: null,
    preview: null,
  });
  const [introNarrationFinished, setIntroNarrationFinished] = useState(false);
  const [dismissedSpeechKey, setDismissedSpeechKey] = useState<string | null>(null);
  const [returningToBrowser, setReturningToBrowser] = useState(false);

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
          '[data-focused="true"] [data-scene-node-button], [data-active="true"] [data-scene-node-button]',
        ) ??
        null,
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
    const previewId = snapshot?.scene.activePreviewDetailId ?? null;
    const sceneElement = sceneRef.current;
    const networkElement = networkHostRef.current;
    if (sceneElement === null || networkElement === null) return;
    const layoutElement = networkElement.parentElement;
    if (layoutElement === null) return;

    let frame: number | null = null;
    const updateGeometry = () => {
      const layoutRect = layoutElement.getBoundingClientRect();
      const dockRect = sceneElement
        .querySelector<HTMLElement>('nav[aria-label="Desktop-Apps"]')
        ?.getBoundingClientRect();
      const margin = 22;
      const availableBottom =
        dockRect === undefined
          ? layoutRect.height - margin
          : Math.min(layoutRect.height - margin, dockRect.top - layoutRect.top - 18);
      const visibleElements = [
        ...networkElement.querySelectorAll<HTMLElement>(
          '[data-scene-node-button], [data-scene-node-label]',
        ),
      ].filter(
        (element) => element.closest<HTMLElement>('[data-visible="true"]') !== null,
      );
      const nodeObstacles = visibleElements.map((element) =>
        relativeBounds(element.getBoundingClientRect(), layoutRect, 10),
      );
      const activeAccountUnderstood =
        activeAccountId !== null &&
        (snapshot?.scene.understoodAccountIds.includes(activeAccountId) ?? false);

      let guide: OverlayPosition | null = null;
      const guideElement = guideRef.current;
      const accountElement =
        activeAccountId === null
          ? null
          : networkElement.querySelector<HTMLElement>(
              `[data-scene-node-button="${activeAccountId}"]`,
            );
      if (
        activeAccountId !== null &&
        guideElement !== null &&
        accountElement !== null &&
        !activeAccountUnderstood
      ) {
        const guideRect = guideElement.getBoundingClientRect();
        const accountBounds = relativeBounds(
          accountElement.getBoundingClientRect(),
          layoutRect,
          14,
        );
        const candidate = bestPlacement(
          placementCandidates(
            accountBounds,
            guideRect.width,
            guideRect.height,
            layoutRect.width,
            availableBottom,
            margin,
            20,
          ),
          guideRect.width,
          guideRect.height,
          nodeObstacles,
          accountBounds,
        );
        guide = { anchorId: activeAccountId, ...candidate };
      }

      let preview: OverlayPosition | null = null;
      const previewElement = previewRef.current;
      const previewAnchor =
        previewId === null
          ? null
          : networkElement.querySelector<HTMLElement>(
              `[data-scene-node-button="${previewId}"]`,
            );
      if (previewId !== null && previewElement !== null && previewAnchor !== null) {
        const previewRect = previewElement.getBoundingClientRect();
        const previewAnchorBounds = relativeBounds(
          previewAnchor.getBoundingClientRect(),
          layoutRect,
          14,
        );
        const guideObstacle =
          guide === null || guideElement === null
            ? []
            : [
                {
                  left: guide.left - 14,
                  top: guide.top - 14,
                  right: guide.left + guideElement.offsetWidth + 14,
                  bottom: guide.top + guideElement.offsetHeight + 14,
                },
              ];
        const candidate = bestPlacement(
          placementCandidates(
            previewAnchorBounds,
            previewRect.width,
            previewRect.height,
            layoutRect.width,
            availableBottom,
            margin,
            24,
          ),
          previewRect.width,
          previewRect.height,
          [...nodeObstacles, ...guideObstacle],
          previewAnchorBounds,
        );
        preview = { anchorId: previewId, ...candidate };
      }

      setOverlayLayout((current) =>
        samePosition(current.guide, guide) && samePosition(current.preview, preview)
          ? current
          : { guide, preview },
      );
    };

    const scheduleGeometryUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updateGeometry();
      });
    };
    const observer = new ResizeObserver(scheduleGeometryUpdate);
    observer.observe(sceneElement);
    scheduleGeometryUpdate();
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [
    snapshot?.scene.activeAccountId,
    snapshot?.scene.activePreviewDetailId,
    snapshot?.scene.narrationId,
    snapshot?.scene.pendingAnimationId,
    snapshot?.scene.understoodAccountIds,
  ]);

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
  const speechKey = `${scene.narrationId}-${complete}`;
  const narrationActive = dismissedSpeechKey !== speechKey;
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02Content.narration.messages[presentation.announcedMessageId] ?? '');
  const timingFailure =
    externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed';
  const interactionBlocked = timingState !== 'active' || externalTimingError !== null;
  const positionedPreview =
    activePreview !== undefined && overlayLayout.preview?.anchorId === activePreview.id
      ? overlayLayout.preview
      : null;
  const previewStyle: CSSProperties | undefined = positionedPreview
    ? { left: positionedPreview.left, top: positionedPreview.top }
    : undefined;
  const positionedGuide =
    scene.activeAccountId !== null &&
    overlayLayout.guide?.anchorId === scene.activeAccountId
      ? overlayLayout.guide
      : null;
  const guideStyle: CSSProperties | undefined = positionedGuide
    ? { left: positionedGuide.left, top: positionedGuide.top }
    : undefined;
  const activeAccountUnderstood =
    scene.activeAccountId !== null && scene.understoodAccountIds.includes(scene.activeAccountId);
  const keyVisible =
    snapshot.introState === 'complete' &&
    !complete &&
    scene.pendingAnimationId === null &&
    (scene.activeAccountId === null || activeAccountUnderstood);
  const narrationBlocksInteraction =
    narrationActive &&
    (scene.narrationId === s02Content.narration.introId || complete);

  function moveCursorKey(event: PointerEvent<HTMLElement>): void {
    const preview = previewRef.current;
    if (preview !== null) {
      const previewRect = preview.getBoundingClientRect();
      const pointerOverPreview =
        event.pointerType !== 'touch' &&
        event.clientX >= previewRect.left &&
        event.clientX <= previewRect.right &&
        event.clientY >= previewRect.top &&
        event.clientY <= previewRect.bottom;
      preview.dataset.pointerOver = String(pointerOverPreview);
    }

    const cursorKey = cursorKeyRef.current;
    if (cursorKey === null || event.pointerType === 'touch') return;
    const parent = cursorKey.parentElement;
    if (parent === null) return;
    const parentRect = parent.getBoundingClientRect();
    cursorKey.style.transform = `translate3d(${Math.round(
      event.clientX - parentRect.left + 16,
    )}px, ${Math.round(event.clientY - parentRect.top + 18)}px, 0)`;
  }

  function returnToBrowser(): void {
    if (!complete || interactionBlocked || scene.pendingAnimationId !== null || returningToBrowser) {
      return;
    }
    setReturningToBrowser(true);
  }

  return (
    <section className={styles.training} aria-label={s02Content.trainingAriaLabel}>
      <article className={styles.scene} onPointerMove={moveCursorKey}>
        <S02DesktopSurface
          sceneRef={sceneRef}
          browserLaunching={returningToBrowser}
          {...(onContinue === undefined
            ? {}
            : { onBrowserLaunchAnimationEnd: onContinue })}
          browserDock={{
            active: complete,
            enabled:
              complete &&
              !interactionBlocked &&
              scene.pendingAnimationId === null &&
              !narrationActive &&
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
              interactionDisabled={
                interactionBlocked ||
                narrationBlocksInteraction ||
                snapshot.introState !== 'complete' ||
                complete
              }
              visualVariant="account-map"
              activeNodeId={scene.activeAccountId}
              activePreviewNodeId={scene.activePreviewDetailId}
              showEdgeLabels={false}
            />
          </div>

          {activePreview !== undefined ? (
            <section
              ref={previewRef}
              className={styles.preview}
              data-positioned={positionedPreview !== null}
              data-pointer-over="false"
              data-side={positionedPreview?.side ?? 'right'}
              data-phase={scene.phase}
              style={previewStyle}
              aria-label={`Visuelle Vorschau für ${activePreview.label}`}
            >
              <VisualPreview key={activePreview.id} kind={activePreview.preview.kind} />
            </section>
          ) : null}

          <span
            ref={characterAnimationAnchorRef}
            className={styles.characterAnimationAnchor}
            aria-hidden="true"
          />
          <div
            ref={guideRef}
            className={styles.guide}
            data-guide-cluster
            data-positioned={positionedGuide !== null}
            data-side={positionedGuide?.side ?? 'right'}
            data-passwo-placement={presentation.character.placement}
            style={guideStyle}
          >
            <div className={styles.passWo}>
              <img
                className={styles.passWoImage}
                data-passwo-character
                src={passWoDockAsset}
                alt={s02Content.accessibility.characterLabel}
              />
            </div>
            <PassWoSpeechBubble
              className={styles.narration}
              speaker={s02Content.narration.guideName}
              paragraphs={[narration]}
              speechKey={speechKey}
              placement={
                positionedGuide?.side === 'left' ? 'left' : 'right'
              }
              hasNext={scene.narrationId === s02Content.narration.introId && !complete}
              awaitsAction={
                scene.narrationId !== s02Content.narration.introId && !complete
              }
              onAdvance={() => {
                setDismissedSpeechKey(speechKey);
                if (scene.narrationId === s02Content.narration.introId) {
                  setIntroNarrationFinished(true);
                }
              }}
            />
          </div>

          <div
            ref={cursorKeyRef}
            className={styles.cursorKey}
            data-visible={keyVisible}
            aria-hidden="true"
          >
            <svg viewBox="0 0 92 52" fill="none">
              <circle cx="65" cy="26" r="18" />
              <circle cx="65" cy="26" r="7" />
              <path d="M49 26H8m11 0v9m11-9v7m10-7v5" />
            </svg>
            <span>******</span>
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
    </section>
  );
}
