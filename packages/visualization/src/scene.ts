export type SceneNodeKind =
  | 'account'
  | 'service'
  | 'function'
  | 'content'
  | 'shield'
  | 'annotation';

export type SceneNodeStatus =
  | 'neutral'
  | 'understood'
  | 'retrievable'
  | 'not-remembered'
  | 'exposed'
  | 'affected'
  | 'protected'
  | 'hypothetical';

export type SceneEdgeKind =
  | 'dependency'
  | 'association'
  | 'check'
  | 'identical-reuse'
  | 'similar-pattern'
  | 'blocked-path';

export type SceneEdgeStatus =
  | 'neutral'
  | 'checking'
  | 'direct'
  | 'similar'
  | 'blocked'
  | 'hypothetical';

export interface AuthoredPosition {
  readonly x: number;
  readonly y: number;
}

export interface SceneNode {
  readonly id: string;
  readonly kind: SceneNodeKind;
  readonly label: string;
  readonly description: string;
  readonly status: SceneNodeStatus;
  readonly position: AuthoredPosition;
  readonly selectable: boolean;
}

export interface SceneEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly kind: SceneEdgeKind;
  readonly status: SceneEdgeStatus;
  readonly label: string | null;
}

export interface NetworkSceneSnapshot {
  readonly id: string;
  readonly nodes: readonly SceneNode[];
  readonly edges: readonly SceneEdge[];
  readonly accessibleSummary: string;
}

export interface NetworkRendererPort {
  render(snapshot: NetworkSceneSnapshot): void;
  focusNode(nodeId: string): void;
  announce(summary: string): void;
}
