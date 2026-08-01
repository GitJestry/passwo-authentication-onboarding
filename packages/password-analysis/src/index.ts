import type {
  FictionalPasswordComparisonInput,
  PasswordAnalysisResult,
  PasswordComparisonResult,
  PasswordEvidenceSpan,
  PasswordTransformationId,
  PasswordStructureAnalysisResult,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
  RuntimeStructureFinding,
} from '@passwo/contracts';

export * from './simulation-disposition.js';
export * from './theoretical-search-space.js';

export type {
  PasswordAnalysisResult,
  PasswordComparisonResult,
  PasswordStructureAnalysisResult,
  PasswordSingleFinding,
  RuntimeStructureFinding,
} from '@passwo/contracts';

export interface FictionalPasswordAnalysisInput {
  readonly fictionalPassword: string;
  /** Authored account terms only. Personal or participant data is not accepted. */
  readonly authoredAccountTerms?: readonly string[];
}

export interface FictionalPasswordStructureAnalysisInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
}

const commonPasswordCores = ['passwort', 'qwertz', 'admin', 'sommer'] as const;
const findingPriority: Readonly<Record<PasswordSingleFindingKind, number>> = {
  'common-password-core': 0,
  'account-or-service-term': 1,
  year: 2,
  'simple-number-sequence': 3,
  'repeated-component': 4,
  'typical-suffix': 5,
  'no-simple-component-recognized': 6,
};

function evidenceSpan(input: string, start: number, end: number): PasswordEvidenceSpan {
  return { type: 'span', start, end, token: input.slice(start, end) };
}

function finding(
  input: string,
  kind: Exclude<PasswordSingleFindingKind, 'no-simple-component-recognized'>,
  start: number,
  end: number,
  ordinal = 0,
): PasswordSingleFinding {
  return {
    id: `single:${kind}:${start}-${end}:${ordinal}`,
    kind,
    evidence: [evidenceSpan(input, start, end)],
    explanationId: `s05.${kind}`,
    confidence: kind === 'common-password-core' ? 'authored-exact-match' : 'bounded-heuristic',
  };
}

interface NormalizedText {
  readonly value: string;
  readonly originalStartByCodeUnit: readonly number[];
  readonly originalEndByCodeUnit: readonly number[];
}

function normalizeCaseWithOriginalOffsets(input: string): NormalizedText {
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

function originalSpanForNormalizedRange(
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

function findCaseInsensitiveSpans(input: string, token: string): readonly [number, number][] {
  const spans: [number, number][] = [];
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
    if (span !== null) spans.push([span[0], span[1]]);
    from = start + normalizedToken.length;
  }
  return spans;
}

function collectTokenFindings(
  input: string,
  tokens: readonly string[],
  kind: 'common-password-core' | 'account-or-service-term',
): readonly PasswordSingleFinding[] {
  const seen = new Set<string>();
  const findings: PasswordSingleFinding[] = [];
  for (const token of tokens) {
    const trimmedToken = token.trim();
    const normalizedToken = trimmedToken.toLocaleLowerCase('de-DE');
    if (normalizedToken.length < 3 || seen.has(normalizedToken)) continue;
    seen.add(normalizedToken);
    for (const [ordinal, [start, end]] of findCaseInsensitiveSpans(input, trimmedToken).entries()) {
      findings.push(finding(input, kind, start, end, ordinal));
    }
  }
  return findings;
}

function collectYears(input: string): readonly PasswordSingleFinding[] {
  return [...input.matchAll(/(?:19|20)\d{2}/gu)].map((match, ordinal) => {
    const start = match.index;
    return finding(input, 'year', start, start + match[0].length, ordinal);
  });
}

function isSimpleNumberSequence(value: string): boolean {
  if (value.length < 4) return false;
  const digits = [...value].map(Number);
  const first = digits[0];
  const second = digits[1];
  if (first === undefined || second === undefined) return false;
  const direction = second === first + 1 ? 1 : second === first - 1 ? -1 : 0;
  return (
    direction !== 0 &&
    digits.every((digit, index) => {
      const previous = digits[index - 1];
      return index === 0 || (previous !== undefined && digit === previous + direction);
    })
  );
}

function collectNumberSequences(input: string): readonly PasswordSingleFinding[] {
  return [...input.matchAll(/\d{4,}/gu)]
    .filter((match) => isSimpleNumberSequence(match[0]))
    .map((match, ordinal) => {
      const start = match.index;
      return finding(input, 'simple-number-sequence', start, start + match[0].length, ordinal);
    });
}

function collectRepeatedComponents(input: string): readonly PasswordSingleFinding[] {
  const normalized = normalizeCaseWithOriginalOffsets(input);
  const findings: PasswordSingleFinding[] = [];
  for (
    let componentLength = Math.floor(normalized.value.length / 2);
    componentLength >= 3;
    componentLength -= 1
  ) {
    for (let start = 0; start + componentLength * 2 <= normalized.value.length; start += 1) {
      const component = normalized.value.slice(start, start + componentLength);
      let end = start + componentLength;
      while (normalized.value.slice(end, end + componentLength) === component) {
        end += componentLength;
      }
      if (end >= start + componentLength * 2) {
        const span = originalSpanForNormalizedRange(normalized, start, end);
        if (span === null) continue;
        findings.push(finding(input, 'repeated-component', span[0], span[1]));
        return findings;
      }
    }
  }
  return findings;
}

function collectTypicalSuffix(input: string): readonly PasswordSingleFinding[] {
  const match = /[\p{L}]{3,}((?:\d{1,4})?[!?._-]+|\d{1,3})$/u.exec(input);
  if (match === null || match[1] === undefined) return [];
  const start = input.length - match[1].length;
  return [finding(input, 'typical-suffix', start, input.length)];
}

export function analyzeFictionalPassword({
  fictionalPassword,
  authoredAccountTerms = [],
}: FictionalPasswordAnalysisInput): PasswordAnalysisResult {
  const findings = [
    ...collectTokenFindings(fictionalPassword, commonPasswordCores, 'common-password-core'),
    ...collectTokenFindings(fictionalPassword, authoredAccountTerms, 'account-or-service-term'),
    ...collectYears(fictionalPassword),
    ...collectNumberSequences(fictionalPassword),
    ...collectRepeatedComponents(fictionalPassword),
    ...collectTypicalSuffix(fictionalPassword),
  ].sort((left, right) => findingPriority[left.kind] - findingPriority[right.kind]);

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
  for (const finding of findings) {
    for (const evidence of finding.evidence) {
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
  for (
    let componentLength = Math.floor(input.length / 2);
    componentLength >= 4;
    componentLength -= 1
  ) {
    for (let start = 0; start + componentLength * 2 <= input.length; start += 1) {
      const component = input.slice(start, start + componentLength);
      const spans: PasswordEvidenceSpan[] = [];
      let cursor = start;
      while (input.slice(cursor, cursor + componentLength) === component) {
        spans.push(evidenceSpan(input, cursor, cursor + componentLength));
        cursor += componentLength;
      }
      if (spans.length >= 2) return spans;
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
  finding: PasswordSingleFinding,
): readonly PasswordEvidenceSpan[] | null {
  const spans: PasswordEvidenceSpan[] = [];
  for (const evidence of finding.evidence) {
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
  const concreteComponentFindings = componentAnalysis.findings.flatMap((finding) => {
    const evidence = getValidatedEvidenceSpans(fictionalPassword, finding);
    return evidence === null ? [] : [{ ...finding, evidence }];
  });
  const repeatedComponentFinding = concreteComponentFindings.find(
    ({ kind }) => kind === 'repeated-component',
  );
  const repetitionSpans = findExactRepeatedComponentSpans(fictionalPassword);
  if (repeatedComponentFinding !== undefined && repetitionSpans !== null) {
    findings.push(structureFinding('exact-component-repetition', repetitionSpans));
  }

  const accountFindings = concreteComponentFindings.filter(
    ({ kind }) => kind === 'account-or-service-term',
  );
  const qualifierFindings = concreteComponentFindings.filter(
    ({ kind }) => kind === 'year' || kind === 'simple-number-sequence' || kind === 'typical-suffix',
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
    ({ kind }) => kind === 'year' || kind === 'simple-number-sequence',
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
  const normalizedTerms = [...new Set(terms.map((term) => term.trim()).filter((term) => term.length >= 3))];
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
            : replaceRange(candidate, currentSpan[0], currentSpan[1], targetPassword.slice(targetSpan[0], targetSpan[1]));
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
    apply: (candidate) => `${candidate.slice(0, candidate.length - sourceSuffix.length)}${targetSuffix}`,
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
}: FictionalPasswordComparisonInput): PasswordComparisonResult {
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
    const candidate = combination.reduce((value, transformation) => transformation.apply(value), sourcePassword);
    if (candidate !== targetPassword || !hasStableCommonCore(sourcePassword, targetPassword, combination)) continue;
    const atoms = combination.map(({ atom }) => atom).join('+');
    const transformationId = transformationIdByAtoms[atoms];
    if (transformationId === undefined) continue;
    const evidenceId = combination
      .map(({ sourceEvidence, targetEvidence }) => `${sourceEvidence.start}-${sourceEvidence.end}:${targetEvidence.start}-${targetEvidence.end}`)
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
