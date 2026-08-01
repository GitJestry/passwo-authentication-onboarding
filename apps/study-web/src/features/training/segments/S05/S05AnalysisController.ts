import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
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
  type PasswordStructureSceneSnapshot,
  createPasswordCandidateScene,
  createPasswordFindingScene,
  createPasswordStructureScene,
} from '@passwo/visualization';

export type S05AnalysisStep =
  | 'candidate-check'
  | 'component-analysis'
  | 'structure-theme'
  | 'structure-sentence'
  | 'structure-repetition'
  | 'structure-context'
  | 'structure-application';

export interface S05AnalysisControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly step: S05AnalysisStep;
  readonly candidateScene: PasswordCandidateSceneSnapshot | null;
  readonly findingScene: PasswordFindingSceneSnapshot | null;
  readonly structureScene: PasswordStructureSceneSnapshot | null;
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

function createMission(fixture: S05DesignLabFixture): MissionDefinition {
  const animationIds =
    fixture.slice === 'component-analysis'
      ? ['s05-candidate-check', 's05-component-analysis']
      : [...s05Content.structure.demonstrations.map(({ id }) => id), 's05-structure-application'];
  const animations = animationIds.map((animationId) => {
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
  switch (stepId) {
    case 's05-candidate-check':
      return 'candidate-check';
    case 's05-component-analysis':
      return 'component-analysis';
    case 's05-structure-theme':
      return 'structure-theme';
    case 's05-structure-sentence':
      return 'structure-sentence';
    case 's05-structure-repetition':
      return 'structure-repetition';
    case 's05-structure-context':
      return 'structure-context';
    case 's05-structure-application':
      return 'structure-application';
    default:
      throw new Error(`Unknown S05 mission step: ${stepId ?? 'missing'}`);
  }
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
    const isComponentFixture = fixture.slice === 'component-analysis';
    const runtimeAnalysis = analyzeFictionalPassword({
      fictionalPassword: fixture.fictionalPassword,
      authoredAccountTerms: fixture.analysisContext.accountTerms,
    });
    const runtimeStructureAnalysis = analyzeFictionalPasswordStructure({
      fictionalPassword: fixture.fictionalPassword,
      componentAnalysis: runtimeAnalysis,
    });
    this.#snapshot = {
      phase: 'ready',
      step: isComponentFixture ? 'candidate-check' : 'structure-theme',
      candidateScene: isComponentFixture
        ? createPasswordCandidateScene({
            id: `s05-candidates-${fixture.id}`,
            candidates: s05Content.intro.candidates,
            theoreticalSearchSpaceId: s05Content.theoreticalSearchSpace.id,
            characterGroups: s05Content.theoreticalSearchSpace.characterGroups,
          })
        : null,
      findingScene: isComponentFixture
        ? createPasswordFindingScene(`s05-findings-${fixture.id}`, runtimeAnalysis)
        : null,
      structureScene:
        fixture.slice === 'structure-analysis'
          ? createPasswordStructureScene(
              `s05-structure-${fixture.id}`,
              s05Content.structure.demonstrations,
              runtimeStructureAnalysis,
            )
          : null,
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
        canContinue: awaitingDecision,
      },
    };
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
