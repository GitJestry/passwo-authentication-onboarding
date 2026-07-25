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
  it('records S01 start and end once and notifies completion only after the end succeeds', async () => {
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

    controller.completeS00();
    await flushMicrotasks();
    configureAllAccounts(controller);
    controller.continue();
    await flushMicrotasks();

    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('complete')).toBe(true);
    expect(completions).toBe(1);
  });

  it('retries the same S01 timing event after either write failure', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    let failuresRemaining = 2;
    const timingPort = {
      record: async (event: SegmentTimingEvent) => {
        timingEvents.push(event);
        if (failuresRemaining > 0) {
          failuresRemaining -= 1;
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

    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('complete')).toBe(true);
  });
});
