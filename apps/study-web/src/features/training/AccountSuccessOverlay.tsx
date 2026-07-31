import styles from './AccountSuccessOverlay.module.css';

export interface AccountSuccessOverlayProps {
  readonly label: string;
  readonly onComplete: () => void;
}

export function AccountSuccessOverlay({ label, onComplete }: AccountSuccessOverlayProps) {
  return (
    <section
      className={styles.overlay}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) onComplete();
      }}
    >
      <span aria-hidden="true">✓</span>
      <strong>{label}</strong>
    </section>
  );
}
