import { createHash, randomBytes } from 'node:crypto';
import {
  artifactIntervalEndRequestSchema,
  artifactIntervalEndResponseSchema,
  artifactIntervalHeartbeatRequestSchema,
  artifactIntervalHeartbeatResponseSchema,
  artifactIntervalStartRequestSchema,
  artifactIntervalStartResponseSchema,
  completeSessionRequestSchema,
  confirmArtifactCheckpointRequestSchema,
  confirmArtifactCheckpointResponseSchema,
  createSessionRequestSchema,
  createSessionResponseSchema,
  deletionCodeHashSchema,
  deletionCodeSchema,
  followUpAccessRequestSchema,
  followUpAccessResponseSchema,
  followUpSubmissionRequestSchema,
  followUpSubmissionResponseSchema,
  instrumentSubmissionRequestSchema,
  recruitmentSourceSchema,
  type RecruitmentSource,
  saveResponseResponseSchema,
  sessionStatusResponseSchema,
  WEB_RESUME_COOKIE_MAX_AGE_SECONDS,
  WEB_STUDY_REQUEST_HEADER,
  WEB_STUDY_REQUEST_HEADER_VALUE,
  webArtifactVisibilityRequestSchema,
  webArtifactVisibilityResponseSchema,
  webCreateSessionRequestSchema,
  webCreateSessionResponseSchema,
  webResumeRawTokenSchema,
  webResumeResponseSchema,
  webResumeTokenHashSchema,
  webSegmentTimingRequestSchema,
  webSegmentTimingResponseSchema,
  type WebResumeRawToken,
  type WebResumeTokenHash,
} from '@passwo/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { type StudyRepository, StudyRepositoryError } from './study-repository.js';
import type { WebRuntimeRepository } from './web-runtime-repository.js';

const sessionParamsSchema = z.object({ sessionId: z.uuid() });
const emptyRequestSchema = z.object({}).strict();
const secureCookieName = '__Host-passwo-resume';
const localCookieName = 'passwo-resume';
const cookieNameSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/u)
  .max(80);

export interface WebStudyRouteOptions {
  readonly repository: WebRuntimeRepository;
  readonly followUpRepository: StudyRepository;
  readonly referenceArtifactAvailable: boolean;
  readonly forcedSupportive: boolean;
  readonly resumeCloseAtIso: string;
  readonly secureCookies: boolean;
  readonly publicOrigin?: string;
  readonly resumeCookieName?: string;
  readonly qaControlsEnabled?: boolean;
  readonly nowIso: () => string;
  readonly createResumeToken?: () => WebResumeRawToken;
}

function parseCookies(header: string | undefined): ReadonlyMap<string, string> {
  const cookies = new Map<string, string>();
  if (header === undefined) return cookies;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name.length > 0 && value.length > 0) cookies.set(name, value);
  }
  return cookies;
}

function hashToken(token: WebResumeRawToken): WebResumeTokenHash {
  return webResumeTokenHashSchema.parse(createHash('sha256').update(token, 'utf8').digest('hex'));
}

function newToken(factory?: () => WebResumeRawToken): WebResumeRawToken {
  return webResumeRawTokenSchema.parse(factory?.() ?? randomBytes(32).toString('base64url'));
}

function deletionCodeForToken(token: WebResumeRawToken) {
  const hex = createHash('sha256')
    .update('passwo-deletion-code:v1\0', 'utf8')
    .update(token, 'utf8')
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();
  return deletionCodeSchema.parse(
    `PW-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`,
  );
}

function hashDeletionCode(deletionCode: ReturnType<typeof deletionCodeForToken>) {
  return deletionCodeHashSchema.parse(
    createHash('sha256').update(deletionCode, 'utf8').digest('hex'),
  );
}

function expiryFor(
  nowIso: string,
  closeAtIso: string,
): {
  readonly expiresAtIso: string;
  readonly maxAgeSeconds: number;
} {
  const now = Date.parse(nowIso);
  const closeAt = Date.parse(closeAtIso);
  if (!Number.isFinite(now) || !Number.isFinite(closeAt) || closeAt <= now) {
    throw new StudyRepositoryError('study-data-collection-closed', 410);
  }
  const expiry = Math.min(now + WEB_RESUME_COOKIE_MAX_AGE_SECONDS * 1000, closeAt);
  return {
    expiresAtIso: new Date(expiry).toISOString(),
    maxAgeSeconds: Math.max(1, Math.floor((expiry - now) / 1000)),
  };
}

function resolvedCookieName(secure: boolean, configuredName?: string): string {
  if (configuredName === undefined) return secure ? secureCookieName : localCookieName;
  const name = cookieNameSchema.parse(configuredName);
  if (secure && !name.startsWith('__Host-')) {
    throw new Error('Secure resume cookies must use the __Host- prefix.');
  }
  return name;
}

function setCookie(
  reply: FastifyReply,
  token: WebResumeRawToken,
  expiresAtIso: string,
  maxAgeSeconds: number,
  secure: boolean,
  name: string,
): void {
  const attributes = [
    `${name}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${new Date(expiresAtIso).toUTCString()}`,
  ];
  if (secure) attributes.push('Secure');
  reply.header('Set-Cookie', attributes.join('; '));
}

function clearCookie(reply: FastifyReply, secure: boolean, name: string): void {
  const attributes = [
    `${name}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (secure) attributes.push('Secure');
  reply.header('Set-Cookie', attributes.join('; '));
}

function rawToken(request: FastifyRequest, name: string): WebResumeRawToken | null {
  const value = parseCookies(request.headers.cookie).get(name);
  if (value === undefined) return null;
  const parsed = webResumeRawTokenSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function requireWriteRequest(request: FastifyRequest, publicOrigin?: string): void {
  if (request.headers[WEB_STUDY_REQUEST_HEADER] !== WEB_STUDY_REQUEST_HEADER_VALUE) {
    throw new StudyRepositoryError('study-request-header-required', 403);
  }
  if (publicOrigin !== undefined && request.headers.origin !== publicOrigin) {
    throw new StudyRepositoryError('study-origin-invalid', 403);
  }
}

function recruitmentSourceFor(recruitmentId: string | null): RecruitmentSource {
  const parsed = recruitmentSourceSchema.safeParse(recruitmentId);
  return parsed.success ? parsed.data : 'ub';
}

export function registerWebStudyRoutes(
  server: FastifyInstance,
  options: WebStudyRouteOptions,
): void {
  const {
    repository,
    followUpRepository,
    referenceArtifactAvailable,
    forcedSupportive,
    resumeCloseAtIso,
    secureCookies,
    publicOrigin,
    resumeCookieName,
    qaControlsEnabled = false,
    nowIso,
    createResumeToken,
  } = options;
  const cookieName = resolvedCookieName(secureCookies, resumeCookieName);

  server.post('/api/follow-up/access', async (request, reply) => {
    requireWriteRequest(request, publicOrigin);
    const { token } = followUpAccessRequestSchema.parse(request.body);
    return reply.send(followUpAccessResponseSchema.parse(followUpRepository.followUpAccess(token)));
  });

  server.post('/api/follow-up/submissions', async (request, reply) => {
    requireWriteRequest(request, publicOrigin);
    followUpRepository.submitFollowUp(followUpSubmissionRequestSchema.parse(request.body));
    return reply.send(followUpSubmissionResponseSchema.parse({ submitted: true }));
  });

  const authenticate = (
    request: FastifyRequest,
    allowCompleted = false,
  ): {
    readonly sessionId: string;
    readonly token: WebResumeRawToken;
    readonly hash: WebResumeTokenHash;
  } => {
    const token = rawToken(request, cookieName);
    if (token === null) throw new StudyRepositoryError('resume-token-required', 401);
    const hash = hashToken(token);
    const sessionId = repository.resolveSession(hash, allowCompleted);
    if (sessionId === null) throw new StudyRepositoryError('resume-token-invalid', 401);
    return { sessionId, token, hash };
  };

  const authenticateSession = (
    request: FastifyRequest,
    expectedSessionId: string,
    allowCompleted = false,
  ) => {
    const auth = authenticate(request, allowCompleted);
    if (auth.sessionId !== expectedSessionId) {
      throw new StudyRepositoryError('session-access-denied', 403);
    }
    return auth;
  };

  const refreshCookie = (reply: FastifyReply, auth: ReturnType<typeof authenticate>): void => {
    const expiry = expiryFor(nowIso(), resumeCloseAtIso);
    repository.refreshToken(auth.sessionId, auth.hash, expiry.expiresAtIso);
    setCookie(
      reply,
      auth.token,
      expiry.expiresAtIso,
      expiry.maxAgeSeconds,
      secureCookies,
      cookieName,
    );
  };

  server.post('/api/study/session/resume', async (request, reply) => {
    requireWriteRequest(request, publicOrigin);
    emptyRequestSchema.parse(request.body);
    const expiry = expiryFor(nowIso(), resumeCloseAtIso);
    const token = rawToken(request, cookieName);
    if (token === null) {
      setCookie(
        reply,
        newToken(createResumeToken),
        expiry.expiresAtIso,
        expiry.maxAgeSeconds,
        secureCookies,
        cookieName,
      );
      return reply.send(webResumeResponseSchema.parse({ session: null }));
    }

    const hash = hashToken(token);
    const binding = repository.resumeTokenBinding(hash);
    if (binding === null || !binding.active) {
      setCookie(
        reply,
        newToken(createResumeToken),
        expiry.expiresAtIso,
        expiry.maxAgeSeconds,
        secureCookies,
        cookieName,
      );
      return reply.send(webResumeResponseSchema.parse({ session: null }));
    }

    const deletionCode = deletionCodeForToken(token);
    const session = repository.restoreSession(
      binding.sessionId,
      binding.deletionCodeHash === hashDeletionCode(deletionCode) ? deletionCode : null,
    );
    repository.refreshToken(binding.sessionId, hash, expiry.expiresAtIso);
    setCookie(reply, token, expiry.expiresAtIso, expiry.maxAgeSeconds, secureCookies, cookieName);
    return reply.send(webResumeResponseSchema.parse({ session }));
  });

  if (qaControlsEnabled) {
    server.post('/api/qa/reset', async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      emptyRequestSchema.parse(request.body);
      clearCookie(reply, secureCookies, cookieName);
      return reply.status(204).send();
    });
  }

  server.post('/api/study/sessions', async (request, reply) => {
    requireWriteRequest(request, publicOrigin);
    if (!forcedSupportive && !referenceArtifactAvailable) {
      return reply.status(503).send({ errorCode: 'reference-artifact-unavailable' });
    }
    const body = webCreateSessionRequestSchema.parse(request.body);
    const cookieToken = rawToken(request, cookieName);
    const cookieBinding =
      cookieToken === null ? null : repository.resumeTokenBinding(hashToken(cookieToken));
    if (cookieBinding?.active === true && cookieBinding.createRequestId !== body.requestId) {
      throw new StudyRepositoryError('active-session-already-exists', 409);
    }
    const token =
      cookieToken === null || (cookieBinding !== null && !cookieBinding.active)
        ? newToken(createResumeToken)
        : cookieToken;
    const deletionCode = deletionCodeForToken(token);
    const deletionCodeHash = hashDeletionCode(deletionCode);
    if (cookieBinding?.active === true && cookieBinding.deletionCodeHash !== deletionCodeHash) {
      throw new StudyRepositoryError('resume-token-deletion-code-mismatch', 409);
    }
    const hash = hashToken(token);
    const expiry = expiryFor(nowIso(), resumeCloseAtIso);
    const session = createSessionResponseSchema.parse(
      repository.createSession(
        {
          ...createSessionRequestSchema.parse({
            requestId: body.requestId,
            consentAccepted: body.consentAccepted,
            followUpConsent: body.followUpConsent,
            deletionCodeHash,
          }),
          recontact: body.recontact,
        },
        recruitmentSourceFor(body.recruitmentId),
        hash,
        expiry.expiresAtIso,
      ),
    );
    setCookie(reply, token, expiry.expiresAtIso, expiry.maxAgeSeconds, secureCookies, cookieName);
    return reply
      .status(201)
      .send(webCreateSessionResponseSchema.parse({ ...session, deletionCode }));
  });

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/instrument-submissions',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const auth = authenticateSession(request, sessionId, true);
      repository.saveInstrumentSubmission(
        sessionId,
        instrumentSubmissionRequestSchema.parse(request.body),
      );
      if (repository.getSessionStatus(sessionId) !== 'completed') {
        refreshCookie(reply, auth);
      }
      return reply.send(saveResponseResponseSchema.parse({ saved: true }));
    },
  );

  server.get<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/status',
    async (request, reply) => {
      const { sessionId } = sessionParamsSchema.parse(request.params);
      authenticateSession(request, sessionId, true);
      return reply.send(
        sessionStatusResponseSchema.parse({
          completionStatus: repository.getSessionStatus(sessionId),
        }),
      );
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-intervals',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const auth = authenticateSession(request, sessionId);
      const result = repository.openArtifactInterval(
        sessionId,
        artifactIntervalStartRequestSchema.parse(request.body),
      );
      refreshCookie(reply, auth);
      return reply.send(artifactIntervalStartResponseSchema.parse(result));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-intervals/heartbeat',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      authenticateSession(request, sessionId);
      repository.heartbeat(sessionId, artifactIntervalHeartbeatRequestSchema.parse(request.body));
      return reply.send(artifactIntervalHeartbeatResponseSchema.parse({ confirmed: true }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-visibility',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      authenticateSession(request, sessionId);
      const recorded = repository.recordVisibility(
        sessionId,
        webArtifactVisibilityRequestSchema.parse(request.body),
      );
      return reply.send(webArtifactVisibilityResponseSchema.parse({ recorded }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-checkpoint',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const auth = authenticateSession(request, sessionId);
      const checkpoint = repository.confirmCheckpoint(
        sessionId,
        confirmArtifactCheckpointRequestSchema.parse(request.body),
      );
      refreshCookie(reply, auth);
      return reply.send(confirmArtifactCheckpointResponseSchema.parse({ checkpoint }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/segment-timing',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const auth = authenticateSession(request, sessionId);
      const result = repository.recordSegment(
        sessionId,
        webSegmentTimingRequestSchema.parse(request.body),
      );
      refreshCookie(reply, auth);
      return reply.send(webSegmentTimingResponseSchema.parse(result));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/artifact-intervals/end',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      const auth = authenticateSession(request, sessionId);
      const artifactSessionElapsedMs = repository.endArtifact(
        sessionId,
        artifactIntervalEndRequestSchema.parse(request.body),
      );
      refreshCookie(reply, auth);
      return reply.send(artifactIntervalEndResponseSchema.parse({ artifactSessionElapsedMs }));
    },
  );

  server.post<{ Params: { sessionId: string } }>(
    '/api/study/sessions/:sessionId/complete',
    async (request, reply) => {
      requireWriteRequest(request, publicOrigin);
      const { sessionId } = sessionParamsSchema.parse(request.params);
      authenticateSession(request, sessionId, true);
      completeSessionRequestSchema.parse(request.body);
      const completionStatus = repository.completeSession(sessionId);
      clearCookie(reply, secureCookies, cookieName);
      return reply.send(sessionStatusResponseSchema.parse({ completionStatus }));
    },
  );
}
