import type {
  PasswordComparisonResult,
  PasswordEvidenceSpan,
  PasswordTransformationId,
} from '@passwo/contracts';

import { findCaseInsensitiveSpans } from './case-insensitive-spans.js';
import { canonicalizeTypicalLeet } from './password-guessing-analysis.js';

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

type TransformationAtom =
  | 'account'
  | 'year'
  | 'number'
  | 'suffix'
  | 'separator'
  | 'case'
  | 'leet'
  | 'edit'
  | 'repetition'
  | 'removal'
  | 'component';

type TransformationClass = 'main' | 'surface';

interface CandidateEdit {
  readonly sourceEvidence: PasswordEvidenceSpan;
  readonly targetEvidence: PasswordEvidenceSpan;
  readonly sourceChangedRange: readonly [number, number];
  readonly targetChangedRange: readonly [number, number];
}

interface CandidateTransformation {
  readonly atom: TransformationAtom;
  readonly class: TransformationClass;
  readonly priority: number;
  readonly edits: readonly CandidateEdit[];
}

interface IndexedCharacter {
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

function longestCommonSubsequenceMatches<T>(
  source: readonly T[],
  target: readonly T[],
  equals: (sourceItem: T, targetItem: T) => boolean,
): readonly (readonly [number, number])[] {
  const rows = source.length + 1;
  const columns = target.length + 1;
  const lcs = Array.from({ length: rows }, () => Array<number>(columns).fill(0));
  for (let sourceIndex = source.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
    const currentRow = lcs[sourceIndex];
    if (currentRow === undefined) continue;
    for (let targetIndex = target.length - 1; targetIndex >= 0; targetIndex -= 1) {
      const sourceItem = source[sourceIndex];
      const targetItem = target[targetIndex];
      currentRow[targetIndex] =
        sourceItem !== undefined && targetItem !== undefined && equals(sourceItem, targetItem)
          ? 1 + (lcs[sourceIndex + 1]?.[targetIndex + 1] ?? 0)
          : Math.max(
              lcs[sourceIndex + 1]?.[targetIndex] ?? 0,
              currentRow[targetIndex + 1] ?? 0,
            );
    }
  }

  const matches: Array<readonly [number, number]> = [];
  let sourceIndex = 0;
  let targetIndex = 0;
  while (sourceIndex < source.length && targetIndex < target.length) {
    const sourceItem = source[sourceIndex];
    const targetItem = target[targetIndex];
    if (sourceItem !== undefined && targetItem !== undefined && equals(sourceItem, targetItem)) {
      matches.push([sourceIndex, targetIndex]);
      sourceIndex += 1;
      targetIndex += 1;
      continue;
    }
    const skipSource = lcs[sourceIndex + 1]?.[targetIndex] ?? 0;
    const skipTarget = lcs[sourceIndex]?.[targetIndex + 1] ?? 0;
    if (skipSource >= skipTarget) sourceIndex += 1;
    else targetIndex += 1;
  }
  return matches;
}

interface LexicalComponent {
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly normalizedValue: string;
}

function isLetter(value: string): boolean {
  return /\p{L}/u.test(value);
}

function shouldSplitLexicalRun(
  characters: readonly IndexedCharacter[],
  runStartIndex: number,
  index: number,
): boolean {
  const previous = characters[index - 1]?.value;
  const current = characters[index]?.value;
  const next = characters[index + 1]?.value;
  if (previous === undefined || current === undefined) return false;
  if (/\p{Ll}/u.test(previous) && /\p{Lu}/u.test(current)) return true;
  return (
    index - runStartIndex >= 2 &&
    /\p{Lu}/u.test(previous) &&
    /\p{Lu}/u.test(current) &&
    next !== undefined &&
    /\p{Ll}/u.test(next)
  );
}

function lexicalComponents(input: string): readonly LexicalComponent[] {
  const characters = indexedCharacters(input);
  const components: LexicalComponent[] = [];
  let runStartIndex: number | null = null;

  const pushRun = (endIndex: number): void => {
    if (runStartIndex === null || endIndex <= runStartIndex) return;
    const first = characters[runStartIndex];
    const last = characters[endIndex - 1];
    if (first === undefined || last === undefined) return;
    const value = input.slice(first.start, last.end);
    components.push({
      start: first.start,
      end: last.end,
      value,
      normalizedValue: value.toLocaleLowerCase('de-DE'),
    });
  };

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (character === undefined) continue;
    if (!isLetter(character.value)) {
      pushRun(index);
      runStartIndex = null;
      continue;
    }
    if (runStartIndex === null) {
      runStartIndex = index;
      continue;
    }
    if (shouldSplitLexicalRun(characters, runStartIndex, index)) {
      pushRun(index);
      runStartIndex = index;
    }
  }
  pushRun(characters.length);
  return components;
}

function componentReplacementTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const source = lexicalComponents(sourcePassword);
  const target = lexicalComponents(targetPassword);
  if (source.length === 0 || target.length === 0) return [];

  const matches = longestCommonSubsequenceMatches(
    source,
    target,
    (sourceComponent, targetComponent) =>
      sourceComponent.normalizedValue === targetComponent.normalizedValue,
  );

  const transformations: CandidateTransformation[] = [];
  let sourceCursor = 0;
  let targetCursor = 0;
  for (const [sourceMatch, targetMatch] of [
    ...matches,
    [source.length, target.length] as const,
  ]) {
    const sourceDifferenceCount = sourceMatch - sourceCursor;
    const targetDifferenceCount = targetMatch - targetCursor;
    if (sourceDifferenceCount === 1 && targetDifferenceCount === 1) {
      const sourceComponent = source[sourceCursor];
      const targetComponent = target[targetCursor];
      if (
        sourceComponent !== undefined &&
        targetComponent !== undefined &&
        sourceComponent.normalizedValue !== targetComponent.normalizedValue &&
        [...sourceComponent.value].length >= 3 &&
        [...targetComponent.value].length >= 3
      ) {
        transformations.push(
          transformation(
            'component',
            'main',
            60,
            sourcePassword,
            targetPassword,
            [sourceComponent.start, sourceComponent.end],
            [targetComponent.start, targetComponent.end],
          ),
        );
      }
    }
    sourceCursor = sourceMatch + 1;
    targetCursor = targetMatch + 1;
  }
  return transformations;
}

interface DifferenceHunk {
  readonly sourceStart: number;
  readonly sourceEnd: number;
  readonly targetStart: number;
  readonly targetEnd: number;
  readonly sourceValue: string;
  readonly targetValue: string;
}

function evidenceSpan(input: string, start: number, end: number): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: input.slice(start, end) };
}

function replaceRange(input: string, start: number, end: number, replacement: string): string {
  return `${input.slice(0, start)}${replacement}${input.slice(end)}`;
}

function indexedCharacters(input: string): readonly IndexedCharacter[] {
  const characters: IndexedCharacter[] = [];
  let offset = 0;
  for (const value of input) {
    characters.push({ value, start: offset, end: offset + value.length });
    offset += value.length;
  }
  return characters;
}

function characterBoundary(
  characters: readonly IndexedCharacter[],
  index: number,
  fallback: number,
): number {
  return characters[index]?.start ?? fallback;
}

function differenceHunks(sourcePassword: string, targetPassword: string): readonly DifferenceHunk[] {
  const source = indexedCharacters(sourcePassword);
  const target = indexedCharacters(targetPassword);
  const matches = longestCommonSubsequenceMatches(
    source,
    target,
    (sourceCharacter, targetCharacter) => sourceCharacter.value === targetCharacter.value,
  );

  const hunks: DifferenceHunk[] = [];
  let sourceCursor = 0;
  let targetCursor = 0;
  for (const [sourceMatch, targetMatch] of [
    ...matches,
    [source.length, target.length] as const,
  ]) {
    if (sourceCursor < sourceMatch || targetCursor < targetMatch) {
      const sourceStart = characterBoundary(source, sourceCursor, sourcePassword.length);
      const sourceEnd = characterBoundary(source, sourceMatch, sourcePassword.length);
      const targetStart = characterBoundary(target, targetCursor, targetPassword.length);
      const targetEnd = characterBoundary(target, targetMatch, targetPassword.length);
      hunks.push({
        sourceStart,
        sourceEnd,
        targetStart,
        targetEnd,
        sourceValue: sourcePassword.slice(sourceStart, sourceEnd),
        targetValue: targetPassword.slice(targetStart, targetEnd),
      });
    }
    sourceCursor = sourceMatch + 1;
    targetCursor = targetMatch + 1;
  }
  return hunks;
}

function transformation(
  atom: TransformationAtom,
  transformationClass: TransformationClass,
  priority: number,
  sourcePassword: string,
  targetPassword: string,
  sourceRange: readonly [number, number],
  targetRange: readonly [number, number],
): CandidateTransformation {
  return {
    atom,
    class: transformationClass,
    priority,
    edits: [
      {
        sourceEvidence: evidenceSpan(sourcePassword, sourceRange[0], sourceRange[1]),
        targetEvidence: evidenceSpan(targetPassword, targetRange[0], targetRange[1]),
        sourceChangedRange: sourceRange,
        targetChangedRange: targetRange,
      },
    ],
  };
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
  ].sort((left, right) => right.length - left.length || left.localeCompare(right, 'de-DE'));
  for (const sourceTerm of normalizedTerms) {
    const sourceSpan = firstCaseInsensitiveSpan(sourcePassword, sourceTerm);
    if (sourceSpan === null) continue;
    for (const targetTerm of normalizedTerms) {
      if (sourceTerm.toLocaleLowerCase('de-DE') === targetTerm.toLocaleLowerCase('de-DE')) continue;
      const targetSpan = firstCaseInsensitiveSpan(targetPassword, targetTerm);
      if (targetSpan === null) continue;
      transformations.push(
        transformation(
          'account',
          'main',
          10,
          sourcePassword,
          targetPassword,
          sourceSpan,
          targetSpan,
        ),
      );
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
      transformations.push(
        transformation(
          'year',
          'surface',
          20,
          sourcePassword,
          targetPassword,
          [source.index, source.index + source[0].length],
          [target.index, target.index + target[0].length],
        ),
      );
    }
  }
  return transformations;
}

function looksLikeYear(value: string): boolean {
  return /^(?:19|20)\d{2}$/u.test(value);
}

function containingYear(input: string, start: number, end: number): string | null {
  for (const match of input.matchAll(/(?:19|20)\d{2}/gu)) {
    const matchEnd = match.index + match[0].length;
    if (start >= match.index && end <= matchEnd) return match[0];
  }
  return null;
}

function isUnboundedYearDifference(
  sourcePassword: string,
  targetPassword: string,
  hunk: DifferenceHunk,
): boolean {
  const sourceYear = containingYear(sourcePassword, hunk.sourceStart, hunk.sourceEnd);
  const targetYear = containingYear(targetPassword, hunk.targetStart, hunk.targetEnd);
  return (
    sourceYear !== null &&
    targetYear !== null &&
    Math.abs(Number(sourceYear) - Number(targetYear)) > 2
  );
}

function numberTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const sourceNumbers = [...sourcePassword.matchAll(/\d+/gu)].filter(
    ({ 0: value }) => [...value].length <= 4,
  );
  const targetNumbers = [...targetPassword.matchAll(/\d+/gu)].filter(
    ({ 0: value }) => [...value].length <= 4,
  );
  const transformations: CandidateTransformation[] = [];
  for (const source of sourceNumbers) {
    for (const target of targetNumbers) {
      if (source[0] === target[0]) continue;
      if (looksLikeYear(source[0]) && looksLikeYear(target[0])) continue;
      transformations.push(
        transformation(
          'number',
          'surface',
          24,
          sourcePassword,
          targetPassword,
          [source.index, source.index + source[0].length],
          [target.index, target.index + target[0].length],
        ),
      );
    }
  }
  return transformations;
}

const symbolicSuffixPattern = /[!?._-]{1,3}$/u;
const numericSuffixPattern = /\d{1,4}$/u;

interface TypicalSuffixParts {
  readonly range: readonly [number, number];
  readonly numericRange: readonly [number, number] | null;
  readonly symbolicRange: readonly [number, number] | null;
}

function terminalNumericRange(
  input: string,
  end: number,
): readonly [number, number] | null {
  const prefix = input.slice(0, end);
  const match = numericSuffixPattern.exec(prefix);
  if (match === null) return null;
  if (match.index > 0 && /\d/u.test(prefix.slice(match.index - 1, match.index))) return null;
  return [match.index, end];
}

function typicalSuffixParts(input: string): TypicalSuffixParts | null {
  const symbolicMatch = symbolicSuffixPattern.exec(input);
  const symbolicRange: readonly [number, number] | null =
    symbolicMatch === null ? null : [symbolicMatch.index, input.length];
  const numericEnd = symbolicRange?.[0] ?? input.length;
  const numericRange = terminalNumericRange(input, numericEnd);
  if (numericRange === null && symbolicRange === null) return null;
  return {
    range: [numericRange?.[0] ?? symbolicRange?.[0] ?? input.length, input.length],
    numericRange,
    symbolicRange,
  };
}

function typicalSuffix(input: string): readonly [number, number] | null {
  return typicalSuffixParts(input)?.range ?? null;
}

function suffixTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const sourceParts = typicalSuffixParts(sourcePassword);
  const targetParts = typicalSuffixParts(targetPassword);
  if (sourceParts === null && targetParts === null) return [];

  if (sourceParts === null || targetParts === null) {
    const sourceRange: readonly [number, number] =
      sourceParts?.range ?? [sourcePassword.length, sourcePassword.length];
    const targetRange: readonly [number, number] =
      targetParts?.range ?? [targetPassword.length, targetPassword.length];
    return [
      transformation(
        'suffix',
        'surface',
        18,
        sourcePassword,
        targetPassword,
        sourceRange,
        targetRange,
      ),
    ];
  }

  const transformations: CandidateTransformation[] = [];
  const sourceSymbolRange: readonly [number, number] =
    sourceParts.symbolicRange ?? [sourcePassword.length, sourcePassword.length];
  const targetSymbolRange: readonly [number, number] =
    targetParts.symbolicRange ?? [targetPassword.length, targetPassword.length];
  const sourceSymbol = sourcePassword.slice(sourceSymbolRange[0], sourceSymbolRange[1]);
  const targetSymbol = targetPassword.slice(targetSymbolRange[0], targetSymbolRange[1]);
  if (sourceSymbol !== targetSymbol) {
    transformations.push(
      transformation(
        'suffix',
        'surface',
        18,
        sourcePassword,
        targetPassword,
        sourceSymbolRange,
        targetSymbolRange,
      ),
    );
  }

  const sourceNumberInsertion = sourceParts.symbolicRange?.[0] ?? sourcePassword.length;
  const targetNumberInsertion = targetParts.symbolicRange?.[0] ?? targetPassword.length;
  const sourceNumberRange: readonly [number, number] =
    sourceParts.numericRange ?? [sourceNumberInsertion, sourceNumberInsertion];
  const targetNumberRange: readonly [number, number] =
    targetParts.numericRange ?? [targetNumberInsertion, targetNumberInsertion];
  const sourceNumber = sourcePassword.slice(sourceNumberRange[0], sourceNumberRange[1]);
  const targetNumber = targetPassword.slice(targetNumberRange[0], targetNumberRange[1]);
  if ((sourceNumber.length === 0) !== (targetNumber.length === 0)) {
    transformations.push(
      transformation(
        'suffix',
        'surface',
        19,
        sourcePassword,
        targetPassword,
        sourceNumberRange,
        targetNumberRange,
      ),
    );
  }

  return transformations;
}

const separatorPattern = /^[-_.\s]{0,2}$/u;

function isSeparatorChange(sourceValue: string, targetValue: string): boolean {
  return (
    sourceValue !== targetValue &&
    (sourceValue.length > 0 || targetValue.length > 0) &&
    separatorPattern.test(sourceValue) &&
    separatorPattern.test(targetValue)
  );
}

function isSingleCharacterRun(value: string): boolean {
  const characters = [...value];
  return characters.length >= 4 && characters.every((character) => character === characters[0]);
}

function isRepeatedPatternChange(sourceValue: string, targetValue: string): boolean {
  const sourceCharacters = [...sourceValue];
  const targetCharacters = [...targetValue];
  return (
    sourceCharacters.length === targetCharacters.length &&
    isSingleCharacterRun(sourceValue) &&
    isSingleCharacterRun(targetValue) &&
    sourceCharacters[0] !== targetCharacters[0]
  );
}

interface RepeatedRun {
  readonly start: number;
  readonly end: number;
  readonly value: string;
  readonly length: number;
}

function repeatedRuns(input: string): readonly RepeatedRun[] {
  const characters = indexedCharacters(input);
  const runs: RepeatedRun[] = [];
  let startIndex = 0;
  while (startIndex < characters.length) {
    const first = characters[startIndex];
    if (first === undefined) break;
    let endIndex = startIndex + 1;
    while (characters[endIndex]?.value === first.value) endIndex += 1;
    if (endIndex - startIndex >= 4) {
      const last = characters[endIndex - 1];
      if (last !== undefined) {
        runs.push({
          start: first.start,
          end: last.end,
          value: input.slice(first.start, last.end),
          length: endIndex - startIndex,
        });
      }
    }
    startIndex = endIndex;
  }
  return runs;
}

function repeatedPatternTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const transformations: CandidateTransformation[] = [];
  for (const sourceRun of repeatedRuns(sourcePassword)) {
    for (const targetRun of repeatedRuns(targetPassword)) {
      if (
        sourceRun.length !== targetRun.length ||
        !isRepeatedPatternChange(sourceRun.value, targetRun.value)
      ) {
        continue;
      }
      transformations.push(
        transformation(
          'repetition',
          'main',
          12,
          sourcePassword,
          targetPassword,
          [sourceRun.start, sourceRun.end],
          [targetRun.start, targetRun.end],
        ),
      );
    }
  }
  return transformations;
}

function characterClass(
  value: string,
): 'digit' | 'lower' | 'upper' | 'letter' | 'separator' | 'other' {
  if (/\d/u.test(value)) return 'digit';
  if (/[-_.\s]/u.test(value)) return 'separator';
  if (/\p{Ll}/u.test(value)) return 'lower';
  if (/\p{Lu}/u.test(value)) return 'upper';
  if (/\p{L}/u.test(value)) return 'letter';
  return 'other';
}

function hasComponentBoundary(left: string, right: string): boolean {
  const leftClass = characterClass(left);
  const rightClass = characterClass(right);
  if (leftClass === 'separator' || rightClass === 'separator') return true;
  if (leftClass === 'digit' && rightClass !== 'digit') return true;
  if (leftClass !== 'digit' && rightClass === 'digit') return true;
  return leftClass === 'lower' && rightClass === 'upper';
}

function componentBoundaryAt(input: string, offset: number): boolean {
  const left = indexedCharacters(input.slice(0, offset)).at(-1)?.value;
  const right = indexedCharacters(input.slice(offset))[0]?.value;
  return left !== undefined && right !== undefined && hasComponentBoundary(left, right);
}

function boundaryComponentRemovalTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const sourceSuffixStart = typicalSuffix(sourcePassword)?.[0] ?? sourcePassword.length;
  const targetSuffixStart = typicalSuffix(targetPassword)?.[0] ?? targetPassword.length;
  const sourceBase = sourcePassword.slice(0, sourceSuffixStart);
  const targetBase = targetPassword.slice(0, targetSuffixStart);
  if ([...targetBase].length < 4 || sourceBase === targetBase) return [];

  const normalizedSource = sourceBase.toLocaleLowerCase('de-DE');
  const normalizedTarget = targetBase.toLocaleLowerCase('de-DE');
  const transformations: CandidateTransformation[] = [];

  if (
    normalizedSource.startsWith(normalizedTarget) &&
    sourceBase.length > targetBase.length &&
    componentBoundaryAt(sourceBase, targetBase.length)
  ) {
    transformations.push(
      transformation(
        'removal',
        'main',
        14,
        sourcePassword,
        targetPassword,
        [targetBase.length, sourceBase.length],
        [targetBase.length, targetBase.length],
      ),
    );
  }

  const leadingRemovalEnd = sourceBase.length - targetBase.length;
  if (
    normalizedSource.endsWith(normalizedTarget) &&
    leadingRemovalEnd > 0 &&
    componentBoundaryAt(sourceBase, leadingRemovalEnd)
  ) {
    transformations.push(
      transformation(
        'removal',
        'main',
        14,
        sourcePassword,
        targetPassword,
        [0, leadingRemovalEnd],
        [0, 0],
      ),
    );
  }

  return transformations;
}

function isRemovableBoundaryComponent(
  sourcePassword: string,
  targetPassword: string,
  hunk: DifferenceHunk,
): boolean {
  if (hunk.targetValue.length !== 0 || [...hunk.sourceValue].length < 2) return false;
  if ([...targetPassword].length < 4) return false;
  if (hunk.sourceStart === 0) {
    const removed = indexedCharacters(hunk.sourceValue);
    const retained = indexedCharacters(sourcePassword.slice(hunk.sourceEnd));
    const left = removed.at(-1)?.value;
    const right = retained[0]?.value;
    return left !== undefined && right !== undefined && hasComponentBoundary(left, right);
  }
  if (hunk.sourceEnd === sourcePassword.length) {
    const retained = indexedCharacters(sourcePassword.slice(0, hunk.sourceStart));
    const removed = indexedCharacters(hunk.sourceValue);
    const left = retained.at(-1)?.value;
    const right = removed[0]?.value;
    return left !== undefined && right !== undefined && hasComponentBoundary(left, right);
  }
  return false;
}

function isSingleEdit(sourceValue: string, targetValue: string): boolean {
  const source = [...sourceValue];
  const target = [...targetValue];
  if (Math.abs(source.length - target.length) > 1) return false;
  if (source.length === target.length) {
    return source.reduce(
      (differences, character, index) => differences + (character === target[index] ? 0 : 1),
      0,
    ) === 1;
  }
  const shorter = source.length < target.length ? source : target;
  const longer = source.length < target.length ? target : source;
  let shorterIndex = 0;
  let longerIndex = 0;
  let skipped = false;
  while (shorterIndex < shorter.length && longerIndex < longer.length) {
    if (shorter[shorterIndex] === longer[longerIndex]) {
      shorterIndex += 1;
      longerIndex += 1;
      continue;
    }
    if (skipped) return false;
    skipped = true;
    longerIndex += 1;
  }
  return true;
}

function transpositionTransformation(
  sourcePassword: string,
  targetPassword: string,
): CandidateTransformation | null {
  const source = indexedCharacters(sourcePassword);
  const target = indexedCharacters(targetPassword);
  if (source.length !== target.length || source.length < 2) return null;
  const differences = source.flatMap((character, index) =>
    character.value === target[index]?.value ? [] : [index],
  );
  if (differences.length !== 2) return null;
  const first = differences[0];
  const second = differences[1];
  if (
    first === undefined ||
    second === undefined ||
    second !== first + 1 ||
    source[first]?.value !== target[second]?.value ||
    source[second]?.value !== target[first]?.value
  ) {
    return null;
  }
  return transformation(
    'edit',
    'surface',
    38,
    sourcePassword,
    targetPassword,
    [source[first]?.start ?? 0, source[second]?.end ?? sourcePassword.length],
    [target[first]?.start ?? 0, target[second]?.end ?? targetPassword.length],
  );
}

function mergeAtomTransformations(
  transformations: readonly CandidateTransformation[],
  atom: 'case' | 'leet' | 'separator',
  maximumEdits: number,
): readonly CandidateTransformation[] {
  const matching = transformations.filter((item) => item.atom === atom);
  const editCount = matching.reduce((sum, item) => sum + item.edits.length, 0);
  if (matching.length <= 1 || editCount > maximumEdits) return transformations;
  const first = matching[0];
  if (first === undefined) return transformations;
  return [
    ...transformations.filter((item) => item.atom !== atom),
    {
      atom,
      class: 'surface',
      priority: first.priority,
      edits: matching.flatMap(({ edits }) => edits),
    },
  ];
}

function hunkTransformations(
  sourcePassword: string,
  targetPassword: string,
): readonly CandidateTransformation[] {
  const candidates = differenceHunks(sourcePassword, targetPassword).flatMap((hunk) => {
    const sourceRange = [hunk.sourceStart, hunk.sourceEnd] as const;
    const targetRange = [hunk.targetStart, hunk.targetEnd] as const;
    const candidates: CandidateTransformation[] = [];
    const unboundedYearDifference = isUnboundedYearDifference(
      sourcePassword,
      targetPassword,
      hunk,
    );

    if (isRepeatedPatternChange(hunk.sourceValue, hunk.targetValue)) {
      candidates.push(
        transformation(
          'repetition',
          'main',
          12,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    if (isRemovableBoundaryComponent(sourcePassword, targetPassword, hunk)) {
      candidates.push(
        transformation(
          'removal',
          'main',
          14,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    if (
      !unboundedYearDifference &&
      /^\d{1,4}$/u.test(hunk.sourceValue) &&
      /^\d{1,4}$/u.test(hunk.targetValue) &&
      !(looksLikeYear(hunk.sourceValue) && looksLikeYear(hunk.targetValue))
    ) {
      candidates.push(
        transformation(
          'number',
          'surface',
          24,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    if (
      hunk.sourceValue.length > 0 &&
      hunk.targetValue.length > 0 &&
      hunk.sourceValue !== hunk.targetValue &&
      hunk.sourceValue.toLocaleLowerCase('de-DE') ===
        hunk.targetValue.toLocaleLowerCase('de-DE')
    ) {
      candidates.push(
        transformation(
          'case',
          'surface',
          26,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    if (isSeparatorChange(hunk.sourceValue, hunk.targetValue)) {
      candidates.push(
        transformation(
          'separator',
          'surface',
          28,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    if (
      hunk.sourceValue.length > 0 &&
      hunk.targetValue.length > 0 &&
      hunk.sourceValue !== hunk.targetValue &&
      canonicalizeTypicalLeet(hunk.sourceValue) === canonicalizeTypicalLeet(hunk.targetValue) &&
      [...hunk.sourceValue].length <= 2 &&
      [...hunk.targetValue].length <= 2
    ) {
      candidates.push(
        transformation(
          'leet',
          'surface',
          30,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    if (!unboundedYearDifference && isSingleEdit(hunk.sourceValue, hunk.targetValue)) {
      candidates.push(
        transformation(
          'edit',
          'surface',
          40,
          sourcePassword,
          targetPassword,
          sourceRange,
          targetRange,
        ),
      );
    }
    return candidates;
  });
  const casesMerged = mergeAtomTransformations(candidates, 'case', Number.POSITIVE_INFINITY);
  const leetMerged = mergeAtomTransformations(casesMerged, 'leet', 2);
  return mergeAtomTransformations(leetMerged, 'separator', 4);
}

function rangeOverlap(
  left: readonly [number, number],
  right: readonly [number, number],
): boolean {
  const leftEmpty = left[0] === left[1];
  const rightEmpty = right[0] === right[1];
  if (leftEmpty && rightEmpty) return left[0] === right[0];
  if (leftEmpty) return left[0] > right[0] && left[0] < right[1];
  if (rightEmpty) return right[0] > left[0] && right[0] < left[1];
  return left[0] < right[1] && right[0] < left[1];
}

function transformationsOverlap(
  left: CandidateTransformation,
  right: CandidateTransformation,
): boolean {
  return left.edits.some((leftEdit) =>
    right.edits.some(
      (rightEdit) =>
        rangeOverlap(leftEdit.sourceChangedRange, rightEdit.sourceChangedRange) ||
        rangeOverlap(leftEdit.targetChangedRange, rightEdit.targetChangedRange),
    ),
  );
}

function transformationKey(item: CandidateTransformation): string {
  return [
    item.atom,
    ...item.edits.flatMap(({ sourceChangedRange, targetChangedRange }) => [
      `${sourceChangedRange[0]}-${sourceChangedRange[1]}`,
      `${targetChangedRange[0]}-${targetChangedRange[1]}`,
    ]),
  ].join(':');
}

function candidateCombinations(
  transformations: readonly CandidateTransformation[],
): readonly (readonly CandidateTransformation[])[] {
  const unique = [
    ...new Map(transformations.map((item) => [transformationKey(item), item])).values(),
  ];
  const combinations: CandidateTransformation[][] = [];

  function visit(start: number, selected: readonly CandidateTransformation[]): void {
    for (let index = start; index < unique.length; index += 1) {
      const candidate = unique[index];
      if (candidate === undefined) continue;
      const next = [...selected, candidate];
      const mainCount = next.filter(
        ({ class: transformationClass }) => transformationClass === 'main',
      ).length;
      const surfaceCount = next.filter(
        ({ class: transformationClass }) => transformationClass === 'surface',
      ).length;
      if (mainCount > 1 || surfaceCount > 3) continue;
      if (selected.some((existing) => transformationsOverlap(existing, candidate))) continue;
      combinations.push(next);
      if (next.length < 4) visit(index + 1, next);
    }
  }

  visit(0, []);
  return combinations.sort((left, right) => {
    if (left.length !== right.length) return left.length - right.length;
    const leftPriority = left.reduce((sum, item) => sum + item.priority, 0);
    const rightPriority = right.reduce((sum, item) => sum + item.priority, 0);
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    return left
      .map(({ atom }) => atom)
      .join('+')
      .localeCompare(right.map(({ atom }) => atom).join('+'));
  });
}

function applyTransformations(
  sourcePassword: string,
  transformations: readonly CandidateTransformation[],
): string {
  const edits = transformations
    .flatMap(({ edits: transformationEdits }) => transformationEdits)
    .sort(
      (left, right) =>
        right.sourceChangedRange[0] - left.sourceChangedRange[0] ||
        right.sourceChangedRange[1] - left.sourceChangedRange[1],
    );
  return edits.reduce(
    (candidate, edit) =>
      replaceRange(
        candidate,
        edit.sourceChangedRange[0],
        edit.sourceChangedRange[1],
        edit.targetEvidence.token,
      ),
    sourcePassword,
  );
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
  const editsRemovedFromCore = transformations
    .filter(({ atom }) => atom !== 'case')
    .flatMap(({ edits }) => edits);
  const sourceCore = withoutRanges(
    sourcePassword,
    editsRemovedFromCore.map(({ sourceChangedRange }) => sourceChangedRange),
  );
  const targetCore = withoutRanges(
    targetPassword,
    editsRemovedFromCore.map(({ targetChangedRange }) => targetChangedRange),
  );
  if (
    sourceCore.toLocaleLowerCase('de-DE') === targetCore.toLocaleLowerCase('de-DE') &&
    [...sourceCore].length >= 4
  ) {
    return true;
  }
  return transformations.some(
    ({ atom, edits }) =>
      atom === 'repetition' &&
      edits.some(({ sourceEvidence, targetEvidence }) =>
        isRepeatedPatternChange(sourceEvidence.token, targetEvidence.token),
      ),
  );
}

function transformationIdFor(
  transformations: readonly CandidateTransformation[],
): PasswordTransformationId | null {
  const atoms = transformations.map(({ atom }) => atom);
  const atomSet = new Set(atoms);
  if (atoms.length === 1) {
    switch (atoms[0]) {
      case 'account':
        return 'account-or-service-term-replaced';
      case 'year':
        return 'bounded-year-changed';
      case 'number':
        return 'bounded-number-component-changed';
      case 'suffix':
        return 'typical-suffix-changed-added-or-removed';
      case 'separator':
        return 'separator-changed';
      case 'case':
        return 'capitalization-changed';
      case 'leet':
        return 'typical-leetspeak-changed';
      case 'edit':
        return 'single-character-changed';
      case 'repetition':
        return 'repeated-character-pattern-changed';
      case 'removal':
        return 'leading-or-trailing-component-removed';
      case 'component':
        return 'bounded-component-replaced';
      default:
        return null;
    }
  }
  if (atomSet.size === 2 && atomSet.has('account') && atomSet.has('year')) {
    return 'account-term-and-year-changed';
  }
  if (atomSet.size === 2 && atomSet.has('account') && atomSet.has('suffix')) {
    return 'account-term-and-suffix-changed';
  }
  if (atomSet.size === 2 && atomSet.has('year') && atomSet.has('suffix')) {
    return 'year-and-suffix-changed';
  }
  if (
    atomSet.size === 3 &&
    atomSet.has('account') &&
    atomSet.has('year') &&
    atomSet.has('suffix')
  ) {
    return 'account-term-year-and-suffix-changed';
  }
  if (atomSet.has('account')) return 'account-term-with-small-surface-changes';
  if (atomSet.has('repetition')) return 'repeated-pattern-with-small-surface-changes';
  if (atomSet.has('removal')) return 'component-removal-with-small-surface-changes';
  if (atomSet.has('component')) return 'component-replacement-with-small-surface-changes';
  return 'bounded-surface-changes';
}

function sortedEvidence(
  transformations: readonly CandidateTransformation[],
): readonly CandidateEdit[] {
  return transformations
    .flatMap(({ edits }) => edits)
    .sort(
      (left, right) =>
        left.sourceChangedRange[0] - right.sourceChangedRange[0] ||
        left.targetChangedRange[0] - right.targetChangedRange[0],
    );
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

  const suffixes = suffixTransformations(sourcePassword, targetPassword);
  const transposition = transpositionTransformation(sourcePassword, targetPassword);
  const transformations = [
    ...accountTransformations(sourcePassword, targetPassword, authoredAccountAndServiceTerms),
    ...yearTransformations(sourcePassword, targetPassword),
    ...numberTransformations(sourcePassword, targetPassword),
    ...repeatedPatternTransformations(sourcePassword, targetPassword),
    ...componentReplacementTransformations(sourcePassword, targetPassword),
    ...boundaryComponentRemovalTransformations(sourcePassword, targetPassword),
    ...suffixes,
    ...(transposition === null ? [] : [transposition]),
    ...hunkTransformations(sourcePassword, targetPassword),
  ];

  for (const combination of candidateCombinations(transformations)) {
    const candidate = applyTransformations(sourcePassword, combination);
    if (
      candidate !== targetPassword ||
      !hasStableCommonCore(sourcePassword, targetPassword, combination)
    ) {
      continue;
    }
    const transformationId = transformationIdFor(combination);
    if (transformationId === null) continue;
    const evidence = sortedEvidence(combination);
    const evidenceId = evidence
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
        sourceEvidence: evidence.map(({ sourceEvidence }) => sourceEvidence),
        targetEvidence: evidence.map(({ targetEvidence }) => targetEvidence),
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
