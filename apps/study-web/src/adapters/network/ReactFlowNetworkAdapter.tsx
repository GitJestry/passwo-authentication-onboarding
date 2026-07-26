import type {
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
  readonly interactionDisabled: boolean;
  readonly onSelect: (nodeId: string) => void;
}

type SceneFlowNode = Node<SceneNodeData, 'scene-node'>;

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

function nodeBadge(node: SceneNode): string {
  if (node.kind === 'shield') return '🛡';
  if (node.kind === 'annotation') return node.status === 'hypothetical' ? '◇' : '≈';
  if (node.status === 'understood') return '✓';
  if (node.status === 'affected') return '!';
  if (node.kind === 'account') return 'ID';
  if (node.kind === 'function') return 'F';
  if (node.kind === 'content') return 'D';
  return '↗';
}

function SceneNodeCard({ data }: NodeProps<SceneFlowNode>) {
  const { sceneNode, visible, highlighted, interactionDisabled, onSelect } = data;
  return (
    <div
      className={styles.nodeFrame}
      data-visible={visible}
      data-highlighted={highlighted}
      data-status={sceneNode.status}
    >
      <Handle
        type="target"
        position={Position.Left}
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
          {nodeBadge(sceneNode)}
        </span>
        <span className={styles.nodeCopy}>
          <strong>{sceneNode.label}</strong>
          <small>Status: {statusLabel(sceneNode)}</small>
          <span>{sceneNode.description}</span>
        </span>
      </button>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className={styles.handle}
      />
    </div>
  );
}

const nodeTypes = {
  'scene-node': SceneNodeCard,
};

const sceneWidth = 720;
const sceneHeight = 320;

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
): { readonly nodes: readonly SceneFlowNode[]; readonly edges: readonly Edge[] } {
  const revealed = new Set(presentation.revealedNodeIds);
  return {
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      type: 'scene-node',
      position: {
        x: node.position.x * sceneWidth,
        y: node.position.y * sceneHeight,
      },
      data: {
        sceneNode: node,
        visible: revealed.has(node.id),
        highlighted: presentation.highlightedNodeId === node.id,
        interactionDisabled,
        onSelect: onNodeSelect,
      },
      draggable: false,
      selectable: false,
      focusable: false,
      style: { pointerEvents: 'all' },
      ariaLabel: `${node.label}. ${node.description}`,
    })),
    edges: snapshot.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: 'smoothstep',
      ...(edge.label === null ? {} : { label: edge.label }),
      focusable: false,
      selectable: false,
      animated: false,
      className: `${styles.edge} ${edgeClassByStatus[edge.status]} edge-status-${edge.status}`,
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
}

export function ReactFlowNetwork({
  adapter,
  presentation,
  onNodeSelect,
  ariaLabel = 'Knotennetz',
  canvasAriaLabel = 'Deterministisch angeordnetes Knotennetz',
  interactionDisabled = false,
}: ReactFlowNetworkProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const rendererState = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  );
  const elements = useMemo(
    () =>
      toReactFlowElements(rendererState.snapshot, presentation, onNodeSelect, interactionDisabled),
    [interactionDisabled, onNodeSelect, presentation, rendererState.snapshot],
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const updateReadiness = () => {
      const ready = container.clientWidth > 0 && container.clientHeight > 0;
      setCanvasReady((current) => (current === ready ? current : ready));
    };
    const observer = new ResizeObserver(updateReadiness);
    observer.observe(container);
    updateReadiness();
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
    <section ref={containerRef} className={styles.network} aria-label={ariaLabel}>
      {canvasReady ? (
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
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        </ReactFlow>
      ) : null}
      <p className={styles.screenReaderOnly} aria-live="polite" aria-atomic="true">
        {rendererState.announcement}
      </p>
    </section>
  );
}
