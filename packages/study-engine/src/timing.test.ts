import type { TimingEvent } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import type { ClockPort, TimingSink } from './timing.js';
import { StudyTimerController } from './timing.js';

function deferred(): {
  readonly promise: Promise<void>;
  resolve(): void;
} {
  let resolvePromise: (() => void) | null = null;
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve: () => {
      if (resolvePromise === null) throw new Error('Deferred promise is not initialized');
      resolvePromise();
    },
  };
}

function testClock(now: () => number): ClockPort {
  return {
    monotonicNow: now,
    wallClockIso: () => '2026-07-23T12:00:00.000Z',
  };
}

describe('StudyTimerController', () => {
  it('uses a monotonic clock and emits ordered start/end events', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
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
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
        if (event.eventType === 'end' && endAttempts++ === 0) {
          throw new Error('response lost');
        }
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 425;
    await expect(timer.end(scope)).rejects.toThrow('response lost');
    now = 900;
    await expect(timer.retryFailed()).resolves.toMatchObject({
      sequence: 1,
      eventType: 'end',
      clientMonotonicMs: 425,
      elapsedMs: 325,
    });

    expect(events.slice(1)).toEqual([events[1], events[1]]);
  });

  it('keeps artifact and segment boundaries on one sequence and rejects concurrent segments', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
    const artifact = { phase: 'artifact' as const };
    const s00 = {
      phase: 'artifact' as const,
      sectionId: 'passwords' as const,
      segmentId: 'S00' as const,
    };

    await timer.start(artifact);
    now = 125;
    await timer.start(s00);
    await expect(
      timer.start({
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S01',
      }),
    ).rejects.toThrow('Timing segment already active');
    now = 425;
    await expect(timer.end(s00)).resolves.toBe(300);
    now = 600;
    await timer.markVisibility(artifact, false);
    now = 800;
    await expect(timer.end(artifact)).resolves.toBe(700);

    expect(
      events.map(({ sequence, segmentId, eventType }) => ({ sequence, segmentId, eventType })),
    ).toEqual([
      { sequence: 0, segmentId: null, eventType: 'start' },
      { sequence: 1, segmentId: 'S00', eventType: 'start' },
      { sequence: 2, segmentId: 'S00', eventType: 'end' },
      { sequence: 3, segmentId: null, eventType: 'visibility-hidden' },
      { sequence: 4, segmentId: null, eventType: 'end' },
    ]);
  });

  it('retries a failed segment start without creating another event', async () => {
    let now = 100;
    let segmentStartAttempts = 0;
    const events: TimingEvent[] = [];
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
        if (
          event.segmentId === 'S00' &&
          event.eventType === 'start' &&
          segmentStartAttempts++ === 0
        ) {
          throw new Error('segment-start-write-failed');
        }
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
    const s00 = {
      phase: 'artifact' as const,
      sectionId: 'passwords' as const,
      segmentId: 'S00' as const,
    };

    await timer.start({ phase: 'artifact' });
    now = 150;
    await expect(timer.start(s00)).rejects.toThrow('segment-start-write-failed');
    now = 500;
    await expect(timer.start(s00)).rejects.toThrow('segment-start-write-failed');
    await expect(timer.retryFailed()).resolves.toMatchObject({
      sequence: 1,
      elapsedMs: null,
    });

    const segmentStarts = events.filter(
      (event) => event.segmentId === 'S00' && event.eventType === 'start',
    );
    expect(segmentStarts).toHaveLength(2);
    expect(segmentStarts[0]).toEqual(segmentStarts[1]);
    expect(segmentStarts[0]).toMatchObject({ sequence: 1, elapsedMs: null });
  });

  it('serializes simultaneous visibility and end writes and makes end wait', async () => {
    let now = 100;
    const visibilityGate = deferred();
    const events: TimingEvent[] = [];
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
        if (event.eventType === 'visibility-hidden') {
          await visibilityGate.promise;
        }
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 200;
    const hidden = timer.markVisibility(scope, false);
    now = 500;
    let endSettled = false;
    const end = timer.end(scope).then((elapsed) => {
      endSettled = true;
      return elapsed;
    });

    await Promise.resolve();
    expect(endSettled).toBe(false);
    expect(events.map(({ sequence, eventType }) => ({ sequence, eventType }))).toEqual([
      { sequence: 0, eventType: 'start' },
      { sequence: 1, eventType: 'visibility-hidden' },
    ]);

    visibilityGate.resolve();
    await expect(Promise.all([hidden, end])).resolves.toEqual([undefined, 400]);
    expect(events.map(({ sequence, eventType }) => ({ sequence, eventType }))).toEqual([
      { sequence: 0, eventType: 'start' },
      { sequence: 1, eventType: 'visibility-hidden' },
      { sequence: 2, eventType: 'end' },
    ]);
    await expect(timer.markVisibility(scope, true)).rejects.toThrow(
      'Timing scope does not accept visibility events',
    );
  });

  it('blocks end behind a failed visibility write and retries the stable payload', async () => {
    let now = 100;
    let hiddenAttempts = 0;
    const events: TimingEvent[] = [];
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
        if (event.eventType === 'visibility-hidden' && hiddenAttempts++ === 0) {
          throw new Error('visibility response lost');
        }
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 200;
    await expect(timer.markVisibility(scope, false)).rejects.toThrow('visibility response lost');
    now = 500;
    let endSettled = false;
    const end = timer.end(scope).then((elapsed) => {
      endSettled = true;
      return elapsed;
    });

    await Promise.resolve();
    expect(endSettled).toBe(false);
    expect(events.map(({ sequence, eventType }) => ({ sequence, eventType }))).toEqual([
      { sequence: 0, eventType: 'start' },
      { sequence: 1, eventType: 'visibility-hidden' },
    ]);

    await expect(timer.retryFailed()).resolves.toEqual(events[1]);
    await expect(end).resolves.toBe(400);

    const hiddenWrites = events.filter(({ eventType }) => eventType === 'visibility-hidden');
    const endWrites = events.filter(({ eventType }) => eventType === 'end');
    expect(hiddenWrites).toHaveLength(2);
    expect(hiddenWrites[0]).toEqual(hiddenWrites[1]);
    expect(endWrites).toHaveLength(1);
    expect(endWrites[0]).toMatchObject({ sequence: 2, elapsedMs: 400 });
  });

  it('keeps rapid visibility and technical-abort writes in enqueue order', async () => {
    let now = 100;
    const events: TimingEvent[] = [];
    const sink: TimingSink = {
      record: async (event) => {
        events.push(event);
      },
    };
    const timer = new StudyTimerController(
      testClock(() => now),
      sink,
    );
    const scope = { phase: 'artifact' as const };

    await timer.start(scope);
    now = 200;
    const hidden = timer.markVisibility(scope, false);
    now = 210;
    const visible = timer.markVisibility(scope, true);
    now = 220;
    const abort = timer.technicalAbort(scope, 'diagnostic-interruption');
    now = 230;
    const hiddenAgain = timer.markVisibility(scope, false);
    await Promise.all([hidden, visible, abort, hiddenAgain]);

    expect(events.map(({ sequence, eventType }) => ({ sequence, eventType }))).toEqual([
      { sequence: 0, eventType: 'start' },
      { sequence: 1, eventType: 'visibility-hidden' },
      { sequence: 2, eventType: 'visibility-visible' },
      { sequence: 3, eventType: 'technical-abort' },
      { sequence: 4, eventType: 'visibility-hidden' },
    ]);
  });
});
