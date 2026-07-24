import { describe, expect, it } from 'vitest';
import { TRAINING_CONTENT_VERSION, trainingSegments } from './manifest.js';

describe('training segment manifest', () => {
  it('contains the complete and ordered S00-S17 foundation', () => {
    expect(TRAINING_CONTENT_VERSION).toBe('0.3.0-s02-campus-id');
    expect(trainingSegments).toHaveLength(18);
    expect(trainingSegments.map(({ id }) => id)).toEqual(
      Array.from({ length: 18 }, (_, index) => `S${index.toString().padStart(2, '0')}`),
    );
  });
});
