import { SUPPORTIVE_ARTIFACT_VERSION as contractSupportiveArtifactVersion } from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import { SUPPORTIVE_ARTIFACT_VERSION, trainingSegments } from './manifest.js';
import { S00_CONTENT_VERSION } from './s00.js';

describe('training segment manifest', () => {
  it('contains the complete and ordered S00-S17 foundation', () => {
    expect(SUPPORTIVE_ARTIFACT_VERSION).toBe(contractSupportiveArtifactVersion);
    expect(SUPPORTIVE_ARTIFACT_VERSION).toBe(`supportive-s00-${S00_CONTENT_VERSION}`);
    expect(trainingSegments).toHaveLength(18);
    expect(trainingSegments.map(({ id }) => id)).toEqual(
      Array.from({ length: 18 }, (_, index) => `S${index.toString().padStart(2, '0')}`),
    );
  });
});
