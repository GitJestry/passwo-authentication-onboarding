import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
  createLowercaseSearchSpaceModel,
  createSystemGeneratedSearchSpaceModel,
  determinePasswordSimulationDisposition,
} from '@passwo/password-analysis';
import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  TransientPasswordSemanticEvidence,
  TransientPasswordSemanticRelation,
} from '@passwo/contracts';
import { getS05Animation, s05Content } from '@passwo/training-content';
import {
  type AnimationPlayerPort,
  type MissionDefinition,
  type MissionSnapshot,
  MissionController,
} from '@passwo/training-engine';
import {
  type PasswordFindingSceneSnapshot,
  type PasswordAssessmentSceneSnapshot,
  type PasswordFreeSearchDemonstrationSceneSnapshot,
  type PasswordStructureSceneSnapshot,
  createPasswordFindingScene,
  createPasswordAssessmentScene,
  createPasswordFreeSearchDemonstrationScene,
  createPasswordStructureScene,
  type NetworkSceneSnapshot,
} from '@passwo/visualization';
import {
  createCanonicalPasswordView,
  createPersonalFindings,
  isS05CharacterBoundary,
  projectCanonicalPasswordBlocks,
  type S05CanonicalPasswordView,
  type S05CategoryCardStatus,
  type S05CategoryFinding,
  type S05ComponentCategoryId,
  type S05DisplayBlock,
  type S05PersonalCandidate,
} from './S05ComponentStrategy.js';
import {
  createS05AssessmentNetwork,
  type S05AssessmentNetworkPhase,
} from '../account-network.js';

export type S05AnalysisStep =
  | 'candidate-check'
  | 'random-sequence'
  | 'recognizable-combination'
  | 'strategy-targeting'
  | 'component-category-overview'
  | 'common-components-start'
  | 'common-components-examples'
  | 'common-components-changes'
  | 'common-components-intro'
  | 'common-components-result'
  | 'personal-details-opening'
  | 'personal-details-derivation'
  | 'personal-details-examples'
  | 'personal-details-intro'
  | 'personal-details-check'
  | 'personal-details-result'
  | 'account-context-opening'
  | 'account-context-examples'
  | 'account-context-intro'
  | 'account-context-result'
  | 'components-summary'
  | 'structure-intro'
  | 'structure-theme'
  | 'structure-theme-guessing'
  | 'structure-theme-reflection'
  | 'structure-sentence'
  | 'structure-sentence-guessing'
  | 'structure-sentence-reflection'
  | 'structure-repetition'
  | 'structure-repetition-guessing'
  | 'structure-application'
  | 'free-search-transition'
  | 'character-mix-first'
  | 'character-mix-comparison'
  | 'character-mix-difference'
  | 'character-mix-types'
  | 'character-mix-strategy'
  | 'character-mix-takeaway'
  | 'estimate'
  | 'lowercase-clock'
  | 'length-model-comparison'
  | 'length-orientation'
  | 'length-reasons-intro'
  | 'length-memorability'
  | 'length-full-word-attack'
  | 'length-short-word-comparison'
  | 'length-sufficient-pools'
  | 'length-takeaway'
  | 'length-second-reason-transition'
  | 'length-four-german-words'
  | 'length-four-german-effort'
  | 'length-language-pool-stack'
  | 'length-multilingual-words'
  | 'length-fifth-word-comparison'
  | 'length-language-pool-question'
  | 'length-language-pool-result'
  | 'length-language-pool-takeaway'
  | 'length-charset-analogy-types'
  | 'length-charset-analogy-position'
  | 'length-charset-predictability'
  | 'length-passphrase-outlook'
  | 'final-components'
  | 'final-length'
  | 'final-result'
  | 'final-spread'
  | 'final-takeaway';

export type S05Estimate = (typeof s05Content.freeSearch.estimate.options)[number];

export interface S05StructureContentGroup {
  readonly id: string;
  readonly blockIds: readonly string[];
}

export interface S05StructureSentenceLink {
  readonly fromBlockId: string;
  readonly toBlockId: string;
}

export interface S05StructureReflectionSnapshot {
  readonly contentGroups: readonly S05StructureContentGroup[];
  readonly activeContentGroupId: string;
  readonly sentenceLinks: readonly S05StructureSentenceLink[];
  readonly contentConfirmed: boolean;
  readonly sentenceConfirmed: boolean;
}

export interface S05AnalysisSubject {
  readonly id: string;
  readonly label: string;
  readonly fictionalPassword: string;
  readonly analysisContext: {
    readonly accountTerms: readonly string[];
    readonly transientAccountIdentifiers?: readonly string[];
  };
}

export type S05InitialSection = 'intro' | 'components' | 'structure' | 'free-search' | 'application';

export interface S05AnalysisControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly step: S05AnalysisStep;
  readonly findingScene: PasswordFindingSceneSnapshot;
  readonly structureScene: PasswordStructureSceneSnapshot;
  readonly structureReflection: S05StructureReflectionSnapshot;
  readonly semanticEvidence: TransientPasswordSemanticEvidence;
  readonly freeSearchDemonstrationScene: PasswordFreeSearchDemonstrationSceneSnapshot;
  readonly assessmentScene: PasswordAssessmentSceneSnapshot;
  readonly assessmentNetwork: NetworkSceneSnapshot;
  readonly estimate: {
    readonly selected: S05Estimate | null;
    readonly confirmed: boolean;
  };
  readonly languagePoolEstimate: {
    readonly value: number;
    readonly submittedValue: number | null;
  };
  readonly lowercaseScale: {
    readonly password: string;
    readonly reachedSixteen: boolean;
    readonly maximumLengthSeen: number;
  };
  readonly componentStrategy: {
    readonly canonicalView: S05CanonicalPasswordView | null;
    readonly cards: Readonly<
      Record<
        S05ComponentCategoryId,
        { readonly status: S05CategoryCardStatus; readonly findings: readonly S05CategoryFinding[] }
      >
    >;
    readonly personalSelection: {
      readonly candidates: readonly S05PersonalCandidate[];
    };
  };
  readonly controls: {
    readonly canStart: boolean;
    readonly canContinue: boolean;
  };
}

interface S05AnalysisControllerOptions {
  readonly subject: S05AnalysisSubject;
  readonly animationPlayer: AnimationPlayerPort;
  readonly initialSection?: S05InitialSection;
  readonly onComplete?: () => void;
  readonly nextLowercaseCharacter: () => string;
}

type Listener = (snapshot: S05AnalysisControllerSnapshot) => void;

const stepByMissionId: Readonly<Record<string, S05AnalysisStep>> = {
  's05-candidate-check': 'candidate-check',
  's05-random-sequence': 'random-sequence',
  's05-recognizable-combination': 'recognizable-combination',
  's05-strategy-targeting': 'strategy-targeting',
  's05-component-category-overview': 'component-category-overview',
  's05-common-components-start': 'common-components-start',
  's05-common-components-examples': 'common-components-examples',
  's05-common-components-changes': 'common-components-changes',
  's05-common-components-intro': 'common-components-intro',
  's05-common-components-result': 'common-components-result',
  's05-personal-details-opening': 'personal-details-opening',
  's05-personal-details-derivation': 'personal-details-derivation',
  's05-personal-details-examples': 'personal-details-examples',
  's05-personal-details-intro': 'personal-details-intro',
  's05-personal-details-check': 'personal-details-check',
  's05-personal-details-result': 'personal-details-result',
  's05-account-context-opening': 'account-context-opening',
  's05-account-context-examples': 'account-context-examples',
  's05-account-context-intro': 'account-context-intro',
  's05-account-context-result': 'account-context-result',
  's05-components-summary': 'components-summary',
  's05-structure-intro': 'structure-intro',
  's05-structure-theme': 'structure-theme',
  's05-structure-theme-guessing': 'structure-theme-guessing',
  's05-structure-theme-reflection': 'structure-theme-reflection',
  's05-structure-sentence': 'structure-sentence',
  's05-structure-sentence-guessing': 'structure-sentence-guessing',
  's05-structure-sentence-reflection': 'structure-sentence-reflection',
  's05-structure-repetition': 'structure-repetition',
  's05-structure-repetition-guessing': 'structure-repetition-guessing',
  's05-structure-application': 'structure-application',
  's05-free-search-transition': 'free-search-transition',
  's05-character-mix-first': 'character-mix-first',
  's05-character-mix-comparison': 'character-mix-comparison',
  's05-character-mix-difference': 'character-mix-difference',
  's05-character-mix-types': 'character-mix-types',
  's05-character-mix-strategy': 'character-mix-strategy',
  's05-character-mix-takeaway': 'character-mix-takeaway',
  's05-estimate': 'estimate',
  's05-lowercase-clock': 'lowercase-clock',
  's05-length-model-comparison': 'length-model-comparison',
  's05-length-orientation': 'length-orientation',
  's05-length-reasons-intro': 'length-reasons-intro',
  's05-length-memorability': 'length-memorability',
  's05-length-full-word-attack': 'length-full-word-attack',
  's05-length-short-word-comparison': 'length-short-word-comparison',
  's05-length-sufficient-pools': 'length-sufficient-pools',
  's05-length-takeaway': 'length-takeaway',
  's05-length-second-reason-transition': 'length-second-reason-transition',
  's05-length-four-german-words': 'length-four-german-words',
  's05-length-four-german-effort': 'length-four-german-effort',
  's05-length-language-pool-stack': 'length-language-pool-stack',
  's05-length-multilingual-words': 'length-multilingual-words',
  's05-length-fifth-word-comparison': 'length-fifth-word-comparison',
  's05-length-language-pool-question': 'length-language-pool-question',
  's05-length-language-pool-result': 'length-language-pool-result',
  's05-length-language-pool-takeaway': 'length-language-pool-takeaway',
  's05-length-charset-analogy-types': 'length-charset-analogy-types',
  's05-length-charset-analogy-position': 'length-charset-analogy-position',
  's05-length-charset-predictability': 'length-charset-predictability',
  's05-length-passphrase-outlook': 'length-passphrase-outlook',
  's05-final-components': 'final-components',
  's05-final-length': 'final-length',
  's05-final-result': 'final-result',
  's05-final-spread': 'final-spread',
  's05-final-takeaway': 'final-takeaway',
};

function initialComponentCards(): S05AnalysisControllerSnapshot['componentStrategy']['cards'] {
  return {
    'common-components': { status: 'pending', findings: [] },
    'personal-details': { status: 'pending', findings: [] },
    'account-context': { status: 'pending', findings: [] },
  };
}

function initialStructureReflection(): S05StructureReflectionSnapshot {
  return {
    contentGroups: [{ id: 'content-group-1', blockIds: [] }],
    activeContentGroupId: 'content-group-1',
    sentenceLinks: [],
    contentConfirmed: false,
    sentenceConfirmed: false,
  };
}

function releasedStructureFindings(
  snapshot: S05AnalysisControllerSnapshot,
): readonly S05CategoryFinding[] {
  return s05Content.componentStrategy.categories.flatMap(({ id }) => {
    const card = snapshot.componentStrategy.cards[id];
    return card.status === 'checked-findings' ? card.findings : [];
  });
}

function structureReflectionBlockIds(snapshot: S05AnalysisControllerSnapshot): readonly string[] {
  return structureReflectionBlocks(snapshot).map(({ id }) => id);
}

function structureReflectionBlocks(
  snapshot: S05AnalysisControllerSnapshot,
): readonly S05DisplayBlock[] {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) return [];
  return projectCanonicalPasswordBlocks(view, releasedStructureFindings(snapshot));
}

function semanticEvidenceSpan(
  password: string,
  start: number,
  end: number,
): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: password.slice(start, end) };
}

function relationFromBlocks(
  password: string,
  id: string,
  kind: TransientPasswordSemanticRelation['kind'],
  blockIds: readonly string[],
  blocks: readonly S05DisplayBlock[],
): TransientPasswordSemanticRelation | null {
  const evidence = blockIds
    .flatMap((blockId) => {
      const block = blocks.find(({ id: candidateId }) => candidateId === blockId);
      return block === undefined
        ? []
        : [semanticEvidenceSpan(password, block.start, block.end)];
    })
    .filter(
      (span, index, spans) =>
        spans.findIndex(
          (candidate) => candidate.start === span.start && candidate.end === span.end,
        ) === index,
    )
    .sort((left, right) => left.start - right.start || left.end - right.end);
  return evidence.length >= 2 ? { id, kind, evidence } : null;
}

function createTransientSemanticEvidence(
  snapshot: S05AnalysisControllerSnapshot,
): TransientPasswordSemanticEvidence {
  const view = snapshot.componentStrategy.canonicalView;
  if (view === null) {
    return {
      kind: 'transient-password-semantic-evidence',
      confirmed: false,
      relations: [],
    };
  }

  const personalCard = snapshot.componentStrategy.cards['personal-details'];
  const personalRelations: TransientPasswordSemanticRelation[] = personalCard.findings.map(
    ({ id, start, end }) => ({
      id: `semantic:${id}`,
      kind: 'personal-context',
      evidence: [semanticEvidenceSpan(view.password, start, end)],
    }),
  );
  const blocks = structureReflectionBlocks(snapshot);
  const contentRelations = snapshot.structureReflection.contentConfirmed
    ? snapshot.structureReflection.contentGroups.flatMap(({ id, blockIds }) => {
        const relation = relationFromBlocks(
          view.password,
          `semantic:content:${id}`,
          'shared-content',
          blockIds,
          blocks,
        );
        return relation === null ? [] : [relation];
      })
    : [];
  const sentenceRelations = snapshot.structureReflection.sentenceConfirmed
    ? snapshot.structureReflection.sentenceLinks.flatMap(({ fromBlockId, toBlockId }, index) => {
        const relation = relationFromBlocks(
          view.password,
          `semantic:sentence:${index}:${fromBlockId}:${toBlockId}`,
          'sentence-or-phrase',
          [fromBlockId, toBlockId],
          blocks,
        );
        return relation === null ? [] : [relation];
      })
    : [];
  const personalConfirmed =
    personalCard.status === 'checked-findings' || personalCard.status === 'checked-none';
  return {
    kind: 'transient-password-semantic-evidence',
    confirmed:
      personalConfirmed &&
      snapshot.structureReflection.contentConfirmed &&
      snapshot.structureReflection.sentenceConfirmed,
    relations: [...personalRelations, ...contentRelations, ...sentenceRelations],
  };
}

function categoryForStep(step: S05AnalysisStep): S05ComponentCategoryId | null {
  if (step === 'component-category-overview') return 'common-components';
  if (step.startsWith('common-components-')) return 'common-components';
  if (step.startsWith('personal-details-')) return 'personal-details';
  if (step.startsWith('account-context-')) return 'account-context';
  return null;
}

function cardsForStep(
  cards: S05AnalysisControllerSnapshot['componentStrategy']['cards'],
  step: S05AnalysisStep,
): S05AnalysisControllerSnapshot['componentStrategy']['cards'] {
  const currentCategory = categoryForStep(step);
  function updateCard(categoryId: S05ComponentCategoryId) {
    const card = cards[categoryId];
    const status: S05CategoryCardStatus =
      categoryId === currentCategory && card.status === 'pending'
        ? 'current'
        : categoryId !== currentCategory && card.status === 'current'
          ? 'pending'
          : card.status;
    return { ...card, status };
  }
  return {
    'common-components': updateCard('common-components'),
    'personal-details': updateCard('personal-details'),
    'account-context': updateCard('account-context'),
  };
}

const firstMissionIdBySection = {
  intro: 's05-candidate-check',
  components: 's05-component-category-overview',
  structure: 's05-structure-intro',
  'free-search': 's05-free-search-transition',
  application: 's05-final-components',
} as const satisfies Readonly<Record<S05InitialSection, string>>;

function assessmentNetworkPhase(step: S05AnalysisStep): S05AssessmentNetworkPhase {
  if (step === 'final-takeaway') return 'other-accounts';
  if (step === 'final-result' || step === 'final-length' || step === 'final-spread') {
    return 'campusgram-result';
  }
  return 'focus';
}

function createMission(
  subject: S05AnalysisSubject,
  initialSection: S05InitialSection,
): MissionDefinition {
  const firstMissionId = firstMissionIdBySection[initialSection];
  const firstAnimationIndex = s05Content.animations.findIndex(
    ([animationId]) => animationId === firstMissionId,
  );
  if (firstAnimationIndex < 0) throw new Error(`Missing S05 section start: ${firstMissionId}`);
  const animations = s05Content.animations.slice(firstAnimationIndex).map(([animationId]) => {
    const animation = getS05Animation(animationId);
    if (animation === undefined) throw new Error(`Missing authored S05 animation: ${animationId}`);
    return { id: animation.id, narrationId: animation.id, animation };
  });
  return {
    id: `s05-analysis-${subject.id}`,
    segmentId: 'S05',
    sectionId: 'passwords',
    requiresSafetyAcknowledgement: false,
    steps: animations,
  };
}

function stepForMissionIndex(mission: MissionDefinition, stepIndex: number): S05AnalysisStep {
  const stepId = mission.steps[stepIndex]?.id;
  const step = stepId === undefined ? undefined : stepByMissionId[stepId];
  if (step === undefined) throw new Error(`Unknown S05 mission step: ${stepId ?? 'missing'}`);
  return step;
}

export class S05AnalysisController {
  readonly #mission: MissionDefinition;
  readonly #missionController: MissionController;
  readonly #listeners = new Set<Listener>();
  readonly #unsubscribe: () => void;
  readonly #onComplete: (() => void) | undefined;
  readonly #nextLowercaseCharacter: () => string;
  readonly #subject: S05AnalysisSubject;
  readonly #componentAnalysis: PasswordAnalysisResult;
  #snapshot: S05AnalysisControllerSnapshot | null;
  #completionReported = false;
  #disposed = false;

  constructor({
    subject,
    animationPlayer,
    initialSection = 'intro',
    onComplete,
    nextLowercaseCharacter,
  }: S05AnalysisControllerOptions) {
    this.#subject = subject;
    this.#mission = createMission(subject, initialSection);
    this.#onComplete = onComplete;
    this.#nextLowercaseCharacter = nextLowercaseCharacter;
    const initialLowercasePassword = Array.from({ length: 12 }, () =>
      this.#createLowercaseCharacter(),
    ).join('');
    const componentAnalysis = analyzeFictionalPassword({
      fictionalPassword: subject.fictionalPassword,
      authoredAccountTerms: s05Content.analysis.authoredAccountTerms,
      ...(subject.analysisContext.transientAccountIdentifiers === undefined
        ? {}
        : {
            transientAccountIdentifiers:
              subject.analysisContext.transientAccountIdentifiers,
          }),
    });
    this.#componentAnalysis = componentAnalysis;
    const structureAnalysis = analyzeFictionalPasswordStructure({
      fictionalPassword: subject.fictionalPassword,
      componentAnalysis,
    });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword: subject.fictionalPassword,
      componentAnalysis,
    });
    const findingScene = createPasswordFindingScene(
      `s05-findings-${subject.id}`,
      componentAnalysis,
    );
    const canonicalView = createCanonicalPasswordView(
      subject.fictionalPassword,
      componentAnalysis,
    );
    const structureScene = createPasswordStructureScene(
      `s05-structure-${subject.id}`,
      s05Content.structure.demonstrations,
      structureAnalysis,
      {
        kind: 'local-password-semantic-reflection',
        selected: [],
        confirmed: false,
      },
    );
    const assessmentScene = createPasswordAssessmentScene(
      `s05-assessment-${subject.id}`,
      subject.fictionalPassword,
      componentAnalysis,
      disposition,
    );
    this.#snapshot = {
      phase: 'ready',
      step: stepForMissionIndex(this.#mission, 0),
      findingScene,
      structureScene,
      structureReflection: initialStructureReflection(),
      semanticEvidence: {
        kind: 'transient-password-semantic-evidence',
        confirmed: false,
        relations: [],
      },
      freeSearchDemonstrationScene: createPasswordFreeSearchDemonstrationScene({
        id: `s05-free-search-${subject.id}`,
        lowercaseMeasurements: s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.map(
          ({ length, durationLabel }) => ({
            model: createLowercaseSearchSpaceModel(length),
            durationLabel,
          }),
        ),
        generatedCharacterModel: createSystemGeneratedSearchSpaceModel(12),
        lowercaseReferenceModel: createLowercaseSearchSpaceModel(15),
      }),
      assessmentScene,
      assessmentNetwork: createS05AssessmentNetwork(
        assessmentScene.disposition.kind === 'whole-password-recognized',
        'focus',
      ),
      estimate: { selected: null, confirmed: false },
      languagePoolEstimate: {
        value:
          s05Content.freeSearch.lengthExamples.secondLengthReason.languagePoolEstimate.minimum,
        submittedValue: null,
      },
      lowercaseScale: {
        password: initialLowercasePassword,
        reachedSixteen: false,
        maximumLengthSeen: 12,
      },
      componentStrategy: {
        canonicalView,
        cards: initialComponentCards(),
        personalSelection: { candidates: [] },
      },
      controls: { canStart: true, canContinue: false },
    };
    this.#missionController = new MissionController({
      animationPlayer,
      onComplete: () => {
        const snapshot = this.#snapshot;
        if (snapshot === null || this.#completionReported) return;
        this.#completionReported = true;
        this.#snapshot = {
          ...snapshot,
          phase: 'complete',
          controls: { canStart: false, canContinue: false },
        };
        this.#emit();
        this.#onComplete?.();
      },
    });
    this.#unsubscribe = this.#missionController.subscribe((snapshot) =>
      this.#handleMissionSnapshot(snapshot),
    );
  }

  getSnapshot = (): S05AnalysisControllerSnapshot => {
    if (this.#snapshot === null) throw new Error('s05-controller-disposed');
    return this.#snapshot;
  };

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  start(): void {
    const snapshot = this.#snapshot;
    if (this.#disposed || snapshot === null || !snapshot.controls.canStart) return;
    this.#snapshot = {
      ...snapshot,
      controls: { canStart: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.start(this.#mission);
  }

  completeCommonComponentsCheck(): void {
    const snapshot = this.#snapshot;
    if (this.#disposed || snapshot === null || snapshot.step !== 'common-components-intro') return;
    const canonicalView = snapshot.componentStrategy.canonicalView;
    if (canonicalView === null) return;
    const findings = canonicalView.automaticFindings['common-components'];
    this.#snapshot = {
      ...snapshot,
      componentStrategy: {
        ...snapshot.componentStrategy,
        canonicalView,
        cards: {
          ...snapshot.componentStrategy.cards,
          'common-components': {
            status: findings.length === 0 ? 'checked-none' : 'checked-findings',
            findings,
          },
        },
      },
    };
    this.#emit();
    void this.#missionController.continue();
  }

  addPersonalCandidate(start: number, end: number): boolean {
    const snapshot = this.#snapshot;
    const password = snapshot?.componentStrategy.canonicalView?.password;
    if (
      this.#disposed ||
      snapshot === null ||
      password === undefined ||
      snapshot.step !== 'personal-details-check' ||
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      start >= end ||
      end > password.length ||
      !isS05CharacterBoundary(password, start) ||
      !isS05CharacterBoundary(password, end)
    ) {
      return false;
    }
    const candidates = snapshot.componentStrategy.personalSelection.candidates;
    if (candidates.some((candidate) => start < candidate.end && candidate.start < end)) {
      return false;
    }
    const candidate = { id: `personal:${start}-${end}`, start, end };
    this.#snapshot = {
      ...snapshot,
      componentStrategy: {
        ...snapshot.componentStrategy,
        personalSelection: {
          candidates: [...candidates, candidate].sort(
            (left, right) => left.start - right.start || left.end - right.end,
          ),
        },
      },
    };
    this.#emit();
    return true;
  }

  removePersonalCandidate(candidateId: string): void {
    const snapshot = this.#snapshot;
    if (this.#disposed || snapshot === null || snapshot.step !== 'personal-details-check') return;
    const candidates = snapshot.componentStrategy.personalSelection.candidates;
    const remaining = candidates.filter(({ id }) => id !== candidateId);
    if (remaining.length === candidates.length) return;
    this.#snapshot = {
      ...snapshot,
      componentStrategy: {
        ...snapshot.componentStrategy,
        personalSelection: { candidates: remaining },
      },
    };
    this.#emit();
  }

  completePersonalDetailsCheck(): void {
    const snapshot = this.#snapshot;
    const view = snapshot?.componentStrategy.canonicalView;
    if (
      this.#disposed ||
      snapshot === null ||
      view === null ||
      view === undefined ||
      snapshot.step !== 'personal-details-check'
    ) {
      return;
    }
    const findings = createPersonalFindings(
      view,
      snapshot.componentStrategy.personalSelection.candidates,
    );
    this.#snapshot = this.#withUpdatedSemanticAssessment({
      ...snapshot,
      componentStrategy: {
        ...snapshot.componentStrategy,
        cards: {
          ...snapshot.componentStrategy.cards,
          'personal-details': {
            status: findings.length === 0 ? 'checked-none' : 'checked-findings',
            findings,
          },
        },
      },
    });
    this.#emit();
    void this.#missionController.continue();
  }

  completeAccountContextCheck(): void {
    const snapshot = this.#snapshot;
    const view = snapshot?.componentStrategy.canonicalView;
    if (
      this.#disposed ||
      snapshot === null ||
      view === null ||
      view === undefined ||
      snapshot.step !== 'account-context-intro'
    ) {
      return;
    }
    const findings = view.automaticFindings['account-context'];
    this.#snapshot = {
      ...snapshot,
      componentStrategy: {
        ...snapshot.componentStrategy,
        cards: {
          ...snapshot.componentStrategy.cards,
          'account-context': {
            status: findings.length === 0 ? 'checked-none' : 'checked-findings',
            findings,
          },
        },
      },
    };
    this.#emit();
    void this.#missionController.continue();
  }

  selectStructureContentGroup(groupId: string): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-theme-reflection' ||
      !snapshot.structureReflection.contentGroups.some(({ id }) => id === groupId)
    ) {
      return;
    }
    this.#snapshot = {
      ...snapshot,
      structureReflection: {
        ...snapshot.structureReflection,
        activeContentGroupId: groupId,
      },
    };
    this.#emit();
  }

  toggleStructureContentBlock(blockId: string): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-theme-reflection'
    ) {
      return;
    }
    if (!structureReflectionBlockIds(snapshot).includes(blockId)) return;
    const reflection = snapshot.structureReflection;
    const activeGroup = reflection.contentGroups.find(
      ({ id }) => id === reflection.activeContentGroupId,
    );
    if (activeGroup === undefined) return;
    const alreadySelected = activeGroup.blockIds.includes(blockId);
    const contentGroups = reflection.contentGroups.map((group) => {
      if (group.id === activeGroup.id) {
        return {
          ...group,
          blockIds: alreadySelected
            ? group.blockIds.filter((id) => id !== blockId)
            : [...group.blockIds, blockId],
        };
      }
      return alreadySelected
        ? group
        : { ...group, blockIds: group.blockIds.filter((id) => id !== blockId) };
    });
    this.#snapshot = {
      ...snapshot,
      structureReflection: { ...reflection, contentGroups, contentConfirmed: false },
    };
    this.#emit();
  }

  addStructureContentGroup(): boolean {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-theme-reflection'
    ) {
      return false;
    }
    const reflection = snapshot.structureReflection;
    if (reflection.contentGroups.some(({ blockIds }) => blockIds.length === 0)) return false;
    const nextIndex =
      reflection.contentGroups.reduce((maximum, { id }) => {
        const match = /content-group-(\d+)/u.exec(id);
        return Math.max(maximum, Number(match?.[1] ?? 0));
      }, 0) + 1;
    const nextGroup = { id: `content-group-${nextIndex}`, blockIds: [] } as const;
    this.#snapshot = {
      ...snapshot,
      structureReflection: {
        ...reflection,
        contentGroups: [...reflection.contentGroups, nextGroup],
        activeContentGroupId: nextGroup.id,
        contentConfirmed: false,
      },
    };
    this.#emit();
    return true;
  }

  removeStructureContentGroup(groupId: string): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-theme-reflection'
    ) {
      return;
    }
    const reflection = snapshot.structureReflection;
    if (
      reflection.contentGroups.length <= 1 ||
      !reflection.contentGroups.some(({ id }) => id === groupId)
    ) {
      return;
    }
    const contentGroups = reflection.contentGroups.filter(({ id }) => id !== groupId);
    const activeContentGroupId =
      reflection.activeContentGroupId === groupId
        ? (contentGroups.at(-1)?.id ?? contentGroups[0]?.id ?? 'content-group-1')
        : reflection.activeContentGroupId;
    this.#snapshot = {
      ...snapshot,
      structureReflection: {
        ...reflection,
        contentGroups,
        activeContentGroupId,
        contentConfirmed: false,
      },
    };
    this.#emit();
  }

  completeStructureContentReflection(): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-theme-reflection'
    ) {
      return;
    }
    const nonEmptyGroups = snapshot.structureReflection.contentGroups.filter(
      ({ blockIds }) => blockIds.length > 0,
    );
    const contentGroups =
      nonEmptyGroups.length > 0
        ? nonEmptyGroups
        : [{ id: 'content-group-1', blockIds: [] }];
    const activeContentGroupId = contentGroups.some(
      ({ id }) => id === snapshot.structureReflection.activeContentGroupId,
    )
      ? snapshot.structureReflection.activeContentGroupId
      : (contentGroups[0]?.id ?? 'content-group-1');
    this.#snapshot = this.#withUpdatedSemanticAssessment({
      ...snapshot,
      structureReflection: {
        ...snapshot.structureReflection,
        contentGroups,
        activeContentGroupId,
        contentConfirmed: true,
      },
      controls: { ...snapshot.controls, canContinue: false },
    });
    this.#emit();
    void this.#missionController.continue();
  }

  toggleStructureSentenceLink(fromBlockId: string, toBlockId: string): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-sentence-reflection'
    ) {
      return;
    }
    const blockIds = structureReflectionBlockIds(snapshot);
    const fromIndex = blockIds.indexOf(fromBlockId);
    if (fromIndex < 0 || blockIds[fromIndex + 1] !== toBlockId) return;
    const reflection = snapshot.structureReflection;
    const exists = reflection.sentenceLinks.some(
      (link) => link.fromBlockId === fromBlockId && link.toBlockId === toBlockId,
    );
    const sentenceLinks = exists
      ? reflection.sentenceLinks.filter(
          (link) => link.fromBlockId !== fromBlockId || link.toBlockId !== toBlockId,
        )
      : [...reflection.sentenceLinks, { fromBlockId, toBlockId }];
    this.#snapshot = {
      ...snapshot,
      structureReflection: { ...reflection, sentenceLinks, sentenceConfirmed: false },
    };
    this.#emit();
  }

  completeStructureSentenceReflection(): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-sentence-reflection'
    ) {
      return;
    }
    this.#snapshot = this.#withUpdatedSemanticAssessment({
      ...snapshot,
      structureReflection: { ...snapshot.structureReflection, sentenceConfirmed: true },
      controls: { ...snapshot.controls, canContinue: false },
    });
    this.#emit();
    void this.#missionController.continue();
  }

  selectEstimate(estimate: S05Estimate): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'estimate' ||
      snapshot.estimate.confirmed
    )
      return;
    this.#snapshot = { ...snapshot, estimate: { selected: estimate, confirmed: false } };
    this.#emit();
  }

  confirmEstimate(): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'estimate' ||
      snapshot.estimate.selected === null ||
      snapshot.estimate.confirmed
    ) {
      return;
    }
    this.#snapshot = {
      ...snapshot,
      estimate: { ...snapshot.estimate, confirmed: true },
      controls: { ...snapshot.controls, canContinue: false },
    };
    this.#emit();
    void this.#missionController.continue();
  }

  setLanguagePoolEstimate(value: number): void {
    const snapshot = this.#snapshot;
    const content =
      s05Content.freeSearch.lengthExamples.secondLengthReason.languagePoolEstimate;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'length-language-pool-question' ||
      snapshot.phase !== 'awaiting-decision' ||
      snapshot.languagePoolEstimate.submittedValue !== null ||
      !Number.isFinite(value)
    ) {
      return;
    }
    const nextValue = Math.min(content.maximum, Math.max(content.minimum, Math.round(value)));
    if (nextValue === snapshot.languagePoolEstimate.value) return;
    this.#snapshot = {
      ...snapshot,
      languagePoolEstimate: { ...snapshot.languagePoolEstimate, value: nextValue },
    };
    this.#emit();
  }

  submitLanguagePoolEstimate(): boolean {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'length-language-pool-question' ||
      snapshot.phase !== 'awaiting-decision' ||
      snapshot.languagePoolEstimate.submittedValue !== null
    ) {
      return false;
    }
    this.#snapshot = {
      ...snapshot,
      languagePoolEstimate: {
        ...snapshot.languagePoolEstimate,
        submittedValue: snapshot.languagePoolEstimate.value,
      },
      controls: { ...snapshot.controls, canContinue: false },
    };
    this.#emit();
    void this.#missionController.continue();
    return true;
  }

  addLowercaseCharacter(): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'lowercase-clock' ||
      snapshot.lowercaseScale.password.length >= 20
    ) {
      return;
    }
    const password = `${snapshot.lowercaseScale.password}${this.#createLowercaseCharacter()}`;
    this.#snapshot = {
      ...snapshot,
      lowercaseScale: {
        ...snapshot.lowercaseScale,
        password,
        reachedSixteen: snapshot.lowercaseScale.reachedSixteen || password.length >= 16,
        maximumLengthSeen: Math.max(snapshot.lowercaseScale.maximumLengthSeen, password.length),
      },
    };
    this.#emit();
  }

  removeLowercaseCharacter(): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'lowercase-clock' ||
      snapshot.lowercaseScale.password.length <= 8
    ) {
      return;
    }
    this.#snapshot = {
      ...snapshot,
      lowercaseScale: {
        ...snapshot.lowercaseScale,
        password: snapshot.lowercaseScale.password.slice(0, -1),
      },
    };
    this.#emit();
  }

  completeLowercaseScale(): boolean {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'lowercase-clock' ||
      !snapshot.lowercaseScale.reachedSixteen
    ) {
      return false;
    }
    const currentPassword = snapshot.lowercaseScale.password;
    const orientationPassword =
      currentPassword.length >= 15
        ? currentPassword.slice(0, 15)
        : `${currentPassword}${Array.from(
            { length: 15 - currentPassword.length },
            () => this.#createLowercaseCharacter(),
          ).join('')}`;
    this.#snapshot = {
      ...snapshot,
      lowercaseScale: {
        ...snapshot.lowercaseScale,
        password: orientationPassword,
      },
    };
    this.#emit();
    void this.#missionController.continue();
    return true;
  }

  continue(): void {
    if (this.#disposed || this.#snapshot === null || !this.#snapshot.controls.canContinue) return;
    void this.#missionController.continue();
  }

  async dispose(): Promise<void> {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#unsubscribe();
    this.#snapshot = null;
    this.#listeners.clear();
    await this.#missionController.dispose();
  }

  #withUpdatedSemanticAssessment(
    snapshot: S05AnalysisControllerSnapshot,
  ): S05AnalysisControllerSnapshot {
    const semanticEvidence = createTransientSemanticEvidence(snapshot);
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword: this.#subject.fictionalPassword,
      componentAnalysis: this.#componentAnalysis,
      semanticEvidence,
    });
    return {
      ...snapshot,
      semanticEvidence,
      assessmentScene: createPasswordAssessmentScene(
        `s05-assessment-${this.#subject.id}`,
        this.#subject.fictionalPassword,
        this.#componentAnalysis,
        disposition,
      ),
      assessmentNetwork: createS05AssessmentNetwork(
        disposition.kind === 'whole-password-recognized',
        assessmentNetworkPhase(snapshot.step),
      ),
    };
  }

  #handleMissionSnapshot(snapshot: MissionSnapshot): void {
    if (this.#disposed || snapshot.status === 'done') return;
    const step = stepForMissionIndex(this.#mission, snapshot.context.stepIndex);
    const awaitingDecision = snapshot.matches({ active: 'awaitingDecision' });
    const animating = snapshot.matches({ active: 'animating' });
    if (!awaitingDecision && !animating) return;
    const currentSnapshot = this.#snapshot;
    if (currentSnapshot === null) return;
    const keepsAssessmentNetwork =
      assessmentNetworkPhase(currentSnapshot.step) === assessmentNetworkPhase(step);
    this.#snapshot = {
      ...currentSnapshot,
      phase: awaitingDecision ? 'awaiting-decision' : 'animating',
      step,
      componentStrategy: {
        ...currentSnapshot.componentStrategy,
        cards: cardsForStep(currentSnapshot.componentStrategy.cards, step),
      },
      assessmentNetwork: keepsAssessmentNetwork
        ? currentSnapshot.assessmentNetwork
        : createS05AssessmentNetwork(
            currentSnapshot.assessmentScene.disposition.kind === 'whole-password-recognized',
            assessmentNetworkPhase(step),
          ),
      controls: {
        canStart: false,
        canContinue:
          awaitingDecision &&
          step !== 'lowercase-clock' &&
          step !== 'length-language-pool-question' &&
          (step !== 'estimate' || currentSnapshot.estimate.confirmed),
      },
    };
    this.#emit();
  }

  #emit(): void {
    const snapshot = this.#snapshot;
    if (snapshot === null) return;
    for (const listener of this.#listeners) listener(snapshot);
  }

  #createLowercaseCharacter(): string {
    const character = this.#nextLowercaseCharacter();
    if (!/^[a-z]$/.test(character)) throw new Error('invalid-s05-lowercase-character');
    return character;
  }
}
