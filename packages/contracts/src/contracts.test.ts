import { describe, expect, it } from 'vitest';
import reviewedInstrumentRuntimeManifest from '../../../instrument/research/derived/instruments-v1.runtime.json' with {
  type: 'json',
};
import {
  createSessionRequestSchema,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  persistedSessionRecordSchema,
  researchExportManifestSchema,
  researchExportSessionRecordSchema,
  registerRecontactRequestSchema,
  REFERENCE_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_ARTIFACT_VERSION,
  studyTimingEventSchema,
} from './index.js';

describe('research-safe contracts', () => {
  it('allows only approved session fields and excludes local training data', () => {
    const forbiddenPersonalizationField = ['display', 'Name'].join('');
    const result = createSessionRequestSchema.safeParse({
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      consentAccepted: true,
      followUpConsent: false,
      [forbiddenPersonalizationField]: 'Alex',
    });

    expect(result.success).toBe(false);
    expect(Object.keys(persistedSessionRecordSchema.shape)).not.toEqual(
      expect.arrayContaining([
        forbiddenPersonalizationField,
        'passwordValues',
        'trainingInput',
        'email',
        'rawToken',
      ]),
    );
  });

  it('does not let the client request a study condition', () => {
    expect(
      createSessionRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        consentAccepted: true,
        followUpConsent: false,
        condition: 'supportive',
      }).success,
    ).toBe(false);
  });

  it('keeps email out of session creation and validates it only for recontact registration', () => {
    expect(
      createSessionRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        consentAccepted: true,
        followUpConsent: false,
      }).success,
    ).toBe(true);
    expect(
      createSessionRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        consentAccepted: true,
        followUpConsent: true,
        email: 'person@example.org',
      }).success,
    ).toBe(false);
    for (const forbiddenField of ['rawToken', 'recontactRequestId']) {
      expect(
        createSessionRequestSchema.safeParse({
          requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
          consentAccepted: true,
          followUpConsent: true,
          [forbiddenField]: 'not-allowed',
        }).success,
      ).toBe(false);
    }
    expect(
      registerRecontactRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        email: 'person@example.org',
      }).success,
    ).toBe(true);
    expect(
      registerRecontactRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        email: 'not-an-email',
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
      schemaVersion: 'research-export-v3',
      exportedAtIso: '2026-07-24T12:00:00.000Z',
      runtimeManifestVersion: instrumentRuntimeManifest.runtimeManifestVersion,
      versions: {
        study: ['walking-skeleton-v1'],
        content: [SUPPORTIVE_ARTIFACT_VERSION],
        questionnaire: [instrumentRuntimeManifest.questionnaireVersion],
        guardrail: [instrumentRuntimeManifest.guardrailVersion],
        consent: [instrumentRuntimeManifest.consentVersion],
        followUp: [instrumentRuntimeManifest.followUpVersion],
        referenceArtifact: [REFERENCE_ARTIFACT_VERSION],
      },
      sessionCounts: [{ condition: 'supportive', completionStatus: 'completed', count: 1 }],
      files: [{ fileName: 'sessions.csv', sha256: 'f'.repeat(64) }],
    };

    expect(researchExportManifestSchema.safeParse(manifest).success).toBe(true);
    expect(
      researchExportManifestSchema.safeParse({ ...manifest, requestBody: 'not-exportable' })
        .success,
    ).toBe(false);
    expect(Object.keys(researchExportSessionRecordSchema.shape)).not.toEqual(
      expect.arrayContaining(['email', 'rawToken', 'followUpTokenHash']),
    );
  });

  it('keeps the generated runtime manifest fully synchronized with the reviewed projection', () => {
    expect(instrumentRuntimeManifest).toEqual(reviewedInstrumentRuntimeManifest);
    expect(JSON.stringify(instrumentRuntimeManifest)).not.toMatch(
      /"classification"|"appropriate"|"incomplete"|"unsafe"/u,
    );
  });

  it('validates complete item-specific instrument blocks without arbitrary JSON values', () => {
    const sampleBlock = {
      instrumentId: 'pre-v1',
      sectionId: 'sample',
      responses: [
        { itemId: 'PRE_ROLE', value: 'undergraduate' },
        { itemId: 'PRE_FIELD', value: 'stem' },
        { itemId: 'PRE_AGE', value: 'age_18_25' },
        { itemId: 'PRE_GENDER', value: null },
      ],
    };
    const experienceBlock = {
      instrumentId: 'pre-v1',
      sectionId: 'experience',
      responses: [
        { itemId: 'PRE_SECAWARE', value: 'never_heard' },
        { itemId: 'PRE_TRAINING', value: 'never' },
        { itemId: 'PRE_PM_USE', value: ['none', 'browser_or_device_integrated'] },
        { itemId: 'PRE_MFA_USE', value: 'none' },
        { itemId: 'PRE_FAM_PASSWORDS', value: 3 },
        { itemId: 'PRE_FAM_PM', value: 3 },
        { itemId: 'PRE_FAM_MFA', value: 3 },
      ],
    };
    const selfEfficacyBlock = {
      instrumentId: 'pre-v1',
      sectionId: 'self_efficacy',
      responses: [
        { itemId: 'SE_PASSWORDS_PRE', value: 0 },
        { itemId: 'SE_PM_PRE', value: 5 },
        { itemId: 'SE_MFA_PRE', value: 10 },
      ],
    };

    expect(instrumentSubmissionRequestSchema.safeParse(sampleBlock).success).toBe(true);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        ...sampleBlock,
        responses: sampleBlock.responses.slice(0, -1),
      }).success,
    ).toBe(false);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        ...sampleBlock,
        responses: sampleBlock.responses.map((response, index) =>
          index === 0 ? { ...response, value: { optionId: 'undergraduate' } } : response,
        ),
      }).success,
    ).toBe(false);
    expect(instrumentSubmissionRequestSchema.safeParse(experienceBlock).success).toBe(false);
    expect(instrumentSubmissionRequestSchema.safeParse(selfEfficacyBlock).success).toBe(true);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        ...selfEfficacyBlock,
        responses: selfEfficacyBlock.responses.map((response, index) =>
          index === 0 ? { ...response, value: 11 } : response,
        ),
      }).success,
    ).toBe(false);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        instrumentId: 'post-open-v1',
        sectionId: 'post-open',
        responses: [
          { itemId: 'OPEN_HELPFUL', value: null },
          { itemId: 'OPEN_UNCLEAR', value: '   ' },
        ],
      }).success,
    ).toBe(false);
  });
});
