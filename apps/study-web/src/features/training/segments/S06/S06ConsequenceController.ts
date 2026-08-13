import type { PasswordRelation, S06AccountId, S06PairComparison } from '@passwo/contracts';
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
  readonly stage:
    | 'initial-found'
    | 'initial-blocked'
    | 'hypothetical-animating'
    | 'hypothetical-ready'
    | 'attacking'
    | 'summary'
    | 'transition'
    | 'complete';
  readonly stepIndex: number;
  readonly step: PasswordConsequencePlanStep;
  readonly presentation: NetworkPresentationSnapshot;
  readonly participant: S06ConsequenceParticipantSnapshot;
  readonly attackPhase:
    | 'found'
    | 'hypothetical-intro'
    | 'attacking'
    | 'preview-ready'
    | 'resolving';
  readonly isHypothetical: boolean;
  readonly showGuide: boolean;
  readonly comparisonVisible: boolean;
  readonly completedComparisonResults: Readonly<
    Partial<Record<S06AccountId, PasswordRelation['kind']>>
  >;
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

export interface S06ConsequenceControllerOptions {
  readonly plan: PasswordConsequenceScenePlan;
  readonly animationPlayer: AnimationPlayerPort;
  readonly prefersReducedMotion: () => boolean;
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
  const attackSteps = plan.steps.slice(1, 3);
  return {
    id: `s06-consequence-${plan.id}`,
    segmentId: 'S06',
    sectionId: 'passwords',
    requiresSafetyAcknowledgement: false,
    steps: [
      ...attackSteps.map((step) => ({
        id: step.id,
        narrationId: step.narrationId,
        animation: {
          id: `${step.id}-animation`,
          steps: [
            {
              type: 'reveal' as const,
              targetId: step.visibleChange.targetId,
              durationMs: 500,
            },
          ],
          reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
          maxDurationMs: 500,
        },
      })),
      {
        id: 's06-post-attack-summary',
        narrationId: 's06.summary',
        animation: {
          id: 's06-post-attack-summary-animation',
          steps: [{ type: 'announce', messageId: 's06-post-attack-summary' }],
          reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
          maxDurationMs: 0,
        },
      },
    ],
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
  const settledSourceStatus =
    step.sourceAccountId === null ? undefined : settledNodes.get(step.sourceAccountId)?.status;
  const priorAttackEdges = settledNetwork.edges.filter(isAttackEdge);
  const currentAttackEdge = step.network.edges.find(isAttackEdge);
  return {
    ...step.network,
    id: `${step.network.id}-attack-preview`,
    nodes: step.network.nodes.flatMap((node): readonly SceneNode[] => {
      if (node.kind === 'shield') return [];
      if (isAccountBranchNode(node, targetAccountId)) return [{ ...node, status: 'neutral' }];
      if (
        step.sourceAccountId !== null &&
        isAccountBranchNode(node, step.sourceAccountId) &&
        (settledSourceStatus === 'affected' || settledSourceStatus === 'exposed')
      ) {
        return [{ ...node, status: settledSourceStatus }];
      }
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
  const targetLabel =
    step.network.nodes.find(({ id }) => id === targetAccountId)?.label ?? targetAccountId;
  const resultLabel = s06ConsequenceContent.comparisonResultLabels[relation.kind];
  if (relation.kind === 'no-derived-path-recognized') {
    return {
      ...attackNetwork,
      id: `${step.network.id}-blocked-resolved`,
      edges: attackNetwork.edges.filter(
        (edge) => !(isAttackEdge(edge) && edge.targetId === targetAccountId),
      ),
      accessibleSummary: `${targetLabel}: ${resultLabel}.`,
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
      if (isAccountBranchNode(node, targetAccountId)) return [{ ...node, status: 'affected' }];
      const prior = attackNodes.get(node.id);
      return [
        prior?.status === 'affected' || prior?.status === 'exposed'
          ? { ...node, status: prior.status }
          : node,
      ];
    }),
    edges: [...step.network.edges, ...priorAttackEdges],
    accessibleSummary: `${targetLabel}: ${resultLabel}.`,
  };
}

function hypotheticalCampusgramNetwork(): NetworkSceneSnapshot {
  const network = createS05AssessmentNetwork(true, 'other-accounts');
  return {
    ...network,
    id: `${network.id}-hypothetical`,
    accessibleSummary:
      'Was wäre, wenn? Campusgram wird in dieser hypothetischen Simulation als betroffen dargestellt.',
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
  readonly #prefersReducedMotion: () => boolean;
  readonly #listeners = new Set<ControllerListener>();
  readonly #unsubscribeMission: () => void;
  #renderer: NetworkRendererPort | null = null;
  #settledNetwork: NetworkSceneSnapshot;
  #displayedAttackNetwork: NetworkSceneSnapshot | null = null;
  #pendingInfectionNodeIds = new Set<string>();
  #pendingInfectionKind: 'hypothetical-intro' | 'attack-resolution' | null = null;
  #snapshot: S06ConsequenceControllerSnapshot;
  #disposed = false;

  constructor({
    plan,
    animationPlayer,
    prefersReducedMotion,
    onComplete,
  }: S06ConsequenceControllerOptions) {
    const firstStep = plan.steps[0];
    if (firstStep === undefined) throw new Error('S06 scene plan requires at least one step.');
    this.#plan = plan;
    this.#prefersReducedMotion = prefersReducedMotion;
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
      phase: 'awaiting-decision',
      stage: this.#campusgramWasFound() ? 'initial-found' : 'initial-blocked',
      stepIndex: 0,
      step: firstStep,
      presentation,
      participant: participantSnapshot(firstStep),
      attackPhase: 'found',
      isHypothetical: false,
      showGuide: true,
      comparisonVisible: false,
      completedComparisonResults: {},
      controls: { canStart: false, canReplay: false, canContinue: true },
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

  continue(): Promise<void> {
    if (this.#disposed || !this.#snapshot.controls.canContinue) return Promise.resolve();
    if (this.#snapshot.stage === 'initial-blocked') {
      this.#startHypotheticalIntro();
      return Promise.resolve();
    }
    if (
      this.#snapshot.stage === 'initial-found' ||
      this.#snapshot.stage === 'hypothetical-ready'
    ) {
      this.#startAttack();
      return Promise.resolve();
    }
    if (this.#snapshot.stage === 'summary') {
      this.#snapshot = {
        ...this.#snapshot,
        stage: 'transition',
        participant: this.#participantForNarration('s06.transition'),
      };
      this.#emit();
      return Promise.resolve();
    }
    if (this.#snapshot.stage === 'transition') return this.#missionController.continue();
    return Promise.resolve();
  }

  previewCompleted(stepId: PasswordConsequencePlanStep['id']): void {
    if (
      this.#disposed ||
      this.#snapshot.step.id !== stepId ||
      this.#snapshot.step.relation === null ||
      this.#snapshot.stage !== 'attacking' ||
      this.#snapshot.attackPhase === 'resolving'
    ) {
      return;
    }
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'awaiting-decision',
      attackPhase: 'preview-ready',
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
  }

  resolvePreview(stepId: PasswordConsequencePlanStep['id']): void {
    if (
      this.#disposed ||
      this.#snapshot.step.id !== stepId ||
      this.#snapshot.stage !== 'attacking' ||
      this.#snapshot.attackPhase !== 'preview-ready'
    ) {
      return;
    }
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      attackPhase: 'resolving',
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
  }

  resolutionCompleted(stepId: PasswordConsequencePlanStep['id']): void {
    if (
      this.#disposed ||
      this.#snapshot.step.id !== stepId ||
      this.#snapshot.attackPhase !== 'resolving' ||
      this.#displayedAttackNetwork === null ||
      this.#snapshot.step.targetAccountId === null ||
      this.#snapshot.step.relation === null
    ) {
      return;
    }
    this.#settledNetwork = resolvedNetwork(this.#snapshot.step, this.#displayedAttackNetwork);
    this.#displayedAttackNetwork = null;
    this.#snapshot = {
      ...this.#snapshot,
      comparisonVisible: false,
      completedComparisonResults: {
        ...this.#snapshot.completedComparisonResults,
        [this.#snapshot.step.targetAccountId]: this.#snapshot.step.relation.kind,
      },
    };
    const waitsForInfection = this.#waitForInfectionCascade(
      this.#settledNetwork,
      this.#snapshot.step.targetAccountId,
      'attack-resolution',
    );
    this.#renderer?.render(this.#settledNetwork);
    if (!waitsForInfection) this.infectionCascadeSettled([]);
    this.#emit();
  }

  infectionCascadeSettled(settledNodeIds: readonly string[]): void {
    if (this.#disposed || this.#pendingInfectionKind === null) return;
    for (const nodeId of settledNodeIds) this.#pendingInfectionNodeIds.delete(nodeId);
    if (this.#pendingInfectionNodeIds.size > 0) return;

    const pendingKind = this.#pendingInfectionKind;
    this.#pendingInfectionKind = null;
    if (pendingKind === 'hypothetical-intro') {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'hypothetical-ready',
        participant: this.#participantForNarration('s06.incident.campusgram-hypothetical'),
        attackPhase: 'found',
        showGuide: true,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

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
        stage: 'complete',
        showGuide: false,
        comparisonVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: false },
      };
      this.#emit();
      return;
    }
    const missionStepIndex = missionSnapshot.context.stepIndex;
    const awaitingDecision = missionSnapshot.matches({ active: 'awaitingDecision' });
    if (missionStepIndex === 2) {
      if (!awaitingDecision) return;
      const summaryStep = this.#plan.steps.at(-1);
      if (summaryStep === undefined) return;
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'summary',
        stepIndex: 3,
        step: summaryStep,
        participant: this.#participantForNarration(
          this.#summaryNarrationId(),
        ),
        attackPhase: 'found',
        showGuide: true,
        comparisonVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }
    const stepIndex = missionStepIndex + 1;
    const step = this.#plan.steps[stepIndex];
    if (step === undefined) return;
    if (stepIndex !== this.#snapshot.stepIndex) {
      this.#displayedAttackNetwork = attackPreviewNetwork(step, this.#settledNetwork);
      this.#renderer?.render(this.#displayedAttackNetwork);
    }
    this.#snapshot = {
      ...this.#snapshot,
      phase: awaitingDecision ? 'awaiting-decision' : 'animating',
      stage: 'attacking',
      stepIndex,
      step,
      participant: participantSnapshot(step),
      attackPhase: 'attacking',
      showGuide: false,
      comparisonVisible: true,
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
  }

  #campusgramWasFound(): boolean {
    return (
      this.#plan.accounts.find(({ accountId }) => accountId === 'campusgram')?.disposition.kind ===
      'whole-password-recognized'
    );
  }

  #participantForNarration(narrationId: S06NarrationId): S06ConsequenceParticipantSnapshot {
    return {
      ...participantSnapshot(this.#snapshot.step),
      narration: s06ConsequenceContent.narrations[narrationId],
    };
  }

  #summaryNarrationId(): Extract<S06NarrationId, `s06.summary.${string}`> {
    const affectedTargetCount = this.#plan.steps
      .slice(1, 3)
      .filter(({ relation }) => relation?.kind !== 'no-derived-path-recognized').length;
    if (this.#snapshot.isHypothetical) {
      return affectedTargetCount === 0
        ? 's06.summary.hypothetical-none'
        : affectedTargetCount === 1
          ? 's06.summary.hypothetical-one'
          : 's06.summary.hypothetical-both';
    }
    return affectedTargetCount === 0
      ? 's06.summary.actual-none'
      : affectedTargetCount === 1
        ? 's06.summary.actual-one'
        : 's06.summary.actual-both';
  }

  #startHypotheticalIntro(): void {
    const network = hypotheticalCampusgramNetwork();
    this.#settledNetwork = network;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      stage: 'hypothetical-animating',
      isHypothetical: true,
      attackPhase: 'hypothetical-intro',
      showGuide: false,
      comparisonVisible: false,
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    const waitsForInfection = this.#waitForInfectionCascade(
      network,
      'campusgram',
      'hypothetical-intro',
    );
    this.#renderer?.render(network);
    if (!waitsForInfection) this.infectionCascadeSettled([]);
    this.#emit();
  }

  #startAttack(): void {
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      stage: 'attacking',
      showGuide: false,
      comparisonVisible: false,
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.start(this.#mission);
  }

  #waitForInfectionCascade(
    network: NetworkSceneSnapshot,
    accountId: S06AccountId | null,
    kind: 'hypothetical-intro' | 'attack-resolution',
  ): boolean {
    const pendingNodeIds = new Set(
      accountId === null
        ? []
        : network.nodes
            .filter(
              (node) => isAccountBranchNode(node, accountId) && node.status === 'affected',
            )
            .map(({ id }) => id),
    );
    this.#pendingInfectionNodeIds = pendingNodeIds;
    this.#pendingInfectionKind = kind;
    return pendingNodeIds.size > 0 && !this.#prefersReducedMotion();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
