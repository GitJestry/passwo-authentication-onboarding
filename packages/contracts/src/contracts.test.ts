import { createHash } from 'node:crypto';
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
  deletionCodeSchema,
  designLabScenarioForPath,
  hashDeletionCode,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  persistedSessionRecordSchema,
  researchAnalysisPresentationRecordSchema,
  researchAnalysisResponseRecordSchema,
  researchAnalysisSessionRecordSchema,
  researchAnalysisTimingRecordSchema,
  researchExportManifestSchema,
  researchExportProfileSchema,
  researchExportSessionRecordSchema,
  registerRecontactRequestSchema,
  REFERENCE_ARTIFACT_VERSION,
  s07RecommendationIds,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_ARTIFACT_VERSION,
  studyTimingEventSchema,
  studyDataDeletionReportSchema,
} from './index.js';

const validDeletionCodeHash = 'a'.repeat(64);

describe('research-safe contracts', () => {
  it('allows only approved session fields and excludes local training data', () => {
    const forbiddenPersonalizationField = ['display', 'Name'].join('');
    const result = createSessionRequestSchema.safeParse({
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      consentAccepted: true,
      followUpConsent: false,
      deletionCodeHash: validDeletionCodeHash,
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
        deletionCodeHash: validDeletionCodeHash,
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
        deletionCodeHash: validDeletionCodeHash,
      }).success,
    ).toBe(true);
    expect(
      createSessionRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        consentAccepted: true,
        followUpConsent: true,
        deletionCodeHash: validDeletionCodeHash,
        email: 'person@example.org',
      }).success,
    ).toBe(false);
    for (const forbiddenField of ['rawToken', 'recontactRequestId']) {
      expect(
        createSessionRequestSchema.safeParse({
          requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
          consentAccepted: true,
          followUpConsent: true,
          deletionCodeHash: validDeletionCodeHash,
          [forbiddenField]: 'not-allowed',
        }).success,
      ).toBe(false);
    }

    for (const forbiddenIdentityField of ['deletionCode', 'researchCode', 'researchId']) {
      expect(
        createSessionRequestSchema.safeParse({
          requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
          consentAccepted: true,
          followUpConsent: true,
          deletionCodeHash: validDeletionCodeHash,
          [forbiddenIdentityField]: 'not-allowed',
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

  it('uses the PW deletion-code format and shared SHA-256 lookup hash', async () => {
    const deletionCode = deletionCodeSchema.parse('PW-AB12-CD34-EF56-7890');
    const deletionCodeHash = await hashDeletionCode(deletionCode);

    expect(deletionCodeHash).toBe(
      createHash('sha256').update(deletionCode, 'utf8').digest('hex'),
    );
    expect(deletionCodeSchema.safeParse('PW-ab12-CD34-EF56-7890').success).toBe(false);
  });

  it('limits local deletion reports to table names and affected record counts', () => {
    const report = {
      tables: [
        { table: 'study_sessions', count: 1 },
        { table: 'assignment_slots', count: 1 },
        { table: 'guardrail_form_slots', count: 1 },
        { table: 'artifact_leases', count: 1 },
        { table: 'timing_events', count: 1 },
        { table: 'instrument_submissions', count: 1 },
        { table: 'responses', count: 3 },
        { table: 'response_presentations', count: 4 },
        { table: 'recontact.registrations', count: 1 },
      ],
    };

    expect(studyDataDeletionReportSchema.safeParse(report).success).toBe(true);
    expect(
      studyDataDeletionReportSchema.safeParse({
        ...report,
        email: 'not-allowed@example.org',
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

  it('keeps the seven S07 recommendation IDs stable and score-free', () => {
    expect(s07RecommendationIds).toEqual([
      'replace-exposed-password',
      'separate-exact-reuse',
      'rebuild-predictable-password',
      'rebuild-below-length-orientation',
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
      estimatedGuesses: 1_000_000,
      quickPathThreshold: 100_000,
      lengthOrientation: 'at-least-15',
      analysisVersion: 'passwo-bounded-guess-path-v2',
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
      schemaVersion: 'research-export-v5',
      profile: 'audit',
      schemaProfileVersion: 'research-audit-v1',
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
      freeTextReview: { recordCount: 0, status: 'included-in-audit' },
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
      expect.arrayContaining([
        'sessionId',
        'participantCode',
        'deletionCode',
        'deletionCodeHash',
        'email',
        'rawToken',
        'followUpTokenHash',
      ]),
    );
    expect(researchExportProfileSchema.options).toEqual(['audit', 'analysis']);
    expect(Object.keys(researchAnalysisSessionRecordSchema.shape)).not.toEqual(
      expect.arrayContaining(['createdAtIso', 'completedAtIso']),
    );
    expect(Object.keys(researchAnalysisTimingRecordSchema.shape)).not.toEqual(
      expect.arrayContaining([
        'clientMonotonicMs',
        'clientWallClockIso',
        'serverReceivedAtIso',
      ]),
    );
    expect(Object.keys(researchAnalysisResponseRecordSchema.shape)).not.toContain('createdAtIso');
    expect(Object.keys(researchAnalysisPresentationRecordSchema.shape)).not.toContain(
      'createdAtIso',
    );
    expect(
      researchExportManifestSchema.safeParse({
        ...manifest,
        profile: 'analysis',
      }).success,
    ).toBe(false);
  });

  it('keeps the generated runtime manifest fully synchronized with the frozen projection', () => {
    expect(instrumentRuntimeManifest).toEqual(reviewedInstrumentRuntimeManifest);
    expect(JSON.stringify(instrumentRuntimeManifest)).not.toMatch(
      /"[^"]*(?:classification|scor(?:e|ing)|derivedMetric)[^"]*"\s*:/iu,
    );
    expect(instrumentRuntimeManifest.procedures.followUpRecontact.optional).toBe(true);
    expect(instrumentRuntimeManifest).toMatchObject({
      instrumentVersion: '2.0.0',
      questionnaireVersion: 'questionnaire-v2',
      guardrailVersion: 'guardrail-v4',
      consentVersion: 'consent-v6-draft',
      followUpVersion: 'follow-up-v4',
      runtimeManifestVersion: 'instrument-runtime-v2',
    });
    expect(Object.keys(instrumentRuntimeManifest.instruments)).toEqual([
      'pre-v1',
      'post-v1',
      'guardrail-v2',
      'post-open-v1',
    ]);

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
      'PRE_TRAINING',
      'PRE_PM_USE',
      'PRE_MFA_USE',
      'SE_DISTINCT_ACCESS_PRE',
      'SE_PM_NEW_ACCOUNT_PRE',
      'SE_PM_LOGIN_PRE',
      'SE_MFA_ENABLE_PRE',
    ]);
    expect(postInstrument.order).toEqual([
      'ueqs',
      'content_trustworthiness',
      'duration',
      'design_diagnostics',
      'risk_understanding',
      'self_efficacy',
      'secaware_prior_exposure',
    ]);
    expect(postItemIds).toHaveLength(28);
    expect(JSON.stringify({ preItemIds, postItemIds })).not.toMatch(
      /PRE_GENDER|PRE_FAM_|TIME_FELT|TIME_VALUE|FOCUS_TF|EMOTION_|CRED_/u,
    );

    const guardrail = instrumentRuntimeManifest.instruments['guardrail-v2'];
    expect(guardrail.blocks.map((block) => block.id)).toEqual(['scenarios', 'recognition']);
    expect(guardrail.nativeArtifactCheckPolicy).toEqual({
      passwoNativeLearningChecksRetained: true,
      secAwareNativeQuizIncludedInMeasuredPath: false,
      secAwareQuizRemovalReason: 'avoid_immediate_feedback_contamination_of_external_guardrail',
      externalItemsMustBeNovelAndTransferOriented: true,
    });
    const forms = guardrail.optionPresentation.forms;
    const correctOptionIds = [
      'new_distinct_both',
      'own_with_pm',
      'unique_and_mfa',
      'same_tried_elsewhere',
      'account_specific_store_use',
      'additional_barrier',
    ];
    const formIds = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'] as const;
    for (const itemIndex of guardrail.questionOrder.keys()) {
      const itemId = guardrail.questionOrder[itemIndex];
      const correctOptionId = correctOptionIds[itemIndex];
      if (itemId === undefined || correctOptionId === undefined) throw new Error('test-fixture');
      expect(
        formIds.map((formId) => forms[formId][itemId]?.indexOf(correctOptionId) ?? -1).sort(),
      ).toEqual([0, 0, 1, 1, 2, 2]);
      expect(formIds.every((formId) => forms[formId][itemId]?.at(-1) === 'unsure')).toBe(true);
    }
    expect(
      new Set(Object.values(guardrail.questionPresentation.scenarioOrderByForm).map(String)).size,
    ).toBe(6);
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
        { itemId: 'SE_DISTINCT_ACCESS_PRE', value: 0 },
        { itemId: 'SE_PM_NEW_ACCOUNT_PRE', value: 5 },
        { itemId: 'SE_PM_LOGIN_PRE', value: 5 },
        { itemId: 'SE_MFA_ENABLE_PRE', value: 10 },
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
        responses: [{ itemId: 'OPEN_COMMENT', value: null }],
      }).success,
    ).toBe(true);
  });
});
