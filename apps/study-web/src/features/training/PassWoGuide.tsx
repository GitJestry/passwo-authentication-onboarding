import type { ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import styles from './PassWoGuide.module.css';

export interface PassWoGuideProps {
  readonly guideName: string;
  readonly progressLabel?: string;
  readonly helpOpen: boolean;
  readonly helpId: string;
  readonly openHelpLabel: string;
  readonly closeHelpLabel: string;
  readonly children: ReactNode;
  readonly onToggleHelp: () => void;
}

/**
 * Keeps PassWo visually separate from the spoken guidance so the guide remains a character,
 * rather than a label for an instruction card.
 */
export function PassWoGuide({
  guideName,
  progressLabel,
  helpOpen,
  helpId,
  openHelpLabel,
  closeHelpLabel,
  children,
  onToggleHelp,
}: PassWoGuideProps) {
  return (
    <aside className={styles.guide} aria-label={`${guideName} Begleitung`}>
      {helpOpen ? (
        <section id={helpId} className={styles.speech} aria-label={`${guideName} sagt`}>
          {children}
        </section>
      ) : null}
      <button
        type="button"
        className={styles.characterButton}
        aria-expanded={helpOpen}
        aria-controls={helpId}
        aria-label={helpOpen ? closeHelpLabel : openHelpLabel}
        onClick={onToggleHelp}
      >
        <span className={styles.nameTag}>{guideName}</span>
        <img className={styles.character} src={passWoDockAsset} alt="" />
        {progressLabel === undefined ? null : (
          <span className={styles.progress} aria-live="polite">
            {progressLabel}
          </span>
        )}
      </button>
    </aside>
  );
}
