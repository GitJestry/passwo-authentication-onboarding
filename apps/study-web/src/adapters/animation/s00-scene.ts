import type { PassWoPlacement, PassWoPose } from '@passwo/contracts';

export interface S00SceneSnapshot {
  readonly character: {
    readonly placement: PassWoPlacement;
    readonly pose: PassWoPose;
  };
  readonly revealedTargetIds: readonly string[];
  readonly announcedMessageId: string | null;
}

export function createInitialS00SceneSnapshot(): S00SceneSnapshot {
  return {
    character: {
      placement: 'offscreen-right',
      pose: 'flight',
    },
    revealedTargetIds: [],
    announcedMessageId: null,
  };
}

export function hasRevealedTarget(snapshot: S00SceneSnapshot, targetId: string): boolean {
  return snapshot.revealedTargetIds.includes(targetId);
}
