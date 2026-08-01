import { fileURLToPath } from 'node:url';
import { expect, type Frame, type Page, test } from '@playwright/test';
import { buildStudyServer } from '../../apps/study-server/src/app.js';

type ForcedAssignmentMode = 'forced-supportive' | 'forced-reference';

interface CapturedTimingEvent {
  readonly sequence: number;
  readonly segmentId: string | null;
  readonly eventType: string;
}

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

function captureResearchWrites(page: Page) {
  const paths: string[] = [];
  const bodies: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (!path.startsWith('/api/study/')) return;
    paths.push(path);
    const body = request.postData();
    if (body !== null) bodies.push(body);
  });
  return { paths, bodies };
}

function timingEvents(bodies: readonly string[]): CapturedTimingEvent[] {
  return bodies.flatMap((body) => {
    const value: unknown = JSON.parse(body);
    if (
      typeof value === 'object' &&
      value !== null &&
      'sequence' in value &&
      typeof value.sequence === 'number' &&
      'segmentId' in value &&
      (typeof value.segmentId === 'string' || value.segmentId === null) &&
      'eventType' in value &&
      typeof value.eventType === 'string'
    ) {
      return [
        {
          sequence: value.sequence,
          segmentId: value.segmentId,
          eventType: value.eventType,
        },
      ];
    }
    return [];
  });
}

async function acceptConsentAndSubmitPre(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Ich bin mindestens 18 Jahre alt.').check();
  await page.getByLabel('Ich bin derzeit Mitglied einer Hochschule.').check();
  await page
    .getByLabel('Ich kann deutschsprachige Lernmaterialien und Fragebogenfragen sicher verstehen.')
    .check();
  await page.getByLabel('Ich habe die Teilnahmeinformationen gelesen und willige').check();
  await page.getByLabel('E-Mail-Adresse für die Nachbefragung').fill('participant@example.org');
  await page.getByRole('button', { name: 'Weiter zum Fragebogen' }).click();
  await page.getByLabel('Ich habe die Hinweise zu diesem Abschnitt gelesen.').check();
  await page.getByRole('button', { name: 'Antwort speichern' }).click();
}

async function beginArtifact(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Lernangebot beginnen' }).click();
}

async function completeSupportiveArtifact(page: Page): Promise<void> {
  await page.getByLabel('Dein Name').fill('Nur lokal');
  await page.getByRole('button', { name: 'Training starten' }).click();
  await page.getByLabel('Ich verwende nur ausgedachte Passwörter.').check();
  await page.getByRole('button', { name: 'Weiter' }).click();

  for (const [account, password] of [
    ['Master Campus', 'id!?'],
    ['Campus E-Mail', 'mail!?'],
    ['Campusgram', 'board!?'],
  ] as const) {
    await page.getByRole('tab', { name: account }).click();
    await page.getByLabel('Fiktives Passwort').fill(password);
    await page.getByRole('button', { name: 'Konto einrichten' }).click();
  }
  await page.getByRole('button', { name: 'Weiter' }).click();

  for (const account of [
    [
      'Campus E-Mail',
      ['Benachrichtigungen', 'Bestätigungen', 'Zurücksetzungslinks', 'Kommunikation in deinem Namen'],
    ],
    ['Campusgram', ['Direktnachrichten', 'Gruppen und Kontakte', 'Beiträge und Reaktionen']],
    ['Master Campus', ['Campus Workspace', 'Campus Services', 'Cloud Notes']],
  ] as const) {
    await page.getByRole('button', { name: new RegExp(`^${account[0]}\\.`) }).click();
    for (const detail of account[1]) {
      await page.getByRole('button', { name: new RegExp(`^${detail}\\.`) }).click();
    }
  }
  await page.getByRole('button', { name: 'Weiter' }).click();

  for (const account of ['Campusgram', 'Campus E-Mail', 'Master Campus'] as const) {
    await page.getByRole('tab', { name: account }).click();
    await page.getByRole('button', { name: 'Ich weiß es nicht mehr — weiter' }).click();
  }
  await page.locator('article[aria-labelledby="s03-page-title"]').getByRole('button', { name: 'Weiter' }).click();
}

async function referenceFrame(page: Page): Promise<Frame> {
  await page.waitForFunction(() =>
    window.frames.length > 1 &&
    [...document.querySelectorAll('iframe')].some((iframe) =>
      iframe.src.includes('/reference/secaware/passwords-authentication/'),
    ),
  );
  const frame = page
    .frames()
    .find((candidate) => candidate.url().includes('/reference/secaware/passwords-authentication/'));
  if (frame === undefined) throw new Error('reference-content-frame-missing');
  return frame;
}

async function finishStudy(page: Page): Promise<void> {
  await page.getByLabel('Ich habe die Hinweise zu diesem Abschnitt gelesen.').check();
  await page.getByRole('button', { name: 'Antwort speichern' }).click();
  await page.getByLabel('Ich habe die Hinweise zu diesem Abschnitt gelesen.').check();
  await page.getByRole('button', { name: 'Antwort speichern' }).click();
  await page.getByRole('button', { name: 'Debrief bestätigen' }).click();
}

test('supportive persists research writes through completion', async ({ page }) => {
  await startStudyServer('forced-supportive');
  const writes = captureResearchWrites(page);

  await acceptConsentAndSubmitPre(page);
  await beginArtifact(page);
  await completeSupportiveArtifact(page);
  await finishStudy(page);

  await expect.poll(() => writes.paths.some((path) => path.endsWith('/complete'))).toBe(true);
  expect(timingEvents(writes.bodies)).toEqual([
    { sequence: 0, segmentId: null, eventType: 'start' },
    { sequence: 1, segmentId: 'S00', eventType: 'start' },
    { sequence: 2, segmentId: 'S00', eventType: 'end' },
    { sequence: 3, segmentId: 'S01', eventType: 'start' },
    { sequence: 4, segmentId: 'S01', eventType: 'end' },
    { sequence: 5, segmentId: 'S02', eventType: 'start' },
    { sequence: 6, segmentId: 'S02', eventType: 'end' },
    { sequence: 7, segmentId: 'S03', eventType: 'start' },
    { sequence: 8, segmentId: 'S03', eventType: 'end' },
    { sequence: 9, segmentId: null, eventType: 'end' },
  ]);
});

test('reference persists research writes through completion', async ({ page }) => {
  await startStudyServer('forced-reference');
  const writes = captureResearchWrites(page);

  await acceptConsentAndSubmitPre(page);
  await beginArtifact(page);
  const frame = await referenceFrame(page);
  await frame.evaluate(() =>
    window.parent.postMessage(
      {
        type: 'passwo:reference-completed',
        snapshotId: 'secaware-passwords-authentication-2026-07-26',
      },
      window.location.origin,
    ),
  );
  await finishStudy(page);

  await expect.poll(() => writes.paths.some((path) => path.endsWith('/complete'))).toBe(true);
  expect(timingEvents(writes.bodies)).toEqual([
    { sequence: 0, segmentId: null, eventType: 'start' },
    { sequence: 1, segmentId: null, eventType: 'end' },
  ]);
});
