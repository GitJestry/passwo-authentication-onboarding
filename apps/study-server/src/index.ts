import { buildStudyServer } from './app.js';
import { loadStudyServerConfig } from './config.js';
import { registerStudyWeb } from './static-web.js';

const config = loadStudyServerConfig();
const server = buildStudyServer({ version: '0.1.2' });

try {
  await registerStudyWeb(server);
  await server.listen({ host: config.host, port: config.port });
  process.stdout.write(`PassWo study server listening on http://${config.host}:${config.port}\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : 'unknown startup error';
  process.stderr.write(`PassWo study server failed to start: ${message}\n`);
  process.exitCode = 1;
}
