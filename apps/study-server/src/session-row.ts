import { type PersistedSessionRecord, persistedSessionRecordSchema } from '@passwo/contracts';
import { z } from 'zod';

const sessionRowSchema = z.object({
  sessionId: z.string(),
  participantCode: z.string(),
  condition: z.string(),
  assignmentMode: z.string(),
  studyVersion: z.string(),
  contentVersion: z.string(),
  questionnaireVersion: z.string(),
  guardrailVersion: z.string(),
  consentVersion: z.string(),
  referenceArtifactVersion: z.string().nullable(),
  consentAccepted: z.number().int(),
  completionStatus: z.string(),
  technicalErrorCode: z.string().nullable(),
  createdAtIso: z.string(),
  completedAtIso: z.string().nullable(),
});

export const sessionRowSelection = `
  SELECT
    session_id AS sessionId,
    participant_code AS participantCode,
    condition,
    assignment_mode AS assignmentMode,
    study_version AS studyVersion,
    content_version AS contentVersion,
    questionnaire_version AS questionnaireVersion,
    guardrail_version AS guardrailVersion,
    consent_version AS consentVersion,
    reference_artifact_version AS referenceArtifactVersion,
    consent_accepted AS consentAccepted,
    completion_status AS completionStatus,
    technical_error_code AS technicalErrorCode,
    created_at_iso AS createdAtIso,
    completed_at_iso AS completedAtIso
  FROM study_sessions
`;

export function mapSessionRow(row: unknown): PersistedSessionRecord {
  const parsed = sessionRowSchema.parse(row);
  return persistedSessionRecordSchema.parse({
    ...parsed,
    consentAccepted: parsed.consentAccepted === 1,
  });
}
