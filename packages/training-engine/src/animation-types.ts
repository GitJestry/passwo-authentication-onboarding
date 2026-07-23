import type { PassWoPlacement, PassWoPose } from '@passwo/contracts';

export type AnimationStep =
  | {
      readonly type: 'move-character';
      readonly pose: PassWoPose;
      readonly from: PassWoPlacement;
      readonly to: PassWoPlacement;
      readonly durationMs: number;
    }
  | {
      readonly type: 'reveal';
      readonly targetId: string;
      readonly durationMs: number;
    }
  | {
      readonly type: 'highlight';
      readonly targetId: string;
      readonly emphasis: 'info' | 'positive' | 'warning' | 'danger';
      readonly durationMs: number;
    }
  | { readonly type: 'pause'; readonly durationMs: number }
  | { readonly type: 'announce'; readonly messageId: string };

export interface ReducedMotionPlan {
  readonly strategy: 'instant-end-state' | 'short-fade';
  readonly maxDurationMs: number;
}

export interface AnimationSequence {
  readonly id: string;
  readonly steps: readonly AnimationStep[];
  readonly reducedMotion: ReducedMotionPlan;
  readonly maxDurationMs: number;
}

export interface AnimationResult {
  readonly status: 'finished' | 'cancelled' | 'failed';
  readonly reasonCode?: string;
}

export interface AnimationPlayerPort {
  play(sequence: AnimationSequence): Promise<AnimationResult>;
  cancel(): Promise<void>;
}
