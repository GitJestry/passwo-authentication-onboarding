import { describe, expect, it } from 'vitest';
import {
  artifactTimingEventSchema,
  createSessionRequestSchema,
  persistedSessionRecordSchema,
  placeholderResponseRequestSchema,
} from './index.js';

describe('research-safe contracts', () => {
  it('rejects additional fields during session creation', () => {
    const result = createSessionRequestSchema.safeParse({
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      consentAccepted: true,
      display_name: 'Alex',
    });

    expect(result.success).toBe(false);
  });

  it('contains no field for participant-facing names or training inputs', () => {
    const keys = Object.keys(persistedSessionRecordSchema.shape);

    expect(keys).not.toContain('display_name');
    expect(keys).not.toContain('training_input');
  });

  it('does not let the client request a study condition', () => {
    const result = createSessionRequestSchema.safeParse({
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      consentAccepted: true,
      condition: 'supportive',
    });

    expect(result.success).toBe(false);
  });

  it('accepts only the bounded placeholder response', () => {
    expect(
      placeholderResponseRequestSchema.safeParse({
        instrumentId: 'pre-placeholder',
        itemId: 'placeholder-complete',
        value: true,
      }).success,
    ).toBe(true);
    expect(
      placeholderResponseRequestSchema.safeParse({
        instrumentId: 'pre-placeholder',
        itemId: 'free-text',
        value: 'participant input',
      }).success,
    ).toBe(false);
  });

  it('allows only bounded artifact and diagnostic visibility events', () => {
    const visibilityEvent = {
      sequence: 0,
      phase: 'artifact',
      sectionId: null,
      segmentId: null,
      eventType: 'visibility-hidden',
      clientMonotonicMs: 10,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: null,
      reasonCode: null,
    };

    expect(artifactTimingEventSchema.safeParse(visibilityEvent).success).toBe(true);
    expect(
      artifactTimingEventSchema.safeParse({ ...visibilityEvent, eventType: 'pause' }).success,
    ).toBe(false);
  });
});
