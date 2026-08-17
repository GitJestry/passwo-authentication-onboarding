import type {
  PasswordAnalysisResult,
  PasswordEvidenceSpan,
  PasswordSingleFinding,
  PasswordSingleFindingKind,
} from '@passwo/contracts';
import { s05Content } from '@passwo/training-content';

export type S05ComponentCategoryId =
  | 'common-components'
  | 'personal-details'
  | 'account-context';

export type S05VisualCategoryId = S05ComponentCategoryId | 'repetition';

export type S05CategoryCardStatus =
  | 'pending'
  | 'current'
  | 'checked-none'
  | 'checked-findings';

export interface S05CanonicalBlock {
  readonly id: string;
  readonly start: number;
  readonly end: number;
  readonly value: string;
}

/** A participant-defined, transient interval in the fictional password. */
export interface S05PersonalCandidate {
  readonly id: string;
  readonly start: number;
  readonly end: number;
}

export function isS05CharacterBoundary(value: string, offset: number): boolean {
  let cursor = 0;
  if (offset === 0 || offset === value.length) return true;
  for (const character of value) {
    cursor += character.length;
    if (cursor === offset) return true;
    if (cursor > offset) return false;
  }
  return false;
}

export interface S05CategoryFinding {
  readonly id: string;
  readonly candidateId: string;
  readonly categoryId: S05ComponentCategoryId;
  readonly label: string;
  /** Concise category derived from the local zxcvbn match type for the block display. */
  readonly matchCategory?: string;
  readonly start: number;
  readonly end: number;
  readonly evidenceBlockIds: readonly string[];
  readonly blockIds: readonly string[];
  readonly changeIds: readonly string[];
  readonly changeLabel?: string;
}

interface S05TypicalChange {
  readonly id: string;
  readonly kind: 'transformation' | 'suffix';
  readonly start: number;
  readonly end: number;
  readonly blockIds: readonly string[];
  readonly detail: string;
  readonly residualLabel: string;
}

export interface S05CanonicalPasswordView {
  readonly password: string;
  readonly blocks: readonly S05CanonicalBlock[];
  readonly automaticFindings: Readonly<{
    readonly 'common-components': readonly S05CategoryFinding[];
    readonly 'account-context': readonly S05CategoryFinding[];
  }>;
  readonly typicalChanges: readonly S05TypicalChange[];
}

export interface S05DisplayBlock extends S05CanonicalBlock {
  readonly labels: readonly string[];
  readonly findings: readonly S05DisplayFinding[];
  readonly matchCategories: readonly string[];
  readonly categoryIds: readonly S05VisualCategoryId[];
  readonly groupIds: readonly string[];
}

export interface S05DisplayFinding {
  readonly label: string;
  readonly categoryId: S05VisualCategoryId;
}

export interface S05RepetitionAnnotation {
  readonly start: number;
  readonly end: number;
  readonly label: string;
}

export interface S05CategoryCandidateSummary {
  readonly candidateCount: number;
  readonly coversWholePassword: boolean;
  readonly hasSingleCandidateMatch: boolean;
}

const commonComponentKinds = new Set<PasswordSingleFindingKind>([
  'common-password-core',
  'common-word',
  'common-name',
  'keyboard-pattern',
  'year',
  'date',
  'simple-character-sequence',
  'predictable-word-sequence',
]);

const visualCategoryOrder = [
  'account-context',
  'personal-details',
  'common-components',
  'repetition',
] as const satisfies readonly S05VisualCategoryId[];

const componentCategoryPriority = {
  'common-components': 0,
  'personal-details': 1,
  'account-context': 2,
} as const satisfies Readonly<Record<S05ComponentCategoryId, number>>;

interface S05FindingCluster {
  readonly start: number;
  readonly end: number;
  readonly categoryId: S05ComponentCategoryId;
  readonly findings: readonly S05CategoryFinding[];
}

interface S05DisplayRange {
  readonly start: number;
  readonly end: number;
  readonly categoryId?: S05ComponentCategoryId;
  readonly findings: readonly S05CategoryFinding[];
}

function higherPriorityCategory(
  left: S05ComponentCategoryId,
  right: S05ComponentCategoryId,
): S05ComponentCategoryId {
  return componentCategoryPriority[right] > componentCategoryPriority[left] ? right : left;
}

function clusterOverlappingFindings(
  findings: readonly S05CategoryFinding[],
): readonly S05FindingCluster[] {
  return [...findings]
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .reduce<S05FindingCluster[]>((clusters, finding) => {
      const previous = clusters.at(-1);
      if (previous === undefined || finding.start >= previous.end) {
        clusters.push({
          start: finding.start,
          end: finding.end,
          categoryId: finding.categoryId,
          findings: [finding],
        });
        return clusters;
      }
      clusters[clusters.length - 1] = {
        start: previous.start,
        end: Math.max(previous.end, finding.end),
        categoryId: higherPriorityCategory(previous.categoryId, finding.categoryId),
        findings: [...previous.findings, finding],
      };
      return clusters;
    }, []);
}

function personalFindingExactlyMatchesRange(
  finding: S05CategoryFinding,
  range: Pick<S05DisplayRange, 'start' | 'end'>,
): boolean {
  return finding.start === range.start && finding.end === range.end;
}

function splitUnrecognizedRangeByPersonalFindings(
  range: S05DisplayRange,
  personalFindings: readonly S05CategoryFinding[],
): readonly S05DisplayRange[] {
  const overlappingFindings = personalFindings.filter(
    (finding) => finding.start < range.end && finding.end > range.start,
  );
  if (overlappingFindings.length === 0) return [range];

  const boundaries = new Set<number>([range.start, range.end]);
  for (const finding of overlappingFindings) {
    boundaries.add(Math.max(range.start, finding.start));
    boundaries.add(Math.min(range.end, finding.end));
  }
  const sortedBoundaries = [...boundaries].sort((left, right) => left - right);
  return sortedBoundaries.slice(0, -1).flatMap((start, index) => {
    const end = sortedBoundaries[index + 1];
    if (end === undefined || start === end) return [];
    const findings = overlappingFindings.filter(
      (finding) => finding.start < end && finding.end > start,
    );
    return [
      {
        start,
        end,
        ...(findings.length === 0 ? {} : { categoryId: 'personal-details' as const }),
        findings,
      },
    ];
  });
}

function createDisplayRanges(
  passwordLength: number,
  findings: readonly S05CategoryFinding[],
): readonly S05DisplayRange[] {
  const personalFindings = findings.filter(
    (finding) => finding.categoryId === 'personal-details',
  );
  const analyzedClusters = clusterOverlappingFindings(
    findings.filter((finding) => finding.categoryId !== 'personal-details'),
  );
  const analyzedRanges: S05DisplayRange[] = [];
  let cursor = 0;
  for (const cluster of analyzedClusters) {
    if (cursor < cluster.start) {
      analyzedRanges.push({ start: cursor, end: cluster.start, findings: [] });
    }
    analyzedRanges.push(cluster);
    cursor = cluster.end;
  }
  if (cursor < passwordLength) {
    analyzedRanges.push({ start: cursor, end: passwordLength, findings: [] });
  }

  return analyzedRanges.flatMap((range) => {
    if (range.findings.length === 0) {
      return splitUnrecognizedRangeByPersonalFindings(range, personalFindings);
    }
    const overlappingPersonalFindings = personalFindings.filter(
      (finding) => finding.start < range.end && finding.end > range.start,
    );
    const exactPersonalFinding = overlappingPersonalFindings.some((finding) =>
      personalFindingExactlyMatchesRange(finding, range),
    );
    const findingsForRange = [...range.findings, ...overlappingPersonalFindings];
    return exactPersonalFinding
      ? [{ ...range, categoryId: 'personal-details' as const, findings: findingsForRange }]
      : [{ ...range, findings: findingsForRange }];
  });
}

function containedFindingLabel(label: string): string {
  return s05Content.componentStrategy.presentation.findingChips.containedFinding.replace(
    '[Befund]',
    label,
  );
}

function uniqueDisplayFindings(
  findings: readonly S05DisplayFinding[],
): readonly S05DisplayFinding[] {
  return visualCategoryOrder.flatMap((categoryId) =>
    findings.filter(
      (finding, index, all) =>
        finding.categoryId === categoryId &&
        all.findIndex(
          (candidate) =>
            candidate.categoryId === finding.categoryId && candidate.label === finding.label,
        ) === index,
    ),
  );
}

const replacementSources: ReadonlyMap<string, string> = new Map([
  ['/\\\\/\\\\', 'm'],
  ['\\\\/\\\\/', 'w'],
  ['|-|', 'h'],
  ['|_|', 'u'],
  ['^^', 'm'],
  ['nn', 'm'],
  ['2n', 'm'],
  ['//', 'n'],
  ['()', 'o'],
  ['|<', 'k'],
  ['^/', 'w'],
  ['uu', 'w'],
  ['vv', 'w'],
  ['2u', 'w'],
  ['2v', 'w'],
  ['><', 'x'],
  ['|)', 'd'],
  ['4', 'a'],
  ['@', 'a'],
  ['8', 'b'],
  ['(', 'c'],
  ['{', 'c'],
  ['[', 'c'],
  ['<', 'c/k/v'],
  ['#', 'f/h'],
  ['&', 'g'],
  ['3', 'e'],
  ['1', 'i/l'],
  ['!', 'i/l'],
  ['|', 'i/l'],
  ['0', 'o'],
  ['$', 's'],
  ['5', 's'],
  ['+', 't'],
  ['7', 'l/t'],
  ['6', 'd/g'],
  ['9', 'g/q'],
  ['>', 'v'],
  ['/', 'v'],
  ['%', 'x'],
  ['2', 'z'],
] as const);

function evidenceSpans(finding: PasswordSingleFinding): readonly PasswordEvidenceSpan[] {
  return finding.evidence.filter(
    (evidence): evidence is PasswordEvidenceSpan => evidence.type === 'span',
  );
}

function wordSequenceParts(span: PasswordEvidenceSpan): readonly PasswordEvidenceSpan[] {
  const matches = [...span.token.matchAll(/\p{L}+\p{N}*(?:[^\p{L}\p{N}]+|$)/gu)];
  if (matches.length < 2 || matches.map(([token]) => token).join('') !== span.token) return [span];
  return matches.map((match) => {
    const start = span.start + (match.index ?? 0);
    return { type: 'span', start, end: start + match[0].length, token: match[0] } as const;
  });
}

function blocksForSpan(
  blocks: readonly S05CanonicalBlock[],
  span: PasswordEvidenceSpan,
): readonly string[] {
  return blocks
    .filter((block) => block.start < span.end && block.end > span.start)
    .map(({ id }) => id);
}

function commonLabel(kind: PasswordSingleFindingKind, token: string): string {
  const labels = s05Content.componentStrategy.presentation.findingChips;
  switch (kind) {
    case 'common-password-core':
      return labels.commonPassword;
    case 'common-word':
    case 'common-name':
      return labels.commonWord;
    case 'keyboard-pattern':
      return /^\p{N}+$/u.test(token) ? labels.numberSequence : labels.keyboardSequence;
    case 'year':
    case 'date':
      return labels.nearbyYear;
    case 'simple-character-sequence':
      return /^\p{N}+$/u.test(token) ? labels.numberSequence : labels.keyboardSequence;
    case 'predictable-word-sequence':
      return s05Content.findingLabels['predictable-word-sequence'];
    default:
      return labels.commonWord;
  }
}

function zxcvbnMatchCategory(kind: PasswordSingleFindingKind, token: string): string {
  const categories = s05Content.componentStrategy.presentation.findingCategories;
  switch (kind) {
    case 'common-password-core':
      return categories.password;
    case 'common-word':
    case 'common-name':
      return categories.word;
    case 'keyboard-pattern':
      return /^\p{N}+$/u.test(token) ? categories.numberSequence : categories.keyboard;
    case 'year':
    case 'date':
      return categories.date;
    case 'simple-character-sequence':
      return /^\p{N}+$/u.test(token) ? categories.numberSequence : categories.sequence;
    case 'predictable-word-sequence':
      return categories.sequence;
    default:
      return categories.sequence;
  }
}

function uniqueFindings(findings: readonly S05CategoryFinding[]): readonly S05CategoryFinding[] {
  const byLabelAndRange = new Map<string, S05CategoryFinding>();
  for (const finding of findings) {
    const key = `${finding.label}:${finding.start}:${finding.end}`;
    if (!byLabelAndRange.has(key)) byLabelAndRange.set(key, finding);
  }
  return [...byLabelAndRange.values()];
}

function removeCoveredFindings(
  findings: readonly S05CategoryFinding[],
): readonly S05CategoryFinding[] {
  return findings.filter(
    (finding, findingIndex) =>
      !findings.some((candidate, candidateIndex) => {
        if (candidateIndex === findingIndex) return false;
        const coversFinding = candidate.start <= finding.start && candidate.end >= finding.end;
        if (!coversFinding) return false;
        return (
          candidate.end - candidate.start > finding.end - finding.start ||
          (candidate.end - candidate.start === finding.end - finding.start &&
            candidateIndex < findingIndex)
        );
      }),
  );
}

interface BlockRange {
  readonly start: number;
  readonly end: number;
}

function findingRange(finding: S05CategoryFinding): BlockRange {
  return { start: finding.start, end: finding.end };
}

function partiallyOverlaps(left: BlockRange, right: BlockRange): boolean {
  if (left.start >= right.end || right.start >= left.end) return false;
  const leftContainsRight = left.start <= right.start && left.end >= right.end;
  const rightContainsLeft = right.start <= left.start && right.end >= left.end;
  return !leftContainsRight && !rightContainsLeft;
}

function excludeCrossBoundaryFindings(
  findings: readonly S05CategoryFinding[],
  boundaryFindings: readonly S05CategoryFinding[],
): readonly S05CategoryFinding[] {
  const boundaryRanges = boundaryFindings.map(findingRange);
  return findings.filter((finding) => {
    const range = findingRange(finding);
    return !boundaryRanges.some((boundary) => partiallyOverlaps(range, boundary));
  });
}

function excludesNestedCalendarFinding(
  entries: readonly {
    readonly finding: PasswordSingleFinding;
    readonly span: PasswordEvidenceSpan;
  }[],
  entry: { readonly finding: PasswordSingleFinding; readonly span: PasswordEvidenceSpan },
): boolean {
  if (entry.finding.kind !== 'year' && entry.finding.kind !== 'date') return false;
  return entries.some(
    ({ finding, span }) =>
      (finding.kind === 'year' || finding.kind === 'date') &&
      span.start <= entry.span.start &&
      span.end >= entry.span.end &&
      (span.start < entry.span.start || span.end > entry.span.end),
  );
}

function transformationDetails(span: PasswordEvidenceSpan): readonly string[] {
  const details: string[] = [];
  const replacements = [...replacementSources.entries()].sort(
    ([left], [right]) => right.length - left.length,
  );
  for (let index = 0; index < span.token.length; ) {
    const replacement = replacements.find(([value]) => span.token.startsWith(value, index));
    if (replacement === undefined) {
      const codePoint = span.token.codePointAt(index);
      index += codePoint !== undefined && codePoint > 0xffff ? 2 : 1;
      continue;
    }
    const [value, source] = replacement;
    details.push(`${source} → ${value}`);
    index += value.length;
  }
  if (details.length === 0 && /\p{Lu}/u.test(span.token)) details.push('Großschreibung');
  if (details.length === 0) details.push('Zeichen verändert');
  return [...new Set(details)];
}

function sequenceChangeLabel(span: PasswordEvidenceSpan): string | undefined {
  const letters = /^\p{L}+/u.exec(span.token)?.[0];
  if (letters === undefined) return undefined;
  const addition = span.token.slice(letters.length);
  return addition.length === 0
    ? undefined
    : s05Content.componentStrategy.presentation.findingChips.typicalVariant.replace(
        '[Details]',
        `+${addition}`,
      );
}

function attachTypicalChanges(
  view: Pick<S05CanonicalPasswordView, 'blocks' | 'typicalChanges'>,
  findings: readonly S05CategoryFinding[],
): readonly S05CategoryFinding[] {
  return findings.map((finding) => {
    const baseBlocks = view.blocks.filter(({ id }) => finding.blockIds.includes(id));
    const start = baseBlocks[0]?.start;
    const initialEnd = baseBlocks.at(-1)?.end;
    if (start === undefined || initialEnd === undefined) return finding;
    let end = initialEnd;

    const changes: S05TypicalChange[] = view.typicalChanges.filter(
      (change) => change.kind === 'transformation' && change.start < end && change.end > start,
    );
    let appended = true;
    while (appended) {
      appended = false;
      const suffix = view.typicalChanges.find(
        (change) =>
          change.kind === 'suffix' &&
          change.start === end &&
          !changes.some(({ id }) => id === change.id),
      );
      if (suffix !== undefined) {
        changes.push(suffix);
        end = suffix.end;
        appended = true;
      }
    }
    if (changes.length === 0) return finding;

    const details = [...new Set(changes.map(({ detail }) => detail))];
    return {
      ...finding,
      end,
      blockIds: view.blocks
        .filter((block) => block.start >= start && block.end <= end)
        .map(({ id }) => id),
      changeIds: changes.map(({ id }) => id),
      changeLabel:
        s05Content.componentStrategy.presentation.findingChips.typicalVariant.replace(
          '[Details]',
          details.join(', '),
        ),
    };
  });
}

export function createCanonicalPasswordView(
  password: string,
  analysis: PasswordAnalysisResult,
): S05CanonicalPasswordView {
  const findingsWithSpans = analysis.findings.flatMap((finding) =>
    commonComponentKinds.has(finding.kind) ||
    finding.kind === 'account-or-service-term' ||
    finding.kind === 'typical-transformation' ||
    finding.kind === 'typical-suffix'
      ? evidenceSpans(finding).map((span) => ({ finding, span }))
      : [],
  );
  const canonicalFindingsWithSpans = findingsWithSpans.filter(
    (entry) => !excludesNestedCalendarFinding(findingsWithSpans, entry),
  );
  const boundaries = new Set<number>([0, password.length]);
  for (const { finding, span } of canonicalFindingsWithSpans) {
    boundaries.add(span.start);
    boundaries.add(span.end);
    if (finding.kind === 'predictable-word-sequence') {
      for (const part of wordSequenceParts(span)) {
        boundaries.add(part.start);
        boundaries.add(part.end);
      }
    }
  }
  const sortedBoundaries = [...boundaries].sort((left, right) => left - right);
  const blocks = sortedBoundaries.slice(0, -1).flatMap((start, index) => {
    const end = sortedBoundaries[index + 1];
    if (end === undefined || start === end) return [];
    return [{ id: `block-${start}-${end}`, start, end, value: password.slice(start, end) }];
  });
  const typicalSuffixSpans = canonicalFindingsWithSpans
    .filter(({ finding }) => finding.kind === 'typical-suffix')
    .map(({ span }) => span);
  const typicalChanges = canonicalFindingsWithSpans.flatMap<S05TypicalChange>(
    ({ finding, span }) => {
      if (finding.kind === 'typical-transformation') {
        return transformationDetails(span).map((detail, index) => ({
          id: `change:${finding.id}:${index}`,
          kind: 'transformation' as const,
          start: span.start,
          end: span.end,
          blockIds: blocksForSpan(blocks, span),
          detail,
          residualLabel:
            s05Content.componentStrategy.presentation.findingChips.typicalVariant.replace(
              '[Details]',
              detail,
            ),
        }));
      }
      if (finding.kind !== 'typical-suffix') return [];
      return [
        {
          id: `change:${finding.id}:suffix`,
          kind: 'suffix' as const,
          start: span.start,
          end: span.end,
          blockIds: blocksForSpan(blocks, span),
          detail: `+${span.token}`,
          residualLabel:
            s05Content.componentStrategy.presentation.findingChips.typicalEnding.replace(
              '[Wert]',
              span.token,
            ),
        },
      ];
    },
  );

  const rawCommonFindings = uniqueFindings(
    canonicalFindingsWithSpans.flatMap(({ finding, span }) => {
      if (
        !commonComponentKinds.has(finding.kind) ||
        ((finding.kind !== 'year' && finding.kind !== 'date') &&
          typicalSuffixSpans.some(
            (suffixSpan) => span.start >= suffixSpan.start && span.end <= suffixSpan.end,
          ))
      ) {
        return [];
      }
      const parts =
        finding.kind === 'predictable-word-sequence' ? wordSequenceParts(span) : [span];
      return parts.map((part, index) => {
        const sequenceLabel =
          finding.kind === 'predictable-word-sequence' ? sequenceChangeLabel(part) : undefined;
        return {
          id: `common:${finding.id}:${index}`,
          candidateId: `common:${finding.id}:${index}`,
          categoryId: 'common-components' as const,
          label: commonLabel(finding.kind, part.token),
          matchCategory: zxcvbnMatchCategory(finding.kind, part.token),
          start: part.start,
          end: part.end,
          evidenceBlockIds: blocksForSpan(blocks, part),
          blockIds: blocksForSpan(blocks, part),
          changeIds: [],
          ...(sequenceLabel === undefined ? {} : { changeLabel: sequenceLabel }),
        };
      });
    }),
  );
  const rawAccountFindings = uniqueFindings(
    canonicalFindingsWithSpans.flatMap(({ finding, span }) =>
      finding.kind === 'account-or-service-term'
        ? [
            {
              id: `account:${finding.id}`,
              candidateId: `account:${finding.id}`,
              categoryId: 'account-context' as const,
              label: span.token,
              start: span.start,
              end: span.end,
              evidenceBlockIds: blocksForSpan(blocks, span),
              blockIds: blocksForSpan(blocks, span),
              changeIds: [],
            },
          ]
        : [],
    ),
  );
  const partialView = { blocks, typicalChanges };
  const commonFindings = removeCoveredFindings(
    attachTypicalChanges(partialView, rawCommonFindings),
  );
  const boundaryCompatibleAccountFindings = excludeCrossBoundaryFindings(
    rawAccountFindings,
    rawCommonFindings,
  );
  return {
    password,
    blocks,
    typicalChanges,
    automaticFindings: {
      'common-components': commonFindings,
      'account-context': removeCoveredFindings(
        attachTypicalChanges(partialView, boundaryCompatibleAccountFindings),
      ),
    },
  };
}

export function createPersonalFindings(
  view: S05CanonicalPasswordView,
  candidates: readonly S05PersonalCandidate[],
): readonly S05CategoryFinding[] {
  const validCandidates = candidates
    .filter(
      ({ start, end }) =>
        start >= 0 &&
        start < end &&
        end <= view.password.length &&
        isS05CharacterBoundary(view.password, start) &&
        isS05CharacterBoundary(view.password, end),
    )
    .sort((left, right) => left.start - right.start || left.end - right.end)
    .reduce<S05PersonalCandidate[]>((accepted, candidate) => {
      const previous = accepted.at(-1);
      return previous === undefined || previous.end <= candidate.start
        ? [...accepted, candidate]
        : accepted;
    }, []);
  return validCandidates.map((candidate) => {
    const blockIds = view.blocks
      .filter((block) => block.start < candidate.end && block.end > candidate.start)
      .map(({ id }) => id);
    return {
      id: candidate.id,
      candidateId: candidate.id,
      categoryId: 'personal-details' as const,
      label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
      start: candidate.start,
      end: candidate.end,
      evidenceBlockIds: blockIds,
      blockIds,
      changeIds: [],
    };
  });
}

export function summarizeCategoryCandidates(
  view: S05CanonicalPasswordView,
  findings: readonly S05CategoryFinding[],
): S05CategoryCandidateSummary {
  const candidateIds = [...new Set(findings.map(({ candidateId }) => candidateId))];
  function coversPassword(ranges: readonly BlockRange[]): boolean {
    let cursor = 0;
    for (const range of [...ranges].sort((left, right) => left.start - right.start)) {
      if (range.start > cursor) return false;
      cursor = Math.max(cursor, range.end);
    }
    return view.password.length > 0 && cursor >= view.password.length;
  }
  const coversWholePassword = coversPassword(findings.map(findingRange));
  const hasSingleCandidateMatch = candidateIds.some((candidateId) => {
    return coversPassword(
      findings.filter((finding) => finding.candidateId === candidateId).map(findingRange),
    );
  });
  return {
    candidateCount: candidateIds.length,
    coversWholePassword,
    hasSingleCandidateMatch,
  };
}

export function projectCanonicalPasswordBlocks(
  view: S05CanonicalPasswordView,
  findings: readonly S05CategoryFinding[],
  repetitionAnnotations: readonly S05RepetitionAnnotation[] = [],
  showContainedFindingLabels = true,
): readonly S05DisplayBlock[] {
  const representedChangeIds = new Set(findings.flatMap(({ changeIds }) => changeIds));
  const visibleChanges = view.typicalChanges.filter(
    (change) => representedChangeIds.has(change.id),
  );
  const displayRanges = createDisplayRanges(view.password.length, findings);

  return displayRanges.map((range): S05DisplayBlock => {
    const block = {
      id: `display-${range.start}-${range.end}`,
      start: range.start,
      end: range.end,
      value: view.password.slice(range.start, range.end),
    };
    const directFindings = range.findings;
    const changes = visibleChanges.filter(
      (change) => change.start < block.end && change.end > block.start,
    );
    const annotations = uniqueDisplayFindings([
      ...directFindings.flatMap((finding) => [
        {
          label: finding.label,
          categoryId: finding.categoryId,
        },
        ...(finding.changeLabel === undefined || finding.changeIds.length > 0
          ? []
          : [
              {
                label: finding.changeLabel,
                categoryId: 'common-components' as const,
              },
            ]),
      ]),
      ...changes.map((change) => ({
        label:
          findings.find(({ changeIds }) => changeIds.includes(change.id))?.changeLabel ??
          change.residualLabel,
        categoryId: 'common-components' as const,
      })),
    ]);
    const repetitions = repetitionAnnotations.filter(
      (annotation) => annotation.start < block.end && annotation.end > block.start,
    );
    const repetitionFindings = repetitions.map(({ label }) => ({
      categoryId: 'repetition' as const,
      label,
    }));
    return {
      ...block,
      labels: annotations.map(({ label }) => label),
      findings: uniqueDisplayFindings([
        ...directFindings.map((finding) => {
          const evidenceBlocks = view.blocks.filter(({ id }) =>
            finding.evidenceBlockIds.includes(id),
          );
          const evidenceStart = evidenceBlocks[0]?.start ?? finding.start;
          const evidenceEnd = evidenceBlocks.at(-1)?.end ?? finding.end;
          const baseLabel =
            finding.categoryId === 'common-components'
              ? finding.matchCategory ?? finding.label
              : finding.categoryId === 'personal-details'
                ? s05Content.componentStrategy.presentation.findingChips.personalComponent
                : s05Content.findingLabels['account-or-service-term'];
          const isContained = evidenceStart !== block.start || evidenceEnd !== block.end;
          const isPrimaryCategory = range.categoryId === finding.categoryId;
          return {
            categoryId: finding.categoryId,
            label:
              showContainedFindingLabels &&
              isContained &&
              !isPrimaryCategory &&
              finding.categoryId !== 'account-context'
                ? containedFindingLabel(baseLabel)
                : baseLabel,
          };
        }),
        ...repetitionFindings,
      ]),
      matchCategories: [
        ...new Set(
          directFindings.flatMap(({ matchCategory }) =>
            matchCategory === undefined ? [] : [matchCategory],
          ),
        ),
      ],
      categoryIds: [
        ...(range.categoryId === undefined ? [] : [range.categoryId]),
        ...(repetitions.length === 0 ? [] : (['repetition'] as const)),
      ],
      groupIds: [...new Set(directFindings.map(({ id }) => id))],
    };
  });
}
