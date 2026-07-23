import { describe, expect, it } from 'vitest';
import { createSessionRequestSchema, persistedSessionRecordSchema } from './index.js';

describe('research-safe contracts', () => {
  it('rejects additional fields during session creation', () => {
    const result = createSessionRequestSchema.safeParse({
      consentVersion: 'consent-v1',
      studyVersion: 'study-v1',
      display_name: 'Alex',
    });

    expect(result.success).toBe(false);
  });

  it('contains no field for participant-facing names or training inputs', () => {
    const keys = Object.keys(persistedSessionRecordSchema.shape);

    expect(keys).not.toContain('display_name');
    expect(keys).not.toContain('training_input');
  });
});
