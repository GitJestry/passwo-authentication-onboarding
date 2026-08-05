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
import { type ReactNode, useEffect, useRef, useState } from 'react';
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.png';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.png';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.png';
import typicalChangesAsset from '../../../../assets/s05/category-logos/typical-changes.png';
import attackerAsset from '../../../../assets/passwo/attacker.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { PasswordBuildingBlocks } from './PasswordBuildingBlocks.js';
import {
  type S05AnalysisControllerSnapshot,
  type S05AnalysisSubject,
  type S05InitialSection,
  S05AnalysisController,
} from './S05AnalysisController.js';
import { S05AnimationAdapter } from './S05AnimationAdapter.js';
import {
  projectCanonicalPasswordBlocks,
  summarizeCategoryCandidates,
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

const generatedSequenceAlphabet =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!?#$%&';

function CandidateCheckScene({ subject }: { readonly subject: S05AnalysisSubject }) {
  return (
    <div className={styles.attackerStage}>
      <CampusgramPassword password={subject.fictionalPassword} />
      <div className={styles.attackerAttempt} data-s05-target="attacker-attempt">
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
              : generatedSequenceAlphabet[
                  (frameIndex * (index + 3) + index * 11) % generatedSequenceAlphabet.length
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

function ComponentSequence() {
  const fixedFrame = s05Content.intro.fixedCommonPasswordFrame;
  return (
    <div
      className={styles.componentSequence}
      role="img"
      aria-label={s05Content.intro.componentLeadIn.fixedBlockAria}
    >
      <div aria-hidden="true">
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
      </div>
    </div>
  );
}

function ComponentStartScene({ subject }: { readonly subject: S05AnalysisSubject }) {
  return (
    <div className={styles.attackerStage} data-s05-target="component-start">
      <CampusgramPassword password={subject.fictionalPassword} />
      <ComponentSequence />
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
} as const;

const semanticReflectionOrder = [
  'shared-theme',
  'sentence-or-familiar-phrase',
  'none-or-unsure',
] as const satisfies readonly PasswordSemanticReflectionSelection[];

type CommonComponentMachineStep =
  | 'common-components-start'
  | 'common-components-examples'
  | 'common-components-changes';

const typicalCharacterReplacements: Readonly<Record<string, string>> = {
  a: '4',
  e: '3',
  i: '1',
  o: '0',
  s: '5',
};

function replaceTypicalCharacters(value: string): string {
  return [...value]
    .map(
      (character) =>
        typicalCharacterReplacements[character.toLocaleLowerCase('de-DE')] ?? character,
    )
    .join('');
}

function typicalChangeVariants(value: string): readonly string[] {
  const initial = value.at(0);
  const capitalized =
    initial === undefined
      ? value
      : `${initial.toLocaleUpperCase('de-DE')}${value.slice(1)}`;
  return [
    capitalized,
    value.toLocaleUpperCase('de-DE'),
    replaceTypicalCharacters(value),
    replaceTypicalCharacters(capitalized),
    `${value}1`,
    `${value}!`,
    `${value}12`,
    `${value}?`,
    `${value}123`,
    `${value}#`,
    `${value}2005`,
    `${value}.`,
    `${value}2026`,
    `${value}_`,
  ].filter((variant, index, variants) => variant !== value && variants.indexOf(variant) === index);
}

function CategoryMachine({
  categoryId,
  conveyorBlocks,
  stepKey,
}: {
  readonly categoryId: S05ComponentCategoryId;
  readonly conveyorBlocks: readonly string[];
  readonly stepKey: string;
}) {
  const content = s05Content.componentStrategy.commonComponents.machine;
  const [travelingIndex, setTravelingIndex] = useState(0);
  const [arrivedIndex, setArrivedIndex] = useState(0);
  const travelingBlock = conveyorBlocks[travelingIndex] ?? conveyorBlocks[0] ?? '';
  const arrivedBlock = conveyorBlocks[arrivedIndex] ?? conveyorBlocks[0] ?? '';
  const variants = typicalChangeVariants(arrivedBlock);
  const category = s05Content.componentStrategy.categories.find(({ id }) => id === categoryId);

  function advanceConveyor(): void {
    setArrivedIndex(travelingIndex);
    setTravelingIndex((index) => (index + 1) % conveyorBlocks.length);
  }

  return (
    <section
      key={stepKey}
      className={styles.commonComponentMachine}
      data-s05-target="component-conveyor"
      data-s05-speech-obstacle
      data-machine-step={stepKey}
      aria-label={category?.title ?? content.ariaLabel}
    >
      <div className={styles.machineInput}>
        <img src={categoryAssets[categoryId]} alt="" />
        <div aria-hidden="true">
          {conveyorBlocks.map((block) => (
            <code key={block} data-active={block === travelingBlock || undefined}>
              {block}
            </code>
          ))}
        </div>
        <span className={styles.machineListContinuation} aria-hidden="true">⋮</span>
      </div>
      <div className={styles.machineConveyor} aria-hidden="true">
        <span />
        <code
          key={travelingBlock}
          data-transition-delay={
            (stepKey.endsWith('-start') || stepKey.endsWith('-opening')) &&
            travelingIndex === 0 &&
            arrivedIndex === 0
              ? true
              : undefined
          }
          onAnimationEnd={advanceConveyor}
        >
          {travelingBlock}
        </code>
      </div>
      <div className={styles.machineBody}>
        <strong>{content.generatorLabel}</strong>
      </div>
      <div className={styles.machineFunnel} aria-hidden="true" />
      <div
        className={styles.machineOutput}
        data-source={arrivedBlock}
        data-emphasized={stepKey === 'common-components-changes' || undefined}
      >
        <img src={typicalChangesAsset} alt="" />
        <div className={styles.machineOutputViewport} key={arrivedBlock}>
          <div className={styles.machineOutputStream}>
            {[...variants, ...variants].map((variant, index) => (
              <code key={`${variant}-${index}`} aria-hidden={index >= variants.length || undefined}>
                {variant}
              </code>
            ))}
          </div>
        </div>
        <span className={styles.machineListContinuation} aria-hidden="true">⋮</span>
      </div>
    </section>
  );
}

function CommonComponentsMachine({ step }: { readonly step: CommonComponentMachineStep }) {
  return (
    <CategoryMachine
      categoryId="common-components"
      conveyorBlocks={s05Content.componentStrategy.commonComponents.machine.conveyorBlocks}
      stepKey={step}
    />
  );
}

function CategoryTransition({
  categoryId,
}: {
  readonly categoryId: S05ComponentCategoryId;
}) {
  const category = s05Content.componentStrategy.categories.find(({ id }) => id === categoryId);
  return (
    <div className={styles.categoryTransition} aria-hidden="true">
      <div className={styles.categoryTransitionPanel}>
        <img src={categoryAssets[categoryId]} alt="" />
        <strong>{category?.title ?? s05Content.page.title}</strong>
      </div>
    </div>
  );
}

function categoryForStep(
  step: S05AnalysisControllerSnapshot['step'],
): S05ComponentCategoryId | null {
  if (step.startsWith('common-components-')) return 'common-components';
  if (step.startsWith('personal-details-')) return 'personal-details';
  if (step.startsWith('account-context-')) return 'account-context';
  return null;
}

function ComponentReviewCard({
  snapshot,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  const completedCategories = s05Content.componentStrategy.categories.filter(({ id }) =>
    snapshot.componentStrategy.cards[id].status.startsWith('checked-'),
  );
  return (
    <aside
      className={styles.componentReviewCard}
      aria-label={s05Content.componentStrategy.presentation.categoriesAriaLabel}
    >
      <h2>{s05Content.componentStrategy.presentation.reviewCardTitle}</h2>
      <div className={styles.componentReviewEntries}>
        {completedCategories.map((category) => {
          const card = snapshot.componentStrategy.cards[category.id];
          const view = snapshot.componentStrategy.canonicalView;
          const findingBlocks =
            view === null
              ? []
              : projectCanonicalPasswordBlocks(view, card.findings, false).filter(
                  ({ labels }) => labels.length > 0,
                );
          return (
            <article
              key={category.id}
              data-status={card.status}
            >
              <div className={styles.componentReviewHeading}>
                <img src={categoryAssets[category.id]} alt="" />
                <h3>{category.title}</h3>
              </div>
              {findingBlocks.length === 0 ? (
                <strong className={styles.nothingFound}>
                  {s05Content.componentStrategy.summary.nothingFound}
                </strong>
              ) : (
                <PasswordBuildingBlocks
                  value={findingBlocks.map(({ value }) => value).join('')}
                  parts={findingBlocks.map(({ value }) => value)}
                  display="decomposed"
                  appearance="analysis"
                  animate={false}
                  highlightedIndices={findingBlocks.map((_, index) => index)}
                  ariaLabel={`${category.title}: ${findingBlocks.map(({ value }) => value).join(', ')}`}
                />
              )}
            </article>
          );
        })}
      </div>
    </aside>
  );
}

function CategoryHeader({ snapshot }: { readonly snapshot: S05AnalysisControllerSnapshot }) {
  const activeCategoryId = categoryForStep(snapshot.step);
  const activeCategory = s05Content.componentStrategy.categories.find(
    ({ id }) => id === activeCategoryId,
  );
  if (activeCategory === undefined) return null;
  return (
    <aside
      className={styles.singleCategoryHeader}
      data-category={activeCategory.id}
      aria-label={activeCategory.title}
    >
      <strong>{activeCategory.title}</strong>
    </aside>
  );
}

function ComponentMachineScene({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className={styles.componentMachineWorkspace}>{children}</div>
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
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) return null;
  const focus = snapshot.step === 'components-summary' ? null : categoryForStep(snapshot.step);
  const findings = releasedComponentFindings(snapshot);
  const visibleFindings =
    focus === null ? findings : findings.filter(({ categoryId }) => categoryId === focus);
  const selectingPersonalDetails = snapshot.step === 'personal-details-check';
  const displayBlocks = selectingPersonalDetails
    ? view.blocks.map((block) => ({ ...block, labels: [] as readonly string[] }))
    : projectCanonicalPasswordBlocks(
        view,
        visibleFindings,
        snapshot.step === 'components-summary',
      );
  const personalSelection = snapshot.componentStrategy.personalSelection;
  const selectedPersonalIndices = view.blocks.flatMap((block, index) =>
    personalSelection.blockIds.includes(block.id) ? [index] : [],
  );
  const renderedBlocks = selectingPersonalDetails ? view.blocks : displayBlocks;
  const blockLabels = selectingPersonalDetails
    ? view.blocks.map(() => '')
    : displayBlocks.map(({ labels }) => labels);
  const segmentGroups = renderedBlocks.map(({ start, end, value }) => {
    const segments = view.blocks
      .filter((block) => block.start >= start && block.end <= end)
      .map((block) => block.value);
    return segments.length === 0 ? [value] : segments;
  });
  const highlightedIndices = selectingPersonalDetails
    ? []
    : displayBlocks.flatMap(({ labels }, index) => (labels.length > 0 ? [index] : []));
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
          <span>Campusgram-Passwort</span>
        </strong>
      </header>
      <div className={styles.canonicalBlocks} data-s05-speech-obstacle>
        <PasswordBuildingBlocks
          value={view.password}
          parts={renderedBlocks.map(({ value }) => value)}
          display="decomposed"
          appearance="analysis"
          animate={false}
          labels={blockLabels}
          segmentGroups={segmentGroups}
          highlightedIndices={
            selectingPersonalDetails
              ? selectedPersonalIndices
              : highlightedIndices
          }
          {...(selectingPersonalDetails
            ? {
                selection: {
                  selectedIndices: selectedPersonalIndices,
                  checkboxLabel: s05Content.componentStrategy.personalDetails.selectionLabel,
                  onToggle: (index: number) => {
                    const block = view.blocks[index];
                    if (block !== undefined) controller.togglePersonalBlock(block.id);
                  },
                },
              }
            : {})}
          ariaLabel={s05Content.componentStrategy.presentation.canonicalAriaLabel}
        />
      </div>
    </section>
  );
}

function PersonalDetailsCheck({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const selection = snapshot.componentStrategy.personalSelection;
  const content = s05Content.componentStrategy.personalDetails;
  return (
    <section className={styles.personalComponentCheck}>
      <p className={styles.visuallyHidden}>{content.privacyNote}</p>
      <button
        type="button"
        onClick={() => controller.completePersonalDetailsCheck()}
      >
        {selection.blockIds.length === 0 ? content.applyNone : content.apply}
      </button>
    </section>
  );
}

function ComponentStrategyScene({
  subject,
  snapshot,
  controller,
}: {
  readonly subject: S05AnalysisSubject;
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  return (
    <div className={styles.componentReviewLayout}>
      <div className={styles.componentStrategyLayout} data-s05-target="component-strategy">
        <div className={styles.componentStrategyWorkspace}>
          {snapshot.componentStrategy.canonicalView === null ? (
            <CampusgramPassword password={subject.fictionalPassword} />
          ) : (
            <CanonicalPasswordView snapshot={snapshot} controller={controller} />
          )}
          {snapshot.step === 'personal-details-check' ? (
            <PersonalDetailsCheck snapshot={snapshot} controller={controller} />
          ) : null}
        </div>
      </div>
      <ComponentReviewCard snapshot={snapshot} />
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
    <div className={styles.componentReviewLayout}>
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
      <StructureReviewCard snapshot={snapshot} />
    </div>
  );
}

const structureReviewSteps = [
  'structure-theme',
  'structure-sentence',
  'structure-repetition',
] as const satisfies readonly S05AnalysisControllerSnapshot['step'][];

function StructureReviewCard({ snapshot }: { readonly snapshot: S05AnalysisControllerSnapshot }) {
  const currentIndex = structureReviewSteps.findIndex((step) => step === snapshot.step);
  const visibleSteps = currentIndex < 0 ? [] : structureReviewSteps.slice(0, currentIndex + 1);
  return (
    <aside
      className={`${styles.componentReviewCard} ${styles.structureReviewCard}`}
      aria-label={s05Content.structure.reviewCardTitle}
    >
      <h2>{s05Content.structure.reviewCardTitle}</h2>
      <ol className={styles.structureReviewEntries}>
        {visibleSteps.map((step, index) => {
          const demonstration = s05Content.structure.demonstrations.find(
            ({ id }) => id === `s05-${step}`,
          );
          if (demonstration === undefined) return null;
          const current = index === currentIndex;
          return (
            <li
              key={step}
              data-current={current || undefined}
              aria-current={current ? 'step' : undefined}
            >
              <span aria-hidden="true">{index + 1}</span>
              <h3>{demonstration.title}</h3>
            </li>
          );
        })}
      </ol>
    </aside>
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
    case 'component-category-overview':
      return <ComponentStartScene subject={subject} />;
    case 'common-components-start':
    case 'common-components-examples':
    case 'common-components-changes':
      return (
        <ComponentMachineScene>
          <CommonComponentsMachine step={snapshot.step} />
        </ComponentMachineScene>
      );
    case 'common-components-intro':
    case 'common-components-result':
    case 'personal-details-check':
    case 'personal-details-result':
    case 'account-context-intro':
    case 'account-context-result':
    case 'components-summary':
      return (
        <ComponentStrategyScene
          subject={subject}
          snapshot={snapshot}
          controller={controller}
        />
      );
    case 'personal-details-opening':
    case 'personal-details-derivation':
    case 'personal-details-intro':
      return (
        <ComponentMachineScene>
          <CategoryMachine
            categoryId="personal-details"
            conveyorBlocks={s05Content.componentStrategy.personalDetails.machine.conveyorBlocks}
            stepKey={snapshot.step}
          />
        </ComponentMachineScene>
      );
    case 'account-context-opening':
    case 'account-context-examples':
      return (
        <ComponentMachineScene>
          <CategoryMachine
            categoryId="account-context"
            conveyorBlocks={s05Content.componentStrategy.accountContext.machine.conveyorBlocks}
            stepKey={snapshot.step}
          />
        </ComponentMachineScene>
      );
    case 'structure-intro':
      return <StrategyTargetingScene />;
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
  const findings = snapshot.componentStrategy.cards['common-components'].findings;
  if (view === null || findings.length === 0) return [...content.results.none, content.transition];

  const foundValues = [
    ...new Set(
      projectCanonicalPasswordBlocks(view, findings, false)
        .filter(({ labels }) => labels.length > 0)
        .map(({ value }) => value),
    ),
  ];
  if (foundValues.length === 0) return [...content.results.none, content.transition];

  const quotedValues = foundValues.map((value) => `„${value}“`);
  const parts =
    quotedValues.length === 1
      ? quotedValues[0] ?? ''
      : `${quotedValues.slice(0, -1).join(', ')} und ${quotedValues.at(-1) ?? ''}`;
  const finding = (foundValues.length === 1
    ? content.results.foundOne
    : content.results.foundMany
  ).replace('[Teile]', parts);
  const candidateSummary = summarizeCategoryCandidates(view, findings);
  return [
    finding,
    ...(candidateSummary.hasSingleCandidateMatch
      ? [content.results.completeSingleCandidate]
      : candidateSummary.coversWholePassword
        ? [content.results.completeMultipleCandidates]
        : []),
    content.transition,
  ];
}

function personalDetailsResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.personalDetails;
  const view = snapshot.componentStrategy.canonicalView;
  const findings = snapshot.componentStrategy.cards['personal-details'].findings;
  const selectedValues =
    view === null
      ? []
      : projectCanonicalPasswordBlocks(view, findings, false)
          .filter(({ labels }) => labels.length > 0)
          .map(({ value }) => `„${value}“`);
  const result =
    selectedValues.length === 0
      ? content.results.none
      : content.results.selected.replace('[Angaben]', selectedValues.join(', '));
  const candidateSummary =
    view === null ? null : summarizeCategoryCandidates(view, findings);
  return [
    result,
    ...(candidateSummary?.hasSingleCandidateMatch
      ? [content.results.completeSingleCandidate]
      : candidateSummary?.coversWholePassword
        ? [content.results.completeMultipleCandidates]
        : []),
    content.transition,
  ];
}

function accountContextResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.accountContext;
  const view = snapshot.componentStrategy.canonicalView;
  const findings = snapshot.componentStrategy.cards['account-context'].findings;
  if (view === null || findings.length === 0) return [...content.results.none, content.transition];

  const foundValues = [
    ...new Set(
      projectCanonicalPasswordBlocks(view, findings, false)
        .filter(({ labels }) => labels.length > 0)
        .map(({ value }) => value),
    ),
  ];
  if (foundValues.length === 0) return [...content.results.none, content.transition];

  const terms = foundValues.map((value) => `„${value}“`).join(', ');
  const finding = (foundValues.length === 1
    ? content.results.foundOne
    : content.results.foundMany
  ).replace('[Begriffe]', terms);
  const candidateSummary = summarizeCategoryCandidates(view, findings);
  return [
    finding,
    ...(candidateSummary.hasSingleCandidateMatch
      ? [content.results.completeSingleCandidate]
      : candidateSummary.coversWholePassword
        ? [content.results.completeMultipleCandidates]
        : []),
    content.transition,
  ];
}

function componentSummaryNarration(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.summary;
  const view = snapshot.componentStrategy.canonicalView;
  const sourceCategoryIds = s05Content.componentStrategy.categories
    .filter(({ id }) => snapshot.componentStrategy.cards[id].status === 'checked-findings')
    .map(({ id }) => id);
  const sourceCategoryNames = sourceCategoryIds.map((id) => content.categoryNames[id]);
  if (view === null) return [content.startingPoints, content.none, content.noneTransition];
  const matchedCategoryIds = s05Content.componentStrategy.categories
    .filter(({ id }) =>
      summarizeCategoryCandidates(view, snapshot.componentStrategy.cards[id].findings)
        .hasSingleCandidateMatch,
    )
    .map(({ id }) => id);
  const verdict =
    matchedCategoryIds.length > 0 ? content.singleCandidateMatch : content.startingPoints;
  if (sourceCategoryNames.length === 0) return [verdict, content.none, content.noneTransition];
  const finalCategory = sourceCategoryNames.at(-1);
  const categoryList =
    finalCategory === undefined
      ? ''
      : sourceCategoryNames.length === 1
        ? finalCategory
        : `${sourceCategoryNames.slice(0, -1).join(', ')} sowie ${finalCategory}`;
  return [
    verdict,
    content.found.replace('[Kategorienamen]', categoryList),
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
    case 'component-category-overview':
      return s05Content.intro.narration.componentCategoryOverview;
    case 'common-components-start':
      return [s05Content.componentStrategy.commonComponents.explanation[0]];
    case 'common-components-examples':
      return [s05Content.componentStrategy.commonComponents.explanation[1]];
    case 'common-components-changes':
      return [s05Content.componentStrategy.commonComponents.explanation[2]];
    case 'common-components-intro':
      return [s05Content.componentStrategy.commonComponents.explanation[3]];
    case 'common-components-result':
      return commonComponentsResult(snapshot);
    case 'personal-details-opening':
      return s05Content.componentStrategy.personalDetails.opening;
    case 'personal-details-derivation':
      return s05Content.componentStrategy.personalDetails.derivation;
    case 'personal-details-intro':
      return s05Content.componentStrategy.personalDetails.explanation;
    case 'personal-details-result':
      return personalDetailsResult(snapshot);
    case 'account-context-opening':
      return s05Content.componentStrategy.accountContext.opening;
    case 'account-context-examples':
      return [s05Content.componentStrategy.accountContext.explanation[0]];
    case 'account-context-intro':
      return [s05Content.componentStrategy.accountContext.explanation[1]];
    case 'account-context-result':
      return accountContextResult(snapshot);
    case 'components-summary':
      return componentSummaryNarration(snapshot);
    case 'structure-intro':
      return s05Content.structure.intro;
    default:
      return null;
  }
}

function showsComponentCategoryHeader(step: S05AnalysisControllerSnapshot['step']): boolean {
  return (
    step.startsWith('common-components-') ||
    step.startsWith('personal-details-') ||
    step.startsWith('account-context-')
  );
}

function showsComponentGuidance(step: S05AnalysisControllerSnapshot['step']): boolean {
  return showsComponentCategoryHeader(step) || step === 'components-summary';
}

function transitionCategoryForStep(
  step: S05AnalysisControllerSnapshot['step'],
): S05ComponentCategoryId | null {
  if (step === 'common-components-start') return 'common-components';
  if (step === 'personal-details-opening') return 'personal-details';
  if (step === 'account-context-opening') return 'account-context';
  return null;
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
          onAction: () => activeController.completeCommonComponentsCheck(),
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

  const categoryHeaderVisible = showsComponentCategoryHeader(snapshot.step);
  const componentGuidanceVisible = showsComponentGuidance(snapshot.step);
  const transitionCategoryId = transitionCategoryForStep(snapshot.step);

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <article
        className={styles.page}
        aria-labelledby={categoryHeaderVisible ? 's05-title' : undefined}
      >
        {categoryHeaderVisible ? (
          <header className={styles.pageHeader} data-category-chain>
            <h1 id="s05-title">{s05Content.page.title}</h1>
            <CategoryHeader snapshot={snapshot} />
          </header>
        ) : null}
        {transitionCategoryId === null ? null : (
          <CategoryTransition categoryId={transitionCategoryId} />
        )}
        <div
          className={styles.content}
          aria-live="polite"
          inert={guidanceVisible && snapshot.step !== 'components-summary' ? true : undefined}
        >
          {renderScene(snapshot, subject, controller)}
        </div>
        {speech === null ? null : (
          <div
            className={styles.passWoLayer}
            data-component-guidance={componentGuidanceVisible || undefined}
          >
            <PassWoGuide
              guideName={s00Content.narration.guideName}
              taskLabel={componentGuidanceVisible ? 'Bestandteile' : 'Passwortwege'}
              helpOpen
              helpId="s05-intro-passwo-speech"
              openHelpLabel={s00Content.narration.openGuideLabel}
              speech={speech}
              speechKey={`s05-${snapshot.step}`}
              speechEmphasis={passWoSpeechEmphasisFor(`s05-${snapshot.step}`)}
              speechPlacement={componentGuidanceVisible ? 'right' : 'above'}
              {...(componentGuidanceVisible
                ? {}
                : { speechObstacleSelector: '[data-s05-speech-obstacle]' })}
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
