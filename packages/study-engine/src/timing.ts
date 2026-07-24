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

  constructor(clock: ClockPort, sink: TimingSink) {
    this.#clock = clock;
    this.#sink = sink;
  }

  async start(scope: TimingScope): Promise<void> {
    const key = scopeKey(scope);
    if (this.#scopeLifecycles.has(key)) {
      throw new Error(`Timing scope already started: ${key}`);
    }

    const startedAtMs = this.#clock.monotonicNow();
    const lifecycle: ScopeLifecycle = { startedAtMs, status: 'starting' };
    this.#scopeLifecycles.set(key, lifecycle);
    await this.#enqueue(scope, 'start', startedAtMs, null, null, () => {
      lifecycle.status = 'active';
    });
  }

  async end(scope: TimingScope): Promise<number> {
    const key = scopeKey(scope);
    const lifecycle = this.#scopeLifecycles.get(key);
    if (lifecycle?.status !== 'active') {
      throw new Error(`Timing scope is not active: ${key}`);
    }

    const endedAtMs = this.#clock.monotonicNow();
    const elapsedMs = Math.max(0, endedAtMs - lifecycle.startedAtMs);
    lifecycle.status = 'ending';
    await this.#enqueue(scope, 'end', endedAtMs, elapsedMs, null, () => {
      lifecycle.status = 'ended';
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
    };
    this.#queue.push(queued);
    void this.#drain();
    await queued.attempt.promise;
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
