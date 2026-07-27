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
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from '@xyflow/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import '@xyflow/react/dist/style.css';
import type { NetworkPresentationSnapshot } from './NetworkMotionAdapter.js';
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
  readonly onSelect: (nodeId: string) => void;
}

type SceneFlowNode = Node<SceneNodeData, 'scene-node'>;

export type NetworkVisualVariant = 'default' | 'account-map';

export interface NetworkCanvasSize {
  readonly width: number;
  readonly height: number;
}

export interface NetworkNodeLayout {
  readonly width: number;
  readonly height: number;
}

const defaultNodeLayout: NetworkNodeLayout = { width: 232, height: 93 };
const accountNodeLayout: NetworkNodeLayout = { width: 232, height: 84 };
const detailNodeLayout: NetworkNodeLayout = { width: 204, height: 80 };
const accountMapContextHeight = 152;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function layoutForNode(node: Pick<SceneNode, 'kind'>, visualVariant: NetworkVisualVariant) {
  if (visualVariant !== 'account-map') return defaultNodeLayout;
  return node.kind === 'account' ? accountNodeLayout : detailNodeLayout;
}

/**
 * Positions remain authored and normalized. The renderer only maps them to the
 * space that is currently measurable, reserving the S02 context strip below.
 */
export function positionAuthoredNode(
  position: AuthoredPosition,
  layout: NetworkNodeLayout,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant = 'default',
): { readonly x: number; readonly y: number } {
  const reservedBottom = visualVariant === 'account-map' ? accountMapContextHeight : 0;
  const availableWidth = Math.max(0, canvas.width - layout.width);
  const availableHeight = Math.max(0, canvas.height - reservedBottom - layout.height);
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
  const layout = layoutForNode(node, visualVariant);
  return {
    position: positionAuthoredNode(node.position, layout, canvas, visualVariant),
    layout,
  };
}

function statusLabel(node: SceneNode): string {
  const labels: Record<SceneNode['status'], string> = {
    neutral:
      node.kind === 'account'
        ? 'Noch nicht abgeschlossen'
        : node.kind === 'service' || node.kind === 'function' || node.kind === 'content'
          ? 'Noch nicht angesehen'
          : 'Neutral',
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

function nodeBadge(node: SceneNode, showStatusInBadge: boolean): string {
  if (node.kind === 'shield') return '🛡';
  if (node.kind === 'annotation') return node.status === 'hypothetical' ? '◇' : '≈';
  if (showStatusInBadge && node.status === 'understood') return '✓';
  if (node.status === 'affected') return '!';
  if (node.kind === 'account') return 'ID';
  if (node.kind === 'function') return 'F';
  if (node.kind === 'content') return 'D';
  return '↗';
}

function SceneNodeCard({ data }: NodeProps<SceneFlowNode>) {
  const { sceneNode, visible, highlighted, active, interactionDisabled, visualVariant, onSelect } =
    data;
  const isAccountMap = visualVariant === 'account-map';
  return (
    <div
      className={styles.nodeFrame}
      data-visible={visible}
      data-highlighted={highlighted}
      data-status={sceneNode.status}
      data-kind={sceneNode.kind}
      data-active={active}
      data-variant={visualVariant}
      data-scene-node={sceneNode.id}
    >
      <Handle
        type="target"
        position={isAccountMap ? Position.Top : Position.Left}
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
        <span className={styles.nodeBadge} aria-hidden="true">
          {nodeBadge(sceneNode, !isAccountMap)}
        </span>
        <span className={styles.nodeCopy}>
          <strong>{sceneNode.label}</strong>
          {isAccountMap ? (
            <span className={styles.nodeStatus} aria-hidden="true">
              {sceneNode.status === 'understood' ? '✓' : '○'}
            </span>
          ) : (
            <>
              <small>Status: {statusLabel(sceneNode)}</small>
              <span>{sceneNode.description}</span>
            </>
          )}
        </span>
      </button>
      <Handle
        type="source"
        position={isAccountMap ? Position.Bottom : Position.Right}
        isConnectable={false}
        className={styles.handle}
      />
    </div>
  );
}

const nodeTypes = {
  'scene-node': SceneNodeCard,
};

const edgeClassByStatus: Record<SceneEdgeStatus, string> = {
  neutral: styles.edgeNeutral ?? '',
  checking: styles.edgeChecking ?? '',
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
): { readonly nodes: readonly SceneFlowNode[]; readonly edges: readonly Edge[] } {
  const revealed = new Set(presentation.revealedNodeIds);
  return {
    nodes: snapshot.nodes.map((node) => {
      const { position, layout } = layoutSceneNode(node, canvas, visualVariant);
      return {
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
          onSelect: onNodeSelect,
        },
        draggable: false,
        selectable: false,
        focusable: false,
        zIndex: activeNodeId === node.id ? 2 : node.kind === 'account' ? 1 : 0,
        style: { width: layout.width, height: layout.height, pointerEvents: 'all' },
      };
    }),
    edges: snapshot.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: 'smoothstep',
      ...(showEdgeLabels && edge.label !== null ? { label: edge.label } : {}),
      focusable: false,
      selectable: false,
      animated: false,
      className: `${styles.edge} ${edgeClassByStatus[edge.status]} edge-status-${edge.status} edge-kind-${edge.kind}`,
      data: { status: edge.status },
      ariaLabel: edge.label ?? `${edge.sourceId} mit ${edge.targetId} verbunden`,
    })),
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
        visualVariant === 'account-map'
          ? `${styles.network} ${styles.accountMapNetwork}`
          : styles.network
      }
      aria-label={ariaLabel}
    >
      {canvas.width > 0 && canvas.height > 0 ? (
        <ReactFlow<SceneFlowNode, Edge>
          nodes={[...elements.nodes]}
          edges={[...elements.edges]}
          nodeTypes={nodeTypes}
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
          {...(visualVariant === 'account-map' ? { proOptions: { hideAttribution: true } } : {})}
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
