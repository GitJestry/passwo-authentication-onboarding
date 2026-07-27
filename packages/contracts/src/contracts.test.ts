import { describe, expect, it } from 'vitest';
import {
  createSessionRequestSchema,
  persistedSessionRecordSchema,
  researchExportManifestSchema,
  REFERENCE_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_ARTIFACT_VERSION,
  studyTimingEventSchema,
} from './index.js';

describe('research-safe contracts', () => {
  it('allows only approved session fields and excludes local training data', () => {
    const result = createSessionRequestSchema.safeParse({
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      consentAccepted: true,
      displayName: 'Alex',
    });

    expect(result.success).toBe(false);
    expect(Object.keys(persistedSessionRecordSchema.shape)).not.toEqual(
      expect.arrayContaining(['displayName', 'passwordValues', 'trainingInput']),
    );
  });

  it('does not let the client request a study condition', () => {
    expect(
      createSessionRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        consentAccepted: true,
        condition: 'supportive',
      }).success,
    ).toBe(false);
  });

  it('keeps canonical artifact versions and the S00–S03 segment order', () => {
    expect(SUPPORTIVE_ARTIFACT_VERSION).not.toBe(REFERENCE_ARTIFACT_VERSION);
    expect(SUPPORTIVE_ARTIFACT_SEGMENT_IDS).toEqual(['S00', 'S01', 'S02', 'S03']);
    expect(
      studyTimingEventSchema.safeParse({
        sequence: 1,
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S03',
        eventType: 'end',
        clientMonotonicMs: 125,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: 25,
        reasonCode: null,
      }).success,
    ).toBe(true);
  });

  it('keeps researcher exports inside the approved data boundary', () => {
    const manifest = {
      schemaVersion: 'research-export-v1',
      exportedAtIso: '2026-07-24T12:00:00.000Z',
      versions: {
        study: ['walking-skeleton-v1'],
        content: [SUPPORTIVE_ARTIFACT_VERSION],
        questionnaire: ['questionnaire-placeholder-v1'],
        guardrail: ['guardrail-placeholder-v1'],
        consent: ['consent-placeholder-v1'],
        referenceArtifact: [REFERENCE_ARTIFACT_VERSION],
      },
      sessionCounts: [{ condition: 'supportive', completionStatus: 'completed', count: 1 }],
      files: [{ fileName: 'sessions.csv', sha256: 'f'.repeat(64) }],
    };

    expect(researchExportManifestSchema.safeParse(manifest).success).toBe(true);
    expect(
      researchExportManifestSchema.safeParse({ ...manifest, requestBody: 'not-exportable' }).success,
    ).toBe(false);
  });
});
