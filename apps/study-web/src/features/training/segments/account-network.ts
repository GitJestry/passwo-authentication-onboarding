import type {
  PasswordRelation,
  PredefinedPassphraseId,
  S06AccountId,
  SupportiveS08ResumeState,
} from '@passwo/contracts';
import {
  deriveAdditionalPassphraseIds,
  s02Content,
  s08NetworkReplayContent,
} from '@passwo/training-content';
import type {
  NetworkSceneSnapshot,
  PasswordConsequencePlanStep,
  PasswordConsequenceScenePlan,
  SceneEdge,
  SceneNode,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../adapters/network/NetworkMotionAdapter.js';

const s02Accounts = s02Content.scene.accounts;

function s02NodeFor(node: SceneNode): SceneNode | null {
  const account = s02Accounts.find(({ id }) => node.id === id || node.id.startsWith(`${id}-`));
  if (account === undefined) return null;
  if (node.id === account.id) {
    return { ...node, symbolId: account.symbolId, position: account.position };
  }
  const detailIndex = Number(node.id.match(/-detail-(\d+)$/)?.[1] ?? 0) - 1;
  const detail = account.details[detailIndex];
  return detail === undefined
    ? null
    : { ...node, symbolId: detail.symbolId, position: detail.position };
}

export function alignNetworkSceneToS02(snapshot: NetworkSceneSnapshot): NetworkSceneSnapshot {
  return {
    ...snapshot,
    nodes: snapshot.nodes.map((node) => s02NodeFor(node) ?? node),
  };
}

export function createCompletedS02Network(): NetworkSceneSnapshot {
  const nodes: SceneNode[] = s02Accounts.flatMap((account) => [
    {
      id: account.id,
      kind: 'account',
      symbolId: account.symbolId,
      label: account.label,
      description: account.descriptions.viewed,
      status: 'viewed',
      locked: false,
      position: account.position,
      selectable: false,
    },
    ...account.details.map(
      (detail): SceneNode => ({
        id: detail.id,
        kind: account.detailKind,
        symbolId: detail.symbolId,
        label: detail.label,
        description: detail.descriptions.opened,
        status: 'viewed',
        position: detail.position,
        selectable: false,
      }),
    ),
  ]);
  const edges: SceneEdge[] = s02Accounts.flatMap((account): SceneEdge[] => {
    const edgeKind = account.edgeKind;
    return edgeKind === null
      ? []
      : account.details.map((detail): SceneEdge => ({
          id: `${account.id}--${detail.id}`,
          sourceId: account.id,
          targetId: detail.id,
          kind: edgeKind,
          status: 'opened',
          label: account.edgeLabel,
        }));
  });
  return {
    id: 's02-completed-account-network',
    nodes,
    edges,
    accessibleSummary: s02Content.scene.summaries.complete,
  };
}

export type S05AssessmentNetworkPhase = 'focus' | 'campusgram-result' | 'other-accounts';

function belongsToCampusgramCluster(nodeId: string): boolean {
  return nodeId.startsWith('campusgram-');
}

/**
 * Projects the already authored desktop graph into the final S05 explanation.
 * The result remains presentation-only and does not infer relationships between
 * the participant's other fictional passwords.
 */
export function projectS05AssessmentNetwork(
  base: NetworkSceneSnapshot,
  wholePasswordRecognized: boolean,
  phase: S05AssessmentNetworkPhase,
): NetworkSceneSnapshot {
  const showsCampusgramResult = phase !== 'focus';
  const showsOtherAccounts = phase === 'other-accounts';
  const resultStatus = wholePasswordRecognized ? 'exposed' : 'protected';
  const clusterStatus = wholePasswordRecognized ? 'affected' : 'protected';
  const clusterEdgeStatus = wholePasswordRecognized ? 'direct' : 'blocked';
  const clusterEdgeKind = wholePasswordRecognized ? 'check' : 'blocked-path';
  const nodes = base.nodes.flatMap((node): SceneNode[] => {
    if (node.kind === 'shield') return [];
    if (node.id !== 'campusgram' && !belongsToCampusgramCluster(node.id)) {
      return showsOtherAccounts
        ? [{ ...node, locked: false, selectable: false, status: 'neutral' }]
        : [];
    }
    if (node.id === 'campusgram' && showsCampusgramResult) {
      return [
        {
          ...node,
          locked: false,
          selectable: false,
          status: resultStatus,
          description: wholePasswordRecognized
            ? 'Das vollständige fiktive Campusgram-Passwort wurde in den simulierten Prüfungen gefunden.'
            : 'Der dargestellte Prüfweg wurde durch den Passwortfaktor blockiert; das ist keine allgemeine Sicherheitsgarantie.',
        },
      ];
    }
    if (belongsToCampusgramCluster(node.id) && showsCampusgramResult) {
      return [
        {
          ...node,
          locked: false,
          selectable: false,
          status: clusterStatus,
          description: wholePasswordRecognized
            ? 'Dieser Bereich ist direkt mit dem gefundenen Campusgram-Konto verbunden.'
            : 'Ein Schild kennzeichnet hier den Passwortschutz als einen Faktor.',
        },
      ];
    }
    return [{ ...node, locked: false, selectable: false, status: 'neutral' }];
  });
  const edges = base.edges.flatMap((edge): SceneEdge[] => {
    if (edge.sourceId !== 'campusgram') {
      return showsOtherAccounts ? [{ ...edge, status: 'neutral' }] : [];
    }
    return [
      showsCampusgramResult
        ? { ...edge, kind: clusterEdgeKind, status: clusterEdgeStatus }
        : { ...edge, status: 'neutral' },
    ];
  });
  return {
    id: `s05-assessment-${phase}-${wholePasswordRecognized ? 'found' : 'protected'}`,
    nodes,
    edges,
    accessibleSummary:
      phase === 'focus'
        ? 'Campusgram und seine direkt verbundenen Bereiche sind sichtbar. Die übrigen Konten sind noch ausgeblendet.'
        : phase === 'campusgram-result'
          ? wholePasswordRecognized
            ? 'Das vollständige Campusgram-Passwort wurde in der Simulation gefunden. Campusgram und seine direkt angebundenen Knoten und Verbindungen sind rot markiert.'
            : 'Der simulierte Prüfweg zu Campusgram wurde blockiert. Schilde und blaue Schutzlinien markieren Campusgram und seine direkt angebundenen Knoten.'
          : wholePasswordRecognized
            ? 'Campusgram und seine direkt angebundenen Knoten sind rot markiert. Master Campus, Campus E-Mail und ihre verbundenen Bereiche sind nun zusätzlich sichtbar.'
            : 'Campusgram und seine direkt angebundenen Knoten sind als blockiert markiert. Master Campus, Campus E-Mail und ihre verbundenen Bereiche sind nun zusätzlich sichtbar.',
  };
}

export function createS05AssessmentNetwork(
  wholePasswordRecognized: boolean,
  phase: S05AssessmentNetworkPhase,
): NetworkSceneSnapshot {
  return projectS05AssessmentNetwork(
    createCompletedS02Network(),
    wholePasswordRecognized,
    phase,
  );
}

export function createRewoundAccountNetwork(
  source: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const nodes = source.nodes
    .filter(({ kind }) => kind !== 'shield')
    .map((node): SceneNode => ({
      ...node,
      status: 'viewed',
      selectable: false,
    }));
  const nodeIds = new Set(nodes.map(({ id }) => id));
  const edges = source.edges
    .filter(
      ({ id, sourceId, targetId }) =>
        !id.endsWith('-path') && nodeIds.has(sourceId) && nodeIds.has(targetId),
    )
    .map((edge): SceneEdge => ({ ...edge, status: 'opened', label: null }));
  return {
    ...source,
    id: `${source.id}-rewound`,
    nodes,
    edges,
    accessibleSummary: s02Content.scene.summaries.complete,
  };
}

export type S08ProtectedReplayPhase = 'ready' | 'attack' | 'complete';

function isS08AccountId(value: string): value is S06AccountId {
  return value === 'master-campus' || value === 'campus-email' || value === 'campusgram';
}

export interface S08ProtectionRiskModel {
  readonly relationships: readonly SceneEdge[];
  readonly localFindingAccountIds: readonly S06AccountId[];
}

export function activeS08PasswordRelationships(
  riskModel: S08ProtectionRiskModel,
  changedAccountIds: readonly S06AccountId[],
): readonly SceneEdge[] {
  const changedAccounts = new Set(changedAccountIds);
  return riskModel.relationships.filter(
    ({ sourceId, targetId }) =>
      (!isS08AccountId(sourceId) || !changedAccounts.has(sourceId)) &&
      (!isS08AccountId(targetId) || !changedAccounts.has(targetId)),
  );
}

function s08AccountPairId(left: S06AccountId, right: S06AccountId): string {
  return [left, right].sort().join('--');
}

export function blockedS08ProtectionSteps(
  riskModel: S08ProtectionRiskModel,
  changedAccountIds: readonly S06AccountId[],
  steps: readonly PasswordConsequencePlanStep[],
): readonly PasswordConsequencePlanStep[] {
  const activeRelationshipPairIds = new Set(
    activeS08PasswordRelationships(riskModel, changedAccountIds).flatMap(
      ({ sourceId, targetId }) =>
        isS08AccountId(sourceId) && isS08AccountId(targetId)
          ? [s08AccountPairId(sourceId, targetId)]
          : [],
    ),
  );
  return steps.filter(({ sourceAccountId, targetAccountId }) => {
    if (sourceAccountId === null || targetAccountId === null) return false;
    return !activeRelationshipPairIds.has(
      s08AccountPairId(sourceAccountId, targetAccountId),
    );
  });
}

export function s08AccountHasOpenActionNeed(
  riskModel: S08ProtectionRiskModel,
  changedAccountIds: readonly S06AccountId[],
  accountId: Exclude<S06AccountId, 'campusgram'>,
): boolean {
  if (changedAccountIds.includes(accountId)) return false;
  if (riskModel.localFindingAccountIds.includes(accountId)) return true;
  return activeS08PasswordRelationships(riskModel, changedAccountIds).some(
    ({ sourceId, targetId }) => sourceId === accountId || targetId === accountId,
  );
}

export function s08HasOpenActionNeed(
  riskModel: S08ProtectionRiskModel,
  changedAccountIds: readonly S06AccountId[],
): boolean {
  const hasOpenLocalFinding = riskModel.localFindingAccountIds.some(
    (accountId) => accountId !== 'campusgram' && !changedAccountIds.includes(accountId),
  );
  return (
    hasOpenLocalFinding || activeS08PasswordRelationships(riskModel, changedAccountIds).length > 0
  );
}

export function createS08ProtectionRiskModel(
  source: NetworkSceneSnapshot,
  plan?: Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'> | null,
): S08ProtectionRiskModel {
  const sourceRelationships = source.edges.filter(
    (edge) =>
      isS08AccountId(edge.sourceId) &&
      isS08AccountId(edge.targetId) &&
      (edge.kind === 'identical-reuse' || edge.kind === 'similar-pattern'),
  );
  const plannedRelationships = new Map<string, SceneEdge>();
  for (const comparison of plan?.comparisons ?? []) {
    const relationKind = comparison.result.relation.kind;
    if (relationKind === 'no-derived-path-recognized') continue;
    const pairId = [comparison.sourceAccountId, comparison.targetAccountId].sort().join('--');
    const current = plannedRelationships.get(pairId);
    if (current?.kind === 'identical-reuse') continue;
    plannedRelationships.set(pairId, {
      id: `s08-risk-${pairId}`,
      sourceId: comparison.sourceAccountId,
      targetId: comparison.targetAccountId,
      kind: relationKind === 'exact-match' ? 'identical-reuse' : 'similar-pattern',
      status: relationKind === 'exact-match' ? 'direct' : 'similar',
      label: null,
    });
  }
  return {
    // The plan is the canonical S06 finding set. The snapshot may predate transient
    // reflection updates and supplies presentation data only while a plan is available.
    relationships:
      plan === null || plan === undefined
        ? sourceRelationships
        : [...plannedRelationships.values()],
    localFindingAccountIds: (plan?.accounts ?? [])
      .filter(({ disposition }) => disposition.kind === 'whole-password-recognized')
      .map(({ accountId }) => accountId),
  };
}

function s08ResumeRelationshipId(
  sourceId: S06AccountId,
  targetId: S06AccountId,
): SupportiveS08ResumeState['relationships'][number]['id'] {
  const pair = new Set<S06AccountId>([sourceId, targetId]);
  if (pair.has('campusgram') && pair.has('master-campus')) {
    return 'campusgram--master-campus';
  }
  if (pair.has('campusgram') && pair.has('campus-email')) {
    return 'campusgram--campus-email';
  }
  if (pair.has('master-campus') && pair.has('campus-email')) {
    return 'master-campus--campus-email';
  }
  throw new Error('s08-resume-relationship-pair-invalid');
}

export function createSupportiveS08ResumeState(
  plan: Pick<PasswordConsequenceScenePlan, 'accounts' | 'comparisons'>,
  campusgramPassphraseId: PredefinedPassphraseId,
): SupportiveS08ResumeState {
  const riskModel = createS08ProtectionRiskModel(createCompletedS02Network(), plan);
  const [masterCampusPassphraseId, campusEmailPassphraseId] =
    deriveAdditionalPassphraseIds(campusgramPassphraseId);
  return {
    schemaVersion: 'supportive-s08-resume-v1',
    passphraseIds: {
      campusgram: campusgramPassphraseId,
      masterCampus: masterCampusPassphraseId,
      campusEmail: campusEmailPassphraseId,
    },
    weakAccountIds: riskModel.localFindingAccountIds.filter(
      (accountId): accountId is 'master-campus' | 'campus-email' =>
        accountId === 'master-campus' || accountId === 'campus-email',
    ),
    relationships: riskModel.relationships.flatMap((relationship) => {
      if (
        !isS08AccountId(relationship.sourceId) ||
        !isS08AccountId(relationship.targetId)
      ) {
        return [];
      }
      return [
        {
          id: s08ResumeRelationshipId(relationship.sourceId, relationship.targetId),
          kind: relationship.kind === 'identical-reuse' ? 'identical' : 'similar',
        },
      ];
    }),
  };
}

export function createS08ProtectionRiskModelFromResumeState(
  resumeState: SupportiveS08ResumeState,
): S08ProtectionRiskModel {
  const accountPair = {
    'campusgram--master-campus': ['campusgram', 'master-campus'],
    'campusgram--campus-email': ['campusgram', 'campus-email'],
    'master-campus--campus-email': ['master-campus', 'campus-email'],
  } as const satisfies Readonly<
    Record<
      SupportiveS08ResumeState['relationships'][number]['id'],
      readonly [S06AccountId, S06AccountId]
    >
  >;
  return {
    localFindingAccountIds: resumeState.weakAccountIds,
    relationships: resumeState.relationships.map((relationship): SceneEdge => {
      const [sourceId, targetId] = accountPair[relationship.id];
      const exactReuse = relationship.kind === 'identical';
      return {
        id: `s08-resume-risk-${relationship.id}`,
        sourceId,
        targetId,
        kind: exactReuse ? 'identical-reuse' : 'similar-pattern',
        status: exactReuse ? 'direct' : 'similar',
        label: null,
      };
    }),
  };
}

function s08AccountIdForNode(nodeId: string): S06AccountId | null {
  if (nodeId === 'master-campus' || nodeId.startsWith('master-campus-detail-')) {
    return 'master-campus';
  }
  if (nodeId === 'campus-email' || nodeId.startsWith('campus-email-detail-')) {
    return 'campus-email';
  }
  if (nodeId === 'campusgram' || nodeId.startsWith('campusgram-detail-')) {
    return 'campusgram';
  }
  return null;
}

export function createS08ProtectionNetwork(
  source: NetworkSceneSnapshot,
  protectedAccountIds: readonly S06AccountId[],
  riskModel: S08ProtectionRiskModel,
): NetworkSceneSnapshot {
  const protectedAccounts = new Set<S06AccountId>(protectedAccountIds);
  const activeRelationships = activeS08PasswordRelationships(
    riskModel,
    protectedAccountIds,
  ).map((edge): SceneEdge => {
    const referencesOldCampusgramPassword =
      edge.sourceId === 'campusgram' || edge.targetId === 'campusgram';
    const exactReuse = edge.kind === 'identical-reuse';
    return {
      ...edge,
      status: exactReuse ? 'direct' : 'similar',
      label: referencesOldCampusgramPassword
        ? exactReuse
          ? s08NetworkReplayContent.relationLabels.campusgramReuse
          : s08NetworkReplayContent.relationLabels.campusgramSimilar
        : exactReuse
          ? s08NetworkReplayContent.relationLabels.reuse
          : s08NetworkReplayContent.relationLabels.similar,
    };
  });
  const localFindingAccounts = new Set(riskModel.localFindingAccountIds);
  const accountsWithOpenActionNeed = new Set<S06AccountId>(localFindingAccounts);
  for (const { sourceId, targetId } of activeRelationships) {
    if (isS08AccountId(sourceId) && sourceId !== 'campusgram') {
      accountsWithOpenActionNeed.add(sourceId);
    }
    if (isS08AccountId(targetId) && targetId !== 'campusgram') {
      accountsWithOpenActionNeed.add(targetId);
    }
  }
  const accountsReachedFromCampusgram = new Set<S06AccountId>();
  for (const { sourceId, targetId } of activeRelationships) {
    if (sourceId === 'campusgram' && isS08AccountId(targetId)) {
      accountsReachedFromCampusgram.add(targetId);
    }
    if (targetId === 'campusgram' && isS08AccountId(sourceId)) {
      accountsReachedFromCampusgram.add(sourceId);
    }
  }
  const nodes = source.nodes
    .filter(({ kind }) => kind !== 'shield')
    .map((node): SceneNode => {
      const accountId = s08AccountIdForNode(node.id);
      const hasOpenActionNeed =
        accountId !== null &&
        accountId !== 'campusgram' &&
        !protectedAccounts.has(accountId) &&
        accountsWithOpenActionNeed.has(accountId);
      const affectedThroughCampusgram =
        accountId !== null &&
        accountId !== 'campusgram' &&
        !protectedAccounts.has(accountId) &&
        accountsReachedFromCampusgram.has(accountId);
      const hasLocalFinding =
        accountId !== null &&
        accountId !== 'campusgram' &&
        !protectedAccounts.has(accountId) &&
        localFindingAccounts.has(accountId);
      const actionable =
        node.kind === 'account' &&
        accountId !== null &&
        accountId !== 'campusgram' &&
        hasOpenActionNeed;
      return {
        ...node,
        status: affectedThroughCampusgram
          ? 'affected'
          : hasLocalFinding
            ? 'neutral'
            : 'protected',
        selectable: actionable,
        locked: false,
        description: actionable
          ? s08NetworkReplayContent.protectionActionDescription
          : node.description,
      };
    });
  const nodeIds = new Set(nodes.map(({ id }) => id));
  const edges = source.edges
    .filter(
      ({ sourceId, targetId }) =>
        nodeIds.has(sourceId) &&
        nodeIds.has(targetId) &&
        !(isS08AccountId(sourceId) && isS08AccountId(targetId)),
    )
    .map((edge): SceneEdge => ({ ...edge, status: 'neutral', label: null }));
  return {
    ...source,
    id: `${source.id}-s08-protection-${protectedAccountIds.join('-') || 'pending'}`,
    nodes,
    edges: [...edges, ...activeRelationships],
    accessibleSummary:
      (['master-campus', 'campus-email'] as const).every(
        (accountId) =>
          protectedAccounts.has(accountId) || !accountsWithOpenActionNeed.has(accountId),
      )
        ? s08NetworkReplayContent.protectionSummaries.complete
        : s08NetworkReplayContent.protectionSummaries.pending,
  };
}

export function createProtectedS08Network(
  source: NetworkSceneSnapshot,
  phase: S08ProtectedReplayPhase,
): NetworkSceneSnapshot {
  const accountIds = new Set(['master-campus', 'campus-email', 'campusgram']);
  const nodes = source.nodes
    .filter(({ kind }) => kind !== 'shield')
    .map((node): SceneNode => {
      return {
        ...node,
        status: 'protected',
        selectable: false,
        locked: false,
      };
    });
  const nodeIds = new Set(nodes.map(({ id }) => id));
  const localEdges = source.edges
    .filter(
      ({ sourceId, targetId }) =>
        nodeIds.has(sourceId) &&
        nodeIds.has(targetId) &&
        !(accountIds.has(sourceId) && accountIds.has(targetId)),
    )
    .map((edge): SceneEdge => ({ ...edge, status: 'neutral', label: null }));
  return {
    ...source,
    id: `${source.id}-s08-${phase}`,
    nodes,
    edges: localEdges,
    accessibleSummary:
      phase === 'ready'
        ? 'Alle drei fiktiven Konten sind für den erneuten Angriff vorbereitet.'
        : phase === 'attack'
        ? 'Das alte geleakte Passwort wird bei Campusgram erneut ausprobiert und dort blockiert.'
        : 'Campusgram, Master Campus und Campus E-Mail sowie ihre verbundenen Bereiche bleiben geschützt.',
  };
}

/**
 * Authored once as a stable overview layout: the uneven gaps avoid a synthetic grid while
 * retaining a reproducible, collision-free end state around the existing S08 graph.
 */
const s09ExpandedAccountPositions = [
  [0.27, 0.625],
  [0.73, 0.125],
  [0.155, 0.425],
  [0.845, 0.525],
  [0.0975, 0.825],
  [0.5575, 0.0583],
  [0.7875, 0.6583],
  [0.2125, 0.1583],
  [0.9025, 0.2583],
  [0.0688, 0.5583],
  [0.5288, 0.8583],
  [0.2988, 0.0917],
  [0.7588, 0.3917],
  [0.1838, 0.6917],
  [0.8738, 0.7917],
  [0.1263, 0.2917],
  [0.3563, 0.8917],
  [0.8163, 0.0361],
  [0.2413, 0.3361],
  [0.9313, 0.4361],
  [0.0544, 0.7361],
  [0.2844, 0.5361],
  [0.7444, 0.8361],
  [0.1694, 0.0694],
  [0.8594, 0.1694],
  [0.1119, 0.4694],
  [0.8019, 0.5694],
  [0.2269, 0.8694],
  [0.6869, 0.1028],
  [0.9169, 0.7028],
  [0.0831, 0.2028],
  [0.7731, 0.3028],
  [0.1981, 0.6028],
  [0.6581, 0.9028],
  [0.4281, 0.0472],
  [0.8881, 0.3472],
  [0.1406, 0.6472],
  [0.8306, 0.7472],
  [0.2556, 0.2472],
  [0.4856, 0.8472],
  [0.9456, 0.0806],
  [0.0472, 0.3806],
  [0.7372, 0.4806],
  [0.1622, 0.7806],
  [0.8522, 0.8806],
  [0.1047, 0.1139],
  [0.7947, 0.2139],
  [0.2197, 0.5139],
  [0.9097, 0.6139],
  [0.0759, 0.9139],
  [0.3059, 0.3287],
  [0.5934, 0.8287],
  [0.3634, 0.062],
  [0.8234, 0.362],
  [0.2916, 0.862],
  [0.8091, 0.8954],
  [0.2341, 0.0398],
  [0.1478, 0.1731],
  [0.8378, 0.2731],
  [0.4928, 0.1065],
  [0.7911, 0.4509],
  [0.2161, 0.7509],
  [0.9061, 0.8509],
  [0.3023, 0.6843],
  [0.1298, 0.8843],
  [0.9348, 0.3176],
  [0.9492, 0.6435],
  [0.0508, 0.1435],
  [0.7408, 0.2435],
  [0.1658, 0.5435],
  [0.3095, 0.2102],
  [0.252, 0.4546],
  [0.942, 0.5546],
  [0.6168, 0.0929],
  [0.3005, 0.4373],
  [0.7605, 0.7373],
  [0.1855, 0.2373],
  [0.4155, 0.8373],
  [0.8755, 0.0707],
  [0.9546, 0.7522],
  [0.0454, 0.2522],
  [0.1891, 0.9188],
  [0.6491, 0.0336],
  [0.7066, 0.8336],
  [0.0957, 0.3608],
  [0.7309, 0.6386],
  [0.8603, 0.683],
  [0.2565, 0.7312],
  [0.7489, 0.046],
  [0.1739, 0.346],
  [0.8639, 0.446],
  [0.1164, 0.746],
  [0.9214, 0.1793],
  [0.2529, 0.1254],
  [0.7902, 0.8032],
  [0.4452, 0.9032],
  [0.5746, 0.9143],
  [0.9411, 0.9069],
  [0.0643, 0.0513],
  [0.0476, 0.8415],
  [0.0908, 0.6341],
  [0.7826, 0.102],
  [0.2076, 0.402],
  [0.8976, 0.502],
  [0.0701, 0.4629],
  [0.7601, 0.5629],
  [0.7673, 0.9184],
  [0.3953, 0.9197],
  [0.133, 0.0283],
  [0.823, 0.1283],
  [0.1186, 0.5616],
  [0.7248, 0.9214],
  [0.9584, 0.2079],
  [0.6157, 0.9181],
  [0.2572, 0.9243],
  [0.0473, 0.6395],
  [0.2306, 0.6544],
  [0.5201, 0.025],
  [0.326, 0.0287],
  [0.3067, 0.7794],
  [0.4675, 0.037],
  [0.6337, 0.8278],
  [0.9108, 0.0286],
  [0.3194, 0.9228],
  [0.3993, 0.1047],
  [0.7121, 0.0318],
  [0.8299, 0.6308],
  [0.873, 0.5947],
  [0.2715, 0.0253],
  [0.1937, 0.8283],
  [0.73, 0.331],
] as const satisfies readonly (readonly [number, number])[];

const s09SourceNetworkOrigin = { x: 0.5, y: 0.49 } as const;
const s09SourceNetworkCenter = { x: 0.5, y: 0.34 } as const;
const s09SourceNetworkScale = 0.38;
const s09OverviewTop = 0.05;
const s09OverviewHeight = 0.6;

function projectS09SourcePosition(position: SceneNode['position']): SceneNode['position'] {
  return {
    x:
      s09SourceNetworkCenter.x +
      (position.x - s09SourceNetworkOrigin.x) * s09SourceNetworkScale,
    y:
      s09SourceNetworkCenter.y +
      (position.y - s09SourceNetworkOrigin.y) * s09SourceNetworkScale,
  };
}

function createS09AdditionalAccount(
  position: SceneNode['position'],
  index: number,
  removing: boolean,
): SceneNode {
  const accountNumber = index + 1;
  return {
    id: `s09-additional-account-${accountNumber}`,
    kind: 'account',
    symbolId: removing ? 's09-account-swatch-removing' : 's09-account-swatch',
    label: `Weiteres Konto ${accountNumber}`,
    description: 'Ein weiterer beispielhafter Online-Dienst im Alltag.',
    status: 'neutral',
    locked: false,
    position,
    selectable: false,
  };
}

/**
 * Keeps the completed S08 graph intact and adds only anonymous, presentation-only accounts.
 * A lower retained count marks the trailing authored nodes for the 134-to-80 exit animation.
 */
export function createExpandedS09AccountNetwork(
  source: NetworkSceneSnapshot,
  accountCount: number,
  retainedAccountCount = accountCount,
): NetworkSceneSnapshot {
  const existingAccounts = source.nodes.filter(({ kind }) => kind === 'account');
  const additionalAccountCount = Math.max(0, accountCount - existingAccounts.length);
  const retainedAdditionalAccountCount = Math.max(
    0,
    retainedAccountCount - existingAccounts.length,
  );
  const projectedSourceNodes = source.nodes.map(
    (node): SceneNode => ({
      ...node,
      position: projectS09SourcePosition(node.position),
    }),
  );
  const additionalAccounts = s09ExpandedAccountPositions
    .slice(0, additionalAccountCount)
    .map(([x, y], index) =>
      createS09AdditionalAccount(
        { x, y: s09OverviewTop + y * s09OverviewHeight },
        index,
        index >= retainedAdditionalAccountCount,
      ),
    );

  return {
    ...source,
    id: `${source.id}-s09-${accountCount}-accounts`,
    nodes: [...projectedSourceNodes, ...additionalAccounts],
    edges: source.edges,
    accessibleSummary:
      retainedAccountCount === accountCount
        ? `Das bisherige Netzwerk bleibt erhalten und wird auf insgesamt ${accountCount} beispielhafte Konten erweitert.`
        : `Das Netzwerk wird von ${accountCount} auf ${retainedAccountCount} beispielhafte Konten reduziert.`,
  };
}

/**
 * Distributes authored example findings across anonymous scaled accounts without inspecting any
 * participant input. The three protected exercise accounts deliberately remain unmarked.
 */
export function createS09ScalingComparisonResults(
  snapshot: NetworkSceneSnapshot,
  findingShare: number,
): Readonly<Partial<Record<string, PasswordRelation['kind']>>> {
  const findings: Partial<Record<string, PasswordRelation['kind']>> = {};
  const anonymousAccounts = snapshot.nodes.filter(
    ({ id, kind }) => kind === 'account' && id.startsWith('s09-additional-account-'),
  );
  const findingCount = Math.floor(anonymousAccounts.length * findingShare);
  const authoredExampleAccounts = Array.from(
    { length: Math.min(findingCount, anonymousAccounts.length) },
    (_, index) => anonymousAccounts[(23 + index * 37) % anonymousAccounts.length],
  ).filter((account): account is SceneNode => account !== undefined);

  authoredExampleAccounts.forEach((account, index) => {
    findings[account.id] =
      index % 2 === 0 ? 'exact-match' : 'derived-variant-match';
  });

  return findings;
}

export interface S09ScalingRiskNetwork {
  readonly network: NetworkSceneSnapshot;
  readonly edgeRevealDelaysMs: Readonly<Partial<Record<string, number>>>;
  readonly easyToGuessAccountIds: readonly string[];
}

/** Connects every illustrated finding once in the same deterministic reveal order. */
export function createS09ScalingRiskNetwork(
  snapshot: NetworkSceneSnapshot,
  findings: Readonly<Partial<Record<string, PasswordRelation['kind']>>>,
): S09ScalingRiskNetwork {
  const accountIds = Object.keys(findings);
  const unaffectedAccountIds = snapshot.nodes
    .filter(
      ({ id, kind }) =>
        kind === 'account' &&
        id.startsWith('s09-additional-account-') &&
        findings[id] === undefined,
    )
    .map(({ id }) => id);
  const easyToGuessAccountIds = [
    ...accountIds.filter((_, index) => index % 8 === 0).slice(0, 6),
    ...unaffectedAccountIds.filter((_, index) => index % 7 === 0).slice(0, 5),
  ];
  const edgeRevealDelaysMs: Partial<Record<string, number>> = {};
  const riskEdges = accountIds.map((targetId, index): SceneEdge => {
    const sourceId = accountIds[(index + accountIds.length - 1) % accountIds.length];
    const relation = findings[targetId];
    const edgeId = `s09-risk-relation-${index + 1}`;
    edgeRevealDelaysMs[edgeId] = index * 55;
    return {
      id: edgeId,
      sourceId: sourceId ?? targetId,
      targetId,
      kind: relation === 'exact-match' ? 'identical-reuse' : 'similar-pattern',
      status: relation === 'exact-match' ? 'direct' : 'similar',
      label: null,
    };
  });

  return {
    network: {
      ...snapshot,
      id: `${snapshot.id}-risk-relations`,
      nodes: snapshot.nodes.map((node): SceneNode =>
        findings[node.id] === undefined ? node : { ...node, status: 'affected' },
      ),
      edges: [...snapshot.edges, ...riskEdges],
      accessibleSummary: `${snapshot.accessibleSummary} ${accountIds.length} der weißen Kontoknoten tragen beispielhafte Befunde und sind durch rote Risikoverbindungen verbunden. Elf räumlich verteilte weiße und rote Kontoknoten tragen zusätzlich das Schild „Leicht zu erraten“.`,
    },
    edgeRevealDelaysMs,
    easyToGuessAccountIds,
  };
}

export type S13AccountNetworkPhase =
  | 'network'
  | 'revealed'
  | 'shielded'
  | 'connected';

function distanceBetweenNodes(source: SceneNode, target: SceneNode): number {
  return Math.hypot(
    source.position.x - target.position.x,
    source.position.y - target.position.y,
  );
}

function distanceToPosition(
  node: SceneNode,
  position: SceneNode['position'],
): number {
  return Math.hypot(node.position.x - position.x, node.position.y - position.y);
}

/**
 * Replaces anonymous scale accounts with the authored S13 examples. The snapshot contains no
 * participant input or generated password material.
 */
export function createS13MyShopNetwork(
  source: NetworkSceneSnapshot,
  accountLabel: string,
  accountDescription: string,
  existingAccountLabel: string,
  existingAccountDescription: string,
  phase: S13AccountNetworkPhase,
): NetworkSceneSnapshot {
  const campusgramNode = source.nodes.find(({ id }) => id === 'campusgram');
  const myShopPosition = {
    x: campusgramNode?.position.x ?? 0.62,
    y: Math.max(0.18, (campusgramNode?.position.y ?? 0.34) - 0.12),
  };
  const bankRelation = source.edges.find(
    ({ kind, targetId }) =>
      kind === 'identical-reuse' && targetId.startsWith('s09-additional-account-'),
  );
  const bankPlaceholder = source.nodes.find(
    ({ id, kind }) => id === bankRelation?.targetId && kind === 'account',
  );
  const myShopPlaceholder = source.nodes
    .filter(
      ({ id, kind, status }) =>
        kind === 'account' &&
        status === 'neutral' &&
        id.startsWith('s09-additional-account-') &&
        id !== bankPlaceholder?.id,
    )
    .sort(
      (left, right) =>
        distanceToPosition(left, myShopPosition) -
        distanceToPosition(right, myShopPosition),
    )[0];
  const myShopNode: SceneNode = {
    id: 'my-shop',
    kind: 'account',
    symbolId: 'my-shop',
    label: accountLabel,
    description: accountDescription,
    status: phase === 'revealed' ? 'neutral' : 'protected',
    locked: false,
    position: myShopPosition,
    selectable: false,
  };
  const bankNode: SceneNode = {
    id: 'muster-bank',
    kind: 'account',
    symbolId: 'muster-bank',
    label: existingAccountLabel,
    description: existingAccountDescription,
    status: 'affected',
    locked: false,
    position: bankPlaceholder?.position ?? { x: 0.28, y: 0.48 },
    selectable: false,
  };
  const replacedNodes = source.nodes.flatMap((node): SceneNode[] => {
    if (node.id === bankPlaceholder?.id) return [bankNode];
    if (node.id === myShopPlaceholder?.id) {
      return phase === 'network' ? [] : [myShopNode];
    }
    return [node];
  });
  if (bankPlaceholder === undefined) replacedNodes.push(bankNode);
  if (phase !== 'network' && myShopPlaceholder === undefined) replacedNodes.push(myShopNode);

  const replacedEdges = source.edges.flatMap((edge): SceneEdge[] => {
    const touchesBank =
      edge.sourceId === bankPlaceholder?.id || edge.targetId === bankPlaceholder?.id;
    if (touchesBank && edge.id !== bankRelation?.id) return [];
    const touchesMyShopPlaceholder =
      edge.sourceId === myShopPlaceholder?.id || edge.targetId === myShopPlaceholder?.id;
    if (touchesMyShopPlaceholder) return [];
    const sourceId = edge.sourceId === bankPlaceholder?.id ? bankNode.id : edge.sourceId;
    const targetId = edge.targetId === bankPlaceholder?.id ? bankNode.id : edge.targetId;
    return [
      {
        ...edge,
        sourceId,
        targetId,
        ...(touchesBank
          ? {
              kind: 'identical-reuse' as const,
              status: 'direct' as const,
              label: 'dasselbe',
            }
          : {}),
      },
    ];
  });

  if (phase !== 'connected') {
    return {
      ...source,
      id: `${source.id}-s13-${phase}`,
      nodes: replacedNodes,
      edges: replacedEdges,
      accessibleSummary:
        phase === 'network'
          ? `${source.accessibleSummary} Das bestehende Kontonetzwerk ist zurückgekehrt; das neue My-Shop-Konto ist noch nicht eingeblendet.`
          : phase === 'revealed'
            ? `${source.accessibleSummary} Das neu angelegte fiktive My-Shop-Konto ist als eigener Kontoknoten hinzugekommen.`
            : `${source.accessibleSummary} My Shop trägt einen blauen Schutzschild für sein eigenes Passwort.`,
    };
  }

  const sortedProtectionTargets = replacedNodes
    .filter(
      (node) =>
        node.kind === 'account' &&
        node.id !== myShopNode.id,
    )
    .sort(
      (left, right) =>
        distanceBetweenNodes(myShopNode, left) - distanceBetweenNodes(myShopNode, right),
    );
  const nearbyProtectionTargets = sortedProtectionTargets.filter(
    (target) => distanceBetweenNodes(myShopNode, target) <= 0.145,
  );
  const protectionTargets =
    nearbyProtectionTargets.length >= 3
      ? nearbyProtectionTargets
      : sortedProtectionTargets.slice(0, 3);
  const protectionNodes: SceneNode[] = [];
  const protectionEdges: SceneEdge[] = [];
  protectionTargets.forEach((target, index) => {
    const shieldId = `s13-my-shop-protection-${index + 1}-shield`;
    protectionNodes.push({
      id: shieldId,
      kind: 'shield',
      symbolId: 'comparison-path-shield',
      label: 'Eigene Passwörter',
      description:
        'Zwischen My Shop und diesem Konto besteht in der Übung keine problematische Passwortverbindung.',
      status: 'protected',
      position: {
        x: (myShopNode.position.x + target.position.x) / 2,
        y: (myShopNode.position.y + target.position.y) / 2,
      },
      selectable: false,
    });
    protectionEdges.push(
      {
        id: `s13-my-shop-protection-${index + 1}-source`,
        sourceId: myShopNode.id,
        targetId: shieldId,
        kind: 'blocked-path',
        status: 'blocked',
        label: null,
      },
      {
        id: `s13-my-shop-protection-${index + 1}-target`,
        sourceId: target.id,
        targetId: shieldId,
        kind: 'blocked-path',
        status: 'blocked',
        label: null,
      },
    );
  });

  return {
    ...source,
    id: `${source.id}-s13-connected`,
    nodes: [...replacedNodes, ...protectionNodes],
    edges: [...replacedEdges, ...protectionEdges],
    accessibleSummary: `${source.accessibleSummary} My Shop besitzt ein eigenes Passwort, trägt einen blauen Schutzschild und ist durch ${protectionTargets.length} grüne Schildverbindungen von allen Konten in seinem Nahbereich getrennt. Muster Bank bleibt rot markiert und besitzt eine rote Verbindung für dasselbe Passwort.`,
  };
}

/**
 * Replaces Muster Bank's one authored risk relation without rebuilding the surrounding S13
 * network. The result contains only authored account names and no password material.
 */
export function createS13BankProtectedNetwork(
  source: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const finalSummaryBase = source.accessibleSummary.replace(
    ' Muster Bank bleibt rot markiert und besitzt eine rote Verbindung für dasselbe Passwort.',
    '',
  );
  const bankNode = source.nodes.find(({ id }) => id === 'muster-bank');
  const bankRelation = source.edges.find(
    ({ sourceId, targetId, kind }) =>
      (sourceId === 'muster-bank' || targetId === 'muster-bank') &&
      (kind === 'identical-reuse' || kind === 'similar-pattern'),
  );
  const bankPeerId =
    bankRelation?.sourceId === 'muster-bank'
      ? bankRelation.targetId
      : bankRelation?.sourceId;
  const bankPeer = source.nodes.find(({ id }) => id === bankPeerId);
  const nodesWithoutOldBank = source.nodes.map((node): SceneNode =>
    node.id === 'muster-bank' ? { ...node, status: 'protected' } : node,
  );
  const edgesWithoutOldRelation = source.edges.filter(
    ({ id }) => id !== bankRelation?.id,
  );

  if (bankNode === undefined || bankPeer === undefined) {
    return {
      ...source,
      id: `${source.id}-bank-protected`,
      nodes: nodesWithoutOldBank,
      edges: edgesWithoutOldRelation,
      accessibleSummary: `${finalSummaryBase} Muster Bank besitzt jetzt ein eigenes Passwort und trägt einen blauen Schutzschild. Die bisherige rote Passwortbeziehung ist entfernt.`,
    };
  }

  const shieldId = 's13-muster-bank-protection-shield';
  const bankProtectionShield: SceneNode = {
    id: shieldId,
    kind: 'shield',
    symbolId: 'comparison-path-shield',
    label: 'Eigenes Passwort',
    description:
      'Die frühere Passwortverbindung von Muster Bank ist in der Übung entfernt.',
    status: 'protected',
    position: {
      x: (bankNode.position.x + bankPeer.position.x) / 2,
      y: (bankNode.position.y + bankPeer.position.y) / 2,
    },
    selectable: false,
  };
  const bankProtectionEdges: SceneEdge[] = [
    {
      id: 's13-muster-bank-protection-source',
      sourceId: bankNode.id,
      targetId: shieldId,
      kind: 'blocked-path',
      status: 'blocked',
      label: null,
    },
    {
      id: 's13-muster-bank-protection-target',
      sourceId: bankPeer.id,
      targetId: shieldId,
      kind: 'blocked-path',
      status: 'blocked',
      label: null,
    },
  ];

  return {
    ...source,
    id: `${source.id}-bank-protected`,
    nodes: [...nodesWithoutOldBank, bankProtectionShield],
    edges: [...edgesWithoutOldRelation, ...bankProtectionEdges],
    accessibleSummary: `${finalSummaryBase} Muster Bank besitzt jetzt ein eigenes Passwort, trägt einen blauen Schutzschild und ist durch eine grüne Schildverbindung vom früher verbundenen Konto getrennt. Die bisherige rote Passwortbeziehung ist entfernt.`,
  };
}

/**
 * Projects the intermediate bank state after the old relation has disappeared, but before the
 * new green protection path is drawn. This keeps the shield and connection reveals separate.
 */
export function createS13BankShieldedNetwork(
  source: NetworkSceneSnapshot,
): NetworkSceneSnapshot {
  const protectedNetwork = createS13BankProtectedNetwork(source);
  const finalSummaryBase = source.accessibleSummary.replace(
    ' Muster Bank bleibt rot markiert und besitzt eine rote Verbindung für dasselbe Passwort.',
    '',
  );

  return {
    ...protectedNetwork,
    id: `${source.id}-bank-shielded`,
    nodes: protectedNetwork.nodes.filter(
      ({ id }) => id !== 's13-muster-bank-protection-shield',
    ),
    edges: protectedNetwork.edges.filter(
      ({ sourceId, targetId }) =>
        sourceId !== 's13-muster-bank-protection-shield' &&
        targetId !== 's13-muster-bank-protection-shield',
    ),
    accessibleSummary: `${finalSummaryBase} Muster Bank besitzt jetzt ein eigenes Passwort und trägt einen blauen Schutzschild. Die bisherige rote Passwortbeziehung ist entfernt; eine grüne Schutzverbindung ist noch nicht dargestellt.`,
  };
}

export function staticNetworkPresentation(
  snapshot: NetworkSceneSnapshot,
): NetworkPresentationSnapshot {
  return {
    character: { placement: 'bottom-left', pose: 'dock' },
    revealedNodeIds: snapshot.nodes.map(({ id }) => id),
    highlightedNodeId: null,
    emphasis: null,
    announcedMessageId: null,
  };
}
