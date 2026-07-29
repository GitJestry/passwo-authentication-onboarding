import type { AnimationEvent, CSSProperties } from 'react';
import styles from './SectionTransition.module.css';

const arrivalDurationMs = 560;
const fadeDurationMs = 480;

interface SectionTransitionStyle extends CSSProperties {
  readonly '--section-transition-arrival-duration': string;
  readonly '--section-transition-hold-duration': string;
  readonly '--section-transition-fade-duration': string;
}

export interface SectionTransitionProps {
  readonly sectionLabel: string;
  readonly title: string;
  readonly currentSection: number;
  readonly totalSections: number;
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
  currentSection,
  totalSections,
  holdDurationMs,
  onComplete,
}: SectionTransitionProps) {
  const normalizedTotal = Math.max(1, totalSections);
  const normalizedCurrent = Math.min(normalizedTotal, Math.max(1, currentSection));
  const sectionProgress =
    normalizedTotal === 1
      ? '100%'
      : `${((normalizedCurrent - 1) / (normalizedTotal - 1)) * 100}%`;
  const animationStyle: SectionTransitionStyle = {
    '--section-transition-arrival-duration': `${arrivalDurationMs}ms`,
    '--section-transition-hold-duration': `${holdDurationMs}ms`,
    '--section-transition-fade-duration': `${fadeDurationMs}ms`,
  };

  function completeFade(event: AnimationEvent<HTMLDivElement>): void {
    if (event.currentTarget === event.target) {
      onComplete();
    }
  }

  return (
    <section className={styles.transition} aria-live="polite" aria-atomic="true">
      <div
        className={styles.transitionContent}
        style={animationStyle}
        onAnimationEnd={completeFade}
      >
        <div className={styles.titleCard}>
          <p>{sectionLabel}</p>
          <h1>{title}</h1>
        </div>
        <div
          className={styles.roadmap}
          role="group"
          aria-label={`Trainingsfortschritt: Sektion ${normalizedCurrent} von ${normalizedTotal}`}
        >
          <span className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: sectionProgress }} />
          </span>
          <ol>
            {Array.from({ length: normalizedTotal }, (_, index) => {
              const sectionNumber = index + 1;
              const state =
                sectionNumber < normalizedCurrent
                  ? 'complete'
                  : sectionNumber === normalizedCurrent
                    ? 'active'
                    : 'future';

              return (
                <li data-state={state} key={sectionNumber}>
                  <span className={styles.point} aria-hidden="true">
                    {state === 'active' ? '' : state === 'complete' ? '✓' : sectionNumber}
                  </span>
                  <span className={styles.screenReaderOnly}>
                    {state === 'active'
                      ? `Sektion ${sectionNumber}: ${title}, aktuell`
                      : state === 'complete'
                        ? `Sektion ${sectionNumber}: abgeschlossen`
                        : `Sektion ${sectionNumber}: folgt später`}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
