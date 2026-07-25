import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import { designLabPaths } from '@passwo/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const defaultWebBuildDirectory = fileURLToPath(new URL('../../study-web/dist/', import.meta.url));

const designLabRoutes = new Set(designLabPaths);

function sendDesignLabApp(request: FastifyRequest, reply: FastifyReply) {
  const requestUrl = request.raw.url;
  if (requestUrl === undefined) return reply.callNotFound();
  const pathname = new URL(requestUrl, 'http://study.local').pathname;
  if (!designLabRoutes.has(pathname)) return reply.callNotFound();
  return reply.type('text/html; charset=utf-8').sendFile('index.html');
}

export async function registerStudyWeb(
  server: FastifyInstance,
  { webBuildDirectory = defaultWebBuildDirectory }: { readonly webBuildDirectory?: string } = {},
): Promise<void> {
  if (!existsSync(webBuildDirectory)) {
    server.get('/', async () => ({
      message: 'Study web build not found. Run pnpm build before pnpm study:start.',
      status: 'foundation-only',
    }));
    return;
  }

  await server.register(fastifyStatic, {
    root: webBuildDirectory,
    wildcard: false,
  });

  server.get('/design-lab', sendDesignLabApp);
  server.get('/design-lab/*', sendDesignLabApp);
}
