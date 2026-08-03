import type { S06AccountId, S06PairComparison } from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  compareFictionalPasswords,
  determinePasswordSimulationDisposition,
} from '@passwo/password-analysis';
import {
  getS06ConsequenceFixture,
  type S06ConsequenceFixtureId,
  type S06NarrationContent,
  type S06NarrationId,
  s06ConsequenceContent,
} from '@passwo/training-content';
import {
  type AnimationPlayerPort,
  MissionController,
  type MissionDefinition,
  type MissionSnapshot,
} from '@passwo/training-engine';
import {
  type NetworkRendererPort,
  type PasswordConsequencePlanStep,
  type PasswordConsequenceScenePlan,
  projectPasswordConsequenceScenePlan,
  type S06LocalAccountAnalysis,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { alignNetworkSceneToS02 } from '../account-network.js';

export interface S06ConsequenceParticipantSnapshot {
  readonly narration: S06NarrationContent;
  readonly mode: (typeof s06ConsequenceContent.modes)[keyof typeof s06ConsequenceContent.modes];
  readonly relationLabel: string | null;
  readonly transformationLabel: string | null;
  readonly generatedCandidate: string | null;
}

export interface S06ConsequenceControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly stepIndex: number;
  readonly step: PasswordConsequencePlanStep;
  readonly presentation: NetworkPresentationSnapshot;
  readonly participant: S06ConsequenceParticipantSnapshot;
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

export interface S06ConsequenceControllerOptions {
  readonly plan: PasswordConsequenceScenePlan;
  readonly animationPlayer: AnimationPlayerPort;
  readonly onComplete?: () => void;
}

export type S06ConsequenceAccountInputs = Readonly<
  Record<
    S06AccountId,
    {
      readonly fictionalPassword: string;
      readonly retrievalStatus: S06LocalAccountAnalysis['retrievalStatus'];
    }
  >
>;

type ControllerListener = (snapshot: S06ConsequenceControllerSnapshot) => void;

const accountIds = ['campusgram', 'master-campus', 'campus-email'] as const;
const comparisonPairs = [
  ['campusgram', 'master-campus'],
  ['campusgram', 'campus-email'],
  ['master-campus', 'campus-email'],
] as const satisfies readonly (readonly [S06AccountId, S06AccountId])[];

export function createS06FixtureScenePlan(
  fixtureId: S06ConsequenceFixtureId,
): PasswordConsequenceScenePlan {
  const fixture = getS06ConsequenceFixture(fixtureId);
  return createS06ConsequenceScenePlan(fixture.routeId, fixture.accounts);
}

export function createS06ConsequenceScenePlan(
  id: string,
  accountInputs: S06ConsequenceAccountInputs,
): PasswordConsequenceScenePlan {
  const accounts: S06LocalAccountAnalysis[] = accountIds.map((accountId) => {
    const account = accountInputs[accountId];
    const definition = s06ConsequenceContent.accounts[accountId];
    const componentAnalysis = analyzeFictionalPassword({
      fictionalPassword: account.fictionalPassword,
      authoredAccountTerms: definition.accountTerms,
    });
    return {
      accountId,
      fictionalPassword: account.fictionalPassword,
      retrievalStatus: account.retrievalStatus,
      disposition: determinePasswordSimulationDisposition({
        fictionalPassword: account.fictionalPassword,
        componentAnalysis,
      }),
    };
  });
  const authoredAccountAndServiceTerms = accountIds.flatMap(
    (accountId) => s06ConsequenceContent.accounts[accountId].accountTerms,
  );
  const comparisons: S06PairComparison[] = comparisonPairs.map(
    ([sourceAccountId, targetAccountId]) => ({
      sourceAccountId,
      targetAccountId,
      result: compareFictionalPasswords({
        sourcePassword: accountInputs[sourceAccountId].fictionalPassword,
        targetPassword: accountInputs[targetAccountId].fictionalPassword,
        authoredAccountAndServiceTerms,
      }),
    }),
  );
  const plan = projectPasswordConsequenceScenePlan({
    id,
    incidentSource: 'campusgram',
    accounts,
    comparisons,
    accountDefinitions: accountIds.map((accountId) => ({
      accountId,
      label: s06ConsequenceContent.accounts[accountId].label,
      detailKind:
        accountId === 'master-campus'
          ? 'service'
          : accountId === 'campus-email'
            ? 'function'
            : 'content',
      details: s06ConsequenceContent.accounts[accountId].details,
    })),
  });
  return {
    ...plan,
    steps: plan.steps.map((step) => ({
      ...step,
      network: alignNetworkSceneToS02(step.network),
    })),
  };
}

function createMission(plan: PasswordConsequenceScenePlan): MissionDefinition {
  return {
    id: `s06-consequence-${plan.id}`,
    segmentId: 'S06',
    sectionId: 'passwords',
    requiresSafetyAcknowledgement: false,
    steps: plan.steps.map((step) => ({
      id: step.id,
      narrationId: step.narrationId,
      animation: {
        id: `${step.id}-animation`,
        steps: [
          {
            type: 'highlight',
            targetId: step.visibleChange.targetId,
            emphasis: step.visibleChange.emphasis,
            durationMs: 420,
          },
        ],
        reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
        maxDurationMs: 420,
      },
    })),
  };
}

function participantSnapshot(step: PasswordConsequencePlanStep): S06ConsequenceParticipantSnapshot {
  const relation = step.relation;
  return {
    narration: s06ConsequenceContent.narrations[step.narrationId as S06NarrationId],
    mode: s06ConsequenceContent.modes[step.mode],
    relationLabel: relation === null ? null : s06ConsequenceContent.relationLabels[relation.kind],
    transformationLabel:
      relation?.kind === 'derived-variant-match'
        ? s06ConsequenceContent.transformationLabels[relation.transformationId]
        : null,
    generatedCandidate: relation?.kind === 'derived-variant-match' ? relation.candidate : null,
  };
}

export class S06ConsequenceController {
  readonly #plan: PasswordConsequenceScenePlan;
  readonly #missionController: MissionController;
  readonly #mission: MissionDefinition;
  readonly #listeners = new Set<ControllerListener>();
  readonly #unsubscribeMission: () => void;
  #renderer: NetworkRendererPort | null = null;
  #snapshot: S06ConsequenceControllerSnapshot;
  #disposed = false;

  constructor({ plan, animationPlayer, onComplete }: S06ConsequenceControllerOptions) {
    const firstStep = plan.steps[0];
    if (firstStep === undefined) throw new Error('S06 scene plan requires at least one step.');
    this.#plan = plan;
    this.#mission = createMission(plan);
    const allNodeIds = [
      ...new Set(plan.steps.flatMap(({ network }) => network.nodes.map(({ id }) => id))),
    ];
    const presentation: NetworkPresentationSnapshot = {
      character: { placement: 'bottom-left', pose: 'dock' },
      revealedNodeIds: allNodeIds,
      highlightedNodeId: null,
      emphasis: null,
      announcedMessageId: null,
    };
    this.#snapshot = {
      phase: 'ready',
      stepIndex: 0,
      step: firstStep,
      presentation,
      participant: participantSnapshot(firstStep),
      controls: { canStart: true, canReplay: false, canContinue: false },
    };
    this.#missionController = new MissionController({
      animationPlayer,
      onComplete: onComplete ?? (() => undefined),
    });
    this.#unsubscribeMission = this.#missionController.subscribe((snapshot) =>
      this.#handleMissionSnapshot(snapshot),
    );
  }

  getSnapshot = (): S06ConsequenceControllerSnapshot => this.#snapshot;

  subscribe = (listener: ControllerListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  attachRenderer(renderer: NetworkRendererPort): void {
    if (this.#disposed) return;
    this.#renderer = renderer;
    renderer.render(this.#snapshot.step.network);
  }

  start(): void {
    if (this.#disposed || !this.#snapshot.controls.canStart) return;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.start(this.#mission);
  }

  replay(): void {
    if (this.#disposed || !this.#snapshot.controls.canReplay) return;
    this.#missionController.replay();
  }

  continue(): Promise<void> {
    if (this.#disposed || !this.#snapshot.controls.canContinue) return Promise.resolve();
    return this.#missionController.continue();
  }

  updatePresentation(presentation: NetworkPresentationSnapshot): void {
    if (this.#disposed || presentation === this.#snapshot.presentation) return;
    this.#snapshot = { ...this.#snapshot, presentation };
    this.#emit();
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    this.#unsubscribeMission();
    await this.#missionController.dispose();
    this.#listeners.clear();
  }

  #handleMissionSnapshot(missionSnapshot: MissionSnapshot): void {
    if (this.#disposed || missionSnapshot.matches('idle')) return;
    if (missionSnapshot.status === 'done') {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'complete',
        controls: { canStart: false, canReplay: false, canContinue: false },
      };
      this.#emit();
      return;
    }
    const stepIndex = missionSnapshot.context.stepIndex;
    const step = this.#plan.steps[stepIndex];
    if (step === undefined) return;
    if (stepIndex !== this.#snapshot.stepIndex) {
      this.#renderer?.render(step.network);
    }
    const awaitingDecision = missionSnapshot.matches({ active: 'awaitingDecision' });
    this.#snapshot = {
      ...this.#snapshot,
      phase: awaitingDecision ? 'awaiting-decision' : 'animating',
      stepIndex,
      step,
      participant: participantSnapshot(step),
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
