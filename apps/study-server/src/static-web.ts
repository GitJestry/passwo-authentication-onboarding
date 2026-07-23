import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

const webBuildDirectory = fileURLToPath(new URL('../../study-web/dist/', import.meta.url));

export async function registerStudyWeb(server: FastifyInstance): Promise<void> {
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
}
