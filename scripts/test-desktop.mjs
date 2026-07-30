import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { _electron as electron } from '@playwright/test';
import { referenceSupplementLinks } from './reference-supplements.mjs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const desktopDirectory = resolve(repositoryRoot, 'apps/study-desktop');
const configuredExecutable = process.env.PASSWO_DESKTOP_EXECUTABLE?.trim();
const electronExecutable =
  configuredExecutable ||
  resolve(repositoryRoot, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron');
const packagedApplication = configuredExecutable !== undefined && configuredExecutable !== '';
const mainEntry = resolve(desktopDirectory, 'dist/main.js');
const databaseDirectory = await mkdtemp(resolve(tmpdir(), 'passwo-desktop-smoke-'));
const databasePath = resolve(databaseDirectory, 'study.sqlite');
const firstSupplement = referenceSupplementLinks.find(({ id }) => id === 'passwords-bsi-checklist');

if (firstSupplement === undefined) {
  throw new Error('Desktop smoke test requires the canonical password checklist link.');
}

function fail(message) {
  throw new Error(`Desktop smoke test failed: ${message}`);
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

await Promise.all([
  access(electronExecutable),
  ...(packagedApplication ? [] : [access(mainEntry)]),
]);

const electronApplication = await electron.launch({
  executablePath: electronExecutable,
  args: packagedApplication ? [] : [mainEntry],
  cwd: desktopDirectory,
  env: {
    ...process.env,
    STUDY_ASSIGNMENT_MODE: 'forced-reference',
    STUDY_DATA_DIR: databaseDirectory,
  },
  timeout: 30_000,
});

try {
  const page = await electronApplication.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  if ((await page.title()) !== 'Authentication Onboarding') {
    fail(`unexpected window title ${await page.title()}.`);
  }
  const applicationState = await electronApplication.evaluate(({ app, BrowserWindow }) => ({
    applicationName: app.getName(),
    browserWindowCount: BrowserWindow.getAllWindows().length,
  }));
  if (
    applicationState.applicationName !== 'Authentication Onboarding' ||
    applicationState.browserWindowCount !== 1
  ) {
    fail(`unexpected application state ${JSON.stringify(applicationState)}.`);
  }

  await page.getByLabel('Ich habe die Hinweise gelesen und willige').check();
  await page.getByRole('button', { name: 'Weiter zum Fragebogen' }).click();
  await clickPlaceholder(page);

  await waitForFrame(page, '/scormdriver/indexAPI.html');
  const courseFrame = await waitForFrame(page, '/scormcontent/index.html');

  const clickCourseControl = async (name) => {
    const control = courseFrame
      .getByRole('button', { name })
      .or(courseFrame.getByRole('link', { name }))
      .first();
    await control.waitFor();
    await control.click();
  };
  const openAndCloseSupplement = async () => {
    const disclosure = courseFrame
      .locator('button[aria-expanded="false"]')
      .filter({ hasText: 'Zusatzinformationen' });
    await disclosure.waitFor();
    await disclosure.click();
    const courseUrlBefore = courseFrame.url();
    await courseFrame.locator(`a[href="${firstSupplement.url}"]`).click();
    const backButton = page.getByRole('button', { name: 'Zurück zum Training' });
    const viewerToolbar = page.locator('[data-reference-viewer-toolbar]');
    const technicalAlert = page.getByRole('alert');
    const viewerOutcome = await Promise.race([
      viewerToolbar.waitFor().then(() => 'opened'),
      technicalAlert.waitFor().then(async () => `alert:${await technicalAlert.innerText()}`),
    ]);
    if (viewerOutcome !== 'opened') {
      const bridgeAvailable = await page.evaluate(() => window.passwoDesktop !== undefined);
      fail(`${viewerOutcome}; desktop bridge available: ${String(bridgeAvailable)}.`);
    }
    await backButton.waitFor();
    const viewerState = await electronApplication.evaluate(
      async ({ BrowserWindow, webContents }) => {
        const browserWindow = BrowserWindow.getAllWindows()[0];
        const externalContents = webContents
          .getAllWebContents()
          .find((contents) => contents !== browserWindow?.webContents && !contents.isDestroyed());
        if (externalContents === undefined) {
          return { browserWindowCount: BrowserWindow.getAllWindows().length, permission: null };
        }
        const permission = await externalContents.executeJavaScript(
          "navigator.permissions.query({ name: 'geolocation' }).then((result) => result.state)",
        );
        await externalContents.executeJavaScript(
          "window.open('file:///tmp/passwo-blocked', '_blank')",
        );
        return {
          browserWindowCount: BrowserWindow.getAllWindows().length,
          permission,
          url: externalContents.getURL(),
        };
      },
    );
    if (viewerState.browserWindowCount !== 1 || viewerState.permission !== 'denied') {
      fail(`the isolated viewer exposed a privileged action: ${JSON.stringify(viewerState)}.`);
    }
    if ('url' in viewerState && viewerState.url.startsWith('file:')) {
      fail('the isolated viewer accepted a non-HTTP(S) navigation.');
    }
    if ((await page.locator('body').innerText()).includes('https://')) {
      fail('the application chrome exposed a raw URL.');
    }

    await backButton.click();
    await page.locator('[data-reference-viewer-toolbar]').waitFor({ state: 'detached' });
    if (courseFrame.url() !== courseUrlBefore) {
      fail('returning from the viewer changed the SecAware course frame.');
    }
    await courseFrame.locator(`a[href="${firstSupplement.url}"]`).waitFor();
  };

  await clickCourseControl(/KURS STARTEN/iu);
  await openAndCloseSupplement();
  await clickCourseControl(/WEITER ZUM THEMA PASSWORT-MANAGER/iu);
  await clickCourseControl(/WEITER ZUM THEMA MULTI-FAKTOR-AUTHENTIFIZIERUNG/iu);
  await clickCourseControl(/Training abschließen/iu);

  await page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' }).waitFor();
  await access(databasePath);
  if ((await page.getByText('Training abgeschlossen').count()) !== 0) {
    fail('the desktop flow retained the obsolete completion confirmation.');
  }

  process.stdout.write(
    'Desktop smoke passed: local Runtime/SQLite, three-lesson boundary, representative supplement link, isolated viewer, preserved course state, and automatic post transition.\n',
  );
} finally {
  await electronApplication.close();
  await rm(databaseDirectory, { recursive: true, force: true });
}
