import { createHash, randomBytes } from 'node:crypto';
import {
  type AssignmentMode,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type GuardrailFormId,
  guardrailFormIdSchema,
  guardrailPresentationForForm,
  followUpTokenHashSchema,
  followUpRawTokenSchema,
  instrumentRuntimeManifest,
  type InstrumentSubmissionRequest,
  mainInstrumentBlocks,
  normalizeInstrumentSubmission,
  type PersistedSessionRecord,
  type RegisterRecontactRequest,
  type StudyCondition,
  type StudyTimingEvent,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  type SupportiveArtifactSegmentId,
  studyConditionSchema,
  type TimingWriteResponse,
} from '@passwo/contracts';
import type Database from 'better-sqlite3';
import { z } from 'zod';
import type { StudyRandomSource } from './random-source.js';
import { mapSessionRow, sessionRowSelection } from './session-row.js';

export interface StudyVersions {
  readonly study: string;
  readonly supportiveArtifact: string;
  readonly questionnaire: string;
  readonly guardrail: string;
  readonly consent: string;
  readonly followUp: string;
  readonly referenceArtifact: string;
}

export class StudyRepositoryError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'StudyRepositoryError';
    this.statusCode = statusCode;
  }
}

interface Assignment {
  readonly condition: StudyCondition;
  readonly blockNumber: number | null;
  readonly slotIndex: number | null;
}

interface GuardrailFormAssignment {
  readonly formId: GuardrailFormId;
  readonly blockNumber: number;
  readonly slotIndex: number;
}

const assignmentSlotSchema = z.object({
  blockNumber: z.number().int(),
  slotIndex: z.number().int(),
  condition: studyConditionSchema,
});
const guardrailFormSlotSchema = z.object({
  blockNumber: z.number().int(),
  slotIndex: z.number().int(),
  formId: guardrailFormIdSchema,
});

const countSchema = z.object({ count: z.number().int().nonnegative() });
const statusSchema = z.object({ completionStatus: z.string() });
const conditionSchema = z.object({ condition: studyConditionSchema });
const timingIdentitySchema = z.object({
  phase: z.string(),
  sectionId: z.string().nullable(),
  segmentId: z.string().nullable(),
  eventType: z.string(),
});
const timingMaximumSchema = z.object({ maximum: z.number().int() });
const artifactBoundsSchema = z.object({
  startedAt: z.number().nullable(),
  endedAt: z.number().nullable(),
});
const sessionIdRowSchema = z.object({ sessionId: z.string() });
const submissionFingerprintSchema = z.object({ payloadFingerprint: z.string() });
const instrumentVersionsSchema = z.object({
  questionnaireVersion: z.string(),
  guardrailVersion: z.string(),
});
const recontactRegistrationSchema = z.object({
  sessionId: z.string(),
  requestId: z.string(),
  email: z.string(),
  tokenHash: followUpTokenHashSchema,
});
const followUpSessionSchema = z.object({
  followUpConsent: z.union([z.literal(0), z.literal(1)]),
  followUpTokenHash: followUpTokenHashSchema.nullable(),
  completionStatus: z.string(),
  completedAtIso: z.string().nullable(),
});

export const artifactLeaseExpiresAfterMs = 5 * 60 * 1000;

function toCreateResponse(session: PersistedSessionRecord): CreateSessionResponse {
  return {
    sessionId: session.sessionId,
    condition: session.condition,
    assignmentMode: session.assignmentMode,
    guardrailFormId: session.guardrailFormId,
  };
}

function submissionFingerprint(request: InstrumentSubmissionRequest): string {
  return createHash('sha256').update(jsonString(request), 'utf8').digest('hex');
}

function jsonString(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new StudyRepositoryError('invalid-research-data', 400);
  return serialized;
}

function artifactVersionForCondition(condition: StudyCondition, versions: StudyVersions): string {
  return condition === 'supportive' ? versions.supportiveArtifact : versions.referenceArtifact;
}

export class StudyRepository {
  readonly #database: Database.Database;
  readonly #assignmentMode: AssignmentMode;
  readonly #versions: StudyVersions;
  readonly #random: StudyRandomSource;
  readonly #nowIso: () => string;
  readonly #createRecontactToken: () => string;

  constructor(options: {
    database: Database.Database;
    assignmentMode: AssignmentMode;
    versions: StudyVersions;
    random: StudyRandomSource;
    nowIso?: () => string;
    createRecontactToken?: () => string;
  }) {
    this.#database = options.database;
    this.#assignmentMode = options.assignmentMode;
    this.#versions = options.versions;
    this.#random = options.random;
    this.#nowIso = options.nowIso ?? (() => new Date().toISOString());
    this.#createRecontactToken =
      options.createRecontactToken ?? (() => randomBytes(32).toString('base64url'));
    this.#ensureArtifactBoundaryIndex();
  }

  createSession(request: CreateSessionRequest): CreateSessionResponse {
    this.recoverStaleArtifactSessions();
    const create = this.#database.transaction(() => {
      const existing = this.#findSessionByRequestId(request.requestId);
      if (existing !== null) {
        if (
          existing.followUpConsent !== request.followUpConsent ||
          existing.deletionCodeHash !== request.deletionCodeHash
        ) {
          throw new StudyRepositoryError('session-create-conflict', 409);
        }
        return toCreateResponse(existing);
      }

      const sessionId = this.#random.randomUuid();
      const assignment = this.#nextAssignment();
      const guardrailFormAssignment = this.#nextGuardrailFormAssignment(assignment.condition);
      const researchCode = this.#newResearchCode();
      const createdAtIso = this.#nowIso();
      const artifactVersion = artifactVersionForCondition(assignment.condition, this.#versions);

      this.#database
        .prepare(
          `INSERT INTO study_sessions (
            session_id,
            create_request_id,
            research_code,
            deletion_code_hash,
            condition,
            assignment_mode,
            study_version,
            content_version,
            questionnaire_version,
            guardrail_version,
            guardrail_form_id,
            consent_version,
            reference_artifact_version,
            consent_accepted,
            follow_up_consent,
            follow_up_version,
            follow_up_token_hash,
            completion_status,
            technical_error_code,
            created_at_iso,
            completed_at_iso
          ) VALUES (
            @sessionId,
            @requestId,
            @researchCode,
            @deletionCodeHash,
            @condition,
            @assignmentMode,
            @studyVersion,
            @contentVersion,
            @questionnaireVersion,
            @guardrailVersion,
            @guardrailFormId,
            @consentVersion,
            @referenceArtifactVersion,
            1,
            @followUpConsent,
            @followUpVersion,
            NULL,
            'in-progress',
            NULL,
            @createdAtIso,
            NULL
          )`,
        )
        .run({
          sessionId,
          requestId: request.requestId,
          researchCode,
          deletionCodeHash: request.deletionCodeHash,
          condition: assignment.condition,
          assignmentMode: this.#assignmentMode,
          studyVersion: this.#versions.study,
          contentVersion: artifactVersion,
          questionnaireVersion: this.#versions.questionnaire,
          guardrailVersion: this.#versions.guardrail,
          guardrailFormId: guardrailFormAssignment.formId,
          consentVersion: this.#versions.consent,
          followUpConsent: request.followUpConsent ? 1 : 0,
          followUpVersion: this.#versions.followUp,
          referenceArtifactVersion: assignment.condition === 'reference' ? artifactVersion : null,
          createdAtIso,
        });

      if (assignment.blockNumber !== null && assignment.slotIndex !== null) {
        this.#database
          .prepare(
            `UPDATE assignment_slots
             SET session_id = ?
             WHERE block_number = ? AND slot_index = ? AND session_id IS NULL`,
          )
          .run(sessionId, assignment.blockNumber, assignment.slotIndex);
      }
      this.#database
        .prepare(
          `UPDATE guardrail_form_slots
           SET session_id = ?
           WHERE condition = ?
             AND block_number = ?
             AND slot_index = ?
             AND session_id IS NULL`,
        )
        .run(
          sessionId,
          assignment.condition,
          guardrailFormAssignment.blockNumber,
          guardrailFormAssignment.slotIndex,
        );
      this.#persistGuardrailPresentations(sessionId, guardrailFormAssignment.formId, createdAtIso);

      const session = this.findSession(sessionId);
      if (session === null) {
        throw new StudyRepositoryError('session-create-failed', 500);
      }
      return toCreateResponse(session);
    });

    return create();
  }

  registerRecontact(sessionId: string, request: RegisterRecontactRequest): void {
    const normalizedEmail = request.email.trim().toLowerCase();
    const register = this.#database.transaction(() => {
      const session = this.#followUpSession(sessionId);
      if (session.followUpConsent !== 1) {
        throw new StudyRepositoryError('recontact-consent-required', 409);
      }

      const existingBySession = this.#findRecontactRegistration('session_id = ?', sessionId);
      if (existingBySession !== null) {
        if (
          existingBySession.requestId !== request.requestId ||
          existingBySession.email !== normalizedEmail
        ) {
          throw new StudyRepositoryError('recontact-registration-conflict', 409);
        }
        this.#persistFollowUpTokenHash(sessionId, existingBySession.tokenHash);
        return;
      }
      if (session.completionStatus !== 'in-progress') {
        throw new StudyRepositoryError('session-not-in-progress', 409);
      }

      const existingByRequest = this.#findRecontactRegistration(
        'registration_request_id = ?',
        request.requestId,
      );
      if (existingByRequest !== null) {
        throw new StudyRepositoryError('recontact-registration-conflict', 409);
      }
      if (session.followUpTokenHash !== null) {
        throw new StudyRepositoryError('recontact-registration-inconsistent', 500);
      }

      const token = this.#newRecontactToken();
      const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
      this.#database
        .prepare(
          `INSERT INTO recontact.registrations (
            session_id,
            registration_request_id,
            email,
            raw_token,
            token_hash,
            consent_version,
            registered_at_iso,
            first_invitation_at_iso,
            reminder_at_iso,
            closes_at_iso,
            first_invitation_sent_at_iso,
            reminder_sent_at_iso
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL)`,
        )
        .run(
          sessionId,
          request.requestId,
          normalizedEmail,
          token,
          tokenHash,
          this.#versions.consent,
          this.#nowIso(),
        );
      this.#persistFollowUpTokenHash(sessionId, tokenHash);
    });

    register();
  }

  abandonRecontact(sessionId: string): void {
    const abandon = this.#database.transaction(() => {
      const session = this.#followUpSession(sessionId);
      if (session.completionStatus !== 'in-progress') {
        throw new StudyRepositoryError('session-not-in-progress', 409);
      }
      this.#database
        .prepare(`DELETE FROM recontact.registrations WHERE session_id = ?`)
        .run(sessionId);
      this.#database
        .prepare(
          `UPDATE study_sessions
           SET follow_up_consent = 0,
               follow_up_token_hash = NULL
           WHERE session_id = ?`,
        )
        .run(sessionId);
    });

    abandon();
  }

  saveInstrumentSubmission(sessionId: string, request: InstrumentSubmissionRequest): void {
    this.recoverStaleArtifactSessions();
    const normalized = normalizeInstrumentSubmission(request);
    const fingerprint = submissionFingerprint(normalized);
    const save = this.#database.transaction(() => {
      const existing = submissionFingerprintSchema.nullable().parse(
        this.#database
          .prepare(
            `SELECT payload_fingerprint AS payloadFingerprint
             FROM instrument_submissions
             WHERE session_id = ? AND instrument_id = ? AND section_id = ?`,
          )
          .get(sessionId, normalized.instrumentId, normalized.sectionId) ?? null,
      );
      if (existing !== null) {
        if (existing.payloadFingerprint !== fingerprint) {
          throw new StudyRepositoryError('instrument-submission-conflict', 409);
        }
        return;
      }
      this.#requireInProgress(sessionId);
      this.#requireRecontactRegistration(sessionId);
      this.#requireInstrumentSubmissionPrerequisites(
        sessionId,
        normalized.instrumentId,
        normalized.sectionId,
      );

      const instrumentVersionValue = this.#instrumentVersionForSession(
        sessionId,
        normalized.instrumentId,
      );
      const submittedAtIso = this.#nowIso();
      const insertResponse = this.#database.prepare(
        `INSERT INTO responses (
          session_id,
          instrument_id,
          instrument_version,
          section_id,
          item_id,
          json_value,
          created_at_iso
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const response of normalized.responses) {
        insertResponse.run(
          sessionId,
          normalized.instrumentId,
          instrumentVersionValue,
          normalized.sectionId,
          response.itemId,
          jsonString(response.value),
          submittedAtIso,
        );
      }
      this.#database
        .prepare(
          `INSERT INTO instrument_submissions (
            session_id,
            instrument_id,
            instrument_version,
            section_id,
            payload_fingerprint,
            submitted_at_iso
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          sessionId,
          normalized.instrumentId,
          instrumentVersionValue,
          normalized.sectionId,
          fingerprint,
          submittedAtIso,
        );
    });

    save();
  }

  recordTiming(sessionId: string, event: StudyTimingEvent): TimingWriteResponse {
    this.recoverStaleArtifactSessions();
    const record = this.#database.transaction(() => {
      const existingSequence = timingIdentitySchema.nullable().parse(
        this.#database
          .prepare(
            `SELECT
              phase,
              section_id AS sectionId,
              segment_id AS segmentId,
              event_type AS eventType
               FROM timing_events
               WHERE session_id = ? AND sequence = ?`,
          )
          .get(sessionId, event.sequence) ?? null,
      );
      if (existingSequence !== null) {
        if (
          existingSequence.phase !== event.phase ||
          existingSequence.sectionId !== event.sectionId ||
          existingSequence.segmentId !== event.segmentId ||
          existingSequence.eventType !== event.eventType
        ) {
          throw new StudyRepositoryError('timing-sequence-conflict', 409);
        }
        return {
          recorded: false,
          artifactWallClockMs: this.#artifactWallClockMs(sessionId),
        };
      }

      this.#requireInProgress(sessionId);

      if (event.segmentId === null) {
        if (event.eventType === 'start') {
          this.#requirePreCompleted(sessionId);
        }
        if (event.eventType === 'end') {
          this.#requireArtifactStarted(sessionId);
          this.#requireSupportiveSegmentsCompleted(sessionId);
        }
        if (event.eventType === 'visibility-hidden' || event.eventType === 'visibility-visible') {
          this.#requireSupportiveArtifactActive(sessionId);
        }

        if (event.eventType === 'start' || event.eventType === 'end') {
          const existingBoundary = this.#artifactBoundaryCount(sessionId, event.eventType);
          if (existingBoundary > 0) {
            throw new StudyRepositoryError(`artifact-${event.eventType}-already-recorded`, 409);
          }
        }
      } else if (event.eventType === 'start') {
        this.#requireSegmentStart(sessionId, event.segmentId);
      } else {
        this.#requireSegmentEnd(sessionId, event.segmentId);
      }

      const maximum = timingMaximumSchema.parse(
        this.#database
          .prepare(
            `SELECT COALESCE(MAX(sequence), -1) AS maximum
             FROM timing_events
             WHERE session_id = ?`,
          )
          .get(sessionId),
      );
      if (event.sequence !== maximum.maximum + 1) {
        throw new StudyRepositoryError('timing-sequence-conflict', 409);
      }

      this.#database
        .prepare(
          `INSERT INTO timing_events (
            session_id,
            sequence,
            phase,
            section_id,
            segment_id,
            event_type,
            client_monotonic_ms,
            client_wall_clock_iso,
            elapsed_ms,
            reason_code,
            server_received_at_iso
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          sessionId,
          event.sequence,
          event.phase,
          event.sectionId,
          event.segmentId,
          event.eventType,
          event.clientMonotonicMs,
          event.clientWallClockIso,
          event.elapsedMs,
          event.reasonCode,
          this.#nowIso(),
        );

      if (event.sectionId === null && event.segmentId === null) {
        if (event.eventType === 'start') {
          this.#activateArtifactLease(sessionId, this.#nowIso());
        }
        if (event.eventType === 'end') {
          this.#closeArtifactLease(sessionId, this.#nowIso());
        }
      }

      return {
        recorded: true,
        artifactWallClockMs: this.#artifactWallClockMs(sessionId),
      };
    });

    return record();
  }

  acquireArtifactLease(sessionId: string): void {
    this.recoverStaleArtifactSessions();
    const acquire = this.#database.transaction(() => {
      this.#requireInProgress(sessionId);
      this.#requirePreCompleted(sessionId);
      if (this.#artifactBoundaryCount(sessionId, 'end') > 0) {
        throw new StudyRepositoryError('artifact-not-active', 409);
      }
      this.#activateArtifactLease(sessionId, this.#nowIso());
    });

    acquire();
  }

  heartbeatArtifactLease(sessionId: string): void {
    this.recoverStaleArtifactSessions();
    const heartbeat = this.#database.transaction(() => {
      this.#requireInProgress(sessionId);
      const result = this.#database
        .prepare(
          `UPDATE artifact_leases
           SET last_heartbeat_at_iso = ?
           WHERE session_id = ? AND closed_at_iso IS NULL`,
        )
        .run(this.#nowIso(), sessionId);
      if (result.changes === 0) {
        throw new StudyRepositoryError('artifact-lease-not-active', 409);
      }
    });

    heartbeat();
  }

  markIncompleteReload(sessionId: string): string {
    this.recoverStaleArtifactSessions();
    const markIncomplete = this.#database.transaction(() => {
      const status = this.#completionStatus(sessionId);
      if (status === 'in-progress' && this.#hasActiveArtifactLease(sessionId)) {
        this.#database
          .prepare(
            `UPDATE study_sessions
             SET completion_status = 'incomplete-reload',
                 technical_error_code = 'artifact-reload'
             WHERE session_id = ? AND completion_status = 'in-progress'`,
          )
          .run(sessionId);
        this.#closeArtifactLease(sessionId, this.#nowIso());
        return 'incomplete-reload';
      }
      return status;
    });

    return markIncomplete();
  }

  completeSession(sessionId: string): string {
    this.recoverStaleArtifactSessions();
    const complete = this.#database.transaction(() => {
      const status = this.#completionStatus(sessionId);
      if (status === 'completed') {
        const session = this.#followUpSession(sessionId);
        if (session.completedAtIso !== null) {
          this.#scheduleRecontact(sessionId, session.completedAtIso);
        }
        return status;
      }
      if (status !== 'in-progress') {
        throw new StudyRepositoryError('session-not-in-progress', 409);
      }

      this.#requirePreCompleted(sessionId);
      this.#requireArtifactStarted(sessionId);
      this.#requireArtifactEnded(sessionId);
      this.#requirePostCompleted(sessionId);
      this.#requireGuardrailsCompleted(sessionId);

      const completedAtIso = this.#nowIso();
      this.#database
        .prepare(
          `UPDATE study_sessions
           SET completion_status = 'completed', completed_at_iso = ?
           WHERE session_id = ?`,
        )
        .run(completedAtIso, sessionId);
      this.#scheduleRecontact(sessionId, completedAtIso);
      this.#closeArtifactLease(sessionId, this.#nowIso());
      return 'completed';
    });

    return complete();
  }

  findSession(sessionId: string): PersistedSessionRecord | null {
    this.recoverStaleArtifactSessions();
    const row = this.#database
      .prepare(`${sessionRowSelection} WHERE session_id = ?`)
      .get(sessionId);
    return row === undefined ? null : mapSessionRow(row);
  }

  getSessionStatus(sessionId: string): string {
    this.recoverStaleArtifactSessions();
    return this.#completionStatus(sessionId);
  }

  recoverStaleArtifactSessions(): number {
    const now = Date.parse(this.#nowIso());
    if (!Number.isFinite(now)) {
      throw new StudyRepositoryError('invalid-server-clock', 500);
    }
    const cutoffIso = new Date(now - artifactLeaseExpiresAfterMs).toISOString();
    const recover = this.#database.transaction(() => {
      const staleSessionIds = this.#database
        .prepare(
          `SELECT lease.session_id AS sessionId
           FROM artifact_leases AS lease
           JOIN study_sessions AS session ON session.session_id = lease.session_id
           WHERE session.completion_status = 'in-progress'
             AND lease.closed_at_iso IS NULL
             AND lease.last_heartbeat_at_iso <= ?`,
        )
        .all(cutoffIso)
        .map((row) => sessionIdRowSchema.parse(row).sessionId);
      let recovered = 0;
      for (const sessionId of staleSessionIds) {
        const result = this.#database
          .prepare(
            `UPDATE study_sessions
             SET completion_status = 'incomplete-reload',
                 technical_error_code = 'artifact-stale-recovery'
             WHERE session_id = ? AND completion_status = 'in-progress'`,
          )
          .run(sessionId);
        if (result.changes === 0) continue;
        this.#closeArtifactLease(sessionId, this.#nowIso());
        recovered += 1;
      }
      return recovered;
    });

    return recover();
  }

  #findSessionByRequestId(requestId: string): PersistedSessionRecord | null {
    const row = this.#database
      .prepare(`${sessionRowSelection} WHERE create_request_id = ?`)
      .get(requestId);
    return row === undefined ? null : mapSessionRow(row);
  }

  #followUpSession(sessionId: string): z.infer<typeof followUpSessionSchema> {
    const row = this.#database
      .prepare(
        `SELECT
          follow_up_consent AS followUpConsent,
          follow_up_token_hash AS followUpTokenHash,
          completion_status AS completionStatus,
          completed_at_iso AS completedAtIso
         FROM study_sessions
         WHERE session_id = ?`,
      )
      .get(sessionId);
    if (row === undefined) {
      throw new StudyRepositoryError('session-not-found', 404);
    }
    return followUpSessionSchema.parse(row);
  }

  #findRecontactRegistration(
    whereClause: 'session_id = ?' | 'registration_request_id = ?',
    value: string,
  ): z.infer<typeof recontactRegistrationSchema> | null {
    const row = this.#database
      .prepare(
        `SELECT
          session_id AS sessionId,
          registration_request_id AS requestId,
          email,
          token_hash AS tokenHash
         FROM recontact.registrations
         WHERE ${whereClause}`,
      )
      .get(value);
    return row === undefined ? null : recontactRegistrationSchema.parse(row);
  }

  #persistFollowUpTokenHash(sessionId: string, tokenHash: string): void {
    const session = this.#followUpSession(sessionId);
    if (session.followUpTokenHash !== null && session.followUpTokenHash !== tokenHash) {
      throw new StudyRepositoryError('recontact-registration-conflict', 409);
    }
    this.#database
      .prepare(
        `UPDATE study_sessions
         SET follow_up_token_hash = ?
         WHERE session_id = ?`,
      )
      .run(tokenHash, sessionId);
  }

  #newRecontactToken(): string {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const token = this.#createRecontactToken();
      if (!followUpRawTokenSchema.safeParse(token).success) {
        throw new StudyRepositoryError('invalid-recontact-token-source', 500);
      }
      const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
      const existing = countSchema.parse(
        this.#database
          .prepare(
            `SELECT COUNT(*) AS count
             FROM recontact.registrations
             WHERE raw_token = ? OR token_hash = ?`,
          )
          .get(token, tokenHash),
      );
      if (existing.count === 0) return token;
    }
    throw new StudyRepositoryError('recontact-token-unavailable', 500);
  }

  #scheduleRecontact(sessionId: string, completedAtIso: string): void {
    const session = this.#followUpSession(sessionId);
    if (session.followUpConsent === 0) return;
    if (session.followUpTokenHash === null) {
      throw new StudyRepositoryError('recontact-registration-missing', 500);
    }
    const procedure = instrumentRuntimeManifest.procedures.followUpRecontact;
    const completedAt = Date.parse(completedAtIso);
    if (!Number.isFinite(completedAt)) {
      throw new StudyRepositoryError('invalid-server-clock', 500);
    }
    const hourMs = 60 * 60 * 1000;
    const firstInvitationAtIso = new Date(
      completedAt + procedure.firstInvitationDelayHours * hourMs,
    ).toISOString();
    const reminderAtIso = new Date(
      Date.parse(firstInvitationAtIso) + procedure.reminderDelayAfterFirstInvitationHours * hourMs,
    ).toISOString();
    const closesAtIso = new Date(
      completedAt + procedure.closeAfterSessionHours * hourMs,
    ).toISOString();
    const result = this.#database
      .prepare(
        `UPDATE recontact.registrations
         SET first_invitation_at_iso = COALESCE(first_invitation_at_iso, ?),
             reminder_at_iso = COALESCE(reminder_at_iso, ?),
             closes_at_iso = COALESCE(closes_at_iso, ?)
         WHERE session_id = ? AND token_hash = ?`,
      )
      .run(firstInvitationAtIso, reminderAtIso, closesAtIso, sessionId, session.followUpTokenHash);
    if (result.changes !== 1) {
      throw new StudyRepositoryError('recontact-registration-missing', 500);
    }
  }

  #nextAssignment(): Assignment {
    if (this.#assignmentMode === 'forced-supportive') {
      return { condition: 'supportive', blockNumber: null, slotIndex: null };
    }
    if (this.#assignmentMode === 'forced-reference') {
      return { condition: 'reference', blockNumber: null, slotIndex: null };
    }

    let slot = this.#nextOpenSlot();
    if (slot === null) {
      this.#createAssignmentBlock();
      slot = this.#nextOpenSlot();
    }
    if (slot === null) {
      throw new StudyRepositoryError('assignment-unavailable', 500);
    }

    return slot;
  }

  #nextOpenSlot(): Assignment | null {
    const row = this.#database
      .prepare(
        `SELECT
          block_number AS blockNumber,
          slot_index AS slotIndex,
          condition
         FROM assignment_slots
         WHERE session_id IS NULL
         ORDER BY block_number, slot_index
         LIMIT 1`,
      )
      .get();
    if (row === undefined) return null;
    return assignmentSlotSchema.parse(row);
  }

  #createAssignmentBlock(): void {
    const maximum = timingMaximumSchema.parse(
      this.#database
        .prepare(`SELECT COALESCE(MAX(block_number), -1) AS maximum FROM assignment_slots`)
        .get(),
    );
    const conditions: StudyCondition[] = ['supportive', 'supportive', 'reference', 'reference'];
    for (let index = conditions.length - 1; index > 0; index -= 1) {
      const swapIndex = this.#random.randomIndex(index + 1);
      if (swapIndex < 0 || swapIndex > index) {
        throw new StudyRepositoryError('invalid-random-source', 500);
      }
      const current = conditions[index];
      const swap = conditions[swapIndex];
      if (current === undefined || swap === undefined) {
        throw new StudyRepositoryError('assignment-unavailable', 500);
      }
      conditions[index] = swap;
      conditions[swapIndex] = current;
    }

    const insert = this.#database.prepare(
      `INSERT INTO assignment_slots (block_number, slot_index, condition, session_id)
       VALUES (?, ?, ?, NULL)`,
    );
    conditions.forEach((condition, slotIndex) => {
      insert.run(maximum.maximum + 1, slotIndex, condition);
    });
  }

  #nextGuardrailFormAssignment(condition: StudyCondition): GuardrailFormAssignment {
    let slot = this.#nextOpenGuardrailFormSlot(condition);
    if (slot === null) {
      this.#createGuardrailFormBlock(condition);
      slot = this.#nextOpenGuardrailFormSlot(condition);
    }
    if (slot === null) {
      throw new StudyRepositoryError('guardrail-form-assignment-unavailable', 500);
    }
    return slot;
  }

  #nextOpenGuardrailFormSlot(condition: StudyCondition): GuardrailFormAssignment | null {
    const row = this.#database
      .prepare(
        `SELECT
          block_number AS blockNumber,
          slot_index AS slotIndex,
          form_id AS formId
         FROM guardrail_form_slots
         WHERE condition = ? AND session_id IS NULL
         ORDER BY block_number, slot_index
         LIMIT 1`,
      )
      .get(condition);
    return row === undefined ? null : guardrailFormSlotSchema.parse(row);
  }

  #createGuardrailFormBlock(condition: StudyCondition): void {
    const maximum = timingMaximumSchema.parse(
      this.#database
        .prepare(
          `SELECT COALESCE(MAX(block_number), -1) AS maximum
           FROM guardrail_form_slots
           WHERE condition = ?`,
        )
        .get(condition),
    );
    const forms: GuardrailFormId[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
    for (let index = forms.length - 1; index > 0; index -= 1) {
      const swapIndex = this.#random.randomIndex(index + 1);
      if (swapIndex < 0 || swapIndex > index) {
        throw new StudyRepositoryError('invalid-random-source', 500);
      }
      const current = forms[index];
      const swap = forms[swapIndex];
      if (current === undefined || swap === undefined) {
        throw new StudyRepositoryError('guardrail-form-assignment-unavailable', 500);
      }
      forms[index] = swap;
      forms[swapIndex] = current;
    }

    const insert = this.#database.prepare(
      `INSERT INTO guardrail_form_slots (
        condition, block_number, slot_index, form_id, session_id
      ) VALUES (?, ?, ?, ?, NULL)`,
    );
    forms.forEach((formId, slotIndex) => {
      insert.run(condition, maximum.maximum + 1, slotIndex, formId);
    });
  }

  #persistGuardrailPresentations(
    sessionId: string,
    formId: GuardrailFormId,
    createdAtIso: string,
  ): void {
    const insert = this.#database.prepare(
      `INSERT INTO response_presentations (
        session_id,
        instrument_id,
        instrument_version,
        section_id,
        item_id,
        form_id,
        option_ids_json,
        created_at_iso
      ) VALUES (?, 'guardrail-v2', ?, ?, ?, ?, ?, ?)`,
    );
    for (const presentation of guardrailPresentationForForm(formId)) {
      insert.run(
        sessionId,
        this.#versions.guardrail,
        presentation.sectionId,
        presentation.itemId,
        formId,
        jsonString(presentation.displayedOptionIds),
        createdAtIso,
      );
    }
  }

  #newResearchCode(): string {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const researchCode = `RS-${this.#random.researchToken()}`;
      const existing = countSchema.parse(
        this.#database
          .prepare(`SELECT COUNT(*) AS count FROM study_sessions WHERE research_code = ?`)
          .get(researchCode),
      );
      if (existing.count === 0) return researchCode;
    }
    throw new StudyRepositoryError('research-code-unavailable', 500);
  }

  #completionStatus(sessionId: string): string {
    const row = this.#database
      .prepare(
        `SELECT completion_status AS completionStatus
         FROM study_sessions
         WHERE session_id = ?`,
      )
      .get(sessionId);
    if (row === undefined) {
      throw new StudyRepositoryError('session-not-found', 404);
    }
    return statusSchema.parse(row).completionStatus;
  }

  #instrumentVersionForSession(sessionId: string, instrumentId: string): string {
    const row = this.#database
      .prepare(
        `SELECT
          questionnaire_version AS questionnaireVersion,
          guardrail_version AS guardrailVersion
         FROM study_sessions
         WHERE session_id = ?`,
      )
      .get(sessionId);
    if (row === undefined) {
      throw new StudyRepositoryError('session-not-found', 404);
    }
    const versions = instrumentVersionsSchema.parse(row);
    const storedVersion =
      instrumentId === 'guardrail-v2' ? versions.guardrailVersion : versions.questionnaireVersion;
    const runtimeVersion =
      instrumentId === 'guardrail-v2' ? this.#versions.guardrail : this.#versions.questionnaire;
    if (storedVersion !== runtimeVersion) {
      throw new StudyRepositoryError('instrument-version-mismatch', 409);
    }
    return storedVersion;
  }

  #requireInProgress(sessionId: string): void {
    if (this.#completionStatus(sessionId) !== 'in-progress') {
      throw new StudyRepositoryError('session-not-in-progress', 409);
    }
  }

  #requireRecontactRegistration(sessionId: string): void {
    const session = this.#followUpSession(sessionId);
    if (session.followUpConsent === 0) return;
    if (session.followUpTokenHash === null) {
      throw new StudyRepositoryError('recontact-registration-required', 409);
    }
    const registration = this.#findRecontactRegistration('session_id = ?', sessionId);
    if (registration === null || registration.tokenHash !== session.followUpTokenHash) {
      throw new StudyRepositoryError('recontact-registration-required', 409);
    }
  }

  #isInstrumentBlockSubmitted(sessionId: string, instrumentId: string, sectionId: string): boolean {
    return (
      countSchema.parse(
        this.#database
          .prepare(
            `SELECT COUNT(*) AS count
             FROM instrument_submissions
             WHERE session_id = ? AND instrument_id = ? AND section_id = ?`,
          )
          .get(sessionId, instrumentId, sectionId),
      ).count === 1
    );
  }

  #requireInstrumentSubmissionPrerequisites(
    sessionId: string,
    instrumentId: string,
    sectionId: string,
  ): void {
    const blockIndex = mainInstrumentBlocks.findIndex(
      (block) => block.instrumentId === instrumentId && block.sectionId === sectionId,
    );
    if (blockIndex < 0) {
      throw new StudyRepositoryError('unknown-instrument-block', 400);
    }
    for (const precedingBlock of mainInstrumentBlocks.slice(0, blockIndex)) {
      if (
        !this.#isInstrumentBlockSubmitted(
          sessionId,
          precedingBlock.instrumentId,
          precedingBlock.sectionId,
        )
      ) {
        throw new StudyRepositoryError('instrument-block-order-conflict', 409);
      }
    }
    if (instrumentId === 'pre-v1') {
      if (
        this.#artifactBoundaryCount(sessionId, 'start') > 0 ||
        this.#webArtifactIntervalCount(sessionId) > 0
      ) {
        throw new StudyRepositoryError('pre-response-not-available', 409);
      }
      return;
    }
    this.#requireArtifactEnded(sessionId);
  }

  #requirePreCompleted(sessionId: string): void {
    const complete = mainInstrumentBlocks
      .filter((block) => block.instrumentId === 'pre-v1')
      .every((block) =>
        this.#isInstrumentBlockSubmitted(sessionId, block.instrumentId, block.sectionId),
      );
    if (!complete) throw new StudyRepositoryError('pre-response-required', 409);
  }

  #requirePostCompleted(sessionId: string): void {
    const complete = mainInstrumentBlocks
      .filter((block) => block.instrumentId === 'post-v1')
      .every((block) =>
        this.#isInstrumentBlockSubmitted(sessionId, block.instrumentId, block.sectionId),
      );
    if (!complete) throw new StudyRepositoryError('post-response-required', 409);
  }

  #requireGuardrailsCompleted(sessionId: string): void {
    const complete = mainInstrumentBlocks
      .filter((block) => block.instrumentId === 'guardrail-v2')
      .every((block) =>
        this.#isInstrumentBlockSubmitted(sessionId, block.instrumentId, block.sectionId),
      );
    if (!complete) throw new StudyRepositoryError('guardrail-response-required', 409);
  }

  #requireArtifactStarted(sessionId: string): void {
    if (
      this.#artifactBoundaryCount(sessionId, 'start') !== 1 &&
      this.#webArtifactIntervalCount(sessionId) === 0
    ) {
      throw new StudyRepositoryError('artifact-start-required', 409);
    }
  }

  #requireArtifactEnded(sessionId: string): void {
    if (
      this.#artifactBoundaryCount(sessionId, 'end') !== 1 &&
      !this.#webArtifactCompleted(sessionId)
    ) {
      throw new StudyRepositoryError('artifact-end-required', 409);
    }
  }

  #webArtifactIntervalCount(sessionId: string): number {
    return countSchema.parse(
      this.#database
        .prepare(`SELECT COUNT(*) AS count FROM web_artifact_intervals WHERE session_id = ?`)
        .get(sessionId),
    ).count;
  }

  #webArtifactCompleted(sessionId: string): boolean {
    return (
      countSchema.parse(
        this.#database
          .prepare(
            `SELECT COUNT(*) AS count FROM study_sessions
             WHERE session_id = ? AND artifact_completed_at_iso IS NOT NULL`,
          )
          .get(sessionId),
      ).count === 1
    );
  }

  #requireSupportiveSegmentsCompleted(sessionId: string): void {
    const condition = conditionSchema.parse(
      this.#database
        .prepare(`SELECT condition FROM study_sessions WHERE session_id = ?`)
        .get(sessionId),
    ).condition;
    if (condition !== 'supportive') return;

    const everySegmentCompleted = SUPPORTIVE_ARTIFACT_SEGMENT_IDS.every(
      (segmentId) =>
        this.#segmentBoundaryCount(sessionId, 'start', segmentId) === 1 &&
        this.#segmentBoundaryCount(sessionId, 'end', segmentId) === 1,
    );
    if (
      !everySegmentCompleted ||
      this.#segmentBoundaryCount(sessionId, 'start') !== SUPPORTIVE_ARTIFACT_SEGMENT_IDS.length ||
      this.#segmentBoundaryCount(sessionId, 'end') !== SUPPORTIVE_ARTIFACT_SEGMENT_IDS.length
    ) {
      throw new StudyRepositoryError('supportive-segments-incomplete', 409);
    }
  }

  #requireSupportiveArtifactActive(
    sessionId: string,
    unsupportedErrorCode = 'visibility-timing-not-supported',
  ): void {
    const condition = conditionSchema.parse(
      this.#database
        .prepare(`SELECT condition FROM study_sessions WHERE session_id = ?`)
        .get(sessionId),
    ).condition;
    if (condition !== 'supportive') {
      throw new StudyRepositoryError(unsupportedErrorCode, 409);
    }
    this.#requireArtifactStarted(sessionId);
    if (this.#artifactBoundaryCount(sessionId, 'end') > 0) {
      throw new StudyRepositoryError('artifact-not-active', 409);
    }
  }

  #artifactBoundaryCount(sessionId: string, eventType: 'start' | 'end'): number {
    return countSchema.parse(
      this.#database
        .prepare(
          `SELECT COUNT(*) AS count
           FROM timing_events
           WHERE session_id = ?
             AND phase = 'artifact'
             AND section_id IS NULL
             AND segment_id IS NULL
             AND event_type = ?`,
        )
        .get(sessionId, eventType),
    ).count;
  }

  #hasActiveArtifactLease(sessionId: string): boolean {
    return (
      countSchema.parse(
        this.#database
          .prepare(
            `SELECT COUNT(*) AS count
           FROM artifact_leases
           WHERE session_id = ? AND closed_at_iso IS NULL`,
          )
          .get(sessionId),
      ).count === 1
    );
  }

  #activateArtifactLease(sessionId: string, heartbeatAtIso: string): void {
    this.#database
      .prepare(
        `INSERT INTO artifact_leases (session_id, last_heartbeat_at_iso, closed_at_iso)
         VALUES (?, ?, NULL)
         ON CONFLICT(session_id) DO UPDATE SET
           last_heartbeat_at_iso = excluded.last_heartbeat_at_iso,
           closed_at_iso = NULL`,
      )
      .run(sessionId, heartbeatAtIso);
  }

  #closeArtifactLease(sessionId: string, closedAtIso: string): void {
    this.#database
      .prepare(
        `UPDATE artifact_leases
         SET closed_at_iso = ?
         WHERE session_id = ? AND closed_at_iso IS NULL`,
      )
      .run(closedAtIso, sessionId);
  }

  #artifactWallClockMs(sessionId: string): number | null {
    const bounds = artifactBoundsSchema.parse(
      this.#database
        .prepare(
          `SELECT
            MAX(CASE WHEN event_type = 'start' THEN client_monotonic_ms END) AS startedAt,
            MAX(CASE WHEN event_type = 'end' THEN client_monotonic_ms END) AS endedAt
           FROM timing_events
           WHERE session_id = ?
             AND phase = 'artifact'
             AND section_id IS NULL
             AND segment_id IS NULL`,
        )
        .get(sessionId),
    );
    if (bounds.startedAt === null || bounds.endedAt === null) return null;
    return bounds.endedAt - bounds.startedAt;
  }

  #requireSegmentStart(sessionId: string, segmentId: SupportiveArtifactSegmentId): void {
    this.#requireSupportiveArtifactActive(sessionId, 'segment-timing-not-supported');
    const starts = this.#segmentBoundaryCount(sessionId, 'start');
    const ends = this.#segmentBoundaryCount(sessionId, 'end');
    if (starts > ends) {
      throw new StudyRepositoryError('segment-already-active', 409);
    }

    if (this.#segmentBoundaryCount(sessionId, 'start', segmentId) > 0) {
      throw new StudyRepositoryError('segment-start-already-recorded', 409);
    }
    const segmentIndex = SUPPORTIVE_ARTIFACT_SEGMENT_IDS.indexOf(segmentId);
    if (starts !== segmentIndex || ends !== segmentIndex) {
      throw new StudyRepositoryError('segment-start-required', 409);
    }
  }

  #requireSegmentEnd(sessionId: string, segmentId: SupportiveArtifactSegmentId): void {
    this.#requireSupportiveArtifactActive(sessionId, 'segment-timing-not-supported');
    const starts = this.#segmentBoundaryCount(sessionId, 'start');
    const ends = this.#segmentBoundaryCount(sessionId, 'end');
    const segmentStarts = this.#segmentBoundaryCount(sessionId, 'start', segmentId);
    const segmentEnds = this.#segmentBoundaryCount(sessionId, 'end', segmentId);
    if (segmentStarts === 0 || starts !== ends + 1) {
      throw new StudyRepositoryError('segment-start-required', 409);
    }
    if (segmentEnds > 0) {
      throw new StudyRepositoryError('segment-end-already-recorded', 409);
    }
    const segmentIndex = SUPPORTIVE_ARTIFACT_SEGMENT_IDS.indexOf(segmentId);
    if (starts !== segmentIndex + 1 || ends !== segmentIndex) {
      throw new StudyRepositoryError('segment-start-required', 409);
    }
  }

  #segmentBoundaryCount(
    sessionId: string,
    eventType: 'start' | 'end',
    segmentId?: SupportiveArtifactSegmentId,
  ): number {
    return countSchema.parse(
      this.#database
        .prepare(
          `SELECT COUNT(*) AS count
           FROM timing_events
           WHERE session_id = ?
             AND phase = 'artifact'
             AND section_id IS NOT NULL
             AND segment_id IS NOT NULL
             AND event_type = ?
             AND (? IS NULL OR segment_id = ?)`,
        )
        .get(sessionId, eventType, segmentId ?? null, segmentId ?? null),
    ).count;
  }

  #ensureArtifactBoundaryIndex(): void {
    this.#database.exec(`
      DROP INDEX IF EXISTS unique_artifact_boundary;
      CREATE UNIQUE INDEX unique_artifact_boundary
      ON timing_events(session_id, phase, event_type)
      WHERE phase = 'artifact'
        AND section_id IS NULL
        AND segment_id IS NULL
        AND event_type IN ('start', 'end');
    `);
  }
}
