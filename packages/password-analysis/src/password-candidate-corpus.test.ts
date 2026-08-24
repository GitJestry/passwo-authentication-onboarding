import type {
  PasswordAnalysisResult,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
  TransientPasswordSemanticEvidence,
} from '@passwo/contracts';
import { describe, expect, it } from 'vitest';
import {
  analyzeFictionalPassword,
  determinePasswordSimulationDisposition,
} from './index.js';

interface AuthoredSegment {
  readonly token: string;
  readonly kind: Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>;
}

interface CandidateCorpusCase {
  readonly label: string;
  readonly password: string;
  readonly segments: readonly AuthoredSegment[];
  readonly semanticEvidence?: TransientPasswordSemanticEvidence;
  readonly expectedFound: boolean;
}

function semanticEvidenceForTokens(
  password: string,
  tokens: readonly string[],
  id: string,
  kind: 'shared-content' | 'sentence-or-phrase' = 'sentence-or-phrase',
): TransientPasswordSemanticEvidence {
  let searchFrom = 0;
  const evidence = tokens.map((token) => {
    const start = password.indexOf(token, searchFrom);
    if (start < 0) throw new Error(`Missing semantic token ${token} in ${password}.`);
    const end = start + token.length;
    searchFrom = end;
    return { type: 'span' as const, start, end, token };
  });
  return {
    kind: 'transient-password-semantic-evidence',
    confirmed: true,
    relations: [{ id, kind, evidence }],
  };
}

function analysisFromSegments(
  password: string,
  segments: readonly AuthoredSegment[],
): PasswordAnalysisResult {
  let searchFrom = 0;
  const findings: PasswordSingleFinding[] = segments.map((segment, ordinal) => {
    const start = password.indexOf(segment.token, searchFrom);
    if (start < 0) throw new Error(`Missing authored segment ${segment.token} in ${password}.`);
    const end = start + segment.token.length;
    searchFrom = end;
    return {
      id: `single:${segment.kind}:${start}-${end}:${ordinal}`,
      kind: segment.kind,
      evidence: [{ type: 'span', start, end, token: segment.token }],
      explanationId: `s05.${segment.kind}`,
      confidence: 'bounded-heuristic',
    };
  });
  return {
    kind: 'fictional-password-analysis',
    findings,
    guessPath: {
      engineId: 'zxcvbn-ts',
      configurationVersion: 'passwo-bounded-whole-recognition-v20',
      matches: [],
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

const ordinaryWords = [
  'Kaffee',
  'Morgen',
  'Sonne',
  'Suppe',
  'Fenster',
  'Regen',
  'Lampe',
  'Kaktus',
  'Koffer',
  'Fahrrad',
  'Baum',
  'Wasser',
] as const;

const directCases: readonly CandidateCorpusCase[] = ([
  ['Passwort', 'common-password-core'],
  ['Password', 'common-password-core'],
  ['TestPasswort', 'common-password-core'],
  ['Campusgram', 'account-or-service-term'],
  ['MasterCampus', 'account-or-service-term'],
  ['CampusMail', 'account-or-service-term'],
  ['Klarissa', 'account-or-service-term'],
  ['qwertz', 'keyboard-pattern'],
  ['123456789', 'simple-character-sequence'],
  ['2026', 'year'],
  ['01012026', 'date'],
  ['aaaaaaaaaaaaaaa', 'repeated-component'],
  ['KaffeeKaffeeKaffee', 'repeated-component'],
  ['Wort1-Wort2-Wort3', 'predictable-word-sequence'],
  ['Kaffee', 'common-word'],
] as const).map(([password, kind]) => ({
  label: `direct ${password}`,
  password,
  segments: [{ token: password, kind }],
  expectedFound: true,
}));

const wordChainCases: readonly CandidateCorpusCase[] = Array.from(
  { length: 30 },
  (_, index) => {
    const count = 2 + (index % 3);
    const separator = ['', '-', '_', ' '][Math.floor(index / 3) % 4] ?? '';
    const start = index % ordinaryWords.length;
    const step = 1 + Math.floor(index / ordinaryWords.length);
    const selected = Array.from(
      { length: count },
      (_, wordIndex) => ordinaryWords[(start + wordIndex * step) % ordinaryWords.length] ?? 'Kaffee',
    );
    return {
      label: `${count}-word chain ${index + 1}`,
      password: selected.join(separator),
      segments: selected.map((token) => ({ token, kind: 'common-word' as const })),
      expectedFound: count <= 3,
    };
  },
);

const semanticWordChainCases: readonly CandidateCorpusCase[] = Array.from(
  { length: 12 },
  (_, index) => {
    const count = 4 + (index % 2);
    const separator = ['::', '/', '..', '---'][Math.floor(index / 4) % 4] ?? '::';
    const start = (index * 2) % ordinaryWords.length;
    const selected = Array.from(
      { length: count },
      (_, wordIndex) => ordinaryWords[(start + wordIndex) % ordinaryWords.length] ?? 'Kaffee',
    );
    const password = selected.join(separator);
    return {
      label: `confirmed semantic word chain ${index + 1}`,
      password,
      segments: selected.map((token) => ({ token, kind: 'common-word' as const })),
      semanticEvidence: semanticEvidenceForTokens(
        password,
        selected,
        `semantic:sentence:${index}`,
      ),
      expectedFound: false,
    };
  },
);

const longLexicalSequenceCases: readonly CandidateCorpusCase[] = Array.from(
  { length: 20 },
  (_, index) => {
    const count = 5 + (index % 2);
    const separator = ['', '-', '_', ' '][Math.floor(index / 2) % 4] ?? '';
    const start = index % ordinaryWords.length;
    const step = 1 + Math.floor(index / ordinaryWords.length);
    const selected = Array.from(
      { length: count },
      (_, wordIndex) => ordinaryWords[(start + wordIndex * step) % ordinaryWords.length] ?? 'Kaffee',
    );
    return {
      label: `${count}-word long lexical sequence ${index + 1}`,
      password: selected.join(separator),
      segments: selected.map((token) => ({ token, kind: 'common-word' as const })),
      expectedFound: false,
    };
  },
);

const residualFoundCases: readonly CandidateCorpusCase[] = ([
  ['Passworta', ['Passwort']],
  ['aPasswort', ['Passwort']],
  ['Passwortabcd', ['Passwort']],
  ['abcdPasswort', ['Passwort']],
  ['Passwortksmdl', ['Passwort']],
  ['ksmdlPasswort', ['Passwort']],
  ['Passwortqzmpvx', ['Passwort']],
  ['qzmpvxPasswort', ['Passwort']],
  ['PasswortlOtr', ['Passwort']],
  ['lOtrPasswort', ['Passwort']],
  ['Passwort1234567', ['Passwort']],
  ['1234567Passwort', ['Passwort']],
  ['Passwort58392047', ['Passwort']],
  ['58392047Passwort', ['Passwort']],
  ['Passworta1B2c', ['Passwort']],
  ['a1B2cPasswort', ['Passwort']],
  ['Passwortq!7Mv', ['Passwort']],
  ['q!7MvPasswort', ['Passwort']],
  ['Passwort!!!!', ['Passwort']],
  ['!!!!Passwort', ['Passwort']],
  ['Passwortäöüßx', ['Passwort']],
  ['äöüßxPasswort', ['Passwort']],
  ['Campusgramqzmpvx', ['Campusgram']],
  ['qzmpvxCampusgram', ['Campusgram']],
  ['MasterCampusA1b2C', ['MasterCampus']],
  ['A1b2CMasterCampus', ['MasterCampus']],
] as const).map(([password, tokens]) => ({
  label: `single anchor plus residual ${password}`,
  password,
  segments: (tokens as readonly string[]).map((token) => ({
    token,
    kind:
      token === 'Passwort'
        ? ('common-password-core' as const)
        : ('account-or-service-term' as const),
  })),
  expectedFound: true,
}));

const residualNotFoundCases: readonly CandidateCorpusCase[] = ([
  ['Passwortqzmpvxtrldb', ['Passwort']],
  ['qzmpvxtrldbPasswort', ['Passwort']],
  ['Campusgramqzmpvxtrld', ['Campusgram']],
  ['qzmpvxtrldCampusgram', ['Campusgram']],
  ['PasswortA1b2C3d4E', ['Passwort']],
  ['A1b2C3d4EPasswort', ['Passwort']],
  ['PasswortqzmpvSuppe', ['Passwort', 'Suppe']],
  ['PasswortSuppeqzmpv', ['Passwort', 'Suppe']],
  ['qzmpvPasswortSuppe', ['Passwort', 'Suppe']],
  ['PasswortmklhSuppe', ['Passwort', 'Suppe']],
  ['PasswortSuppemlkh', ['Passwort', 'Suppe']],
  ['mklhPasswortSuppe', ['Passwort', 'Suppe']],
  ['PasswortmklhSuppeMorgen', ['Passwort', 'Suppe', 'Morgen']],
  ['SuppePasswortmklhMorgen', ['Suppe', 'Passwort', 'Morgen']],
  ['KlarissaBVBTestPasswort', ['Klarissa', 'TestPasswort']],
  ['KlarissaqzmpvxTestPasswort', ['Klarissa', 'TestPasswort']],
  ['Passwort🙂', ['Passwort']],
  ['🙂Passwort', ['Passwort']],
] as const).map(([password, tokens]) => ({
  label: `outside generated family ${password}`,
  password,
  segments: (tokens as readonly string[]).map((token) => ({
    token,
    kind:
      token === 'Passwort' || token === 'TestPasswort'
        ? ('common-password-core' as const)
        : token === 'Suppe' || token === 'Morgen'
          ? ('common-word' as const)
          : ('account-or-service-term' as const),
  })),
  expectedFound: false,
}));

const structuralCompositionCases: readonly CandidateCorpusCase[] = [
  {
    label: 'account plus year',
    password: 'Campusgram2026',
    segments: [
      { token: 'Campusgram', kind: 'account-or-service-term' },
      { token: '2026', kind: 'year' },
    ],
    expectedFound: true,
  },
  {
    label: 'account plus typical suffix',
    password: 'Campusgram123?!',
    segments: [
      { token: 'Campusgram', kind: 'account-or-service-term' },
      { token: '123?!', kind: 'typical-suffix' },
    ],
    expectedFound: true,
  },
  {
    label: 'ordinary words plus year',
    password: 'KaffeeMorgen2026',
    segments: [
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Morgen', kind: 'common-word' },
      { token: '2026', kind: 'year' },
    ],
    expectedFound: true,
  },
  {
    label: 'five words with explicit password anchor',
    password: 'KaffeeMorgenPasswortSonneLampe',
    segments: [
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Morgen', kind: 'common-word' },
      { token: 'Passwort', kind: 'common-password-core' },
      { token: 'Sonne', kind: 'common-word' },
      { token: 'Lampe', kind: 'common-word' },
    ],
    expectedFound: false,
  },
  {
    label: 'five ordinary words with one duplicate',
    password: 'KaffeeMorgenKaffeeSonneLampe',
    segments: [
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Morgen', kind: 'common-word' },
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Sonne', kind: 'common-word' },
      { token: 'Lampe', kind: 'common-word' },
    ],
    expectedFound: false,
  },
  {
    label: 'account plus four ordinary words',
    password: 'CampusgramKaffeeMorgenSonneLampe',
    segments: [
      { token: 'Campusgram', kind: 'account-or-service-term' },
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Morgen', kind: 'common-word' },
      { token: 'Sonne', kind: 'common-word' },
      { token: 'Lampe', kind: 'common-word' },
    ],
    expectedFound: false,
  },
  {
    label: 'three ordinary words remain within the generated family',
    password: 'KaffeeMorgenSonne',
    segments: [
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Morgen', kind: 'common-word' },
      { token: 'Sonne', kind: 'common-word' },
    ],
    expectedFound: true,
  },
  {
    label: 'whole repeat remains recognized',
    password: 'KaffeeKaffeeKaffeeKaffee',
    segments: [{ token: 'KaffeeKaffeeKaffeeKaffee', kind: 'repeated-component' }],
    expectedFound: true,
  },
  {
    label: 'whole keyboard path remains recognized',
    password: 'qwertzuiopasdfgh',
    segments: [{ token: 'qwertzuiopasdfgh', kind: 'keyboard-pattern' }],
    expectedFound: true,
  },
  {
    label: 'whole sequence remains recognized',
    password: 'abcdefghijklmnopqrstuvwxyz',
    segments: [
      { token: 'abcdefghijklmnopqrstuvwxyz', kind: 'simple-character-sequence' },
    ],
    expectedFound: true,
  },
  {
    label: 'five ordinary words stay unrecognized despite length',
    password: 'KaffeeMorgenSonneFensterRegen',
    segments: [
      { token: 'Kaffee', kind: 'common-word' },
      { token: 'Morgen', kind: 'common-word' },
      { token: 'Sonne', kind: 'common-word' },
      { token: 'Fenster', kind: 'common-word' },
      { token: 'Regen', kind: 'common-word' },
    ],
    expectedFound: false,
  },
];

const candidateCorpus: readonly CandidateCorpusCase[] = [
  ...directCases,
  ...wordChainCases,
  ...semanticWordChainCases,
  ...longLexicalSequenceCases,
  ...residualFoundCases,
  ...residualNotFoundCases,
  ...structuralCompositionCases,
];

describe('S05 bounded candidate corpus', () => {
  it('contains at least 100 distinct example passwords', () => {
    expect(candidateCorpus.length).toBeGreaterThanOrEqual(100);
    expect(new Set(candidateCorpus.map(({ password }) => password)).size).toBe(
      candidateCorpus.length,
    );
  });

  it.each(candidateCorpus)(
    '$label: $password',
    ({ password, segments, semanticEvidence, expectedFound }) => {
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword: password,
        componentAnalysis: analysisFromSegments(password, segments),
        ...(semanticEvidence === undefined ? {} : { semanticEvidence }),
      });
      expect(disposition.kind === 'whole-password-recognized').toBe(expectedFound);
    },
  );
});

describe('S05/S06 shared analyzer integration', () => {
  it.each([
    ['KlarissaBVBTestPasswort!', ['Campusgram'], ['Klarissa'], true],
    ['KlarissaTestPasswort!', ['Campusgram'], ['Klarissa'], true],
    ['PasswortmklhSuppe', [], [], false],
    ['PasswortSuppemlkh', [], [], false],
    ['PasswortlOtr', [], [], true],
    ['M3inPa555w0rt!?', [], [], true],
    ['KaffeeMorgen', [], [], true],
    ['LuftKroneGut', [], [], true],
    ['LuftKroneGut123!', [], [], true],
    ['LuftKroneGutAdmin', [], [], true],
    ['KaffeeMorgenSonneLampe', [], [], false],
    ['KaffeeMorgenPasswortSonneLampe', [], [], false],
    ['KaffeeMorgenPasswortSonneLampeFensterAdmin', [], [], false],
    ['KaffeeMorgenSonneLampeFenster', [], [], false],
    ['Kaffee-Morgen-Sonne-Lampe-Fenster', [], [], false],
    ['kfxqztmpvlbwhrd', [], [], false],
  ] as const)(
    'projects %s to the shared S05/S06 disposition',
    (fictionalPassword, authoredAccountTerms, transientAccountIdentifiers, expectedFound) => {
      const componentAnalysis = analyzeFictionalPassword({
        fictionalPassword,
        authoredAccountTerms,
        transientAccountIdentifiers,
      });
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword,
        componentAnalysis,
      });
      expect(disposition.kind === 'whole-password-recognized').toBe(expectedFound);
    },
  );

  it.each([
    ['Campusgram', 'Campusgram'],
    ['C4mpu5Gram!', 'C4mpu5Gram'],
  ] as const)('prefers the full account-context span in %s', (fictionalPassword, expectedToken) => {
    const result = analyzeFictionalPassword({
      fictionalPassword,
      authoredAccountTerms: ['Campusgram'],
    });
    const accountSpans = result.findings.flatMap((finding) =>
      finding.kind === 'account-or-service-term'
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token] : [],
          )
        : [],
    );
    const nestedDictionarySpans = result.findings.flatMap((finding) =>
      finding.kind === 'common-password-core' ||
      finding.kind === 'common-word' ||
      finding.kind === 'common-name'
        ? finding.evidence.flatMap((evidence) =>
            evidence.type === 'span' ? [evidence.token] : [],
          )
        : [],
    );

    expect(accountSpans).toContain(expectedToken);
    expect(nestedDictionarySpans).not.toContain('Campus');
    expect(nestedDictionarySpans).not.toContain('gram');
    expect(nestedDictionarySpans).not.toContain('Gram');
  });

  it('does not expose inner Klar/larissa fragments when Klarissa is session context', () => {
    const result = analyzeFictionalPassword({
      fictionalPassword: 'KlarissaBVBTestPasswort!',
      transientAccountIdentifiers: ['Klarissa'],
    });
    const tokens = result.findings.flatMap((finding) =>
      finding.evidence.flatMap((evidence) =>
        evidence.type === 'span' ? [evidence.token.toLocaleLowerCase('de-DE')] : [],
      ),
    );

    expect(tokens).toContain('klarissa');
    expect(
      tokens.includes('testpasswort') ||
        (tokens.includes('test') && tokens.includes('passwort')),
    ).toBe(true);
    expect(tokens).not.toContain('klar');
    expect(tokens).not.toContain('larissa');
  });
});

interface EndToEndCandidateCase {
  readonly label: string;
  readonly password: string;
  readonly authoredAccountTerms?: readonly string[];
  readonly transientAccountIdentifiers?: readonly string[];
  readonly semanticEvidence?: TransientPasswordSemanticEvidence;
  readonly expectedFound: boolean;
}

const endToEndSeparators = ['', '-', '--', '_', '#', ' '] as const;
const endToEndSteps = [1, 5, 7] as const;

const endToEndWordChainCases: readonly EndToEndCandidateCase[] = Array.from(
  { length: 36 },
  (_, index) => {
    const count = 2 + (index % 3);
    const separator = endToEndSeparators[Math.floor(index / 3) % endToEndSeparators.length] ?? '';
    const step = endToEndSteps[Math.floor(index / 12) % endToEndSteps.length] ?? 1;
    const start = index % ordinaryWords.length;
    const selected = Array.from(
      { length: count },
      (_, wordIndex) => ordinaryWords[(start + wordIndex * step) % ordinaryWords.length] ?? 'Kaffee',
    );
    const password = selected.join(separator);
    const hasConfirmedRelation = index % 2 === 0;
    return {
      label: `end-to-end ${count}-word chain ${index + 1}`,
      password,
      ...(hasConfirmedRelation
        ? {
            semanticEvidence: semanticEvidenceForTokens(
              password,
              selected,
              `semantic:end-to-end:${index}`,
            ),
          }
        : {}),
      expectedFound: count <= 3,
    };
  },
);

const endToEndLongLexicalCases: readonly EndToEndCandidateCase[] = Array.from(
  { length: 24 },
  (_, index) => {
    const count = 5 + (index % 2);
    const separator = endToEndSeparators[Math.floor(index / 2) % endToEndSeparators.length] ?? '';
    const step = endToEndSteps[Math.floor(index / 8) % endToEndSteps.length] ?? 1;
    const start = (index * 2) % ordinaryWords.length;
    const selected = Array.from(
      { length: count },
      (_, wordIndex) => ordinaryWords[(start + wordIndex * step) % ordinaryWords.length] ?? 'Kaffee',
    );
    return {
      label: `end-to-end long lexical abstention ${index + 1}`,
      password: selected.join(separator),
      expectedFound: false,
    };
  },
);

const endToEndAnchorCases: readonly EndToEndCandidateCase[] = [
  { label: 'direct password anchor', password: 'Passwort', expectedFound: true },
  { label: 'single anchor plus opaque short rest', password: 'PasswortlOtr', expectedFound: true },
  { label: 'heavily transformed full password anchor', password: 'M3inPa555w0rt!?', expectedFound: true },
  { label: 'three ordinary words', password: 'LuftKroneGut', expectedFound: true },
  { label: 'three ordinary words plus ending', password: 'LuftKroneGut123!', expectedFound: true },
  { label: 'three ordinary words plus explicit anchor', password: 'LuftKroneGutAdmin', expectedFound: true },
  { label: 'password anchor plus common ending', password: 'Passwort123?!', expectedFound: true },
  { label: 'password anchor plus five lowercase residuals', password: 'Passwortksmdl', expectedFound: true },
  {
    label: 'five lowercase residuals before password anchor',
    password: 'ksmdlPasswort',
    expectedFound: true,
  },
  { label: 'residual between password anchor and word', password: 'PasswortmklhSuppe', expectedFound: false },
  { label: 'residual after password anchor and word', password: 'PasswortSuppemlkh', expectedFound: false },
  {
    label: 'lowercase university password composition',
    password: 'meinstarkesunipasswort2026!',
    authoredAccountTerms: ['Uni', 'Universität', 'Universitaet'],
    expectedFound: false,
  },
  {
    label: 'camelcase university password composition',
    password: 'MeinStarkesUniPasswort2026!',
    authoredAccountTerms: ['Uni', 'Universität', 'Universitaet'],
    expectedFound: false,
  },
  { label: 'curated phrase without separators', password: 'ichliebedichbiszummond', expectedFound: true },
  { label: 'curated phrase in camelcase', password: 'IchLiebeDichBisZumMond', expectedFound: true },
  {
    label: 'four words with repeated separators and confirmed sentence relation',
    password: 'Ich-liebe--dich---meine',
    semanticEvidence: semanticEvidenceForTokens(
      'Ich-liebe--dich---meine',
      ['Ich', 'liebe', 'dich', 'meine'],
      'semantic:sentence:separators',
    ),
    expectedFound: false,
  },
  {
    label: 'direct account context',
    password: 'Campusgram',
    authoredAccountTerms: ['Campusgram'],
    expectedFound: true,
  },
  {
    label: 'transformed account context',
    password: 'C4mpu5Gram!',
    authoredAccountTerms: ['Campusgram'],
    expectedFound: true,
  },
  {
    label: 'account context plus year',
    password: 'Campusgram2026!',
    authoredAccountTerms: ['Campusgram'],
    expectedFound: true,
  },
  {
    label: 'short account context plus year',
    password: 'Uni2026!',
    authoredAccountTerms: ['Uni'],
    expectedFound: true,
  },
  {
    label: 'session identifier and bounded residual',
    password: 'KlarissaBVBTestPasswort!',
    transientAccountIdentifiers: ['Klarissa'],
    expectedFound: true,
  },
  {
    label: 'reordered session identifier and bounded residual',
    password: 'BVBKlarissaTestPasswort!',
    transientAccountIdentifiers: ['Klarissa'],
    expectedFound: true,
  },
  { label: 'test password plus residual', password: 'TestPasswortabcde', expectedFound: true },
  { label: 'residual before test password', password: 'abcdeTestPasswort', expectedFound: true },
  { label: 'ordinary words plus year', password: 'KaffeeMorgen2026', expectedFound: true },
  {
    label: 'combined password, number, keyboard and account anchors',
    password: 'Passwort123456789qwertzCampusgram!',
    authoredAccountTerms: ['Campusgram'],
    expectedFound: true,
  },
  {
    label: 'keyboard path between ordinary words',
    password: 'MeinqwertzStarkesPasswort',
    expectedFound: true,
  },
  { label: 'curated German compound', password: 'Datensicherheit', expectedFound: true },
  {
    label: 'confirmed short-word sentence 1',
    password: 'eisichbintotpo',
    semanticEvidence: semanticEvidenceForTokens(
      'eisichbintotpo',
      ['eis', 'ich', 'bin', 'tot', 'po'],
      'semantic:short-words:1',
    ),
    expectedFound: true,
  },
  {
    label: 'confirmed short-word sentence 2',
    password: 'ichbineineispo',
    semanticEvidence: semanticEvidenceForTokens(
      'ichbineineispo',
      ['ich', 'bin', 'ein', 'eis', 'po'],
      'semantic:short-words:2',
    ),
    expectedFound: true,
  },
  {
    label: 'confirmed short-word sentence 3',
    password: 'ichhabeineispo',
    semanticEvidence: semanticEvidenceForTokens(
      'ichhabeineispo',
      ['ich', 'habe', 'in', 'eis', 'po'],
      'semantic:short-words:3',
    ),
    expectedFound: true,
  },
  {
    label: 'confirmed short-word sentence 4',
    password: 'eisölindapo',
    semanticEvidence: semanticEvidenceForTokens(
      'eisölindapo',
      ['eis', 'öl', 'in', 'da', 'po'],
      'semantic:short-words:4',
    ),
    expectedFound: true,
  },
  { label: 'curated abbreviation LKW', password: 'LKW', expectedFound: true },
  { label: 'curated abbreviation DVD', password: 'DVD', expectedFound: true },
  { label: 'curated abbreviation LOL', password: 'LOL', expectedFound: true },
  { label: 'curated abbreviation DHL', password: 'DHL', expectedFound: true },
  {
    label: 'confirmed sentence around a password anchor',
    password: 'MeinStarkesPasswortIstGut',
    semanticEvidence: semanticEvidenceForTokens(
      'MeinStarkesPasswortIstGut',
      ['Mein', 'Starkes', 'Passwort', 'Ist', 'Gut'],
      'semantic:sentence:password-anchor',
    ),
    expectedFound: false,
  },
  {
    label: 'confirmed shared personal event with year',
    password: 'HochzeitAmSchloss1995!',
    semanticEvidence: semanticEvidenceForTokens(
      'HochzeitAmSchloss1995!',
      ['Hochzeit', 'Am', 'Schloss', '1995'],
      'semantic:content:wedding',
      'shared-content',
    ),
    expectedFound: false,
  },
];

const endToEndRepetitionCases: readonly EndToEndCandidateCase[] = [
  { label: 'single character repetition', password: 'aaaaaaaaaaaaaaa', expectedFound: true },
  { label: 'whole word repetition', password: 'KaffeeKaffeeKaffeeKaffee', expectedFound: true },
  { label: 'embedded single character repetition', password: 'IchaaaaaaaaaaaaDich', expectedFound: false },
  {
    label: 'separated repeated component',
    password: 'IchWiederholeZwischenIchWiederhole',
    expectedFound: true,
  },
  { label: 'word and numeric repetitions', password: 'haha242424haha', expectedFound: true },
  {
    label: 'leet-transformed repeated component',
    password: 'DatensicherheitDatens1cherheit',
    expectedFound: true,
  },
  {
    label: 'lowercase one-edit repeated halves',
    password: 'datensicherheitdatensxicherheit',
    expectedFound: true,
  },
  { label: 'one-edit repeated camel components', password: 'AbcdefghAbcdefgi', expectedFound: true },
  { label: 'short word repetition', password: 'SommerSommer', expectedFound: true },
  { label: 'short sequence repetition', password: 'abcabcabcabc', expectedFound: true },
  { label: 'year repetition', password: '202620262026', expectedFound: true },
  { label: 'password anchor with leet repetition', password: 'PasswortPassw0rt', expectedFound: true },
];

const endToEndNegativeCases: readonly EndToEndCandidateCase[] = [
  { label: 'random lowercase 1', password: 'kfxqztmpvlbwhrd', expectedFound: false },
  { label: 'random lowercase 2', password: 'vqmxnplkztrhbcf', expectedFound: false },
  {
    label: 'eleven residual letters after anchor exceed the boundary',
    password: 'Passwortqzmpvxtrldb',
    expectedFound: false,
  },
  {
    label: 'eleven residual letters before anchor exceed the boundary',
    password: 'qzmpvxtrldbPasswort',
    expectedFound: false,
  },
  {
    label: 'ten residual letters after account context exceed the boundary',
    password: 'Campusgramqzmpvxtrld',
    authoredAccountTerms: ['Campusgram'],
    expectedFound: false,
  },
  {
    label: 'ten residual letters before account context exceed the boundary',
    password: 'qzmpvxtrldCampusgram',
    authoredAccountTerms: ['Campusgram'],
    expectedFound: false,
  },
  {
    label: 'long passphrase remains outside despite password anchor',
    password: 'KaffeeMorgenPasswortSonneLampe',
    expectedFound: false,
  },
  {
    label: 'long passphrase remains outside despite another explicit anchor',
    password: 'KaffeeMorgenPasswortSonneLampeFensterAdmin',
    expectedFound: false,
  },
  { label: 'unsupported emoji residual', password: 'Passwort🙂', expectedFound: false },
  { label: 'random mixed-case string', password: 'QzmpvXtrldbNfgh', expectedFound: false },
  { label: 'authored random example', password: 'rQ7mL2vX9pK4', expectedFound: false },
  {
    label: 'authored mixed-symbol random example',
    password: 'rQ7!m2vX9?pK',
    expectedFound: false,
  },
];

const endToEndCandidateCorpus: readonly EndToEndCandidateCase[] = [
  ...endToEndWordChainCases,
  ...endToEndLongLexicalCases,
  ...endToEndAnchorCases,
  ...endToEndRepetitionCases,
  ...endToEndNegativeCases,
];

describe('S05/S06 end-to-end candidate corpus', () => {
  it('contains at least 100 distinct passwords evaluated through the real analyzer', () => {
    expect(endToEndCandidateCorpus.length).toBeGreaterThanOrEqual(100);
    expect(new Set(endToEndCandidateCorpus.map(({ password }) => password)).size).toBe(
      endToEndCandidateCorpus.length,
    );
  });

  it.each(endToEndCandidateCorpus)(
    '$label: $password',
    ({
      password,
      authoredAccountTerms = [],
      transientAccountIdentifiers = [],
      semanticEvidence,
      expectedFound,
    }) => {
      const componentAnalysis = analyzeFictionalPassword({
        fictionalPassword: password,
        authoredAccountTerms,
        transientAccountIdentifiers,
      });
      const disposition = determinePasswordSimulationDisposition({
        fictionalPassword: password,
        componentAnalysis,
        ...(semanticEvidence === undefined ? {} : { semanticEvidence }),
      });

      expect(disposition.kind === 'whole-password-recognized').toBe(expectedFound);
      expect(disposition.analysisVersion).toBe('passwo-bounded-whole-recognition-v20');
    },
  );
});
