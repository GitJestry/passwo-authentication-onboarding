import { type CSSProperties, type ReactNode, useRef, useState } from 'react';
import type {
  S05DisplayFinding,
  S05PersonalCandidate,
  S05VisualCategoryId,
} from './S05ComponentStrategy.js';
import { PasswordCategoryIconStack } from './PasswordCategoryIcon.js';
import styles from './PasswordBuildingBlocks.module.css';

const PASSWORD_VISUAL_REFERENCE_LENGTH = 32;

interface PasswordVisualStyle extends CSSProperties {
  readonly '--s05-password-visual-scale': string;
  readonly '--s05-password-visual-character-count': string;
}

interface PasswordSingleLineVisualStyle extends PasswordVisualStyle {
  readonly '--password-row-unit-count': string;
}

export function passwordVisualStyleFor(
  value: string,
  fixedScale?: number,
): PasswordVisualStyle {
  const characterCount = Math.max([...value].length, 1);
  const scale =
    fixedScale ??
    (characterCount <= PASSWORD_VISUAL_REFERENCE_LENGTH
      ? 1
      : PASSWORD_VISUAL_REFERENCE_LENGTH / characterCount);

  return {
    '--s05-password-visual-scale': String(scale),
    '--s05-password-visual-character-count': String(fixedScale === undefined ? characterCount : 1),
  };
}

export function passwordSingleLineVisualStyleFor(
  value: string,
  blockCount: number,
): PasswordSingleLineVisualStyle {
  const characterCount = Math.max([...value].length, 1);
  const boundedBlockCount = Math.max(blockCount, 1);
  const visualUnitCount =
    characterCount * 0.64 +
    boundedBlockCount * 1.4 +
    Math.max(boundedBlockCount - 1, 0) * 1.15;
  return {
    ...passwordVisualStyleFor(value),
    '--password-row-unit-count': String(visualUnitCount),
  };
}

export interface PasswordBuildingBlocksProps {
  readonly value: string;
  readonly parts: readonly string[];
  readonly display: 'assembled' | 'separated' | 'decomposed';
  readonly labels?: readonly (string | readonly string[])[];
  readonly labelsOutside?: boolean;
  readonly findings?: readonly (readonly S05DisplayFinding[])[];
  readonly findingDisplay?: 'labels' | 'icons';
  readonly matchCategories?: readonly (string | readonly string[])[];
  readonly categoryIds?: readonly (readonly S05VisualCategoryId[])[];
  readonly continuous?: boolean;
  readonly segmentGroups?: readonly (readonly string[])[];
  /** Full value that determines the visual size when this view shows only a subset. */
  readonly visualReferenceValue?: string;
  /** Fixed scale for compact lists that must not respond to password length. */
  readonly visualScale?: number;
  readonly ariaLabel: string;
  readonly animate?: boolean;
  readonly appearance?: 'authored' | 'candidate' | 'analysis';
  readonly highlightedIndex?: number;
  readonly highlightedIndices?: readonly number[];
  readonly personalHighlightRanges?: readonly {
    readonly start: number;
    readonly end: number;
  }[];
  readonly rangeSelection?: {
    readonly candidates: readonly S05PersonalCandidate[];
    readonly onCreate: (start: number, end: number) => boolean;
    readonly onRemove: (candidateId: string) => void;
    readonly status: {
      readonly started: string;
      readonly added: string;
      readonly removed: string;
      readonly invalid: string;
      readonly cancelled: string;
    };
  };
  readonly annotations?: {
    readonly relationship: string;
    readonly repetitionCount: number;
  };
}

export function PasswordBlockText({
  value,
  start = 0,
  personalHighlightRanges = [],
}: {
  readonly value: string;
  readonly start?: number;
  readonly personalHighlightRanges?: readonly {
    readonly start: number;
    readonly end: number;
  }[];
}) {
  const valueEnd = start + value.length;
  if (
    !personalHighlightRanges.some(
      (range) => range.start < valueEnd && range.end > start,
    )
  ) {
    return value;
  }
  let offset = start;
  const characters = [...value].map((character) => {
    const characterStart = offset;
    const characterEnd = characterStart + character.length;
    offset = characterEnd;
    const highlightedRange = personalHighlightRanges.find(
      (range) => range.start < characterEnd && range.end > characterStart,
    );
    return highlightedRange !== undefined ? (
      <mark
        className={styles.personalCharacter}
        data-range-start={highlightedRange.start === characterStart || undefined}
        data-range-end={highlightedRange.end === characterEnd || undefined}
        key={characterStart}
      >
        {character}
      </mark>
    ) : character;
  });
  return <span className={styles.passwordBlockText}>{characters}</span>;
}

function normalizeLabels(label: string | readonly string[] | undefined): readonly string[] {
  if (label === undefined || label === '') return [];
  return typeof label === 'string' ? [label] : label;
}

/**
 * Shared S05 representation for authored examples and the local canonical password view.
 * Optional selections only report local intervals; persistence and interpretation stay outside UI.
 */
export function PasswordBuildingBlocks({
  value,
  parts,
  display,
  labels,
  labelsOutside = false,
  findings,
  findingDisplay = 'labels',
  matchCategories,
  categoryIds,
  continuous = false,
  segmentGroups,
  visualReferenceValue,
  visualScale,
  ariaLabel,
  animate = true,
  appearance = 'authored',
  highlightedIndex,
  highlightedIndices = [],
  personalHighlightRanges = [],
  rangeSelection,
  annotations,
}: PasswordBuildingBlocksProps) {
  const partOffsets = parts.reduce<readonly { readonly start: number; readonly end: number }[]>(
    (offsets, part) => {
      const start = offsets.at(-1)?.end ?? 0;
      return [...offsets, { start, end: start + part.length }];
    },
    [],
  );
  let characterOffset = 0;
  const selectionCharacters = [...value].map((character) => {
    const start = characterOffset;
    characterOffset += character.length;
    return { character, start, end: characterOffset };
  });
  const characterButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [pointerSelection, setPointerSelection] = useState<{
    readonly pointerId: number;
    readonly anchorIndex: number;
    readonly currentIndex: number;
  } | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<number | null>(null);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);
  const [selectionStatus, setSelectionStatus] = useState('');
  const visualStyle = passwordVisualStyleFor(visualReferenceValue ?? value, visualScale);

  function candidateAtIndex(index: number): S05PersonalCandidate | undefined {
    const offset = selectionCharacters[index];
    return offset === undefined
      ? undefined
      : rangeSelection?.candidates.find(
          (candidate) => candidate.start <= offset.start && candidate.end >= offset.end,
        );
  }

  function rangeForIndexes(firstIndex: number, secondIndex: number): {
    readonly start: number;
    readonly end: number;
  } | null {
    const first = selectionCharacters[Math.min(firstIndex, secondIndex)];
    const last = selectionCharacters[Math.max(firstIndex, secondIndex)];
    return first === undefined || last === undefined ? null : { start: first.start, end: last.end };
  }

  function characterIndexAtPointer(clientX: number, clientY: number): number | null {
    const element = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>('[data-character-index]');
    const index = Number(element?.dataset.characterIndex);
    return Number.isInteger(index) && selectionCharacters[index] !== undefined ? index : null;
  }

  function finishPointerSelection(finalIndex: number): void {
    if (pointerSelection === null || rangeSelection === undefined) return;
    const range = rangeForIndexes(pointerSelection.anchorIndex, finalIndex);
    const added = range !== null && rangeSelection.onCreate(range.start, range.end);
    setPointerSelection(null);
    setKeyboardAnchor(null);
    setSelectionStatus(added ? rangeSelection.status.added : rangeSelection.status.invalid);
  }

  function focusCharacter(index: number): void {
    const boundedIndex = Math.min(
      Math.max(index, 0),
      Math.max(selectionCharacters.length - 1, 0),
    );
    setActiveCharacterIndex(boundedIndex);
    characterButtons.current[boundedIndex]?.focus();
  }

  const previewRange =
    pointerSelection === null
      ? null
      : rangeForIndexes(pointerSelection.anchorIndex, pointerSelection.currentIndex);

  function renderRangeCharacter(index: number): ReactNode {
    const selectionCharacter = selectionCharacters[index];
    if (selectionCharacter === undefined || rangeSelection === undefined) return null;
    const candidate = candidateAtIndex(index);
    const previewed =
      previewRange !== null &&
      previewRange.start <= selectionCharacter.start &&
      previewRange.end >= selectionCharacter.end;
    return (
      <button
        className={styles.rangeCharacter}
        data-character-index={index}
        data-highlighted={candidate === undefined ? undefined : true}
        data-preview={previewed && candidate === undefined ? true : undefined}
        data-range-start={candidate?.start === selectionCharacter.start || undefined}
        data-range-end={candidate?.end === selectionCharacter.end || undefined}
        type="button"
        tabIndex={activeCharacterIndex === index ? 0 : -1}
        aria-label={`Zeichen ${index + 1} von ${selectionCharacters.length}`}
        aria-pressed={candidate !== undefined}
        key={`character-${index}`}
        ref={(element) => {
          characterButtons.current[index] = element;
        }}
        onFocus={() => setActiveCharacterIndex(index)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          if (candidate !== undefined) {
            rangeSelection.onRemove(candidate.id);
            setKeyboardAnchor(null);
            setSelectionStatus(rangeSelection.status.removed);
            return;
          }
          event.currentTarget
            .closest<HTMLElement>('[data-range-selection-surface]')
            ?.setPointerCapture(event.pointerId);
          setPointerSelection({
            pointerId: event.pointerId,
            anchorIndex: index,
            currentIndex: index,
          });
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusCharacter(index - 1);
            return;
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusCharacter(index + 1);
            return;
          }
          if (event.key === 'Home') {
            event.preventDefault();
            focusCharacter(0);
            return;
          }
          if (event.key === 'End') {
            event.preventDefault();
            focusCharacter(selectionCharacters.length - 1);
            return;
          }
          if (event.key === 'Escape' && keyboardAnchor !== null) {
            event.preventDefault();
            setKeyboardAnchor(null);
            setSelectionStatus(rangeSelection.status.cancelled);
            return;
          }
          if (event.key !== ' ' && event.key !== 'Enter') return;
          event.preventDefault();
          if (candidate !== undefined) {
            rangeSelection.onRemove(candidate.id);
            setKeyboardAnchor(null);
            setSelectionStatus(rangeSelection.status.removed);
            return;
          }
          if (keyboardAnchor === null) {
            setKeyboardAnchor(index);
            setSelectionStatus(rangeSelection.status.started);
            return;
          }
          const range = rangeForIndexes(keyboardAnchor, index);
          const added = range !== null && rangeSelection.onCreate(range.start, range.end);
          setKeyboardAnchor(null);
          setSelectionStatus(added ? rangeSelection.status.added : rangeSelection.status.invalid);
        }}
      >
        {selectionCharacter.character}
      </button>
    );
  }

  function handleSelectionPointerMove(clientX: number, clientY: number, pointerId: number): void {
    if (pointerSelection === null || pointerId !== pointerSelection.pointerId) return;
    const index = characterIndexAtPointer(clientX, clientY);
    if (index !== null && index !== pointerSelection.currentIndex) {
      setPointerSelection({ ...pointerSelection, currentIndex: index });
    }
  }

  function handleSelectionPointerEnd(
    surface: HTMLElement,
    clientX: number,
    clientY: number,
    pointerId: number,
  ): void {
    if (pointerSelection === null || pointerId !== pointerSelection.pointerId) return;
    const index = characterIndexAtPointer(clientX, clientY);
    if (surface.hasPointerCapture(pointerId)) surface.releasePointerCapture(pointerId);
    finishPointerSelection(index ?? pointerSelection.currentIndex);
  }

  if (display === 'assembled') {
    return (
      <div
        className={styles.blocks}
        data-display="assembled"
        aria-label={ariaLabel}
        style={visualStyle}
      >
        <code>{value}</code>
      </div>
    );
  }

  if (display === 'decomposed') {
    if (continuous) {
      const continuousParts: readonly ReactNode[] =
        rangeSelection === undefined
          ? parts.map((part, index) => {
              const categories = categoryIds?.[index] ?? [];
              const partMatchCategories = normalizeLabels(matchCategories?.[index]);
              return (
                <span
                  className={styles.continuousPart}
                  key={`${part}-${index}`}
                >
                  <span
                    className={styles.continuousBlock}
                    data-part-index={index}
                    data-categories={categories.join(' ')}
                  >
                    <PasswordBlockText
                      value={part}
                      start={partOffsets[index]?.start ?? 0}
                      personalHighlightRanges={personalHighlightRanges}
                    />
                  </span>
                  {partMatchCategories.length === 0 ? null : (
                    <small className={styles.continuousCategory}>
                      {partMatchCategories.map((category) => (
                        <span key={category}>{category}</span>
                      ))}
                    </small>
                  )}
                </span>
              );
            })
          : selectionCharacters.map((_, index) => renderRangeCharacter(index));
      return (
        <div
          className={styles.blocks}
          data-display="continuous"
          data-appearance={appearance}
          data-animate={animate || undefined}
          aria-label={ariaLabel}
          style={visualStyle}
        >
          <code
            className={styles.continuousPassword}
            data-range-selection-surface
            data-range-selectable={rangeSelection === undefined ? undefined : true}
            data-selecting={pointerSelection === null ? undefined : true}
            onPointerMove={(event) => {
              handleSelectionPointerMove(event.clientX, event.clientY, event.pointerId);
            }}
            onPointerUp={(event) => {
              handleSelectionPointerEnd(
                event.currentTarget,
                event.clientX,
                event.clientY,
                event.pointerId,
              );
            }}
            onPointerCancel={(event) => {
              if (pointerSelection === null || event.pointerId !== pointerSelection.pointerId) return;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setPointerSelection(null);
              setSelectionStatus(rangeSelection?.status.cancelled ?? '');
            }}
          >
            {continuousParts}
          </code>
          {rangeSelection === undefined ? null : (
            <span className={styles.selectionStatus} aria-live="polite">
              {selectionStatus}
            </span>
          )}
        </div>
      );
    }
    const gridStyle = {
      gridTemplateColumns: `repeat(${parts.length}, minmax(0, auto))`,
    } satisfies CSSProperties;

    return (
      <div
        className={styles.blocks}
        data-display="decomposed"
        data-appearance={appearance}
        data-animate={animate || undefined}
        data-annotated={annotations === undefined ? undefined : true}
        aria-label={ariaLabel}
        style={visualStyle}
      >
        <code
          className={styles.decomposedPassword}
          style={gridStyle}
          data-range-selectable={rangeSelection === undefined ? undefined : true}
          data-range-selection-surface={rangeSelection === undefined ? undefined : true}
          data-selecting={pointerSelection === null ? undefined : true}
          onPointerMove={(event) => {
            handleSelectionPointerMove(event.clientX, event.clientY, event.pointerId);
          }}
          onPointerUp={(event) => {
            handleSelectionPointerEnd(
              event.currentTarget,
              event.clientX,
              event.clientY,
              event.pointerId,
            );
          }}
          onPointerCancel={(event) => {
            if (pointerSelection === null || event.pointerId !== pointerSelection.pointerId) return;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            setPointerSelection(null);
            setSelectionStatus(rangeSelection?.status.cancelled ?? '');
          }}
        >
          {parts.map((part, index) => {
            const partLabels = normalizeLabels(labels?.[index]);
            const partFindings = findings?.[index] ?? [];
            const categories = categoryIds?.[index] ?? [];
            const joiningSegments = segmentGroups?.[index] ?? [part];
            const content = (
              <>
                <b
                  className={styles.blockValue}
                  data-joining={joiningSegments.length > 1 || undefined}
                  data-block-value
                  data-obscured={'•'.repeat([...part].length)}
                >
                  {rangeSelection !== undefined
                    ? selectionCharacters.flatMap((character, characterIndex) => {
                        const partOffset = partOffsets[index];
                        return partOffset !== undefined &&
                          character.start >= partOffset.start &&
                          character.end <= partOffset.end
                          ? [renderRangeCharacter(characterIndex)]
                          : [];
                      })
                    : joiningSegments.length === 1
                      ? (
                        <PasswordBlockText
                          value={part}
                          start={partOffsets[index]?.start ?? 0}
                          personalHighlightRanges={personalHighlightRanges}
                        />
                      )
                      : joiningSegments.map((segment, segmentIndex) => (
                        <span
                          className={styles.joiningSegment}
                          key={`${segment}-${segmentIndex}`}
                        >
                          {segment}
                        </span>
                      ))}
                </b>
                {annotations === undefined || index > 2 ? null : (
                  <svg
                    className={styles.annotationArrow}
                    viewBox="0 0 16 12"
                    aria-hidden="true"
                  >
                    <path d="M1 6h13M9.5 1.5 14 6l-4.5 4.5" />
                  </svg>
                )}
                {annotations === undefined || index < 1 || index > 3 ? null : (
                  <>
                    <i className={styles.relationshipStem} aria-hidden="true" />
                    <i className={styles.relationshipRail} aria-hidden="true" />
                  </>
                )}
                {annotations === undefined || index !== 2 ? null : (
                  <strong className={styles.relationship}>{annotations.relationship}</strong>
                )}
                {partFindings.length === 0 ? null : (
                  <small className={styles.blockFindings}>
                    {findingDisplay === 'icons' ? (
                      <PasswordCategoryIconStack
                        findings={partFindings}
                        flow
                      />
                    ) : (
                      partFindings.map(({ categoryId, label }) => (
                        <span data-category={categoryId} key={`${categoryId}-${label}`}>
                          <i aria-hidden="true" />
                          <span>{label}</span>
                        </span>
                      ))
                    )}
                  </small>
                )}
                {partFindings.length > 0 || partLabels.length === 0 ? null : (
                  <small className={styles.blockLabel}>
                    {partLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </small>
                )}
                {annotations === undefined || index !== parts.length - 1 ? null : (
                  <small className={styles.repetitionCount}>
                    x{annotations.repetitionCount}
                  </small>
                )}
              </>
            );
            const sharedProps = {
              'data-part-index': index,
              'data-categories': categories.join(' '),
              'data-highlighted':
                categories.length > 0 || highlightedIndices.includes(index) || undefined,
              'data-annotation-repetition':
                annotations !== undefined && index === parts.length - 1 ? true : undefined,
            } as const;
            return (
              <span key={`${part}-${index}`} {...sharedProps}>
                {content}
              </span>
            );
          })}
        </code>
        {rangeSelection === undefined ? null : (
          <span className={styles.selectionStatus} aria-live="polite">
            {selectionStatus}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={styles.blocks}
      data-display="separated"
      data-appearance={appearance}
      data-labels-outside={labelsOutside || undefined}
      aria-label={ariaLabel}
      style={visualStyle}
    >
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          className={styles.block}
          data-highlighted={
            index === highlightedIndex || highlightedIndices.includes(index) || undefined
          }
        >
          <code>{part}</code>
          {normalizeLabels(labels?.[index]).length === 0 ? null : (
            <small>
              {normalizeLabels(labels?.[index]).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </small>
          )}
        </span>
      ))}
    </div>
  );
}
