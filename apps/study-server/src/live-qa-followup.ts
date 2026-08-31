import { createHash } from 'node:crypto';
import {
  type LiveQaFollowUpCaseResponse,
  type LiveQaFollowUpCaseScenario,
  type LiveQaFollowUpMessagesResponse,
  type LiveQaFollowUpVerificationResponse,
  liveQaFollowUpCaseResponseSchema,
  liveQaFollowUpMessagesResponseSchema,
  liveQaFollowUpVerificationResponseSchema,
  followUpRawTokenSchema,
} from '@passwo/contracts';
import type Database from 'better-sqlite3';
import { z } from 'zod';
import { type FollowUpDeliveryMessage, renderFollowUpDeliveryMessage } from './followup-message.js';
import { type StudyRepository, StudyRepositoryError } from './study-repository.js';

const syntheticEmail = 'follow-up-qa@example.invalid';
const syntheticToken = followUpRawTokenSchema.parse('Q'.repeat(43));
const syntheticSender = {
  name: 'Julian Meyer',
  address: 's27jmeye@uni-bonn.de',
} as const;

const registrationRowSchema = z.object({
  rawToken: followUpRawTokenSchema,
  tokenHash: z.string().regex(/^[a-f0-9]{64}$/u),
});

const verificationRowSchema = z.object({
  researchId: z.string(),
  storedResponseCount: z.number().int().nonnegative(),
  mainResponseCount: z.number().int().nonnegative(),
  submitted: z.union([z.literal(0), z.literal(1)]),
});

function addHours(value: string, hours: number): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new StudyRepositoryError('invalid-server-clock', 500);
  return new Date(timestamp + hours * 60 * 60 * 1_000).toISOString();
}

function previewMessage(message: FollowUpDeliveryMessage) {
  return {
    kind: message.kind,
    sender: message.sender,
    recipient: message.recipient,
    subject: message.subject,
    text: message.text,
    tokenLink: message.tokenLink,
    dueAtIso: message.dueAtIso,
    closesAtIso: message.closesAtIso,
  };
}

export interface LiveQaFollowUpControls {
  messages(): LiveQaFollowUpMessagesResponse;
  prepareCase(sessionId: string, scenario: LiveQaFollowUpCaseScenario): LiveQaFollowUpCaseResponse;
  verifySubmission(token: string): LiveQaFollowUpVerificationResponse;
}

export function createLiveQaFollowUpControls(options: {
  readonly database: Database.Database;
  readonly repository: StudyRepository;
  readonly nowIso: () => string;
  readonly publicOrigin?: string;
}): LiveQaFollowUpControls {
  const baseUrl = `${options.publicOrigin ?? 'https://study.example.invalid'}/follow-up`;

  return {
    messages() {
      const firstInvitationAtIso = options.nowIso();
      const reminderAtIso = addHours(firstInvitationAtIso, 48);
      const closesAtIso = addHours(firstInvitationAtIso, 96);
      const tokenHash = createHash('sha256').update(syntheticToken, 'utf8').digest('hex');
      return liveQaFollowUpMessagesResponseSchema.parse({
        invitation: previewMessage(
          renderFollowUpDeliveryMessage(
            {
              kind: 'first-invitation',
              email: syntheticEmail,
              rawToken: syntheticToken,
              tokenHash,
              firstInvitationAtIso,
              operationAtIso: firstInvitationAtIso,
              dueAtIso: firstInvitationAtIso,
              closesAtIso,
            },
            baseUrl,
            syntheticSender,
          ),
        ),
        reminder: previewMessage(
          renderFollowUpDeliveryMessage(
            {
              kind: 'reminder',
              email: syntheticEmail,
              rawToken: syntheticToken,
              tokenHash,
              firstInvitationAtIso,
              operationAtIso: reminderAtIso,
              dueAtIso: reminderAtIso,
              closesAtIso,
            },
            baseUrl,
            syntheticSender,
          ),
        ),
      });
    },

    prepareCase(sessionId, scenario) {
      const session = options.repository.findSession(sessionId);
      if (
        session === null ||
        session.completionStatus !== 'completed' ||
        !session.followUpConsent ||
        session.followUpTokenHash === null
      ) {
        throw new StudyRepositoryError('live-qa-follow-up-main-case-incomplete', 409);
      }
      const registration = registrationRowSchema.nullable().parse(
        options.database
          .prepare(
            `SELECT raw_token AS rawToken, token_hash AS tokenHash
             FROM recontact.registrations
             WHERE session_id = ? AND token_hash = ?`,
          )
          .get(sessionId, session.followUpTokenHash) ?? null,
      );
      if (registration === null) {
        throw new StudyRepositoryError('recontact-registration-missing', 500);
      }

      const nowIso = options.nowIso();
      const window =
        scenario === 'not-yet-open'
          ? { firstInvitationHours: 24, reminderHours: 72, closesHours: 120 }
          : scenario === 'expired'
            ? { firstInvitationHours: -120, reminderHours: -72, closesHours: -24 }
            : { firstInvitationHours: -72, reminderHours: -24, closesHours: 24 };
      const firstInvitationAtIso = addHours(nowIso, window.firstInvitationHours);
      const reminderAtIso = addHours(nowIso, window.reminderHours);
      const closesAtIso = addHours(nowIso, window.closesHours);
      const firstInvitationSentAtIso = scenario === 'not-yet-open' ? null : firstInvitationAtIso;
      const changed = options.database
        .prepare(
          `UPDATE recontact.registrations
           SET first_invitation_at_iso = ?,
               reminder_at_iso = ?,
               closes_at_iso = ?,
               first_invitation_sent_at_iso = ?,
               reminder_sent_at_iso = NULL
           WHERE session_id = ? AND token_hash = ?`,
        )
        .run(
          firstInvitationAtIso,
          reminderAtIso,
          closesAtIso,
          firstInvitationSentAtIso,
          sessionId,
          registration.tokenHash,
        ).changes;
      if (changed !== 1) throw new StudyRepositoryError('recontact-registration-missing', 500);

      return liveQaFollowUpCaseResponseSchema.parse({
        token: registration.rawToken,
        researchId: session.researchCode,
        access: options.repository.followUpAccess(registration.rawToken),
      });
    },

    verifySubmission(token) {
      const parsedToken = followUpRawTokenSchema.parse(token);
      const verification = verificationRowSchema.nullable().parse(
        options.database
          .prepare(
            `SELECT
               session.research_code AS researchId,
               (
                 SELECT COUNT(*)
                 FROM responses AS response
                 WHERE response.session_id = session.session_id
                   AND response.instrument_id = 'follow-up-v1'
                   AND response.section_id = 'actions'
               ) AS storedResponseCount,
               (
                 SELECT COUNT(*)
                 FROM responses AS response
                 WHERE response.session_id = session.session_id
                   AND response.instrument_id <> 'follow-up-v1'
               ) AS mainResponseCount,
               EXISTS (
                 SELECT 1
                 FROM instrument_submissions AS submission
                 WHERE submission.session_id = session.session_id
                   AND submission.instrument_id = 'follow-up-v1'
                   AND submission.section_id = 'actions'
               ) AS submitted
             FROM recontact.registrations AS registration
             INNER JOIN study_sessions AS session
               ON session.session_id = registration.session_id
              AND session.follow_up_token_hash = registration.token_hash
             WHERE registration.raw_token = ?`,
          )
          .get(parsedToken) ?? null,
      );
      if (
        verification === null ||
        verification.submitted !== 1 ||
        verification.storedResponseCount !== 6 ||
        verification.mainResponseCount === 0 ||
        options.repository.followUpAccess(parsedToken).status !== 'submitted'
      ) {
        throw new StudyRepositoryError('live-qa-follow-up-verification-failed', 409);
      }
      return liveQaFollowUpVerificationResponseSchema.parse({
        researchId: verification.researchId,
        status: 'submitted',
        storedResponseCount: verification.storedResponseCount,
        linkedToMainCase: true,
        reminderEligible: false,
      });
    },
  };
}
