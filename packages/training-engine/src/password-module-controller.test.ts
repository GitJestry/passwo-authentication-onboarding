import { describe, expect, it } from 'vitest';
import type {
  S07RecommendationProjection,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
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
    controller.selectAccount(accountId);
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

const evaluationInput: S07RecommendationProjectionInput = {
  incidentSource: 'campusgram',
  accounts: (['master-campus', 'campus-email', 'campusgram'] as const).map(
    (accountId) =>
      ({
        accountId,
        disposition: {
          kind: 'no-quick-path-recognized',
          explanationId: 's05.disposition.no-quick-path-recognized',
        },
        retrievalStatus: 'retrievable',
      }) as const,
  ),
  paths: (
    [
      ['campusgram', 'master-campus'],
      ['campusgram', 'campus-email'],
      ['master-campus', 'campus-email'],
    ] as const
  ).map(([sourceAccountId, targetAccountId]) => ({
    sourceAccountId,
    targetAccountId,
    mode: 'hypothetical',
    relationKind: 'no-derived-path-recognized',
    targetReached: false,
  })),
  affectedAccountIds: [],
};

const recommendationProjection: S07RecommendationProjection = {
  kind: 's07-recommendation-projection',
  accounts: (['master-campus', 'campus-email', 'campusgram'] as const).map(
    (accountId) =>
      ({
        accountId,
        disposition: {
          kind: 'no-quick-path-recognized',
          explanationId: 's05.disposition.no-quick-path-recognized',
        },
        connections: [],
        incidentStatus: accountId === 'campusgram' ? 'source-of-incident' : 'not-reached',
        retrievability: 'remembered',
        recommendationId: 'no-change-practice-method',
      }) as const,
  ),
  summary: {
    noQuickPathCount: 3,
    noPasswordConnectionCount: 3,
    rememberedCount: 3,
    problemClasses: [],
  },
};

describe('PasswordModuleController', () => {
  it('records S01–S07 boundaries and retains recommendations in local runtime only', async () => {
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
    controller.closeS01Browser();
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
    await flushMicrotasks();
    controller.completeS05();
    controller.completeS05();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.setS06EvaluationInput(evaluationInput);
    controller.completeS06();
    controller.completeS06();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.setS07Recommendations(recommendationProjection);
    controller.completeS07();
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
      { eventType: 'segment-start', segmentId: 'S05', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S05', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S07', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S07', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('awaiting-s08')).toBe(true);
    expect(controller.getS07Recommendations()).toBe(recommendationProjection);
    expect(controller.getS06EvaluationInput()).toBeNull();
    expect(controller.getSnapshot().context).not.toHaveProperty('s05Result');
    expect(controller.getSnapshot().context).not.toHaveProperty('s07Recommendations');
    controller.dispose();
    expect(controller.getS07Recommendations()).toBeNull();
  });

  it('retries only open boundaries without rewriting earlier confirmed events', async () => {
    const timingEvents: SegmentTimingEvent[] = [];
    const failedBoundaries = new Set([
      'S04:segment-end',
      'S05:segment-start',
      'S05:segment-end',
      'S06:segment-start',
      'S06:segment-end',
      'S07:segment-start',
      'S07:segment-end',
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
    controller.closeS01Browser();
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
    controller.retryTiming();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    controller.completeS05();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    controller.completeS06();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();
    controller.setS07Recommendations(recommendationProjection);
    controller.completeS07();
    await flushMicrotasks();
    controller.retryTiming();
    await flushMicrotasks();

    expect(
      timingEvents.filter(
        ({ segmentId }) =>
          segmentId === 'S04' || segmentId === 'S05' || segmentId === 'S06' || segmentId === 'S07',
      ),
    ).toEqual([
      { eventType: 'segment-start', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S04', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S05', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S05', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S05', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S05', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S06', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S07', sectionId: 'passwords' },
      { eventType: 'segment-start', segmentId: 'S07', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S07', sectionId: 'passwords' },
      { eventType: 'segment-end', segmentId: 'S07', sectionId: 'passwords' },
    ]);
    expect(controller.getSnapshot().matches('awaiting-s08')).toBe(true);
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
    controller.closeS01Browser();
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
        ({ segmentId, eventType }) => segmentId === 'S03' && eventType === 'segment-end',
      ),
    ).toHaveLength(1);
    finishS03End?.();
    await flushMicrotasks();
    await flushMicrotasks();
    expect(controller.getSnapshot().matches({ s04: 'active' })).toBe(true);
  });
});
