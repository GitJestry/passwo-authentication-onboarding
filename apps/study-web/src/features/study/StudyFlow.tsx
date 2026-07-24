import { createStudyMachine } from '@passwo/study-engine';
import { useMachine } from '@xstate/react';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { createStudyApi } from '../../api/study-api.js';
import styles from './StudyFlow.module.css';

function Consent({ onAccept }: { readonly onAccept: () => void }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <section aria-labelledby="consent-title">
      <p className={styles.eyebrow}>Einwilligung</p>
      <h1 id="consent-title">Willkommen zur Studie</h1>
      <p>
        Dies ist ein technischer Platzhalter für die spätere Einwilligungsinformation. Es werden
        keine realen Passwörter, Konten oder Sicherheitsvorfälle abgefragt.
      </p>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          if (accepted) onAccept();
        }}
      >
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.currentTarget.checked)}
          />
          <span>Ich bestätige die Einwilligung für diesen Platzhalterdurchlauf.</span>
        </label>
        <button className={styles.button} type="submit" disabled={!accepted}>
          Studie beginnen
        </button>
      </form>
    </section>
  );
}

function PlaceholderInstrument({
  eyebrow,
  title,
  description,
  submitLabel,
  onSubmit,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly submitLabel: string;
  readonly onSubmit: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <section aria-labelledby={`${eyebrow}-title`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 id={`${eyebrow}-title`}>{title}</h1>
      <p>{description}</p>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          if (confirmed) onSubmit();
        }}
      >
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.currentTarget.checked)}
          />
          <span>Platzhalterantwort bestätigen</span>
        </label>
        <button className={styles.button} type="submit" disabled={!confirmed}>
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

function NameEntry({ onSubmit }: { readonly onSubmit: (displayName: string) => void }) {
  const [displayName, setDisplayName] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = displayName.trim();
    if (trimmedName.length > 0) onSubmit(trimmedName);
  }

  return (
    <section aria-labelledby="name-title">
      <p className={styles.eyebrow}>Anzeigename</p>
      <h1 id="name-title">Wie dürfen wir dich ansprechen?</h1>
      <p>
        Der Anzeigename wird nur vorübergehend in diesem Browserfenster verwendet und nicht
        gespeichert oder an den Studienserver gesendet.
      </p>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.label}>
          Anzeigename
          <input
            className={styles.input}
            name="display-name"
            autoComplete="off"
            maxLength={40}
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.currentTarget.value)}
          />
        </label>
        <button className={styles.button} type="submit">
          Zum Artefakt
        </button>
      </form>
    </section>
  );
}

function SupportiveArtifact({
  displayName,
  onComplete,
}: {
  readonly displayName: string;
  readonly onComplete: () => void;
}) {
  return (
    <section aria-labelledby="artifact-title">
      <p className={styles.eyebrow}>Artefakt</p>
      <h1 id="artifact-title">Hallo {displayName}</h1>
      <div className={styles.artifact}>
        <p>
          Hier steht später das supportive Training. Dieser Durchlauf enthält bewusst keine
          Passwortanalyse und keine Trainingsinhalte.
        </p>
        <button className={styles.button} type="button" onClick={onComplete}>
          Artefakt-Platzhalter abschließen
        </button>
      </div>
    </section>
  );
}

function ReferenceArtifact({ onComplete }: { readonly onComplete: () => void }) {
  return (
    <section aria-labelledby="artifact-title">
      <p className={styles.eyebrow}>Artefakt</p>
      <h1 id="artifact-title">Referenz-Platzhalter</h1>
      <p>
        Das spätere Referenzartefakt wird in einem separaten Tab geöffnet. In diesem technischen
        Durchlauf wird kein externer Inhalt geladen.
      </p>
      <div className={styles.artifact}>
        <a className={styles.externalLink} href="about:blank" target="_blank" rel="noreferrer">
          Referenz-Platzhalter in neuem Tab öffnen
        </a>
        <button className={styles.button} type="button" onClick={onComplete}>
          Rückkehr bestätigen
        </button>
      </div>
    </section>
  );
}

function ResearchDataError({
  errorCode,
  onRetry,
}: {
  readonly errorCode: string | null;
  readonly onRetry: () => void;
}) {
  return (
    <section aria-labelledby="error-title" role="alert">
      <p className={styles.eyebrow}>Technische Unterbrechung</p>
      <h1 id="error-title">Speichern nicht möglich</h1>
      <div className={styles.notice}>
        Der nächste Studienteil bleibt gesperrt, bis die Forschungsdaten bestätigt gespeichert
        wurden.
      </div>
      <p className={styles.errorCode}>Fehlercode: {errorCode ?? 'research-data-write-failed'}</p>
      <button className={styles.button} type="button" onClick={onRetry}>
        Erneut versuchen
      </button>
    </section>
  );
}

export function StudyFlow() {
  const api = useMemo(() => createStudyApi(), []);
  const machine = useMemo(() => createStudyMachine(api), [api]);
  const [snapshot, send] = useMachine(machine);
  const { context } = snapshot;

  const artifactInProgress =
    snapshot.matches('startingArtifact') ||
    snapshot.matches('artifactStartError') ||
    snapshot.matches('artifact') ||
    snapshot.matches('endingArtifact') ||
    snapshot.matches('artifactEndError');

  useEffect(() => {
    if (!artifactInProgress || context.sessionId === null) return;
    const sessionId = context.sessionId;
    let reloadMarked = false;
    const markReload = () => {
      if (reloadMarked) return;
      reloadMarked = true;
      api.markIncompleteReload(sessionId);
    };
    window.addEventListener('beforeunload', markReload);
    window.addEventListener('pagehide', markReload);
    return () => {
      window.removeEventListener('beforeunload', markReload);
      window.removeEventListener('pagehide', markReload);
    };
  }, [api, artifactInProgress, context.sessionId]);

  let content: ReactNode;
  let step = 'Studienstart';

  if (snapshot.matches('consent')) {
    content = <Consent onAccept={() => send({ type: 'ACCEPT_CONSENT' })} />;
  } else if (snapshot.matches('sessionError')) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_SESSION' })}
      />
    );
  } else if (snapshot.matches({ preQuestionnaire: 'error' })) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_PRE' })}
      />
    );
    step = 'Vorher';
  } else if (snapshot.matches({ preQuestionnaire: 'editing' })) {
    content = (
      <PlaceholderInstrument
        eyebrow="Pre-Platzhalter"
        title="Fragebogen vor dem Artefakt"
        description="Die finalen Fragebogenitems sind noch nicht Teil dieses Durchlaufs."
        submitLabel="Antwort speichern"
        onSubmit={() => send({ type: 'SUBMIT_PRE' })}
      />
    );
    step = 'Vorher';
  } else if (snapshot.matches('nameEntry')) {
    content = (
      <NameEntry onSubmit={(displayName) => send({ type: 'DISPLAY_NAME_ENTERED', displayName })} />
    );
    step = 'Personalisierung';
  } else if (snapshot.matches('artifactStartError')) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_START' })}
      />
    );
    step = 'Artefakt';
  } else if (snapshot.matches({ artifact: 'supportive' })) {
    content = (
      <SupportiveArtifact
        displayName={context.displayName ?? ''}
        onComplete={() => send({ type: 'ARTIFACT_COMPLETED' })}
      />
    );
    step = 'Artefakt';
  } else if (snapshot.matches({ artifact: 'reference' })) {
    content = <ReferenceArtifact onComplete={() => send({ type: 'ARTIFACT_COMPLETED' })} />;
    step = 'Artefakt';
  } else if (snapshot.matches('artifactEndError')) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_END' })}
      />
    );
    step = 'Artefakt';
  } else if (snapshot.matches({ postQuestionnaire: 'error' })) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_POST' })}
      />
    );
    step = 'Nachher';
  } else if (snapshot.matches({ postQuestionnaire: 'editing' })) {
    content = (
      <PlaceholderInstrument
        eyebrow="Post-Platzhalter"
        title="Fragebogen nach dem Artefakt"
        description="Die finalen Fragebogenitems werden in einem späteren Schritt ergänzt."
        submitLabel="Antwort speichern"
        onSubmit={() => send({ type: 'SUBMIT_POST' })}
      />
    );
    step = 'Nachher';
  } else if (snapshot.matches({ guardrails: 'error' })) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_GUARDRAILS' })}
      />
    );
    step = 'Verständnis';
  } else if (snapshot.matches({ guardrails: 'editing' })) {
    content = (
      <PlaceholderInstrument
        eyebrow="Guardrail-Platzhalter"
        title="Verständnis prüfen"
        description="Hier folgen später die methodisch geprüften Guardrail-Items."
        submitLabel="Antwort speichern"
        onSubmit={() => send({ type: 'SUBMIT_GUARDRAILS' })}
      />
    );
    step = 'Verständnis';
  } else if (snapshot.matches('debrief')) {
    content = (
      <section aria-labelledby="debrief-title">
        <p className={styles.eyebrow}>Debrief</p>
        <h1 id="debrief-title">Vielen Dank</h1>
        <p>
          Dies ist der Platzhalter für die spätere Aufklärung nach der Studie. Erst deine
          Bestätigung schließt die Sitzung ab.
        </p>
        <div className={styles.form}>
          <button
            className={styles.button}
            type="button"
            onClick={() => send({ type: 'DEBRIEF_ACKNOWLEDGED' })}
          >
            Debrief bestätigen
          </button>
        </div>
      </section>
    );
    step = 'Abschluss';
  } else if (snapshot.matches('completionError')) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_COMPLETION' })}
      />
    );
    step = 'Abschluss';
  } else if (snapshot.matches('complete')) {
    content = (
      <section aria-labelledby="complete-title">
        <p className={styles.eyebrow}>Complete</p>
        <h1 id="complete-title">Sitzung abgeschlossen</h1>
        <p>
          Sitzungscode: <strong>{context.participantCode}</strong>
        </p>
        <p>
          Gesamtzeit im Artefakt: <strong>{Math.round(context.artifactWallClockMs ?? 0)} ms</strong>
        </p>
      </section>
    );
    step = 'Fertig';
  } else if (snapshot.matches('fatalError')) {
    content = (
      <section aria-labelledby="fatal-title" role="alert">
        <p className={styles.eyebrow}>Technischer Abbruch</p>
        <h1 id="fatal-title">Die Sitzung kann nicht fortgesetzt werden</h1>
        <p className={styles.errorCode}>Fehlercode: {context.fatalErrorCode}</p>
      </section>
    );
    step = 'Abbruch';
  } else {
    content = <div className={styles.loading}>Forschungsdaten werden gespeichert …</div>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <strong>PassWo Studie</strong>
            <span>Technischer Platzhalterdurchlauf</span>
          </div>
          <span className={styles.step} aria-live="polite">
            {step}
          </span>
        </header>
        <div className={styles.content}>{content}</div>
      </div>
    </main>
  );
}
