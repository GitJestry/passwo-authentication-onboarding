import type {
  PasswordAnalysisResult,
  PasswordComparisonFinding,
  PasswordComparisonResult,
  PasswordComparisonTransformation,
  PasswordEvidenceSpan,
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

const substitutionByCharacter: Readonly<Record<string, string>> = {
  '0': 'o',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  $: 's',
};

interface ComparableCore {
  readonly raw: string;
  readonly normalized: string;
  readonly start: number;
  readonly end: number;
  readonly suffix: string;
  readonly hadSubstitution: boolean;
}

function comparableCore(input: string): ComparableCore | null {
  const suffixMatch = /(?:\d{1,4})?[!?._-]+$|\d{1,4}$/u.exec(input);
  const suffix = suffixMatch?.[0] ?? '';
  const raw = input.slice(0, input.length - suffix.length);
  if (raw.length < 4 || !/[\p{L}]/u.test(raw)) return null;
  let hadSubstitution = false;
  const normalized = [...raw]
    .map((character) => {
      const replacement = substitutionByCharacter[character];
      if (replacement !== undefined) hadSubstitution = true;
      return replacement ?? character.toLocaleLowerCase('de-DE');
    })
    .join('');
  return {
    raw,
    normalized,
    start: 0,
    end: raw.length,
    suffix,
    hadSubstitution,
  };
}

function noDerivedPathFinding(): PasswordComparisonFinding {
  return {
    id: 'comparison:no-derived-path-recognized',
    kind: 'no-derived-path-recognized',
    evidence: [],
    explanationId: 's06.no-derived-path-recognized',
    confidence: 'bounded-heuristic',
    transformations: [],
  };
}

export function compareFictionalPasswords(
  sourcePassword: string,
  targetPassword: string,
): PasswordComparisonResult {
  if (sourcePassword === targetPassword) {
    return {
      kind: 'fictional-password-comparison',
      outcome: 'identical',
      findings: [
        {
          id: 'comparison:exact-match',
          kind: 'exact-match',
          evidence: [
            evidenceSpan(sourcePassword, 0, sourcePassword.length),
            evidenceSpan(targetPassword, 0, targetPassword.length),
          ],
          explanationId: 's06.exact-match',
          confidence: 'authored-exact-match',
          transformations: [],
        },
      ],
      disclaimerId: 'simulation-not-production-strength',
    };
  }

  const source = comparableCore(sourcePassword);
  const target = comparableCore(targetPassword);
  if (source !== null && target !== null && source.normalized === target.normalized) {
    const transformations: PasswordComparisonTransformation[] = [];
    if (source.raw.toLocaleLowerCase('de-DE') === target.raw.toLocaleLowerCase('de-DE')) {
      if (source.raw !== target.raw) transformations.push('case-change');
    } else if (source.hadSubstitution || target.hadSubstitution) {
      transformations.push('common-character-substitution');
    }
    if (source.suffix !== target.suffix) transformations.push('typical-suffix-change');
    if (transformations.length > 0 && transformations.length <= 2) {
      return {
        kind: 'fictional-password-comparison',
        outcome: 'similar',
        findings: [
          {
            id: `comparison:shared-core:${source.normalized}`,
            kind: 'shared-core-with-bounded-transformation',
            evidence: [
              evidenceSpan(sourcePassword, source.start, source.end),
              evidenceSpan(targetPassword, target.start, target.end),
            ],
            explanationId: 's06.shared-core-with-bounded-transformation',
            confidence: 'bounded-heuristic',
            transformations,
          },
        ],
        disclaimerId: 'simulation-not-production-strength',
      };
    }
  }

  return {
    kind: 'fictional-password-comparison',
    outcome: 'no-derived-path-recognized',
    findings: [noDerivedPathFinding()],
    disclaimerId: 'simulation-not-production-strength',
  };
}
