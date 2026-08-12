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
  type NetworkSceneSnapshot,
  type NetworkRendererPort,
  type PasswordConsequencePlanStep,
  type PasswordConsequenceScenePlan,
  projectPasswordConsequenceScenePlan,
  type SceneEdge,
  type SceneNode,
  type S06LocalAccountAnalysis,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';
import { alignNetworkSceneToS02, createS05AssessmentNetwork } from '../account-network.js';

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
  readonly attackPhase: 'found' | 'attacking' | 'preview-ready' | 'resolving';
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
      readonly transientAccountIdentifiers?: readonly string[];
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
      ...(account.transientAccountIdentifiers === undefined
        ? {}
        : { transientAccountIdentifiers: account.transientAccountIdentifiers }),
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
  const campusgramFound =
    plan.accounts.find(({ accountId }) => accountId === 'campusgram')?.disposition.kind ===
    'whole-password-recognized';
  return {
    ...plan,
    steps: plan.steps.map((step, index) => ({
      ...step,
      network:
        index === 0
          ? createS05AssessmentNetwork(campusgramFound, 'other-accounts')
          : alignNetworkSceneToS02(step.network),
    })),
  };
}

function createMission(plan: PasswordConsequenceScenePlan): MissionDefinition {
  return {
    id: `s06-consequence-${plan.id}`,
    segmentId: 'S06',
    sectionId: 'passwords',
    requiresSafetyAcknowledgement: false,
    steps: plan.steps.slice(0, 3).map((step, stepIndex) => {
      const isInitialStep = stepIndex === 0;
      return {
        id: step.id,
        narrationId: step.narrationId,
        animation: {
          id: `${step.id}-animation`,
          steps: isInitialStep
            ? [
                {
                  type: 'highlight' as const,
                  targetId: step.visibleChange.targetId,
                  emphasis: step.visibleChange.emphasis,
                  durationMs: 420,
                },
              ]
            : [
                {
                  type: 'reveal' as const,
                  targetId: step.visibleChange.targetId,
                  durationMs: 900,
                },
              ],
          reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
          maxDurationMs: isInitialStep ? 420 : 900,
        },
      };
    }),
  };
}

function isAccountBranchNode(node: SceneNode, accountId: S06AccountId): boolean {
  return node.id === accountId || node.id.startsWith(`${accountId}-detail-`);
}

function isAttackEdge(edge: SceneEdge): boolean {
  return (
    edge.kind === 'identical-reuse' ||
    edge.kind === 'similar-pattern' ||
    edge.kind === 'blocked-path'
  );
}

function attackPreviewNetwork(
  step: PasswordConsequencePlanStep,
  settledNetwork: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const targetAccountId = step.targetAccountId;
  if (targetAccountId === null) return step.network;
  const settledNodes = new Map(settledNetwork.nodes.map((node) => [node.id, node]));
  const priorAttackEdges = settledNetwork.edges.filter(isAttackEdge);
  const currentAttackEdge = step.network.edges.find(isAttackEdge);
  return {
    ...step.network,
    id: `${step.network.id}-attack-preview`,
    nodes: step.network.nodes.flatMap((node): readonly SceneNode[] => {
      if (node.kind === 'shield') return [];
      if (isAccountBranchNode(node, targetAccountId)) return [{ ...node, status: 'neutral' }];
      const settledNode = settledNodes.get(node.id);
      return [
        settledNode?.status === 'affected' || settledNode?.status === 'exposed'
          ? { ...node, status: settledNode.status }
          : node,
      ];
    }),
    edges: [
      ...step.network.edges.filter((edge) => !isAttackEdge(edge)),
      ...priorAttackEdges,
      ...(currentAttackEdge === undefined
        ? []
        : [{ ...currentAttackEdge, status: 'direct' as const }]),
    ],
    accessibleSummary: `Die Angriffslinie läuft zu ${targetAccountId}; das Vergleichsergebnis ist noch offen.`,
  };
}

function resolvedNetwork(
  step: PasswordConsequencePlanStep,
  attackNetwork: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const targetAccountId = step.targetAccountId;
  const relation = step.relation;
  if (targetAccountId === null || relation === null) return step.network;
  if (relation.kind === 'no-derived-path-recognized' || step.mode !== 'actual') {
    return {
      ...attackNetwork,
      id: `${step.network.id}-blocked-resolved`,
      edges: attackNetwork.edges.filter(
        (edge) => !(isAttackEdge(edge) && edge.targetId === targetAccountId),
      ),
      accessibleSummary: `Der Angriff auf ${targetAccountId} wurde abgewehrt; der Knoten bleibt unverändert.`,
    };
  }
  const attackNodes = new Map(attackNetwork.nodes.map((node) => [node.id, node]));
  const priorAttackEdges = attackNetwork.edges.filter(
    (edge) => isAttackEdge(edge) && edge.targetId !== targetAccountId,
  );
  return {
    ...step.network,
    id: `${step.network.id}-resolved`,
    nodes: step.network.nodes.flatMap((node): readonly SceneNode[] => {
      if (node.kind === 'shield') return [];
      const prior = attackNodes.get(node.id);
      return [
        prior?.status === 'affected' || prior?.status === 'exposed'
          ? { ...node, status: prior.status }
          : node,
      ];
    }),
    edges: [...step.network.edges, ...priorAttackEdges],
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
  #settledNetwork: NetworkSceneSnapshot;
  #displayedAttackNetwork: NetworkSceneSnapshot | null = null;
  #snapshot: S06ConsequenceControllerSnapshot;
  #disposed = false;

  constructor({ plan, animationPlayer, onComplete }: S06ConsequenceControllerOptions) {
    const firstStep = plan.steps[0];
    if (firstStep === undefined) throw new Error('S06 scene plan requires at least one step.');
    this.#plan = plan;
    this.#settledNetwork = firstStep.network;
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
      attackPhase: 'found',
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
    if (this.#snapshot.step.relation !== null) {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'animating',
        attackPhase: 'resolving',
        controls: { canStart: false, canReplay: false, canContinue: false },
      };
      this.#emit();
      return Promise.resolve();
    }
    return this.#missionController.continue();
  }

  previewCompleted(stepId: PasswordConsequencePlanStep['id']): void {
    if (
      this.#disposed ||
      this.#snapshot.step.id !== stepId ||
      this.#snapshot.step.relation === null ||
      this.#snapshot.attackPhase === 'resolving'
    ) {
      return;
    }
    const isSecondPreview = this.#snapshot.stepIndex === 2;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'awaiting-decision',
      attackPhase: 'preview-ready',
      controls: {
        canStart: false,
        canReplay: false,
        canContinue: !isSecondPreview,
      },
    };
    this.#emit();
  }

  resolutionCompleted(stepId: PasswordConsequencePlanStep['id']): void {
    if (
      this.#disposed ||
      this.#snapshot.step.id !== stepId ||
      this.#snapshot.attackPhase !== 'resolving' ||
      this.#displayedAttackNetwork === null
    ) {
      return;
    }
    this.#settledNetwork = resolvedNetwork(this.#snapshot.step, this.#displayedAttackNetwork);
    this.#renderer?.render(this.#settledNetwork);
    this.#displayedAttackNetwork = null;
    void this.#missionController.continue();
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
      this.#displayedAttackNetwork = attackPreviewNetwork(step, this.#settledNetwork);
      this.#renderer?.render(this.#displayedAttackNetwork);
    }
    const awaitingDecision = missionSnapshot.matches({ active: 'awaitingDecision' });
    this.#snapshot = {
      ...this.#snapshot,
      phase: awaitingDecision ? 'awaiting-decision' : 'animating',
      stepIndex,
      step,
      participant: participantSnapshot(step),
      attackPhase: stepIndex === 0 ? 'found' : 'attacking',
      controls: {
        canStart: false,
        canReplay: stepIndex === 0 && awaitingDecision,
        canContinue: stepIndex === 0 && awaitingDecision,
      },
    };
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
