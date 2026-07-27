import { createActor, type SnapshotFrom } from 'xstate';
import type { SegmentTimingEvent, SegmentTimingPort } from './mission-controller.js';
import { passwordModuleMachine } from './password-module-machine.js';

const s01TimingScope = {
  segmentId: 'S01',
  sectionId: 'passwords',
} as const;
const s02TimingScope = {
  segmentId: 'S02',
  sectionId: 'passwords',
} as const;
const s03TimingScope = {
  segmentId: 'S03',
  sectionId: 'passwords',
} as const;

function timingErrorCode(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : 'research-data-write-failed';
}

export interface PasswordModuleControllerOptions {
  readonly accountIds: readonly string[];
  readonly timingPort?: SegmentTimingPort;
  readonly onComplete?: () => void;
}

export type PasswordModuleSnapshot = SnapshotFrom<typeof passwordModuleMachine>;

export class PasswordModuleController {
  readonly #actor: ReturnType<typeof createActor<typeof passwordModuleMachine>>;
  readonly #timingPort: SegmentTimingPort | undefined;
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

  completeS00(): void {
    if (!this.#actor.getSnapshot().matches('s00')) return;
    this.#actor.send({ type: 'S00_COMPLETED' });
    void this.#recordS01Start();
  }

  selectAccount(accountId: string): void {
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'SELECT_ACCOUNT', accountId });
  }

  setPasswordValue(accountId: string, value: string): void {
    if (!this.#actor.getSnapshot().matches({ s01: 'editing' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'SET_PASSWORD_VALUE', accountId, value });
  }

  setRetrievalPasswordValue(accountId: string, value: string): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'active' })) return;
    if (!this.#actor.getSnapshot().context.accountIds.includes(accountId)) return;
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

  completeS03WarningSequence(): void {
    if (!this.#actor.getSnapshot().matches({ s03: 'completionSequence' })) return;
    this.#actor.send({ type: 'S03_WARNING_SEQUENCE_COMPLETED' });
    void this.#recordS03End();
  }

  configureAccount(accountId: string): void {
    const snapshot = this.#actor.getSnapshot();
    if (!snapshot.matches({ s01: 'editing' })) return;
    if (!snapshot.context.accountIds.includes(accountId)) return;
    this.#actor.send({ type: 'CONFIGURE_ACCOUNT', accountId });
  }

  continue(): void {
    const snapshot = this.#actor.getSnapshot();
    if (snapshot.matches({ s01: 'configured' })) {
      this.#actor.send({ type: 'CONTINUE' });
      void this.#recordS01End();
      return;
    }
    if (snapshot.matches({ s02: 'active' }) && snapshot.context.s02ContentCompleted) {
      this.#actor.send({ type: 'CONTINUE' });
      void this.#recordS02End();
    }
  }

  completeS02Content(): void {
    if (!this.#actor.getSnapshot().matches({ s02: 'active' })) return;
    this.#actor.send({ type: 'S02_CONTENT_COMPLETED' });
  }

  retryTiming(): void {
    const snapshot = this.#actor.getSnapshot();
    if (snapshot.matches({ s01: 'startFailed' })) {
      this.#actor.send({ type: 'RETRY_S01_START' });
      void this.#retrySegmentTiming('S01', 'segment-start');
      return;
    }
    if (snapshot.matches({ s01: 'endFailed' })) {
      this.#actor.send({ type: 'RETRY_S01_END' });
      void this.#retrySegmentTiming('S01', 'segment-end');
      return;
    }
    if (snapshot.matches({ s02: 'startFailed' })) {
      this.#actor.send({ type: 'RETRY_S02_START' });
      void this.#retrySegmentTiming('S02', 'segment-start');
      return;
    }
    if (snapshot.matches({ s02: 'endFailed' })) {
      this.#actor.send({ type: 'RETRY_S02_END' });
      void this.#retrySegmentTiming('S02', 'segment-end');
      return;
    }
    if (snapshot.matches({ s03: 'startFailed' })) {
      this.#actor.send({ type: 'RETRY_S03_START' });
      void this.#retrySegmentTiming('S03', 'segment-start');
      return;
    }
    if (snapshot.matches({ s03: 'endFailed' })) {
      this.#actor.send({ type: 'RETRY_S03_END' });
      void this.#retrySegmentTiming('S03', 'segment-end');
    }
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#actor.getSnapshot().status !== 'done') {
      this.#actor.send({ type: 'DISCARD' });
    }
    this.#actor.stop();
  }

  async #recordS01Start(): Promise<void> {
    try {
      await this.#recordTiming('segment-start');
      if (!this.#disposed) this.#actor.send({ type: 'S01_START_RECORDED' });
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S01_START_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #recordS01End(): Promise<void> {
    try {
      await this.#recordTiming('segment-end');
      if (this.#disposed) return;
      this.#actor.send({ type: 'S01_END_RECORDED' });
      void this.#recordS02Start();
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S01_END_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #recordS02Start(): Promise<void> {
    try {
      await this.#recordTiming('segment-start', s02TimingScope);
      if (!this.#disposed) this.#actor.send({ type: 'S02_START_RECORDED' });
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S02_START_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #recordS02End(): Promise<void> {
    try {
      await this.#recordTiming('segment-end', s02TimingScope);
      if (this.#disposed) return;
      this.#actor.send({ type: 'S02_END_RECORDED' });
      void this.#recordS03Start();
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S02_END_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #recordS03Start(): Promise<void> {
    try {
      await this.#recordTiming('segment-start', s03TimingScope);
      if (!this.#disposed) this.#actor.send({ type: 'S03_START_RECORDED' });
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S03_START_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #recordS03End(): Promise<void> {
    try {
      await this.#recordTiming('segment-end', s03TimingScope);
      if (this.#disposed) return;
      this.#actor.send({ type: 'S03_END_RECORDED' });
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S03_END_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #retrySegmentTiming(
    segmentId: 'S01' | 'S02' | 'S03',
    eventType: SegmentTimingEvent['eventType'],
  ): Promise<void> {
    try {
      if (this.#timingPort?.retry !== undefined) {
        await this.#timingPort.retry();
      } else {
        await this.#recordTiming(
          eventType,
          segmentId === 'S01'
            ? s01TimingScope
            : segmentId === 'S02'
              ? s02TimingScope
              : s03TimingScope,
        );
      }
      if (this.#disposed) return;
      if (eventType === 'segment-start') {
        this.#actor.send({
          type:
            segmentId === 'S01'
              ? 'S01_START_RECORDED'
              : segmentId === 'S02'
                ? 'S02_START_RECORDED'
                : 'S03_START_RECORDED',
        });
        return;
      }
      if (segmentId === 'S01') {
        this.#actor.send({ type: 'S01_END_RECORDED' });
        void this.#recordS02Start();
        return;
      }
      if (segmentId === 'S02') {
        this.#actor.send({ type: 'S02_END_RECORDED' });
        void this.#recordS03Start();
        return;
      }
      this.#actor.send({ type: 'S03_END_RECORDED' });
    } catch (error) {
      if (this.#disposed) return;
      this.#actor.send({
        type:
          segmentId === 'S01'
            ? eventType === 'segment-start'
              ? 'S01_START_FAILED'
              : 'S01_END_FAILED'
            : segmentId === 'S02'
              ? eventType === 'segment-start'
                ? 'S02_START_FAILED'
                : 'S02_END_FAILED'
              : eventType === 'segment-start'
                ? 'S03_START_FAILED'
                : 'S03_END_FAILED',
        errorCode: timingErrorCode(error),
      });
    }
  }

  async #recordTiming(
    eventType: SegmentTimingEvent['eventType'],
    scope: Pick<SegmentTimingEvent, 'segmentId' | 'sectionId'> = s01TimingScope,
  ): Promise<void> {
    if (this.#timingPort === undefined) return;
    await this.#timingPort.record({ eventType, ...scope });
  }

}
