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

interface PreviewPosition {
  readonly previewId: string;
  readonly left: number;
  readonly top: number;
  readonly side: 'left' | 'right' | 'above' | 'below';
}

interface GuidePosition {
  readonly x: number;
  readonly y: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
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

function overlapArea(
  left: number,
  top: number,
  width: number,
  height: number,
  obstacle: DOMRect,
  sceneRect: DOMRect,
): number {
  const obstacleLeft = obstacle.left - sceneRect.left - 12;
  const obstacleTop = obstacle.top - sceneRect.top - 12;
  const obstacleRight = obstacle.right - sceneRect.left + 12;
  const obstacleBottom = obstacle.bottom - sceneRect.top + 12;
  return (
    Math.max(0, Math.min(left + width, obstacleRight) - Math.max(left, obstacleLeft)) *
    Math.max(0, Math.min(top + height, obstacleBottom) - Math.max(top, obstacleTop))
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
  const passWoRef = useRef<HTMLDivElement | null>(null);
  const cursorKeyRef = useRef<HTMLDivElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const onAllAccountsUnderstoodRef = useRef(onAllAccountsUnderstood);
  onAllAccountsUnderstoodRef.current = onAllAccountsUnderstood;
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S02AccountExplorationControllerSnapshot | null>(null);
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);
  const [guidePosition, setGuidePosition] = useState<GuidePosition | null>(null);
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
        previewRef.current ??
        networkHostRef.current?.querySelector<HTMLElement>(
          '[data-active="true"] [data-scene-node-button]',
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
    const sceneElement = sceneRef.current;
    if (activeAccountId === null || sceneElement === null) {
      setGuidePosition(null);
      return;
    }

    const updateGuidePosition = () => {
      const passWoElement = passWoRef.current;
      const accountElement = networkHostRef.current?.querySelector<HTMLElement>(
        `[data-scene-node-button="${activeAccountId}"]`,
      );
      if (passWoElement === null || accountElement === null || accountElement === undefined) return;

      const sceneRect = sceneElement.getBoundingClientRect();
      const accountRect = accountElement.getBoundingClientRect();
      const passWoRect = passWoElement.getBoundingClientRect();
      const margin = 24;
      const guideRailHeight = 224;
      const accountOnLeft =
        accountRect.left + accountRect.width / 2 < sceneRect.left + sceneRect.width / 2;
      const targetLeft = accountOnLeft
        ? accountRect.right - sceneRect.left + 18
        : accountRect.left - sceneRect.left - passWoRect.width - 18;
      const targetTop =
        accountRect.top - sceneRect.top + accountRect.height / 2 - passWoRect.height / 2;

      setGuidePosition({
        x: Math.round(
          clamp(targetLeft, margin, Math.max(margin, sceneRect.width - passWoRect.width - margin)) -
            passWoElement.offsetLeft,
        ),
        y: Math.round(
          clamp(
            targetTop,
            42,
            Math.max(42, sceneRect.height - passWoRect.height - guideRailHeight),
          ) - passWoElement.offsetTop,
        ),
      });
    };

    const frame = requestAnimationFrame(updateGuidePosition);
    window.addEventListener('resize', updateGuidePosition);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateGuidePosition);
    };
  }, [snapshot?.scene.activeAccountId]);

  useLayoutEffect(() => {
    const previewId = snapshot?.scene.activePreviewDetailId ?? null;
    const activeAccountId = snapshot?.scene.activeAccountId ?? null;
    const anchorId =
      activeAccountId === 'campus-id' ? previewId : activeAccountId;
    const sceneElement = sceneRef.current;
    if (sceneElement === null) return;

    const updateGeometry = () => {
      const sceneRect = sceneElement.getBoundingClientRect();
      const previewElement = previewRef.current;
      if (previewId === null || anchorId === null || previewElement === null) {
        setPreviewPosition(null);
        return;
      }
      const nodeElement = networkHostRef.current?.querySelector<HTMLElement>(
        `[data-scene-node-button="${anchorId}"]`,
      );
      if (nodeElement === null || nodeElement === undefined) return;

      const nodeRect = nodeElement.getBoundingClientRect();
      const previewRect = previewElement.getBoundingClientRect();
      const gap = 26;
      const guideRailHeight = 224;
      const margin = 28;
      const centeredLeft =
        nodeRect.left - sceneRect.left + nodeRect.width / 2 - previewRect.width / 2;
      const centeredTop =
        nodeRect.top - sceneRect.top + nodeRect.height / 2 - previewRect.height / 2;
      const candidates: readonly {
        readonly side: PreviewPosition['side'];
        readonly left: number;
        readonly top: number;
      }[] = [
        {
          side: 'right',
          left: nodeRect.right - sceneRect.left + gap,
          top: centeredTop,
        },
        {
          side: 'left',
          left: nodeRect.left - sceneRect.left - previewRect.width - gap,
          top: centeredTop,
        },
        {
          side: 'below',
          left: centeredLeft,
          top: nodeRect.bottom - sceneRect.top + gap,
        },
        {
          side: 'above',
          left: centeredLeft,
          top: nodeRect.top - sceneRect.top - previewRect.height - gap,
        },
      ];
      const obstacles = [
        ...(networkHostRef.current?.querySelectorAll<HTMLElement>(
          '[data-scene-node-button], [data-scene-node-label]',
        ) ?? []),
      ].filter(
        (element) => {
          const elementNodeId =
            element.dataset.sceneNodeButton ?? element.dataset.sceneNodeLabel ?? null;
          return (
            elementNodeId !== anchorId &&
            element.closest<HTMLElement>('[data-visible="true"]') !== null
          );
        },
      );
      const positionedCandidates = candidates.map((candidate, preference) => {
        const left = Math.round(
          clamp(
            candidate.left,
            margin,
            Math.max(margin, sceneRect.width - previewRect.width - margin),
          ),
        );
        const top = Math.round(
          clamp(
            candidate.top,
            margin,
            Math.max(margin, sceneRect.height - previewRect.height - guideRailHeight),
          ),
        );
        const collisionScore = obstacles.reduce(
          (score, obstacle) =>
            score +
            overlapArea(
              left,
              top,
              previewRect.width,
              previewRect.height,
              obstacle.getBoundingClientRect(),
              sceneRect,
            ),
          preference * 40,
        );
        return {
          ...candidate,
          left,
          top,
          collisionScore,
        };
      });
      const bestCandidate = positionedCandidates.reduce((best, candidate) =>
        candidate.collisionScore < best.collisionScore ? candidate : best,
      );
      setPreviewPosition({
        previewId,
        side: bestCandidate.side,
        left: bestCandidate.left,
        top: bestCandidate.top,
      });
    };

    const frame = requestAnimationFrame(updateGeometry);
    window.addEventListener('resize', updateGeometry);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateGeometry);
    };
  }, [
    snapshot?.scene.activeAccountId,
    snapshot?.scene.activePreviewDetailId,
    snapshot?.scene.pendingAnimationId,
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
    activePreview !== undefined && previewPosition?.previewId === activePreview.id;
  const previewStyle: CSSProperties | undefined = positionedPreview
    ? { left: previewPosition.left, top: previewPosition.top }
    : undefined;
  const passWoStyle: CSSProperties | undefined = guidePosition
    ? {
        transform: `translate3d(${guidePosition.x}px, ${guidePosition.y}px, 0)`,
      }
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
              data-positioned={positionedPreview}
              data-pointer-over="false"
              data-side={positionedPreview ? previewPosition.side : 'right'}
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
            ref={passWoRef}
            className={styles.passWo}
            data-passwo-placement={presentation.character.placement}
            style={passWoStyle}
          >
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
            placement="above-right"
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
