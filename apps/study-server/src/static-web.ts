import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import {
  designLabPaths,
  isLiveQaPath,
  REFERENCE_ARTIFACT_ENTRY_POINT,
  REFERENCE_ARTIFACT_ROUTE_PREFIX,
} from '@passwo/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const defaultWebBuildDirectory = fileURLToPath(new URL('../../study-web/dist/', import.meta.url));

const designLabRoutes = new Set<string>(designLabPaths);
const studyWebCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self'",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join('; ');
const referenceArtifactCsp = [
  "default-src 'self' data: blob:",
  "base-uri 'self'",
  "connect-src 'self' blob:",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-src 'self' data: blob:",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "media-src 'self' data: blob:",
  "object-src 'self' data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
].join('; ');

function sendSinglePageApp(
  request: FastifyRequest,
  reply: FastifyReply,
  webBuildDirectory: string,
  acceptsPath: (pathname: string) => boolean,
) {
  const requestUrl = request.raw.url;
  if (requestUrl === undefined) return reply.callNotFound();
  const pathname = new URL(requestUrl, 'http://study.local').pathname;
  if (!acceptsPath(pathname)) return reply.callNotFound();
  return reply.type('text/html; charset=utf-8').sendFile('index.html', webBuildDirectory);
}

export function isReferenceArtifactAvailable(referenceArtifactDirectory: string): boolean {
  return existsSync(join(referenceArtifactDirectory, REFERENCE_ARTIFACT_ENTRY_POINT));
}

export function registerReferenceArtifact(
  server: FastifyInstance,
  referenceArtifactDirectory: string,
): void {
  if (!isReferenceArtifactAvailable(referenceArtifactDirectory)) {
    server.get(`${REFERENCE_ARTIFACT_ROUTE_PREFIX}*`, async (_request, reply) =>
      reply.status(503).send({ errorCode: 'reference-artifact-unavailable' }),
    );
    return;
  }

  void server.register(fastifyStatic, {
    root: referenceArtifactDirectory,
    prefix: REFERENCE_ARTIFACT_ROUTE_PREFIX,
    index: false,
    redirect: false,
    wildcard: true,
    setHeaders(response) {
      response.header('Content-Security-Policy', referenceArtifactCsp);
      response.header('Accept-Ranges', 'bytes');
      response.header('Cache-Control', 'public, max-age=31536000, immutable');
      response.header('Cross-Origin-Resource-Policy', 'same-origin');
      response.header('Referrer-Policy', 'no-referrer');
      response.header('X-Content-Type-Options', 'nosniff');
    },
  });
}

export async function registerStudyWeb(
  server: FastifyInstance,
  {
    webBuildDirectory = defaultWebBuildDirectory,
    allowDesignLab = true,
    allowLiveQa = false,
  }: {
    readonly webBuildDirectory?: string;
    readonly allowDesignLab?: boolean;
    readonly allowLiveQa?: boolean;
  } = {},
): Promise<void> {
  if (!existsSync(webBuildDirectory)) {
    server.get('/', async () => ({
      message: 'Study web build not found. Build the web runtime before starting it.',
      status: 'web-build-missing',
    }));
    return;
  }

  await server.register(fastifyStatic, {
    root: webBuildDirectory,
    wildcard: false,
    decorateReply: false,
    setHeaders(response, filePath) {
      response.header('Content-Security-Policy', studyWebCsp);
      response.header('Cross-Origin-Opener-Policy', 'same-origin');
      response.header('Cross-Origin-Resource-Policy', 'same-origin');
      response.header(
        'Permissions-Policy',
        'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
      );
      response.header('Referrer-Policy', 'no-referrer');
      response.header('X-Content-Type-Options', 'nosniff');
      response.header('X-Frame-Options', 'DENY');
      response.header(
        'Cache-Control',
        filePath.endsWith('.html')
          ? 'no-store'
          : filePath.includes('/assets/')
            ? 'public, max-age=31536000, immutable'
            : 'no-cache',
      );
    },
  });

  if (allowDesignLab) {
    server.get('/design-lab', (request, reply) =>
      sendSinglePageApp(request, reply, webBuildDirectory, (pathname) =>
        designLabRoutes.has(pathname),
      ),
    );
    server.get('/design-lab/*', (request, reply) =>
      sendSinglePageApp(request, reply, webBuildDirectory, (pathname) =>
        designLabRoutes.has(pathname),
      ),
    );
  }

  if (allowLiveQa) {
    server.get('/qa', (request, reply) =>
      sendSinglePageApp(request, reply, webBuildDirectory, isLiveQaPath),
    );
    server.get('/qa/*', (request, reply) =>
      sendSinglePageApp(request, reply, webBuildDirectory, isLiveQaPath),
    );
  }
}
