import { type PersistedSessionRecord, persistedSessionRecordSchema } from '@passwo/contracts';
import { z } from 'zod';

const sessionRowSchema = z.object({
  sessionId: z.string(),
  researchCode: z.string(),
  deletionCodeHash: z.string(),
  recruitmentSource: z.string(),
  condition: z.string(),
  assignmentMode: z.string(),
  studyVersion: z.string(),
  contentVersion: z.string(),
  questionnaireVersion: z.string(),
  guardrailVersion: z.string(),
  guardrailFormId: z.string(),
  consentVersion: z.string(),
  referenceArtifactVersion: z.string().nullable(),
  consentAccepted: z.number().int(),
  followUpConsent: z.number().int(),
  followUpVersion: z.string(),
  followUpTokenHash: z.string().nullable(),
  completionStatus: z.string(),
  technicalErrorCode: z.string().nullable(),
  artifactSessionElapsedMs: z.number().finite().nonnegative().nullable(),
  webInterruptionCount: z.number().int().nonnegative(),
  createdAtIso: z.string(),
  completedAtIso: z.string().nullable(),
});

export const sessionRowSelection = `
  SELECT
    session_id AS sessionId,
    research_code AS researchCode,
    deletion_code_hash AS deletionCodeHash,
    recruitment_source AS recruitmentSource,
    condition,
    assignment_mode AS assignmentMode,
    study_version AS studyVersion,
    content_version AS contentVersion,
    questionnaire_version AS questionnaireVersion,
    guardrail_version AS guardrailVersion,
    guardrail_form_id AS guardrailFormId,
    consent_version AS consentVersion,
    reference_artifact_version AS referenceArtifactVersion,
    consent_accepted AS consentAccepted,
    follow_up_consent AS followUpConsent,
    follow_up_version AS followUpVersion,
    follow_up_token_hash AS followUpTokenHash,
    completion_status AS completionStatus,
    technical_error_code AS technicalErrorCode,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM web_artifact_intervals AS web_interval
        WHERE web_interval.session_id = study_sessions.session_id
      ) THEN COALESCE((
        SELECT SUM(web_interval.confirmed_elapsed_ms)
        FROM web_artifact_intervals AS web_interval
        WHERE web_interval.session_id = study_sessions.session_id
      ), 0)
      ELSE NULL
    END AS artifactSessionElapsedMs,
    web_interruption_count AS webInterruptionCount,
    created_at_iso AS createdAtIso,
    completed_at_iso AS completedAtIso
  FROM study_sessions
`;

export function mapSessionRow(row: unknown): PersistedSessionRecord {
  const parsed = sessionRowSchema.parse(row);
  return persistedSessionRecordSchema.parse({
    ...parsed,
    consentAccepted: parsed.consentAccepted === 1,
    followUpConsent: parsed.followUpConsent === 1,
  });
}
