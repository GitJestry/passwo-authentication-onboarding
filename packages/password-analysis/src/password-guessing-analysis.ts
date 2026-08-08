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

export const PASSWORD_ANALYSIS_CONFIGURATION_VERSION = 'passwo-bounded-guess-path-v7';

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

// The authored matcher deliberately shares the frozen zxcvbn substitution vocabulary. It still
// produces presentation evidence only and never changes zxcvbn's complete-path estimate.
const zxcvbnLeetTable = new Options().l33tTable;
const zxcvbnSubstitutionsByCharacter: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(zxcvbnLeetTable),
);

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

function booleanProperty(value: unknown, name: string): boolean {
  return asRecord(value)[name] === true;
}

function normalizedGuessCount(value: number): number {
  if (!Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;
  return Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.ceil(value)));
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
  if (match.pattern === 'dictionary') return stringProperty(match, 'dictionaryName');
  if (match.pattern === 'regex') return stringProperty(match, 'regexName');
  if (match.pattern === 'spatial') return stringProperty(match, 'graph');
  return null;
}

function projectGuessPathMatch(match: ZxcvbnMatch): PasswordGuessPathMatch {
  return {
    pattern: matchPattern(match),
    start: match.i,
    end: match.j + 1,
    sourceId: matchSourceId(match),
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

const supplementalDictionaryKinds: ReadonlyMap<
  string,
  Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>
> = (() => {
  const kinds = new Map<
    string,
    Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>
  >();
  for (const [dictionaryName, values] of Object.entries(zxcvbnDictionary)) {
    const normalizedDictionaryName = dictionaryName.toLocaleLowerCase('en-US');
    if (
      !normalizedDictionaryName.includes('password') &&
      !normalizedDictionaryName.includes('commonword') &&
      !normalizedDictionaryName.includes('name')
    ) {
      continue;
    }
    const kind = dictionaryNameFindingKind(normalizedDictionaryName);
    for (const value of values) {
      if (typeof value !== 'string') continue;
      const normalized = value.toLocaleLowerCase('de-DE');
      if ([...normalized].length < 4 || !/^\p{L}+$/u.test(normalized)) continue;
      const existing = kinds.get(normalized);
      if (
        existing === undefined ||
        supplementalDictionaryPriority[kind] < supplementalDictionaryPriority[existing]
      ) {
        kinds.set(normalized, kind);
      }
    }
  }
  return kinds;
})();

function isConnector(character: string | undefined): boolean {
  return character !== undefined && !/[\p{L}\p{N}]/u.test(character);
}

interface DictionaryPartitionPart {
  readonly start: number;
  readonly end: number;
  readonly kind: Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>;
}

interface GuessPathDictionarySpan {
  readonly kind: 'common-password-core' | 'common-word' | 'common-name';
  readonly span: PasswordEvidenceSpan;
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

function collectDictionaryPartitionFindings(
  input: string,
  guessPathFindings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
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
    const candidatesByStart = new Map<number, DictionaryPartitionPart[]>();
    const addCandidate = (candidate: DictionaryPartitionPart): void => {
      const candidates = candidatesByStart.get(candidate.start) ?? [];
      if (
        !candidates.some(
          (existing) =>
            existing.end === candidate.end && existing.kind === candidate.kind,
        )
      ) {
        candidates.push(candidate);
        candidatesByStart.set(candidate.start, candidates);
      }
    };

    for (const start of normalizedStarts) {
      for (const end of normalizedEnds) {
        if (end <= start) continue;
        const token = normalizedRun.value.slice(start, end);
        if ([...token].length < 4) continue;
        const kind = supplementalDictionaryKinds.get(token);
        if (kind !== undefined) addCandidate({ start, end, kind });
      }
    }
    for (const { kind, span } of guessPathSpans) {
      if (span.start < runStart || span.end > runEnd) continue;
      const normalizedStart = normalizedRun.originalStartByCodeUnit.findIndex(
        (originalStart) => originalStart === span.start - runStart,
      );
      const normalizedEnd =
        normalizedRun.originalEndByCodeUnit.lastIndexOf(span.end - runStart) + 1;
      if (normalizedStart < 0 || normalizedEnd <= normalizedStart) continue;
      addCandidate({ start: normalizedStart, end: normalizedEnd, kind });
    }

    const bestFrom = new Map<number, readonly DictionaryPartitionPart[] | null>();
    const partitionFrom = (start: number): readonly DictionaryPartitionPart[] | null => {
      if (start === normalizedRun.value.length) return [];
      const cached = bestFrom.get(start);
      if (cached !== undefined) return cached;
      let best: readonly DictionaryPartitionPart[] | null = null;
      for (const candidate of candidatesByStart.get(start) ?? []) {
        const remainder = partitionFrom(candidate.end);
        if (remainder === null) continue;
        const partition = [candidate, ...remainder];
        if (best === null || compareDictionaryPartitions(partition, best) < 0) best = partition;
      }
      bestFrom.set(start, best);
      return best;
    };

    const partition = partitionFrom(0);
    const connectorBound = isConnector(before) || isConnector(after);
    if (partition === null || (partition.length < 2 && !connectorBound)) continue;
    for (const [ordinal, part] of partition.entries()) {
      const originalSpan = originalSpanForNormalizedRange(normalizedRun, part.start, part.end);
      if (originalSpan === null) continue;
      const start = runStart + originalSpan[0];
      const end = runStart + originalSpan[1];
      findings.push(
        finding(input, part.kind, start, end, 'bounded-heuristic', ordinal),
      );
    }
  }
  return findings;
}

function findingsFromGuessPath(
  input: string,
  sequence: readonly ZxcvbnMatch[],
): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
  for (const [ordinal, match] of sequence.entries()) {
    const start = match.i;
    const end = match.j + 1;
    switch (match.pattern) {
      case 'dictionary': {
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

function collectExactAccountTermFindings(
  input: string,
  authoredAccountTerms: readonly string[],
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
      Math.abs(left.lengthDelta) - Math.abs(right.lengthDelta) ||
      right.end - right.start - (left.end - left.start) ||
      left.start - right.start ||
      left.termIndex - right.termIndex,
  );

  const findings: PasswordSingleFinding[] = [];
  const occupied = [...occupiedSpans];
  for (const candidate of candidates) {
    const span: readonly [number, number] = [candidate.start, candidate.end];
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

function collectTypicalSuffixes(input: string): readonly PasswordSingleFinding[] {
  const findings: PasswordSingleFinding[] = [];
  for (const componentMatch of input.matchAll(/[\p{L}\p{N}]+/gu)) {
    const component = componentMatch[0];
    const componentStart = componentMatch.index;
    const componentEnd = componentStart + component.length;
    const punctuation = /^[!?#$._-]+/u.exec(input.slice(componentEnd))?.[0] ?? '';
    const punctuationEnd = componentEnd + punctuation.length;
    const punctuationIsTypicalEnding =
      punctuation.length > 0 &&
      (punctuationEnd === input.length || /[!?]/u.test(punctuation));
    const trailingDigits = /\d+$/u.exec(component)?.[0] ?? '';
    const boundedDigitEnding =
      trailingDigits.length > 0 &&
      trailingDigits.length <= (punctuationIsTypicalEnding ? 4 : 3) &&
      (punctuationIsTypicalEnding || componentEnd === input.length);
    if (!punctuationIsTypicalEnding && !boundedDigitEnding) continue;

    const suffixStart = componentEnd - (boundedDigitEnding ? trailingDigits.length : 0);
    const base = input.slice(componentStart, suffixStart);
    if ([...base].length < 3 || !/\p{L}/u.test(base)) continue;
    findings.push(
      finding(
        input,
        'typical-suffix',
        suffixStart,
        punctuationIsTypicalEnding ? punctuationEnd : componentEnd,
        'bounded-heuristic',
        findings.length,
      ),
    );
  }
  return findings;
}

function deduplicateAndSortFindings(
  findings: readonly PasswordSingleFinding[],
): readonly PasswordSingleFinding[] {
  const byKey = new Map<string, PasswordSingleFinding>();
  for (const item of findings) {
    const span = item.evidence.find((evidence) => evidence.type === 'span');
    const key = span === undefined ? item.kind : `${item.kind}:${span.start}:${span.end}`;
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
  const guessPathFindings = findingsFromGuessPath(fictionalPassword, result.sequence);
  const dictionaryPartitionFindings = collectDictionaryPartitionFindings(
    fictionalPassword,
    guessPathFindings,
  );
  const exactAccountTermFindings = collectExactAccountTermFindings(
    fictionalPassword,
    trimmedAccountTerms,
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
  );
  const yearFindings = collectYears(fictionalPassword);
  const numberedWordSequenceFindings = collectNumberedWordSequences(fictionalPassword);
  const findings = deduplicateAndSortFindings([
    ...guessPathFindings,
    ...dictionaryPartitionFindings,
    ...exactAccountTermFindings,
    ...fuzzyAccountTermFindings,
    ...yearFindings,
    ...numberedWordSequenceFindings,
    ...collectTypicalSuffixes(fictionalPassword),
  ]);

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
      estimatedGuesses: normalizedGuessCount(result.guesses),
      estimatedGuessesLog10: Number.isFinite(result.guessesLog10)
        ? result.guessesLog10
        : Math.log10(Number.MAX_SAFE_INTEGER),
      matches: result.sequence.map(projectGuessPathMatch),
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
