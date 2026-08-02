import { s02Content, type S02VisualPreviewKind } from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import {
  useCallback,
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
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import {
  calculatePassWoSpeechPosition,
  passWoSpeechPositionStyle,
  usePassWoSpeechPosition,
  type PassWoSpeechSide,
} from '../../PassWoSpeechPosition.js';
import { S02DesktopSurface } from './S02DesktopSurface.js';
import styles from './S02AccountExplorationTraining.module.css';

export type S02TimingState = 'starting' | 'startFailed' | 'active' | 'ending' | 'endFailed';

export interface S02AccountExplorationTrainingProps {
  readonly timingState?: S02TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onAllAccountsViewed?: () => void;
  readonly onContinue?: () => void;
  readonly onRetryTiming?: () => void;
  readonly platform?: DesktopPlatform;
}

const definition = s02Content.scene;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Runtime {
  readonly controller: S02AccountExplorationController;
  readonly renderer: ReactFlowNetworkAdapter;
}

interface OverlayPosition {
  readonly anchorId: string;
  readonly left: number;
  readonly top: number;
  readonly side: PassWoSpeechSide;
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

function PasswordKeyGraphic() {
  return (
    <svg viewBox="0 0 92 52" fill="none">
      <circle cx="65" cy="26" r="18" />
      <circle cx="65" cy="26" r="7" />
      <path d="M49 26H8m11 0v9m11-9v7m10-7v5" />
    </svg>
  );
}

function relativeBounds(rect: DOMRect, containerRect: DOMRect, padding = 0): Bounds {
  return {
    left: rect.left - containerRect.left - padding,
    top: rect.top - containerRect.top - padding,
    right: rect.right - containerRect.left + padding,
    bottom: rect.bottom - containerRect.top + padding,
  };
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
              <i className={styles.socialAvatar}>{preview.primaryItem.authorInitial}</i>
              <span>
                <b>{preview.primaryItem.label}</b>
                <small>{preview.primaryItem.text}</small>
              </span>
            </span>
            <span className={styles.socialReply}>
              <i className={styles.socialAvatar}>{preview.replyItem.authorInitial}</i>
              <span>
                <b>{preview.replyItem.label}</b>
                <small>{preview.replyItem.text}</small>
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

function CoreActionWebsite({
  account,
  pending,
  onPerform,
}: {
  readonly account: (typeof definition.accounts)[number];
  readonly pending: boolean;
  readonly onPerform: (targetDetailId: string) => void;
}) {
  const targets = account.details.filter(({ id }) => account.coreAction.targetDetailIds.includes(id));

  return (
    <section className={styles.coreActionWebsite} aria-label={`${account.label}: Kontovorgang`}>
      <span className={styles.previewChrome} aria-hidden="true">
        <span className={styles.previewWindowControls}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.previewAddress}>{s02Content.previewSimulation.address}</span>
      </span>
      <div className={styles.coreActionBody} data-account={account.id}>
        <strong>{account.label}</strong>
        {targets.map((detail) => (
          <button
            type="button"
            key={detail.id}
            className={styles.coreActionButton}
            disabled={pending}
            onClick={() => onPerform(detail.id)}
          >
            <span>{detail.label}</span>
            <span>{pending ? account.coreAction.checkingLabel : account.coreAction.actionLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function S02AccountExplorationTraining({
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onAllAccountsViewed,
  onContinue,
  onRetryTiming,
  platform = 'mac',
}: S02AccountExplorationTrainingProps) {
  const characterAnimationAnchorRef = useRef<HTMLSpanElement | null>(null);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const passWoRef = useRef<HTMLImageElement | null>(null);
  const guideSpeechRef = useRef<HTMLDivElement | null>(null);
  const cursorKeyRef = useRef<HTMLDivElement | null>(null);
  const lastPointerPositionRef = useRef<{ readonly clientX: number; readonly clientY: number } | null>(
    null,
  );
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const onAllAccountsViewedRef = useRef(onAllAccountsViewed);
  onAllAccountsViewedRef.current = onAllAccountsViewed;
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S02AccountExplorationControllerSnapshot | null>(null);
  const [overlayLayout, setOverlayLayout] = useState<OverlayLayout>({
    guide: null,
    preview: null,
  });
  const [returningToBrowser, setReturningToBrowser] = useState(false);
  const guideSpeechPosition = usePassWoSpeechPosition({
    ownerRef: guideRef,
    characterRef: passWoRef,
    speechRef: guideSpeechRef,
    enabled: snapshot !== null,
    positionKey: `${snapshot?.scene.activeAccountId ?? 'none'}-${snapshot?.scene.narrationId ?? 'none'}-${snapshot?.presentation.character.placement ?? 'none'}`,
  });
  const cursorKeyActiveAccountId = snapshot?.scene.activeAccountId ?? null;
  const cursorKeyViewedAccountIds = snapshot?.scene.viewedAccountIds ?? [];
  const cursorKeyShouldFollowPointer =
    !returningToBrowser &&
    snapshot?.introState === 'complete' &&
    cursorKeyViewedAccountIds.length < definition.accounts.length &&
    (cursorKeyActiveAccountId === null ||
      cursorKeyViewedAccountIds.includes(cursorKeyActiveAccountId));

  const positionCursorKey = useCallback((clientX: number, clientY: number): void => {
    const cursorKey = cursorKeyRef.current;
    const parent = cursorKey?.parentElement;
    if (cursorKey === null || cursorKey === undefined || parent === null || parent === undefined) {
      return;
    }
    const parentRect = parent.getBoundingClientRect();
    cursorKey.style.transform = `translate3d(${Math.round(
      clientX - parentRect.left + 16,
    )}px, ${Math.round(clientY - parentRect.top + 18)}px, 0)`;
  }, []);

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
      getCursorKeyElement: () => cursorKeyRef.current,
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
      onAllAccountsViewed: () => onAllAccountsViewedRef.current?.(),
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
      timingState !== 'active' ||
      externalTimingError !== null
    ) {
      return;
    }
    runtime.controller.startIntro();
  }, [externalTimingError, runtime, snapshot, timingState]);

  useLayoutEffect(() => {
    const cursorKey = cursorKeyRef.current;
    const lastPointerPosition = lastPointerPositionRef.current;
    if (
      !cursorKeyShouldFollowPointer ||
      cursorKey === null ||
      lastPointerPosition === null ||
      cursorKey.dataset.animating === 'true'
    ) {
      return;
    }
    cursorKey.style.removeProperty('opacity');
    positionCursorKey(lastPointerPosition.clientX, lastPointerPosition.clientY);
  }, [cursorKeyShouldFollowPointer, cursorKeyViewedAccountIds.length, positionCursorKey]);

  useLayoutEffect(() => {
    const activeAccountId = snapshot?.scene.activeAccountId ?? null;
    const activeAccountProgress =
      activeAccountId === null
        ? undefined
        : snapshot?.scene.accountProgress.find(({ accountId }) => accountId === activeAccountId);
    const previewId =
      snapshot?.scene.activePreviewDetailId ??
      (activeAccountProgress?.unlocked === true && snapshot?.scene.pendingAnimationId === null
        ? activeAccountId
        : null);
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
      const activeAccountViewed =
        activeAccountId !== null &&
        (snapshot?.scene.viewedAccountIds.includes(activeAccountId) ?? false);

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
        !activeAccountViewed
      ) {
        const guideRect = guideElement.getBoundingClientRect();
        const accountBounds = relativeBounds(
          accountElement.getBoundingClientRect(),
          layoutRect,
          14,
        );
        const candidate = calculatePassWoSpeechPosition({
          anchor: accountBounds,
          bubble: { width: guideRect.width, height: guideRect.height },
          boundary: { left: 0, top: 0, right: layoutRect.width, bottom: availableBottom },
          obstacles: nodeObstacles,
          gap: 20,
          margin,
        });
        guide = {
          anchorId: activeAccountId,
          left: candidate.left,
          top: candidate.top,
          side: candidate.side,
        };
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
        const candidate = calculatePassWoSpeechPosition({
          anchor: previewAnchorBounds,
          bubble: { width: previewRect.width, height: previewRect.height },
          boundary: { left: 0, top: 0, right: layoutRect.width, bottom: availableBottom },
          obstacles: [...nodeObstacles, ...guideObstacle],
          gap: 24,
          margin,
        });
        preview = {
          anchorId: previewId,
          left: candidate.left,
          top: candidate.top,
          side: candidate.side,
        };
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
    snapshot?.scene.accountProgress,
    snapshot?.scene.activePreviewDetailId,
    snapshot?.scene.narrationId,
    snapshot?.scene.pendingAnimationId,
    snapshot?.scene.viewedAccountIds,
  ]);

  if (runtime === null || snapshot === null) {
    return (
      <section className={styles.training} aria-label={s02Content.trainingAriaLabel}>
        <article className={styles.scene}>
          <S02DesktopSurface
            platform={platform}
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
  const activeAccountProgress =
    activeAccount === undefined
      ? undefined
      : scene.accountProgress.find(({ accountId }) => accountId === activeAccount.id);
  const activeAccountViewed = activeAccountProgress?.viewed === true;
  const activePreview = activeAccount?.details.find(({ id }) => id === scene.activePreviewDetailId);
  const viewedCount = scene.viewedAccountIds.length;
  const complete = scene.isComplete;
  const narration = complete
    ? (s02Content.narration.messages[s02Content.narration.completeId] ?? '')
    : (s02Content.narration.messages[scene.narrationId] ?? '');
  const narrationId = complete ? s02Content.narration.completeId : scene.narrationId;
  const speechKey = `${scene.narrationId}-${complete}`;
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02Content.narration.messages[presentation.announcedMessageId] ?? '');
  const timingFailure =
    externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed';
  const interactionBlocked = timingState !== 'active' || externalTimingError !== null;
  const coreActionVisible =
    activeAccount !== undefined &&
    activeAccountProgress?.unlocked === true &&
    !activeAccountViewed &&
    activePreview === undefined &&
    (scene.phase === 'exploring' || scene.phase === 'performing-core-action');
  const coreActionPending = scene.phase === 'performing-core-action';
  const overlayAnchorId =
    activePreview?.id ?? (coreActionVisible && activeAccount !== undefined ? activeAccount.id : null);
  const positionedPreview =
    overlayAnchorId !== null && overlayLayout.preview?.anchorId === overlayAnchorId
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
  const keyVisible =
    !returningToBrowser &&
    snapshot.introState === 'complete' &&
    (scene.activeAccountId === null || activeAccountViewed);

  function moveCursorKey(event: PointerEvent<HTMLElement>): void {
    if (event.pointerType !== 'touch') {
      lastPointerPositionRef.current = { clientX: event.clientX, clientY: event.clientY };
    }
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
    if (cursorKey.dataset.animating === 'true') return;
    positionCursorKey(event.clientX, event.clientY);
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
          platform={platform}
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
              !returningToBrowser,
            label: complete
              ? s02Content.desktop.browserDockReadyLabel
              : s02Content.desktop.browserDockLabel,
            onClick: returnToBrowser,
          }}
        >
          <p className={styles.accountProgress}>
            {s02Content.page.globalProgress(viewedCount)}
          </p>
          <div ref={networkHostRef} className={styles.networkPanel}>
            <ReactFlowNetwork
              adapter={renderer}
              presentation={presentation}
              onNodeSelect={(nodeId) => controller.selectNode(nodeId)}
              ariaLabel={s02Content.accessibility.networkLabel}
              canvasAriaLabel={s02Content.accessibility.canvasLabel}
              interactionDisabled={
                interactionBlocked ||
                snapshot.introState !== 'complete' ||
                returningToBrowser
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
              {activeAccountViewed && activeAccount !== undefined ? (
                <p className={styles.takeaway}>{activeAccount.coreAction.takeaway}</p>
              ) : null}
            </section>
          ) : null}

          {coreActionVisible && activeAccount !== undefined ? (
            <section
              ref={previewRef}
              className={styles.coreActionOverlay}
              data-positioned={positionedPreview !== null}
              data-side={positionedPreview?.side ?? 'right'}
              style={previewStyle}
            >
              <CoreActionWebsite
                account={activeAccount}
                pending={coreActionPending}
                onPerform={(targetDetailId) =>
                  controller.performCoreAction(activeAccount.id, targetDetailId)
                }
              />
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
            data-passwo-placement={presentation.character.placement}
            style={guideStyle}
          >
            <div className={styles.passWo}>
              <img
                ref={passWoRef}
                className={styles.passWoImage}
                data-passwo-character
                src={passWoDockAsset}
                alt={s02Content.accessibility.characterLabel}
              />
            </div>
            <div
              ref={guideSpeechRef}
              className={styles.speechSlot}
              data-positioned={guideSpeechPosition !== null}
              style={passWoSpeechPositionStyle(guideSpeechPosition)}
            >
              <PassWoSpeechBubble
                className={styles.narration}
                speaker={s02Content.narration.guideName}
                paragraphs={[narration]}
                speechKey={speechKey}
                emphasis={passWoSpeechEmphasisFor(narrationId)}
                placement={guideSpeechPosition?.side ?? 'right'}
                {...(guideSpeechPosition === null
                  ? {}
                  : { arrowOffset: guideSpeechPosition.arrowOffset })}
              />
            </div>
          </div>

          {complete ? null : (
            <div
              ref={cursorKeyRef}
              className={styles.cursorKey}
              data-visible={keyVisible}
              aria-hidden="true"
            >
              <PasswordKeyGraphic />
              <span>******</span>
            </div>
          )}

          <p className={styles.screenReaderOnly} role="status">
            {complete ? s02Content.page.completion : s02Content.page.globalProgress(viewedCount)}
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
