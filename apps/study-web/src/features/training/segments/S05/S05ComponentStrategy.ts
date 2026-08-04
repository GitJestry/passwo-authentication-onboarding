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
  readonly categoryId: S05ComponentCategoryId;
  readonly label: string;
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
  ['4', 'a'],
  ['3', 'e'],
  ['1', 'i'],
  ['0', 'o'],
  ['5', 's'],
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

function transformationDetails(span: PasswordEvidenceSpan): readonly string[] {
  const details = [...span.token]
    .map((character) => {
      const source = replacementSources.get(character);
      return source === undefined ? null : `${source} → ${character}`;
    })
    .filter((detail): detail is string => detail !== null);
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
  const boundaries = new Set<number>([0, password.length]);
  for (const { finding, span } of findingsWithSpans) {
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
  const typicalSuffixSpans = findingsWithSpans
    .filter(({ finding }) => finding.kind === 'typical-suffix')
    .map(({ span }) => span);
  const typicalTransformationSpans = findingsWithSpans
    .filter(({ finding }) => finding.kind === 'typical-transformation')
    .map(({ span }) => span);

  const typicalChanges = findingsWithSpans.flatMap<S05TypicalChange>(
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
    findingsWithSpans.flatMap(({ finding, span }) => {
      if (
        !commonComponentKinds.has(finding.kind) ||
        typicalSuffixSpans.some(
          (suffixSpan) => span.start >= suffixSpan.start && span.end <= suffixSpan.end,
        )
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
          categoryId: 'common-components' as const,
          label: commonLabel(finding.kind, part.token),
          blockIds: blocksForSpan(blocks, part),
          changeIds: [],
          ...(sequenceLabel === undefined ? {} : { changeLabel: sequenceLabel }),
        };
      });
    }),
  );
  const rawAccountFindings = uniqueFindings(
    findingsWithSpans.flatMap(({ finding, span }) =>
      finding.kind === 'account-or-service-term' &&
      (finding.confidence === 'authored-exact-match' ||
        typicalTransformationSpans.some(
          (transformationSpan) =>
            transformationSpan.start === span.start && transformationSpan.end === span.end,
        ))
        ? [
            {
              id: `account:${finding.id}`,
              categoryId: 'account-context' as const,
              label: span.token,
              blockIds: blocksForSpan(blocks, span),
              changeIds: [],
            },
          ]
        : [],
    ),
  );
  const partialView = { blocks, typicalChanges };
  return {
    password,
    blocks,
    typicalChanges,
    automaticFindings: {
      'common-components': attachTypicalChanges(partialView, rawCommonFindings),
      'account-context': attachTypicalChanges(partialView, rawAccountFindings),
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
            categoryId: 'personal-details' as const,
            label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
            blockIds: validBlockIds,
            changeIds: [],
          },
        ]
      : validBlockIds.map((blockId, index) => ({
          id: `personal:${blockId}:${index}`,
          categoryId: 'personal-details' as const,
          label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
          blockIds: [blockId],
          changeIds: [],
        }));
  return attachTypicalChanges(view, findings);
}

export function projectCanonicalPasswordBlocks(
  view: S05CanonicalPasswordView,
  findings: readonly S05CategoryFinding[],
  includeResidualChanges: boolean,
): readonly S05DisplayBlock[] {
  const indexById = new Map(view.blocks.map(({ id }, index) => [id, index] as const));
  const representedChangeIds = new Set(findings.flatMap(({ changeIds }) => changeIds));
  const ranges: Array<{ start: number; end: number; residualLabel?: string }> = [];
  for (const finding of findings) {
    const indices = finding.blockIds.flatMap((id) => {
      const index = indexById.get(id);
      return index === undefined ? [] : [index];
    });
    if (indices.length > 0) ranges.push({ start: Math.min(...indices), end: Math.max(...indices) });
  }
  if (includeResidualChanges) {
    for (const change of view.typicalChanges) {
      if (representedChangeIds.has(change.id)) continue;
      const indices = change.blockIds.flatMap((id) => {
        const index = indexById.get(id);
        return index === undefined ? [] : [index];
      });
      if (indices.length > 0) {
        ranges.push({
          start: Math.min(...indices),
          end: Math.max(...indices),
          residualLabel: change.residualLabel,
        });
      }
    }
  }

  const mergedRanges = ranges
    .sort((left, right) => left.start - right.start || left.end - right.end)
    .reduce<Array<{ start: number; end: number; residualLabels: string[] }>>((merged, range) => {
      const previous = merged.at(-1);
      if (previous !== undefined && range.start <= previous.end) {
        previous.end = Math.max(previous.end, range.end);
        if (range.residualLabel !== undefined) previous.residualLabels.push(range.residualLabel);
        return merged;
      }
      merged.push({
        start: range.start,
        end: range.end,
        residualLabels: range.residualLabel === undefined ? [] : [range.residualLabel],
      });
      return merged;
    }, []);

  const displayBlocks: S05DisplayBlock[] = [];
  for (let index = 0; index < view.blocks.length; ) {
    const range = mergedRanges.find(({ start }) => start === index);
    const endIndex = range?.end ?? index;
    const groupedBlocks = view.blocks.slice(index, endIndex + 1);
    const first = groupedBlocks[0];
    const last = groupedBlocks.at(-1);
    if (first === undefined || last === undefined) break;
    const groupedIds = new Set(groupedBlocks.map(({ id }) => id));
    const labels = [
      ...new Set([
        ...findings.flatMap((finding) =>
          finding.blockIds.some((id) => groupedIds.has(id))
            ? [finding.label, ...(finding.changeLabel === undefined ? [] : [finding.changeLabel])]
            : [],
        ),
        ...(range?.residualLabels ?? []),
      ]),
    ];
    displayBlocks.push({
      id: `display-${first.start}-${last.end}`,
      start: first.start,
      end: last.end,
      value: view.password.slice(first.start, last.end),
      labels,
    });
    index = endIndex + 1;
  }
  return displayBlocks;
}
