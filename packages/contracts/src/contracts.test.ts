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
  type TransientPasswordSemanticEvidence,
  confirmArtifactCheckpointRequestSchema,
  createSessionRequestSchema,
  deletionCodeSchema,
  designLabPathForTrainingQaSegment,
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
  REFERENCE_ARTIFACT_VERSION,
  registerRecontactRequestSchema,
  s07RecommendationIds,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_ARTIFACT_VERSION,
  supportiveSectionResumeTargetFor,
  supportiveS08ResumeStateSchema,
  studyTimingEventSchema,
  studyDataDeletionReportSchema,
  webCreateSessionRequestSchema,
  webCreateSessionResponseSchema,
  webResumeSessionSchema,
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

  it('keeps optional recontact separate from session creation', () => {
    for (const followUpConsent of [false, true]) {
      expect(
        createSessionRequestSchema.safeParse({
          requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
          consentAccepted: true,
          followUpConsent,
          deletionCodeHash: validDeletionCodeHash,
        }).success,
      ).toBe(true);
    }

    expect(
      createSessionRequestSchema.safeParse({
        requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
        consentAccepted: true,
        followUpConsent: true,
        deletionCodeHash: validDeletionCodeHash,
        email: 'person@example.org',
      }).success,
    ).toBe(false);
    expect(
      registerRecontactRequestSchema.safeParse({
        requestId: '741030de-7eb7-4686-8d23-b463114f8c7d',
        email: 'person@example.org',
      }).success,
    ).toBe(true);
    expect(
      registerRecontactRequestSchema.safeParse({
        requestId: '741030de-7eb7-4686-8d23-b463114f8c7d',
        email: 'not-an-email',
      }).success,
    ).toBe(false);
    expect(
      registerRecontactRequestSchema.safeParse({
        requestId: '741030de-7eb7-4686-8d23-b463114f8c7d',
        email: 'person@example.org',
        rawToken: 'not-allowed',
      }).success,
    ).toBe(false);

    for (const forbiddenIdentityField of ['deletionCode', 'researchCode', 'researchId']) {
      expect(
        createSessionRequestSchema.safeParse({
          requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
          consentAccepted: true,
          followUpConsent: false,
          deletionCodeHash: validDeletionCodeHash,
          [forbiddenIdentityField]: 'not-allowed',
        }).success,
      ).toBe(false);
    }
  });

  it('uses the PW deletion-code format and shared SHA-256 lookup hash', async () => {
    const deletionCode = deletionCodeSchema.parse('PW-AB12-CD34-EF56-7890');
    const deletionCodeHash = await hashDeletionCode(deletionCode);

    expect(deletionCodeHash).toBe(
      createHash('sha256').update(deletionCode, 'utf8').digest('hex'),
    );
    expect(deletionCodeSchema.safeParse('PW-ab12-CD34-EF56-7890').success).toBe(false);
  });

  it('returns the deletion code only from the web server and restores it with the session', () => {
    const request = {
      requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
      consentAccepted: true,
      followUpConsent: false,
      recontact: null,
    };
    expect(webCreateSessionRequestSchema.safeParse(request).success).toBe(true);
    expect(
      webCreateSessionRequestSchema.safeParse({
        ...request,
        deletionCodeHash: validDeletionCodeHash,
      }).success,
    ).toBe(false);

    const deletionCode = deletionCodeSchema.parse('PW-AB12-CD34-EF56-7890');
    expect(
      webCreateSessionResponseSchema.safeParse({
        sessionId: '6b51a541-5e36-4c24-88ea-2ec05e41e72d',
        condition: 'supportive',
        assignmentMode: 'forced-supportive',
        guardrailFormId: 'F1',
        deletionCode,
      }).success,
    ).toBe(true);
    expect(
      webResumeSessionSchema.safeParse({
        sessionId: '6b51a541-5e36-4c24-88ea-2ec05e41e72d',
        condition: 'supportive',
        assignmentMode: 'forced-supportive',
        guardrailFormId: 'F1',
        followUpConsent: false,
        checkpoint: 'pre-questionnaire',
        resumeTarget: 'pre-questionnaire',
        nextInstrumentBlockIndex: 0,
        artifactSessionElapsedMs: null,
        interrupted: true,
        deletionCode,
        supportiveS08ResumeState: null,
      }).success,
    ).toBe(true);
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
        { table: 'web_resume_tokens', count: 1 },
        { table: 'web_artifact_intervals', count: 1 },
        { table: 'web_segment_timing_events', count: 2 },
        { table: 'web_artifact_visibility_events', count: 1 },
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
    expect(SUPPORTIVE_ARTIFACT_VERSION).toBe('supportive-s00-s13-1.10.0');
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
    expect(supportiveSectionResumeTargetFor('S00')).toEqual({
      sectionId: 'passwords',
      segmentId: 'S00',
    });
    for (const checkpoint of SUPPORTIVE_ARTIFACT_SEGMENT_IDS.slice(1)) {
      expect(supportiveSectionResumeTargetFor(checkpoint)).toEqual({
        sectionId: 'passwords',
        segmentId: 'S01',
      });
    }
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

  it('allows only the minimal non-reconstructive S08 resume state', () => {
    const resumeState = {
      schemaVersion: 'supportive-s08-resume-v1',
      passphraseIds: {
        campusgram: 'passphrase-01-hyphen',
        masterCampus: 'passphrase-02-hyphen',
        campusEmail: 'passphrase-03-hyphen',
      },
      weakAccountIds: ['master-campus'],
      relationships: [
        { id: 'campusgram--master-campus', kind: 'identical' },
        { id: 'master-campus--campus-email', kind: 'similar' },
      ],
    };
    expect(supportiveS08ResumeStateSchema.safeParse(resumeState).success).toBe(true);
    expect(
      confirmArtifactCheckpointRequestSchema.safeParse({
        intervalId: 'b185bbd8-2088-47d2-b45a-924c8d8778ea',
        checkpoint: 'supportive:S08',
        resumeState,
      }).success,
    ).toBe(true);
    const resumeSession = {
      sessionId: '6b51a541-5e36-4c24-88ea-2ec05e41e72d',
      condition: 'supportive',
      assignmentMode: 'forced-supportive',
      guardrailFormId: 'F1',
      followUpConsent: false,
      checkpoint: 'supportive:S08',
      resumeTarget: 'artifact',
      nextInstrumentBlockIndex: 2,
      artifactSessionElapsedMs: 125,
      interrupted: true,
      deletionCode: 'PW-AB12-CD34-EF56-7890',
      supportiveS08ResumeState: resumeState,
    };
    expect(webResumeSessionSchema.safeParse(resumeSession).success).toBe(true);
    expect(
      webResumeSessionSchema.safeParse({
        ...resumeSession,
        checkpoint: 'supportive:S07',
      }).success,
    ).toBe(false);
    expect(
      webResumeSessionSchema.safeParse({
        ...resumeSession,
        supportiveS08ResumeState: null,
      }).success,
    ).toBe(false);
    for (const forbiddenField of [
      'password',
      'passwordPart',
      'spans',
      'semanticEvidence',
      'displayName',
    ]) {
      expect(
        supportiveS08ResumeStateSchema.safeParse({
          ...resumeState,
          [forbiddenField]: 'participant-created-secret',
        }).success,
      ).toBe(false);
    }
    expect(
      supportiveS08ResumeStateSchema.safeParse({
        ...resumeState,
        passphraseIds: {
          ...resumeState.passphraseIds,
          campusEmail: 'passphrase-02-dot',
        },
      }).success,
    ).toBe(false);
  });

  it('uses only the four deterministic S06 Design Lab routes', () => {
    expect(designLabScenarioForPath('/design-lab/s06-reuse-and-derived')).toBe(
      's06-reuse-and-derived',
    );
    expect(designLabScenarioForPath('/design-lab/s06-unique')).toBeNull();
  });

  it('exposes the S07 passphrase-search route', () => {
    expect(designLabScenarioForPath('/design-lab/s07-passphrase-search')).toBe(
      's07-passphrase-search',
    );
    expect(designLabScenarioForPath('/design-lab/s08-network-replay')).toBe(
      's08-network-replay',
    );
    expect(designLabScenarioForPath('/design-lab/s08-strong-relations')).toBe(
      's08-strong-relations',
    );
    expect(designLabScenarioForPath('/design-lab/s08-weak-mixed-relations')).toBe(
      's08-weak-mixed-relations',
    );
    expect(designLabScenarioForPath('/design-lab/s09-password-manager-transition')).toBe(
      's09-password-manager-transition',
    );
    expect(designLabScenarioForPath('/design-lab/s2-2-my-shop-registration')).toBe(
      's2-2-my-shop-registration',
    );
    expect(designLabPathForTrainingQaSegment('s13')).toBe(
      '/design-lab/s2-2-my-shop-registration',
    );
    expect(designLabScenarioForPath('/design-lab/s07-directly-reached')).toBeNull();
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
        basis: 'normalized-restricted-damerau-levenshtein',
        rawDistance: 2,
        normalizedDistance: 2 / 19,
        pathCost: 2,
        steps: [
          {
            id: 'transformation:0:year-change',
            kind: 'year-change',
            operation: 'replace',
            sourceEvidence: { type: 'span', start: 14, end: 18, token: '2025' },
            targetEvidence: { type: 'span', start: 14, end: 18, token: '2026' },
            cost: 1,
            resultingCandidate: 'LunaCampusgram2026!',
            explanationId: 's06.transformation.year-change',
          },
          {
            id: 'transformation:1:suffix-change',
            kind: 'suffix-change',
            operation: 'replace',
            sourceEvidence: { type: 'span', start: 18, end: 19, token: '!' },
            targetEvidence: { type: 'span', start: 18, end: 19, token: '?' },
            cost: 1,
            resultingCandidate: 'LunaCampusgram2026?',
            explanationId: 's06.transformation.suffix-change',
          },
        ],
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
      kind: 'no-whole-password-recognized',
      lengthOrientation: 'at-least-15',
      analysisVersion: 'passwo-bounded-whole-recognition-v13',
      explanationId: 's05.disposition.no-whole-password-recognized',
    };

    expect(typeof model.totalCandidateCount).toBe('bigint');
    expect(model.exhaustiveSearchDuration.wholeSeconds).toBe(1_677_259_342n);
    expect(disposition.kind).toBe('no-whole-password-recognized');
    expect(Object.keys(disposition)).not.toEqual(
      expect.arrayContaining(['score', 'crackTime', 'effectiveLength', 'entropy', 'estimatedGuesses', 'quickPathThreshold']),
    );
  });

  it('represents the exhaustive-search outcome without a score or persisted search model', () => {
    const disposition: LocalPasswordDisposition = {
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-exhaustive-search',
      findingIds: [],
      lengthOrientation: 'below-15',
      analysisVersion: 'passwo-bounded-whole-recognition-v21',
      explanationId: 's05.disposition.whole-password-recognized-exhaustive-search',
    };

    expect(disposition.ruleId).toBe('whole-password-recognized-exhaustive-search');
    expect(disposition.findingIds).toEqual([]);
    expect(Object.keys(disposition)).not.toEqual(
      expect.arrayContaining(['score', 'crackTime', 'entropy', 'searchSpace', 'password']),
    );
  });

  it('keeps participant-confirmed semantic evidence transient and outside the disposition', () => {
    const semanticEvidence: TransientPasswordSemanticEvidence = {
      kind: 'transient-password-semantic-evidence',
      confirmed: true,
      relations: [
        {
          id: 'semantic:content:1',
          kind: 'shared-content',
          evidence: [
            { type: 'span', start: 0, end: 6, token: 'Kaffee' },
            { type: 'span', start: 6, end: 12, token: 'Morgen' },
          ],
        },
      ],
    };
    const disposition: LocalPasswordDisposition = {
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-single-anchor-residual',
      findingIds: ['single:common-password-core:0-8:0'],
      lengthOrientation: 'below-15',
      analysisVersion: 'passwo-bounded-whole-recognition-v21',
      explanationId: 's05.disposition.whole-password-recognized-single-anchor-residual',
    };

    expect(semanticEvidence.confirmed).toBe(true);
    expect(disposition.ruleId).toBe('whole-password-recognized-single-anchor-residual');
    expect(disposition).not.toHaveProperty('semanticRelationIds');
    expect(Object.keys(semanticEvidence)).not.toEqual(
      expect.arrayContaining(['password', 'score', 'strength', 'entropy', 'estimatedGuesses']),
    );
  });

  it('keeps researcher exports inside the approved data boundary', () => {
    const manifest = {
      schemaVersion: 'research-export-v7',
      profile: 'audit',
      schemaProfileVersion: 'research-audit-v2',
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

  it('keeps the generated runtime manifest fully synchronized with the reviewed projection', () => {
    expect(instrumentRuntimeManifest).toEqual(reviewedInstrumentRuntimeManifest);
    expect(JSON.stringify(instrumentRuntimeManifest)).not.toMatch(
      /"[^"]*(?:classification|scor(?:e|ing)|derivedMetric)[^"]*"\s*:/iu,
    );
    expect(instrumentRuntimeManifest.procedures.followUpRecontact.optional).toBe(true);
    expect(instrumentRuntimeManifest).toMatchObject({
      schemaVersion: 4,
      instrumentVersion: '3.0.0-pilot',
      questionnaireVersion: 'questionnaire-v4-pilot',
      guardrailVersion: 'guardrail-v6-pilot',
      consentVersion: 'consent-v13-pilot',
      followUpVersion: 'follow-up-v6-pilot',
      runtimeManifestVersion: 'instrument-runtime-v9-pilot',
    });
    expect(Object.keys(instrumentRuntimeManifest.instruments)).toEqual([
      'pre-v1',
      'post-v1',
      'guardrail-v2',
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
    ]);
    expect(postInstrument.order).toEqual([
      'panas',
      'duration',
      'ueqs',
      'content_trustworthiness',
      'design_diagnostics',
      'risk_understanding',
      'self_efficacy',
      'secaware_prior_exposure',
    ]);
    expect(postItemIds).toHaveLength(53);
    expect(postItemIds.slice(0, 20)).toEqual(
      Array.from({ length: 20 }, (_, index) => `PANAS_${String(index + 1).padStart(2, '0')}`),
    );
    expect(postItemIds.indexOf('PERCEIVED_DURATION')).toBe(
      postItemIds.indexOf('TIME_FIT') - 1,
    );
    expect(postItemIds).toEqual(
      expect.arrayContaining([
        'APPROACH_FRAMING',
        'REFLECTIVE_ENGAGEMENT',
        'CONSEQUENCE_RISK',
        'CONSEQUENCE_PROTECTION',
        'INFORMATION_PACING',
        'ACTION_CLARITY',
        'SE_DISTINCT_ACCESS',
        'SE_PM_NEW_ACCOUNT',
        'SE_PM_LOGIN',
        'SE_MFA_ENABLE',
      ]),
    );
    expect(JSON.stringify({ preItemIds, postItemIds })).not.toMatch(
      /PRE_GENDER|SE_.*_PRE|CONSEQUENCE_(?:VISIBILITY|TANGIBILITY)|OPEN_COMMENT|post-open/u,
    );

    const guardrail = instrumentRuntimeManifest.instruments['guardrail-v2'];
    expect(guardrail.blocks.map((block) => block.id)).toEqual(['scenarios', 'recognition']);
    expect(guardrail.questionOrder).toEqual([
      'SC_DISTINCT_PASSWORDS',
      'SC_PM_MANY_ACCOUNTS',
      'SC_LAYERED_PROTECTION',
      'MR_DISTINCT_PASSWORDS',
      'MR_PASSWORD_MANAGER',
      'MR_MFA',
    ]);
    expect(guardrail.nativeArtifactCheckPolicy).toEqual({
      passwoNativeLearningChecksRetained: true,
      secAwareNativeQuizIncludedInMeasuredPath: false,
      secAwareQuizRemovalReason: 'avoid_immediate_feedback_contamination_of_external_guardrail',
      externalItemsMustBeNovelAndTransferOriented: true,
    });
    const forms = guardrail.optionPresentation.forms;
    const appropriateOptionIds = [
      'own_strong_each',
      'pm_generate_store_organize',
      'unique_and_mfa',
      'own_strong_each',
      'generate_store_organize',
      'password_plus_other_category',
    ];
    const substantiveOptionIds = [
      ['own_strong_each', 'same_strong_both', 'unique_email_reuse_shopping'],
      ['pm_generate_store_organize', 'unique_important_reuse_others', 'one_strong_everywhere'],
      ['unique_and_mfa', 'unique_without_mfa', 'shared_strong_with_mfa'],
      ['own_strong_each', 'one_strong_all', 'unique_important_reuse_others'],
      ['generate_store_organize', 'same_strong_everywhere', 'auto_mfa'],
      ['password_plus_other_category', 'two_passwords', 'long_password_factor'],
    ] as const;
    const expectedPermutationCodesByForm = {
      F1: ['ABC', 'BAC', 'BAC', 'CBA', 'BAC', 'CBA'],
      F2: ['ACB', 'ACB', 'CAB', 'BCA', 'ABC', 'BAC'],
      F3: ['BAC', 'CBA', 'BCA', 'ACB', 'CAB', 'ACB'],
      F4: ['CBA', 'BCA', 'ACB', 'CAB', 'CBA', 'ABC'],
      F5: ['BCA', 'ABC', 'ABC', 'BAC', 'ACB', 'BCA'],
      F6: ['CAB', 'CAB', 'CBA', 'ABC', 'BCA', 'CAB'],
    } as const;
    const formIds = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'] as const;
    for (const itemIndex of guardrail.questionOrder.keys()) {
      const itemId = guardrail.questionOrder[itemIndex];
      const appropriateOptionId = appropriateOptionIds[itemIndex];
      const canonicalOptionIds = substantiveOptionIds[itemIndex];
      if (
        itemId === undefined ||
        appropriateOptionId === undefined ||
        canonicalOptionIds === undefined
      ) {
        throw new Error('test-fixture');
      }

      const optionCodeById = Object.fromEntries(
        canonicalOptionIds.map((optionId, optionIndex) => [
          optionId,
          String.fromCharCode('A'.charCodeAt(0) + optionIndex),
        ]),
      ) as Record<string, string>;
      const permutationCodes = formIds.map((formId) =>
        (forms[formId][itemId] ?? [])
          .slice(0, 3)
          .map((optionId) => optionCodeById[optionId] ?? '?')
          .join(''),
      );

      expect(permutationCodes).toEqual(
        formIds.map((formId) => expectedPermutationCodesByForm[formId][itemIndex]),
      );
      expect(new Set(permutationCodes).size).toBe(6);
      expect(
        formIds.map((formId) => forms[formId][itemId]?.indexOf(appropriateOptionId) ?? -1).sort(),
      ).toEqual([0, 0, 1, 1, 2, 2]);
      expect(formIds.every((formId) => forms[formId][itemId]?.at(-1) === 'unsure')).toBe(true);
    }
    expect(
      new Set(Object.values(guardrail.questionPresentation.scenarioOrderByForm).map(String)).size,
    ).toBe(6);
    const participantInformation = JSON.stringify(
      instrumentRuntimeManifest.procedures.participantInformation,
    );
    expect(participantInformation).toContain('Die Teilnahme dauert insgesamt etwa 30 Minuten.');
    expect(participantInformation).toContain(
      'Bis zum Abschluss der Datenauswertung und Prüfung des Datensatzes bleiben die Forschungsdaten pseudonymisiert.',
    );
    expect(participantInformation).toContain(
      'Fiktive Passwörter aus dem Lernangebot werden weder gespeichert noch übertragen.',
    );
    expect(participantInformation).not.toMatch(
      /\[OFFEN|Sciebo|zugewiesenen Bedingung|Einzelheiten zum Vergleich|20 bis 30 Minuten|verpflichtender zweiter Teil/u,
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
    const invalidExperienceBlock = {
      instrumentId: 'pre-v1',
      sectionId: 'experience',
      responses: [
        { itemId: 'PRE_TRAINING', value: 'never' },
        { itemId: 'PRE_PM_USE', value: ['none', 'browser_or_device_integrated'] },
        { itemId: 'PRE_MFA_USE', value: 'none' },
      ],
    };
    const validExperienceBlock = {
      ...invalidExperienceBlock,
      responses: [
        { itemId: 'PRE_TRAINING', value: 'never' },
        { itemId: 'PRE_PM_USE', value: ['browser_or_device_integrated'] },
        { itemId: 'PRE_MFA_USE', value: 'none' },
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
    expect(instrumentSubmissionRequestSchema.safeParse(invalidExperienceBlock).success).toBe(false);
    expect(instrumentSubmissionRequestSchema.safeParse(validExperienceBlock).success).toBe(true);

    const panasSection = instrumentRuntimeManifest.instruments['post-v1'].sections.find(
      ({ id }) => id === 'panas',
    );
    if (panasSection === undefined) throw new Error('missing-panas');
    const panasResponses = panasSection.items.map((item, index) => ({
      itemId: item.id,
      value: (index % 5) + 1,
    }));
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        instrumentId: 'post-v1',
        sectionId: 'panas',
        responses: panasResponses,
      }).success,
    ).toBe(true);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        instrumentId: 'post-v1',
        sectionId: 'panas',
        responses: panasResponses.map((response, index) =>
          index === 0 ? { ...response, value: 6 } : response,
        ),
      }).success,
    ).toBe(false);

    const durationBlock = {
      instrumentId: 'post-v1',
      sectionId: 'duration',
      responses: [
        { itemId: 'PERCEIVED_DURATION', value: 1 },
        { itemId: 'TIME_FIT', value: 7 },
      ],
    };
    expect(instrumentSubmissionRequestSchema.safeParse(durationBlock).success).toBe(true);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        ...durationBlock,
        responses: [
          { itemId: 'PERCEIVED_DURATION', value: 0 },
          { itemId: 'TIME_FIT', value: 7 },
        ],
      }).success,
    ).toBe(false);

    const designBlock = instrumentRuntimeManifest.instruments['post-v1'].sections.find(
      ({ id }) => id === 'design_diagnostics',
    );
    if (designBlock === undefined) throw new Error('missing-design-diagnostics');
    const validDesignResponses = designBlock.items.map((item) => ({ itemId: item.id, value: 4 }));
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        instrumentId: 'post-v1',
        sectionId: designBlock.id,
        responses: validDesignResponses,
      }).success,
    ).toBe(true);
    expect(
      instrumentSubmissionRequestSchema.safeParse({
        instrumentId: 'post-v1',
        sectionId: designBlock.id,
        responses: validDesignResponses.map((response) =>
          response.itemId === 'CONSEQUENCE_RISK'
            ? { ...response, itemId: 'CONSEQUENCE_TANGIBILITY' }
            : response,
        ),
      }).success,
    ).toBe(false);

    const selfEfficacyBlock = {
      instrumentId: 'post-v1',
      sectionId: 'self_efficacy',
      responses: [
        { itemId: 'SE_DISTINCT_ACCESS', value: 0 },
        { itemId: 'SE_PM_NEW_ACCOUNT', value: 5 },
        { itemId: 'SE_PM_LOGIN', value: 5 },
        { itemId: 'SE_MFA_ENABLE', value: 10 },
      ],
    };
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
    ).toBe(false);
  });
});
