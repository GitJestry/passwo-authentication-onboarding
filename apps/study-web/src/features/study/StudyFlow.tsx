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
  const [expanded, setExpanded] = useState(true);
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
          {title}
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
        <p className={styles.eyebrow}>Studie zu digitalem Kontoschutz</p>
        <h1 id="declined-title" tabIndex={-1} autoFocus>
          Danke für deine Rückmeldung
        </h1>
        <p>Du nimmst nicht an der Studie teil. Es wurde keine Sitzung angelegt.</p>
      </section>
    );
  }

  return (
    <section className={styles.consentPage} aria-labelledby="consent-title">
      <header className={styles.welcomeHeader}>
        <p className={styles.eyebrow}>Studie zu digitalem Kontoschutz</p>
        <h1 id="consent-title" tabIndex={-1} autoFocus>
          Willkommen
        </h1>
        <p className={styles.welcomeCopy}>
          Vielen Dank, dass du dir Zeit für diese Studie nimmst. Du bearbeitest gleich ein digitales
          Lernangebot zum Schutz von Online-Konten. Davor und danach beantwortest du einige kurze
          Fragen.
        </p>
        <div className={styles.factCards} aria-label="Kurzüberblick zur Teilnahme">
          <article className={styles.factCard}>
            <h2>Dauer heute</h2>
            <p>etwa 20–30 Minuten</p>
          </article>
          <article className={styles.factCard}>
            <h2>Auswertung</h2>
            <p>pseudonymisiert</p>
          </article>
          <article className={styles.factCard}>
            <h2>Nachbefragung</h2>
            <p>optional, etwa 1 Minute nach 10 Tagen</p>
          </article>
        </div>
        {!informationVisible ? (
          <button
            className={styles.button}
            type="button"
            onClick={() => setInformationVisible(true)}
          >
            Teilnahmeinformationen lesen
          </button>
        ) : null}
      </header>

      {informationVisible ? (
        <div className={styles.consentDetails}>
          <section aria-labelledby="participant-information-title">
            <h2 id="participant-information-title">Informationen zu deiner Teilnahme</h2>
            <DisclosureSection title="Worum geht es?">
              <p>
                Wir untersuchen, wie ein digitales Lernangebot zum Schutz von Online-Konten genutzt
                und wahrgenommen wird. Einige Einzelheiten dazu, was genau untersucht wird,
                erläutern wir erst nach deinem letzten Studienteil. Dadurch soll vermieden werden,
                dass Vorwissen über die genaue Fragestellung deine Bearbeitung beeinflusst.
              </p>
            </DisclosureSection>
            <DisclosureSection title="Was erwartet dich?">
              <p>
                Zunächst beantwortest du kurze Fragen zu deiner Person und zu bisherigen Erfahrungen
                mit den behandelten Themen. Danach bearbeitest du ein digitales Lernangebot.
                Abschließend folgen Fragen zu deiner Wahrnehmung des Angebots und zu den
                vermittelten Inhalten. Die heutige Sitzung dauert voraussichtlich 20 bis 30 Minuten.
              </p>
              <p>
                Optional kannst du etwa zehn Tage später per E-Mail an einer ungefähr einminütigen
                Nachbefragung teilnehmen. Die Hauptstudie kann vollständig bearbeitet werden, ohne
                dieser Kontaktaufnahme zuzustimmen.
              </p>
            </DisclosureSection>
            <DisclosureSection title="Welche Daten werden verarbeitet?">
              <p>
                Gespeichert werden deine Fragebogenantworten, Bearbeitungszeiten, technische
                Abschlussinformationen und Angaben zum bearbeiteten Studienablauf. Die
                Forschungsdaten werden unter einem zufällig erzeugten Teilnehmercode pseudonymisiert
                gespeichert und ausgewertet. Sie enthalten weder deinen Namen noch deine
                E-Mail-Adresse.
              </p>
              <p>
                Falls du der Nachbefragung zustimmst, wird deine E-Mail-Adresse getrennt von den
                Forschungsdaten gespeichert und ausschließlich für die Einladung sowie höchstens
                eine Erinnerung verwendet.
              </p>
            </DisclosureSection>
            <DisclosureSection title="Freiwilligkeit und Abbruch">
              <p>
                Die Teilnahme ist freiwillig. Du kannst sie jederzeit ohne Begründung und ohne
                Nachteile beenden. Innerhalb der vor dem Study Freeze festgelegten Aufbewahrungs-
                und Löschfrist kannst du unter Angabe deines Teilnehmercodes die Löschung deiner
                Forschungsdaten verlangen.
              </p>
            </DisclosureSection>
            <DisclosureSection title="Mögliche Belastungen und Nutzen">
              <p>
                Es sind keine besonderen Risiken zu erwarten, die über alltägliche Belastungen bei
                der Nutzung digitaler Lernangebote und Fragebögen hinausgehen. Ein unmittelbarer
                persönlicher Nutzen kann nicht zugesichert werden.
              </p>
            </DisclosureSection>
            <DisclosureSection title="Fragen und Kontakt">
              <p>
                Bei Fragen zur Studie, zur Teilnahme oder zur Verarbeitung deiner Daten kannst du
                dich an folgende Stelle wenden:
              </p>
              <ul className={styles.contactList}>
                <li>Studienleitung: Julian Meyer, s27jmeye@uni-bonn.de</li>
                <li>Betreuung: Dr. Christian Tiefenau, tiefenau@cs.uni-bonn.de</li>
                <li>
                  Verantwortliche Stelle / Datenschutzkontakt: [nach Vorgabe der Universität
                  ergänzen]
                </li>
              </ul>
            </DisclosureSection>
          </section>

          <form
            className={styles.consentForm}
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

            <fieldset className={styles.consentPanel}>
              <legend>Einwilligung</legend>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.currentTarget.checked)}
                />
                <span>
                  Ich habe die Teilnahmeinformationen gelesen und verstanden. Ich weiß, dass einige
                  Einzelheiten zur genauen Fragestellung erst nach meinem letzten Studienteil
                  erläutert werden. Ich willige freiwillig in die Teilnahme und in die beschriebene
                  pseudonymisierte Verarbeitung meiner Forschungsdaten ein.
                </span>
              </label>
            </fieldset>

            <fieldset className={styles.consentPanel}>
              <legend>Optionale Nachbefragung</legend>
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
                <span>
                  Ich möchte etwa zehn Tage später per E-Mail zu einer kurzen Nachbefragung
                  eingeladen werden. Meine E-Mail-Adresse wird getrennt von den Forschungsdaten
                  gespeichert und nur für diese Kontaktaufnahme verwendet.
                </span>
              </label>
              {wantsRecontact ? (
                <label className={styles.emailField}>
                  <span>E-Mail-Adresse für die Nachbefragung</span>
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

            <div className={styles.consentActions}>
              <button
                className={styles.button}
                type="submit"
                disabled={!accepted || !eligible || !emailValid}
              >
                Teilnahme beginnen
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setDeclined(true)}
              >
                Nicht teilnehmen
              </button>
            </div>
          </form>
        </div>
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
          progressLabel={`Abschnitt ${sectionIndex + 1} von ${preInstrument.sections.length}`}
          submitLabel="Abschnitt verbindlich abgeben"
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
          onComplete={completeArtifact}
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
          progressLabel={`Abschnitt ${sectionIndex + 1} von ${postInstrument.sections.length}`}
          submitLabel="Abschnitt verbindlich abgeben"
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
  } else if (snapshot.matches('debrief')) {
    content = (
      <section aria-labelledby="debrief-title">
        <h1 id="debrief-title" tabIndex={-1} autoFocus>
          Vielen Dank für deine Teilnahme
        </h1>
        {context.followUpConsent ? (
          <p>
            Die Hauptsitzung ist damit abgeschlossen. Zehn Tage nach deiner Teilnahme erhältst du
            die kurze Nachbefragung an die angegebene E-Mail-Adresse. Du kannst dieses Fenster jetzt
            schließen.
          </p>
        ) : (
          <p>
            Die Hauptsitzung ist damit abgeschlossen. Du hast keine Kontaktaufnahme für die
            optionale Nachbefragung gewählt. Du kannst dieses Fenster jetzt schließen.
          </p>
        )}
        <div className={styles.form}>
          <button
            className={styles.button}
            type="button"
            onClick={() => send({ type: 'DEBRIEF_ACKNOWLEDGED' })}
          >
            Abschluss bestätigen
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
      <section aria-labelledby="complete-title">
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
