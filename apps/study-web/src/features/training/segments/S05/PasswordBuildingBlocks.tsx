import type { CSSProperties } from 'react';
import styles from './PasswordBuildingBlocks.module.css';

export interface PasswordBuildingBlocksProps {
  readonly value: string;
  readonly parts: readonly string[];
  readonly display: 'assembled' | 'separated' | 'decomposed';
  readonly labels?: readonly (string | readonly string[])[];
  readonly segmentGroups?: readonly (readonly string[])[];
  readonly ariaLabel: string;
  readonly animate?: boolean;
  readonly appearance?: 'authored' | 'candidate' | 'analysis';
  readonly highlightedIndex?: number;
  readonly highlightedIndices?: readonly number[];
  readonly selection?: {
    readonly selectedIndices: readonly number[];
    readonly checkboxLabel: string;
    readonly onToggle: (index: number) => void;
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
 * Optional selection only reports a block index; persistence and interpretation stay outside UI.
 */
export function PasswordBuildingBlocks({
  value,
  parts,
  display,
  labels,
  segmentGroups,
  ariaLabel,
  animate = true,
  appearance = 'authored',
  highlightedIndex,
  highlightedIndices = [],
  selection,
  annotations,
}: PasswordBuildingBlocksProps) {
  if (display === 'assembled') {
    return (
      <div className={styles.blocks} data-display="assembled" aria-label={ariaLabel}>
        <code>{value}</code>
      </div>
    );
  }

  if (display === 'decomposed') {
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
            const selected = selection?.selectedIndices.includes(index) ?? false;
            const partLabels = normalizeLabels(labels?.[index]);
            const joiningSegments = segmentGroups?.[index] ?? [part];
            const content = (
              <>
                <b
                  className={styles.blockValue}
                  data-joining={joiningSegments.length > 1 || undefined}
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
                {selection === undefined ? null : (
                  <input
                    type="checkbox"
                    checked={selected}
                    aria-label={`${selection.checkboxLabel}: ${part}`}
                    onChange={() => selection.onToggle(index)}
                  />
                )}
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
              'data-highlighted': highlightedIndices.includes(index) || selected || undefined,
            } as const;
            return selection === undefined ? (
              <span key={`${part}-${index}`} {...sharedProps}>
                {content}
              </span>
            ) : (
              <label key={`${part}-${index}`} {...sharedProps}>
                {content}
              </label>
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
