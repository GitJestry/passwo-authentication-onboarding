import type { S06AccountId } from '@passwo/contracts';
import { s02Content, s08NetworkReplayContent } from '@passwo/training-content';
import type { NetworkSceneSnapshot, SceneEdge, SceneNode } from '@passwo/visualization';
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
  affectedAccountIds: readonly S06AccountId[],
  protectedAccountIds: readonly S06AccountId[],
): NetworkSceneSnapshot {
  const affected = new Set(affectedAccountIds);
  const protectedAccounts = new Set<S06AccountId>(['campusgram', ...protectedAccountIds]);
  const accountIds = new Set(['master-campus', 'campus-email', 'campusgram']);
  const nodes = source.nodes
    .filter(({ kind }) => kind !== 'shield')
    .map((node): SceneNode => {
      const accountId = s08AccountIdForNode(node.id);
      const protectedNode = accountId !== null && protectedAccounts.has(accountId);
      const affectedNode = accountId !== null && affected.has(accountId);
      const actionable = node.kind === 'account' && affectedNode && !protectedNode;
      return {
        ...node,
        status: protectedNode ? 'protected' : affectedNode ? 'affected' : 'neutral',
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
        !(accountIds.has(sourceId) && accountIds.has(targetId)),
    )
    .map((edge): SceneEdge => ({ ...edge, status: 'neutral', label: null }));
  return {
    ...source,
    id: `${source.id}-s08-protection-${protectedAccountIds.join('-') || 'pending'}`,
    nodes,
    edges,
    accessibleSummary:
      affectedAccountIds.length === protectedAccountIds.length
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
