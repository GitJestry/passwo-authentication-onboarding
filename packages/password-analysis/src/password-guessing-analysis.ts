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
import { type OptionsDictionary, ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnDePackage from '@zxcvbn-ts/language-de';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

import {
  findCaseInsensitiveSpans,
  normalizeCaseWithOriginalOffsets,
  originalSpanForNormalizedRange,
} from './case-insensitive-spans.js';

export const PASSWORD_ANALYSIS_CONFIGURATION_VERSION = 'passwo-bounded-guess-path-v4';

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

const zxcvbnFactory = new ZxcvbnFactory({
  translations: zxcvbnDePackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: mergeDictionaries(
    zxcvbnCommonPackage.dictionary,
    zxcvbnDePackage.dictionary,
    zxcvbnEnPackage.dictionary,
  ),
  maxLength: 128,
  useLevenshteinDistance: false,
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

function collectTypicalSuffix(input: string): readonly PasswordSingleFinding[] {
  const match = /(?=.*\p{L})[\p{L}\p{N}]{3,}?((?:\d{1,4})?[!?._-]+|\d{1,3})$/u.exec(input);
  if (match === null || match[1] === undefined) return [];
  const start = input.length - match[1].length;
  return [finding(input, 'typical-suffix', start, input.length)];
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
  const exactAccountTermFindings = collectExactAccountTermFindings(
    fictionalPassword,
    trimmedAccountTerms,
  );
  const yearFindings = collectYears(fictionalPassword);
  const numberedWordSequenceFindings = collectNumberedWordSequences(fictionalPassword);
  const findings = deduplicateAndSortFindings([
    ...guessPathFindings,
    ...exactAccountTermFindings,
    ...yearFindings,
    ...numberedWordSequenceFindings,
    ...collectTypicalSuffix(fictionalPassword),
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
