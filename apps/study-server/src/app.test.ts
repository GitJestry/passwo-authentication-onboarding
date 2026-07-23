import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildStudyServer } from './app.js';

const servers: FastifyInstance[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe('study server foundation', () => {
  it('exposes only a non-identifying health response', async () => {
    const server = buildStudyServer({ version: '0.1.2' });
    servers.push(server);

    const response = await server.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: 'passwo-study-server',
      status: 'ok',
      version: '0.1.2',
    });
  });
});
