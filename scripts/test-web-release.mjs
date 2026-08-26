import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const argumentsList = process.argv.slice(2);
const deployed = argumentsList.includes('--deployed');

if (argumentsList.some((argument) => argument !== '--deployed')) {
  process.stderr.write('Nutzung: pnpm test:web:release [-- --deployed]\n');
  process.exit(2);
}

function run(label, command, args) {
  process.stdout.write(`\n==> ${label}\n`);
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('Eingefrorenes SecAware-Artefakt bauen', 'node', ['./scripts/build-reference-artifact.mjs']);
run('SecAware-Artefakt und Datenschutzgrenzen prüfen', 'node', [
  './scripts/verify-reference-artifact.mjs',
]);
run('TypeScript prüfen', 'pnpm', ['typecheck']);
run('Research-Boundary prüfen', 'pnpm', ['check:research-boundary']);
run('Research-Core inklusive Web-Persistenz, Resume, Löschung und Parallelität testen', 'pnpm', [
  'test:core',
]);
run('Produktive Web-Runtime bauen', 'pnpm', ['build:web-runtime']);
run('Beide Studienbedingungen mit begrenztem Browser-Artefakt-Smoke abschließen', 'pnpm', [
  'exec',
  'playwright',
  'test',
  'tests/e2e/study-full-flow.spec.ts',
]);
run('Reales dreiteiliges SecAware-Training bis zum Abschluss durchlaufen', 'node', [
  './scripts/test-reference-completion.mjs',
]);

if (deployed) {
  run('Ausgerollte Web-Runtime und produktive Datenbanken read-only prüfen', 'bash', [
    './deploy/scripts/test-deployed-web.sh',
  ]);
}

process.stdout.write('\nWeb-Release-Tests vollständig erfolgreich.\n');
