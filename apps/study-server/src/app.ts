import Fastify, { type FastifyInstance } from 'fastify';

export interface StudyServerBuildOptions {
  readonly version: string;
}

export function buildStudyServer({ version }: StudyServerBuildOptions): FastifyInstance {
  const server = Fastify({
    disableRequestLogging: true,
    logger: false,
    trustProxy: false,
  });

  server.get('/api/health', async () => ({
    service: 'passwo-study-server',
    status: 'ok',
    version,
  }));

  return server;
}
