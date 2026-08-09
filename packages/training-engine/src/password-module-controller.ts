import { createActor, type SnapshotFrom } from 'xstate';
import type {
  S07RecommendationProjection,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
import type { SegmentTimingEvent, SegmentTimingPort } from './mission-controller.js';
import { isPermittedFictionalPassword } from './fictional-password-input.js';
import { passwordModuleMachine } from './password-module-machine.js';
import {
  passwordSegmentTimingPlan,
  type PasswordTimedSegmentId,
} from './password-segment-timing.js';

function timingErrorCode(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : 'research-data-write-failed';
}

interface FailedBoundary {
  readonly segmentId: PasswordTimedSegmentId;
  readonly eventType: SegmentTimingEvent['eventType'];
}

export interface PasswordModuleControllerOptions {
  readonly accountIds: readonly string[];
  readonly timingPort?: SegmentTimingPort;
}

export type PasswordModuleSnapshot = SnapshotFrom<typeof passwordModuleMachine>;

export class PasswordModuleController {
  readonly #actor: ReturnType<typeof createActor<typeof passwordModuleMachine>>;
  readonly #timingPort: SegmentTimingPort | undefined;
  #failedBoundary: FailedBoundary | null = null;
  #s06EvaluationInput: S07RecommendationProjectionInput | null = null;
  #s07Recommendations: S07RecommendationProjection | null = null;
  #disposed = false;

  constructor({ accountIds, timingPort }: PasswordModuleControllerOptions) {
    if (accountIds.length !== 3) throw new Error('password-module-requires-three-accounts');
    this.#actor = createActor(passwordModuleMachine, { input: { accountIds } });
    this.#timingPort = timingPort;
    this.#actor.start();
  }

  getSnapshot(): PasswordModuleSnapshot {
    return this.#actor.getSnapshot();
  }

  subscribe(listener: (snapshot: PasswordModuleSnapshot) => void): () => void {
    const subscription = this.#actor.subscribe(listener);
    return () => subscription.unsubscribe();
  }

  enterDisplayName(displayName: string): void {
    if (!this.#actor.getSnapshot().matches('entry')) return;
    this.#actor.send({ type: 'DISPLAY_NAME_ENTERED', displayName });
  }

  completeSectionTransition(): void {
    const snapshot = this.#actor.getSnapshot();
    const nextSegmentId = snapshot.matches('strengthTransition')
      ? 'S05'
      : snapshot.matches('uniquenessTransition')
        ? 'S06'
        : null;
    if (
      !snapshot.matches('sectionTransition') &&
      !snapshot.matches('strengthTransition') &&
      !snapshot.matches('uniquenessTransition') &&
      !snapshot.matches('changeTransition')
    ) {
      return;
    }
    this.#actor.send({ type: 'SECTION_TRANSITION_COMPLETED' });
    if (nextSegmentId !== null) {
      void this.#writeSegmentBoundary(nextSegmentId, 'segment-start');
    }
  }

  completeS00(): void {
    if (!this.#actor.getSnapshot().matches('s00')) return;
    this.#actor.send({ type: 'S00_COMPLETED' });
    void this.#writeSegmentBoundary('S01', 'segment-start');
  }

  selectAccount(accountId: string): void {
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'SELECT_ACCOUNT', accountId });
  }

  setPasswordValue(accountId: string, value: string): void {
    if (!this.#actor.getSnapshot().matches({ s01: 'editing' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    if (!isPermittedFictionalPassword(value)) return;
    this.#actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value });
  }

  setRetrievalPasswordValue(accountId: string, value: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'active' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    if (!isPermittedFictionalPassword(value)) return;
    this.#actor.send({ type: 'SET_RETRIEVAL_PASSWORD_VALUE', accountId, value });
  }

  submitRetrievalLogin(accountId: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'active' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'SUBMIT_RETRIEVAL_LOGIN', accountId });
  }

  skipRetrieval(accountId: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'active' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'SKIP_RETRIEVAL', accountId });
  }

  startAssistedLogin(accountId: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'assistance' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'START_ASSISTED_LOGIN', accountId });
  }

  completeAssistedAutofill(accountId: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'autofilling' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'S03_ASSISTED_AUTOFILL_COMPLETED', accountId });
  }

  submitAssistedLogin(accountId: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'assistedLogin' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'SUBMIT_ASSISTED_LOGIN', accountId });
  }

  continueS03CompletionFeedback(): void {
    if (!this.#actor.getSnapshot().matches({ s03: { completionSequence: 'feedback' } })) return;
    this.#actor.send({ type: 'S03_COMPLETION_FEEDBACK_CONTINUED' });
  }

  continueS03CampusStart(): void {
    if (!this.#actor.getSnapshot().matches({ s03: { completionSequence: 'campusStart' } })) return;
    this.#actor.send({ type: 'S03_CAMPUS_START_CONTINUED' });
  }

  completeS03TimeLapse(): void {
    if (!this.#actor.getSnapshot().matches({ s03: { completionSequence: 'timeLapseRunning' } })) {
      return;
    }
    this.#actor.send({ type: 'S03_TIMELAPSE_COMPLETED' });
  }

  openIncidentAccount(accountId: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'awaitingIncidentOpen' })) return;
    this.#actor.send({ type: 'OPEN_INCIDENT_ACCOUNT', accountId });
    if (!this.#actor.getSnapshot().matches({ s03: 'writingEnd' })) return;
    void this.#writeSegmentBoundary('S03', 'segment-end');
  }

  completeS04(): void {
    if (!this.#actor.getSnapshot().matches({ s04: 'active' })) return;
    this.#actor.send({ type: 'S04_COMPLETED' });
    void this.#writeSegmentBoundary('S04', 'segment-end');
  }

  completeS05(): void {
    if (!this.#actor.getSnapshot().matches({ s05: 'active' })) return;
    this.#actor.send({ type: 'S05_COMPLETED' });
    void this.#writeSegmentBoundary('S05', 'segment-end');
  }

  completeS06(): void {
    if (!this.#actor.getSnapshot().matches({ s06: 'active' })) return;
    this.#actor.send({ type: 'S06_COMPLETED' });
    void this.#writeSegmentBoundary('S06', 'segment-end');
  }

  setS06EvaluationInput(input: S07RecommendationProjectionInput): void {
    if (!this.#actor.getSnapshot().matches('s06')) return;
    this.#s06EvaluationInput = input;
  }

  getS06EvaluationInput(): S07RecommendationProjectionInput | null {
    return this.#s06EvaluationInput;
  }

  setS07Recommendations(projection: S07RecommendationProjection): void {
    if (!this.#actor.getSnapshot().matches({ s07: 'active' })) return;
    this.#s07Recommendations = projection;
  }

  getS07Recommendations(): S07RecommendationProjection | null {
    return this.#s07Recommendations;
  }

  completeS07(): void {
    if (!this.#actor.getSnapshot().matches({ s07: 'active' })) return;
    if (this.#s07Recommendations === null) return;
    this.#actor.send({ type: 'S07_COMPLETED' });
    void this.#writeSegmentBoundary('S07', 'segment-end');
  }

  configureAccount(accountId: string): void {
    const snapshot = this.#actor.getSnapshot();
    if (!snapshot.matches({ s01: 'editing' })) return;
    if (!snapshot.context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'CONFIGURE_ACCOUNT', accountId });
  }

  continue(): void {
    const snapshot = this.#actor.getSnapshot();
    if (snapshot.matches({ s02: 'active' }) && snapshot.context.s02ContentCompleted) {
      this.#actor.send({ type: 'CONTINUE' });
      void this.#writeSegmentBoundary('S02', 'segment-end');
    }
  }

  closeS01Browser(): void {
    const snapshot = this.#actor.getSnapshot();
    if (!snapshot.matches({ s01: 'configured' })) return;
    this.#actor.send({ type: 'S01_BROWSER_CLOSED' });
    void this.#writeSegmentBoundary('S01', 'segment-end');
  }

  completeS02Content(): void {
    if (!this.#actor.getSnapshot().matches({ s02: 'active' })) return;
    this.#actor.send({ type: 'S02_CONTENT_COMPLETED' });
  }

  retryTiming(): void {
    const failedBoundary = this.#failedBoundary;
    if (failedBoundary === null) return;

    this.#failedBoundary = null;
    const definition =
      passwordSegmentTimingPlan[failedBoundary.segmentId].boundaries[failedBoundary.eventType];
    this.#actor.send(definition.retryEvent);
    void this.#writeSegmentBoundary(failedBoundary.segmentId, failedBoundary.eventType, true);
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#failedBoundary = null;
    this.#s06EvaluationInput = null;
    this.#s07Recommendations = null;
    if (this.#actor.getSnapshot().status !== 'done') {
      this.#actor.send({ type: 'DISCARD' });
    }
    this.#actor.stop();
  }

  async #writeSegmentBoundary(
    segmentId: PasswordTimedSegmentId,
    eventType: SegmentTimingEvent['eventType'],
    retry = false,
  ): Promise<void> {
    const segment = passwordSegmentTimingPlan[segmentId];
    const boundary = segment.boundaries[eventType];
    try {
      if (retry && this.#timingPort?.retry !== undefined) {
        await this.#timingPort.retry();
      } else if (this.#timingPort !== undefined) {
        await this.#timingPort.record({ eventType, ...segment.scope });
      }
      if (this.#disposed) return;

      this.#failedBoundary = null;
      if (segmentId === 'S07' && eventType === 'segment-end') {
        this.#s06EvaluationInput = null;
      }
      this.#actor.send(boundary.recordedEvent);
      if (eventType === 'segment-end' && segment.nextSegmentId !== null) {
        await this.#writeSegmentBoundary(segment.nextSegmentId, 'segment-start');
      }
    } catch (error) {
      if (this.#disposed) return;
      this.#failedBoundary = { segmentId, eventType };
      this.#actor.send(boundary.failedEvent(timingErrorCode(error)));
    }
  }
}
