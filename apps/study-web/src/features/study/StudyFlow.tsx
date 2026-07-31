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
const participantInformation = instrumentRuntimeManifest.procedures.participantInformation;
const recontactProcedure = instrumentRuntimeManifest.procedures.followUpRecontact;
const sessionClosure = instrumentRuntimeManifest.procedures.sessionClosure;

function FactIcon({ factId }: { readonly factId: string }) {
  if (factId === 'duration') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3.25 2" />
      </svg>
    );
  }

  if (factId === 'analysis') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5.5 18.5V13m4.25 5.5V9.75M14 18.5v-7.25m4.25 7.25V6.5" />
        <path d="M4 18.5h16" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="6.5" width="16" height="11" rx="1.5" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function InformationIcon() {
  return (
    <span className={styles.informationIcon} aria-hidden="true">
      i
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className={styles.buttonIcon} viewBox="0 0 24 24">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

interface ConsentDecision {
  readonly followUpConsent: boolean;
  readonly recontact: {
    readonly email: string;
    readonly requestId: string;
  } | null;
}

function DisclosureSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = `participant-information-${title.toLowerCase().replaceAll(/[^a-z]+/gu, '-')}`;

  return (
    <section className={styles.informationSection}>
      <h3>
        <button
          className={styles.disclosureButton}
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((current) => !current)}
        >
          <span className={styles.disclosureHeading}>
            <InformationIcon />
            <span>{title}</span>
          </span>
        </button>
      </h3>
      <div id={id} hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}

function Consent({ onAccept }: { readonly onAccept: (decision: ConsentDecision) => void }) {
  const eligibilityItems = instrumentRuntimeManifest.procedures.eligibility.items;
  const [eligibilityDraft, setEligibilityDraft] = useState<Readonly<Record<string, boolean>>>({});
  const [accepted, setAccepted] = useState(false);
  const [informationVisible, setInformationVisible] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [wantsRecontact, setWantsRecontact] = useState(false);
  const [email, setEmail] = useState('');
  const [eligibilityInteracted, setEligibilityInteracted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const eligible = eligibilityItems.every(
    (item) => eligibilityDraft[item.id] === item.requiredValue,
  );
  const emailValid = !wantsRecontact || recontactEmailSchema.safeParse(email).success;
  const showEligibilityNotice = eligibilityInteracted && !eligible;
  const showEmailError = wantsRecontact && emailTouched && !emailValid;

  if (declined) {
    return (
      <section className={styles.declineNotice} aria-labelledby="declined-title" role="status">
        <p className={styles.eyebrow}>{participantInformation.eyebrow}</p>
        <h1 id="declined-title" tabIndex={-1} autoFocus>
          {participantInformation.actions.declineHeading}
        </h1>
        <p>{participantInformation.actions.declineBody}</p>
      </section>
    );
  }

  return (
    <section className={styles.consentPage} aria-labelledby="consent-title">
      <header className={styles.welcomeHeader}>
        <p className={styles.eyebrow}>{participantInformation.eyebrow}</p>
        <h1 id="consent-title" tabIndex={-1} autoFocus>
          {participantInformation.welcomeHeading}
        </h1>
        {participantInformation.welcomeParagraphs.map((paragraph) => (
          <p className={styles.welcomeCopy} key={paragraph}>
            {paragraph}
          </p>
        ))}
        <div className={styles.factCards} aria-label="Kurzüberblick zur Teilnahme">
          {participantInformation.facts.map((fact) => (
            <article className={styles.factCard} key={fact.id}>
              <span className={styles.factIcon}>
                <FactIcon factId={fact.id} />
              </span>
              <div>
                <h2>{fact.label}</h2>
                <p>{fact.value}</p>
              </div>
            </article>
          ))}
        </div>
        {!informationVisible ? (
          <button
            className={styles.button}
            type="button"
            onClick={() => setInformationVisible(true)}
          >
            {participantInformation.readMoreLabel}
            <ArrowIcon />
          </button>
        ) : null}
      </header>

      {informationVisible ? (
        <form
          className={styles.consentDetails}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (accepted && eligible && emailValid) {
              onAccept({
                followUpConsent: wantsRecontact,
                recontact: wantsRecontact
                  ? { email: email.trim(), requestId: globalThis.crypto.randomUUID() }
                  : null,
              });
            }
          }}
        >
          <div className={styles.consentColumn}>
            <section aria-labelledby="participant-information-title">
              <h2 id="participant-information-title">
                {participantInformation.informationHeading}
              </h2>
              <div className={styles.disclosureList}>
                {participantInformation.sections.map((section) => (
                  <DisclosureSection key={section.id} title={section.heading}>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </DisclosureSection>
                ))}
              </div>
            </section>

            <fieldset
              className={
                showEligibilityNotice
                  ? `${styles.consentPanel} ${styles.fieldInvalid}`
                  : styles.consentPanel
              }
              aria-describedby={
                showEligibilityNotice ? 'eligibility-error' : 'eligibility-description'
              }
              aria-invalid={showEligibilityNotice}
            >
              <legend>Teilnahmevoraussetzungen</legend>
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
                        setEligibilityInteracted(true);
                        setEligibilityDraft((current) => ({ ...current, [item.id]: checked }));
                      }}
                    />
                    <span>{item.prompt}</span>
                  </label>
                ))}
              </div>
              {showEligibilityNotice ? (
                <p className={styles.fieldError} id="eligibility-error" role="alert">
                  Eine Teilnahme ist nicht möglich, wenn eine Voraussetzung nicht erfüllt ist. Es
                  wurde keine Sitzung angelegt.
                </p>
              ) : null}
            </fieldset>
          </div>

          <div className={styles.consentColumn}>
            <fieldset className={styles.consentPanel}>
              <legend>{participantInformation.requiredConsent.legend}</legend>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.currentTarget.checked)}
                />
                <span>{participantInformation.requiredConsent.statement}</span>
              </label>
            </fieldset>

            <fieldset className={styles.consentPanel}>
              <legend>{recontactProcedure.consentLegend}</legend>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={wantsRecontact}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setWantsRecontact(checked);
                    if (!checked) {
                      setEmail('');
                      setEmailTouched(false);
                    }
                  }}
                />
                <span>{recontactProcedure.consentStatement}</span>
              </label>
              {wantsRecontact ? (
                <label className={styles.emailField}>
                  <span>{recontactProcedure.emailLabel}</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={showEmailError}
                    aria-describedby={showEmailError ? 'recontact-email-error' : undefined}
                    onBlur={() => setEmailTouched(true)}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    required
                  />
                  {showEmailError ? (
                    <span className={styles.fieldError} id="recontact-email-error" role="alert">
                      Bitte gib eine gültige E-Mail-Adresse ein.
                    </span>
                  ) : null}
                </label>
              ) : null}
            </fieldset>
          </div>

          <div className={styles.consentActions}>
            <button
              className={styles.button}
              type="submit"
              disabled={!accepted || !eligible || !emailValid}
            >
              {participantInformation.actions.acceptLabel}
              <ArrowIcon />
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setDeclined(true)}
            >
              {participantInformation.actions.declineLabel}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function RecontactError({
  errorCode,
  onRetry,
  onContinueWithoutFollowUp,
}: {
  readonly errorCode: string | null;
  readonly onRetry: () => void;
  readonly onContinueWithoutFollowUp: () => void;
}) {
  return (
    <section aria-labelledby="recontact-error-title" role="alert">
      <h1 id="recontact-error-title" tabIndex={-1} autoFocus>
        Registrierung nicht möglich
      </h1>
      <p>
        Die E-Mail-Adresse konnte nicht für die optionale Nachbefragung registriert werden. Du
        kannst es erneut versuchen oder die Hauptstudie ohne Nachbefragung fortsetzen.
      </p>
      <p className={styles.errorCode}>Fehlercode: {errorCode ?? 'recontact-registration-failed'}</p>
      <div className={styles.form}>
        <button className={styles.button} type="button" onClick={onRetry}>
          Erneut versuchen
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={onContinueWithoutFollowUp}
        >
          Ohne Nachbefragung fortfahren
        </button>
      </div>
    </section>
  );
}

function SupportiveArtifact({
  timingPort,
  timingError,
  onRetryTiming,
}: {
  readonly timingPort: BrowserSegmentTimingAdapter;
  readonly timingError: string | null;
  readonly onRetryTiming: () => void;
}) {
  return (
    <PasswordModuleTraining
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
        onContinueWithoutFollowUp={() => send({ type: 'CONTINUE_WITHOUT_FOLLOW_UP' })}
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
          title="Fragebogen vor dem Lernangebot"
          currentSection={sectionIndex + 1}
          sectionCount={preInstrument.sections.length}
          onSubmit={(payload) => send({ type: 'SUBMIT_PRE', payload })}
        />
      );
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
  } else if (snapshot.matches({ artifactLifecycle: 'startError' })) {
    content = (
      <ResearchDataError
        titleId="artifact-start-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_START' })}
      />
    );
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } })) {
    content =
      segmentTimingPort === null ? (
        <ConfigurationError errorCode="missing-segment-timing-port" />
      ) : (
        <SupportiveArtifact
          timingPort={segmentTimingPort}
          timingError={
            context.artifactTimingErrorKind === 'visibility' ? context.researchErrorCode : null
          }
          onRetryTiming={() => send({ type: 'RETRY_ARTIFACT_VISIBILITY' })}
        />
      );
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'reference' } })) {
    content = <ReferenceArtifact onComplete={completeArtifact} />;
  } else if (snapshot.matches({ artifactLifecycle: 'endError' })) {
    content = (
      <ResearchDataError
        titleId="artifact-end-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_ARTIFACT_END' })}
      />
    );
  } else if (snapshot.matches({ postQuestionnaire: 'error' })) {
    content = (
      <ResearchDataError
        titleId="post-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_POST' })}
      />
    );
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
          title="Fragebogen nach dem Lernangebot"
          currentSection={sectionIndex + 1}
          sectionCount={postInstrument.sections.length}
          onSubmit={(payload) => send({ type: 'SUBMIT_POST', payload })}
        />
      );
  } else if (snapshot.matches({ guardrails: 'error' })) {
    content = (
      <ResearchDataError
        titleId="guardrail-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_GUARDRAILS' })}
      />
    );
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
  } else if (snapshot.matches({ postOpen: 'error' })) {
    content = (
      <ResearchDataError
        titleId="post-open-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_POST_OPEN' })}
      />
    );
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
  } else if (snapshot.matches('sessionClosure')) {
    const closureContent = context.followUpConsent
      ? sessionClosure.deferredDebriefWithFollowUp
      : sessionClosure.immediateDebriefWithoutFollowUp;
    content = (
      <section className={styles.sessionClosure} aria-labelledby="session-closure-title">
        <h1 id="session-closure-title" tabIndex={-1} autoFocus>
          {closureContent.heading}
        </h1>
        {closureContent.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className={styles.form}>
          <button
            className={styles.button}
            type="button"
            onClick={() => send({ type: 'SESSION_CLOSURE_ACKNOWLEDGED' })}
          >
            {closureContent.actionLabel}
          </button>
        </div>
      </section>
    );
  } else if (snapshot.matches('completionError')) {
    content = (
      <ResearchDataError
        titleId="completion-error-title"
        errorCode={context.researchErrorCode}
        onRetry={() => send({ type: 'RETRY_COMPLETION' })}
      />
    );
  } else if (snapshot.matches('complete')) {
    content = (
      <section className={styles.sessionComplete} aria-labelledby="complete-title">
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
  } else if (snapshot.matches('fatalError')) {
    content = (
      <section aria-labelledby="fatal-title" role="alert">
        <h1 id="fatal-title" tabIndex={-1} autoFocus>
          Die Sitzung kann nicht fortgesetzt werden
        </h1>
        <p className={styles.errorCode}>Fehlercode: {context.fatalErrorCode}</p>
      </section>
    );
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
        <div className={styles.studyContent}>{content}</div>
      </div>
    </main>
  );
}
