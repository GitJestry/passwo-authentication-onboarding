import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  followUpInstrument,
  liveQaFollowUpCaseResponseSchema,
  liveQaFollowUpMessagesResponseSchema,
  liveQaFollowUpVerificationResponseSchema,
  mainInstrumentBlocks,
  researchAnalysisResponseRecordSchema,
  researchAnalysisSessionRecordSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildStudyServer } from './app.js';
import { openStudyDatabase } from './database.js';
import { runFollowUpContactDeletion } from './followup-contact-deletion.js';
import {
  DryRunFollowUpMailTransport,
  FileFollowUpMailTransport,
  type FollowUpMailTransport,
  confirmFollowUpDelivery,
  runFollowUpScheduler,
} from './followup-operations.js';
import type { FollowUpDeliveryMessage } from './followup-message.js';
import { exportResearchData } from './research-export.js';
import {
  completeWebArtifact,
  createWebTestSession,
  deterministicTestRandomSource,
  submitWebInstrumentBlocks,
  validSubmission,
  webPost,
  type CreatedWebTestSession,
} from './test-support.js';

const servers: FastifyInstance[] = [];
const temporaryDirectories: string[] = [];
const referenceArtifactFixtureDirectory = fileURLToPath(
  new URL('./test-fixtures/reference-artifact/', import.meta.url),
);
const sender = { name: 'Synthetic Sender', address: 'sender@example.invalid' } as const;
const baseUrl = 'https://study.statisticslab.de/follow-up';

interface TemporaryDatabasePaths {
  readonly directory: string;
  readonly study: string;
  readonly recontact: string;
}

class RecordingDeliveredTransport implements FollowUpMailTransport {
  readonly messages: FollowUpDeliveryMessage[] = [];
  readonly #deliveredOperationIds = new Set<string>();

  async deliver(message: FollowUpDeliveryMessage): Promise<'delivered'> {
    if (!this.#deliveredOperationIds.has(message.operationId)) {
      this.#deliveredOperationIds.add(message.operationId);
      this.messages.push(message);
    }
    return 'delivered';
  }
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function temporaryDatabasePaths(): TemporaryDatabasePaths {
  const directory = mkdtempSync(join(tmpdir(), 'passwo-followup-operations-test-'));
  temporaryDirectories.push(directory);
  return {
    directory,
    study: join(directory, 'study.sqlite'),
    recontact: join(directory, 'recontact.sqlite'),
  };
}

function createServer(
  paths: TemporaryDatabasePaths,
  nowIso: () => string,
  tokens: string[],
): FastifyInstance {
  const server = buildStudyServer({
    version: '0.1.2',
    assignmentMode: 'permuted-block',
    databasePath: paths.study,
    recontactDatabasePath: paths.recontact,
    randomSource: deterministicTestRandomSource(),
    referenceArtifactDirectory: referenceArtifactFixtureDirectory,
    nowIso,
    createRecontactToken: () => {
      const token = tokens.shift();
      if (token === undefined) throw new Error('missing-synthetic-follow-up-token');
      return token;
    },
    webRuntime: {
      resumeCloseAtIso: '2026-09-30T12:00:00.000Z',
      secureCookies: false,
    },
  });
  servers.push(server);
  return server;
}

async function completeStudyWithDefinedBaseline(
  server: FastifyInstance,
  created: CreatedWebTestSession,
  intervalRequestId: string,
  firstSegmentEventIdentity: number,
): Promise<void> {
  const preBlocks = mainInstrumentBlocks.filter((block) => block.instrumentId === 'pre-v1');
  for (const block of preBlocks) {
    const request = validSubmission(block.instrumentId, block.sectionId);
    await webPost(
      server,
      created.cookie,
      `/api/study/sessions/${created.session.sessionId}/instrument-submissions`,
      {
        ...request,
        responses: request.responses.map((response) => {
          if (response.itemId === 'PRE_PM_USE') {
            return { ...response, value: ['separate_app_or_extension'] };
          }
          if (response.itemId === 'PRE_MFA_USE') return { ...response, value: 'few' };
          return response;
        }),
      },
    );
  }
  await completeWebArtifact(server, created, intervalRequestId, firstSegmentEventIdentity);
  await submitWebInstrumentBlocks(
    server,
    created.cookie,
    created.session.sessionId,
    mainInstrumentBlocks.slice(preBlocks.length),
  );
}

async function runScheduler(
  paths: TemporaryDatabasePaths,
  nowIso: string,
  transport: FollowUpMailTransport,
) {
  const database = openStudyDatabase(paths.study, paths.recontact);
  try {
    return await runFollowUpScheduler({ database, nowIso, baseUrl, sender, transport });
  } finally {
    database.close();
  }
}

function allExportContent(directory: string): string {
  return readdirSync(directory)
    .sort()
    .map((fileName) => readFileSync(join(directory, fileName), 'utf8'))
    .join('\n');
}

const validFollowUpSubmission = (token: string) => ({
  token,
  voluntaryConfirmation: true,
  responses: [
    { itemId: 'FU_REUSE_REPLACED', value: 'no' },
    { itemId: 'FU_PM_ACCOUNT_SPECIFIC', value: 'yes' },
    { itemId: 'FU_MFA_ENABLED', value: 'unsure' },
    { itemId: 'FU_REUSE_REPLACED_REASON', value: 'no_opportunity' },
    { itemId: 'FU_PM_ACCOUNT_SPECIFIC_REASON', value: null },
    { itemId: 'FU_MFA_ENABLED_REASON', value: null },
  ],
});

describe('follow-up operations and research linkage', () => {
  it('keeps follow-up QA controls unavailable in a normal web runtime', async () => {
    const paths = temporaryDatabasePaths();
    const server = createServer(paths, () => '2026-07-24T12:00:00.000Z', []);
    const response = await server.inject({
      method: 'POST',
      url: '/api/qa/follow-up/messages',
      payload: {},
    });
    expect(response.statusCode).toBe(404);
  });

  it('prepares and verifies one fully linked follow-up in the existing in-memory QA runtime', async () => {
    const nowIso = '2026-08-30T12:00:00.000Z';
    const rawToken = 'Q'.repeat(43);
    const server = buildStudyServer({
      version: '0.1.2-qa-supportive',
      assignmentMode: 'forced-supportive',
      databasePath: ':memory:',
      recontactDatabasePath: ':memory:',
      randomSource: deterministicTestRandomSource(),
      referenceArtifactDirectory: referenceArtifactFixtureDirectory,
      nowIso: () => nowIso,
      createRecontactToken: () => rawToken,
      webRuntime: {
        resumeCloseAtIso: '2026-09-30T12:00:00.000Z',
        secureCookies: false,
        qaControlsEnabled: true,
      },
    });
    servers.push(server);

    const messages = liveQaFollowUpMessagesResponseSchema.parse(
      (await webPost(server, null, '/api/qa/follow-up/messages', {})).json(),
    );
    expect(messages.invitation).toMatchObject({
      sender: { name: 'Julian Meyer', address: 's27jmeye@uni-bonn.de' },
      recipient: 'follow-up-qa@example.invalid',
      subject: followUpInstrument.email.subject,
    });
    expect(messages.reminder.sender).toEqual({
      name: 'Julian Meyer',
      address: 's27jmeye@uni-bonn.de',
    });
    expect(messages.reminder.subject).toBe(followUpInstrument.reminderEmail.subject);
    expect(messages.invitation.text).not.toMatch(/\[(?:TOKEN_LINK|STICHTAG|CLOSES_AT)\]/u);
    expect(messages.reminder.text).not.toMatch(/\[(?:TOKEN_LINK|STICHTAG|CLOSES_AT)\]/u);

    const created = await createWebTestSession(server, 799, true, 'qa');
    await completeStudyWithDefinedBaseline(
      server,
      created,
      '81000000-0000-4000-8000-000000000799',
      799,
    );
    const notYetOpen = liveQaFollowUpCaseResponseSchema.parse(
      (
        await webPost(server, created.cookie, '/api/qa/follow-up/case', {
          sessionId: created.session.sessionId,
          scenario: 'not-yet-open',
        })
      ).json(),
    );
    expect(notYetOpen.access).toMatchObject({ status: 'not-yet-open' });

    const expired = liveQaFollowUpCaseResponseSchema.parse(
      (
        await webPost(server, created.cookie, '/api/qa/follow-up/case', {
          sessionId: created.session.sessionId,
          scenario: 'expired',
        })
      ).json(),
    );
    expect(expired.access).toEqual({ status: 'expired' });

    const prepared = liveQaFollowUpCaseResponseSchema.parse(
      (
        await webPost(server, created.cookie, '/api/qa/follow-up/case', {
          sessionId: created.session.sessionId,
          scenario: 'available',
        })
      ).json(),
    );
    expect(prepared).toMatchObject({ token: rawToken, access: { status: 'available' } });
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: prepared.token })).json(),
    ).toMatchObject({ status: 'available' });

    const submission = validFollowUpSubmission(prepared.token);
    await webPost(server, null, '/api/follow-up/submissions', submission);
    await webPost(
      server,
      null,
      '/api/follow-up/submissions',
      {
        ...submission,
        responses: submission.responses.map((response) =>
          response.itemId === 'FU_MFA_ENABLED' ? { ...response, value: 'yes' } : response,
        ),
      },
      409,
    );
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: prepared.token })).json(),
    ).toEqual({ status: 'submitted' });
    const verification = liveQaFollowUpVerificationResponseSchema.parse(
      (
        await webPost(server, null, '/api/qa/follow-up/verification', {
          token: prepared.token,
        })
      ).json(),
    );
    expect(verification).toEqual({
      researchId: prepared.researchId,
      status: 'submitted',
      storedResponseCount: 6,
      linkedToMainCase: true,
      reminderEligible: false,
    });
  });

  it('links token, registration, main responses and follow-up responses only through one researchId', async () => {
    const paths = temporaryDatabasePaths();
    let nowIso = '2026-07-24T12:00:00.000Z';
    const rawToken = 'L'.repeat(43);
    const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');
    const syntheticEmail = 'web-participant-701@example.org';
    const recontactRequestId = '40000000-0000-4000-8000-000000000701';
    const server = createServer(paths, () => nowIso, [rawToken]);
    const created = await createWebTestSession(server, 701, true);
    await completeStudyWithDefinedBaseline(
      server,
      created,
      '81000000-0000-4000-8000-000000000701',
      701,
    );

    nowIso = '2026-08-03T11:59:59.999Z';
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: rawToken })).json(),
    ).toEqual({
      status: 'not-yet-open',
      opensAtIso: '2026-08-03T12:00:00.000Z',
    });
    expect(await runScheduler(paths, nowIso, new DryRunFollowUpMailTransport())).toMatchObject({
      dueCount: 0,
      sentMarkerCount: 0,
    });

    nowIso = '2026-08-03T12:00:00.000Z';
    const deliveredTransport = new RecordingDeliveredTransport();
    expect(await runScheduler(paths, nowIso, deliveredTransport)).toEqual({
      dueCount: 1,
      deliveredCount: 1,
      preparedCount: 0,
      dryRunCount: 0,
      sentMarkerCount: 1,
    });
    expect(deliveredTransport.messages).toHaveLength(1);
    const invitation = deliveredTransport.messages[0];
    if (invitation === undefined) throw new Error('missing-synthetic-invitation');
    const invitationUrl = new URL(invitation.tokenLink);
    const linkToken = invitationUrl.searchParams.get('token');
    expect(invitationUrl.origin).toBe('https://study.statisticslab.de');
    expect(invitationUrl.pathname).toBe('/follow-up');
    expect(invitation.text).toContain('Zur freiwilligen Nachbefragung:');
    expect(linkToken).toBe(rawToken);

    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: linkToken })).json(),
    ).toEqual({
      status: 'available',
      reportingCutoffAtIso: nowIso,
      closesAtIso: '2026-08-07T12:00:00.000Z',
    });

    const conditionalReason = followUpInstrument.questionnaire.items.find(
      (item) => item.id === 'FU_REUSE_REPLACED_REASON',
    );
    expect(conditionalReason).toMatchObject({
      displayWhen: { itemId: 'FU_REUSE_REPLACED', equals: 'no' },
    });
    await webPost(
      server,
      null,
      '/api/follow-up/submissions',
      {
        ...validFollowUpSubmission(rawToken),
        responses: validFollowUpSubmission(rawToken).responses.map((response) =>
          response.itemId === 'FU_REUSE_REPLACED' ? { ...response, value: 'yes' } : response,
        ),
      },
      400,
    );

    const submission = validFollowUpSubmission(rawToken);
    expect((await webPost(server, null, '/api/follow-up/submissions', submission)).json()).toEqual({
      submitted: true,
    });
    expect((await webPost(server, null, '/api/follow-up/submissions', submission)).json()).toEqual({
      submitted: true,
    });
    await webPost(
      server,
      null,
      '/api/follow-up/submissions',
      {
        ...submission,
        responses: submission.responses.map((response) =>
          response.itemId === 'FU_MFA_ENABLED' ? { ...response, value: 'yes' } : response,
        ),
      },
      409,
    );
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: rawToken })).json(),
    ).toEqual({
      status: 'submitted',
    });
    expect(await runScheduler(paths, '2026-08-05T12:00:00.000Z', deliveredTransport)).toMatchObject(
      { dueCount: 0, deliveredCount: 0, sentMarkerCount: 0 },
    );

    const linkageDatabase = openStudyDatabase(paths.study, paths.recontact);
    const linkage = z
      .object({
        researchId: z.string(),
        sessionId: z.string(),
        condition: z.enum(['supportive', 'reference']),
        baselineCount: z.number().int(),
        followUpCount: z.number().int(),
      })
      .parse(
        linkageDatabase
          .prepare(
            `SELECT
              session.research_code AS researchId,
              session.session_id AS sessionId,
              session.condition,
              (
                SELECT COUNT(*) FROM responses AS baseline
                WHERE baseline.session_id = session.session_id
                  AND baseline.item_id IN ('PRE_PM_USE', 'PRE_MFA_USE')
              ) AS baselineCount,
              (
                SELECT COUNT(*) FROM responses AS follow_up
                WHERE follow_up.session_id = session.session_id
                  AND follow_up.instrument_id = 'follow-up-v1'
              ) AS followUpCount
             FROM recontact.registrations AS registration
             INNER JOIN study_sessions AS session
               ON session.session_id = registration.session_id
              AND session.follow_up_token_hash = registration.token_hash
             WHERE registration.token_hash = ?`,
          )
          .get(tokenHash),
      );
    linkageDatabase.close();
    expect(linkage).toMatchObject({
      sessionId: created.session.sessionId,
      condition: created.session.condition,
      baselineCount: 2,
      followUpCount: 6,
    });

    const exportDirectory = join(paths.directory, 'analysis-before-contact-deletion');
    exportResearchData({
      databasePath: paths.study,
      outputDirectory: exportDirectory,
      exportedAtIso: '2026-08-05T12:00:00.000Z',
      profile: 'analysis',
    });
    const sessions = z
      .array(researchAnalysisSessionRecordSchema)
      .parse(JSON.parse(readFileSync(join(exportDirectory, 'sessions.json'), 'utf8')));
    const responses = z
      .array(researchAnalysisResponseRecordSchema)
      .parse(JSON.parse(readFileSync(join(exportDirectory, 'responses.json'), 'utf8')));
    expect(sessions).toHaveLength(1);
    const exportedSession = sessions[0];
    if (exportedSession === undefined) throw new Error('missing-synthetic-analysis-session');
    expect(exportedSession.condition).toBe(created.session.condition);
    expect(exportedSession.researchId).toBe(linkage.researchId);
    expect(exportedSession.assignmentMode).toBe('permuted-block');
    expect(exportedSession.followUpConsent).toBe(true);

    const linkedRows = responses.filter((response) =>
      [
        'PRE_PM_USE',
        'PRE_MFA_USE',
        'FU_REUSE_REPLACED',
        'FU_PM_ACCOUNT_SPECIFIC',
        'FU_MFA_ENABLED',
      ].includes(response.itemId),
    );
    expect(linkedRows).toHaveLength(5);
    expect(new Set(responses.map((response) => response.researchId))).toEqual(
      new Set([exportedSession.researchId]),
    );
    const followUpRows = responses.filter((response) => response.instrumentId === 'follow-up-v1');
    expect(followUpRows.map((response) => response.itemId).sort()).toEqual(
      [
        'FU_REUSE_REPLACED',
        'FU_PM_ACCOUNT_SPECIFIC',
        'FU_MFA_ENABLED',
        'FU_REUSE_REPLACED_REASON',
        'FU_PM_ACCOUNT_SPECIFIC_REASON',
        'FU_MFA_ENABLED_REASON',
      ].sort(),
    );
    expect(new Set(followUpRows.map((response) => response.researchId))).toEqual(
      new Set([exportedSession.researchId]),
    );
    expect(linkedRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          researchId: exportedSession.researchId,
          itemId: 'PRE_PM_USE',
          value: ['separate_app_or_extension'],
        }),
        expect.objectContaining({
          researchId: exportedSession.researchId,
          itemId: 'PRE_MFA_USE',
          value: 'few',
        }),
        expect.objectContaining({
          researchId: exportedSession.researchId,
          instrumentId: 'follow-up-v1',
          itemId: 'FU_REUSE_REPLACED',
          value: 'no',
        }),
        expect.objectContaining({
          researchId: exportedSession.researchId,
          instrumentId: 'follow-up-v1',
          itemId: 'FU_PM_ACCOUNT_SPECIFIC',
          value: 'yes',
        }),
        expect.objectContaining({
          researchId: exportedSession.researchId,
          instrumentId: 'follow-up-v1',
          itemId: 'FU_MFA_ENABLED',
          value: 'unsure',
        }),
      ]),
    );

    const exportedContent = allExportContent(exportDirectory);
    for (const forbiddenValue of [
      syntheticEmail,
      rawToken,
      tokenHash,
      recontactRequestId,
      created.session.sessionId,
    ]) {
      expect(exportedContent).not.toContain(forbiddenValue);
    }

    await server.close();
    servers.splice(servers.indexOf(server), 1);
    expect(
      runFollowUpContactDeletion({
        databasePath: paths.recontact,
        mode: 'delete',
        nowIso: '2026-08-07T12:00:00.000Z',
      }),
    ).toMatchObject({ contactCountBefore: 1, contactCountAfter: 0 });
    const exportAfterDeletion = join(paths.directory, 'analysis-after-contact-deletion');
    exportResearchData({
      databasePath: paths.study,
      outputDirectory: exportAfterDeletion,
      exportedAtIso: '2026-08-07T12:00:00.000Z',
      profile: 'analysis',
    });
    expect(readFileSync(join(exportAfterDeletion, 'sessions.json'), 'utf8')).toBe(
      readFileSync(join(exportDirectory, 'sessions.json'), 'utf8'),
    );
    expect(readFileSync(join(exportAfterDeletion, 'responses.json'), 'utf8')).toBe(
      readFileSync(join(exportDirectory, 'responses.json'), 'utf8'),
    );
  });

  it('allows no-consent deliveries never and an unanswered follow-up reminder exactly once', async () => {
    const paths = temporaryDatabasePaths();
    let nowIso = '2026-07-24T12:00:00.000Z';
    const rawToken = 'R'.repeat(43);
    const server = createServer(paths, () => nowIso, [rawToken]);
    const consented = await createWebTestSession(server, 702, true);
    const noConsent = await createWebTestSession(server, 703, false);
    await completeStudyWithDefinedBaseline(
      server,
      consented,
      '81000000-0000-4000-8000-000000000702',
      1_702,
    );
    await completeStudyWithDefinedBaseline(
      server,
      noConsent,
      '81000000-0000-4000-8000-000000000703',
      2_703,
    );

    const transport = new RecordingDeliveredTransport();
    expect(await runScheduler(paths, '2026-08-03T11:59:59.999Z', transport)).toMatchObject({
      dueCount: 0,
    });
    nowIso = '2026-08-03T12:00:00.000Z';
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: rawToken })).json(),
    ).toEqual({ status: 'not-yet-open', opensAtIso: nowIso });
    nowIso = '2026-08-03T13:00:00.000Z';
    expect(await runScheduler(paths, nowIso, transport)).toMatchObject({
      dueCount: 1,
      deliveredCount: 1,
      sentMarkerCount: 1,
    });
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: rawToken })).json(),
    ).toMatchObject({
      status: 'available',
      reportingCutoffAtIso: nowIso,
    });
    expect(await runScheduler(paths, nowIso, transport)).toMatchObject({
      dueCount: 0,
      deliveredCount: 0,
    });
    expect(transport.messages.map((message) => message.kind)).toEqual(['first-invitation']);

    nowIso = '2026-08-05T12:59:59.999Z';
    expect(await runScheduler(paths, nowIso, transport)).toMatchObject({ dueCount: 0 });
    nowIso = '2026-08-05T13:00:00.000Z';
    expect(await runScheduler(paths, nowIso, transport)).toMatchObject({
      dueCount: 1,
      deliveredCount: 1,
      sentMarkerCount: 1,
    });
    expect(await runScheduler(paths, nowIso, transport)).toMatchObject({ dueCount: 0 });
    expect(transport.messages.map((message) => message.kind)).toEqual([
      'first-invitation',
      'reminder',
    ]);

    const recontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(
      recontactDatabase
        .prepare(
          `SELECT COUNT(*) AS count
           FROM registrations
           WHERE first_invitation_sent_at_iso IS NOT NULL
             AND reminder_sent_at_iso IS NOT NULL`,
        )
        .get(),
    ).toEqual({ count: 1 });
    expect(recontactDatabase.prepare('SELECT COUNT(*) AS count FROM registrations').get()).toEqual({
      count: 1,
    });
    recontactDatabase.close();

    nowIso = '2026-08-07T12:00:00.000Z';
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: rawToken })).json(),
    ).toEqual({
      status: 'expired',
    });
    await webPost(
      server,
      null,
      '/api/follow-up/submissions',
      validFollowUpSubmission(rawToken),
      410,
    );
    const unknownToken = 'U'.repeat(43);
    expect(
      (await webPost(server, null, '/api/follow-up/access', { token: unknownToken })).json(),
    ).toEqual({
      status: 'invalid',
    });
    await webPost(
      server,
      null,
      '/api/follow-up/submissions',
      validFollowUpSubmission(unknownToken),
      404,
    );
    expect(await runScheduler(paths, nowIso, transport)).toMatchObject({ dueCount: 0 });
  });

  it('keeps dry-run and protected file preparation non-sending and idempotent', async () => {
    const paths = temporaryDatabasePaths();
    const rawToken = 'F'.repeat(43);
    const server = createServer(paths, () => '2026-07-24T12:00:00.000Z', [rawToken]);
    const created = await createWebTestSession(server, 704, true);
    await completeStudyWithDefinedBaseline(
      server,
      created,
      '81000000-0000-4000-8000-000000000704',
      3_704,
    );
    const dueAtIso = '2026-08-03T12:00:00.000Z';
    expect(await runScheduler(paths, dueAtIso, new DryRunFollowUpMailTransport())).toMatchObject({
      dueCount: 1,
      dryRunCount: 1,
      sentMarkerCount: 0,
    });

    const outputDirectory = join(paths.directory, 'protected-outbox');
    const transport = new FileFollowUpMailTransport(outputDirectory);
    expect(await runScheduler(paths, dueAtIso, transport)).toMatchObject({
      dueCount: 1,
      preparedCount: 1,
      sentMarkerCount: 0,
    });
    expect(await runScheduler(paths, dueAtIso, transport)).toMatchObject({
      dueCount: 1,
      preparedCount: 1,
      sentMarkerCount: 0,
    });
    const outputFiles = readdirSync(outputDirectory);
    expect(outputFiles).toHaveLength(1);
    const outputFile = outputFiles[0];
    if (outputFile === undefined) throw new Error('missing-synthetic-file-message');
    expect(statSync(outputDirectory).mode & 0o777).toBe(0o700);
    expect(statSync(join(outputDirectory, outputFile)).mode & 0o777).toBe(0o600);

    const operationId = outputFile.replace(/\.json$/u, '');
    const operationsDatabase = openStudyDatabase(paths.study, paths.recontact);
    expect(
      confirmFollowUpDelivery({
        database: operationsDatabase,
        operationId,
        nowIso: dueAtIso,
        mode: 'dry-run',
      }),
    ).toBe('eligible');
    expect(
      confirmFollowUpDelivery({
        database: operationsDatabase,
        operationId,
        nowIso: dueAtIso,
        mode: 'confirm',
      }),
    ).toBe('confirmed');
    expect(
      confirmFollowUpDelivery({
        database: operationsDatabase,
        operationId,
        nowIso: dueAtIso,
        mode: 'confirm',
      }),
    ).toBe('already-confirmed');
    operationsDatabase.close();

    const recontactDatabase = new Database(paths.recontact, { readonly: true });
    expect(
      recontactDatabase
        .prepare(
          `SELECT first_invitation_sent_at_iso AS firstInvitationSentAtIso
           FROM registrations`,
        )
        .get(),
    ).toEqual({ firstInvitationSentAtIso: dueAtIso });
    recontactDatabase.close();
  });
});
