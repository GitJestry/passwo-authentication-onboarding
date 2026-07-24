import type { TimingEvent } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import type { ClockPort, TimingSink } from './timing.js';
import { StudyTimerController } from './timing.js';

describe('StudyTimerController', () => {
  it('uses a monotonic clock and emits ordered start/end events', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const clock: ClockPort = {
      monotonicNow: () => now,
      wallClockIso: () => '2026-07-23T12:00:00.000Z',
    };
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
      },
    };
    const timer = new StudyTimerController(clock, sink);
    const scope = {
      phase: 'artifact' as const,
      sectionId: 'passwords' as const,
      segmentId: 'S00' as const,
    };

    await timer.start(scope);
    now = 425;
    const elapsed = await timer.end(scope);

    expect(elapsed).toBe(325);
    expect(events.map(({ sequence, eventType }) => ({ sequence, eventType }))).toEqual([
      { sequence: 0, eventType: 'start' },
      { sequence: 1, eventType: 'end' },
    ]);
    expect(events[1]?.elapsedMs).toBe(325);
  });

  it('retries an ambiguous end write with the same timing event', async () => {
    let now = 100;
    let endAttempts = 0;
    const events: TimingEvent[] = [];
    const clock: ClockPort = {
      monotonicNow: () => now,
      wallClockIso: () => '2026-07-23T12:00:00.000Z',
    };
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
        if (event.eventType === 'end' && endAttempts++ === 0) {
          throw new Error('response lost');
        }
      },
    };
    const timer = new StudyTimerController(clock, sink);
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 425;
    await expect(timer.end(scope)).rejects.toThrow('response lost');
    now = 900;
    await expect(timer.end(scope)).resolves.toBe(325);

    expect(events.slice(1)).toEqual([events[1], events[1]]);
  });

  it('emits diagnostic visibility events without changing the active duration', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const clock: ClockPort = {
      monotonicNow: () => now,
      wallClockIso: () => '2026-07-23T12:00:00.000Z',
    };
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
      },
    };
    const timer = new StudyTimerController(clock, sink);
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 200;
    await timer.markVisibility(scope, false);
    now = 300;
    await timer.markVisibility(scope, true);
    now = 500;
    await expect(timer.end(scope)).resolves.toBe(400);

    expect(events.map(({ sequence, eventType }) => ({ sequence, eventType }))).toEqual([
      { sequence: 0, eventType: 'start' },
      { sequence: 1, eventType: 'visibility-hidden' },
      { sequence: 2, eventType: 'visibility-visible' },
      { sequence: 3, eventType: 'end' },
    ]);
  });
});
