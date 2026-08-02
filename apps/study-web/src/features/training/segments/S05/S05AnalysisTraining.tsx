import type {
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
} from '@passwo/contracts';
import { s05Content } from '@passwo/training-content';
import type {
  PasswordCandidateSceneSnapshot,
  PasswordFindingSceneSnapshot,
  PasswordFreeSearchApplicationSceneSnapshot,
  PasswordFreeSearchDemonstrationSceneSnapshot,
  PasswordStructureSceneSnapshot,
} from '@passwo/visualization';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  type S05AnalysisControllerSnapshot,
  type S05AnalysisSubject,
  S05AnalysisController,
} from './S05AnalysisController.js';
import { S05AnimationAdapter } from './S05AnimationAdapter.js';
import styles from './S05AnalysisTraining.module.css';

export type S05TimingState = 'active' | 'writingEnd' | 'endWriteFailed';

export interface S05CompletionPort {
  complete(): void;
}

export interface S05AnalysisTrainingProps {
  readonly subject: S05AnalysisSubject;
  readonly timingState?: S05TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onRetryTiming?: () => void;
  readonly completionPort?: S05CompletionPort;
}

function findingLabel(kind: PasswordSingleFindingKind): string {
  return s05Content.findingLabels[kind];
}

function CandidateScene({ scene }: { readonly scene: PasswordCandidateSceneSnapshot }) {
  return (
    <div className={styles.sceneGrid} aria-label={scene.accessibleSummary}>
      <section className={styles.candidatePanel}>
        <h2>{s05Content.intro.title}</h2>
        <p>{s05Content.intro.explanation}</p>
        <div className={styles.candidateStream} aria-label="Beispielkandidaten">
          {scene.candidates.map((candidate) => (
            <code key={candidate.id}>{candidate.candidate}</code>
          ))}
        </div>
        <div className={styles.marker} data-s05-target="candidate-marker">
          <span aria-hidden="true">→</span>
          <strong>{s05Content.intro.markerLabel}</strong>
        </div>
      </section>
      <section className={styles.searchComparison}>
        <article>
          <h3>{s05Content.intro.freeSearchLabel}</h3>
          <p>{s05Content.intro.freeSearchBody}</p>
        </article>
        <article>
          <h3>{s05Content.intro.likelyLabel}</h3>
          <p>{s05Content.intro.likelyBody}</p>
        </article>
        <p className={styles.theoryNotice}>{s05Content.freeSearch.theoreticalModel.boundary}</p>
      </section>
    </div>
  );
}

function FindingScene({
  subject,
  scene,
}: {
  readonly subject: S05AnalysisSubject;
  readonly scene: PasswordFindingSceneSnapshot;
}) {
  return (
    <div className={styles.findingWorkspace}>
      <section className={styles.demonstrations} aria-label="Beispiele">
        {s05Content.componentDemonstrations.map((demonstration) => (
          <article key={demonstration.id}>
            <h3>{demonstration.title}</h3>
            <p className={styles.exampleLine}>{demonstration.examples.join(' · ')}</p>
            <p>{demonstration.note}</p>
          </article>
        ))}
      </section>
      <aside className={styles.resultCard} data-s05-target="analysis-result">
        <p className={styles.cardLabel}>{subject.label}</p>
        <h2>{s05Content.result.title}</h2>
        <code className={styles.fixturePassword}>{subject.fictionalPassword}</code>
        <ol>
          {scene.prioritizedFindings.map((finding) => (
            <li key={finding.id}>
              <strong>{findingLabel(finding.kind)}</strong>
              {finding.evidence.length === 0 ? null : (
                <span>{finding.evidence.map(({ token }) => token).join(', ')}</span>
              )}
            </li>
          ))}
        </ol>
        <p>{s05Content.result.boundedNotice}</p>
      </aside>
    </div>
  );
}

function structureFindingLabel(kind: RuntimeStructureFindingKind): string {
  return s05Content.structure.findingLabels[kind];
}

function FictionalPasswordWithEvidence({
  password,
  scene,
}: {
  readonly password: string;
  readonly scene: PasswordStructureSceneSnapshot;
}) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const span of scene.highlightedSpans) {
    if (cursor < span.start) {
      parts.push(<span key={`plain-${cursor}`}>{password.slice(cursor, span.start)}</span>);
    }
    parts.push(
      <mark key={`evidence-${span.start}-${span.end}`}>
        {password.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  }
  if (cursor < password.length) {
    parts.push(<span key={`plain-${cursor}`}>{password.slice(cursor)}</span>);
  }
  return <code className={styles.structuredPassword}>{parts}</code>;
}

function StructureDemonstrationScene({
  snapshot,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  const scene = snapshot.structureScene;
  const demonstration = scene?.authoredDemonstrations.find(
    ({ id }) => id === `s05-${snapshot.step}`,
  );
  if (demonstration === undefined) return null;
  return (
    <div
      className={styles.structureWorkspace}
      aria-label={`${demonstration.title}. ${demonstration.passWoExplanation}`}
    >
      <section className={styles.passWoExplanation}>
        <p className={styles.cardLabel}>PassWo erklärt</p>
        <p>{demonstration.passWoExplanation}</p>
      </section>
      <article
        className={styles.structureDemonstration}
        data-s05-target={snapshot.step}
        aria-label={`${demonstration.title}, Beispiel`}
      >
        <p className={styles.authoredBadge}>Beispiel</p>
        <h2>{demonstration.title}</h2>
        <div className={styles.structureTokens} aria-label={demonstration.tokens.join(', ')}>
          {demonstration.tokens.map((token, index) => (
            <span key={`${token}-${index}`}>{token}</span>
          ))}
        </div>
        <strong className={styles.connectionLabel}>{demonstration.connectionLabel}</strong>
        <p className={styles.boundaryNote}>{demonstration.boundaryNote}</p>
      </article>
    </div>
  );
}

function ShortExplanationScene({
  targetId,
  title,
  explanation,
}: {
  readonly targetId: string;
  readonly title: string;
  readonly explanation: string;
}) {
  return (
    <div className={styles.focusScene} data-s05-target={targetId}>
      <p className={styles.cardLabel}>PassWo erklärt</p>
      <h2>{title}</h2>
      <p>{explanation}</p>
    </div>
  );
}

function SameLengthScene() {
  const content = s05Content.freeSearch.sameLength;
  return (
    <div className={styles.focusScene} data-s05-target="same-length">
      <p className={styles.cardLabel}>Beispiel</p>
      <h2>{content.title}</h2>
      <div className={styles.passwordComparison}>
        {[content.predictable, content.independentlyRandom].map((example) => (
          <article key={example.password}>
            <code>{example.password}</code>
            <strong>15 Zeichen</strong>
            <div className={styles.tokenRow} aria-label={example.parts.join(', ')}>
              {example.parts.map((part, index) => (
                <span key={`${part}-${index}`}>{part}</span>
              ))}
            </div>
            <p>{example.label}</p>
          </article>
        ))}
      </div>
      <p>{content.explanation}</p>
    </div>
  );
}

function EstimateScene({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const content = s05Content.freeSearch.estimate;
  return (
    <div className={styles.focusScene} data-s05-target="estimate">
      <p className={styles.cardLabel}>Deine Schätzung</p>
      <h2>{content.title}</h2>
      <p>{content.explanation}</p>
      <fieldset className={styles.estimateScale} disabled={snapshot.estimate.confirmed}>
        <legend>{content.question}</legend>
        <div>
          {content.options.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="s05-estimate"
                checked={snapshot.estimate.selected === option}
                onChange={() => controller.selectEstimate(option)}
              />
              <span>{option === 16 ? content.overflowLabel : option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className={styles.confirmEstimate}
        type="button"
        disabled={snapshot.estimate.selected === null || snapshot.estimate.confirmed}
        onClick={() => controller.confirmEstimate()}
      >
        {content.confirm}
      </button>
      {snapshot.estimate.confirmed ? (
        <p className={styles.localNotice}>{content.confirmed}</p>
      ) : null}
    </div>
  );
}

function LowercaseClockScene({
  scene,
}: {
  readonly scene: PasswordFreeSearchDemonstrationSceneSnapshot;
}) {
  const content = s05Content.freeSearch.theoreticalModel;
  return (
    <div
      className={styles.focusScene}
      data-s05-target="lowercase-clock"
      aria-label={scene.accessibleSummary}
    >
      <p className={styles.cardLabel}>Beispiel mit festgelegten Annahmen</p>
      <h2>{content.title}</h2>
      <ul className={styles.assumptions}>
        {content.assumptions.map((assumption) => (
          <li key={assumption}>{assumption}</li>
        ))}
      </ul>
      <div className={styles.clockScale}>
        {scene.lowercaseMeasurements.map(({ model, durationLabel }) => (
          <article key={model.length}>
            <strong>{model.length} Zeichen</strong>
            <span>{durationLabel}</span>
          </article>
        ))}
      </div>
      <p>{content.lowercaseExplanation}</p>
      <p className={styles.boundaryCallout}>{content.boundary}</p>
    </div>
  );
}

function GeneratedCharactersScene({
  scene,
}: {
  readonly scene: PasswordFreeSearchDemonstrationSceneSnapshot;
}) {
  const content = s05Content.freeSearch.generatedCharacters;
  const model = scene.generatedCharacterModel;
  return (
    <div className={styles.focusScene} data-s05-target="generated-characters">
      <p className={styles.cardLabel}>Beispiel: zufällig erzeugte Zeichen</p>
      <h2>{content.title}</h2>
      <div
        className={styles.generatedPassword}
        aria-label="Jede Stelle unabhängig zufällig gezogen"
      >
        {[...content.example].map((character, index) => (
          <span key={`${character}-${index}`}>{character}</span>
        ))}
      </div>
      <p>
        {model.alphabetSize} mögliche Zeichen pro Stelle · {model.length} Stellen
      </p>
      <p>{content.alphabetParts.join(' · ')}</p>
      <strong>
        {content.durationLabel}
        {scene.generatedModelHasLargerSearchSpace
          ? ' · größerer theoretischer Suchraum als bei 15 zufälligen Kleinbuchstaben'
          : ''}
      </strong>
      <p>{content.explanation}</p>
      <p className={styles.boundaryCallout}>{s05Content.freeSearch.theoreticalModel.boundary}</p>
    </div>
  );
}

function PasswordPartsScene({
  targetId,
  title,
  password,
  parts,
  labels,
  explanation,
}: {
  readonly targetId: string;
  readonly title: string;
  readonly password: string;
  readonly parts: readonly string[];
  readonly labels: readonly string[];
  readonly explanation: string;
}) {
  return (
    <div className={styles.focusScene} data-s05-target={targetId}>
      <p className={styles.cardLabel}>Beispiel</p>
      <h2>{title}</h2>
      <code className={styles.largePassword}>{password}</code>
      <div className={styles.labeledParts}>
        {parts.map((part, index) => (
          <span key={`${part}-${index}`}>
            <code>{part}</code>
            <small>{labels[index]}</small>
          </span>
        ))}
      </div>
      <p>{explanation}</p>
    </div>
  );
}

function ChosenWordsScene() {
  const content = s05Content.freeSearch.chosenWords;
  return (
    <div className={styles.focusScene} data-s05-target="chosen-words">
      <p className={styles.cardLabel}>Beispiel</p>
      <h2>{content.title}</h2>
      <div className={styles.wordExamples}>
        {content.examples.map((example) => (
          <code key={example}>
            {example}
            <small>{[...example].length} Zeichen</small>
          </code>
        ))}
      </div>
      <p>{content.explanation}</p>
    </div>
  );
}

function AuthoredWordsScene() {
  const content = s05Content.freeSearch.authoredWords;
  return (
    <div className={styles.focusScene} data-s05-target="authored-words">
      <p className={styles.cardLabel}>{content.badge}</p>
      <h2>{content.title}</h2>
      <div className={styles.wordCards} aria-label={content.words.join(', ')}>
        {content.words.map((word) => (
          <span key={word}>
            <small>unabhängig gezogen</small>
            {word}
          </span>
        ))}
      </div>
      <code className={styles.joinedWords}>{content.joined}</code>
      <p>{content.explanation}</p>
      <p>{content.hyphenNote}</p>
      <p className={styles.boundaryCallout}>{content.outlook}</p>
    </div>
  );
}

function FreeSearchApplicationScene({
  subject,
  scene,
}: {
  readonly subject: S05AnalysisSubject;
  readonly scene: PasswordFreeSearchApplicationSceneSnapshot;
}) {
  const content = s05Content.freeSearch.application;
  return (
    <div
      className={styles.applicationScene}
      data-s05-target="free-search-application"
      aria-label={scene.accessibleSummary}
    >
      <p className={styles.cardLabel}>Was die Übung erkannt hat</p>
      <h2>{content.title}</h2>
      <code className={styles.largePassword}>{subject.fictionalPassword}</code>
      <div className={styles.applicationGrid}>
        <article>
          <strong>{content.visibleLength}</strong>
          <span>{scene.visibleLength} Zeichen</span>
        </article>
        <article>
          <strong>{content.componentFindings}</strong>
          <span>
            {scene.componentAnalysis.findings.map(({ kind }) => findingLabel(kind)).join(' · ')}
          </span>
        </article>
        <article>
          <strong>{content.structureFindings}</strong>
          <span>
            {scene.structureAnalysis.findings
              .map(({ findingKind }) => structureFindingLabel(findingKind))
              .join(' · ')}
          </span>
        </article>
        <article>
          <strong>{content.unexplainedAreas}</strong>
          <span>
            {scene.areasWithoutRecognizedSimplerExplanation.map(({ token }) => token).join(' · ') ||
              content.noUnexplainedArea}
          </span>
        </article>
      </div>
      <div className={styles.disposition}>
        {scene.disposition.kind === 'quick-path-recognized' ? (
          <strong>{content.dispositionLabels[scene.disposition.ruleId]}</strong>
        ) : (
          <>
            <strong>{content.noQuickPath}</strong>
            <span>{content.noQuickPathBoundary}</span>
          </>
        )}
      </div>
      <p className={styles.boundaryCallout}>{content.boundary}</p>
    </div>
  );
}

function SummaryScene({ step }: { readonly step: S05AnalysisControllerSnapshot['step'] }) {
  const content = s05Content.summary;
  const activeId =
    step === 'summary-components'
      ? 'components'
      : step === 'summary-structure'
        ? 'structure'
        : step === 'summary-free-search'
          ? 'free-search'
          : null;
  return (
    <div
      className={styles.summaryScene}
      data-s05-target={step === 'summary-memory' ? 'summary-memory' : undefined}
    >
      <p className={styles.cardLabel}>Zusammenfassung</p>
      <h2>{content.title}</h2>
      <p>{content.intro}</p>
      <div className={styles.summaryCards}>
        {content.cards.map((card) => (
          <article
            key={card.id}
            data-s05-target={`summary-${card.id}`}
            data-active={card.id === activeId}
          >
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
      <p className={styles.generatedNote}>{content.generatedNote}</p>
      <p>{content.noScore}</p>
    </div>
  );
}

function renderScene(
  snapshot: S05AnalysisControllerSnapshot,
  subject: S05AnalysisSubject,
  controller: S05AnalysisController,
) {
  switch (snapshot.step) {
    case 'candidate-check':
      return <CandidateScene scene={snapshot.candidateScene} />;
    case 'component-analysis':
      return <FindingScene subject={subject} scene={snapshot.findingScene} />;
    case 'structure-theme':
    case 'structure-sentence':
    case 'structure-repetition':
    case 'structure-context':
      return <StructureDemonstrationScene snapshot={snapshot} />;
    case 'structure-application':
      return <StructureApplicationScene subject={subject} scene={snapshot.structureScene} />;
    case 'free-search-transition':
      return (
        <ShortExplanationScene
          targetId="free-search-transition"
          {...s05Content.freeSearch.transition}
        />
      );
    case 'same-length':
      return <SameLengthScene />;
    case 'estimate':
      return <EstimateScene snapshot={snapshot} controller={controller} />;
    case 'lowercase-clock':
      return <LowercaseClockScene scene={snapshot.freeSearchDemonstrationScene} />;
    case 'generated-characters':
      return <GeneratedCharactersScene scene={snapshot.freeSearchDemonstrationScene} />;
    case 'predictable-mix':
      return (
        <PasswordPartsScene targetId="predictable-mix" {...s05Content.freeSearch.predictableMix} />
      );
    case 'chosen-words':
      return <ChosenWordsScene />;
    case 'authored-words':
      return <AuthoredWordsScene />;
    case 'free-search-application':
      return (
        <FreeSearchApplicationScene subject={subject} scene={snapshot.freeSearchApplicationScene} />
      );
    case 'summary-components':
    case 'summary-structure':
    case 'summary-free-search':
    case 'summary-memory':
      return <SummaryScene step={snapshot.step} />;
    default:
      throw new Error(`Unbekannter S05-Schritt: ${snapshot.step}`);
  }
}

function StructureApplicationScene({
  subject,
  scene,
}: {
  readonly subject: S05AnalysisSubject;
  readonly scene: PasswordStructureSceneSnapshot;
}) {
  const noSimpleStructure =
    scene.prioritizedRuntimeFindings.length === 1 &&
    scene.prioritizedRuntimeFindings[0]?.findingKind === 'no-simple-structure-recognized';
  return (
    <div className={styles.structureWorkspace} aria-label={scene.accessibleSummary}>
      <section className={styles.passWoExplanation}>
        <p className={styles.cardLabel}>PassWo erklärt</p>
        <p>
          {noSimpleStructure
            ? s05Content.structure.application.noneExplanation
            : s05Content.structure.application.recognizedExplanation}
        </p>
      </section>
      <article className={styles.structureResult} data-s05-target="structure-application">
        <p className={styles.cardLabel}>Was die Übung erkannt hat</p>
        <h2>{s05Content.structure.application.title}</h2>
        <FictionalPasswordWithEvidence password={subject.fictionalPassword} scene={scene} />
        <ol>
          {scene.prioritizedRuntimeFindings.map((finding) => (
            <li key={finding.id}>
              <strong>{structureFindingLabel(finding.findingKind)}</strong>
              {finding.evidence.length === 0 ? null : (
                <span>{finding.evidence.map(({ token }) => token).join(' · ')}</span>
              )}
            </li>
          ))}
        </ol>
        <p>{s05Content.structure.application.boundedNotice}</p>
      </article>
    </div>
  );
}

export function S05AnalysisTraining({
  subject,
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onRetryTiming,
  completionPort,
}: S05AnalysisTrainingProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [controller, setController] = useState<S05AnalysisController | null>(null);
  const [snapshot, setSnapshot] = useState<S05AnalysisControllerSnapshot | null>(null);
  const timingFailure = externalTimingError !== null || timingState === 'endWriteFailed';

  useEffect(() => {
    const animationPlayer = new S05AnimationAdapter({
      getElement: (targetId) =>
        hostRef.current?.querySelector<HTMLElement>(`[data-s05-target="${targetId}"]`) ?? null,
      prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    const nextController = new S05AnalysisController({
      subject,
      animationPlayer,
      onComplete: () => completionPort?.complete(),
    });
    const unsubscribe = nextController.subscribe(setSnapshot);
    setController(nextController);
    setSnapshot(nextController.getSnapshot());
    return () => {
      unsubscribe();
      void nextController.dispose();
    };
  }, [completionPort, subject]);

  const writingBoundary = timingState === 'writingEnd';

  if (controller === null || snapshot === null) return null;

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <article className={styles.page} aria-labelledby="s05-title">
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>{s05Content.page.eyebrow}</p>
          <h1 id="s05-title">{s05Content.page.title}</h1>
        </header>
        <div className={styles.content} aria-live="polite">
          {renderScene(snapshot, subject, controller)}
        </div>
        <footer className={styles.controls}>
            {writingBoundary && externalTimingError === null ? (
              <p role="status">Segmentgrenze wird bestätigt …</p>
            ) : null}
            {timingFailure ? (
              <section className={styles.timingError} role="alert">
                <p>Die Segmentgrenze konnte nicht bestätigt werden.</p>
                <p>Fehlercode: {externalTimingError ?? timingErrorCode}</p>
                <button type="button" onClick={onRetryTiming}>
                  Erneut versuchen
                </button>
              </section>
            ) : null}
            <button
              type="button"
              disabled={!snapshot.controls.canStart || externalTimingError !== null}
              onClick={() => controller.start()}
            >
              {s05Content.page.start}
            </button>
            <button
              type="button"
              disabled={!snapshot.controls.canReplay || externalTimingError !== null}
              onClick={() => controller.replay()}
            >
              {s05Content.page.replay}
            </button>
            <button
              type="button"
              disabled={!snapshot.controls.canContinue || externalTimingError !== null}
              onClick={() => controller.continue()}
            >
              {s05Content.page.continue}
            </button>
        </footer>
      </article>
    </section>
  );
}
