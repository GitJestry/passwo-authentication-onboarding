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

export type S05AssessmentNetworkPhase = 'focus' | 'result' | 'spread';

function belongsToCampusgramCluster(nodeId: string): boolean {
  return nodeId.startsWith('campusgram-');
}

/**
 * Projects the already authored desktop graph into the final S05 explanation.
 * The result remains presentation-only and does not infer relationships between
 * the participant's other fictional passwords.
 */
export function createS05AssessmentNetwork(
  wholePasswordRecognized: boolean,
  phase: S05AssessmentNetworkPhase,
): NetworkSceneSnapshot {
  const base = createCompletedS02Network();
  const showsResult = phase === 'result' || phase === 'spread';
  const showsSpread = phase === 'spread';
  const resultStatus = wholePasswordRecognized ? 'exposed' : 'protected';
  const spreadStatus = wholePasswordRecognized ? 'affected' : 'protected';
  const spreadEdgeStatus = wholePasswordRecognized ? 'direct' : 'blocked';
  const spreadEdgeKind = wholePasswordRecognized ? 'check' : 'blocked-path';
  const nodes = base.nodes.map((node): SceneNode => {
    if (node.id === 'campusgram' && showsResult) {
      return {
        ...node,
        locked: false,
        selectable: false,
        status: resultStatus,
        description: wholePasswordRecognized
          ? 'Das vollständige fiktive Campusgram-Passwort wurde in den simulierten Prüfungen gefunden.'
          : 'Der dargestellte Prüfweg wurde durch den Passwortfaktor blockiert; das ist keine allgemeine Sicherheitsgarantie.',
      };
    }
    if (belongsToCampusgramCluster(node.id) && showsSpread) {
      return {
        ...node,
        locked: false,
        selectable: false,
        status: spreadStatus,
        description: wholePasswordRecognized
          ? 'Dieser Bereich ist direkt mit dem gefundenen Campusgram-Konto verbunden.'
          : 'Ein Schild kennzeichnet hier den Passwortschutz als einen Faktor.',
      };
    }
    return { ...node, locked: false, selectable: false, status: 'neutral' };
  });
  const edges = base.edges.map((edge): SceneEdge =>
    showsSpread && edge.sourceId === 'campusgram'
      ? { ...edge, kind: spreadEdgeKind, status: spreadEdgeStatus }
      : { ...edge, status: 'neutral' },
  );
  return {
    id: `s05-assessment-${phase}-${wholePasswordRecognized ? 'found' : 'protected'}`,
    nodes,
    edges,
    accessibleSummary:
      phase === 'focus'
        ? 'Alle Konten und verbundenen Bereiche sind sichtbar und entsperrt. Campusgram ist für die Auswertung hervorgehoben.'
        : phase === 'result'
          ? wholePasswordRecognized
            ? 'Das vollständige Campusgram-Passwort wurde in der Simulation gefunden. Campusgram ist dunkelrot markiert und wird vom Angreifer verdeckt.'
            : 'Der simulierte Prüfweg zu Campusgram wurde blockiert. Ein Schild markiert den Passwortschutz als einen Faktor.'
          : wholePasswordRecognized
            ? 'Campusgram wurde in der Simulation gefunden. Nur die direkt angebundenen Campusgram-Knoten und Verbindungen werden rot markiert.'
            : 'Der simulierte Prüfweg zu Campusgram wurde blockiert. Schilde und blaue Schutzlinien markieren nur die direkt angebundenen Campusgram-Knoten.',
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
