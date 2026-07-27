import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Frame, type Locator, type Page, test } from '@playwright/test';
import { buildStudyServer } from '../../apps/study-server/src/app.js';

type ForcedAssignmentMode = 'forced-supportive' | 'forced-reference';

const forbiddenVisibleRuntimeTexts = [
  'PassWo Studie',
  'Technischer Platzhalterdurchlauf',
  'Studienstart',
  'Fiktive Adresse',
  'Nur Vorschau',
  'Fiktive Übungsseite',
  'Lernbühne',
  'Pre-Platzhalter',
  'Post-Platzhalter',
  'Guardrail-Platzhalter',
  'Platzhalterantwort bestätigen',
  'Referenztraining',
  'Referenz-Training',
  'Referenzartefakt',
  'Vergleichsbedingung',
  'Kontrollgruppe',
] as const;

let studyServer: ReturnType<typeof buildStudyServer> | null = null;
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('../../apps/study-server/src/test-fixtures/reference-artifact/', import.meta.url),
);

test.use({ contextOptions: { reducedMotion: 'reduce' } });

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
    referenceArtifactDirectory: referenceArtifactFixtureDirectory,
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

async function expectNoForbiddenVisibleRuntimeText(page: Page): Promise<void> {
  const visibleText = await page.locator('body').innerText();
  for (const forbiddenText of forbiddenVisibleRuntimeTexts) {
    expect(visibleText).not.toContain(forbiddenText);
  }
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(overflow).toEqual({ body: 0, document: 0 });
}

async function expectInsideViewport(page: Page, locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  const viewport = page.viewportSize();
  const box = await locator.boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  if (viewport === null || box === null) return;

  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
}

async function expectNoHighImpactAxeFindings(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
  ).toEqual([]);
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

async function failFirstSegmentTimingWrite(
  page: Page,
  segmentId: 'S00' | 'S01' | 'S02',
  eventType: 'start' | 'end',
): Promise<void> {
  let failed = false;
  await page.route('**/api/study/sessions/*/timing', async (route) => {
    const body: unknown = route.request().postDataJSON();
    const isSegmentBoundary =
      typeof body === 'object' &&
      body !== null &&
      'eventType' in body &&
      body.eventType === eventType &&
      'sectionId' in body &&
      body.sectionId === 'passwords' &&
      'segmentId' in body &&
      body.segmentId === segmentId;

    if (!failed && isSegmentBoundary) {
      failed = true;
      await route.fulfill({
        status: 503,
        json: {
          errorCode:
            segmentId === 'S00'
              ? `segment-${eventType}-write-failed`
              : `${segmentId.toLowerCase()}-segment-${eventType}-write-failed`,
        },
      });
      return;
    }
    await route.continue();
  });
}

async function acceptConsent(page: Page) {
  await page.goto('/');
  await expect(page.locator('main[data-study-surface]')).toBeVisible();
  await expectNoForbiddenVisibleRuntimeText(page);
  await page.getByLabel('Ich habe die Hinweise gelesen und willige').check();
  await page.getByRole('button', { name: 'Weiter zum Fragebogen' }).click();
  await expect(page.getByRole('heading', { name: 'Fragebogen vor dem Artefakt' })).toBeVisible();
}

async function submitPlaceholder(page: Page, buttonName = 'Antwort speichern') {
  await page.getByLabel('Ich habe die Hinweise zu diesem Abschnitt gelesen.').check();
  await page.getByRole('button', { name: buttonName }).click();
}

async function waitForReferenceContentFrame(page: Page): Promise<Frame> {
  await expect
    .poll(() =>
      page
        .frames()
        .some((frame) => frame.url().includes('/reference/secaware/passwords-authentication/')),
    )
    .toBe(true);
  const contentFrame = page
    .frames()
    .find((frame) => frame.url().includes('/reference/secaware/passwords-authentication/'));
  if (contentFrame === undefined) throw new Error('reference-content-frame-missing');
  return contentFrame;
}

async function enterSupportiveTraining(page: Page, displayName: string): Promise<void> {
  await expect(page.locator('main[data-artifact-surface]')).toBeVisible();
  await expect(page.locator('main[data-study-surface]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Passwörter & Authentifizierung' })).toBeVisible();
  await expectNoForbiddenVisibleRuntimeText(page);
  await expectNoHorizontalScroll(page);
  await page.getByLabel('Wie soll PassWo dich ansprechen?').fill(displayName);
  await page.getByRole('button', { name: 'Training starten' }).click();
}

async function finishAfterArtifact(page: Page) {
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await expect(page.locator('main[data-study-surface]')).toBeVisible();
  await expect(page.locator('main[data-artifact-surface]')).toHaveCount(0);
  await expect(page.getByText('PassWo', { exact: true })).toHaveCount(0);
  await expectNoForbiddenVisibleRuntimeText(page);
  await submitPlaceholder(page);
  await expect(page.getByRole('heading', { name: 'Verständnis prüfen' })).toBeVisible();
  await expect(page.locator('main[data-study-surface]')).toBeVisible();
  await expect(page.getByText('PassWo', { exact: true })).toHaveCount(0);
  await submitPlaceholder(page);
  await expect(page.getByRole('heading', { name: 'Vielen Dank' })).toBeVisible();
  await expect(page.locator('main[data-study-surface]')).toBeVisible();
  await expect(page.getByText('PassWo', { exact: true })).toHaveCount(0);
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

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
] as const) {
  test(`supportive S00–S02 keeps primary actions visible at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await startStudyServer('forced-supportive');
    await acceptConsent(page);
    await submitPlaceholder(page);

    const entryAction = page.getByRole('button', { name: 'Training starten' });
    await expect(
      page.getByRole('heading', { name: 'Passwörter & Authentifizierung' }),
    ).toBeVisible();
    await expectInsideViewport(page, entryAction);
    await expectNoHorizontalScroll(page);
    await expectNoHighImpactAxeFindings(page);

    await enterSupportiveTraining(page, 'Visuelle Vorschau');
    const s00Action = page.getByRole('button', { name: 'Weiter' });
    await expectInsideViewport(page, s00Action);
    await expectNoHorizontalScroll(page);
    await expectNoHighImpactAxeFindings(page);

    await completeS00(page);
    const s01Action = page.getByRole('button', { name: 'Konten einrichten' });
    await expectInsideViewport(page, s01Action);
    await expectNoHorizontalScroll(page);
    await expectNoHighImpactAxeFindings(page);

    await completeS01(page);
    const accountAction = page.getByRole('button', { name: /^CampusID\./ });
    await expectInsideViewport(page, accountAction);
    await expectNoHorizontalScroll(page);
    await expectNoHighImpactAxeFindings(page);
  });
}

test('forced-supportive completes and visibly blocks a failed research write', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await failFirstPreWrite(page);
  await acceptConsent(page);

  await submitPlaceholder(page);
  await expect(page.getByRole('heading', { name: 'Speichern nicht möglich' })).toBeVisible();
  await expect(page.getByText('Der nächste Studienteil bleibt gesperrt')).toBeVisible();
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();

  await expect(page.getByRole('heading', { name: 'Passwörter & Authentifizierung' })).toBeVisible();
  await expectNoHighImpactAxeFindings(page);
  await enterSupportiveTraining(page, 'Browsername Nur Lokal');
  await completePasswordModule(page);
  await finishAfterArtifact(page);

  expect(requests.bodies.join('\n')).not.toContain('Browsername Nur Lokal');
  expect(page.url()).not.toContain('Browsername');
  expect(requests.paths.join('\n')).not.toContain('Browsername');
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
  await expectNoHighImpactAxeFindings(page);
});

test('supportive S00 to S01 keeps fictitious values local and supports keyboard tabs', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  const archiveValue = '  archiv !?  ';
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'Nur lokal');
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
  await failFirstSegmentTimingWrite(page, 'S01', 'start');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'S01 Timing Retry');
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
  await failFirstSegmentTimingWrite(page, 'S01', 'end');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'S01 End Retry');
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
  await failFirstSegmentTimingWrite(page, 'S02', 'start');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'S02 Timing Retry');
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
  await failFirstSegmentTimingWrite(page, 'S02', 'end');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'S02 End Retry');
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
  await expect.poll(() => timingEventTypes(requests.bodies)).toEqual(['start']);
  await enterSupportiveTraining(page, 'Nur flüchtig');
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
  await enterSupportiveTraining(page, 'Timing Retry');
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
  await failFirstSegmentTimingWrite(page, 'S00', 'start');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'S00 Start Retry');

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
  await failFirstSegmentTimingWrite(page, 'S00', 'end');
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'S00 End Retry');
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

test('forced-reference embeds the local artifact and accepts only its valid completion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await startStudyServer('forced-reference');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);

  await expect(page.locator('main[data-artifact-surface]')).toBeVisible();
  await expect(page.locator('main[data-study-surface]')).toHaveCount(0);
  await expect(page.getByLabel('Wie soll PassWo dich ansprechen?')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
  await expect(page.locator('[target="_blank"]')).toHaveCount(0);
  await expect(page.getByRole('link')).toHaveCount(0);
  expect(page.context().pages()).toEqual([page]);

  const courseIframe = page.getByTitle('Passwörter & Authentifizierung');
  await expect(courseIframe).toHaveCount(1);
  await expect(courseIframe).toHaveAttribute(
    'src',
    '/reference/secaware/passwords-authentication/scormdriver/indexAPI.html?StandAlone=true',
  );
  await expect(courseIframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  await expect(courseIframe).toHaveAttribute('referrerpolicy', 'no-referrer');
  const sandbox = (await courseIframe.getAttribute('sandbox'))?.split(/\s+/u) ?? [];
  expect(sandbox).toEqual(['allow-scripts', 'allow-same-origin']);
  const artifactBox = await page.locator('main[data-artifact-surface]').boundingBox();
  const iframeBox = await courseIframe.boundingBox();
  expect(artifactBox).not.toBeNull();
  expect(iframeBox).toEqual(artifactBox);

  const contentFrame = await waitForReferenceContentFrame(page);
  await expect(
    contentFrame.getByRole('heading', { name: 'Passwörter & Authentifizierung' }),
  ).toBeVisible();
  expect(await contentFrame.locator('body').innerText()).not.toMatch(/Referenz/iu);
  await expectNoForbiddenVisibleRuntimeText(page);
  await expectNoHighImpactAxeFindings(page);
  await dispatchVisibilityChange(page, 'hidden');
  await expect.poll(() => timingEventTypes(requests.bodies)).toEqual(['start']);

  await page.evaluate(
    ({ messageType, snapshotId }) => {
      const iframe = document.querySelector('iframe');
      if (!(iframe instanceof HTMLIFrameElement)) throw new Error('reference-iframe-missing');
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: messageType, snapshotId },
          origin: 'https://invalid.example',
          source: iframe.contentWindow,
        }),
      );
    },
    {
      messageType: 'passwo:reference-completed',
      snapshotId: 'secaware-passwords-authentication-2026-07-26',
    },
  );
  await contentFrame.evaluate(() =>
    window.parent.postMessage(
      {
        type: 'passwo:wrong-message',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
      },
      window.location.origin,
    ),
  );
  await page.evaluate(() =>
    window.postMessage(
      {
        type: 'passwo:reference-completed',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
      },
      window.location.origin,
    ),
  );
  await contentFrame.evaluate(() =>
    window.parent.postMessage(
      { type: 'passwo:reference-completed', snapshotId: 'wrong-snapshot' },
      window.location.origin,
    ),
  );
  await contentFrame.evaluate(() =>
    window.parent.postMessage(
      {
        type: 'passwo:reference-completed',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
        interaction: 'not-allowed',
      },
      window.location.origin,
    ),
  );
  await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toHaveCount(0);

  await contentFrame.evaluate(() => {
    for (const data of [
      {
        type: 'passwo:reference-open-supplement',
        snapshotId: 'wrong-snapshot',
        linkId: 'passwords-bsi-checklist',
      },
      {
        type: 'passwo:reference-open-supplement',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
        linkId: 'unknown-link',
      },
      {
        type: 'passwo:reference-open-supplement',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
        linkId: 'passwords-bsi-checklist',
        url: 'https://invalid.example/',
      },
    ]) {
      window.parent.postMessage(data, window.location.origin);
    }
  });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.evaluate(() => {
    window.postMessage(
      {
        type: 'passwo:reference-open-supplement',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
        linkId: 'passwords-bsi-checklist',
      },
      window.location.origin,
    );
  });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.evaluate(() => {
    const testWindow = window as typeof window & {
      __openedReferenceSupplementId?: string;
      __referenceSupplementClosed?: boolean;
    };
    Object.defineProperty(window, 'passwoDesktop', {
      configurable: true,
      value: {
        openReferenceSupplement: async (linkId: string) => {
          testWindow.__openedReferenceSupplementId = linkId;
          return true;
        },
        closeReferenceSupplement: async () => {
          testWindow.__referenceSupplementClosed = true;
        },
      },
    });
  });
  await contentFrame.evaluate(() =>
    window.parent.postMessage(
      {
        type: 'passwo:reference-open-supplement',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
        linkId: 'passwords-bsi-checklist',
      },
      window.location.origin,
    ),
  );
  await expect(page.getByText('Zusatzinformationen', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zurück zum Training' })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __openedReferenceSupplementId?: string;
          }
        ).__openedReferenceSupplementId,
    ),
  ).toBe('passwords-bsi-checklist');
  await page.getByRole('button', { name: 'Zurück zum Training' }).click();
  await expect(page.getByText('Zusatzinformationen', { exact: true })).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __referenceSupplementClosed?: boolean;
          }
        ).__referenceSupplementClosed,
    ),
  ).toBe(true);

  await contentFrame.evaluate(() => {
    const completion = {
      type: 'passwo:reference-completed',
      snapshotId: 'secaware-passwords-authentication-2026-07-26',
    };
    window.parent.postMessage(completion, window.location.origin);
    window.parent.postMessage(completion, window.location.origin);
  });
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();
  await expect(page.getByText('Training abgeschlossen')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
  await expect.poll(() => timingEventTypes(requests.bodies)).toEqual(['start', 'end']);
  expect(
    timingEvents(requests.bodies).filter(
      ({ eventType, phase }) => eventType === 'end' && phase === 'artifact',
    ),
  ).toHaveLength(1);
  expect(
    timingEvents(requests.bodies).every(
      ({ sectionId, segmentId }) => sectionId === null && segmentId === null,
    ),
  ).toBe(true);
  await expectNoHighImpactAxeFindings(page);

  await finishAfterArtifact(page);
});

test('forced-reference shows a technical supplement notice without the desktop bridge', async ({
  page,
}) => {
  await startStudyServer('forced-reference');
  await acceptConsent(page);
  await submitPlaceholder(page);
  const contentFrame = await waitForReferenceContentFrame(page);

  await contentFrame.evaluate(() =>
    window.parent.postMessage(
      {
        type: 'passwo:reference-open-supplement',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
        linkId: 'passwords-bsi-checklist',
      },
      window.location.origin,
    ),
  );
  await expect(page.getByRole('alert')).toHaveText(
    'Zusatzinformationen sind nur in der Desktop-App verfügbar.Zurück zum Training',
  );
  expect(page.context().pages()).toEqual([page]);
  await page.getByRole('button', { name: 'Zurück zum Training' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('forced-reference offers a neutral retry after an iframe load error', async ({ page }) => {
  await startStudyServer('forced-reference');
  await acceptConsent(page);
  await page.route(
    '**/reference/secaware/passwords-authentication/scormdriver/indexAPI.html?StandAlone=true',
    async (route) => {
      await route.fulfill({
        status: 503,
        json: { errorCode: 'reference-artifact-unavailable' },
      });
    },
    { times: 1 },
  );
  await submitPlaceholder(page);

  const courseIframe = page.getByTitle('Passwörter & Authentifizierung');
  await expect(courseIframe).toBeVisible();
  const originalIframe = await courseIframe.elementHandle();

  await expect(page.getByRole('alert')).toHaveText(
    'Training konnte nicht geladen werden.Erneut versuchen',
  );
  await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await expect(courseIframe).toBeVisible();
  expect(await originalIframe?.evaluate((element) => element.isConnected)).toBe(false);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('reload during the artifact marks the session incomplete and starts fresh', async ({
  page,
}) => {
  await startStudyServer('forced-supportive');
  const requests = captureResearchRequests(page);
  await acceptConsent(page);
  await submitPlaceholder(page);
  await enterSupportiveTraining(page, 'Nicht fortsetzen');
  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen', exact: true })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Speichern nicht möglich' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen', exact: true })).toBeVisible();
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
  await enterSupportiveTraining(page, 'Ende vor Reload');
  await completePasswordModule(page);
  await expect(page.getByRole('heading', { name: 'Fragebogen nach dem Artefakt' })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Willkommen', exact: true })).toBeVisible();
  expect(requests.paths.filter((path) => path.endsWith('/incomplete-reload'))).toHaveLength(0);
});
