import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  PasswordGuessPathMatch,
  PasswordGuessPathPattern,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
  PasswordStructureAnalysisResult,
  RuntimeStructureFinding,
} from '@passwo/contracts';
import { Options, type OptionsDictionary, ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnDePackage from '@zxcvbn-ts/language-de';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

import {
  findCaseInsensitiveSpans,
  normalizeCaseWithOriginalOffsets,
  originalSpanForNormalizedRange,
} from './case-insensitive-spans.js';

export const PASSWORD_ANALYSIS_CONFIGURATION_VERSION = 'passwo-bounded-whole-recognition-v20';

export interface FictionalPasswordAnalysisInput {
  readonly fictionalPassword: string;
  /** Versioned service and account terms from the authored training content. */
  readonly authoredAccountTerms?: readonly string[];
  /** Transient fictional identifiers derived for this training session; never persisted. */
  readonly transientAccountIdentifiers?: readonly string[];
}

export interface FictionalPasswordStructureAnalysisInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
}

type Dictionary = Readonly<Record<string, readonly (string | number)[]>>;

function mergeDictionaries(...dictionaries: readonly Dictionary[]): OptionsDictionary {
  const merged: OptionsDictionary = {};
  for (const dictionary of dictionaries) {
    for (const [name, values] of Object.entries(dictionary)) {
      const target = merged[name] ?? [];
      target.push(...values);
      merged[name] = target;
    }
  }
  return merged;
}

const zxcvbnDictionary = mergeDictionaries(
  zxcvbnCommonPackage.dictionary,
  zxcvbnDePackage.dictionary,
  zxcvbnEnPackage.dictionary,
);

const zxcvbnFactory = new ZxcvbnFactory({
  translations: zxcvbnDePackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: zxcvbnDictionary,
  maxLength: 128,
  useLevenshteinDistance: false,
});

const zxcvbnPatternFactory = new ZxcvbnFactory({
  translations: zxcvbnDePackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {},
  maxLength: 128,
  useLevenshteinDistance: false,
});

// The authored matcher deliberately shares the frozen zxcvbn substitution vocabulary. It adds
// bounded explanatory evidence without turning the training into a numerical strength estimator.
const zxcvbnOptions = new Options();
const zxcvbnLeetTable = zxcvbnOptions.l33tTable;
const zxcvbnSubstitutionsByCharacter: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(zxcvbnLeetTable),
);

interface PredictableWordSequenceVocabulary {
  readonly name: string;
  readonly positions: ReadonlyMap<string, number>;
}

const predictableWordSequenceVocabularies: readonly PredictableWordSequenceVocabulary[] =
  Object.entries(zxcvbnDictionary).flatMap(([name, values]) => {
    if (!zxcvbnOptions.isWordSequence(name)) return [];
    const positions = new Map<string, number>();
    for (const [index, value] of values.entries()) {
      if (typeof value !== 'string') continue;
      const normalized = value.normalize('NFC').toLocaleLowerCase('de-DE');
      if (!positions.has(normalized)) positions.set(normalized, index);
    }
    return positions.size >= 2 ? [{ name, positions }] : [];
  });

type ZxcvbnResult = ReturnType<typeof zxcvbnFactory.check>;
type ZxcvbnMatch = ZxcvbnResult['sequence'][number];

const findingPriority: Readonly<Record<PasswordSingleFindingKind, number>> = {
  'common-password-core': 0,
  'account-or-service-term': 1,
  'common-name': 2,
  'common-word': 3,
  'keyboard-pattern': 4,
  year: 5,
  date: 6,
  'simple-character-sequence': 7,
  'predictable-word-sequence': 8,
  'repeated-component': 9,
  'typical-transformation': 10,
  'typical-suffix': 11,
  'no-simple-component-recognized': 12,
};

function evidenceSpan(input: string, start: number, end: number): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: input.slice(start, end) };
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null) return {};
  // The upstream union exposes matcher-specific fields through an index signature.
  // This guarded cast is confined to the zxcvbn adapter boundary.
  return value as Readonly<Record<string, unknown>>;
}

function stringProperty(value: unknown, name: string): string | null {
  const property = asRecord(value)[name];
  return typeof property === 'string' ? property : null;
}

function stringArrayProperty(value: unknown, name: string): readonly string[] | null {
  const property = asRecord(value)[name];
  return Array.isArray(property) && property.every((item) => typeof item === 'string')
    ? property
    : null;
}

function booleanProperty(value: unknown, name: string): boolean {
  return asRecord(value)[name] === true;
}

function matchPattern(match: ZxcvbnMatch): PasswordGuessPathPattern {
  switch (match.pattern) {
    case 'dictionary':
      return 'dictionary';
    case 'spatial':
      return 'keyboard';
    case 'repeat':
      return 'repeat';
    case 'sequence':
    case 'wordSequence':
      return 'sequence';
    case 'date':
    case 'regex':
      return 'date';
    case 'bruteforce':
      return 'brute-force';
    case 'separator':
      return 'separator';
    default:
      return 'other';
  }
}

function matchSourceId(match: ZxcvbnMatch): string | null {
  if (match.pattern === 'dictionary') {
    return stringProperty(match, 'dictionaryName');
  }
  if (match.pattern === 'wordSequence') {
    const words = stringArrayProperty(match, 'words');
    return words === null ? null : contiguousPredictableVocabularyName(words);
  }
  if (match.pattern === 'regex') return stringProperty(match, 'regexName');
  if (match.pattern === 'spatial') return stringProperty(match, 'graph');
  return null;
}

function projectGuessPathMatch(match: ZxcvbnMatch): PasswordGuessPathMatch {
  const repeatMetadata =
    match.pattern === 'repeat' &&
    typeof match.baseToken === 'string' &&
    match.baseToken.length > 0 &&
    Number.isInteger(match.repeatCount) &&
    match.repeatCount >= 2 &&
    match.baseToken.repeat(match.repeatCount) === match.token
      ? { baseToken: match.baseToken, repeatCount: match.repeatCount }
      : {};
  return {
    pattern: matchPattern(match),
    start: match.i,
    end: match.j + 1,
    sourceId: matchSourceId(match),
    ...repeatMetadata,
  };
}

function finding(
  input: string,
  kind: Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>,
  start: number,
  end: number,
  confidence: PasswordSingleFinding['confidence'] = 'bounded-heuristic',
  ordinal = 0,
): PasswordSingleFinding {
  return {
    id: `single:${kind}:${start}-${end}:${ordinal}`,
    kind,
    evidence: [evidenceSpan(input, start, end)],
    explanationId: `s05.${kind}`,
    confidence,
  };
}

function dictionaryFindingKind(
  match: ZxcvbnMatch,
): Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'> {
  const dictionaryName = (stringProperty(match, 'dictionaryName') ?? '').toLocaleLowerCase('en-US');
  return dictionaryNameFindingKind(dictionaryName);
}

function dictionaryNameFindingKind(
  dictionaryName: string,
): Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'> {
  if (dictionaryName === 'userinputs') return 'account-or-service-term';
  if (dictionaryName.includes('password')) return 'common-password-core';
  if (
    dictionaryName.includes('name') ||
    dictionaryName.includes('surname') ||
    dictionaryName.includes('first') ||
    dictionaryName.includes('last')
  ) {
    return 'common-name';
  }
  return 'common-word';
}

const supplementalDictionaryPriority: Readonly<Record<PasswordSingleFindingKind, number>> = {
  ...findingPriority,
  'common-password-core': 0,
  'common-word': 1,
  'common-name': 2,
};

type SupplementalLanguage = 'de' | 'en';

const explicitPasswordAnchorTokenValues = [
  'admin',
  'geheim',
  'kennwort',
  'letmein',
  'login',
  'meinpasswort',
  'master',
  'mypassword',
  'password',
  'passwort',
  'secret',
  'starkespasswort',
  'strongpassword',
  'test',
  'testpassword',
  'testpasswort',
  'welcome',
  'willkommen',
] as const;

const explicitPasswordAnchorTokens = new Set<string>(explicitPasswordAnchorTokenValues);

export function isExplicitPasswordAnchorToken(token: string): boolean {
  return explicitPasswordAnchorTokens.has(token.toLocaleLowerCase('de-DE'));
}

const curatedShortAbbreviationTokens = new Set([
  'bvb',
  'cd',
  'dhl',
  'dvd',
  'faq',
  'fcb',
  'html',
  'lan',
  'lkw',
  'lol',
  'nrw',
  'omg',
  'pdf',
  'pkw',
  'uni',
  'usb',
  'wlan',
]);

// These are confirmed source-corpus artefacts rather than ordinary German or English words. The
// set is a denylist discovered by auditing the frozen zxcvbn corpora; it does not replace the broad
// source dictionaries with a small positive allowlist.
const auditedCommonWordCorpusArtifacts = new Set([
  'aii',
  'chte',
  'fãœr',
  'hlen',
  'ndert',
  'stiii',
  'tte',
  'ttest',
  'unh',
]);

interface OrdinaryWordRankLimits {
  readonly twoCodePoints: number;
  readonly threeCodePoints: number;
  readonly fourCodePoints: number;
  readonly fiveCodePoints: number;
  readonly longer: number;
}

// The zxcvbn common-word corpora are frequency ordered but their low-frequency tails contain
// subtitle fragments, mojibake, names, and corpus labels. These frozen ceilings retain broad
// everyday vocabulary while refusing to treat every corpus entry as a learner-facing word.
const ordinaryWordRankLimits: Readonly<Record<SupplementalLanguage, OrdinaryWordRankLimits>> = {
  de: {
    twoCodePoints: 8_000,
    threeCodePoints: 5_000,
    fourCodePoints: 10_000,
    fiveCodePoints: 15_000,
    longer: 22_000,
  },
  en: {
    twoCodePoints: 8_000,
    threeCodePoints: 8_000,
    fourCodePoints: 15_000,
    fiveCodePoints: 20_000,
    longer: 40_000,
  },
};

const curatedGermanCompoundTokens = new Set([
  'benutzerkonto',
  'datensicherheit',
  'datenschutz',
  'onlinekonto',
  'passwortsicherheit',
]);

function normalizedOrdinaryWordToken(
  value: string,
  language: SupplementalLanguage,
): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase(language === 'de' ? 'de-DE' : 'en-US');
}

function ordinaryWordRankLimit(
  language: SupplementalLanguage,
  codePointLength: number,
): number {
  const limits = ordinaryWordRankLimits[language];
  if (codePointLength === 2) return limits.twoCodePoints;
  if (codePointLength === 3) return limits.threeCodePoints;
  if (codePointLength === 4) return limits.fourCodePoints;
  if (codePointLength === 5) return limits.fiveCodePoints;
  return limits.longer;
}

function isOrthographicallyPlausibleOrdinaryWord(
  token: string,
  language: SupplementalLanguage,
): boolean {
  const allowedLetters = language === 'de' ? /^[a-zäöüß]+$/u : /^[a-z]+$/u;
  const vowel = language === 'de' ? /[aeiouyäöü]/u : /[aeiouy]/u;
  return (
    allowedLetters.test(token) &&
    vowel.test(token) &&
    !auditedCommonWordCorpusArtifacts.has(token)
  );
}

function collectRankedCommonWordTokens(
  dictionary: Dictionary,
  language: SupplementalLanguage,
): ReadonlySet<string> {
  const dictionaryName = `commonWords-${language}`;
  const values = dictionary[dictionaryName] ?? [];
  const tokens = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (typeof value !== 'string') continue;
    const normalized = normalizedOrdinaryWordToken(value, language);
    const codePointLength = [...normalized].length;
    if (codePointLength < 2) continue;
    if (!isOrthographicallyPlausibleOrdinaryWord(normalized, language)) continue;
    if (index + 1 > ordinaryWordRankLimit(language, codePointLength)) continue;
    tokens.add(normalized);
  }
  return tokens;
}

function collectStructuredVocabularyTokens(
  dictionary: Dictionary,
  language: SupplementalLanguage,
): ReadonlySet<string> {
  const tokens = new Set<string>();
  for (const [dictionaryName, values] of Object.entries(dictionary)) {
    const normalizedDictionaryName = dictionaryName.toLocaleLowerCase('en-US');
    if (
      normalizedDictionaryName.includes('commonwords') ||
      normalizedDictionaryName.includes('wikipedia') ||
      normalizedDictionaryName.includes('firstname') ||
      normalizedDictionaryName.includes('lastname')
    ) {
      continue;
    }
    for (const value of values) {
      if (typeof value !== 'string') continue;
      const normalized = normalizedOrdinaryWordToken(value, language);
      if ([...normalized].length < 2) continue;
      if (isOrthographicallyPlausibleOrdinaryWord(normalized, language)) {
        tokens.add(normalized);
      }
    }
  }
  return tokens;
}

function collectAlphabeticDictionaryTokens(
  dictionary: Dictionary,
  includeDictionary: (dictionaryName: string) => boolean,
  minimumCodePointLength: number,
): ReadonlySet<string> {
  const tokens = new Set<string>();
  for (const [dictionaryName, values] of Object.entries(dictionary)) {
    const normalizedDictionaryName = dictionaryName.toLocaleLowerCase('en-US');
    if (!includeDictionary(normalizedDictionaryName)) continue;
    for (const value of values) {
      if (typeof value !== 'string') continue;
      const normalized = value.toLocaleLowerCase('de-DE');
      if (!/^\p{L}+$/u.test(normalized)) continue;
      if ([...normalized].length >= minimumCodePointLength) {
        tokens.add(normalized);
      }
    }
  }
  return tokens;
}

const supplementalPasswordTokens = collectAlphabeticDictionaryTokens(
  zxcvbnCommonPackage.dictionary,
  (dictionaryName) => dictionaryName.includes('password'),
  4,
);

const supplementalWordsByLanguage: Readonly<Record<SupplementalLanguage, ReadonlySet<string>>> = {
  de: new Set([
    ...collectRankedCommonWordTokens(zxcvbnDePackage.dictionary, 'de'),
    ...collectStructuredVocabularyTokens(zxcvbnDePackage.dictionary, 'de'),
    ...curatedShortAbbreviationTokens,
    ...curatedGermanCompoundTokens,
  ]),
  en: new Set([
    ...collectRankedCommonWordTokens(zxcvbnEnPackage.dictionary, 'en'),
    ...collectStructuredVocabularyTokens(zxcvbnEnPackage.dictionary, 'en'),
    ...curatedShortAbbreviationTokens,
  ]),
};

const approvedOrdinaryWordTokens = new Set([
  ...supplementalWordsByLanguage.de,
  ...supplementalWordsByLanguage.en,
]);

function isApprovedDictionaryMatch(match: ZxcvbnMatch): boolean {
  if (match.pattern !== 'dictionary' || dictionaryFindingKind(match) !== 'common-word') {
    return true;
  }
  const matchedWord = stringProperty(match, 'matchedWord') ?? match.token;
  const normalizedGerman = normalizedOrdinaryWordToken(matchedWord, 'de');
  const normalizedEnglish = normalizedOrdinaryWordToken(matchedWord, 'en');
  return (
    approvedOrdinaryWordTokens.has(normalizedGerman) ||
    approvedOrdinaryWordTokens.has(normalizedEnglish)
  );
}

const deterministicKeyboardRows = [
  '1234567890',
  'qwertzuiop',
  'asdfghjkl',
  'yxcvbnm',
  'qwertyuiop',
  'zxcvbnm',
] as const;

function createDeterministicKeyboardTokens(): readonly string[] {
  const tokens = new Set<string>();
  for (const row of deterministicKeyboardRows) {
    for (const direction of [row, [...row].reverse().join('')]) {
      for (let start = 0; start < direction.length; start += 1) {
        for (let end = start + 5; end <= direction.length; end += 1) {
          tokens.add(direction.slice(start, end));
        }
      }
    }
  }
  return [...tokens].sort((left, right) => right.length - left.length || left.localeCompare(right));
}

const deterministicKeyboardTokens = createDeterministicKeyboardTokens();

function collectDeterministicKeyboardFindings(input: string): readonly PasswordSingleFinding[] {
  const candidateSpans = deterministicKeyboardTokens.flatMap((token) =>
    findCaseInsensitiveSpans(input, token).map(([start, end]) => ({ start, end })),
  );
  const maximalSpans = candidateSpans
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .filter(
      (span, index, spans) =>
        !spans.some(
          (candidate, candidateIndex) =>
            candidateIndex !== index &&
            candidate.start <= span.start &&
            candidate.end >= span.end &&
            candidate.end - candidate.start > span.end - span.start,
        ),
    )
    .filter(
      (span, index, spans) =>
        spans.findIndex(
          (candidate) => candidate.start === span.start && candidate.end === span.end,
        ) === index,
    );
  return maximalSpans.map(({ start, end }, ordinal) =>
    finding(input, 'keyboard-pattern', start, end, 'bounded-heuristic', 10_000 + ordinal),
  );
}

function isConnector(character: string | undefined): boolean {
  return character !== undefined && !/[\p{L}\p{N}]/u.test(character);
}

interface LetterRunCharacter {
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

function letterRunCharacters(run: string): readonly LetterRunCharacter[] {
  const characters: LetterRunCharacter[] = [];
  let offset = 0;
  for (const value of run) {
    const start = offset;
    offset += value.length;
    characters.push({ value, start, end: offset });
  }
  return characters;
}

function isUppercaseLetter(value: string | undefined): boolean {
  return value !== undefined && /^\p{Lu}$/u.test(value);
}

function isLowercaseLetter(value: string | undefined): boolean {
  return value !== undefined && /^\p{Ll}$/u.test(value);
}

/**
 * Returns only boundaries that are visible in the original spelling. This deliberately does not
 * split arbitrary inner dictionary substrings. It supports CamelCase and acronym-to-word changes
 * such as `Klarissa|BVB|Test|Passwort` while keeping `K|larissa` unsupported.
 */
function letterRunBoundaries(run: string): ReadonlySet<number> {
  const characters = letterRunCharacters(run);
  const boundaries = new Set<number>([0, run.length]);
  for (let index = 1; index < characters.length; index += 1) {
    const previous = characters[index - 1]?.value;
    const current = characters[index]?.value;
    const next = characters[index + 1]?.value;
    if (
      (isLowercaseLetter(previous) && isUppercaseLetter(current)) ||
      (isUppercaseLetter(previous) && isUppercaseLetter(current) && isLowercaseLetter(next))
    ) {
      const boundary = characters[index]?.start;
      if (boundary !== undefined) boundaries.add(boundary);
    }
  }
  return boundaries;
}

/**
 * Returns component boundaries that can be justified from the spelling itself. Besides connectors,
 * this includes letter-number transitions and the CamelCase/acronym boundaries used by the local
 * dictionary partitioner. Arbitrary inner offsets are deliberately excluded.
 */
function visibleComponentBoundaryOffsets(input: string): ReadonlySet<number> {
  const boundaries = new Set<number>([0, input.length]);
  for (const match of input.matchAll(/\p{L}+/gu)) {
    const runStart = match.index;
    for (const boundary of letterRunBoundaries(match[0])) {
      boundaries.add(runStart + boundary);
    }
  }
  for (const match of input.matchAll(/\p{N}+/gu)) {
    boundaries.add(match.index);
    boundaries.add(match.index + match[0].length);
  }
  return boundaries;
}

function componentBoundaryOffsets(
  input: string,
  trustedFindings: readonly PasswordSingleFinding[] = [],
): ReadonlySet<number> {
  const boundaries = new Set(visibleComponentBoundaryOffsets(input));
  for (const item of trustedFindings) {
    if (item.segmentationRole === 'candidate-only') continue;
    for (const evidence of item.evidence) {
      if (evidence.type !== 'span') continue;
      boundaries.add(evidence.start);
      boundaries.add(evidence.end);
    }
  }
  return boundaries;
}

function normalizedPredictableSequenceToken(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('de-DE')
    .replace(/[\s._-]+/gu, '');
}

function contiguousPredictableVocabularyName(words: readonly string[]): string | null {
  const normalizedWords = words.map((word) =>
    word.normalize('NFC').toLocaleLowerCase('de-DE'),
  );
  for (const { name, positions } of predictableWordSequenceVocabularies) {
    const indices = normalizedWords.map((word) => positions.get(word));
    if (indices.some((index) => index === undefined)) continue;
    const first = indices[0];
    const second = indices[1];
    if (first === undefined || second === undefined) continue;
    const step = second - first;
    if (Math.abs(step) !== 1) continue;
    if (
      indices.every(
        (index, wordIndex) => index !== undefined && index === first + wordIndex * step,
      )
    ) {
      return name;
    }
  }
  return null;
}

/**
 * zxcvbn-ts' word-sequence matcher can join dictionary hits from unrelated sequence lists and
 * loses whether an individual word was reversed or written in l33t. Treat its output as a
 * candidate only: the visible token must spell adjacent entries from one frozen vocabulary and
 * must start and end at defensible component boundaries.
 */
function isSupportedPredictableWordSequenceMatch(
  input: string,
  match: ZxcvbnMatch,
  offset = 0,
): boolean {
  if (match.pattern !== 'wordSequence') return true;
  const words = stringArrayProperty(match, 'words');
  if (words === null || words.length < 2) return false;
  const wordCount = asRecord(match).wordCount;
  if (typeof wordCount === 'number' && wordCount !== words.length) return false;

  const start = offset + match.i;
  const end = offset + match.j + 1;
  if (start < 0 || end > input.length || start >= end) return false;
  const token = input.slice(start, end);
  const directWords = words.map(normalizedPredictableSequenceToken).join('');
  if (normalizedPredictableSequenceToken(token) !== directWords) return false;
  if (contiguousPredictableVocabularyName(words) === null) return false;

  const boundaries = visibleComponentBoundaryOffsets(input);
  return boundaries.has(start) && boundaries.has(end);
}

function dictionarySpanHasSupportedBoundary(
  run: string,
  kind: 'common-password-core' | 'common-word' | 'common-name',
  start: number,
  end: number,
  additionalBoundaries: ReadonlySet<number> = new Set(),
): boolean {
  if (start === 0 && end === run.length) return true;
  const boundaries = new Set([...letterRunBoundaries(run), ...additionalBoundaries]);
  const startsAtBoundary = boundaries.has(start);
  const endsAtBoundary = boundaries.has(end);
  if (startsAtBoundary && endsAtBoundary) return true;

  // Names are too collision-prone to use as free inner fragments. They remain available as an
  // entire visible segment or through authored transient context, but not as a partial spelling
  // such as `ZumMo` inside `ZumMond`.
  if (kind === 'common-name') return false;

  // Password-list cores remain useful anchors when a short free variation is appended or
  // prepended. A one-sided anchor must not cross another visible boundary because that would
  // turn an inner collision such as `tRot` across `Ist|Rot` into a synthetic component.
  if (kind === 'common-password-core') {
    const crossesSupportedBoundary = [...boundaries].some(
      (boundary) => boundary > start && boundary < end,
    );
    if (crossesSupportedBoundary) return false;
    return startsAtBoundary || endsAtBoundary;
  }
  return (startsAtBoundary && start > 0) || (endsAtBoundary && end < run.length);
}

function dictionarySpanCrossesSupportedBoundary(
  run: string,
  start: number,
  end: number,
  additionalBoundaries: ReadonlySet<number> = new Set(),
): boolean {
  return [...letterRunBoundaries(run), ...additionalBoundaries].some(
    (boundary) => boundary > start && boundary < end,
  );
}

function containingLetterRun(
  input: string,
  start: number,
  end: number,
): { readonly run: string; readonly start: number } | null {
  for (const match of input.matchAll(/\p{L}+/gu)) {
    const runStart = match.index;
    const runEnd = runStart + match[0].length;
    if (start >= runStart && end <= runEnd) return { run: match[0], start: runStart };
  }
  return null;
}

function filterUnsupportedGuessPathDictionaryFragments(
  input: string,
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const retainedDictionaryRanges = new Set<string>();
  const initiallyRetained = findings.filter((item) => {
    if (
      item.kind !== 'common-password-core' &&
      item.kind !== 'common-word' &&
      item.kind !== 'common-name'
    ) {
      return true;
    }
    const kind = item.kind;
    const spans = item.evidence.filter(
      (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
    );
    const supported = spans.some((span) => {
      const codePointLength = [...span.token].length;
      if (codePointLength < 4 && !/^\p{L}{2,3}$/u.test(span.token)) return false;
      const run = containingLetterRun(input, span.start, span.end);
      if (run === null) return true;
      const relativeStart = span.start - run.start;
      const relativeEnd = span.end - run.start;
      if (codePointLength < 4) {
        const boundaries = letterRunBoundaries(run.run);
        return boundaries.has(relativeStart) && boundaries.has(relativeEnd);
      }
      return dictionarySpanHasSupportedBoundary(
        run.run,
        kind,
        relativeStart,
        relativeEnd,
      );
    });
    if (supported) {
      for (const span of spans) retainedDictionaryRanges.add(`${span.start}:${span.end}`);
    }
    return supported;
  });

  return initiallyRetained.filter((item) => {
    if (item.kind !== 'typical-transformation') return true;
    return item.evidence.some(
      (evidence) =>
        evidence.type === 'span' && retainedDictionaryRanges.has(`${evidence.start}:${evidence.end}`),
    );
  });
}

function filterUnsupportedAccountTermFindings(
  findings: readonly PasswordSingleFinding[],
  supportedBoundaries: ReadonlySet<number>,
): readonly PasswordSingleFinding[] {
  return findings.filter((item) => {
    if (item.kind !== 'account-or-service-term') return true;
    const spans = item.evidence.filter(
      (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
    );
    return (
      spans.length > 0 &&
      spans.every(
        (span) => supportedBoundaries.has(span.start) && supportedBoundaries.has(span.end),
      )
    );
  });
}

interface DictionaryPartitionPart {
  readonly start: number;
  readonly end: number;
  readonly kind: 'common-password-core' | 'common-word';
  readonly codePointLength: number;
}

interface GuessPathDictionarySpan {
  readonly kind: 'common-password-core' | 'common-word' | 'common-name';
  readonly span: PasswordEvidenceSpan;
}

interface DictionaryPartitionProjection {
  readonly findings: readonly PasswordSingleFinding[];
  readonly candidateOnlyRanges: ReadonlySet<string>;
}

function evidenceRangeKey(start: number, end: number): string {
  return `${start}:${end}`;
}

function compareDictionaryPartitions(
  left: readonly DictionaryPartitionPart[],
  right: readonly DictionaryPartitionPart[],
): number {
  if (left.length !== right.length) return left.length - right.length;
  const leftPriority = left.reduce(
    (total, part) => total + supplementalDictionaryPriority[part.kind],
    0,
  );
  const rightPriority = right.reduce(
    (total, part) => total + supplementalDictionaryPriority[part.kind],
    0,
  );
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;
  for (let index = 0; index < left.length; index += 1) {
    const leftLength = (left[index]?.end ?? 0) - (left[index]?.start ?? 0);
    const rightLength = (right[index]?.end ?? 0) - (right[index]?.start ?? 0);
    if (leftLength !== rightLength) return rightLength - leftLength;
  }
  return 0;
}

function dictionaryPartitionKind(
  token: string,
  language: SupplementalLanguage,
): DictionaryPartitionPart['kind'] | null {
  const isOrdinaryWord = supplementalWordsByLanguage[language].has(token);
  const isPasswordValue = supplementalPasswordTokens.has(token);
  if (isPasswordValue && (!isOrdinaryWord || isExplicitPasswordAnchorToken(token))) {
    return 'common-password-core';
  }
  if (isOrdinaryWord) return 'common-word';
  return isPasswordValue ? 'common-password-core' : null;
}

function normalizedBoundaryForOriginalOffset(
  normalized: ReturnType<typeof normalizeCaseWithOriginalOffsets>,
  originalOffset: number,
  originalLength: number,
): number | null {
  if (originalOffset === 0) return 0;
  if (originalOffset === originalLength) return normalized.value.length;
  const startIndex = normalized.originalStartByCodeUnit.findIndex(
    (candidate) => candidate === originalOffset,
  );
  if (startIndex >= 0) return startIndex;
  const endIndex = normalized.originalEndByCodeUnit.lastIndexOf(originalOffset);
  return endIndex < 0 ? null : endIndex + 1;
}

function partitionCandidatesForLanguage(
  normalizedValue: string,
  normalizedStarts: ReadonlySet<number>,
  normalizedEnds: ReadonlySet<number>,
  language: SupplementalLanguage,
  protectedBoundaries: ReadonlySet<number> = new Set(),
): ReadonlyMap<number, readonly DictionaryPartitionPart[]> {
  const candidatesByStart = new Map<number, DictionaryPartitionPart[]>();
  for (const normalizedStart of normalizedStarts) {
    for (const normalizedEnd of normalizedEnds) {
      if (normalizedEnd <= normalizedStart) continue;
      const crossesProtectedBoundary = [...protectedBoundaries].some(
        (boundary) => boundary > normalizedStart && boundary < normalizedEnd,
      );
      if (
        crossesProtectedBoundary &&
        (!protectedBoundaries.has(normalizedStart) || !protectedBoundaries.has(normalizedEnd))
      ) {
        continue;
      }
      const token = normalizedValue.slice(normalizedStart, normalizedEnd);
      const kind = dictionaryPartitionKind(token, language);
      if (kind === null) continue;
      const candidates = candidatesByStart.get(normalizedStart) ?? [];
      if (!candidates.some((candidate) => candidate.end === normalizedEnd && candidate.kind === kind)) {
        candidates.push({
          start: normalizedStart,
          end: normalizedEnd,
          kind,
          codePointLength: [...token].length,
        });
        candidatesByStart.set(normalizedStart, candidates);
      }
    }
  }
  return candidatesByStart;
}

/**
 * A password-list value may be useful as one attack candidate without being a meaningful visible
 * component. Split it only when the original spelling exposes at least one boundary, every visible
 * part is an ordinary word in the same language, and the complete value is not itself an ordinary
 * German or English word. The whole-word guard keeps values such as `Maiden` or `MaiDen` intact.
 */
function hasMonolingualVisibleWordPartition(
  normalizedValue: string,
  start: number,
  end: number,
  visibleLexicalBoundaries: ReadonlySet<number>,
): boolean {
  const internalBoundaries = [...visibleLexicalBoundaries]
    .filter((boundary) => boundary > start && boundary < end)
    .sort((left, right) => left - right);
  if (internalBoundaries.length === 0) return false;

  const completeToken = normalizedValue.slice(start, end);
  if (approvedOrdinaryWordTokens.has(completeToken)) return false;

  const boundaries = [start, ...internalBoundaries, end];
  return (['de', 'en'] as const).some((language) =>
    boundaries.slice(0, -1).every((partStart, index) => {
      const partEnd = boundaries[index + 1];
      return (
        partEnd !== undefined &&
        supplementalWordsByLanguage[language].has(normalizedValue.slice(partStart, partEnd))
      );
    }),
  );
}

function collectCandidateOnlyPasswordRanges(
  normalizedValue: string,
  candidatesByLanguage: Readonly<
    Record<SupplementalLanguage, ReadonlyMap<number, readonly DictionaryPartitionPart[]>>
  >,
  visibleLexicalBoundaries: ReadonlySet<number>,
): ReadonlySet<string> {
  const ranges = new Set<string>();
  for (const language of ['de', 'en'] as const) {
    for (const candidates of candidatesByLanguage[language].values()) {
      for (const candidate of candidates) {
        if (candidate.kind !== 'common-password-core') continue;
        if (
          hasMonolingualVisibleWordPartition(
            normalizedValue,
            candidate.start,
            candidate.end,
            visibleLexicalBoundaries,
          )
        ) {
          ranges.add(evidenceRangeKey(candidate.start, candidate.end));
        }
      }
    }
  }
  return ranges;
}

function omitCandidateOnlyPasswordRanges(
  candidatesByStart: ReadonlyMap<number, readonly DictionaryPartitionPart[]>,
  candidateOnlyRanges: ReadonlySet<string>,
): ReadonlyMap<number, readonly DictionaryPartitionPart[]> {
  const retained = new Map<number, readonly DictionaryPartitionPart[]>();
  for (const [start, candidates] of candidatesByStart) {
    const filtered = candidates.filter(
      (candidate) =>
        candidate.kind !== 'common-password-core' ||
        !candidateOnlyRanges.has(evidenceRangeKey(candidate.start, candidate.end)),
    );
    if (filtered.length > 0) retained.set(start, filtered);
  }
  return retained;
}

function bestDictionaryPartition(
  candidatesByStart: ReadonlyMap<number, readonly DictionaryPartitionPart[]>,
  start: number,
  end: number,
): readonly DictionaryPartitionPart[] | null {
  const bestFrom = new Map<number, readonly DictionaryPartitionPart[] | null>();
  const partitionFrom = (offset: number): readonly DictionaryPartitionPart[] | null => {
    if (offset === end) return [];
    if (offset > end) return null;
    const cached = bestFrom.get(offset);
    if (cached !== undefined) return cached;
    let best: readonly DictionaryPartitionPart[] | null = null;
    for (const candidate of candidatesByStart.get(offset) ?? []) {
      if (candidate.end > end) continue;
      const remainder = partitionFrom(candidate.end);
      if (remainder === null) continue;
      const partition = [candidate, ...remainder];
      if (best === null || compareDictionaryPartitions(partition, best) < 0) best = partition;
    }
    bestFrom.set(offset, best);
    return best;
  };
  return partitionFrom(start);
}

function bestLanguagePartition(
  candidatesByLanguage: Readonly<
    Record<SupplementalLanguage, ReadonlyMap<number, readonly DictionaryPartitionPart[]>>
  >,
  start: number,
  end: number,
): readonly DictionaryPartitionPart[] | null {
  let best: readonly DictionaryPartitionPart[] | null = null;
  for (const language of ['de', 'en'] as const) {
    const partition = bestDictionaryPartition(candidatesByLanguage[language], start, end);
    if (partition !== null && (best === null || compareDictionaryPartitions(partition, best) < 0)) {
      best = partition;
    }
  }
  return best;
}

function collectDictionaryPartitionFindings(
  input: string,
  guessPathFindings: readonly PasswordSingleFinding[],
  structuralBoundaryFindings: readonly PasswordSingleFinding[] = [],
): DictionaryPartitionProjection {
  const findings: PasswordSingleFinding[] = [];
  const candidateOnlyRanges = new Set<string>();
  const guessPathSpans: GuessPathDictionarySpan[] = [];
  for (const item of guessPathFindings) {
    if (
      item.kind !== 'common-password-core' &&
      item.kind !== 'common-word' &&
      item.kind !== 'common-name'
    ) {
      continue;
    }
    const kind = item.kind;
    for (const evidence of item.evidence) {
      if (evidence.type === 'span') guessPathSpans.push({ kind, span: evidence });
    }
  }

  for (const runMatch of input.matchAll(/\p{L}+/gu)) {
    const run = runMatch[0];
    const runStart = runMatch.index;
    const runEnd = runStart + run.length;
    const normalizedRun = normalizeCaseWithOriginalOffsets(run);
    const before = runStart === 0 ? undefined : input.slice(0, runStart).at(-1);
    const after = runEnd === input.length ? undefined : input.slice(runEnd)[0];
    const connectorBound = isConnector(before) || isConnector(after);
    const additionalOriginalBoundaries = new Set<number>();
    for (const item of structuralBoundaryFindings) {
      for (const evidence of item.evidence) {
        if (
          evidence.type === 'span' &&
          evidence.start >= runStart &&
          evidence.end <= runEnd
        ) {
          additionalOriginalBoundaries.add(evidence.start - runStart);
          additionalOriginalBoundaries.add(evidence.end - runStart);
        }
      }
    }
    const visibleLexicalOriginalBoundaries = letterRunBoundaries(run);
    const supportedOriginalBoundaries = new Set([
      ...visibleLexicalOriginalBoundaries,
      ...additionalOriginalBoundaries,
    ]);
    const normalizedStarts = new Set<number>([0]);
    const normalizedEnds = new Set<number>([normalizedRun.value.length]);
    for (let index = 1; index < normalizedRun.value.length; index += 1) {
      if (
        normalizedRun.originalStartByCodeUnit[index] !==
        normalizedRun.originalStartByCodeUnit[index - 1]
      ) {
        normalizedStarts.add(index);
      }
      if (
        normalizedRun.originalEndByCodeUnit[index] !==
        normalizedRun.originalEndByCodeUnit[index - 1]
      ) {
        normalizedEnds.add(index);
      }
    }

    const protectedNormalizedBoundaries = new Set<number>();
    for (const boundary of supportedOriginalBoundaries) {
      const normalizedBoundary = normalizedBoundaryForOriginalOffset(
        normalizedRun,
        boundary,
        run.length,
      );
      if (normalizedBoundary !== null) protectedNormalizedBoundaries.add(normalizedBoundary);
    }
    const visibleLexicalNormalizedBoundaries = new Set<number>();
    for (const boundary of visibleLexicalOriginalBoundaries) {
      const normalizedBoundary = normalizedBoundaryForOriginalOffset(
        normalizedRun,
        boundary,
        run.length,
      );
      if (normalizedBoundary !== null) visibleLexicalNormalizedBoundaries.add(normalizedBoundary);
    }
    const unfilteredCandidatesByLanguage = {
      de: partitionCandidatesForLanguage(
        normalizedRun.value,
        normalizedStarts,
        normalizedEnds,
        'de',
        protectedNormalizedBoundaries,
      ),
      en: partitionCandidatesForLanguage(
        normalizedRun.value,
        normalizedStarts,
        normalizedEnds,
        'en',
        protectedNormalizedBoundaries,
      ),
    } as const;
    const candidateOnlyNormalizedRanges = collectCandidateOnlyPasswordRanges(
      normalizedRun.value,
      unfilteredCandidatesByLanguage,
      visibleLexicalNormalizedBoundaries,
    );
    const previouslySelectedCandidateOnlyRanges = new Set(
      (
        bestLanguagePartition(
          unfilteredCandidatesByLanguage,
          0,
          normalizedRun.value.length,
        ) ?? []
      )
        .filter(
          (part) =>
            part.kind === 'common-password-core' &&
            candidateOnlyNormalizedRanges.has(evidenceRangeKey(part.start, part.end)),
        )
        .map((part) => evidenceRangeKey(part.start, part.end)),
    );
    for (const range of candidateOnlyNormalizedRanges) {
      const [normalizedStartText, normalizedEndText] = range.split(':');
      const normalizedStart = Number(normalizedStartText);
      const normalizedEnd = Number(normalizedEndText);
      if (!Number.isInteger(normalizedStart) || !Number.isInteger(normalizedEnd)) continue;
      const originalSpan = originalSpanForNormalizedRange(
        normalizedRun,
        normalizedStart,
        normalizedEnd,
      );
      if (originalSpan === null) continue;
      const start = runStart + originalSpan[0];
      const end = runStart + originalSpan[1];
      candidateOnlyRanges.add(evidenceRangeKey(start, end));
      if (previouslySelectedCandidateOnlyRanges.has(range)) {
        findings.push({
          ...finding(
            input,
            'common-password-core',
            start,
            end,
            'bounded-heuristic',
            findings.length,
          ),
          segmentationRole: 'candidate-only',
        });
      }
    }
    const candidatesByLanguage = {
      de: omitCandidateOnlyPasswordRanges(
        unfilteredCandidatesByLanguage.de,
        candidateOnlyNormalizedRanges,
      ),
      en: omitCandidateOnlyPasswordRanges(
        unfilteredCandidatesByLanguage.en,
        candidateOnlyNormalizedRanges,
      ),
    } as const;
    const allPartitionCandidates = [
      ...candidatesByLanguage.de.values(),
      ...candidatesByLanguage.en.values(),
    ]
      .flatMap((candidates) => candidates)
      .filter(
        (candidate, index, candidates) =>
          candidates.findIndex(
            (other) =>
              other.start === candidate.start &&
              other.end === candidate.end &&
              other.kind === candidate.kind,
          ) === index,
      );

    const selectedParts: DictionaryPartitionPart[] = [];
    const occupied: Array<readonly [number, number]> = [];
    const acceptPartition = (partition: readonly DictionaryPartitionPart[]): void => {
      for (const part of partition) {
        if (occupied.some(([start, end]) => part.start < end && start < part.end)) continue;
        occupied.push([part.start, part.end]);
        selectedParts.push(part);
      }
    };

    const completePartition = bestLanguagePartition(
      candidatesByLanguage,
      0,
      normalizedRun.value.length,
    );
    if (completePartition !== null) {
      acceptPartition(completePartition);
    } else {
      const visibleOriginalBoundaries = [
        ...supportedOriginalBoundaries,
      ].sort(
        (left, right) => left - right,
      );
      const visibleNormalizedBoundaries = visibleOriginalBoundaries.flatMap((boundary) => {
        const normalizedBoundary = normalizedBoundaryForOriginalOffset(
          normalizedRun,
          boundary,
          run.length,
        );
        return normalizedBoundary === null ? [] : [normalizedBoundary];
      });
      for (let index = 0; index < visibleNormalizedBoundaries.length - 1; index += 1) {
        const segmentStart = visibleNormalizedBoundaries[index];
        const segmentEnd = visibleNormalizedBoundaries[index + 1];
        if (segmentStart === undefined || segmentEnd === undefined || segmentEnd <= segmentStart) {
          continue;
        }
        const partition = bestLanguagePartition(candidatesByLanguage, segmentStart, segmentEnd);
        if (
          partition !== null &&
          (partition.length >= 2 || visibleNormalizedBoundaries.length > 2 || connectorBound)
        ) {
          acceptPartition(partition);
        }
      }

      const supportedGuessPathParts: DictionaryPartitionPart[] = [];
      for (const { kind, span } of guessPathSpans) {
        if (kind === 'common-name') continue;
        if (span.start < runStart || span.end > runEnd) continue;
        const normalizedStart = normalizedBoundaryForOriginalOffset(
          normalizedRun,
          span.start - runStart,
          run.length,
        );
        const normalizedEnd = normalizedBoundaryForOriginalOffset(
          normalizedRun,
          span.end - runStart,
          run.length,
        );
        if (normalizedStart === null || normalizedEnd === null || normalizedEnd <= normalizedStart) {
          continue;
        }
        if (
          candidateOnlyNormalizedRanges.has(evidenceRangeKey(normalizedStart, normalizedEnd))
        ) {
          continue;
        }
        const supported = dictionarySpanHasSupportedBoundary(
          run,
          kind,
          span.start - runStart,
          span.end - runStart,
          additionalOriginalBoundaries,
        );
        const atRunEdge = span.start === runStart || span.end === runEnd;
        const residualLength = run.length - (span.end - span.start);
        const boundedEdgeResidual =
          atRunEdge &&
          span.end - span.start >= 4 &&
          residualLength <= 5 &&
          !dictionarySpanCrossesSupportedBoundary(
            run,
            span.start - runStart,
            span.end - runStart,
            additionalOriginalBoundaries,
          );
        if (!supported && !boundedEdgeResidual) continue;
        supportedGuessPathParts.push({
          start: normalizedStart,
          end: normalizedEnd,
          kind,
          codePointLength: [...span.token].length,
        });
      }

      const partialCandidates = [...allPartitionCandidates, ...supportedGuessPathParts].sort(
        (left, right) =>
          left.start - right.start ||
          supplementalDictionaryPriority[left.kind] - supplementalDictionaryPriority[right.kind] ||
          right.end - right.start - (left.end - left.start),
      );
      for (const candidate of partialCandidates) {
        const originalSpan = originalSpanForNormalizedRange(
          normalizedRun,
          candidate.start,
          candidate.end,
        );
        if (originalSpan === null) continue;
        const supported = dictionarySpanHasSupportedBoundary(
          run,
          candidate.kind,
          originalSpan[0],
          originalSpan[1],
          additionalOriginalBoundaries,
        );
        const shortTokenRequiresClosedBoundaries =
          candidate.codePointLength < 4 &&
          (!supportedOriginalBoundaries.has(originalSpan[0]) ||
            !supportedOriginalBoundaries.has(originalSpan[1]));
        if (shortTokenRequiresClosedBoundaries) continue;
        const atRunEdge = originalSpan[0] === 0 || originalSpan[1] === run.length;
        const residualLength = run.length - (originalSpan[1] - originalSpan[0]);
        const boundedEdgeResidual =
          atRunEdge &&
          originalSpan[1] - originalSpan[0] >= 4 &&
          residualLength <= 5 &&
          !dictionarySpanCrossesSupportedBoundary(
            run,
            originalSpan[0],
            originalSpan[1],
            additionalOriginalBoundaries,
          );
        if (!supported && !boundedEdgeResidual) continue;
        acceptPartition([candidate]);
      }
    }

    for (const [ordinal, part] of selectedParts
      .sort((left, right) => left.start - right.start || left.end - right.end)
      .entries()) {
      const originalSpan = originalSpanForNormalizedRange(normalizedRun, part.start, part.end);
      if (originalSpan === null) continue;
      const start = runStart + originalSpan[0];
      const end = runStart + originalSpan[1];
      findings.push(finding(input, part.kind, start, end, 'bounded-heuristic', ordinal));
    }

    for (const { kind, span } of guessPathSpans) {
      if (kind !== 'common-name' || span.start < runStart || span.end > runEnd) continue;
      if (
        dictionarySpanHasSupportedBoundary(
          run,
          kind,
          span.start - runStart,
          span.end - runStart,
        )
      ) {
        findings.push(
          finding(input, 'common-name', span.start, span.end, 'bounded-heuristic', findings.length),
        );
      }
    }
  }
  return { findings, candidateOnlyRanges };
}

function findingsFromGuessPath(
  input: string,
  sequence: readonly ZxcvbnMatch[],
  offset = 0,
): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
  for (const [ordinal, match] of sequence.entries()) {
    const start = offset + match.i;
    const end = offset + match.j + 1;
    switch (match.pattern) {
      case 'dictionary': {
        if (!isApprovedDictionaryMatch(match)) break;
        findings.push(
          finding(
            input,
            dictionaryFindingKind(match),
            start,
            end,
            stringProperty(match, 'dictionaryName') === 'userInputs'
              ? 'authored-exact-match'
              : 'bounded-heuristic',
            ordinal,
          ),
        );
        const matchedWord = stringProperty(match, 'matchedWord');
        const capitalizationChanged =
          matchedWord !== null &&
          match.token !== matchedWord &&
          match.token.toLocaleLowerCase('de-DE') === matchedWord.toLocaleLowerCase('de-DE');
        if (
          booleanProperty(match, 'l33t') ||
          booleanProperty(match, 'reversed') ||
          capitalizationChanged
        ) {
          findings.push(
            finding(input, 'typical-transformation', start, end, 'bounded-heuristic', ordinal),
          );
        }
        break;
      }
      case 'spatial':
        findings.push(finding(input, 'keyboard-pattern', start, end, 'bounded-heuristic', ordinal));
        break;
      case 'repeat':
        findings.push(
          finding(input, 'repeated-component', start, end, 'bounded-heuristic', ordinal),
        );
        break;
      case 'sequence':
        findings.push(
          finding(input, 'simple-character-sequence', start, end, 'bounded-heuristic', ordinal),
        );
        break;
      case 'wordSequence':
        if (!isSupportedPredictableWordSequenceMatch(input, match, offset)) break;
        findings.push(
          finding(input, 'predictable-word-sequence', start, end, 'bounded-heuristic', ordinal),
        );
        break;
      case 'date':
      case 'regex':
        findings.push(
          finding(
            input,
            /^(?:19|20)\d{2}$/u.test(match.token) ? 'year' : 'date',
            start,
            end,
            'bounded-heuristic',
            ordinal,
          ),
        );
        break;
      default:
        break;
    }
  }
  return findings;
}

function findingsFromRepeatedBases(
  input: string,
  sequence: readonly ZxcvbnMatch[],
  userInputs: string[],
  offset = 0,
): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
  for (const match of sequence) {
    if (match.pattern !== 'repeat' || typeof match.baseToken !== 'string') continue;
    const baseToken = match.baseToken;
    if (baseToken.length === 0 || baseToken.length >= match.token.length) continue;

    const baseResult = zxcvbnFactory.check(baseToken, userInputs);
    const basePatternResult = zxcvbnPatternFactory.check(baseToken, userInputs);
    for (let repetition = 0; repetition < match.repeatCount; repetition += 1) {
      const baseOffset = offset + match.i + repetition * baseToken.length;
      findings.push(...findingsFromGuessPath(input, baseResult.sequence, baseOffset));
      findings.push(...findingsFromGuessPath(input, basePatternResult.sequence, baseOffset));
      findings.push(
        ...findingsFromRepeatedBases(input, baseResult.sequence, userInputs, baseOffset),
      );
    }
  }
  return findings;
}

function collectExactAccountTermFindings(
  input: string,
  authoredAccountTerms: readonly string[],
  supportedBoundaries: ReadonlySet<number>,
): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
  const occupiedSpans: Array<readonly [number, number]> = [];
  const uniqueTerms = [
    ...new Map(
      authoredAccountTerms
        .map((authoredTerm) => authoredTerm.trim())
        .filter((term) => term.length >= 3)
        .map((term) => [term.toLocaleLowerCase('de-DE'), term] as const),
    ).values(),
  ].sort((left, right) => right.length - left.length);

  for (const term of uniqueTerms) {
    for (const [start, end] of findCaseInsensitiveSpans(input, term)) {
      const hasSupportedBoundaries =
        supportedBoundaries.has(start) && supportedBoundaries.has(end);
      const canServeAsEdgeAnchor =
        [...term].length >= 4 && (start === 0 || end === input.length);
      // A sufficiently long authored term at either edge can seed the explicit one-anchor-plus-rest
      // hybrid even when the random-looking remainder creates no visible component boundary.
      if (!hasSupportedBoundaries && !canServeAsEdgeAnchor) continue;
      if (
        occupiedSpans.some(
          ([occupiedStart, occupiedEnd]) => start < occupiedEnd && end > occupiedStart,
        )
      ) {
        continue;
      }
      occupiedSpans.push([start, end]);
      findings.push(
        finding(
          input,
          'account-or-service-term',
          start,
          end,
          'authored-exact-match',
          findings.length,
        ),
      );
    }
  }
  return findings;
}

interface FuzzyInputCharacter {
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

interface FuzzySpanCandidate {
  readonly start: number;
  readonly end: number;
  readonly distance: number;
  readonly lengthDelta: number;
  readonly termIndex: number;
  readonly transformed: boolean;
}

const fuzzyCharacterAliases: Readonly<Record<string, string>> = (() => {
  const aliases: Record<string, string> = {};
  for (const [letter, substitutions] of zxcvbnSubstitutionsByCharacter) {
    for (const substitution of substitutions) {
      if ([...substitution].length === 1 && aliases[substitution] === undefined) {
        aliases[substitution] = letter;
      }
    }
  }
  return aliases;
})();

/** Canonicalizes the frozen one-character zxcvbn substitutions for bounded local comparisons. */
export function canonicalizeTypicalLeet(value: string): string {
  return [...value.toLocaleLowerCase('de-DE')]
    .map((character) => fuzzyCharacterAliases[character] ?? character)
    .join('');
}

/**
 * Matches one complete authored password anchor after the same bounded surface changes taught in
 * S05: case changes, the frozen one-character leet substitutions, and at most one additional
 * repetition of an adjacent character. The caller is responsible for removing a separately
 * recognized suffix before invoking this helper.
 */
export function matchExplicitPasswordAnchorVariant(value: string): string | null {
  const canonical = canonicalizeTypicalLeet(value.normalize('NFC'));
  const variants = new Set<string>([canonical]);
  const characters = [...canonical];
  for (let index = 1; index < characters.length; index += 1) {
    if (characters[index] !== characters[index - 1]) continue;
    variants.add([...characters.slice(0, index), ...characters.slice(index + 1)].join(''));
  }

  for (const candidate of variants) {
    if (explicitPasswordAnchorTokens.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Checks one frozen zxcvbn substitution in either direction without collapsing ambiguous symbols
 * such as `1`, `!`, `6` or `7` onto a single arbitrary source letter.
 */
export function isTypicalLeetTransformation(sourceValue: string, targetValue: string): boolean {
  const source = sourceValue.normalize('NFC').toLocaleLowerCase('de-DE');
  const target = targetValue.normalize('NFC').toLocaleLowerCase('de-DE');
  const sourceCharacters = [...source];
  const targetCharacters = [...target];
  if (sourceCharacters.length === 1) {
    const sourceCharacter = sourceCharacters[0];
    if (
      sourceCharacter !== undefined &&
      substitutionsForCharacter(sourceCharacter).some(
        (substitution) => substitution.toLocaleLowerCase('de-DE') === target,
      )
    ) {
      return true;
    }
  }
  if (targetCharacters.length === 1) {
    const targetCharacter = targetCharacters[0];
    if (
      targetCharacter !== undefined &&
      substitutionsForCharacter(targetCharacter).some(
        (substitution) => substitution.toLocaleLowerCase('de-DE') === source,
      )
    ) {
      return true;
    }
  }
  return false;
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function substitutionsForCharacter(character: string): readonly string[] {
  return zxcvbnSubstitutionsByCharacter.get(character) ?? [];
}

function collectZxcvbnLeetCandidates(
  input: string,
  term: string,
  termIndex: number,
): readonly FuzzySpanCandidate[] {
  const termCharacters = [...term.toLocaleLowerCase('de-DE')];
  if (termCharacters.length < 4) return [];
  const alternatives = termCharacters.map((character) => {
    const substitutions = substitutionsForCharacter(character);
    return [character, ...substitutions]
      .sort((left, right) => right.length - left.length)
      .map(escapeRegularExpression);
  });
  const pattern = alternatives.map((values) => `(${values.join('|')})`).join('');
  const matcher = new RegExp(pattern, 'giu');
  return [...input.matchAll(matcher)].map((match) => {
    const start = match.index;
    const transformed = termCharacters.some((character, index) => {
      const matchedValue = match[index + 1];
      return (
        matchedValue !== undefined &&
        matchedValue.toLocaleLowerCase('de-DE') !== character
      );
    });
    return {
      start,
      end: start + match[0].length,
      distance: 0,
      lengthDelta: match[0].length - term.length,
      termIndex,
      transformed,
    };
  });
}

function fuzzyCharacterValue(character: string): string | null {
  const lower = character.toLocaleLowerCase('de-DE');
  const decomposed = lower.normalize('NFD').replace(/\p{Mark}/gu, '');
  if (decomposed.length !== 1) return null;
  const alias = fuzzyCharacterAliases[decomposed];
  if (alias !== undefined) return alias;
  return /[\p{L}\p{N}]/u.test(decomposed) ? decomposed : null;
}

function fuzzyInputRuns(input: string): readonly (readonly FuzzyInputCharacter[])[] {
  const runs: FuzzyInputCharacter[][] = [];
  let currentRun: FuzzyInputCharacter[] = [];
  let offset = 0;
  for (const character of input) {
    const start = offset;
    offset += character.length;
    const value = fuzzyCharacterValue(character);
    if (value === null) {
      if (currentRun.length > 0) runs.push(currentRun);
      currentRun = [];
      continue;
    }
    currentRun.push({ value, start, end: offset });
  }
  if (currentRun.length > 0) runs.push(currentRun);
  return runs;
}

function fuzzyTokenValues(token: string): readonly string[] | null {
  const values: string[] = [];
  for (const character of token) {
    const value = fuzzyCharacterValue(character);
    if (value === null) return null;
    values.push(value);
  }
  return values;
}

function boundedDamerauDistance(
  left: readonly string[],
  right: readonly string[],
  maximum: number,
): number | null {
  if (Math.abs(left.length - right.length) > maximum) return null;
  const distances = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );
  const getDistance = (leftIndex: number, rightIndex: number): number => {
    const row = distances[leftIndex];
    const value = row?.[rightIndex];
    if (value === undefined) {
      throw new Error('Damerau distance matrix invariant violated.');
    }
    return value;
  };
  const setDistance = (leftIndex: number, rightIndex: number, value: number): void => {
    const row = distances[leftIndex];
    if (row === undefined) {
      throw new Error('Damerau distance matrix invariant violated.');
    }
    row[rightIndex] = value;
  };
  for (let leftIndex = 0; leftIndex <= left.length; leftIndex += 1) {
    setDistance(leftIndex, 0, leftIndex);
  }
  for (let rightIndex = 0; rightIndex <= right.length; rightIndex += 1) {
    setDistance(0, rightIndex, rightIndex);
  }
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      let distance = Math.min(
        getDistance(leftIndex - 1, rightIndex) + 1,
        getDistance(leftIndex, rightIndex - 1) + 1,
        getDistance(leftIndex - 1, rightIndex - 1) + substitutionCost,
      );
      if (
        leftIndex > 1 &&
        rightIndex > 1 &&
        left[leftIndex - 1] === right[rightIndex - 2] &&
        left[leftIndex - 2] === right[rightIndex - 1]
      ) {
        distance = Math.min(distance, getDistance(leftIndex - 2, rightIndex - 2) + 1);
      }
      setDistance(leftIndex, rightIndex, distance);
    }
  }
  const distance = getDistance(left.length, right.length);
  return distance <= maximum ? distance : null;
}

function spansOverlap(
  left: readonly [number, number],
  right: readonly [number, number],
): boolean {
  return left[0] < right[1] && right[0] < left[1];
}

function collectFuzzyAccountTermFindings(
  input: string,
  authoredAccountTerms: readonly string[],
  occupiedSpans: readonly (readonly [number, number])[],
  supportedBoundaries: ReadonlySet<number>,
): readonly PasswordSingleFinding[] {
  const uniqueTerms = [
    ...new Map(
      authoredAccountTerms
        .map((authoredTerm) => authoredTerm.trim())
        .filter((term) => term.length >= 4)
        .map((term) => [term.toLocaleLowerCase('de-DE'), term] as const),
    ).values(),
  ];
  const candidates: FuzzySpanCandidate[] = [];
  for (const [termIndex, term] of uniqueTerms.entries()) {
    candidates.push(...collectZxcvbnLeetCandidates(input, term, termIndex));
    const token = fuzzyTokenValues(term);
    if (token === null || token.length < 4) continue;
    const maximumDistance = token.length >= 5 ? 1 : 0;
    for (const run of fuzzyInputRuns(input)) {
      for (let start = 0; start < run.length; start += 1) {
        for (const lengthDelta of [-1, 0, 1]) {
          const candidateLength = token.length + lengthDelta;
          const end = start + candidateLength;
          if (candidateLength < 1 || end > run.length) continue;
          const distance = boundedDamerauDistance(
            token,
            run.slice(start, end).map(({ value }) => value),
            maximumDistance,
          );
          if (distance === null) continue;
          candidates.push({
            start: run[start]?.start ?? 0,
            end: run[end - 1]?.end ?? 0,
            distance,
            lengthDelta,
            termIndex,
            transformed: distance > 0,
          });
        }
      }
    }
  }

  candidates.sort(
    (left, right) =>
      left.distance - right.distance ||
      right.end - right.start - (left.end - left.start) ||
      Math.abs(left.lengthDelta) - Math.abs(right.lengthDelta) ||
      left.start - right.start ||
      left.termIndex - right.termIndex,
  );

  const findings: PasswordSingleFinding[] = [];
  const occupied = [...occupiedSpans];
  for (const candidate of candidates) {
    const span: readonly [number, number] = [candidate.start, candidate.end];
    if (!supportedBoundaries.has(candidate.start) || !supportedBoundaries.has(candidate.end)) {
      continue;
    }
    if (occupied.some((occupiedSpan) => spansOverlap(occupiedSpan, span))) continue;
    occupied.push(span);
    findings.push(
      finding(
        input,
        'account-or-service-term',
        candidate.start,
        candidate.end,
        'bounded-heuristic',
        findings.length,
      ),
    );
    if (candidate.transformed) {
      findings.push(
        finding(
          input,
          'typical-transformation',
          candidate.start,
          candidate.end,
          'bounded-heuristic',
          findings.length,
        ),
      );
    }
  }
  return findings;
}

function collectYears(input: string): readonly PasswordSingleFinding[] {
  return [...input.matchAll(/(?:19|20)\d{2}/gu)].map((match, ordinal) => {
    const start = match.index;
    return finding(input, 'year', start, start + match[0].length, 'bounded-heuristic', ordinal);
  });
}

function collectNumberedWordSequences(input: string): readonly PasswordSingleFinding[] {
  const candidates = [
    ...input.matchAll(/\p{L}{3,}\d{1,3}(?:[-_.]\p{L}{3,}\d{1,3}){2,}/gu),
  ];
  return candidates.flatMap((match, ordinal) => {
    const parts = match[0].split(/[-_.]/u).map((part) => {
      const parsed = /^(\p{L}{3,})(\d{1,3})$/u.exec(part);
      return parsed === null || parsed[1] === undefined || parsed[2] === undefined
        ? null
        : { word: parsed[1].toLocaleLowerCase('de-DE'), number: Number(parsed[2]) };
    });
    const first = parts[0];
    if (
      first === null ||
      first === undefined ||
      parts.some(
        (part, index) =>
          part === null || part.word !== first.word || part.number !== first.number + index,
      )
    ) {
      return [];
    }
    const start = match.index;
    return [
      finding(
        input,
        'predictable-word-sequence',
        start,
        start + match[0].length,
        'bounded-heuristic',
        ordinal,
      ),
    ];
  });
}

const curatedPredictablePhraseValues = new Set([
  'antagenwiediesen',
  'homesweethome',
  'ichliebedichbiszummond',
  'jedenmorgeneinenkaffee',
  'ohnekaffeegehtnichts',
]);

function normalizedPredictablePhraseValue(input: string): string {
  return normalizeCaseWithOriginalOffsets(input).value.replace(/[^\p{L}\p{N}]/gu, '');
}

export function isCuratedPredictablePhrase(input: string): boolean {
  return (
    input.length > 0 &&
    curatedPredictablePhraseValues.has(normalizedPredictablePhraseValue(input))
  );
}

function collectTypicalSuffixes(
  input: string,
  specificFindings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
  const specificSpans = specificFindings.flatMap((item) =>
    item.kind === 'year' ||
    item.kind === 'date' ||
    item.kind === 'simple-character-sequence' ||
    item.kind === 'keyboard-pattern'
      ? item.evidence.filter(
          (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
        )
      : [],
  );
  for (const componentMatch of input.matchAll(/[\p{L}\p{N}]+/gu)) {
    const component = componentMatch[0];
    const componentStart = componentMatch.index;
    const componentEnd = componentStart + component.length;
    const trailingDigits = /\d{1,4}$/u.exec(component)?.[0] ?? '';
    const punctuation = /^[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{1,3}/u.exec(
      input.slice(componentEnd),
    )?.[0] ?? '';
    const punctuationEnd = componentEnd + punctuation.length;
    const punctuationIsTypicalEnding = punctuation.length > 0;
    const boundedDigitEnding =
      trailingDigits.length > 0 &&
      trailingDigits.length <= 4 &&
      (punctuationIsTypicalEnding || componentEnd === input.length);
    if (!punctuationIsTypicalEnding && !boundedDigitEnding) continue;

    const trailingDigitStart = componentEnd - trailingDigits.length;
    const digitsAlreadyExplained =
      boundedDigitEnding &&
      specificSpans.some((span) => span.start <= trailingDigitStart && span.end >= componentEnd);
    const suffixStart =
      componentEnd - (boundedDigitEnding && !digitsAlreadyExplained ? trailingDigits.length : 0);
    const base = input.slice(componentStart, suffixStart);
    if ([...base].length < 3 || !/\p{L}/u.test(base)) continue;
    const suffixEnd = punctuationIsTypicalEnding ? punctuationEnd : componentEnd;
    if (suffixStart === suffixEnd) continue;
    findings.push(
      finding(
        input,
        'typical-suffix',
        suffixStart,
        suffixEnd,
        'bounded-heuristic',
        findings.length,
      ),
    );
  }
  return findings;
}

function collectWholeExplicitPasswordAnchorVariantFindings(
  input: string,
  suffixFindings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const coreEnds = new Set<number>([input.length]);
  for (const suffix of suffixFindings) {
    if (suffix.kind !== 'typical-suffix') continue;
    for (const evidence of suffix.evidence) {
      if (evidence.type === 'span' && evidence.end === input.length) {
        coreEnds.add(evidence.start);
      }
    }
  }

  for (const coreEnd of [...coreEnds].sort((left, right) => right - left)) {
    if (coreEnd < 3) continue;
    const core = input.slice(0, coreEnd);
    const matchedAnchor = matchExplicitPasswordAnchorVariant(core);
    if (matchedAnchor === null) continue;

    const base: PasswordSingleFinding = {
      ...finding(input, 'common-password-core', 0, coreEnd, 'bounded-heuristic', 50_000),
      segmentationRole: 'candidate-only',
    };
    if (core === matchedAnchor) return [base];
    return [
      base,
      {
        ...finding(input, 'typical-transformation', 0, coreEnd, 'bounded-heuristic', 50_000),
        segmentationRole: 'candidate-only',
      },
    ];
  }
  return [];
}

interface RepetitionNormalizedText {
  readonly value: string;
  readonly originalStartByCodeUnit: readonly number[];
  readonly originalEndByCodeUnit: readonly number[];
  readonly transformedByCodeUnit: readonly boolean[];
}

interface RepetitionGroupCandidate {
  readonly spans: readonly PasswordEvidenceSpan[];
  readonly transformedSpans: readonly PasswordEvidenceSpan[];
  readonly normalizedLength: number;
}

const repetitionCharacterAliases: Readonly<Record<string, string>> = {
  $: 's',
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
};

function normalizeRepetitionWithOriginalOffsets(input: string): RepetitionNormalizedText {
  let value = '';
  const originalStartByCodeUnit: number[] = [];
  const originalEndByCodeUnit: number[] = [];
  const transformedByCodeUnit: boolean[] = [];
  let originalOffset = 0;
  for (const originalCharacter of input) {
    const originalEnd = originalOffset + originalCharacter.length;
    const lower = originalCharacter.toLocaleLowerCase('de-DE');
    const canonical = repetitionCharacterAliases[lower] ?? lower;
    value += canonical;
    for (let index = 0; index < canonical.length; index += 1) {
      originalStartByCodeUnit.push(originalOffset);
      originalEndByCodeUnit.push(originalEnd);
      transformedByCodeUnit.push(canonical !== lower);
    }
    originalOffset = originalEnd;
  }
  return { value, originalStartByCodeUnit, originalEndByCodeUnit, transformedByCodeUnit };
}

function isAlphaNumericCharacter(character: string | undefined): boolean {
  return character !== undefined && /^[\p{L}\p{N}]$/u.test(character);
}

function repetitionSpanHasVisibleBoundary(input: string, start: number, end: number): boolean {
  const token = input.slice(start, end);
  const first = [...token][0];
  const last = [...token].at(-1);
  const before = start === 0 ? undefined : [...input.slice(0, start)].at(-1);
  const after = end === input.length ? undefined : [...input.slice(end)][0];
  const startsAtBoundary =
    start === 0 ||
    !isAlphaNumericCharacter(before) ||
    (isAlphaNumericCharacter(before) &&
      isAlphaNumericCharacter(first) &&
      (/^\p{N}$/u.test(before ?? '') !== /^\p{N}$/u.test(first ?? '') ||
        (isLowercaseLetter(before) && isUppercaseLetter(first))));
  const endsAtBoundary =
    end === input.length ||
    !isAlphaNumericCharacter(after) ||
    (isAlphaNumericCharacter(last) &&
      isAlphaNumericCharacter(after) &&
      (/^\p{N}$/u.test(last ?? '') !== /^\p{N}$/u.test(after ?? '') ||
        (isLowercaseLetter(last) && isUppercaseLetter(after))));
  return startsAtBoundary && endsAtBoundary;
}

function nonOverlappingOccurrences(
  value: string,
  token: string,
): readonly (readonly [number, number])[] {
  const ranges: Array<readonly [number, number]> = [];
  let from = 0;
  while (token.length > 0) {
    const start = value.indexOf(token, from);
    if (start < 0) break;
    ranges.push([start, start + token.length]);
    from = start + token.length;
  }
  return ranges;
}

function repetitionCandidateFromNormalizedRanges(
  input: string,
  normalized: RepetitionNormalizedText,
  ranges: readonly (readonly [number, number])[],
): RepetitionGroupCandidate | null {
  const spans = ranges.flatMap(([start, end]) => {
    const original = originalSpanForNormalizedRange(normalized, start, end);
    return original === null ? [] : [evidenceSpan(input, original[0], original[1])];
  });
  if (spans.length < 2 || spans.length !== ranges.length) return null;
  const normalizedLength = (ranges[0]?.[1] ?? 0) - (ranges[0]?.[0] ?? 0);
  if (
    normalizedLength < 6 &&
    !spans.every((span) => repetitionSpanHasVisibleBoundary(input, span.start, span.end))
  ) {
    return null;
  }
  const transformedSpans = spans.filter((_, index) => {
    const range = ranges[index];
    return (
      range !== undefined &&
      normalized.transformedByCodeUnit.slice(range[0], range[1]).some(Boolean)
    );
  });
  return { spans, transformedSpans, normalizedLength };
}

function collectExactSeparatedRepetitionCandidates(
  input: string,
): readonly RepetitionGroupCandidate[] {
  const normalized = normalizeRepetitionWithOriginalOffsets(input);
  const byToken = new Map<string, RepetitionGroupCandidate>();
  const minimumLength = 4;
  for (let left = 0; left + minimumLength * 2 <= normalized.value.length; left += 1) {
    for (let right = left + minimumLength; right < normalized.value.length; right += 1) {
      const maximumLength = Math.min(right - left, normalized.value.length - right);
      let length = 0;
      while (
        length < maximumLength &&
        normalized.value[left + length] === normalized.value[right + length]
      ) {
        length += 1;
      }
      if (length < minimumLength) continue;
      const token = normalized.value.slice(left, left + length);
      if (!/[\p{L}\p{N}]/u.test(token)) continue;
      const ranges = nonOverlappingOccurrences(normalized.value, token);
      const candidate = repetitionCandidateFromNormalizedRanges(input, normalized, ranges);
      if (candidate === null) continue;
      const existing = byToken.get(token);
      if (
        existing === undefined ||
        candidate.spans.length > existing.spans.length ||
        candidate.normalizedLength > existing.normalizedLength
      ) {
        byToken.set(token, candidate);
      }
    }
  }
  return [...byToken.values()];
}

function visibleAlphaNumericRanges(input: string): readonly (readonly [number, number])[] {
  const ranges: Array<readonly [number, number]> = [];
  for (const runMatch of input.matchAll(/[\p{L}\p{N}]+/gu)) {
    const run = runMatch[0];
    const runStart = runMatch.index;
    const boundaries = [...letterRunBoundaries(run)].sort((left, right) => left - right);
    for (let startIndex = 0; startIndex < boundaries.length - 1; startIndex += 1) {
      for (
        let endIndex = startIndex + 1;
        endIndex < Math.min(boundaries.length, startIndex + 5);
        endIndex += 1
      ) {
        const start = boundaries[startIndex];
        const end = boundaries[endIndex];
        if (start === undefined || end === undefined || end <= start) continue;
        if ([...run.slice(start, end)].length < 8) continue;
        ranges.push([runStart + start, runStart + end]);
      }
    }
  }
  return ranges;
}

function collectSingleEditRepetitionCandidates(
  input: string,
): readonly RepetitionGroupCandidate[] {
  const ranges = visibleAlphaNumericRanges(input);
  const candidates: RepetitionGroupCandidate[] = [];
  for (let leftIndex = 0; leftIndex < ranges.length; leftIndex += 1) {
    const left = ranges[leftIndex];
    if (left === undefined) continue;
    const leftToken = [
      ...normalizeRepetitionWithOriginalOffsets(input.slice(left[0], left[1])).value,
    ];
    for (let rightIndex = leftIndex + 1; rightIndex < ranges.length; rightIndex += 1) {
      const right = ranges[rightIndex];
      if (right === undefined || left[1] > right[0]) continue;
      const rightToken = [
        ...normalizeRepetitionWithOriginalOffsets(input.slice(right[0], right[1])).value,
      ];
      if (Math.abs(leftToken.length - rightToken.length) > 1) continue;
      const distance = boundedDamerauDistance(leftToken, rightToken, 1);
      if (distance !== 1) continue;
      candidates.push({
        spans: [
          evidenceSpan(input, left[0], left[1]),
          evidenceSpan(input, right[0], right[1]),
        ],
        transformedSpans: [evidenceSpan(input, right[0], right[1])],
        normalizedLength: Math.max(leftToken.length, rightToken.length),
      });
    }
  }
  return candidates;
}

function collectBalancedRunRepetitionCandidates(
  input: string,
): readonly RepetitionGroupCandidate[] {
  const candidates: RepetitionGroupCandidate[] = [];
  for (const runMatch of input.matchAll(/[\p{L}\p{N}]+/gu)) {
    const run = runMatch[0];
    const runStart = runMatch.index;
    const normalized = normalizeRepetitionWithOriginalOffsets(run);
    for (const leftLength of [
      Math.floor(normalized.value.length / 2),
      Math.ceil(normalized.value.length / 2),
    ]) {
      const rightLength = normalized.value.length - leftLength;
      if (leftLength < 8 || rightLength < 8 || Math.abs(leftLength - rightLength) > 1) continue;
      const left = [...normalized.value.slice(0, leftLength)];
      const right = [...normalized.value.slice(leftLength)];
      if (boundedDamerauDistance(left, right, 1) !== 1) continue;
      const leftOriginal = originalSpanForNormalizedRange(normalized, 0, leftLength);
      const rightOriginal = originalSpanForNormalizedRange(
        normalized,
        leftLength,
        normalized.value.length,
      );
      if (leftOriginal === null || rightOriginal === null) continue;
      candidates.push({
        spans: [
          evidenceSpan(input, runStart + leftOriginal[0], runStart + leftOriginal[1]),
          evidenceSpan(input, runStart + rightOriginal[0], runStart + rightOriginal[1]),
        ],
        transformedSpans: [
          evidenceSpan(input, runStart + rightOriginal[0], runStart + rightOriginal[1]),
        ],
        normalizedLength: Math.max(leftLength, rightLength),
      });
    }
  }
  return candidates;
}

function evidenceRanges(finding: PasswordSingleFinding): readonly PasswordEvidenceSpan[] {
  return finding.evidence.filter(
    (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
  );
}

function collectSeparatedRepetitionFindings(
  input: string,
  existingFindings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const existingRepeatedSpans = existingFindings.flatMap((item) =>
    item.kind === 'repeated-component' ? evidenceRanges(item) : [],
  );
  const candidates = [
    ...collectExactSeparatedRepetitionCandidates(input),
    ...collectSingleEditRepetitionCandidates(input),
    ...collectBalancedRunRepetitionCandidates(input),
  ].sort(
    (left, right) =>
      right.normalizedLength - left.normalizedLength ||
      right.spans.length - left.spans.length ||
      (left.spans[0]?.start ?? 0) - (right.spans[0]?.start ?? 0),
  );
  const selected: RepetitionGroupCandidate[] = [];
  for (const candidate of candidates) {
    if (
      candidate.spans.every((span) =>
        existingRepeatedSpans.some(
          (existing) => existing.start <= span.start && existing.end >= span.end,
        ),
      )
    ) {
      continue;
    }
    if (
      selected.some((existing) =>
        candidate.spans.every((span) =>
          existing.spans.some(
            (existingSpan) =>
              existingSpan.start <= span.start && existingSpan.end >= span.end,
          ),
        ),
      )
    ) {
      continue;
    }
    selected.push(candidate);
    if (selected.length >= 4) break;
  }

  const findings: PasswordSingleFinding[] = [];
  for (const [ordinal, candidate] of selected.entries()) {
    const rangeId = candidate.spans.map(({ start, end }) => `${start}-${end}`).join(':');
    findings.push({
      id: `single:repeated-component-group:${rangeId}:${ordinal}`,
      kind: 'repeated-component',
      evidence: candidate.spans,
      explanationId: 's05.repeated-component',
      confidence: 'bounded-heuristic',
    });
    for (const [transformationOrdinal, span] of candidate.transformedSpans.entries()) {
      findings.push(
        finding(
          input,
          'typical-transformation',
          span.start,
          span.end,
          'bounded-heuristic',
          ordinal * 10 + transformationOrdinal,
        ),
      );
    }
  }
  return findings;
}

function suppressSingleSpanRepetitionsCoveredByGroups(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const groupedSpans = findings.flatMap((item) =>
    item.kind === 'repeated-component' && evidenceRanges(item).length >= 2
      ? evidenceRanges(item)
      : [],
  );
  if (groupedSpans.length === 0) return findings;
  return findings.filter((item) => {
    if (item.kind !== 'repeated-component') return true;
    const spans = evidenceRanges(item);
    if (spans.length !== 1) return true;
    const span = spans[0];
    return (
      span === undefined ||
      !groupedSpans.some(
        (grouped) => grouped.start <= span.start && grouped.end >= span.end,
      )
    );
  });
}

function suppressDictionaryFindingsCoveredByAccountContext(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const accountSpans = findings.flatMap((item) =>
    item.kind === 'account-or-service-term'
      ? item.evidence.filter(
          (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
        )
      : [],
  );
  if (accountSpans.length === 0) return findings;

  return findings.filter((item) => {
    if (
      item.kind !== 'common-password-core' &&
      item.kind !== 'common-word' &&
      item.kind !== 'common-name'
    ) {
      return true;
    }
    const spans = item.evidence.filter(
      (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
    );
    return !spans.some((span) =>
      accountSpans.some(
        (accountSpan) => accountSpan.start <= span.start && accountSpan.end >= span.end,
      ),
    );
  });
}

function suppressDictionaryFindingsCoveredByPreferredDictionaryFinding(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const dictionaryEntries = findings.flatMap((item) => {
    if (
      item.kind !== 'common-password-core' &&
      item.kind !== 'common-word' &&
      item.kind !== 'common-name'
    ) {
      return [];
    }
    return item.evidence.flatMap((evidence) =>
      evidence.type === 'span' ? [{ finding: item, span: evidence }] : [],
    );
  });
  if (dictionaryEntries.length < 2) return findings;

  const suppressedIds = new Set<string>();
  for (const entry of dictionaryEntries) {
    if (entry.finding.segmentationRole === 'candidate-only') continue;
    const entryPriority = supplementalDictionaryPriority[entry.finding.kind];
    const covered = dictionaryEntries.some((candidate) => {
      if (candidate.finding.id === entry.finding.id) return false;
      if (candidate.finding.segmentationRole === 'candidate-only') return false;
      const candidatePriority = supplementalDictionaryPriority[candidate.finding.kind];
      const candidateIsCuratedCompound = curatedGermanCompoundTokens.has(
        candidate.span.token.toLocaleLowerCase('de-DE'),
      );
      return (
        (candidateIsCuratedCompound || candidatePriority <= entryPriority) &&
        candidate.span.start <= entry.span.start &&
        candidate.span.end >= entry.span.end &&
        candidate.span.end - candidate.span.start > entry.span.end - entry.span.start
      );
    });
    if (covered) suppressedIds.add(entry.finding.id);
  }
  return findings.filter((item) => !suppressedIds.has(item.id));
}

function markCandidateOnlySegmentationFindings(
  findings: readonly PasswordSingleFinding[],
  candidateOnlyRanges: ReadonlySet<string>,
): readonly PasswordSingleFinding[] {
  if (candidateOnlyRanges.size === 0) return findings;
  return findings.map((item) => {
    if (item.kind !== 'common-password-core' && item.kind !== 'typical-transformation') {
      return item;
    }
    const hasCandidateOnlyRange = item.evidence.some(
      (evidence) =>
        evidence.type === 'span' &&
        candidateOnlyRanges.has(evidenceRangeKey(evidence.start, evidence.end)),
    );
    return hasCandidateOnlyRange
      ? { ...item, segmentationRole: 'candidate-only' as const }
      : item;
  });
}

function removeOrphanedTypicalTransformations(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const transformationBaseKinds = new Set<PasswordSingleFindingKind>([
    'common-password-core',
    'common-word',
    'common-name',
    'account-or-service-term',
    'repeated-component',
  ]);
  const retainedBaseRanges = new Set<string>();
  for (const item of findings) {
    if (!transformationBaseKinds.has(item.kind)) continue;
    for (const evidence of item.evidence) {
      if (evidence.type === 'span') retainedBaseRanges.add(`${evidence.start}:${evidence.end}`);
    }
  }
  return findings.filter((item) => {
    if (item.kind !== 'typical-transformation') return true;
    return item.evidence.some(
      (evidence) =>
        evidence.type === 'span' && retainedBaseRanges.has(`${evidence.start}:${evidence.end}`),
    );
  });
}

function isSupportedGuessPathMatch(
  input: string,
  match: ZxcvbnMatch,
  accountBoundaries: ReadonlySet<number>,
): boolean {
  if (match.pattern === 'wordSequence') {
    return isSupportedPredictableWordSequenceMatch(input, match);
  }
  if (
    match.pattern === 'dictionary' &&
    stringProperty(match, 'dictionaryName') === 'userInputs'
  ) {
    return accountBoundaries.has(match.i) && accountBoundaries.has(match.j + 1);
  }
  return true;
}

function deduplicateAndSortFindings(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const byKey = new Map<string, PasswordSingleFinding>();
  for (const item of findings) {
    const spans = item.evidence.filter(
      (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
    );
    const key =
      spans.length === 0
        ? item.kind
        : `${item.kind}:${spans.map(({ start, end }) => `${start}-${end}`).join(':')}`;
    const existing = byKey.get(key);
    if (existing === undefined || item.confidence === 'authored-exact-match') byKey.set(key, item);
  }
  return [...byKey.values()].sort((left, right) => {
    const priority = findingPriority[left.kind] - findingPriority[right.kind];
    if (priority !== 0) return priority;
    const leftSpan = left.evidence.find((evidence) => evidence.type === 'span');
    const rightSpan = right.evidence.find((evidence) => evidence.type === 'span');
    return (leftSpan?.start ?? 0) - (rightSpan?.start ?? 0);
  });
}

export function analyzeFictionalPassword({
  fictionalPassword,
  authoredAccountTerms = [],
  transientAccountIdentifiers = [],
}: FictionalPasswordAnalysisInput): PasswordAnalysisResult {
  const trimmedAccountTerms = [
    ...new Set(
      [...authoredAccountTerms, ...transientAccountIdentifiers].map((term) => term.trim()),
    ),
  ].filter((term) => term.length >= 3);
  const result = zxcvbnFactory.check(fictionalPassword, trimmedAccountTerms);
  const unclassifiedGuessPathFindings = filterUnsupportedGuessPathDictionaryFragments(
    fictionalPassword,
    findingsFromGuessPath(fictionalPassword, result.sequence),
  );
  const unclassifiedRepeatedBaseFindings = filterUnsupportedGuessPathDictionaryFragments(
    fictionalPassword,
    findingsFromRepeatedBases(
      fictionalPassword,
      result.sequence,
      trimmedAccountTerms,
    ),
  );
  const deterministicKeyboardFindings = collectDeterministicKeyboardFindings(fictionalPassword);
  const dictionaryPartitionProjection = collectDictionaryPartitionFindings(
    fictionalPassword,
    [...unclassifiedGuessPathFindings, ...unclassifiedRepeatedBaseFindings],
    deterministicKeyboardFindings,
  );
  const rawGuessPathFindings = markCandidateOnlySegmentationFindings(
    unclassifiedGuessPathFindings,
    dictionaryPartitionProjection.candidateOnlyRanges,
  );
  const rawRepeatedBaseFindings = markCandidateOnlySegmentationFindings(
    unclassifiedRepeatedBaseFindings,
    dictionaryPartitionProjection.candidateOnlyRanges,
  );
  const accountBoundaries = componentBoundaryOffsets(fictionalPassword, [
    ...dictionaryPartitionProjection.findings,
    ...deterministicKeyboardFindings,
  ]);
  const guessPathFindings = filterUnsupportedAccountTermFindings(
    rawGuessPathFindings,
    accountBoundaries,
  );
  const repeatedBaseFindings = filterUnsupportedAccountTermFindings(
    rawRepeatedBaseFindings,
    accountBoundaries,
  );
  const exactAccountTermFindings = collectExactAccountTermFindings(
    fictionalPassword,
    trimmedAccountTerms,
    accountBoundaries,
  );
  const exactAccountTermSpans: Array<readonly [number, number]> = [];
  for (const item of exactAccountTermFindings) {
    for (const evidence of item.evidence) {
      if (evidence.type === 'span') exactAccountTermSpans.push([evidence.start, evidence.end]);
    }
  }
  const fuzzyAccountTermFindings = collectFuzzyAccountTermFindings(
    fictionalPassword,
    trimmedAccountTerms,
    exactAccountTermSpans,
    accountBoundaries,
  );
  const yearFindings = collectYears(fictionalPassword);
  const numberedWordSequenceFindings = collectNumberedWordSequences(fictionalPassword);
  const separatedRepetitionFindings = collectSeparatedRepetitionFindings(fictionalPassword, [
    ...guessPathFindings,
    ...repeatedBaseFindings,
  ]);
  const typicalSuffixFindings = collectTypicalSuffixes(fictionalPassword, [
    ...guessPathFindings,
    ...deterministicKeyboardFindings,
    ...yearFindings,
    ...numberedWordSequenceFindings,
  ]);
  const wholeExplicitPasswordAnchorVariantFindings =
    collectWholeExplicitPasswordAnchorVariantFindings(
      fictionalPassword,
      typicalSuffixFindings,
    );
  const findings = removeOrphanedTypicalTransformations(
    suppressDictionaryFindingsCoveredByPreferredDictionaryFinding(
      suppressDictionaryFindingsCoveredByAccountContext(
        suppressSingleSpanRepetitionsCoveredByGroups(
          deduplicateAndSortFindings([
            ...guessPathFindings,
            ...repeatedBaseFindings,
            ...deterministicKeyboardFindings,
            ...dictionaryPartitionProjection.findings,
            ...exactAccountTermFindings,
            ...fuzzyAccountTermFindings,
            ...yearFindings,
            ...numberedWordSequenceFindings,
            ...separatedRepetitionFindings,
            ...typicalSuffixFindings,
            ...wholeExplicitPasswordAnchorVariantFindings,
          ]),
        ),
      ),
    ),
  );

  return {
    kind: 'fictional-password-analysis',
    findings:
      findings.length > 0
        ? findings
        : [
            {
              id: 'single:no-simple-component-recognized',
              kind: 'no-simple-component-recognized',
              evidence: [],
              explanationId: 's05.no-simple-component-recognized',
              confidence: 'bounded-heuristic',
            },
          ],
    guessPath: {
      engineId: 'zxcvbn-ts',
      configurationVersion: PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
      matches: result.sequence
        .filter((match) => isSupportedGuessPathMatch(fictionalPassword, match, accountBoundaries))
        .map(projectGuessPathMatch),
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

function structureFinding(
  findingKind: Exclude<RuntimeStructureFinding['findingKind'], 'no-simple-structure-recognized'>,
  evidence: readonly PasswordEvidenceSpan[],
): RuntimeStructureFinding {
  const stableEvidenceId = evidence.map(({ start, end }) => `${start}-${end}`).join(':');
  return {
    kind: 'runtimeStructureFinding',
    id: `structure:${findingKind}:${stableEvidenceId}`,
    findingKind,
    evidence,
    explanationId: `s05.structure.${findingKind}`,
    confidence: 'bounded-heuristic',
  };
}

function evidenceSpans(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordEvidenceSpan[] {
  const seen = new Set<string>();
  const spans: PasswordEvidenceSpan[] = [];
  for (const item of findings) {
    for (const evidence of item.evidence) {
      if (evidence.type !== 'span') continue;
      const key = `${evidence.start}:${evidence.end}:${evidence.token}`;
      if (seen.has(key)) continue;
      seen.add(key);
      spans.push(evidence);
    }
  }
  return spans.sort((left, right) => left.start - right.start || left.end - right.end);
}

function findExactRepeatedComponentSpans(input: string): readonly PasswordEvidenceSpan[] | null {
  const normalized = normalizeCaseWithOriginalOffsets(input);
  for (
    let componentLength = Math.floor(normalized.value.length / 2);
    componentLength >= 4;
    componentLength -= 1
  ) {
    for (let start = 0; start + componentLength * 2 <= normalized.value.length; start += 1) {
      const component = normalized.value.slice(start, start + componentLength);
      const normalizedRanges: Array<readonly [number, number]> = [];
      let cursor = start;
      while (normalized.value.slice(cursor, cursor + componentLength) === component) {
        normalizedRanges.push([cursor, cursor + componentLength]);
        cursor += componentLength;
      }
      if (normalizedRanges.length < 2) continue;
      const spans = normalizedRanges.flatMap(([rangeStart, rangeEnd]) => {
        const original = originalSpanForNormalizedRange(normalized, rangeStart, rangeEnd);
        return original === null ? [] : [evidenceSpan(input, original[0], original[1])];
      });
      if (spans.length === normalizedRanges.length) return spans;
    }
  }
  return null;
}

function noSimpleStructureFinding(): RuntimeStructureFinding {
  return {
    kind: 'runtimeStructureFinding',
    id: 'structure:no-simple-structure-recognized',
    findingKind: 'no-simple-structure-recognized',
    evidence: [],
    explanationId: 's05.structure.no-simple-structure-recognized',
    confidence: 'bounded-heuristic',
  };
}

function getValidatedEvidenceSpans(
  input: string,
  item: PasswordSingleFinding,
): readonly PasswordEvidenceSpan[] | null {
  const spans: PasswordEvidenceSpan[] = [];
  for (const evidence of item.evidence) {
    if (evidence.type !== 'span') continue;
    if (
      !Number.isInteger(evidence.start) ||
      !Number.isInteger(evidence.end) ||
      evidence.start < 0 ||
      evidence.end <= evidence.start ||
      evidence.end > input.length ||
      input.slice(evidence.start, evidence.end) !== evidence.token
    ) {
      return null;
    }
    spans.push(evidence);
  }
  return spans.length > 0 ? spans : null;
}

export function analyzeFictionalPasswordStructure({
  fictionalPassword,
  componentAnalysis,
}: FictionalPasswordStructureAnalysisInput): PasswordStructureAnalysisResult {
  const findings: RuntimeStructureFinding[] = [];
  const concreteComponentFindings = componentAnalysis.findings.flatMap((item) => {
    if (item.segmentationRole === 'candidate-only') return [];
    const evidence = getValidatedEvidenceSpans(fictionalPassword, item);
    return evidence === null ? [] : [{ ...item, evidence }];
  });

  const repetitionSpans = findExactRepeatedComponentSpans(fictionalPassword);
  if (repetitionSpans !== null) {
    findings.push(structureFinding('exact-component-repetition', repetitionSpans));
  }

  const repeatedPatternFindings = concreteComponentFindings.filter(
    ({ kind }) => kind === 'repeated-component',
  );
  if (repetitionSpans === null && repeatedPatternFindings.length > 0) {
    findings.push(
      structureFinding('recognized-repetition-pattern', evidenceSpans(repeatedPatternFindings)),
    );
  }

  const predictableSequenceFindings = concreteComponentFindings.filter(
    ({ kind }) => kind === 'predictable-word-sequence',
  );
  if (predictableSequenceFindings.length > 0) {
    findings.push(
      structureFinding(
        'predictable-component-sequence',
        evidenceSpans(predictableSequenceFindings),
      ),
    );
  }

  const accountFindings = concreteComponentFindings.filter(
    ({ kind }) => kind === 'account-or-service-term',
  );
  const qualifierFindings = concreteComponentFindings.filter(
    ({ kind }) =>
      kind === 'year' ||
      kind === 'date' ||
      kind === 'simple-character-sequence' ||
      kind === 'typical-suffix',
  );
  if (accountFindings.length > 0 && qualifierFindings.length > 0) {
    findings.push(
      structureFinding(
        'account-context-with-qualifier',
        evidenceSpans([...accountFindings, ...qualifierFindings]),
      ),
    );
  }

  const numberFindings = concreteComponentFindings.filter(
    ({ kind }) => kind === 'year' || kind === 'date' || kind === 'simple-character-sequence',
  );
  const suffixFindings = concreteComponentFindings.filter(({ kind }) => kind === 'typical-suffix');
  const relatedNumberFindings = numberFindings.filter((numberFinding) =>
    numberFinding.evidence.some(
      (numberEvidence) =>
        numberEvidence.type === 'span' &&
        suffixFindings.some((suffixFinding) =>
          suffixFinding.evidence.some(
            (suffixEvidence) =>
              suffixEvidence.type === 'span' &&
              (numberEvidence.end === suffixEvidence.start ||
                (suffixEvidence.start <= numberEvidence.start &&
                  suffixEvidence.end >= numberEvidence.end)),
          ),
        ),
    ),
  );
  if (relatedNumberFindings.length > 0 && suffixFindings.length > 0) {
    findings.push(
      structureFinding(
        'number-marker-with-typical-suffix',
        evidenceSpans([...relatedNumberFindings, ...suffixFindings]),
      ),
    );
  }

  return {
    kind: 'fictional-password-structure-analysis',
    findings: findings.length > 0 ? findings : [noSimpleStructureFinding()],
    disclaimerId: 'bounded-rules-not-strength-assessment',
  };
}
