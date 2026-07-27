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
  it('records S01, S02, and S03 boundaries once and completes only after the warning sequence', async () => {
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

    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s03: 'active' })).toBe(true);
    expect(completions).toBe(0);

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
    expect(controller.getSnapshot().matches('complete')).toBe(true);
    expect(controller.getSnapshot().context.displayName).toBeNull();
    expect(completions).toBe(1);
  });

  it('retries failed S03 timing boundaries with the original event payload', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const failedBoundaries = new Set(['S03:segment-start', 'S03:segment-end']);
    const timingPort = {
      record: async (event: SegmentTimingEvent) => {
        timingEvents.push(event);
        if (failedBoundaries.delete(`${event.segmentId}:${event.eventType}`)) {
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
    configureAllAccounts(controller);
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS02Content();
    controller.continue();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s03: 'startFailed' })).toBe(true);

    controller.retryTiming();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s03: 'active' })).toBe(true);
    completeS03(controller);
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s03: 'endFailed' })).toBe(true);

    controller.retryTiming();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches('complete')).toBe(true);
    expect(timingEvents.filter(({ segmentId }) => segmentId === 'S03')).toEqual([
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
    ]);
  });

  it('does not accept retrieval input before S03 is active', async () => {
    const controller = new PasswordModuleController({
      accountIds: ['campus-id', 'campus-mail', 'campus-board-archive'],
      onComplete: () => undefined,
    });

    controller.setRetrievalPasswordValue('campus-id', 'not-yet');
    expect(controller.getSnapshot().context.retrievalPasswordValues['campus-id']).toBe('');
    controller.enterDisplayName('Alex');
    controller.completeS00();
    await flushMicrotasks();
    controller.setRetrievalPasswordValue('campus-id', 'still-not-yet');
    expect(controller.getSnapshot().context.retrievalPasswordValues['campus-id']).toBe('');
  });
});
