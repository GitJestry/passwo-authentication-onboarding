import type { ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import {
  PassWoSpeechBubble,
  type PassWoSpeechPlacement,
} from './PassWoSpeechBubble.js';
import styles from './PassWoGuide.module.css';

export interface PassWoGuideProps {
  readonly guideName: string;
  readonly progressLabel?: string;
  readonly helpOpen: boolean;
  readonly helpId: string;
  readonly openHelpLabel: string;
  readonly closeHelpLabel: string;
  readonly speech: readonly string[];
  readonly speechKey: string;
  readonly speechFooter?: ReactNode;
  readonly speechPlacement?: PassWoSpeechPlacement;
  readonly onToggleHelp: () => void;
}

export function PassWoGuide({
  guideName,
  progressLabel,
  helpOpen,
  helpId,
  openHelpLabel,
  closeHelpLabel,
  speech,
  speechKey,
  speechFooter,
  speechPlacement = 'right',
  onToggleHelp,
}: PassWoGuideProps) {
  return (
    <aside className={styles.guide} aria-label={`${guideName} Begleitung`}>
      {helpOpen ? (
        <div id={helpId} className={styles.speechSlot}>
          <PassWoSpeechBubble
            speaker={guideName}
            paragraphs={speech}
            speechKey={speechKey}
            placement={speechPlacement}
            footer={speechFooter}
          />
        </div>
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
        <img className={styles.character} data-passwo-character src={passWoDockAsset} alt="" />
        {progressLabel === undefined ? null : (
          <span className={styles.progress} aria-live="polite">
            {progressLabel}
          </span>
        )}
      </button>
    </aside>
  );
}
