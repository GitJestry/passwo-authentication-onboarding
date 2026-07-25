import { createActor, type SnapshotFrom } from 'xstate';
import type { SegmentTimingEvent, SegmentTimingPort } from './mission-controller.js';
import { passwordModuleMachine } from './password-module-machine.js';

const s01TimingScope = {
  segmentId: 'S01',
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
  readonly onComplete: () => void;
}

export type PasswordModuleSnapshot = SnapshotFrom<typeof passwordModuleMachine>;

export class PasswordModuleController {
  readonly #actor: ReturnType<typeof createActor<typeof passwordModuleMachine>>;
  readonly #timingPort: SegmentTimingPort | undefined;
  readonly #onComplete: () => void;
  #disposed = false;
  #completionNotified = false;

  constructor({ accountIds, timingPort, onComplete }: PasswordModuleControllerOptions) {
    if (accountIds.length !== 3) throw new Error('password-module-requires-three-accounts');
    this.#actor = createActor(passwordModuleMachine, { input: { accountIds } });
    this.#timingPort = timingPort;
    this.#onComplete = onComplete;
    this.#actor.start();
  }

  getSnapshot(): PasswordModuleSnapshot {
    return this.#actor.getSnapshot();
  }

  subscribe(listener: (snapshot: PasswordModuleSnapshot) => void): () => void {
    const subscription = this.#actor.subscribe(listener);
    return () => subscription.unsubscribe();
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

  configureAccounts(): void {
    this.#actor.send({ type: 'CONFIGURE_ACCOUNTS' });
  }

  continue(): void {
    if (!this.#actor.getSnapshot().matches({ s01: 'configured' })) return;
    this.#actor.send({ type: 'CONTINUE' });
    void this.#recordS01End();
  }

  retryTiming(): void {
    const snapshot = this.#actor.getSnapshot();
    if (snapshot.matches({ s01: 'startFailed' })) {
      this.#actor.send({ type: 'RETRY_S01_START' });
      void this.#retryS01Timing('segment-start');
      return;
    }
    if (snapshot.matches({ s01: 'endFailed' })) {
      this.#actor.send({ type: 'RETRY_S01_END' });
      void this.#retryS01Timing('segment-end');
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
      this.#notifyComplete();
    } catch (error) {
      if (!this.#disposed) {
        this.#actor.send({ type: 'S01_END_FAILED', errorCode: timingErrorCode(error) });
      }
    }
  }

  async #retryS01Timing(eventType: SegmentTimingEvent['eventType']): Promise<void> {
    try {
      if (this.#timingPort?.retry !== undefined) {
        await this.#timingPort.retry();
      } else {
        await this.#recordTiming(eventType);
      }
      if (this.#disposed) return;
      if (eventType === 'segment-start') {
        this.#actor.send({ type: 'S01_START_RECORDED' });
        return;
      }
      this.#actor.send({ type: 'S01_END_RECORDED' });
      this.#notifyComplete();
    } catch (error) {
      if (this.#disposed) return;
      this.#actor.send({
        type: eventType === 'segment-start' ? 'S01_START_FAILED' : 'S01_END_FAILED',
        errorCode: timingErrorCode(error),
      });
    }
  }

  async #recordTiming(eventType: SegmentTimingEvent['eventType']): Promise<void> {
    if (this.#timingPort === undefined) return;
    await this.#timingPort.record({ eventType, ...s01TimingScope });
  }

  #notifyComplete(): void {
    if (this.#disposed || this.#completionNotified) return;
    this.#completionNotified = true;
    this.#onComplete();
  }
}
