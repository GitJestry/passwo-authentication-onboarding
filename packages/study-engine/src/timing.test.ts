import type { TimingEvent } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import type { ClockPort, TimingSink } from './timing.js';
import { StudyTimerController } from './timing.js';

function testClock(now: () => number): ClockPort {
  return {
    monotonicNow: now,
    wallClockIso: () => '2026-07-23T12:00:00.000Z',
  };
}

describe('StudyTimerController', () => {
  it('emits artifact and segment boundaries in one ordered sequence', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const timer = new StudyTimerController(testClock(() => now), {
      record: async (event) => {
        events.push(event);
      },
    } satisfies TimingSink);
    const artifact = { phase: 'artifact' as const };
    const s00 = {
      phase: 'artifact' as const,
      sectionId: 'passwords' as const,
      segmentId: 'S00' as const,
    };

    await timer.start(artifact);
    now = 125;
    await timer.start(s00);
    now = 425;
    await timer.end(s00);
    now = 800;
    await timer.end(artifact);

    expect(
      events.map(({ sequence, segmentId, eventType }) => ({ sequence, segmentId, eventType })),
    ).toEqual([
      { sequence: 0, segmentId: null, eventType: 'start' },
      { sequence: 1, segmentId: 'S00', eventType: 'start' },
      { sequence: 2, segmentId: 'S00', eventType: 'end' },
      { sequence: 3, segmentId: null, eventType: 'end' },
    ]);
  });

  it('retries a failed end write with the original timing event', async () => {
    let now = 100;
    let endAttempts = 0;
    const events: TimingEvent[] = [];
    const timer = new StudyTimerController(testClock(() => now), {
      record: async (event) => {
        events.push(event);
        if (event.eventType === 'end' && endAttempts++ === 0) throw new Error('response-lost');
      },
    } satisfies TimingSink);
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 425;
    await expect(timer.end(scope)).rejects.toThrow('response-lost');
    await timer.retryFailed();

    expect(events.filter(({ eventType }) => eventType === 'end')).toEqual([events[1], events[1]]);
  });

  it('records exactly one successful artifact end event', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const timer = new StudyTimerController(testClock(() => now), {
      record: async (event) => {
        events.push(event);
      },
    } satisfies TimingSink);
    const artifact = { phase: 'artifact' as const };

    await timer.start(artifact);
    now = 500;
    await timer.end(artifact);

    expect(
      events.filter(({ eventType, segmentId }) => eventType === 'end' && segmentId === null),
    ).toHaveLength(1);
  });
});
