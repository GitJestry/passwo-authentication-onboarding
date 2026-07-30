import {
  instrumentRuntimeManifest,
  mainInstrumentBlocks,
  recontactEmailSchema,
} from '@passwo/contracts';
import { createStudyMachine } from '@passwo/study-engine';
import { useMachine } from '@xstate/react';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { BrowserSegmentTimingAdapter } from '../../adapters/animation/BrowserSegmentTimingAdapter.js';
import { createStudyApi } from '../../api/study-api.js';
import { ReferenceArtifact } from '../reference/ReferenceArtifact.js';
import { PasswordModuleTraining } from '../training/PasswordModuleTraining.js';
import { GuardrailBlockForm, PostOpenForm, QuestionnaireSectionForm } from './InstrumentForm.js';
import styles from './StudyFlow.module.css';

const preInstrument = instrumentRuntimeManifest.instruments['pre-v1'];
const postInstrument = instrumentRuntimeManifest.instruments['post-v1'];
const guardrailInstrument = instrumentRuntimeManifest.instruments['guardrail-v2'];

interface ConsentDecision {
  readonly email: string;
  readonly requestId: string;
}

function Consent({ onAccept }: { readonly onAccept: (decision: ConsentDecision) => void }) {
  const eligibilityItems = instrumentRuntimeManifest.procedures.eligibility.items;
  const [eligibilityDraft, setEligibilityDraft] = useState<Readonly<Record<string, boolean>>>({});
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const eligible = eligibilityItems.every(
    (item) => eligibilityDraft[item.id] === item.requiredValue,
  );
  const emailValid = recontactEmailSchema.safeParse(email).success;
  const consent = instrumentRuntimeManifest.procedures.consent;
  const followUpRecontact = instrumentRuntimeManifest.procedures.followUpRecontact;

  return (
    <section aria-labelledby="consent-title">
      <p className={styles.eyebrow}>Einwilligung</p>
      <h1 id="consent-title" tabIndex={-1} autoFocus>
        Willkommen
      </h1>
      <p>
        Im folgenden Ablauf werden keine realen Passwörter, Konten oder Sicherheitsvorfälle
        abgefragt. Bitte lies die Hinweise vollständig, bevor du fortfährst.
      </p>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmissionAttempted(true);
          if (accepted && eligible && emailValid) {
            onAccept({
              email: email.trim(),
              requestId: globalThis.crypto.randomUUID(),
            });
          }
        }}
      >
        <fieldset
          className={
            submissionAttempted && !eligible
              ? `${styles.eligibility} ${styles.fieldInvalid}`
              : styles.eligibility
          }
          aria-describedby={
            submissionAttempted && !eligible ? 'eligibility-error' : 'eligibility-description'
          }
          aria-invalid={submissionAttempted && !eligible}
        >
          <legend>Voraussetzungen für die Teilnahme</legend>
          <p className={styles.fieldHint} id="eligibility-description">
            Bitte bestätige jede Voraussetzung, die auf dich zutrifft.
          </p>
          <div className={styles.optionList}>
            {eligibilityItems.map((item) => (
              <label className={styles.option} key={item.id}>
                <input
                  type="checkbox"
                  id={item.id}
                  name={item.id}
                  checked={eligibilityDraft[item.id] === true}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setEligibilityDraft((current) => ({ ...current, [item.id]: checked }));
                  }}
                />
                <span>{item.prompt}</span>
              </label>
            ))}
          </div>
          {submissionAttempted && !eligible ? (
            <p className={styles.fieldError} id="eligibility-error" role="alert">
              Eine Teilnahme ist nur möglich, wenn alle drei Voraussetzungen erfüllt sind. Es wurde
              keine Sitzung angelegt.
            </p>
          ) : null}
        </fieldset>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.currentTarget.checked)}
          />
          <span>{consent.statement}</span>
        </label>
        <fieldset className={styles.eligibility}>
          <legend>{followUpRecontact.heading}</legend>
          <p className={styles.fieldHint}>{followUpRecontact.explanation}</p>
          <label className={styles.emailField}>
            <span>{followUpRecontact.emailLabel}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={submissionAttempted && !emailValid}
              aria-describedby={
                submissionAttempted && !emailValid ? 'recontact-email-error' : undefined
              }
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
            {submissionAttempted && !emailValid ? (
              <span className={styles.fieldError} id="recontact-email-error" role="alert">
                Bitte gib eine gültige E-Mail-Adresse ein.
              </span>
            ) : null}
          </label>
        </fieldset>
        <button
          className={styles.button}
          type="submit"
          disabled={!accepted || !eligible || !emailValid}
        >
          Weiter zum Fragebogen
        </button>
      </form>
    </section>
  );
}

function RecontactError({
  errorCode,
  onRetry,
}: {
  readonly errorCode: string | null;
  readonly onRetry: () => void;
}) {
  return (
    <section aria-labelledby="recontact-error-title" role="alert">
      <p className={styles.eyebrow}>Nachbefragung nach zehn Tagen</p>
      <h1 id="recontact-error-title" tabIndex={-1} autoFocus>
        Registrierung nicht möglich
      </h1>
      <p>
        Die Teilnahme bleibt gesperrt, bis die E-Mail-Adresse erfolgreich registriert wurde.
      </p>
      <p className={styles.errorCode}>Fehlercode: {errorCode ?? 'recontact-registration-failed'}</p>
      <div className={styles.form}>
        <button className={styles.button} type="button" onClick={onRetry}>
          Erneut versuchen
        </button>
      </div>
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
        <h1 id="artifact-preparation-title" tabIndex={-1} autoFocus>
          Das Lernangebot beginnt gleich
        </h1>
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
  titleId,
  errorCode,
  onRetry,
}: {
  readonly titleId: string;
  readonly errorCode: string | null;
  readonly onRetry: () => void;
}) {
  return (
    <section aria-labelledby={titleId} role="alert">
      <p className={styles.eyebrow}>Technische Unterbrechung</p>
      <h1 id={titleId} tabIndex={-1} autoFocus>
        Speichern nicht möglich
      </h1>
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

function ConfigurationError({ errorCode }: { readonly errorCode: string }) {
  return (
    <section aria-labelledby="configuration-error-title" role="alert">
      <p className={styles.eyebrow}>Technische Unterbrechung</p>
      <h1 id="configuration-error-title" tabIndex={-1} autoFocus>
        Dieser Studienteil ist nicht verfügbar
      </h1>
      <p className={styles.errorCode}>Fehlercode: {errorCode}</p>
    </section>
  );
}

export function StudyFlow() {
  const api = useMemo(() => createStudyApi(), []);
  const machine = useMemo(() => createStudyMachine(api), [api]);
  const [snapshot, send] = useMachine(machine);
  const { context } = snapshot;
  const currentBlock = mainInstrumentBlocks[context.instrumentBlockCursor];
  const completeArtifact = useCallback(() => send({ type: 'ARTIFACT_COMPLETED' }), [send]);
  const segmentTimingPort = useMemo(() => {
    if (context.sessionId === null || context.condition !== 'supportive') return null;
    return new BrowserSegmentTimingAdapter(api.createSegmentTimingPort(context.sessionId));
  }, [api, context.condition, context.sessionId]);
  const artifactVisible =
    snapshot.matches({ artifactLifecycle: 'preparing' }) ||
    snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } }) ||
    snapshot.matches({ artifactLifecycle: { artifact: 'reference' } });

  let content: ReactNode;
  let step = snapshot.matches('preQuestionnaire')
    ? 'Vorher'
    : snapshot.matches('artifactLifecycle')
      ? 'Lernangebot'
      : snapshot.matches('postQuestionnaire')
        ? 'Nachher'
        : snapshot.matches('guardrails')
          ? 'Verständnis'
          : snapshot.matches('postOpen')
            ? 'Rückmeldung'
            : snapshot.matches('debrief') ||
                snapshot.matches('completing') ||
                snapshot.matches('completionError')
              ? 'Abschluss'
              : snapshot.matches('complete')
                ? 'Fertig'
                : snapshot.matches('recontactRegistration')
                  ? 'Nachbefragung'
                  : 'Einwilligung';

  if (snapshot.matches('consent')) {
    content = <Consent onAccept={(decision) => send({ type: 'ACCEPT_CONSENT', ...decision })} />;
  } else if (snapshot.matches('sessionError')) {
    content = (
      <ResearchDataError
        titleId="session-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_SESSION' })}
      />
    );
  } else if (snapshot.matches({ recontactRegistration: 'error' })) {
    content = (
      <RecontactError
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_RECONTACT' })}
      />
    );
  } else if (snapshot.matches({ preQuestionnaire: 'error' })) {
    content = (
      <ResearchDataError
        titleId="pre-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_PRE' })}
      />
    );
    step = 'Vorher';
  } else if (snapshot.matches({ preQuestionnaire: 'editing' })) {
    const section =
      currentBlock?.instrumentId === 'pre-v1'
        ? preInstrument.sections.find((candidate) => candidate.id === currentBlock.sectionId)
        : undefined;
    const sectionIndex =
      section === undefined
        ? -1
        : preInstrument.sections.findIndex((candidate) => candidate.id === section.id);
    content =
      section === undefined || sectionIndex < 0 ? (
        <ConfigurationError errorCode="pre-instrument-cursor-invalid" />
      ) : (
        <QuestionnaireSectionForm
          key={`pre-v1:${section.id}`}
          instrumentId="pre-v1"
          section={section}
          eyebrow="Vor dem Lernangebot"
          title="Fragebogen vor dem Lernangebot"
          progressLabel={`Abschnitt ${sectionIndex + 1} von ${preInstrument.sections.length}`}
          submitLabel="Abschnitt verbindlich abgeben"
          onSubmit={(payload) => send({ type: 'SUBMIT_PRE', payload })}
        />
      );
    step = `Vorher · ${Math.max(sectionIndex + 1, 1)}/${preInstrument.sections.length}`;
  } else if (snapshot.matches({ artifactLifecycle: 'preparing' })) {
    content =
      context.condition === null ? (
        <ConfigurationError errorCode="missing-condition" />
      ) : (
        <ArtifactPreparation
          condition={context.condition}
          onStart={() => send({ type: 'START_ARTIFACT' })}
        />
      );
    step = 'Lernangebot';
  } else if (snapshot.matches({ artifactLifecycle: 'startError' })) {
    content = (
      <ResearchDataError
        titleId="artifact-start-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_START' })}
      />
    );
    step = 'Lernangebot';
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } })) {
    content =
      segmentTimingPort === null ? (
        <ConfigurationError errorCode="missing-segment-timing-port" />
      ) : (
        <SupportiveArtifact
          onComplete={completeArtifact}
          timingPort={segmentTimingPort}
          timingError={
            context.artifactTimingErrorKind === 'visibility' ? context.researchErrorCode : null
          }
          onRetryTiming={() => send({ type: 'RETRY_ARTIFACT_VISIBILITY' })}
        />
      );
    step = 'Lernangebot';
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'reference' } })) {
    content = <ReferenceArtifact onComplete={completeArtifact} />;
    step = 'Lernangebot';
  } else if (snapshot.matches({ artifactLifecycle: 'endError' })) {
    content = (
      <ResearchDataError
        titleId="artifact-end-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_END' })}
      />
    );
    step = 'Lernangebot';
  } else if (snapshot.matches({ postQuestionnaire: 'error' })) {
    content = (
      <ResearchDataError
        titleId="post-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_POST' })}
      />
    );
    step = 'Nachher';
  } else if (snapshot.matches({ postQuestionnaire: 'editing' })) {
    const section =
      currentBlock?.instrumentId === 'post-v1'
        ? postInstrument.sections.find((candidate) => candidate.id === currentBlock.sectionId)
        : undefined;
    const sectionIndex =
      section === undefined
        ? -1
        : postInstrument.sections.findIndex((candidate) => candidate.id === section.id);
    content =
      section === undefined || sectionIndex < 0 ? (
        <ConfigurationError errorCode="post-instrument-cursor-invalid" />
      ) : (
        <QuestionnaireSectionForm
          key={`post-v1:${section.id}`}
          instrumentId="post-v1"
          section={section}
          eyebrow="Nach dem Lernangebot"
          title="Fragebogen nach dem Lernangebot"
          progressLabel={`Abschnitt ${sectionIndex + 1} von ${postInstrument.sections.length}`}
          submitLabel="Abschnitt verbindlich abgeben"
          onSubmit={(payload) => send({ type: 'SUBMIT_POST', payload })}
        />
      );
    step = `Nachher · ${Math.max(sectionIndex + 1, 1)}/${postInstrument.sections.length}`;
  } else if (snapshot.matches({ guardrails: 'error' })) {
    content = (
      <ResearchDataError
        titleId="guardrail-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_GUARDRAILS' })}
      />
    );
    step = 'Verständnis';
  } else if (snapshot.matches({ guardrails: 'editing' })) {
    const block =
      currentBlock?.instrumentId === 'guardrail-v2'
        ? guardrailInstrument.blocks.find((candidate) => candidate.id === currentBlock.sectionId)
        : undefined;
    const blockIndex =
      block === undefined
        ? -1
        : guardrailInstrument.blocks.findIndex((candidate) => candidate.id === block.id);
    content =
      block === undefined || blockIndex < 0 || context.guardrailFormId === null ? (
        <ConfigurationError errorCode="guardrail-instrument-cursor-invalid" />
      ) : (
        <GuardrailBlockForm
          key={`guardrail-v2:${block.id}`}
          block={block}
          formId={context.guardrailFormId}
          blockNumber={blockIndex + 1}
          blockCount={guardrailInstrument.blocks.length}
          onSubmit={(payload) => send({ type: 'SUBMIT_GUARDRAILS', payload })}
        />
      );
    step = `Verständnis · ${Math.max(blockIndex + 1, 1)}/${guardrailInstrument.blocks.length}`;
  } else if (snapshot.matches({ postOpen: 'error' })) {
    content = (
      <ResearchDataError
        titleId="post-open-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_POST_OPEN' })}
      />
    );
    step = 'Rückmeldung';
  } else if (snapshot.matches({ postOpen: 'editing' })) {
    content =
      currentBlock?.instrumentId !== 'post-open-v1' || currentBlock.sectionId !== 'post-open' ? (
        <ConfigurationError errorCode="post-open-instrument-cursor-invalid" />
      ) : (
        <PostOpenForm
          key="post-open-v1:post-open"
          onSubmit={(payload) => send({ type: 'SUBMIT_POST_OPEN', payload })}
        />
      );
    step = 'Rückmeldung';
  } else if (snapshot.matches('debrief')) {
    content = (
      <section aria-labelledby="debrief-title">
        <p className={styles.eyebrow}>Debrief</p>
        <h1 id="debrief-title" tabIndex={-1} autoFocus>
          Abschließende Hinweise
        </h1>
        <ul className={styles.debriefList}>
          <li>
            Wird ein wiederverwendetes Passwort bekannt, kann es auch bei weiteren Konten
            ausprobiert werden.
          </li>
          <li>
            Ein Passwortmanager unterstützt dich dabei, für unterschiedliche Konten unterschiedliche
            Passwörter zu verwenden.
          </li>
          <li>
            MFA bildet eine zusätzliche Barriere. Sie macht Passwortwiederverwendung nicht sicher.
          </li>
        </ul>
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
        titleId="completion-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_COMPLETION' })}
      />
    );
    step = 'Abschluss';
  } else if (snapshot.matches('complete')) {
    content = (
      <section aria-labelledby="complete-title">
        <p className={styles.eyebrow}>Abgeschlossen</p>
        <h1 id="complete-title" tabIndex={-1} autoFocus>
          Sitzung abgeschlossen
        </h1>
        <p>
          Sitzungscode: <strong>{context.participantCode}</strong>
        </p>
        {context.artifactWallClockMs === null ? null : (
          <p>
            Gesamtzeit im Lernangebot:{' '}
            <strong>{Math.round(context.artifactWallClockMs / 1000)} s</strong>
          </p>
        )}
      </section>
    );
    step = 'Fertig';
  } else if (snapshot.matches('fatalError')) {
    content = (
      <section aria-labelledby="fatal-title" role="alert">
        <p className={styles.eyebrow}>Technischer Abbruch</p>
        <h1 id="fatal-title" tabIndex={-1} autoFocus>
          Die Sitzung kann nicht fortgesetzt werden
        </h1>
        <p className={styles.errorCode}>Fehlercode: {context.fatalErrorCode}</p>
      </section>
    );
    step = 'Abbruch';
  } else {
    content = (
      <div className={styles.loading} role="status">
        Forschungsdaten werden gespeichert …
      </div>
    );
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
