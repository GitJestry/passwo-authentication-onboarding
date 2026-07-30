import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const completionType = 'passwo:reference-completed';
const snapshotId = 'secaware-passwords-authentication-2026-07-26';
const dataDirectory = await mkdtemp(resolve(tmpdir(), 'passwo-reference-completion-'));

function fail(message) {
  throw new Error(`Reference completion integration failed: ${message}`);
}

async function clickPlaceholder(page) {
  await page.getByLabel('Ich habe die Hinweise zu diesem Abschnitt gelesen.').check();
  await page.getByRole('button', { name: 'Antwort speichern' }).click();
}

async function waitForFrame(page, path, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const frame = page.frames().find((candidate) => candidate.url().includes(path));
    if (frame !== undefined) return frame;
    await page.waitForTimeout(100);
  }
  fail(`frame ${path} was not loaded.`);
}

const { startStudyRuntime } = await import('../apps/study-server/dist/runtime.js');

let browser;
let runtime;
try {
  runtime = await startStudyRuntime({
    version: '0.1.2',
    assignmentMode: 'forced-reference',
    databasePath: resolve(dataDirectory, 'study.sqlite'),
    referenceArtifactDirectory: resolve(
      repositoryRoot,
      'research/private/reference/secaware/passwords-authentication/2026-07-26/study-build',
    ),
    webBuildDirectory: resolve(repositoryRoot, 'apps/study-web/dist'),
    host: '127.0.0.1',
    port: 0,
  });
  const studyOrigin = runtime.origin;
  browser = await chromium.launch();
  const context = await browser.newContext();
  const pages = [];
  const artifactEndTimings = [];
  context.on('page', (page) => pages.push(page));
  const page = await context.newPage();
  page.on('request', (request) => {
    if (!new URL(request.url()).pathname.endsWith('/timing')) return;
    const body = request.postDataJSON();
    if (
      typeof body === 'object' &&
      body !== null &&
      body.phase === 'artifact' &&
      body.eventType === 'end'
    ) {
      artifactEndTimings.push(body);
    }
  });
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
  const driverFrame = await waitForFrame(page, '/scormdriver/indexAPI.html');
  const courseFrame = await waitForFrame(page, '/scormcontent/index.html');

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
  if ((await page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' }).count()) !== 0) {
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

  const clickCourseControl = async (name) => {
    const control = courseFrame
      .getByRole('button', { name })
      .or(courseFrame.getByRole('link', { name }))
      .first();
    await control.waitFor();
    await control.click();
  };
  await clickCourseControl(/KURS STARTEN/iu);
  const providerExitControl = courseFrame
    .getByRole('button', { name: /KURS VERLASSEN/iu })
    .or(courseFrame.getByRole('link', { name: /KURS VERLASSEN/iu }));
  if ((await providerExitControl.count()) !== 0) {
    fail('the embedded course still exposes the provider exit control.');
  }
  const disclosure = courseFrame
    .locator('button[aria-expanded="false"]')
    .filter({ hasText: 'Zusatzinformationen' });
  await disclosure.click();
  await courseFrame.locator('[data-passwo-supplement-link-id="passwords-bsi-checklist"]').click();
  await page.getByRole('alert').waitFor();
  if (
    !(await page.getByRole('alert').innerText()).includes(
      'Zusatzinformationen sind nur in der Desktop-App verfügbar.',
    )
  ) {
    fail('the browser development path did not show its technical supplement notice.');
  }
  await page.getByRole('button', { name: 'Zurück zum Training' }).click();

  await clickCourseControl(/WEITER ZUM THEMA PASSWORT-MANAGER/iu);
  await clickCourseControl(/WEITER ZUM THEMA MULTI-FAKTOR-AUTHENTIFIZIERUNG/iu);
  if (artifactEndTimings.length !== 0) {
    fail('finishing the final instructional lesson ended artifact timing before its completion action.');
  }
  await courseFrame.locator('.page-wrap').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await clickCourseControl(/Training abschließen/iu);

  await page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' }).waitFor();
  const completionSignalCount = await page.evaluate(
    () => window.__passwoReferenceCompletionSignals,
  );
  if (completionSignalCount !== 1) {
    fail(`the real course completion produced ${String(completionSignalCount)} signals.`);
  }
  if (artifactEndTimings.length !== 1) {
    fail(`the real course completion produced ${String(artifactEndTimings.length)} artifact ends.`);
  }
  await clickPlaceholder(page);
  await page.getByRole('heading', { name: 'Verständnis prüfen' }).waitFor();
  process.stdout.write(
    'Reference completion integration passed: three-lesson boundary, twelve supplements, one completion signal, one artifact end, shared post and guardrail.\n',
  );
} finally {
  await browser?.close();
  await runtime?.close();
  await rm(dataDirectory, { recursive: true, force: true });
}
