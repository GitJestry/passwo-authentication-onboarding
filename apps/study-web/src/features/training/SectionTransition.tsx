import type { AnimationEvent, CSSProperties } from 'react';
import styles from './SectionTransition.module.css';

const arrivalDurationMs = 400;
const fadeDurationMs = 320;

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
  readonly parts: readonly {
    readonly id: string;
    readonly label: string;
  }[];
  readonly currentPart: number;
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
  parts,
  currentPart,
  holdDurationMs,
  onComplete,
}: SectionTransitionProps) {
  const normalizedTotal = Math.max(1, totalSections);
  const normalizedCurrent = Math.min(normalizedTotal, Math.max(1, currentSection));
  const normalizedPart = Math.min(parts.length, Math.max(1, currentPart));
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
          aria-label={`Trainingsfortschritt: Sektion ${normalizedCurrent} von ${normalizedTotal}, Teil ${normalizedPart} von ${parts.length}`}
        >
          <ol>
            {parts.map((part, index) => {
              const partNumber = index + 1;
              const state =
                partNumber < normalizedPart
                  ? 'complete'
                  : partNumber === normalizedPart
                    ? 'active'
                    : 'future';

              return (
                <li data-state={state} key={part.id}>
                  <span className={styles.point} aria-hidden="true">
                    {state === 'complete' ? '✓' : ''}
                  </span>
                  {state === 'future' ? null : (
                    <span className={styles.stepLabel}>{part.label}</span>
                  )}
                  <span className={styles.screenReaderOnly}>
                    {state === 'active'
                      ? `Teil ${partNumber}: ${part.label}, aktuell`
                      : state === 'complete'
                        ? `Teil ${partNumber}: ${part.label}, abgeschlossen`
                        : `Teil ${partNumber}: ${part.label}, folgt später`}
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
