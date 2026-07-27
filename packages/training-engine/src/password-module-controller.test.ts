import { describe, expect, it } from 'vitest';
import type { SegmentTimingEvent } from './mission-controller.js';
import { PasswordModuleController } from './password-module-controller.js';

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function configureAllAccounts(controller: PasswordModuleController): void {
  controller.setPasswordValue('campus-board-archive', 'three');
  controller.configureAccount('campus-board-archive');
  controller.setPasswordValue('campus-id', 'one');
  controller.configureAccount('campus-id');
  controller.setPasswordValue('campus-mail', 'two');
  controller.configureAccount('campus-mail');
}

function completeS03(controller: PasswordModuleController): void {
  controller.setRetrievalPasswordValue('campus-board-archive', 'three');
  controller.submitRetrievalLogin('campus-board-archive');
  controller.skipRetrieval('campus-id');
  controller.skipRetrieval('campus-mail');
  controller.completeS03WarningSequence();
}

describe('PasswordModuleController', () => {
  it('records S01–S03 boundaries and awaits S04 after the final segment end', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    let completions = 0;
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      timingPort: { record: async (event) => timingEvents.push(event) },
      onComplete: () => {
        completions += 1;
      },
    });

    controller.enterDisplayName('Alex');
    controller.completeS00();
    await flushMicrotasks();
    configureAllAccounts(controller);
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    completeS03(controller);
    await flushMicrotasks();

    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
    ]);
    expect(completions).toBe(0);
    expect(controller.getSnapshot().matches('awaitingS04')).toBe(true);
  });

  it('retries failed S03 timing writes with the original boundary', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const failedBoundaries = new Set(['S03:segment-start', 'S03:segment-end']);
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      timingPort: {
        record: async (event) => {
          timingEvents.push(event);
          if (failedBoundaries.delete(`${event.segmentId}:${event.eventType}`)) {
            throw new Error(`${event.eventType}-failed`);
          }
        },
        retry: async () => {
          const pending = timingEvents.at(-1);
          if (pending === undefined) throw new Error('missing-pending-event');
          timingEvents.push(pending);
        },
      },
      onComplete: () => undefined,
    });

    controller.enterDisplayName('Alex');
    controller.completeS00();
    await flushMicrotasks();
    configureAllAccounts(controller);
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    completeS03(controller);
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();

    expect(timingEvents.filter(({ segmentId }) => segmentId === 'S03')).toEqual([
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('awaitingS04')).toBe(true);
  });
});
