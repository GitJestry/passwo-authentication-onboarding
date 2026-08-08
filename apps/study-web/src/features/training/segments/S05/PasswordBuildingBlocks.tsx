import { type CSSProperties, type ReactNode, useRef, useState } from 'react';
import type { S05PersonalCandidate, S05VisualCategoryId } from './S05ComponentStrategy.js';
import styles from './PasswordBuildingBlocks.module.css';

export interface PasswordBuildingBlocksProps {
  readonly value: string;
  readonly parts: readonly string[];
  readonly display: 'assembled' | 'separated' | 'decomposed';
  readonly labels?: readonly (string | readonly string[])[];
  readonly matchCategories?: readonly (string | readonly string[])[];
  readonly categoryIds?: readonly (readonly S05VisualCategoryId[])[];
  readonly continuous?: boolean;
  readonly segmentGroups?: readonly (readonly string[])[];
  readonly ariaLabel: string;
  readonly animate?: boolean;
  readonly appearance?: 'authored' | 'candidate' | 'analysis';
  readonly highlightedIndex?: number;
  readonly highlightedIndices?: readonly number[];
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
    readonly sentenceStructure: string;
    readonly probability: string;
    readonly personalDetail: string;
    readonly typicalEnding: string;
  };
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
  matchCategories,
  categoryIds,
  continuous = false,
  segmentGroups,
  ariaLabel,
  animate = true,
  appearance = 'authored',
  highlightedIndex,
  highlightedIndices = [],
  rangeSelection,
  annotations,
}: PasswordBuildingBlocksProps) {
  const characterOffsets = parts.reduce<readonly { readonly start: number; readonly end: number }[]>(
    (offsets, part) => {
      const start = offsets.at(-1)?.end ?? 0;
      return [...offsets, { start, end: start + part.length }];
    },
    [],
  );
  const characterButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [pointerSelection, setPointerSelection] = useState<{
    readonly pointerId: number;
    readonly anchorIndex: number;
    readonly currentIndex: number;
  } | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<number | null>(null);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);
  const [selectionStatus, setSelectionStatus] = useState('');

  function candidateAtIndex(index: number): S05PersonalCandidate | undefined {
    const offset = characterOffsets[index];
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
    const first = characterOffsets[Math.min(firstIndex, secondIndex)];
    const last = characterOffsets[Math.max(firstIndex, secondIndex)];
    return first === undefined || last === undefined ? null : { start: first.start, end: last.end };
  }

  function characterIndexAtPointer(clientX: number, clientY: number): number | null {
    const element = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>('[data-character-index]');
    const index = Number(element?.dataset.characterIndex);
    return Number.isInteger(index) && characterOffsets[index] !== undefined ? index : null;
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
    const boundedIndex = Math.min(Math.max(index, 0), Math.max(parts.length - 1, 0));
    setActiveCharacterIndex(boundedIndex);
    characterButtons.current[boundedIndex]?.focus();
  }

  if (display === 'assembled') {
    return (
      <div className={styles.blocks} data-display="assembled" aria-label={ariaLabel}>
        <code>{value}</code>
      </div>
    );
  }

  if (display === 'decomposed') {
    if (continuous) {
      const activeRangeSelection = rangeSelection;
      const previewRange =
        pointerSelection === null
          ? null
          : rangeForIndexes(pointerSelection.anchorIndex, pointerSelection.currentIndex);
      function renderRangeCharacter(index: number): ReactNode {
        const part = parts[index];
        const offset = characterOffsets[index];
        if (
          part === undefined ||
          offset === undefined ||
          activeRangeSelection === undefined
        ) {
          return null;
        }
        const candidate = candidateAtIndex(index);
        const previewed =
          previewRange !== null &&
          previewRange.start <= offset.start &&
          previewRange.end >= offset.end;
        return (
          <button
            className={styles.rangeCharacter}
            data-character-index={index}
            data-highlighted={candidate === undefined ? undefined : true}
            data-preview={previewed && candidate === undefined ? true : undefined}
            type="button"
            tabIndex={activeCharacterIndex === index ? 0 : -1}
            aria-label={`Zeichen ${index + 1} von ${parts.length}`}
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
                activeRangeSelection.onRemove(candidate.id);
                setKeyboardAnchor(null);
                setSelectionStatus(activeRangeSelection.status.removed);
                return;
              }
              event.currentTarget.parentElement?.setPointerCapture(event.pointerId);
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
                focusCharacter(parts.length - 1);
                return;
              }
              if (event.key === 'Escape' && keyboardAnchor !== null) {
                event.preventDefault();
                setKeyboardAnchor(null);
                setSelectionStatus(activeRangeSelection.status.cancelled);
                return;
              }
              if (event.key !== ' ' && event.key !== 'Enter') return;
              event.preventDefault();
              if (candidate !== undefined) {
                activeRangeSelection.onRemove(candidate.id);
                setKeyboardAnchor(null);
                setSelectionStatus(activeRangeSelection.status.removed);
                return;
              }
              if (keyboardAnchor === null) {
                setKeyboardAnchor(index);
                setSelectionStatus(activeRangeSelection.status.started);
                return;
              }
              const range = rangeForIndexes(keyboardAnchor, index);
              const added = range !== null && activeRangeSelection.onCreate(range.start, range.end);
              setKeyboardAnchor(null);
              setSelectionStatus(
                added ? activeRangeSelection.status.added : activeRangeSelection.status.invalid,
              );
            }}
          >
            {part}
          </button>
        );
      }
      const continuousParts: readonly ReactNode[] =
        activeRangeSelection === undefined
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
                    {part}
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
          : (() => {
              const rendered: ReactNode[] = [];
              for (let index = 0; index < parts.length; ) {
                const candidate = candidateAtIndex(index);
                const offset = characterOffsets[index];
                if (candidate !== undefined && offset?.start === candidate.start) {
                  const candidateCharacters: ReactNode[] = [];
                  let candidateIndex = index;
                  while (candidateAtIndex(candidateIndex)?.id === candidate.id) {
                    candidateCharacters.push(renderRangeCharacter(candidateIndex));
                    candidateIndex += 1;
                  }
                  rendered.push(
                    <span className={styles.rangeCandidate} key={candidate.id}>
                      {candidateCharacters}
                    </span>,
                  );
                  index = candidateIndex;
                  continue;
                }
                rendered.push(renderRangeCharacter(index));
                index += 1;
              }
              return rendered;
            })();
      return (
        <div
          className={styles.blocks}
          data-display="continuous"
          data-appearance={appearance}
          aria-label={ariaLabel}
        >
          <code
            className={styles.continuousPassword}
            onPointerMove={(event) => {
              if (pointerSelection === null || event.pointerId !== pointerSelection.pointerId) return;
              const index = characterIndexAtPointer(event.clientX, event.clientY);
              if (index !== null && index !== pointerSelection.currentIndex) {
                setPointerSelection({ ...pointerSelection, currentIndex: index });
              }
            }}
            onPointerUp={(event) => {
              if (pointerSelection === null || event.pointerId !== pointerSelection.pointerId) return;
              const index = characterIndexAtPointer(event.clientX, event.clientY);
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              finishPointerSelection(index ?? pointerSelection.currentIndex);
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
      >
        <code className={styles.decomposedPassword} style={gridStyle}>
          {annotations === undefined ? null : (
            <strong className={styles.sentenceStructure}>{annotations.sentenceStructure}</strong>
          )}
          {parts.map((part, index) => {
            const partLabels = normalizeLabels(labels?.[index]);
            const joiningSegments = segmentGroups?.[index] ?? [part];
            const content = (
              <>
                <b
                  className={styles.blockValue}
                  data-joining={joiningSegments.length > 1 || undefined}
                  data-block-value
                  data-obscured={'•'.repeat([...part].length)}
                >
                  {joiningSegments.length === 1
                    ? part
                    : joiningSegments.map((segment, segmentIndex) => (
                        <span
                          className={styles.joiningSegment}
                          key={`${segment}-${segmentIndex}`}
                        >
                          {segment}
                        </span>
                      ))}
                </b>
                {partLabels.length === 0 ? null : (
                  <small className={styles.blockLabel}>
                    {partLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </small>
                )}
                {annotations === undefined || index !== 3 ? null : (
                  <small className={styles.probability}>{annotations.probability}</small>
                )}
                {annotations === undefined || index !== 4 ? null : (
                  <small className={styles.personalDetail}>{annotations.personalDetail}</small>
                )}
                {annotations === undefined || index !== 5 ? null : (
                  <small className={styles.typicalEnding}>{annotations.typicalEnding}</small>
                )}
              </>
            );
            const sharedProps = {
              'data-part-index': index,
              'data-highlighted': highlightedIndices.includes(index) || undefined,
            } as const;
            return (
              <span key={`${part}-${index}`} {...sharedProps}>
                {content}
              </span>
            );
          })}
        </code>
      </div>
    );
  }

  return (
    <div
      className={styles.blocks}
      data-display="separated"
      data-appearance={appearance}
      aria-label={ariaLabel}
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
