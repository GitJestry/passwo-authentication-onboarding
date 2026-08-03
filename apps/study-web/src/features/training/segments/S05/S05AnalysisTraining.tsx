import type {
  PasswordSemanticReflectionSelection,
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
} from '@passwo/contracts';
import { s00Content, s05Content } from '@passwo/training-content';
import type {
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
  type S05InitialSection,
  S05AnalysisController,
} from './S05AnalysisController.js';
import { S05AnimationAdapter } from './S05AnimationAdapter.js';
import {
  maskedCanonicalBlocks,
  type S05CategoryFinding,
  type S05ComponentCategoryId,
} from './S05ComponentStrategy.js';
import styles from './S05AnalysisTraining.module.css';

export type S05TimingState = 'active' | 'writingEnd' | 'endWriteFailed';

export interface S05CompletionPort {
  complete(): void;
}

export interface S05AnalysisTrainingProps {
  readonly subject: S05AnalysisSubject;
  readonly initialSection?: S05InitialSection;
  readonly timingState?: S05TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onRetryTiming?: () => void;
  readonly completionPort?: S05CompletionPort;
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
          ? s05Content.intro.componentLeadIn.fixedBlockAria
          : s05Content.intro.componentLeadIn.changingBlocksAria
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
  'personal-details': personalDetailsAsset,
  'account-context': accountContextAsset,
  'typical-changes': typicalChangesAsset,
} as const;

const semanticReflectionOrder = [
  'shared-theme',
  'sentence-or-familiar-phrase',
  'none-or-unsure',
] as const satisfies readonly PasswordSemanticReflectionSelection[];

type CommonComponentMachineStep =
  | 'common-components-start'
  | 'common-components-examples'
  | 'common-components-boundary'
  | 'common-components-changes';

const commonMachineIndexByStep = {
  'common-components-start': 0,
  'common-components-examples': 1,
  'common-components-boundary': 2,
  'common-components-changes': 2,
} as const satisfies Readonly<Record<CommonComponentMachineStep, number>>;

function CommonComponentsMachine({ step }: { readonly step: CommonComponentMachineStep }) {
  const content = s05Content.componentStrategy.commonComponents.machine;
  const activeIndex = commonMachineIndexByStep[step];
  const activeExample = content.examples[activeIndex];
  if (activeExample === undefined) return null;
  const releasedVariants = content.examples
    .slice(0, activeIndex + 1)
    .flatMap(({ variants }) => variants);
  return (
    <section
      key={step}
      className={styles.commonComponentMachine}
      data-s05-target="component-conveyor"
      data-machine-step={step}
      aria-label={content.ariaLabel}
    >
      <div className={styles.machineInput}>
        <strong>{content.inputLabel}</strong>
        <div>
          {content.examples.map(({ base }, index) => (
            <code key={base} data-active={index === activeIndex || undefined}>
              {base}
            </code>
          ))}
        </div>
      </div>
      <div className={styles.machineConveyor} aria-hidden="true">
        <span />
        <code>{activeExample.base}</code>
      </div>
      <div className={styles.machineBody}>
        <span aria-hidden="true" />
        <strong>{content.machineLabel}</strong>
        <i aria-hidden="true" />
      </div>
      <div className={styles.machineOutput}>
        <strong>{content.outputLabel}</strong>
        <div>
          {releasedVariants.map((variant) => (
            <code key={variant}>{variant}</code>
          ))}
        </div>
      </div>
    </section>
  );
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

function categoryForStep(
  step: S05AnalysisControllerSnapshot['step'],
): S05ComponentCategoryId | null {
  if (step.startsWith('common-components-')) return 'common-components';
  if (step.startsWith('personal-details-')) return 'personal-details';
  if (step.startsWith('account-context-')) return 'account-context';
  if (step.startsWith('typical-changes-')) return 'typical-changes';
  return null;
}

function visibleCardChips(findings: readonly S05CategoryFinding[]): readonly string[] {
  const labels = [...new Set(findings.map(({ label }) => label))];
  if (labels.length <= 3) return labels;
  return [...labels.slice(0, 2), s05Content.componentStrategy.moreFindings];
}

function CategoryCards({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const summary = snapshot.step === 'components-summary';
  return (
    <aside
      className={styles.componentCategoryCards}
      aria-label={s05Content.componentStrategy.presentation.categoriesAriaLabel}
    >
      {s05Content.componentStrategy.categories.map((category, index) => {
        const card = snapshot.componentStrategy.cards[category.id];
        const focused = summary && snapshot.componentStrategy.summaryFocus === category.id;
        return (
          <article
            key={category.id}
            data-status={card.status}
            data-focused={focused || undefined}
            data-cross-cutting={category.id === 'typical-changes' || undefined}
          >
            <div className={styles.componentCategoryHeading}>
              <img src={categoryAssets[category.id]} alt="" />
              <div>
                <h2>{`${index + 1}. ${category.title}`}</h2>
                {category.id === 'typical-changes' ? (
                  <small>{s05Content.componentStrategy.presentation.crossCuttingLabel}</small>
                ) : null}
                <span>{s05Content.componentStrategy.statusLabels[card.status]}</span>
              </div>
            </div>
            {card.findings.length === 0 ? null : (
              <ul>
                {visibleCardChips(card.findings).map((label) => <li key={label}>{label}</li>)}
              </ul>
            )}
            {summary ? (
              <button
                type="button"
                aria-pressed={focused}
                onClick={() => controller.focusSummaryCategory(category.id)}
              >
                {focused
                  ? s05Content.componentStrategy.presentation.showAllCategories
                  : s05Content.componentStrategy.presentation.highlightFindings}
              </button>
            ) : null}
          </article>
        );
      })}
    </aside>
  );
}

function releasedComponentFindings(
  snapshot: S05AnalysisControllerSnapshot,
): readonly S05CategoryFinding[] {
  return s05Content.componentStrategy.categories.flatMap(({ id }) => {
    const card = snapshot.componentStrategy.cards[id];
    return card.status === 'checked-findings' ? card.findings : [];
  });
}

function CanonicalPasswordView({
  snapshot,
  revealed,
  onToggle,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly revealed: boolean;
  readonly onToggle: () => void;
}) {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) return null;
  const blocks = revealed ? view.blocks : maskedCanonicalBlocks(view.blocks);
  const focus = snapshot.componentStrategy.summaryFocus ?? categoryForStep(snapshot.step);
  const findings = releasedComponentFindings(snapshot);
  const blockFindings = findings.filter(({ categoryId }) => categoryId !== 'typical-changes');
  const changes = findings.filter(({ categoryId }) => categoryId === 'typical-changes');
  return (
    <section
      className={styles.canonicalPassword}
      aria-label={s05Content.componentStrategy.presentation.canonicalAriaLabel}
    >
      <header>
        <strong className={styles.canonicalAccount}>
          <span aria-hidden="true">
            <NetworkSymbol symbolId="campusgram" />
          </span>
          <span>{`Campusgram ${s05Content.intro.campusgramPassword.visibleSuffix}`}</span>
        </strong>
        <button
          type="button"
          className={styles.revealButton}
          aria-pressed={revealed}
          aria-label={
            revealed
              ? s05Content.componentStrategy.presentation.hidePassword
              : s05Content.componentStrategy.presentation.showPassword
          }
          onClick={onToggle}
        >
          <PasswordVisibilityIcon revealed={revealed} />
          <span>
            {revealed
              ? s05Content.componentStrategy.presentation.hidePassword
              : s05Content.componentStrategy.presentation.showPassword}
          </span>
        </button>
      </header>
      <div className={styles.canonicalBlocks} data-revealed={revealed || undefined}>
        {blocks.map((block, index) => {
          const labels = blockFindings.filter(({ blockIds }) => blockIds.includes(block.id));
          const primary = labels.some(({ categoryId }) => categoryId === focus);
          return (
            <span
              key={block.id}
              className={styles.canonicalBlock}
              data-marked={labels.length > 0 || undefined}
              data-primary={primary || undefined}
            >
              <code
                aria-label={
                  revealed
                    ? block.value
                    : `${s05Content.componentStrategy.presentation.blockLabel} ${index + 1}, ${s05Content.componentStrategy.presentation.hiddenBlockLabel}`
                }
              >
                {block.value}
              </code>
              {labels.map((finding) => (
                <small key={finding.id} data-category={finding.categoryId}>
                  <img src={categoryAssets[finding.categoryId]} alt="" />
                  {finding.label}
                </small>
              ))}
            </span>
          );
        })}
      </div>
      {changes.length === 0 ? null : (
        <div
          className={styles.changeBindings}
          aria-label={s05Content.componentStrategy.presentation.changesAriaLabel}
        >
          {changes.slice(0, 3).map((finding) => (
            <span
              key={finding.id}
              data-primary={focus === 'typical-changes' || undefined}
              data-binding={finding.binding}
            >
              <img src={typicalChangesAsset} alt="" />
              <strong>{finding.label}</strong>
              <small>
                {finding.binding === 'password'
                  ? s05Content.componentStrategy.presentation.boundToPassword
                  : s05Content.componentStrategy.presentation.boundToComponent}
              </small>
            </span>
          ))}
          {changes.length > 3 ? (
            <span data-primary={focus === 'typical-changes' || undefined} data-binding="password">
              <img src={typicalChangesAsset} alt="" />
              <strong>{s05Content.componentStrategy.typicalChanges.results.overflow}</strong>
            </span>
          ) : null}
        </div>
      )}
    </section>
  );
}

function PersonalDetailsCheck({
  snapshot,
  controller,
  revealed,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
  readonly revealed: boolean;
}) {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) return null;
  const selection = snapshot.componentStrategy.personalSelection;
  const blocks = revealed ? view.blocks : maskedCanonicalBlocks(view.blocks);
  const content = s05Content.componentStrategy.personalDetails;
  return (
    <section className={styles.personalComponentCheck} aria-labelledby="s05-personal-question">
      <h2 id="s05-personal-question">{content.question}</h2>
      <p>{content.privacyNote}</p>
      <fieldset>
        <legend className={styles.visuallyHidden}>{content.question}</legend>
        <div className={styles.personalBlockOptions}>
          {blocks.map((block, index) => (
            <label key={block.id}>
              <input
                type="checkbox"
                checked={selection.blockIds.includes(block.id)}
                onChange={() => controller.togglePersonalBlock(block.id)}
              />
              <code
                aria-label={`${s05Content.componentStrategy.presentation.blockLabel} ${index + 1}`}
              >
                {block.value}
              </code>
            </label>
          ))}
        </div>
        {selection.blockIds.length > 1 ? (
          <label>
            <input
              type="checkbox"
              checked={selection.grouped}
              onChange={() => controller.togglePersonalGrouping()}
            />
            <span>{content.groupSelection}</span>
          </label>
        ) : null}
        <label>
          <input
            type="radio"
            name="s05-personal-alternative"
            checked={selection.alternative === 'none'}
            onChange={() => controller.selectPersonalAlternative('none')}
          />
          <span>{content.none}</span>
        </label>
        <label>
          <input
            type="radio"
            name="s05-personal-alternative"
            checked={selection.alternative === 'unsure'}
            onChange={() => controller.selectPersonalAlternative('unsure')}
          />
          <span>{content.unsure}</span>
        </label>
      </fieldset>
      <button
        type="button"
        disabled={selection.blockIds.length === 0 && selection.alternative === null}
        onClick={() => controller.completePersonalDetailsCheck()}
      >
        {content.apply}
      </button>
    </section>
  );
}

function ComponentStrategyScene({
  subject,
  snapshot,
  controller,
  revealed,
  onToggle,
}: {
  readonly subject: S05AnalysisSubject;
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
  readonly revealed: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <div className={styles.componentStrategyLayout} data-s05-target="component-strategy">
      <div className={styles.componentStrategyWorkspace}>
        {snapshot.componentStrategy.canonicalView === null ? (
          <CampusgramPassword password={subject.fictionalPassword} />
        ) : (
          <CanonicalPasswordView snapshot={snapshot} revealed={revealed} onToggle={onToggle} />
        )}
        {snapshot.step === 'personal-details-check' ? (
          <PersonalDetailsCheck snapshot={snapshot} controller={controller} revealed={revealed} />
        ) : null}
      </div>
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
    case 'common-components-start':
    case 'common-components-examples':
    case 'common-components-boundary':
    case 'common-components-changes':
      return <CommonComponentsMachine step={snapshot.step} />;
    case 'common-components-intro':
    case 'common-components-result':
    case 'personal-details-intro':
    case 'personal-details-check':
    case 'personal-details-result':
    case 'account-context-intro':
    case 'account-context-result':
    case 'typical-changes-intro':
    case 'typical-changes-result':
    case 'components-summary':
      return (
        <ComponentStrategyScene
          subject={subject}
          snapshot={snapshot}
          controller={controller}
          revealed={passwordRevealed}
          onToggle={onTogglePassword}
        />
      );
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

function commonComponentsResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.commonComponents;
  const view = snapshot.componentStrategy.canonicalView;
  const count = snapshot.componentStrategy.cards['common-components'].findings.length;
  const result =
    view?.completeCommonPassword === true
      ? content.results.complete
      : count === 0
        ? content.results.none
        : count === 1
          ? content.results.one
          : content.results.many;
  return [...result, content.transition];
}

function personalDetailsResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.personalDetails;
  const selection = snapshot.componentStrategy.personalSelection;
  const count = snapshot.componentStrategy.cards['personal-details'].findings.length;
  const result =
    selection.alternative === 'unsure'
      ? content.results.unsure
      : selection.alternative === 'none'
        ? content.results.none
        : count === 1
          ? content.results.one
          : content.results.many;
  return [
    result,
    ...(count > 0 ? [content.results.boundary] : []),
    content.transition,
  ];
}

function accountContextResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.accountContext;
  const count = snapshot.componentStrategy.cards['account-context'].findings.length;
  const result = count === 0 ? content.results.none : count === 1 ? content.results.one : content.results.many;
  return [...result, content.transition];
}

function typicalChangesResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.typicalChanges;
  const findings = snapshot.componentStrategy.cards['typical-changes'].findings;
  if (findings.length === 0) return content.results.none;
  const descriptions = findings.slice(0, 3).map(({ description, label }) => description ?? label);
  if (findings.length > 3) descriptions.push(content.results.overflowDescription);
  const lastDescription = descriptions.at(-1);
  const descriptionList =
    descriptions.length < 2
      ? (lastDescription ?? '')
      : `${descriptions.slice(0, -1).join(', ')} und ${lastDescription ?? ''}`;
  return [
    content.results.found,
    `${content.results.dynamicPrefix} ${descriptionList}${content.results.dynamicSuffix}`,
    content.results.suffix,
  ];
}

function componentSummaryNarration(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.summary;
  const sourceCategoryNames = s05Content.componentStrategy.categories
    .filter(({ id }) => id !== 'typical-changes')
    .filter(({ id }) => snapshot.componentStrategy.cards[id].status === 'checked-findings')
    .map(({ title }) => title);
  const hasChanges =
    snapshot.componentStrategy.cards['typical-changes'].status === 'checked-findings';
  if (sourceCategoryNames.length === 0 && !hasChanges) return [content.none, content.noneTransition];
  return [
    ...(sourceCategoryNames.length === 0
      ? []
      : [content.found.replace('[Kategorienamen]', sourceCategoryNames.join(', '))]),
    ...(hasChanges ? [content.foundChanges] : []),
    content.foundBoundary,
    content.foundTransition,
  ];
}

function speechFor(
  snapshot: S05AnalysisControllerSnapshot,
): readonly string[] | null {
  const step = snapshot.step;
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
    case 'common-components-start':
      return [s05Content.componentStrategy.commonComponents.explanation[0]];
    case 'common-components-examples':
      return [s05Content.componentStrategy.commonComponents.explanation[1]];
    case 'common-components-boundary':
      return [s05Content.componentStrategy.commonComponents.explanation[2]];
    case 'common-components-changes':
      return [s05Content.componentStrategy.commonComponents.explanation[3]];
    case 'common-components-intro':
      return [s05Content.componentStrategy.commonComponents.explanation[4]];
    case 'common-components-result':
      return commonComponentsResult(snapshot);
    case 'personal-details-intro':
      return s05Content.componentStrategy.personalDetails.explanation;
    case 'personal-details-result':
      return personalDetailsResult(snapshot);
    case 'account-context-intro':
      return s05Content.componentStrategy.accountContext.explanation;
    case 'account-context-result':
      return accountContextResult(snapshot);
    case 'typical-changes-intro':
      return s05Content.componentStrategy.typicalChanges.explanation;
    case 'typical-changes-result':
      return typicalChangesResult(snapshot);
    case 'components-summary':
      return componentSummaryNarration(snapshot);
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

function showsComponentCategoryCards(step: S05AnalysisControllerSnapshot['step']): boolean {
  return (
    step === 'component-category-overview' ||
    step.startsWith('common-components-') ||
    step.startsWith('personal-details-') ||
    step.startsWith('account-context-') ||
    step.startsWith('typical-changes-') ||
    step === 'components-summary'
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
  initialSection = 'intro',
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
      initialSection,
      onComplete: () => completionPort?.complete(),
    });
    const unsubscribe = nextController.subscribe(setSnapshot);
    setController(nextController);
    setSnapshot(nextController.getSnapshot());
    return () => {
      unsubscribe();
      void nextController.dispose();
    };
  }, [completionPort, initialSection, subject]);

  useEffect(() => {
    controller?.start();
  }, [controller]);

  if (controller === null || snapshot === null) return null;

  const activeController = controller;
  const activeSnapshot = snapshot;
  const writingBoundary = timingState === 'writingEnd';
  const speech = speechFor(activeSnapshot);
  const guidanceVisible = speech !== null;
  const personalCheckVisible = activeSnapshot.step === 'personal-details-check';

  function continueFromSpeech(): void {
    activeController.continue();
  }

  function speechAction() {
    const disabled =
      !activeSnapshot.controls.canContinue ||
      externalTimingError !== null;
    switch (activeSnapshot.step) {
      case 'common-components-intro':
        return {
          kind: 'perform' as const,
          label: s05Content.componentStrategy.commonComponents.check,
          disabled,
          onAction: () => {
            setPasswordRevealed(true);
            activeController.completeCommonComponentsCheck();
          },
        };
      case 'personal-details-intro':
        return {
          kind: 'advance' as const,
          label: s05Content.componentStrategy.personalDetails.begin,
          disabled,
          onAction: continueFromSpeech,
        };
      case 'account-context-intro':
        return {
          kind: 'perform' as const,
          label: s05Content.componentStrategy.accountContext.check,
          disabled,
          onAction: () => activeController.completeAccountContextCheck(),
        };
      case 'typical-changes-intro':
        return {
          kind: 'perform' as const,
          label: s05Content.componentStrategy.typicalChanges.check,
          disabled,
          onAction: () => activeController.completeTypicalChangesCheck(),
        };
      case 'components-summary':
        return {
          kind: 'advance' as const,
          label: s05Content.componentStrategy.summary.continue,
          disabled,
          onAction: continueFromSpeech,
        };
      default:
        return {
          kind: 'advance' as const,
          disabled,
          onAction: continueFromSpeech,
        };
    }
  }

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <article className={styles.page} aria-labelledby="s05-title">
        <header
          className={styles.pageHeader}
          data-category-chain={showsComponentCategoryCards(snapshot.step) || undefined}
          data-component-title={
            pageTitleFor(snapshot.step) === s05Content.page.title || undefined
          }
        >
          <h1 id="s05-title">{pageTitleFor(snapshot.step)}</h1>
          {showsComponentCategoryCards(snapshot.step) ? (
            <CategoryCards snapshot={snapshot} controller={controller} />
          ) : null}
        </header>
        <div
          className={styles.content}
          aria-live="polite"
          inert={guidanceVisible && snapshot.step !== 'components-summary' ? true : undefined}
        >
          {renderScene(
            snapshot,
            subject,
            controller,
            passwordRevealed,
            () => setPasswordRevealed((revealed) => !revealed),
          )}
        </div>
        {speech === null ? null : (
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
              speech={speech}
              speechKey={`s05-${snapshot.step}`}
              speechPlacement="above"
              speechObstacleSelector="[data-s05-speech-obstacle]"
              speechAction={speechAction()}
              placement="bottom-left"
              showHelpButton={false}
            />
          </div>
        )}
        <footer
          className={styles.controls}
          data-hidden={guidanceVisible || personalCheckVisible || undefined}
          inert={guidanceVisible || personalCheckVisible || undefined}
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
