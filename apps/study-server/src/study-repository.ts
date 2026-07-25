import {
  type ArtifactTimingEvent,
  type AssignmentMode,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type PersistedSessionRecord,
  type PlaceholderInstrumentId,
  type PlaceholderResponseRequest,
  type StudyCondition,
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

const assignmentSlotSchema = z.object({
  blockNumber: z.number().int(),
  slotIndex: z.number().int(),
  condition: studyConditionSchema,
});

const countSchema = z.object({ count: z.number().int().nonnegative() });
const statusSchema = z.object({ completionStatus: z.string() });
const conditionSchema = z.object({ condition: studyConditionSchema });
const timingIdentitySchema = z.object({
  phase: z.string(),
  eventType: z.string(),
});
const timingMaximumSchema = z.object({ maximum: z.number().int() });
const artifactBoundsSchema = z.object({
  startedAt: z.number().nullable(),
  endedAt: z.number().nullable(),
});
const sessionIdRowSchema = z.object({ sessionId: z.string() });

export const artifactLeaseExpiresAfterMs = 5 * 60 * 1000;

function toCreateResponse(session: PersistedSessionRecord): CreateSessionResponse {
  return {
    sessionId: session.sessionId,
    participantCode: session.participantCode,
    condition: session.condition,
    assignmentMode: session.assignmentMode,
  };
}

function instrumentVersion(request: PlaceholderResponseRequest, versions: StudyVersions): string {
  return request.instrumentId === 'guardrail-placeholder'
    ? versions.guardrail
    : versions.questionnaire;
}

function artifactVersionForCondition(
  condition: StudyCondition,
  versions: StudyVersions,
): string {
  return condition === 'supportive' ? versions.supportiveArtifact : versions.referenceArtifact;
}

export class StudyRepository {
  readonly #database: Database.Database;
  readonly #assignmentMode: AssignmentMode;
  readonly #versions: StudyVersions;
  readonly #random: StudyRandomSource;
  readonly #nowIso: () => string;

  constructor(options: {
    database: Database.Database;
    assignmentMode: AssignmentMode;
    versions: StudyVersions;
    random: StudyRandomSource;
    nowIso?: () => string;
  }) {
    this.#database = options.database;
    this.#assignmentMode = options.assignmentMode;
    this.#versions = options.versions;
    this.#random = options.random;
    this.#nowIso = options.nowIso ?? (() => new Date().toISOString());
  }

  createSession(request: CreateSessionRequest): CreateSessionResponse {
    this.recoverStaleArtifactSessions();
    const create = this.#database.transaction(() => {
      const existing = this.#findSessionByRequestId(request.requestId);
      if (existing !== null) {
        return toCreateResponse(existing);
      }

      const sessionId = this.#random.randomUuid();
      const assignment = this.#nextAssignment();
      const participantCode = this.#newParticipantCode();
      const createdAtIso = this.#nowIso();
      const artifactVersion = artifactVersionForCondition(assignment.condition, this.#versions);

      this.#database
        .prepare(
          `INSERT INTO study_sessions (
            session_id,
            create_request_id,
            participant_code,
            condition,
            assignment_mode,
            study_version,
            content_version,
            questionnaire_version,
            guardrail_version,
            consent_version,
            reference_artifact_version,
            consent_accepted,
            completion_status,
            technical_error_code,
            created_at_iso,
            completed_at_iso
          ) VALUES (
            @sessionId,
            @requestId,
            @participantCode,
            @condition,
            @assignmentMode,
            @studyVersion,
            @contentVersion,
            @questionnaireVersion,
            @guardrailVersion,
            @consentVersion,
            @referenceArtifactVersion,
            1,
            'in-progress',
            NULL,
            @createdAtIso,
            NULL
          )`,
        )
        .run({
          sessionId,
          requestId: request.requestId,
          participantCode,
          condition: assignment.condition,
          assignmentMode: this.#assignmentMode,
          studyVersion: this.#versions.study,
          contentVersion: artifactVersion,
          questionnaireVersion: this.#versions.questionnaire,
          guardrailVersion: this.#versions.guardrail,
          consentVersion: this.#versions.consent,
          referenceArtifactVersion:
            assignment.condition === 'reference' ? artifactVersion : null,
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

      const session = this.findSession(sessionId);
      if (session === null) {
        throw new StudyRepositoryError('session-create-failed', 500);
      }
      return toCreateResponse(session);
    });

    return create();
  }

  savePlaceholder(sessionId: string, request: PlaceholderResponseRequest): void {
    this.recoverStaleArtifactSessions();
    const status = this.#completionStatus(sessionId);
    if (this.#hasResponse(sessionId, request.instrumentId)) return;
    if (status !== 'in-progress') {
      throw new StudyRepositoryError('session-not-in-progress', 409);
    }

    this.#requirePlaceholderPrerequisites(sessionId, request.instrumentId);
    this.#database
      .prepare(
        `INSERT INTO responses (
          session_id,
          instrument_id,
          instrument_version,
          item_id,
          json_value,
          created_at_iso
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id, instrument_id, item_id) DO NOTHING`,
      )
      .run(
        sessionId,
        request.instrumentId,
        instrumentVersion(request, this.#versions),
        request.itemId,
        JSON.stringify(request.value),
        this.#nowIso(),
      );
  }

  recordTiming(sessionId: string, event: ArtifactTimingEvent): TimingWriteResponse {
    this.recoverStaleArtifactSessions();
    const record = this.#database.transaction(() => {
      const existingSequence = timingIdentitySchema.nullable().parse(
        this.#database
          .prepare(
            `SELECT phase, event_type AS eventType
               FROM timing_events
               WHERE session_id = ? AND sequence = ?`,
          )
          .get(sessionId, event.sequence) ?? null,
      );
      if (existingSequence !== null) {
        if (
          existingSequence.phase !== event.phase ||
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

      if (event.eventType === 'start') {
        this.#requirePreCompleted(sessionId);
      }
      if (event.eventType === 'end') {
        this.#requireArtifactStarted(sessionId);
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

      if (event.eventType === 'start') {
        this.#activateArtifactLease(sessionId, this.#nowIso());
      }
      if (event.eventType === 'end') {
        this.#closeArtifactLease(sessionId, this.#nowIso());
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
      if (status === 'completed') return status;
      if (status !== 'in-progress') {
        throw new StudyRepositoryError('session-not-in-progress', 409);
      }

      this.#requirePreCompleted(sessionId);
      this.#requireArtifactStarted(sessionId);
      this.#requireArtifactEnded(sessionId);
      this.#requirePostCompleted(sessionId);
      this.#requireGuardrailsCompleted(sessionId);

      this.#database
        .prepare(
          `UPDATE study_sessions
           SET completion_status = 'completed', completed_at_iso = ?
           WHERE session_id = ?`,
        )
        .run(this.#nowIso(), sessionId);
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

  #newParticipantCode(): string {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const participantCode = `PW-${this.#random.participantToken()}`;
      const existing = countSchema.parse(
        this.#database
          .prepare(`SELECT COUNT(*) AS count FROM study_sessions WHERE participant_code = ?`)
          .get(participantCode),
      );
      if (existing.count === 0) return participantCode;
    }
    throw new StudyRepositoryError('participant-code-unavailable', 500);
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

  #requireInProgress(sessionId: string): void {
    if (this.#completionStatus(sessionId) !== 'in-progress') {
      throw new StudyRepositoryError('session-not-in-progress', 409);
    }
  }

  #hasResponse(sessionId: string, instrumentId: PlaceholderInstrumentId): boolean {
    const responseCount = countSchema.parse(
      this.#database
        .prepare(
          `SELECT COUNT(*) AS count
           FROM responses
           WHERE session_id = ? AND instrument_id = ? AND item_id = 'placeholder-complete'`,
        )
        .get(sessionId, instrumentId),
    );
    return responseCount.count === 1;
  }

  #requirePlaceholderPrerequisites(sessionId: string, instrumentId: PlaceholderInstrumentId): void {
    if (instrumentId === 'pre-placeholder') {
      if (this.#artifactBoundaryCount(sessionId, 'start') > 0) {
        throw new StudyRepositoryError('pre-response-not-available', 409);
      }
      return;
    }
    if (instrumentId === 'post-placeholder') {
      this.#requirePreCompleted(sessionId);
      this.#requireArtifactEnded(sessionId);
      return;
    }
    this.#requirePostCompleted(sessionId);
  }

  #requirePreCompleted(sessionId: string): void {
    if (!this.#hasResponse(sessionId, 'pre-placeholder')) {
      throw new StudyRepositoryError('pre-response-required', 409);
    }
  }

  #requirePostCompleted(sessionId: string): void {
    if (!this.#hasResponse(sessionId, 'post-placeholder')) {
      throw new StudyRepositoryError('post-response-required', 409);
    }
  }

  #requireGuardrailsCompleted(sessionId: string): void {
    if (!this.#hasResponse(sessionId, 'guardrail-placeholder')) {
      throw new StudyRepositoryError('guardrail-response-required', 409);
    }
  }

  #requireArtifactStarted(sessionId: string): void {
    if (this.#artifactBoundaryCount(sessionId, 'start') !== 1) {
      throw new StudyRepositoryError('artifact-start-required', 409);
    }
  }

  #requireArtifactEnded(sessionId: string): void {
    if (this.#artifactBoundaryCount(sessionId, 'end') !== 1) {
      throw new StudyRepositoryError('artifact-end-required', 409);
    }
  }

  #requireSupportiveArtifactActive(sessionId: string): void {
    const condition = conditionSchema.parse(
      this.#database
        .prepare(`SELECT condition FROM study_sessions WHERE session_id = ?`)
        .get(sessionId),
    ).condition;
    if (condition !== 'supportive') {
      throw new StudyRepositoryError('visibility-timing-not-supported', 409);
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
           WHERE session_id = ? AND phase = 'artifact' AND event_type = ?`,
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
           WHERE session_id = ? AND phase = 'artifact'`,
        )
        .get(sessionId),
    );
    if (bounds.startedAt === null || bounds.endedAt === null) return null;
    return bounds.endedAt - bounds.startedAt;
  }
}
