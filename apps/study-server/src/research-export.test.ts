import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  instrumentRuntimeManifest,
  mainInstrumentBlocks,
  researchAnalysisResponseRecordSchema,
  researchAnalysisSessionRecordSchema,
} from '@passwo/contracts';
import Database from 'better-sqlite3';
import ExcelJS from 'exceljs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { buildStudyServer } from './app.js';
import { exportResearchData } from './research-export.js';
import {
  completeWebTestStudy,
  createSession,
  createTestResourceScope,
  createWebTestSession,
  deterministicTestRandomSource,
  savePreAndStartArtifact,
} from './test-support.js';

const resources = createTestResourceScope();

afterEach(() => resources.cleanup());

describe('research export', () => {
  it('exports the approved tables and excludes private training data', async () => {
    const temporaryDirectory = resources.createTemporaryDirectory('passwo-research-export-');
    const databasePath = join(temporaryDirectory, 'study.sqlite');
    const recontactDatabasePath = join(temporaryDirectory, 'recontact.sqlite');
    const rawToken = 'D'.repeat(43);
    const server = buildStudyServer({
      version: '0.1.2',
      assignmentMode: 'forced-supportive',
      databasePath,
      recontactDatabasePath,
      nowIso: () => '2026-07-24T12:00:00.000Z',
      createRecontactToken: () => rawToken,
    });
    resources.track(server);
    const session = await createSession(server, 1, false, true);
    expect(
      (
        await server.inject({
          method: 'POST',
          url: `/api/study/sessions/${session.sessionId}/recontact`,
          payload: {
            requestId: 'f5d74d44-f700-4dc7-ac00-5e251a8890c3',
            email: 'private@example.org',
          },
        })
      ).statusCode,
    ).toBe(200);
    await savePreAndStartArtifact(server, session.sessionId);

    const outputDirectory = join(temporaryDirectory, 'export');
    const result = await exportResearchData({
      databasePath,
      outputDirectory,
      exportedAtIso: '2026-07-25T10:00:00.000Z',
    });
    const exportedData = [
      readFileSync(join(outputDirectory, 'sessions.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'timing.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'responses.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'response-presentations.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'data-dictionary.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'export-guide.csv'), 'utf8'),
      readFileSync(join(outputDirectory, 'sessions.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'timing.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'responses.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'response-presentations.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'data-dictionary.json'), 'utf8'),
      readFileSync(join(outputDirectory, 'export-guide.json'), 'utf8'),
    ].join('\n');

    expect([...result.files].sort()).toEqual(
      [
        'sessions.csv',
        'timing.csv',
        'responses.csv',
        'response-presentations.csv',
        'data-dictionary.csv',
        'export-guide.csv',
        'sessions.json',
        'timing.json',
        'responses.json',
        'response-presentations.json',
        'data-dictionary.json',
        'export-guide.json',
        'study-export.xlsx',
        'manifest.json',
      ].sort(),
    );
    expect(readFileSync(join(outputDirectory, 'sessions.csv'), 'utf8')).toMatch(
      /^researchId,recruitmentSource,condition,assignmentMode,studyVersion,contentVersion/u,
    );
    expect(readFileSync(join(outputDirectory, 'sessions.json'), 'utf8')).toContain(
      '"recruitmentSource": "ub"',
    );
    expect(exportedData).not.toMatch(
      /display.?name|password.?value|password.?input|password.?part|password.?score|password.?classification|training.?input|request.?body|user.?agent|ip.?address|email.?address|secaware.?quiz/iu,
    );
    expect(exportedData).not.toMatch(
      /[{"\n,](?:sessionId|participantCode|deletionCode|deletionCodeHash|email|rawToken|followUpTokenHash)[",:]/u,
    );
    expect(exportedData).not.toContain(session.sessionId);
    expect(exportedData).not.toContain('1'.padStart(64, '0'));
    expect(exportedData).not.toContain('private@example.org');
    expect(exportedData).not.toContain(rawToken);
    expect(exportedData).not.toContain(createHash('sha256').update(rawToken, 'utf8').digest('hex'));
    expect(existsSync(databasePath)).toBe(true);
    expect(existsSync(recontactDatabasePath)).toBe(true);
    expect(readFileSync(join(outputDirectory, 'response-presentations.json'), 'utf8')).toContain(
      '"displayedOptionIds"',
    );
    expect(readFileSync(join(outputDirectory, 'data-dictionary.json'), 'utf8')).toContain(
      '"itemId": "MR_DISTINCT_PASSWORDS"',
    );
    expect(readFileSync(join(outputDirectory, 'data-dictionary.json'), 'utf8')).toContain(
      '"optionClassification": "appropriate"',
    );
    expect(readFileSync(join(outputDirectory, 'data-dictionary.json'), 'utf8')).toMatch(
      /"itemId": "PRE_AGE"[^}]*"measurementLevel": "ordinal"/u,
    );
    expect(readFileSync(join(outputDirectory, 'export-guide.json'), 'utf8')).toContain(
      '"entryId": "score-boundaries"',
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(join(outputDirectory, 'study-export.xlsx'));
    expect(workbook.worksheets.map((worksheet) => worksheet.name)).toEqual([
      'Hinweise',
      'Sitzungen',
      'Timing',
      'Antworten',
      'Präsentationen',
      'Variablen',
    ]);
    expect(JSON.stringify(workbook.model)).not.toMatch(
      /display.?name|password.?value|password.?input|password.?part|password.?score|password.?classification|training.?input|request.?body|user.?agent|ip.?address|email.?address|secaware.?quiz/iu,
    );
    expect(result.manifest.schemaVersion).toBe('research-export-v10');
    expect(result.manifest.profile).toBe('audit');
    expect(result.manifest.schemaProfileVersion).toBe('research-audit-v5');
    for (const file of result.manifest.files) {
      expect(
        createHash('sha256')
          .update(readFileSync(join(outputDirectory, file.fileName)))
          .digest('hex'),
      ).toBe(file.sha256);
    }
  });

  it.each(['forced-supportive', 'forced-reference'] as const)(
    'exports completed %s cases with typed values and a consistent database snapshot',
    async (assignmentMode) => {
      const directory = resources.createTemporaryDirectory('passwo-analysis-export-');
      const databasePath = join(directory, 'study.sqlite');
      const server = resources.track(
        buildStudyServer({
          version: '0.1.2',
          assignmentMode,
          databasePath,
          recontactDatabasePath: join(directory, 'recontact.sqlite'),
          referenceArtifactDirectory: fileURLToPath(
            new URL('./test-fixtures/reference-artifact/', import.meta.url),
          ),
          randomSource: deterministicTestRandomSource(),
          nowIso: () => '2026-08-24T12:00:00.000Z',
          webRuntime: { resumeCloseAtIso: '2099-01-01T00:00:00.000Z', secureCookies: false },
        }),
      );
      const completed = await createWebTestSession(server, 1, false);
      await completeWebTestStudy(server, completed, '90000000-0000-4000-8000-000000000001');
      const incomplete = await createWebTestSession(server, 2, false);
      const writer = new Database(databasePath);
      writer.pragma('journal_mode = WAL');
      const originalPrepare = Database.prototype.prepare;
      let concurrentWrite = false;
      const prepareSpy = vi.spyOn(Database.prototype, 'prepare').mockImplementation(function (
        this: Database.Database,
        sql: string,
      ) {
        if (!concurrentWrite && sql.includes('FROM responses AS response')) {
          concurrentWrite = true;
          writer.prepare("UPDATE responses SET json_value = '5' WHERE item_id = 'PANAS_01'").run();
        }
        return originalPrepare.call(this, sql);
      });
      const outputDirectory = join(directory, 'analysis');
      try {
        const result = await exportResearchData({
          databasePath,
          outputDirectory,
          profile: 'analysis',
        });
        expect(concurrentWrite).toBe(true);
        expect(result.manifest).toMatchObject({
          schemaVersion: 'research-export-v10',
          schemaProfileVersion: 'research-analysis-v5',
          profile: 'analysis',
        });
        expect(result.manifest).not.toHaveProperty('freeTextReview');
        expect([...result.files].sort()).toEqual(
          [
            'sessions.csv',
            'sessions.json',
            'responses.csv',
            'responses.json',
            'data-dictionary.csv',
            'data-dictionary.json',
            'export-guide.csv',
            'export-guide.json',
            'study-export.xlsx',
            'manifest.json',
          ].sort(),
        );
        const sessions = z
          .array(researchAnalysisSessionRecordSchema)
          .parse(JSON.parse(readFileSync(join(outputDirectory, 'sessions.json'), 'utf8')));
        const responses = z
          .array(researchAnalysisResponseRecordSchema)
          .parse(JSON.parse(readFileSync(join(outputDirectory, 'responses.json'), 'utf8')));
        expect(sessions).toHaveLength(1);
        expect(sessions[0]).toMatchObject({ completionStatus: 'completed' });
        expect(sessions[0]?.artifactSessionElapsedMs).toBeGreaterThan(0);
        expect(responses).toHaveLength(
          mainInstrumentBlocks.reduce((n, block) => n + block.items.length, 0),
        );
        expect(new Set(responses.map((response) => response.researchId))).toEqual(
          new Set(sessions.map((session) => session.researchId)),
        );
        // The concurrent update must not leak into the snapshot taken with sessions.
        expect(responses.find((response) => response.itemId === 'PANAS_01')?.value).toBe(1);
        expect(
          writer.prepare("SELECT json_value FROM responses WHERE item_id = 'PANAS_01'").get(),
        ).toEqual({ json_value: '5' });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(join(outputDirectory, 'study-export.xlsx'));
        expect(workbook.worksheets.map((worksheet) => worksheet.name)).toEqual([
          'Hinweise',
          'Sitzungen',
          'Antworten',
          'Variablen',
        ]);
        const answers = workbook.getWorksheet('Antworten');
        if (answers === undefined) throw new Error('missing-answers-sheet');
        const csvWorkbook = new ExcelJS.Workbook();
        const csvAnswers = await csvWorkbook.csv.readFile(join(outputDirectory, 'responses.csv'), {
          map: (value: string) => value,
        });
        for (const [index, response] of responses.entries()) {
          const cellValue = Array.isArray(response.value)
            ? JSON.stringify(response.value)
            : response.value;
          expect(answers.getRow(index + 2).getCell(5).value).toBe(response.itemId);
          expect(answers.getRow(index + 2).getCell(6).value).toBe(cellValue);
          expect(csvAnswers.getRow(index + 2).getCell(6).value).toBe(
            cellValue === null ? '' : String(cellValue),
          );
        }
        const exportedText = result.files
          .filter((file) => !file.endsWith('.xlsx'))
          .map((file) => readFileSync(join(outputDirectory, file), 'utf8'))
          .join('\n');
        expect(exportedText).not.toContain(completed.session.sessionId);
        expect(exportedText).not.toContain(incomplete.session.sessionId);
        expect(exportedText).not.toContain(completed.session.deletionCode);
        expect(JSON.stringify({ sessions, responses })).not.toMatch(
          /createdAtIso|completedAtIso|tokenHash|resumeState|display.?name|password.?value/iu,
        );
        // Exercise the same manifest/file-set verifier used after a server transfer.
        expect(
          execFileSync(
            process.execPath,
            [
              '--import',
              'tsx',
              './scripts/verify-study-export.ts',
              '--directory',
              outputDirectory,
              '--profile',
              'analysis',
            ],
            { encoding: 'utf8' },
          ),
        ).toContain('geprüft');
        const previousManifest = readFileSync(join(outputDirectory, 'manifest.json'), 'utf8');
        await expect(
          exportResearchData({ databasePath, outputDirectory, profile: 'analysis' }),
        ).rejects.toThrow('export-target-already-contains-');
        expect(readFileSync(join(outputDirectory, 'manifest.json'), 'utf8')).toBe(previousManifest);

        writer
          .prepare(
            "UPDATE responses SET item_id = 'LEGACY_TEXT', json_value = ? WHERE item_id = 'PRE_ROLE'",
          )
          .run(JSON.stringify('historical synthetic text'));
        const rejectedDirectory = join(directory, 'unsupported-analysis');
        await expect(
          exportResearchData({
            databasePath,
            outputDirectory: rejectedDirectory,
            profile: 'analysis',
          }),
        ).rejects.toThrow('analysis-export-unsupported-item-use-audit');
        expect(existsSync(rejectedDirectory)).toBe(false);
        const auditDirectory = join(directory, 'audit');
        await exportResearchData({
          databasePath,
          outputDirectory: auditDirectory,
          profile: 'audit',
        });
        expect(readFileSync(join(auditDirectory, 'responses.json'), 'utf8')).toContain(
          'historical synthetic text',
        );
        expect(
          execFileSync(
            process.execPath,
            [
              '--import',
              'tsx',
              './scripts/verify-study-export.ts',
              '--directory',
              auditDirectory,
              '--profile',
              'audit',
            ],
            { encoding: 'utf8' },
          ),
        ).toContain('geprüft');
      } finally {
        prepareSpy.mockRestore();
        writer.close();
      }
    },
  );

  it('keeps production consent text aligned with the approved anonymization boundary', () => {
    const studyFlowSource = readFileSync(
      new URL('../../study-web/src/features/study/StudyFlow.tsx', import.meta.url),
      'utf8',
    );
    const productionConsentText = [
      studyFlowSource,
      JSON.stringify(instrumentRuntimeManifest.procedures.participantInformation),
    ].join('\n');

    expect(productionConsentText).toContain(
      'Bis zum Abschluss der Datenauswertung und Prüfung des Datensatzes bleiben die Forschungsdaten pseudonymisiert',
    );
    expect(productionConsentText).toContain(
      'werden unvollständige Teilnahmen gelöscht und die Zuordnungsinformationen der abgeschlossenen Teilnahmen dauerhaft entfernt',
    );
    expect(productionConsentText).not.toMatch(
      /\[OFFEN|Sciebo|nach Studienende anonymisiert|einschließlich der Nachbefragung/u,
    );
  });
});
