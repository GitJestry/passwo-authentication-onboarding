import { createStudyMachine } from '@passwo/study-engine';
import { useMachine } from '@xstate/react';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserSegmentTimingAdapter } from '../../adapters/animation/BrowserSegmentTimingAdapter.js';
import { createStudyApi } from '../../api/study-api.js';
import { ReferenceArtifact } from '../reference/ReferenceArtifact.js';
import { PasswordModuleTraining } from '../training/PasswordModuleTraining.js';
import styles from './StudyFlow.module.css';

function Consent({ onAccept }: { readonly onAccept: () => void }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <section aria-labelledby="consent-title">
      <p className={styles.eyebrow}>Einwilligung</p>
      <h1 id="consent-title">Willkommen</h1>
      <p>
        Im folgenden Ablauf werden keine realen Passwörter, Konten oder Sicherheitsvorfälle
        abgefragt. Bitte lies die Hinweise vollständig, bevor du fortfährst.
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
          <span>Ich habe die Hinweise gelesen und willige in die Teilnahme ein.</span>
        </label>
        <button className={styles.button} type="submit" disabled={!accepted}>
          Weiter zum Fragebogen
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
          <span>Ich habe die Hinweise zu diesem Abschnitt gelesen.</span>
        </label>
        <button className={styles.button} type="submit" disabled={!confirmed}>
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

function SupportiveArtifact({
  onComplete,
  timingPort,
  timingError,
  onRetryTiming,
}: {
  readonly onComplete: () => void;
  readonly timingPort: BrowserSegmentTimingAdapter;
  readonly timingError: string | null;
  readonly onRetryTiming: () => void;
}) {
  return (
    <PasswordModuleTraining
      onComplete={onComplete}
      timingPort={timingPort}
      externalTimingError={timingError}
      onRetryExternalTiming={onRetryTiming}
    />
  );
}

function ArtifactPreparation({
  condition,
  onStart,
}: {
  readonly condition: 'supportive' | 'reference';
  readonly onStart: () => void;
}) {
  const conditionHint =
    condition === 'supportive'
      ? 'PassWo begleitet dich im fiktiven Campusraum. Beachte seine Hinweise und nutze alle dargestellten Konten und Elemente.'
      : 'Lies auch die zusätzlichen Hinweise und nutze alle Elemente, die im Lernangebot angeboten werden.';

  return (
    <section className={styles.artifactPreparation} aria-labelledby="artifact-preparation-title">
      <header className={styles.artifactPreparationHeader}>
        <p className={styles.eyebrow}>Lernangebot</p>
        <h1 id="artifact-preparation-title">Das Lernangebot beginnt gleich</h1>
      </header>
      <div className={styles.artifactPreparationContent}>
        <p>Bitte bearbeite das Lernangebot gründlich und vollständig.</p>
        <p>{conditionHint}</p>
      </div>
      <button className={styles.button} type="button" onClick={onStart}>
        Lernangebot beginnen
      </button>
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
  const [artifactPreparationComplete, setArtifactPreparationComplete] = useState(false);
  const { context } = snapshot;
  const completeArtifact = useCallback(() => send({ type: 'ARTIFACT_COMPLETED' }), [send]);
  const segmentTimingPort = useMemo(() => {
    if (context.sessionId === null || context.condition !== 'supportive') return null;
    return new BrowserSegmentTimingAdapter(api.createSegmentTimingPort(context.sessionId));
  }, [api, context.condition, context.sessionId]);
  const artifactVisible =
    snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } }) ||
    snapshot.matches({ artifactLifecycle: { artifact: 'reference' } });

  useEffect(() => {
    if (!artifactVisible) setArtifactPreparationComplete(false);
  }, [artifactVisible]);

  let content: ReactNode;
  let step = 'Einwilligung';

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
        eyebrow="Vor dem Lernangebot"
        title="Fragebogen vor dem Artefakt"
        description="Beantworte die Fragen in diesem Abschnitt und bestätige anschließend deine Eingabe."
        submitLabel="Antwort speichern"
        onSubmit={() => send({ type: 'SUBMIT_PRE' })}
      />
    );
    step = 'Vorher';
  } else if (snapshot.matches({ artifactLifecycle: 'startError' })) {
    content = (
      <ResearchDataError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_START' })}
      />
    );
    step = 'Artefakt';
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } })) {
    if (segmentTimingPort === null) {
      throw new Error('missing-segment-timing-port');
    }
    content = artifactPreparationComplete ? (
      <SupportiveArtifact
        onComplete={completeArtifact}
        timingPort={segmentTimingPort}
        timingError={
          context.artifactTimingErrorKind === 'visibility' ? context.researchErrorCode : null
        }
        onRetryTiming={() => send({ type: 'RETRY_ARTIFACT_VISIBILITY' })}
      />
    ) : (
      <ArtifactPreparation
        condition="supportive"
        onStart={() => setArtifactPreparationComplete(true)}
      />
    );
    step = 'Artefakt';
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'reference' } })) {
    content = artifactPreparationComplete ? (
      <ReferenceArtifact onComplete={completeArtifact} />
    ) : (
      <ArtifactPreparation
        condition="reference"
        onStart={() => setArtifactPreparationComplete(true)}
      />
    );
    step = 'Artefakt';
  } else if (snapshot.matches({ artifactLifecycle: 'endError' })) {
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
        eyebrow="Nach dem Lernangebot"
        title="Fragebogen nach dem Artefakt"
        description="Beantworte die Fragen zu deinen Eindrücken und bestätige anschließend deine Eingabe."
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
        eyebrow="Verständnis"
        title="Verständnis prüfen"
        description="Beantworte die Verständnisfragen und bestätige anschließend deine Eingabe."
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
          Lies die abschließenden Hinweise aufmerksam. Erst deine Bestätigung schließt die Sitzung
          ab.
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
          Gesamtzeit im Artefakt: <strong>{Math.round((context.artifactWallClockMs ?? 0) / 1000)} s</strong>
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

  if (artifactVisible) {
    return (
      <main className={styles.artifactSurface} data-artifact-surface="">
        {content}
      </main>
    );
  }

  return (
    <main className={styles.studyPage} data-study-surface="">
      <div className={styles.studyShell}>
        <header className={styles.studyHeader}>
          <strong>Studienteilnahme</strong>
          <span className={styles.step} aria-live="polite">
            {step}
          </span>
        </header>
        <div className={styles.studyContent}>{content}</div>
      </div>
    </main>
  );
}
