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
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
      announcement: initialSnapshot.accessibleSummary,
    };
  }

  readonly subscribe = (listener: RendererListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  readonly getSnapshot = (): RendererState => this.#state;

  render(snapshot: NetworkSceneSnapshot): void {
    this.#state = {
      snapshot,
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
  readonly active: boolean;
  readonly interactionDisabled: boolean;
  readonly visualVariant: NetworkVisualVariant;
  readonly nodeSize: 'main' | 'detail';
  readonly onSelect: (nodeId: string) => void;
}

type SceneFlowNode = Node<SceneNodeData, 'scene-node'>;

export type NetworkVisualVariant = 'default' | 'account-map' | 'void';

export interface NetworkCanvasSize {
  readonly width: number;
  readonly height: number;
}

export interface NetworkNodeLayout {
  readonly width: number;
  readonly height: number;
  readonly circleDiameter: number;
}

export interface CircleGeometry {
  readonly centerX: number;
  readonly centerY: number;
  readonly radius: number;
}

export interface CircularEdgePath {
  readonly path: string;
  readonly labelX: number;
  readonly labelY: number;
}

const accountNodeLayout: NetworkNodeLayout = {
  width: 112,
  height: 142,
  circleDiameter: 112,
};
const detailNodeLayout: NetworkNodeLayout = {
  width: 76,
  height: 108,
  circleDiameter: 76,
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function layoutForNode(node: Pick<SceneNode, 'kind'>): NetworkNodeLayout {
  return node.kind === 'account' ? accountNodeLayout : detailNodeLayout;
}

/**
 * Authored positions map to the complete graph canvas. Context and preview cards
 * sit beside the S02 graph, so they cannot overlap deterministic node positions.
 */
export function positionAuthoredNode(
  position: AuthoredPosition,
  layout: NetworkNodeLayout,
  canvas: NetworkCanvasSize,
  _visualVariant: NetworkVisualVariant = 'default',
): { readonly x: number; readonly y: number } {
  const availableWidth = Math.max(0, canvas.width - layout.width);
  const availableHeight = Math.max(0, canvas.height - layout.height);
  return {
    x: Math.round(clamp(position.x, 0, 1) * availableWidth),
    y: Math.round(clamp(position.y, 0, 1) * availableHeight),
  };
}

export function layoutSceneNode(
  node: Pick<SceneNode, 'kind' | 'position'>,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant = 'default',
): Readonly<{ position: { readonly x: number; readonly y: number }; layout: NetworkNodeLayout }> {
  const layout = layoutForNode(node);
  return {
    position: positionAuthoredNode(node.position, layout, canvas, visualVariant),
    layout,
  };
}

function circleForNode(
  position: Readonly<{ x: number; y: number }>,
  layout: NetworkNodeLayout,
): CircleGeometry {
  return {
    centerX: position.x + layout.circleDiameter / 2,
    centerY: position.y + layout.circleDiameter / 2,
    radius: layout.circleDiameter / 2,
  };
}

function boundaryPoint(
  source: CircleGeometry,
  target: CircleGeometry,
): Readonly<{ x: number; y: number }> {
  const deltaX = target.centerX - source.centerX;
  const deltaY = target.centerY - source.centerY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance === 0) return { x: source.centerX, y: source.centerY };
  return {
    x: round(source.centerX + (deltaX / distance) * source.radius),
    y: round(source.centerY + (deltaY / distance) * source.radius),
  };
}

/**
 * A single quadratic curve gives each connection a quiet direction while its
 * endpoints stop at the actual circular node boundary, not at a hidden handle.
 */
export function createCircularEdgePath(
  source: CircleGeometry,
  target: CircleGeometry,
): CircularEdgePath {
  const start = boundaryPoint(source, target);
  const end = boundaryPoint(target, source);
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.hypot(deltaX, deltaY);
  const perpendicularX = distance === 0 ? 0 : -deltaY / distance;
  const perpendicularY = distance === 0 ? 0 : deltaX / distance;
  const direction = deltaX === 0 ? 1 : Math.sign(deltaX);
  const bend = Math.min(42, Math.max(14, distance * 0.12)) * direction;
  const controlX = round((start.x + end.x) / 2 + perpendicularX * bend);
  const controlY = round((start.y + end.y) / 2 + perpendicularY * bend);
  const labelX = round((start.x + 2 * controlX + end.x) / 4);
  const labelY = round((start.y + 2 * controlY + end.y) / 4);

  return {
    path: `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`,
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
    understood: node.kind === 'account' ? 'Verstanden' : 'Vorschau geöffnet',
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
    active,
    interactionDisabled,
    visualVariant,
    nodeSize,
    onSelect,
  } = data;
  const symbolId = resolveNetworkSymbolId(sceneNode);

  return (
    <div
      className={styles.nodeFrame}
      data-active={active}
      data-highlighted={highlighted}
      data-kind={sceneNode.kind}
      data-locked={sceneNode.locked === true}
      data-node-shape="circle"
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
        disabled={interactionDisabled || !sceneNode.selectable || !visible}
        aria-label={`${sceneNode.label}. Status: ${statusLabel(sceneNode)}. ${sceneNode.description}`}
        onClick={() => onSelect(sceneNode.id)}
      >
        <span className={styles.nodeCircle} aria-hidden="true">
          <NetworkSymbol symbolId={symbolId} className={styles.nodeSymbol} />
          <span className={styles.statusMarker}>
            <NetworkStatusMarker
              status={sceneNode.status}
              locked={sceneNode.locked ?? false}
              className={styles.statusSymbol}
            />
          </span>
        </span>
        <span className={styles.nodeLabel}>{sceneNode.label}</span>
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

interface CircleEdgeData extends Record<string, unknown> {
  readonly sourceCircle: CircleGeometry;
  readonly targetCircle: CircleGeometry;
}

type CircleFlowEdge = Edge<CircleEdgeData, 'circle-edge'>;

function CircleEdge({
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
}: EdgeProps<CircleFlowEdge>) {
  if (data === undefined) return null;
  const edge = createCircularEdgePath(data.sourceCircle, data.targetCircle);
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
    <BaseEdge
      id={id}
      path={edge.path}
      labelX={edge.labelX}
      labelY={edge.labelY}
      {...optionalEdgeProps}
    />
  );
}

const edgeTypes = {
  'circle-edge': CircleEdge,
} satisfies EdgeTypes;

const edgeClassByStatus: Record<SceneEdgeStatus, string> = {
  neutral: styles.edgeNeutral ?? '',
  checking: styles.edgeChecking ?? '',
  opened: styles.edgeNeutral ?? '',
  direct: styles.edgeDirect ?? '',
  similar: styles.edgeSimilar ?? '',
  blocked: styles.edgeBlocked ?? '',
  hypothetical: styles.edgeHypothetical ?? '',
};

function toReactFlowElements(
  snapshot: NetworkSceneSnapshot,
  presentation: NetworkPresentationSnapshot,
  onNodeSelect: (nodeId: string) => void,
  interactionDisabled: boolean,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant,
  activeNodeId: string | null,
  showEdgeLabels: boolean,
): { readonly nodes: readonly SceneFlowNode[]; readonly edges: readonly CircleFlowEdge[] } {
  const revealed = new Set(presentation.revealedNodeIds);
  const positionedNodes = snapshot.nodes.map((node) => ({
    node,
    ...layoutSceneNode(node, canvas, visualVariant),
  }));
  const circlesByNodeId = new Map(
    positionedNodes.map(({ node, position, layout }) => [node.id, circleForNode(position, layout)]),
  );

  return {
    nodes: positionedNodes.map(({ node, position, layout }) => ({
      id: node.id,
      type: 'scene-node',
      position,
      data: {
        sceneNode: node,
        visible: revealed.has(node.id),
        highlighted: presentation.highlightedNodeId === node.id,
        active: activeNodeId === node.id,
        interactionDisabled,
        visualVariant,
        nodeSize: node.kind === 'account' ? 'main' : 'detail',
        onSelect: onNodeSelect,
      },
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: activeNodeId === node.id ? 3 : node.kind === 'account' ? 2 : 1,
      style: { width: layout.width, height: layout.height, pointerEvents: 'all' },
    })),
    edges: snapshot.edges.flatMap((edge) => {
      const sourceCircle = circlesByNodeId.get(edge.sourceId);
      const targetCircle = circlesByNodeId.get(edge.targetId);
      if (sourceCircle === undefined || targetCircle === undefined) return [];
      return [
        {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: 'circle-edge',
          ...(showEdgeLabels && edge.label !== null ? { label: edge.label } : {}),
          focusable: false,
          selectable: false,
          animated: false,
          zIndex: 0,
          className: `${styles.edge} ${edgeClassByStatus[edge.status]} edge-status-${edge.status} edge-kind-${edge.kind}`,
          data: { sourceCircle, targetCircle },
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
  readonly showEdgeLabels?: boolean;
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
  showEdgeLabels = true,
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
        presentation,
        onNodeSelect,
        interactionDisabled,
        canvas,
        visualVariant,
        activeNodeId,
        showEdgeLabels,
      ),
    [
      activeNodeId,
      canvas,
      interactionDisabled,
      onNodeSelect,
      presentation,
      rendererState.snapshot,
      showEdgeLabels,
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
    const observer = new ResizeObserver(updateCanvas);
    observer.observe(container);
    updateCanvas();
    return () => observer.disconnect();
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
        visualVariant === 'account-map' || visualVariant === 'void'
          ? `${styles.network} ${styles.accountMapNetwork}`
          : styles.network
      }
      aria-label={ariaLabel}
    >
      {canvas.width > 0 && canvas.height > 0 ? (
        <ReactFlow<SceneFlowNode, CircleFlowEdge>
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
          colorMode={visualVariant === 'void' ? 'dark' : 'light'}
          aria-label={canvasAriaLabel}
          {...(visualVariant === 'account-map' || visualVariant === 'void'
            ? { proOptions: { hideAttribution: true } }
            : {})}
        >
          {visualVariant === 'account-map' || visualVariant === 'void' ? null : (
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
