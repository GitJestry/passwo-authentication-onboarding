import styles from './SimulatedPasteButton.module.css';

export function SimulatedPasteButton({
  centered = false,
  guided = false,
  label,
  onClick,
}: {
  readonly centered?: boolean;
  readonly guided?: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.button}
      data-centered={centered || undefined}
      data-guided-highlight={guided || undefined}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
