import type { CSSProperties } from 'react';
import styles from './CelebrationConfetti.module.css';

const fullPieces = Array.from({ length: 36 }, (_, index) => index);
const compactPieces = fullPieces.slice(0, 8);

interface CelebrationConfettiStyle extends CSSProperties {
  readonly '--celebration-delay': string;
}

export function CelebrationConfetti({
  delayMs = 0,
  compact = false,
}: {
  readonly delayMs?: number;
  readonly compact?: boolean;
} = {}) {
  const style: CelebrationConfettiStyle = {
    '--celebration-delay': `${delayMs}ms`,
  };
  const pieces = compact ? compactPieces : fullPieces;

  return (
    <span
      className={styles.burst}
      data-compact={compact || undefined}
      style={style}
      aria-hidden="true"
    >
      {pieces.map((piece) => <i key={piece} />)}
    </span>
  );
}
