import type {
  AuthoredPosition,
  NetworkRendererPort,
  NetworkSceneSnapshot,
  SceneEdge,
  SceneEdgeStatus,
  SceneNode,
} from '@passwo/visualization';
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
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
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import '@xyflow/react/dist/style.css';
import samePasswordAsset from '../../assets/password-relations/same.png';
import similarPasswordAsset from '../../assets/password-relations/similar.png';
import type { NetworkPresentationSnapshot } from './NetworkMotionAdapter.js';
import {
  NetworkStatusMarker,
  NetworkSymbol,
  resolveNetworkSymbolId,
} from './NetworkSymbolRegistry.js';
import styles from './ReactFlowNetworkAdapter.module.css';

type StatusCascadeTone = 'danger' | 'protection';

function statusCascadeToneForNode(node: SceneNode | undefined): StatusCascadeTone | null {
  if (node?.kind === 'shield') return null;
  return node?.status === 'affected' || node?.status === 'exposed'
    ? 'danger'
    : node?.status === 'protected'
      ? 'protection'
      : null;
}

function statusCascadeToneEntryForNode(
  node: SceneNode,
): readonly [string, StatusCascadeTone][] {
  const tone = statusCascadeToneForNode(node);
  return tone === null ? [] : [[node.id, tone]];
}

function statusCascadeToneForEdgeNodes(
  edge: SceneEdge,
  source: SceneNode | undefined,
  target: SceneNode | undefined,
): StatusCascadeTone | null {
  if (source?.kind !== 'account' || target === undefined) return null;
  const reachesAccountThroughAttack =
    target.kind === 'account' &&
    (edge.kind === 'identical-reuse' || edge.kind === 'similar-pattern');
  if (target.kind === 'account' && !reachesAccountThroughAttack) return null;
  const sourceTone = statusCascadeToneForNode(source);
  return sourceTone !== null && statusCascadeToneForNode(target) === sourceTone
    ? sourceTone
    : null;
}

interface RendererState {
  readonly snapshot: NetworkSceneSnapshot;
  readonly settledStatusCascadeTonesByNodeId: ReadonlyMap<string, StatusCascadeTone>;
  readonly announcement: string;
}

type FocusHandler = (nodeId: string) => void;
type RendererListener = () => void;
type StatusCascadeListener = (settledNodeIds: readonly string[]) => void;
const emptyEdgeRevealDelaysMs: Readonly<Partial<Record<string, number>>> = {};

export class ReactFlowNetworkAdapter implements NetworkRendererPort {
  #state: RendererState;
  readonly #listeners = new Set<RendererListener>();
  readonly #statusCascadeListeners = new Set<StatusCascadeListener>();
  #unpublishedStatusCascadeTonesByNodeId = new Map<string, StatusCascadeTone>();
  #focusHandler: FocusHandler | null = null;

  constructor(initialSnapshot: NetworkSceneSnapshot) {
    this.#state = {
      snapshot: initialSnapshot,
      settledStatusCascadeTonesByNodeId: new Map(),
      announcement: initialSnapshot.accessibleSummary,
    };
  }

  readonly subscribe = (listener: RendererListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  readonly getSnapshot = (): RendererState => this.#state;

  readonly subscribeStatusCascade = (
    listener: StatusCascadeListener,
  ): (() => void) => {
    this.#statusCascadeListeners.add(listener);
    return () => this.#statusCascadeListeners.delete(listener);
  };

  readonly completeStatusCascade = (
    nodeId: string,
    expectedTone?: StatusCascadeTone,
  ): void => {
    const node = this.#state.snapshot.nodes.find(({ id }) => id === nodeId);
    const tone = statusCascadeToneForNode(node);
    if (
      tone === null ||
      (expectedTone !== undefined && tone !== expectedTone) ||
      this.#state.settledStatusCascadeTonesByNodeId.get(nodeId) === tone ||
      this.#unpublishedStatusCascadeTonesByNodeId.get(nodeId) === tone
    ) {
      return;
    }
    this.#unpublishedStatusCascadeTonesByNodeId.set(nodeId, tone);
    const settledStatusCascadeTonesByNodeId = new Map(
      this.#state.settledStatusCascadeTonesByNodeId,
    );
    settledStatusCascadeTonesByNodeId.set(nodeId, tone);
    this.#state = {
      ...this.#state,
      settledStatusCascadeTonesByNodeId,
    };
    const nodesById = new Map(
      this.#state.snapshot.nodes.map((sceneNode) => [sceneNode.id, sceneNode]),
    );
    const hasRunningCascade = this.#state.snapshot.edges.some((edge) => {
      const target = nodesById.get(edge.targetId);
      const edgeTone = statusCascadeToneForEdgeNodes(
        edge,
        nodesById.get(edge.sourceId),
        target,
      );
      return (
        edgeTone !== null &&
        this.#state.settledStatusCascadeTonesByNodeId.get(edge.targetId) !== edgeTone &&
        this.#unpublishedStatusCascadeTonesByNodeId.get(edge.targetId) !== edgeTone
      );
    });
    if (hasRunningCascade) return;

    // Persist completion without emitting a renderer update. The finished CSS frame stays
    // mounted, while a later PassWo-only render already sees the cascade as settled.
    const settledNodeIds = [...this.#unpublishedStatusCascadeTonesByNodeId.keys()];
    this.#unpublishedStatusCascadeTonesByNodeId.clear();
    this.#notifyStatusCascade(settledNodeIds);
  };

  render(snapshot: NetworkSceneSnapshot): void {
    const currentStatusCascadeTonesByNodeId = new Map(
      snapshot.nodes.flatMap(statusCascadeToneEntryForNode),
    );
    const retainsCurrentTone = ([nodeId, tone]: readonly [string, StatusCascadeTone]) =>
      currentStatusCascadeTonesByNodeId.get(nodeId) === tone;
    const settledStatusCascadeTonesByNodeId = new Map<string, StatusCascadeTone>([
      ...[...this.#state.settledStatusCascadeTonesByNodeId].filter(retainsCurrentTone),
      ...[...this.#unpublishedStatusCascadeTonesByNodeId].filter(retainsCurrentTone),
    ]);
    // Only cascades that actually reported completion may become settled. A following scene
    // render can add the next attack path while an existing takeover keeps animating.
    this.#unpublishedStatusCascadeTonesByNodeId.clear();
    this.#state = {
      snapshot,
      settledStatusCascadeTonesByNodeId,
      announcement: snapshot.accessibleSummary,
    };
    this.#emit();
    this.#notifyStatusCascade([...settledStatusCascadeTonesByNodeId.keys()]);
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

  #notifyStatusCascade(settledNodeIds: readonly string[]): void {
    for (const listener of this.#statusCascadeListeners) listener(settledNodeIds);
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
  readonly visualDensity: NetworkVisualDensity;
  readonly compact: boolean;
  readonly nodeSize: 'main' | 'detail';
  readonly nodeShape: NetworkNodeShape;
  readonly showNodeLabels: boolean;
  readonly showStatusMarkers: boolean;
  readonly statusCascadeTiming: StatusCascadeTiming | null;
  readonly statusCascadeTone: StatusCascadeTone | null;
  readonly statusCascadeSettled: boolean;
  readonly onStatusCascadeEnd: (
    nodeId: string,
    tone: StatusCascadeTone,
  ) => void;
  readonly onSelect: (nodeId: string) => void;
  readonly renderNodeOverlay: ((node: SceneNode) => ReactNode) | undefined;
}

type SceneFlowNode = Node<SceneNodeData, 'scene-node'>;

interface StatusCascadeTiming {
  readonly durationMs: number;
  readonly arrivalMs: number;
}

const defaultStatusCascadeStartDelayMs = 850;
const statusCascadeSpeedPxPerMs = 0.475 * 1.25;

interface SceneNodeStyle extends CSSProperties {
  readonly '--network-status-cascade-arrival-delay'?: string;
  readonly '--s09-account-sequence-delay'?: string;
}

export type NetworkVisualVariant = 'default' | 'account-map';
export type NetworkVisualDensity = 'default' | 'overview';
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
  readonly length: number;
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
const overviewAccountNodeLayout: NetworkNodeLayout = {
  width: 42,
  height: 42,
  shapeWidth: 42,
  shapeHeight: 42,
  shape: 'circle',
};
const overviewServiceNodeLayout: NetworkNodeLayout = {
  width: 28,
  height: 28,
  shapeWidth: 28,
  shapeHeight: 28,
  shape: 'circle',
};
const overviewDetailNodeLayout: NetworkNodeLayout = {
  width: 34,
  height: 24,
  shapeWidth: 34,
  shapeHeight: 24,
  shape: 'rounded-rectangle',
};
const overviewAnnotationNodeLayout: NetworkNodeLayout = {
  width: 8,
  height: 8,
  shapeWidth: 8,
  shapeHeight: 8,
  shape: 'circle',
};
const compactOverviewAccountNodeLayout: NetworkNodeLayout = {
  width: 28,
  height: 28,
  shapeWidth: 28,
  shapeHeight: 28,
  shape: 'circle',
};
const compactOverviewServiceNodeLayout: NetworkNodeLayout = {
  width: 20,
  height: 20,
  shapeWidth: 20,
  shapeHeight: 20,
  shape: 'circle',
};
const compactOverviewDetailNodeLayout: NetworkNodeLayout = {
  width: 24,
  height: 17,
  shapeWidth: 24,
  shapeHeight: 17,
  shape: 'rounded-rectangle',
};
const compactOverviewAnnotationNodeLayout: NetworkNodeLayout = {
  width: 5,
  height: 5,
  shapeWidth: 5,
  shapeHeight: 5,
  shape: 'circle',
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
  visualDensity: NetworkVisualDensity,
  compact: boolean,
): NetworkNodeLayout {
  if (visualDensity === 'overview') {
    if (node.kind === 'annotation') {
      return compact
        ? compactOverviewAnnotationNodeLayout
        : overviewAnnotationNodeLayout;
    }
    if (node.kind === 'account') {
      return compact ? compactOverviewAccountNodeLayout : overviewAccountNodeLayout;
    }
    if (node.kind === 'function' || node.kind === 'content') {
      return compact ? compactOverviewDetailNodeLayout : overviewDetailNodeLayout;
    }
    return compact ? compactOverviewServiceNodeLayout : overviewServiceNodeLayout;
  }
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
  visualDensity: NetworkVisualDensity = 'default',
): Readonly<{
  position: { readonly x: number; readonly y: number };
  layout: NetworkNodeLayout;
  compact: boolean;
}> {
  const compact =
    visualVariant === 'account-map' &&
    (canvas.height < 520 || (visualDensity === 'overview' && canvas.width < 760));
  const authoredLayout = layoutForNode(node, visualVariant, visualDensity, compact);
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
  let length = 0;
  let previousX = start.x;
  let previousY = start.y;
  for (let step = 1; step <= 12; step += 1) {
    const progress = step / 12;
    const inverseProgress = 1 - progress;
    const pointX =
      inverseProgress ** 3 * start.x +
      3 * inverseProgress ** 2 * progress * control1X +
      3 * inverseProgress * progress ** 2 * control2X +
      progress ** 3 * end.x;
    const pointY =
      inverseProgress ** 3 * start.y +
      3 * inverseProgress ** 2 * progress * control1Y +
      3 * inverseProgress * progress ** 2 * control2Y +
      progress ** 3 * end.y;
    length += Math.hypot(pointX - previousX, pointY - previousY);
    previousX = pointX;
    previousY = pointY;
  }

  return {
    path: `M ${start.x} ${start.y} C ${control1X} ${control1Y} ${control2X} ${control2Y} ${end.x} ${end.y}`,
    labelX,
    labelY,
    length: round(length),
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
    visualDensity,
    compact,
    nodeSize,
    nodeShape,
    showNodeLabels,
    showStatusMarkers,
    statusCascadeTiming,
    statusCascadeTone,
    statusCascadeSettled,
    onStatusCascadeEnd,
    onSelect,
    renderNodeOverlay,
  } = data;
  const symbolId = resolveNetworkSymbolId(sceneNode);
  const lockedAccount = sceneNode.kind === 'account' && sceneNode.locked === true;
  const showStatusMarker =
    showStatusMarkers && !lockedAccount && sceneNode.status !== 'neutral';
  const additionalAccountMatch = sceneNode.id.match(
    /^s09-additional-account-(\d+)(?:-detail-(\d+))?$/,
  );
  const additionalAccountStyle =
    additionalAccountMatch === null
      ? null
      : {
          sequenceDelay: `${Number(additionalAccountMatch[1]) * 8}ms`,
        };
  const sceneNodeStyle: SceneNodeStyle | undefined =
    statusCascadeTiming === null && additionalAccountStyle === null
      ? undefined
      : {
          ...(statusCascadeTiming === null
            ? {}
            : {
                '--network-status-cascade-arrival-delay': `${statusCascadeTiming.arrivalMs}ms`,
              }),
          ...(additionalAccountStyle === null
            ? {}
            : {
                '--s09-account-sequence-delay': additionalAccountStyle.sequenceDelay,
              }),
        };

  return (
    <div
      className={styles.nodeFrame}
      data-active={active}
      data-compact={compact}
      data-dimmed={dimmed}
      data-focused={focused}
      data-highlighted={highlighted}
      data-kind={sceneNode.kind}
      data-status-cascade-active={
        statusCascadeTiming !== null && !statusCascadeSettled ? true : undefined
      }
      data-status-cascade-tone={statusCascadeTone ?? undefined}
      data-status-cascade-settled={statusCascadeSettled || undefined}
      data-locked={sceneNode.locked === true}
      data-node-shape={nodeShape}
      data-scene-node={sceneNode.id}
      data-size={nodeSize}
      data-status={sceneNode.status}
      data-symbol-id={symbolId}
      data-visual-density={visualDensity}
      data-variant={visualVariant}
      data-visible={visible}
      style={sceneNodeStyle}
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
          key={`${sceneNode.id}-${statusCascadeTone ?? 'neutral'}`}
          className={styles.nodeCircle}
          data-scene-node-visual
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              statusCascadeTiming !== null &&
              statusCascadeTone !== null &&
              !statusCascadeSettled
            ) {
              onStatusCascadeEnd(sceneNode.id, statusCascadeTone);
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
  readonly sourceNodeId: string;
  readonly sourceGeometry: NodeGeometry;
  readonly targetGeometry: NodeGeometry;
  readonly targetNodeId: string;
  readonly visible: boolean;
  readonly drawing: boolean;
  readonly drawn: boolean;
  readonly attackPath: boolean;
  readonly riskRelation: boolean;
  readonly riskRelationKind: 'same' | 'similar' | null;
  readonly currentAttackPath: boolean;
  readonly dimmed: boolean;
  readonly statusCascadeTiming: StatusCascadeTiming | null;
  readonly statusCascadeTone: StatusCascadeTone | null;
  readonly statusCascadeSettled: boolean;
  readonly revealDelayMs: number | null;
  readonly animateReveal: boolean;
}

type NodeFlowEdge = Edge<NodeEdgeData, 'node-edge'>;

type ReactFlowPresentation = Pick<
  NetworkPresentationSnapshot,
  | 'revealedNodeIds'
  | 'drawnEdgeTargetNodeIds'
  | 'drawingTargetNodeId'
  | 'drawingTargetNodeIds'
  | 'highlightedNodeId'
>;

function sameNodeIds(
  left: readonly string[] | undefined,
  right: readonly string[] | undefined,
): boolean {
  const leftIds = left ?? [];
  const rightIds = right ?? [];
  return (
    leftIds.length === rightIds.length &&
    leftIds.every((id, index) => id === rightIds[index])
  );
}

function sameReactFlowPresentation(
  left: ReactFlowPresentation,
  right: ReactFlowPresentation,
): boolean {
  return (
    sameNodeIds(left.revealedNodeIds, right.revealedNodeIds) &&
    sameNodeIds(left.drawnEdgeTargetNodeIds, right.drawnEdgeTargetNodeIds) &&
    (left.drawingTargetNodeId ?? null) === (right.drawingTargetNodeId ?? null) &&
    sameNodeIds(left.drawingTargetNodeIds, right.drawingTargetNodeIds) &&
    left.highlightedNodeId === right.highlightedNodeId
  );
}

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
  const relationLabel =
    data.riskRelationKind === null || typeof label !== 'string' ? null : label;
  const statusCascadeMaskStyle =
    data.statusCascadeTiming === null
      ? undefined
      : {
          animationDelay: `${data.statusCascadeTiming.arrivalMs - data.statusCascadeTiming.durationMs}ms`,
          animationDuration: `${data.statusCascadeTiming.durationMs}ms`,
        };
  const optionalEdgeProps = {
    ...(interactionWidth === undefined ? {} : { interactionWidth }),
    ...(label === undefined || relationLabel !== null ? {} : { label }),
    ...(labelBgBorderRadius === undefined ? {} : { labelBgBorderRadius }),
    ...(labelBgPadding === undefined ? {} : { labelBgPadding }),
    ...(labelBgStyle === undefined ? {} : { labelBgStyle }),
    ...(labelShowBg === undefined ? {} : { labelShowBg }),
    ...(labelStyle === undefined ? {} : { labelStyle }),
    ...(markerEnd === undefined ? {} : { markerEnd }),
    ...(markerStart === undefined ? {} : { markerStart }),
    ...(style === undefined && !data.animateReveal
      ? {}
      : {
          style: {
            ...style,
            ...(!data.animateReveal || data.revealDelayMs === null
              ? {}
              : { animationDelay: `${data.revealDelayMs}ms` }),
          },
        }),
  };
  const drawsAttackPath = data.attackPath && data.drawing;
  const attackDrawMaskId = `${id}-attack-draw-mask`;
  const maskPadding = 56;
  const maskLeft =
    Math.min(data.sourceGeometry.centerX, data.targetGeometry.centerX) - maskPadding;
  const maskTop =
    Math.min(data.sourceGeometry.centerY, data.targetGeometry.centerY) - maskPadding;
  const maskWidth =
    Math.abs(data.targetGeometry.centerX - data.sourceGeometry.centerX) + maskPadding * 2;
  const maskHeight =
    Math.abs(data.targetGeometry.centerY - data.sourceGeometry.centerY) + maskPadding * 2;
  return (
    <g
      data-network-edge-source={data.sourceNodeId}
      data-network-edge-target={data.targetNodeId}
      data-network-edge-visible={data.visible || data.drawing}
      data-network-edge-drawing={data.drawing}
      data-network-edge-attack-drawing={drawsAttackPath || undefined}
      data-network-edge-current-attack={data.currentAttackPath || undefined}
      data-network-edge-attack-drawn={
        data.attackPath && data.drawn ? true : undefined
      }
      data-network-edge-risk-relation={data.riskRelation || undefined}
      data-network-edge-relation-kind={data.riskRelationKind ?? undefined}
      data-network-edge-dimmed={data.dimmed}
      data-network-edge-status-cascade-active={
        data.statusCascadeTiming !== null && !data.statusCascadeSettled ? true : undefined
      }
      data-network-edge-status-cascade-tone={data.statusCascadeTone ?? undefined}
      data-network-edge-status-cascade-settled={data.statusCascadeSettled || undefined}
      data-network-edge-compact={data.revealDelayMs === null ? undefined : true}
      data-network-edge-sequential-reveal={data.animateReveal || undefined}
    >
      <BaseEdge
        id={id}
        path={edge.path}
        labelX={edge.labelX}
        labelY={edge.labelY}
        {...optionalEdgeProps}
      />
      {relationLabel === null ? null : (
        <EdgeLabelRenderer>
          <div
            className={styles.passwordRelationMarker}
            data-password-relation-marker
            data-password-relation-kind={data.riskRelationKind}
            style={{
              transform: `translate(-50%, -50%) translate(${edge.labelX}px, ${edge.labelY}px)`,
            }}
            aria-hidden="true"
          >
            <span
              className={styles.passwordRelationMarkerLabel}
              data-password-relation-label
            >
              {relationLabel}
            </span>
            <img
              className={styles.passwordRelationMarkerImage}
              src={data.riskRelationKind === 'same' ? samePasswordAsset : similarPasswordAsset}
              width={22}
              height={22}
              alt=""
            />
          </div>
        </EdgeLabelRenderer>
      )}
      {data.riskRelation ? (
        <g
          data-network-edge-break-effect
          transform={`translate(${edge.labelX} ${edge.labelY})`}
          aria-hidden="true"
        >
          <path
            data-network-edge-break-impact
            d="M -8 0 H 8 M 0 -8 V 8 M -5.5 -5.5 L 5.5 5.5 M 5.5 -5.5 L -5.5 5.5"
          />
          <circle data-network-edge-smoke-puff="1" cx="-8" cy="1" r="4.6" />
          <circle data-network-edge-smoke-puff="2" cx="-4" cy="-5" r="5.2" />
          <circle data-network-edge-smoke-puff="3" cx="2" cy="-7" r="4.8" />
          <circle data-network-edge-smoke-puff="4" cx="7" cy="-2" r="5.4" />
          <circle data-network-edge-smoke-puff="5" cx="5" cy="5" r="4.2" />
          <circle data-network-edge-smoke-puff="6" cx="-3" cy="6" r="5" />
          <circle data-network-edge-smoke-puff="7" cx="0" cy="0" r="5.8" />
        </g>
      ) : null}
      {drawsAttackPath ? (
        <>
          <defs>
            <mask
              id={attackDrawMaskId}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x={maskLeft}
              y={maskTop}
              width={maskWidth}
              height={maskHeight}
            >
              <rect
                x={maskLeft}
                y={maskTop}
                width={maskWidth}
                height={maskHeight}
                fill="black"
              />
              <path
                data-network-edge-draw-mask
                d={edge.path}
                fill="none"
                opacity={0}
                pathLength={1}
                stroke="white"
                strokeWidth={14}
              />
            </mask>
          </defs>
          <path
            className={styles.attackEdgeDraw}
            data-network-attack-draw-thread
            d={edge.path}
            fill="none"
            mask={`url(#${attackDrawMaskId})`}
            aria-hidden="true"
          />
        </>
      ) : null}
      {data.statusCascadeTone === null ? null : (
        <>
          <defs>
            <mask
              id={`${id}-status-cascade-mask`}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x={maskLeft}
              y={maskTop}
              width={maskWidth}
              height={maskHeight}
            >
              <path
                className={`${styles.statusCascadeMask} ${
                  data.statusCascadeSettled ? styles.statusCascadeMaskSettled : ''
                }`}
                d={edge.path}
                pathLength={1}
                stroke="white"
                strokeWidth={14}
                style={statusCascadeMaskStyle}
              />
            </mask>
          </defs>
          <path
            className={styles.statusCascadeThread}
            data-status-cascade-tone={data.statusCascadeTone}
            d={edge.path}
            mask={`url(#${id}-status-cascade-mask)`}
            aria-hidden="true"
          />
        </>
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
  settledStatusCascadeTonesByNodeId: ReadonlyMap<string, StatusCascadeTone>,
  presentation: ReactFlowPresentation,
  onNodeSelect: (nodeId: string) => void,
  interactionDisabled: boolean,
  canvas: NetworkCanvasSize,
  visualVariant: NetworkVisualVariant,
  visualDensity: NetworkVisualDensity,
  activeNodeId: string | null,
  activePreviewNodeId: string | null,
  showEdgeLabels: boolean,
  showNodeLabels: boolean,
  showStatusMarkers: boolean,
  renderNodeOverlay: ((node: SceneNode) => ReactNode) | undefined,
  dimInactiveNodes: boolean,
  currentAttackEdgeId: string | null,
  statusCascadeStartDelayMs: number,
  edgeRevealDelaysMs: Readonly<Partial<Record<string, number>>>,
  animateEdgeReveals: boolean,
  onStatusCascadeEnd: (
    nodeId: string,
    tone: StatusCascadeTone,
  ) => void,
): { readonly nodes: readonly SceneFlowNode[]; readonly edges: readonly NodeFlowEdge[] } {
  const revealed = new Set(presentation.revealedNodeIds);
  const drawnEdgeTargetNodeIds = new Set(presentation.drawnEdgeTargetNodeIds ?? []);
  const drawingTargetNodeId = presentation.drawingTargetNodeId ?? null;
  const drawingTargetNodeIds = new Set([
    ...(presentation.drawingTargetNodeIds ?? []),
    ...(drawingTargetNodeId === null ? [] : [drawingTargetNodeId]),
  ]);
  const positionedNodes = snapshot.nodes.map((node) => ({
    node,
    ...layoutSceneNode(node, canvas, visualVariant, showNodeLabels, visualDensity),
  }));
  const geometriesByNodeId = new Map(
    positionedNodes.map(({ node, position, layout }) => [node.id, geometryForNode(position, layout)]),
  );
  const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const statusCascadeTimingsByTargetId = new Map<string, StatusCascadeTiming>();
  const statusCascadeTonesByTargetId = new Map<string, StatusCascadeTone>();
  const settledStatusCascadeTargetIds = new Set<string>();
  const accountCascadeArrivalByNodeId = new Map<string, number>();

  for (const edge of snapshot.edges) {
    const source = nodesById.get(edge.sourceId);
    const target = nodesById.get(edge.targetId);
    if (target?.kind !== 'account') continue;
    const tone = statusCascadeToneForEdgeNodes(edge, source, target);
    if (tone === null) continue;
    accountCascadeArrivalByNodeId.set(edge.targetId, statusCascadeStartDelayMs);
  }

  // The account-to-account path was already drawn before the comparison result. Recolor the
  // target account without replaying that path, then continue into its connected branch.
  for (const edge of snapshot.edges) {
    const source = nodesById.get(edge.sourceId);
    const target = nodesById.get(edge.targetId);
    const tone = statusCascadeToneForEdgeNodes(edge, source, target);
    if (tone === null) continue;
    statusCascadeTonesByTargetId.set(edge.targetId, tone);
    const sourceGeometry = geometriesByNodeId.get(edge.sourceId);
    const targetGeometry = geometriesByNodeId.get(edge.targetId);
    if (sourceGeometry === undefined || targetGeometry === undefined) continue;
    const durationMs =
      target?.kind === 'account'
        ? 0
        : Math.round(
            createNodeEdgePath(sourceGeometry, targetGeometry).length /
              statusCascadeSpeedPxPerMs,
          );
    const startDelayMs =
      target?.kind === 'account'
        ? statusCascadeStartDelayMs
        : (accountCascadeArrivalByNodeId.get(edge.sourceId) ?? statusCascadeStartDelayMs);
    statusCascadeTimingsByTargetId.set(edge.targetId, {
      durationMs,
      arrivalMs: startDelayMs + durationMs,
    });
    if (settledStatusCascadeTonesByNodeId.get(edge.targetId) === tone) {
      settledStatusCascadeTargetIds.add(edge.targetId);
    }
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
        visualDensity,
        compact,
        nodeSize: node.kind === 'account' ? 'main' : 'detail',
        nodeShape: layout.shape,
        showNodeLabels,
        showStatusMarkers,
        statusCascadeTiming: statusCascadeTimingsByTargetId.get(node.id) ?? null,
        statusCascadeTone: statusCascadeTonesByTargetId.get(node.id) ?? null,
        statusCascadeSettled: settledStatusCascadeTargetIds.has(node.id),
        onStatusCascadeEnd,
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
      const currentAttackPath =
        currentAttackEdgeId === null
          ? drawingTargetNodeIds.has(edge.targetId)
          : edge.id === currentAttackEdgeId;
      const showsStatusCascadeThread = nodesById.get(edge.targetId)?.kind !== 'account';
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
            sourceNodeId: edge.sourceId,
            sourceGeometry,
            targetGeometry,
            targetNodeId: edge.targetId,
            visible: revealed.has(edge.targetId),
            drawing:
              drawingTargetNodeIds.has(edge.targetId) &&
              (currentAttackEdgeId === null || currentAttackPath),
            drawn: drawnEdgeTargetNodeIds.has(edge.targetId),
            attackPath:
              edge.kind === 'identical-reuse' ||
              edge.kind === 'similar-pattern' ||
              edge.kind === 'blocked-path',
            riskRelation:
              edge.kind === 'identical-reuse' || edge.kind === 'similar-pattern',
            riskRelationKind:
              edge.kind === 'identical-reuse'
                ? 'same'
                : edge.kind === 'similar-pattern'
                  ? 'similar'
                  : null,
            currentAttackPath,
            dimmed: dimInactiveNodes && (choosingAccount || edge.sourceId !== activeNodeId),
            statusCascadeTiming: showsStatusCascadeThread
              ? (statusCascadeTimingsByTargetId.get(edge.targetId) ?? null)
              : null,
            statusCascadeTone: showsStatusCascadeThread
              ? (statusCascadeTonesByTargetId.get(edge.targetId) ?? null)
              : null,
            statusCascadeSettled: settledStatusCascadeTargetIds.has(edge.targetId),
            revealDelayMs: edgeRevealDelaysMs[edge.id] ?? null,
            animateReveal:
              animateEdgeReveals && edgeRevealDelaysMs[edge.id] !== undefined,
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
  readonly visualDensity?: NetworkVisualDensity;
  readonly activeNodeId?: string | null;
  readonly activePreviewNodeId?: string | null;
  readonly showEdgeLabels?: boolean;
  readonly showNodeLabels?: boolean;
  readonly showStatusMarkers?: boolean;
  readonly renderNodeOverlay?: (node: SceneNode) => ReactNode;
  readonly dimInactiveNodes?: boolean;
  readonly currentAttackEdgeId?: string | null;
  readonly statusCascadeStartDelayMs?: number;
  readonly edgeRevealDelaysMs?: Readonly<Partial<Record<string, number>>>;
  readonly animateEdgeReveals?: boolean;
}

export function ReactFlowNetwork({
  adapter,
  presentation,
  onNodeSelect,
  ariaLabel = 'Knotennetz',
  canvasAriaLabel = 'Deterministisch angeordnetes Knotennetz',
  interactionDisabled = false,
  visualVariant = 'default',
  visualDensity = 'default',
  activeNodeId = null,
  activePreviewNodeId = null,
  showEdgeLabels = true,
  showNodeLabels = true,
  showStatusMarkers = true,
  renderNodeOverlay,
  dimInactiveNodes = true,
  currentAttackEdgeId = null,
  statusCascadeStartDelayMs = defaultStatusCascadeStartDelayMs,
  edgeRevealDelaysMs = emptyEdgeRevealDelaysMs,
  animateEdgeReveals = false,
}: ReactFlowNetworkProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [canvas, setCanvas] = useState<NetworkCanvasSize>({ width: 0, height: 0 });
  const rendererState = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getSnapshot,
  );
  const nextFlowPresentation: ReactFlowPresentation = {
    revealedNodeIds: presentation.revealedNodeIds,
    ...(presentation.drawnEdgeTargetNodeIds === undefined
      ? {}
      : { drawnEdgeTargetNodeIds: presentation.drawnEdgeTargetNodeIds }),
    ...(presentation.drawingTargetNodeId === undefined
      ? {}
      : { drawingTargetNodeId: presentation.drawingTargetNodeId }),
    ...(presentation.drawingTargetNodeIds === undefined
      ? {}
      : { drawingTargetNodeIds: presentation.drawingTargetNodeIds }),
    highlightedNodeId: presentation.highlightedNodeId,
  };
  const flowPresentationRef = useRef(nextFlowPresentation);
  if (!sameReactFlowPresentation(flowPresentationRef.current, nextFlowPresentation)) {
    flowPresentationRef.current = nextFlowPresentation;
  }
  const flowPresentation = flowPresentationRef.current;
  const elements = useMemo(
    () =>
      toReactFlowElements(
        rendererState.snapshot,
        rendererState.settledStatusCascadeTonesByNodeId,
        flowPresentation,
        onNodeSelect,
        interactionDisabled,
        canvas,
        visualVariant,
        visualDensity,
        activeNodeId,
        activePreviewNodeId,
        showEdgeLabels,
        showNodeLabels,
        showStatusMarkers,
        renderNodeOverlay,
        dimInactiveNodes,
        currentAttackEdgeId,
        statusCascadeStartDelayMs,
        edgeRevealDelaysMs,
        animateEdgeReveals,
        adapter.completeStatusCascade,
      ),
    [
      activeNodeId,
      activePreviewNodeId,
      adapter,
      canvas,
      interactionDisabled,
      onNodeSelect,
      flowPresentation,
      rendererState.settledStatusCascadeTonesByNodeId,
      rendererState.snapshot,
      showEdgeLabels,
      showNodeLabels,
      showStatusMarkers,
      renderNodeOverlay,
      dimInactiveNodes,
      currentAttackEdgeId,
      edgeRevealDelaysMs,
      animateEdgeReveals,
      statusCascadeStartDelayMs,
      visualVariant,
      visualDensity,
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
