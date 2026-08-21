import {
  liveQaApiBasePath,
  liveQaPath,
  type LiveQaCondition,
  type LiveQaRoute,
} from '@passwo/contracts';
import { ArtifactViewport } from '@passwo/ui';
import { useState } from 'react';
import { ReferenceArtifact } from '../features/reference/ReferenceArtifact.js';
import { StudyFlow } from '../features/study/StudyFlow.js';
import { PasswordModuleTraining } from '../features/training/PasswordModuleTraining.js';
import { TrainingClipboardBoundary } from '../features/training/TrainingClipboardBoundary.js';
import {
  completeLiveQaQuestionnaires,
  prepareLiveQaArtifact,
  resetLiveQaSession,
  skipLiveQaArtifact,
} from './live-qa-api.js';
import styles from './LiveQa.module.css';

const conditionCopy = {
  supportive: {
    label: 'PassWo',
    description: 'Supportives Authentication Onboarding mit vollständiger PassWo-Navigation.',
  },
  reference: {
    label: 'SecAware',
    description: 'Eingefrorenes SecAware-Referenzangebot mit realer Nginx-/Videoauslieferung.',
  },
} as const;

function QaChooser() {
  return (
    <main className={styles.chooser}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Geschützte Live-QA · echte Serverauslieferung</p>
        <h1>Lernangebot und Laufzeitpfad auswählen</h1>
        <p>
          Die direkte Ansicht eignet sich für Ladezeiten, Videos, Animationen und Inhalte. Der
          vollständige Studienpfad verwendet eine isolierte In-Memory-Sitzung mit eigener
          serverseitig erzwungener Bedingung und eigenen Rückkehr-Cookies.
        </p>
        <div className={styles.conditionGrid}>
          {(['supportive', 'reference'] as const).map((condition) => (
            <article className={styles.conditionCard} key={condition}>
              <h2>{conditionCopy[condition].label}</h2>
              <p>{conditionCopy[condition].description}</p>
              <div className={styles.actions}>
                <a className={styles.link} href={liveQaPath(condition, 'direct')}>
                  Direkt öffnen
                </a>
                <a
                  className={`${styles.link} ${styles.secondary}`}
                  href={liveQaPath(condition, 'study')}
                >
                  Studienpfad öffnen
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.note}>
          QA-Sitzungen werden ausschließlich im Arbeitsspeicher der separaten QA-Runtime geführt.
          Sie verwenden weder die produktive Datenbank noch die Permuted-Block-Zuweisung.
        </p>
      </section>
    </main>
  );
}

function QaToolbar({
  condition,
  mode,
}: {
  readonly condition: LiveQaCondition;
  readonly mode: 'direct' | 'study';
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const apiBasePath = liveQaApiBasePath(condition);

  async function run(action: string, operation: () => Promise<void>): Promise<void> {
    if (busyAction !== null) return;
    setBusyAction(action);
    setErrorCode(null);
    try {
      await operation();
      window.location.reload();
    } catch (error) {
      setErrorCode(error instanceof Error ? error.message : 'live-qa-request-failed');
      setBusyAction(null);
    }
  }

  return (
    <details className={styles.toolbar}>
      <summary>
        Live-QA · {conditionCopy[condition].label} · {mode === 'direct' ? 'direkt' : 'Studienpfad'}
      </summary>
      <p>
        {mode === 'direct'
          ? 'Kein Fragebogen, keine Sitzung und kein Resume. Ein Reload startet das Lernangebot neu.'
          : 'Eigene In-Memory-Sitzung. Reload und Tab-Wechsel durchlaufen den echten Resume-/Timingpfad.'}
      </p>
      <div className={styles.toolbarActions}>
        <a className={`${styles.link} ${styles.secondary}`} href="/qa">
          Auswahl
        </a>
        <button
          className={`${styles.button} ${styles.secondary}`}
          type="button"
          onClick={() => window.location.reload()}
        >
          Neu laden
        </button>
        {mode === 'study' ? (
          <>
            <button
              className={styles.button}
              type="button"
              disabled={busyAction !== null}
              onClick={() => void run('prepare', () => prepareLiveQaArtifact(apiBasePath))}
            >
              Bis zum Lernangebot springen
            </button>
            <button
              className={styles.button}
              type="button"
              disabled={busyAction !== null}
              onClick={() => void run('skip-artifact', () => skipLiveQaArtifact(apiBasePath))}
            >
              Lernangebot überspringen
            </button>
            <button
              className={styles.button}
              type="button"
              disabled={busyAction !== null}
              onClick={() =>
                void run('questionnaires', () => completeLiveQaQuestionnaires(apiBasePath))
              }
            >
              Restliche Fragebögen ausfüllen
            </button>
            <button
              className={`${styles.button} ${styles.secondary}`}
              type="button"
              disabled={busyAction !== null}
              onClick={() => void run('reset', () => resetLiveQaSession(apiBasePath))}
            >
              QA-Sitzung zurücksetzen
            </button>
          </>
        ) : null}
      </div>
      {busyAction === null ? null : <p role="status">QA-Aktion wird ausgeführt …</p>}
      {errorCode === null ? null : (
        <p className={styles.error} role="alert">
          Fehlercode: {errorCode}
        </p>
      )}
    </details>
  );
}

function DirectArtifact({ condition }: { readonly condition: LiveQaCondition }) {
  const [completed, setCompleted] = useState(false);
  if (completed) {
    return (
      <main className={styles.chooser}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>Live-QA</p>
          <h1>{conditionCopy[condition].label} abgeschlossen</h1>
          <div className={styles.actions}>
            <a className={styles.link} href={liveQaPath(condition, 'direct')}>
              Erneut öffnen
            </a>
            <a className={`${styles.link} ${styles.secondary}`} href="/qa">
              Anderes Lernangebot wählen
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.artifactSurface} data-artifact-surface="">
      <QaToolbar condition={condition} mode="direct" />
      <ArtifactViewport>
        {condition === 'supportive' ? (
          <TrainingClipboardBoundary allowCopy={false}>
            <PasswordModuleTraining onComplete={() => setCompleted(true)} />
          </TrainingClipboardBoundary>
        ) : (
          <ReferenceArtifact onComplete={() => setCompleted(true)} />
        )}
      </ArtifactViewport>
    </main>
  );
}

function FullStudy({ condition }: { readonly condition: LiveQaCondition }) {
  return (
    <>
      <QaToolbar condition={condition} mode="study" />
      <StudyFlow apiBasePath={liveQaApiBasePath(condition)} />
    </>
  );
}

export function LiveQa({ route }: { readonly route: LiveQaRoute }) {
  if (route.kind === 'chooser') return <QaChooser />;
  return route.mode === 'direct' ? (
    <DirectArtifact condition={route.condition} />
  ) : (
    <FullStudy condition={route.condition} />
  );
}
