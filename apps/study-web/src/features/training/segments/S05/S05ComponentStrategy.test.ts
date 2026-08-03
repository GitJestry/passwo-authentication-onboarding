import type { PasswordAnalysisResult } from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  determinePasswordSimulationDisposition,
} from '@passwo/password-analysis';
import { describe, expect, it } from 'vitest';
import {
  bindTypicalChangeFindings,
  createCanonicalPasswordView,
  createPersonalFindings,
  maskedCanonicalBlocks,
} from './S05ComponentStrategy.js';

describe('S05 component strategy presentation', () => {
  it('keeps one canonical segmentation while disclosing Passw0rt123! changes only later', () => {
    const password = 'Passw0rt123!';
    const analysis = analyzeFictionalPassword({ fictionalPassword: password });
    const view = createCanonicalPasswordView(password, analysis);

    expect(view.blocks.map(({ value }) => value)).toEqual(['Passw0rt', '123', '!']);
    expect(view.automaticFindings['common-components'].map(({ label }) => label)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/→|angehängt|Zahlenfolge/u)]),
    );
    expect(view.automaticFindings['typical-changes'].map(({ label }) => label)).toEqual(
      expect.arrayContaining([
        'o → 0',
        'Zahlenfolge „123“ angehängt',
        'Symbol „!“ angehängt',
      ]),
    );

    const originalBlockIds = view.blocks.map(({ id }) => id);
    const personal = createPersonalFindings(view, [originalBlockIds[0] ?? '']);
    bindTypicalChangeFindings(view, personal);
    expect(view.blocks.map(({ id }) => id)).toEqual(originalBlockIds);
  });

  it('calls a block personal only after a local user selection', () => {
    const password = 'Campusgram2026!';
    const view = createCanonicalPasswordView(
      password,
      analyzeFictionalPassword({
        fictionalPassword: password,
        authoredAccountTerms: ['Campusgram'],
      }),
    );

    expect(JSON.stringify(view.automaticFindings)).not.toMatch(/persönlich/iu);
    expect(createPersonalFindings(view, [])).toEqual([]);
    expect(createPersonalFindings(view, [view.blocks[0]?.id ?? ''])[0]?.label).toBe(
      'persönlich eingeordneter Bestandteil',
    );
    const groupedBlockIds = view.blocks.slice(0, 2).map(({ id }) => id);
    expect(createPersonalFindings(view, groupedBlockIds, true)).toMatchObject([
      { blockIds: groupedBlockIds },
    ]);
  });

  it('projects account findings from authored exact context matches', () => {
    const password = 'CampusgramSommer';
    const view = createCanonicalPasswordView(
      password,
      analyzeFictionalPassword({
        fictionalPassword: password,
        authoredAccountTerms: ['Campusgram'],
      }),
    );

    expect(view.automaticFindings['account-context'].map(({ label }) => label)).toEqual([
      'Campusgram',
    ]);
  });

  it('projects a bounded changed account term only with matching transformation evidence', () => {
    const password = 'C4mpusgram';
    const analysis: PasswordAnalysisResult = {
      kind: 'fictional-password-analysis',
      findings: [
        {
          id: 'account-changed',
          kind: 'account-or-service-term',
          evidence: [{ type: 'span', start: 0, end: password.length, token: password }],
          explanationId: 's05.account-or-service-term',
          confidence: 'bounded-heuristic',
        },
        {
          id: 'account-transformation',
          kind: 'typical-transformation',
          evidence: [{ type: 'span', start: 0, end: password.length, token: password }],
          explanationId: 's05.typical-transformation',
          confidence: 'bounded-heuristic',
        },
      ],
      guessPath: {
        engineId: 'zxcvbn-ts',
        configurationVersion: 'test-only',
        estimatedGuesses: 1,
        estimatedGuessesLog10: 0,
        matches: [],
      },
      disclaimerId: 'simulation-not-production-strength',
    };

    const view = createCanonicalPasswordView(password, analysis);
    expect(view.automaticFindings['account-context'].map(({ label }) => label)).toEqual([
      password,
    ]);
    expect(view.automaticFindings['typical-changes']).not.toHaveLength(0);
  });

  it('binds changes to common, personal or account bases and otherwise to the whole password', () => {
    const commonPassword = 'Passw0rt123!';
    const commonView = createCanonicalPasswordView(
      commonPassword,
      analyzeFictionalPassword({ fictionalPassword: commonPassword }),
    );
    expect(bindTypicalChangeFindings(commonView, []).every(({ binding }) => binding === 'blocks')).toBe(
      true,
    );

    const accountPassword = 'Campusgram2026!';
    const accountView = createCanonicalPasswordView(
      accountPassword,
      analyzeFictionalPassword({
        fictionalPassword: accountPassword,
        authoredAccountTerms: ['Campusgram'],
      }),
    );
    expect(bindTypicalChangeFindings(accountView, []).some(({ binding }) => binding === 'blocks')).toBe(
      true,
    );

    const analysisWithoutBase: PasswordAnalysisResult = {
      kind: 'fictional-password-analysis',
      findings: [
        {
          id: 'suffix-only',
          kind: 'typical-suffix',
          evidence: [{ type: 'span', start: 4, end: 8, token: '123!' }],
          explanationId: 's05.typical-suffix',
          confidence: 'bounded-heuristic',
        },
      ],
      guessPath: {
        engineId: 'zxcvbn-ts',
        configurationVersion: 'test-only',
        estimatedGuesses: 1,
        estimatedGuessesLog10: 0,
        matches: [],
      },
      disclaimerId: 'simulation-not-production-strength',
    };
    const personalView = createCanonicalPasswordView('Idee123!', analysisWithoutBase);
    const baseBlockId = personalView.blocks.find(({ end }) => end === 4)?.id;
    const personalFindings = createPersonalFindings(
      personalView,
      baseBlockId === undefined ? [] : [baseBlockId],
    );
    expect(
      bindTypicalChangeFindings(personalView, personalFindings).every(
        ({ binding }) => binding === 'blocks',
      ),
    ).toBe(true);
    expect(bindTypicalChangeFindings(personalView, []).every(({ binding }) => binding === 'password')).toBe(
      true,
    );
  });

  it('masks only characters while preserving block identities and findings', () => {
    const password = 'Passw0rt123!';
    const view = createCanonicalPasswordView(
      password,
      analyzeFictionalPassword({ fictionalPassword: password }),
    );
    const masked = maskedCanonicalBlocks(view.blocks);

    expect(masked.map(({ id }) => id)).toEqual(view.blocks.map(({ id }) => id));
    expect(masked.map(({ value }) => value)).toEqual(view.blocks.map(({ value }) => '•'.repeat(value.length)));
    expect(view.automaticFindings['typical-changes']).not.toHaveLength(0);
  });

  it('does not let category presentation alter the frozen simulation disposition', () => {
    const password = 'Passw0rt123!';
    const analysis = analyzeFictionalPassword({ fictionalPassword: password });
    const disposition = determinePasswordSimulationDisposition({
      fictionalPassword: password,
      componentAnalysis: analysis,
    });
    const before = structuredClone(disposition);

    const view = createCanonicalPasswordView(password, analysis);
    bindTypicalChangeFindings(view, createPersonalFindings(view, [view.blocks[0]?.id ?? '']));

    expect(disposition).toEqual(before);
  });
});
