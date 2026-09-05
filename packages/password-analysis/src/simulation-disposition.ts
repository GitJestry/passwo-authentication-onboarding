import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  PasswordLengthOrientation,
  PasswordSimulationDisposition,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
  TransientPasswordSemanticEvidence,
} from '@passwo/contracts';
import {
  isCuratedPredictablePhrase,
  matchExplicitPasswordAnchorVariant,
  PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
} from './password-guessing-analysis.js';
import {
  createFictionalPasswordExhaustiveSearchModel,
  MAX_SIMULATION_CANDIDATES,
} from './theoretical-search-space.js';

export const SELF_CREATED_PASSWORD_LENGTH_ORIENTATION = 15;

export interface PasswordSimulationDispositionInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
  /**
   * Retained for controller compatibility. Participant-confirmed semantic relations are
   * explanatory reflection data and deliberately do not affect the objective simulation result.
   */
  readonly semanticEvidence?: TransientPasswordSemanticEvidence;
}

const directWholeCandidateKinds = new Set<PasswordSingleFindingKind>([
  'common-password-core',
  'common-word',
  'common-name',
  'keyboard-pattern',
  'year',
  'date',
  'simple-character-sequence',
  'predictable-word-sequence',
  'repeated-component',
  'account-or-service-term',
]);

const composedCandidateKinds = new Set<PasswordSingleFindingKind>([
  ...directWholeCandidateKinds,
  'typical-suffix',
]);

const evidencePriority: Readonly<Partial<Record<PasswordSingleFindingKind, number>>> = {
  'account-or-service-term': 0,
  'repeated-component': 1,
  'keyboard-pattern': 2,
  'simple-character-sequence': 3,
  'predictable-word-sequence': 4,
  date: 5,
  year: 6,
  'common-password-core': 7,
  'common-word': 8,
  'common-name': 9,
  'typical-suffix': 10,
};

interface CandidateEvidence {
  readonly finding: PasswordSingleFinding;
  readonly span: PasswordEvidenceSpan;
}

interface EvidenceSelection {
  readonly items: readonly CandidateEvidence[];
  readonly coveredCodeUnits: number;
  readonly priority: number;
}

interface CandidateSource {
  readonly key: string;
  readonly size: bigint;
}

const asciiPunctuationCharacters = [
  ...'!"#$%&\'()*+,-./',
  ...':;<=>?@',
  ...'[\\]^_`',
  ...'{|}~',
] as const;

const highPriorityTypicalSuffixes = new Set<string>([
  ...asciiPunctuationCharacters,
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '00',
  '01',
  '07',
  '10',
  '11',
  '12',
  '21',
  '22',
  '23',
  '24',
  '42',
  '69',
  '99',
  '123',
  '321',
  '1234',
  '0000',
  '1111',
  '123!',
  '123?',
  '123!?',
  '123?!',
]);

const candidateSourceSizes = {
  shortLexical: 350n,
  generalLexical: 80_000n,
  commonPassword: 100_000n,
  explicitPasswordAnchor: 32n,
  accountContext: 64n,
  keyboardPattern: 10_000n,
  year: 200n,
  date: 36_600n,
  sequence: 10_000n,
  predictableWordSequence: 10_000n,
  repetition: 100_000n,
  typicalSuffix: BigInt(highPriorityTypicalSuffixes.size),
  connector: 48n,
} as const;

const predictableConnectorTemplates = new Set([
  '-',
  '_',
  '.',
  '/',
  ':',
  '+',
  '=',
  '@',
  '&',
  '|',
  ',',
  ';',
  ' ',
  '#',
  '!',
  '?',
]);

function lengthOrientationFor(fictionalPassword: string): PasswordLengthOrientation {
  return [...fictionalPassword].length < SELF_CREATED_PASSWORD_LENGTH_ORIENTATION
    ? 'below-15'
    : 'at-least-15';
}

function findingSpans(finding: PasswordSingleFinding): readonly PasswordEvidenceSpan[] {
  return finding.evidence.filter(
    (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
  );
}

function isValidSpan(span: PasswordEvidenceSpan, fictionalPassword: string): boolean {
  return (
    Number.isInteger(span.start) &&
    Number.isInteger(span.end) &&
    span.start >= 0 &&
    span.end > span.start &&
    span.end <= fictionalPassword.length &&
    fictionalPassword.slice(span.start, span.end) === span.token
  );
}

function spansWholePassword(span: PasswordEvidenceSpan, fictionalPassword: string): boolean {
  return (
    fictionalPassword.length > 0 &&
    span.start === 0 &&
    span.end === fictionalPassword.length &&
    span.token === fictionalPassword
  );
}

function directWholePasswordRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): {
  readonly ruleId:
    | 'whole-password-recognized-value'
    | 'whole-password-recognized-generated-candidate';
  readonly findingIds: readonly string[];
} | null {
  const wholeCandidate = findings.find(
    (finding) =>
      directWholeCandidateKinds.has(finding.kind) &&
      findingSpans(finding).some((span) => spansWholePassword(span, fictionalPassword)),
  );
  if (wholeCandidate === undefined) return null;

  const transformation = findings.find(
    (finding) =>
      finding.kind === 'typical-transformation' &&
      findingSpans(finding).some((span) => spansWholePassword(span, fictionalPassword)),
  );
  return {
    ruleId:
      transformation === undefined
        ? 'whole-password-recognized-value'
        : 'whole-password-recognized-generated-candidate',
    findingIds:
      transformation === undefined
        ? [wholeCandidate.id]
        : [wholeCandidate.id, transformation.id],
  };
}

function typicalSuffixCandidateCount(token: string): bigint | null {
  if (highPriorityTypicalSuffixes.has(token)) return candidateSourceSizes.typicalSuffix;
  const match = /^(\d{0,4})([\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{0,3})$/u.exec(
    token,
  );
  if (match === null || token.length === 0) return null;
  const digits = match[1] ?? '';
  const punctuation = match[2] ?? '';
  if (digits.length === 0 && punctuation.length === 0) return null;
  return 10n ** BigInt(digits.length) * 32n ** BigInt(punctuation.length);
}

function candidateEvidence(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): readonly CandidateEvidence[] {
  return findings.flatMap((finding) =>
    composedCandidateKinds.has(finding.kind)
      ? findingSpans(finding)
          .filter((span) => isValidSpan(span, fictionalPassword))
          .filter((span) => {
            if (
              finding.kind === 'repeated-component' &&
              !spansWholePassword(span, fictionalPassword) &&
              /^[^\p{L}\p{N}]+$/u.test(span.token)
            ) {
              return false;
            }
            return (
              finding.kind !== 'typical-suffix' ||
              (span.end === fictionalPassword.length &&
                typicalSuffixCandidateCount(span.token) !== null)
            );
          })
          .map((span) => ({ finding, span }))
      : [],
  );
}

function betterSelection(left: EvidenceSelection, right: EvidenceSelection): EvidenceSelection {
  if (left.coveredCodeUnits !== right.coveredCodeUnits) {
    return left.coveredCodeUnits > right.coveredCodeUnits ? left : right;
  }
  if (left.items.length !== right.items.length) {
    return left.items.length < right.items.length ? left : right;
  }
  if (left.priority !== right.priority) return left.priority < right.priority ? left : right;

  const leftKey = left.items
    .map(({ finding, span }) => `${span.start}:${span.end}:${finding.kind}`)
    .join('|');
  const rightKey = right.items
    .map(({ finding, span }) => `${span.start}:${span.end}:${finding.kind}`)
    .join('|');
  return leftKey <= rightKey ? left : right;
}

function selectCanonicalEvidence(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): readonly CandidateEvidence[] {
  const candidates = candidateEvidence(fictionalPassword, findings);
  const candidatesByStart = new Map<number, CandidateEvidence[]>();
  for (const candidate of candidates) {
    const items = candidatesByStart.get(candidate.span.start) ?? [];
    items.push(candidate);
    candidatesByStart.set(candidate.span.start, items);
  }
  for (const items of candidatesByStart.values()) {
    items.sort(
      (left, right) =>
        right.span.end - left.span.end ||
        (evidencePriority[left.finding.kind] ?? 99) -
          (evidencePriority[right.finding.kind] ?? 99) ||
        left.finding.id.localeCompare(right.finding.id),
    );
  }

  const bestFrom = new Map<number, EvidenceSelection>();
  const chooseFrom = (offset: number): EvidenceSelection => {
    if (offset >= fictionalPassword.length) {
      return { items: [], coveredCodeUnits: 0, priority: 0 };
    }
    const cached = bestFrom.get(offset);
    if (cached !== undefined) return cached;

    let best = chooseFrom(offset + 1);
    for (const candidate of candidatesByStart.get(offset) ?? []) {
      const remainder = chooseFrom(candidate.span.end);
      const selection: EvidenceSelection = {
        items: [candidate, ...remainder.items],
        coveredCodeUnits:
          candidate.span.end - candidate.span.start + remainder.coveredCodeUnits,
        priority: (evidencePriority[candidate.finding.kind] ?? 99) + remainder.priority,
      };
      best = betterSelection(selection, best);
    }
    bestFrom.set(offset, best);
    return best;
  };

  return chooseFrom(0).items;
}

function sourceFor({ finding, span }: CandidateEvidence): CandidateSource | null {
  const codePointLength = [...span.token].length;
  switch (finding.kind) {
    case 'common-word':
    case 'common-name':
      return codePointLength <= 3
        ? { key: 'short-lexical', size: candidateSourceSizes.shortLexical }
        : { key: 'general-lexical', size: candidateSourceSizes.generalLexical };
    case 'common-password-core':
      if (matchExplicitPasswordAnchorVariant(span.token) !== null) {
        return {
          key: 'explicit-password-anchor',
          size: candidateSourceSizes.explicitPasswordAnchor,
        };
      }
      if (/^\p{L}+$/u.test(span.token)) {
        return codePointLength <= 3
          ? { key: 'short-lexical', size: candidateSourceSizes.shortLexical }
          : { key: 'general-lexical', size: candidateSourceSizes.generalLexical };
      }
      return { key: 'common-password', size: candidateSourceSizes.commonPassword };
    case 'account-or-service-term':
      return { key: 'account-context', size: candidateSourceSizes.accountContext };
    case 'keyboard-pattern':
      return { key: 'keyboard-pattern', size: candidateSourceSizes.keyboardPattern };
    case 'year':
      return { key: 'year', size: candidateSourceSizes.year };
    case 'date':
      return { key: 'date', size: candidateSourceSizes.date };
    case 'simple-character-sequence':
      return { key: 'sequence', size: candidateSourceSizes.sequence };
    case 'predictable-word-sequence':
      return {
        key: 'predictable-word-sequence',
        size: candidateSourceSizes.predictableWordSequence,
      };
    case 'repeated-component':
      return { key: 'repetition', size: candidateSourceSizes.repetition };
    case 'typical-suffix': {
      const size = typicalSuffixCandidateCount(span.token);
      return size === null ? null : { key: 'typical-suffix', size };
    }
    default:
      return null;
  }
}

function isPredictableConnectorRun(value: string): boolean {
  const characters = [...value];
  return (
    characters.length >= 1 &&
    characters.length <= 3 &&
    characters.every((character) => character === characters[0]) &&
    predictableConnectorTemplates.has(characters[0] ?? '')
  );
}

interface UncoveredRun {
  readonly start: number;
  readonly end: number;
  readonly value: string;
}

function uncoveredRuns(
  fictionalPassword: string,
  selectedEvidence: readonly CandidateEvidence[],
): readonly UncoveredRun[] {
  const covered = Array.from({ length: fictionalPassword.length }, () => false);
  for (const { span } of selectedEvidence) {
    for (let offset = span.start; offset < span.end; offset += 1) covered[offset] = true;
  }

  const runs: UncoveredRun[] = [];
  let offset = 0;
  while (offset < fictionalPassword.length) {
    if (covered[offset]) {
      offset += 1;
      continue;
    }
    const start = offset;
    while (offset < fictionalPassword.length && !covered[offset]) offset += 1;
    runs.push({ start, end: offset, value: fictionalPassword.slice(start, offset) });
  }
  return runs;
}

function residualAlphabetSize(characters: readonly string[]): number | null {
  let hasAsciiLowercase = false;
  let hasExtendedGermanLowercase = false;
  let hasAsciiUppercase = false;
  let hasExtendedGermanUppercase = false;
  let hasDigits = false;
  let hasAsciiPunctuationOrSpace = false;

  for (const character of characters) {
    if (/^[a-z]$/u.test(character)) hasAsciiLowercase = true;
    else if (/^[äöüß]$/u.test(character)) hasExtendedGermanLowercase = true;
    else if (/^[A-Z]$/u.test(character)) hasAsciiUppercase = true;
    else if (/^[ÄÖÜ]$/u.test(character)) hasExtendedGermanUppercase = true;
    else if (/^[0-9]$/u.test(character)) hasDigits = true;
    else if (/^[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]$/u.test(character)) {
      hasAsciiPunctuationOrSpace = true;
    } else {
      return null;
    }
  }

  let size = 0;
  if (hasExtendedGermanLowercase) size += 30;
  else if (hasAsciiLowercase) size += 26;
  if (hasExtendedGermanUppercase) size += 29;
  else if (hasAsciiUppercase) size += 26;
  if (hasDigits) size += 10;
  if (hasAsciiPunctuationOrSpace) size += 33;
  return size;
}

function factorial(value: number): bigint {
  let result = 1n;
  for (let factor = 2; factor <= value; factor += 1) result *= BigInt(factor);
  return result;
}

function sourceCategoryArrangementCount(
  selectedEvidence: readonly CandidateEvidence[],
): bigint | null {
  const coreEvidence = selectedEvidence.filter(({ finding }) => finding.kind !== 'typical-suffix');
  if (coreEvidence.length === 0) return null;
  const counts = new Map<string, number>();
  for (const evidence of coreEvidence) {
    const source = sourceFor(evidence);
    if (source === null) return null;
    counts.set(source.key, (counts.get(source.key) ?? 0) + 1);
  }
  let permutations = factorial(coreEvidence.length);
  for (const count of counts.values()) permutations /= factorial(count);
  return permutations;
}

function saturatingMultiply(values: readonly bigint[]): bigint {
  let result = 1n;
  for (const value of values) {
    if (value < 1n) return 0n;
    if (result > MAX_SIMULATION_CANDIDATES / value) {
      return MAX_SIMULATION_CANDIDATES + 1n;
    }
    result *= value;
  }
  return result;
}

function powerWithinBoundary(base: bigint, exponent: number): bigint {
  let result = 1n;
  for (let index = 0; index < exponent; index += 1) {
    result = saturatingMultiply([result, base]);
    if (result > MAX_SIMULATION_CANDIDATES) return result;
  }
  return result;
}

function sourceProduct(selectedEvidence: readonly CandidateEvidence[]): bigint | null {
  const sizes: bigint[] = [];
  for (const evidence of selectedEvidence) {
    const source = sourceFor(evidence);
    if (source === null) return null;
    sizes.push(source.size);
  }
  return saturatingMultiply(sizes);
}

function connectorVariantCountForStructuredPath(
  fictionalPassword: string,
  selectedEvidence: readonly CandidateEvidence[],
): bigint | null {
  const runs = uncoveredRuns(fictionalPassword, selectedEvidence);
  if (runs.length === 0) return 1n;
  const spans = selectedEvidence.map(({ span }) => span);
  const distinctConnectors = new Set<string>();
  let trailingSuffixVariants = 1n;
  for (const run of runs) {
    const hasLeftCandidate = spans.some((span) => span.end === run.start);
    const hasRightCandidate = spans.some((span) => span.start === run.end);
    if (hasLeftCandidate && hasRightCandidate && isPredictableConnectorRun(run.value)) {
      distinctConnectors.add(run.value);
      continue;
    }
    if (hasLeftCandidate && run.end === fictionalPassword.length) {
      const suffixVariants = typicalSuffixCandidateCount(run.value);
      if (suffixVariants !== null) {
        trailingSuffixVariants = saturatingMultiply([trailingSuffixVariants, suffixVariants]);
        continue;
      }
    }
    return null;
  }
  return saturatingMultiply([
    powerWithinBoundary(candidateSourceSizes.connector, distinctConnectors.size),
    trailingSuffixVariants,
  ]);
}

function structuredCandidateCount(
  fictionalPassword: string,
  selectedEvidence: readonly CandidateEvidence[],
): bigint | null {
  const sources = sourceProduct(selectedEvidence);
  const arrangements = sourceCategoryArrangementCount(selectedEvidence);
  const connectors = connectorVariantCountForStructuredPath(fictionalPassword, selectedEvidence);
  if (sources === null || arrangements === null || connectors === null) return null;
  return saturatingMultiply([sources, arrangements, connectors]);
}

function supportingFindingIds(
  findings: readonly PasswordSingleFinding[],
  selectedEvidence: readonly CandidateEvidence[],
): readonly string[] {
  const ids = new Set(selectedEvidence.map(({ finding }) => finding.id));
  const selectedSpans = selectedEvidence.map(({ span }) => span);
  for (const finding of findings) {
    if (finding.kind !== 'typical-transformation') continue;
    if (
      findingSpans(finding).some((span) =>
        selectedSpans.some(
          (selected) => selected.start <= span.start && selected.end >= span.end,
        ),
      )
    ) {
      ids.add(finding.id);
    }
  }
  return [...ids];
}

function curatedPhraseRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): {
  readonly ruleId: 'whole-password-recognized-generated-candidate';
  readonly findingIds: readonly string[];
} | null {
  if (!isCuratedPredictablePhrase(fictionalPassword)) return null;
  return {
    ruleId: 'whole-password-recognized-generated-candidate',
    findingIds: supportingFindingIds(
      findings,
      selectCanonicalEvidence(fictionalPassword, findings),
    ),
  };
}

function structuredCandidateRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): {
  readonly ruleId: 'whole-password-recognized-generated-candidate';
  readonly findingIds: readonly string[];
} | null {
  if (fictionalPassword.length === 0) return null;
  const selectedEvidence = selectCanonicalEvidence(fictionalPassword, findings);
  const coreCount = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  ).length;
  if (coreCount === 0) return null;
  const candidateCount = structuredCandidateCount(fictionalPassword, selectedEvidence);
  if (candidateCount === null || candidateCount > MAX_SIMULATION_CANDIDATES) return null;
  return {
    ruleId: 'whole-password-recognized-generated-candidate',
    findingIds: supportingFindingIds(findings, selectedEvidence),
  };
}

function singleAnchorResidualRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): {
  readonly ruleId: 'whole-password-recognized-single-anchor-residual';
  readonly findingIds: readonly string[];
} | null {
  if (fictionalPassword.length === 0) return null;
  const selectedEvidence = selectCanonicalEvidence(fictionalPassword, findings);
  const coreEvidence = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  );
  if (coreEvidence.length !== 1) return null;

  const runs = uncoveredRuns(fictionalPassword, selectedEvidence);
  const residualCharacters = runs.flatMap(({ value }) => [...value]);
  if (residualCharacters.length === 0) return null;
  const alphabetSize = residualAlphabetSize(residualCharacters);
  if (alphabetSize === null || alphabetSize === 0) return null;

  const sources = sourceProduct(selectedEvidence);
  if (sources === null) return null;
  const residualStrings = powerWithinBoundary(
    BigInt(alphabetSize),
    residualCharacters.length,
  );
  const placements = BigInt(residualCharacters.length + 1);
  const candidateCount = saturatingMultiply([sources, residualStrings, placements]);
  if (candidateCount > MAX_SIMULATION_CANDIDATES) return null;

  return {
    ruleId: 'whole-password-recognized-single-anchor-residual',
    findingIds: supportingFindingIds(findings, selectedEvidence),
  };
}

export function determinePasswordSimulationDisposition({
  fictionalPassword,
  componentAnalysis,
  semanticEvidence: _semanticEvidence,
}: PasswordSimulationDispositionInput): PasswordSimulationDisposition {
  const base = {
    lengthOrientation: lengthOrientationFor(fictionalPassword),
    analysisVersion: PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
  } as const;
  const recognition =
    directWholePasswordRecognition(fictionalPassword, componentAnalysis.findings) ??
    curatedPhraseRecognition(fictionalPassword, componentAnalysis.findings) ??
    structuredCandidateRecognition(fictionalPassword, componentAnalysis.findings) ??
    singleAnchorResidualRecognition(fictionalPassword, componentAnalysis.findings);

  if (recognition !== null) {
    switch (recognition.ruleId) {
      case 'whole-password-recognized-value':
        return {
          ...base,
          kind: 'whole-password-recognized',
          ruleId: recognition.ruleId,
          findingIds: recognition.findingIds,
          explanationId: 's05.disposition.whole-password-recognized-value',
        };
      case 'whole-password-recognized-generated-candidate':
        return {
          ...base,
          kind: 'whole-password-recognized',
          ruleId: recognition.ruleId,
          findingIds: recognition.findingIds,
          explanationId: 's05.disposition.whole-password-recognized-generated-candidate',
        };
      case 'whole-password-recognized-single-anchor-residual':
        return {
          ...base,
          kind: 'whole-password-recognized',
          ruleId: recognition.ruleId,
          findingIds: recognition.findingIds,
          explanationId: 's05.disposition.whole-password-recognized-single-anchor-residual',
        };
    }
  }

  const exhaustiveSearch = createFictionalPasswordExhaustiveSearchModel(fictionalPassword);
  if (
    exhaustiveSearch !== null &&
    exhaustiveSearch.totalCandidateCount <= MAX_SIMULATION_CANDIDATES
  ) {
    return {
      ...base,
      kind: 'whole-password-recognized',
      ruleId: 'whole-password-recognized-exhaustive-search',
      findingIds: [],
      explanationId: 's05.disposition.whole-password-recognized-exhaustive-search',
    };
  }

  return {
    ...base,
    kind: 'no-whole-password-recognized',
    explanationId: 's05.disposition.no-whole-password-recognized',
  };
}
