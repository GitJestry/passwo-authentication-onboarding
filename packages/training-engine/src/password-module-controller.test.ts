import { describe, expect, it } from 'vitest';
import type { SegmentTimingEvent } from './mission-controller.js';
import { PasswordModuleController } from './password-module-controller.js';

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

function configureAllAccounts(controller: PasswordModuleController): void {
  controller.setPasswordValue('campusgram', 'three');
  controller.configureAccount('campusgram');
  controller.setPasswordValue('master-campus', 'one');
  controller.configureAccount('master-campus');
  controller.setPasswordValue('campus-email', 'two');
  controller.configureAccount('campus-email');
}

function completeS03(controller: PasswordModuleController): void {
  controller.setRetrievalPasswordValue('campusgram', 'three');
  controller.submitRetrievalLogin('campusgram');
  for (const accountId of ['master-campus', 'campus-email'] as const) {
    controller.skipRetrieval(accountId);
    controller.startAssistedLogin(accountId);
    controller.completeAssistedAutofill(accountId);
    controller.submitAssistedLogin(accountId);
  }
  controller.continueS03CompletionFeedback();
  controller.continueS03CampusStart();
  controller.completeS03WarningSequence();
}

describe('PasswordModuleController', () => {
  it('records S01–S03 boundaries and awaits S04 after the final segment end', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const controller = new PasswordModuleController({
      accountIds: ['master-campus', 'campus-email', 'campusgram'],
      timingPort: {
        record: async (event) => {
          timingEvents.push(event);
        },
      },
    });

    controller.enterDisplayName('Alex');
    controller.completeSectionTransition();
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
    expect(controller.getSnapshot().matches('awaitingS04')).toBe(true);
  });

  it('retries failed S03 timing writes with the original boundary', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const failedBoundaries = new Set(['S03:segment-start', 'S03:segment-end']);
    const controller = new PasswordModuleController({
      accountIds: ['master-campus', 'campus-email', 'campusgram'],
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
    });

    controller.enterDisplayName('Alex');
    controller.completeSectionTransition();
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
