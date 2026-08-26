import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const completionType = 'passwo:reference-completed';
const snapshotId = 'secaware-passwords-authentication-2026-07-26';
const dataDirectory = await mkdtemp(resolve(tmpdir(), 'passwo-reference-completion-'));
const instrumentRuntimeManifest = JSON.parse(
  await readFile(
    resolve(repositoryRoot, 'packages/contracts/src/generated/instruments-v1.runtime.json'),
    'utf8',
  ),
);
const referenceSupplementLinks = JSON.parse(
  await readFile(
    resolve(repositoryRoot, 'packages/contracts/src/reference-supplement-links.json'),
    'utf8',
  ),
);
const firstReferenceSupplement = referenceSupplementLinks.find(
  ({ id }) => id === 'passwords-bsi-checklist',
);
if (firstReferenceSupplement === undefined) {
  fail('the canonical password supplement is missing.');
}
const immediatePostSectionIds = new Set([
  'panas',
  'duration',
  'ueqs',
  'content_trustworthiness',
  'design_diagnostics',
  'risk_understanding',
]);

function fail(message) {
  throw new Error(`Reference completion integration failed: ${message}`);
}

function validInstrumentValue(item) {
  if (item.type === 'integer') return item.min ?? 0;
  if (item.type === 'scale') {
    const scale = instrumentRuntimeManifest.scales[item.scale];
    if (scale === undefined) fail(`scale ${String(item.scale)} is missing.`);
    return Math.floor((scale.min + scale.max) / 2);
  }
  if (item.type === 'semanticDifferential') {
    const scale = instrumentRuntimeManifest.scales.ueqSemanticDifferential7;
    return Math.floor((scale.min + scale.max) / 2);
  }
  if (item.type === 'text') return null;
  const optionId = item.options?.[0]?.id;
  if (optionId === undefined) fail(`option for ${String(item.id)} is missing.`);
  return item.type === 'multiChoice' ? [optionId] : optionId;
}

async function submitInstrumentSections(page, studyOrigin, sessionId, instrumentId, sections) {
  for (const section of sections) {
    const response = await page.context().request.post(
      new URL(`/api/study/sessions/${sessionId}/instrument-submissions`, studyOrigin).toString(),
      {
        headers: { 'x-passwo-study-request': '1' },
        data: {
          instrumentId,
          sectionId: section.id,
          responses: section.items.map((item) => ({
            itemId: item.id,
            value: validInstrumentValue(item),
          })),
        },
      },
    );
    if (!response.ok()) {
      fail(`saving ${instrumentId}:${String(section.id)} returned ${String(response.status())}.`);
    }
  }
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
    recontactDatabasePath: resolve(dataDirectory, 'recontact.sqlite'),
    referenceArtifactDirectory: resolve(
      repositoryRoot,
      'research/private/reference/secaware/passwords-authentication/2026-07-26/study-build',
    ),
    webBuildDirectory: resolve(repositoryRoot, 'apps/study-web/dist'),
    webRuntime: {
      resumeCloseAtIso: '2099-01-01T00:00:00.000Z',
      secureCookies: false,
      allowDesignLab: false,
    },
    host: '127.0.0.1',
    port: 0,
  });
  const studyOrigin = runtime.origin;
  browser = await chromium.launch();
  const context = await browser.newContext();
  await context.route(
    (url) => url.href === firstReferenceSupplement.url,
    (route) =>
      route.fulfill({
        body: '<!doctype html><html lang="de"><title>Zusatzinformation</title></html>',
        contentType: 'text/html; charset=utf-8',
        status: 200,
      }),
  );
  const pages = [];
  const artifactEndTimings = [];
  context.on('page', (page) => pages.push(page));
  const page = await context.newPage();
  page.on('request', (request) => {
    if (!new URL(request.url()).pathname.endsWith('/artifact-intervals/end')) return;
    artifactEndTimings.push(request.postDataJSON());
  });
  await page.goto(studyOrigin);
  for (const item of instrumentRuntimeManifest.procedures.eligibility.items) {
    await page.getByLabel(item.prompt).check();
  }
  await page
    .getByRole('group', {
      name: instrumentRuntimeManifest.procedures.participantInformation.requiredConsent.legend,
    })
    .getByRole('checkbox')
    .check();
  const sessionResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/study/sessions',
  );
  await page
    .getByRole('button', {
      name: instrumentRuntimeManifest.procedures.participantInformation.actions.acceptLabel,
    })
    .click();
  const sessionResponse = await sessionResponsePromise;
  if (!sessionResponse.ok()) fail(`session creation returned ${String(sessionResponse.status())}.`);
  const session = await sessionResponse.json();
  if (typeof session.sessionId !== 'string') fail('session creation returned no sessionId.');
  await submitInstrumentSections(
    page,
    studyOrigin,
    session.sessionId,
    'pre-v1',
    instrumentRuntimeManifest.instruments['pre-v1'].sections,
  );
  await page.reload();
  await page.getByRole('button', { name: 'Lernangebot beginnen' }).click();

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
  const supplementPagePromise = context.waitForEvent('page');
  await courseFrame.locator(`a[href="${firstReferenceSupplement.url}"]`).click();
  const supplementPage = await supplementPagePromise;
  await supplementPage.waitForURL((url) => url.href === firstReferenceSupplement.url);
  await supplementPage.waitForLoadState('domcontentloaded');
  if (supplementPage.url() !== firstReferenceSupplement.url) {
    fail('the browser supplement did not open its canonical URL.');
  }
  const supplementIsolation = await supplementPage.evaluate(() => ({
    hasOpener: window.opener !== null,
    referrer: document.referrer,
  }));
  if (supplementIsolation.hasOpener || supplementIsolation.referrer !== '') {
    fail('the browser supplement was not isolated with noopener and noreferrer.');
  }
  await supplementPage.close();

  await clickCourseControl(/WEITER ZUM THEMA PASSWORT-MANAGER/iu);
  await clickCourseControl(/WEITER ZUM THEMA MULTI-FAKTOR-AUTHENTIFIZIERUNG/iu);
  if (artifactEndTimings.length !== 0) {
    fail('finishing the final instructional lesson ended artifact timing before its completion action.');
  }
  await courseFrame.locator('.page-wrap').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await clickCourseControl(/Training abschließen/iu);

  await page.getByRole('heading', { name: 'Fragebogen nach dem Lernangebot' }).waitFor();
  const completionSignalCount = await page.evaluate(
    () => window.__passwoReferenceCompletionSignals,
  );
  if (completionSignalCount !== 1) {
    fail(`the real course completion produced ${String(completionSignalCount)} signals.`);
  }
  if (artifactEndTimings.length !== 1) {
    fail(`the real course completion produced ${String(artifactEndTimings.length)} artifact ends.`);
  }
  await submitInstrumentSections(
    page,
    studyOrigin,
    session.sessionId,
    'post-v1',
    instrumentRuntimeManifest.instruments['post-v1'].sections.filter(({ id }) =>
      immediatePostSectionIds.has(id),
    ),
  );
  await page.reload();
  await page.getByRole('heading', { name: 'Fragen zu Kontosituationen' }).waitFor();
  process.stdout.write(
    'Reference completion integration passed: three-lesson boundary, twelve supplements, one completion signal, one artifact end, shared post and guardrail.\n',
  );
} finally {
  await browser?.close();
  await runtime?.close();
  await rm(dataDirectory, { recursive: true, force: true });
}
