import type { CSSProperties } from 'react';
import styles from './PasswordBuildingBlocks.module.css';

export interface PasswordBuildingBlocksProps {
  readonly value: string;
  readonly parts: readonly string[];
  readonly display: 'assembled' | 'separated' | 'decomposed';
  readonly labels?: readonly string[];
  readonly ariaLabel: string;
  readonly animate?: boolean;
  readonly appearance?: 'authored' | 'candidate';
  readonly highlightedIndex?: number;
  readonly annotations?: {
    readonly sentenceStructure: string;
    readonly probability: string;
    readonly personalDetail: string;
    readonly typicalEnding: string;
  };
}

/**
 * A shared S05 representation for a password as one phrase or as its memorable building blocks.
 * It stays presentation-only: the supplied parts are authored examples, never an analysis result.
 */
export function PasswordBuildingBlocks({
  value,
  parts,
  display,
  labels,
  ariaLabel,
  animate = true,
  appearance = 'authored',
  highlightedIndex,
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
        data-animate={animate || undefined}
        data-annotated={annotations === undefined ? undefined : true}
        aria-label={ariaLabel}
      >
        <code className={styles.decomposedPassword} style={gridStyle}>
          {annotations === undefined ? null : (
            <strong className={styles.sentenceStructure}>{annotations.sentenceStructure}</strong>
          )}
          {parts.map((part, index) => (
            <span key={`${part}-${index}`} data-part-index={index}>
              {part}
              {annotations === undefined || index !== 3 ? null : (
                <small className={styles.probability}>{annotations.probability}</small>
              )}
              {annotations === undefined || index !== 4 ? null : (
                <small className={styles.personalDetail}>{annotations.personalDetail}</small>
              )}
              {annotations === undefined || index !== 5 ? null : (
                <small className={styles.typicalEnding}>{annotations.typicalEnding}</small>
              )}
            </span>
          ))}
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
          data-highlighted={index === highlightedIndex || undefined}
        >
          <code>{part}</code>
          {labels?.[index] === undefined ? null : <small>{labels[index]}</small>}
        </span>
      ))}
    </div>
  );
}
