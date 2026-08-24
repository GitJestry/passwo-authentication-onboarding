import {
  type DeletionCode,
  immediatePostSectionIds,
  instrumentRuntimeManifest,
  mainInstrumentBlocks,
  postGuardrailSectionIds,
  recontactEmailSchema,
  referenceArtifactLessonCheckpointIdSchema,
  referenceLessonCheckpointSchema,
  supportiveArtifactSegmentIdSchema,
  supportiveResumeSegmentFor,
  supportiveCheckpointSchema,
  type ReferenceArtifactLessonCheckpointId,
  type WebResumeSession,
} from '@passwo/contracts';
import { createStudyMachine } from '@passwo/study-engine';
import { ArtifactViewport } from '@passwo/ui';
import { useMachine } from '@xstate/react';
import {
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BrowserSegmentTimingAdapter } from '../../adapters/timing/BrowserSegmentTimingAdapter.js';
import { createStudyApi, type StudyApi } from '../../api/study-api.js';
import { scheduleIdleWork } from '../../app/idle-prefetch.js';
import {
  loadReferenceArtifactRenderer,
  loadSupportiveArtifactRenderer,
  preloadSupportiveArtifactRuntime,
} from '../artifact-loaders.js';
import {
  cancelReferenceArtifactPrefetch,
  prefetchReferenceArtifact,
} from '../reference/reference-prefetch.js';
import { TrainingClipboardBoundary } from '../training/TrainingClipboardBoundary.js';
import { GuardrailBlockForm, QuestionnaireSectionForm } from './InstrumentForm.js';
import styles from './StudyFlow.module.css';

const ReferenceArtifact = lazy(async () => {
  const module = await loadReferenceArtifactRenderer();
  return { default: module.ReferenceArtifact };
});
const PasswordModuleTraining = lazy(async () => {
  const module = await loadSupportiveArtifactRenderer();
  return { default: module.PasswordModuleTraining };
});

function ArtifactRendererLoadingBoundary() {
  return (
    <div className={styles.loading} role="status" aria-busy="true">
      Das Lernangebot beginnt gleich
    </div>
  );
}

const preInstrument = instrumentRuntimeManifest.instruments['pre-v1'];
const postInstrument = instrumentRuntimeManifest.instruments['post-v1'];
const guardrailInstrument = instrumentRuntimeManifest.instruments['guardrail-v2'];
const participantInformation = instrumentRuntimeManifest.procedures.participantInformation;
const recontactProcedure = instrumentRuntimeManifest.procedures.followUpRecontact;
const sessionClosure = instrumentRuntimeManifest.procedures.sessionClosure;
const preQuestionnaireProgressSteps = [
  {
    label: 'Vorfragebogen',
    pageCount: preInstrument.sections.length,
    pageLabels: ['Hintergrund', 'Vorerfahrungen'],
  },
] as const;
const postQuestionnaireProgressSteps = [
  { label: 'Rückblick', pageCount: immediatePostSectionIds.length },
  { label: 'Kontosituationen', pageCount: 1 },
  { label: 'Inhaltsfragen', pageCount: 1 },
  { label: 'Abschluss', pageCount: postGuardrailSectionIds.length },
] as const;
const guardrailProgressByBlock = {
  scenarios: {
    progressCurrent: 2,
    sectionHeading: 'Fragen zu Kontosituationen',
    submitLabel: 'Weiter zu den Inhaltsfragen',
  },
  recognition: {
    progressCurrent: 3,
    sectionHeading: 'Fragen zu den Inhalten',
    submitLabel: 'Weiter zu den Abschlussfragen',
  },
} as const;

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

function EssentialSummaryItem({ text }: { readonly text: string }) {
  const separatorIndex = text.indexOf(':');
  if (separatorIndex < 1) return <>{text}</>;

  const label = text.slice(0, separatorIndex).trim();
  const body = text.slice(separatorIndex + 1).trim();

  if (label === 'Optionale Nachbefragung') {
    return (
      <>
        <strong>{label}:</strong>
        <span>{body}</span>
      </>
    );
  }

  return (
    <>
      <strong>{label}:</strong>{' '}
      <span>{body}</span>
    </>
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

function ParticipantInformationSections() {
  return (
    <div className={styles.disclosureList}>
      {participantInformation.sections.map((section) => (
        <DisclosureSection key={section.id} title={section.heading}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </DisclosureSection>
      ))}
    </div>
  );
}

function ParticipantInformationAccess({
  deletionCode,
  placement,
}: {
  readonly deletionCode: DeletionCode | null;
  readonly placement: 'footer' | 'inline';
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div
      className={
        placement === 'footer'
          ? styles.questionnaireFooter
          : styles.participantInformationInline
      }
    >
      {placement === 'footer' ? <>© Universität Bonn · </> : null}
      <button
        className={styles.participantInformationTrigger}
        type="button"
        aria-haspopup="dialog"
        aria-label={placement === 'footer' ? 'Teilnahmeinformationen öffnen' : undefined}
        onClick={() => dialogRef.current?.showModal()}
      >
        {placement === 'footer' ? 'Teilnahmeinformationen' : participantInformation.readMoreLabel}
      </button>
      <dialog
        ref={dialogRef}
        className={styles.participantInformationDialog}
        aria-labelledby="participant-information-dialog-title"
      >
        <div className={styles.participantInformationDialogHeader}>
          <h2 id="participant-information-dialog-title">
            {participantInformation.informationHeading}
          </h2>
          <button
            className={styles.participantInformationDialogClose}
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Schließen
          </button>
        </div>
        <div className={styles.participantInformationDialogBody}>
          {deletionCode === null ? null : (
            <p>
              Dein Löschcode lautet <strong>{deletionCode}</strong>. Bewahre ihn auf, wenn du
              später die Löschung deiner Forschungsdaten anfragen möchtest.
            </p>
          )}
          <ParticipantInformationSections />
        </div>
      </dialog>
    </div>
  );
}

function Consent({ onAccept }: { readonly onAccept: (decision: ConsentDecision) => void }) {
  const eligibilityItems = instrumentRuntimeManifest.procedures.eligibility.items;
  const [eligibilityDraft, setEligibilityDraft] = useState<Readonly<Record<string, boolean>>>({});
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [wantsRecontact, setWantsRecontact] = useState(false);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const eligible = eligibilityItems.every(
    (item) => eligibilityDraft[item.id] === item.requiredValue,
  );
  const emailValid = !wantsRecontact || recontactEmailSchema.safeParse(email).success;
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
        <h1 id="consent-title" tabIndex={-1} autoFocus>
          {participantInformation.welcomeHeading}
        </h1>
        {participantInformation.welcomeParagraphs.map((paragraph) => (
          <p className={styles.welcomeCopy} key={paragraph}>
            {paragraph}
          </p>
        ))}
      </header>

      <form
        className={styles.consentDetails}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (accepted && eligible && emailValid) {
            onAccept({
              followUpConsent: wantsRecontact,
              recontact: wantsRecontact
                ? {
                    email: email.trim(),
                    requestId: globalThis.crypto.randomUUID(),
                  }
                : null,
            });
          }
        }}
      >
        <div className={styles.consentColumn}>
          <section aria-labelledby="participant-information-summary-title">
            <div className={styles.essentialInformation}>
              <h2 id="participant-information-summary-title">
                {participantInformation.essentialSummaryHeading}
              </h2>
              <ul className={styles.essentialSummaryList}>
                {participantInformation.essentialSummaryParagraphs.map((paragraph) => (
                  <li key={paragraph}>
                    <EssentialSummaryItem text={paragraph} />
                  </li>
                ))}
              </ul>
            </div>
            <ParticipantInformationAccess deletionCode={null} placement="inline" />
          </section>
        </div>

        <div className={`${styles.consentColumn} ${styles.consentColumnRight}`}>
          <fieldset className={styles.consentPanel}>
            <legend>Teilnahmevoraussetzungen</legend>
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
                      setEligibilityDraft((current) => ({
                        ...current,
                        [item.id]: checked,
                      }));
                    }}
                  />
                  <span>{item.prompt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.consentPanel}>
            <legend>{participantInformation.requiredConsent.legend}</legend>
            <label className={styles.consentStatementCheck}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.currentTarget.checked)}
              />
              <span>{participantInformation.requiredConsent.statement}</span>
            </label>
          </fieldset>

          <section
            className={styles.recontactConsentBlock}
            aria-labelledby="recontact-consent-title"
          >
            <div className={styles.recontactConsentTitleRow}>
              <h2 className={styles.recontactConsentHeading} id="recontact-consent-title">
                {recontactProcedure.consentLegend}
              </h2>
              <span className={styles.optionalBadge}>Optional</span>
            </div>
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
          </section>
        </div>

        <footer className={styles.consentFooter}>
          <p>Bachelorarbeitsstudie · Universität Bonn · Julian Meyer</p>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => setDeclined(true)}
          >
            {participantInformation.actions.declineLabel}
          </button>
          <button
            className={styles.button}
            type="submit"
            disabled={!accepted || !eligible || !emailValid}
          >
            {participantInformation.actions.acceptLabel}
            <ArrowIcon />
          </button>
        </footer>
      </form>
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
  resumeSegmentId,
  onComplete,
}: {
  readonly timingPort: BrowserSegmentTimingAdapter;
  readonly timingError: string | null;
  readonly onRetryTiming: () => void;
  readonly resumeSegmentId?: 'S00' | 'S01';
  readonly onComplete: () => void;
}) {
  return (
    <TrainingClipboardBoundary allowCopy={false}>
      <PasswordModuleTraining
        timingPort={timingPort}
        externalTimingError={timingError}
        onRetryExternalTiming={onRetryTiming}
        {...(resumeSegmentId === undefined ? {} : { resumeSegmentId })}
        onComplete={onComplete}
      />
    </TrainingClipboardBoundary>
  );
}

function ArtifactPreparation({ onStart }: { readonly onStart: () => void }) {
  return (
    <section className={styles.artifactPreparation} aria-labelledby="artifact-preparation-title">
      <header className={styles.artifactPreparationHeader}>
        <h1 id="artifact-preparation-title" tabIndex={-1} autoFocus>
          Das Lernangebot beginnt gleich
        </h1>
      </header>
      <div className={styles.artifactPreparationContent}>
        <p>
          Stell dir vor, deine Hochschule stellt dir dieses Lernangebot zur Verfügung und bittet
          dich, es zu bearbeiten.
        </p>
        <p>
          Bearbeite die Inhalte aus dieser Perspektive aufmerksam und in deinem eigenen Tempo.
        </p>
        <p>
          Du kannst die Studie jederzeit verlassen, indem du den Browser-Tab schließt. Falls du
          ihn versehentlich schließt, kannst du die Studie erneut öffnen und an der Stelle
          weitermachen, an der du aufgehört hast.
        </p>
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

function HydratedStudyFlow({
  api,
  resumeSession,
}: {
  readonly api: StudyApi;
  readonly resumeSession: WebResumeSession | null;
}) {
  const machine = useMemo(() => createStudyMachine(api, resumeSession), [api, resumeSession]);
  const [snapshot, send] = useMachine(machine);
  const { context } = snapshot;
  const currentBlock = mainInstrumentBlocks[context.instrumentBlockCursor];
  const currentQuestionnaireBlock = mainInstrumentBlocks[context.questionnaireBlockCursor];
  const completeArtifact = useCallback(() => send({ type: 'ARTIFACT_COMPLETED' }), [send]);
  const supportiveResumeSegment = useMemo(() => {
    if (!context.interrupted || context.artifactCheckpoint === null) return undefined;
    const parsed = supportiveCheckpointSchema.safeParse(context.artifactCheckpoint);
    if (!parsed.success || parsed.data === 'supportive:complete') return undefined;
    if (parsed.data === 'supportive:entry') return 'S00';
    return supportiveResumeSegmentFor(
      supportiveArtifactSegmentIdSchema.parse(parsed.data.slice('supportive:'.length)),
    );
  }, [context.artifactCheckpoint, context.interrupted]);
  const referenceResumeCheckpoint = useMemo<ReferenceArtifactLessonCheckpointId | undefined>(() => {
    if (!context.interrupted || context.artifactCheckpoint === null) return undefined;
    const parsed = referenceLessonCheckpointSchema.safeParse(context.artifactCheckpoint);
    if (!parsed.success) return undefined;
    const checkpointId = parsed.data.slice('reference:'.length);
    const semantic = referenceArtifactLessonCheckpointIdSchema.safeParse(checkpointId);
    return semantic.success ? semantic.data : undefined;
  }, [context.artifactCheckpoint, context.interrupted]);
  useEffect(() => {
    if (context.condition !== 'reference') return;
    if (snapshot.matches({ artifactLifecycle: { artifact: 'reference' } })) {
      cancelReferenceArtifactPrefetch();
      return;
    }
    prefetchReferenceArtifact();
  }, [context.condition, snapshot]);
  useEffect(() => {
    if (context.condition === null) return;
    const preloadRenderer =
      context.condition === 'supportive'
        ? preloadSupportiveArtifactRuntime
        : loadReferenceArtifactRenderer;
    return scheduleIdleWork(() => {
      void preloadRenderer().catch(() => undefined);
    });
  }, [context.condition]);
  useEffect(() => {
    if (
      snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } }) &&
      context.artifactCheckpoint === 'supportive:complete'
    ) {
      completeArtifact();
    }
  }, [completeArtifact, context.artifactCheckpoint, snapshot]);
  const segmentTimingPort = useMemo(() => {
    if (context.sessionId === null || context.condition !== 'supportive') return null;
    return new BrowserSegmentTimingAdapter(api.createSegmentTimingPort(context.sessionId));
  }, [api, context.condition, context.sessionId]);
  const artifactVisible =
    snapshot.matches({ artifactLifecycle: 'preparing' }) ||
    snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } }) ||
    snapshot.matches({ artifactLifecycle: { artifact: 'reference' } });
  const artifactActive =
    snapshot.matches({ artifactLifecycle: { artifact: 'supportive' } }) ||
    snapshot.matches({ artifactLifecycle: { artifact: 'reference' } });
  const participantInformationFooter =
    context.deletionCode === null ? null : (
      <ParticipantInformationAccess deletionCode={context.deletionCode} placement="footer" />
    );
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
      currentQuestionnaireBlock?.instrumentId === 'pre-v1'
        ? preInstrument.sections.find(
            (candidate) => candidate.id === currentQuestionnaireBlock.sectionId,
          )
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
          progressSteps={preQuestionnaireProgressSteps}
          progressCurrent={1}
          progressStepNoun="Abschnitt"
          currentSection={sectionIndex + 1}
          sectionCount={preInstrument.sections.length}
          initialSubmission={
            context.questionnaireDrafts[context.questionnaireBlockCursor] ?? null
          }
          footer={participantInformationFooter}
          onBack={(payload) => send({ type: 'BACK_PRE', payload })}
          onSubmit={(payload) => send({ type: 'SUBMIT_PRE', payload })}
        />
      );
  } else if (snapshot.matches({ artifactLifecycle: 'preparing' })) {
    content =
      context.condition === null ? (
        <ConfigurationError errorCode="missing-condition" />
      ) : (
        <ArtifactPreparation onStart={() => send({ type: 'START_ARTIFACT' })} />
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
        <Suspense fallback={<ArtifactRendererLoadingBoundary />}>
          <SupportiveArtifact
            timingPort={segmentTimingPort}
            timingError={
              context.artifactTimingErrorKind === 'visibility' ? context.researchErrorCode : null
            }
            onRetryTiming={() => send({ type: 'RETRY_ARTIFACT_VISIBILITY' })}
            {...(supportiveResumeSegment === undefined
              ? {}
              : { resumeSegmentId: supportiveResumeSegment })}
            onComplete={completeArtifact}
          />
        </Suspense>
      );
  } else if (snapshot.matches({ artifactLifecycle: { artifact: 'reference' } })) {
    content = (
      <Suspense fallback={<ArtifactRendererLoadingBoundary />}>
        <ReferenceArtifact
          onComplete={completeArtifact}
          {...(referenceResumeCheckpoint === undefined
            ? {}
            : { resumeCheckpoint: referenceResumeCheckpoint })}
          onCheckpoint={async (checkpointId) => {
            if (context.sessionId === null) throw new Error('missing-session');
            await api.confirmArtifactCheckpoint(
              context.sessionId,
              referenceLessonCheckpointSchema.parse(`reference:${checkpointId}`),
            );
          }}
        />
      </Suspense>
    );
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
      currentQuestionnaireBlock?.instrumentId === 'post-v1'
        ? postInstrument.sections.find(
            (candidate) => candidate.id === currentQuestionnaireBlock.sectionId,
          )
        : undefined;
    const immediateSectionIndex =
      section === undefined
        ? -1
        : immediatePostSectionIds.findIndex((sectionId) => sectionId === section.id);
    const closingSectionIndex =
      section === undefined
        ? -1
        : postGuardrailSectionIds.findIndex((sectionId) => sectionId === section.id);
    const progressCurrent = immediateSectionIndex >= 0 ? 1 : closingSectionIndex >= 0 ? 4 : -1;
    const localSectionIndex =
      immediateSectionIndex >= 0 ? immediateSectionIndex : closingSectionIndex;
    const localSectionCount =
      immediateSectionIndex >= 0 ? immediatePostSectionIds.length : postGuardrailSectionIds.length;
    const sectionHeading =
      immediateSectionIndex >= 0 ? 'Rückblick auf das Lernangebot' : 'Abschlussfragen';
    const submitLabel =
      immediateSectionIndex === immediatePostSectionIds.length - 1
        ? 'Weiter zu den Kontosituationen'
        : closingSectionIndex === postGuardrailSectionIds.length - 1
          ? 'Antworten abschließen'
          : 'Weiter';

    if (
      section === undefined ||
      progressCurrent < 0 ||
      localSectionIndex < 0 ||
      localSectionCount < 1
    ) {
      content = <ConfigurationError errorCode="post-instrument-cursor-invalid" />;
    } else {
      content = (
        <QuestionnaireSectionForm
          key={`post-v1:${section.id}`}
          instrumentId="post-v1"
          section={section}
          title="Fragebogen nach dem Lernangebot"
          sectionHeading={sectionHeading}
          submitLabel={submitLabel}
          progressSteps={postQuestionnaireProgressSteps}
          progressCurrent={progressCurrent}
          currentSection={localSectionIndex + 1}
          sectionCount={localSectionCount}
          initialSubmission={
            context.questionnaireDrafts[context.questionnaireBlockCursor] ?? null
          }
          footer={participantInformationFooter}
          onBack={(payload) => send({ type: 'BACK_POST', payload })}
          onSubmit={(payload) => send({ type: 'SUBMIT_POST', payload })}
        />
      );
    }
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
    const progress =
      block?.id === 'scenarios'
        ? guardrailProgressByBlock.scenarios
        : block?.id === 'recognition'
          ? guardrailProgressByBlock.recognition
          : undefined;
    content =
      block === undefined ||
      blockIndex < 0 ||
      context.guardrailFormId === null ||
      progress === undefined ? (
        <ConfigurationError errorCode="guardrail-instrument-cursor-invalid" />
      ) : (
        <GuardrailBlockForm
          key={`guardrail-v2:${block.id}`}
          block={block}
          formId={context.guardrailFormId}
          title="Fragebogen nach dem Lernangebot"
          sectionHeading={progress.sectionHeading}
          submitLabel={progress.submitLabel}
          progressSteps={postQuestionnaireProgressSteps}
          progressCurrent={progress.progressCurrent}
          footer={participantInformationFooter}
          onSubmit={(payload) => send({ type: 'SUBMIT_GUARDRAILS', payload })}
        />
      );
  } else if (snapshot.matches('sessionClosure')) {
    const closureContent = context.followUpConsent
      ? sessionClosure.withFollowUp
      : sessionClosure.withoutFollowUp;
    content = (
      <section className={styles.sessionClosure} aria-labelledby="session-closure-title">
        <span className={styles.sessionClosureEmoji} aria-hidden="true">
          🎉
        </span>
        <h1 id="session-closure-title" tabIndex={-1} autoFocus>
          {closureContent.heading}
        </h1>
        {closureContent.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {context.deletionCode === null ? null : (
          <div className={styles.closingDeletionCode}>
            <span>Dein Löschcode</span>
            <strong>{context.deletionCode}</strong>
            <p>
              Bewahre ihn auf, wenn du später die Löschung deiner Forschungsdaten anfragen
              möchtest.
            </p>
          </div>
        )}
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
        {context.deletionCode === null ? null : (
          <p>
            Löschcode: <strong>{context.deletionCode}</strong>
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
        {artifactActive ? <ArtifactViewport>{content}</ArtifactViewport> : content}
      </main>
    );
  }

  return (
    <main
      className={styles.studyPage}
      data-study-surface=""
    >
      <div className={styles.studyShell}>
        <div className={styles.studyContent}>{content}</div>
      </div>
    </main>
  );
}


export function StudyFlow(
  { apiBasePath }: { readonly apiBasePath?: string } = {},
) {
  const api = useMemo(
    () => createStudyApi(apiBasePath === undefined ? {} : { apiBasePath }),
    [apiBasePath],
  );
  const [resumeSession, setResumeSession] = useState<WebResumeSession | null | undefined>(undefined);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeAttempt, setResumeAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setResumeError(null);
    void api.restoreSession().then(
      (session) => {
        if (!cancelled) setResumeSession(session);
      },
      (error: unknown) => {
        if (cancelled) return;
        setResumeError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : 'resume-read-failed',
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, [api, resumeAttempt]);

  if (resumeError !== null) {
    return (
      <main className={styles.studyPage} data-study-surface="">
        <div className={styles.studyShell}>
          <div className={styles.studyContent}>
            <ResearchDataError
              titleId="resume-error-title"
              errorCode={resumeError}
              onRetry={() => {
                setResumeSession(undefined);
                setResumeAttempt((current) => current + 1);
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  if (resumeSession === undefined) {
    return (
      <main className={styles.studyPage} data-study-surface="">
        <div className={styles.studyShell}>
          <div className={styles.studyContent}>
            <div className={styles.loading} role="status">
              Studienstand wird geladen …
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <HydratedStudyFlow api={api} resumeSession={resumeSession} />;
}
