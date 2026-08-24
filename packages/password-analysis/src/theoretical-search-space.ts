import type { TheoreticalSearchSpaceModel } from '@passwo/contracts';

export const LOWERCASE_ALPHABET_SIZE = 26;
export const SYSTEM_GENERATED_SYMBOLS = '!@#$%^&*?-';
export const SYSTEM_GENERATED_ALPHABET_SIZE =
  26 + 26 + 10 + SYSTEM_GENERATED_SYMBOLS.length;
export const DEMONSTRATION_ATTEMPTS_PER_SECOND = 1_000_000_000_000n;

/**
 * Authored upper bound for the final exhaustive-search path. It deliberately matches the
 * already displayed twelve-lowercase-character example (`26^12`, shown as about one day).
 * This is a simulation boundary, not a universal crack-time or password-strength threshold.
 */
export const MAX_SIMULATION_CANDIDATES = BigInt(LOWERCASE_ALPHABET_SIZE) ** 12n;

/** @deprecated Use MAX_SIMULATION_CANDIDATES for the shared authored boundary. */
export const MAX_EXHAUSTIVE_SEARCH_CANDIDATES = MAX_SIMULATION_CANDIDATES;

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

function observedPasswordAlphabetSize(password: string): number {
  let hasAsciiLowercase = false;
  let hasExtendedGermanLowercase = false;
  let hasAsciiUppercase = false;
  let hasExtendedGermanUppercase = false;
  let hasDigits = false;
  let hasAuthoredSymbols = false;
  let hasOtherAsciiPunctuationOrSpace = false;
  let hasOtherUnicode = false;

  for (const character of password) {
    if (/^[a-z]$/u.test(character)) hasAsciiLowercase = true;
    else if (/^[äöüß]$/u.test(character)) hasExtendedGermanLowercase = true;
    else if (/^[A-Z]$/u.test(character)) hasAsciiUppercase = true;
    else if (/^[ÄÖÜ]$/u.test(character)) hasExtendedGermanUppercase = true;
    else if (/^[0-9]$/u.test(character)) hasDigits = true;
    else if (SYSTEM_GENERATED_SYMBOLS.includes(character)) hasAuthoredSymbols = true;
    else if (/^[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]$/u.test(character)) {
      hasOtherAsciiPunctuationOrSpace = true;
    } else {
      hasOtherUnicode = true;
    }
  }

  // A finite fallback keeps unsupported Unicode from bypassing the final check merely because
  // it is outside the authored character classes. It intentionally covers a broad local pool.
  if (hasOtherUnicode) return 128;

  let alphabetSize = 0;
  if (hasExtendedGermanLowercase) alphabetSize += 30;
  else if (hasAsciiLowercase) alphabetSize += 26;
  if (hasExtendedGermanUppercase) alphabetSize += 29;
  else if (hasAsciiUppercase) alphabetSize += 26;
  if (hasDigits) alphabetSize += 10;
  if (hasOtherAsciiPunctuationOrSpace) alphabetSize += 33;
  else if (hasAuthoredSymbols) alphabetSize += SYSTEM_GENERATED_SYMBOLS.length;
  return alphabetSize;
}

/**
 * Builds the final complete-search family from the code-point length and the union of observed
 * authored character classes. The result is used only after no concrete candidate path covers
 * the whole fictional password.
 */
export function createFictionalPasswordExhaustiveSearchModel(
  fictionalPassword: string,
): TheoreticalSearchSpaceModel | null {
  const length = [...fictionalPassword].length;
  if (length === 0) return null;
  const alphabetSize = observedPasswordAlphabetSize(fictionalPassword);
  if (alphabetSize < 1) return null;
  return createTheoreticalSearchSpaceModel({
    alphabetSize,
    length,
    attemptsPerSecond: DEMONSTRATION_ATTEMPTS_PER_SECOND,
  });
}
