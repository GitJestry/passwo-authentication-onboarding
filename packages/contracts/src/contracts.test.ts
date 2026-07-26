import { describe, expect, it } from 'vitest';
import {
  type AuthoredPasswordComparisonResult,
  artifactTimingEventSchema,
  createSessionRequestSchema,
  designLabPaths,
  designLabScenarioForPath,
  persistedSessionRecordSchema,
  placeholderResponseRequestSchema,
  REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_ENTRY_POINT,
  REFERENCE_ARTIFACT_OPEN_SUPPLEMENT_MESSAGE_TYPE,
  REFERENCE_ARTIFACT_ROUTE_PREFIX,
  REFERENCE_ARTIFACT_URL,
  REFERENCE_ARTIFACT_VERSION,
  referenceSupplementLinkForId,
  referenceSupplementLinkIdSchema,
  referenceSupplementLinks,
  researchExportManifestSchema,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_ARTIFACT_VERSION,
  studyTimingEventSchema,
} from './index.js';

const authoredComparisonFixture = {
  source: 'authored-fixture',
  fixtureId: 's06-similar',
  sourceAccountId: 'campus-board',
  targetAccountId: 'campus-mail',
  outcome: 'similar',
  context: 'actual-selection',
  cues: ['shared-core', 'similar-construction'],
} as const satisfies AuthoredPasswordComparisonResult;

describe('research-safe contracts', () => {
  it('models S06 outcomes as authored fixtures rather than heuristic output', () => {
    expect(authoredComparisonFixture).toEqual(
      expect.objectContaining({
        source: 'authored-fixture',
        outcome: 'similar',
        context: 'actual-selection',
      }),
    );
  });

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

  it('associates conditions with distinct canonical artifact versions', () => {
    const artifactVersionForCondition = {
      supportive: SUPPORTIVE_ARTIFACT_VERSION,
      reference: REFERENCE_ARTIFACT_VERSION,
    } as const;

    expect(artifactVersionForCondition.supportive).toBe(SUPPORTIVE_ARTIFACT_VERSION);
    expect(artifactVersionForCondition.reference).toBe(REFERENCE_ARTIFACT_VERSION);
    expect(SUPPORTIVE_ARTIFACT_VERSION).not.toBe(REFERENCE_ARTIFACT_VERSION);
  });

  it('defines one canonical local reference entry URL', () => {
    expect(REFERENCE_ARTIFACT_VERSION).toBe(
      'secaware-passwords-authentication-v9-study-adapted-2026-07-26-r2',
    );
    expect(REFERENCE_ARTIFACT_URL).toBe(
      `${REFERENCE_ARTIFACT_ROUTE_PREFIX}${REFERENCE_ARTIFACT_ENTRY_POINT}?StandAlone=true`,
    );
    expect(REFERENCE_ARTIFACT_URL).not.toMatch(/^https?:\/\//u);
    expect(REFERENCE_ARTIFACT_COMPLETION_MESSAGE_TYPE).toBe('passwo:reference-completed');
    expect(REFERENCE_ARTIFACT_OPEN_SUPPLEMENT_MESSAGE_TYPE).toBe(
      'passwo:reference-open-supplement',
    );
  });

  it('exposes exactly the frozen reference supplement registry', () => {
    expect(referenceSupplementLinks).toHaveLength(12);
    expect(new Set(referenceSupplementLinks.map(({ id }) => id)).size).toBe(12);
    expect(referenceSupplementLinks.every(({ url }) => new URL(url).protocol === 'https:')).toBe(
      true,
    );

    const firstLinkId = referenceSupplementLinkIdSchema.parse('passwords-bsi-checklist');
    expect(referenceSupplementLinkForId(firstLinkId).url).toContain('sichere_passwoerter');
    expect(referenceSupplementLinkIdSchema.safeParse('not-frozen').success).toBe(false);
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

  function supportiveSegmentStart(segmentId: (typeof SUPPORTIVE_ARTIFACT_SEGMENT_IDS)[number]) {
    return {
      sequence: 1,
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId,
      eventType: 'start',
      clientMonotonicMs: 125,
      clientWallClockIso: '2026-07-24T12:00:00.000Z',
      elapsedMs: null,
      reasonCode: null,
    };
  }

  it('defines and accepts the canonical implemented supportive segment order', () => {
    expect(SUPPORTIVE_ARTIFACT_SEGMENT_IDS).toEqual(['S00', 'S01', 'S02']);
    expect(studyTimingEventSchema.safeParse(supportiveSegmentStart('S01')).success).toBe(true);
    expect(studyTimingEventSchema.safeParse(supportiveSegmentStart('S02')).success).toBe(true);
  });

  it('accepts S01 end', () => {
    expect(
      studyTimingEventSchema.safeParse({
        ...supportiveSegmentStart('S01'),
        eventType: 'end',
        elapsedMs: 225,
      }).success,
    ).toBe(true);
  });

  it('rejects unknown supportive segment IDs', () => {
    const segmentStart = supportiveSegmentStart('S00');

    expect(studyTimingEventSchema.safeParse({ ...segmentStart, segmentId: 'S03' }).success).toBe(
      false,
    );
    expect(
      studyTimingEventSchema.safeParse({ ...segmentStart, segmentId: 'unexpected-segment' })
        .success,
    ).toBe(false);
  });

  it('keeps S00 timing validation and the passwords section boundary', () => {
    const segmentStart = supportiveSegmentStart('S00');

    expect(studyTimingEventSchema.safeParse(segmentStart).success).toBe(true);
    expect(
      studyTimingEventSchema.safeParse({
        ...segmentStart,
        eventType: 'end',
        elapsedMs: 225,
      }).success,
    ).toBe(true);
    expect(studyTimingEventSchema.safeParse({ ...segmentStart, sectionId: 'mfa' }).success).toBe(
      false,
    );
    expect(studyTimingEventSchema.safeParse({ ...segmentStart, elapsedMs: 0 }).success).toBe(false);
  });

  it('keeps researcher exports inside the approved data boundary', () => {
    const manifest = researchExportManifestSchema.safeParse({
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
      files: [
        {
          fileName: 'sessions.csv',
          sha256: 'f'.repeat(64),
        },
      ],
    });

    expect(manifest.success).toBe(true);
    expect(
      researchExportManifestSchema.safeParse({
        ...manifest.data,
        requestBody: 'never exported',
      }).success,
    ).toBe(false);
  });

  it('defines the same explicit Design-Lab paths for server and client use', () => {
    expect(designLabPaths).toContain('/design-lab/s02-campus-id');
    expect(designLabScenarioForPath('/design-lab')).toBe('normal');
    expect(designLabScenarioForPath('/design-lab/s06-similar')).toBe('s06-similar');
    expect(designLabScenarioForPath('/design-lab/s02')).toBeNull();
    expect(designLabScenarioForPath('/design-lab/unknown')).toBeNull();
  });
});
