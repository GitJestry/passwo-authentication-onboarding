import type { PasswordAnalysisResult, PasswordSingleFinding } from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  determinePasswordSimulationDisposition,
} from '@passwo/password-analysis';
import { describe, expect, it } from 'vitest';
import {
  createCanonicalPasswordView,
  createPersonalFindings,
  projectCanonicalPasswordBlocks,
  summarizeCategoryCandidates,
} from './S05ComponentStrategy.js';

function analysisWithFindings(findings: readonly PasswordSingleFinding[]): PasswordAnalysisResult {
  return {
    kind: 'fictional-password-analysis',
    findings,
    guessPath: {
      engineId: 'zxcvbn-ts',
      configurationVersion: 'test-only',
      estimatedGuesses: 1,
      estimatedGuessesLog10: 0,
      matches: [],
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

describe('S05 component strategy presentation', () => {
  it('shows Passw0rt123! once as one common variant block', () => {
    const password = 'Passw0rt123!';
    const view = createCanonicalPasswordView(
      password,
      analyzeFictionalPassword({ fictionalPassword: password }),
    );
    const displayed = projectCanonicalPasswordBlocks(
      view,
      view.automaticFindings['common-components'],
      false,
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed.map(({ value }) => value)).toEqual([password]);
    expect(displayed[0]?.labels).toEqual(
      expect.arrayContaining([
        'häufig verwendetes Passwort',
        'typische Variante: o → 0, +123!',
      ]),
    );
    expect(displayed[0]?.labels.filter((label) => label.startsWith('typische Variante'))).toHaveLength(
      1,
    );
    expect(
      summarizeCategoryCandidates(view, view.automaticFindings['common-components']),
    ).toMatchObject({
      candidateCount: 1,
      coversWholePassword: true,
      hasSingleCandidateMatch: true,
    });
  });

  it('does not treat two candidates covering the password as a single-candidate match', () => {
    const password = 'Passw0rtSommer';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'first-word',
          kind: 'common-word',
          evidence: [{ type: 'span', start: 0, end: 8, token: 'Passw0rt' }],
          explanationId: 's05.common-word',
          confidence: 'bounded-heuristic',
        },
        {
          id: 'second-word',
          kind: 'common-word',
          evidence: [{ type: 'span', start: 8, end: password.length, token: 'Sommer' }],
          explanationId: 's05.common-word',
          confidence: 'bounded-heuristic',
        },
      ]),
    );

    expect(
      summarizeCategoryCandidates(view, view.automaticFindings['common-components']),
    ).toMatchObject({
      candidateCount: 2,
      coversWholePassword: true,
      hasSingleCandidateMatch: false,
    });
  });

  it('projects a recognized word sequence as three variant blocks', () => {
    const password = 'wort1-wort2-wort3';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'sequence',
          kind: 'predictable-word-sequence',
          evidence: [{ type: 'span', start: 0, end: password.length, token: password }],
          explanationId: 's05.predictable-word-sequence',
          confidence: 'bounded-heuristic',
        },
      ]),
    );
    const displayed = projectCanonicalPasswordBlocks(
      view,
      view.automaticFindings['common-components'],
      false,
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed.map(({ value }) => value)).toEqual(['wort1-', 'wort2-', 'wort3']);
    expect(displayed.map(({ labels }) => labels.at(-1))).toEqual([
      'typische Variante: +1-',
      'typische Variante: +2-',
      'typische Variante: +3',
    ]);
  });

  it('keeps personal selection atomic and groups its directly adjacent suffix afterwards', () => {
    const password = 'Idee123!';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'suffix-only',
          kind: 'typical-suffix',
          evidence: [{ type: 'span', start: 4, end: password.length, token: '123!' }],
          explanationId: 's05.typical-suffix',
          confidence: 'bounded-heuristic',
        },
      ]),
    );
    expect(view.blocks.map(({ value }) => value)).toEqual(['Idee', '123!']);

    const personal = createPersonalFindings(view, [view.blocks[0]?.id ?? '']);
    const displayed = projectCanonicalPasswordBlocks(view, personal, false).filter(
      ({ labels }) => labels.length > 0,
    );
    expect(displayed).toMatchObject([
      {
        value: password,
        labels: ['persönliche Angabe', 'typische Variante: +123!'],
      },
    ]);
    expect(summarizeCategoryCandidates(view, personal).hasSingleCandidateMatch).toBe(true);
  });

  it('shows an unbound typical ending only when residual changes are requested', () => {
    const password = 'Fantasiebegriff123!';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'suffix-only',
          kind: 'typical-suffix',
          evidence: [{ type: 'span', start: 15, end: password.length, token: '123!' }],
          explanationId: 's05.typical-suffix',
          confidence: 'bounded-heuristic',
        },
      ]),
    );

    expect(projectCanonicalPasswordBlocks(view, [], false).flatMap(({ labels }) => labels)).toEqual(
      [],
    );
    expect(
      projectCanonicalPasswordBlocks(view, [], true)
        .filter(({ labels }) => labels.length > 0)
        .map(({ value, labels }) => ({ value, labels })),
    ).toEqual([{ value: '123!', labels: ['typische Endung: +123!'] }]);
  });

  it('binds an account suffix to the account block without duplicating its variant label', () => {
    const password = 'Campusgram2026!';
    const view = createCanonicalPasswordView(
      password,
      analyzeFictionalPassword({
        fictionalPassword: password,
        authoredAccountTerms: ['Campusgram'],
      }),
    );
    const displayed = projectCanonicalPasswordBlocks(
      view,
      view.automaticFindings['account-context'],
      false,
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed.map(({ value }) => value)).toEqual([password]);
    expect(displayed[0]?.labels.filter((label) => label.startsWith('typische Variante'))).toHaveLength(
      1,
    );
    expect(
      summarizeCategoryCandidates(view, view.automaticFindings['account-context'])
        .hasSingleCandidateMatch,
    ).toBe(true);
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
    projectCanonicalPasswordBlocks(view, view.automaticFindings['common-components'], true);

    expect(disposition).toEqual(before);
  });
});
