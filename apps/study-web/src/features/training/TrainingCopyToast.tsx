import styles from './TrainingCopyToast.module.css';

export interface TrainingCopyToastPoint {
  readonly x: number;
  readonly y: number;
}

export function TrainingCopyToast({
  label,
  point,
}: {
  readonly label: string;
  readonly point: TrainingCopyToastPoint;
}) {
  return (
    <span
      className={styles.toast}
      role="status"
      style={{ left: point.x, top: point.y }}
    >
      <span aria-hidden="true">✓</span>
      {label}
    </span>
  );
}
