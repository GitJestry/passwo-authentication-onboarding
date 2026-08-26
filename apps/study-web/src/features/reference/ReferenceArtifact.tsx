import {
  REFERENCE_ARTIFACT_CHECKPOINT_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_OPEN_SUPPLEMENT_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_RESUME_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_SNAPSHOT_ID,
  REFERENCE_ARTIFACT_URL,
  referenceArtifactLessonCheckpointIdSchema,
  referenceSupplementLinkForId,
  referenceSupplementLinkIdSchema,
  type ReferenceArtifactLessonCheckpointId,
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

function checkpointFromMessage(
  event: MessageEvent<unknown>,
  expectedSource: Window | null,
): ReferenceArtifactLessonCheckpointId | null {
  if (
    event.source !== expectedSource ||
    event.origin !== window.location.origin ||
    typeof event.data !== 'object' ||
    event.data === null ||
    !('type' in event.data) ||
    event.data.type !== REFERENCE_ARTIFACT_CHECKPOINT_MESSAGE_TYPE ||
    !('snapshotId' in event.data) ||
    event.data.snapshotId !== REFERENCE_ARTIFACT_SNAPSHOT_ID ||
    !('checkpointId' in event.data) ||
    Object.keys(event.data).length !== 3
  ) {
    return null;
  }
  const parsed = referenceArtifactLessonCheckpointIdSchema.safeParse(event.data.checkpointId);
  return parsed.success ? parsed.data : null;
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

const referenceLightSchemeStyleId = 'passwo-reference-light-scheme';
const referenceLightSchemeCss = `
  :root {
    color-scheme: only light !important;
    background: #fff !important;
  }
  html,
  body {
    background-color: #fff !important;
  }
`;

function installReferenceLightScheme(frame: HTMLIFrameElement): () => void {
  const cleanups: Array<() => void> = [];
  const visitedDocuments = new WeakSet<Document>();

  function applyFrame(candidate: HTMLIFrameElement): void {
    try {
      const document = candidate.contentDocument;
      if (document !== null) applyDocument(document);
    } catch {
      // The frozen artifact is same-origin. Ignore defensive cross-origin failures only.
    }
  }

  function applyDocument(document: Document): void {
    if (visitedDocuments.has(document)) return;
    visitedDocuments.add(document);
    document.documentElement.style.setProperty('color-scheme', 'only light', 'important');
    document.documentElement.style.setProperty('background-color', '#fff', 'important');
    document.body?.style.setProperty('background-color', '#fff', 'important');

    if (document.getElementById(referenceLightSchemeStyleId) === null) {
      const style = document.createElement('style');
      style.id = referenceLightSchemeStyleId;
      style.textContent = referenceLightSchemeCss;
      document.head?.append(style);
    }

    const onNestedFrameLoad = (event: Event): void => {
      if (event.target instanceof HTMLIFrameElement) applyFrame(event.target);
    };
    document.addEventListener('load', onNestedFrameLoad, true);
    cleanups.push(() => document.removeEventListener('load', onNestedFrameLoad, true));

    for (const nestedFrame of document.querySelectorAll<HTMLIFrameElement>('iframe')) {
      applyFrame(nestedFrame);
    }
  }

  applyFrame(frame);
  return () => {
    for (const cleanup of cleanups.splice(0)) cleanup();
  };
}

export interface ReferenceArtifactProps {
  readonly onComplete: () => void;
  readonly onCheckpoint?: (checkpointId: ReferenceArtifactLessonCheckpointId) => Promise<void>;
  readonly resumeCheckpoint?: ReferenceArtifactLessonCheckpointId;
}

export function ReferenceArtifact({
  onComplete,
  onCheckpoint,
  resumeCheckpoint,
}: ReferenceArtifactProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onCompleteRef = useRef(onComplete);
  const onCheckpointRef = useRef(onCheckpoint);
  const checkpointQueueRef = useRef<Promise<void>>(Promise.resolve());
  const lastPersistedCheckpointRef = useRef<ReferenceArtifactLessonCheckpointId | null>(
    resumeCheckpoint ?? null,
  );
  const failedCheckpointRef = useRef<ReferenceArtifactLessonCheckpointId | null>(null);
  const completionRequestedRef = useRef(false);
  const completionInFlightRef = useRef(false);
  const completionFinishedRef = useRef(false);
  const viewerOpenRef = useRef(false);
  const activeSupplementLinkIdRef = useRef<string | null>(null);
  const supplementRequestPendingRef = useRef(false);
  const lightSchemeCleanupRef = useRef<() => void>(() => undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const [checkpointWriteFailed, setCheckpointWriteFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  onCompleteRef.current = onComplete;
  onCheckpointRef.current = onCheckpoint;

  const persistCheckpoint = (
    checkpointId: ReferenceArtifactLessonCheckpointId,
  ): Promise<void> => {
    const operation = checkpointQueueRef.current.then(async () => {
      if (lastPersistedCheckpointRef.current === checkpointId) return;
      await onCheckpointRef.current?.(checkpointId);
      lastPersistedCheckpointRef.current = checkpointId;
      failedCheckpointRef.current = null;
      setCheckpointWriteFailed(false);
    });
    checkpointQueueRef.current = operation.catch(() => undefined);
    void operation.catch(() => {
      failedCheckpointRef.current = checkpointId;
      setCheckpointWriteFailed(true);
    });
    return operation;
  };

  const completeAfterCheckpoint = () => {
    completionRequestedRef.current = true;
    if (completionFinishedRef.current || completionInFlightRef.current) return;
    completionInFlightRef.current = true;
    void persistCheckpoint('mfa')
      .then(() => {
        completionFinishedRef.current = true;
        if (viewerOpenRef.current) {
          void window.passwoDesktop?.closeReferenceSupplement();
        }
        onCompleteRef.current();
      })
      .catch(() => undefined)
      .finally(() => {
        completionInFlightRef.current = false;
      });
  };

  useEffect(() => {
    const receiveReferenceMessage = (event: MessageEvent<unknown>) => {
      const expectedSource = iframeRef.current?.contentWindow ?? null;
      const checkpointId = checkpointFromMessage(event, expectedSource);
      if (checkpointId !== null) {
        void persistCheckpoint(checkpointId);
        return;
      }
      if (isCompletionMessage(event, expectedSource)) {
        completeAfterCheckpoint();
        return;
      }

      const linkId = supplementLinkIdFromMessage(event, expectedSource);
      if (linkId === null || supplementRequestPendingRef.current || viewerOpenRef.current) return;

      const bridge = window.passwoDesktop;
      if (bridge === undefined) {
        const link = referenceSupplementLinkForId(linkId);
        window.open(link.url, '_blank', 'noopener,noreferrer');
        return;
      }

      supplementRequestPendingRef.current = true;
      void bridge.openReferenceSupplement(linkId).then(
        (opened) => {
          supplementRequestPendingRef.current = false;
          if (!opened) return;
          activeSupplementLinkIdRef.current = linkId;
          viewerOpenRef.current = true;
          setViewerOpen(true);
        },
        () => {
          supplementRequestPendingRef.current = false;
        },
      );
    };
    window.addEventListener('message', receiveReferenceMessage);
    return () => {
      window.removeEventListener('message', receiveReferenceMessage);
      lightSchemeCleanupRef.current();
      if (viewerOpenRef.current) {
        void window.passwoDesktop?.closeReferenceSupplement();
      }
    };
  }, []);

  const retryLoading = () => {
    completionRequestedRef.current = false;
    completionInFlightRef.current = false;
    completionFinishedRef.current = false;
    setLoadFailed(false);
    lightSchemeCleanupRef.current();
    lightSchemeCleanupRef.current = () => undefined;
    setReloadKey((current) => current + 1);
  };

  const retryCheckpointWrite = () => {
    const checkpointId = failedCheckpointRef.current;
    if (checkpointId === null) return;
    if (completionRequestedRef.current) {
      completeAfterCheckpoint();
      return;
    }
    void persistCheckpoint(checkpointId);
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
          lightSchemeCleanupRef.current();
          lightSchemeCleanupRef.current = installReferenceLightScheme(event.currentTarget);
          const contentType = event.currentTarget.contentDocument?.contentType;
          setLoadFailed(contentType !== undefined && contentType !== 'text/html');
          if (resumeCheckpoint !== undefined) {
            event.currentTarget.contentWindow?.postMessage(
              {
                type: REFERENCE_ARTIFACT_RESUME_MESSAGE_TYPE,
                snapshotId: REFERENCE_ARTIFACT_SNAPSHOT_ID,
                checkpointId: resumeCheckpoint,
              },
              window.location.origin,
            );
          }
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
      {checkpointWriteFailed && !loadFailed ? (
        <div className={styles.errorPanel} role="alert">
          <p>Der Fortschritt konnte nicht bestätigt werden.</p>
          <button className={styles.button} type="button" onClick={retryCheckpointWrite}>
            Erneut versuchen
          </button>
        </div>
      ) : null}
    </section>
  );
}
