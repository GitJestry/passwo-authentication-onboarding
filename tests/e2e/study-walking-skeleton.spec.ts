import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { buildStudyServer } from '../../apps/study-server/src/app.js';

type ForcedAssignmentMode = 'forced-supportive' | 'forced-reference';

let studyServer: ReturnType<typeof buildStudyServer> | null = null;

test.afterEach(async () => {
  if (studyServer !== null) {
    await studyServer.close();
    studyServer = null;
  }
});

async function startStudyServer(assignmentMode: ForcedAssignmentMode): Promise<void> {
  studyServer = buildStudyServer({
    version: '0.1.2-e2e',
    assignmentMode,
    databasePath: ':memory:',
  });
  await studyServer.listen({ host: '127.0.0.1', port: 4174 });
}

function captureResearchRequests(page: Page) {
  const bodies: string[] = [];
  const paths: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (!path.startsWith('/api/study/')) return;

    paths.push(path);
    const body = request.postData();
    if (body !== null) bodies.push(body);
  });
  return { bodies, paths };
}

function timingEventTypes(bodies: readonly string[]): string[] {
  return bodies.flatMap((body) => {
    const value: unknown = JSON.parse(body);
    if (
      typeof value === 'object' &&
      value !== null &&
      'eventType' in value &&
      typeof value.eventType === 'string'
    ) {
      return [value.eventType];
    }
    return [];
  });
}

async function dispatchVisibilityChange(
  page: Page,
  visibilityState: 'hidden' | 'visible',
): Promise<void> {
  await page.evaluate((nextVisibilityState) => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: nextVisibilityState,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visibilityState);
}

async function failFirstPreWrite(page: Page): Promise<void> {
  let failed = false;
  await page.route('**/api/study/sessions/*/responses', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isPreWrite =
      typeof body === 'object' &&
      body !== null &&
      'instrumentId' in body &&
      body.instrumentId === 'pre-placeholder';

    if (!failed && isPreWrite) {
      failed = true;
      await route.fulfill({
        status: 503,
        json: { errorCode: 'research-data-write-failed' },
      });
      return;
    }
    await route.continue();
  });
}

async function acceptConsent(page: Page) {
  await page.goto('/');
  await page.getByLabel('Ich bestätige die Einwilligung').check();
  await page.getByRole('button', { name: 'Studie beginnen' }).click();
  await expect(page.getByRole('heading', { name: 'Fragebogen vor dem Artefakt' })).toBeVisible();
}

async function submitPlaceholder(page: Page, buttonName = 'Antwort speichern') {
  await page.getByLabel('Platzhalterantwort bestätigen').check();
  await page.getByRole('button', { name: buttonName }).click();
}

async function finishAfterArtifact(page: Page) {
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await submitPlaceholder(page);
  await expect(page.getByRole('heading', { name: 'Verständnis prüfen' })).toBeVisible();
  await submitPlaceholder(page);
  await expect(page.getByRole('heading', { name: 'Vielen Dank' })).toBeVisible();
  await page.getByRole('button', { name: 'Debrief bestätigen' }).click();
  await expect(page.getByRole('heading', { name: 'Sitzung abgeschlossen' })).toBeVisible();
  await expect(page.getByText('Gesamtzeit im Artefakt:')).toBeVisible();
}

test('forced-supportive completes and visibly blocks a failed research write', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstPreWrite(page);
  await acceptConsent(page);

  await submitPlaceholder(page);
  await expect(page.getByRole('heading', { name: 'Speichern nicht möglich' })).toBeVisible();
  await expect(page.getByText('Der nächste Studienteil bleibt gesperrt')).toBeVisible();
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();

  await page.getByLabel('Anzeigename').fill('Browsername Nur Lokal');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await expect(page.getByRole('heading', { name: 'Hallo Browsername Nur Lokal' })).toBeVisible();
  await page.getByRole('button', { name: 'Artefakt-Platzhalter abschließen' }).click();
  await finishAfterArtifact(page);

  expect(requests.bodies.join('\n')).not.toContain('Browsername Nur Lokal');
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
  ).toEqual([]);
});

test('forced-supportive records diagnostic visibility only while the artifact is active', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Nur flüchtig');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await expect(page.getByRole('heading', { name: 'Hallo Nur flüchtig' })).toBeVisible();

  await dispatchVisibilityChange(page, 'hidden');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden']);
  await dispatchVisibilityChange(page, 'visible');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden', 'visibility-visible']);

  await page.getByRole('button', { name: 'Artefakt-Platzhalter abschließen' }).click();
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await dispatchVisibilityChange(page, 'hidden');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden', 'visibility-visible', 'end']);
});

test('forced-reference opens the placeholder separately and completes', async ({ page }) => {
  await startStudyServer('forced-reference');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Flüchtiger Name');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();

  await expect(page.getByRole('heading', { name: 'Referenz-Platzhalter' })).toBeVisible();
  await dispatchVisibilityChange(page, 'hidden');
  await expect.poll(() => timingEventTypes(requests.bodies)).toEqual(['start']);
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Referenz-Platzhalter in neuem Tab öffnen' }).click();
  const popup = await popupPromise;
  await popup.close();
  await page.getByRole('button', { name: 'Rückkehr bestätigen' }).click();
  await finishAfterArtifact(page);

  expect(requests.bodies.join('\n')).not.toContain('Flüchtiger Name');
});

test('reload during the artifact marks the session incomplete and starts fresh', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Nicht fortsetzen');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await expect(page.getByRole('heading', { name: 'Hallo Nicht fortsetzen' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen zur Studie' })).toBeVisible();
  await expect(page.getByText('Nicht fortsetzen')).toHaveCount(0);
  await expect
    .poll(() => requests.paths.filter((path) => path.endsWith('/incomplete-reload')).length)
    .toBe(1);
});

test('reload after the artifact end does not mark the session incomplete', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Ende vor Reload');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await expect(page.getByRole('heading', { name: 'Hallo Ende vor Reload' })).toBeVisible();
  await page.getByRole('button', { name: 'Artefakt-Platzhalter abschließen' }).click();
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen zur Studie' })).toBeVisible();
  expect(requests.paths.filter((path) => path.endsWith('/incomplete-reload'))).toHaveLength(0);
});
