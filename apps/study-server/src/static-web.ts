import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import {
  designLabPaths,
  REFERENCE_ARTIFACT_ENTRY_POINT,
  REFERENCE_ARTIFACT_ROUTE_PREFIX,
} from '@passwo/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const defaultWebBuildDirectory = fileURLToPath(new URL('../../study-web/dist/', import.meta.url));

const designLabRoutes = new Set(designLabPaths);
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
  "connect-src 'self'",
  "frame-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join('; ');

function sendDesignLabApp(request: FastifyRequest, reply: FastifyReply, webBuildDirectory: string) {
  const requestUrl = request.raw.url;
  if (requestUrl === undefined) return reply.callNotFound();
  const pathname = new URL(requestUrl, 'http://study.local').pathname;
  if (!designLabRoutes.has(pathname)) return reply.callNotFound();
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
      response.header('X-Content-Type-Options', 'nosniff');
    },
  });
}

export async function registerStudyWeb(
  server: FastifyInstance,
  {
    webBuildDirectory = defaultWebBuildDirectory,
    allowDesignLab = true,
  }: {
    readonly webBuildDirectory?: string;
    readonly allowDesignLab?: boolean;
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
      sendDesignLabApp(request, reply, webBuildDirectory),
    );
    server.get('/design-lab/*', (request, reply) =>
      sendDesignLabApp(request, reply, webBuildDirectory),
    );
  }
}
