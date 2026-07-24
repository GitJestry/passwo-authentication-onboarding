import { describe, expect, it } from 'vitest';
import type { AnimationPlayerPort, AnimationSequence } from './animation-types.js';
import { MissionController, type SegmentTimingEvent } from './mission-controller.js';

const sequence: AnimationSequence = {
  id: 's00-sequence',
  steps: [],
  reducedMotion: { strategy: 'instant-end-state', maxDurationMs: 0 },
  maxDurationMs: 0,
};

const mission = {
  id: 's00-entry-and-safety',
  segmentId: 'S00',
  sectionId: 'passwords',
  requiresSafetyAcknowledgement: true,
  steps: [{ id: 'arrival', narrationId: 's00.greeting', animation: sequence }],
} as const;

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('MissionController', () => {
  it('reports segment boundaries and completes only after the safety acknowledgement', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    let completed = 0;
    const animationPlayer: AnimationPlayerPort = {
      play: async () => ({ status: 'finished' }),
      cancel: async () => undefined,
    };
    const controller = new MissionController({
      animationPlayer,
      timingPort: {
        record: async (event) => {
          timingEvents.push(event);
        },
      },
      onComplete: () => {
        completed += 1;
      },
    });

    controller.start(mission);
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ active: 'awaitingDecision' })).toBe(true);
    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S00', sectionId: 'passwords' },
    ]);

    await controller.continue();
    expect(completed).toBe(0);

    controller.setSafetyAcknowledged(true);
    await controller.continue();
    expect(completed).toBe(1);
    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S00', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S00', sectionId: 'passwords' },
    ]);
  });

  it('keeps the mission actionable when the animation adapter reports a failure', async () => {
    const animationPlayer: AnimationPlayerPort = {
      play: async () => ({ status: 'failed', reasonCode: 'motion-adapter-failed' }),
      cancel: async () => undefined,
    };
    const controller = new MissionController({ animationPlayer, onComplete: () => undefined });

    controller.start(mission);
    await flushMicrotasks();

    expect(controller.getSnapshot().matches({ active: 'awaitingDecision' })).toBe(true);
    expect(controller.getSnapshot().context.lastAnimationError).toBe('motion-adapter-failed');
  });
});
