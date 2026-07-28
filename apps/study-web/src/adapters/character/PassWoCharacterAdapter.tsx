import type { ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import styles from './PassWoCharacterAdapter.module.css';

export interface PassWoQuestDockProps {
  readonly guideName: string;
  readonly taskLabel: string;
  readonly progressLabel?: string;
  readonly placement?: 'bottom-left' | 'bottom-right';
  readonly helpOpen: boolean;
  readonly helpId: string;
  readonly openHelpLabel: string;
  readonly helpContent: ReactNode;
  readonly onToggleHelp: () => void;
}

/**
 * A visual-only training aid. Progress and help state stay with the segment that renders it.
 */
export function PassWoQuestDock({
  guideName,
  taskLabel,
  progressLabel,
  placement = 'bottom-right',
  helpOpen,
  helpId,
  openHelpLabel,
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
          <strong>{taskLabel}</strong>
          {progressLabel === undefined ? null : <span aria-live="polite">{progressLabel}</span>}
        </div>
        {!helpOpen ? (
          <button
            type="button"
            className={styles.helpButton}
            aria-expanded={false}
            aria-controls={helpId}
            aria-label={openHelpLabel}
            onClick={onToggleHelp}
          >
            <span aria-hidden="true">?</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
