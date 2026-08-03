import type {
  PasswordComparisonResult,
  PasswordEvidenceSpan,
  PasswordTransformationId,
} from '@passwo/contracts';

import { findCaseInsensitiveSpans } from './case-insensitive-spans.js';

export type {
  PasswordAnalysisResult,
  PasswordComparisonResult,
  PasswordSingleFinding,
  PasswordStructureAnalysisResult,
  RuntimeStructureFinding,
} from '@passwo/contracts';
export * from './password-guessing-analysis.js';
export * from './recommendation-projection.js';
export * from './simulation-disposition.js';
export * from './theoretical-search-space.js';

export interface LocalPasswordComparisonInput {
  readonly sourcePassword: string;
  readonly targetPassword: string;
  readonly authoredAccountAndServiceTerms: readonly string[];
}

function evidenceSpan(input: string, start: number, end: number): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: input.slice(start, end) };
}

interface CandidateTransformation {
  readonly atom: 'account' | 'year' | 'suffix';
  readonly sourceEvidence: PasswordEvidenceSpan;
  readonly targetEvidence: PasswordEvidenceSpan;
  readonly sourceChangedRange: readonly [number, number];
  readonly targetChangedRange: readonly [number, number];
  apply(candidate: string): string;
}

function replaceRange(input: string, start: number, end: number, replacement: string): string {
  return `${input.slice(0, start)}${replacement}${input.slice(end)}`;
}

function firstCaseInsensitiveSpan(input: string, token: string): readonly [number, number] | null {
  return findCaseInsensitiveSpans(input, token)[0] ?? null;
}

function accountTransformations(
  sourcePassword: string,
  targetPassword: string,
  terms: readonly string[],
): readonly CandidateTransformation[] {
  const transformations: CandidateTransformation[] = [];
  const normalizedTerms = [
    ...new Set(terms.map((term) => term.trim()).filter((term) => term.length >= 3)),
  ];
  for (const sourceTerm of normalizedTerms) {
    const sourceSpan = firstCaseInsensitiveSpan(sourcePassword, sourceTerm);
    if (sourceSpan === null) continue;
    for (const targetTerm of normalizedTerms) {
      if (sourceTerm.toLocaleLowerCase('de-DE') === targetTerm.toLocaleLowerCase('de-DE')) continue;
      const targetSpan = firstCaseInsensitiveSpan(targetPassword, targetTerm);
      if (targetSpan === null) continue;
      transformations.push({
        atom: 'account',
        sourceEvidence: evidenceSpan(sourcePassword, sourceSpan[0], sourceSpan[1]),
        targetEvidence: evidenceSpan(targetPassword, targetSpan[0], targetSpan[1]),
        sourceChangedRange: sourceSpan,
        targetChangedRange: targetSpan,
        apply: (candidate) => {
          const currentSpan = firstCaseInsensitiveSpan(candidate, sourceTerm);
          return currentSpan === null
            ? candidate
            : replaceRange(
                candidate,
                currentSpan[0],
                currentSpan[1],
                targetPassword.slice(targetSpan[0], targetSpan[1]),
              );
        },
      });
    }
  }
  return transformations;
}

function yearTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const sourceYears = [...sourcePassword.matchAll(/(?:19|20)\d{2}/gu)];
  const targetYears = [...targetPassword.matchAll(/(?:19|20)\d{2}/gu)];
  const transformations: CandidateTransformation[] = [];
  for (const source of sourceYears) {
    for (const target of targetYears) {
      if (source[0] === target[0] || Math.abs(Number(source[0]) - Number(target[0])) > 2) continue;
      const sourceStart = source.index;
      const targetStart = target.index;
      transformations.push({
        atom: 'year',
        sourceEvidence: evidenceSpan(sourcePassword, sourceStart, sourceStart + source[0].length),
        targetEvidence: evidenceSpan(targetPassword, targetStart, targetStart + target[0].length),
        sourceChangedRange: [sourceStart, sourceStart + source[0].length],
        targetChangedRange: [targetStart, targetStart + target[0].length],
        apply: (candidate) => candidate.replace(source[0], target[0]),
      });
    }
  }
  return transformations;
}

function suffixTransformation(
  sourcePassword: string,
  targetPassword: string,
): CandidateTransformation | null {
  const sourceMatch = /[!?._-]{1,3}$/u.exec(sourcePassword);
  const targetMatch = /[!?._-]{1,3}$/u.exec(targetPassword);
  const sourceSuffix = sourceMatch?.[0] ?? '';
  const targetSuffix = targetMatch?.[0] ?? '';
  if (sourceSuffix === targetSuffix || targetSuffix.length === 0 || sourcePassword.length === 0) {
    return null;
  }
  const sourceStart = sourcePassword.length - sourceSuffix.length;
  const targetStart = targetPassword.length - targetSuffix.length;
  const sourceEvidenceStart = sourceSuffix.length === 0 ? sourcePassword.length - 1 : sourceStart;
  return {
    atom: 'suffix',
    sourceEvidence: evidenceSpan(sourcePassword, sourceEvidenceStart, sourcePassword.length),
    targetEvidence: evidenceSpan(targetPassword, targetStart, targetPassword.length),
    sourceChangedRange: [sourceStart, sourcePassword.length],
    targetChangedRange: [targetStart, targetPassword.length],
    apply: (candidate) =>
      `${candidate.slice(0, candidate.length - sourceSuffix.length)}${targetSuffix}`,
  };
}

function withoutRanges(input: string, ranges: readonly (readonly [number, number])[]): string {
  let result = input;
  for (const [start, end] of [...ranges].sort((left, right) => right[0] - left[0])) {
    result = replaceRange(result, start, end, '');
  }
  return result;
}

function hasStableCommonCore(
  sourcePassword: string,
  targetPassword: string,
  transformations: readonly CandidateTransformation[],
): boolean {
  const sourceCore = withoutRanges(
    sourcePassword,
    transformations.map(({ sourceChangedRange }) => sourceChangedRange),
  );
  const targetCore = withoutRanges(
    targetPassword,
    transformations.map(({ targetChangedRange }) => targetChangedRange),
  );
  return sourceCore === targetCore && [...sourceCore].length >= 4;
}

const transformationIdByAtoms: Readonly<Record<string, PasswordTransformationId>> = {
  account: 'account-or-service-term-replaced',
  year: 'bounded-year-changed',
  suffix: 'typical-suffix-changed-or-added',
  'account+year': 'account-term-and-year-changed',
  'account+suffix': 'account-term-and-suffix-changed',
  'year+suffix': 'year-and-suffix-changed',
  'account+year+suffix': 'account-term-year-and-suffix-changed',
};

function candidateCombinations(
  transformations: readonly CandidateTransformation[],
): readonly (readonly CandidateTransformation[])[] {
  const byAtom = {
    account: transformations.filter(({ atom }) => atom === 'account'),
    year: transformations.filter(({ atom }) => atom === 'year'),
    suffix: transformations.filter(({ atom }) => atom === 'suffix'),
  } as const;
  const combinations: CandidateTransformation[][] = [];
  for (const account of [null, ...byAtom.account]) {
    for (const year of [null, ...byAtom.year]) {
      for (const suffix of [null, ...byAtom.suffix]) {
        const combination = [account, year, suffix].filter(
          (item): item is CandidateTransformation => item !== null,
        );
        if (combination.length > 0) combinations.push(combination);
      }
    }
  }
  return combinations.sort((left, right) => left.length - right.length);
}

export function compareFictionalPasswords({
  sourcePassword,
  targetPassword,
  authoredAccountAndServiceTerms,
}: LocalPasswordComparisonInput): PasswordComparisonResult {
  if (sourcePassword === targetPassword) {
    return {
      kind: 'fictional-password-comparison',
      relation: {
        kind: 'exact-match',
        relationId: 'relation:exact-match',
        sourceEvidence: [evidenceSpan(sourcePassword, 0, sourcePassword.length)],
        targetEvidence: [evidenceSpan(targetPassword, 0, targetPassword.length)],
        explanationId: 's06.relation.exact-match',
      },
      disclaimerId: 'simulation-not-production-strength',
    };
  }

  const suffix = suffixTransformation(sourcePassword, targetPassword);
  const transformations = [
    ...accountTransformations(sourcePassword, targetPassword, authoredAccountAndServiceTerms),
    ...yearTransformations(sourcePassword, targetPassword),
    ...(suffix === null ? [] : [suffix]),
  ];
  for (const combination of candidateCombinations(transformations)) {
    const candidate = combination.reduce(
      (value, transformation) => transformation.apply(value),
      sourcePassword,
    );
    if (
      candidate !== targetPassword ||
      !hasStableCommonCore(sourcePassword, targetPassword, combination)
    )
      continue;
    const atoms = combination.map(({ atom }) => atom).join('+');
    const transformationId = transformationIdByAtoms[atoms];
    if (transformationId === undefined) continue;
    const evidenceId = combination
      .map(
        ({ sourceEvidence, targetEvidence }) =>
          `${sourceEvidence.start}-${sourceEvidence.end}:${targetEvidence.start}-${targetEvidence.end}`,
      )
      .join(':');
    return {
      kind: 'fictional-password-comparison',
      relation: {
        kind: 'derived-variant-match',
        relationId: `relation:${transformationId}:${evidenceId}`,
        transformationId,
        sourceEvidence: combination.map(({ sourceEvidence }) => sourceEvidence),
        targetEvidence: combination.map(({ targetEvidence }) => targetEvidence),
        candidate,
        explanationId: `s06.relation.${transformationId}`,
      },
      disclaimerId: 'simulation-not-production-strength',
    };
  }

  return {
    kind: 'fictional-password-comparison',
    relation: {
      kind: 'no-derived-path-recognized',
      relationId: 'relation:no-derived-path-recognized',
      sourceEvidence: [],
      targetEvidence: [],
      explanationId: 's06.relation.no-derived-path-recognized',
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}
