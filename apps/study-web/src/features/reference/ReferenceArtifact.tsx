import {
  REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_OPEN_SUPPLEMENT_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_SNAPSHOT_ID,
  REFERENCE_ARTIFACT_URL,
  referenceSupplementLinkIdSchema,
} from '@passwo/contracts';
import { useEffect, useRef, useState } from 'react';
import styles from './ReferenceArtifact.module.css';

function isCompletionMessage(event: MessageEvent<unknown>, expectedSource: Window | null): boolean {
  if (
    event.source !== expectedSource ||
    event.origin !== window.location.origin ||
    typeof event.data !== 'object' ||
    event.data === null ||
    !('type' in event.data) ||
    event.data.type !== REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE ||
    !('snapshotId' in event.data) ||
    event.data.snapshotId !== REFERENCE_ARTIFACT_SNAPSHOT_ID
  ) {
    return false;
  }
  return Object.keys(event.data).length === 2;
}

function supplementLinkIdFromMessage(
  event: MessageEvent<unknown>,
  expectedSource: Window | null,
): string | null {
  if (
    event.source !== expectedSource ||
    event.origin !== window.location.origin ||
    typeof event.data !== 'object' ||
    event.data === null ||
    !('type' in event.data) ||
    event.data.type !== REFERENCE_ARTIFACT_OPEN_SUPPLEMENT_MESSAGE_TYPE ||
    !('snapshotId' in event.data) ||
    event.data.snapshotId !== REFERENCE_ARTIFACT_SNAPSHOT_ID ||
    !('linkId' in event.data) ||
    Object.keys(event.data).length !== 3
  ) {
    return null;
  }
  const parsedLinkId = referenceSupplementLinkIdSchema.safeParse(event.data.linkId);
  return parsedLinkId.success ? parsedLinkId.data : null;
}

function focusSupplementLink(frame: HTMLIFrameElement | null, linkId: string): void {
  const courseFrame = frame?.contentDocument?.querySelector<HTMLIFrameElement>('#content-frame');
  courseFrame?.contentDocument
    ?.querySelector<HTMLElement>(`[data-passwo-supplement-link-id="${linkId}"]`)
    ?.focus();
}

export function ReferenceArtifact({ onComplete }: { readonly onComplete: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const completionReceivedRef = useRef(false);
  const viewerOpenRef = useRef(false);
  const activeSupplementLinkIdRef = useRef<string | null>(null);
  const supplementRequestPendingRef = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [desktopBridgeUnavailable, setDesktopBridgeUnavailable] = useState(false);

  useEffect(() => {
    const receiveReferenceMessage = (event: MessageEvent<unknown>) => {
      const expectedSource = iframeRef.current?.contentWindow ?? null;
      if (!completionReceivedRef.current && isCompletionMessage(event, expectedSource)) {
        completionReceivedRef.current = true;
        if (viewerOpenRef.current) {
          void window.passwoDesktop?.closeReferenceSupplement();
        }
        onComplete();
        return;
      }

      const linkId = supplementLinkIdFromMessage(event, expectedSource);
      if (linkId === null || supplementRequestPendingRef.current || viewerOpenRef.current) return;

      const bridge = window.passwoDesktop;
      if (bridge === undefined) {
        setDesktopBridgeUnavailable(true);
        return;
      }

      supplementRequestPendingRef.current = true;
      setDesktopBridgeUnavailable(false);
      void bridge.openReferenceSupplement(linkId).then(
        (opened) => {
          supplementRequestPendingRef.current = false;
          if (!opened) {
            setDesktopBridgeUnavailable(true);
            return;
          }
          activeSupplementLinkIdRef.current = linkId;
          viewerOpenRef.current = true;
          setViewerOpen(true);
        },
        () => {
          supplementRequestPendingRef.current = false;
          setDesktopBridgeUnavailable(true);
        },
      );
    };
    window.addEventListener('message', receiveReferenceMessage);
    return () => {
      window.removeEventListener('message', receiveReferenceMessage);
      if (viewerOpenRef.current) {
        void window.passwoDesktop?.closeReferenceSupplement();
      }
    };
  }, [onComplete]);

  const retryLoading = () => {
    completionReceivedRef.current = false;
    setLoadFailed(false);
    setDesktopBridgeUnavailable(false);
    setReloadKey((current) => current + 1);
  };

  const closeSupplement = async () => {
    const linkId = activeSupplementLinkIdRef.current;
    await window.passwoDesktop?.closeReferenceSupplement();
    activeSupplementLinkIdRef.current = null;
    viewerOpenRef.current = false;
    setViewerOpen(false);
    if (linkId !== null) {
      window.requestAnimationFrame(() => focusSupplementLink(iframeRef.current, linkId));
    }
  };

  return (
    <section className={styles.surface}>
      {viewerOpen ? (
        <div className={styles.viewerToolbar} data-reference-viewer-toolbar="">
          <strong>Zusatzinformationen</strong>
          <button className={styles.backButton} type="button" onClick={closeSupplement}>
            Zurück zum Training
          </button>
        </div>
      ) : null}
      <iframe
        key={reloadKey}
        ref={iframeRef}
        className={styles.frame}
        src={REFERENCE_ARTIFACT_URL}
        title="Passwörter & Authentifizierung"
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        onLoad={(event) => {
          const contentType = event.currentTarget.contentDocument?.contentType;
          setLoadFailed(contentType !== undefined && contentType !== 'text/html');
        }}
        onError={() => setLoadFailed(true)}
      />
      {loadFailed ? (
        <div className={styles.errorPanel} role="alert">
          <p>Training konnte nicht geladen werden.</p>
          <button className={styles.button} type="button" onClick={retryLoading}>
            Erneut versuchen
          </button>
        </div>
      ) : null}
      {desktopBridgeUnavailable && !loadFailed ? (
        <div className={styles.errorPanel} role="alert">
          <p>Zusatzinformationen sind nur in der Desktop-App verfügbar.</p>
          <button
            className={styles.button}
            type="button"
            onClick={() => setDesktopBridgeUnavailable(false)}
          >
            Zurück zum Training
          </button>
        </div>
      ) : null}
    </section>
  );
}
