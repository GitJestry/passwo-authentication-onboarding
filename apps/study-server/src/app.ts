import {
  abandonRecontactRequestSchema,
  abandonRecontactResponseSchema,
  type AssignmentMode,
  artifactLeaseResponseSchema,
  completeSessionRequestSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  REFERENCE_ARTIFACT_VERSION,
  registerRecontactRequestSchema,
  registerRecontactResponseSchema,
  SUPPORTIVE_ARTIFACT_VERSION,
  saveResponseResponseSchema,
  sessionStatusResponseSchema,
  studyTimingEventSchema,
  timingWriteResponseSchema,
  type WebResumeRawToken,
} from '@passwo/contracts';
import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { openStudyDatabase } from './database.js';
import { cryptoStudyRandomSource, type StudyRandomSource } from './random-source.js';
import { isReferenceArtifactAvailable, registerReferenceArtifact } from './static-web.js';
import { StudyRepository, StudyRepositoryError, type StudyVersions } from './study-repository.js';
import { registerWebStudyRoutes } from './web-routes.js';
import { WebRuntimeRepository } from './web-runtime-repository.js';

const sessionParamsSchema = z.object({ sessionId: z.uuid() });

export const walkingSkeletonVersions: StudyVersions = {
  study: 'walking-skeleton-v1',
  supportiveArtifact: SUPPORTIVE_ARTIFACT_VERSION,
  questionnaire: instrumentRuntimeManifest.questionnaireVersion,
  guardrail: instrumentRuntimeManifest.guardrailVersion,
  consent: instrumentRuntimeManifest.consentVersion,
  followUp: instrumentRuntimeManifest.followUpVersion,
  referenceArtifact: REFERENCE_ARTIFACT_VERSION,
};

export interface StudyServerBuildOptions {
  readonly version: string;
  readonly assignmentMode?: AssignmentMode;
  readonly databasePath?: string;
  readonly recontactDatabasePath?: string;
  readonly randomSource?: StudyRandomSource;
  readonly referenceArtifactDirectory?: string;
  readonly nowIso?: () => string;
  readonly createRecontactToken?: () => string;
  readonly versions?: StudyVersions;
  readonly webRuntime?: {
    readonly resumeCloseAtIso: string;
    readonly secureCookies: boolean;
    readonly publicOrigin?: string;
    readonly createResumeToken?: () => WebResumeRawToken;
  };
}

export function buildStudyServer({
  version,
  assignmentMode = 'permuted-block',
  databasePath = ':memory:',
  recontactDatabasePath = ':memory:',
  randomSource = cryptoStudyRandomSource,
  referenceArtifactDirectory,
  nowIso,
  createRecontactToken,
  versions = walkingSkeletonVersions,
  webRuntime,
}: StudyServerBuildOptions): FastifyInstance {
  const database = openStudyDatabase(
    databasePath,
    recontactDatabasePath,
    () => randomSource.researchToken(),
  );
  const effectiveNowIso = nowIso ?? (() => new Date().toISOString());
  const repository = new StudyRepository({
    database,
    assignmentMode,
    versions,
    random: randomSource,
    nowIso: effectiveNowIso,
    ...(createRecontactToken === undefined ? {} : { createRecontactToken }),
  });
  const server = Fastify({
    logger: false,
    trustProxy: false,
  });
  server.addHook('onSend', async (request, reply, payload) => {
    if (request.url.startsWith('/api/')) {
      reply.header('Cache-Control', 'no-store');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
      reply.header('Referrer-Policy', 'no-referrer');
      reply.header('X-Content-Type-Options', 'nosniff');
    }
    return payload;
  });
  const referenceArtifactAvailable =
    referenceArtifactDirectory !== undefined &&
    isReferenceArtifactAvailable(referenceArtifactDirectory);
  if (referenceArtifactDirectory !== undefined) {
    registerReferenceArtifact(server, referenceArtifactDirectory);
  }
  const staleRecoveryInterval =
    webRuntime === undefined
      ? setInterval(() => repository.recoverStaleArtifactSessions(), 60_000)
      : null;
  staleRecoveryInterval?.unref();

  server.addHook('onClose', async () => {
    if (staleRecoveryInterval !== null) clearInterval(staleRecoveryInterval);
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

  if (webRuntime !== undefined) {
    const webRepository = new WebRuntimeRepository({
      database,
      studyRepository: repository,
      nowIso: effectiveNowIso,
      randomUuid: () => randomSource.randomUuid(),
      resumeCloseAtIso: webRuntime.resumeCloseAtIso,
    });
    registerWebStudyRoutes(server, {
      repository: webRepository,
      referenceArtifactAvailable,
      forcedSupportive: assignmentMode === 'forced-supportive',
      resumeCloseAtIso: webRuntime.resumeCloseAtIso,
      secureCookies: webRuntime.secureCookies,
      nowIso: effectiveNowIso,
      ...(webRuntime.publicOrigin === undefined ? {} : { publicOrigin: webRuntime.publicOrigin }),
      ...(webRuntime.createResumeToken === undefined
        ? {}
        : { createResumeToken: webRuntime.createResumeToken }),
    });
    return server;
  }

  server.post('/api/study/sessions', async (request, reply) => {
    if (assignmentMode !== 'forced-supportive' && !referenceArtifactAvailable) {
      return reply.status(503).send({ errorCode: 'reference-artifact-unavailable' });
    }
    const body = createSessionRequestSchema.parse(request.body);
    const session = createSessionResponseSchema.parse(repository.createSession(body));
    return reply.status(201).send(session);
  });

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/recontact',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const body = registerRecontactRequestSchema.parse(request.body);
      repository.registerRecontact(sessionId, body);
      return reply.send(registerRecontactResponseSchema.parse({ registered: true }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/recontact/abandon',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      abandonRecontactRequestSchema.parse(request.body);
      repository.abandonRecontact(sessionId);
      return reply.send(abandonRecontactResponseSchema.parse({ abandoned: true }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/instrument-submissions',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const body = instrumentSubmissionRequestSchema.parse(request.body);
      repository.saveInstrumentSubmission(sessionId, body);
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
