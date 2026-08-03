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

export type S05AnalysisStep =
  | 'candidate-check'
  | 'random-sequence'
  | 'recognizable-combination'
  | 'building-blocks'
  | 'strategy-targeting'
  | 'strategy-overview'
  | 'component-start-question'
  | 'component-frequency'
  | 'component-category-overview'
  | 'common-cores-definition'
  | 'common-cores-variants'
  | 'common-cores-application'
  | 'personal-details-transition'
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
  };
}

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
  readonly commonCorePresentation: {
    readonly variants: readonly string[];
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
  readonly onComplete?: () => void;
}

type Listener = (snapshot: S05AnalysisControllerSnapshot) => void;

const stepByMissionId: Readonly<Record<string, S05AnalysisStep>> = {
  's05-candidate-check': 'candidate-check',
  's05-random-sequence': 'random-sequence',
  's05-recognizable-combination': 'recognizable-combination',
  's05-building-blocks': 'building-blocks',
  's05-strategy-targeting': 'strategy-targeting',
  's05-strategy-overview': 'strategy-overview',
  's05-component-start-question': 'component-start-question',
  's05-component-frequency': 'component-frequency',
  's05-component-category-overview': 'component-category-overview',
  's05-common-cores-definition': 'common-cores-definition',
  's05-common-cores-variants': 'common-cores-variants',
  's05-common-cores-application': 'common-cores-application',
  's05-personal-details-transition': 'personal-details-transition',
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

function capitalize(value: string): string {
  const [first = '', ...remaining] = [...value];
  return `${first.toLocaleUpperCase('de-DE')}${remaining.join('')}`;
}

function applyTypicalReplacements(value: string): string {
  return [...value]
    .map((character) => {
      const rule = s05Content.intro.commonCores.replacementRules.find(
        ([source]) => source === character.toLocaleLowerCase('de-DE'),
      );
      return rule?.[1] ?? character;
    })
    .join('');
}

/** Authored presentation stream only; it is not used for runtime password analysis. */
function createCommonCoreVariants(): readonly string[] {
  const variants = new Set<string>();
  for (const core of s05Content.intro.commonCores.examples) {
    const bases = [
      core,
      capitalize(core),
      core.toLocaleUpperCase('de-DE'),
      applyTypicalReplacements(core),
    ];
    for (const base of bases) {
      variants.add(base);
      for (const suffix of s05Content.intro.commonCores.suffixes) {
        variants.add(`${base}${suffix}`);
      }
    }
  }
  return [...variants];
}

function createMission(subject: S05AnalysisSubject): MissionDefinition {
  const animations = s05Content.animations.map(([animationId]) => {
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

  constructor({ subject, animationPlayer, onComplete }: S05AnalysisControllerOptions) {
    this.#mission = createMission(subject);
    this.#onComplete = onComplete;
    const componentAnalysis = analyzeFictionalPassword({
      fictionalPassword: subject.fictionalPassword,
      authoredAccountTerms: subject.analysisContext.accountTerms,
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
      step: 'candidate-check',
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
      commonCorePresentation: { variants: createCommonCoreVariants() },
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
