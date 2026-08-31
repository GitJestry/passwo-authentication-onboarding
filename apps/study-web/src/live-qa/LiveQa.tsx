import {
  liveQaApiBasePath,
  liveQaFollowUpPath,
  liveQaFollowUpPreviewPath,
  liveQaPath,
  type LiveQaFollowUpCaseResponse,
  type LiveQaFollowUpMessagesResponse,
  type LiveQaFollowUpPreviewStatus,
  type LiveQaCondition,
  type LiveQaRoute,
} from '@passwo/contracts';
import { ArtifactViewport } from '@passwo/ui';
import { lazy, Suspense, useEffect, useState } from 'react';
import {
  loadReferenceArtifactRenderer,
  loadSupportiveArtifactRenderer,
} from '../features/artifact-loaders.js';
import { TrainingClipboardBoundary } from '../features/training/TrainingClipboardBoundary.js';
import {
  completeLiveQaQuestionnaires,
  loadLiveQaFollowUpMessages,
  prepareLiveQaArtifact,
  prepareLiveQaFollowUpCase,
  prepareLiveQaFollowUpPreview,
  resetLiveQaSession,
  skipLiveQaArtifact,
  verifyLiveQaFollowUpSubmission,
  type LiveQaFollowUpProof,
} from './live-qa-api.js';
import styles from './LiveQa.module.css';

const ReferenceArtifact = lazy(async () => {
  const module = await loadReferenceArtifactRenderer();
  return { default: module.ReferenceArtifact };
});
const PasswordModuleTraining = lazy(async () => {
  const module = await loadSupportiveArtifactRenderer();
  return { default: module.PasswordModuleTraining };
});
const StudyFlow = lazy(async () => {
  const module = await import('../features/study/StudyFlow.js');
  return { default: module.StudyFlow };
});
const FollowUpFlow = lazy(async () => {
  const module = await import('../features/follow-up/FollowUpFlow.js');
  return { default: module.FollowUpFlow };
});

function ArtifactLoadingBoundary() {
  return (
    <div className={styles.artifactLoading} role="status" aria-busy="true">
      Das Lernangebot beginnt gleich
    </div>
  );
}

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
          <article className={styles.conditionCard}>
            <h2>Follow-up</h2>
            <p>
              Einladung und Reminder mit synthetischen Daten ansehen oder einen consentierten
              In-Memory-Hauptfall bis in die echte Nachbefragung führen.
            </p>
            <div className={styles.actions}>
              <a className={styles.link} href={liveQaFollowUpPath}>
                Follow-up öffnen
              </a>
            </div>
          </article>
        </div>
        <p className={styles.note}>
          QA-Sitzungen werden ausschließlich im Arbeitsspeicher der separaten QA-Runtime geführt.
          Sie verwenden weder die produktive Datenbank noch die Permuted-Block-Zuweisung.
        </p>
      </section>
    </main>
  );
}

function MessagePreview({
  label,
  message,
}: {
  readonly label: string;
  readonly message: LiveQaFollowUpMessagesResponse['invitation' | 'reminder'];
}) {
  return (
    <article className={styles.messagePreview}>
      <h2>{label}</h2>
      <dl className={styles.messageMetadata}>
        <div>
          <dt>Von</dt>
          <dd>
            {message.sender.name} &lt;{message.sender.address}&gt;
          </dd>
        </div>
        <div>
          <dt>An</dt>
          <dd>{message.recipient}</dd>
        </div>
        <div>
          <dt>Betreff</dt>
          <dd>{message.subject}</dd>
        </div>
      </dl>
      <pre className={styles.messageBody}>{message.text}</pre>
    </article>
  );
}

function FollowUpQaChooser() {
  const apiBasePath = liveQaApiBasePath('supportive');
  const [messages, setMessages] = useState<LiveQaFollowUpMessagesResponse | null>(null);
  const [prepared, setPrepared] = useState<LiveQaFollowUpCaseResponse | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function run<T>(action: string, operation: () => Promise<T>, accept: (value: T) => void) {
    if (busyAction !== null) return;
    setBusyAction(action);
    setErrorCode(null);
    try {
      accept(await operation());
    } catch (error) {
      setErrorCode(error instanceof Error ? error.message : 'live-qa-request-failed');
    } finally {
      setBusyAction(null);
    }
  }

  const qaLink =
    prepared === null ? null : `${liveQaFollowUpPath}?token=${encodeURIComponent(prepared.token)}`;

  return (
    <main className={styles.chooser}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Geschützte Live-QA · Follow-up</p>
        <h1>Nachbefragung prüfen</h1>
        <p>
          Alle hier erzeugten Kontakte, Tokens, Zeitpunkte und Antworten sind synthetisch und
          verbleiben ausschließlich in der bestehenden In-Memory-QA-Runtime. Es wird keine E-Mail
          versendet.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.button}
            disabled={busyAction !== null}
            type="button"
            onClick={() =>
              void run('messages', () => loadLiveQaFollowUpMessages(apiBasePath), setMessages)
            }
          >
            E-Mail ansehen
          </button>
          <button
            className={styles.button}
            disabled={busyAction !== null}
            type="button"
            onClick={() =>
              void run('case', () => prepareLiveQaFollowUpCase(apiBasePath), setPrepared)
            }
          >
            Follow-up testen
          </button>
          <a className={`${styles.link} ${styles.secondary}`} href="/qa">
            Zur Auswahl
          </a>
        </div>
        <div className={styles.actions} aria-label="Direkt aufrufbare Follow-up-Zustände">
          <a
            className={`${styles.link} ${styles.secondary}`}
            href={liveQaFollowUpPreviewPath('not-yet-open')}
          >
            Not-yet-open ansehen
          </a>
          <a
            className={`${styles.link} ${styles.secondary}`}
            href={liveQaFollowUpPreviewPath('expired')}
          >
            Expired ansehen
          </a>
          <a
            className={`${styles.link} ${styles.secondary}`}
            href={liveQaFollowUpPreviewPath('submitted')}
          >
            Submitted ansehen
          </a>
          <a
            className={`${styles.link} ${styles.secondary}`}
            href={liveQaFollowUpPreviewPath('invalid')}
          >
            Invalid ansehen
          </a>
        </div>
        {busyAction === null ? null : <p role="status">Synthetischer QA-Fall wird vorbereitet …</p>}
        {errorCode === null ? null : (
          <p className={styles.error} role="alert">
            Fehlercode: {errorCode}
          </p>
        )}
        {prepared === null || qaLink === null ? null : (
          <section className={styles.qaResult} aria-labelledby="follow-up-case-heading">
            <h2 id="follow-up-case-heading">Synthetischer Main-Fall ist bereit</h2>
            <p>
              Die Hauptstudie wurde consentiert und regulär abgeschlossen. Die gültige Nachbefragung
              verwendet dieselbe In-Memory-Study-/Recontact-Verknüpfung.
            </p>
            <p>
              Pseudonyme Forschungs-ID: <code>{prepared.researchId}</code>
            </p>
            <a className={styles.link} href={qaLink}>
              Gültigen Follow-up-Link öffnen
            </a>
          </section>
        )}
        {messages === null ? null : (
          <div className={styles.messageGrid}>
            <MessagePreview label="Einladung" message={messages.invitation} />
            <MessagePreview label="Reminder" message={messages.reminder} />
          </div>
        )}
      </section>
    </main>
  );
}

function FollowUpQaVerification({ proof }: { readonly proof: LiveQaFollowUpProof }) {
  return (
    <aside className={styles.verification} aria-labelledby="follow-up-verification-heading">
      <h2 id="follow-up-verification-heading">Technische QA bestätigt</h2>
      <ul>
        <li>{proof.storedResponseCount} Follow-up-Antworten wurden gespeichert.</li>
        <li>
          Die Antworten sind mit dem synthetischen Main-Fall unter <code>{proof.researchId}</code>{' '}
          verknüpft.
        </li>
        <li>Status: {proof.status}</li>
        <li>Eine erneute unterschiedliche Abgabe wurde blockiert.</li>
        <li>Ein Reminder ist anschließend nicht zulässig.</li>
      </ul>
    </aside>
  );
}

function FollowUpQaFlow({ token }: { readonly token: string | null }) {
  const apiBasePath = liveQaApiBasePath('supportive');
  const [proof, setProof] = useState<LiveQaFollowUpProof | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  return (
    <div className={styles.followUpFlow}>
      <nav className={styles.followUpNav} aria-label="Follow-up-QA">
        <a className={`${styles.link} ${styles.secondary}`} href={liveQaFollowUpPath}>
          Follow-up-QA
        </a>
      </nav>
      <Suspense fallback={<ArtifactLoadingBoundary />}>
        <FollowUpFlow
          apiBasePath={apiBasePath}
          initialToken={token}
          onSubmitted={(submission) => {
            setVerifying(true);
            setVerificationError(null);
            void verifyLiveQaFollowUpSubmission(apiBasePath, submission)
              .then(setProof)
              .catch((error: unknown) => {
                setVerificationError(
                  error instanceof Error ? error.message : 'live-qa-follow-up-verification-failed',
                );
              })
              .finally(() => setVerifying(false));
          }}
        />
      </Suspense>
      {verifying ? (
        <p className={styles.verification} role="status">
          QA-Nachweis wird geprüft …
        </p>
      ) : null}
      {proof === null ? null : <FollowUpQaVerification proof={proof} />}
      {verificationError === null ? null : (
        <p className={`${styles.verification} ${styles.error}`} role="alert">
          QA-Nachweis fehlgeschlagen: {verificationError}
        </p>
      )}
    </div>
  );
}

function FollowUpQa({ initialToken }: { readonly initialToken: string | null }) {
  return initialToken === null ? <FollowUpQaChooser /> : <FollowUpQaFlow token={initialToken} />;
}

const followUpPreviewPreparations = new Map<LiveQaFollowUpPreviewStatus, Promise<string>>();

function prepareFollowUpPreviewOnce(status: LiveQaFollowUpPreviewStatus): Promise<string> {
  const existing = followUpPreviewPreparations.get(status);
  if (existing !== undefined) return existing;
  const preparation = prepareLiveQaFollowUpPreview(liveQaApiBasePath('supportive'), status);
  followUpPreviewPreparations.set(status, preparation);
  return preparation;
}

function FollowUpQaPreview({ status }: { readonly status: LiveQaFollowUpPreviewStatus }) {
  const [token, setToken] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void prepareFollowUpPreviewOnce(status)
      .then((preparedToken) => {
        if (active) setToken(preparedToken);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorCode(error instanceof Error ? error.message : 'live-qa-request-failed');
        }
      });
    return () => {
      active = false;
    };
  }, [status]);

  if (token !== null) return <FollowUpQaFlow token={token} />;
  return (
    <main className={styles.chooser}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Geschützte Live-QA · Follow-up</p>
        <h1>{status} wird vorbereitet</h1>
        {errorCode === null ? (
          <p role="status">Synthetischer QA-Zustand wird in der In-Memory-Runtime erzeugt …</p>
        ) : (
          <p className={styles.error} role="alert">
            Fehlercode: {errorCode}
          </p>
        )}
        <a className={`${styles.link} ${styles.secondary}`} href={liveQaFollowUpPath}>
          Follow-up-QA
        </a>
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
        <Suspense fallback={<ArtifactLoadingBoundary />}>
          {condition === 'supportive' ? (
            <TrainingClipboardBoundary allowCopy={false}>
              <PasswordModuleTraining onComplete={() => setCompleted(true)} />
            </TrainingClipboardBoundary>
          ) : (
            <ReferenceArtifact onComplete={() => setCompleted(true)} />
          )}
        </Suspense>
      </ArtifactViewport>
    </main>
  );
}

function FullStudy({ condition }: { readonly condition: LiveQaCondition }) {
  return (
    <>
      <QaToolbar condition={condition} mode="study" />
      <Suspense fallback={<ArtifactLoadingBoundary />}>
        <StudyFlow apiBasePath={liveQaApiBasePath(condition)} />
      </Suspense>
    </>
  );
}

export function LiveQa({
  route,
  initialFollowUpToken,
}: {
  readonly route: LiveQaRoute;
  readonly initialFollowUpToken: string | null;
}) {
  if (route.kind === 'chooser') return <QaChooser />;
  if (route.kind === 'follow-up') return <FollowUpQa initialToken={initialFollowUpToken} />;
  if (route.kind === 'follow-up-preview') return <FollowUpQaPreview status={route.status} />;
  return route.mode === 'direct' ? (
    <DirectArtifact condition={route.condition} />
  ) : (
    <FullStudy condition={route.condition} />
  );
}
