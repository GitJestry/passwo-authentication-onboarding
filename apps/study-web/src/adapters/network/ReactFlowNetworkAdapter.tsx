import type {
  AuthoredPosition,
  NetworkRendererPort,
  NetworkSceneSnapshot,
  SceneEdgeStatus,
  SceneNode,
} from '@passwo/visualization';
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  type Edge,
  type EdgeProps,
  type EdgeTypes,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from '@xyflow/react';
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import '@xyflow/react/dist/style.css';
import type { NetworkPresentationSnapshot } from './NetworkMotionAdapter.js';
import {
  NetworkStatusMarker,
  NetworkSymbol,
  resolveNetworkSymbolId,
} from './NetworkSymbolRegistry.js';
import styles from './ReactFlowNetworkAdapter.module.css';

interface RendererState {
  readonly snapshot: NetworkSceneSnapshot;
  readonly settledInfectionNodeIds: ReadonlySet<string>;
  readonly announcement: string;
}

type FocusHandler = (nodeId: string) => void;
type RendererListener = () => void;

export class ReactFlowNetworkAdapter implements NetworkRendererPort {
  #state: RendererState;
  readonly #listeners = new Set<RendererListener>();
  #focusHandler: FocusHandler | null = null;

  constructor(initialSnapshot: NetworkSceneSnapshot) {
    this.#state = {
      snapshot: initialSnapshot,
      settledInfectionNodeIds: new Set(),
      announcement: initialSnapshot.accessibleSummary,
    };
  }

  readonly subscribe = (listener: RendererListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  readonly getSnapshot = (): RendererState => this.#state;

  readonly completeInfectionCascade = (nodeId: string): void => {
    const node = this.#state.snapshot.nodes.find(({ id }) => id === nodeId);
    if (
      (node?.status !== 'affected' && node?.status !== 'exposed') ||
      this.#state.settledInfectionNodeIds.has(nodeId)
    ) {
      return;
    }
    this.#state = {
      ...this.#state,
      settledInfectionNodeIds: new Set([...this.#state.settledInfectionNodeIds, nodeId]),
    };
    this.#emit();
  };

  render(snapshot: NetworkSceneSnapshot): void {
    const settledInfectionNodeIds =
      snapshot.id === this.#state.snapshot.id
        ? this.#state.settledInfectionNodeIds
        : new Set([
            ...this.#state.settledInfectionNodeIds,
            ...this.#state.snapshot.nodes
              .filter(({ status }) => status === 'affected' || status === 'exposed')
              .map(({ id }) => id),
          ]);
    this.#state = {
      snapshot,
      settledInfectionNodeIds,
      announcement: snapshot.accessibleSummary,
    };
    this.#emit();
  }

  focusNode(nodeId: string): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.#focusHandler?.(nodeId));
    });
  }

  announce(summary: string): void {
    this.#state = { ...this.#state, announcement: summary };
    this.#emit();
  }

  registerFocusHandler(handler: FocusHandler): () => void {
    this.#focusHandler = handler;
    return () => {
      if (this.#focusHandler === handler) this.#focusHandler = null;
    };
  }

  #emit(): void {
    for (const listener of this.#listeners) listener();
  }
}

interface SceneNodeData extends Record<string, unknown> {
  readonly sceneNode: SceneNode;
  readonly visible: boolean;
  readonly highlighted: boolean;
  readonly focused: boolean;
  readonly active: boolean;
  readonly dimmed: boolean;
  readonly interactionDisabled: boolean;
  readonly visualVariant: NetworkVisualVariant;
  readonly compact: boolean;
  readonly nodeSize: 'main' | 'detail';
  readonly nodeShape: NetworkNodeShape;
  readonly showNodeLabels: boolean;
  readonly showStatusMarkers: boolean;
  readonly infectionCascadeStage: InfectionCascadeStage | null;
  readonly onInfectionCascadeEnd: (nodeId: string) => void;
  readonly onSelect: (nodeId: string) => void;
  readonly renderNodeOverlay: ((node: SceneNode) => ReactNode) | undefined;
}

type SceneFlowNode = Node<SceneNodeData, 'scene-node'>;

type InfectionCascadeStage = 'first' | 'second' | 'third' | 'fourth';

const infectionCascadeStages: readonly InfectionCascadeStage[] = [
  'first',
  'second',
  'third',
  'fourth',
];

const infectionCascadeTiming: Readonly<
  Record<InfectionCascadeStage, { readonly durationMs: number; readonly arrivalMs: number }>
> = {
  first: { durationMs: 520, arrivalMs: 1_370 },
  second: { durationMs: 670, arrivalMs: 1_520 },
  third: { durationMs: 820, arrivalMs: 1_670 },
  fourth: { durationMs: 940, arrivalMs: 1_790 },
};

export type NetworkVisualVariant = 'default' | 'account-map';
export type NetworkNodeShape = 'circle' | 'rounded-rectangle';

export interface NetworkCanvasSize {
  readonly width: number;
  readonly height: number;
}

export interface NetworkNodeLayout {
  readonly width: number;
  readonly height: number;
  readonly shapeWidth: number;
  readonly shapeHeight: number;
  readonly shape: NetworkNodeShape;
}

export interface NodeGeometry {
  readonly centerX: number;
  readonly centerY: number;
  readonly width: number;
  readonly height: number;
  readonly shape: NetworkNodeShape;
}

export interface NodeEdgePath {
  readonly path: string;
  readonly labelX: number;
  readonly labelY: number;
}

const accountNodeLayout: NetworkNodeLayout = {
  width: 112,
  height: 142,
  shapeWidth: 112,
  shapeHeight: 112,
  shape: 'circle',
};
const serviceNodeLayout: NetworkNodeLayout = {
  width: 76,
  height: 108,
  shapeWidth: 76,
  shapeHeight: 76,
  shape: 'circle',
};
const connectedDetailNodeLayout: NetworkNodeLayout = {
  width: 104,
  height: 108,
  shapeWidth: 104,
  shapeHeight: 72,
  shape: 'rounded-rectangle',
};
const accountMapAccountNodeLayout: NetworkNodeLayout = {
  width: 102,
  height: 131,
  shapeWidth: 102,
  shapeHeight: 102,
  shape: 'circle',
};
const accountMapServiceNodeLayout: NetworkNodeLayout = {
  width: 74,
  height: 101,
  shapeWidth: 74,
  shapeHeight: 74,
  shape: 'circle',
};
const accountMapDetailNodeLayout: NetworkNodeLayout = {
  width: 93,
  height: 94,
  shapeWidth: 93,
  shapeHeight: 62,
  shape: 'rounded-rectangle',
};
const compactAccountMapAccountNodeLayout: NetworkNodeLayout = {
  width: 87,
  height: 111,
  shapeWidth: 87,
  shapeHeight: 87,
  shape: 'circle',
};
const compactAccountMapServiceNodeLayout: NetworkNodeLayout = {
  width: 63,
  height: 86,
  shapeWidth: 63,
  shapeHeight: 63,
  shape: 'circle',
};
const compactAccountMapDetailNodeLayout: NetworkNodeLayout = {
  width: 79,
  height: 80,
  shapeWidth: 79,
  shapeHeight: 53,
  shape: 'rounded-rectangle',
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function layoutForNode(
  node: Pick<SceneNode, 'kind'>,
  visualVariant: NetworkVisualVariant,
  compact: boolean,
): NetworkNodeLayout {
  if (visualVariant === 'account-map') {
    if (node.kind === 'account') {
      return compact ? compactAccountMapAccountNodeLayout : accountMapAccountNodeLayout;
    }
    if (node.kind === 'function' || node.kind === 'content') {
      return compact ? compactAccountMapDetailNodeLayout : accountMapDetailNodeLayout;
    }
    return compact ? compactAccountMapServiceNodeLayout : accountMapServiceNodeLayout;
  }
  if (node.kind === 'account') return accountNodeLayout;
  return node.kind === 'function' || node.kind === 'content'
    ? connectedDetailNodeLayout
    : serviceNodeLayout;
}

/**
 * Authored positions map to the complete graph canvas. The S02 preview overlay
 * resolves its collision-free position separately from these deterministic nodes.
 */
export function positionAuthoredNode(
  position: AuthoredPosition,
  layout: NetworkNodeLayout,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant = 'default',
): { readonly x: number; readonly y: number } {
  const availableWidth = Math.max(0, canvas.width - layout.width);
  const availableHeight = Math.max(0, canvas.height - layout.height);
  if (visualVariant === 'account-map') {
    return {
      x: Math.round(clamp(position.x * canvas.width - layout.width / 2, 0, availableWidth)),
      y: Math.round(clamp(position.y * canvas.height - layout.height / 2, 0, availableHeight)),
    };
  }
  return {
    x: Math.round(clamp(position.x, 0, 1) * availableWidth),
    y: Math.round(clamp(position.y, 0, 1) * availableHeight),
  };
}

export function layoutSceneNode(
  node: Pick<SceneNode, 'kind' | 'position'>,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant = 'default',
  showNodeLabels = true,
): Readonly<{
  position: { readonly x: number; readonly y: number };
  layout: NetworkNodeLayout;
  compact: boolean;
}> {
  const compact = visualVariant === 'account-map' && canvas.height < 520;
  const authoredLayout = layoutForNode(node, visualVariant, compact);
  const layout = showNodeLabels
    ? authoredLayout
    : { ...authoredLayout, height: authoredLayout.shapeHeight };
  return {
    // Hidden labels must not move the visible node circle away from its authored S02 position.
    position: positionAuthoredNode(node.position, authoredLayout, canvas, visualVariant),
    layout,
    compact,
  };
}

function geometryForNode(
  position: Readonly<{ x: number; y: number }>,
  layout: NetworkNodeLayout,
): NodeGeometry {
  return {
    centerX: position.x + layout.shapeWidth / 2,
    centerY: position.y + layout.shapeHeight / 2,
    width: layout.shapeWidth,
    height: layout.shapeHeight,
    shape: layout.shape,
  };
}

function boundaryPoint(
  source: NodeGeometry,
  target: NodeGeometry,
): Readonly<{ x: number; y: number }> {
  const deltaX = target.centerX - source.centerX;
  const deltaY = target.centerY - source.centerY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance === 0) return { x: source.centerX, y: source.centerY };
  if (source.shape === 'circle') {
    const radius = Math.min(source.width, source.height) / 2;
    return {
      x: round(source.centerX + (deltaX / distance) * radius),
      y: round(source.centerY + (deltaY / distance) * radius),
    };
  }
  const scale =
    1 /
    Math.max(Math.abs(deltaX) / (source.width / 2), Math.abs(deltaY) / (source.height / 2));
  return {
    x: round(source.centerX + deltaX * scale),
    y: round(source.centerY + deltaY * scale),
  };
}

/**
 * Two cubic control points make the authored connections grow as continuous,
 * organic curves while their endpoints stop at the visible node boundary.
 */
export function createNodeEdgePath(
  source: NodeGeometry,
  target: NodeGeometry,
): NodeEdgePath {
  const start = boundaryPoint(source, target);
  const end = boundaryPoint(target, source);
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.hypot(deltaX, deltaY);
  const perpendicularX = distance === 0 ? 0 : -deltaY / distance;
  const perpendicularY = distance === 0 ? 0 : deltaX / distance;
  const direction = deltaX === 0 ? 1 : Math.sign(deltaX);
  const bend = Math.min(42, Math.max(14, distance * 0.12)) * direction;
  const control1X = round(start.x + deltaX * 0.34 + perpendicularX * bend);
  const control1Y = round(start.y + deltaY * 0.34 + perpendicularY * bend);
  const control2X = round(start.x + deltaX * 0.66 + perpendicularX * bend);
  const control2Y = round(start.y + deltaY * 0.66 + perpendicularY * bend);
  const labelX = round((start.x + 3 * control1X + 3 * control2X + end.x) / 8);
  const labelY = round((start.y + 3 * control1Y + 3 * control2Y + end.y) / 8);

  return {
    path: `M ${start.x} ${start.y} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${end.x} ${end.y}`,
    labelX,
    labelY,
  };
}

function statusLabel(node: SceneNode): string {
  if (node.locked === true) return 'Geschlossen';
  const labels: Record<SceneNode['status'], string> = {
    neutral:
      node.kind === 'account'
        ? 'Noch nicht abgeschlossen'
        : node.kind === 'service' || node.kind === 'function' || node.kind === 'content'
          ? 'Noch nicht angesehen'
          : 'Offen',
    viewed: node.kind === 'account' ? 'Angesehen' : 'Vorschau angesehen',
    understood: node.kind === 'account' ? 'Verstanden' : 'Vorschau angesehen',
    retrievable: 'Abrufbar',
    'not-remembered': 'Nicht erinnert',
    exposed: 'Passwort bekannt',
    affected: 'Zugang betroffen',
    protected: 'Angriffsweg blockiert',
    hypothetical: 'Hypothetisch — nicht real',
  };
  return labels[node.status];
}

function SceneNodeCircle({ data }: NodeProps<SceneFlowNode>) {
  const {
    sceneNode,
    visible,
    highlighted,
    focused,
    active,
    dimmed,
    interactionDisabled,
    visualVariant,
    compact,
    nodeSize,
    nodeShape,
    showNodeLabels,
    showStatusMarkers,
    infectionCascadeStage,
    onInfectionCascadeEnd,
    onSelect,
    renderNodeOverlay,
  } = data;
  const symbolId = resolveNetworkSymbolId(sceneNode);
  const lockedAccount = sceneNode.kind === 'account' && sceneNode.locked === true;
  const showStatusMarker =
    showStatusMarkers && !lockedAccount && sceneNode.status !== 'neutral';
  const infectionTiming =
    infectionCascadeStage === null ? null : infectionCascadeTiming[infectionCascadeStage];

  return (
    <div
      className={styles.nodeFrame}
      data-active={active}
      data-compact={compact}
      data-dimmed={dimmed}
      data-focused={focused}
      data-highlighted={highlighted}
      data-kind={sceneNode.kind}
      data-infection-cascade-stage={infectionCascadeStage ?? undefined}
      data-locked={sceneNode.locked === true}
      data-node-shape={nodeShape}
      data-scene-node={sceneNode.id}
      data-size={nodeSize}
      data-status={sceneNode.status}
      data-symbol-id={symbolId}
      data-variant={visualVariant}
      data-visible={visible}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className={styles.handle}
      />
      <button
        type="button"
        className={styles.nodeButton}
        data-scene-node-button={sceneNode.id}
        data-show-node-labels={showNodeLabels}
        disabled={interactionDisabled || !sceneNode.selectable || !visible}
        aria-label={`${sceneNode.label}. Status: ${statusLabel(sceneNode)}. ${sceneNode.description}`}
        onClick={() => onSelect(sceneNode.id)}
      >
        <span
          className={styles.nodeCircle}
          data-scene-node-visual
          aria-hidden="true"
          style={
            infectionTiming === null
              ? undefined
              : { animationDelay: `${infectionTiming.arrivalMs}ms` }
          }
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && infectionCascadeStage !== null) {
              onInfectionCascadeEnd(sceneNode.id);
            }
          }}
        >
          <NetworkSymbol symbolId={symbolId} className={styles.nodeSymbol} />
          {renderNodeOverlay?.(sceneNode)}
          {lockedAccount ? (
            <span className={styles.lockOverlay}>
              <NetworkStatusMarker
                status={sceneNode.status}
                locked
                className={styles.lockSymbol}
              />
            </span>
          ) : null}
          {lockedAccount ? (
            <span className={styles.unlockParticles}>
              <i />
              <i />
              <i />
              <i />
            </span>
          ) : null}
          {showStatusMarker ? (
            <span className={styles.statusMarker}>
              <NetworkStatusMarker
                status={sceneNode.status}
                locked={sceneNode.locked ?? false}
                className={styles.statusSymbol}
              />
            </span>
          ) : null}
        </span>
        {showNodeLabels ? (
          <span className={styles.nodeLabel} data-scene-node-label={sceneNode.id}>
            {sceneNode.label}
          </span>
        ) : null}
      </button>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={styles.handle}
      />
    </div>
  );
}

const nodeTypes = {
  'scene-node': SceneNodeCircle,
};

interface NodeEdgeData extends Record<string, unknown> {
  readonly sourceGeometry: NodeGeometry;
  readonly targetGeometry: NodeGeometry;
  readonly targetNodeId: string;
  readonly visible: boolean;
  readonly drawing: boolean;
  readonly dimmed: boolean;
  readonly infectionCascadeStage: InfectionCascadeStage | null;
  readonly infectionSettled: boolean;
}

type NodeFlowEdge = Edge<NodeEdgeData, 'node-edge'>;

function NodeEdge({
  id,
  data,
  interactionWidth,
  label,
  labelBgBorderRadius,
  labelBgPadding,
  labelBgStyle,
  labelShowBg,
  labelStyle,
  markerEnd,
  markerStart,
  style,
}: EdgeProps<NodeFlowEdge>) {
  if (data === undefined) return null;
  const edge = createNodeEdgePath(data.sourceGeometry, data.targetGeometry);
  const infectionTiming =
    data.infectionCascadeStage === null
      ? null
      : infectionCascadeTiming[data.infectionCascadeStage];
  const infectionThreadStyle =
    infectionTiming === null
      ? undefined
      : {
          animationDelay: `${infectionTiming.arrivalMs - infectionTiming.durationMs}ms`,
          animationDuration: `${infectionTiming.durationMs}ms`,
        };
  const optionalEdgeProps = {
    ...(interactionWidth === undefined ? {} : { interactionWidth }),
    ...(label === undefined ? {} : { label }),
    ...(labelBgBorderRadius === undefined ? {} : { labelBgBorderRadius }),
    ...(labelBgPadding === undefined ? {} : { labelBgPadding }),
    ...(labelBgStyle === undefined ? {} : { labelBgStyle }),
    ...(labelShowBg === undefined ? {} : { labelShowBg }),
    ...(labelStyle === undefined ? {} : { labelStyle }),
    ...(markerEnd === undefined ? {} : { markerEnd }),
    ...(markerStart === undefined ? {} : { markerStart }),
    ...(style === undefined ? {} : { style }),
  };
  return (
    <g
      data-network-edge-target={data.targetNodeId}
      data-network-edge-visible={data.visible || data.drawing}
      data-network-edge-drawing={data.drawing}
      data-network-edge-dimmed={data.dimmed}
      data-network-edge-infection-stage={data.infectionCascadeStage ?? undefined}
      data-network-edge-infection-settled={data.infectionSettled || undefined}
    >
      <BaseEdge
        id={id}
        path={edge.path}
        labelX={edge.labelX}
        labelY={edge.labelY}
        {...optionalEdgeProps}
      />
      {data.infectionCascadeStage === null && !data.infectionSettled ? null : (
        <path
          className={`${styles.infectionThread} ${
            data.infectionSettled ? styles.infectionThreadSettled : ''
          }`}
          d={edge.path}
          pathLength={1}
          aria-hidden="true"
          style={infectionThreadStyle}
        />
      )}
    </g>
  );
}

const edgeTypes = {
  'node-edge': NodeEdge,
} satisfies EdgeTypes;

const edgeClassByStatus: Record<SceneEdgeStatus, string> = {
  neutral: styles.edgeNeutral ?? '',
  checking: styles.edgeChecking ?? '',
  opened: styles.edgeOpened ?? '',
  direct: styles.edgeDirect ?? '',
  similar: styles.edgeSimilar ?? '',
  blocked: styles.edgeBlocked ?? '',
  hypothetical: styles.edgeHypothetical ?? '',
};

function toReactFlowElements(
  snapshot: NetworkSceneSnapshot,
  settledInfectionNodeIds: ReadonlySet<string>,
  presentation: NetworkPresentationSnapshot,
  onNodeSelect: (nodeId: string) => void,
  interactionDisabled: boolean,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant,
  activeNodeId: string | null,
  activePreviewNodeId: string | null,
  showEdgeLabels: boolean,
  showNodeLabels: boolean,
  showStatusMarkers: boolean,
  renderNodeOverlay: ((node: SceneNode) => ReactNode) | undefined,
  dimInactiveNodes: boolean,
  onInfectionCascadeEnd: (nodeId: string) => void,
): { readonly nodes: readonly SceneFlowNode[]; readonly edges: readonly NodeFlowEdge[] } {
  const revealed = new Set(presentation.revealedNodeIds);
  const drawingTargetNodeId = presentation.drawingTargetNodeId ?? null;
  const positionedNodes = snapshot.nodes.map((node) => ({
    node,
    ...layoutSceneNode(node, canvas, visualVariant, showNodeLabels),
  }));
  const geometriesByNodeId = new Map(
    positionedNodes.map(({ node, position, layout }) => [node.id, geometryForNode(position, layout)]),
  );
  const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const infectionStagesByTargetId = new Map<string, InfectionCascadeStage>();
  const settledInfectionTargetIds = new Set<string>();
  const infectionEdgeCountBySourceId = new Map<string, number>();
  // The scene already contains the deterministic affected end state. These stages only
  // stagger how its directly bound detail nodes visually arrive in that state.
  for (const edge of snapshot.edges) {
    const source = nodesById.get(edge.sourceId);
    const target = nodesById.get(edge.targetId);
    if (
      source?.kind !== 'account' ||
      (source.status !== 'exposed' && source.status !== 'affected') ||
      target?.kind === 'account' ||
      (target?.status !== 'affected' && target?.status !== 'exposed')
    ) {
      continue;
    }
    const sourceEdgeIndex = infectionEdgeCountBySourceId.get(edge.sourceId) ?? 0;
    const stage =
      infectionCascadeStages[Math.min(sourceEdgeIndex, infectionCascadeStages.length - 1)];
    if (stage === undefined) continue;
    infectionEdgeCountBySourceId.set(edge.sourceId, sourceEdgeIndex + 1);
    if (target.status === 'exposed' || settledInfectionNodeIds.has(edge.targetId)) {
      settledInfectionTargetIds.add(edge.targetId);
      continue;
    }
    infectionStagesByTargetId.set(edge.targetId, stage);
  }
  const activeAccount = snapshot.nodes.find(({ id }) => id === activeNodeId);
  const choosingAccount = activeAccount === undefined;
  const activeBranchNodeIds = new Set<string>(
    activeNodeId === null
      ? []
      : [
          activeNodeId,
          ...snapshot.edges
            .filter(({ sourceId }) => sourceId === activeNodeId)
            .map(({ targetId }) => targetId),
        ],
  );

  return {
    nodes: positionedNodes.map(({ node, position, layout, compact }) => ({
      id: node.id,
      type: 'scene-node',
      position,
      data: {
        sceneNode: node,
        visible: revealed.has(node.id),
        highlighted: presentation.highlightedNodeId === node.id,
        focused: activePreviewNodeId === node.id,
        active: activeNodeId === node.id,
        dimmed: dimInactiveNodes
          ? choosingAccount
            ? node.kind === 'account'
              ? node.status === 'viewed'
              : true
            : !activeBranchNodeIds.has(node.id)
          : false,
        interactionDisabled,
        visualVariant,
        compact,
        nodeSize: node.kind === 'account' ? 'main' : 'detail',
        nodeShape: layout.shape,
        showNodeLabels,
        showStatusMarkers,
        infectionCascadeStage: infectionStagesByTargetId.get(node.id) ?? null,
        onInfectionCascadeEnd,
        onSelect: onNodeSelect,
        renderNodeOverlay,
      },
      draggable: false,
      selectable: false,
      focusable: false,
      width: layout.width,
      height: layout.height,
      zIndex:
        activePreviewNodeId === node.id ? 4 : activeNodeId === node.id ? 3 : node.kind === 'account' ? 2 : 1,
      style: { pointerEvents: 'all' },
    })),
    edges: snapshot.edges.flatMap((edge) => {
      const sourceGeometry = geometriesByNodeId.get(edge.sourceId);
      const targetGeometry = geometriesByNodeId.get(edge.targetId);
      if (sourceGeometry === undefined || targetGeometry === undefined) return [];
      return [
        {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: 'node-edge',
          ...(showEdgeLabels && edge.label !== null ? { label: edge.label } : {}),
          focusable: false,
          selectable: false,
          animated: false,
          zIndex: 0,
          className: `${styles.edge} ${edgeClassByStatus[edge.status]} edge-status-${edge.status} edge-kind-${edge.kind}`,
          data: {
            sourceGeometry,
            targetGeometry,
            targetNodeId: edge.targetId,
            visible: revealed.has(edge.targetId),
            drawing: drawingTargetNodeId === edge.targetId,
            dimmed: dimInactiveNodes && (choosingAccount || edge.sourceId !== activeNodeId),
            infectionCascadeStage: infectionStagesByTargetId.get(edge.targetId) ?? null,
            infectionSettled: settledInfectionTargetIds.has(edge.targetId),
          },
          ariaLabel: edge.label ?? `${edge.sourceId} mit ${edge.targetId} verbunden`,
        },
      ];
    }),
  };
}

export interface ReactFlowNetworkProps {
  readonly adapter: ReactFlowNetworkAdapter;
  readonly presentation: NetworkPresentationSnapshot;
  readonly onNodeSelect: (nodeId: string) => void;
  readonly ariaLabel?: string;
  readonly canvasAriaLabel?: string;
  readonly interactionDisabled?: boolean;
  readonly visualVariant?: NetworkVisualVariant;
  readonly activeNodeId?: string | null;
  readonly activePreviewNodeId?: string | null;
  readonly showEdgeLabels?: boolean;
  readonly showNodeLabels?: boolean;
  readonly showStatusMarkers?: boolean;
  readonly renderNodeOverlay?: (node: SceneNode) => ReactNode;
  readonly dimInactiveNodes?: boolean;
}

export function ReactFlowNetwork({
  adapter,
  presentation,
  onNodeSelect,
  ariaLabel = 'Knotennetz',
  canvasAriaLabel = 'Deterministisch angeordnetes Knotennetz',
  interactionDisabled = false,
  visualVariant = 'default',
  activeNodeId = null,
  activePreviewNodeId = null,
  showEdgeLabels = true,
  showNodeLabels = true,
  showStatusMarkers = true,
  renderNodeOverlay,
  dimInactiveNodes = true,
}: ReactFlowNetworkProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [canvas, setCanvas] = useState<NetworkCanvasSize>({ width: 0, height: 0 });
  const rendererState = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  );
  const elements = useMemo(
    () =>
      toReactFlowElements(
        rendererState.snapshot,
        rendererState.settledInfectionNodeIds,
        presentation,
        onNodeSelect,
        interactionDisabled,
        canvas,
        visualVariant,
        activeNodeId,
        activePreviewNodeId,
        showEdgeLabels,
        showNodeLabels,
        showStatusMarkers,
        renderNodeOverlay,
        dimInactiveNodes,
        adapter.completeInfectionCascade,
      ),
    [
      activeNodeId,
      activePreviewNodeId,
      adapter,
      canvas,
      interactionDisabled,
      onNodeSelect,
      presentation,
      rendererState.settledInfectionNodeIds,
      rendererState.snapshot,
      showEdgeLabels,
      showNodeLabels,
      showStatusMarkers,
      renderNodeOverlay,
      dimInactiveNodes,
      visualVariant,
    ],
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const updateCanvas = () => {
      const nextCanvas = { width: container.clientWidth, height: container.clientHeight };
      setCanvas((current) =>
        current.width === nextCanvas.width && current.height === nextCanvas.height
          ? current
          : nextCanvas,
      );
    };
    let frame: number | null = null;
    const scheduleCanvasUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updateCanvas();
      });
    };
    const observer = new ResizeObserver(scheduleCanvasUpdate);
    observer.observe(container);
    updateCanvas();
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(
    () =>
      adapter.registerFocusHandler((nodeId) => {
        containerRef.current
          ?.querySelector<HTMLButtonElement>(`[data-scene-node-button="${nodeId}"]`)
          ?.focus();
      }),
    [adapter],
  );

  return (
    <section
      ref={containerRef}
      className={
        visualVariant === 'account-map' ? `${styles.network} ${styles.accountMapNetwork}` : styles.network
      }
      aria-label={ariaLabel}
    >
      {canvas.width > 0 && canvas.height > 0 ? (
        <ReactFlow<SceneFlowNode, NodeFlowEdge>
          nodes={[...elements.nodes]}
          edges={[...elements.edges]}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          colorMode="light"
          aria-label={canvasAriaLabel}
          {...(visualVariant === 'account-map'
            ? { proOptions: { hideAttribution: true } }
            : {})}
        >
          {visualVariant === 'account-map' ? null : (
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          )}
        </ReactFlow>
      ) : null}
      <p className={styles.screenReaderOnly} aria-live="polite" aria-atomic="true">
        {rendererState.announcement}
      </p>
    </section>
  );
}
