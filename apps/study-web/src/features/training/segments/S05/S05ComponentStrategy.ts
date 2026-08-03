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
  | 'account-context'
  | 'typical-changes';

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
  readonly description?: string;
  readonly blockIds: readonly string[];
  readonly binding: 'blocks' | 'password';
}

export interface S05CanonicalPasswordView {
  readonly password: string;
  readonly blocks: readonly S05CanonicalBlock[];
  readonly automaticFindings: Readonly<
    Record<Exclude<S05ComponentCategoryId, 'personal-details'>, readonly S05CategoryFinding[]>
  >;
  readonly completeCommonPassword: boolean;
}

const commonComponentKinds = new Set<PasswordSingleFindingKind>([
  'common-password-core',
  'common-word',
  'common-name',
  'keyboard-pattern',
  'year',
  'date',
  'simple-character-sequence',
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

function suffixRunBoundaries(span: PasswordEvidenceSpan): readonly number[] {
  const boundaries = [span.start, span.end];
  let previousKind: 'letter' | 'number' | 'symbol' | null = null;
  let offset = 0;
  for (const character of span.token) {
    const kind = /\p{L}/u.test(character)
      ? 'letter'
      : /\p{N}/u.test(character)
        ? 'number'
        : 'symbol';
    if (previousKind !== null && kind !== previousKind) boundaries.push(span.start + offset);
    previousKind = kind;
    offset += character.length;
  }
  return boundaries;
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
    case 'keyboard-pattern':
      return labels.keyboardSequence;
    case 'year':
      return labels.year;
    case 'date':
      return labels.date;
    case 'simple-character-sequence':
      return /^\p{N}+$/u.test(token) ? labels.numberSequence : labels.characterSequence;
    default:
      return labels.commonComponent;
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

function transformationLabels(
  span: PasswordEvidenceSpan,
): readonly { readonly label: string; readonly description: string }[] {
  const content = s05Content.componentStrategy.presentation.findingChips;
  const labels = [...span.token]
    .map((character) => {
      const source = replacementSources.get(character);
      return source === undefined
        ? null
        : {
            label: content.replacement.replace('[Quelle]', source).replace('[Ziel]', character),
            description: content.replacementDescription
              .replace('[Quelle]', source)
              .replace('[Ziel]', character),
          };
    })
    .filter((label): label is { readonly label: string; readonly description: string } => label !== null);
  if (labels.length === 0 && /\p{Lu}/u.test(span.token)) {
    labels.push({
      label: content.changedCapitalization,
      description: content.changedCapitalizationDescription,
    });
  }
  if (labels.length === 0) {
    return [{ label: content.genericChange, description: content.genericChangeDescription }];
  }
  return [
    ...new Map(labels.map((item) => [item.label, item] as const)).values(),
  ];
}

function suffixLabels(span: PasswordEvidenceSpan): readonly {
  readonly label: string;
  readonly description: string;
  readonly span: PasswordEvidenceSpan;
}[] {
  const content = s05Content.componentStrategy.presentation.findingChips;
  const matches = [...span.token.matchAll(/\p{N}+|[^\p{L}\p{N}]+/gu)];
  return matches.map((match) => {
    const token = match[0];
    const start = span.start + (match.index ?? 0);
    const evidence = { type: 'span', start, end: start + token.length, token } as const;
    if (/^(?:19|20)\d{2}$/u.test(token)) {
      return {
        label: content.appendedYear.replace('[Wert]', token),
        description: content.appendedYearDescription.replace('[Wert]', token),
        span: evidence,
      };
    }
    if (/^\p{N}+$/u.test(token)) {
      return {
        label: content.appendedNumberSequence.replace('[Wert]', token),
        description: content.appendedNumberSequenceDescription.replace('[Wert]', token),
        span: evidence,
      };
    }
    return {
      label: content.appendedSymbol.replace('[Wert]', token),
      description: content.appendedSymbolDescription.replace('[Wert]', token),
      span: evidence,
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
    if (finding.kind === 'typical-suffix') {
      for (const boundary of suffixRunBoundaries(span)) boundaries.add(boundary);
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

  const commonFindings = uniqueFindings(
    findingsWithSpans.flatMap(({ finding, span }) =>
      commonComponentKinds.has(finding.kind) &&
      !typicalSuffixSpans.some(
        (suffixSpan) => span.start >= suffixSpan.start && span.end <= suffixSpan.end,
      )
        ? [
            {
              id: `common:${finding.id}`,
              categoryId: 'common-components' as const,
              label: commonLabel(finding.kind, span.token),
              blockIds: blocksForSpan(blocks, span),
              binding: 'blocks' as const,
            },
          ]
        : [],
    ),
  );
  const accountFindings = uniqueFindings(
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
              binding: 'blocks' as const,
            },
          ]
        : [],
    ),
  );
  const typicalChanges = uniqueFindings(
    findingsWithSpans.flatMap<S05CategoryFinding>(({ finding, span }) => {
      if (finding.kind === 'typical-transformation') {
        return transformationLabels(span).map(({ label, description }, index) => ({
          id: `change:${finding.id}:${index}`,
          categoryId: 'typical-changes' as const,
          label,
          description,
          blockIds: blocksForSpan(blocks, span),
          binding: 'blocks' as const,
        }));
      }
      if (finding.kind !== 'typical-suffix') return [];
      return suffixLabels(span).map(({ label, description, span: suffixSpan }, index) => ({
        id: `change:${finding.id}:${index}`,
        categoryId: 'typical-changes' as const,
        label,
        description,
        blockIds: blocksForSpan(blocks, suffixSpan),
        binding: 'password' as const,
      }));
    }),
  );
  const hasUndisclosedChange = analysis.findings.some(
    ({ kind }) => kind === 'typical-transformation' || kind === 'typical-suffix',
  );
  const completeCommonPassword =
    !hasUndisclosedChange &&
    findingsWithSpans.some(
      ({ finding, span }) =>
        finding.kind === 'common-password-core' && span.start === 0 && span.end === password.length,
    );

  return {
    password,
    blocks,
    automaticFindings: {
      'common-components': commonFindings,
      'account-context': accountFindings,
      'typical-changes': typicalChanges,
    },
    completeCommonPassword,
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
  if (grouped && validBlockIds.length > 1) {
    return [
      {
        id: `personal:group:${validBlockIds.join(':')}`,
        categoryId: 'personal-details',
        label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
        blockIds: validBlockIds,
        binding: 'blocks',
      },
    ];
  }
  return validBlockIds.map((blockId, index) => ({
    id: `personal:${blockId}:${index}`,
    categoryId: 'personal-details',
    label: s05Content.componentStrategy.presentation.findingChips.personalComponent,
    blockIds: [blockId],
    binding: 'blocks',
  }));
}

export function bindTypicalChangeFindings(
  view: S05CanonicalPasswordView,
  personalFindings: readonly S05CategoryFinding[],
): readonly S05CategoryFinding[] {
  const possibleBases: S05CategoryFinding[] = [
    ...view.automaticFindings['common-components'],
    ...personalFindings,
    ...view.automaticFindings['account-context'],
  ];
  const boundChanges: S05CategoryFinding[] = [];
  for (const change of view.automaticFindings['typical-changes']) {
    const changedBlocks = view.blocks.filter(({ id }) => change.blockIds.includes(id));
    const changeStart = changedBlocks[0]?.start;
    const bases = [...possibleBases, ...boundChanges];
    const overlappingBase = bases.find((base) =>
      base.blockIds.some((blockId) => change.blockIds.includes(blockId)),
    );
    const precedingBase =
      changeStart === undefined
        ? undefined
        : bases.find((base) =>
            base.blockIds.some(
              (blockId) => view.blocks.find(({ id }) => id === blockId)?.end === changeStart,
            ),
          );
    const base = overlappingBase ?? precedingBase;
    boundChanges.push(
      base === undefined || base.binding === 'password'
        ? { ...change, binding: 'password' }
        : {
            ...change,
            binding: 'blocks',
            blockIds: [...new Set([...base.blockIds, ...change.blockIds])],
          },
    );
  }
  return boundChanges;
}

export function maskedCanonicalBlocks(
  blocks: readonly S05CanonicalBlock[],
): readonly S05CanonicalBlock[] {
  return blocks.map((block) => ({ ...block, value: '•'.repeat(block.value.length) }));
}
