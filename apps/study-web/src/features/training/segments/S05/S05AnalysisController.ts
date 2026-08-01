import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
  createLowercaseSearchSpaceModel,
  createSystemGeneratedSearchSpaceModel,
  determinePasswordSimulationDisposition,
} from '@passwo/password-analysis';
import { type S05DesignLabFixture, getS05Animation, s05Content } from '@passwo/training-content';
import {
  type AnimationPlayerPort,
  type MissionDefinition,
  type MissionSnapshot,
  MissionController,
} from '@passwo/training-engine';
import {
  type PasswordCandidateSceneSnapshot,
  type PasswordFindingSceneSnapshot,
  type PasswordFreeSearchApplicationSceneSnapshot,
  type PasswordFreeSearchDemonstrationSceneSnapshot,
  type PasswordStructureSceneSnapshot,
  createPasswordCandidateScene,
  createPasswordFindingScene,
  createPasswordFreeSearchApplicationScene,
  createPasswordFreeSearchDemonstrationScene,
  createPasswordStructureScene,
} from '@passwo/visualization';

export type S05AnalysisStep =
  | 'candidate-check'
  | 'component-analysis'
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

export interface S05AnalysisControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly step: S05AnalysisStep;
  readonly candidateScene: PasswordCandidateSceneSnapshot;
  readonly findingScene: PasswordFindingSceneSnapshot;
  readonly structureScene: PasswordStructureSceneSnapshot;
  readonly freeSearchDemonstrationScene: PasswordFreeSearchDemonstrationSceneSnapshot;
  readonly freeSearchApplicationScene: PasswordFreeSearchApplicationSceneSnapshot;
  readonly estimate: {
    readonly selected: S05Estimate | null;
    readonly confirmed: boolean;
  };
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

interface S05AnalysisControllerOptions {
  readonly fixture: S05DesignLabFixture;
  readonly animationPlayer: AnimationPlayerPort;
}

type Listener = (snapshot: S05AnalysisControllerSnapshot) => void;

const stepByMissionId: Readonly<Record<string, S05AnalysisStep>> = {
  's05-candidate-check': 'candidate-check',
  's05-component-analysis': 'component-analysis',
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

function createMission(fixture: S05DesignLabFixture): MissionDefinition {
  const animations = s05Content.animations.map(([animationId]) => {
    const animation = getS05Animation(animationId);
    if (animation === undefined) throw new Error(`Missing authored S05 animation: ${animationId}`);
    return { id: animation.id, narrationId: animation.id, animation };
  });
  return {
    id: `s05-analysis-${fixture.id}`,
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
  #snapshot: S05AnalysisControllerSnapshot;
  #disposed = false;

  constructor({ fixture, animationPlayer }: S05AnalysisControllerOptions) {
    this.#mission = createMission(fixture);
    const componentAnalysis = analyzeFictionalPassword({
      fictionalPassword: fixture.fictionalPassword,
      authoredAccountTerms: fixture.analysisContext.accountTerms,
    });
    const structureAnalysis = analyzeFictionalPasswordStructure({
      fictionalPassword: fixture.fictionalPassword,
      componentAnalysis,
    });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword: fixture.fictionalPassword,
      componentAnalysis,
      structureAnalysis,
    });
    this.#snapshot = {
      phase: 'ready',
      step: 'candidate-check',
      candidateScene: createPasswordCandidateScene({
        id: `s05-candidates-${fixture.id}`,
        candidates: s05Content.intro.candidates,
      }),
      findingScene: createPasswordFindingScene(`s05-findings-${fixture.id}`, componentAnalysis),
      structureScene: createPasswordStructureScene(
        `s05-structure-${fixture.id}`,
        s05Content.structure.demonstrations,
        structureAnalysis,
      ),
      freeSearchDemonstrationScene: createPasswordFreeSearchDemonstrationScene({
        id: `s05-free-search-${fixture.id}`,
        lowercaseMeasurements: s05Content.freeSearch.theoreticalModel.lowercaseMeasurements.map(
          ({ length, durationLabel }) => ({
            model: createLowercaseSearchSpaceModel(length),
            durationLabel,
          }),
        ),
        generatedCharacterModel: createSystemGeneratedSearchSpaceModel(12),
        lowercaseReferenceModel: createLowercaseSearchSpaceModel(15),
      }),
      freeSearchApplicationScene: createPasswordFreeSearchApplicationScene(
        `s05-free-search-application-${fixture.id}`,
        fixture.fictionalPassword,
        componentAnalysis,
        structureAnalysis,
        disposition,
      ),
      estimate: { selected: null, confirmed: false },
      controls: { canStart: true, canReplay: false, canContinue: false },
    };
    this.#missionController = new MissionController({
      animationPlayer,
      onComplete: () => {
        this.#snapshot = {
          ...this.#snapshot,
          phase: 'complete',
          controls: { canStart: false, canReplay: false, canContinue: false },
        };
        this.#emit();
      },
    });
    this.#unsubscribe = this.#missionController.subscribe((snapshot) =>
      this.#handleMissionSnapshot(snapshot),
    );
  }

  getSnapshot = (): S05AnalysisControllerSnapshot => this.#snapshot;

  subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  start(): void {
    if (this.#disposed || !this.#snapshot.controls.canStart) return;
    this.#snapshot = {
      ...this.#snapshot,
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.start(this.#mission);
  }

  selectEstimate(estimate: S05Estimate): void {
    if (this.#disposed || this.#snapshot.step !== 'estimate' || this.#snapshot.estimate.confirmed) {
      return;
    }
    this.#snapshot = { ...this.#snapshot, estimate: { selected: estimate, confirmed: false } };
    this.#emit();
  }

  confirmEstimate(): void {
    if (
      this.#disposed ||
      this.#snapshot.step !== 'estimate' ||
      this.#snapshot.estimate.selected === null ||
      this.#snapshot.estimate.confirmed
    ) {
      return;
    }
    this.#snapshot = {
      ...this.#snapshot,
      estimate: { ...this.#snapshot.estimate, confirmed: true },
      controls: { ...this.#snapshot.controls, canContinue: true },
    };
    this.#emit();
  }

  replay(): void {
    if (this.#disposed || !this.#snapshot.controls.canReplay) return;
    this.#missionController.replay();
  }

  continue(): void {
    if (this.#disposed || !this.#snapshot.controls.canContinue) return;
    void this.#missionController.continue();
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    this.#unsubscribe();
    await this.#missionController.dispose();
    this.#listeners.clear();
  }

  #handleMissionSnapshot(snapshot: MissionSnapshot): void {
    if (this.#disposed || snapshot.status === 'done') return;
    const step = stepForMissionIndex(this.#mission, snapshot.context.stepIndex);
    const awaitingDecision = snapshot.matches({ active: 'awaitingDecision' });
    const animating = snapshot.matches({ active: 'animating' });
    if (!awaitingDecision && !animating) return;
    this.#snapshot = {
      ...this.#snapshot,
      phase: awaitingDecision ? 'awaiting-decision' : 'animating',
      step,
      controls: {
        canStart: false,
        canReplay: awaitingDecision,
        canContinue: awaitingDecision && (step !== 'estimate' || this.#snapshot.estimate.confirmed),
      },
    };
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
