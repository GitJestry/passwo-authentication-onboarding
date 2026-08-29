import {
  type ArtifactCheckpoint,
  type ArtifactIntervalEndRequest,
  type ArtifactIntervalHeartbeatRequest,
  type ArtifactIntervalStartRequest,
  type ArtifactIntervalStartResponse,
  type ConfirmArtifactCheckpointRequest,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type DeletionCode,
  deletionCodeHashSchema,
  type DeletionCodeHash,
  completionStatusSchema,
  type CompletionStatus,
  type InstrumentSubmissionRequest,
  mainInstrumentBlocks,
  REFERENCE_LESSON_CHECKPOINTS,
  referenceLessonCheckpointSchema,
  type StudyProgressCheckpoint,
  studyProgressCheckpointSchema,
  supportiveArtifactSegmentIdSchema,
  supportiveResumeSegmentFor,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_CHECKPOINTS,
  supportiveCheckpointSchema,
  supportiveS08BackedCheckpointSchema,
  supportiveS08ResumeStateSchema,
  type RegisterRecontactRequest,
  type RecruitmentSource,
  type SupportiveS08ResumeState,
  type WebArtifactVisibilityRequest,
  type WebResumeSession,
  type WebResumeTokenHash,
  type WebSegmentTimingRequest,
} from '@passwo/contracts';
import type Database from 'better-sqlite3';
import { z } from 'zod';
import { type StudyRepository, StudyRepositoryError } from './study-repository.js';

const sessionSchema = z.object({
  sessionId: z.string(),
  condition: z.enum(['supportive', 'reference']),
  assignmentMode: z.enum(['permuted-block', 'forced-supportive', 'forced-reference']),
  guardrailFormId: z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6']),
  followUpConsent: z.union([z.literal(0), z.literal(1)]),
  completionStatus: z.string(),
  progressCheckpoint: z.string(),
  artifactCompletedAtIso: z.string().nullable(),
  interruptionCount: z.number().int().nonnegative(),
  supportiveS08ResumeStateJson: z.string().nullable(),
});
const checkpointSchema = z.object({
  condition: z.enum(['supportive', 'reference']),
  progressCheckpoint: z.string(),
  artifactCompletedAtIso: z.string().nullable(),
});
const tokenRowSchema = z.object({
  sessionId: z.string(),
  createRequestId: z.string(),
  expiresAtIso: z.string(),
  invalidatedAtIso: z.string().nullable(),
  completionStatus: z.string(),
  deletionCodeHash: deletionCodeHashSchema,
});
const createRetryRowSchema = z.object({
  sessionId: z.string(),
  followUpConsent: z.union([z.literal(0), z.literal(1)]),
  deletionCodeHash: deletionCodeHashSchema,
  completionStatus: z.string(),
});
const intervalSchema = z.object({
  intervalId: z.string(),
  requestId: z.string(),
  sessionId: z.string(),
  elapsedMs: z.number().nonnegative(),
  closedAtIso: z.string().nullable(),
  closeReason: z.enum(['completed', 'interrupted']).nullable(),
});
const countSchema = z.object({ count: z.number().int().nonnegative() });
const elapsedSchema = z.object({ elapsedMs: z.number().nonnegative() });
const eventSchema = z.object({
  sessionId: z.string(),
  intervalId: z.string(),
  segmentId: z.string(),
  eventType: z.string(),
  elapsedMs: z.number().nullable(),
});
const visibilitySchema = z.object({
  sessionId: z.string(),
  intervalId: z.string(),
  visibility: z.string(),
  elapsedMs: z.number(),
});
const segmentStateSchema = z.object({
  segmentId: z.enum(SUPPORTIVE_ARTIFACT_SEGMENT_IDS),
  eventType: z.enum(['segment-start', 'segment-end']),
});

type WebRuntimeCreateSessionRequest = CreateSessionRequest & {
  readonly recontact: RegisterRecontactRequest | null;
};

export interface ResumeTokenBinding {
  readonly sessionId: string;
  readonly createRequestId: string;
  readonly deletionCodeHash: DeletionCodeHash;
  readonly active: boolean;
}

const supportiveRank = new Map<ArtifactCheckpoint, number>(
  SUPPORTIVE_CHECKPOINTS.map((value, index) => [value, index]),
);
const referenceRank = new Map<ArtifactCheckpoint, number>(
  REFERENCE_LESSON_CHECKPOINTS.map((value, index) => [value, index]),
);

function isArtifactCheckpoint(value: StudyProgressCheckpoint): boolean {
  return value.startsWith('supportive:') || value.startsWith('reference:');
}

export interface WebRuntimeRepositoryOptions {
  readonly database: Database.Database;
  readonly studyRepository: StudyRepository;
  readonly nowIso: () => string;
  readonly randomUuid: () => string;
  readonly resumeCloseAtIso: string;
}

export class WebRuntimeRepository {
  readonly #database: Database.Database;
  readonly #studyRepository: StudyRepository;
  readonly #nowIso: () => string;
  readonly #randomUuid: () => string;
  readonly #resumeCloseAtIso: string;

  constructor(options: WebRuntimeRepositoryOptions) {
    this.#database = options.database;
    this.#studyRepository = options.studyRepository;
    this.#nowIso = options.nowIso;
    this.#randomUuid = options.randomUuid;
    this.#resumeCloseAtIso = options.resumeCloseAtIso;
  }

  createSession(
    request: WebRuntimeCreateSessionRequest,
    recruitmentSource: RecruitmentSource,
    tokenHash: WebResumeTokenHash,
    expiresAtIso: string,
  ): CreateSessionResponse {
    this.#requireCollectionOpen();
    return this.#database.transaction(() => {
      const existing = createRetryRowSchema.nullable().parse(
        this.#database.prepare(
          `SELECT session_id AS sessionId,
                  follow_up_consent AS followUpConsent,
                  deletion_code_hash AS deletionCodeHash,
                  completion_status AS completionStatus
           FROM study_sessions
           WHERE create_request_id = ?`,
        ).get(request.requestId) ?? null,
      );
      if (
        existing !== null &&
        existing.deletionCodeHash !== request.deletionCodeHash
      ) {
        if (
          existing.completionStatus !== 'in-progress' ||
          (existing.followUpConsent === 1) !== request.followUpConsent
        ) {
          throw new StudyRepositoryError('session-create-conflict', 409);
        }
        this.#database.prepare(
          `UPDATE study_sessions
           SET deletion_code_hash = ?
           WHERE session_id = ? AND completion_status = 'in-progress'`,
        ).run(request.deletionCodeHash, existing.sessionId);
      }
      const session = this.#studyRepository.createSession(request, recruitmentSource);
      if (request.recontact !== null) {
        this.#studyRepository.registerRecontact(session.sessionId, request.recontact);
      }
      const now = this.#nowIso();
      this.#database.prepare(
        `INSERT INTO web_resume_tokens (
           session_id, token_hash, expires_at_iso, last_confirmed_at_iso, invalidated_at_iso
         ) VALUES (?, ?, ?, ?, NULL)
         ON CONFLICT(session_id) DO UPDATE SET
           token_hash = excluded.token_hash,
           expires_at_iso = excluded.expires_at_iso,
           last_confirmed_at_iso = excluded.last_confirmed_at_iso,
           invalidated_at_iso = NULL`,
      ).run(session.sessionId, tokenHash, expiresAtIso, now);
      return session;
    })();
  }

  resumeTokenBinding(tokenHash: WebResumeTokenHash): ResumeTokenBinding | null {
    const row = this.#resumeTokenRow(tokenHash);
    if (row === null) return null;
    return {
      sessionId: row.sessionId,
      createRequestId: row.createRequestId,
      deletionCodeHash: row.deletionCodeHash,
      active:
        row.invalidatedAtIso === null &&
        row.completionStatus === 'in-progress' &&
        Date.parse(row.expiresAtIso) > Date.parse(this.#nowIso()) &&
        this.#collectionOpen(),
    };
  }

  resolveSession(tokenHash: WebResumeTokenHash, allowCompleted = false): string | null {
    const row = this.#resumeTokenRow(tokenHash);
    if (row === null) return null;
    if (allowCompleted && row.completionStatus === 'completed') return row.sessionId;
    if (
      row.invalidatedAtIso !== null ||
      row.completionStatus !== 'in-progress' ||
      Date.parse(row.expiresAtIso) <= Date.parse(this.#nowIso()) ||
      !this.#collectionOpen()
    ) return null;
    return row.sessionId;
  }

  restoreSession(sessionId: string, deletionCode: DeletionCode | null): WebResumeSession {
    this.#requireCollectionOpen();
    return this.#database.transaction(() => {
      const interrupted = this.#closeOpenInterval(sessionId, 'interrupted');
      const now = this.#nowIso();
      this.#database.prepare(
        `UPDATE study_sessions
         SET web_interruption_count = web_interruption_count + ?, last_resumed_at_iso = ?
         WHERE session_id = ? AND completion_status = 'in-progress'`,
      ).run(interrupted ? 1 : 0, now, sessionId);
      return this.#resumeSnapshot(sessionId, deletionCode);
    })();
  }

  refreshToken(sessionId: string, tokenHash: WebResumeTokenHash, expiresAtIso: string): void {
    const result = this.#database.prepare(
      `UPDATE web_resume_tokens
       SET expires_at_iso = ?, last_confirmed_at_iso = ?
       WHERE session_id = ? AND token_hash = ? AND invalidated_at_iso IS NULL`,
    ).run(expiresAtIso, this.#nowIso(), sessionId, tokenHash);
    if (result.changes === 0) throw new StudyRepositoryError('resume-token-invalid', 401);
  }

  saveInstrumentSubmission(sessionId: string, request: InstrumentSubmissionRequest): void {
    this.#database.transaction(() => {
      this.#studyRepository.saveInstrumentSubmission(sessionId, request);
      this.#database.prepare(
        `UPDATE study_sessions SET progress_checkpoint = ? WHERE session_id = ?`,
      ).run(this.#derivedPhaseCheckpoint(sessionId), sessionId);
    })();
  }

  getSessionStatus(sessionId: string): CompletionStatus {
    return completionStatusSchema.parse(this.#studyRepository.getSessionStatus(sessionId));
  }

  openArtifactInterval(
    sessionId: string,
    request: ArtifactIntervalStartRequest,
  ): ArtifactIntervalStartResponse {
    this.#requireCollectionOpen();
    return this.#database.transaction(() => {
      const existing = intervalSchema.nullable().parse(
        this.#database.prepare(
          `SELECT interval_id AS intervalId, open_request_id AS requestId,
                  session_id AS sessionId, confirmed_elapsed_ms AS elapsedMs,
                  closed_at_iso AS closedAtIso, close_reason AS closeReason
           FROM web_artifact_intervals WHERE open_request_id = ?`,
        ).get(request.requestId) ?? null,
      );
      if (existing !== null) {
        if (existing.sessionId !== sessionId) {
          throw new StudyRepositoryError('artifact-interval-request-conflict', 409);
        }
        if (existing.closedAtIso !== null) {
          throw new StudyRepositoryError('artifact-interval-not-active', 409);
        }
        return {
          intervalId: existing.intervalId,
          checkpoint: this.#artifactCheckpoint(this.#checkpointSession(sessionId)),
          artifactSessionElapsedMs: this.#artifactElapsedMs(sessionId),
          interrupted: this.#interruptionCount(sessionId) > 0,
        };
      }

      this.#requirePreCompleted(sessionId);
      const session = this.#checkpointSession(sessionId);
      if (session.artifactCompletedAtIso !== null) {
        throw new StudyRepositoryError('artifact-already-completed', 409);
      }
      const closed = this.#closeOpenInterval(sessionId, 'interrupted');
      if (closed) {
        this.#database.prepare(
          `UPDATE study_sessions
           SET web_interruption_count = web_interruption_count + 1, last_resumed_at_iso = ?
           WHERE session_id = ?`,
        ).run(this.#nowIso(), sessionId);
      }
      const intervalId = this.#randomUuid();
      const now = this.#nowIso();
      this.#database.prepare(
        `INSERT INTO web_artifact_intervals (
           interval_id, open_request_id, session_id, started_at_iso,
           last_confirmed_at_iso, confirmed_elapsed_ms
         ) VALUES (?, ?, ?, ?, ?, 0)`,
      ).run(intervalId, request.requestId, sessionId, now, now);
      const checkpoint = session.condition === 'supportive'
        ? this.#advanceCheckpoint(sessionId, 'supportive:S00')
        : this.#advanceCheckpoint(sessionId, 'reference:passwords');
      return {
        intervalId,
        checkpoint,
        artifactSessionElapsedMs: this.#artifactElapsedMs(sessionId),
        interrupted: this.#interruptionCount(sessionId) > 0,
      };
    })();
  }

  heartbeat(sessionId: string, request: ArtifactIntervalHeartbeatRequest): void {
    this.#database.transaction(() => {
      this.#activeInterval(sessionId, request.intervalId);
      this.#confirmElapsed(request.intervalId, request.elapsedMs);
    })();
  }

  recordVisibility(sessionId: string, request: WebArtifactVisibilityRequest): boolean {
    return this.#database.transaction(() => {
      this.#activeInterval(sessionId, request.intervalId);
      const existing = visibilitySchema.nullable().parse(
        this.#database.prepare(
          `SELECT session_id AS sessionId, interval_id AS intervalId,
                  visibility, elapsed_ms AS elapsedMs
           FROM web_artifact_visibility_events WHERE event_id = ?`,
        ).get(request.eventId) ?? null,
      );
      if (existing !== null) {
        if (
          existing.sessionId !== sessionId || existing.intervalId !== request.intervalId ||
          existing.visibility !== request.visibility || existing.elapsedMs !== request.elapsedMs
        ) throw new StudyRepositoryError('visibility-event-conflict', 409);
        return false;
      }
      this.#confirmElapsed(request.intervalId, request.elapsedMs);
      this.#database.prepare(
        `INSERT INTO web_artifact_visibility_events (
           event_id, interval_id, session_id, visibility, elapsed_ms, server_received_at_iso
         ) VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        request.eventId,
        request.intervalId,
        sessionId,
        request.visibility,
        request.elapsedMs,
        this.#nowIso(),
      );
      return true;
    })();
  }

  confirmCheckpoint(
    sessionId: string,
    request: ConfirmArtifactCheckpointRequest,
  ): ArtifactCheckpoint {
    return this.#database.transaction(() => {
      this.#activeInterval(sessionId, request.intervalId);
      const session = this.#checkpointSession(sessionId);
      if (request.checkpoint.startsWith('reference:')) {
        if (session.condition !== 'reference') {
          throw new StudyRepositoryError('artifact-checkpoint-condition-conflict', 409);
        }
        this.#database.prepare(
          `UPDATE study_sessions SET progress_checkpoint = ? WHERE session_id = ?`,
        ).run(request.checkpoint, sessionId);
        return request.checkpoint;
      }
      if (request.checkpoint === 'supportive:S08') {
        if (session.condition !== 'supportive') {
          throw new StudyRepositoryError('artifact-checkpoint-condition-conflict', 409);
        }
        this.#requireSupportiveSegmentsCompleted(sessionId);
        this.#storeS08ResumeState(sessionId, request.resumeState);
        return this.#advanceCheckpoint(sessionId, request.checkpoint);
      }
      if (supportiveS08BackedCheckpointSchema.safeParse(request.checkpoint).success) {
        if (session.condition !== 'supportive') {
          throw new StudyRepositoryError('artifact-checkpoint-condition-conflict', 409);
        }
        const state = z.object({ resumeStateJson: z.string().nullable() }).parse(
          this.#database.prepare(
            `SELECT supportive_s08_resume_state_json AS resumeStateJson
             FROM study_sessions WHERE session_id = ?`,
          ).get(sessionId),
        );
        if (state.resumeStateJson === null) {
          throw new StudyRepositoryError('supportive-s08-resume-state-required', 409);
        }
      }
      return this.#advanceCheckpoint(sessionId, request.checkpoint);
    })();
  }

  recordSegment(
    sessionId: string,
    request: WebSegmentTimingRequest,
  ): { readonly recorded: boolean; readonly checkpoint: (typeof SUPPORTIVE_CHECKPOINTS)[number] } {
    return this.#database.transaction(() => {
      this.#activeInterval(sessionId, request.intervalId);
      const session = this.#checkpointSession(sessionId);
      if (session.condition !== 'supportive') {
        throw new StudyRepositoryError('segment-timing-not-supported', 409);
      }
      const existing = eventSchema.nullable().parse(
        this.#database.prepare(
          `SELECT session_id AS sessionId, interval_id AS intervalId,
                  segment_id AS segmentId, event_type AS eventType, elapsed_ms AS elapsedMs
           FROM web_segment_timing_events WHERE event_id = ?`,
        ).get(request.eventId) ?? null,
      );
      if (existing !== null) {
        if (
          existing.sessionId !== sessionId || existing.intervalId !== request.intervalId ||
          existing.segmentId !== request.segmentId || existing.eventType !== request.eventType ||
          existing.elapsedMs !== request.elapsedMs
        ) throw new StudyRepositoryError('segment-timing-event-conflict', 409);
        return {
          recorded: false,
          checkpoint: supportiveCheckpointSchema.parse(
            this.#artifactCheckpoint(this.#checkpointSession(sessionId)),
          ),
        };
      }
      this.#requireSegmentOrder(sessionId, request);
      this.#database.prepare(
        `INSERT INTO web_segment_timing_events (
           event_id, interval_id, session_id, segment_id, event_type, elapsed_ms,
           server_received_at_iso
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        request.eventId,
        request.intervalId,
        sessionId,
        request.segmentId,
        request.eventType,
        request.elapsedMs,
        this.#nowIso(),
      );
      const checkpoint = request.eventType === 'segment-start'
        ? supportiveCheckpointSchema.parse(`supportive:${request.segmentId}`)
        : this.#checkpointAfterSegment(request.segmentId);
      return {
        recorded: true,
        checkpoint: supportiveCheckpointSchema.parse(
          this.#advanceCheckpoint(sessionId, checkpoint),
        ),
      };
    })();
  }

  endArtifact(sessionId: string, request: ArtifactIntervalEndRequest): number {
    return this.#database.transaction(() => {
      const session = this.#checkpointSession(sessionId);
      if (session.artifactCompletedAtIso !== null) return this.#artifactElapsedMs(sessionId);
      this.#activeInterval(sessionId, request.intervalId);
      this.#confirmElapsed(request.intervalId, request.elapsedMs);
      this.#requireArtifactCompletion(sessionId, session.condition);
      const now = this.#nowIso();
      this.#database.prepare(
        `UPDATE web_artifact_intervals
         SET closed_at_iso = ?, close_reason = 'completed', last_confirmed_at_iso = ?
         WHERE interval_id = ? AND session_id = ? AND closed_at_iso IS NULL`,
      ).run(now, now, request.intervalId, sessionId);
      this.#database.prepare(
        `UPDATE study_sessions
         SET artifact_completed_at_iso = ?, progress_checkpoint = 'post-questionnaire',
             supportive_s08_resume_state_json = NULL
         WHERE session_id = ? AND completion_status = 'in-progress'`,
      ).run(now, sessionId);
      return this.#artifactElapsedMs(sessionId);
    })();
  }

  completeSession(sessionId: string): CompletionStatus {
    return this.#database.transaction(() => {
      const status = completionStatusSchema.parse(this.#studyRepository.completeSession(sessionId));
      const now = this.#nowIso();
      this.#database.prepare(
        `UPDATE study_sessions SET progress_checkpoint = 'complete' WHERE session_id = ?`,
      ).run(sessionId);
      this.#database.prepare(
        `UPDATE web_resume_tokens
         SET invalidated_at_iso = COALESCE(invalidated_at_iso, ?), last_confirmed_at_iso = ?
         WHERE session_id = ?`,
      ).run(now, now, sessionId);
      return status;
    })();
  }

  #resumeTokenRow(tokenHash: WebResumeTokenHash): z.infer<typeof tokenRowSchema> | null {
    return tokenRowSchema.nullable().parse(
      this.#database.prepare(
        `SELECT token.session_id AS sessionId,
                session.create_request_id AS createRequestId,
                token.expires_at_iso AS expiresAtIso,
                token.invalidated_at_iso AS invalidatedAtIso,
                session.completion_status AS completionStatus,
                session.deletion_code_hash AS deletionCodeHash
         FROM web_resume_tokens AS token
         JOIN study_sessions AS session ON session.session_id = token.session_id
         WHERE token.token_hash = ?`,
      ).get(tokenHash) ?? null,
    );
  }

  #resumeSnapshot(sessionId: string, deletionCode: DeletionCode | null): WebResumeSession {
    const session = sessionSchema.parse(
      this.#database.prepare(
        `SELECT session_id AS sessionId, condition, assignment_mode AS assignmentMode,
                guardrail_form_id AS guardrailFormId, follow_up_consent AS followUpConsent,
                completion_status AS completionStatus,
                progress_checkpoint AS progressCheckpoint,
                artifact_completed_at_iso AS artifactCompletedAtIso,
                web_interruption_count AS interruptionCount,
                supportive_s08_resume_state_json AS supportiveS08ResumeStateJson
         FROM study_sessions WHERE session_id = ?`,
      ).get(sessionId),
    );
    if (session.completionStatus !== 'in-progress') {
      throw new StudyRepositoryError('session-not-in-progress', 409);
    }
    const next = this.#nextInstrumentBlockIndex(sessionId);
    const preCount = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1').length;
    const nextBlock = mainInstrumentBlocks[next];
    const checkpoint = studyProgressCheckpointSchema.parse(session.progressCheckpoint);
    const supportiveS08ResumeState =
      session.condition === 'supportive' &&
      supportiveS08BackedCheckpointSchema.safeParse(checkpoint).success
        ? supportiveS08ResumeStateSchema.parse(
            JSON.parse(session.supportiveS08ResumeStateJson ?? 'null'),
          )
        : null;
    const resumeTarget = next < preCount
      ? 'pre-questionnaire'
      : session.artifactCompletedAtIso === null
        ? isArtifactCheckpoint(checkpoint) ? 'artifact' : 'artifact-preparation'
        : nextBlock?.instrumentId === 'guardrail-v2'
          ? 'guardrails'
          : nextBlock?.instrumentId === 'post-v1'
            ? 'post-questionnaire'
            : 'session-closure';
    return {
      sessionId: session.sessionId,
      condition: session.condition,
      assignmentMode: session.assignmentMode,
      guardrailFormId: session.guardrailFormId,
      followUpConsent: session.followUpConsent === 1,
      checkpoint,
      resumeTarget,
      nextInstrumentBlockIndex: next,
      artifactSessionElapsedMs:
        session.artifactCompletedAtIso === null && this.#artifactIntervalCount(sessionId) === 0
          ? null
          : this.#artifactElapsedMs(sessionId),
      interrupted: session.interruptionCount > 0,
      deletionCode,
      supportiveS08ResumeState,
    };
  }

  #storeS08ResumeState(sessionId: string, resumeState: SupportiveS08ResumeState): void {
    const encoded = JSON.stringify(supportiveS08ResumeStateSchema.parse(resumeState));
    const row = z.object({ resumeStateJson: z.string().nullable() }).parse(
      this.#database.prepare(
        `SELECT supportive_s08_resume_state_json AS resumeStateJson
         FROM study_sessions WHERE session_id = ? AND completion_status = 'in-progress'`,
      ).get(sessionId),
    );
    if (row.resumeStateJson !== null && row.resumeStateJson !== encoded) {
      throw new StudyRepositoryError('supportive-s08-resume-state-conflict', 409);
    }
    this.#database.prepare(
      `UPDATE study_sessions
       SET supportive_s08_resume_state_json = ?
       WHERE session_id = ? AND completion_status = 'in-progress'`,
    ).run(encoded, sessionId);
  }

  #derivedPhaseCheckpoint(sessionId: string): StudyProgressCheckpoint {
    const next = this.#nextInstrumentBlockIndex(sessionId);
    const preCount = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1').length;
    if (next < preCount) return 'pre-questionnaire';
    const session = this.#checkpointSession(sessionId);
    if (session.artifactCompletedAtIso === null) return 'artifact-preparation';
    const block = mainInstrumentBlocks[next];
    if (block?.instrumentId === 'guardrail-v2') return 'guardrails';
    if (block?.instrumentId === 'post-v1') return 'post-questionnaire';
    return 'session-closure';
  }

  #nextInstrumentBlockIndex(sessionId: string): number {
    const rows = z.array(z.object({ instrumentId: z.string(), sectionId: z.string() })).parse(
      this.#database.prepare(
        `SELECT instrument_id AS instrumentId, section_id AS sectionId
         FROM instrument_submissions WHERE session_id = ?`,
      ).all(sessionId),
    );
    const completed = new Set(rows.map((row) => `${row.instrumentId}\u0000${row.sectionId}`));
    const next = mainInstrumentBlocks.findIndex(
      (block) => !completed.has(`${block.instrumentId}\u0000${block.sectionId}`),
    );
    return next === -1 ? mainInstrumentBlocks.length : next;
  }

  #checkpointSession(sessionId: string): z.infer<typeof checkpointSchema> {
    const row = this.#database.prepare(
      `SELECT condition, progress_checkpoint AS progressCheckpoint,
              artifact_completed_at_iso AS artifactCompletedAtIso
       FROM study_sessions WHERE session_id = ? AND completion_status = 'in-progress'`,
    ).get(sessionId);
    if (row === undefined) throw new StudyRepositoryError('session-not-in-progress', 409);
    return checkpointSchema.parse(row);
  }

  #artifactCheckpoint(session: z.infer<typeof checkpointSchema>): ArtifactCheckpoint {
    const checkpoint = studyProgressCheckpointSchema.parse(session.progressCheckpoint);
    if (session.condition === 'supportive') {
      return checkpoint.startsWith('supportive:')
        ? supportiveCheckpointSchema.parse(checkpoint)
        : 'supportive:entry';
    }
    return checkpoint.startsWith('reference:')
      ? referenceLessonCheckpointSchema.parse(checkpoint)
      : 'reference:passwords';
  }

  #advanceCheckpoint(sessionId: string, requested: ArtifactCheckpoint): ArtifactCheckpoint {
    const session = this.#checkpointSession(sessionId);
    const current = this.#artifactCheckpoint(session);
    if (
      (session.condition === 'supportive' && !requested.startsWith('supportive:')) ||
      (session.condition === 'reference' && !requested.startsWith('reference:'))
    ) throw new StudyRepositoryError('artifact-checkpoint-condition-conflict', 409);
    const ranks = requested.startsWith('supportive:') ? supportiveRank : referenceRank;
    if ((ranks.get(requested) ?? -1) > (ranks.get(current) ?? -1)) {
      this.#database.prepare(
        `UPDATE study_sessions SET progress_checkpoint = ? WHERE session_id = ?`,
      ).run(requested, sessionId);
      return requested;
    }
    return current;
  }

  #activeInterval(sessionId: string, intervalId: string): void {
    const row = intervalSchema.nullable().parse(
      this.#database.prepare(
        `SELECT interval_id AS intervalId, open_request_id AS requestId,
                session_id AS sessionId, confirmed_elapsed_ms AS elapsedMs,
                closed_at_iso AS closedAtIso, close_reason AS closeReason
         FROM web_artifact_intervals WHERE interval_id = ? AND session_id = ?`,
      ).get(intervalId, sessionId) ?? null,
    );
    if (row === null) throw new StudyRepositoryError('artifact-interval-not-found', 404);
    if (row.closedAtIso !== null) throw new StudyRepositoryError('artifact-interval-not-active', 409);
  }

  #confirmElapsed(intervalId: string, elapsedMs: number): void {
    this.#database.prepare(
      `UPDATE web_artifact_intervals
       SET confirmed_elapsed_ms = MAX(confirmed_elapsed_ms, ?), last_confirmed_at_iso = ?
       WHERE interval_id = ? AND closed_at_iso IS NULL`,
    ).run(elapsedMs, this.#nowIso(), intervalId);
  }

  #closeOpenInterval(sessionId: string, reason: 'completed' | 'interrupted'): boolean {
    const now = this.#nowIso();
    return this.#database.prepare(
      `UPDATE web_artifact_intervals
       SET closed_at_iso = ?, close_reason = ?, last_confirmed_at_iso = ?
       WHERE session_id = ? AND closed_at_iso IS NULL`,
    ).run(now, reason, now, sessionId).changes > 0;
  }

  #requireSegmentOrder(sessionId: string, request: WebSegmentTimingRequest): void {
    const rows = z.array(segmentStateSchema).parse(
      this.#database.prepare(
        `SELECT segment_id AS segmentId, event_type AS eventType
         FROM web_segment_timing_events WHERE interval_id = ?
         ORDER BY server_received_at_iso, rowid`,
      ).all(request.intervalId),
    );
    const starts = rows.filter((row) => row.eventType === 'segment-start');
    const ends = rows.filter((row) => row.eventType === 'segment-end');
    if (request.eventType === 'segment-start') {
      if (starts.length !== ends.length) throw new StudyRepositoryError('segment-already-active', 409);
      if (starts.length === 0) {
        const checkpoint = this.#artifactCheckpoint(this.#checkpointSession(sessionId));
        const checkpointSegment = checkpoint.startsWith('supportive:')
          ? supportiveArtifactSegmentIdSchema.safeParse(
              checkpoint.slice('supportive:'.length),
            )
          : null;
        if (
          !checkpoint.startsWith('supportive:') ||
          (checkpoint !== 'supportive:entry' && !checkpointSegment?.success)
        ) {
          throw new StudyRepositoryError('segment-resume-checkpoint-invalid', 409);
        }
        const expected =
          checkpoint === 'supportive:entry'
            ? 'S00'
            : supportiveResumeSegmentFor(
                supportiveArtifactSegmentIdSchema.parse(checkpoint.slice('supportive:'.length)),
              );
        if (request.segmentId !== expected) {
          throw new StudyRepositoryError('segment-resume-start-required', 409);
        }
        return;
      }
      const previous = ends.at(-1)?.segmentId;
      const index = previous === undefined ? -1 : SUPPORTIVE_ARTIFACT_SEGMENT_IDS.indexOf(previous);
      if (SUPPORTIVE_ARTIFACT_SEGMENT_IDS[index + 1] !== request.segmentId) {
        throw new StudyRepositoryError('segment-start-order-conflict', 409);
      }
      return;
    }
    if (starts.length !== ends.length + 1 || starts.at(-1)?.segmentId !== request.segmentId) {
      throw new StudyRepositoryError('segment-end-order-conflict', 409);
    }
  }

  #checkpointAfterSegment(
    segmentId: (typeof SUPPORTIVE_ARTIFACT_SEGMENT_IDS)[number],
  ): (typeof SUPPORTIVE_CHECKPOINTS)[number] {
    const next = SUPPORTIVE_ARTIFACT_SEGMENT_IDS[
      SUPPORTIVE_ARTIFACT_SEGMENT_IDS.indexOf(segmentId) + 1
    ];
    return next === undefined ? 'supportive:S07' : `supportive:${next}`;
  }

  #requireArtifactCompletion(sessionId: string, condition: 'supportive' | 'reference'): void {
    const checkpoint = this.#artifactCheckpoint(this.#checkpointSession(sessionId));
    if (condition === 'reference') {
      if (checkpoint !== 'reference:mfa') {
        throw new StudyRepositoryError('reference-artifact-incomplete', 409);
      }
      return;
    }
    if (checkpoint !== 'supportive:complete') {
      throw new StudyRepositoryError('supportive-artifact-incomplete', 409);
    }
    this.#requireSupportiveSegmentsCompleted(sessionId);
  }

  #requireSupportiveSegmentsCompleted(sessionId: string): void {
    for (const segmentId of SUPPORTIVE_ARTIFACT_SEGMENT_IDS) {
      const count = countSchema.parse(
        this.#database.prepare(
          `SELECT COUNT(*) AS count FROM web_segment_timing_events
           WHERE session_id = ? AND segment_id = ? AND event_type = 'segment-end'`,
        ).get(sessionId, segmentId),
      ).count;
      if (count === 0) throw new StudyRepositoryError('supportive-segments-incomplete', 409);
    }
  }

  #requirePreCompleted(sessionId: string): void {
    for (const block of mainInstrumentBlocks) {
      if (block.instrumentId !== 'pre-v1') continue;
      const count = countSchema.parse(
        this.#database.prepare(
          `SELECT COUNT(*) AS count FROM instrument_submissions
           WHERE session_id = ? AND instrument_id = ? AND section_id = ?`,
        ).get(sessionId, block.instrumentId, block.sectionId),
      ).count;
      if (count !== 1) throw new StudyRepositoryError('pre-questionnaire-incomplete', 409);
    }
  }

  #artifactIntervalCount(sessionId: string): number {
    return countSchema.parse(
      this.#database.prepare(
        `SELECT COUNT(*) AS count FROM web_artifact_intervals WHERE session_id = ?`,
      ).get(sessionId),
    ).count;
  }

  #interruptionCount(sessionId: string): number {
    return countSchema.parse(
      this.#database.prepare(
        `SELECT web_interruption_count AS count FROM study_sessions WHERE session_id = ?`,
      ).get(sessionId),
    ).count;
  }

  #artifactElapsedMs(sessionId: string): number {
    return elapsedSchema.parse(
      this.#database.prepare(
        `SELECT COALESCE(SUM(confirmed_elapsed_ms), 0) AS elapsedMs
         FROM web_artifact_intervals WHERE session_id = ?`,
      ).get(sessionId),
    ).elapsedMs;
  }

  #collectionOpen(): boolean {
    return Date.parse(this.#nowIso()) < Date.parse(this.#resumeCloseAtIso);
  }

  #requireCollectionOpen(): void {
    if (!this.#collectionOpen()) {
      throw new StudyRepositoryError('study-data-collection-closed', 410);
    }
  }
}
