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
  return timingEvents(bodies).map(({ eventType }) => eventType);
}

interface CapturedTimingEvent {
  readonly sequence: number;
  readonly phase: string;
  readonly sectionId: string | null;
  readonly segmentId: string | null;
  readonly eventType: string;
  readonly elapsedMs: number | null;
}

function timingEvents(bodies: readonly string[]): CapturedTimingEvent[] {
  return bodies.flatMap((body) => {
    const value: unknown = JSON.parse(body);
    if (
      typeof value === 'object' &&
      value !== null &&
      'sequence' in value &&
      typeof value.sequence === 'number' &&
      'phase' in value &&
      typeof value.phase === 'string' &&
      'sectionId' in value &&
      (typeof value.sectionId === 'string' || value.sectionId === null) &&
      'segmentId' in value &&
      (typeof value.segmentId === 'string' || value.segmentId === null) &&
      'eventType' in value &&
      typeof value.eventType === 'string' &&
      'elapsedMs' in value &&
      (typeof value.elapsedMs === 'number' || value.elapsedMs === null)
    ) {
      return [
        {
          sequence: value.sequence,
          phase: value.phase,
          sectionId: value.sectionId,
          segmentId: value.segmentId,
          eventType: value.eventType,
          elapsedMs: value.elapsedMs,
        },
      ];
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

async function failFirstS00TimingWrite(page: Page, eventType: 'start' | 'end'): Promise<void> {
  let failed = false;
  await page.route('**/api/study/sessions/*/timing', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isS00Boundary =
      typeof body === 'object' &&
      body !== null &&
      'eventType' in body &&
      body.eventType === eventType &&
      'sectionId' in body &&
      body.sectionId === 'passwords' &&
      'segmentId' in body &&
      body.segmentId === 'S00';

    if (!failed && isS00Boundary) {
      failed = true;
      await route.fulfill({
        status: 503,
        json: { errorCode: `segment-${eventType}-write-failed` },
      });
      return;
    }
    await route.continue();
  });
}

async function failFirstS01TimingWrite(page: Page, eventType: 'start' | 'end'): Promise<void> {
  let failed = false;
  await page.route('**/api/study/sessions/*/timing', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isS01Boundary =
      typeof body === 'object' &&
      body !== null &&
      'eventType' in body &&
      body.eventType === eventType &&
      'sectionId' in body &&
      body.sectionId === 'passwords' &&
      'segmentId' in body &&
      body.segmentId === 'S01';

    if (!failed && isS01Boundary) {
      failed = true;
      await route.fulfill({
        status: 503,
        json: { errorCode: `s01-segment-${eventType}-write-failed` },
      });
      return;
    }
    await route.continue();
  });
}

async function failFirstS02TimingWrite(page: Page, eventType: 'start' | 'end'): Promise<void> {
  let failed = false;
  await page.route('**/api/study/sessions/*/timing', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isS02Boundary =
      typeof body === 'object' &&
      body !== null &&
      'eventType' in body &&
      body.eventType === eventType &&
      'sectionId' in body &&
      body.sectionId === 'passwords' &&
      'segmentId' in body &&
      body.segmentId === 'S02';

    if (!failed && isS02Boundary) {
      failed = true;
      await route.fulfill({
        status: 503,
        json: { errorCode: `s02-segment-${eventType}-write-failed` },
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

async function completeS00(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hinweis für die Übung' })).toBeVisible();
  await page.getByLabel('Ich verwende nur ausgedachte Passwörter.').check();
  await page.getByRole('button', { name: 'Weiter' }).click();
}

async function configureS01(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'CampusID' })).toBeVisible();
  await page.getByRole('tab', { name: 'CampusBoard Archiv' }).click();
  await page.getByLabel('Fiktives Passwort').fill('board !?');
  await page.getByRole('tab', { name: 'CampusMail' }).click();
  await page.getByLabel('Fiktives Passwort').fill('mail !?');
  await page.getByRole('tab', { name: 'CampusID' }).click();
  await page.getByLabel('Fiktives Passwort').fill('id !?');
  await page.getByRole('button', { name: 'Konten einrichten' }).click();
  await expect(page.getByText('Die drei Konten sind eingerichtet.')).toBeVisible();
}

async function completeS01(page: Page): Promise<void> {
  await configureS01(page);
  await page.getByRole('button', { name: 'Weiter' }).click();
}

async function completeS02(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('heading', { name: 'Was hängt an deinen Konten?' })).toBeVisible();
  const accounts = [
    {
      name: 'CampusMail',
      details: [
        'Benachrichtigungen',
        'Bestätigungen',
        'Zurücksetzungslinks',
        'Kommunikation in deinem Namen',
      ],
    },
    {
      name: 'CampusBoard Archiv',
      details: ['Alte Ankündigungen', 'Projektfragen', 'Archivierte Diskussionen'],
    },
    {
      name: 'CampusID',
      details: ['LearnSpace', 'Prüfungsportal', 'Cloud Notes'],
    },
  ] as const;
  for (const account of accounts) {
    await page.getByRole('button', { name: new RegExp(`^${account.name}\\.`) }).click();
    for (const detail of account.details) {
      await page.getByRole('button', { name: new RegExp(`^${detail}\\.`) }).click();
    }
  }
  await expect(page.getByText('Konten verstehen: 3/3 angesehen')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter' }).click();
}

async function completePasswordModule(page: Page): Promise<void> {
  await completeS00(page);
  await completeS01(page);
  await completeS02(page);
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
  await completePasswordModule(page);
  await finishAfterArtifact(page);

  expect(requests.bodies.join('\n')).not.toContain('Browsername Nur Lokal');
  expect(timingEvents(requests.bodies).filter(({ segmentId }) => segmentId === 'S00')).toEqual([
    expect.objectContaining({
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S00',
      eventType: 'start',
      elapsedMs: null,
    }),
    expect.objectContaining({
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S00',
      eventType: 'end',
      elapsedMs: expect.any(Number),
    }),
  ]);
  expect(timingEvents(requests.bodies).filter(({ segmentId }) => segmentId === 'S01')).toEqual([
    expect.objectContaining({
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S01',
      eventType: 'start',
      elapsedMs: null,
    }),
    expect.objectContaining({
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S01',
      eventType: 'end',
      elapsedMs: expect.any(Number),
    }),
  ]);
  expect(timingEvents(requests.bodies).filter(({ segmentId }) => segmentId === 'S02')).toEqual([
    expect.objectContaining({
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S02',
      eventType: 'start',
      elapsedMs: null,
    }),
    expect.objectContaining({
      phase: 'artifact',
      sectionId: 'passwords',
      segmentId: 'S02',
      eventType: 'end',
      elapsedMs: expect.any(Number),
    }),
  ]);
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
  ).toEqual([]);
});

test('supportive S00 to S01 keeps fictitious values local and supports keyboard tabs', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  const archiveValue = '  archiv !?  ';
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('Nur lokal');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);

  const passwordField = page.getByLabel('Fiktives Passwort');
  await expect(page.getByText('0/3 Konten ausgefüllt')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Konten einrichten' })).toBeDisabled();
  await page.getByRole('tab', { name: 'CampusID' }).focus();
  await page.getByRole('tab', { name: 'CampusID' }).press('End');
  await expect(page.getByRole('heading', { name: 'CampusBoard Archiv' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(passwordField).toBeFocused();
  await page.keyboard.type(archiveValue);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Passwort für CampusBoard Archiv anzeigen' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(passwordField).toHaveAttribute('type', 'text');
  await expect(passwordField).toHaveValue(archiveValue);
  await page.keyboard.press('Enter');
  await expect(passwordField).toHaveAttribute('type', 'password');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Home');
  await expect(page.getByRole('heading', { name: 'CampusID' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(passwordField).toBeFocused();
  await page.keyboard.type('id !?');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { name: 'CampusMail' })).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(passwordField).toBeFocused();
  await page.keyboard.type('mail !?');
  await expect(page.getByText('3/3 Konten ausgefüllt')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Konten einrichten' })).toBeEnabled();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('End');
  await expect(passwordField).toHaveValue(archiveValue);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Konten einrichten' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('img', { name: 'Abgeschlossen' })).toHaveCount(3);
  await expect(passwordField).toBeDisabled();
  const completionStatus = page.getByRole('heading', { name: 'Konto eingerichtet' });
  await expect(completionStatus).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Was hängt an deinen Konten?' })).toBeVisible();
  expect(await page.locator('body').innerText()).not.toContain(archiveValue);
  expect(await page.locator('body').innerText()).not.toContain('mail !?');
  expect(await page.locator('body').innerText()).not.toContain('id !?');
  await completeS02(page);
  await finishAfterArtifact(page);

  expect(requests.bodies.join('\n')).not.toContain(archiveValue);
  expect(requests.bodies.join('\n')).not.toContain('mail !?');
  expect(requests.bodies.join('\n')).not.toContain('id !?');
});

test('retries failed S01 start and end timing writes with the same payload', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstS01TimingWrite(page, 'start');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('S01 Timing Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);

  await expect(page.getByText('Fehlercode: s01-segment-start-write-failed')).toBeVisible();
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await configureS01(page);
  await page.getByRole('button', { name: 'Weiter' }).click();
  await completeS02(page);
  await finishAfterArtifact(page);

  const segmentStarts = timingEvents(requests.bodies).filter(
    ({ segmentId, eventType }) => segmentId === 'S01' && eventType === 'start',
  );
  expect(segmentStarts).toHaveLength(2);
  expect(segmentStarts[0]).toEqual(segmentStarts[1]);
});

test('retries a failed S01 end before ending the artifact', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstS01TimingWrite(page, 'end');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('S01 End Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);
  await configureS01(page);
  await page.getByRole('button', { name: 'Weiter' }).click();

  await expect(page.getByText('Fehlercode: s01-segment-end-write-failed')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await completeS02(page);
  await finishAfterArtifact(page);

  const segmentEnds = timingEvents(requests.bodies).filter(
    ({ segmentId, eventType }) => segmentId === 'S01' && eventType === 'end',
  );
  expect(segmentEnds).toHaveLength(2);
  expect(segmentEnds[0]).toEqual(segmentEnds[1]);
});

test('retries failed S02 start and end writes with the same payload', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstS02TimingWrite(page, 'start');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('S02 Timing Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);
  await completeS01(page);

  await expect(page.getByText('Fehlercode: s02-segment-start-write-failed')).toBeVisible();
  await expect(page.getByRole('button', { name: /^CampusID\./ })).toBeDisabled();
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await completeS02(page);
  await finishAfterArtifact(page);

  const segmentStarts = timingEvents(requests.bodies).filter(
    ({ segmentId, eventType }) => segmentId === 'S02' && eventType === 'start',
  );
  expect(segmentStarts).toHaveLength(2);
  expect(segmentStarts[0]).toEqual(segmentStarts[1]);
});

test('blocks completion while S02 end fails and retries the same end payload', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstS02TimingWrite(page, 'end');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('S02 End Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);
  await completeS01(page);
  await completeS02(page);

  await expect(page.getByText('Fehlercode: s02-segment-end-write-failed')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await finishAfterArtifact(page);

  const segmentEnds = timingEvents(requests.bodies).filter(
    ({ segmentId, eventType }) => segmentId === 'S02' && eventType === 'end',
  );
  expect(segmentEnds).toHaveLength(2);
  expect(segmentEnds[0]).toEqual(segmentEnds[1]);
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
  await expect.poll(() => timingEventTypes(requests.bodies)).toEqual(['start', 'start']);

  await dispatchVisibilityChange(page, 'hidden');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'start', 'visibility-hidden']);
  await dispatchVisibilityChange(page, 'visible');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual(['start', 'start', 'visibility-hidden', 'visibility-visible']);
  await expect
    .poll(() => requests.paths.filter((path) => path.endsWith('/artifact-lease/heartbeat')).length)
    .toBe(1);

  await completePasswordModule(page);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await dispatchVisibilityChange(page, 'hidden');
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual([
      'start',
      'start',
      'visibility-hidden',
      'visibility-visible',
      'end',
      'start',
      'end',
      'start',
      'end',
      'end',
    ]);
  expect(
    timingEvents(requests.bodies).map(({ sequence, sectionId, segmentId, eventType }) => ({
      sequence,
      sectionId,
      segmentId,
      eventType,
    })),
  ).toEqual([
    { sequence: 0, sectionId: null, segmentId: null, eventType: 'start' },
    { sequence: 1, sectionId: 'passwords', segmentId: 'S00', eventType: 'start' },
    { sequence: 2, sectionId: null, segmentId: null, eventType: 'visibility-hidden' },
    { sequence: 3, sectionId: null, segmentId: null, eventType: 'visibility-visible' },
    { sequence: 4, sectionId: 'passwords', segmentId: 'S00', eventType: 'end' },
    { sequence: 5, sectionId: 'passwords', segmentId: 'S01', eventType: 'start' },
    { sequence: 6, sectionId: 'passwords', segmentId: 'S01', eventType: 'end' },
    { sequence: 7, sectionId: 'passwords', segmentId: 'S02', eventType: 'start' },
    { sequence: 8, sectionId: 'passwords', segmentId: 'S02', eventType: 'end' },
    { sequence: 9, sectionId: null, segmentId: null, eventType: 'end' },
  ]);
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
  await expect(
    page.getByText('Das Speichern des Zeitereignisses ist fehlgeschlagen.'),
  ).toBeVisible();
  await expect(page.getByText('Fehlercode: visibility-write-failed')).toBeVisible();

  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await completeS01(page);
  await completeS02(page);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await expect
    .poll(() => timingEventTypes(requests.bodies))
    .toEqual([
      'start',
      'start',
      'visibility-hidden',
      'visibility-hidden',
      'end',
      'start',
      'end',
      'start',
      'end',
      'end',
    ]);

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
  expect(timingBodies[2]).toEqual(timingBodies[3]);
  expect(timingBodies.map((body) => ('sequence' in body ? body.sequence : null))).toEqual([
    0, 1, 2, 2, 3, 4, 5, 6, 7, 8,
  ]);
});

test('retries a failed S00 segment start before beginning the mission', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstS00TimingWrite(page, 'start');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('S00 Start Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();

  await expect(
    page.getByText('Das Speichern des Zeitereignisses ist fehlgeschlagen.'),
  ).toBeVisible();
  await expect(page.getByText('Fehlercode: segment-start-write-failed')).toBeVisible();
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await completePasswordModule(page);
  await finishAfterArtifact(page);

  const segmentStarts = timingEvents(requests.bodies).filter(
    ({ segmentId, eventType }) => segmentId === 'S00' && eventType === 'start',
  );
  expect(segmentStarts).toHaveLength(2);
  expect(segmentStarts[0]).toEqual(segmentStarts[1]);
});

test('retries a failed S00 segment end before leaving the segment', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstS00TimingWrite(page, 'end');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await page.getByLabel('Anzeigename').fill('S00 End Retry');
  await page.getByRole('button', { name: 'Zum Artefakt' }).click();
  await completeS00(page);

  await expect(
    page.getByText('Das Speichern des Zeitereignisses ist fehlgeschlagen.'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await completeS01(page);
  await completeS02(page);
  await finishAfterArtifact(page);

  const segmentEnds = timingEvents(requests.bodies).filter(
    ({ segmentId, eventType }) => segmentId === 'S00' && eventType === 'end',
  );
  expect(segmentEnds).toHaveLength(2);
  expect(segmentEnds[0]).toEqual(segmentEnds[1]);
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
  await completePasswordModule(page);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen zur Studie' })).toBeVisible();
  expect(requests.paths.filter((path) => path.endsWith('/incomplete-reload'))).toHaveLength(0);
});
