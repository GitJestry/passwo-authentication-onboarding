import { s02Content } from '@passwo/training-content';
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
