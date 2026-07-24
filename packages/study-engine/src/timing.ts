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

interface ActiveScope {
  readonly startedAtMs: number;
}

interface PendingTimingWrite {
  readonly event: TimingEvent;
  completion: Promise<void> | null;
}

export const browserClock: ClockPort = {
  monotonicNow: () => globalThis.performance.now(),
  wallClockIso: () => new Date().toISOString(),
};

function scopeKey(scope: TimingScope): string {
  return `${scope.phase}:${scope.sectionId ?? '-'}:${scope.segmentId ?? '-'}`;
}

export class StudyTimerController {
  readonly #clock: ClockPort;
  readonly #sink: TimingSink;
  readonly #active = new Map<string, ActiveScope>();
  readonly #pendingStarts = new Map<string, PendingTimingWrite>();
  readonly #pendingEnds = new Map<string, PendingTimingWrite>();
  readonly #pendingVisibility = new Map<string, PendingTimingWrite>();
  #nextSequence = 0;

  constructor(clock: ClockPort, sink: TimingSink) {
    this.#clock = clock;
    this.#sink = sink;
  }

  async start(scope: TimingScope): Promise<void> {
    const key = scopeKey(scope);
    if (this.#active.has(key)) {
      throw new Error(`Timing scope already active: ${key}`);
    }

    const pending =
      this.#pendingStarts.get(key) ??
      this.#createPendingWrite(scope, 'start', this.#clock.monotonicNow(), null, null);
    this.#pendingStarts.set(key, pending);

    await this.#commit(pending);
    this.#active.set(key, { startedAtMs: pending.event.clientMonotonicMs });
    this.#pendingStarts.delete(key);
  }

  async end(scope: TimingScope): Promise<number> {
    const key = scopeKey(scope);
    const active = this.#active.get(key);
    if (!active) {
      throw new Error(`Timing scope is not active: ${key}`);
    }

    const endedAtMs = this.#clock.monotonicNow();
    const pending =
      this.#pendingEnds.get(key) ??
      this.#createPendingWrite(
        scope,
        'end',
        endedAtMs,
        Math.max(0, endedAtMs - active.startedAtMs),
        null,
      );
    this.#pendingEnds.set(key, pending);

    await this.#commit(pending);
    this.#active.delete(key);
    this.#pendingEnds.delete(key);
    return pending.event.elapsedMs ?? 0;
  }

  async markVisibility(
    scope: TimingScope,
    visible: boolean,
    reasonCode: string | null = null,
  ): Promise<void> {
    const key = scopeKey(scope);
    const eventType = visible ? 'visibility-visible' : 'visibility-hidden';
    const pending =
      this.#pendingVisibility.get(key) ??
      this.#createPendingWrite(scope, eventType, this.#clock.monotonicNow(), null, reasonCode);
    this.#pendingVisibility.set(key, pending);

    if (pending.event.eventType !== eventType || pending.event.reasonCode !== reasonCode) {
      await this.#commitVisibility(key, pending);
      return this.markVisibility(scope, visible, reasonCode);
    }

    await this.#commitVisibility(key, pending);
  }

  async technicalAbort(scope: TimingScope, reasonCode: string): Promise<void> {
    await this.#commit(
      this.#createPendingWrite(
        scope,
        'technical-abort',
        this.#clock.monotonicNow(),
        null,
        reasonCode,
      ),
    );
  }

  #createPendingWrite(
    scope: TimingScope,
    eventType: TimingEventType,
    clientMonotonicMs: number,
    elapsedMs: number | null,
    reasonCode: string | null,
  ): PendingTimingWrite {
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

    return { event, completion: null };
  }

  async #commitVisibility(key: string, pending: PendingTimingWrite): Promise<void> {
    if (pending.completion !== null) {
      return pending.completion;
    }

    const completion = this.#commit(pending);
    pending.completion = completion;
    try {
      await completion;
      if (this.#pendingVisibility.get(key) === pending) {
        this.#pendingVisibility.delete(key);
      }
    } catch (error) {
      pending.completion = null;
      throw error;
    }
  }

  async #commit(pending: PendingTimingWrite): Promise<void> {
    await this.#sink.record(pending.event);
    this.#nextSequence += 1;
  }
}
