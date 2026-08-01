import type { TheoreticalSearchSpaceModel } from '@passwo/contracts';

export const LOWERCASE_ALPHABET_SIZE = 26;
export const SYSTEM_GENERATED_ALPHABET_SIZE = 72;
export const DEMONSTRATION_ATTEMPTS_PER_SECOND = 1_000_000_000_000n;

export interface TheoreticalSearchSpaceInput {
  readonly alphabetSize: number;
  readonly length: number;
  readonly attemptsPerSecond: bigint;
}

export function createTheoreticalSearchSpaceModel({
  alphabetSize,
  length,
  attemptsPerSecond,
}: TheoreticalSearchSpaceInput): TheoreticalSearchSpaceModel {
  if (!Number.isSafeInteger(alphabetSize) || alphabetSize < 1) {
    throw new RangeError('alphabetSize must be a positive safe integer');
  }
  if (!Number.isSafeInteger(length) || length < 1) {
    throw new RangeError('length must be a positive safe integer');
  }
  if (attemptsPerSecond < 1n) {
    throw new RangeError('attemptsPerSecond must be positive');
  }

  const totalCandidateCount = BigInt(alphabetSize) ** BigInt(length);
  return {
    kind: 'theoretical-search-space-model',
    alphabetSize,
    length,
    attemptsPerSecond,
    totalCandidateCount,
    exhaustiveSearchDuration: {
      wholeSeconds: totalCandidateCount / attemptsPerSecond,
      remainingCandidates: totalCandidateCount % attemptsPerSecond,
      attemptsPerSecond,
    },
    assumptions: {
      independentlyRandomCharacters: true,
      fixedAlphabet: true,
      exhaustiveSearch: true,
    },
  };
}

export function createLowercaseSearchSpaceModel(length: number): TheoreticalSearchSpaceModel {
  return createTheoreticalSearchSpaceModel({
    alphabetSize: LOWERCASE_ALPHABET_SIZE,
    length,
    attemptsPerSecond: DEMONSTRATION_ATTEMPTS_PER_SECOND,
  });
}

export function createSystemGeneratedSearchSpaceModel(length: number): TheoreticalSearchSpaceModel {
  return createTheoreticalSearchSpaceModel({
    alphabetSize: SYSTEM_GENERATED_ALPHABET_SIZE,
    length,
    attemptsPerSecond: DEMONSTRATION_ATTEMPTS_PER_SECOND,
  });
}
