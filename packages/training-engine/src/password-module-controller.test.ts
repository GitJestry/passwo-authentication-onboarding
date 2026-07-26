import { describe, expect, it } from 'vitest';
import type { SegmentTimingEvent } from './mission-controller.js';
import { PasswordModuleController } from './password-module-controller.js';

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function configureAllAccounts(controller: PasswordModuleController): void {
  controller.setPasswordValue('campus-board-archive', 'three');
  controller.setPasswordValue('campus-id', 'one');
  controller.setPasswordValue('campus-mail', 'two');
  controller.configureAccounts();
}

describe('PasswordModuleController', () => {
  it('records S01 and S02 boundaries once and completes only after S02 end succeeds', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    let completions = 0;
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      timingPort: {
        record: async (event) => {
          timingEvents.push(event);
        },
      },
      onComplete: () => {
        completions += 1;
      },
    });

    controller.enterDisplayName('  Alex  ');
    expect(controller.getSnapshot().context.displayName).toBe('Alex');
    controller.completeS00();
    await flushMicrotasks();
    configureAllAccounts(controller);
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s02: 'active' })).toBe(true);
    expect(completions).toBe(0);

    controller.completeS02Content();
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();

    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S02', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('complete')).toBe(true);
    expect(controller.getSnapshot().context.displayName).toBeNull();
    expect(completions).toBe(1);
  });

  it('retries each failed S01 and S02 boundary with the same event', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const failedBoundaries = new Set([
      'S01:segment-start',
      'S01:segment-end',
      'S02:segment-start',
      'S02:segment-end',
    ]);
    const timingPort = {
      record: async (event: SegmentTimingEvent) => {
        timingEvents.push(event);
        const boundary = `${event.segmentId}:${event.eventType}`;
        if (failedBoundaries.delete(boundary)) {
          throw new Error(`${event.eventType}-failed`);
        }
      },
      retry: async () => {
        const pendingEvent = timingEvents.at(-1);
        if (pendingEvent === undefined) throw new Error('missing-pending-event');
        timingEvents.push(pendingEvent);
      },
    };
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      timingPort,
      onComplete: () => undefined,
    });

    controller.enterDisplayName('Alex');
    controller.completeS00();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s01: 'startFailed' })).toBe(true);

    controller.retryTiming();
    await flushMicrotasks();
    configureAllAccounts(controller);
    controller.continue();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s01: 'endFailed' })).toBe(true);

    controller.retryTiming();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s02: 'startFailed' })).toBe(true);

    controller.retryTiming();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s02: 'active' })).toBe(true);
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s02: 'endFailed' })).toBe(true);

    controller.retryTiming();
    await flushMicrotasks();

    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S02', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('complete')).toBe(true);
  });
});
