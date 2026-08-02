export interface NormalizedText {
  readonly value: string;
  readonly originalStartByCodeUnit: readonly number[];
  readonly originalEndByCodeUnit: readonly number[];
}

export function normalizeCaseWithOriginalOffsets(input: string): NormalizedText {
  let value = '';
  const originalStartByCodeUnit: number[] = [];
  const originalEndByCodeUnit: number[] = [];
  let originalOffset = 0;
  for (const character of input) {
    const originalEnd = originalOffset + character.length;
    const normalizedCharacter = character.toLocaleLowerCase('de-DE');
    value += normalizedCharacter;
    for (let index = 0; index < normalizedCharacter.length; index += 1) {
      originalStartByCodeUnit.push(originalOffset);
      originalEndByCodeUnit.push(originalEnd);
    }
    originalOffset = originalEnd;
  }
  return { value, originalStartByCodeUnit, originalEndByCodeUnit };
}

export function originalSpanForNormalizedRange(
  normalized: NormalizedText,
  start: number,
  end: number,
): readonly [number, number] | null {
  const originalStart = normalized.originalStartByCodeUnit[start];
  const originalEnd = normalized.originalEndByCodeUnit[end - 1];
  return originalStart === undefined || originalEnd === undefined
    ? null
    : [originalStart, originalEnd];
}

export function findCaseInsensitiveSpans(
  input: string,
  token: string,
): readonly (readonly [number, number])[] {
  const spans: Array<readonly [number, number]> = [];
  const normalizedInput = normalizeCaseWithOriginalOffsets(input);
  const normalizedToken = normalizeCaseWithOriginalOffsets(token).value;
  let from = 0;
  while (normalizedToken.length > 0) {
    const start = normalizedInput.value.indexOf(normalizedToken, from);
    if (start < 0) break;
    const span = originalSpanForNormalizedRange(
      normalizedInput,
      start,
      start + normalizedToken.length,
    );
    if (span !== null) spans.push(span);
    from = start + normalizedToken.length;
  }
  return spans;
}
