import type {
  PasswordEvidenceSpan,
  PasswordSemanticReflectionSelection,
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
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.png';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.png';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.png';
import typicalChangesAsset from '../../../../assets/s05/category-logos/typical-changes.png';
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

interface CategoryTransitionRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

function categoryTransitionStyle(rect: CategoryTransitionRect): CSSProperties {
  const translateX = window.innerWidth / 2 - (rect.left + rect.width / 2);
  const translateY = window.innerHeight / 2 - (rect.top + rect.height / 2);
  const scale = Math.min(
    (window.innerWidth * 0.7) / rect.width,
    (window.innerHeight * 0.32) / rect.height,
  );
  return {
    '--category-start-top': `${rect.top}px`,
    '--category-start-left': `${rect.left}px`,
    '--category-start-width': `${rect.width}px`,
    '--category-start-height': `${rect.height}px`,
    '--category-translate-x': `${translateX}px`,
    '--category-translate-y': `${translateY}px`,
    '--category-scale': scale,
  } as CSSProperties;
}

function findingLabel(kind: PasswordSingleFindingKind): string {
  return s05Content.findingLabels[kind];
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

const candidateAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!?#$%&';

function candidateForIndex(index: number, maximumLength: number): string {
  const length = 1 + (index % maximumLength);
  return Array.from(
    { length },
    (_, characterIndex) =>
      candidateAlphabet[(index * 7 + characterIndex * 11) % candidateAlphabet.length] ?? 'x',
  ).join('');
}

function AttackerAttempt({ maximumLength }: { readonly maximumLength: number }) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const interval = window.setInterval(() => setCandidateIndex((index) => index + 1), 820);
    return () => window.clearInterval(interval);
  }, [maximumLength]);

  const candidate = candidateForIndex(candidateIndex, maximumLength);
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

function GeneratedSequence() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const interval = window.setInterval(() => setFrameIndex((index) => index + 1), 110);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      className={styles.generatedSequence}
      data-s05-target="random-sequence"
      aria-label="Zufällig erzeugte Zeichenfolge"
      aria-live="off"
    >
      <code>
        {[...s05Content.intro.generatedPassword].map((character, index) => (
          <i key={index}>
            {frameIndex === 0
              ? character
              : candidateAlphabet[
                  (frameIndex * (index + 3) + index * 11) % candidateAlphabet.length
                ]}
          </i>
        ))}
      </code>
    </section>
  );
}

function RandomSequenceScene({ subject }: { readonly subject: S05AnalysisSubject }) {
  return (
    <div className={styles.attackerStage}>
      <CampusgramPassword password={subject.fictionalPassword} />
      <div className={styles.attackerAttempt}>
        <GeneratedSequence />
      </div>
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

function StrategyOverviewScene() {
  return (
    <div className={styles.strategyOverview} data-s05-target="strategy-overview">
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
    </div>
  );
}

function ComponentSequence({ fixed }: { readonly fixed: boolean }) {
  const fixedFrame = s05Content.intro.fixedCommonPasswordFrame;
  return (
    <div
      className={styles.componentSequence}
      role="img"
      aria-label={
        fixed
          ? 'Dreiteiliges Passwort: verdeckter Bestandteil, hervorgehobener häufiger Kern 123456789, verdeckter Bestandteil.'
          : 'Wechselnde Folge aus drei bis acht unterschiedlich langen verdeckten blauen Bestandteilen.'
      }
    >
      <div aria-hidden="true">
        {fixed ? (
          <div className={styles.componentFrame} data-fixed="true">
            <PasswordBuildingBlocks
              value={fixedFrame.parts.join('')}
              parts={fixedFrame.parts}
              display="separated"
              appearance="candidate"
              highlightedIndex={fixedFrame.highlightedIndex}
              ariaLabel=""
            />
          </div>
        ) : (
          s05Content.intro.componentFrames.map((frame, frameIndex) => {
            const parts = frame.partLengths.map((length) => '•'.repeat(length));
            return (
              <div
                key={frame.partLengths.join('-')}
                className={styles.componentFrame}
                style={{ '--frame-index': frameIndex } as CSSProperties}
              >
                <PasswordBuildingBlocks
                  value={parts.join('')}
                  parts={parts}
                  display="separated"
                  appearance="candidate"
                  ariaLabel=""
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ComponentStartScene({
  subject,
  fixed,
}: {
  readonly subject: S05AnalysisSubject;
  readonly fixed: boolean;
}) {
  return (
    <div className={styles.attackerStage} data-s05-target="component-start">
      <CampusgramPassword password={subject.fictionalPassword} />
      <ComponentSequence fixed={fixed} />
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

const categoryAssets = {
  'common-components': commonCoresAsset,
  'personal-examples': personalDetailsAsset,
  'account-context': accountContextAsset,
  'typical-changes': typicalChangesAsset,
} as const;

function CategoryChain({
  announcing,
  visible,
}: {
  readonly announcing: boolean;
  readonly visible: boolean;
}) {
  return (
    <div
      className={styles.categoryChain}
      data-hidden={visible ? undefined : true}
      aria-hidden={visible ? undefined : true}
      aria-label={visible ? 'Erste von vier Kategorien: Häufige Kerne' : undefined}
    >
      <article
        data-active="true"
        data-announcing={announcing || undefined}
        data-category-active="common-cores"
      >
        <img src={commonCoresAsset} alt="" />
        <h2>1. Häufige Kerne</h2>
      </article>
      {[2, 3, 4].map((number) => (
        <article key={number} aria-label={`Kategorie ${number} noch verdeckt`}>
          <strong aria-hidden="true">?</strong>
        </article>
      ))}
    </div>
  );
}

function CategoryTransitionOverlay({
  rect,
  onComplete,
}: {
  readonly rect: CategoryTransitionRect;
  readonly onComplete: () => void;
}) {
  return (
    <div
      className={styles.categoryTransitionOverlay}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) onComplete();
      }}
    >
      <article className={styles.categoryTransitionCard} style={categoryTransitionStyle(rect)}>
        <img src={commonCoresAsset} alt="" />
        <h2>1. Häufige Kerne</h2>
      </article>
    </div>
  );
}

function CategoryCard({
  title,
  image,
  active = false,
  summary,
}: {
  readonly title: string;
  readonly image: string;
  readonly active?: boolean;
  readonly summary?: string;
}) {
  return (
    <article className={styles.categoryCard} data-active={active || undefined}>
      <img src={image} alt="" />
      <div>
        <h2>{title}</h2>
        {summary === undefined ? null : <code>{summary}</code>}
      </div>
    </article>
  );
}

function CommonCoreMachineScene({ variants }: { readonly variants: readonly string[] }) {
  const examples = s05Content.intro.commonCores.examples;
  const visibleVariants = variants.slice(0, 48);
  return (
    <div className={styles.commonCoreWorkspace} data-s05-target="common-core-machine">
      <section className={styles.coreSource} aria-label={`Beispielkerne: ${examples.join(', ')}`}>
        <strong>Häufig verwendete Kerne</strong>
        <div aria-hidden="true">
          {[...examples, ...examples].map((example, index) => (
            <code key={`${example}-${index}`}>{example}</code>
          ))}
        </div>
      </section>
      <section className={styles.variantMachine} aria-label="Typische Veränderungen werden erzeugt">
        <div className={styles.machineHousing}>
          <span />
          <strong>Varianten</strong>
          <span />
        </div>
        <div className={styles.conveyor} aria-hidden="true">
          {examples.map((example) => <i key={example}>{example}</i>)}
        </div>
      </section>
      <section className={styles.variantStream} aria-label="Viele schnell erzeugte Varianten">
        <strong>Erzeugte Varianten</strong>
        <div aria-hidden="true">
          {[...visibleVariants, ...visibleVariants].map((variant, index) => (
            <code key={`${variant}-${index}`}>{variant}</code>
          ))}
        </div>
      </section>
    </div>
  );
}

const commonCoreFindingKinds = new Set<PasswordSingleFindingKind>([
  'common-password-core',
  'common-word',
  'common-name',
  'keyboard-pattern',
  'simple-character-sequence',
  'predictable-word-sequence',
  'year',
  'date',
]);

const semanticReflectionOrder = [
  'personal-meaning',
  'shared-theme',
  'sentence-or-familiar-phrase',
  'none-or-unsure',
] as const satisfies readonly PasswordSemanticReflectionSelection[];

function commonCoreFindings(scene: PasswordFindingSceneSnapshot) {
  return scene.prioritizedFindings.filter(({ kind }) => commonCoreFindingKinds.has(kind));
}

function PasswordVisibilityIcon({ revealed }: { readonly revealed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={styles.revealIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {revealed ? <path d="M4 4 20 20" /> : null}
    </svg>
  );
}

function HighlightedCommonCorePassword({
  password,
  scene,
}: {
  readonly password: string;
  readonly scene: PasswordFindingSceneSnapshot;
}) {
  const spans = commonCoreFindings(scene)
    .flatMap(({ evidence }) => evidence)
    .filter((evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span')
    .sort((left, right) => left.start - right.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue;
    if (cursor < span.start) {
      parts.push(<span key={`plain-${cursor}`}>{password.slice(cursor, span.start)}</span>);
    }
    parts.push(
      <mark key={`core-${span.start}-${span.end}`}>
        {password.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  }
  if (cursor < password.length) parts.push(<span key={`plain-${cursor}`}>{password.slice(cursor)}</span>);
  return <code className={styles.commonCorePassword}>{parts}</code>;
}

function CommonCoreApplicationScene({
  subject,
  scene,
  revealed,
  onToggle,
}: {
  readonly subject: S05AnalysisSubject;
  readonly scene: PasswordFindingSceneSnapshot;
  readonly revealed: boolean;
  readonly onToggle: () => void;
}) {
  const findings = commonCoreFindings(scene);
  return (
    <div className={styles.commonCoreApplication} data-s05-target="common-core-application">
      <section className={styles.commonCoreResult}>
        <p>{s05Content.intro.commonCores.application}</p>
        <div className={styles.passwordRevealRow}>
          {revealed ? (
            <HighlightedCommonCorePassword password={subject.fictionalPassword} scene={scene} />
          ) : (
            <code className={styles.commonCorePassword}>
              {'•'.repeat(Math.max(8, subject.fictionalPassword.length))}
            </code>
          )}
          <button
            type="button"
            className={styles.revealButton}
            aria-pressed={revealed}
            aria-label={revealed ? 'Fiktives Passwort verbergen' : 'Fiktives Passwort anzeigen'}
            onClick={onToggle}
          >
            <PasswordVisibilityIcon revealed={revealed} />
          </button>
        </div>
        {findings.length === 0 ? (
          <strong className={styles.noFinding}>{s05Content.intro.commonCores.noFinding}</strong>
        ) : (
          <ol>
            {findings.map((finding) => (
              <li key={finding.id}>
                <strong>{findingLabel(finding.kind)}</strong>
                <span>{finding.evidence.map(({ token }) => token).join(' · ')}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function PersonalDetailsTransitionScene({ scene }: { readonly scene: PasswordFindingSceneSnapshot }) {
  const firstToken =
    commonCoreFindings(scene)[0]?.evidence[0]?.token ?? s05Content.intro.commonCores.noFinding;
  const remainingDemonstrations = s05Content.componentDemonstrations.slice(1);
  return (
    <div className={styles.personalTransition} data-s05-target="personal-details">
      <div className={styles.categoryRail}>
        <CategoryCard title="Häufige Kerne" image={commonCoresAsset} summary={firstToken} />
        <CategoryCard title="Persönliche Angaben" image={personalDetailsAsset} active />
      </div>
      <section
        className={styles.remainingCategories}
        aria-label="Weitere Kategorien naheliegender Bestandteile"
      >
        {remainingDemonstrations.map((demonstration) => (
          <article key={demonstration.id}>
            <img src={categoryAssets[demonstration.id]} alt="" />
            <div>
              <h3>{demonstration.title}</h3>
              <p className={styles.exampleLine}>{demonstration.examples.join(' · ')}</p>
              <p>{demonstration.note}</p>
            </div>
          </article>
        ))}
      </section>
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
        <span>{content.lengthOrientationLabels[scene.disposition.lengthOrientation]}</span>
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
  passwordRevealed: boolean,
  onTogglePassword: () => void,
) {
  switch (snapshot.step) {
    case 'candidate-check':
      return <CandidateCheckScene subject={subject} />;
    case 'random-sequence':
      return <RandomSequenceScene subject={subject} />;
    case 'recognizable-combination':
      return <RecognizableCombinationScene />;
    case 'building-blocks':
      return <BuildingBlocksScene />;
    case 'strategy-targeting':
      return <StrategyTargetingScene />;
    case 'strategy-overview':
      return <StrategyOverviewScene />;
    case 'component-start-question':
    case 'component-frequency':
      return <ComponentStartScene subject={subject} fixed={false} />;
    case 'component-category-overview':
      return <ComponentStartScene subject={subject} fixed />;
    case 'common-cores-definition':
    case 'common-cores-variants':
      return <CommonCoreMachineScene variants={snapshot.commonCorePresentation.variants} />;
    case 'common-cores-application':
      return (
        <CommonCoreApplicationScene
          subject={subject}
          scene={snapshot.findingScene}
          revealed={passwordRevealed}
          onToggle={onTogglePassword}
        />
      );
    case 'personal-details-transition':
      return <PersonalDetailsTransitionScene scene={snapshot.findingScene} />;
    case 'structure-theme':
    case 'structure-sentence':
    case 'structure-repetition':
    case 'structure-context':
      return <StructureDemonstrationScene snapshot={snapshot} />;
    case 'structure-application':
      return (
        <StructureApplicationScene
          subject={subject}
          snapshot={snapshot}
          controller={controller}
        />
      );
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
    case 'component-start-question':
      return s05Content.intro.narration.componentStartQuestion;
    case 'component-frequency':
      return s05Content.intro.narration.componentFrequency;
    case 'component-category-overview':
      return s05Content.intro.narration.componentCategoryOverview;
    case 'common-cores-definition':
      return s05Content.intro.narration.commonCoresDefinition;
    case 'common-cores-variants':
      return s05Content.intro.narration.commonCoresVariants;
    default:
      return null;
  }
}

function pageTitleFor(step: S05AnalysisControllerSnapshot['step']): string {
  switch (step) {
    case 'candidate-check':
    case 'random-sequence':
    case 'recognizable-combination':
    case 'building-blocks':
    case 'strategy-targeting':
    case 'strategy-overview':
      return s05Content.page.introTitle;
    default:
      return s05Content.page.title;
  }
}

function showsCommonCoreCategoryChain(step: S05AnalysisControllerSnapshot['step']): boolean {
  return (
    step === 'component-category-overview' ||
    step === 'common-cores-definition' ||
    step === 'common-cores-variants' ||
    step === 'common-cores-application'
  );
}

function reservesCommonCoreCategoryChain(step: S05AnalysisControllerSnapshot['step']): boolean {
  return (
    step === 'component-start-question' ||
    step === 'component-frequency' ||
    showsCommonCoreCategoryChain(step)
  );
}

function StructureApplicationScene({
  subject,
  snapshot,
  controller,
}: {
  readonly subject: S05AnalysisSubject;
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const scene = snapshot.structureScene;
  const reflection = scene.semanticReflection;
  const substantiveSelections = reflection.selected.filter(
    (selection) => selection !== 'none-or-unsure',
  );
  const noSimpleStructure =
    scene.prioritizedRuntimeFindings.length === 1 &&
    scene.prioritizedRuntimeFindings[0]?.findingKind === 'no-simple-structure-recognized';
  const recognizedSomething = !noSimpleStructure || substantiveSelections.length > 0;
  const reflectionContent = s05Content.structure.application.reflection;
  const reflectionOptions = semanticReflectionOrder.map(
    (selection) => [selection, reflectionContent.options[selection]] as const,
  );

  return (
    <div className={styles.structureWorkspace} aria-label={scene.accessibleSummary}>
      <section className={styles.passWoExplanation}>
        <p className={styles.cardLabel}>PassWo erklärt</p>
        <p>
          {recognizedSomething
            ? s05Content.structure.application.recognizedExplanation
            : s05Content.structure.application.noneExplanation}
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
      <section className={styles.semanticReflection} aria-labelledby="s05-reflection-title">
        <p className={styles.cardLabel}>{reflectionContent.title}</p>
        <h2 id="s05-reflection-title">{reflectionContent.question}</h2>
        <p>{reflectionContent.privacyNote}</p>
        <fieldset disabled={reflection.confirmed}>
          <legend className={styles.visuallyHidden}>{reflectionContent.question}</legend>
          {reflectionOptions.map(([selection, label]) => (
            <label key={selection}>
              <input
                type="checkbox"
                checked={reflection.selected.includes(selection)}
                onChange={() => controller.toggleSemanticReflection(selection)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          disabled={reflection.confirmed || reflection.selected.length === 0}
          onClick={() => controller.confirmSemanticReflection()}
        >
          {reflectionContent.confirm}
        </button>
        {reflection.confirmed ? (
          <div className={styles.semanticReflectionResult} role="status">
            <strong>{reflectionContent.confirmed}</strong>
            <ul>
              {reflection.selected.map((selection) => (
                <li key={selection}>{reflectionContent.options[selection]}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
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
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [categoryTransition, setCategoryTransition] = useState<CategoryTransitionRect | null>(null);
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

  if (controller === null || snapshot === null) return null;

  const activeController = controller;
  const activeSnapshot = snapshot;
  const writingBoundary = timingState === 'writingEnd';
  const introNarration = introNarrationFor(snapshot.step);
  const introGuidanceVisible = introNarration !== null;

  function continueFromSpeech(): void {
    if (activeSnapshot.step !== 'component-category-overview') {
      activeController.continue();
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      activeController.continue();
      return;
    }
    const categoryCard = hostRef.current?.querySelector<HTMLElement>('[data-category-active]');
    if (categoryCard === null || categoryCard === undefined) {
      activeController.continue();
      return;
    }
    const rect = categoryCard.getBoundingClientRect();
    setCategoryTransition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <article className={styles.page} aria-labelledby="s05-title">
        <header
          className={styles.pageHeader}
          data-category-chain={reservesCommonCoreCategoryChain(snapshot.step) || undefined}
          data-category-transitioning={categoryTransition !== null || undefined}
          data-component-title={
            pageTitleFor(snapshot.step) === s05Content.page.title || undefined
          }
        >
          <h1 id="s05-title">{pageTitleFor(snapshot.step)}</h1>
          {reservesCommonCoreCategoryChain(snapshot.step) ? (
            <CategoryChain
              announcing={snapshot.step === 'component-category-overview'}
              visible={showsCommonCoreCategoryChain(snapshot.step)}
            />
          ) : null}
        </header>
        {categoryTransition === null ? null : (
          <CategoryTransitionOverlay
            rect={categoryTransition}
            onComplete={() => {
              setCategoryTransition(null);
              controller.continue();
            }}
          />
        )}
        <div
          className={styles.content}
          aria-live="polite"
          inert={introGuidanceVisible || undefined}
        >
          {renderScene(
            snapshot,
            subject,
            controller,
            passwordRevealed,
            () => setPasswordRevealed((revealed) => !revealed),
          )}
        </div>
        {introNarration === null ? null : (
          <div className={styles.passWoLayer}>
            <PassWoGuide
              guideName={s00Content.narration.guideName}
              taskLabel={
                pageTitleFor(snapshot.step) === s05Content.page.introTitle
                  ? 'Passwortwege'
                  : 'Bestandteile'
              }
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
                  categoryTransition !== null,
                onAction: continueFromSpeech,
              }}
              placement="bottom-left"
              showHelpButton={false}
            />
          </div>
        )}
        <footer
          className={styles.controls}
          data-hidden={introGuidanceVisible || undefined}
          inert={introGuidanceVisible || undefined}
        >
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
