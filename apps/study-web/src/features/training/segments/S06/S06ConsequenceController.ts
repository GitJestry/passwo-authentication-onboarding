import type {
  PasswordRelation,
  S06AccountId,
  S06PairComparison,
  TransientPasswordSemanticEvidence,
} from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
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
  createCanonicalPasswordView,
  createPersonalFindings,
  projectCanonicalPasswordBlocks,
  type S05VisualCategoryId,
} from '../S05/S05ComponentStrategy.js';
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

export type S06LocalReflectionMode = 'groups' | 'structure';

export interface S06LocalReflectionBlock {
  readonly id: string;
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly categoryIds: readonly S05VisualCategoryId[];
  readonly findings: readonly { readonly categoryId: S05VisualCategoryId; readonly label: string }[];
  readonly repeated: boolean;
  readonly repetitionCount: number | null;
}

export interface S06LocalReflectionStructureLink {
  readonly fromBlockId: string;
  readonly toBlockId: string;
}

export interface S06LocalReflectionSnapshot {
  readonly accountId: S06AccountId;
  readonly accountLabel: string;
  readonly fictionalPassword: string;
  readonly mode: S06LocalReflectionMode;
  readonly blocks: readonly S06LocalReflectionBlock[];
  readonly contentGroups: readonly {
    readonly id: string;
    readonly blockIds: readonly string[];
  }[];
  readonly activeContentGroupId: string;
  readonly structureLinks: readonly S06LocalReflectionStructureLink[];
}

export interface S06ConsequenceControllerSnapshot {
  readonly phase: 'ready' | 'animating' | 'awaiting-decision' | 'complete';
  readonly stage:
    | 'initial-found'
    | 'initial-blocked'
    | 'hypothetical-animating'
    | 'master-hypothetical-animating'
    | 'master-hypothetical-ready'
    | 'attacking'
    | 'campusgram-summary'
    | 'perspective-transition'
    | 'email-transition'
    | 'local-reflection'
    | 'local-check-result'
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
  readonly localReflection: S06LocalReflectionSnapshot | null;
  readonly controls: {
    readonly canStart: boolean;
    readonly canReplay: boolean;
    readonly canContinue: boolean;
  };
}

export interface S06ConsequenceControllerOptions {
  readonly plan: PasswordConsequenceScenePlan;
  readonly accountInputs: S06ConsequenceAccountInputs;
  readonly animationPlayer: AnimationPlayerPort;
  readonly prefersReducedMotion: () => boolean;
  readonly onSemanticEvidenceChange?: (
    accountId: S06AccountId,
    evidence: TransientPasswordSemanticEvidence,
  ) => void;
  readonly onComplete?: () => void;
}

export type S06ConsequenceAccountInputs = Readonly<
  Record<
    S06AccountId,
    {
      readonly fictionalPassword: string;
      readonly retrievalStatus: S06LocalAccountAnalysis['retrievalStatus'];
      readonly transientAccountIdentifiers?: readonly string[];
      readonly semanticEvidence?: TransientPasswordSemanticEvidence;
    }
  >
>;

type ControllerListener = (snapshot: S06ConsequenceControllerSnapshot) => void;

type S06MissionPhase =
  | { readonly kind: 'comparison'; readonly step: PasswordConsequencePlanStep }
  | { readonly kind: 'comparison-resolution'; readonly step: PasswordConsequencePlanStep }
  | { readonly kind: 'campusgram-summary' }
  | { readonly kind: 'perspective-transition' }
  | { readonly kind: 'email-transition' }
  | { readonly kind: 'local-reflection'; readonly step: PasswordConsequencePlanStep }
  | { readonly kind: 'local-check-result'; readonly step: PasswordConsequencePlanStep }
  | {
      readonly kind: 'master-campus-hypothetical-intro';
      readonly step: PasswordConsequencePlanStep;
    }
  | { readonly kind: 's07-transition' };

interface S06MissionSequence {
  readonly mission: MissionDefinition;
  readonly phases: readonly S06MissionPhase[];
}

const accountIds = ['campusgram', 'master-campus', 'campus-email'] as const;
const infectionDurationMs = 1350;
const localDecisionPauseMs = 900;
const comparisonResolutionDurationMs = 120;
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
        ...(account.semanticEvidence === undefined
          ? {}
          : { semanticEvidence: account.semanticEvidence }),
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

function missionStepForPhase(phase: S06MissionPhase): MissionDefinition['steps'][number] {
  if (phase.kind === 'comparison') {
    return {
      id: phase.step.id,
      narrationId: phase.step.narrationId,
      animation: {
        id: `${phase.step.id}-animation`,
        steps: [
          {
            type: 'reveal' as const,
            targetId: phase.step.visibleChange.targetId,
            durationMs: 500,
          },
        ],
        reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
        maxDurationMs: 500,
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
  if (phase.kind === 'master-campus-hypothetical-intro') {
    const id = 's06-master-campus-hypothetical-intro';
    return {
      id,
      narrationId: phase.step.narrationId,
      animation: {
        id: `${id}-animation`,
        steps: [
          {
            type: 'pause',
            durationMs: infectionDurationMs,
          },
        ],
        reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
        maxDurationMs: infectionDurationMs,
      },
    };
  }
  if (phase.kind === 'local-reflection' || phase.kind === 'local-check-result') {
    const id = `${phase.step.id}-${phase.kind}`;
    const durationMs = phase.kind === 'local-check-result' ? localDecisionPauseMs : 0;
    return {
      id,
      narrationId: phase.step.narrationId,
      animation: {
        id: `${id}-animation`,
        steps:
          durationMs === 0
            ? [{ type: 'announce', messageId: id }]
            : [{ type: 'pause', durationMs }],
        reducedMotion: { strategy: 'instant-end-state' as const, maxDurationMs: 0 },
        maxDurationMs: durationMs,
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
    { kind: 'local-reflection', step: planStep(plan, 's06-step-master-campus-perspective') },
    { kind: 'local-check-result', step: planStep(plan, 's06-step-master-campus-perspective') },
  ];
  if (!masterCampusWasFound(plan)) {
    phases.push({
      kind: 'master-campus-hypothetical-intro',
      step: planStep(plan, 's06-step-master-campus-perspective'),
    });
  }
  const masterEmailStep = planStep(plan, 's06-step-master-campus-campus-email');
  phases.push(
    { kind: 'comparison', step: masterEmailStep },
    { kind: 'comparison-resolution', step: masterEmailStep },
    { kind: 'email-transition' },
  );
  phases.push(
    { kind: 'local-reflection', step: planStep(plan, 's06-step-campus-email-local-check') },
    { kind: 'local-check-result', step: planStep(plan, 's06-step-campus-email-local-check') },
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

export type S06BlockedReplayFrame = 'attacking' | 'blocked';

/**
 * Reuses the authored S06 attack-preview and blocked-resolution projection for a replay in
 * which a password change has removed the previously observed relationship.
 */
export function createS06BlockedReplayNetwork(
  step: PasswordConsequencePlanStep,
  priorSettledNetwork: NetworkSceneSnapshot,
  frame: S06BlockedReplayFrame,
  options: { readonly shieldProgress?: number } = {},
): NetworkSceneSnapshot {
  const sourceAccountId = step.sourceAccountId;
  const targetAccountId = step.targetAccountId;
  const sourceNode = step.network.nodes.find(({ id }) => id === sourceAccountId);
  const targetNode = step.network.nodes.find(({ id }) => id === targetAccountId);
  if (
    sourceAccountId === null ||
    targetAccountId === null ||
    sourceNode === undefined ||
    targetNode === undefined
  ) {
    return priorSettledNetwork;
  }
  const authoredShield: SceneNode = {
    id: `${step.id}-shield`,
    kind: 'shield',
    symbolId: 'shield',
    label: 'Dieser Angriffsweg ist blockiert.',
    description:
      'Mit den begrenzten Transformationswegen dieser Simulation wurde kein direkter Weg erkannt.',
    status: 'protected',
    position: { x: targetNode.position.x - 0.12, y: targetNode.position.y - 0.04 },
    selectable: false,
  };
  const priorNodes = new Map(priorSettledNetwork.nodes.map((node) => [node.id, node]));
  const priorEdges = new Map(priorSettledNetwork.edges.map((edge) => [edge.id, edge]));
  const blockedStep: PasswordConsequencePlanStep = {
    ...step,
    network: {
      ...step.network,
      id: `${step.network.id}-protected-replay`,
      nodes: [
        ...step.network.nodes
          .filter(({ kind }) => kind !== 'shield')
          .map((node): SceneNode => ({
            ...node,
            status: priorNodes.get(node.id)?.status ?? 'protected',
          })),
        authoredShield,
      ],
      edges: step.network.edges.map((edge): SceneEdge =>
        edge.id === `${step.id}-path`
          ? { ...edge, kind: 'blocked-path', status: 'blocked', label: null }
          : {
              ...edge,
              kind: priorEdges.get(edge.id)?.kind ?? edge.kind,
              status: priorEdges.get(edge.id)?.status ?? edge.status,
              label: null,
            },
      ),
    },
  };
  const attackNetwork = attackPreviewNetwork(blockedStep, priorSettledNetwork);
  if (frame === 'attacking') return attackNetwork;
  const blockedNetwork = blockedResolutionNetwork(
    blockedStep,
    attackNetwork,
    priorSettledNetwork,
    false,
  );
  const shieldProgress = options.shieldProgress ?? 0.78;
  if (shieldProgress === 0.78) return blockedNetwork;
  return {
    ...blockedNetwork,
    nodes: blockedNetwork.nodes.map((node): SceneNode =>
      node.id === authoredShield.id
        ? {
            ...node,
            position: {
              x: sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) * shieldProgress,
              y: sourceNode.position.y + (targetNode.position.y - sourceNode.position.y) * shieldProgress,
            },
          }
        : node,
    ),
  };
}

export function createS06BlockedReplayTriangle(
  baseNetwork: NetworkSceneSnapshot,
  steps: readonly PasswordConsequencePlanStep[],
): NetworkSceneSnapshot {
  const baseEdges = baseNetwork.edges.filter((edge) => !isAttackEdge(edge));
  const triangleNodes: SceneNode[] = [];
  const triangleEdges: SceneEdge[] = [];
  for (const step of steps) {
    const sourceAccountId = step.sourceAccountId;
    const targetAccountId = step.targetAccountId;
    if (sourceAccountId === null || targetAccountId === null) continue;
    const blockedNetwork = createS06BlockedReplayNetwork(step, baseNetwork, 'blocked', {
      shieldProgress: 0.5,
    });
    const shield = blockedNetwork.nodes.find(
      (node) => node.id === `${step.id}-shield` && node.kind === 'shield',
    );
    const firstSegment = blockedNetwork.edges.find(
      (edge) => edge.id === `${step.id}-path`,
    );
    if (shield === undefined || firstSegment === undefined) continue;
    triangleNodes.push(shield);
    triangleEdges.push(
      firstSegment,
      {
        id: `${step.id}-opposite-path`,
        sourceId: targetAccountId,
        targetId: shield.id,
        kind: 'blocked-path',
        status: 'blocked',
        label: null,
      },
    );
  }
  return {
    ...baseNetwork,
    id: `${baseNetwork.id}-blocked-triangle`,
    nodes: [
      ...baseNetwork.nodes.filter(({ kind }) => kind !== 'shield'),
      ...triangleNodes,
    ],
    edges: [...baseEdges, ...triangleEdges],
    accessibleSummary:
      'Alle drei Kontopaare sind durch grüne, mittig unterbrochene Schutzverbindungen blockiert.',
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

function createLocalReflection(
  accountId: S06AccountId,
  account: S06ConsequenceAccountInputs[S06AccountId],
): S06LocalReflectionSnapshot {
  const componentAnalysis = analyzeFictionalPassword({
    fictionalPassword: account.fictionalPassword,
    authoredAccountTerms: s06ConsequenceContent.accounts[accountId].accountTerms,
    ...(account.transientAccountIdentifiers === undefined
      ? {}
      : { transientAccountIdentifiers: account.transientAccountIdentifiers }),
  });
  const canonicalView = createCanonicalPasswordView(account.fictionalPassword, componentAnalysis);
  const personalFindings = createPersonalFindings(
    canonicalView,
    (account.semanticEvidence?.relations ?? []).flatMap((relation) =>
      relation.kind !== 'personal-context'
        ? []
        : relation.evidence.flatMap((evidence, index) =>
            evidence.type !== 'span'
              ? []
              : [
                  {
                    id: `s06-personal:${relation.id}:${index}`,
                    start: evidence.start,
                    end: evidence.end,
                  },
                ],
          ),
    ),
  );
  const automaticFindings = [
    ...canonicalView.automaticFindings['common-components'],
    ...canonicalView.automaticFindings['account-context'],
    ...personalFindings,
  ];
  const structureAnalysis = analyzeFictionalPasswordStructure({
    fictionalPassword: account.fictionalPassword,
    componentAnalysis,
  });
  const repetitionFindings = structureAnalysis.findings.filter(
    ({ findingKind }) =>
      findingKind === 'exact-component-repetition' ||
      findingKind === 'recognized-repetition-pattern',
  );
  const blocks = projectCanonicalPasswordBlocks(canonicalView, automaticFindings).map(
    (block): S06LocalReflectionBlock => {
      const repeated = repetitionFindings.some((finding) => {
        const spans = finding.evidence.filter((evidence) => evidence.type === 'span');
        return (
          spans.length >= 2 &&
          spans.some((span) => span.start < block.end && span.end > block.start)
        );
      });
      const repetitionCount = repetitionFindings.reduce<number | null>((maximum, finding) => {
        const spans = finding.evidence
          .filter((evidence) => evidence.type === 'span')
          .sort((left, right) => left.start - right.start);
        const firstSpan = spans[0];
        const beginsHere =
          firstSpan !== undefined && firstSpan.start < block.end && firstSpan.end > block.start;
        if (!beginsHere || spans.length < 2) return maximum;
        return Math.max(maximum ?? 0, spans.length);
      }, null);
      return {
        id: block.id,
        start: block.start,
        end: block.end,
        value: block.value,
        categoryIds: block.categoryIds,
        findings: block.findings,
        repeated,
        repetitionCount,
      };
    },
  );
  return {
    accountId,
    accountLabel: s06ConsequenceContent.accounts[accountId].label,
    fictionalPassword: account.fictionalPassword,
    mode: 'groups',
    blocks,
    contentGroups: [{ id: 'content-group-1', blockIds: [] }],
    activeContentGroupId: 'content-group-1',
    structureLinks: [],
  };
}

function semanticEvidenceForReflection(
  reflection: S06LocalReflectionSnapshot,
  existingEvidence: TransientPasswordSemanticEvidence | undefined,
): TransientPasswordSemanticEvidence {
  const relation = (
    id: string,
    kind: 'shared-content' | 'sentence-or-phrase',
    blockIds: readonly string[],
  ) => {
    const evidence = reflection.blocks
      .filter((block) => blockIds.includes(block.id))
      .sort((left, right) => left.start - right.start)
      .map(({ start, end, value }) => ({ type: 'span' as const, start, end, token: value }));
    return evidence.length < 2 ? [] : [{ id, kind, evidence }];
  };
  return {
    kind: 'transient-password-semantic-evidence',
    confirmed: true,
    relations: [
      ...(existingEvidence?.relations.filter(
        (existingRelation) => existingRelation.kind === 'personal-context',
      ) ?? []),
      ...reflection.contentGroups.flatMap((group) =>
        relation(
          `semantic:s06:${reflection.accountId}:${group.id}`,
          'shared-content',
          group.blockIds,
        ),
      ),
      ...reflection.structureLinks.flatMap(({ fromBlockId, toBlockId }, index) =>
        relation(
          `semantic:s06:${reflection.accountId}:structure:${index}:${fromBlockId}:${toBlockId}`,
          'sentence-or-phrase',
          [fromBlockId, toBlockId],
        ),
      ),
    ],
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
  #plan: PasswordConsequenceScenePlan;
  #accountInputs: S06ConsequenceAccountInputs;
  readonly #missionController: MissionController;
  readonly #mission: MissionDefinition;
  readonly #missionPhases: readonly S06MissionPhase[];
  readonly #prefersReducedMotion: () => boolean;
  readonly #onComplete: () => void;
  readonly #onSemanticEvidenceChange: (
    accountId: S06AccountId,
    evidence: TransientPasswordSemanticEvidence,
  ) => void;
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
    accountInputs,
    animationPlayer,
    prefersReducedMotion,
    onSemanticEvidenceChange,
    onComplete,
  }: S06ConsequenceControllerOptions) {
    const firstStep = plan.steps[0];
    if (firstStep === undefined) throw new Error('S06 scene plan requires at least one step.');
    this.#plan = plan;
    this.#accountInputs = accountInputs;
    this.#prefersReducedMotion = prefersReducedMotion;
    this.#onComplete = onComplete ?? (() => undefined);
    this.#onSemanticEvidenceChange = onSemanticEvidenceChange ?? (() => undefined);
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
      localReflection: null,
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
    if (this.#snapshot.stage === 'initial-found') {
      this.#startAttack();
      return Promise.resolve();
    }
    return this.#missionController.continue();
  }

  selectLocalReflectionMode(mode: S06LocalReflectionMode): void {
    const reflection = this.#snapshot.localReflection;
    if (this.#disposed || this.#snapshot.stage !== 'local-reflection' || reflection === null) return;
    if (mode === 'structure' && reflection.blocks.length < 2) return;
    this.#snapshot = {
      ...this.#snapshot,
      localReflection: { ...reflection, mode },
    };
    this.#emit();
  }

  selectLocalReflectionGroup(groupId: string): void {
    const reflection = this.#snapshot.localReflection;
    if (
      this.#disposed ||
      this.#snapshot.stage !== 'local-reflection' ||
      reflection === null ||
      !reflection.contentGroups.some(({ id }) => id === groupId)
    ) {
      return;
    }
    this.#snapshot = {
      ...this.#snapshot,
      localReflection: {
        ...reflection,
        mode: 'groups',
        activeContentGroupId: groupId,
      },
    };
    this.#emit();
  }

  addLocalReflectionGroup(): void {
    const reflection = this.#snapshot.localReflection;
    if (this.#disposed || this.#snapshot.stage !== 'local-reflection' || reflection === null) return;
    const canAdd = reflection.contentGroups.every(({ blockIds }) => blockIds.length > 0);
    if (!canAdd) return;
    const nextIndex =
      Math.max(
        0,
        ...reflection.contentGroups.map(({ id }) => Number(/(\d+)$/u.exec(id)?.[1] ?? 0)),
      ) + 1;
    const nextGroup = { id: `content-group-${nextIndex}`, blockIds: [] } as const;
    this.#snapshot = {
      ...this.#snapshot,
      localReflection: {
        ...reflection,
        mode: 'groups',
        contentGroups: [...reflection.contentGroups, nextGroup],
        activeContentGroupId: nextGroup.id,
      },
    };
    this.#emit();
  }

  toggleLocalReflectionBlock(blockId: string): void {
    const reflection = this.#snapshot.localReflection;
    if (
      this.#disposed ||
      this.#snapshot.stage !== 'local-reflection' ||
      reflection === null ||
      !reflection.blocks.some(({ id }) => id === blockId)
    ) {
      return;
    }
    if (reflection.mode === 'groups') {
      const activeGroup = reflection.contentGroups.find(
        ({ id }) => id === reflection.activeContentGroupId,
      );
      if (activeGroup === undefined) return;
      const alreadySelected = activeGroup.blockIds.includes(blockId);
      const contentGroups = reflection.contentGroups.map((group) => ({
        ...group,
        blockIds:
          group.id === activeGroup.id
            ? alreadySelected
              ? group.blockIds.filter((id) => id !== blockId)
              : [...group.blockIds, blockId]
            : group.blockIds.filter((id) => id !== blockId),
      }));
      this.#snapshot = {
        ...this.#snapshot,
        localReflection: { ...reflection, contentGroups },
      };
      this.#emit();
      return;
    }
    const fromIndex = reflection.blocks.findIndex(({ id }) => id === blockId);
    const toBlock = reflection.blocks[fromIndex + 1];
    if (fromIndex < 0 || toBlock === undefined) return;
    const exists = reflection.structureLinks.some(
      ({ fromBlockId, toBlockId }) => fromBlockId === blockId && toBlockId === toBlock.id,
    );
    const structureLinks = exists
      ? reflection.structureLinks.filter(
          ({ fromBlockId, toBlockId }) =>
            fromBlockId !== blockId || toBlockId !== toBlock.id,
        )
      : [...reflection.structureLinks, { fromBlockId: blockId, toBlockId: toBlock.id }];
    this.#snapshot = {
      ...this.#snapshot,
      localReflection: { ...reflection, structureLinks },
    };
    this.#emit();
  }

  completeLocalReflection(): void {
    const reflection = this.#snapshot.localReflection;
    if (this.#disposed || this.#snapshot.stage !== 'local-reflection' || reflection === null) return;
    const account = this.#accountInputs[reflection.accountId];
    const semanticEvidence = semanticEvidenceForReflection(reflection, account.semanticEvidence);
    this.#accountInputs = {
      ...this.#accountInputs,
      [reflection.accountId]: { ...account, semanticEvidence },
    };
    this.#plan = createS06ConsequenceScenePlan(this.#plan.id, this.#accountInputs);
    this.#onSemanticEvidenceChange(reflection.accountId, semanticEvidence);
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'animating',
      stage: 'local-check-result',
      controls: { canStart: false, canReplay: false, canContinue: false },
    };
    this.#emit();
    void this.#missionController.continue();
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
    this.#startAttack();
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

    if (missionPhase.kind === 'comparison-resolution') {
      if (awaitingDecision) this.#continueMissionAfterSnapshot();
      return;
    }

    if (missionPhase.kind === 'comparison') {
      const step = this.#currentPlanStep(missionPhase.step.id);
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

    if (missionPhase.kind === 'local-reflection') {
      if (!awaitingDecision) return;
      const step = this.#currentPlanStep(missionPhase.step.id);
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      const accountId = step.sourceAccountId;
      if (stepIndex < 0 || accountId === null) return;
      const existingReflection = this.#snapshot.localReflection;
      const localReflection =
        existingReflection?.accountId === accountId
          ? existingReflection
          : createLocalReflection(accountId, this.#accountInputs[accountId]);
      if (existingReflection?.accountId !== accountId) {
        const pendingNetwork = pendingLocalCheckNetwork(step);
        this.#displayedAttackNetwork = null;
        this.#settledNetwork = pendingNetwork;
        this.#renderer?.render(pendingNetwork);
      }
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'local-reflection',
        stepIndex,
        step,
        participant: participantSnapshot(step),
        attackPhase: 'incident-check',
        attackSourceAccountId: accountId,
        isHypothetical: false,
        showGuide: false,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        completedComparisonResults: {},
        localReflection,
        presentation: {
          ...this.#snapshot.presentation,
          revealedNodeIds: step.network.nodes
            .filter((node) => isAccountBranchNode(node, accountId))
            .map(({ id }) => id),
          highlightedNodeId: accountId,
        },
        controls: { canStart: false, canReplay: false, canContinue: false },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'local-check-result') {
      if (!awaitingDecision) return;
      const step = this.#currentPlanStep(missionPhase.step.id);
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      if (stepIndex < 0) return;
      this.#settleLocalCheck(step);
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'local-check-result',
        stepIndex,
        step,
        participant: participantSnapshot(step),
        attackPhase: 'incident-check',
        attackSourceAccountId: step.sourceAccountId,
        isHypothetical: false,
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        localReflection: null,
        presentation: {
          ...this.#snapshot.presentation,
          revealedNodeIds: this.#allNodeIds(),
          highlightedNodeId: step.sourceAccountId,
        },
        controls: {
          canStart: step.sourceAccountId === 'master-campus',
          canReplay: false,
          canContinue: true,
        },
      };
      this.#emit();
      return;
    }

    if (missionPhase.kind === 'master-campus-hypothetical-intro') {
      if (masterCampusWasFound(this.#plan)) {
        if (awaitingDecision) this.#continueMissionAfterSnapshot();
        return;
      }
      const step = this.#currentPlanStep(missionPhase.step.id);
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
        participant: participantSnapshot(step),
        attackPhase: 'hypothetical-intro',
        attackSourceAccountId: 'master-campus',
        isHypothetical: true,
        showGuide: false,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        completedComparisonResults: {},
        controls: {
          canStart: false,
          canReplay: false,
          canContinue: false,
        },
      };
      this.#emit();
      if (awaitingDecision) this.#continueMissionAfterSnapshot();
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
      const step = this.#currentPlanStep('s06-step-master-campus-campus-email');
      const stepIndex = this.#plan.steps.findIndex(({ id }) => id === step.id);
      if (stepIndex < 0 || step.relation === null) return;
      const narrationId: S06NarrationId =
        step.relation.kind === 'no-derived-path-recognized'
          ? 's06.transition.master-campus-email-no-match'
          : 's06.transition.master-campus-email-match';
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'awaiting-decision',
        stage: 'email-transition',
        stepIndex,
        step,
        participant: this.#participantForNarration(narrationId),
        attackPhase: 'preview-ready',
        attackSourceAccountId: 'master-campus',
        isHypothetical: step.mode === 'hypothetical',
        showGuide: true,
        comparisonVisible: false,
        comparisonPreviewVisible: false,
        controls: { canStart: false, canReplay: false, canContinue: true },
      };
      this.#emit();
      return;
    }

    const summaryStep = planStep(this.#plan, 's06-step-summary');
    this.#settledNetwork = this.#campusgramWasFound()
      ? this.#campusgramOutcomeNetwork
      : this.#campusgramInitialNetwork;
    this.#renderer?.render(this.#settledNetwork);
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'awaiting-decision',
      stage: 's07-transition',
      stepIndex: this.#plan.steps.length - 1,
      step: summaryStep,
      participant: this.#participantForNarration('s06.transition.s07'),
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
  }

  #currentPlanStep(stepId: PasswordConsequenceStepId): PasswordConsequencePlanStep {
    return planStep(this.#plan, stepId);
  }

  #allNodeIds(): readonly string[] {
    return [
      ...new Set(this.#plan.steps.flatMap(({ network }) => network.nodes.map(({ id }) => id))),
    ];
  }

  #settleLocalCheck(step: PasswordConsequencePlanStep): void {
    const sourceWasExposed =
      step.sourceAccountId !== null &&
      step.network.nodes.some(
        ({ id, status }) => id === step.sourceAccountId && status === 'exposed',
      );
    this.#settledNetwork = {
      ...step.network,
      nodes: step.network.nodes,
      edges: sourceWasExposed
        ? step.network.edges.map((edge): SceneEdge =>
            edge.sourceId === step.sourceAccountId &&
            edge.targetId.startsWith(`${step.sourceAccountId}-detail-`)
              ? { ...edge, status: 'direct' }
              : edge,
          )
        : step.network.edges,
    };
    this.#renderer?.render(this.#settledNetwork);
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

  #campusgramSummaryNarrationId(): Extract<S06NarrationId, `s06.summary.${string}`> {
    const affectedTargetCount = this.#plan.comparisons.filter(
      ({ sourceAccountId, result }) =>
        sourceAccountId === 'campusgram' &&
        result.relation.kind !== 'no-derived-path-recognized',
    ).length;
    if (!this.#campusgramWasFound()) {
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
