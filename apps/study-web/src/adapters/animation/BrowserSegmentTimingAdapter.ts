import type { SegmentTimingEvent, SegmentTimingPort } from '@passwo/training-engine';

export const segmentTimingEventName = 'passwo:segment-timing';

export class BrowserSegmentTimingAdapter implements SegmentTimingPort {
  async record(event: SegmentTimingEvent): Promise<void> {
    window.dispatchEvent(
      new CustomEvent<SegmentTimingEvent>(segmentTimingEventName, {
        detail: event,
      }),
    );
  }
}
