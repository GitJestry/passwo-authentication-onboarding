import styles from './CelebrationConfetti.module.css';

const pieces = Array.from({ length: 12 }, (_, index) => index);

export function CelebrationConfetti() {
  return (
    <span className={styles.burst} aria-hidden="true">
      {pieces.map((piece) => <i key={piece} />)}
    </span>
  );
}
