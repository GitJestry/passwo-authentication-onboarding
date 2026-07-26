import {
  type AssignmentMode,
  artifactLeaseResponseSchema,
  completeSessionRequestSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  placeholderResponseRequestSchema,
  REFERENCE_ARTIFACT_VERSION,
  SUPPORTIVE_ARTIFACT_VERSION,
  saveResponseResponseSchema,
  sessionStatusResponseSchema,
  studyTimingEventSchema,
  timingWriteResponseSchema,
} from '@passwo/contracts';
import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { resolveReferenceArtifactDirectory } from './config.js';
import { openStudyDatabase } from './database.js';
import { cryptoStudyRandomSource, type StudyRandomSource } from './random-source.js';
import { isReferenceArtifactAvailable, registerReferenceArtifact } from './static-web.js';
import { StudyRepository, StudyRepositoryError, type StudyVersions } from './study-repository.js';

const sessionParamsSchema = z.object({ sessionId: z.uuid() });

export const walkingSkeletonVersions: StudyVersions = {
  study: 'walking-skeleton-v1',
  supportiveArtifact: SUPPORTIVE_ARTIFACT_VERSION,
  questionnaire: 'questionnaire-placeholder-v1',
  guardrail: 'guardrail-placeholder-v1',
  consent: 'consent-placeholder-v1',
  referenceArtifact: REFERENCE_ARTIFACT_VERSION,
};

export interface StudyServerBuildOptions {
  readonly version: string;
  readonly assignmentMode?: AssignmentMode;
  readonly databasePath?: string;
  readonly randomSource?: StudyRandomSource;
  readonly referenceArtifactDirectory?: string;
  readonly nowIso?: () => string;
  readonly versions?: StudyVersions;
}

export function buildStudyServer({
  version,
  assignmentMode = 'permuted-block',
  databasePath = ':memory:',
  randomSource = cryptoStudyRandomSource,
  referenceArtifactDirectory = resolveReferenceArtifactDirectory(),
  nowIso,
  versions = walkingSkeletonVersions,
}: StudyServerBuildOptions): FastifyInstance {
  const database = openStudyDatabase(databasePath);
  const repository = new StudyRepository({
    database,
    assignmentMode,
    versions,
    random: randomSource,
    ...(nowIso === undefined ? {} : { nowIso }),
  });
  const server = Fastify({
    logger: false,
    trustProxy: false,
  });
  const referenceArtifactAvailable =
    referenceArtifactDirectory !== undefined &&
    isReferenceArtifactAvailable(referenceArtifactDirectory);
  if (referenceArtifactDirectory !== undefined) {
    registerReferenceArtifact(server, referenceArtifactDirectory);
  }
  const staleRecoveryInterval = setInterval(() => {
    repository.recoverStaleArtifactSessions();
  }, 60_000);
  staleRecoveryInterval.unref();

  server.addHook('onClose', async () => {
    clearInterval(staleRecoveryInterval);
    database.close();
  });

  server.setErrorHandler((error, _request, reply) => {
    if (error instanceof StudyRepositoryError) {
      return reply.status(error.statusCode).send({ errorCode: error.message });
    }
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ errorCode: 'invalid-research-data' });
    }
    const reportedStatusCode =
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
        ? error.statusCode
        : 500;
    const statusCode = reportedStatusCode < 500 ? reportedStatusCode : 500;
    return reply.status(statusCode).send({
      errorCode: statusCode < 500 ? 'invalid-research-data' : 'research-data-write-failed',
    });
  });

  server.get('/api/health', async () => ({
    service: 'passwo-study-server',
    status: 'ok',
    version,
  }));

  server.post('/api/study/sessions', async (request, reply) => {
    if (assignmentMode !== 'forced-supportive' && !referenceArtifactAvailable) {
      return reply.status(503).send({ errorCode: 'reference-artifact-unavailable' });
    }
    const body = createSessionRequestSchema.parse(request.body);
    const session = createSessionResponseSchema.parse(repository.createSession(body));
    return reply.status(201).send(session);
  });

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/responses',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const body = placeholderResponseRequestSchema.parse(request.body);
      repository.savePlaceholder(sessionId, body);
      return reply.send(saveResponseResponseSchema.parse({ saved: true }));
    },
  );

  server.get<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/status',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const completionStatus = repository.getSessionStatus(sessionId);
      return reply.send(sessionStatusResponseSchema.parse({ completionStatus }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-lease',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      repository.acquireArtifactLease(sessionId);
      return reply.send(artifactLeaseResponseSchema.parse({ active: true }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-lease/heartbeat',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      repository.heartbeatArtifactLease(sessionId);
      return reply.send(artifactLeaseResponseSchema.parse({ active: true }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/timing',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const body = studyTimingEventSchema.parse(request.body);
      return reply.send(timingWriteResponseSchema.parse(repository.recordTiming(sessionId, body)));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/incomplete-reload',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const completionStatus = repository.markIncompleteReload(sessionId);
      return reply.send(sessionStatusResponseSchema.parse({ completionStatus }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/complete',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      completeSessionRequestSchema.parse(request.body);
      const completionStatus = repository.completeSession(sessionId);
      return reply.send(sessionStatusResponseSchema.parse({ completionStatus }));
    },
  );

  return server;
}
