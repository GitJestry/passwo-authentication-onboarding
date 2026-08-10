import type {
  PasswordSingleFindingKind,
  RuntimeStructureFindingKind,
} from '@passwo/contracts';
import { s00Content, s05Content } from '@passwo/training-content';
import type {
  PasswordFreeSearchApplicationSceneSnapshot,
} from '@passwo/visualization';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.png';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.png';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.png';
import typicalChangesAsset from '../../../../assets/s05/category-logos/typical-changes.png';
import attackerAsset from '../../../../assets/passwo/attacker.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import scaleClockAsset from '../../../../assets/s05/scale-clock.svg';
import scaleWarningAsset from '../../../../assets/s05/scale-warning.svg';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { PasswordVisibilityIcon } from '../../PasswordVisibilityIcon.js';
import { PasswordBuildingBlocks, passwordVisualStyleFor } from './PasswordBuildingBlocks.js';
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

const CAMPUSGRAM_PASSWORD_REFERENCE_LENGTH = 18;

interface CampusgramPasswordVisualStyle extends CSSProperties {
  readonly '--s05-campusgram-password-scale': string;
}

function campusgramPasswordVisualStyle(password: string): CampusgramPasswordVisualStyle {
  const characterCount = Math.max([...password].length, 1);
  const scale =
    characterCount <= CAMPUSGRAM_PASSWORD_REFERENCE_LENGTH
      ? 1
      : CAMPUSGRAM_PASSWORD_REFERENCE_LENGTH / characterCount;

  return {
    '--s05-campusgram-password-scale': String(scale),
  };
}

function CampusgramPassword({
  password,
  className,
}: {
  readonly password: string;
  readonly className?: string;
}) {
  const hiddenValue = '•'.repeat(Math.max([...password].length, 1));
  return (
    <section
      className={`${styles.campusgramPassword}${className === undefined ? '' : ` ${className}`}`}
      style={campusgramPasswordVisualStyle(password)}
    >
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
const lowercaseScaleAlphabet = 'abcdefghijklmnopqrstuvwxyz';
const MEMORABLE_PASSWORD_VISUAL_SCALE = 0.9;

function createCryptoLowercaseCharacter(): string {
  const bytes = new Uint8Array(1);
  let value = 255;
  do {
    globalThis.crypto.getRandomValues(bytes);
    value = bytes[0] ?? 255;
  } while (value >= 234);
  return lowercaseScaleAlphabet.charAt(value % lowercaseScaleAlphabet.length);
}

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

function RandomSequenceScene() {
  return (
    <div className={styles.recognizableStage} data-s05-target="random-sequence">
      <PasswordBuildingBlocks
        value={s05Content.intro.memorablePassword}
        parts={s05Content.intro.memorablePasswordParts}
        display="assembled"
        visualScale={MEMORABLE_PASSWORD_VISUAL_SCALE}
        ariaLabel={s05Content.intro.memorablePassword}
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
        display="decomposed"
        visualScale={MEMORABLE_PASSWORD_VISUAL_SCALE}
        ariaLabel={`${s05Content.intro.memorablePassword} in Bausteinen`}
      />
    </div>
  );
}

const strategyCandidateOrders = [
  [0, 3],
  [4, 1, 5],
  [2, 5, 3, 0],
  [3, 0, 1, 5, 4],
  [2, 5, 1],
] as const satisfies readonly (readonly number[])[];

function StrategyTargetingScene({ subject }: { readonly subject: S05AnalysisSubject }) {
  const parts = s05Content.intro.memorablePasswordParts;
  return (
    <div
      className={`${styles.attackerStage} ${styles.strategyCandidateScene}`}
      data-s05-target="strategy-targeting"
      data-s05-speech-obstacle
      role="img"
      aria-label="Die sichtbaren Passwortbausteine werden verdeckt und als unterschiedliche Kandidaten kombiniert."
    >
      <div className={styles.strategyTargetingSource} aria-hidden="true">
        <PasswordBuildingBlocks
          value={s05Content.intro.memorablePassword}
          parts={parts}
          display="decomposed"
          animate={false}
          visualScale={MEMORABLE_PASSWORD_VISUAL_SCALE}
          ariaLabel=""
        />
      </div>
      <CampusgramPassword
        password={subject.fictionalPassword}
        className={styles.strategyTargetingPassword ?? ''}
      />
      <div className={styles.strategyCandidateAttempts} aria-hidden="true">
        {strategyCandidateOrders.map((order, rowIndex) => (
          <div className={styles.strategyCandidateAttempt} key={rowIndex}>
            {order.map((partIndex) => {
              const part = parts[partIndex] ?? '';
              return (
                <span
                  className={styles.strategyCandidateBlock}
                  data-origin={partIndex}
                  key={`${rowIndex}-${partIndex}`}
                >
                  {'•'.repeat([...part].length)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.attackerConnection} aria-hidden="true">
        <span />
      </div>
      <img
        className={`${styles.attackerPortrait} ${styles.strategyTargetingAttacker}`}
        src={attackerAsset}
        alt=""
      />
    </div>
  );
}

function StructureIntroScene() {
  return (
    <div className={styles.strategyTargeting} data-s05-target="strategy-targeting">
      <div className={styles.buildingBlocksVisual} data-s05-speech-obstacle>
        <PasswordBuildingBlocks
          value={s05Content.intro.memorablePassword}
          parts={s05Content.intro.memorablePasswordParts}
          display="decomposed"
          annotations={s05Content.intro.strategyAnnotations}
          visualScale={MEMORABLE_PASSWORD_VISUAL_SCALE}
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

type CommonComponentMachineStep =
  | 'common-components-start'
  | 'common-components-examples'
  | 'common-components-changes';

const typicalCharacterReplacements: Readonly<Record<string, readonly string[]>> = {
  a: ['4', '@'],
  b: ['8'],
  e: ['3'],
  g: ['9'],
  i: ['1', '!'],
  l: ['1'],
  o: ['0'],
  s: ['5', '$'],
  t: ['7'],
  z: ['2'],
};

interface CharacterReplacement {
  readonly index: number;
  readonly replacement: string;
}

function replaceCharacters(
  value: string,
  replacements: readonly CharacterReplacement[],
): string {
  return [...value]
    .map((character, index) => {
      const replacement = replacements.find((entry) => entry.index === index);
      return replacement?.replacement ?? character;
    })
    .join('');
}

function characterReplacementVariants(value: string): readonly string[] {
  const possibleReplacements = [...value].flatMap((character, index) =>
    (typicalCharacterReplacements[character.toLocaleLowerCase('de-DE')] ?? []).map(
      (replacement) => ({ index, replacement }),
    ),
  );
  const primaryReplacements = possibleReplacements.filter(
    (replacement, index, replacements) =>
      !replacements.slice(0, index).some((entry) => entry.index === replacement.index),
  );
  const combinedVariants = [2, 3]
    .filter((count) => primaryReplacements.length >= count)
    .map((count) => replaceCharacters(value, primaryReplacements.slice(0, count)));

  return [
    ...possibleReplacements.map((replacement) => replaceCharacters(value, [replacement])),
    ...combinedVariants,
  ];
}

function typicalChangeVariants(value: string): readonly string[] {
  const initial = value.at(0);
  const final = value.at(-1);
  const capitalized =
    initial === undefined
      ? value
      : `${initial.toLocaleUpperCase('de-DE')}${value.slice(1)}`;
  const firstAndLastCapitalized =
    initial === undefined || final === undefined
      ? value
      : `${initial.toLocaleUpperCase('de-DE')}${value.slice(1, -1)}${final.toLocaleUpperCase('de-DE')}`;
  const alternatingCase = [...value]
    .map((character, index) =>
      index % 2 === 0 ? character.toLocaleUpperCase('de-DE') : character.toLocaleLowerCase('de-DE'),
    )
    .join('');
  const replacementVariants = characterReplacementVariants(value);
  const typicalEndings = ['1', '12', '123', '01', '99', '2005', '2026', '!', '?', '#', '$', '_', '.'];
  return [
    capitalized,
    value.toLocaleUpperCase('de-DE'),
    firstAndLastCapitalized,
    alternatingCase,
    ...replacementVariants,
    ...typicalEndings.map((ending) => `${value}${ending}`),
    `${capitalized}1`,
    `${capitalized}!`,
    `${value}1!`,
    `${value}123!`,
    `${value}2026#`,
    `${replacementVariants[0] ?? value}!`,
  ].filter((variant, index, variants) => variant !== value && variants.indexOf(variant) === index);
}

function CategoryMachine({
  categoryId,
  conveyorBlocks,
  step,
}: {
  readonly categoryId: S05ComponentCategoryId;
  readonly conveyorBlocks: readonly string[];
  readonly step: string;
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
      className={styles.commonComponentMachine}
      data-s05-target="component-conveyor"
      data-s05-speech-obstacle
      data-machine-step={step}
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
            (step.endsWith('-start') || step.endsWith('-opening')) &&
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
        data-emphasized={step === 'common-components-changes' || undefined}
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
      step={step}
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
          const findingValues =
            view === null ? [] : categoryFindingValues(view, card.findings);
          return (
            <article
              key={category.id}
              data-status={card.status}
              data-category={category.id}
            >
              <div className={styles.componentReviewHeading}>
                <img src={categoryAssets[category.id]} alt="" />
                <h3>{category.title}</h3>
              </div>
              {findingValues.length === 0 ? (
                <strong className={styles.nothingFound}>
                  {s05Content.componentStrategy.summary.nothingFound}
                </strong>
              ) : (
                <PasswordBuildingBlocks
                  value={findingValues.join('')}
                  parts={findingValues}
                  display="decomposed"
                  appearance="analysis"
                  continuous
                  animate={false}
                  visualScale={0.75}
                  categoryIds={findingValues.map(() => [category.id])}
                  ariaLabel={`${category.title}: ${findingValues.join(', ')}`}
                />
              )}
            </article>
          );
        })}
      </div>
    </aside>
  );
}

function ComponentMachineScene({
  children,
}: {
  readonly children: ReactNode;
}) {
  const content = s05Content.freeSearch.characterMix;
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
  const displayBlocks = projectCanonicalPasswordBlocks(view, visibleFindings);
  const displayBlockFindings = displayBlocks.map(({ findings: blockFindings }) => blockFindings);
  const accessibleFindings = displayBlocks
    .map(({ value }, index) => ({ value, findings: displayBlockFindings[index] ?? [] }))
    .filter(({ findings: blockFindings }) => blockFindings.length > 0)
    .map(({ value, findings: blockFindings }) =>
      `${value}: ${blockFindings.map(({ label }) => label).join(', ')}`,
    );
  const selectionCharacters = [...view.password];
  const hasReleasedFindings = visibleFindings.length > 0;
  const parts = selectingPersonalDetails
    ? selectionCharacters
    : hasReleasedFindings
      ? displayBlocks.map(({ value }) => value)
      : [view.password];
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
          visualReferenceValue={view.password}
          parts={parts}
          display="decomposed"
          appearance="analysis"
          continuous={selectingPersonalDetails}
          animate={hasReleasedFindings}
          categoryIds={
            selectingPersonalDetails
              ? selectionCharacters.map(() => [])
              : hasReleasedFindings
                ? displayBlocks.map(({ categoryIds }) => categoryIds)
                : [[]]
          }
          matchCategories={
            selectingPersonalDetails
              ? selectionCharacters.map(() => [])
              : hasReleasedFindings
                ? displayBlocks.map(({ matchCategories }) => matchCategories)
                : [[]]
          }
          labels={
            selectingPersonalDetails
              ? selectionCharacters.map(() => [])
              : hasReleasedFindings
                ? displayBlocks.map(({ matchCategories }) => matchCategories)
                : [[]]
          }
          findings={
            selectingPersonalDetails
              ? selectionCharacters.map(() => [])
              : hasReleasedFindings
                ? displayBlockFindings
                : [[]]
          }
          {...(selectingPersonalDetails
            ? {
                rangeSelection: {
                  candidates: snapshot.componentStrategy.personalSelection.candidates,
                  onCreate: (start: number, end: number) =>
                    controller.addPersonalCandidate(start, end),
                  onRemove: (candidateId: string) =>
                    controller.removePersonalCandidate(candidateId),
                  status: s05Content.componentStrategy.personalDetails.selectionStatus,
                },
              }
            : {})}
          ariaLabel={
            accessibleFindings.length === 0
              ? s05Content.componentStrategy.presentation.canonicalAriaLabel
              : `${s05Content.componentStrategy.presentation.canonicalAriaLabel}. ${accessibleFindings.join('; ')}`
          }
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
      <p>{content.selectionHint}</p>
      <p className={styles.visuallyHidden}>{content.privacyNote}</p>
      <button
        type="button"
        onClick={() => controller.completePersonalDetailsCheck()}
      >
        {selection.candidates.length === 0 ? content.applyNone : content.apply}
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
  const reviewVisible = snapshot.step === 'components-summary';
  return (
    <div
      className={styles.componentReviewLayout}
      data-review-visible={reviewVisible || undefined}
    >
      <div className={styles.componentStrategyLayout} data-s05-target="component-strategy">
        <div
          className={styles.componentStrategyWorkspace}
          data-summary={reviewVisible || undefined}
        >
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
      {reviewVisible ? <ComponentReviewCard snapshot={snapshot} /> : null}
    </div>
  );
}

function structureFindingLabel(kind: RuntimeStructureFindingKind): string {
  return s05Content.structure.findingLabels[kind];
}

const structurePatternKeys = ['theme', 'sentence', 'repetition'] as const;

function visibleStructurePatternCount(step: S05AnalysisControllerSnapshot['step']): number {
  if (step.startsWith('structure-repetition')) return 3;
  if (step.startsWith('structure-sentence')) return 2;
  return 1;
}

function StructurePatternsScene({ step }: { readonly step: S05AnalysisControllerSnapshot['step'] }) {
  const visiblePatterns = structurePatternKeys.slice(0, visibleStructurePatternCount(step));
  const activePattern = step.startsWith('structure-theme')
    ? 'theme'
    : step.startsWith('structure-sentence')
      ? 'sentence'
      : 'repetition';
  return (
    <div
      className={styles.structurePatterns}
      data-s05-target={step.startsWith('structure-theme') ? 'structure-theme' : step.startsWith('structure-sentence') ? 'structure-sentence' : 'structure-repetition'}
      data-s05-speech-obstacle
    >
      {visiblePatterns.map((patternKey) => {
        const pattern = s05Content.structure.presentationExamples[patternKey];
        return (
          <section
            className={styles.structurePattern}
            data-active={patternKey === activePattern || undefined}
            key={patternKey}
          >
            <h2>{pattern.title}</h2>
            <div className={styles.structureExampleRows}>
              {pattern.rows.map((row, rowIndex) => (
                <div
                  className={styles.structureExampleRow}
                  data-pattern={patternKey}
                  aria-label={row.join(', ')}
                  key={`${patternKey}-${rowIndex}`}
                >
                  <div className={styles.structureExampleBlocks}>
                    {patternKey === 'theme' ? (
                      <span className={styles.structureConnectionGroup} aria-hidden="true">
                        {row.slice(0, rowIndex === 1 ? 4 : 3).map((part, partIndex) => (
                          <span data-block-index={partIndex} key={`${part}-${partIndex}`}>
                            {part}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {patternKey === 'theme'
                      ? row.slice(rowIndex === 1 ? 4 : 3).map((part, trailingIndex) => {
                          const partIndex = trailingIndex + (rowIndex === 1 ? 4 : 3);
                          return (
                            <span data-block-index={partIndex} key={`${part}-${partIndex}`}>
                              {part}
                            </span>
                          );
                        })
                      : row.map((part, partIndex) => (
                          <span data-block-index={partIndex} key={`${part}-${partIndex}`}>
                            {part}
                          </span>
                        ))}
                  </div>
                  {patternKey === 'repetition' ? (
                    <span className={styles.structureRepetitionMultiplier} aria-hidden="true">
                      ×{row.length}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function StructurePasswordCheck({
  subject,
  snapshot,
}: {
  readonly subject: S05AnalysisSubject;
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  const repetitionFindings = snapshot.structureScene.runtimeAnalysis.findings.filter(
    ({ findingKind }) =>
      findingKind === 'exact-component-repetition' ||
      findingKind === 'recognized-repetition-pattern',
  );
  const repetitionSpans = repetitionFindings
    .flatMap(({ evidence }) => evidence)
    .filter((evidence) => evidence.type === 'span')
    .sort((left, right) => left.start - right.start);
  const passwordParts: string[] = [];
  const highlightedIndices: number[] = [];
  let cursor = 0;
  for (const span of repetitionSpans) {
    if (span.start < cursor) continue;
    if (cursor < span.start) {
      passwordParts.push(subject.fictionalPassword.slice(cursor, span.start));
    }
    highlightedIndices.push(passwordParts.length);
    passwordParts.push(subject.fictionalPassword.slice(span.start, span.end));
    cursor = span.end;
  }
  if (cursor < subject.fictionalPassword.length) {
    passwordParts.push(subject.fictionalPassword.slice(cursor));
  }
  if (passwordParts.length === 0) passwordParts.push(subject.fictionalPassword);

  return (
    <section className={styles.structurePasswordCheck}>
      <strong className={styles.canonicalAccount}>
        <span aria-hidden="true"><NetworkSymbol symbolId="campusgram" /></span>
        {s05Content.structure.application.passwordLabel}
      </strong>
      <PasswordBuildingBlocks
        value={subject.fictionalPassword}
        visualReferenceValue={subject.fictionalPassword}
        parts={passwordParts}
        display="decomposed"
        appearance="analysis"
        animate
        highlightedIndices={highlightedIndices}
        categoryIds={passwordParts.map((_, index) =>
          highlightedIndices.includes(index) ? (['repetition'] as const) : [],
        )}
        ariaLabel={`${s05Content.structure.application.passwordLabel}: ${subject.fictionalPassword}`}
      />
    </section>
  );
}

function StructureSequenceScene({
  step,
  subject,
  snapshot,
}: {
  readonly step: S05AnalysisControllerSnapshot['step'];
  readonly subject: S05AnalysisSubject;
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  const applicationVisible = step === 'structure-application';

  return (
    <div
      className={`${styles.structureSequence}${
        applicationVisible ? ` ${styles.structureApplication}` : ''
      }`}
      data-s05-target={applicationVisible ? 'structure-application' : undefined}
      data-s05-speech-obstacle={applicationVisible || undefined}
    >
      <StructurePatternsScene step={applicationVisible ? 'structure-repetition' : step} />
      {applicationVisible ? (
        <StructurePasswordCheck subject={subject} snapshot={snapshot} />
      ) : null}
    </div>
  );
}

/** Saved for a later training segment; intentionally not part of the current S05 mission. */
export function SavedPassphraseGeneratorScene() {
  const content = s05Content.freeSearch.passphraseGenerator;
  return (
    <section className={styles.passphraseScene} data-s05-target="passphrase-generator" data-s05-speech-obstacle>
      <h2>{content.title}</h2>
      <div className={styles.passphraseGenerator} aria-label="Beispiel eines Passphrasen-Generators">
        <strong>{content.wordCount}</strong>
        <span className={styles.generatorAction}>{content.generate}</span>
        <output>{content.password}</output>
        <span className={styles.strengthBar} aria-label={content.strengthLabel} />
        <span className={styles.copyAction}>
          <span className={styles.copyIcon} aria-hidden="true" />
          {content.copy}
        </span>
      </div>
    </section>
  );
}

function CharacterChecklist({
  password,
  earlyHit,
}: {
  readonly password: string;
  readonly earlyHit: boolean;
}) {
  const content = s05Content.freeSearch.characterMix;
  return (
    <article className={styles.characterChecklist} data-early-hit={earlyHit || undefined}>
      {earlyHit ? (
        <div className={styles.earlyHitHeader}>
          <img src={attackerAsset} alt="Symbolische Darstellung eines Angreifers am Computer" />
          <strong>{content.earlyHit}</strong>
        </div>
      ) : null}
      <h2>{content.panelTitle}</h2>
      <div className={styles.passwordField}>
        <code>{password}</code>
        <PasswordVisibilityIcon className={styles.passwordVisibilityIcon} revealed />
      </div>
      <div className={styles.strengthHeading}>
        <strong>{content.strengthTitle}</strong>
        <strong>{content.strengthRating}</strong>
      </div>
      <span className={styles.passwordStrength} aria-label={content.strengthBarLabel} />
      <ul>
        {content.checks.map((check) => (
          <li key={check}><span aria-hidden="true">✓</span>{check}</li>
        ))}
      </ul>
      {earlyHit ? <span className={styles.earlyHitOverlay} aria-hidden="true" /> : null}
    </article>
  );
}

function CharacterMixScene({ step }: { readonly step: S05AnalysisControllerSnapshot['step'] }) {
  const content = s05Content.freeSearch.characterMix;
  const showComparison = step !== 'free-search-transition';
  const showEarlyHit = step === 'character-mix-comparison';
  return (
    <div className={styles.characterMixScene} data-s05-target="character-mix" data-s05-speech-obstacle>
      <CharacterChecklist password={content.predictablePassword} earlyHit={showEarlyHit} />
      {showComparison ? <CharacterChecklist password={content.randomPassword} earlyHit={false} /> : null}
    </div>
  );
}

interface PasswordVariationStyle extends CSSProperties {
  readonly '--variation-index': number;
}

function passwordVariationStyle(index: number): PasswordVariationStyle {
  return { '--variation-index': index };
}

function PasswordVariationScene({ final }: { readonly final: boolean }) {
  const content = s05Content.freeSearch.characterMix;
  const variations = content.variations;
  const finalVariation = content.finalVariation;
  return (
    <section
      className={styles.passwordVariationScene}
      data-s05-target="character-mix"
      data-s05-speech-obstacle
      aria-label={
        final
          ? `Die Variation ${finalVariation} bleibt sichtbar.`
          : `Das Passwort meinPasswort wechselt schnell durch ${variations.length} Variationen.`
      }
    >
      {final ? (
        <div className={styles.finalVariationMarker}>
          <img src={attackerAsset} alt="Symbolische Darstellung eines Angreifers am Computer" />
          <strong>{content.finalVariationStatus}</strong>
        </div>
      ) : null}
      <div className={styles.variationSequence} aria-hidden="true" data-final={final || undefined}>
        {(final ? [finalVariation] : variations).map((variation, index) => (
          <code key={variation} style={passwordVariationStyle(index)}>
            {variation}
          </code>
        ))}
      </div>
    </section>
  );
}

function LowercaseAlphabetMark({
  inline = false,
  decorative = false,
}: {
  readonly inline?: boolean;
  readonly decorative?: boolean;
}) {
  return (
    <span
      className={`${styles.lowercaseAlphabetMark}${inline ? ` ${styles.lowercaseAlphabetMarkInline}` : ''}`}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : 'Kleinbuchstaben von a bis z'}
    >
      <strong>a</strong><i>–</i><b>z</b>
    </span>
  );
}

function EstimateRuler({
  selected,
  showAlphabet = true,
  animate = false,
}: {
  readonly selected: S05AnalysisControllerSnapshot['estimate']['selected'];
  readonly showAlphabet?: boolean;
  readonly animate?: boolean;
}) {
  const content = s05Content.freeSearch.estimate;
  return (
    <div
      className={styles.estimateRuler}
      data-s05-target="estimate-ruler"
      data-animate={animate || undefined}
    >
      {showAlphabet ? (
        <div className={styles.lowercaseAlphabet}>
          <LowercaseAlphabetMark />
          <span>{content.alphabetLabel}</span>
        </div>
      ) : null}
      <div className={styles.estimateMarkerRow}>
        {content.options.map((option) => (
          <span key={option}>{selected === option ? content.marker : ''}</span>
        ))}
      </div>
      <div className={styles.estimateTicks} aria-hidden="true">
        {content.options.map((option) => <i key={option} />)}
      </div>
    </div>
  );
}

function LengthScaleScene({ showAlphabet }: { readonly showAlphabet: boolean }) {
  return (
    <div
      className={styles.lengthScaleScene}
      data-s05-target="character-mix"
      data-s05-speech-obstacle
    >
      <EstimateRuler selected={null} showAlphabet={showAlphabet} animate={!showAlphabet} />
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
    <div className={styles.estimateScene} data-s05-target="estimate" data-s05-speech-obstacle>
      <EstimateRuler selected={null} />
      <fieldset className={styles.estimateScale} disabled={snapshot.estimate.confirmed}>
        <legend className={styles.visuallyHidden}>{content.question}</legend>
        <div>
          {content.options.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="s05-estimate"
                checked={snapshot.estimate.selected === option}
                onChange={() => controller.selectEstimate(option)}
              />
              <span>{option}</span>
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

const lowercaseScaleLengths = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
const LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH = lowercaseScaleLengths[0];
const LOWERCASE_SCALE_STARTING_LENGTH = 12;
const LOWERCASE_SCALE_MAXIMUM_LENGTH = 20;
const germanNumberGroups = [
  [21, 'Trilliarde', 'Trilliarden'],
  [18, 'Trillion', 'Trillionen'],
  [15, 'Billiarde', 'Billiarden'],
  [12, 'Billion', 'Billionen'],
  [9, 'Milliarde', 'Milliarden'],
  [6, 'Million', 'Millionen'],
  [3, 'Tausend', 'Tausend'],
] as const;

function formatGermanCompact(value: bigint): string {
  for (const [exponent, singular, plural] of germanNumberGroups) {
    const divisor = 10n ** BigInt(exponent);
    if (value < divisor) continue;
    const tenths = (value * 10n) / divisor;
    const amount = Number(tenths) / 10;
    const label = amount === 1 ? singular : plural;
    return `${amount.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ${label}`;
  }
  return value.toLocaleString('de-DE');
}

function durationLabelFor(length: number): string {
  return s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.find(
    (measurement) => measurement.length === length,
  )?.durationLabel ?? '';
}

function useScaleViewport(ref: { readonly current: HTMLElement | null }) {
  const [size, setSize] = useState({ width: 960, height: 520 });
  useEffect(() => {
    const element = ref.current;
    if (element === null) return undefined;
    const updateSize = ({ width, height }: DOMRectReadOnly) =>
      setSize({ width: Math.max(width, 320), height: Math.max(height, 320) });
    updateSize(element.getBoundingClientRect());
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry !== undefined) updateSize(entry.contentRect);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

interface ScaleItemStyle extends CSSProperties {
  readonly '--scale-x': string;
  readonly '--scale-y'?: string;
  readonly '--sphere-size'?: string;
  readonly '--sphere-color'?: string;
  readonly '--tick-color'?: string;
}

interface ScaleMilestoneStyle extends CSSProperties {
  readonly '--annotation-scale': string;
}

function scaleColor(length: number): string {
  const interpolate = (from: readonly [number, number, number], to: readonly [number, number, number], amount: number) =>
    `rgb(${from.map((channel, index) => Math.round(channel + ((to[index] ?? channel) - channel) * amount)).join(' ')})`;
  if (length <= 12) return interpolate([255, 92, 100], [242, 193, 78], (length - 8) / 4);
  if (length <= 15) return interpolate([242, 193, 78], [101, 214, 141], (length - 12) / 3);
  return interpolate([101, 214, 141], [32, 91, 255], (length - 15) / 5);
}

function scaleSphereDiameter(length: number): number {
  const exponent = length - LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH;
  const perStepGrowth = 26 ** (0.36 * 1.05 * 1.02);
  let diameter = exponent === 0 ? 30 : 30 * perStepGrowth ** exponent * 1.8;
  if (length >= 12) diameter *= 1.5 ** (length - 11);
  if (length === 15) diameter *= 1.2;
  if (length >= 16) diameter *= 1.4;
  return diameter;
}

function scaleLabelAllowance(length: number): number {
  const durationLabel = durationLabelFor(length).replace(/^ca\.\s*/, '');
  return 140 + String(length).length * 18 + durationLabel.length * 9;
}

interface ScaleLayout {
  readonly positions: ReadonlyMap<number, number>;
  readonly axisTop: number;
  readonly sphereLift: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

function buildScaleLayout(currentLength: number): ScaleLayout {
  const positions = new Map<number, number>([[LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH, 110]]);
  const currentDiameter = scaleSphereDiameter(currentLength);
  for (let length = LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH + 1; length <= currentLength; length += 1) {
    const previousLength = length - 1;
    const previousDiameter = scaleSphereDiameter(previousLength);
    const diameter = scaleSphereDiameter(length);
    const textAllowance = Math.max(scaleLabelAllowance(previousLength), scaleLabelAllowance(length));
    const gap = Math.max(
      160,
      Math.sqrt(previousDiameter * diameter) * 0.18,
      Math.max(previousDiameter, diameter) * 0.1,
      textAllowance * 1.15,
      currentDiameter * Math.min(
        0.145,
        0.022 + (currentLength - LOWERCASE_SCALE_STARTING_LENGTH) * 0.0075,
      ) +
        currentDiameter * Math.min(0.135, (currentLength - previousLength) * 0.011),
    );
    positions.set(
      length,
      (positions.get(previousLength) ?? 110) + previousDiameter / 2 + diameter / 2 + gap,
    );
  }
  const sphereLift = Math.max(28, currentDiameter * 0.026);
  const axisTop = currentDiameter + sphereLift + Math.max(96, currentDiameter * 0.06);
  const scalePadding = Math.max(46, currentDiameter * 0.036);
  let minimumX = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  let minimumY = Number.POSITIVE_INFINITY;
  for (let length = LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH; length <= currentLength; length += 1) {
    const diameter = scaleSphereDiameter(length);
    const x = positions.get(length) ?? 110;
    minimumX = Math.min(minimumX, x - diameter / 2);
    maximumX = Math.max(maximumX, x + diameter / 2);
    minimumY = Math.min(minimumY, axisTop - sphereLift - diameter);
  }
  const worldPaddingX = Math.max(92, currentDiameter * 0.03);
  const worldPaddingTop = Math.max(92, currentDiameter * 0.03);
  const tickReach = Math.max(
    108,
    currentDiameter * 0.175,
    92 + (currentLength - LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH) * 24,
  );
  return {
    positions,
    axisTop,
    sphereLift,
    left: minimumX - scalePadding - worldPaddingX,
    right: maximumX + scalePadding + worldPaddingX,
    top: Math.min(minimumY - worldPaddingTop, axisTop - tickReach * 0.78),
    bottom: axisTop + tickReach * 1.55 + Math.max(72, currentDiameter * 0.018),
  };
}

interface ScaleProjection {
  readonly scale: number;
  readonly translateX: number;
  readonly translateY: number;
  readonly axisY: number;
  readonly annotationScale: number;
}

function projectScale(layout: ScaleLayout, currentLength: number, width: number, height: number): ScaleProjection {
  const spanX = layout.right - layout.left;
  const spanY = layout.bottom - layout.top;
  const largeViewProgress = Math.max(0, Math.min(1, (currentLength - 13) / 7));
  const widthRatio = 0.982 + (0.91 - 0.982) * largeViewProgress;
  const heightRatio = 0.93 + (0.8 - 0.93) * largeViewProgress;
  const availableHeight = Math.max(1, height);
  const scale = Math.min((width * widthRatio) / spanX, (availableHeight * heightRatio) / spanY);
  if (currentLength === LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH) {
    const focusedDiameter = Math.min(120, width * 0.16, availableHeight * 0.24);
    const focusedScale = Math.max(scale, focusedDiameter / scaleSphereDiameter(currentLength));
    const activeCenterY =
      layout.axisTop - layout.sphereLift - scaleSphereDiameter(currentLength) / 2;
    const translateY = availableHeight * 0.38 - activeCenterY * focusedScale;
    const activeX = layout.positions.get(currentLength) ?? 110;
    return {
      scale: focusedScale,
      translateX: width / 2 - activeX * focusedScale,
      translateY,
      axisY: layout.axisTop * focusedScale + translateY,
      annotationScale: 1,
    };
  }
  const translateY = (availableHeight - spanY * scale) / 2 - layout.top * scale;
  const axisY = layout.axisTop * scale + translateY;
  return {
    scale,
    translateX: width / 2 - ((layout.left + layout.right) / 2) * scale,
    translateY,
    axisY,
    annotationScale: 1 - largeViewProgress * 0.42,
  };
}

function ScaleInformationControl({ length }: { readonly length: number }) {
  const content = s05Content.freeSearch.theoreticalModel.interactiveScale;
  const tooltipId = 's05-scale-information';
  return (
    <aside className={styles.scaleInformationControl}>
      <img src={attackerAsset} alt="" />
      <span className={styles.scaleSceneClock} aria-hidden="true">
        <img src={scaleClockAsset} alt="" />
      </span>
      <button type="button" aria-label={content.informationLabel} aria-describedby={tooltipId}>i</button>
      <span className={styles.scaleInformationTooltip} id={tooltipId} role="tooltip">
        <span><strong>{content.information.passwordLength}:</strong> {length}</span>
        <span><strong>{content.information.alphabetSize}:</strong> 26</span>
        <span><strong>{content.information.combinations}:</strong> {formatGermanCompact(26n ** BigInt(length))}</span>
        <span><strong>{content.information.attemptsPerSecond}:</strong> {content.information.attemptsPerSecondValue}</span>
      </span>
    </aside>
  );
}

function ScaleTimeInformation({
  length,
  showExplanation,
}: {
  readonly length: number;
  readonly showExplanation: boolean;
}) {
  const durationLabel = durationLabelFor(length);
  const approximatePrefix = durationLabel.startsWith('ca. ') ? 'ca.' : null;
  const durationValue = approximatePrefix === null ? durationLabel : durationLabel.slice(4);
  const [durationNumber = durationValue, ...durationUnitParts] = durationValue.split(' ');
  const durationUnit = durationUnitParts.join(' ');
  const explanation = s05Content.freeSearch.theoreticalModel.interactiveScale.durationExplanation
    .replace('[Länge]', String(length));
  const [explanationStart = explanation, explanationEnd = ''] = explanation.split('Zeichenfolgen');
  return (
    <span className={styles.scaleTimeInformation}>
      <strong>
        <span className={styles.scaleTimeValue}>
          {approximatePrefix === null ? durationValue : (
            <>
              <span className={styles.scaleTimeApproximateNumber}>
                <small>{approximatePrefix}</small>
                <span>{durationNumber}</span>
              </span>
              {durationUnit.length > 0 ? ` ${durationUnit}` : null}
            </>
          )}
        </span>
      </strong>
      {showExplanation ? (
        <small className={styles.scaleTimeExplanation} aria-label={explanation}>
          <span>{explanationStart.trim()}</span>
          <LowercaseAlphabetMark inline decorative />
          <span>{`Zeichenfolgen${explanationEnd}`}</span>
        </small>
      ) : null}
    </span>
  );
}

function LowercaseClockScene({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const content = s05Content.freeSearch.theoreticalModel;
  const scaleContent = content.interactiveScale;
  const graphRef = useRef<HTMLDivElement | null>(null);
  const viewport = useScaleViewport(graphRef);
  const currentLength = snapshot.lowercaseScale.password.length;
  const layout = buildScaleLayout(currentLength);
  const projection = projectScale(layout, currentLength, viewport.width, viewport.height);
  const estimateLength = snapshot.estimate.selected === null
    ? null
    : Math.min(snapshot.estimate.selected, LOWERCASE_SCALE_MAXIMUM_LENGTH);
  const screenX = (length: number): number =>
    (layout.positions.get(Math.min(length, currentLength)) ?? 110) * projection.scale + projection.translateX;
  const screenDiameter = (length: number): number =>
    scaleSphereDiameter(length) * projection.scale;
  const screenTop = (length: number): number =>
    (layout.axisTop - layout.sphereLift) * projection.scale +
    projection.translateY -
    screenDiameter(length);
  const milestonesOverlap = estimateLength !== null && Math.abs(screenTop(estimateLength) - screenTop(15)) < 54;
  const milestoneStyle = (length: number, shiftRight = 0): ScaleMilestoneStyle => ({
    top: screenTop(length),
    left: 18 + shiftRight,
    width: Math.max(0, screenX(length) - 18 - shiftRight),
    '--annotation-scale': String(projection.annotationScale),
  });

  function sphereX(length: number): number {
    if (length <= currentLength) return screenX(length);
    const currentRadius = screenDiameter(currentLength) / 2;
    const previewRadius = previewSphereDiameter(length) / 2;
    return screenX(currentLength) + currentRadius + previewRadius + Math.max(76, viewport.width * 0.065);
  }

  function previewSphereDiameter(length: number): number {
    return Math.min(
      screenDiameter(length),
      screenDiameter(currentLength) * 1.9,
      viewport.width * 0.9,
    );
  }

  function sphereStyle(length: number): ScaleItemStyle {
    const preview = length === currentLength + 1;
    return {
      '--scale-x': `${sphereX(length)}px`,
      '--scale-y': `${preview
        ? (layout.axisTop - layout.sphereLift) * projection.scale + projection.translateY - previewSphereDiameter(length)
        : screenTop(length)}px`,
      '--sphere-size': `${preview ? previewSphereDiameter(length) : screenDiameter(length)}px`,
      '--sphere-color': scaleColor(length),
    };
  }

  function attemptFinish(): void {
    controller.completeLowercaseScale();
  }

  return (
    <div
      className={styles.lowercaseScaleScene}
      data-s05-target="lowercase-clock"
      aria-label={scaleContent.accessibleLabel}
    >
      <ScaleInformationControl length={currentLength} />
      <div className={styles.lowercaseScaleGraph} ref={graphRef}>
        <div
          className={styles.lowercaseScaleAxis}
          style={{ top: projection.axisY, left: 6, width: viewport.width - 12 }}
        />
        {estimateLength === null || estimateLength > currentLength ? null : (
          <div
            className={styles.scaleMilestone}
            style={milestoneStyle(estimateLength)}
          >
            <span>{s05Content.freeSearch.estimate.marker}</span>
          </div>
        )}
        {currentLength < 15 ? null : (
            <div
              className={styles.scaleMilestone}
              data-minimum="true"
              style={milestoneStyle(15, milestonesOverlap ? Math.min(140, viewport.width * 0.12) : 0)}
          >
            <span>{scaleContent.minimumOrientation}</span>
          </div>
        )}
        {lowercaseScaleLengths.map((length) => {
          const visible = length <= currentLength;
          const preview = length === currentLength + 1;
          const active = length === currentLength;
          const previous = length === currentLength - 1;
          const sphereIsLargeEnough = screenDiameter(length) >= 2;
          const tickStyle: ScaleItemStyle = {
            '--scale-x': `${screenX(length)}px`,
            '--scale-y': `${projection.axisY + 10}px`,
            '--tick-color': scaleColor(length),
          };
          return (
            <div key={length}>
              <div
                className={styles.scaleTick}
                data-reached={visible || undefined}
                data-active={active || undefined}
                data-future={!visible || undefined}
                style={tickStyle}
              >
                <i />
                <span>{active ? `${length === 20 ? '20+' : length} Stellen` : length === 20 ? '20+' : length}</span>
              </div>
              {(visible || preview) && sphereIsLargeEnough ? (
                <div
                  className={styles.scaleSphere}
                  data-active={active || undefined}
                  data-previous={previous || undefined}
                  data-future={!visible || undefined}
                  data-preview={preview || undefined}
                  style={sphereStyle(length)}
                />
              ) : null}
              {(active || previous) && sphereIsLargeEnough ? (
                <div
                  className={styles.scaleTimeBubble}
                  data-active={active || undefined}
                  data-previous={previous || undefined}
                  style={sphereStyle(length)}
                >
                  <ScaleTimeInformation length={length} showExplanation={active} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <footer className={styles.lowercaseScaleControls}>
        <div className={styles.lowercasePasswordControl}>
          <div className={styles.lowercasePasswordField}>
            <code aria-label={`${currentLength} zufällig erzeugte Kleinbuchstaben`}>
              <span>{snapshot.lowercaseScale.password.slice(0, LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH)}</span>
              <mark>{snapshot.lowercaseScale.password.slice(LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH)}</mark>
            </code>
            <div className={styles.lowercasePasswordButtons}>
              <button
                type="button"
                aria-label={scaleContent.removeCharacter}
                disabled={currentLength === LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH}
                onClick={() => controller.removeLowercaseCharacter()}
              >−</button>
              <button
                type="button"
                aria-label={scaleContent.addCharacter}
                disabled={currentLength === LOWERCASE_SCALE_MAXIMUM_LENGTH}
                onClick={() => controller.addLowercaseCharacter()}
              >+</button>
            </div>
          </div>
        </div>
        <aside className={styles.scaleCompletionControl}>
          <button
            className={styles.finishScale}
            data-unlocked={snapshot.lowercaseScale.reachedSixteen || undefined}
            type="button"
            aria-describedby={snapshot.lowercaseScale.reachedSixteen ? undefined : 's05-scale-completion-hint'}
            aria-disabled={!snapshot.lowercaseScale.reachedSixteen || undefined}
            onClick={attemptFinish}
          >
            {!snapshot.lowercaseScale.reachedSixteen ? <img src={scaleWarningAsset} alt="" /> : null}
            {scaleContent.finish}
          </button>
          {snapshot.lowercaseScale.reachedSixteen ? null : (
            <span className={styles.scaleCompletionHint} id="s05-scale-completion-hint" role="tooltip">
              {scaleContent.lockedHint}
            </span>
          )}
        </aside>
      </footer>
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
      <strong className={`${styles.canonicalAccount} ${styles.applicationAccount}`}>
        <span aria-hidden="true"><NetworkSymbol symbolId="campusgram" /></span>
        <span>{s05Content.intro.campusgramPassword.visibleSuffix}</span>
      </strong>
      <code
        className={styles.largePassword}
        style={passwordVisualStyleFor(subject.fictionalPassword)}
      >
        {subject.fictionalPassword}
      </code>
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
      return <RandomSequenceScene />;
    case 'recognizable-combination':
      return <RecognizableCombinationScene />;
    case 'strategy-targeting':
      return <StrategyTargetingScene subject={subject} />;
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
    case 'personal-details-examples':
    case 'personal-details-intro':
      return (
        <ComponentMachineScene>
          <CategoryMachine
            categoryId="personal-details"
            conveyorBlocks={s05Content.componentStrategy.personalDetails.machine.conveyorBlocks}
            step={snapshot.step}
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
            step={snapshot.step}
          />
        </ComponentMachineScene>
      );
    case 'structure-intro':
      return <StructureIntroScene />;
    case 'structure-theme':
    case 'structure-theme-guessing':
    case 'structure-sentence':
    case 'structure-sentence-guessing':
    case 'structure-repetition':
    case 'structure-repetition-guessing':
    case 'structure-application':
      return (
        <StructureSequenceScene
          step={snapshot.step}
          subject={subject}
          snapshot={snapshot}
        />
      );
    case 'free-search-transition':
    case 'character-mix-first':
    case 'character-mix-comparison':
      return <CharacterMixScene step={snapshot.step} />;
    case 'character-mix-difference':
      return <PasswordVariationScene final={false} />;
    case 'character-mix-types':
      return <PasswordVariationScene final />;
    case 'character-mix-strategy':
      return <LengthScaleScene showAlphabet={false} />;
    case 'character-mix-takeaway':
      return <LengthScaleScene showAlphabet />;
    case 'estimate':
      return <EstimateScene snapshot={snapshot} controller={controller} />;
    case 'lowercase-clock':
      return (
        <LowercaseClockScene
          snapshot={snapshot}
          controller={controller}
        />
      );
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

function categoryFindingValues(
  view: NonNullable<S05AnalysisControllerSnapshot['componentStrategy']['canonicalView']>,
  findings: readonly S05CategoryFinding[],
): readonly string[] {
  const positionedValues = findings
    .map((finding) => ({
      start: finding.start,
      end: finding.end,
      value: view.password.slice(finding.start, finding.end),
    }))
    .sort((left, right) => left.start - right.start || left.end - right.end);
  return [...new Map(positionedValues.map((item) => [item.value, item.value] as const)).values()];
}

function commonComponentsResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.commonComponents;
  const view = snapshot.componentStrategy.canonicalView;
  const findings = snapshot.componentStrategy.cards['common-components'].findings;
  if (view === null || findings.length === 0) return [...content.results.none];

  const foundValues = categoryFindingValues(view, findings);
  if (foundValues.length === 0) return [...content.results.none];

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
        ? [content.results.completeCombinedMatches]
        : []),
  ];
}

function personalDetailsResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.personalDetails;
  const view = snapshot.componentStrategy.canonicalView;
  const findings = snapshot.componentStrategy.cards['personal-details'].findings;
  const selectedValues =
    view === null
      ? []
      : categoryFindingValues(view, findings).map((value) => `„${value}“`);
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
        ? [content.results.completeCombinedMatches]
        : []),
  ];
}

function accountContextResult(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.accountContext;
  const view = snapshot.componentStrategy.canonicalView;
  const findings = snapshot.componentStrategy.cards['account-context'].findings;
  if (view === null || findings.length === 0) return [...content.results.none];

  const foundValues = categoryFindingValues(view, findings);
  if (foundValues.length === 0) return [...content.results.none];

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
        ? [content.results.completeCombinedMatches]
        : []),
  ];
}

function componentSummaryNarration(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  const content = s05Content.componentStrategy.summary;
  const view = snapshot.componentStrategy.canonicalView;
  const sourceCategoryIds = s05Content.componentStrategy.categories
    .filter(({ id }) => snapshot.componentStrategy.cards[id].status === 'checked-findings')
    .map(({ id }) => id);
  if (view === null || sourceCategoryIds.length === 0) {
    return [content.none];
  }
  const findings = sourceCategoryIds.flatMap((id) => snapshot.componentStrategy.cards[id].findings);
  const candidateSummary = summarizeCategoryCandidates(view, findings);
  if (candidateSummary.candidateCount === 0) return [content.none];
  if (candidateSummary.hasSingleCandidateMatch) return [content.singleCandidateMatch];
  if (candidateSummary.coversWholePassword) return [content.combinedMatches];
  return [content.partialMatches];
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
    case 'personal-details-examples':
      return s05Content.componentStrategy.personalDetails.examples;
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
    case 'structure-theme':
      return [s05Content.structure.narration.theme[0]];
    case 'structure-theme-guessing':
      return [s05Content.structure.narration.theme[1]];
    case 'structure-sentence':
      return [s05Content.structure.narration.sentence[0]];
    case 'structure-sentence-guessing':
      return [s05Content.structure.narration.sentence[1]];
    case 'structure-repetition':
      return [s05Content.structure.narration.repetition[0]];
    case 'structure-repetition-guessing':
      return [s05Content.structure.narration.repetition[1]];
    case 'structure-application': {
      const hasRepetition = snapshot.structureScene.runtimeAnalysis.findings.some(
        ({ findingKind }) =>
          findingKind === 'exact-component-repetition' ||
          findingKind === 'recognized-repetition-pattern',
      );
      return [
        hasRepetition
          ? s05Content.structure.application.repetitionFound
          : s05Content.structure.application.repetitionNotFound,
      ];
    }
    case 'free-search-transition':
      return [s05Content.freeSearch.transition.explanation];
    case 'character-mix-first':
      return [s05Content.freeSearch.characterMix.narration[0]];
    case 'character-mix-comparison':
      return [s05Content.freeSearch.characterMix.narration[1]];
    case 'character-mix-difference':
      return [s05Content.freeSearch.characterMix.narration[2]];
    case 'character-mix-types':
      return [s05Content.freeSearch.characterMix.narration[3]];
    case 'character-mix-strategy':
      return [s05Content.freeSearch.characterMix.narration[4]];
    case 'character-mix-takeaway':
      return [
        s05Content.freeSearch.characterMix.narration[5],
        s05Content.freeSearch.characterMix.narration[6],
      ];
    case 'estimate':
      return [s05Content.freeSearch.estimate.question];
    case 'lowercase-clock':
      return null;
    default:
      return null;
  }
}

function showsComponentGuidance(step: S05AnalysisControllerSnapshot['step']): boolean {
  return (
    step.startsWith('common-components-') ||
    step.startsWith('personal-details-') ||
    step.startsWith('account-context-') ||
    step === 'components-summary'
  );
}

function transitionCategoryForStep(
  step: S05AnalysisControllerSnapshot['step'],
): S05ComponentCategoryId | null {
  if (step === 'common-components-start') return 'common-components';
  if (step === 'personal-details-opening') return 'personal-details';
  if (step === 'account-context-opening') return 'account-context';
  return null;
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
      nextLowercaseCharacter: createCryptoLowercaseCharacter,
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
          kind: 'advance' as const,
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
      case 'components-summary':
        return {
          kind: 'advance' as const,
          label: s05Content.componentStrategy.summary.continue,
          disabled,
          onAction: continueFromSpeech,
        };
      case 'account-context-intro':
        return {
          kind: 'advance' as const,
          label: s05Content.componentStrategy.accountContext.check,
          disabled,
          onAction: () => activeController.completeAccountContextCheck(),
        };
      case 'estimate':
        return activeSnapshot.estimate.confirmed
          ? {
              kind: 'advance' as const,
              disabled,
              onAction: continueFromSpeech,
            }
          : undefined;
      default:
        return {
          kind: 'advance' as const,
          disabled,
          onAction: continueFromSpeech,
        };
    }
  }

  const componentGuidanceVisible = showsComponentGuidance(snapshot.step);
  const transitionCategoryId = transitionCategoryForStep(snapshot.step);
  const currentSpeechAction = speechAction();

  return (
    <section ref={hostRef} className={styles.training} aria-label={s05Content.trainingAriaLabel}>
      <article className={styles.page}>
        {transitionCategoryId === null ? null : (
          <CategoryTransition categoryId={transitionCategoryId} />
        )}
        <div
          className={styles.content}
          aria-live="polite"
          inert={
            guidanceVisible &&
            snapshot.step !== 'components-summary' &&
            snapshot.step !== 'estimate'
              ? true
              : undefined
          }
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
              {...(snapshot.step === 'component-category-overview'
                ? { mutedSpeechParagraphIndexes: [1] }
                : {})}
              speechPlacement={
                componentGuidanceVisible ||
                activeSnapshot.step === 'free-search-transition' ||
                activeSnapshot.step.startsWith('character-mix-') ||
                activeSnapshot.step.startsWith('estimate')
                  ? 'right'
                  : 'above'
              }
              {...(componentGuidanceVisible
                ? {}
                : { speechObstacleSelector: '[data-s05-speech-obstacle]' })}
              {...(currentSpeechAction === undefined
                ? {}
                : { speechAction: currentSpeechAction })}
              placement="bottom-left"
              showHelpButton={false}
            />
          </div>
        )}
        <footer
          className={styles.controls}
          data-hidden={guidanceVisible || personalCheckVisible || snapshot.step === 'lowercase-clock' || undefined}
          inert={guidanceVisible || personalCheckVisible || snapshot.step === 'lowercase-clock' || undefined}
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
