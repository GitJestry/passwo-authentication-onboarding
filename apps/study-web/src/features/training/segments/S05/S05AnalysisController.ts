import type { PasswordSemanticReflectionSelection } from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
  createLowercaseSearchSpaceModel,
  createSystemGeneratedSearchSpaceModel,
  determinePasswordSimulationDisposition,
} from '@passwo/password-analysis';
import { getS05Animation, s05Content } from '@passwo/training-content';
import {
  type AnimationPlayerPort,
  type MissionDefinition,
  type MissionSnapshot,
  MissionController,
} from '@passwo/training-engine';
import {
  type PasswordFindingSceneSnapshot,
  type PasswordFreeSearchApplicationSceneSnapshot,
  type PasswordFreeSearchDemonstrationSceneSnapshot,
  type PasswordStructureSceneSnapshot,
  createPasswordFindingScene,
  createPasswordFreeSearchApplicationScene,
  createPasswordFreeSearchDemonstrationScene,
  createPasswordStructureScene,
} from '@passwo/visualization';
import {
  createCanonicalPasswordView,
  createPersonalFindings,
  type S05CanonicalPasswordView,
  type S05CategoryCardStatus,
  type S05CategoryFinding,
  type S05ComponentCategoryId,
} from './S05ComponentStrategy.js';

export type S05AnalysisStep =
  | 'candidate-check'
  | 'random-sequence'
  | 'recognizable-combination'
  | 'building-blocks'
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
  | 'structure-sentence'
  | 'structure-repetition'
  | 'structure-context'
  | 'structure-application'
  | 'free-search-transition'
  | 'same-length'
  | 'estimate'
  | 'lowercase-clock'
  | 'generated-characters'
  | 'predictable-mix'
  | 'chosen-words'
  | 'authored-words'
  | 'free-search-application'
  | 'summary-components'
  | 'summary-structure'
  | 'summary-free-search'
  | 'summary-memory';

export type S05Estimate = (typeof s05Content.freeSearch.estimate.options)[number];

export interface S05AnalysisSubject {
  readonly id: string;
  readonly label: string;
  readonly fictionalPassword: string;
  readonly analysisContext: {
    readonly accountTerms: readonly string[];
    readonly transientAccountIdentifiers?: readonly string[];
  };
}

export type S05InitialSection = 'intro' | 'components' | 'structure';

export interface S05AnalysisControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly step: S05AnalysisStep;
  readonly findingScene: PasswordFindingSceneSnapshot;
  readonly structureScene: PasswordStructureSceneSnapshot;
  readonly freeSearchDemonstrationScene: PasswordFreeSearchDemonstrationSceneSnapshot;
  readonly freeSearchApplicationScene: PasswordFreeSearchApplicationSceneSnapshot;
  readonly estimate: {
    readonly selected: S05Estimate | null;
    readonly confirmed: boolean;
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
      readonly blockIds: readonly string[];
    };
  };
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

interface S05AnalysisControllerOptions {
  readonly subject: S05AnalysisSubject;
  readonly animationPlayer: AnimationPlayerPort;
  readonly initialSection?: S05InitialSection;
  readonly onComplete?: () => void;
}

type Listener = (snapshot: S05AnalysisControllerSnapshot) => void;

const stepByMissionId: Readonly<Record<string, S05AnalysisStep>> = {
  's05-candidate-check': 'candidate-check',
  's05-random-sequence': 'random-sequence',
  's05-recognizable-combination': 'recognizable-combination',
  's05-building-blocks': 'building-blocks',
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
  's05-structure-sentence': 'structure-sentence',
  's05-structure-repetition': 'structure-repetition',
  's05-structure-context': 'structure-context',
  's05-structure-application': 'structure-application',
  's05-free-search-transition': 'free-search-transition',
  's05-same-length': 'same-length',
  's05-estimate': 'estimate',
  's05-lowercase-clock': 'lowercase-clock',
  's05-generated-characters': 'generated-characters',
  's05-predictable-mix': 'predictable-mix',
  's05-chosen-words': 'chosen-words',
  's05-authored-words': 'authored-words',
  's05-free-search-application': 'free-search-application',
  's05-summary-components': 'summary-components',
  's05-summary-structure': 'summary-structure',
  's05-summary-free-search': 'summary-free-search',
  's05-summary-memory': 'summary-memory',
};

function initialComponentCards(): S05AnalysisControllerSnapshot['componentStrategy']['cards'] {
  return {
    'common-components': { status: 'pending', findings: [] },
    'personal-details': { status: 'pending', findings: [] },
    'account-context': { status: 'pending', findings: [] },
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
} as const satisfies Readonly<Record<S05InitialSection, string>>;

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
  #snapshot: S05AnalysisControllerSnapshot | null;
  #completionReported = false;
  #disposed = false;

  constructor({
    subject,
    animationPlayer,
    initialSection = 'intro',
    onComplete,
  }: S05AnalysisControllerOptions) {
    this.#mission = createMission(subject, initialSection);
    this.#onComplete = onComplete;
    const frozenAccountTerms = new Set(
      s05Content.analysis.authoredAccountTerms.map((term) => term.toLocaleLowerCase('de-DE')),
    );
    const componentAnalysis = analyzeFictionalPassword({
      fictionalPassword: subject.fictionalPassword,
      authoredAccountTerms: subject.analysisContext.accountTerms.filter((term) =>
        frozenAccountTerms.has(term.toLocaleLowerCase('de-DE')),
      ),
      ...(subject.analysisContext.transientAccountIdentifiers === undefined
        ? {}
        : {
            transientAccountIdentifiers:
              subject.analysisContext.transientAccountIdentifiers,
          }),
    });
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
    const freeSearchApplicationScene = createPasswordFreeSearchApplicationScene(
      `s05-free-search-application-${subject.id}`,
      subject.fictionalPassword,
      componentAnalysis,
      structureAnalysis,
      disposition,
    );
    this.#snapshot = {
      phase: 'ready',
      step: stepForMissionIndex(this.#mission, 0),
      findingScene,
      structureScene,
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
      freeSearchApplicationScene,
      estimate: { selected: null, confirmed: false },
      componentStrategy: {
        canonicalView,
        cards: initialComponentCards(),
        personalSelection: { blockIds: [] },
      },
      controls: { canStart: true, canReplay: false, canContinue: false },
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
          controls: { canStart: false, canReplay: false, canContinue: false },
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
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.start(this.#mission);
  }

  toggleSemanticReflection(selection: PasswordSemanticReflectionSelection): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-application' ||
      snapshot.structureScene.semanticReflection.confirmed
    ) {
      return;
    }
    const selected = new Set(snapshot.structureScene.semanticReflection.selected);
    if (selection === 'none-or-unsure') {
      selected.clear();
      selected.add(selection);
    } else {
      selected.delete('none-or-unsure');
      if (selected.has(selection)) selected.delete(selection);
      else selected.add(selection);
    }
    this.#snapshot = {
      ...snapshot,
      structureScene: {
        ...snapshot.structureScene,
        semanticReflection: {
          ...snapshot.structureScene.semanticReflection,
          selected: [...selected],
        },
      },
      controls: { ...snapshot.controls, canContinue: false },
    };
    this.#emit();
  }

  confirmSemanticReflection(): void {
    const snapshot = this.#snapshot;
    if (
      this.#disposed ||
      snapshot === null ||
      snapshot.step !== 'structure-application' ||
      snapshot.structureScene.semanticReflection.confirmed ||
      snapshot.structureScene.semanticReflection.selected.length === 0
    ) {
      return;
    }
    const semanticReflection = {
      ...snapshot.structureScene.semanticReflection,
      confirmed: true,
    } as const;
    this.#snapshot = {
      ...snapshot,
      structureScene: createPasswordStructureScene(
        snapshot.structureScene.id,
        snapshot.structureScene.authoredDemonstrations,
        snapshot.structureScene.runtimeAnalysis,
        semanticReflection,
      ),
      controls: { ...snapshot.controls, canContinue: true },
    };
    this.#emit();
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

  togglePersonalBlock(blockId: string): void {
    const snapshot = this.#snapshot;
    if (this.#disposed || snapshot === null || snapshot.step !== 'personal-details-check') return;
    const selected = new Set(snapshot.componentStrategy.personalSelection.blockIds);
    if (selected.has(blockId)) selected.delete(blockId);
    else selected.add(blockId);
    this.#snapshot = {
      ...snapshot,
      componentStrategy: {
        ...snapshot.componentStrategy,
        personalSelection: {
          blockIds: [...selected],
        },
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
      snapshot.componentStrategy.personalSelection.blockIds,
    );
    this.#snapshot = {
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
    };
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
      controls: { ...snapshot.controls, canContinue: true },
    };
    this.#emit();
  }

  replay(): void {
    if (this.#disposed || this.#snapshot === null || !this.#snapshot.controls.canReplay) return;
    this.#missionController.replay();
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

  #handleMissionSnapshot(snapshot: MissionSnapshot): void {
    if (this.#disposed || snapshot.status === 'done') return;
    const step = stepForMissionIndex(this.#mission, snapshot.context.stepIndex);
    const awaitingDecision = snapshot.matches({ active: 'awaitingDecision' });
    const animating = snapshot.matches({ active: 'animating' });
    if (!awaitingDecision && !animating) return;
    const currentSnapshot = this.#snapshot;
    if (currentSnapshot === null) return;
    this.#snapshot = {
      ...currentSnapshot,
      phase: awaitingDecision ? 'awaiting-decision' : 'animating',
      step,
      componentStrategy: {
        ...currentSnapshot.componentStrategy,
        cards: cardsForStep(currentSnapshot.componentStrategy.cards, step),
      },
      controls: {
        canStart: false,
        canReplay: awaitingDecision,
        canContinue:
          awaitingDecision &&
          (step !== 'estimate' || currentSnapshot.estimate.confirmed) &&
          (step !== 'structure-application' ||
            currentSnapshot.structureScene.semanticReflection.confirmed),
      },
    };
    this.#emit();
  }

  #emit(): void {
    const snapshot = this.#snapshot;
    if (snapshot === null) return;
    for (const listener of this.#listeners) listener(snapshot);
  }
}
