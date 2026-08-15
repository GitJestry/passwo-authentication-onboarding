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
  type PasswordConsequenceStepId,
  projectPasswordConsequenceScenePlan,
  type SceneEdge,
  type SceneNode,
  type S06LocalAccountAnalysis,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  alignNetworkSceneToS02,
  projectS05AssessmentNetwork,
} from '../account-network.js';

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
    | 'master-hypothetical-animating'
    | 'master-hypothetical-ready'
    | 'attacking'
    | 'campusgram-summary'
    | 'perspective-transition'
    | 'local-check-animating'
    | 'local-check-result'
    | 'email-transition'
    | 'return-transition'
    | 'final-summary'
    | 's07-transition'
    | 'complete';
  readonly stepIndex: number;
  readonly step: PasswordConsequencePlanStep;
  readonly presentation: NetworkPresentationSnapshot;
  readonly participant: S06ConsequenceParticipantSnapshot;
  readonly attackPhase:
    | 'found'
    | 'hypothetical-intro'
    | 'incident-check'
    | 'attacking'
    | 'preview-ready'
    | 'resolving';
  readonly attackSourceAccountId: S06AccountId | null;
  readonly isHypothetical: boolean;
  readonly showGuide: boolean;
  readonly comparisonVisible: boolean;
  readonly comparisonPreviewVisible: boolean;
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

type S06MissionPhase =
  | { readonly kind: 'comparison'; readonly step: PasswordConsequencePlanStep }
  | { readonly kind: 'automatic-comparison'; readonly step: PasswordConsequencePlanStep }
  | { readonly kind: 'comparison-resolution'; readonly step: PasswordConsequencePlanStep }
  | { readonly kind: 'campusgram-summary' }
  | { readonly kind: 'perspective-transition' }
  | { readonly kind: 'local-check'; readonly step: PasswordConsequencePlanStep }
  | {
      readonly kind: 'master-campus-hypothetical-intro';
      readonly step: PasswordConsequencePlanStep;
    }
  | { readonly kind: 'email-transition' }
  | { readonly kind: 'return-transition' }
  | { readonly kind: 'final-summary' }
  | { readonly kind: 's07-transition' };

interface S06MissionSequence {
  readonly mission: MissionDefinition;
  readonly phases: readonly S06MissionPhase[];
}

const accountIds = ['campusgram', 'master-campus', 'campus-email'] as const;
const infectionDurationMs = 1350;
const comparisonResolutionDurationMs = 120;
const automaticAttackDurationMs = 800;
const comparisonPairs = [
  ['campusgram', 'master-campus'],
  ['campusgram', 'campus-email'],
  ['master-campus', 'campusgram'],
  ['master-campus', 'campus-email'],
  ['campus-email', 'master-campus'],
  ['campus-email', 'campusgram'],
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
          ? projectS05AssessmentNetwork(
              alignNetworkSceneToS02(step.network),
              campusgramFound,
              'other-accounts',
            )
          : alignNetworkSceneToS02(step.network),
    })),
  };
}

function planStep(
  plan: PasswordConsequenceScenePlan,
  stepId: PasswordConsequenceStepId,
): PasswordConsequencePlanStep {
  const step = plan.steps.find(({ id }) => id === stepId);
  if (step === undefined) throw new Error(`S06 scene plan is missing step ${stepId}.`);
  return step;
}

function masterCampusWasFound(plan: PasswordConsequenceScenePlan): boolean {
  return (
    plan.accounts.find(({ accountId }) => accountId === 'master-campus')?.disposition.kind ===
    'whole-password-recognized'
  );
}

function localCheckDurationMs(step: PasswordConsequencePlanStep): number {
  const sourceAccountId = step.sourceAccountId;
  if (sourceAccountId === null) return 0;
  return step.network.nodes.some(
    ({ id, status }) => id === sourceAccountId && status === 'exposed',
  )
    ? infectionDurationMs
    : 0;
}

function missionStepForPhase(phase: S06MissionPhase): MissionDefinition['steps'][number] {
  if (phase.kind === 'comparison' || phase.kind === 'automatic-comparison') {
    const automatic = phase.kind === 'automatic-comparison';
    return {
      id: phase.step.id,
      narrationId: phase.step.narrationId,
      animation: {
        id: `${phase.step.id}-animation`,
        steps: [
          {
            type: 'reveal' as const,
            targetId: phase.step.visibleChange.targetId,
            durationMs: automatic ? 800 : 500,
          },
        ],
        reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
        maxDurationMs: automatic ? automaticAttackDurationMs : 500,
      },
    };
  }
  if (phase.kind === 'comparison-resolution') {
    return {
      id: `${phase.step.id}-resolution`,
      narrationId: phase.step.narrationId,
      animation: {
        id: `${phase.step.id}-resolution-animation`,
        steps: [{ type: 'pause', durationMs: comparisonResolutionDurationMs }],
        reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
        maxDurationMs: comparisonResolutionDurationMs,
      },
    };
  }
  if (
    phase.kind === 'local-check' ||
    phase.kind === 'master-campus-hypothetical-intro'
  ) {
    const id =
      phase.kind === 'local-check'
        ? phase.step.id
        : 's06-master-campus-hypothetical-intro';
    return {
      id,
      narrationId:
        phase.kind === 'master-campus-hypothetical-intro'
          ? 's06.incident.master-campus-hypothetical'
          : phase.step.narrationId,
      animation: {
        id: `${id}-animation`,
        steps: [
          {
            type: 'pause',
            durationMs:
              phase.kind === 'local-check'
                ? localCheckDurationMs(phase.step)
                : infectionDurationMs,
          },
        ],
        reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
        maxDurationMs:
          phase.kind === 'local-check'
            ? localCheckDurationMs(phase.step)
            : infectionDurationMs,
      },
    };
  }
  const id = `s06-${phase.kind}`;
  return {
    id,
    narrationId: id,
    animation: {
      id: `${id}-animation`,
      steps: [{ type: 'announce', messageId: id }],
      reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
      maxDurationMs: 0,
    },
  };
}

function createMission(plan: PasswordConsequenceScenePlan): S06MissionSequence {
  const campusgramMasterStep = planStep(plan, 's06-step-campusgram-master-campus');
  const campusgramEmailStep = planStep(plan, 's06-step-campusgram-campus-email');
  const phases: S06MissionPhase[] = [
    { kind: 'comparison', step: campusgramMasterStep },
    { kind: 'comparison-resolution', step: campusgramMasterStep },
    { kind: 'comparison', step: campusgramEmailStep },
    { kind: 'comparison-resolution', step: campusgramEmailStep },
    { kind: 'campusgram-summary' },
    { kind: 'perspective-transition' },
    { kind: 'local-check', step: planStep(plan, 's06-step-master-campus-perspective') },
  ];
  if (!masterCampusWasFound(plan)) {
    phases.push({
      kind: 'master-campus-hypothetical-intro',
      step: planStep(plan, 's06-step-master-campus-perspective'),
    });
  }
  const masterCampusgramStep = planStep(plan, 's06-step-master-campus-campusgram');
  phases.push({ kind: 'automatic-comparison', step: masterCampusgramStep });
  phases.push({ kind: 'comparison-resolution', step: masterCampusgramStep });
  const masterEmailStep = planStep(plan, 's06-step-master-campus-campus-email');
  phases.push(
    { kind: 'comparison', step: masterEmailStep },
    { kind: 'comparison-resolution', step: masterEmailStep },
  );
  phases.push(
    { kind: 'email-transition' },
    { kind: 'local-check', step: planStep(plan, 's06-step-campus-email-local-check') },
    { kind: 'return-transition' },
    { kind: 'final-summary' },
    { kind: 's07-transition' },
  );
  return {
    phases,
    mission: {
      id: `s06-consequence-${plan.id}`,
      segmentId: 'S06',
      sectionId: 'passwords',
      requiresSafetyAcknowledgement: false,
      steps: phases.map(missionStepForPhase),
    },
  };
}

function isAccountBranchNode(node: SceneNode, accountId: S06AccountId): boolean {
  return node.id === accountId || node.id.startsWith(`${accountId}-detail-`);
}

function isAttackEdge(edge: SceneEdge): boolean {
  return (
    edge.id.endsWith('-path') &&
    (edge.kind === 'identical-reuse' ||
      edge.kind === 'similar-pattern' ||
      edge.kind === 'blocked-path')
  );
}

function carriesAffectedStatus(
  node: SceneNode | undefined,
): node is SceneNode & { readonly status: 'affected' | 'exposed' } {
  return node?.status === 'affected' || node?.status === 'exposed';
}

function carriesAffectedEdgeStatus(
  edge: SceneEdge | undefined,
): edge is SceneEdge & { readonly status: 'direct' | 'similar' } {
  return edge?.status === 'direct' || edge?.status === 'similar';
}

function preserveSettledAffectedState(
  network: NetworkSceneSnapshot,
  settledNetwork: NetworkSceneSnapshot,
  resetAccountId: S06AccountId | null = null,
): NetworkSceneSnapshot {
  const settledNodes = new Map(settledNetwork.nodes.map((node) => [node.id, node]));
  const settledEdges = new Map(settledNetwork.edges.map((edge) => [edge.id, edge]));
  return {
    ...network,
    nodes: network.nodes.map((node) => {
      if (
        node.kind === 'shield' ||
        (resetAccountId !== null && isAccountBranchNode(node, resetAccountId))
      ) {
        return node;
      }
      const settledNode = settledNodes.get(node.id);
      return carriesAffectedStatus(settledNode)
        ? { ...node, status: settledNode.status }
        : node;
    }),
    edges: network.edges.map((edge) => {
      if (
        isAttackEdge(edge) ||
        (resetAccountId !== null &&
          (edge.sourceId === resetAccountId ||
            edge.targetId === resetAccountId ||
            edge.sourceId.startsWith(`${resetAccountId}-detail-`) ||
            edge.targetId.startsWith(`${resetAccountId}-detail-`)))
      ) {
        return edge;
      }
      const settledEdge = settledEdges.get(edge.id);
      return carriesAffectedEdgeStatus(settledEdge)
        ? { ...edge, status: settledEdge.status }
        : edge;
    }),
  };
}

function attackPreviewNetwork(
  step: PasswordConsequencePlanStep,
  settledNetwork: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const targetAccountId = step.targetAccountId;
  if (targetAccountId === null) return step.network;
  const settledNodes = new Map(settledNetwork.nodes.map((node) => [node.id, node]));
  const priorBlockingShields = settledNetwork.nodes.filter(({ kind }) => kind === 'shield');
  const priorAttackEdges = settledNetwork.edges.filter(isAttackEdge);
  const currentAttackEdge = step.network.edges.find(isAttackEdge);
  const persistentNetwork = preserveSettledAffectedState(step.network, settledNetwork);
  return {
    ...persistentNetwork,
    id: `${step.network.id}-attack-preview`,
    nodes: [
      ...persistentNetwork.nodes.flatMap((node): readonly SceneNode[] => {
        if (node.kind === 'shield') return [];
        if (isAccountBranchNode(node, targetAccountId)) {
          const settledNode = settledNodes.get(node.id);
          return [
            carriesAffectedStatus(settledNode)
              ? { ...node, status: settledNode.status }
              : { ...node, status: 'neutral' },
          ];
        }
        return [node];
      }),
      ...priorBlockingShields,
    ],
    edges: [
      ...persistentNetwork.edges.filter((edge) => !isAttackEdge(edge)),
      ...priorAttackEdges,
      ...(currentAttackEdge === undefined
        ? []
        : [{ ...currentAttackEdge, status: 'direct' as const }]),
    ],
    accessibleSummary: `Die Angriffslinie läuft zu ${targetAccountId}; das Vergleichsergebnis ist noch offen.`,
  };
}

function blockedResolutionNetwork(
  step: PasswordConsequencePlanStep,
  attackNetwork: NetworkSceneSnapshot,
  priorSettledNetwork: NetworkSceneSnapshot,
  retainAttackPath: boolean,
): NetworkSceneSnapshot {
  const targetAccountId = step.targetAccountId;
  const sourceAccountId = step.sourceAccountId;
  if (sourceAccountId === null || targetAccountId === null) return attackNetwork;
  const priorNodes = new Map(priorSettledNetwork.nodes.map((node) => [node.id, node]));
  const sourceNode = attackNetwork.nodes.find(({ id }) => id === sourceAccountId);
  const targetNode = attackNetwork.nodes.find(({ id }) => id === targetAccountId);
  const authoredShield = step.network.nodes.find(({ kind }) => kind === 'shield');
  const blockingShield =
    sourceNode === undefined || targetNode === undefined || authoredShield === undefined
      ? null
      : {
          ...authoredShield,
          symbolId: 'comparison-path-shield',
          position: {
            x: sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) * 0.78,
            y:
              sourceNode.position.y +
              (targetNode.position.y - sourceNode.position.y) * 0.78 +
              (sourceAccountId === 'master-campus' && targetAccountId === 'campus-email'
                ? -0.08
                : sourceAccountId === 'campus-email' && targetAccountId === 'master-campus'
                  ? 0.08
                  : 0),
          },
        };
  const priorBlockingShields = attackNetwork.nodes.filter(
    (node) => node.kind === 'shield' && node.id !== blockingShield?.id,
  );
  const targetLabel =
    step.network.nodes.find(({ id }) => id === targetAccountId)?.label ?? targetAccountId;
  return {
    ...attackNetwork,
    id: `${step.network.id}-${retainAttackPath ? 'blocked-resolving' : 'blocked-resolved'}`,
    nodes: [
      ...attackNetwork.nodes.flatMap((node): readonly SceneNode[] => {
        if (node.kind === 'shield') return [];
        if (!isAccountBranchNode(node, targetAccountId)) return [node];
        const prior = priorNodes.get(node.id);
        return [
          prior?.status === 'affected' || prior?.status === 'exposed'
            ? { ...node, status: prior.status }
            : { ...node, status: 'neutral' },
        ];
      }),
      ...priorBlockingShields,
      ...(blockingShield === null ? [] : [blockingShield]),
    ],
    edges: attackNetwork.edges.map((edge): SceneEdge =>
      edge.id === `${step.id}-path` && blockingShield !== null
        ? { ...edge, targetId: blockingShield.id, status: 'blocked' }
        : edge,
    ),
    accessibleSummary: retainAttackPath
      ? `Die aktuelle Angriffslinie wird vor ${targetLabel} blockiert.`
      : `${targetLabel}: ${s06ConsequenceContent.comparisonResultLabels['no-derived-path-recognized']}.`,
  };
}

function resolvedNetwork(
  step: PasswordConsequencePlanStep,
  attackNetwork: NetworkSceneSnapshot,
  priorSettledNetwork: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const targetAccountId = step.targetAccountId;
  const relation = step.relation;
  if (targetAccountId === null || relation === null) return step.network;
  const targetLabel =
    step.network.nodes.find(({ id }) => id === targetAccountId)?.label ?? targetAccountId;
  const resultLabel = s06ConsequenceContent.comparisonResultLabels[relation.kind];
  const priorAttackEdges = priorSettledNetwork.edges.filter(isAttackEdge);
  const mergeWithPriorAttackEdges = (edges: readonly SceneEdge[]): readonly SceneEdge[] => {
    const merged = new Map(edges.map((edge) => [edge.id, edge]));
    for (const edge of priorAttackEdges) {
      if (!merged.has(edge.id)) merged.set(edge.id, edge);
    }
    return [...merged.values()];
  };
  if (relation.kind === 'no-derived-path-recognized') {
    return blockedResolutionNetwork(step, attackNetwork, priorSettledNetwork, false);
  }
  const persistentNetwork = preserveSettledAffectedState(step.network, attackNetwork);
  const priorBlockingShields = attackNetwork.nodes.filter(({ kind }) => kind === 'shield');
  return {
    ...persistentNetwork,
    id: `${step.network.id}-resolved`,
    nodes: [
      ...persistentNetwork.nodes.flatMap((node): readonly SceneNode[] => {
        if (node.kind === 'shield') return [];
        if (isAccountBranchNode(node, targetAccountId)) return [{ ...node, status: 'affected' }];
        return [node];
      }),
      ...priorBlockingShields,
    ],
    edges: mergeWithPriorAttackEdges(persistentNetwork.edges),
    accessibleSummary: `${targetLabel}: ${resultLabel}.`,
  };
}

function hypotheticalCampusgramNetwork(
  baseNetwork: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const network = projectS05AssessmentNetwork(baseNetwork, true, 'other-accounts');
  return {
    ...network,
    id: `${network.id}-hypothetical`,
    accessibleSummary:
      'Was wäre, wenn? Campusgram wird in dieser hypothetischen Simulation als betroffen dargestellt.',
  };
}

function pendingLocalCheckNetwork(
  step: PasswordConsequencePlanStep,
): NetworkSceneSnapshot {
  const sourceAccountId = step.sourceAccountId;
  if (sourceAccountId === null) return step.network;
  return {
    ...step.network,
    id: `${step.network.id}-pending-local-check`,
    nodes: step.network.nodes.flatMap((node): readonly SceneNode[] => {
      if (node.kind === 'shield') return [];
      return [{ ...node, status: 'neutral' }];
    }),
    edges: step.network.edges
      .filter((edge) => !isAttackEdge(edge))
      .map((edge): SceneEdge => ({ ...edge, status: 'neutral' })),
    accessibleSummary: `${s06ConsequenceContent.accounts[sourceAccountId].label}: Die begrenzte lokale Prüfung läuft; das Ergebnis ist noch offen.`,
  };
}

function hypotheticalIncidentNetwork(
  step: PasswordConsequencePlanStep,
  accountId: S06AccountId,
  settledNetwork: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const persistentNetwork = preserveSettledAffectedState(step.network, settledNetwork);
  return {
    ...persistentNetwork,
    id: `${step.network.id}-hypothetical-incident`,
    nodes: persistentNetwork.nodes.flatMap((node): readonly SceneNode[] => {
      if (node.kind === 'shield') return [];
      return [
        isAccountBranchNode(node, accountId)
          ? {
              ...node,
              status: node.id === accountId ? 'exposed' : 'affected',
            }
          : node,
      ];
    }),
    accessibleSummary: `Was wäre, wenn? ${s06ConsequenceContent.accounts[accountId].label} wird als hypothetisch betroffen dargestellt.`,
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
  readonly #missionPhases: readonly S06MissionPhase[];
  readonly #prefersReducedMotion: () => boolean;
  readonly #onComplete: () => void;
  readonly #listeners = new Set<ControllerListener>();
  readonly #unsubscribeMission: () => void;
  #renderer: NetworkRendererPort | null = null;
  #settledNetwork: NetworkSceneSnapshot;
  readonly #campusgramInitialNetwork: NetworkSceneSnapshot;
  #campusgramOutcomeNetwork: NetworkSceneSnapshot;
  #campusgramComparisonResults: Readonly<
    Partial<Record<S06AccountId, PasswordRelation['kind']>>
  > = {};
  #displayedAttackNetwork: NetworkSceneSnapshot | null = null;
  #pendingResolutionNodeIds = new Set<string>();
  #waitingForHypotheticalResolution = false;
  #snapshot: S06ConsequenceControllerSnapshot;
  #completionNotified = false;
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
    this.#onComplete = onComplete ?? (() => undefined);
    this.#settledNetwork = firstStep.network;
    this.#campusgramInitialNetwork = firstStep.network;
    this.#campusgramOutcomeNetwork = firstStep.network;
    const missionSequence = createMission(plan);
    this.#mission = missionSequence.mission;
    this.#missionPhases = missionSequence.phases;
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
      attackSourceAccountId: 'campusgram',
      isHypothetical: false,
      showGuide: true,
      comparisonVisible: false,
      comparisonPreviewVisible: false,
      completedComparisonResults: {},
      controls: {
        canStart: this.#campusgramWasFound(),
        canReplay: false,
        canContinue: true,
      },
    };
    this.#missionController = new MissionController({
      animationPlayer,
      onComplete: () => this.#notifyComplete(),
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
    if (this.#snapshot.stage === 's07-transition') {
      const missionCompletion = this.#missionController.continue();
      this.#notifyComplete();
      return missionCompletion;
    }
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
    return this.#missionController.continue();
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
    if (
      this.#snapshot.step.relation?.kind === 'no-derived-path-recognized' &&
      this.#displayedAttackNetwork !== null
    ) {
      this.#displayedAttackNetwork = blockedResolutionNetwork(
        this.#snapshot.step,
        this.#displayedAttackNetwork,
        this.#settledNetwork,
        true,
      );
      this.#renderer?.render(this.#displayedAttackNetwork);
    }
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
    this.#settledNetwork = resolvedNetwork(
      this.#snapshot.step,
      this.#displayedAttackNetwork,
      this.#settledNetwork,
    );
    this.#displayedAttackNetwork = null;
    this.#snapshot = {
      ...this.#snapshot,
      comparisonVisible: false,
      comparisonPreviewVisible: false,
      completedComparisonResults: {
        ...this.#snapshot.completedComparisonResults,
        [this.#snapshot.step.targetAccountId]: this.#snapshot.step.relation.kind,
      },
    };
    this.#renderer?.render(this.#settledNetwork);
    this.#emit();
    // Progress is owned by the timed resolution phase, not by CSS animation-end events.
    void this.#missionController.continue();
  }

  resolutionVisualSettled(settledNodeIds: readonly string[]): void {
    if (this.#disposed || !this.#waitingForHypotheticalResolution) return;
    for (const nodeId of settledNodeIds) this.#pendingResolutionNodeIds.delete(nodeId);
    if (this.#pendingResolutionNodeIds.size > 0) return;

    this.#waitingForHypotheticalResolution = false;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'awaiting-decision',
      stage: 'hypothetical-ready',
      participant: this.#participantForNarration('s06.incident.campusgram-hypothetical'),
      attackPhase: 'found',
      attackSourceAccountId: 'campusgram',
      showGuide: true,
      controls: { canStart: true, canReplay: false, canContinue: true },
    };
    this.#emit();
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
        comparisonPreviewVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: false },
      };
      this.#emit();
      this.#notifyComplete();
      return;
    }
    const missionStepIndex = missionSnapshot.context.stepIndex;
    const missionPhase = this.#missionPhases[missionStepIndex];
    if (missionPhase === undefined) return;
    const awaitingDecision = missionSnapshot.matches({ active: 'awaitingDecision' });

    if (missionPhase.kind === 'automatic-comparison') {
      const step = missionPhase.step;
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      if (stepIndex < 0 || step.targetAccountId === null || step.relation === null) return;
      if (!awaitingDecision) {
        this.#displayedAttackNetwork = attackPreviewNetwork(step, this.#settledNetwork);
        this.#renderer?.render(this.#displayedAttackNetwork);
        this.#snapshot = {
          ...this.#snapshot,
          phase: 'animating',
          stage: 'attacking',
          stepIndex,
          step,
          participant: participantSnapshot(step),
          attackPhase: 'attacking',
          attackSourceAccountId: step.sourceAccountId,
          isHypothetical: step.mode === 'hypothetical',
          showGuide: false,
          comparisonVisible: true,
          comparisonPreviewVisible: false,
          controls: { canStart: false, canReplay: false, canContinue: false },
        };
        this.#emit();
        return;
      }

      this.#resolveAutomaticComparison(step);
      this.#continueMissionAfterSnapshot();
      return;
    }

    if (missionPhase.kind === 'comparison-resolution') {
      if (awaitingDecision) this.#continueMissionAfterSnapshot();
      return;
    }

    if (missionPhase.kind === 'comparison') {
      const step = missionPhase.step;
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      if (stepIndex < 0) return;
      if (this.#snapshot.step.id !== step.id || this.#displayedAttackNetwork === null) {
        this.#displayedAttackNetwork = attackPreviewNetwork(step, this.#settledNetwork);
        this.#renderer?.render(this.#displayedAttackNetwork);
      }
      const attackPhase =
        this.#snapshot.step.id === step.id &&
        (this.#snapshot.attackPhase === 'preview-ready' ||
          this.#snapshot.attackPhase === 'resolving')
          ? this.#snapshot.attackPhase
          : 'attacking';
      this.#snapshot = {
        ...this.#snapshot,
        phase:
          attackPhase === 'preview-ready'
            ? 'awaiting-decision'
            : attackPhase === 'resolving'
              ? 'animating'
              : awaitingDecision
                ? 'awaiting-decision'
                : 'animating',
        stage: 'attacking',
        stepIndex,
        step,
        participant: participantSnapshot(step),
        attackPhase,
        attackSourceAccountId: step.sourceAccountId,
        isHypothetical: step.mode === 'hypothetical',
        showGuide: false,
        comparisonVisible: true,
        comparisonPreviewVisible: true,
        controls: { canStart: false, canReplay: false, canContinue: false },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'local-check') {
      const step = missionPhase.step;
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      if (stepIndex < 0) return;
      const enteredLocalCheck =
        this.#snapshot.step.id !== step.id ||
        (this.#snapshot.stage !== 'local-check-animating' &&
          this.#snapshot.stage !== 'local-check-result');
      if (!awaitingDecision && enteredLocalCheck) {
        const pendingNetwork = pendingLocalCheckNetwork(step);
        this.#displayedAttackNetwork = null;
        this.#settledNetwork = pendingNetwork;
        this.#renderer?.render(pendingNetwork);
      } else if (awaitingDecision && this.#snapshot.stage !== 'local-check-result') {
        const settledLocalCheckNetwork = step.network;
        const sourceWasExposed =
          step.sourceAccountId !== null &&
          settledLocalCheckNetwork.nodes.some(
            ({ id, status }) => id === step.sourceAccountId && status === 'exposed',
          );
        this.#settledNetwork = {
          ...settledLocalCheckNetwork,
          nodes: settledLocalCheckNetwork.nodes.filter(({ kind }) => kind !== 'shield'),
          edges: sourceWasExposed
            ? settledLocalCheckNetwork.edges.map((edge): SceneEdge =>
                edge.sourceId === step.sourceAccountId &&
                edge.targetId.startsWith(`${step.sourceAccountId}-detail-`)
                  ? { ...edge, status: 'direct' }
                  : edge,
              )
            : settledLocalCheckNetwork.edges,
        };
        this.#renderer?.render(this.#settledNetwork);
      }
      const canStartNextAttack =
        awaitingDecision &&
        (this.#missionPhases[missionStepIndex + 1]?.kind === 'comparison' ||
          this.#missionPhases[missionStepIndex + 1]?.kind === 'automatic-comparison');
      this.#snapshot = {
        ...this.#snapshot,
        phase: awaitingDecision ? 'awaiting-decision' : 'animating',
        stage: awaitingDecision ? 'local-check-result' : 'local-check-animating',
        stepIndex,
        step,
        participant: participantSnapshot(step),
        attackPhase: 'incident-check',
        attackSourceAccountId: step.sourceAccountId,
        isHypothetical: false,
        showGuide: awaitingDecision,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        completedComparisonResults: {},
        controls: {
          canStart: canStartNextAttack,
          canReplay: false,
          canContinue: awaitingDecision,
        },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'master-campus-hypothetical-intro') {
      const step = missionPhase.step;
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      if (stepIndex < 0) return;
      if (
        this.#snapshot.stage !== 'master-hypothetical-animating' &&
        this.#snapshot.stage !== 'master-hypothetical-ready'
      ) {
        const network = hypotheticalIncidentNetwork(step, 'master-campus', this.#settledNetwork);
        this.#displayedAttackNetwork = null;
        this.#settledNetwork = network;
        this.#renderer?.render(network);
      }
      this.#snapshot = {
        ...this.#snapshot,
        phase: awaitingDecision ? 'awaiting-decision' : 'animating',
        stage: awaitingDecision
          ? 'master-hypothetical-ready'
          : 'master-hypothetical-animating',
        stepIndex,
        step,
        participant: {
          ...participantSnapshot(step),
          narration:
            s06ConsequenceContent.narrations['s06.incident.master-campus-hypothetical'],
        },
        attackPhase: 'hypothetical-intro',
        attackSourceAccountId: 'master-campus',
        isHypothetical: true,
        showGuide: awaitingDecision,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        completedComparisonResults: {},
        controls: {
          canStart: awaitingDecision,
          canReplay: false,
          canContinue: awaitingDecision,
        },
      };
      this.#emit();
      return;
    }

    if (!awaitingDecision) return;

    if (missionPhase.kind === 'campusgram-summary') {
      this.#campusgramOutcomeNetwork = this.#settledNetwork;
      this.#campusgramComparisonResults = this.#snapshot.completedComparisonResults;
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'campusgram-summary',
        participant: this.#participantForNarration(this.#campusgramSummaryNarrationId()),
        attackPhase: 'preview-ready',
        attackSourceAccountId: 'campusgram',
        isHypothetical: !this.#campusgramWasFound(),
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'perspective-transition') {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'perspective-transition',
        participant: this.#participantForNarration('s06.transition'),
        attackPhase: 'preview-ready',
        attackSourceAccountId: 'campusgram',
        isHypothetical: !this.#campusgramWasFound(),
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'email-transition') {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'email-transition',
        participant: this.#participantForNarration('s06.transition.campus-email'),
        attackPhase: 'preview-ready',
        attackSourceAccountId: 'master-campus',
        isHypothetical: false,
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'return-transition') {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'return-transition',
        participant: this.#participantForNarration('s06.transition.return-to-campusgram'),
        attackPhase: 'preview-ready',
        attackSourceAccountId: 'campus-email',
        isHypothetical: this.#snapshot.step.mode === 'hypothetical',
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'final-summary') {
      const summaryStep = planStep(this.#plan, 's06-step-summary');
      this.#settledNetwork = this.#campusgramWasFound()
        ? this.#campusgramOutcomeNetwork
        : this.#campusgramInitialNetwork;
      this.#renderer?.render(this.#settledNetwork);
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'final-summary',
        stepIndex: this.#plan.steps.length - 1,
        step: summaryStep,
        participant: this.#participantForNarration(
          this.#campusgramSummaryNarrationId('actual'),
        ),
        attackPhase: 'found',
        attackSourceAccountId: 'campusgram',
        isHypothetical: false,
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        completedComparisonResults: this.#campusgramWasFound()
          ? this.#campusgramComparisonResults
          : {},
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

    this.#snapshot = {
      ...this.#snapshot,
      phase: 'awaiting-decision',
      stage: 's07-transition',
      participant: this.#participantForNarration('s06.transition.s07'),
      showGuide: true,
      controls: { canStart: false, canReplay: false, canContinue: true },
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

  #campusgramSummaryNarrationId(
    mode: 'plan' | 'actual' = 'plan',
  ): Extract<S06NarrationId, `s06.summary.${string}`> {
    if (mode === 'actual' && !this.#campusgramWasFound()) {
      return 's06.summary.actual-source-blocked';
    }
    const affectedTargetCount = this.#plan.comparisons.filter(
      ({ sourceAccountId, result }) =>
        sourceAccountId === 'campusgram' &&
        result.relation.kind !== 'no-derived-path-recognized',
    ).length;
    if (mode === 'plan' && !this.#campusgramWasFound()) {
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
    const network = hypotheticalCampusgramNetwork(this.#snapshot.step.network);
    this.#settledNetwork = network;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      stage: 'hypothetical-animating',
      isHypothetical: true,
      attackPhase: 'hypothetical-intro',
      attackSourceAccountId: 'campusgram',
      showGuide: false,
      comparisonVisible: false,
      comparisonPreviewVisible: false,
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    const waitsForResolution = this.#waitForHypotheticalResolution(network, 'campusgram');
    this.#renderer?.render(network);
    if (!waitsForResolution) this.resolutionVisualSettled([]);
    this.#emit();
  }

  #startAttack(): void {
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      stage: 'attacking',
      showGuide: false,
      comparisonVisible: false,
      comparisonPreviewVisible: false,
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.start(this.#mission);
  }

  #resolveAutomaticComparison(step: PasswordConsequencePlanStep): void {
    if (step.targetAccountId === null || step.relation === null) return;
    const attackNetwork =
      this.#displayedAttackNetwork ?? attackPreviewNetwork(step, this.#settledNetwork);
    this.#settledNetwork = resolvedNetwork(step, attackNetwork, this.#settledNetwork);
    this.#displayedAttackNetwork = null;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      stage: 'attacking',
      step,
      participant: participantSnapshot(step),
      attackPhase: 'resolving',
      attackSourceAccountId: step.sourceAccountId,
      isHypothetical: step.mode === 'hypothetical',
      showGuide: false,
      comparisonVisible: false,
      comparisonPreviewVisible: false,
      completedComparisonResults: {
        ...this.#snapshot.completedComparisonResults,
        [step.targetAccountId]: step.relation.kind,
      },
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#renderer?.render(this.#settledNetwork);
    this.#emit();
  }

  #continueMissionAfterSnapshot(): void {
    // XState must finish publishing the current awaiting-decision snapshot before the next event.
    queueMicrotask(() => {
      if (!this.#disposed) void this.#missionController.continue();
    });
  }

  #notifyComplete(): void {
    if (this.#completionNotified || this.#disposed) return;
    this.#completionNotified = true;
    this.#onComplete();
  }

  #waitForHypotheticalResolution(
    network: NetworkSceneSnapshot,
    accountId: S06AccountId | null,
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
    const waitsForResolution = pendingNodeIds.size > 0 && !this.#prefersReducedMotion();
    this.#pendingResolutionNodeIds = waitsForResolution ? pendingNodeIds : new Set();
    this.#waitingForHypotheticalResolution = true;
    return waitsForResolution;
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
