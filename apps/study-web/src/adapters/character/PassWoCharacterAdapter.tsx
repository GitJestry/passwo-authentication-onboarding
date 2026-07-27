import type { ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import styles from './PassWoCharacterAdapter.module.css';

export interface PassWoQuestDockProps {
  readonly guideName: string;
  readonly progressLabel?: string;
  readonly placement?: 'bottom-left' | 'bottom-right';
  readonly helpOpen: boolean;
  readonly helpId: string;
  readonly openHelpLabel: string;
  readonly closeHelpLabel: string;
  readonly helpContent: ReactNode;
  readonly onToggleHelp: () => void;
}

/**
 * A visual-only training aid. Progress and help state stay with the segment that renders it.
 */
export function PassWoQuestDock({
  guideName,
  progressLabel,
  placement = 'bottom-right',
  helpOpen,
  helpId,
  openHelpLabel,
  closeHelpLabel,
  helpContent,
  onToggleHelp,
}: PassWoQuestDockProps) {
  return (
    <div
      className={styles.questDock}
      data-passwo-quest-dock=""
      data-placement={placement}
    >
      {helpOpen ? (
        <section id={helpId} className={styles.questHelp} aria-label={`${guideName} Hinweis`}>
          {helpContent}
        </section>
      ) : null}
      <div className={styles.questCard}>
        <img
          className={styles.questImage}
          src={passWoDockAsset}
          alt={`${guideName}, Begleiter der Übung`}
          data-passwo-dock-asset=""
        />
        <div className={styles.questStatus}>
          <strong>{guideName}</strong>
          {progressLabel === undefined ? null : <span aria-live="polite">{progressLabel}</span>}
        </div>
        <button
          type="button"
          className={styles.helpButton}
          aria-expanded={helpOpen}
          aria-controls={helpId}
          aria-label={helpOpen ? closeHelpLabel : openHelpLabel}
          onClick={onToggleHelp}
        >
          <span aria-hidden="true">?</span>
        </button>
      </div>
    </div>
  );
}
