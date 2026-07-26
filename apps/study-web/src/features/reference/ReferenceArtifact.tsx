import {
  REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_URL,
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
    event.data.type !== REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE
  ) {
    return false;
  }
  return Object.keys(event.data).length === 1;
}

export function ReferenceArtifact({ onComplete }: { readonly onComplete: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const completionReceivedRef = useRef(false);
  const continuationRequestedRef = useRef(false);
  const [completionReceived, setCompletionReceived] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const receiveCompletion = (event: MessageEvent<unknown>) => {
      if (
        completionReceivedRef.current ||
        !isCompletionMessage(event, iframeRef.current?.contentWindow ?? null)
      ) {
        return;
      }
      completionReceivedRef.current = true;
      setCompletionReceived(true);
    };
    window.addEventListener('message', receiveCompletion);
    return () => window.removeEventListener('message', receiveCompletion);
  }, []);

  const retryLoading = () => {
    completionReceivedRef.current = false;
    continuationRequestedRef.current = false;
    setCompletionReceived(false);
    setLoadFailed(false);
    setReloadKey((current) => current + 1);
  };

  const continueToQuestionnaire = () => {
    if (continuationRequestedRef.current) return;
    continuationRequestedRef.current = true;
    onComplete();
  };

  return (
    <section className={styles.surface}>
      <iframe
        key={reloadKey}
        ref={iframeRef}
        className={styles.frame}
        src={REFERENCE_ARTIFACT_URL}
        title="Passwörter & Authentifizierung"
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
      {completionReceived && !loadFailed ? (
        <div className={styles.completionBar} aria-live="polite">
          <strong>Training abgeschlossen</strong>
          <button className={styles.button} type="button" onClick={continueToQuestionnaire}>
            Weiter
          </button>
        </div>
      ) : null}
    </section>
  );
}
