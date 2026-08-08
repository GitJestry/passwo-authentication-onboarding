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

export interface S05CategoryFinding {
  readonly id: string;
  readonly candidateId: string;
  readonly categoryId: S05ComponentCategoryId;
  readonly label: string;
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
  readonly categoryIds: readonly S05VisualCategoryId[];
  readonly groupIds: readonly string[];
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

function uniqueFindings(findings: readonly S05CategoryFinding[]): readonly S05CategoryFinding[] {
  const byLabelAndBlocks = new Map<string, S05CategoryFinding>();
  for (const finding of findings) {
    const key = `${finding.label}:${finding.blockIds.join(',')}`;
    if (!byLabelAndBlocks.has(key)) byLabelAndBlocks.set(key, finding);
  }
  return [...byLabelAndBlocks.values()];
}

function removeCoveredFindings(
  findings: readonly S05CategoryFinding[],
): readonly S05CategoryFinding[] {
  return findings.filter(
    (finding, findingIndex) =>
      !findings.some((candidate, candidateIndex) => {
        if (candidateIndex === findingIndex) return false;
        const coversFinding = finding.blockIds.every((blockId) =>
          candidate.blockIds.includes(blockId),
        );
        if (!coversFinding) return false;
        return (
          candidate.blockIds.length > finding.blockIds.length ||
          (candidate.blockIds.length === finding.blockIds.length &&
            candidateIndex < findingIndex)
        );
      }),
  );
}

interface BlockRange {
  readonly start: number;
  readonly end: number;
}

function blockRange(
  blocks: readonly S05CanonicalBlock[],
  blockIds: readonly string[],
): BlockRange | null {
  const matchingBlocks = blocks.filter(({ id }) => blockIds.includes(id));
  const first = matchingBlocks[0];
  const last = matchingBlocks.at(-1);
  return first === undefined || last === undefined
    ? null
    : { start: first.start, end: last.end };
}

function partiallyOverlaps(left: BlockRange, right: BlockRange): boolean {
  if (left.start >= right.end || right.start >= left.end) return false;
  const leftContainsRight = left.start <= right.start && left.end >= right.end;
  const rightContainsLeft = right.start <= left.start && right.end >= left.end;
  return !leftContainsRight && !rightContainsLeft;
}

function excludeCrossBoundaryFindings(
  blocks: readonly S05CanonicalBlock[],
  findings: readonly S05CategoryFinding[],
  boundaryFindings: readonly S05CategoryFinding[],
): readonly S05CategoryFinding[] {
  const boundaryRanges = boundaryFindings.flatMap((finding) => {
    const range = blockRange(blocks, finding.evidenceBlockIds);
    return range === null ? [] : [range];
  });
  return findings.filter((finding) => {
    const range = blockRange(blocks, finding.evidenceBlockIds);
    return (
      range === null ||
      !boundaryRanges.some((boundary) => partiallyOverlaps(range, boundary))
    );
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
    blocks,
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
  selectedBlockIds: readonly string[],
  grouped = false,
): readonly S05CategoryFinding[] {
  const validBlockIds = selectedBlockIds.filter((blockId) =>
    view.blocks.some(({ id }) => id === blockId),
  );
  const findings =
    grouped && validBlockIds.length > 1
      ? [
          {
            id: `personal:group:${validBlockIds.join(':')}`,
            candidateId: `personal:group:${validBlockIds.join(':')}`,
            categoryId: 'personal-details' as const,
            label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
            evidenceBlockIds: validBlockIds,
            blockIds: validBlockIds,
            changeIds: [],
          },
        ]
      : validBlockIds.map((blockId, index) => ({
          id: `personal:${blockId}:${index}`,
          candidateId: `personal:${blockId}:${index}`,
          categoryId: 'personal-details' as const,
          label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
          evidenceBlockIds: [blockId],
          blockIds: [blockId],
          changeIds: [],
        }));
  return attachTypicalChanges(view, findings);
}

export function summarizeCategoryCandidates(
  view: S05CanonicalPasswordView,
  findings: readonly S05CategoryFinding[],
): S05CategoryCandidateSummary {
  const candidateIds = [...new Set(findings.map(({ candidateId }) => candidateId))];
  const coveredBlockIds = new Set(findings.flatMap(({ blockIds }) => blockIds));
  const coversWholePassword =
    view.blocks.length > 0 && view.blocks.every(({ id }) => coveredBlockIds.has(id));
  const hasSingleCandidateMatch = candidateIds.some((candidateId) => {
    const candidateBlockIds = new Set(
      findings
        .filter((finding) => finding.candidateId === candidateId)
        .flatMap(({ blockIds }) => blockIds),
    );
    return view.blocks.length > 0 && view.blocks.every(({ id }) => candidateBlockIds.has(id));
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
): readonly S05DisplayBlock[] {
  const representedChangeIds = new Set(findings.flatMap(({ changeIds }) => changeIds));
  const visibleChanges = view.typicalChanges.filter(
    (change) => representedChangeIds.has(change.id),
  );
  const directBlocks = view.blocks.map((block): S05DisplayBlock => {
    const directFindings = findings.filter((finding) =>
      finding.evidenceBlockIds.includes(block.id),
    );
    const coveringFindings = findings.filter((finding) => finding.blockIds.includes(block.id));
    const changes = visibleChanges.filter((change) => change.blockIds.includes(block.id));
    const annotations = [
      ...directFindings.flatMap((finding) => [
        {
          label: finding.label,
          categoryId: finding.categoryId as S05VisualCategoryId,
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
    ].filter(
      (annotation, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.label === annotation.label && candidate.categoryId === annotation.categoryId,
        ) === index,
    );
    return {
      ...block,
      labels: annotations.map(({ label }) => label),
      categoryIds: [
        ...new Set(coveringFindings.map(({ categoryId }) => categoryId as S05VisualCategoryId)),
      ],
      groupIds: [...new Set(coveringFindings.map(({ id }) => id))],
    };
  });

  return directBlocks.reduce<S05DisplayBlock[]>((merged, block) => {
    const previous = merged.at(-1);
    const sameCategories =
      previous !== undefined &&
      previous.categoryIds.length === block.categoryIds.length &&
      previous.categoryIds.every((categoryId, index) => categoryId === block.categoryIds[index]);
    const sameGroups =
      previous !== undefined &&
      previous.groupIds.length === block.groupIds.length &&
      previous.groupIds.every((groupId, index) => groupId === block.groupIds[index]);
    if (
      previous === undefined ||
      previous.end !== block.start ||
      !sameCategories ||
      !sameGroups
    ) {
      merged.push(block);
      return merged;
    }
    merged[merged.length - 1] = {
      id: `display-${previous.start}-${block.end}`,
      start: previous.start,
      end: block.end,
      value: view.password.slice(previous.start, block.end),
      labels: [...new Set([...previous.labels, ...block.labels])],
      categoryIds: previous.categoryIds,
      groupIds: previous.groupIds,
    };
    return merged;
  }, []);
}
