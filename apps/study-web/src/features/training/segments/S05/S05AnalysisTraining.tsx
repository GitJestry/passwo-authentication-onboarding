import { s00Content, s05Content } from '@passwo/training-content';
import type { TransientPasswordSemanticEvidence } from '@passwo/contracts';
import type { DesktopPlatform } from '@passwo/ui';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import typicalChangesAsset from '../../../../assets/s05/category-logos/typical-changes.webp';
import attackerAsset from '../../../../assets/passwo/attacker.webp';
import samePasswordAsset from '../../../../assets/password-relations/same.png';
import similarPasswordAsset from '../../../../assets/password-relations/similar.png';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import scaleClockAsset from '../../../../assets/s05/scale-clock.svg';
import scaleWarningAsset from '../../../../assets/s05/scale-warning.svg';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { PasswordVisibilityIcon } from '../../PasswordVisibilityIcon.js';
import {
  PasswordBlockText,
  PasswordBuildingBlocks,
  passwordSingleLineVisualStyleFor,
  passwordVisualStyleFor,
} from './PasswordBuildingBlocks.js';
import {
  passwordCategoryAssets,
  PasswordCategoryHoverCoachProvider,
  PasswordCategoryIconStack,
  type PasswordCategoryHoverCoachContextValue,
} from './PasswordCategoryIcon.js';
import { PasswordComponentReview } from './PasswordComponentReview.js';
import { structureGroupColor, structureGroupLetter } from './StructureGroupPalette.js';
import {
  type S05AnalysisControllerSnapshot,
  type S05AnalysisSubject,
  type S05InitialPersonalFinding,
  type S05InitialSection,
  type S05InitialStructurePreset,
  type S05StructureReflectionSnapshot,
  S05AnalysisController,
} from './S05AnalysisController.js';
import { S05AnimationAdapter } from './S05AnimationAdapter.js';
import {
  categoryFindingValues,
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

type PasswordCategoryHoverCoachState =
  | { readonly status: 'waiting' }
  | {
      readonly status: 'active';
      readonly targetId: string;
      readonly sceneKey: string;
    }
  | { readonly status: 'dismissed' };

export interface S05AnalysisTrainingProps {
  readonly subject: S05AnalysisSubject;
  readonly initialSection?: S05InitialSection;
  readonly initialPersonalFindings?: readonly S05InitialPersonalFinding[];
  readonly initialStructurePreset?: S05InitialStructurePreset;
  readonly platform?: DesktopPlatform;
  readonly timingState?: S05TimingState;
  readonly timingErrorCode?: string | null;
  readonly externalTimingError?: string | null;
  readonly onRetryTiming?: () => void;
  readonly completionPort?: S05CompletionPort;
  readonly onSemanticEvidenceChange?: (evidence: TransientPasswordSemanticEvidence) => void;
}

const CAMPUSGRAM_PASSWORD_REFERENCE_LENGTH = 17;

interface CampusgramPasswordVisualStyle extends CSSProperties {
  readonly '--s05-campusgram-password-scale': string;
}

interface PasswordReuseVisualStyle extends CSSProperties {
  readonly '--password-character-count': number;
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

function passwordReuseVisualStyle(password: string): PasswordReuseVisualStyle {
  return {
    '--password-character-count': Math.max([...password].length, 1),
  };
}

function passwordSegmentCenter(password: string, segmentStart: number): number {
  const characterCount = Math.max([...password].length, 1);
  const boundedStart = Math.min(Math.max(segmentStart, 0), characterCount);
  const center = boundedStart + (characterCount - boundedStart) / 2;
  return Math.min(90, Math.max(10, (center / characterCount) * 100));
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
        width={1024}
        height={1024}
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
        width={1024}
        height={1024}
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
        width={1024}
        height={1024}
        alt="Symbolische Darstellung eines Angreifers am Computer"
      />
    </div>
  );
}

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
      data-category={categoryId}
      aria-label={category?.title ?? content.ariaLabel}
    >
      <div className={styles.machineInput}>
        <img src={passwordCategoryAssets[categoryId]} width={768} height={768} alt="" />
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
        <img src={typicalChangesAsset} width={768} height={576} alt="" />
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
    <div className={styles.categoryTransition} data-category={categoryId} aria-hidden="true">
      <div className={styles.categoryTransitionPanel}>
        <img src={passwordCategoryAssets[categoryId]} width={768} height={768} alt="" />
        <strong>{category?.title ?? s05Content.page.title}</strong>
      </div>
    </div>
  );
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
    <PasswordComponentReview
      entries={completedCategories.map((category) => ({
        id: category.id,
        title: category.title,
      }))}
    />
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

function CampusgramPasswordHeading() {
  return (
    <strong className={styles.canonicalAccount}>
      <span aria-hidden="true">
        <NetworkSymbol symbolId="campusgram" />
      </span>
      <span>Campusgram-Passwort</span>
    </strong>
  );
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
  const visibleFindings = releasedComponentFindings(snapshot);
  const selectingPersonalDetails = snapshot.step === 'personal-details-check';
  const displayBlocks = projectCanonicalPasswordBlocks(view, visibleFindings);
  const displayBlockFindings = displayBlocks.map(({ findings: blockFindings }) => blockFindings);
  const accessibleFindings = displayBlocks
    .map(({ value }, index) => ({ value, findings: displayBlockFindings[index] ?? [] }))
    .filter(({ findings: blockFindings }) => blockFindings.length > 0)
    .map(({ value, findings: blockFindings }) =>
      `${value}: ${blockFindings.map(({ label }) => label).join(', ')}`,
    );
  const hasReleasedFindings = visibleFindings.length > 0;
  const parts = hasReleasedFindings ? displayBlocks.map(({ value }) => value) : [view.password];
  return (
    <section
      className={styles.canonicalPassword}
      aria-label={s05Content.componentStrategy.presentation.canonicalAriaLabel}
    >
      <header>
        <CampusgramPasswordHeading />
      </header>
      <div className={styles.canonicalBlocks} data-s05-speech-obstacle>
        <PasswordBuildingBlocks
          value={view.password}
          visualReferenceValue={view.password}
          parts={parts}
          display="decomposed"
          appearance="analysis"
          animate={hasReleasedFindings}
          categoryIds={
            hasReleasedFindings ? displayBlocks.map(({ categoryIds }) => categoryIds) : [[]]
          }
          labels={parts.map(() => [])}
          findings={
            hasReleasedFindings ? displayBlockFindings : [[]]
          }
          findingDisplay="icons"
          personalHighlightRanges={snapshot.componentStrategy.personalSelection.candidates}
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
      data-personal-marker-cursor-active={
        snapshot.step === 'personal-details-check' || undefined
      }
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

type StructureReflectionColorStyle = CSSProperties & {
  readonly '--s05-structure-reflection-color': string;
};

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
                  style={passwordVisualStyleFor(row.join(''))}
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
                      : row.flatMap((part, partIndex) => {
                          const block = (
                            <span data-block-index={partIndex} key={`${part}-${partIndex}`}>
                              {part}
                            </span>
                          );
                          if (patternKey !== 'sentence' || partIndex === row.length - 1) {
                            return [block];
                          }
                          return [
                            block,
                            <StructureLinkArrow active key={`${part}-${partIndex}-arrow`} />,
                          ];
                        })}
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
  readonly spans: readonly { readonly start: number; readonly end: number }[];
  readonly blockIds: ReadonlySet<string>;
  readonly firstBlockId: string;
  readonly repetitionCount: number;
}

function structureRepetitionGroups(
  snapshot: S05AnalysisControllerSnapshot,
  blocks: ReturnType<typeof structureReflectionBlocks>,
): readonly StructureRepetitionGroup[] {
  const runtimeGroups = snapshot.structureScene.runtimeAnalysis.findings
    .filter(
      ({ findingKind }) =>
        findingKind === 'exact-component-repetition' ||
        findingKind === 'recognized-repetition-pattern',
    )
    .flatMap((finding) => {
      const spans = finding.evidence
        .filter((evidence) => evidence.type === 'span')
        .sort((left, right) => left.start - right.start);
      return spans.length < 2
        ? []
        : [{ id: finding.id, spans, repetitionCount: spans.length }];
    });
  const projectedGroups =
    snapshot.componentStrategy.canonicalView?.repetitionGroups.map((group) => ({
      id: group.id,
      spans: group.spans,
      repetitionCount: group.spans.length,
    })) ?? [];
  const seen = new Set<string>();

  return [...projectedGroups, ...runtimeGroups].flatMap((group) => {
    const spans = [...group.spans].sort(
      (left, right) => left.start - right.start || left.end - right.end,
    );
    const firstSpan = spans[0];
    if (firstSpan === undefined || spans.length < 2) return [];
    const key = spans.map(({ start, end }) => `${start}-${end}`).join(':');
    if (seen.has(key)) return [];
    seen.add(key);
    const repeatedBlocks = blocks.filter((block) =>
      spans.some((span) => span.start < block.end && span.end > block.start),
    );
    const firstBlock = repeatedBlocks.find(
      (block) => firstSpan.start < block.end && firstSpan.end > block.start,
    );
    if (firstBlock === undefined) return [];
    return [
      {
        id: group.id,
        spans,
        blockIds: new Set(repeatedBlocks.map(({ id }) => id)),
        firstBlockId: firstBlock.id,
        repetitionCount: group.repetitionCount,
      },
    ];
  });
}

function repetitionSegmentsForBlock(
  block: ReturnType<typeof structureReflectionBlocks>[number],
  group: StructureRepetitionGroup | undefined,
): readonly { readonly start: number; readonly end: number }[] {
  if (group === undefined) return [];
  const clipped = group.spans
    .flatMap((span) => {
      const start = Math.max(block.start, span.start);
      const end = Math.min(block.end, span.end);
      return start < end ? [{ start, end }] : [];
    })
    .sort((left, right) => left.start - right.start || left.end - right.end);

  return clipped.reduce<Array<{ start: number; end: number }>>((segments, segment) => {
    const previous = segments.at(-1);
    if (previous === undefined || segment.start > previous.end) {
      segments.push({ ...segment });
      return segments;
    }
    // Adjacent occurrences belong to the same visual repeat run. Keeping the semantic spans
    // separate preserves the recognized unit/count while avoiding tiny nested boxes for `????`.
    previous.end = Math.max(previous.end, segment.end);
    return segments;
  }, []);
}

function StructureReflectionToken({
  block,
  color,
  groupPreview = false,
  repetitionGroup,
  interactive,
  sentence,
  onClick,
  onHoverChange,
  personalHighlightRanges,
}: {
  readonly block: ReturnType<typeof structureReflectionBlocks>[number];
  readonly color: string | null;
  readonly groupPreview?: boolean;
  readonly repetitionGroup: StructureRepetitionGroup | undefined;
  readonly interactive: boolean;
  readonly sentence: boolean;
  readonly onClick?: (() => void) | undefined;
  readonly onHoverChange?: ((hovered: boolean) => void) | undefined;
  readonly personalHighlightRanges: readonly {
    readonly start: number;
    readonly end: number;
  }[];
}) {
  const categoryId = block.categoryIds.find(
    (candidate): candidate is S05ComponentCategoryId => candidate !== 'repetition',
  );
  const style: StructureReflectionColorStyle | undefined =
    color === null ? undefined : { '--s05-structure-reflection-color': color };
  const repetitionSegments = repetitionSegmentsForBlock(block, repetitionGroup);
  const fullRepetition =
    repetitionSegments.length === 1 &&
    repetitionSegments[0]?.start === block.start &&
    repetitionSegments[0]?.end === block.end;
  const firstRepetitionStart = repetitionGroup?.spans[0]?.start;
  const repetitionCount = repetitionGroup?.repetitionCount ?? null;
  const showFullRepetitionCount =
    fullRepetition && repetitionGroup?.firstBlockId === block.id && repetitionCount !== null;
  const renderText = (start: number, end: number, key: string) => (
    <span key={key}>
      <PasswordBlockText
        value={block.value.slice(start - block.start, end - block.start)}
        start={start}
        personalHighlightRanges={personalHighlightRanges}
      />
    </span>
  );
  const tokenValue = (() => {
    if (repetitionSegments.length === 0 || fullRepetition) {
      return (
        <PasswordBlockText
          value={block.value}
          start={block.start}
          personalHighlightRanges={personalHighlightRanges}
        />
      );
    }
    const parts: ReactNode[] = [];
    let cursor = block.start;
    for (const segment of repetitionSegments) {
      if (cursor < segment.start) {
        parts.push(renderText(cursor, segment.start, `plain-${cursor}-${segment.start}`));
      }
      const showsCount =
        firstRepetitionStart !== undefined &&
        firstRepetitionStart >= segment.start &&
        firstRepetitionStart < segment.end;
      parts.push(
        <span
          className={styles.structureReflectionInlineRepetition}
          key={`repeat-${segment.start}-${segment.end}`}
        >
          {showsCount && repetitionCount !== null ? (
            <span className={styles.structureReflectionRepetitionCount} aria-hidden="true">
              ×{repetitionCount}
            </span>
          ) : null}
          <PasswordBlockText
            value={block.value.slice(segment.start - block.start, segment.end - block.start)}
            start={segment.start}
            personalHighlightRanges={personalHighlightRanges}
          />
        </span>,
      );
      cursor = segment.end;
    }
    if (cursor < block.end) {
      parts.push(renderText(cursor, block.end, `plain-${cursor}-${block.end}`));
    }
    return <span className={styles.structureReflectionTokenValue}>{parts}</span>;
  })();
  const token = (
    <span className={styles.structureReflectionTokenFrame} style={style}>
      <button
        type="button"
        className={styles.structureReflectionToken}
        style={style}
        data-grouped={color === null || groupPreview ? undefined : true}
        data-group-preview={groupPreview || undefined}
        data-category={categoryId}
        data-repetition={repetitionSegments.length > 0 || undefined}
        data-repetition-full={fullRepetition || undefined}
        data-sentence={sentence || undefined}
        disabled={!interactive}
        onClick={onClick}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
      >
        {!showFullRepetitionCount ? null : (
          <span className={styles.structureReflectionRepetitionCount} aria-hidden="true">
            ×{repetitionCount}
          </span>
        )}
        {tokenValue}
      </button>
      <PasswordCategoryIconStack findings={block.findings} />
    </span>
  );
  return token;
}

function StructureModeIcon() {
  return (
    <svg viewBox="0 0 44 28" aria-hidden="true">
      <rect x="2" y="7" width="13" height="14" rx="3" />
      <path d="M18 14h9" />
      <path d="m24 10 4 4-4 4" />
      <rect x="31" y="7" width="11" height="14" rx="3" />
    </svg>
  );
}

function StructureReflectionFinishButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button type="button" className={styles.structureReflectionFinish} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
      <span>{s05Content.structure.reflection.finish}</span>
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
  const modesAvailable = blocks.length >= 2;
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
    const previousBlock = blocks[blockIndex - 1];
    const sentence =
      reflection.sentenceBlockIds.includes(block.id) ||
      (previousBlock !== undefined && sentenceLinkExists(reflection, previousBlock.id, block.id)) ||
      (nextBlock !== undefined && sentenceLinkExists(reflection, block.id, nextBlock.id));
    return (
      <StructureReflectionToken
        key={block.id}
        block={block}
        color={groupIndex === null ? null : structureGroupColor(groupIndex)}
        repetitionGroup={repetitionGroup}
        interactive={!summary && nextBlock !== undefined}
        sentence={sentence}
        onClick={
          summary || nextBlock === undefined || controller === undefined
            ? undefined
            : () => controller.toggleStructureSentenceLink(block.id, nextBlock.id)
        }
        onHoverChange={
          summary ? undefined : (hovered) => setHoveredBlockId(hovered ? block.id : null)
        }
        personalHighlightRanges={snapshot.componentStrategy.personalSelection.candidates}
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

  return (
    <div
      className={styles.structureReflectionPassword}
      style={passwordSingleLineVisualStyleFor(
        snapshot.componentStrategy.canonicalView?.password ?? '',
        blocks.length,
      )}
    >
      {rendered}
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
  const blocks = structureReflectionBlocks(snapshot);
  const modesAvailable = blocks.length >= 2;
  const reflection = snapshot.structureReflection;
  const activeGroup = reflection.contentGroups.find(
    ({ id }) => id === reflection.activeContentGroupId,
  );
  const activeGroupIndex = Math.max(
    0,
    reflection.contentGroups.findIndex(({ id }) => id === reflection.activeContentGroupId),
  );
  const activeGroupStyle: StructureReflectionColorStyle = {
    '--s05-structure-reflection-color': structureGroupColor(activeGroupIndex),
  };
  const nextGroupStyle: StructureReflectionColorStyle = {
    '--s05-structure-reflection-color': structureGroupColor(reflection.contentGroups.length),
  };
  const groupLimitReached =
    reflection.contentGroups.length >= s05Content.structure.reflection.maxGroupCount;
  const canAddGroup =
    !groupLimitReached &&
    activeGroup !== undefined &&
    reflection.contentGroups.every(({ blockIds }) => blockIds.length >= 2);

  return (
    <section
      className={styles.structureReflectionWorkspace}
      data-s05-target="structure-theme-reflection"
      data-s05-speech-obstacle
    >
      <div className={styles.structurePasswordCheck}>
        <CampusgramPasswordHeading />
        <div
          className={styles.structureReflectionPassword}
          style={passwordVisualStyleFor(snapshot.componentStrategy.canonicalView?.password ?? '')}
        >
          {blocks.map((block) => {
            const groupIndex = contentGroupIndexForBlock(reflection, block.id);
            const group = groupIndex === null ? undefined : reflection.contentGroups[groupIndex];
            return (
              <StructureReflectionToken
                key={block.id}
                block={block}
                color={
                  modesAvailable && groupIndex !== null ? structureGroupColor(groupIndex) : null
                }
                groupPreview={modesAvailable && group?.blockIds.length === 1}
                repetitionGroup={undefined}
                interactive={modesAvailable}
                sentence={false}
                onClick={() => controller.toggleStructureContentBlock(block.id)}
                personalHighlightRanges={snapshot.componentStrategy.personalSelection.candidates}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.structureReflectionActions}>
        <div
          className={styles.structureReflectionModeBox}
          data-unavailable={!modesAvailable || undefined}
        >
          <button
            type="button"
            className={styles.structureReflectionRelationshipMode}
            style={activeGroupStyle}
            data-unavailable={!modesAvailable || undefined}
            aria-disabled="true"
            aria-describedby={
              modesAvailable ? undefined : 's05-relationship-mode-unavailable-hint'
            }
          >
            {!modesAvailable ? <img src={scaleWarningAsset} alt="" /> : null}
            <span>{s05Content.structure.reflection.groupLabel}</span>
          </button>
          {!modesAvailable ? (
            <span
              className={styles.structureReflectionUnavailableHint}
              id="s05-relationship-mode-unavailable-hint"
              role="tooltip"
            >
              {s05Content.structure.reflection.requiresMultipleComponents}
            </span>
          ) : null}
          {!modesAvailable ? null : (
            <div className={styles.structureReflectionGroups}>
              {reflection.contentGroups.map((group, groupIndex) => {
                const groupStyle: StructureReflectionColorStyle = {
                  '--s05-structure-reflection-color': structureGroupColor(groupIndex),
                };
                const groupName =
                  `${s05Content.structure.reflection.groupLabel} ${structureGroupLetter(groupIndex)}`;
                return (
                  <div
                    className={styles.structureReflectionGroupEntry}
                    style={groupStyle}
                    data-slot={groupIndex}
                    data-active={group.id === reflection.activeContentGroupId || undefined}
                    key={group.id}
                  >
                    <button
                      type="button"
                      className={styles.structureReflectionGroup}
                      aria-label={groupName}
                      aria-pressed={group.id === reflection.activeContentGroupId}
                      onClick={() => controller.selectStructureContentGroup(group.id)}
                    >
                      {structureGroupLetter(groupIndex)}
                    </button>
                    {groupIndex === 0 ? null : (
                      <button
                        type="button"
                        className={styles.structureReflectionDelete}
                        aria-label={`${s05Content.structure.reflection.deleteGroup} ${groupName}`}
                        onClick={() => controller.removeStructureContentGroup(group.id)}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    )}
                  </div>
                );
              })}
              {groupLimitReached ? null : (
                <div
                  className={styles.structureReflectionGroupEntry}
                  style={nextGroupStyle}
                  data-slot={reflection.contentGroups.length}
                >
                  <button
                    type="button"
                    className={styles.structureReflectionAdd}
                    aria-label={s05Content.structure.reflection.newGroup}
                    disabled={!canAddGroup}
                    onClick={() => controller.addStructureContentGroup()}
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <StructureReflectionFinishButton
          onClick={() => controller.completeStructureContentReflection()}
        />
      </div>
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
  const modesAvailable = structureReflectionBlocks(snapshot).length >= 2;
  return (
    <section
      className={styles.structureReflectionWorkspace}
      data-s05-target="structure-sentence-reflection"
      data-s05-speech-obstacle
    >
      <div className={styles.structurePasswordCheck}>
        <CampusgramPasswordHeading />
        <StructureSentenceRow snapshot={snapshot} controller={controller} />
      </div>
      <div className={styles.structureReflectionActions}>
        <div
          className={styles.structureReflectionModeBox}
          data-unavailable={!modesAvailable || undefined}
        >
          <button
            type="button"
            className={styles.structureReflectionStructureMode}
            data-unavailable={!modesAvailable || undefined}
            aria-disabled="true"
            aria-describedby={modesAvailable ? undefined : 's05-structure-mode-unavailable-hint'}
          >
            {modesAvailable ? <StructureModeIcon /> : <img src={scaleWarningAsset} alt="" />}
            <span>{s05Content.structure.reflection.structureMode}</span>
          </button>
          {!modesAvailable ? (
            <span
              className={styles.structureReflectionUnavailableHint}
              id="s05-structure-mode-unavailable-hint"
              role="tooltip"
            >
              {s05Content.structure.reflection.requiresMultipleComponents}
            </span>
          ) : null}
        </div>
        <StructureReflectionFinishButton
          onClick={() => controller.completeStructureSentenceReflection()}
        />
      </div>
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
      <div className={styles.structurePasswordCheck}>
        <CampusgramPasswordHeading />
        <StructureSentenceRow snapshot={snapshot} summary />
      </div>
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
    snapshot.step === 'structure-application' || snapshot.step === 'free-search-transition'
      ? 'structure-repetition'
      : snapshot.step;
  const reflectionVisible =
    snapshot.step === 'structure-theme-reflection' ||
    snapshot.step === 'structure-sentence-reflection' ||
    snapshot.step === 'structure-application' ||
    snapshot.step === 'free-search-transition';

  return (
    <div
      className={styles.structurePatternWorkspace}
      data-reflection={reflectionVisible || undefined}
      data-s05-persistent-scene="structure-patterns"
    >
      <StructurePatternsScene step={patternStep} />
      {snapshot.step === 'structure-theme-reflection' ? (
        <StructureContentReflection snapshot={snapshot} controller={controller} />
      ) : snapshot.step === 'structure-sentence-reflection' ? (
        <StructureSentenceReflection snapshot={snapshot} controller={controller} />
      ) : snapshot.step === 'structure-application' || snapshot.step === 'free-search-transition' ? (
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
          <img
            src={attackerAsset}
            width={1024}
            height={1024}
            alt="Symbolische Darstellung eines Angreifers am Computer"
          />
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
  const showComparison =
    step !== 'character-mix-rule-purpose' && step !== 'character-mix-rule-warning';
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
          <img
            src={attackerAsset}
            width={1024}
            height={1024}
            alt="Symbolische Darstellung eines Angreifers am Computer"
          />
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
  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return undefined;
    const updateSize = ({ width, height }: DOMRectReadOnly) => {
      const nextWidth = Math.max(Math.round(width), 320);
      const nextHeight = Math.max(Math.round(height), 320);
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };
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
  readonly '--preview-size'?: string;
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
      <img src={attackerAsset} width={1024} height={1024} alt="" />
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

function LowercaseComparisonPreview({
  style,
  focused = false,
}: {
  readonly style: ScaleItemStyle;
  readonly focused?: boolean;
}) {
  return (
    <span
      className={`${styles.scaleTimeBubble} ${styles.comparisonPreviewInformation}`}
      data-active="true"
      data-focused={focused || undefined}
      data-length={16}
      style={style}
    >
      <ScaleTimeInformation length={16} showExplanation showInformation={false} />
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
  const revisitsCharacterComparison = snapshot.step === 'length-character-comparison';
  const comparesLengthModels =
    snapshot.step === 'length-model-comparison' || revisitsCharacterComparison;
  const layout = buildScaleLayout(
    comparesLengthModels ? 16 : currentLength,
    comparesLengthModels ? 16 : currentLength,
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
        const zoom = revisitsCharacterComparison ? 1 : 1.28;
        const comparisonLeft =
          (layout.positions.get(15) ?? 110) - scaleSphereDiameter(15) / 2;
        const sixteenCenterY =
          layout.axisTop - layout.sphereLift - scaleSphereDiameter(16) / 2;
        const previewContentSize = Math.min(
          scaleSphereDiameter(16) * 0.18,
          generatedSphereDiameter * 0.68,
        );
        const comparisonRight = Math.max(
          generatedSphereWorldX + generatedSphereDiameter / 2,
          revisitsCharacterComparison
            ? comparisonWorldX(16) + scaleSphereDiameter(16) / 2
            : comparisonWorldX(16) + previewContentSize * 0.62,
        );
        const modelComparisonTop =
          layout.axisTop -
          layout.sphereLift -
          Math.max(
            scaleSphereDiameter(15),
            generatedSphereDiameter,
            revisitsCharacterComparison ? scaleSphereDiameter(16) : 0,
          ) -
          Math.max(110, generatedSphereDiameter * 0.035);
        const comparisonTop = revisitsCharacterComparison
          ? modelComparisonTop
          : Math.min(
              modelComparisonTop,
              sixteenCenterY - previewContentSize * 0.62,
            );
        const comparisonBottom = layout.axisTop + Math.max(160, generatedSphereDiameter * 0.04);
        const scale = Math.min(
          baseProjection.scale * zoom,
          (viewport.width * 0.94) / (comparisonRight - comparisonLeft),
          (viewport.height * 0.9) / (comparisonBottom - comparisonTop),
        );
        const comparisonCenterX =
          (comparisonLeft + comparisonRight) / 2;
        const comparisonVerticalLift =
          snapshot.step === 'length-model-comparison'
            ? Math.min(36, Math.max(12, viewport.height * 0.05))
            : 0;
        const translateY =
          (viewport.height - (comparisonBottom - comparisonTop) * scale) / 2 -
          comparisonTop * scale -
          comparisonVerticalLift;
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
    : snapshot.step === 'length-character-comparison'
      ? 'length-character-comparison'
      : snapshot.step === 'length-character-takeaway'
        ? 'length-character-takeaway'
        : snapshot.step === 'length-passphrase-outlook'
          ? 'length-passphrase-outlook'
    : comparesLengthModels
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
          const visibleInComparison = comparesLengthModels && length <= 16;
          const preview = !comparesLengthModels && length === currentLength + 1;
          const active = length === currentLength;
          const previous = !comparesLengthModels && length === currentLength - 1;
          const comparisonPreview =
            comparesLengthModels && length === 16 && !revisitsCharacterComparison;
          const characterComparisonFocus =
            revisitsCharacterComparison && length === 16;
          const sphereIsLargeEnough = comparesLengthModels || screenDiameter(length) >= 2;
          const comparisonLabel = comparisonPreview || characterComparisonFocus;
          const tickStyle: ScaleItemStyle = {
            '--scale-x': `${screenX(length)}px`,
            '--scale-y': `${projection.axisY + 10}px`,
            '--tick-color': scaleColor(length),
          };
          return (
            <div key={length}>
              {visible || !comparesLengthModels || comparisonPreview || characterComparisonFocus ? (
                <div
                  className={styles.scaleTick}
                  data-reached={visible || undefined}
                  data-active={active || comparisonLabel || undefined}
                  data-comparison-muted={
                    (comparesLengthModels && !active && !characterComparisonFocus) || undefined
                  }
                  data-comparison-preview={comparisonLabel || undefined}
                  data-character-comparison-focus={characterComparisonFocus || undefined}
                  data-future={(!visible && !visibleInComparison) || undefined}
                  style={tickStyle}
                >
                  <i />
                  <span>
                    {active || comparisonLabel
                      ? `${length === 20 ? '20+' : length} Stellen`
                      : length === 20 ? '20+' : length}
                  </span>
                </div>
              ) : null}
              {(visible || visibleInComparison || preview) && sphereIsLargeEnough ? (
                <div
                  className={styles.scaleSphere}
                  data-reached={visible || undefined}
                  data-active={active || undefined}
                  data-previous={previous || undefined}
                  data-comparison-muted={
                    (comparesLengthModels && !active && !characterComparisonFocus) || undefined
                  }
                  data-character-comparison-focus={characterComparisonFocus || undefined}
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
            <LowercaseComparisonPreview
              style={sphereStyle(16)}
              focused={revisitsCharacterComparison}
            />
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

interface SecondLengthReasonExampleContent {
  readonly password: string;
  readonly parts: readonly string[];
  readonly partLabels?: readonly string[];
  readonly passwordLabel: string;
  readonly showPasswordLabel?: boolean;
  readonly lengthScaleLabel?: string;
  readonly durationLabel: string;
  readonly modelInformation: WordPoolModelInformation;
}

interface LanguagePackageContent {
  readonly id: string;
  readonly label: string;
  readonly information: string;
}

function WordPoolModelDetails({
  information,
}: {
  readonly information: WordPoolModelInformation;
}) {
  const normalizedCombinations = information.combinations.replaceAll('.', '');
  const combinations = /^\d+$/.test(normalizedCombinations)
    ? formatGermanCompact(BigInt(normalizedCombinations))
    : information.combinations;
  return (
    <>
      <span><strong>Passwortbestandteile:</strong> {information.passwordParts}</span>
      <span><strong>Wörterpool:</strong> {information.pool}</span>
      <span><strong>Mögliche Kombinationen:</strong> {combinations}</span>
      <span><strong>Berechnungen pro Sekunde:</strong> {information.attemptsPerSecond}</span>
    </>
  );
}

function WordPoolEffortInformation({
  example,
  tooltipId,
}: {
  readonly example: SecondLengthReasonExampleContent;
  readonly tooltipId: string;
}) {
  const durationParts = example.durationLabel.split(' ');
  const durationFinalUnit = durationParts.at(-1) ?? example.durationLabel;
  const durationLeading = durationParts.slice(0, -1).join(' ');
  return (
    <span className={styles.wordPoolEffort}>
      <strong>
        {durationLeading.length > 0 ? `${durationLeading} ` : null}
        <span className={styles.wordPoolEffortUnit}>
          <span>{durationFinalUnit}</span>
          <WordPoolGear
            label={`Angreifermodell für ${example.passwordLabel} anzeigen`}
            tooltipId={tooltipId}
          >
            <WordPoolModelDetails information={example.modelInformation} />
          </WordPoolGear>
        </span>
      </strong>
    </span>
  );
}

const wordComparisonSteps = [
  'length-memorability',
  'length-full-word-attack',
  'length-short-word-comparison',
  'length-sufficient-pools',
  'length-takeaway',
  'length-second-reason-transition',
  'length-four-german-words',
  'length-language-pool-stack',
  'length-multilingual-words',
  'length-fifth-word-comparison',
] as const;

interface WordComparisonGeometryStyle extends CSSProperties {
  readonly '--word-slot-x': string;
  readonly '--word-sphere-size'?: string;
  readonly '--word-sphere-color'?: string;
  readonly '--word-label-size'?: string;
  readonly '--word-detail-scale'?: string;
  readonly '--word-detail-offset'?: string;
}

interface WordComparisonSceneStyle extends CSSProperties {
  readonly '--word-comparison-axis-y': string;
  readonly '--word-comparison-sphere-gap': string;
}

const WORD_COMBINATION_MAGNITUDES = {
  // Presentation-only log10 magnitudes keep the renderer independent from localized labels.
  longWord: 4.9,
  shortWords: 12.72,
  germanWords: 19.61,
  multilingualWords: 22.02,
  sixGermanWords: 29.42,
} as const;

const WORD_COMPARISON_DIAMETER_GROWTH = 1_000_000;

function wordComparisonWorldDiameter(magnitude: number): number {
  const minimumMagnitude = WORD_COMBINATION_MAGNITUDES.longWord;
  const maximumMagnitude = WORD_COMBINATION_MAGNITUDES.sixGermanWords;
  const progress = Math.max(
    0,
    Math.min(1, (magnitude - minimumMagnitude) / (maximumMagnitude - minimumMagnitude)),
  );
  // A compressed exponential keeps adjacent authored milestones distinct without pretending
  // that their many orders of magnitude can be drawn at a literal physical scale.
  return 64 * WORD_COMPARISON_DIAMETER_GROWTH ** progress;
}

interface WordComparisonScaleLayout {
  readonly positions: readonly number[];
  readonly axisTop: number;
  readonly sphereLift: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

interface WordComparisonScaleProjection {
  readonly scale: number;
  readonly translateX: number;
  readonly translateY: number;
  readonly axisY: number;
}

function clampWordComparisonValue(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function buildWordComparisonScaleLayout(
  magnitudes: readonly number[],
  activeIndex: number,
): WordComparisonScaleLayout {
  const positions = [110];
  const currentDiameter = wordComparisonWorldDiameter(magnitudes[activeIndex] ?? magnitudes[0] ?? 0);
  for (let index = 1; index <= activeIndex; index += 1) {
    const previousDiameter = wordComparisonWorldDiameter(magnitudes[index - 1] ?? 0);
    const diameter = wordComparisonWorldDiameter(magnitudes[index] ?? 0);
    const cameraGap = currentDiameter * Math.min(0.95, 0.62 + activeIndex * 0.14);
    const gap = Math.max(
      180,
      Math.sqrt(previousDiameter * diameter) * 0.18,
      Math.max(previousDiameter, diameter) * 0.1,
      cameraGap,
    );
    positions.push((positions[index - 1] ?? 110) + previousDiameter / 2 + diameter / 2 + gap);
  }
  const sphereLift = Math.max(28, currentDiameter * 0.026);
  const axisTop = currentDiameter + sphereLift + Math.max(96, currentDiameter * 0.06);
  let minimumX = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  let minimumY = Number.POSITIVE_INFINITY;
  for (let index = 0; index <= activeIndex; index += 1) {
    const diameter = wordComparisonWorldDiameter(magnitudes[index] ?? 0);
    const x = positions[index] ?? 110;
    minimumX = Math.min(minimumX, x - diameter / 2);
    maximumX = Math.max(maximumX, x + diameter / 2);
    minimumY = Math.min(minimumY, axisTop - sphereLift - diameter);
  }
  const leftPadding = Math.max(92, currentDiameter * 0.25);
  const rightPadding = Math.max(92, currentDiameter * 0.7);
  const topPadding = Math.max(92, currentDiameter * 0.08);
  return {
    positions,
    axisTop,
    sphereLift,
    left: minimumX - leftPadding,
    right: maximumX + rightPadding,
    top: minimumY - topPadding,
    bottom: axisTop + Math.max(180, currentDiameter * 0.28),
  };
}

function projectWordComparisonScale({
  viewport,
  layout,
  activeIndex,
  activeDiameter,
}: {
  readonly viewport: { readonly width: number; readonly height: number };
  readonly layout: WordComparisonScaleLayout;
  readonly activeIndex: number;
  readonly activeDiameter: number;
}): WordComparisonScaleProjection {
  const spanX = layout.right - layout.left;
  const spanY = layout.bottom - layout.top;
  const scale = Math.min(
    (viewport.width * 0.92) / spanX,
    (viewport.height * 0.86) / spanY,
  );
  if (activeIndex === 0) {
    const focusedDiameter = Math.min(150, viewport.width * 0.2, viewport.height * 0.28);
    const focusedScale = Math.max(scale, focusedDiameter / activeDiameter);
    const activeX = layout.positions[0] ?? 110;
    const activeCenterY = layout.axisTop - layout.sphereLift - activeDiameter / 2;
    const translateY = viewport.height * 0.42 - activeCenterY * focusedScale;
    return {
      scale: focusedScale,
      translateX: viewport.width / 2 - activeX * focusedScale,
      translateY,
      axisY: layout.axisTop * focusedScale + translateY,
    };
  }
  const translateX = viewport.width / 2 - ((layout.left + layout.right) / 2) * scale;
  const translateY = (viewport.height - spanY * scale) / 2 - layout.top * scale;
  return {
    scale,
    translateX,
    translateY,
    axisY: layout.axisTop * scale + translateY,
  };
}

function wordComparisonPasswordVisualScale(partCount: number, sphereDiameter: number): number {
  const densityScale =
    partCount >= 6 ? 0.54 : partCount >= 4 ? 0.6 : partCount > 1 ? 0.66 : 0.72;
  const geometryScale = clampWordComparisonValue(sphereDiameter / 200, 0.72, 1.08);
  return densityScale * geometryScale;
}

function WordComparisonCase({
  example,
  visible,
  slot,
  x,
  diameter,
  color,
  showEffort = true,
  labelScale = 1,
  emphasized = false,
}: {
  readonly example: SecondLengthReasonExampleContent;
  readonly visible: boolean;
  readonly slot: 'primary' | 'secondary';
  readonly x: number;
  readonly diameter: number;
  readonly color: string;
  readonly showEffort?: boolean;
  readonly labelScale?: number;
  readonly emphasized?: boolean;
}) {
  const style: WordComparisonGeometryStyle = {
    '--word-slot-x': `${x}px`,
    '--word-sphere-size': `${diameter}px`,
    '--word-sphere-color': color,
    '--word-label-size': `${clampWordComparisonValue(
      diameter * 0.12 * labelScale,
      labelScale < 1 ? 10 : 12.5,
      labelScale > 1.4 ? 96 : 76,
    )}px`,
  };
  return (
    <article
      className={styles.wordComparisonCase}
      data-slot={slot}
      data-visible={visible || undefined}
      data-emphasized={emphasized || undefined}
      style={style}
      aria-hidden={!visible}
      inert={!visible || undefined}
      data-passwo-speech-obstacle={visible || undefined}
    >
      <div className={styles.wordComparisonSphere}>
        {showEffort ? (
          <WordPoolEffortInformation
            example={example}
            tooltipId={`s05-word-comparison-${slot}-model`}
          />
        ) : null}
      </div>
    </article>
  );
}

function WordComparisonPassword({
  example,
  visible,
  slot,
  x,
  sphereDiameter,
  lengthLabel,
  summarized = false,
  emphasized = false,
  highlighted = emphasized,
  showLabel = true,
}: {
  readonly example: SecondLengthReasonExampleContent;
  readonly visible: boolean;
  readonly slot: 'primary' | 'secondary';
  readonly x: number;
  readonly sphereDiameter: number;
  readonly lengthLabel?: string;
  readonly summarized?: boolean;
  readonly emphasized?: boolean;
  readonly highlighted?: boolean;
  readonly showLabel?: boolean;
}) {
  const style: WordComparisonGeometryStyle = { '--word-slot-x': `${x}px` };
  const visualScale = wordComparisonPasswordVisualScale(
    example.parts.length,
    sphereDiameter,
  );
  return (
    <article
      className={styles.wordComparisonPassword}
      data-slot={slot}
      data-visible={visible || undefined}
      data-emphasized={emphasized || undefined}
      data-highlighted={highlighted || undefined}
      data-summarized={summarized || undefined}
      style={style}
      aria-hidden={!visible}
      inert={!visible || undefined}
      data-passwo-speech-obstacle={visible || undefined}
    >
      {showLabel ? <strong>{example.passwordLabel}</strong> : null}
      {summarized ? null : (
        <PasswordBuildingBlocks
          value={example.password}
          parts={example.parts}
          display="separated"
          labelsOutside={example.partLabels !== undefined}
          animate={false}
          visualScale={visualScale}
          highlightedIndices={highlighted ? example.parts.map((_, index) => index) : []}
          ariaLabel={`${example.passwordLabel}: ${example.parts.join(', ')}`}
          {...(example.partLabels === undefined ? {} : { labels: example.partLabels })}
        />
      )}
      {lengthLabel === undefined ? null : (
        <>
          <span className={styles.wordComparisonLengthRay} aria-hidden="true" />
          <small>{lengthLabel}</small>
        </>
      )}
    </article>
  );
}

function WordComparisonTick({
  visible,
  slot,
  x,
}: {
  readonly visible: boolean;
  readonly slot: 'primary' | 'secondary';
  readonly x: number;
}) {
  const style: WordComparisonGeometryStyle = { '--word-slot-x': `${x}px` };
  return (
    <span
      className={styles.wordComparisonTick}
      data-slot={slot}
      data-visible={visible || undefined}
      style={style}
      aria-hidden="true"
      data-passwo-speech-obstacle={visible || undefined}
    />
  );
}

function WordComparisonResidualTime({
  visible,
  x,
  label,
  color,
}: {
  readonly visible: boolean;
  readonly x: number;
  readonly label: string;
  readonly color: string;
}) {
  const style: WordComparisonGeometryStyle = {
    '--word-slot-x': `${x}px`,
    '--word-sphere-color': color,
  };
  return (
    <span
      className={styles.wordComparisonResidualTime}
      data-visible={visible || undefined}
      style={style}
      aria-hidden={!visible}
      data-passwo-speech-obstacle={visible || undefined}
    >
      {label}
    </span>
  );
}

function WordComparisonPackageCard({
  visible,
  slot,
  x,
  sphereDiameter,
  detailSide = 'right',
  detailOffset,
  title,
  caption,
  label,
  information,
  informationTooltipId = 's05-word-comparison-package-assumption',
  detailScale = 1,
}: {
  readonly visible: boolean;
  readonly slot: 'primary' | 'secondary';
  readonly x: number;
  readonly sphereDiameter: number;
  readonly detailSide?: 'left' | 'right';
  readonly detailOffset?: number;
  readonly title: string;
  readonly caption: string;
  readonly label: string;
  readonly information?: string;
  readonly informationTooltipId?: string;
  readonly detailScale?: number;
}) {
  const style: WordComparisonGeometryStyle = {
    '--word-slot-x': `${x}px`,
    '--word-sphere-size': `${sphereDiameter}px`,
    '--word-detail-scale': String(detailScale),
    ...(detailOffset === undefined ? {} : { '--word-detail-offset': `${detailOffset}px` }),
  };
  return (
    <aside
      className={styles.wordComparisonPackageCard}
      data-slot={slot}
      data-visible={visible || undefined}
      data-detail-side={detailSide}
      style={style}
      aria-hidden={!visible}
      inert={!visible || undefined}
      data-passwo-speech-obstacle={visible || undefined}
    >
      <small>{title}</small>
      <span>{caption}</span>
      <strong>{label}</strong>
      {information === undefined ? null : (
        <WordPoolGear
          label="Annahme zur deutschen Wortliste anzeigen"
          tooltipId={informationTooltipId}
        >
          <span>{information}</span>
        </WordPoolGear>
      )}
    </aside>
  );
}

function WordComparisonPackages({
  packages,
  visible,
  expanded,
  slot,
  x,
  sphereDiameter,
  detailSide = 'right',
  detailOffset,
  detailScale = 1,
  emphasized = false,
}: {
  readonly packages: readonly LanguagePackageContent[];
  readonly visible: boolean;
  readonly expanded: boolean;
  readonly slot: 'primary' | 'secondary';
  readonly x: number;
  readonly sphereDiameter: number;
  readonly detailSide?: 'left' | 'right';
  readonly detailOffset?: number;
  readonly detailScale?: number;
  readonly emphasized?: boolean;
}) {
  const style: WordComparisonGeometryStyle = {
    '--word-slot-x': `${x}px`,
    '--word-sphere-size': `${sphereDiameter}px`,
    '--word-detail-scale': String(detailScale),
    ...(detailOffset === undefined ? {} : { '--word-detail-offset': `${detailOffset}px` }),
  };
  return (
    <aside
      className={styles.wordComparisonPackages}
      data-slot={slot}
      data-visible={visible || undefined}
      data-emphasized={emphasized || undefined}
      data-detail-side={detailSide}
      style={style}
      aria-label={expanded ? 'Vier gleich große Wortlisten' : 'Deutsche Wortliste'}
      aria-hidden={!visible}
      inert={!visible || undefined}
      data-passwo-speech-obstacle={visible || undefined}
    >
      {packages.map((languagePackage, index) => {
        const itemVisible = visible && (expanded || index === 0);
        const flagEnd = languagePackage.label.indexOf(' ');
        return (
          <div
            className={styles.wordComparisonPackage}
            data-visible={itemVisible || undefined}
            aria-hidden={!itemVisible}
            inert={!itemVisible || undefined}
            key={languagePackage.id}
          >
            <strong>
              <span>{languagePackage.label.slice(0, flagEnd)}</span>
              <span>{languagePackage.label.slice(flagEnd + 1)}</span>
            </strong>
            <WordPoolGear
              label={`Information zu ${languagePackage.label} anzeigen`}
              tooltipId={`s05-word-comparison-${slot}-${languagePackage.id}`}
            >
              <span>{languagePackage.information}</span>
            </WordPoolGear>
          </div>
        );
      })}
    </aside>
  );
}

function WordPoolReasonScene({
  step,
}: {
  readonly step: S05AnalysisControllerSnapshot['step'];
}) {
  const firstReason = s05Content.freeSearch.lengthExamples.wordPoolDemonstration;
  const secondReason = s05Content.freeSearch.lengthExamples.secondLengthReason;
  const graphRef = useRef<HTMLDivElement | null>(null);
  const viewport = useScaleViewport(graphRef);
  const stepIndex = wordComparisonSteps.findIndex((candidate) => candidate === step);
  const milestones = [
    {
      id: 'long-word',
      example: firstReason.longWord,
      magnitude: WORD_COMBINATION_MAGNITUDES.longWord,
      color: '#3f090f',
      labelScale: 0.72,
      lengthLabel: firstReason.minimumLengthLabel,
    },
    {
      id: 'short-words',
      example: firstReason.shortWords,
      magnitude: WORD_COMBINATION_MAGNITUDES.shortWords,
      color: '#a8323d',
      labelScale: 1,
      lengthLabel: firstReason.minimumLengthLabel,
    },
    {
      id: 'german-words',
      example: secondReason.germanWords,
      magnitude: WORD_COMBINATION_MAGNITUDES.germanWords,
      color: scaleColor(14),
      labelScale: 1.2,
      lengthLabel: secondReason.germanWords.lengthScaleLabel,
    },
    {
      id: 'multilingual-words',
      example: secondReason.multilingualWords,
      magnitude: WORD_COMBINATION_MAGNITUDES.multilingualWords,
      color: scaleColor(16),
      labelScale: 1.3,
      lengthLabel: undefined,
    },
    {
      id: 'six-german-words',
      example: secondReason.sixGermanWords,
      magnitude: WORD_COMBINATION_MAGNITUDES.sixGermanWords,
      color: '#42105f',
      labelScale: 1.48,
      lengthLabel: undefined,
    },
  ] as const;
  const currentMilestoneIndex =
    stepIndex >= 9 ? 4 : stepIndex >= 8 ? 3 : stepIndex >= 4 ? 2 : stepIndex >= 2 ? 1 : 0;
  const preparesMultilingualComparison = stepIndex === 7;
  const usesSecondComparisonWindow = stepIndex >= 7;
  const visibleMilestones =
    preparesMultilingualComparison
      ? milestones.slice(2, 4)
      : currentMilestoneIndex <= 2
        ? milestones.slice(0, currentMilestoneIndex + 1)
        : milestones.slice(2, currentMilestoneIndex + 1);
  const activeVisibleIndex = visibleMilestones.length - 1;
  const activeSphereIndex = preparesMultilingualComparison ? 0 : activeVisibleIndex;
  const magnitudes = visibleMilestones.map((milestone) => milestone.magnitude);
  const scaleLayout = buildWordComparisonScaleLayout(magnitudes, activeVisibleIndex);
  const activeWorldDiameter = wordComparisonWorldDiameter(
    visibleMilestones[activeVisibleIndex]?.magnitude ?? WORD_COMBINATION_MAGNITUDES.longWord,
  );
  const projection = projectWordComparisonScale({
    viewport,
    layout: scaleLayout,
    activeIndex: activeVisibleIndex,
    activeDiameter: activeWorldDiameter,
  });
  const screenX = (index: number): number =>
    (scaleLayout.positions[index] ?? 110) * projection.scale + projection.translateX;
  const screenDiameter = (index: number): number =>
    wordComparisonWorldDiameter(visibleMilestones[index]?.magnitude ?? 0) * projection.scale;
  const showsGermanWordList = currentMilestoneIndex >= 2 && usesSecondComparisonWindow;
  const showsMultilingualWordLists = usesSecondComparisonWindow;
  const comparesAdditionalWords = currentMilestoneIndex === 4;
  const detailScale = Math.max(
    0.56,
    1 - Math.max(currentMilestoneIndex, preparesMultilingualComparison ? 3 : 0) * 0.11,
  );
  const sceneStyle: WordComparisonSceneStyle = {
    '--word-comparison-axis-y': `${projection.axisY}px`,
    '--word-comparison-sphere-gap': `${Math.max(14, scaleLayout.sphereLift * projection.scale)}px`,
  };
  const germanMilestoneIndex = visibleMilestones.findIndex(
    (milestone) => milestone.id === 'german-words',
  );
  const multilingualMilestoneIndex = visibleMilestones.findIndex(
    (milestone) => milestone.id === 'multilingual-words',
  );
  const finalMilestoneIndex = visibleMilestones.findIndex(
    (milestone) => milestone.id === 'six-german-words',
  );
  return (
    <div
      className={styles.wordComparisonScene}
      data-s05-target={stepIndex >= 6 ? 'length-second-reason' : 'length-word-pools'}
      data-s05-persistent-scene
      style={sceneStyle}
      data-phase={
        comparesAdditionalWords
          ? 'comparison'
          : usesSecondComparisonWindow
            ? 'multilingual'
            : currentMilestoneIndex >= 2
              ? 'words'
              : 'length'
      }
      aria-label="Vergleich vereinfachter deutscher Wortpools im selben Angreifermodell"
    >
      <div className={styles.wordComparisonGraph} ref={graphRef}>
        <div className={styles.wordComparisonAxis} aria-hidden="true" />
        <span
          className={styles.wordComparisonAxisObstacle}
          data-passwo-speech-obstacle
          aria-hidden="true"
        />
        {visibleMilestones.map((milestone, index) => (
          <WordComparisonTick
            key={`tick-${milestone.id}`}
            visible={
              !preparesMultilingualComparison || milestone.id !== 'multilingual-words'
            }
            slot={index % 2 === 0 ? 'primary' : 'secondary'}
            x={screenX(index)}
          />
        ))}
        {visibleMilestones.map((milestone, index) => (
          <WordComparisonResidualTime
            key={`time-${milestone.id}`}
            visible={
              (!preparesMultilingualComparison || milestone.id !== 'multilingual-words') &&
              screenDiameter(index) < 34
            }
            x={screenX(index)}
            label={milestone.example.durationLabel}
            color={milestone.color}
          />
        ))}
        {visibleMilestones.map((milestone, index) => (
          <WordComparisonCase
            key={milestone.id}
            example={milestone.example}
            visible={
              screenDiameter(index) >= 2 &&
              (!preparesMultilingualComparison || milestone.id !== 'multilingual-words')
            }
            slot={index % 2 === 0 ? 'primary' : 'secondary'}
            x={screenX(index)}
            diameter={Math.max(2, screenDiameter(index))}
            color={milestone.color}
            showEffort={screenDiameter(index) >= 34}
            labelScale={milestone.labelScale}
            emphasized={index === activeSphereIndex}
          />
        ))}
        {visibleMilestones.map((milestone, index) => (
          <WordComparisonPassword
            key={`password-${milestone.id}`}
            example={milestone.example}
            visible
            slot={index % 2 === 0 ? 'primary' : 'secondary'}
            x={screenX(index)}
            sphereDiameter={Math.max(2, screenDiameter(index))}
            summarized={usesSecondComparisonWindow && index !== activeVisibleIndex}
            emphasized={index === activeVisibleIndex}
            highlighted={false}
            showLabel={usesSecondComparisonWindow}
            {...(milestone.lengthLabel === undefined ||
            (usesSecondComparisonWindow && milestone.id === 'german-words')
              ? {}
              : { lengthLabel: milestone.lengthLabel })}
          />
        ))}
        <WordComparisonPackageCard
          visible={currentMilestoneIndex <= 2 && !usesSecondComparisonWindow}
          slot="primary"
          x={screenX(0)}
          sphereDiameter={Math.max(2, screenDiameter(0))}
          detailSide="right"
          detailOffset={72}
          detailScale={detailScale}
          title={firstReason.longWord.packageTitle}
          caption={firstReason.longWord.packageCaption}
          label={firstReason.longWord.packageLabel}
          information={firstReason.longWord.packageTooltip}
        />
        <WordComparisonPackageCard
          visible={
            currentMilestoneIndex >= 1 &&
            currentMilestoneIndex <= 2 &&
            !usesSecondComparisonWindow
          }
          slot="secondary"
          x={screenX(1)}
          sphereDiameter={Math.max(2, screenDiameter(1))}
          detailOffset={72}
          detailScale={detailScale}
          title={firstReason.shortWords.packageTitle}
          caption={firstReason.shortWords.packageCaption}
          label={firstReason.shortWords.packageLabel}
        />
        <WordComparisonPackageCard
          visible={currentMilestoneIndex === 2 && !usesSecondComparisonWindow}
          slot="primary"
          x={screenX(Math.max(0, germanMilestoneIndex))}
          sphereDiameter={Math.max(2, screenDiameter(Math.max(0, germanMilestoneIndex)))}
          detailSide="right"
          detailOffset={64}
          detailScale={detailScale}
          title={firstReason.longWord.packageTitle}
          caption={firstReason.longWord.packageCaption}
          label={firstReason.longWord.packageLabel}
          information={firstReason.longWord.packageTooltip}
          informationTooltipId="s05-word-comparison-four-words-package-assumption"
        />
        <WordComparisonPackages
          packages={secondReason.languagePackages.slice(0, 1)}
          visible={showsGermanWordList}
          expanded={false}
          slot="primary"
          x={screenX(Math.max(0, germanMilestoneIndex))}
          sphereDiameter={Math.max(2, screenDiameter(Math.max(0, germanMilestoneIndex)))}
          detailSide="right"
          detailOffset={72}
          detailScale={detailScale}
        />
        <WordComparisonPackages
          packages={secondReason.languagePackages}
          visible={showsMultilingualWordLists}
          expanded
          slot="secondary"
          x={screenX(Math.max(0, multilingualMilestoneIndex))}
          sphereDiameter={
            preparesMultilingualComparison
              ? 2
              : Math.max(2, screenDiameter(Math.max(0, multilingualMilestoneIndex)))
          }
          detailSide="right"
          detailScale={detailScale}
          emphasized={step === 'length-language-pool-stack'}
        />
        <WordComparisonPackages
          packages={secondReason.languagePackages.slice(0, 1)}
          visible={comparesAdditionalWords}
          expanded={false}
          slot="primary"
          x={screenX(Math.max(0, finalMilestoneIndex))}
          sphereDiameter={Math.max(2, screenDiameter(Math.max(0, finalMilestoneIndex)))}
          detailSide="right"
          detailScale={detailScale}
          emphasized={comparesAdditionalWords}
        />
      </div>
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
          easyToGuessAccountIds={
            recognized && snapshot.step !== 'final-components' ? ['campusgram'] : []
          }
          hideDetailSymbols
        />
      </article>
      {snapshot.step === 'final-components' ||
      snapshot.step === 'final-length' ||
      snapshot.step === 'final-result' ? (
        <FinalPasswordSummary snapshot={snapshot} />
      ) : null}
      {snapshot.step === 'final-spread' ? <PasswordReuseExampleScene /> : null}
    </div>
  );
}

function PasswordReuseExampleScene() {
  const examples = s05Content.freeSearch.application.reuseExamples;
  return (
    <figure
      className={styles.passwordReuseExample}
      aria-label="Beispiele für dasselbe und ein leicht abgewandeltes Passwort"
      data-s05-speech-obstacle
    >
      {examples.map((example) => {
        let sharedPrefixLength = 0;
        while (
          sharedPrefixLength < example.sourcePassword.length &&
          example.sourcePassword[sharedPrefixLength] === example.targetPassword[sharedPrefixLength]
        ) {
          sharedPrefixLength += 1;
        }
        const sourceSegmentCenter = passwordSegmentCenter(
          example.sourcePassword,
          sharedPrefixLength,
        );
        const targetSegmentCenter = passwordSegmentCenter(
          example.targetPassword,
          sharedPrefixLength,
        );
        const passwordBlock = (password: string) => (
          <code
            data-whole-match={example.id === 'same' || undefined}
            style={passwordReuseVisualStyle(password)}
          >
            {example.id === 'similar' ? (
              <>
                <span>{password.slice(0, sharedPrefixLength)}</span>
                <span data-account-part>{password.slice(sharedPrefixLength)}</span>
              </>
            ) : (
              <span>{password}</span>
            )}
          </code>
        );
        return (
          <div
            key={example.id}
            className={styles.passwordReuseExampleRow}
            data-example={example.id}
            role="group"
            aria-label={`${example.sourcePassword} und ${example.targetPassword}: ${example.label}`}
          >
            {passwordBlock(example.sourcePassword)}
            <span className={styles.passwordRelationBridge} aria-hidden="true">
              <svg viewBox="0 0 100 48" preserveAspectRatio="none">
                <path
                  d={
                    example.id === 'same'
                      ? 'M 50 0 V 40'
                      : `M ${sourceSegmentCenter} 0 C ${sourceSegmentCenter} 15, ${targetSegmentCenter} 29, ${targetSegmentCenter} 40`
                  }
                />
                <path
                  className={styles.passwordRelationArrowhead}
                  d={
                    example.id === 'same'
                      ? 'M 46 37 L 50 45 L 54 37'
                      : `M ${targetSegmentCenter - 4} 37 L ${targetSegmentCenter} 45 L ${targetSegmentCenter + 4} 37`
                  }
                />
              </svg>
              <span className={styles.passwordRelationMark}>
                <small>{example.label}</small>
                <img
                  src={example.id === 'same' ? samePasswordAsset : similarPasswordAsset}
                  width={1254}
                  height={1254}
                  alt=""
                />
              </span>
            </span>
            {passwordBlock(example.targetPassword)}
          </div>
        );
      })}
    </figure>
  );
}

function FinalPasswordSummary({
  snapshot,
}: {
  readonly snapshot: S05AnalysisControllerSnapshot;
}) {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) return null;
  return (
    <section
      className={styles.finalPasswordSummary}
      aria-label={`Visuelle Zusammenfassung des Campusgram-Passworts ${view.password}`}
      data-s05-speech-obstacle
    >
      <div className={styles.finalPasswordVisualization}>
        <strong className={`${styles.canonicalAccount} ${styles.finalPasswordAccount}`}>
          <span aria-hidden="true">
            <NetworkSymbol symbolId="campusgram" />
          </span>
          <span>Campusgram-Passwort</span>
        </strong>
        <div className={styles.finalPasswordStructure}>
          <StructureSentenceRow snapshot={snapshot} summary />
        </div>
      </div>
    </section>
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
    case 'free-search-transition':
      return <StructurePatternScene snapshot={snapshot} controller={controller} />;
    case 'character-mix-rule-purpose':
    case 'character-mix-rule-warning':
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
    case 'length-character-comparison':
    case 'length-character-takeaway':
    case 'length-passphrase-outlook':
      return <LowercaseClockScene snapshot={snapshot} controller={controller} focused />;
    case 'length-memorability':
    case 'length-full-word-attack':
    case 'length-short-word-comparison':
    case 'length-sufficient-pools':
    case 'length-takeaway':
    case 'length-second-reason-transition':
    case 'length-four-german-words':
    case 'length-language-pool-stack':
    case 'length-multilingual-words':
    case 'length-fifth-word-comparison':
      return <WordPoolReasonScene step={snapshot.step} />;
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
      return [
        structureReflectionBlocks(snapshot).length < 2
          ? s05Content.structure.reflection.relationshipSinglePart
          : s05Content.structure.reflection.themeQuestion,
      ];
    case 'structure-sentence':
      return [s05Content.structure.narration.sentence[0]];
    case 'structure-sentence-guessing':
      return [s05Content.structure.narration.sentence[1]];
    case 'structure-sentence-reflection':
      return [
        structureReflectionBlocks(snapshot).length < 2
          ? s05Content.structure.reflection.structureSinglePart
          : s05Content.structure.reflection.sentenceQuestion,
      ];
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
      return [s05Content.freeSearch.transition.exhaustiveSearch];
    case 'character-mix-rule-purpose':
      return [s05Content.freeSearch.transition.rulePurpose];
    case 'character-mix-rule-warning':
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
    case 'length-language-pool-stack':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.languagePoolIntroduction];
    case 'length-multilingual-words':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.multilingualSelection];
    case 'length-fifth-word-comparison':
      return [s05Content.freeSearch.lengthExamples.secondLengthReason.additionalGermanWords];
    case 'length-character-comparison':
      return [s05Content.freeSearch.lengthExamples.characterConclusion.comparison];
    case 'length-character-takeaway':
      return [s05Content.freeSearch.lengthExamples.characterConclusion.predictability];
    case 'length-passphrase-outlook':
      return [s05Content.freeSearch.lengthExamples.characterConclusion.passphraseOutlook];
    case 'final-components':
      return s05Content.freeSearch.application.assessmentIntroduction;
    case 'final-result': {
      const disposition = snapshot.assessmentScene.disposition;
      if (disposition.kind === 'no-whole-password-recognized') {
        return [s05Content.freeSearch.application.result.notRecognized];
      }
      if (disposition.ruleId === 'whole-password-recognized-value') {
        return [s05Content.freeSearch.application.result.recognizedValue];
      }
      if (disposition.ruleId === 'whole-password-recognized-single-anchor-residual') {
        return [s05Content.freeSearch.application.result.recognizedSingleAnchorResidual];
      }
      if (disposition.ruleId === 'whole-password-recognized-exhaustive-search') {
        return [s05Content.freeSearch.application.result.recognizedExhaustiveSearch];
      }
      return [s05Content.freeSearch.application.result.recognizedGeneratedCandidate];
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

type LengthOrientationInformationId =
  (typeof s05Content.freeSearch.lengthExamples.orientationInformation)[number]['id'];

function LengthOrientationInformation({
  className,
}: {
  readonly className?: string | undefined;
}) {
  const [openId, setOpenId] = useState<LengthOrientationInformationId | null>(null);

  return (
    <aside
      className={`${styles.lengthOrientationInformation}${
        className === undefined ? '' : ` ${className}`
      }`}
      aria-label="Zusätzliche Informationen"
    >
      {s05Content.freeSearch.lengthExamples.orientationInformation.map((item) => {
        const expanded = openId === item.id;
        const buttonId = `s05-length-orientation-${item.id}-button`;
        const panelId = `s05-length-orientation-${item.id}-panel`;
        return (
          <section className={styles.lengthOrientationInformationItem} key={item.id}>
            {expanded ? (
              <div
                className={styles.lengthOrientationInformationPanel}
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
              >
                <p>{item.answer}</p>
              </div>
            ) : null}
            <button
              id={buttonId}
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpenId(expanded ? null : item.id)}
            >
              <span className={styles.lengthOrientationInformationIcon} aria-hidden="true">
                i
              </span>
              <span>{item.question}</span>
              <span className={styles.lengthOrientationInformationChevron} aria-hidden="true" />
            </button>
          </section>
        );
      })}
    </aside>
  );
}

export function S05AnalysisTraining({
  subject,
  initialSection = 'intro',
  initialPersonalFindings,
  initialStructurePreset,
  platform = 'mac',
  timingState = 'active',
  timingErrorCode = null,
  externalTimingError = null,
  onRetryTiming,
  completionPort,
  onSemanticEvidenceChange,
}: S05AnalysisTrainingProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [controller, setController] = useState<S05AnalysisController | null>(null);
  const [snapshot, setSnapshot] = useState<S05AnalysisControllerSnapshot | null>(null);
  const [hoverCoachState, setHoverCoachState] = useState<PasswordCategoryHoverCoachState>({
    status: 'waiting',
  });
  const timingFailure = externalTimingError !== null || timingState === 'endWriteFailed';
  const hoverCoachSceneKey = snapshot?.step ?? 's05-loading';
  const hoverCoachEnabled =
    snapshot !== null &&
    snapshot.step !== 'common-components-intro' &&
    snapshot.step !== 'personal-details-check' &&
    snapshot.step !== 'account-context-intro';
  const hoverCoachSceneKeyRef = useRef(hoverCoachSceneKey);
  hoverCoachSceneKeyRef.current = hoverCoachSceneKey;
  const dismissVisibleCategoryHoverCoach = useCallback(() => {
    setHoverCoachState((current) =>
      current.status === 'active' ||
      (current.status === 'waiting' &&
        (hostRef.current?.querySelector('[data-category-stack]') ?? null) !== null)
        ? { status: 'dismissed' }
        : current,
    );
  }, []);
  const consumeCategoryHoverCoach = useCallback(() => {
    setHoverCoachState((current) =>
      current.status === 'dismissed' ? current : { status: 'dismissed' },
    );
  }, []);
  const claimCategoryHoverCoach = useCallback((targetId: string, sceneKey: string) => {
    if (sceneKey !== hoverCoachSceneKeyRef.current) return;
    setHoverCoachState((current) =>
      current.status === 'waiting'
        ? { status: 'active', targetId, sceneKey }
        : current,
    );
  }, []);
  const hoverCoachContext = useMemo<PasswordCategoryHoverCoachContextValue>(
    () => ({
      activeTargetId:
        hoverCoachState.status === 'active' &&
        hoverCoachState.sceneKey === hoverCoachSceneKey
          ? hoverCoachState.targetId
          : null,
      enabled: hoverCoachEnabled,
      sceneKey: hoverCoachSceneKey,
      claim: claimCategoryHoverCoach,
      dismiss: consumeCategoryHoverCoach,
    }),
    [
      claimCategoryHoverCoach,
      consumeCategoryHoverCoach,
      hoverCoachEnabled,
      hoverCoachSceneKey,
      hoverCoachState,
    ],
  );

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
      ...(initialPersonalFindings === undefined ? {} : { initialPersonalFindings }),
      ...(initialStructurePreset === undefined ? {} : { initialStructurePreset }),
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
  }, [completionPort, initialPersonalFindings, initialSection, initialStructurePreset, subject]);

  useEffect(() => {
    controller?.start();
  }, [controller]);

  useEffect(() => {
    if (snapshot === null) return;
    onSemanticEvidenceChange?.(snapshot.semanticEvidence);
  }, [onSemanticEvidenceChange, snapshot?.semanticEvidence]);

  useEffect(() => {
    setHoverCoachState((current) =>
      current.status === 'active' && current.sceneKey !== hoverCoachSceneKey
        ? { status: 'dismissed' }
        : current,
    );
  }, [hoverCoachSceneKey]);

  if (controller === null || snapshot === null) return null;

  const activeController = controller;
  const activeSnapshot = snapshot;
  const writingBoundary = timingState === 'writingEnd';
  const speech = speechFor(activeSnapshot);
  const guidanceVisible = speech !== null;
  const personalCheckVisible = activeSnapshot.step === 'personal-details-check';
  const hasReleasedCategoryInfo = releasedComponentFindings(activeSnapshot).length > 0;

  function continueFromSpeech(): void {
    dismissVisibleCategoryHoverCoach();
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
          onAction: () => {
            dismissVisibleCategoryHoverCoach();
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
          onAction: () => {
            dismissVisibleCategoryHoverCoach();
            activeController.completeAccountContextCheck();
          },
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
    <PasswordCategoryHoverCoachProvider value={hoverCoachContext}>
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
            !hasReleasedCategoryInfo &&
            snapshot.step !== 'components-summary' &&
            snapshot.step !== 'estimate' &&
            !snapshot.step.startsWith('length-') &&
            snapshot.step !== 'structure-theme-reflection' &&
            snapshot.step !== 'structure-sentence-reflection' &&
            snapshot.step !== 'structure-application' &&
            snapshot.step !== 'free-search-transition' &&
            !snapshot.step.startsWith('final-')
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
              speechAdjacent={
                snapshot.step === 'length-orientation' ? (
                  <LengthOrientationInformation
                    className={styles.lengthOrientationInformationAdjacent}
                  />
                ) : undefined
              }
              {...(snapshot.step === 'component-category-overview'
                ? { mutedSpeechParagraphIndexes: [1] }
                : {})}
              speechPlacement={
                componentGuidanceVisible ||
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
    </PasswordCategoryHoverCoachProvider>
  );
}
