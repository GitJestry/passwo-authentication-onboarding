import { fileURLToPath } from 'node:url';
import {
  artifactIntervalStartResponseSchema,
  confirmArtifactCheckpointResponseSchema,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  mainInstrumentBlocks,
  sessionStatusResponseSchema,
  SUPPORTIVE_ARTIFACT_SEGMENT_IDS,
  SUPPORTIVE_POST_S08_SEGMENT_IDS,
  supportiveS08ResumeStateSchema,
  WEB_STUDY_REQUEST_HEADER,
  WEB_STUDY_REQUEST_HEADER_VALUE,
  webCreateSessionResponseSchema,
  webResumeResponseSchema,
  type InstrumentResponseValue,
  type InstrumentRuntimeItem,
  type InstrumentSubmissionBlock,
} from '@passwo/contracts';
import { expect, type Page, test } from '@playwright/test';
import { buildStudyServer } from '../../apps/study-server/src/app.js';

type ForcedAssignmentMode = 'forced-supportive' | 'forced-reference';

let studyServer: ReturnType<typeof buildStudyServer> | null = null;
const referenceArtifactDirectory = fileURLToPath(
  new URL(
    '../../research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/',
    import.meta.url,
  ),
);

const writeHeaders = {
  'content-type': 'application/json',
  [WEB_STUDY_REQUEST_HEADER]: WEB_STUDY_REQUEST_HEADER_VALUE,
} as const;
const supportiveS08ResumeState = supportiveS08ResumeStateSchema.parse({
  schemaVersion: 'supportive-s08-resume-v1',
  passphraseIds: {
    campusgram: 'passphrase-01-hyphen',
    masterCampus: 'passphrase-02-hyphen',
    campusEmail: 'passphrase-03-hyphen',
  },
  weakAccountIds: [],
  relationships: [],
});

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.afterEach(async () => {
  if (studyServer !== null) {
    await studyServer.close();
    studyServer = null;
  }
});

async function startStudyServer(assignmentMode: ForcedAssignmentMode): Promise<void> {
  studyServer = buildStudyServer({
    version: '0.1.2-full-flow-e2e',
    assignmentMode,
    databasePath: ':memory:',
    recontactDatabasePath: ':memory:',
    referenceArtifactDirectory,
    webRuntime: {
      resumeCloseAtIso: '2099-01-01T00:00:00.000Z',
      secureCookies: false,
    },
  });
  await studyServer.listen({ host: '127.0.0.1', port: 4174 });
}

function validValue(item: InstrumentRuntimeItem): InstrumentResponseValue {
  if (item.type === 'integer') return item.min ?? 0;
  if (item.type === 'scale') {
    const scales: Readonly<Record<string, { readonly min: number; readonly max: number }>> =
      instrumentRuntimeManifest.scales;
    const scale = item.scale === undefined ? undefined : scales[item.scale];
    if (scale === undefined) throw new Error(`missing-scale-${item.id}`);
    return Math.floor((scale.min + scale.max) / 2);
  }
  if (item.type === 'semanticDifferential') {
    const scale = instrumentRuntimeManifest.scales.ueqSemanticDifferential7;
    return Math.floor((scale.min + scale.max) / 2);
  }
  if (item.type === 'text') return null;
  const optionId = item.options?.[0]?.id;
  if (optionId === undefined) throw new Error(`missing-option-${item.id}`);
  return item.type === 'multiChoice' ? [optionId] : optionId;
}

function validSubmission(block: InstrumentSubmissionBlock) {
  return instrumentSubmissionRequestSchema.parse({
    instrumentId: block.instrumentId,
    sectionId: block.sectionId,
    responses: block.items.map((item) => ({ itemId: item.id, value: validValue(item) })),
  });
}

function apiUrl(page: Page, path: string): string {
  return new URL(path, page.url()).toString();
}

async function postStudy(page: Page, path: string, body: unknown): Promise<unknown> {
  const response = await page.context().request.post(apiUrl(page, path), {
    headers: writeHeaders,
    data: body,
  });
  const responseBody: unknown = await response.json().catch(() => null);
  expect(response.ok(), `${path}: ${JSON.stringify(responseBody)}`).toBe(true);
  return responseBody;
}

async function createSessionThroughUi(page: Page) {
  await page.goto('/');
  await page.getByLabel('Ich bin mindestens 18 Jahre alt.').check();
  await page.getByLabel('Ich bin derzeit Mitglied einer Hochschule.').check();
  await page
    .getByLabel(
      'Ich kann deutschsprachige Lernmaterialien und Fragebogenfragen ausreichend verstehen.',
    )
    .check();
  await page
    .getByRole('group', { name: 'Einwilligung in die Hauptstudie' })
    .getByRole('checkbox')
    .check();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/study/sessions',
  );
  await page.getByRole('button', { name: 'Teilnahme beginnen' }).click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  return webCreateSessionResponseSchema.parse(await response.json());
}

async function submitBlocks(
  page: Page,
  sessionId: string,
  blocks: readonly InstrumentSubmissionBlock[],
): Promise<void> {
  for (const block of blocks) {
    await postStudy(
      page,
      `/api/study/sessions/${sessionId}/instrument-submissions`,
      validSubmission(block),
    );
  }
}

async function startArtifactWithoutNavigation(page: Page, sessionId: string) {
  return artifactIntervalStartResponseSchema.parse(
    await postStudy(page, `/api/study/sessions/${sessionId}/artifact-intervals`, {
      requestId: crypto.randomUUID(),
    }),
  );
}

async function advanceSupportiveArtifactToS17(
  page: Page,
  sessionId: string,
  intervalId: string,
): Promise<void> {
  let elapsedMs = 1;
  for (const segmentId of SUPPORTIVE_ARTIFACT_SEGMENT_IDS) {
    await postStudy(page, `/api/study/sessions/${sessionId}/segment-timing`, {
      eventId: crypto.randomUUID(),
      intervalId,
      segmentId,
      eventType: 'segment-start',
      elapsedMs: null,
    });
    elapsedMs += 1;
    await postStudy(page, `/api/study/sessions/${sessionId}/segment-timing`, {
      eventId: crypto.randomUUID(),
      intervalId,
      segmentId,
      eventType: 'segment-end',
      elapsedMs,
    });
  }

  const s08Checkpoint = confirmArtifactCheckpointResponseSchema.parse(
    await postStudy(page, `/api/study/sessions/${sessionId}/artifact-checkpoint`, {
      intervalId,
      checkpoint: 'supportive:S08',
      resumeState: supportiveS08ResumeState,
    }),
  );
  expect(s08Checkpoint.checkpoint).toBe('supportive:S08');

  for (const segmentId of SUPPORTIVE_POST_S08_SEGMENT_IDS) {
    const checkpoint = `supportive:${segmentId}` as const;
    const response = confirmArtifactCheckpointResponseSchema.parse(
      await postStudy(page, `/api/study/sessions/${sessionId}/artifact-checkpoint`, {
        intervalId,
        checkpoint,
      }),
    );
    expect(response.checkpoint).toBe(checkpoint);
  }
}

async function skipReferenceArtifact(
  page: Page,
  sessionId: string,
  intervalId: string,
): Promise<void> {
  await postStudy(page, `/api/study/sessions/${sessionId}/artifact-checkpoint`, {
    intervalId,
    checkpoint: 'reference:mfa',
  });
  await postStudy(page, `/api/study/sessions/${sessionId}/artifact-intervals/end`, {
    intervalId,
    elapsedMs: 1,
  });
}

async function expectServerCompletion(page: Page, sessionId: string): Promise<void> {
  const response = await page.context().request.get(
    apiUrl(page, `/api/study/sessions/${sessionId}/status`),
  );
  expect(response.ok()).toBe(true);
  expect(sessionStatusResponseSchema.parse(await response.json()).completionStatus).toBe(
    'completed',
  );
}

async function completeSupportiveFromS17Resume(page: Page, sessionId: string): Promise<void> {
  const resumeResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/study/session/resume',
  );
  const intervalResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname ===
        `/api/study/sessions/${sessionId}/artifact-intervals`,
  );
  await page.reload();

  const resumeResponse = await resumeResponsePromise;
  expect(resumeResponse.ok()).toBe(true);
  const resumed = webResumeResponseSchema.parse(await resumeResponse.json()).session;
  expect(resumed).toMatchObject({
    sessionId,
    checkpoint: 'supportive:S17',
    resumeTarget: 'artifact',
    interrupted: true,
    supportiveS08ResumeState,
  });

  const intervalResponse = await intervalResponsePromise;
  expect(intervalResponse.ok()).toBe(true);
  expect(artifactIntervalStartResponseSchema.parse(await intervalResponse.json())).toMatchObject({
    checkpoint: 'supportive:S17',
    interrupted: true,
  });

  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  const completeCheckpointResponsePromise = page.waitForResponse((response) => {
    if (
      response.request().method() !== 'POST' ||
      new URL(response.url()).pathname !==
        `/api/study/sessions/${sessionId}/artifact-checkpoint`
    ) {
      return false;
    }
    const requestBody: unknown = response.request().postDataJSON();
    return (
      typeof requestBody === 'object' &&
      requestBody !== null &&
      'checkpoint' in requestBody &&
      requestBody.checkpoint === 'supportive:complete'
    );
  });
  const intervalEndResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname ===
        `/api/study/sessions/${sessionId}/artifact-intervals/end`,
  );
  await page.getByRole('button', { name: 'Training abschließen' }).click();

  const completeCheckpointResponse = await completeCheckpointResponsePromise;
  expect(completeCheckpointResponse.ok()).toBe(true);
  expect(
    confirmArtifactCheckpointResponseSchema.parse(await completeCheckpointResponse.json())
      .checkpoint,
  ).toBe('supportive:complete');
  expect((await intervalEndResponsePromise).ok()).toBe(true);
}

for (const assignmentMode of ['forced-supportive', 'forced-reference'] as const) {
  const expectedCondition = assignmentMode === 'forced-supportive' ? 'supportive' : 'reference';

  test(`${expectedCondition} completes the study with a bounded artifact smoke`, async ({
    page,
  }) => {
    await startStudyServer(assignmentMode);
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const session = await createSessionThroughUi(page);
    expect(session.condition).toBe(expectedCondition);

    await submitBlocks(
      page,
      session.sessionId,
      mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1'),
    );
    await page.reload();
    await expect(page.getByRole('button', { name: 'Lernangebot beginnen' })).toBeVisible();

    const artifact = await startArtifactWithoutNavigation(page, session.sessionId);
    if (expectedCondition === 'supportive') {
      await advanceSupportiveArtifactToS17(page, session.sessionId, artifact.intervalId);
      await completeSupportiveFromS17Resume(page, session.sessionId);
    } else {
      await skipReferenceArtifact(page, session.sessionId, artifact.intervalId);
    }

    await submitBlocks(
      page,
      session.sessionId,
      mainInstrumentBlocks.filter((block) => block.instrumentId !== 'pre-v1'),
    );

    await expectServerCompletion(page, session.sessionId);
    expect(pageErrors).toEqual([]);
  });
}
