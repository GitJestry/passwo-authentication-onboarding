import type {
  SegmentId,
  StudyPhase,
  TimingEvent,
  TimingEventType,
  TrainingSectionId,
} from '@passwo/contracts';

export interface ClockPort {
  monotonicNow(): number;
  wallClockIso(): string;
}

export interface TimingSink {
  record(event: TimingEvent): Promise<void>;
}

export interface TimingScope {
  readonly phase: StudyPhase;
  readonly sectionId?: TrainingSectionId;
  readonly segmentId?: SegmentId;
}

interface ScopeLifecycle {
  readonly startedAtMs: number;
  status: 'starting' | 'active' | 'ending' | 'ended';
  startWrite: Promise<void> | null;
}

interface WriteAttempt {
  readonly promise: Promise<void>;
  resolve(): void;
  reject(error: unknown): void;
}

interface QueuedTimingWrite {
  readonly event: TimingEvent;
  readonly onPersisted: () => void;
  attempt: WriteAttempt;
  status: 'queued' | 'writing' | 'failed';
  error: unknown | null;
}

export const browserClock: ClockPort = {
  monotonicNow: () => globalThis.performance.now(),
  wallClockIso: () => new Date().toISOString(),
};

function scopeKey(scope: TimingScope): string {
  return `${scope.phase}:${scope.sectionId ?? '-'}:${scope.segmentId ?? '-'}`;
}

function createWriteAttempt(): WriteAttempt {
  let resolveAttempt = () => {};
  let rejectAttempt = (_error: unknown) => {};
  const promise = new Promise<void>((resolve, reject) => {
    resolveAttempt = resolve;
    rejectAttempt = reject;
  });
  return {
    promise,
    resolve: resolveAttempt,
    reject: rejectAttempt,
  };
}

export class StudyTimerController {
  readonly #clock: ClockPort;
  readonly #sink: TimingSink;
  readonly #scopeLifecycles = new Map<string, ScopeLifecycle>();
  readonly #queue: QueuedTimingWrite[] = [];
  #nextSequence = 0;
  #processing = false;
  #activeSegmentScopeKey: string | null = null;

  constructor(clock: ClockPort, sink: TimingSink) {
    this.#clock = clock;
    this.#sink = sink;
  }

  async start(scope: TimingScope): Promise<void> {
    const key = scopeKey(scope);
    const existingLifecycle = this.#scopeLifecycles.get(key);
    if (existingLifecycle?.status === 'starting' && existingLifecycle.startWrite !== null) {
      await existingLifecycle.startWrite;
      return;
    }
    if (existingLifecycle?.status === 'starting' && this.#isFailedWrite(scope, 'start')) {
      throw this.#failedWriteError(scope, 'start');
    }
    if (existingLifecycle?.status === 'active' && scope.segmentId !== undefined) {
      return;
    }
    if (existingLifecycle !== undefined) {
      throw new Error(`Timing scope already started: ${key}`);
    }
    if (scope.segmentId !== undefined && this.#activeSegmentScopeKey !== null) {
      throw new Error(`Timing segment already active: ${this.#activeSegmentScopeKey}`);
    }

    const startedAtMs = this.#clock.monotonicNow();
    const lifecycle: ScopeLifecycle = { startedAtMs, status: 'starting', startWrite: null };
    this.#scopeLifecycles.set(key, lifecycle);
    if (scope.segmentId !== undefined) this.#activeSegmentScopeKey = key;
    const startWrite = this.#enqueue(scope, 'start', startedAtMs, null, null, () => {
      lifecycle.status = 'active';
    });
    lifecycle.startWrite = startWrite;
    await startWrite;
  }

  async end(scope: TimingScope): Promise<number> {
    const key = scopeKey(scope);
    const lifecycle = this.#scopeLifecycles.get(key);
    if (lifecycle?.status === 'ending' && this.#isFailedWrite(scope, 'end')) {
      throw this.#failedWriteError(scope, 'end');
    }
    if (lifecycle?.status !== 'active') {
      throw new Error(`Timing scope is not active: ${key}`);
    }

    const endedAtMs = this.#clock.monotonicNow();
    const elapsedMs = Math.max(0, endedAtMs - lifecycle.startedAtMs);
    lifecycle.status = 'ending';
    await this.#enqueue(scope, 'end', endedAtMs, elapsedMs, null, () => {
      lifecycle.status = 'ended';
      if (scope.segmentId !== undefined) this.#activeSegmentScopeKey = null;
    });
    return elapsedMs;
  }

  async markVisibility(
    scope: TimingScope,
    visible: boolean,
    reasonCode: string | null = null,
  ): Promise<void> {
    const key = scopeKey(scope);
    const lifecycle = this.#scopeLifecycles.get(key);
    if (lifecycle?.status !== 'starting' && lifecycle?.status !== 'active') {
      throw new Error(`Timing scope does not accept visibility events: ${key}`);
    }

    await this.#enqueue(
      scope,
      visible ? 'visibility-visible' : 'visibility-hidden',
      this.#clock.monotonicNow(),
      null,
      reasonCode,
    );
  }

  async technicalAbort(scope: TimingScope, reasonCode: string): Promise<void> {
    await this.#enqueue(scope, 'technical-abort', this.#clock.monotonicNow(), null, reasonCode);
  }

  async retryFailed(): Promise<TimingEvent> {
    const failed = this.#queue[0];
    if (failed?.status !== 'failed') {
      throw new Error('No failed timing write to retry');
    }

    failed.attempt = createWriteAttempt();
    failed.error = null;
    failed.status = 'queued';
    const retry = failed.attempt.promise;
    void this.#drain(true);
    await retry;
    return failed.event;
  }

  async #enqueue(
    scope: TimingScope,
    eventType: TimingEventType,
    clientMonotonicMs: number,
    elapsedMs: number | null,
    reasonCode: string | null,
    onPersisted: () => void = () => {},
  ): Promise<void> {
    const event: TimingEvent = {
      sequence: this.#nextSequence,
      phase: scope.phase,
      sectionId: scope.sectionId ?? null,
      segmentId: scope.segmentId ?? null,
      eventType,
      clientMonotonicMs,
      clientWallClockIso: this.#clock.wallClockIso(),
      elapsedMs,
      reasonCode,
    };
    this.#nextSequence += 1;

    const queued: QueuedTimingWrite = {
      event,
      onPersisted,
      attempt: createWriteAttempt(),
      status: 'queued',
      error: null,
    };
    this.#queue.push(queued);
    void this.#drain();
    await queued.attempt.promise;
  }

  #isFailedWrite(scope: TimingScope, eventType: TimingEventType): boolean {
    const failed = this.#queue[0];
    return (
      failed?.status === 'failed' &&
      failed.event.eventType === eventType &&
      failed.event.phase === scope.phase &&
      failed.event.sectionId === (scope.sectionId ?? null) &&
      failed.event.segmentId === (scope.segmentId ?? null)
    );
  }

  #failedWriteError(scope: TimingScope, eventType: TimingEventType): unknown {
    const failed = this.#queue[0];
    if (failed !== undefined && this.#isFailedWrite(scope, eventType) && failed.error !== null) {
      return failed.error;
    }
    return new Error(`Timing write failed: ${scopeKey(scope)}:${eventType}`);
  }

  async #drain(pauseAfterFirstSuccess = false): Promise<void> {
    if (this.#processing) return;
    this.#processing = true;

    while (this.#queue.length > 0) {
      const current = this.#queue[0];
      if (current === undefined || current.status === 'failed') break;

      current.status = 'writing';
      try {
        await this.#sink.record(current.event);
      } catch (error) {
        current.status = 'failed';
        current.error = error;
        current.attempt.reject(error);
        this.#processing = false;
        return;
      }

      this.#queue.shift();
      current.onPersisted();
      current.attempt.resolve();
      if (pauseAfterFirstSuccess) {
        this.#processing = false;
        queueMicrotask(() => {
          void this.#drain();
        });
        return;
      }
    }

    this.#processing = false;
  }
}
