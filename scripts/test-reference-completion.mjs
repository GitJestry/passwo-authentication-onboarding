import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const studyOrigin = 'http://127.0.0.1:4197';
const completionType = 'passwo:reference-completed';
const snapshotId = 'secaware-passwords-authentication-2026-07-26';
const dataDirectory = await mkdtemp(resolve(tmpdir(), 'passwo-reference-completion-'));

function fail(message) {
  throw new Error(`Reference completion integration failed: ${message}`);
}

function waitForServer(process, timeoutMs = 30_000) {
  return new Promise((resolveReady, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('study server startup timed out.')),
      timeoutMs,
    );
    let output = '';
    const receiveOutput = (chunk) => {
      output += chunk.toString();
      if (output.includes('PassWo study server listening')) {
        clearTimeout(timeout);
        resolveReady();
      }
    };
    process.stdout.on('data', receiveOutput);
    process.stderr.on('data', receiveOutput);
    process.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`study server exited with ${String(code)}: ${output}`));
    });
  });
}

async function clickPlaceholder(page) {
  await page.getByLabel('Ich habe die Hinweise zu diesem Abschnitt gelesen.').check();
  await page.getByRole('button', { name: 'Antwort speichern' }).click();
}

const server = spawn('node', ['apps/study-server/dist/index.js'], {
  cwd: repositoryRoot,
  env: {
    ...process.env,
    STUDY_ASSIGNMENT_MODE: 'forced-reference',
    STUDY_DATA_DIR: dataDirectory,
    STUDY_PORT: '4197',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let browser;
try {
  await waitForServer(server);
  browser = await chromium.launch();
  const context = await browser.newContext();
  const pages = [];
  context.on('page', (page) => pages.push(page));
  const page = await context.newPage();
  await page.goto(studyOrigin);
  await page.getByLabel('Ich habe die Hinweise gelesen und willige').check();
  await page.getByRole('button', { name: 'Weiter zum Fragebogen' }).click();
  await clickPlaceholder(page);

  const iframe = page.getByTitle('Passwörter & Authentifizierung');
  await iframe.waitFor();
  await page.waitForFunction(() => {
    const courseFrame = document.querySelector('iframe');
    if (!(courseFrame instanceof HTMLIFrameElement)) return false;
    try {
      return courseFrame.contentWindow?.location.pathname.includes('/scormdriver/indexAPI.html');
    } catch {
      return false;
    }
  });
  const driverFrame = page
    .frames()
    .find((frame) => frame.url().includes('/scormdriver/indexAPI.html'));
  if (driverFrame === undefined) fail('the real SCORM driver frame was not loaded.');

  await page.evaluate(
    ({ expectedSnapshotId, expectedType }) => {
      const courseFrame = document.querySelector('iframe');
      if (!(courseFrame instanceof HTMLIFrameElement)) throw new Error('reference-iframe-missing');
      for (const event of [
        new MessageEvent('message', {
          data: { type: expectedType, snapshotId: expectedSnapshotId },
          origin: 'https://invalid.example',
          source: courseFrame.contentWindow,
        }),
        new MessageEvent('message', {
          data: { type: expectedType, snapshotId: expectedSnapshotId },
          origin: window.location.origin,
          source: window,
        }),
        new MessageEvent('message', {
          data: { type: expectedType, snapshotId: 'wrong-snapshot' },
          origin: window.location.origin,
          source: courseFrame.contentWindow,
        }),
      ]) {
        window.dispatchEvent(event);
      }
    },
    { expectedSnapshotId: snapshotId, expectedType: completionType },
  );
  if ((await page.getByRole('button', { name: 'Weiter' }).count()) !== 0) {
    fail('an invalid completion message enabled Study continuation.');
  }

  const navigationResult = await driverFrame.evaluate(() => {
    const popupBlocked = window.open('https://invalid.example/', '_blank') === null;
    let topNavigationBlocked = false;
    try {
      window.top.location.href = 'https://invalid.example/';
    } catch {
      topNavigationBlocked = true;
    }
    return { popupBlocked, topNavigationBlocked };
  });
  if (!navigationResult.popupBlocked || !navigationResult.topNavigationBlocked) {
    fail('the iframe sandbox did not block popup or top-level navigation.');
  }
  if (page.url() !== `${studyOrigin}/` || pages.length !== 1) {
    fail('the sandbox allowed a popup or changed the Study top-level location.');
  }

  await page.evaluate(
    ({ expectedSnapshotId, expectedType }) => {
      const courseFrame = document.querySelector('iframe');
      if (!(courseFrame instanceof HTMLIFrameElement)) throw new Error('reference-iframe-missing');
      window.__passwoReferenceCompletionSignals = 0;
      window.addEventListener('message', (event) => {
        if (
          event.source === courseFrame.contentWindow &&
          event.origin === window.location.origin &&
          typeof event.data === 'object' &&
          event.data !== null &&
          event.data.type === expectedType &&
          event.data.snapshotId === expectedSnapshotId
        ) {
          window.__passwoReferenceCompletionSignals += 1;
        }
      });
    },
    { expectedSnapshotId: snapshotId, expectedType: completionType },
  );

  if ((await page.getByRole('button', { name: 'Weiter' }).count()) !== 0) {
    fail('Study continuation was visible before SetReachedEnd.');
  }
  const firstResult = await driverFrame.evaluate(() => {
    if (typeof window.SetReachedEnd !== 'function') throw new Error('SetReachedEnd missing');
    return window.SetReachedEnd();
  });
  if (firstResult !== true) fail('the real first SetReachedEnd call was not successful.');
  await page.getByRole('button', { name: 'Weiter' }).waitFor();
  const firstSignalCount = await page.evaluate(() => window.__passwoReferenceCompletionSignals);
  if (firstSignalCount !== 1)
    fail(`first completion produced ${String(firstSignalCount)} signals.`);

  const secondResult = await driverFrame.evaluate(() => window.SetReachedEnd());
  if (secondResult !== true) fail('the real second SetReachedEnd call was not successful.');
  await page.waitForTimeout(100);
  const secondSignalCount = await page.evaluate(() => window.__passwoReferenceCompletionSignals);
  if (secondSignalCount !== 1) {
    fail(`second completion changed the signal count to ${String(secondSignalCount)}.`);
  }
  if ((await page.getByRole('button', { name: 'Weiter' }).count()) !== 1) {
    fail('Study continuation was not rendered exactly once.');
  }

  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' }).waitFor();
  await clickPlaceholder(page);
  await page.getByRole('heading', { name: 'Verständnis prüfen' }).waitFor();
  process.stdout.write(
    'Reference completion integration passed: real SetReachedEnd, one signal, shared post and guardrail.\n',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  await rm(dataDirectory, { recursive: true, force: true });
}
