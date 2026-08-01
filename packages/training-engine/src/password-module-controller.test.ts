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

function reachAwaitingIncidentOpen(controller: PasswordModuleController): void {
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
  controller.completeS03TimeLapse();
  controller.completeS03WarningAnnouncement();
}

describe('PasswordModuleController', () => {
  it('records S01–S04 boundaries and completes S04 without starting S05', async () => {
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
    reachAwaitingIncidentOpen(controller);
    controller.openIncidentAccount('campusgram');
    await flushMicrotasks();
    await flushMicrotasks();
    controller.completeS04();
    await flushMicrotasks();

    expect(timingEvents).toEqual([
      { eventType: 'segment-start', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S01', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S02', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S04', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches({ s04: 'completed' })).toBe(true);
  });

  it('retries S03 end, S04 start, and S04 end with the original boundary', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const failedBoundaries = new Set([
      'S03:segment-end',
      'S04:segment-start',
      'S04:segment-end',
    ]);
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
    reachAwaitingIncidentOpen(controller);
    controller.openIncidentAccount('campusgram');
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    controller.completeS04();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();

    expect(
      timingEvents.filter(({ segmentId }) => segmentId === 'S03' || segmentId === 'S04'),
    ).toEqual([
      { eventType: 'segment-start', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S03', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S04', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches({ s04: 'completed' })).toBe(true);
  });

  it('ignores repeated Campusgram activation while the S03 end write is pending', async () => {
    let finishS03End: (() => void) | undefined;
    const timingEvents: SegmentTimingEvent[] = [];
    const controller = new PasswordModuleController({
      accountIds: ['master-campus', 'campus-email', 'campusgram'],
      timingPort: {
        record: async (event) => {
          timingEvents.push(event);
          if (event.segmentId === 'S03' && event.eventType === 'segment-end') {
            await new Promise<void>((resolve) => {
              finishS03End = resolve;
            });
          }
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
    reachAwaitingIncidentOpen(controller);
    controller.openIncidentAccount('campusgram');
    controller.openIncidentAccount('campusgram');

    expect(
      timingEvents.filter(
        ({ segmentId, eventType }) =>
          segmentId === 'S03' && eventType === 'segment-end',
      ),
    ).toHaveLength(1);
    finishS03End?.();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s04: 'active' })).toBe(true);
  });
});
