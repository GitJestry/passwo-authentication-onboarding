import { s00Content, s05Content } from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.png';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.png';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.png';
import typicalChangesAsset from '../../../../assets/s05/category-logos/typical-changes.png';
import attackerAsset from '../../../../assets/passwo/attacker.png';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
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
  type S05StructureReflectionSnapshot,
  S05AnalysisController,
} from './S05AnalysisController.js';
import { S05AnimationAdapter } from './S05AnimationAdapter.js';
import {
  projectCanonicalPasswordBlocks,
  summarizeCategoryCandidates,
  type S05CategoryFinding,
  type S05ComponentCategoryId,
} from './S05ComponentStrategy.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import { staticNetworkPresentation } from '../account-network.js';
import styles from './S05AnalysisTraining.module.css';

export type S05TimingState = 'active' | 'writingEnd' | 'endWriteFailed';

export interface S05CompletionPort {
  complete(): void;
}

export interface S05AnalysisTrainingProps {
  readonly subject: S05AnalysisSubject;
  readonly initialSection?: S05InitialSection;
  readonly platform?: DesktopPlatform;
  readonly timingState?: S05TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onRetryTiming?: () => void;
  readonly completionPort?: S05CompletionPort;
  readonly onStructureReflectionChange?: (reflection: S05StructureReflectionSnapshot) => void;
}

const CAMPUSGRAM_PASSWORD_REFERENCE_LENGTH = 17;

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
  [1, 4],
  [5, 0, 2],
  [3, 2, 4],
  [0, 1, 3, 5],
  [4, 2, 0, 5],
  [1, 5, 3],
  [2, 0, 4, 1],
  [5, 4],
  [3, 1, 0],
  [0, 5, 2, 4, 1],
  [4, 3, 5, 0],
  [1, 2, 5, 3],
  [5, 3, 1, 4, 0],
  [2, 4, 0],
  [3, 5, 4, 1, 2, 0],
] as const satisfies readonly (readonly number[])[];

const STRATEGY_CANDIDATE_DELAY_MS = 650;
const STRATEGY_CANDIDATE_INITIAL_DELAY_MS = 1620;

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
          <div
            className={styles.strategyCandidateAttempt}
            key={rowIndex}
            style={{
              animationDelay: `${STRATEGY_CANDIDATE_INITIAL_DELAY_MS + rowIndex * STRATEGY_CANDIDATE_DELAY_MS}ms`,
            }}
          >
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
          ariaLabel={`${s05Content.intro.memorablePassword}: Starkes Uni Passwort ${s05Content.intro.strategyAnnotations.relationship}, drei Ausrufezeichen wiederholt`}
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

const structurePatternKeys = ['theme', 'sentence', 'repetition'] as const;

const structureReflectionPalette = [
  '#55b6ac',
  '#5b5fef',
  '#d85478',
  '#1e9b72',
  '#d28b31',
  '#2e92bd',
  '#985dc5',
  '#ca6049',
  '#6f973e',
] as const;

type StructureReflectionColorStyle = CSSProperties & {
  readonly '--s05-structure-reflection-color': string;
};

function structureReflectionColor(index: number): string {
  return structureReflectionPalette[index % structureReflectionPalette.length] ?? '#5b5fef';
}

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

function structureReflectionBlocks(snapshot: S05AnalysisControllerSnapshot) {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) return [];
  return projectCanonicalPasswordBlocks(view, releasedComponentFindings(snapshot));
}

function contentGroupIndexForBlock(
  reflection: S05StructureReflectionSnapshot,
  blockId: string,
): number | null {
  const index = reflection.contentGroups.findIndex(({ blockIds }) => blockIds.includes(blockId));
  return index < 0 ? null : index;
}

function sentenceLinkExists(
  reflection: S05StructureReflectionSnapshot,
  fromBlockId: string,
  toBlockId: string,
): boolean {
  return reflection.sentenceLinks.some(
    (link) => link.fromBlockId === fromBlockId && link.toBlockId === toBlockId,
  );
}

interface StructureRepetitionGroup {
  readonly id: string;
  readonly blockIds: ReadonlySet<string>;
  readonly firstBlockId: string;
  readonly repetitionCount: number;
}

function structureRepetitionGroups(
  snapshot: S05AnalysisControllerSnapshot,
  blocks: ReturnType<typeof structureReflectionBlocks>,
): readonly StructureRepetitionGroup[] {
  return snapshot.structureScene.runtimeAnalysis.findings
    .filter(
      ({ findingKind }) =>
        findingKind === 'exact-component-repetition' ||
        findingKind === 'recognized-repetition-pattern',
    )
    .flatMap((finding) => {
      const spans = finding.evidence
        .filter((evidence) => evidence.type === 'span')
        .sort((left, right) => left.start - right.start);
      const firstSpan = spans[0];
      if (firstSpan === undefined || spans.length < 2) return [];
      const repeatedBlocks = blocks.filter((block) =>
        spans.some((span) => span.start < block.end && span.end > block.start),
      );
      const firstBlock = repeatedBlocks.find(
        (block) => firstSpan.start < block.end && firstSpan.end > block.start,
      );
      if (firstBlock === undefined) return [];
      return [
        {
          id: finding.id,
          blockIds: new Set(repeatedBlocks.map(({ id }) => id)),
          firstBlockId: firstBlock.id,
          repetitionCount: spans.length,
        },
      ];
    });
}

function StructureReflectionToken({
  block,
  color,
  repeated,
  repetitionCount,
  interactive,
  onClick,
  onHoverChange,
}: {
  readonly block: ReturnType<typeof structureReflectionBlocks>[number];
  readonly color: string | null;
  readonly repeated: boolean;
  readonly repetitionCount: number | null;
  readonly interactive: boolean;
  readonly onClick?: (() => void) | undefined;
  readonly onHoverChange?: ((hovered: boolean) => void) | undefined;
}) {
  const style: StructureReflectionColorStyle | undefined =
    color === null ? undefined : { '--s05-structure-reflection-color': color };
  return (
    <button
      type="button"
      className={styles.structureReflectionToken}
      style={style}
      data-grouped={color === null ? undefined : true}
      data-repetition={repeated || undefined}
      disabled={!interactive}
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {repetitionCount === null ? null : (
        <span className={styles.structureReflectionRepetitionCount} aria-hidden="true">
          ×{repetitionCount}
        </span>
      )}
      {block.value}
    </button>
  );
}

function StructureLinkArrow({
  active = false,
  preview = false,
  separator = false,
}: {
  readonly active?: boolean;
  readonly preview?: boolean;
  readonly separator?: boolean;
}) {
  return (
    <span
      className={styles.structureReflectionGap}
      data-active={active || undefined}
      data-preview={preview || undefined}
      data-separator={separator || undefined}
      aria-hidden="true"
    >
      <span className={styles.structureReflectionArrow} />
    </span>
  );
}

function StructureSentenceRow({
  snapshot,
  controller,
  summary = false,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller?: S05AnalysisController;
  readonly summary?: boolean;
}) {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const blocks = structureReflectionBlocks(snapshot);
  const reflection = snapshot.structureReflection;
  const repetitionGroups = structureRepetitionGroups(snapshot, blocks);
  const rendered: ReactNode[] = [];
  let index = 0;

  const tokenFor = (blockIndex: number) => {
    const block = blocks[blockIndex];
    if (block === undefined) return null;
    const groupIndex = contentGroupIndexForBlock(reflection, block.id);
    const repetitionGroup = summary
      ? repetitionGroups.find(({ blockIds }) => blockIds.has(block.id))
      : undefined;
    const nextBlock = blocks[blockIndex + 1];
    return (
      <StructureReflectionToken
        key={block.id}
        block={block}
        color={groupIndex === null ? null : structureReflectionColor(groupIndex)}
        repeated={repetitionGroup !== undefined}
        repetitionCount={
          repetitionGroup?.firstBlockId === block.id
            ? repetitionGroup.repetitionCount
            : null
        }
        interactive={!summary && nextBlock !== undefined}
        onClick={
          summary || nextBlock === undefined || controller === undefined
            ? undefined
            : () => controller.toggleStructureSentenceLink(block.id, nextBlock.id)
        }
        onHoverChange={summary ? undefined : (hovered) => setHoveredBlockId(hovered ? block.id : null)}
      />
    );
  };

  while (index < blocks.length) {
    const block = blocks[index];
    const nextBlock = blocks[index + 1];
    if (
      block !== undefined &&
      nextBlock !== undefined &&
      sentenceLinkExists(reflection, block.id, nextBlock.id)
    ) {
      const startIndex = index;
      let endIndex = index + 1;
      while (endIndex < blocks.length - 1) {
        const current = blocks[endIndex];
        const following = blocks[endIndex + 1];
        if (
          current === undefined ||
          following === undefined ||
          !sentenceLinkExists(reflection, current.id, following.id)
        ) {
          break;
        }
        endIndex += 1;
      }
      const runChildren: ReactNode[] = [];
      for (let runIndex = startIndex; runIndex <= endIndex; runIndex += 1) {
        const runBlock = blocks[runIndex];
        if (runBlock === undefined) continue;
        runChildren.push(tokenFor(runIndex));
        if (runIndex < endIndex) {
          runChildren.push(
            <StructureLinkArrow active key={`link-${runBlock.id}`} />,
          );
        }
      }
      rendered.push(
        <span className={styles.structureReflectionRun} key={`run-${block.id}`}>
          {runChildren}
        </span>,
      );
      const runEndBlock = blocks[endIndex];
      if (runEndBlock !== undefined && endIndex < blocks.length - 1) {
        rendered.push(
          <StructureLinkArrow
            separator
            preview={!summary && hoveredBlockId === runEndBlock.id}
            key={`separator-${runEndBlock.id}`}
          />,
        );
      }
      index = endIndex + 1;
      continue;
    }

    if (block !== undefined) rendered.push(tokenFor(index));
    if (block !== undefined && nextBlock !== undefined) {
      rendered.push(
        <StructureLinkArrow
          preview={!summary && hoveredBlockId === block.id}
          key={`gap-${block.id}`}
        />,
      );
    }
    index += 1;
  }

  return <div className={styles.structureReflectionPassword}>{rendered}</div>;
}

function StructureReflectionConfirmation({
  onCancel,
  onConfirm,
}: {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  const content = s05Content.structure.reflection;
  return (
    <div className={styles.structureReflectionConfirmBackdrop}>
      <section
        className={styles.structureReflectionConfirm}
        role="dialog"
        aria-modal="true"
        aria-label={content.confirmTitle}
      >
        <strong>{content.confirmTitle}</strong>
        <div>
          <button type="button" onClick={onCancel}>
            {content.confirmBack}
          </button>
          <button type="button" data-primary onClick={onConfirm}>
            {content.confirmContinue}
          </button>
        </div>
      </section>
    </div>
  );
}

function StructureContentReflection({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const [confirming, setConfirming] = useState(false);
  const blocks = structureReflectionBlocks(snapshot);
  const reflection = snapshot.structureReflection;
  const activeGroup = reflection.contentGroups.find(
    ({ id }) => id === reflection.activeContentGroupId,
  );
  const hasInput = reflection.contentGroups.some(({ blockIds }) => blockIds.length > 0);
  const canAddGroup =
    activeGroup !== undefined &&
    reflection.contentGroups.every(({ blockIds }) => blockIds.length > 0);

  function finish(): void {
    if (hasInput) {
      setConfirming(true);
      return;
    }
    controller.completeStructureContentReflection();
  }

  return (
    <section
      className={styles.structureReflectionWorkspace}
      data-s05-target="structure-theme-reflection"
      data-s05-speech-obstacle
    >
      <div className={styles.structureReflectionPassword}>
        {blocks.map((block) => {
          const groupIndex = contentGroupIndexForBlock(reflection, block.id);
          return (
            <StructureReflectionToken
              key={block.id}
              block={block}
              color={groupIndex === null ? null : structureReflectionColor(groupIndex)}
              repeated={false}
              repetitionCount={null}
              interactive
              onClick={() => controller.toggleStructureContentBlock(block.id)}
            />
          );
        })}
      </div>
      <div className={styles.structureReflectionActions}>
        <div className={styles.structureReflectionGroups}>
          {reflection.contentGroups.map((group, groupIndex) => {
            const groupStyle: StructureReflectionColorStyle = {
              '--s05-structure-reflection-color': structureReflectionColor(groupIndex),
            };
            return (
              <div className={styles.structureReflectionGroupEntry} key={group.id}>
                <button
                  type="button"
                  className={styles.structureReflectionGroup}
                  style={groupStyle}
                  data-active={group.id === reflection.activeContentGroupId || undefined}
                  onClick={() => controller.selectStructureContentGroup(group.id)}
                >
                  {s05Content.structure.reflection.groupLabel} {groupIndex + 1}
                </button>
                {groupIndex === 0 ? null : (
                  <button
                    type="button"
                    className={styles.structureReflectionDelete}
                    aria-label={`${s05Content.structure.reflection.deleteGroup} ${groupIndex + 1}`}
                    onClick={() => controller.removeStructureContentGroup(group.id)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7h16" />
                      <path d="M9 7V4h6v3" />
                      <path d="M7 7l1 13h8l1-13" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                    <small>{s05Content.structure.reflection.deleteGroup}</small>
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            className={styles.structureReflectionAdd}
            aria-label={s05Content.structure.reflection.newGroup}
            disabled={!canAddGroup}
            onClick={() => controller.addStructureContentGroup()}
          >
            <span aria-hidden="true">+</span>
            <small>{s05Content.structure.reflection.newGroup}</small>
          </button>
        </div>
        <button type="button" className={styles.structureReflectionFinish} onClick={finish}>
          {s05Content.structure.reflection.finish}
        </button>
      </div>
      {confirming ? (
        <StructureReflectionConfirmation
          onCancel={() => setConfirming(false)}
          onConfirm={() => controller.completeStructureContentReflection()}
        />
      ) : null}
    </section>
  );
}

function StructureSentenceReflection({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const [confirming, setConfirming] = useState(false);
  const hasInput = snapshot.structureReflection.sentenceLinks.length > 0;

  function finish(): void {
    if (hasInput) {
      setConfirming(true);
      return;
    }
    controller.completeStructureSentenceReflection();
  }

  return (
    <section
      className={styles.structureReflectionWorkspace}
      data-s05-target="structure-sentence-reflection"
      data-s05-speech-obstacle
    >
      <StructureSentenceRow snapshot={snapshot} controller={controller} />
      <button type="button" className={styles.structureReflectionFinish} onClick={finish}>
        {s05Content.structure.reflection.finish}
      </button>
      {confirming ? (
        <StructureReflectionConfirmation
          onCancel={() => setConfirming(false)}
          onConfirm={() => controller.completeStructureSentenceReflection()}
        />
      ) : null}
    </section>
  );
}

function StructureReflectionSummary({
  snapshot,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  return (
    <section
      className={`${styles.structureReflectionWorkspace} ${styles.structureReflectionSummary}`}
      data-s05-target="structure-application"
      data-s05-speech-obstacle
    >
      <StructureSentenceRow snapshot={snapshot} summary />
    </section>
  );
}

function StructurePatternScene({
  snapshot,
  controller,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
}) {
  const patternStep =
    snapshot.step === 'structure-application' ? 'structure-repetition' : snapshot.step;
  const reflectionVisible =
    snapshot.step === 'structure-theme-reflection' ||
    snapshot.step === 'structure-sentence-reflection' ||
    snapshot.step === 'structure-application';

  return (
    <div
      className={styles.structurePatternWorkspace}
      data-reflection={reflectionVisible || undefined}
    >
      <StructurePatternsScene step={patternStep} />
      {snapshot.step === 'structure-theme-reflection' ? (
        <StructureContentReflection snapshot={snapshot} controller={controller} />
      ) : snapshot.step === 'structure-sentence-reflection' ? (
        <StructureSentenceReflection snapshot={snapshot} controller={controller} />
      ) : snapshot.step === 'structure-application' ? (
        <StructureReflectionSummary snapshot={snapshot} />
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

interface LowercaseCharacterStyle extends CSSProperties {
  readonly '--lowercase-character-color': string;
}

function lowercaseCharacterStyle(character: string): LowercaseCharacterStyle {
  const characterIndex = character.toLocaleLowerCase('de-DE').charCodeAt(0) - 97;
  const hue = ((characterIndex * 137.508) % 360 + 360) % 360;
  const lightness = 57 + (characterIndex % 3) * 3;
  return { '--lowercase-character-color': `hsl(${hue} 38% ${lightness}%)` };
}

function LowercaseAlphabetMark({
  inline = false,
  decorative = false,
  lowercase = false,
}: {
  readonly inline?: boolean;
  readonly decorative?: boolean;
  readonly lowercase?: boolean;
}) {
  const label = lowercase ? 'kleinbuchstaben' : 'Kleinbuchstaben';
  return (
    <span
      className={`${styles.lowercaseAlphabetMark}${inline ? ` ${styles.lowercaseAlphabetMarkInline}` : ''}`}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
    >
      {Array.from(label).map((character, index) => (
        <span
          className={styles.lowercaseCharacter}
          style={lowercaseCharacterStyle(character)}
          key={`${character}-${index}`}
        >
          {character}
        </span>
      ))}
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
          <LowercaseAlphabetMark lowercase />
          <span>{content.alphabetLabel}</span>
        </div>
      ) : (
        <div className={styles.lowercaseAlphabet} data-hidden="true" aria-hidden="true">
          <LowercaseAlphabetMark decorative lowercase />
          <span>{content.alphabetLabel}</span>
        </div>
      )}
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
      <div className={styles.estimateInteraction}>
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

function buildScaleLayout(
  currentLength: number,
  maximumPositionLength = currentLength,
): ScaleLayout {
  const positions = new Map<number, number>([[LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH, 110]]);
  const currentDiameter = scaleSphereDiameter(currentLength);
  for (
    let length = LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH + 1;
    length <= maximumPositionLength;
    length += 1
  ) {
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
  if (currentLength === LOWERCASE_SCALE_STARTING_LENGTH) {
    const activeX = layout.positions.get(currentLength) ?? 110;
    return {
      scale,
      translateX: width / 2 - activeX * scale,
      translateY,
      axisY,
      annotationScale: 1,
    };
  }
  return {
    scale,
    translateX: width / 2 - ((layout.left + layout.right) / 2) * scale,
    translateY,
    axisY,
    annotationScale: 1 - largeViewProgress * 0.42,
  };
}

function ScaleSceneAttacker() {
  return (
    <aside className={styles.scaleSceneAttacker} aria-hidden="true">
      <img src={attackerAsset} alt="" />
      <span className={styles.scaleSceneClock}>
        <img src={scaleClockAsset} alt="" />
      </span>
    </aside>
  );
}

function ScaleInformationControl({
  length,
  alphabetSize,
  modelId,
}: {
  readonly length: number;
  readonly alphabetSize: number;
  readonly modelId: 'lowercase' | 'mixed-characters';
}) {
  const content = s05Content.freeSearch.theoreticalModel.interactiveScale;
  const tooltipId = `s05-scale-information-${modelId}-${length}`;
  return (
    <span className={styles.scaleInformationControl}>
      <button type="button" aria-label={content.informationLabel} aria-describedby={tooltipId}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.6 2.75h4.8l.54 2.15c.43.18.84.42 1.22.7l2.08-.64 2.4 4.16-1.56 1.51a7 7 0 0 1 0 1.74l1.56 1.51-2.4 4.16-2.08-.64c-.38.28-.79.52-1.22.7l-.54 2.15H9.6l-.54-2.15a7 7 0 0 1-1.22-.7l-2.08.64-2.4-4.16 1.56-1.51a7 7 0 0 1 0-1.74L3.36 9.12l2.4-4.16 2.08.64c.38-.28.79-.52 1.22-.7L9.6 2.75Z" />
          <circle cx="12" cy="11.5" r="2.65" />
        </svg>
      </button>
      <span className={styles.scaleInformationTooltip} id={tooltipId} role="tooltip">
        <span><strong>{content.information.passwordLength}:</strong> {length}</span>
        <span><strong>{content.information.alphabetSize}:</strong> {alphabetSize}</span>
        <span><strong>{content.information.combinations}:</strong> {formatGermanCompact(BigInt(alphabetSize) ** BigInt(length))}</span>
        <span><strong>{content.information.attemptsPerSecond}:</strong> {content.information.attemptsPerSecondValue}</span>
      </span>
    </span>
  );
}

function ScaleTimeInformation({
  length,
  showExplanation,
  showInformation,
}: {
  readonly length: number;
  readonly showExplanation: boolean;
  readonly showInformation: boolean;
}) {
  const durationLabel = durationLabelFor(length);
  const approximatePrefix = durationLabel.startsWith('ca. ') ? 'ca.' : null;
  const durationValue = approximatePrefix === null ? durationLabel : durationLabel.slice(4);
  const [durationNumber = durationValue, ...durationUnitParts] = durationValue.split(' ');
  const durationUnitLeading = durationUnitParts.slice(0, -1).join(' ');
  const durationFinalUnit = durationUnitParts.at(-1) ?? '';
  const explanation = 'bis alle kleinbuchstaben Zeichenfolgen geprüft sind';
  return (
    <span className={styles.scaleTimeInformation}>
      <strong>
        <span className={styles.scaleTimeValueRow}>
          <span className={styles.scaleTimeValue}>
            {approximatePrefix === null ? (
              <span className={styles.scaleTimeNumber}>{durationNumber}</span>
            ) : (
              <span className={styles.scaleTimeApproximateNumber}>
                <small>{approximatePrefix}</small>
                <span className={styles.scaleTimeNumber}>{durationNumber}</span>
              </span>
            )}
            {durationUnitLeading.length > 0 ? ` ${durationUnitLeading}` : null}
            {durationFinalUnit.length > 0 ? (
              <>
                {' '}
                <span className={styles.scaleTimeUnitWithInformation}>
                  <span>{durationFinalUnit}</span>
                  {showInformation ? (
                    <ScaleInformationControl
                      alphabetSize={26}
                      length={length}
                      modelId="lowercase"
                    />
                  ) : null}
                </span>
              </>
            ) : null}
          </span>
        </span>
      </strong>
      {showExplanation ? (
        <small className={styles.scaleTimeExplanation} aria-label={explanation}>
          <span>bis alle</span>
          <LowercaseAlphabetMark inline decorative lowercase />
          <span>Zeichenfolgen geprüft sind</span>
        </small>
      ) : null}
    </span>
  );
}

function MixedCharacterTimeInformation() {
  const measurement = s05Content.freeSearch.theoreticalModel.mixedCharacterMeasurement;
  const durationValue = measurement.durationLabel.slice(4);
  const [durationNumber = durationValue, ...durationUnitParts] = durationValue.split(' ');
  return (
    <span className={styles.scaleTimeInformation}>
      <strong>
        <span className={styles.scaleTimeValue}>
          <span className={styles.scaleTimeApproximateNumber}>
            <small>ca.</small>
            <span className={styles.scaleTimeNumber}>{durationNumber}</span>
          </span>{' '}
          <span className={styles.scaleTimeUnitWithInformation}>
            <span>{durationUnitParts.join(' ')}</span>
            <ScaleInformationControl
              alphabetSize={72}
              length={measurement.length}
              modelId="mixed-characters"
            />
          </span>
        </span>
      </strong>
    </span>
  );
}

function MixedCharacterModelLabel({ style }: { readonly style: ScaleItemStyle }) {
  return (
    <span className={styles.scaleModelExplanation} style={style}>
      <strong className={styles.mixedCharacterAlphabet} aria-label="alle Zeichentypen">
        {s05Content.freeSearch.theoreticalModel.mixedCharacterMeasurement.alphabetLabel}
      </strong>
    </span>
  );
}

function LowercaseModelLabel({ style }: { readonly style: ScaleItemStyle }) {
  return (
    <span className={styles.scaleModelExplanation} style={style}>
      <strong className={styles.lowercaseModelAlphabet} aria-label="kleinbuchstaben">
        <LowercaseAlphabetMark inline decorative lowercase />
      </strong>
    </span>
  );
}

function LowercaseClockScene({
  snapshot,
  controller,
  focused = false,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
  readonly controller: S05AnalysisController;
  readonly focused?: boolean;
}) {
  const content = s05Content.freeSearch.theoreticalModel;
  const scaleContent = content.interactiveScale;
  const graphRef = useRef<HTMLDivElement | null>(null);
  const viewport = useScaleViewport(graphRef);
  const currentLength = snapshot.lowercaseScale.password.length;
  const comparesLengthModels = snapshot.step === 'length-model-comparison';
  const layout = buildScaleLayout(
    comparesLengthModels ? 16 : currentLength,
    comparesLengthModels ? LOWERCASE_SCALE_MAXIMUM_LENGTH : currentLength,
  );
  const generatedSphereDiameter = scaleSphereDiameter(16) * 0.55;
  const comparisonGap = Math.max(200, generatedSphereDiameter * 0.12);
  const generatedSphereWorldX =
    (layout.positions.get(15) ?? 110) +
    scaleSphereDiameter(15) / 2 +
    generatedSphereDiameter / 2 +
    comparisonGap;
  const comparisonTrailingShift = Math.max(
    0,
    generatedSphereWorldX +
      generatedSphereDiameter / 2 +
      scaleSphereDiameter(16) / 2 +
      comparisonGap -
      (layout.positions.get(16) ?? 110),
  );
  const comparisonWorldX = (length: number): number =>
    (layout.positions.get(length) ?? 110) +
    (comparesLengthModels && length >= 16 ? comparisonTrailingShift : 0);
  const baseProjection = projectScale(
    layout,
    comparesLengthModels ? 16 : currentLength,
    viewport.width,
    viewport.height,
  );
  const projection = comparesLengthModels
    ? (() => {
        const zoom = 1.28;
        const comparisonLeft =
          (layout.positions.get(15) ?? 110) - scaleSphereDiameter(15) / 2;
        const shiftedSixteenLeft =
          comparisonWorldX(16) - scaleSphereDiameter(16) / 2;
        const comparisonRight = Math.max(
          generatedSphereWorldX + generatedSphereDiameter / 2,
          shiftedSixteenLeft + Math.min(
            scaleSphereDiameter(16) * 0.06,
            generatedSphereDiameter * 0.12,
          ),
        );
        const comparisonTop =
          layout.axisTop -
          layout.sphereLift -
          Math.max(scaleSphereDiameter(15), generatedSphereDiameter) -
          Math.max(110, generatedSphereDiameter * 0.035);
        const comparisonBottom = layout.axisTop + Math.max(160, generatedSphereDiameter * 0.04);
        const scale = Math.min(
          baseProjection.scale * zoom,
          (viewport.width * 0.94) / (comparisonRight - comparisonLeft),
          (viewport.height * 0.9) / (comparisonBottom - comparisonTop),
        );
        const comparisonCenterX =
          (comparisonLeft + comparisonRight) / 2;
        const translateY =
          (viewport.height - (comparisonBottom - comparisonTop) * scale) / 2 -
          comparisonTop * scale;
        return {
          ...baseProjection,
          scale,
          translateX: viewport.width / 2 - comparisonCenterX * scale,
          translateY,
          axisY: layout.axisTop * scale + translateY,
        };
      })()
    : baseProjection;
  const estimateLength = snapshot.estimate.selected === null
    ? null
    : Math.min(snapshot.estimate.selected, LOWERCASE_SCALE_MAXIMUM_LENGTH);
  const screenX = (length: number): number =>
    comparisonWorldX(comparesLengthModels ? length : Math.min(length, currentLength)) *
      projection.scale + projection.translateX;
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
    if (comparesLengthModels) return screenX(length);
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
    const preview = !comparesLengthModels && length === currentLength + 1;
    return {
      '--scale-x': `${sphereX(length)}px`,
      '--scale-y': `${preview
        ? (layout.axisTop - layout.sphereLift) * projection.scale + projection.translateY - previewSphereDiameter(length)
        : screenTop(length)}px`,
      '--sphere-size': `${preview ? previewSphereDiameter(length) : screenDiameter(length)}px`,
      '--sphere-color': scaleColor(length),
    };
  }

  function generatedSphereStyle(): ScaleItemStyle {
    return {
      '--scale-x': `${generatedSphereWorldX * projection.scale + projection.translateX}px`,
      '--scale-y': `${(layout.axisTop - layout.sphereLift - generatedSphereDiameter) * projection.scale + projection.translateY}px`,
      '--sphere-size': `${generatedSphereDiameter * projection.scale}px`,
      '--sphere-color': '#f2c14e',
      '--tick-color': '#f2c14e',
    };
  }

  function generatedTickStyle(): ScaleItemStyle {
    return {
      ...generatedSphereStyle(),
      '--scale-y': `${projection.axisY + 10}px`,
    };
  }

  function attemptFinish(): void {
    controller.completeLowercaseScale();
  }

  const targetId = snapshot.step === 'length-reasons-intro'
    ? 'length-word-pools'
    : snapshot.step === 'length-model-comparison'
      ? 'length-model-comparison'
      : focused
        ? 'length-orientation'
        : 'lowercase-clock';

  return (
    <div
      className={styles.lowercaseScaleScene}
      data-s05-target={targetId}
      data-focused={focused || undefined}
      data-model-comparison={comparesLengthModels || undefined}
      aria-label={
        comparesLengthModels
          ? scaleContent.comparisonAccessibleLabel
          : scaleContent.accessibleLabel
      }
    >
      {focused ? null : <ScaleSceneAttacker />}
      <div className={styles.lowercaseScaleGraph} ref={graphRef}>
        <div
          className={styles.lowercaseScaleAxis}
          style={{ top: projection.axisY, left: 6, width: viewport.width - 12 }}
        />
        {comparesLengthModels ||
        estimateLength === null ||
        estimateLength > currentLength ? null : (
          <div
            className={styles.scaleMilestone}
            style={milestoneStyle(estimateLength)}
          >
            <span>{s05Content.freeSearch.estimate.marker}</span>
          </div>
        )}
        {comparesLengthModels || currentLength < 15 ? null : (
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
          const visibleInComparison = comparesLengthModels;
          const preview = !comparesLengthModels && length === currentLength + 1;
          const active = length === currentLength;
          const previous = !comparesLengthModels && length === currentLength - 1;
          const sphereIsLargeEnough = comparesLengthModels || screenDiameter(length) >= 2;
          const tickStyle: ScaleItemStyle = {
            '--scale-x': `${screenX(length)}px`,
            '--scale-y': `${projection.axisY + 10}px`,
            '--tick-color': scaleColor(length),
          };
          return (
            <div key={length}>
              {visible || !comparesLengthModels ? (
                <div
                  className={styles.scaleTick}
                  data-reached={visible || undefined}
                  data-active={active || undefined}
                  data-comparison-muted={comparesLengthModels && !active || undefined}
                  data-future={(!visible && !visibleInComparison) || undefined}
                  style={tickStyle}
                >
                  <i />
                  <span>{active ? `${length === 20 ? '20+' : length} Stellen` : length === 20 ? '20+' : length}</span>
                </div>
              ) : null}
              {(visible || visibleInComparison || preview) && sphereIsLargeEnough ? (
                <div
                  className={styles.scaleSphere}
                  data-reached={visible || undefined}
                  data-active={active || undefined}
                  data-previous={previous || undefined}
                  data-comparison-muted={comparesLengthModels && !active || undefined}
                  data-future={(!visible && !visibleInComparison) || undefined}
                  data-preview={preview || undefined}
                  style={sphereStyle(length)}
                />
              ) : null}
              {(active || previous) && sphereIsLargeEnough ? (
                <div
                  className={styles.scaleTimeBubble}
                  data-active={active || undefined}
                  data-length={length}
                  data-previous={previous || undefined}
                  style={sphereStyle(length)}
                >
                  <ScaleTimeInformation
                    length={length}
                    showExplanation={active && !comparesLengthModels}
                    showInformation={active}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
        {comparesLengthModels ? (
          <>
            <div
              className={styles.scaleTick}
              data-active="true"
              data-generated="true"
              style={generatedTickStyle()}
            >
              <i />
              <span>{content.mixedCharacterMeasurement.length} Stellen</span>
            </div>
            <div
              className={styles.scaleSphere}
              data-active="true"
              data-generated="true"
              style={generatedSphereStyle()}
            />
            <div
              className={styles.scaleTimeBubble}
              data-active="true"
              data-generated="true"
              style={generatedSphereStyle()}
            >
              <MixedCharacterTimeInformation />
            </div>
            <LowercaseModelLabel style={sphereStyle(15)} />
            <MixedCharacterModelLabel style={generatedSphereStyle()} />
          </>
        ) : null}
      </div>
      {focused ? null : (
        <footer className={styles.lowercaseScaleControls}>
          <div className={styles.lowercasePasswordControl}>
            <div className={styles.lowercasePasswordField}>
              <code aria-label={`${currentLength} zufällig erzeugte Kleinbuchstaben`}>
                {Array.from(snapshot.lowercaseScale.password).map((character, index) => (
                  <span
                    className={styles.lowercaseCharacter}
                    data-added={index >= LOWERCASE_SCALE_VISIBLE_MINIMUM_LENGTH || undefined}
                    style={lowercaseCharacterStyle(character)}
                    key={`${index}-${character}`}
                  >
                    {character}
                  </span>
                ))}
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
      )}
    </div>
  );
}

function WordPoolGear({
  label,
  tooltipId,
  children,
}: {
  readonly label: string;
  readonly tooltipId: string;
  readonly children: ReactNode;
}) {
  return (
    <span className={styles.wordPoolGear}>
      <button type="button" aria-label={label} aria-describedby={tooltipId}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.6 2.75h4.8l.54 2.15c.43.18.84.42 1.22.7l2.08-.64 2.4 4.16-1.56 1.51a7 7 0 0 1 0 1.74l1.56 1.51-2.4 4.16-2.08-.64c-.38.28-.79.52-1.22.7l-.54 2.15H9.6l-.54-2.15a7 7 0 0 1-1.22-.7l-2.08.64-2.4-4.16 1.56-1.51a7 7 0 0 1 0-1.74L3.36 9.12l2.4-4.16 2.08.64c.38-.28.79-.52 1.22-.7L9.6 2.75Z" />
          <circle cx="12" cy="11.5" r="2.65" />
        </svg>
      </button>
      <span className={styles.wordPoolTooltip} id={tooltipId} role="tooltip">{children}</span>
    </span>
  );
}

interface WordPoolModelInformation {
  readonly passwordParts: string;
  readonly pool: string;
  readonly combinations: string;
  readonly attemptsPerSecond: string;
}

function WordPoolModelDetails({
  information,
}: {
  readonly information: WordPoolModelInformation;
}) {
  return (
    <>
      <span><strong>Passwortbestandteile:</strong> {information.passwordParts}</span>
      <span><strong>Wörterpool:</strong> {information.pool}</span>
      <span><strong>Mögliche Kombinationen:</strong> {information.combinations}</span>
      <span><strong>Berechnungen pro Sekunde:</strong> {information.attemptsPerSecond}</span>
    </>
  );
}

function SecondLengthReasonScene({
  step,
}: {
  readonly step: S05AnalysisControllerSnapshot['step'];
}) {
  const content = s05Content.freeSearch.lengthExamples.secondLengthReason;
  const usesMultilingualWords =
    step === 'length-multilingual-words' || step === 'length-multilingual-effort';
  const showsLanguageStack =
    step === 'length-language-pool-stack' || usesMultilingualWords;
  const showsMultilingualEffort = step === 'length-multilingual-effort';
  const passwordExample = usesMultilingualWords
    ? content.multilingualWords
    : content.germanWords;
  const effortExample = showsMultilingualEffort
    ? content.multilingualWords
    : content.germanWords;

  return (
    <div
      className={styles.wordPoolReasonScene}
      data-s05-target="length-second-reason"
      data-second-reason="true"
    >
      <div className={styles.wordPoolAxis} aria-hidden="true" />
      <article className={styles.wordPoolCase} data-case="second-reason">
        <div
          className={styles.wordPoolSphere}
          data-multilingual={showsMultilingualEffort || undefined}
        >
          <span className={styles.wordPoolEffort}>
            <strong>{effortExample.durationLabel}</strong>
            <WordPoolGear
              label="Angreifermodell für die vier Wörter anzeigen"
              tooltipId="s05-second-reason-attacker-model"
            >
              <WordPoolModelDetails information={effortExample.modelInformation} />
            </WordPoolGear>
          </span>
        </div>
      </article>
      <article className={styles.wordPoolPassword} data-case="second-reason">
        <span className={styles.wordPoolPasswordConnector} aria-hidden="true" />
        <strong>{passwordExample.passwordLabel}</strong>
        <PasswordBuildingBlocks
          value={passwordExample.password}
          parts={passwordExample.parts}
          display="separated"
          animate={false}
          visualScale={0.52}
          ariaLabel={`${passwordExample.passwordLabel}: ${passwordExample.parts.join(', ')}`}
        />
      </article>
      <aside
        className={styles.languagePackageStack}
        data-expanded={showsLanguageStack || undefined}
        aria-label="Vier gleich große Sprachpakete"
      >
        {content.languagePackages.map((languagePackage, index) => {
          if (index > 0 && !showsLanguageStack) return null;
          const tooltipId = `s05-language-package-${languagePackage.id}`;
          return (
            <div className={styles.languagePackage} key={languagePackage.id}>
              <strong>{languagePackage.label}</strong>
              <WordPoolGear
                label={`Information zu ${languagePackage.label} anzeigen`}
                tooltipId={tooltipId}
              >
                <span>{languagePackage.information}</span>
              </WordPoolGear>
            </div>
          );
        })}
      </aside>
    </div>
  );
}

function WordPoolReasonScene({
  step,
}: {
  readonly step: S05AnalysisControllerSnapshot['step'];
}) {
  const content = s05Content.freeSearch.lengthExamples.wordPoolDemonstration;
  const stepOrder: readonly S05AnalysisControllerSnapshot['step'][] = [
    'length-memorability',
    'length-full-word-attack',
    'length-short-word-comparison',
    'length-sufficient-pools',
    'length-takeaway',
    'length-second-reason-transition',
  ];
  const stepIndex = stepOrder.indexOf(step);
  const showsPassword = stepIndex >= 0;
  const showsLongWordSphere = stepIndex >= 1;
  const showsShortWords = stepIndex >= 2;
  return (
    <div
      className={styles.wordPoolReasonScene}
      data-s05-target="length-word-pools"
      aria-label="Vergleich vereinfachter deutscher Wortpools im selben Angreifermodell"
    >
      <div className={styles.wordPoolAxis} aria-hidden="true" />
      {showsPassword ? (
        <article className={styles.wordPoolPassword} data-case="long-word">
          <span className={styles.wordPoolPasswordConnector} aria-hidden="true" />
          <strong>{content.longWord.passwordLabel}</strong>
          <PasswordBuildingBlocks
            value={content.longWord.password}
            parts={content.longWord.parts}
            display="separated"
            animate={false}
            visualScale={0.68}
            ariaLabel={`${content.longWord.password}, ${content.longWord.length} Zeichen`}
          />
          <span
            className={styles.wordPoolLengthRay}
            role="img"
            aria-label={`${content.longWord.length} Stellen`}
          />
          <small>{content.minimumLengthLabel}</small>
        </article>
      ) : null}
      {showsLongWordSphere ? (
        <article className={styles.wordPoolCase} data-case="long-word">
          <div className={styles.wordPoolSphere}>
            <span className={styles.wordPoolEffort}>
              <strong>{content.longWord.durationLabel}</strong>
              <WordPoolGear
                label="Angreifermodell für das Wort anzeigen"
                tooltipId="s05-long-word-attacker-model"
              >
                <WordPoolModelDetails information={content.longWord.modelInformation} />
              </WordPoolGear>
            </span>
          </div>
        </article>
      ) : null}
      {showsLongWordSphere ? (
        <aside
          className={styles.wordPackage}
          data-emphasized={step === 'length-full-word-attack' || undefined}
          data-package="large"
        >
          {content.longWord.packageCaption.length > 0 ? (
            <small>{content.longWord.packageCaption}</small>
          ) : null}
          <strong>{content.longWord.packageLabel}</strong>
          <WordPoolGear
            label="Annahme zum deutschen Wortpaket anzeigen"
            tooltipId="s05-large-word-pool-assumption"
          >
            <span>{content.longWord.packageTooltip}</span>
          </WordPoolGear>
        </aside>
      ) : null}
      {showsShortWords ? (
        <article className={styles.wordPoolCase} data-case="short-words">
          <div className={styles.wordPoolSphere}>
            <span className={styles.wordPoolEffort}>
              <strong>{content.shortWords.durationLabel}</strong>
              <WordPoolGear
                label="Angreifermodell für die fünf Wörter anzeigen"
                tooltipId="s05-short-words-attacker-model"
              >
                <WordPoolModelDetails information={content.shortWords.modelInformation} />
              </WordPoolGear>
            </span>
          </div>
        </article>
      ) : null}
      {showsShortWords ? (
        <article className={styles.wordPoolPassword} data-case="short-words">
          <span className={styles.wordPoolPasswordConnector} aria-hidden="true" />
          <strong>{content.shortWords.passwordLabel}</strong>
          <PasswordBuildingBlocks
            value={content.shortWords.password}
            parts={content.shortWords.parts}
            display="separated"
            animate={false}
            visualScale={0.58}
            ariaLabel={`${content.shortWords.passwordLabel} ${content.shortWords.password}, ${content.shortWords.length} Zeichen`}
          />
          <span
            className={styles.wordPoolLengthRay}
            role="img"
            aria-label={`${content.shortWords.length} Stellen`}
          />
          <small>{content.minimumLengthLabel}</small>
        </article>
      ) : null}
      {showsShortWords ? (
        <aside className={styles.wordPackage} data-package="small">
          <small>{content.shortWords.packageCaption}</small>
          <strong>{content.shortWords.packageLabel}</strong>
        </aside>
      ) : null}
    </div>
  );
}

function FinalAssessmentScene({ snapshot }: { readonly snapshot: S05AnalysisControllerSnapshot }) {
  const [networkAdapter] = useState(
    () => new ReactFlowNetworkAdapter(snapshot.assessmentNetwork),
  );
  useEffect(() => {
    networkAdapter.render(snapshot.assessmentNetwork);
    networkAdapter.announce(snapshot.assessmentNetwork.accessibleSummary);
  }, [networkAdapter, snapshot.assessmentNetwork]);
  const highlightsCampusgram = snapshot.step === 'final-components';
  const usesWarningEmphasis =
    snapshot.step === 'final-result' || snapshot.step === 'final-takeaway';
  const presentation = useMemo(
    () => ({
      ...staticNetworkPresentation(snapshot.assessmentNetwork),
      highlightedNodeId: highlightsCampusgram ? 'campusgram' : null,
      emphasis: usesWarningEmphasis ? ('warning' as const) : ('info' as const),
    }),
    [highlightsCampusgram, snapshot.assessmentNetwork, usesWarningEmphasis],
  );
  const targetId = `final-${snapshot.step.slice('final-'.length)}`;
  const recognized = snapshot.assessmentScene.disposition.kind === 'whole-password-recognized';

  return (
    <div
      className={styles.assessmentDesktop}
      data-assessment-outcome={recognized ? 'found' : 'protected'}
      data-assessment-step={snapshot.step}
      data-s05-target={targetId}
      aria-label={snapshot.assessmentNetwork.accessibleSummary}
    >
      <article className={styles.assessmentStage}>
        <AccountAssessmentNetwork
          adapter={networkAdapter}
          presentation={presentation}
          ariaLabel="Konten und verbundene Bereiche in der Campusgram-Prüfung"
          canvasAriaLabel="Campusgram und seine verbundenen Knoten sind sichtbar und entsperrt"
        />
      </article>
    </div>
  );
}

function renderScene(
  snapshot: S05AnalysisControllerSnapshot,
  subject: S05AnalysisSubject,
  controller: S05AnalysisController,
  platform: DesktopPlatform,
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
    case 'structure-theme-reflection':
    case 'structure-sentence-reflection':
    case 'structure-application':
      return <StructurePatternScene snapshot={snapshot} controller={controller} />;
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
    case 'length-model-comparison':
    case 'length-orientation':
    case 'length-reasons-intro':
      return <LowercaseClockScene snapshot={snapshot} controller={controller} focused />;
    case 'length-memorability':
    case 'length-full-word-attack':
    case 'length-short-word-comparison':
    case 'length-sufficient-pools':
    case 'length-takeaway':
    case 'length-second-reason-transition':
      return <WordPoolReasonScene step={snapshot.step} />;
    case 'length-four-german-words':
    case 'length-four-german-effort':
    case 'length-language-pool-stack':
    case 'length-multilingual-words':
    case 'length-multilingual-effort':
      return <SecondLengthReasonScene step={snapshot.step} />;
    case 'final-components':
    case 'final-length':
    case 'final-result':
    case 'final-spread':
    case 'final-takeaway':
      return <FinalAssessmentScene snapshot={snapshot} />;
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
    case 'structure-theme-reflection':
      return [s05Content.structure.reflection.themeQuestion];
    case 'structure-sentence':
      return [s05Content.structure.narration.sentence[0]];
    case 'structure-sentence-guessing':
      return [s05Content.structure.narration.sentence[1]];
    case 'structure-sentence-reflection':
      return [s05Content.structure.reflection.sentenceQuestion];
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
      return [s05Content.freeSearch.characterMix.narration[5]];
    case 'estimate':
      return [s05Content.freeSearch.estimate.question];
    case 'lowercase-clock':
      return null;
    case 'length-model-comparison':
      return [s05Content.freeSearch.lengthExamples.mixedCharacterComparison];
    case 'length-orientation':
      return [s05Content.freeSearch.lengthExamples.orientation];
    case 'length-reasons-intro':
      return [s05Content.freeSearch.lengthExamples.reasonsIntroduction];
    case 'length-memorability':
      return [s05Content.freeSearch.lengthExamples.memorability];
    case 'length-full-word-attack':
      return [s05Content.freeSearch.lengthExamples.fullWordAttack];
    case 'length-short-word-comparison':
      return [s05Content.freeSearch.lengthExamples.shortWordComparison];
    case 'length-sufficient-pools':
      return [s05Content.freeSearch.lengthExamples.sufficientPools];
    case 'length-takeaway':
      return [s05Content.freeSearch.lengthExamples.lengthTakeaway];
    case 'length-second-reason-transition':
      return [s05Content.freeSearch.lengthExamples.secondReasonTransition];
    case 'length-four-german-words':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.germanWordsIntroduction];
    case 'length-four-german-effort':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.germanEffort];
    case 'length-language-pool-stack':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.languagePoolIntroduction];
    case 'length-multilingual-words':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.multilingualSelection];
    case 'length-multilingual-effort':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.multilingualEffort];
    case 'final-components':
      return [s05Content.freeSearch.application.assessmentIntroduction];
    case 'final-result': {
      const disposition = snapshot.assessmentScene.disposition;
      if (disposition.kind === 'no-whole-password-recognized') {
        return [s05Content.freeSearch.application.result.notRecognized];
      }
      return [
        disposition.ruleId === 'whole-password-recognized-value'
          ? s05Content.freeSearch.application.result.recognizedValue
          : s05Content.freeSearch.application.result.recognizedBoundedVariant,
      ];
    }
    case 'final-length': {
      const copy =
        snapshot.assessmentScene.disposition.lengthOrientation === 'below-15'
          ? s05Content.freeSearch.application.length.belowOrientation
          : s05Content.freeSearch.application.length.reachesOrientation;
      return [copy.replace('[Anzahl]', String(snapshot.assessmentScene.visibleLength))];
    }
    case 'final-spread':
      return snapshot.phase === 'animating'
        ? null
        : [s05Content.freeSearch.application.reuseTakeaway];
    case 'final-takeaway':
      return [s05Content.freeSearch.application.attackerTakeaway];
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
  platform = 'mac',
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onRetryTiming,
  completionPort,
  onStructureReflectionChange,
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

  useEffect(() => {
    if (snapshot === null) return;
    onStructureReflectionChange?.(snapshot.structureReflection);
  }, [onStructureReflectionChange, snapshot?.structureReflection]);

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
      case 'structure-theme-reflection':
      case 'structure-sentence-reflection':
        return undefined;
      case 'final-takeaway':
        return {
          kind: 'advance' as const,
          label: s05Content.freeSearch.application.otherAccountsAction,
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
            snapshot.step !== 'estimate' &&
            !snapshot.step.startsWith('length-') &&
            snapshot.step !== 'structure-theme-reflection' &&
            snapshot.step !== 'structure-sentence-reflection'
              ? true
              : undefined
          }
        >
          {renderScene(snapshot, subject, controller, platform)}
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
                activeSnapshot.step.startsWith('estimate') ||
                activeSnapshot.step.startsWith('length-') ||
                activeSnapshot.step.startsWith('final-')
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
          data-hidden={guidanceVisible || personalCheckVisible || snapshot.step === 'lowercase-clock' || snapshot.step.startsWith('final-') || undefined}
          inert={guidanceVisible || personalCheckVisible || snapshot.step === 'lowercase-clock' || snapshot.step.startsWith('final-') || undefined}
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
        </footer>
      </article>
    </section>
  );
}
