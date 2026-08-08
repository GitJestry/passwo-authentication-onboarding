import type { PasswordAnalysisResult, PasswordSingleFinding } from '@passwo/contracts';
import {
  analyzeFictionalPassword,
  analyzeFictionalPasswordStructure,
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
  it.each([
    ['wort1wort1', 'common-word', 'häufiges Wort'],
    ['password1password1', 'common-password-core', 'häufiges Passwort'],
    ['zümra1zümra1', 'common-name', 'häufiges Wort'],
    ['qwertz9876xqwertz9876x', 'keyboard-pattern', 'häufige Tastaturfolge'],
    ['2026-2026-', 'year', 'häufiges Datum'],
    ['12.03.2012-12.03.2012-', 'date', 'häufiges Datum'],
    ['abcd1abcd1', 'simple-character-sequence', 'häufige Zeichenfolge'],
    ['einszweidrei-einszweidrei-', 'predictable-word-sequence', 'häufige Zeichenfolge'],
  ] as const)(
    'shows repeated %s as %s in common parts and as a repetition pattern',
    (password, findingKind, matchCategory) => {
      const analysis = analyzeFictionalPassword({ fictionalPassword: password });
      const view = createCanonicalPasswordView(password, analysis);
      const structureAnalysis = analyzeFictionalPasswordStructure({
        fictionalPassword: password,
        componentAnalysis: analysis,
      });

      expect(analysis.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: findingKind }),
          expect.objectContaining({ kind: 'repeated-component' }),
        ]),
      );
      expect(view.automaticFindings['common-components']).toEqual(
        expect.arrayContaining([expect.objectContaining({ matchCategory })]),
      );
      expect(structureAnalysis.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            findingKind: expect.stringMatching(
              /^(?:exact-component-repetition|recognized-repetition-pattern)$/u,
            ),
          }),
        ]),
      );
    },
  );

  it('shows P4ssw0rt123! once as one common variant block', () => {
    const password = 'P4ssw0rt123!';
    const view = createCanonicalPasswordView(
      password,
      analyzeFictionalPassword({ fictionalPassword: password }),
    );
    const displayed = projectCanonicalPasswordBlocks(
      view,
      view.automaticFindings['common-components'],
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed.map(({ value }) => value)).toEqual([password]);
    expect(displayed.flatMap(({ labels }) => labels)).toEqual(
      expect.arrayContaining([
        'häufig verwendetes Passwort',
        'typische Variante: a → 4, o → 0, +123!',
      ]),
    );
    expect(
      [
        ...new Set(
          displayed
            .flatMap(({ labels }) => labels)
            .filter((label) => label.startsWith('typische Variante')),
        ),
      ],
    ).toHaveLength(1);
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

  it('keeps only a complete candidate when it fully covers another candidate', () => {
    const password = 'Passwort123!';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'complete',
          kind: 'common-password-core',
          evidence: [{ type: 'span', start: 0, end: password.length, token: password }],
          explanationId: 's05.common-password-core',
          confidence: 'bounded-heuristic',
        },
        {
          id: 'partial',
          kind: 'simple-character-sequence',
          evidence: [{ type: 'span', start: 8, end: 11, token: '123' }],
          explanationId: 's05.simple-character-sequence',
          confidence: 'bounded-heuristic',
        },
      ]),
    );

    expect(
      summarizeCategoryCandidates(view, view.automaticFindings['common-components']),
    ).toMatchObject({
      candidateCount: 1,
      coversWholePassword: true,
      hasSingleCandidateMatch: true,
    });
  });

  it('keeps a date atomic when it contains a separately recognized year', () => {
    const password = 'melinda01012005!';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'date',
          kind: 'date',
          evidence: [{ type: 'span', start: 7, end: 15, token: '01012005' }],
          explanationId: 's05.date',
          confidence: 'bounded-heuristic',
        },
        {
          id: 'year',
          kind: 'year',
          evidence: [{ type: 'span', start: 11, end: 15, token: '2005' }],
          explanationId: 's05.year',
          confidence: 'bounded-heuristic',
        },
        {
          id: 'suffix',
          kind: 'typical-suffix',
          evidence: [{ type: 'span', start: 7, end: password.length, token: '01012005!' }],
          explanationId: 's05.typical-suffix',
          confidence: 'bounded-heuristic',
        },
      ]),
    );

    expect(view.blocks.map(({ value }) => value)).toEqual(['melinda', '01012005', '!']);
    expect(view.automaticFindings['common-components']).toHaveLength(1);
    expect(
      projectCanonicalPasswordBlocks(
        view,
        view.automaticFindings['common-components'],
      ).filter(({ labels }) => labels.length > 0),
    ).toMatchObject([{ value: '01012005', labels: ['naheliegende Jahreszahl'] }]);
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
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed.map(({ value }) => value)).toEqual(['wort1-', 'wort2-', 'wort3']);
    expect(displayed.map(({ labels }) => labels.at(-1))).toEqual([
      'typische Variante: +1-',
      'typische Variante: +2-',
      'typische Variante: +3',
    ]);
  });

  it('keeps a freely selected personal range exact without absorbing its suffix', () => {
    const password = 'melinda123!';
    const view = createCanonicalPasswordView(
      password,
      analysisWithFindings([
        {
          id: 'suffix-only',
          kind: 'typical-suffix',
          evidence: [{ type: 'span', start: 7, end: password.length, token: '123!' }],
          explanationId: 's05.typical-suffix',
          confidence: 'bounded-heuristic',
        },
      ]),
    );
    expect(view.blocks.map(({ value }) => value)).toEqual(['melinda', '123!']);

    const personal = createPersonalFindings(view, [
      { id: 'personal:2-7', start: 2, end: 7 },
    ]);
    const displayed = projectCanonicalPasswordBlocks(view, personal).filter(
      ({ labels }) => labels.length > 0,
    );
    expect(personal).toMatchObject([{ start: 2, end: 7 }]);
    expect(displayed.map(({ value }) => value)).toEqual(['linda']);
    expect(displayed.flatMap(({ labels }) => labels)).toEqual(['persönliche Angabe']);
    expect(displayed[0]?.categoryIds).toEqual(['personal-details']);
    expect(summarizeCategoryCandidates(view, personal).hasSingleCandidateMatch).toBe(false);
  });

  it('keeps multiple adjacent personal candidates distinct while covering the password', () => {
    const password = 'EventHobby';
    const view = createCanonicalPasswordView(password, analysisWithFindings([]));
    const personal = createPersonalFindings(view, [
      { id: 'personal:0-5', start: 0, end: 5 },
      { id: 'personal:5-10', start: 5, end: 10 },
    ]);

    expect(projectCanonicalPasswordBlocks(view, personal).map(({ value }) => value)).toEqual([
      'Event',
      'Hobby',
    ]);
    expect(summarizeCategoryCandidates(view, personal)).toMatchObject({
      candidateCount: 2,
      coversWholePassword: true,
      hasSingleCandidateMatch: false,
    });
  });

  it('ignores overlapping personal candidates while retaining disjoint ranges', () => {
    const password = 'EventHobby';
    const view = createCanonicalPasswordView(password, analysisWithFindings([]));
    const personal = createPersonalFindings(view, [
      { id: 'personal:0-5', start: 0, end: 5 },
      { id: 'personal:2-4', start: 2, end: 4 },
      { id: 'personal:5-10', start: 5, end: 10 },
    ]);

    expect(personal.map(({ id }) => id)).toEqual(['personal:0-5', 'personal:5-10']);
  });

  it('does not show an unbound typical ending as an independent finding', () => {
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

    expect(projectCanonicalPasswordBlocks(view, []).flatMap(({ labels }) => labels)).toEqual(
      [],
    );
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
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed.map(({ value }) => value).join('')).toBe(password);
    expect(
      [
        ...new Set(
          displayed
            .flatMap(({ labels }) => labels)
            .filter((label) => label.startsWith('typische Variante')),
        ),
      ],
    ).toHaveLength(1);
    expect(
      summarizeCategoryCandidates(view, view.automaticFindings['account-context'])
        .hasSingleCandidateMatch,
    ).toBe(true);
  });

  it('shows a bounded authored leetspeak match in the account-context category', () => {
    const password = 'C4mpus';
    const analysis = analyzeFictionalPassword({
      fictionalPassword: password,
      authoredAccountTerms: ['Campus'],
    });
    const view = createCanonicalPasswordView(password, analysis);
    const displayed = projectCanonicalPasswordBlocks(
      view,
      view.automaticFindings['account-context'],
    ).filter(({ labels }) => labels.length > 0);

    expect(displayed).toEqual([
      expect.objectContaining({
        value: password,
        labels: expect.arrayContaining(['C4mpus', 'typische Variante: a → 4']),
      }),
    ]);
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
    projectCanonicalPasswordBlocks(view, view.automaticFindings['common-components']);

    expect(disposition).toEqual(before);
  });
});
