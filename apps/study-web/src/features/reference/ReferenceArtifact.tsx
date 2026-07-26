import { REFERENCE_ARTIFACT_URL } from '@passwo/contracts';
import { useState } from 'react';
import styles from './ReferenceArtifact.module.css';

export function ReferenceArtifact({ onComplete }: { readonly onComplete: () => void }) {
  const [hasOpenedTraining, setHasOpenedTraining] = useState(false);

  return (
    <section className={styles.surface} aria-labelledby="reference-provider">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Referenztraining</p>
        <h1 id="reference-provider">SecAware.NRW</h1>
        <p className={styles.moduleTitle}>Passwörter &amp; Authentifizierung</p>
      </div>
      <p className={styles.instructions}>
        Öffne das Training in einem separaten Tab und bearbeite dort das Lernangebot. Kehre danach
        zu diesem Tab zurück.
      </p>
      <div className={styles.actions}>
        <a
          className={styles.externalLink}
          href={REFERENCE_ARTIFACT_URL}
          target="_blank"
          rel="noopener"
          onClick={() => setHasOpenedTraining(true)}
        >
          Training öffnen
        </a>
        {hasOpenedTraining ? (
          <button className={styles.button} type="button" onClick={onComplete}>
            Abschluss bestätigen
          </button>
        ) : null}
      </div>
    </section>
  );
}
