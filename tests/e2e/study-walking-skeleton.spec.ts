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
  const sessionIds = new Set<string>();
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (!path.startsWith('/api/study/')) return;

    paths.push(path);
    const sessionId = path.match(/^\/api\/study\/sessions\/([^/]+)\//u)?.[1];
    if (sessionId !== undefined) sessionIds.add(sessionId);
    const body = request.postData();
    if (body !== null) bodies.push(body);
  });
  return { bodies, paths, sessionIds };
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

async function failFirstArtifactStartWrite(page: Page): Promise<void> {
  let failed = false;
  await page.route('**/api/study/sessions/*/timing', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isArtifactStart =
      typeof body === 'object' &&
      body !== null &&
      'eventType' in body &&
      body.eventType === 'start';

    if (!failed && isArtifactStart) {
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

async function failFirstVisibilityWrite(page: Page): Promise<() => void> {
  let failed = false;
  let releaseFailure = () => {};
  const failureGate = new Promise<void>((resolve) => {
    releaseFailure = resolve;
  });
  await page.route('**/api/study/sessions/*/timing', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isVisibilityWrite =
      typeof body === 'object' &&
      body !== null &&
      'eventType' in body &&
      body.eventType === 'visibility-hidden';

    if (!failed && isVisibilityWrite) {
      failed = true;
      await failureGate;
      await route.fulfill({
        status: 503,
        json: { errorCode: 'visibility-write-failed' },
      });
      return;
    }
    await route.continue();
  });
  return releaseFailure;
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

async function completeS00(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hinweis für die Übung' })).toBeVisible();
  await page.getByLabel('Ich verwende nur ausgedachte Passwörter.').check();
  await page.getByRole('button', { name: 'Weiter' }).click();
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
  await completeS00(page);
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
  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();

  await dispatchVisibilityChange(page, 'hidden');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden']);
  await dispatchVisibilityChange(page, 'visible');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden', 'visibility-visible']);
  await expect
    .poll(() => requests.paths.filter((path) => path.endsWith('/artifact-lease/heartbeat')).length)
    .toBe(1);

  await completeS00(page);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await dispatchVisibilityChange(page, 'hidden');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden', 'visibility-visible', 'end']);
});

test('failed visibility blocks completion and retries the same timing payload', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  const releaseVisibilityFailure = await failFirstVisibilityWrite(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Timing Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();

  await dispatchVisibilityChange(page, 'hidden');
  await completeS00(page);
  releaseVisibilityFailure();
  await expect(page.getByRole('heading', { name: 'Speichern nicht möglich' })).toBeVisible();
  await expect(page.getByText('Fehlercode: visibility-write-failed')).toBeVisible();

  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'visibility-hidden', 'visibility-hidden', 'end']);

  const timingBodies = requests.bodies.flatMap((body) => {
    const value: unknown = JSON.parse(body);
    if (
      typeof value === 'object' &&
      value !== null &&
      'eventType' in value &&
      typeof value.eventType === 'string'
    ) {
      return [value];
    }
    return [];
  });
  expect(timingBodies[1]).toEqual(timingBodies[2]);
  expect(timingBodies.map((body) => ('sequence' in body ? body.sequence : null))).toEqual([
    0, 1, 1, 2,
  ]);
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
  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen zur Studie' })).toBeVisible();
  await expect(page.getByText('Nicht fortsetzen')).toHaveCount(0);
  await expect
    .poll(() => requests.paths.filter((path) => path.endsWith('/incomplete-reload')).length)
    .toBe(1);
  const sessionId = [...requests.sessionIds].at(0);
  expect(sessionId).toBeDefined();
  await expect
    .poll(async () => {
      if (studyServer === null || sessionId === undefined) return null;
      const response = await studyServer.inject({
        method: 'GET',
        url: `/api/study/sessions/${sessionId}/status`,
      });
      return response.json<{ completionStatus: string }>().completionStatus;
    })
    .toBe('incomplete-reload');
});

test('reload after a failed artifact start still marks the leased session incomplete', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstArtifactStartWrite(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Startfehler');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await expect(page.getByRole('heading', { name: 'Speichern nicht möglich' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen zur Studie' })).toBeVisible();
  await expect
    .poll(() => requests.paths.filter((path) => path.endsWith('/incomplete-reload')).length)
    .toBe(1);
  const sessionId = [...requests.sessionIds].at(0);
  expect(sessionId).toBeDefined();
  await expect
    .poll(async () => {
      if (studyServer === null || sessionId === undefined) return null;
      const response = await studyServer.inject({
        method: 'GET',
        url: `/api/study/sessions/${sessionId}/status`,
      });
      return response.json<{ completionStatus: string }>().completionStatus;
    })
    .toBe('incomplete-reload');
});

test('reload after the artifact end does not mark the session incomplete', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Ende vor Reload');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen zur Studie' })).toBeVisible();
  expect(requests.paths.filter((path) => path.endsWith('/incomplete-reload'))).toHaveLength(0);
});
