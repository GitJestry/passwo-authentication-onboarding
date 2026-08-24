import type {
  PasswordComparisonResult,
  PasswordEvidenceSpan,
  PasswordTransformationBasis,
  PasswordTransformationId,
  PasswordTransformationOperation,
  PasswordTransformationStep,
  PasswordTransformationStepKind,
} from '@passwo/contracts';

import { findCaseInsensitiveSpans } from './case-insensitive-spans.js';
import { isTypicalLeetTransformation } from './password-guessing-analysis.js';

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
  readonly sourceAccountIdentifiers: readonly string[];
  readonly targetAccountIdentifiers: readonly string[];
}

const maximumGeneralDistance = 3;
const maximumNormalizedDistance = 0.25;
const maximumAccountResidualDistance = 2;
const minimumAccountCommonCoreLength = 4;
const comparisonSegmenter = new Intl.Segmenter('de-DE', { granularity: 'grapheme' });

interface IndexedCharacter {
  readonly value: string;
  readonly comparisonValue: string;
  readonly start: number;
  readonly end: number;
}

type AlignmentActionKind =
  | 'match'
  | 'substitute'
  | 'insert'
  | 'delete'
  | 'transpose';

interface AlignmentAction {
  readonly kind: AlignmentActionKind;
  readonly sourceStart: number;
  readonly sourceEnd: number;
  readonly targetStart: number;
  readonly targetEnd: number;
  readonly cost: 0 | 1;
}

interface AlignmentResult {
  readonly distance: number;
  readonly sourceCharacters: readonly IndexedCharacter[];
  readonly targetCharacters: readonly IndexedCharacter[];
  readonly actions: readonly AlignmentAction[];
  readonly longestUnchangedRun: number;
}

interface RawEdit {
  readonly operation: PasswordTransformationOperation;
  readonly sourceEvidence: PasswordEvidenceSpan;
  readonly targetEvidence: PasswordEvidenceSpan;
  readonly cost: number;
}

interface DraftTransformationStep {
  readonly kind: PasswordTransformationStepKind;
  readonly operation: PasswordTransformationOperation;
  readonly sourceEvidence: PasswordEvidenceSpan;
  readonly targetEvidence: PasswordEvidenceSpan;
  readonly cost: number;
}

interface TokenSpan {
  readonly start: number;
  readonly end: number;
  readonly token: string;
}

interface BoundedIdentifierSpan extends TokenSpan {
  readonly identifier: string;
}

interface NumericEditGroup {
  readonly key: string;
  readonly sourceToken: TokenSpan | null;
  readonly targetToken: TokenSpan | null;
}

interface DerivedRelationInput {
  readonly sourcePassword: string;
  readonly targetPassword: string;
  readonly basis: PasswordTransformationBasis;
  readonly rawDistance: number;
  readonly normalizedDistance: number;
  readonly pathCost: number;
  readonly steps: readonly PasswordTransformationStep[];
}

function indexedCharacters(input: string): readonly IndexedCharacter[] {
  return [...comparisonSegmenter.segment(input)].map(({ segment, index }) => ({
    value: segment,
    comparisonValue: segment.normalize('NFC'),
    start: index,
    end: index + segment.length,
  }));
}

function matrixValue(matrix: readonly (readonly number[])[], row: number, column: number): number {
  return matrix[row]?.[column] ?? Number.POSITIVE_INFINITY;
}

function alignmentCharacterClass(value: string): 'letter' | 'number' | 'other' {
  if (/^\p{L}\p{M}*$/u.test(value.normalize('NFD'))) return 'letter';
  if (/^\p{N}+$/u.test(value)) return 'number';
  return 'other';
}

function alignmentPriority(
  kind: Exclude<AlignmentActionKind, 'match'>,
  sourceValue: string,
  targetValue: string,
): number {
  switch (kind) {
    case 'transpose':
      return 0;
    case 'substitute':
      // In an equal-cost path, keep like character classes paired. This preserves a trailing
      // insertion as its own edit instead of pairing a digit with the new terminal symbol.
      return alignmentCharacterClass(sourceValue) === alignmentCharacterClass(targetValue)
        ? 1
        : 4;
    case 'delete':
      return 2;
    case 'insert':
      return 3;
  }
}

/**
 * Computes the restricted Damerau-Levenshtein distance, also known as optimal string alignment.
 * Adjacent transpositions cost one operation and cannot overlap another transposition.
 */
function alignPasswords(source: string, target: string): AlignmentResult {
  const sourceCharacters = indexedCharacters(source);
  const targetCharacters = indexedCharacters(target);
  const distances = Array.from({ length: sourceCharacters.length + 1 }, () =>
    Array<number>(targetCharacters.length + 1).fill(0),
  );
  const decisions = Array.from({ length: sourceCharacters.length + 1 }, () =>
    Array<AlignmentActionKind | null>(targetCharacters.length + 1).fill(null),
  );

  for (let sourceIndex = 1; sourceIndex <= sourceCharacters.length; sourceIndex += 1) {
    const row = distances[sourceIndex];
    const decisionRow = decisions[sourceIndex];
    if (row === undefined || decisionRow === undefined) continue;
    row[0] = sourceIndex;
    decisionRow[0] = 'delete';
  }
  const firstRow = distances[0];
  const firstDecisionRow = decisions[0];
  if (firstRow !== undefined && firstDecisionRow !== undefined) {
    for (let targetIndex = 1; targetIndex <= targetCharacters.length; targetIndex += 1) {
      firstRow[targetIndex] = targetIndex;
      firstDecisionRow[targetIndex] = 'insert';
    }
  }

  for (let sourceIndex = 1; sourceIndex <= sourceCharacters.length; sourceIndex += 1) {
    const row = distances[sourceIndex];
    const decisionRow = decisions[sourceIndex];
    if (row === undefined || decisionRow === undefined) continue;
    for (let targetIndex = 1; targetIndex <= targetCharacters.length; targetIndex += 1) {
      const sourceCharacter = sourceCharacters[sourceIndex - 1];
      const targetCharacter = targetCharacters[targetIndex - 1];
      if (sourceCharacter === undefined || targetCharacter === undefined) continue;
      if (sourceCharacter.comparisonValue === targetCharacter.comparisonValue) {
        row[targetIndex] = matrixValue(distances, sourceIndex - 1, targetIndex - 1);
        decisionRow[targetIndex] = 'match';
        continue;
      }

      const candidates: Array<{
        readonly kind: Exclude<AlignmentActionKind, 'match'>;
        readonly cost: number;
      }> = [
        {
          kind: 'substitute',
          cost: matrixValue(distances, sourceIndex - 1, targetIndex - 1) + 1,
        },
        { kind: 'delete', cost: matrixValue(distances, sourceIndex - 1, targetIndex) + 1 },
        { kind: 'insert', cost: matrixValue(distances, sourceIndex, targetIndex - 1) + 1 },
      ];
      const previousSource = sourceCharacters[sourceIndex - 2];
      const previousTarget = targetCharacters[targetIndex - 2];
      if (
        previousSource !== undefined &&
        previousTarget !== undefined &&
        sourceCharacter.comparisonValue === previousTarget.comparisonValue &&
        previousSource.comparisonValue === targetCharacter.comparisonValue
      ) {
        candidates.push({
          kind: 'transpose',
          cost: matrixValue(distances, sourceIndex - 2, targetIndex - 2) + 1,
        });
      }
      candidates.sort(
        (left, right) =>
          left.cost - right.cost ||
          alignmentPriority(
            left.kind,
            sourceCharacter.comparisonValue,
            targetCharacter.comparisonValue,
          ) -
            alignmentPriority(
              right.kind,
              sourceCharacter.comparisonValue,
              targetCharacter.comparisonValue,
            ),
      );
      const selected = candidates[0];
      if (selected === undefined) continue;
      row[targetIndex] = selected.cost;
      decisionRow[targetIndex] = selected.kind;
    }
  }

  const reversedActions: AlignmentAction[] = [];
  let sourceIndex = sourceCharacters.length;
  let targetIndex = targetCharacters.length;
  while (sourceIndex > 0 || targetIndex > 0) {
    const decision = decisions[sourceIndex]?.[targetIndex];
    if (decision === null || decision === undefined) {
      throw new Error('Damerau-Levenshtein alignment ended without a deterministic backtrace.');
    }
    switch (decision) {
      case 'match':
        reversedActions.push({
          kind: decision,
          sourceStart: sourceIndex - 1,
          sourceEnd: sourceIndex,
          targetStart: targetIndex - 1,
          targetEnd: targetIndex,
          cost: 0,
        });
        sourceIndex -= 1;
        targetIndex -= 1;
        break;
      case 'substitute':
        reversedActions.push({
          kind: decision,
          sourceStart: sourceIndex - 1,
          sourceEnd: sourceIndex,
          targetStart: targetIndex - 1,
          targetEnd: targetIndex,
          cost: 1,
        });
        sourceIndex -= 1;
        targetIndex -= 1;
        break;
      case 'delete':
        reversedActions.push({
          kind: decision,
          sourceStart: sourceIndex - 1,
          sourceEnd: sourceIndex,
          targetStart: targetIndex,
          targetEnd: targetIndex,
          cost: 1,
        });
        sourceIndex -= 1;
        break;
      case 'insert':
        reversedActions.push({
          kind: decision,
          sourceStart: sourceIndex,
          sourceEnd: sourceIndex,
          targetStart: targetIndex - 1,
          targetEnd: targetIndex,
          cost: 1,
        });
        targetIndex -= 1;
        break;
      case 'transpose':
        reversedActions.push({
          kind: decision,
          sourceStart: sourceIndex - 2,
          sourceEnd: sourceIndex,
          targetStart: targetIndex - 2,
          targetEnd: targetIndex,
          cost: 1,
        });
        sourceIndex -= 2;
        targetIndex -= 2;
        break;
    }
  }

  const actions = reversedActions.reverse();
  let currentUnchangedRun = 0;
  let longestUnchangedRun = 0;
  for (const action of actions) {
    if (action.kind === 'match') {
      currentUnchangedRun += action.sourceEnd - action.sourceStart;
      longestUnchangedRun = Math.max(longestUnchangedRun, currentUnchangedRun);
    } else {
      currentUnchangedRun = 0;
    }
  }

  return {
    distance: matrixValue(distances, sourceCharacters.length, targetCharacters.length),
    sourceCharacters,
    targetCharacters,
    actions,
    longestUnchangedRun,
  };
}

function characterRange(
  characters: readonly IndexedCharacter[],
  start: number,
  end: number,
  inputLength: number,
): readonly [number, number] {
  if (start === end) {
    const boundary = characters[start]?.start ?? inputLength;
    return [boundary, boundary];
  }
  const first = characters[start];
  const last = characters[end - 1];
  if (first === undefined || last === undefined) return [inputLength, inputLength];
  return [first.start, last.end];
}

function evidenceSpan(input: string, start: number, end: number): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: input.slice(start, end) };
}

function rawEditsFromAlignment(
  sourcePassword: string,
  targetPassword: string,
  sourceSlice: string,
  targetSlice: string,
  sourceOffset: number,
  targetOffset: number,
  alignment: AlignmentResult,
): readonly RawEdit[] {
  return alignment.actions.flatMap((action): readonly RawEdit[] => {
    if (action.kind === 'match') return [];
    const localSourceRange = characterRange(
      alignment.sourceCharacters,
      action.sourceStart,
      action.sourceEnd,
      sourceSlice.length,
    );
    const localTargetRange = characterRange(
      alignment.targetCharacters,
      action.targetStart,
      action.targetEnd,
      targetSlice.length,
    );
    const sourceRange = [
      sourceOffset + localSourceRange[0],
      sourceOffset + localSourceRange[1],
    ] as const;
    const targetRange = [
      targetOffset + localTargetRange[0],
      targetOffset + localTargetRange[1],
    ] as const;
    const operation: PasswordTransformationOperation =
      action.kind === 'insert'
        ? 'insert'
        : action.kind === 'delete'
          ? 'remove'
          : action.kind === 'transpose'
            ? 'transpose'
            : 'replace';
    return [
      {
        operation,
        sourceEvidence: evidenceSpan(sourcePassword, sourceRange[0], sourceRange[1]),
        targetEvidence: evidenceSpan(targetPassword, targetRange[0], targetRange[1]),
        cost: action.cost,
      },
    ];
  });
}

function tokenSpans(input: string, pattern: RegExp): readonly TokenSpan[] {
  return [...input.matchAll(pattern)].map((match) => ({
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
    token: match[0],
  }));
}

function numericSpans(input: string): readonly TokenSpan[] {
  return tokenSpans(input, /\d+/gu);
}

function terminalSymbolSpan(input: string): TokenSpan | null {
  const match = /[!?._-]{1,3}$/u.exec(input);
  return match === null
    ? null
    : { start: match.index, end: input.length, token: match[0] };
}

function evidenceInsideToken(evidence: PasswordEvidenceSpan, token: TokenSpan): boolean {
  return evidence.start === evidence.end
    ? evidence.start >= token.start && evidence.start <= token.end
    : evidence.start >= token.start && evidence.end <= token.end;
}

function evidenceInsideOptionalTerminalSpan(
  evidence: PasswordEvidenceSpan,
  terminalSpan: TokenSpan | null,
  inputLength: number,
): boolean {
  return terminalSpan === null
    ? evidence.start === inputLength && evidence.end === inputLength
    : evidenceInsideToken(evidence, terminalSpan);
}

function combinedEvidence(
  input: string,
  evidence: readonly PasswordEvidenceSpan[],
): PasswordEvidenceSpan {
  const start = Math.min(...evidence.map(({ start }) => start));
  const end = Math.max(...evidence.map(({ end }) => end));
  return evidenceSpan(input, start, end);
}

function numericEditGroup(
  edit: RawEdit,
  sourceNumbers: readonly TokenSpan[],
  targetNumbers: readonly TokenSpan[],
): NumericEditGroup | null {
  const sourceToken =
    sourceNumbers.find((token) => evidenceInsideToken(edit.sourceEvidence, token)) ?? null;
  const targetToken =
    targetNumbers.find((token) => evidenceInsideToken(edit.targetEvidence, token)) ?? null;
  if (sourceToken === null && targetToken === null) return null;
  if (sourceToken === null && edit.operation !== 'insert') return null;
  if (targetToken === null && edit.operation !== 'remove') return null;
  if (sourceToken === null && targetToken !== null && [...targetToken.token].length < 2) {
    return null;
  }
  if (targetToken === null && sourceToken !== null && [...sourceToken.token].length < 2) {
    return null;
  }
  if (
    (sourceToken !== null && [...sourceToken.token].length > 4) ||
    (targetToken !== null && [...targetToken.token].length > 4)
  ) {
    return null;
  }
  const sourceKey =
    sourceToken === null
      ? `empty-${edit.sourceEvidence.start}`
      : `${sourceToken.start}-${sourceToken.end}`;
  const targetKey =
    targetToken === null
      ? `empty-${edit.targetEvidence.start}`
      : `${targetToken.start}-${targetToken.end}`;
  return { key: `${sourceKey}:${targetKey}`, sourceToken, targetToken };
}

function looksLikeBoundedYear(token: TokenSpan): boolean {
  return /^(?:19|20)\d{2}$/u.test(token.token);
}

function editsAreContiguous(left: RawEdit, right: RawEdit): boolean {
  return (
    left.sourceEvidence.end === right.sourceEvidence.start &&
    left.targetEvidence.end === right.targetEvidence.start
  );
}

function draftStep(
  kind: PasswordTransformationStepKind,
  operation: PasswordTransformationOperation,
  sourceEvidence: PasswordEvidenceSpan,
  targetEvidence: PasswordEvidenceSpan,
  cost: number,
): DraftTransformationStep {
  return { kind, operation, sourceEvidence, targetEvidence, cost };
}

function projectTransformationSteps(
  sourcePassword: string,
  targetPassword: string,
  edits: readonly RawEdit[],
): readonly DraftTransformationStep[] {
  if (edits.length === 0) return [];
  const sourceNumbers = numericSpans(sourcePassword);
  const targetNumbers = numericSpans(targetPassword);
  const sourceTerminalSymbols = terminalSymbolSpan(sourcePassword);
  const targetTerminalSymbols = terminalSymbolSpan(targetPassword);
  const used = new Set<number>();
  const drafts: DraftTransformationStep[] = [];

  const numericGroups = new Map<
    string,
    { readonly indexes: number[]; readonly group: NumericEditGroup }
  >();
  for (const [index, edit] of edits.entries()) {
    const group = numericEditGroup(edit, sourceNumbers, targetNumbers);
    if (group === null) continue;
    const existing = numericGroups.get(group.key);
    if (existing === undefined) {
      numericGroups.set(group.key, { indexes: [index], group });
    } else {
      existing.indexes.push(index);
    }
  }
  for (const { indexes, group } of numericGroups.values()) {
    const groupedEdits = indexes.flatMap((index) => {
      const edit = edits[index];
      return edit === undefined ? [] : [edit];
    });
    const first = groupedEdits[0];
    if (first === undefined) continue;
    for (const index of indexes) used.add(index);
    const sourceEvidence =
      group.sourceToken === null
        ? evidenceSpan(sourcePassword, first.sourceEvidence.start, first.sourceEvidence.start)
        : evidenceSpan(sourcePassword, group.sourceToken.start, group.sourceToken.end);
    const targetEvidence =
      group.targetToken === null
        ? evidenceSpan(targetPassword, first.targetEvidence.start, first.targetEvidence.start)
        : evidenceSpan(targetPassword, group.targetToken.start, group.targetToken.end);
    drafts.push(
      draftStep(
        group.sourceToken !== null &&
          group.targetToken !== null &&
          looksLikeBoundedYear(group.sourceToken) &&
          looksLikeBoundedYear(group.targetToken)
          ? 'year-change'
          : 'number-change',
        group.sourceToken === null
          ? 'insert'
          : group.targetToken === null
            ? 'remove'
            : 'replace',
        sourceEvidence,
        targetEvidence,
        groupedEdits.reduce((sum, edit) => sum + edit.cost, 0),
      ),
    );
  }

  for (let startIndex = 0; startIndex < edits.length; startIndex += 1) {
    if (used.has(startIndex)) continue;
    let selectedEnd = -1;
    for (
      let endIndex = startIndex;
      endIndex < Math.min(edits.length, startIndex + 3);
      endIndex += 1
    ) {
      if (used.has(endIndex)) break;
      const previous = edits[endIndex - 1];
      const current = edits[endIndex];
      if (
        endIndex > startIndex &&
        (previous === undefined || current === undefined || !editsAreContiguous(previous, current))
      ) {
        break;
      }
      const candidateEdits = edits.slice(startIndex, endIndex + 1);
      const sourceEvidence = combinedEvidence(
        sourcePassword,
        candidateEdits.map((edit) => edit.sourceEvidence),
      );
      const targetEvidence = combinedEvidence(
        targetPassword,
        candidateEdits.map((edit) => edit.targetEvidence),
      );
      if (isTypicalLeetTransformation(sourceEvidence.token, targetEvidence.token)) {
        selectedEnd = endIndex;
      }
    }
    if (selectedEnd < startIndex) continue;
    const groupedEdits = edits.slice(startIndex, selectedEnd + 1);
    groupedEdits.forEach((_, relativeIndex) => used.add(startIndex + relativeIndex));
    drafts.push(
      draftStep(
        'leet-substitution',
        'replace',
        combinedEvidence(
          sourcePassword,
          groupedEdits.map((edit) => edit.sourceEvidence),
        ),
        combinedEvidence(
          targetPassword,
          groupedEdits.map((edit) => edit.targetEvidence),
        ),
        groupedEdits.reduce((sum, edit) => sum + edit.cost, 0),
      ),
    );
  }

  const suffixIndexes = edits.flatMap((edit, index) =>
    !used.has(index) &&
    evidenceInsideOptionalTerminalSpan(
      edit.sourceEvidence,
      sourceTerminalSymbols,
      sourcePassword.length,
    ) &&
    evidenceInsideOptionalTerminalSpan(
      edit.targetEvidence,
      targetTerminalSymbols,
      targetPassword.length,
    )
      ? [index]
      : [],
  );
  if (suffixIndexes.length > 0) {
    const suffixEdits = suffixIndexes.flatMap((index) => {
      const edit = edits[index];
      return edit === undefined ? [] : [edit];
    });
    suffixIndexes.forEach((index) => used.add(index));
    const sourceEvidence = combinedEvidence(
      sourcePassword,
      suffixEdits.map((edit) => edit.sourceEvidence),
    );
    const targetEvidence = combinedEvidence(
      targetPassword,
      suffixEdits.map((edit) => edit.targetEvidence),
    );
    drafts.push(
      draftStep(
        'suffix-change',
        sourceEvidence.token.length === 0
          ? 'insert'
          : targetEvidence.token.length === 0
            ? 'remove'
            : 'replace',
        sourceEvidence,
        targetEvidence,
        suffixEdits.reduce((sum, edit) => sum + edit.cost, 0),
      ),
    );
  }

  for (const [index, edit] of edits.entries()) {
    if (used.has(index)) continue;
    const source = edit.sourceEvidence.token;
    const target = edit.targetEvidence.token;
    const separatorChange =
      source !== target &&
      (source.length > 0 || target.length > 0) &&
      /^[-_.\s]*$/u.test(source) &&
      /^[-_.\s]*$/u.test(target);
    const capitalizationChange =
      source.length > 0 &&
      target.length > 0 &&
      source !== target &&
      source.toLocaleLowerCase('de-DE') === target.toLocaleLowerCase('de-DE');
    const kind: PasswordTransformationStepKind =
      edit.operation === 'transpose'
        ? 'adjacent-transposition'
        : capitalizationChange
          ? 'capitalization-change'
          : isTypicalLeetTransformation(source, target)
            ? 'leet-substitution'
            : separatorChange
              ? 'separator-change'
              : edit.operation === 'insert'
                ? 'character-insertion'
                : edit.operation === 'remove'
                  ? 'character-deletion'
                  : 'character-substitution';
    drafts.push(
      draftStep(
        kind,
        edit.operation,
        edit.sourceEvidence,
        edit.targetEvidence,
        edit.cost,
      ),
    );
  }

  return drafts.sort(
    (left, right) =>
      left.sourceEvidence.start - right.sourceEvidence.start ||
      left.targetEvidence.start - right.targetEvidence.start ||
      left.sourceEvidence.end - right.sourceEvidence.end,
  );
}

function finalizeSteps(
  sourcePassword: string,
  drafts: readonly DraftTransformationStep[],
): readonly PasswordTransformationStep[] {
  const orderedDrafts = [...drafts].sort(
    (left, right) =>
      left.sourceEvidence.start - right.sourceEvidence.start ||
      left.targetEvidence.start - right.targetEvidence.start ||
      left.sourceEvidence.end - right.sourceEvidence.end ||
      left.targetEvidence.end - right.targetEvidence.end,
  );
  let candidate = sourcePassword;
  let cumulativeLengthDelta = 0;
  // Evidence offsets stay anchored to the original source. Apply ordered steps left to right while
  // carrying the length delta introduced by all preceding insertions, removals and replacements.
  return orderedDrafts.map((step, index) => {
    const adjustedStart = step.sourceEvidence.start + cumulativeLengthDelta;
    const adjustedEnd = step.sourceEvidence.end + cumulativeLengthDelta;
    candidate = replacementAt(
      candidate,
      adjustedStart,
      adjustedEnd,
      step.targetEvidence.token,
    );
    cumulativeLengthDelta +=
      step.targetEvidence.token.length - step.sourceEvidence.token.length;
    return {
      ...step,
      id: `transformation:${index}:${step.kind}:${step.sourceEvidence.start}-${step.sourceEvidence.end}:${step.targetEvidence.start}-${step.targetEvidence.end}`,
      resultingCandidate: candidate,
      explanationId: `s06.transformation.${step.kind}`,
    };
  });
}

function replacementAt(
  input: string,
  start: number,
  end: number,
  replacement: string,
): string {
  return `${input.slice(0, start)}${replacement}${input.slice(end)}`;
}

function applyTransformationSteps(
  sourcePassword: string,
  steps: readonly PasswordTransformationStep[],
): string | null {
  let candidate = sourcePassword;
  let cumulativeLengthDelta = 0;
  for (const step of steps) {
    const adjustedStart = step.sourceEvidence.start + cumulativeLengthDelta;
    const adjustedEnd = step.sourceEvidence.end + cumulativeLengthDelta;
    candidate = replacementAt(
      candidate,
      adjustedStart,
      adjustedEnd,
      step.targetEvidence.token,
    );
    if (candidate !== step.resultingCandidate) return null;
    cumulativeLengthDelta +=
      step.targetEvidence.token.length - step.sourceEvidence.token.length;
  }
  return candidate;
}

function transformationIdForSteps(
  steps: readonly PasswordTransformationStep[],
): PasswordTransformationId {
  const kinds = new Set(steps.map(({ kind }) => kind));
  if (kinds.has('account-term-replacement')) {
    if (steps.length === 1) return 'account-or-service-term-replaced';
    if (kinds.size === 2 && kinds.has('year-change')) return 'account-term-and-year-changed';
    if (kinds.size === 2 && kinds.has('suffix-change')) return 'account-term-and-suffix-changed';
    if (kinds.size === 3 && kinds.has('year-change') && kinds.has('suffix-change')) {
      return 'account-term-year-and-suffix-changed';
    }
    return 'account-term-with-small-surface-changes';
  }
  if (steps.length === 1) {
    const step = steps[0];
    if (step !== undefined) {
      switch (step.kind) {
        case 'year-change':
          return 'bounded-year-changed';
        case 'number-change':
          return 'bounded-number-component-changed';
        case 'suffix-change':
          return 'typical-suffix-changed-added-or-removed';
        case 'separator-change':
          return 'separator-changed';
        case 'capitalization-change':
          return 'capitalization-changed';
        case 'leet-substitution':
          return 'typical-leetspeak-changed';
        case 'character-substitution':
        case 'character-insertion':
        case 'character-deletion':
        case 'adjacent-transposition':
          return step.cost === 1 ? 'single-character-changed' : 'bounded-surface-changes';
        case 'account-term-replacement':
          return 'account-or-service-term-replaced';
      }
    }
  }
  if (kinds.size === 2 && kinds.has('year-change') && kinds.has('suffix-change')) {
    return 'year-and-suffix-changed';
  }
  return 'bounded-surface-changes';
}

function relationFromPath({
  sourcePassword,
  targetPassword,
  basis,
  rawDistance,
  normalizedDistance,
  pathCost,
  steps,
}: DerivedRelationInput): PasswordComparisonResult | null {
  const reconstructedCandidate = applyTransformationSteps(sourcePassword, steps);
  if (
    steps.length === 0 ||
    reconstructedCandidate === null ||
    reconstructedCandidate.normalize('NFC') !== targetPassword.normalize('NFC')
  ) {
    return null;
  }
  const transformationId = transformationIdForSteps(steps);
  const evidenceId = steps
    .map(
      ({ sourceEvidence, targetEvidence }) =>
        `${sourceEvidence.start}-${sourceEvidence.end}:${targetEvidence.start}-${targetEvidence.end}`,
    )
    .join(':');
  return {
    kind: 'fictional-password-comparison',
    relation: {
      kind: 'derived-variant-match',
      relationId: `relation:${basis}:${transformationId}:${evidenceId}`,
      transformationId,
      basis,
      rawDistance,
      normalizedDistance,
      pathCost,
      steps,
      sourceEvidence: steps.map(({ sourceEvidence }) => sourceEvidence),
      targetEvidence: steps.map(({ targetEvidence }) => targetEvidence),
      candidate: targetPassword,
      explanationId: `s06.relation.${transformationId}`,
    },
    disclaimerId: 'simulation-not-production-strength',
  };
}

function normalizedDistance(distance: number, source: string, target: string): number {
  const maximumLength = Math.max(indexedCharacters(source).length, indexedCharacters(target).length);
  return maximumLength === 0 ? 0 : distance / maximumLength;
}

function isLetterGrapheme(value: string | undefined): boolean {
  return value !== undefined && /^\p{L}\p{M}*$/u.test(value.normalize('NFD'));
}

function isNumberGrapheme(value: string | undefined): boolean {
  return value !== undefined && /^\p{N}+$/u.test(value);
}

function isLowercaseLetterGrapheme(value: string | undefined): boolean {
  return value !== undefined && /^\p{Ll}\p{M}*$/u.test(value.normalize('NFD'));
}

function isUppercaseLetterGrapheme(value: string | undefined): boolean {
  return value !== undefined && /^\p{Lu}\p{M}*$/u.test(value.normalize('NFD'));
}

function supportedBoundary(input: string, offset: number): boolean {
  if (offset === 0 || offset === input.length) return true;
  const characters = indexedCharacters(input);
  const rightIndex = characters.findIndex(({ start }) => start === offset);
  if (rightIndex <= 0) return false;
  const left = characters[rightIndex - 1]?.comparisonValue;
  const right = characters[rightIndex]?.comparisonValue;
  const next = characters[rightIndex + 1]?.comparisonValue;
  if (left === undefined || right === undefined) return false;

  const leftIsLetter = isLetterGrapheme(left);
  const rightIsLetter = isLetterGrapheme(right);
  const leftIsNumber = isNumberGrapheme(left);
  const rightIsNumber = isNumberGrapheme(right);
  if ((!leftIsLetter && !leftIsNumber) || (!rightIsLetter && !rightIsNumber)) return true;
  if (leftIsNumber !== rightIsNumber) return true;
  if (isLowercaseLetterGrapheme(left) && isUppercaseLetterGrapheme(right)) return true;
  return (
    isUppercaseLetterGrapheme(left) &&
    isUppercaseLetterGrapheme(right) &&
    isLowercaseLetterGrapheme(next)
  );
}

function boundedIdentifierSpans(
  input: string,
  identifiers: readonly string[],
): readonly BoundedIdentifierSpan[] {
  const uniqueIdentifiers = [
    ...new Map(
      identifiers
        .map((identifier) => identifier.trim())
        .filter((identifier) => [...identifier].length >= 3)
        .map((identifier) => [identifier.toLocaleLowerCase('de-DE'), identifier]),
    ).values(),
  ].sort((left, right) => right.length - left.length || left.localeCompare(right, 'de-DE'));
  const spans: BoundedIdentifierSpan[] = [];
  for (const identifier of uniqueIdentifiers) {
    for (const [start, end] of findCaseInsensitiveSpans(input, identifier)) {
      if (!supportedBoundary(input, start) || !supportedBoundary(input, end)) continue;
      spans.push({ start, end, token: input.slice(start, end), identifier });
    }
  }
  return spans.sort(
    (left, right) =>
      left.start - right.start ||
      (right.end - right.start) - (left.end - left.start) ||
      left.identifier.localeCompare(right.identifier, 'de-DE'),
  );
}

function accountSpecificRelation({
  sourcePassword,
  targetPassword,
  sourceAccountIdentifiers,
  targetAccountIdentifiers,
}: LocalPasswordComparisonInput): PasswordComparisonResult | null {
  const sourceSpans = boundedIdentifierSpans(sourcePassword, sourceAccountIdentifiers);
  const targetSpans = boundedIdentifierSpans(targetPassword, targetAccountIdentifiers);
  const candidates: Array<{
    readonly result: PasswordComparisonResult;
    readonly residualDistance: number;
    readonly normalizedResidualDistance: number;
    readonly identifierCoverage: number;
  }> = [];

  for (const sourceSpan of sourceSpans) {
    for (const targetSpan of targetSpans) {
      if (
        sourceSpan.token.toLocaleLowerCase('de-DE') ===
        targetSpan.token.toLocaleLowerCase('de-DE')
      ) {
        continue;
      }
      const sourcePrefix = sourcePassword.slice(0, sourceSpan.start);
      const targetPrefix = targetPassword.slice(0, targetSpan.start);
      const sourceSuffix = sourcePassword.slice(sourceSpan.end);
      const targetSuffix = targetPassword.slice(targetSpan.end);
      const prefixAlignment = alignPasswords(sourcePrefix, targetPrefix);
      const suffixAlignment = alignPasswords(sourceSuffix, targetSuffix);
      const residualDistance = prefixAlignment.distance + suffixAlignment.distance;
      const sourceResidualLength =
        prefixAlignment.sourceCharacters.length + suffixAlignment.sourceCharacters.length;
      const targetResidualLength =
        prefixAlignment.targetCharacters.length + suffixAlignment.targetCharacters.length;
      const residualLength = Math.max(sourceResidualLength, targetResidualLength);
      const normalizedResidualDistance =
        residualLength === 0 ? 0 : residualDistance / residualLength;
      const longestCommonCore = Math.max(
        prefixAlignment.longestUnchangedRun,
        suffixAlignment.longestUnchangedRun,
      );
      if (
        residualDistance > maximumAccountResidualDistance ||
        normalizedResidualDistance > maximumNormalizedDistance + Number.EPSILON ||
        longestCommonCore < minimumAccountCommonCoreLength
      ) {
        continue;
      }

      const residualEdits = [
        ...rawEditsFromAlignment(
          sourcePassword,
          targetPassword,
          sourcePrefix,
          targetPrefix,
          0,
          0,
          prefixAlignment,
        ),
        ...rawEditsFromAlignment(
          sourcePassword,
          targetPassword,
          sourceSuffix,
          targetSuffix,
          sourceSpan.end,
          targetSpan.end,
          suffixAlignment,
        ),
      ];
      const residualDrafts = projectTransformationSteps(
        sourcePassword,
        targetPassword,
        residualEdits,
      );
      const accountDraft = draftStep(
        'account-term-replacement',
        'replace',
        evidenceSpan(sourcePassword, sourceSpan.start, sourceSpan.end),
        evidenceSpan(targetPassword, targetSpan.start, targetSpan.end),
        1,
      );
      const steps = finalizeSteps(sourcePassword, [accountDraft, ...residualDrafts]);
      const result = relationFromPath({
        sourcePassword,
        targetPassword,
        basis: 'bounded-account-transformation',
        rawDistance: residualDistance,
        normalizedDistance: normalizedResidualDistance,
        pathCost: 1 + residualDistance,
        steps,
      });
      if (result === null) continue;
      candidates.push({
        result,
        residualDistance,
        normalizedResidualDistance,
        identifierCoverage:
          [...sourceSpan.token].length + [...targetSpan.token].length,
      });
    }
  }

  candidates.sort(
    (left, right) =>
      left.residualDistance - right.residualDistance ||
      left.normalizedResidualDistance - right.normalizedResidualDistance ||
      right.identifierCoverage - left.identifierCoverage,
  );
  return candidates[0]?.result ?? null;
}

function generalEditRelation(
  sourcePassword: string,
  targetPassword: string,
): PasswordComparisonResult | null {
  const alignment = alignPasswords(sourcePassword, targetPassword);
  const ratio = normalizedDistance(alignment.distance, sourcePassword, targetPassword);
  if (
    alignment.distance < 1 ||
    alignment.distance > maximumGeneralDistance ||
    ratio > maximumNormalizedDistance + Number.EPSILON
  ) {
    return null;
  }
  const rawEdits = rawEditsFromAlignment(
    sourcePassword,
    targetPassword,
    sourcePassword,
    targetPassword,
    0,
    0,
    alignment,
  );
  const steps = finalizeSteps(
    sourcePassword,
    projectTransformationSteps(sourcePassword, targetPassword, rawEdits),
  );
  return relationFromPath({
    sourcePassword,
    targetPassword,
    basis: 'normalized-restricted-damerau-levenshtein',
    rawDistance: alignment.distance,
    normalizedDistance: ratio,
    pathCost: alignment.distance,
    steps,
  });
}

export function compareFictionalPasswords(
  input: LocalPasswordComparisonInput,
): PasswordComparisonResult {
  const { sourcePassword, targetPassword } = input;
  if (sourcePassword.normalize('NFC') === targetPassword.normalize('NFC')) {
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

  const accountRelation = accountSpecificRelation(input);
  if (accountRelation !== null) return accountRelation;
  const editRelation = generalEditRelation(sourcePassword, targetPassword);
  if (editRelation !== null) return editRelation;

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
