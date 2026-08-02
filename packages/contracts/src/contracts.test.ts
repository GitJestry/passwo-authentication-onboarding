import { describe, expect, it } from 'vitest';
import reviewedInstrumentRuntimeManifest from '../../../research/derived/instruments-v1.runtime.json' with {
  type: 'json',
};
import {
  type AuthoredStructureDemonstration,
  type LocalPasswordDisposition,
  type PasswordComparisonResult,
  type RuntimeStructureFinding,
  type TheoreticalSearchSpaceModel,
  createSessionRequestSchema,
  designLabScenarioForPath,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  persistedSessionRecordSchema,
  researchExportManifestSchema,
  researchExportSessionRecordSchema,
  registerRecontactRequestSchema,
  REFERENCE_ARTIFACT_VERSION,
  s07RecommendationIds,
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
        's05Result',
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

  it('keeps canonical artifact versions and the S00–S07 segment order', () => {
    expect(SUPPORTIVE_ARTIFACT_VERSION).toBe('supportive-s00-s07-1.8.0');
    expect(SUPPORTIVE_ARTIFACT_VERSION).not.toBe(REFERENCE_ARTIFACT_VERSION);
    expect(SUPPORTIVE_ARTIFACT_SEGMENT_IDS).toEqual([
      'S00',
      'S01',
      'S02',
      'S03',
      'S04',
      'S05',
      'S06',
      'S07',
    ]);
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
    expect(
      studyTimingEventSchema.safeParse({
        sequence: 5,
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S07',
        eventType: 'start',
        clientMonotonicMs: 225,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: null,
        reasonCode: null,
      }).success,
    ).toBe(true);
    expect(
      studyTimingEventSchema.safeParse({
        sequence: 4,
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S06',
        eventType: 'end',
        clientMonotonicMs: 200,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: 25,
        reasonCode: null,
      }).success,
    ).toBe(true);
    expect(
      studyTimingEventSchema.safeParse({
        sequence: 2,
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S04',
        eventType: 'start',
        clientMonotonicMs: 150,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: null,
        reasonCode: null,
      }).success,
    ).toBe(true);
    expect(
      studyTimingEventSchema.safeParse({
        sequence: 3,
        phase: 'artifact',
        sectionId: 'passwords',
        segmentId: 'S05',
        eventType: 'start',
        clientMonotonicMs: 175,
        clientWallClockIso: '2026-07-24T12:00:00.000Z',
        elapsedMs: null,
        reasonCode: null,
      }).success,
    ).toBe(true);
  });

  it('uses only the four deterministic S06 Design Lab routes', () => {
    expect(designLabScenarioForPath('/design-lab/s06-reuse-and-derived')).toBe(
      's06-reuse-and-derived',
    );
    expect(designLabScenarioForPath('/design-lab/s06-unique')).toBeNull();
  });

  it('exposes the five deterministic S07 Auswertung routes', () => {
    expect(designLabScenarioForPath('/design-lab/s07-directly-reached')).toBe(
      's07-directly-reached',
    );
    expect(designLabScenarioForPath('/design-lab/s07-no-change')).toBe('s07-no-change');
    expect(designLabScenarioForPath('/design-lab/s07-score')).toBeNull();
  });

  it('keeps the six S07 recommendation IDs stable and score-free', () => {
    expect(s07RecommendationIds).toEqual([
      'replace-exposed-password',
      'separate-exact-reuse',
      'rebuild-predictable-password',
      'replace-derived-pattern',
      'improve-retrievability',
      'no-change-practice-method',
    ]);
  });

  it('keeps scene and fixture context outside the general password relation result', () => {
    const comparison: PasswordComparisonResult = {
      kind: 'fictional-password-comparison',
      relation: {
        kind: 'derived-variant-match',
        relationId: 'relation:year-and-suffix-changed:14-18:14-18:18-19:18-19',
        transformationId: 'year-and-suffix-changed',
        sourceEvidence: [
          { type: 'span', start: 14, end: 18, token: '2025' },
          { type: 'span', start: 18, end: 19, token: '!' },
        ],
        targetEvidence: [
          { type: 'span', start: 14, end: 18, token: '2026' },
          { type: 'span', start: 18, end: 19, token: '?' },
        ],
        candidate: 'LunaCampusgram2026?',
        explanationId: 's06.relation.year-and-suffix-changed',
      },
      disclaimerId: 'simulation-not-production-strength',
    };
    expect(comparison.relation.kind).toBe('derived-variant-match');
    expect(Object.keys(comparison)).not.toEqual(
      expect.arrayContaining([
        'fixtureId',
        'sourcePassword',
        'targetPassword',
        'sourceAccountId',
        'targetAccountId',
      ]),
    );
  });

  it('separates authored structure demonstrations from runtime structure findings', () => {
    const demonstration: AuthoredStructureDemonstration = {
      kind: 'authoredStructureDemonstration',
      id: 's05-structure-theme',
      relation: 'thematic-relation',
      title: 'Thematischer Zusammenhang',
      tokens: ['Kaffee', 'Tasse', 'Morgen'],
      connectionLabel: 'Morgenroutine',
      passWoExplanation: 'Feste Erklärung.',
      boundaryNote: 'Keine Laufzeitanalyse.',
    };
    const finding: RuntimeStructureFinding = {
      kind: 'runtimeStructureFinding',
      id: 'structure:exact-component-repetition:0-6:6-12',
      findingKind: 'exact-component-repetition',
      evidence: [
        { type: 'span', start: 0, end: 6, token: 'Kaffee' },
        { type: 'span', start: 6, end: 12, token: 'Kaffee' },
      ],
      explanationId: 's05.structure.exact-component-repetition',
      confidence: 'bounded-heuristic',
    };

    expect(demonstration.kind).toBe('authoredStructureDemonstration');
    expect(finding.kind).toBe('runtimeStructureFinding');
    expect(Object.keys(finding)).not.toEqual(
      expect.arrayContaining(['relation', 'title', 'connectionLabel', 'passWoExplanation']),
    );
  });

  it('keeps theoretical demonstrations exact and dispositions explicitly bounded', () => {
    const model: TheoreticalSearchSpaceModel = {
      kind: 'theoretical-search-space-model',
      alphabetSize: 26,
      length: 15,
      attemptsPerSecond: 1_000_000_000_000n,
      totalCandidateCount: 1_677_259_342_285_725_925_376n,
      exhaustiveSearchDuration: {
        wholeSeconds: 1_677_259_342n,
        remainingCandidates: 285_725_925_376n,
        attemptsPerSecond: 1_000_000_000_000n,
      },
      assumptions: {
        independentlyRandomCharacters: true,
        fixedAlphabet: true,
        exhaustiveSearch: true,
      },
    };
    const disposition: LocalPasswordDisposition = {
      kind: 'no-quick-path-recognized',
      explanationId: 's05.disposition.no-quick-path-recognized',
    };

    expect(typeof model.totalCandidateCount).toBe('bigint');
    expect(model.exhaustiveSearchDuration.wholeSeconds).toBe(1_677_259_342n);
    expect(disposition.kind).toBe('no-quick-path-recognized');
    expect(Object.keys(disposition)).not.toEqual(
      expect.arrayContaining(['score', 'crackTime', 'effectiveLength', 'entropy']),
    );
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
      researchExportManifestSchema.safeParse({
        ...manifest,
        requestBody: 'not-exportable',
      }).success,
    ).toBe(false);
    expect(Object.keys(researchExportSessionRecordSchema.shape)).not.toEqual(
      expect.arrayContaining(['email', 'rawToken', 'followUpTokenHash']),
    );
  });

  it('keeps the generated runtime manifest fully synchronized with the reviewed projection', () => {
    expect(instrumentRuntimeManifest).toEqual(reviewedInstrumentRuntimeManifest);
    expect(JSON.stringify(instrumentRuntimeManifest)).not.toMatch(
      /"[^"]*(?:classification|scor(?:e|ing)|derivedMetric)[^"]*"\s*:/iu,
    );
    expect(instrumentRuntimeManifest.procedures.followUpRecontact.optional).toBe(true);
    expect(instrumentRuntimeManifest).toMatchObject({
      instrumentVersion: '1.7.0-draft',
      questionnaireVersion: 'questionnaire-v1.5-draft',
      guardrailVersion: 'guardrail-v3-draft',
      consentVersion: 'consent-v4-draft',
      followUpVersion: 'follow-up-v3-draft',
      runtimeManifestVersion: 'instrument-runtime-v1.7-draft',
    });
    const preItemIds = instrumentRuntimeManifest.instruments['pre-v1'].sections.flatMap((section) =>
      section.items.map((item) => item.id),
    );
    const postInstrument = instrumentRuntimeManifest.instruments['post-v1'];
    const postItemIds = postInstrument.sections.flatMap((section) =>
      section.items.map((item) => item.id),
    );
    expect(preItemIds).toEqual([
      'PRE_ROLE',
      'PRE_FIELD',
      'PRE_AGE',
      'PRE_SECAWARE',
      'PRE_TRAINING',
      'PRE_PM_USE',
      'PRE_MFA_USE',
      'SE_PASSWORDS_PRE',
      'SE_PM_CREATE_STORE_PRE',
      'SE_PM_RETRIEVE_USE_PRE',
      'SE_MFA_PRE',
    ]);
    expect(postInstrument.order).toEqual([
      'time',
      'ueqs',
      'focus',
      'credibility_understanding',
      'self_efficacy',
    ]);
    expect(postItemIds).toHaveLength(26);
    expect(JSON.stringify({ preItemIds, postItemIds })).not.toMatch(
      /PRE_GENDER|PRE_FAM_|FOCUS_TF5|EMOTION_|SE_PM_(?:PRE|POST)/u,
    );
    expect(instrumentRuntimeManifest.instruments['follow-up-v1'].estimatedMinutesRange).toEqual({
      min: 1,
      max: 2,
    });
    expect(instrumentRuntimeManifest.instruments['guardrail-v2'].nativeArtifactCheckPolicy).toEqual(
      {
        passwoNativeLearningChecksRetained: true,
        secAwareNativeQuizIncludedInMeasuredPath: false,
        secAwareQuizRemovalReason: 'avoid_immediate_feedback_contamination_of_external_guardrail',
        externalItemsMustBeNovelAndTransferOriented: true,
      },
    );
    const forms = instrumentRuntimeManifest.instruments['guardrail-v2'].optionPresentation.forms;
    const bestOptionIds = [
      'distinct_per_account',
      'distinct_generate_or_store',
      'additional_barrier',
      'distinct_for_both',
      'unique_with_pm_retrieve',
      'new_unique_and_mfa',
    ];
    expect(
      (['F1', 'F2', 'F3'] as const).map((formId) =>
        instrumentRuntimeManifest.instruments['guardrail-v2'].questionOrder.map(
          (itemId, itemIndex) =>
            forms[formId][itemId]?.indexOf(bestOptionIds[itemIndex] ?? '') ?? -1,
        ),
      ),
    ).toEqual([
      [0, 1, 2, 0, 1, 2],
      [2, 0, 1, 2, 0, 1],
      [1, 2, 0, 1, 2, 0],
    ]);
    expect(JSON.stringify(instrumentRuntimeManifest.procedures.participantInformation)).not.toMatch(
      /zufällig zugeordnet|zwei deutschsprachige Lernangebote werden verglichen/u,
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
      ],
    };
    const experienceBlock = {
      instrumentId: 'pre-v1',
      sectionId: 'experience',
      responses: [
        { itemId: 'PRE_SECAWARE', value: 'never_heard' },
        { itemId: 'PRE_TRAINING', value: 'never' },
        {
          itemId: 'PRE_PM_USE',
          value: ['none', 'browser_or_device_integrated'],
        },
        { itemId: 'PRE_MFA_USE', value: 'none' },
      ],
    };
    const selfEfficacyBlock = {
      instrumentId: 'pre-v1',
      sectionId: 'self_efficacy',
      responses: [
        { itemId: 'SE_PASSWORDS_PRE', value: 0 },
        { itemId: 'SE_PM_CREATE_STORE_PRE', value: 5 },
        { itemId: 'SE_PM_RETRIEVE_USE_PRE', value: 5 },
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
