import type { SegmentTimingEvent, SegmentTimingPort } from '@passwo/training-engine';

export class BrowserSegmentTimingAdapter implements SegmentTimingPort {
  readonly #timingPort: SegmentTimingPort | undefined;
  readonly blocksMissionTiming: boolean;

  constructor(timingPort?: SegmentTimingPort) {
    this.#timingPort = timingPort;
    this.blocksMissionTiming = timingPort !== undefined;
  }

  async record(event: SegmentTimingEvent): Promise<void> {
    if (this.#timingPort === undefined) return;
    await this.#timingPort.record(event);
  }

  async retry(): Promise<void> {
    if (this.#timingPort?.retry === undefined) return;
    await this.#timingPort.retry();
  }
}
