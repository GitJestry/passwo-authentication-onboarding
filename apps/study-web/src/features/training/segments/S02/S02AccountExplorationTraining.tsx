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
import passWoThinkAsset from '../../../../assets/passwo/passwo-dock.png';
import passWoWaitingAsset from '../../../../assets/passwo/passwo-waiting.png';
import { NetworkMotionAdapter } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
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
  passWoSpeechPositionStyle,
  usePassWoSpeechPosition,
} from '../../PassWoSpeechPosition.js';
import { S02DesktopSurface } from './S02DesktopSurface.js';
import { S02PreviewMotionAdapter } from './S02PreviewMotionAdapter.js';
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
  readonly fictionalUsername?: string;
  readonly fictionalCampusEmail?: string;
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
  readonly side: 'left' | 'right' | 'below';
  readonly projection: {
    readonly startA: readonly [number, number];
    readonly startB: readonly [number, number];
    readonly endA: readonly [number, number];
    readonly endB: readonly [number, number];
  };
}

interface OverlayLayout {
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

function CompletionCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3.25 8.25 2.9 2.9 6.6-6.6" />
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

function clampNumber(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
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
    current.side === next.side &&
    current.projection.startA[0] === next.projection.startA[0] &&
    current.projection.startA[1] === next.projection.startA[1] &&
    current.projection.endB[0] === next.projection.endB[0] &&
    current.projection.endB[1] === next.projection.endB[1]
  );
}

function interpolateIdentity(value: string, username: string, campusEmail: string): string {
  return value
    .replaceAll('{username}', username)
    .replaceAll('{campusEmail}', campusEmail);
}

function previewAccessibleSummary(
  kind: S02VisualPreviewKind,
  username: string,
  campusEmail: string,
): string {
  const preview = s02Content.previewSimulation.variants[kind];
  if (preview.category === 'social') {
    return [
      preview.title,
      preview.primaryItem.label,
      preview.primaryItem.text,
      interpolateIdentity(preview.replyItem.label, username, campusEmail),
      preview.replyItem.text,
      preview.resultLabel,
    ].join('. ');
  }
  if (preview.category === 'login') {
    return [
      preview.title,
      ...preview.items.map((item) => interpolateIdentity(item, username, campusEmail)),
      preview.resultLabel,
    ].join('. ');
  }
  return [
    preview.title,
    interpolateIdentity(preview.header.from, username, campusEmail),
    interpolateIdentity(preview.header.to, username, campusEmail),
    interpolateIdentity(preview.header.cc, username, campusEmail),
    ...preview.items.map((item) => interpolateIdentity(item, username, campusEmail)),
    preview.resultLabel,
  ].join('. ');
}

function VisualPreview({
  detailId,
  kind,
  username,
  campusEmail,
}: {
  readonly detailId: string;
  readonly kind: S02VisualPreviewKind;
  readonly username: string;
  readonly campusEmail: string;
}) {
  const previewContent = s02Content.previewSimulation;
  const preview = previewContent.variants[kind];
  const target = (part: string) => `${detailId}:${part}`;

  return (
    <div
      className={styles.visualPreview}
      data-preview-kind={kind}
      data-preview-category={preview.category}
      data-preview-ready
      aria-hidden="true"
    >
      {preview.category === 'login' ? (
        <>
          <span className={styles.previewChrome}>
            <span className={styles.previewWindowControls}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.previewAddress}>{previewContent.address}</span>
          </span>
        </>
      ) : null}
      {preview.category === 'login' ? (
        <span className={styles.loginPreview}>
          <span className={styles.loginCard} data-preview-target={target('surface')}>
            <small>
              {previewContent.welcomeLabel} {preview.app}
            </small>
            <strong>{preview.title}</strong>
            <i className={styles.loginField} />
            <i className={styles.loginField} />
            <span
              className={styles.masterCampusButton}
              data-preview-target={target('primary')}
            >
              <i aria-hidden="true">
                <NetworkSymbol symbolId="master-campus" />
              </i>
              {preview.primaryLabel}
            </span>
            <span
              className={styles.previewMouseCursor}
              data-preview-target={target('cursor')}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 30">
                <path d="M3 2.5v21.2l5.3-5.1 3.7 8.2 4.1-1.9-3.8-8h7.5z" />
              </svg>
            </span>
            <span
              className={styles.loginProgress}
              data-preview-target={target('auth-status')}
            >
              <i aria-hidden="true" />
              {previewContent.authProgressLabel}
            </span>
          </span>
          <span
            className={styles.loginDestination}
            data-destination-kind={kind}
            data-preview-target={target('result')}
          >
            <span className={styles.destinationTopbar}>
              <NetworkSymbol symbolId={kind} />
              <span>
                <strong>{preview.app}</strong>
                <small>{preview.title}</small>
              </span>
              <i aria-hidden="true" />
            </span>
            {kind === 'campus-workspace' ? (
              <span className={styles.workspaceSurface}>
                <span className={styles.workspaceRail} aria-hidden="true">
                  <i /><i /><i /><i />
                </span>
                <span className={styles.workspaceChannels}>
                  {preview.items.slice(0, 3).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
                <span className={styles.workspaceConversation}>
                  <span className={styles.workspaceMessages} aria-hidden="true">
                    <i /><span /><i /><span />
                  </span>
                  {preview.items.slice(3).map((item) => (
                    <strong className={styles.workspaceFile} key={item}>{item}</strong>
                  ))}
                  <b data-preview-target={target('secondary')}>{preview.resultLabel}</b>
                </span>
              </span>
            ) : null}
            {kind === 'campus-services' ? (
              <span className={styles.servicesSurface}>
                <span className={styles.servicesHero} aria-hidden="true">
                  <i /><span /><span />
                </span>
                <span className={styles.servicesGrid}>
                  {preview.items.map((item, index) => (
                    <span key={item}>
                      <i aria-hidden="true">{index + 1}</i>
                      <b>{item}</b>
                      <small aria-hidden="true" />
                    </span>
                  ))}
                </span>
                <b className={styles.servicesStatus} data-preview-target={target('secondary')}>
                  {preview.resultLabel}
                </b>
              </span>
            ) : null}
            {kind === 'campus-cloud' ? (
              <span className={styles.cloudSurface}>
                <span className={styles.cloudSidebar}>
                  <i aria-hidden="true" />
                  {preview.items.slice(0, 3).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
                <span className={styles.cloudFiles}>
                  <span className={styles.cloudFolders} aria-hidden="true">
                    <i /><i /><i />
                  </span>
                  {preview.items.slice(3).map((item) => (
                    <span className={styles.cloudNote} key={item}>
                      <i aria-hidden="true" />
                      <b>{item}</b>
                      <small aria-hidden="true" />
                    </span>
                  ))}
                  <b className={styles.cloudStatus} data-preview-target={target('secondary')}>
                    {preview.resultLabel}
                  </b>
                </span>
              </span>
            ) : null}
          </span>
        </span>
      ) : null}
      {preview.category === 'mail' ? (
        <span className={styles.mailPreview} data-preview-target={target('surface')}>
          <span className={styles.mailHeader}>
            <span className={styles.mailBrandMark}>
              <NetworkSymbol symbolId="campus-email" />
            </span>
            <span>
              <strong>{preview.app}</strong>
              <small>Postfach</small>
            </span>
            <span className={styles.mailHeaderActions} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {kind === 'compose' ? (
              <strong
                className={styles.mailAction}
                data-preview-target={target('secondary')}
              >
                {preview.resultLabel}
              </strong>
            ) : null}
          </span>
          <span className={styles.mailDetail} data-preview-target={target('result')}>
            <span className={styles.mailHeading} data-preview-target={target('primary')}>
              <small>{preview.title}</small>
              <b>{preview.primaryLabel}</b>
            </span>
            <span className={styles.mailMetadata}>
              <span>
                <small>Von</small>
                <b>{interpolateIdentity(preview.header.from, username, campusEmail)}</b>
              </span>
              <span>
                <small>An</small>
                <b>{interpolateIdentity(preview.header.to, username, campusEmail)}</b>
              </span>
              <span>
                <small>CC</small>
                <b>{interpolateIdentity(preview.header.cc, username, campusEmail)}</b>
              </span>
              <time>{preview.header.sentAt}</time>
            </span>
            <span className={styles.mailBody}>
              {preview.items.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  data-emphasized={kind === 'reset-link' && index === preview.items.length - 1}
                >
                  {interpolateIdentity(item, username, campusEmail)}
                </span>
              ))}
              {kind === 'compose' ? null : (
                <strong
                  className={styles.mailAction}
                  data-preview-target={target('secondary')}
                  data-link={kind === 'reset-link'}
                >
                  {preview.resultLabel}
                </strong>
              )}
            </span>
          </span>
        </span>
      ) : null}
      {preview.category === 'social' ? (
        <span className={styles.socialPreview} data-preview-target={target('surface')}>
          <span className={styles.socialHeader}>
            <NetworkSymbol symbolId="campusgram" className={styles.socialBrandMark} />
            <strong>{preview.app}</strong>
            <span className={styles.socialHeaderActions}>
              <i />
              <i />
              <i />
            </span>
          </span>
          {kind === 'direct-messages' ? (
            <span className={styles.chatShell}>
              <span className={styles.chatPeer}>
                <i className={styles.socialAvatar}>{preview.primaryItem.authorInitial}</i>
                <span>
                  <b>{preview.primaryItem.label}</b>
                  <small>{preview.primaryLabel}</small>
                </span>
                <i className={styles.chatPeerAction} aria-hidden="true" />
              </span>
              <span className={styles.chatThread}>
                <span className={styles.incomingMessage} data-preview-target={target('primary')}>
                  <i className={styles.socialAvatar}>{preview.primaryItem.authorInitial}</i>
                  <span>{preview.primaryItem.text}</span>
                </span>
                <span className={styles.chatMedia} data-preview-target={target('secondary')}>
                  <i aria-hidden="true" />
                  <b>{preview.resultLabel}</b>
                </span>
                <span className={styles.outgoingMessage} data-preview-target={target('result')}>
                  <small>{interpolateIdentity(preview.replyItem.label, username, campusEmail)}</small>
                  <span>{preview.replyItem.text}</span>
                </span>
              </span>
              <span className={styles.chatComposer} aria-hidden="true">
                <i>+</i>
                <span />
                <i>♡</i>
              </span>
            </span>
          ) : null}
          {kind === 'groups-contacts' ? (
            <span className={styles.groupsPanel}>
              <span className={styles.socialTitle}>
                <strong>{preview.title}</strong>
                <small>{preview.primaryLabel}</small>
              </span>
              <span className={styles.contactSearch} aria-hidden="true">
                <i />
                <span />
              </span>
              <span className={styles.contactList}>
                <span className={styles.contactRow} data-preview-target={target('primary')}>
                  <i className={styles.socialAvatar}>{preview.primaryItem.authorInitial}</i>
                  <span>
                    <b>{preview.primaryItem.label}</b>
                    <small>{preview.primaryItem.text}</small>
                  </span>
                  <i className={styles.contactChevron} aria-hidden="true" />
                </span>
                <span className={styles.contactRow} data-preview-target={target('result')}>
                  <i className={styles.socialAvatar}>{preview.replyItem.authorInitial}</i>
                  <span>
                    <b>{preview.replyItem.label}</b>
                    <small>{preview.replyItem.text}</small>
                  </span>
                  <i className={styles.contactChevron} aria-hidden="true" />
                </span>
                <span className={styles.contactPeople} data-preview-target={target('secondary')}>
                  <span className={styles.contactAvatarStack} aria-hidden="true">
                    <i>L</i><i>T</i><i>M</i>
                  </span>
                  <b>{preview.resultLabel}</b>
                </span>
              </span>
            </span>
          ) : null}
          {kind === 'posts-reactions' ? (
            <span className={styles.postFeed}>
              <span className={styles.socialTitle}>
                <strong>{preview.title}</strong>
                <small>{preview.primaryLabel}</small>
              </span>
              <span className={styles.postCard}>
                <span className={styles.postAuthor}>
                  <i className={styles.socialAvatar}>{preview.primaryItem.authorInitial}</i>
                  <b>{preview.primaryItem.label}</b>
                  <i className={styles.postMenu} aria-hidden="true" />
                </span>
                <span className={styles.postContent} data-preview-target={target('primary')}>
                  <span className={styles.postVisual} aria-hidden="true">
                    <i />
                    <span />
                  </span>
                  <span className={styles.postActions} aria-hidden="true">
                    <i>♡</i><i>◯</i><i>↗</i><i>◇</i>
                  </span>
                  <b>{preview.primaryItem.text}</b>
                </span>
                <span className={styles.postComment} data-preview-target={target('result')}>
                  <b>{interpolateIdentity(preview.replyItem.label, username, campusEmail)}</b>
                  <span>{preview.replyItem.text}</span>
                </span>
                <small className={styles.postStatus} data-preview-target={target('secondary')}>
                  {preview.resultLabel}
                </small>
              </span>
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
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
  fictionalUsername = 'benutzername',
  fictionalCampusEmail = '',
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
  const previewPrimaryActionRef = useRef<HTMLButtonElement | null>(null);
  const onAllAccountsViewedRef = useRef(onAllAccountsViewed);
  onAllAccountsViewedRef.current = onAllAccountsViewed;
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [snapshot, setSnapshot] = useState<S02AccountExplorationControllerSnapshot | null>(null);
  const [overlayLayout, setOverlayLayout] = useState<OverlayLayout>({
    preview: null,
  });
  const [guideOpen, setGuideOpen] = useState(true);
  const [returningToBrowser, setReturningToBrowser] = useState(false);
  const guideSpeechPosition = usePassWoSpeechPosition({
    ownerRef: guideRef,
    characterRef: passWoRef,
    speechRef: guideSpeechRef,
    enabled: snapshot !== null && guideOpen,
    obstacleSelector:
      '[data-scene-node][data-visible="true"], [data-guide-toolbar], nav[aria-label="Desktop-Apps"]',
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
    if (snapshot?.scene.isComplete) setGuideOpen(true);
  }, [snapshot?.scene.isComplete]);

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
    const previewAnimationPlayer = new S02PreviewMotionAdapter({
      getPreviewElement: () => previewRef.current,
      prefersReducedMotion,
    });
    controller = new S02AccountExplorationController({
      animationPlayer,
      previewAnimationPlayer,
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
    if (snapshot?.scene.isComplete) setGuideOpen(true);
  }, [snapshot?.scene.isComplete]);

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
      const rightInset = 36;
      const availableBottom =
        dockRect === undefined
          ? layoutRect.height - margin
          : Math.min(layoutRect.height - margin, dockRect.top - layoutRect.top - 18);
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
          0,
        );
        const narrow = layoutRect.width < 760;
        const preferredSide =
          narrow ? 'below' : activeAccountId === 'campusgram' ? 'left' : 'right';
        const anchorCenterX = (previewAnchorBounds.left + previewAnchorBounds.right) / 2;
        const anchorCenterY = (previewAnchorBounds.top + previewAnchorBounds.bottom) / 2;
        const maxLeft = Math.max(margin, layoutRect.width - previewRect.width - rightInset);
        const maxTop = Math.max(margin, availableBottom - previewRect.height);
        const left = narrow
          ? clampNumber(
              (layoutRect.width - previewRect.width) / 2,
              margin,
              maxLeft,
            )
          : preferredSide === 'right'
            ? clampNumber(
                Math.max(layoutRect.width * 0.53, previewAnchorBounds.right + 36),
                margin,
                maxLeft,
              )
            : clampNumber(
                Math.min(layoutRect.width * 0.06, previewAnchorBounds.left - previewRect.width - 36),
                margin,
                maxLeft,
              );
        const top = narrow
          ? clampNumber(previewAnchorBounds.bottom + 24, margin, maxTop)
          : activeAccountId === 'campusgram'
            ? clampNumber(layoutRect.height * 0.05, margin, maxTop)
            : clampNumber(anchorCenterY - previewRect.height / 2, margin, maxTop);
        const previewNearX = preferredSide === 'left' ? left + previewRect.width : left;
        const previewTopY = top + previewRect.height * 0.24;
        const previewBottomY = top + previewRect.height * 0.76;
        const nodeNearX =
          preferredSide === 'left'
            ? previewAnchorBounds.left
            : preferredSide === 'right'
              ? previewAnchorBounds.right
              : anchorCenterX;
        const nodeNearY =
          preferredSide === 'below' ? previewAnchorBounds.bottom : anchorCenterY;
        preview = {
          anchorId: previewId,
          left,
          top,
          side: preferredSide,
          projection: {
            startA: [nodeNearX, nodeNearY - 5],
            startB: [nodeNearX, nodeNearY + 5],
            endA: [preferredSide === 'below' ? left + previewRect.width * 0.28 : previewNearX, preferredSide === 'below' ? top : previewTopY],
            endB: [preferredSide === 'below' ? left + previewRect.width * 0.72 : previewNearX, preferredSide === 'below' ? top : previewBottomY],
          },
        };
      }

      setOverlayLayout((current) =>
        samePosition(current.preview, preview) ? current : { preview },
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
    if (previewRef.current !== null) observer.observe(previewRef.current);
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

  useEffect(() => {
    if (snapshot?.scene.previewPlayback === 'ready') {
      previewPrimaryActionRef.current?.focus();
    }
  }, [snapshot?.scene.activePreviewDetailId, snapshot?.scene.previewPlayback]);

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
  const activePreview = activeAccount?.details.find(({ id }) => id === scene.activePreviewDetailId);
  const activePreviewIndex =
    activeAccount === undefined || activePreview === undefined
      ? -1
      : activeAccount.previewSequence.indexOf(activePreview.id);
  const activePreviewReady = scene.previewPlayback === 'ready';
  const activePreviewCategory =
    activePreview === undefined
      ? undefined
      : s02Content.previewSimulation.variants[activePreview.preview.kind].category;
  const activePreviewIsLast =
    activeAccount !== undefined && activePreviewIndex === activeAccount.previewSequence.length - 1;
  const viewedCount = scene.viewedAccountIds.length;
  const complete = scene.isComplete;
  const activeAccountProgress =
    activeAccount === undefined
      ? undefined
      : scene.accountProgress.find(({ accountId }) => accountId === activeAccount.id);
  const remainingDetailLabels =
    activeAccount === undefined
      ? []
      : activeAccount.details
          .filter(({ id }) => !activeAccountProgress?.viewedDetailIds.includes(id))
          .map(({ label }) => label);
  const remainingAccountLabels = definition.accounts
    .filter(({ id }) => !scene.viewedAccountIds.includes(id))
    .map(({ label }) => label);
  const resolvedUsername = fictionalUsername.trim() || 'benutzername';
  const resolvedCampusEmail =
    fictionalCampusEmail.trim() || `${resolvedUsername}@mail.campus.example`;
  const introAnnouncementActive = scene.activeAccountId === null && viewedCount === 0;
  const introModel =
    introAnnouncementActive &&
    presentation.announcedMessageId === s02Content.narration.introModelId;
  const introReady =
    introAnnouncementActive &&
    presentation.announcedMessageId === s02Content.narration.introReadyId;
  const narrationId = complete
    ? s02Content.narration.completeId
    : introReady
      ? s02Content.narration.introReadyId
      : introModel
        ? s02Content.narration.introModelId
        : scene.narrationId;
  const progressNarration =
    activeAccount === undefined
      ? s02Content.narration.remainingAccounts(remainingAccountLabels)
      : remainingDetailLabels.length > 0
        ? s02Content.narration.remainingDetails(remainingDetailLabels)
        : s02Content.narration.finishAccount(activeAccount.label);
  const narration = complete
    ? s02Content.narration.completion(platform)
    : snapshot.introState !== 'complete' || introReady
      ? (s02Content.narration.messages[narrationId] ?? '')
      : progressNarration;
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02Content.narration.messages[presentation.announcedMessageId] ?? '');
  const timingFailure =
    externalTimingError !== null || timingState === 'startFailed' || timingState === 'endFailed';
  const interactionBlocked = timingState !== 'active' || externalTimingError !== null;
  const overlayAnchorId = activePreview?.id ?? null;
  const positionedPreview =
    overlayAnchorId !== null && overlayLayout.preview?.anchorId === overlayAnchorId
      ? overlayLayout.preview
      : null;
  const previewStyle: CSSProperties | undefined = positionedPreview
    ? { left: positionedPreview.left, top: positionedPreview.top }
    : undefined;
  const awaitingFirstAccount =
    snapshot.introState === 'complete' &&
    scene.activeAccountId === null &&
    scene.viewedAccountIds.length === 0;
  const keyVisible =
    !returningToBrowser &&
    snapshot.introState === 'complete' &&
    scene.activeAccountId === null;

  function moveCursorKey(event: PointerEvent<HTMLElement>): void {
    if (event.pointerType !== 'touch') {
      lastPointerPositionRef.current = { clientX: event.clientX, clientY: event.clientY };
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
          <div
            ref={networkHostRef}
            className={styles.networkPanel}
            data-preview-account={activePreview === undefined ? undefined : activeAccount?.id}
          >
            <ReactFlowNetwork
              adapter={renderer}
              presentation={presentation}
              onNodeSelect={(nodeId) => {
                controller.selectNode(nodeId);
                setGuideOpen(false);
              }}
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

          {positionedPreview !== null ? (
            <svg className={styles.previewProjection} aria-hidden="true">
              <polygon
                points={`${positionedPreview.projection.startA.join(',')} ${positionedPreview.projection.endA.join(',')} ${positionedPreview.projection.endB.join(',')} ${positionedPreview.projection.startB.join(',')}`}
              />
              <line
                x1={positionedPreview.projection.startA[0]}
                y1={positionedPreview.projection.startA[1]}
                x2={positionedPreview.projection.endA[0]}
                y2={positionedPreview.projection.endA[1]}
              />
              <line
                x1={positionedPreview.projection.startB[0]}
                y1={positionedPreview.projection.startB[1]}
                x2={positionedPreview.projection.endB[0]}
                y2={positionedPreview.projection.endB[1]}
              />
            </svg>
          ) : null}

          {activePreview !== undefined ? (
            <section
              ref={previewRef}
              className={styles.preview}
              data-positioned={positionedPreview !== null}
              data-side={positionedPreview?.side ?? 'right'}
              data-phase={scene.phase}
              data-preview-playback={scene.previewPlayback}
              data-preview-category={
                s02Content.previewSimulation.variants[activePreview.preview.kind].category
              }
              style={previewStyle}
              aria-label={`${s02Content.page.previewTitle}: ${activePreview.label}`}
            >
              <VisualPreview
                key={activePreview.id}
                detailId={activePreview.id}
                kind={activePreview.preview.kind}
                username={resolvedUsername}
                campusEmail={resolvedCampusEmail}
              />
              <p className={styles.screenReaderOnly}>
                {previewAccessibleSummary(
                  activePreview.preview.kind,
                  resolvedUsername,
                  resolvedCampusEmail,
                )}
              </p>
              <footer className={styles.previewFooter}>
                {activePreviewCategory === 'login' ? (
                  <button
                    type="button"
                    className={styles.previewReplayButton}
                    disabled={!activePreviewReady || interactionBlocked}
                    onClick={() => controller.replayPreview()}
                  >
                    <span aria-hidden="true">↻</span>
                    {s02Content.page.previewReplay}
                  </button>
                ) : null}
                <button
                  ref={previewPrimaryActionRef}
                  type="button"
                  className={styles.previewAdvanceButton}
                  disabled={!activePreviewReady || interactionBlocked}
                  onClick={() => controller.advancePreview()}
                >
                  {activePreviewIsLast
                    ? s02Content.page.previewFinish
                    : s02Content.page.previewNext}
                  <span aria-hidden="true">{activePreviewIsLast ? '✓' : '→'}</span>
                </button>
              </footer>
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
          >
            <div className={styles.guideToolbar} data-guide-toolbar>
              {guideOpen ? null : (
                <button
                  type="button"
                  className={styles.infoButton}
                  aria-expanded={false}
                  aria-controls="s02-task-help"
                  aria-label={s02Content.page.openTaskHelp}
                  title={s02Content.page.openTaskHelp}
                  onClick={() => setGuideOpen(true)}
                >
                  <span aria-hidden="true">?</span>
                </button>
              )}
              <div className={styles.guideStatus}>
                {complete ? (
                  <div className={styles.completionStatus} aria-live="polite">
                    <CompletionCheckIcon />
                    <span>{s02Content.page.completion}</span>
                  </div>
                ) : (
                  <>
                    <strong>{s02Content.page.eyebrow}</strong>
                    <div className={styles.taskProgress} aria-live="polite">
                      <span
                        className={styles.progressTrack}
                        role="progressbar"
                        aria-label={s02Content.page.globalProgress(viewedCount)}
                        aria-valuemin={0}
                        aria-valuemax={definition.accounts.length}
                        aria-valuenow={viewedCount}
                      >
                        <span
                          style={{ width: `${(viewedCount / definition.accounts.length) * 100}%` }}
                        />
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={styles.passWo}>
              <img
                ref={passWoRef}
                className={styles.passWoImage}
                data-passwo-character
                data-speaking={guideOpen || undefined}
                src={guideOpen ? passWoThinkAsset : passWoWaitingAsset}
                alt={s02Content.accessibility.characterLabel}
              />
            </div>
            {guideOpen ? (
              <div
                ref={guideSpeechRef}
                id="s02-task-help"
                className={styles.speechSlot}
                data-positioned={guideSpeechPosition !== null}
                style={passWoSpeechPositionStyle(guideSpeechPosition)}
              >
                <PassWoSpeechBubble
                  className={styles.narration}
                  speaker={s02Content.narration.guideName}
                  paragraphs={[narration]}
                  emphasis={passWoSpeechEmphasisFor(narrationId)}
                  placement={guideSpeechPosition?.side ?? 'right'}
                  {...(complete || awaitingFirstAccount
                    ? {}
                    : {
                        action:
                          snapshot.introState === 'ready'
                            ? {
                                kind: 'advance' as const,
                                disabled: interactionBlocked,
                                onAction: () => controller.startIntro(),
                              }
                            : snapshot.introState === 'playing'
                              ? {
                                  kind: 'advance' as const,
                                  disabled: true,
                                  onAction: () => undefined,
                                }
                              : snapshot.introState === 'explaining'
                                ? {
                                    kind: 'advance' as const,
                                    disabled: interactionBlocked,
                                    onAction: () => controller.continueIntro(),
                                  }
                                : {
                                    kind: 'dismiss' as const,
                                    onAction: () => setGuideOpen(false),
                                  },
                      })}
                  {...(guideSpeechPosition === null
                    ? {}
                    : { arrowOffset: guideSpeechPosition.arrowOffset })}
                />
              </div>
            ) : null}
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
