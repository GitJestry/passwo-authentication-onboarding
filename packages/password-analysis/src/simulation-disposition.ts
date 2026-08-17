import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  PasswordLengthOrientation,
  PasswordSimulationDisposition,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
  TransientPasswordSemanticEvidence,
  TransientPasswordSemanticRelation,
} from '@passwo/contracts';
import {
  isCuratedPredictablePhrase,
  isExplicitPasswordAnchorToken,
  PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
} from './password-guessing-analysis.js';

export const SELF_CREATED_PASSWORD_LENGTH_ORIENTATION = 15;

/**
 * Authored ceiling for one finite residual family around already recognized candidates.
 * `26^5 * 6` fits, so five arbitrary ASCII-lowercase codepoints are covered around one anchor
 * independently of position; six do not fit. This is neither a crack-time estimate nor a
 * password-strength score.
 */
export const MAX_BOUNDED_RESIDUAL_CANDIDATES = 100_000_000n;

export interface PasswordSimulationDispositionInput {
  readonly fictionalPassword: string;
  readonly componentAnalysis: PasswordAnalysisResult;
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

const ordinaryLexicalKinds = new Set<PasswordSingleFindingKind>([
  'common-word',
  'common-name',
]);

const semanticLexicalConnectorTokens = new Set([
  'am',
  'an',
  'auf',
  'aus',
  'bei',
  'bis',
  'das',
  'dem',
  'den',
  'der',
  'des',
  'die',
  'ein',
  'im',
  'in',
  'mit',
  'und',
  'vom',
  'von',
  'vor',
  'zum',
  'zur',
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
    | 'whole-password-recognized-bounded-variant';
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
      transformation !== undefined
        ? 'whole-password-recognized-bounded-variant'
        : 'whole-password-recognized-value',
    findingIds:
      transformation === undefined
        ? [wholeCandidate.id]
        : [wholeCandidate.id, transformation.id],
  };
}

function candidateEvidence(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): readonly CandidateEvidence[] {
  return findings.flatMap((finding) =>
    composedCandidateKinds.has(finding.kind)
      ? findingSpans(finding)
          .filter((span) => isValidSpan(span, fictionalPassword))
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

function isOrdinaryLexicalEvidence({ finding, span }: CandidateEvidence): boolean {
  if (ordinaryLexicalKinds.has(finding.kind)) return true;
  if (finding.kind !== 'common-password-core' || !/^\p{L}+$/u.test(span.token)) return false;
  return !isExplicitPasswordAnchorToken(span.token);
}

function ordinaryDictionaryOnlyLexicalComposition(
  selectedEvidence: readonly CandidateEvidence[],
): boolean {
  const semanticEvidence = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  );
  return semanticEvidence.length >= 2 && semanticEvidence.every(isOrdinaryLexicalEvidence);
}

function hasStrongAutomaticAnchor(selectedEvidence: readonly CandidateEvidence[]): boolean {
  return selectedEvidence.some(({ finding, span }) => {
    switch (finding.kind) {
      case 'account-or-service-term':
      case 'keyboard-pattern':
      case 'simple-character-sequence':
      case 'predictable-word-sequence':
      case 'repeated-component':
      case 'year':
      case 'date':
        return true;
      case 'common-password-core':
        return !/^\p{L}+$/u.test(span.token) || isExplicitPasswordAnchorToken(span.token);
      default:
        return false;
    }
  });
}

function isPredictableConnectorRun(value: string): boolean {
  const characters = [...value];
  return (
    characters.length >= 1 &&
    characters.length <= 3 &&
    characters.every((character) => /^[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]$/u.test(character))
  );
}

function validatedSemanticRelations(
  fictionalPassword: string,
  semanticEvidence: TransientPasswordSemanticEvidence | undefined,
): readonly TransientPasswordSemanticRelation[] {
  if (semanticEvidence?.confirmed !== true) return [];
  return semanticEvidence.relations.flatMap((relation) => {
    const evidence = relation.evidence
      .filter((span) => isValidSpan(span, fictionalPassword))
      .filter(
        (span, index, spans) =>
          spans.findIndex(
            (candidate) => candidate.start === span.start && candidate.end === span.end,
          ) === index,
      )
      .sort((left, right) => left.start - right.start || left.end - right.end);
    const minimumSpanCount = relation.kind === 'personal-context' ? 1 : 2;
    return evidence.length >= minimumSpanCount ? [{ ...relation, evidence }] : [];
  });
}

function spansCoverRange(
  spans: readonly PasswordEvidenceSpan[],
  start: number,
  end: number,
): boolean {
  return spans.some((span) => span.start <= start && span.end >= end);
}

function isSemanticLexicalConnector({ finding, span }: CandidateEvidence): boolean {
  return (
    isOrdinaryLexicalEvidence({ finding, span }) &&
    semanticLexicalConnectorTokens.has(span.token.toLocaleLowerCase('de-DE'))
  );
}

function semanticRelationsExplainLexicalEvidence(
  selectedEvidence: readonly CandidateEvidence[],
  relations: readonly TransientPasswordSemanticRelation[],
): boolean {
  const relationSpans = relations.flatMap(({ evidence }) => evidence);
  const ordinaryEvidence = selectedEvidence.filter(isOrdinaryLexicalEvidence);
  if (ordinaryEvidence.length === 0) return true;
  return ordinaryEvidence.every(
    (item) =>
      spansCoverRange(relationSpans, item.span.start, item.span.end) ||
      isSemanticLexicalConnector(item),
  );
}

function semanticCoverageSpans(
  selectedEvidence: readonly CandidateEvidence[],
  relations: readonly TransientPasswordSemanticRelation[],
): readonly PasswordEvidenceSpan[] {
  return [
    ...selectedEvidence.map(({ span }) => span),
    ...relations.flatMap(({ evidence }) => evidence),
  ].sort((left, right) => left.start - right.start || left.end - right.end);
}

function spansCoverPasswordWithPredictableConnectors(
  fictionalPassword: string,
  spans: readonly PasswordEvidenceSpan[],
): boolean {
  if (fictionalPassword.length === 0 || spans.length === 0) return false;
  let cursor = 0;
  for (const span of spans) {
    if (span.end <= cursor) continue;
    if (span.start > cursor) {
      const gap = fictionalPassword.slice(cursor, span.start);
      if (!isPredictableConnectorRun(gap)) return false;
    }
    cursor = Math.max(cursor, span.end);
  }
  if (cursor < fictionalPassword.length) {
    return isPredictableConnectorRun(fictionalPassword.slice(cursor));
  }
  return cursor >= fictionalPassword.length;
}

function uncoveredCharacters(
  fictionalPassword: string,
  selectedEvidence: readonly CandidateEvidence[],
): readonly string[] {
  const covered = Array.from({ length: fictionalPassword.length }, () => false);
  for (const { span } of selectedEvidence) {
    for (let offset = span.start; offset < span.end; offset += 1) covered[offset] = true;
  }

  const semanticSpans = selectedEvidence
    .filter(({ finding }) => finding.kind !== 'typical-suffix')
    .map(({ span }) => span)
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const residual: string[] = [];
  let offset = 0;
  while (offset < fictionalPassword.length) {
    if (covered[offset]) {
      offset += 1;
      continue;
    }
    const runStart = offset;
    while (offset < fictionalPassword.length && !covered[offset]) offset += 1;
    const runEnd = offset;
    const value = fictionalPassword.slice(runStart, runEnd);
    const hasLeftAnchor = semanticSpans.some((span) => span.end === runStart);
    const hasRightAnchor = semanticSpans.some((span) => span.start === runEnd);
    if (hasLeftAnchor && hasRightAnchor && isPredictableConnectorRun(value)) continue;
    residual.push(...value);
  }
  return residual;
}

/**
 * Returns the frozen alphabet used for this authored residual family. The observed class union is
 * only a deterministic family selector; no class is presented as a password composition rule.
 */
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

function binomial(n: number, k: number): bigint {
  const smaller = Math.min(k, n - k);
  let result = 1n;
  for (let index = 1; index <= smaller; index += 1) {
    result = (result * BigInt(n - smaller + index)) / BigInt(index);
  }
  return result;
}

function anchorPermutationCount(selectedEvidence: readonly CandidateEvidence[]): bigint {
  const semanticEvidence = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  );
  const duplicateCounts = new Map<string, number>();
  for (const { finding, span } of semanticEvidence) {
    const key = `${finding.kind}:${span.token.toLocaleLowerCase('de-DE')}`;
    duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
  }
  let permutations = factorial(semanticEvidence.length);
  for (const count of duplicateCounts.values()) permutations /= factorial(count);
  return permutations;
}

function boundedResidualCandidateCount(
  fictionalPassword: string,
  selectedEvidence: readonly CandidateEvidence[],
): bigint | null {
  const semanticAnchorCount = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  ).length;
  if (semanticAnchorCount === 0) return null;

  const residual = uncoveredCharacters(fictionalPassword, selectedEvidence);
  if (residual.length === 0) return anchorPermutationCount(selectedEvidence);
  const alphabetSize = residualAlphabetSize(residual);
  if (alphabetSize === null || alphabetSize === 0) return null;

  const freeStrings = BigInt(alphabetSize) ** BigInt(residual.length);
  // Stars-and-bars distributes the ordered residual codepoints across every gap before, between,
  // and after the selected anchors, making the decision independent of their observed position.
  const placements = binomial(residual.length + semanticAnchorCount, semanticAnchorCount);
  return freeStrings * placements * anchorPermutationCount(selectedEvidence);
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

function boundedVariantRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
): {
  readonly ruleId:
    | 'whole-password-recognized-value'
    | 'whole-password-recognized-bounded-variant';
  readonly findingIds: readonly string[];
} | null {
  if (fictionalPassword.length === 0) return null;
  const selectedEvidence = selectCanonicalEvidence(fictionalPassword, findings);
  const semanticEvidence = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  );
  if (semanticEvidence.length === 0) return null;

  const curatedPhrase = isCuratedPredictablePhrase(fictionalPassword);
  const automaticAnchor = hasStrongAutomaticAnchor(selectedEvidence);
  const semanticItems = selectedEvidence.filter(
    ({ finding }) => finding.kind !== 'typical-suffix',
  );

  // Ordinary dictionary words explain visible components, but their number is not a password-
  // strength formula. A multi-word composition therefore needs a concrete automatic anchor,
  // a curated full phrase, or participant-confirmed semantic evidence handled separately below.
  if (ordinaryDictionaryOnlyLexicalComposition(selectedEvidence) && !curatedPhrase) return null;
  if (!automaticAnchor && !curatedPhrase) {
    const onlySemanticItem = semanticItems[0];
    const oneOrdinaryValueWithNoFreeResidual =
      semanticItems.length === 1 &&
      onlySemanticItem !== undefined &&
      isOrdinaryLexicalEvidence(onlySemanticItem) &&
      uncoveredCharacters(fictionalPassword, selectedEvidence).length === 0;
    if (!oneOrdinaryValueWithNoFreeResidual) return null;
  }

  const candidateCount = boundedResidualCandidateCount(fictionalPassword, selectedEvidence);
  if (candidateCount === null || candidateCount > MAX_BOUNDED_RESIDUAL_CANDIDATES) return null;

  return {
    ruleId: 'whole-password-recognized-bounded-variant',
    findingIds: supportingFindingIds(findings, selectedEvidence),
  };
}

function semanticPathRecognition(
  fictionalPassword: string,
  findings: readonly PasswordSingleFinding[],
  semanticEvidence: TransientPasswordSemanticEvidence | undefined,
): {
  readonly ruleId: 'whole-password-recognized-semantic-path';
  readonly findingIds: readonly string[];
  readonly semanticRelationIds: readonly string[];
} | null {
  if (fictionalPassword.length === 0) return null;
  const relations = validatedSemanticRelations(fictionalPassword, semanticEvidence);
  if (relations.length === 0) return null;

  const selectedEvidence = selectCanonicalEvidence(fictionalPassword, findings);
  const allOrdinaryEvidenceExplained = semanticRelationsExplainLexicalEvidence(
    selectedEvidence,
    relations,
  );
  if (!allOrdinaryEvidenceExplained) return null;

  const coverage = semanticCoverageSpans(selectedEvidence, relations);
  if (!spansCoverPasswordWithPredictableConnectors(fictionalPassword, coverage)) return null;

  return {
    ruleId: 'whole-password-recognized-semantic-path',
    findingIds: supportingFindingIds(findings, selectedEvidence),
    semanticRelationIds: relations.map(({ id }) => id),
  };
}

export function determinePasswordSimulationDisposition({
  fictionalPassword,
  componentAnalysis,
  semanticEvidence,
}: PasswordSimulationDispositionInput): PasswordSimulationDisposition {
  const base = {
    lengthOrientation: lengthOrientationFor(fictionalPassword),
    analysisVersion: PASSWORD_ANALYSIS_CONFIGURATION_VERSION,
  } as const;
  const recognition =
    directWholePasswordRecognition(fictionalPassword, componentAnalysis.findings) ??
    semanticPathRecognition(fictionalPassword, componentAnalysis.findings, semanticEvidence) ??
    boundedVariantRecognition(fictionalPassword, componentAnalysis.findings);

  if (recognition !== null) {
    if (recognition.ruleId === 'whole-password-recognized-semantic-path') {
      return {
        ...base,
        kind: 'whole-password-recognized',
        ruleId: recognition.ruleId,
        findingIds: recognition.findingIds,
        semanticRelationIds: recognition.semanticRelationIds,
        explanationId: 's05.disposition.whole-password-recognized-semantic-path',
      };
    }
    return {
      ...base,
      kind: 'whole-password-recognized',
      ruleId: recognition.ruleId,
      findingIds: recognition.findingIds,
      explanationId: `s05.disposition.${recognition.ruleId}`,
    };
  }

  return {
    ...base,
    kind: 'no-whole-password-recognized',
    explanationId: 's05.disposition.no-whole-password-recognized',
  };
}
