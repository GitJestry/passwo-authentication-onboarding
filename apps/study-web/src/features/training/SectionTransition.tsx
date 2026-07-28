import type { CSSProperties } from 'react';
import styles from './SectionTransition.module.css';

const arrivalDurationMs = 420;
const fadeDurationMs = 360;

interface SectionTransitionStyle extends CSSProperties {
  readonly '--section-transition-arrival-duration': string;
  readonly '--section-transition-hold-duration': string;
  readonly '--section-transition-fade-duration': string;
}

export interface SectionTransitionProps {
  readonly sectionLabel: string;
  readonly title: string;
  readonly holdDurationMs: number;
  readonly onComplete: () => void;
}

/**
 * A self-contained visual handoff between authored training sections.
 * The surrounding statechart decides when it starts and receives its completion.
 */
export function SectionTransition({
  sectionLabel,
  title,
  holdDurationMs,
  onComplete,
}: SectionTransitionProps) {
  const animationStyle: SectionTransitionStyle = {
    '--section-transition-arrival-duration': `${arrivalDurationMs}ms`,
    '--section-transition-hold-duration': `${holdDurationMs}ms`,
    '--section-transition-fade-duration': `${fadeDurationMs}ms`,
  };

  return (
    <section className={styles.transition} aria-live="polite" aria-atomic="true">
      <div className={styles.titleCard} style={animationStyle}>
        <div className={styles.titleContent} onAnimationEnd={onComplete}>
          <p>{sectionLabel}</p>
          <h1>{title}</h1>
        </div>
      </div>
    </section>
  );
}
