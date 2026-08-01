import type { PasswordAnalysisResult } from '@passwo/contracts';
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
  createPasswordCandidateScene,
  createPasswordFindingScene,
} from '@passwo/visualization';

export type S05AnalysisStep = 'candidate-check' | 'component-analysis';

export interface S05AnalysisControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly step: S05AnalysisStep;
  readonly candidateScene: PasswordCandidateSceneSnapshot;
  readonly findingScene: PasswordFindingSceneSnapshot;
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

interface S05AnalysisControllerOptions {
  readonly fixture: S05DesignLabFixture;
  readonly analysis: PasswordAnalysisResult;
  readonly animationPlayer: AnimationPlayerPort;
}

type Listener = (snapshot: S05AnalysisControllerSnapshot) => void;

function createMission(fixture: S05DesignLabFixture): MissionDefinition {
  const animations = ['s05-candidate-check', 's05-component-analysis'].map((animationId) => {
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

export class S05AnalysisController {
  readonly #mission: MissionDefinition;
  readonly #missionController: MissionController;
  readonly #listeners = new Set<Listener>();
  readonly #unsubscribe: () => void;
  #snapshot: S05AnalysisControllerSnapshot;
  #disposed = false;

  constructor({ fixture, analysis, animationPlayer }: S05AnalysisControllerOptions) {
    this.#mission = createMission(fixture);
    this.#snapshot = {
      phase: 'ready',
      step: 'candidate-check',
      candidateScene: createPasswordCandidateScene({
        id: `s05-candidates-${fixture.id}`,
        candidates: s05Content.intro.candidates,
        theoreticalSearchSpaceId: s05Content.theoreticalSearchSpace.id,
        characterGroups: s05Content.theoreticalSearchSpace.characterGroups,
      }),
      findingScene: createPasswordFindingScene(`s05-findings-${fixture.id}`, analysis, 3),
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
    const step = snapshot.context.stepIndex === 0 ? 'candidate-check' : 'component-analysis';
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
