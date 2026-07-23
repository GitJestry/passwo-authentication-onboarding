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

    const startedAtMs = this.#clock.monotonicNow();
    await this.#write(scope, 'start', startedAtMs, null, null);
    this.#active.set(key, { startedAtMs });
  }

  async end(scope: TimingScope): Promise<number> {
    const key = scopeKey(scope);
    const active = this.#active.get(key);
    if (!active) {
      throw new Error(`Timing scope is not active: ${key}`);
    }

    const endedAtMs = this.#clock.monotonicNow();
    const elapsedMs = Math.max(0, endedAtMs - active.startedAtMs);
    await this.#write(scope, 'end', endedAtMs, elapsedMs, null);
    this.#active.delete(key);
    return elapsedMs;
  }

  async markVisibility(
    scope: TimingScope,
    visible: boolean,
    reasonCode: string | null = null,
  ): Promise<void> {
    await this.#write(
      scope,
      visible ? 'visibility-visible' : 'visibility-hidden',
      this.#clock.monotonicNow(),
      null,
      reasonCode,
    );
  }

  async technicalAbort(scope: TimingScope, reasonCode: string): Promise<void> {
    await this.#write(
      scope,
      'technical-abort',
      this.#clock.monotonicNow(),
      null,
      reasonCode,
    );
  }

  async #write(
    scope: TimingScope,
    eventType: TimingEventType,
    clientMonotonicMs: number,
    elapsedMs: number | null,
    reasonCode: string | null,
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

    await this.#sink.record(event);
    this.#nextSequence += 1;
  }
}
