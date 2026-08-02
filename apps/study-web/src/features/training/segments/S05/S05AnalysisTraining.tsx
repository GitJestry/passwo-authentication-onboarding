import type {
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
} from '@passwo/contracts';
import { s00Content, s05Content } from '@passwo/training-content';
import type {
  PasswordFindingSceneSnapshot,
  PasswordFreeSearchApplicationSceneSnapshot,
  PasswordFreeSearchDemonstrationSceneSnapshot,
  PasswordStructureSceneSnapshot,
} from '@passwo/visualization';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import attackerAsset from '../../../../assets/passwo/attacker.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { PasswordBuildingBlocks } from './PasswordBuildingBlocks.js';
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

interface StrategyTransitionRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

function strategyTransitionStyle(rect: StrategyTransitionRect | null): CSSProperties | undefined {
  if (rect === null) return undefined;
  return {
    '--strategy-transition-top': `${rect.top}px`,
    '--strategy-transition-left': `${rect.left}px`,
    '--strategy-transition-width': `${rect.width}px`,
    '--strategy-transition-height': `${rect.height}px`,
  } as CSSProperties;
}

function findingLabel(kind: PasswordSingleFindingKind): string {
  return s05Content.findingLabels[kind];
}

const candidateAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!?#$%&';

function createRandomCandidate(maximumLength: number): string {
  const randomValues = new Uint32Array(Math.max(2, maximumLength + 1));
  globalThis.crypto.getRandomValues(randomValues);
  const length = 1 + ((randomValues[0] ?? 0) % maximumLength);
  return Array.from(
    { length },
    (_, index) => candidateAlphabet[(randomValues[index + 1] ?? 0) % candidateAlphabet.length] ?? 'x',
  ).join('');
}

function CampusgramPassword({
  password,
  className,
}: {
  readonly password: string;
  readonly className?: string;
}) {
  const hiddenValue = '•'.repeat(Math.max(8, password.length));
  return (
    <section className={`${styles.campusgramPassword}${className === undefined ? '' : ` ${className}`}`}>
      <span
        className={styles.campusgramPasswordTitle}
        aria-label={s05Content.intro.campusgramPassword.accessibleLabel}
      >
        <span className={styles.campusgramSymbol} aria-hidden="true">
          <NetworkSymbol symbolId="campusgram" />
        </span>
        <span aria-hidden="true">{s05Content.intro.campusgramPassword.visibleSuffix}</span>
      </span>
      <code aria-label={s05Content.intro.campusgramPassword.accessibleLabel}>
        {hiddenValue}
      </code>
    </section>
  );
}

function AttackerAttempt({ maximumLength }: { readonly maximumLength: number }) {
  const [candidate, setCandidate] = useState(() => createRandomCandidate(maximumLength));

  useEffect(() => {
    setCandidate(createRandomCandidate(maximumLength));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const interval = window.setInterval(() => setCandidate(createRandomCandidate(maximumLength)), 820);
    return () => window.clearInterval(interval);
  }, [maximumLength]);

  return (
    <div className={styles.attackerAttempt} data-s05-target="attacker-attempt" aria-live="off">
      <code key={candidate}>{candidate}</code>
      <strong>
        <span aria-hidden="true">×</span>
        {s05Content.intro.candidateFailure}
      </strong>
    </div>
  );
}

function CandidateCheckScene({ subject }: { readonly subject: S05AnalysisSubject }) {
  return (
    <div className={styles.attackerStage}>
      <CampusgramPassword password={subject.fictionalPassword} />
      <AttackerAttempt maximumLength={Math.max(1, subject.fictionalPassword.length + 5)} />
      <div className={styles.attackerConnection} aria-hidden="true">
        <span />
      </div>
      <img
        className={styles.attackerPortrait}
        src={attackerAsset}
        alt="Symbolische Darstellung eines Angreifers am Computer"
      />
    </div>
  );
}

function RandomSequenceScene() {
  return (
    <div className={styles.memorabilityStage} data-s05-target="random-sequence">
      <section className={styles.generatedSequence} aria-label="Zufällig erzeugte Zeichenfolge">
        <code>
          {[...s05Content.intro.generatedPassword].map((character, index) => (
            <i key={`${character}-${index}`} style={{ '--character-index': index } as CSSProperties}>
              {character}
            </i>
          ))}
        </code>
      </section>
    </div>
  );
}

function RecognizableCombinationScene() {
  return (
    <div className={styles.recognizableStage} data-s05-target="recognizable-password">
      <PasswordBuildingBlocks
        value={s05Content.intro.memorablePassword}
        parts={s05Content.intro.memorablePasswordParts}
        display="assembled"
        ariaLabel={s05Content.intro.memorablePassword}
      />
    </div>
  );
}

function BuildingBlocksScene() {
  return (
    <div className={styles.buildingBlocksStage} data-s05-target="building-blocks">
      <div className={styles.buildingBlocksVisual} data-s05-speech-obstacle>
        <PasswordBuildingBlocks
          value={s05Content.intro.memorablePassword}
          parts={s05Content.intro.memorablePasswordParts}
          display="decomposed"
          ariaLabel={`${s05Content.intro.memorablePassword} in Bausteinen`}
        />
      </div>
    </div>
  );
}

function StrategyTargetingScene() {
  return (
    <div className={styles.strategyTargeting} data-s05-target="strategy-targeting">
      <div className={styles.buildingBlocksVisual} data-s05-speech-obstacle>
        <PasswordBuildingBlocks
          value={s05Content.intro.memorablePassword}
          parts={s05Content.intro.memorablePasswordParts}
          display="decomposed"
          annotations={s05Content.intro.strategyAnnotations}
          ariaLabel={`${s05Content.intro.memorablePassword}: ${Object.values(s05Content.intro.strategyAnnotations).join(', ')}`}
        />
      </div>
    </div>
  );
}

function StrategyPreview({
  strategyId,
}: {
  readonly strategyId: (typeof s05Content.intro.strategies)[number]['id'];
}) {
  return (
    <div className={styles.strategyPreview} data-strategy={strategyId} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function StrategyOverviewScene({
  transitioning,
  transitionStyle,
  onTransitionEnd,
}: {
  readonly transitioning: boolean;
  readonly transitionStyle: CSSProperties | undefined;
  readonly onTransitionEnd: () => void;
}) {
  return (
    <div
      className={styles.strategyOverview}
      data-s05-target="strategy-overview"
      data-transitioning={transitioning || undefined}
    >
      <div className={styles.strategyCards}>
        {s05Content.intro.strategies.map((strategy, index) => (
          <article
            key={strategy.id}
            data-strategy={strategy.id}
            style={{ '--strategy-index': index } as CSSProperties}
          >
            <StrategyPreview strategyId={strategy.id} />
            <h2>{`${index + 1}. ${strategy.title}`}</h2>
          </article>
        ))}
      </div>
      <div className={styles.strategyBuildingBlocks} data-s05-speech-obstacle>
        <PasswordBuildingBlocks
          value={s05Content.intro.memorablePassword}
          parts={s05Content.intro.memorablePasswordParts}
          display="decomposed"
          animate={false}
          annotations={s05Content.intro.strategyAnnotations}
          ariaLabel={`${s05Content.intro.memorablePassword}: ${Object.values(s05Content.intro.strategyAnnotations).join(', ')}`}
        />
      </div>
      {transitioning ? (
        <article
          className={styles.strategyTransitionCard}
          style={transitionStyle}
          onAnimationEnd={(event) => {
            if (event.currentTarget === event.target) onTransitionEnd();
          }}
        >
          <StrategyPreview strategyId="components" />
          <h2>{`1. ${s05Content.intro.strategies[0].title}`}</h2>
        </article>
      ) : null}
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
    <div className={styles.componentWorkspace}>
      <header className={styles.strategyFocus} data-s05-target="strategy-components-focus">
        <h2>{`1. ${s05Content.intro.strategies[0].title}`}</h2>
      </header>
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
      <PasswordBuildingBlocks
        value={password}
        parts={parts}
        labels={labels}
        display="separated"
        ariaLabel={`${password}: ${parts.join(', ')}`}
      />
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
  strategyTransition: StrategyTransitionRect | null,
  onStrategyTransitionEnd: () => void,
) {
  switch (snapshot.step) {
    case 'candidate-check':
      return <CandidateCheckScene subject={subject} />;
    case 'random-sequence':
      return <RandomSequenceScene />;
    case 'recognizable-combination':
      return <RecognizableCombinationScene />;
    case 'building-blocks':
      return <BuildingBlocksScene />;
    case 'strategy-targeting':
      return <StrategyTargetingScene />;
    case 'strategy-overview':
      return (
        <StrategyOverviewScene
          transitioning={strategyTransition !== null}
          transitionStyle={strategyTransitionStyle(strategyTransition)}
          onTransitionEnd={onStrategyTransitionEnd}
        />
      );
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

function introNarrationFor(
  step: S05AnalysisControllerSnapshot['step'],
): readonly string[] | null {
  switch (step) {
    case 'candidate-check':
      return s05Content.intro.narration.candidateCheck;
    case 'random-sequence':
      return s05Content.intro.narration.randomSequence;
    case 'recognizable-combination':
      return s05Content.intro.narration.recognizableCombination;
    case 'building-blocks':
      return s05Content.intro.narration.buildingBlocks;
    case 'strategy-targeting':
      return s05Content.intro.narration.strategyTargeting;
    case 'strategy-overview':
      return s05Content.intro.narration.strategyOverview;
    default:
      return null;
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
  const [strategyTransition, setStrategyTransition] = useState<StrategyTransitionRect | null>(null);
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

  useEffect(() => {
    controller?.start();
  }, [controller]);

  useEffect(() => {
    if (snapshot?.step !== 'strategy-overview') setStrategyTransition(null);
  }, [snapshot?.step]);

  if (controller === null || snapshot === null) return null;

  const activeController = controller;
  const activeSnapshot = snapshot;
  const writingBoundary = timingState === 'writingEnd';
  const introNarration = introNarrationFor(snapshot.step);
  const introGuidanceVisible = introNarration !== null;

  function continueFromSpeech(): void {
    if (activeSnapshot.step !== 'strategy-overview') {
      activeController.continue();
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      activeController.continue();
      return;
    }
    const componentCard = hostRef.current?.querySelector<HTMLElement>(
      '[data-strategy="components"]',
    );
    if (componentCard === null || componentCard === undefined) {
      activeController.continue();
      return;
    }
    const rect = componentCard.getBoundingClientRect();
    setStrategyTransition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <article className={styles.page} aria-labelledby="s05-title">
        <header className={styles.pageHeader}>
          <h1 id="s05-title">{s05Content.page.title}</h1>
        </header>
        <div className={styles.content} aria-live="polite">
          {renderScene(
            snapshot,
            subject,
            controller,
            strategyTransition,
            () => controller.continue(),
          )}
        </div>
        {introNarration === null ? null : (
          <PassWoGuide
            guideName={s00Content.narration.guideName}
            taskLabel="Passwortwege"
            helpOpen
            helpId="s05-intro-passwo-speech"
            openHelpLabel={s00Content.narration.openGuideLabel}
            speech={introNarration}
            speechKey={`s05-${snapshot.step}`}
            speechPlacement="above"
            speechObstacleSelector="[data-s05-speech-obstacle]"
            speechAction={{
              kind: 'advance',
              disabled:
                !snapshot.controls.canContinue ||
                externalTimingError !== null ||
                strategyTransition !== null,
              onAction: continueFromSpeech,
            }}
            placement="incident"
            showHelpButton={false}
          />
        )}
        <footer className={styles.controls} data-hidden={introGuidanceVisible || undefined}>
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
