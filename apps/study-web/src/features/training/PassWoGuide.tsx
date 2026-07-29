import type { ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import passWoWaitingAsset from '../../assets/passwo/passwo-waiting.png';
import {
  PassWoSpeechBubble,
  type PassWoSpeechPlacement,
} from './PassWoSpeechBubble.js';
import styles from './PassWoGuide.module.css';

export interface PassWoGuideProps {
  readonly guideName: string;
  readonly taskLabel: string;
  readonly progress?: {
    readonly current: number;
    readonly total: number;
    readonly label: string;
  };
  readonly helpOpen: boolean;
  readonly helpId: string;
  readonly openHelpLabel: string;
  readonly speech: readonly string[];
  readonly speechKey: string;
  readonly speechFooter?: ReactNode;
  readonly speechPlacement?: PassWoSpeechPlacement;
  readonly hasNextSpeech?: boolean;
  readonly awaitsAction?: boolean;
  readonly guidedAccountId?: string | null;
  readonly showHelpButton?: boolean;
  readonly onToggleHelp?: () => void;
  readonly onSpeechComplete?: () => void;
  readonly onSpeechAdvance?: () => void;
}

export function PassWoGuide({
  guideName,
  taskLabel,
  progress,
  helpOpen,
  helpId,
  openHelpLabel,
  speech,
  speechKey,
  speechFooter,
  speechPlacement = 'right',
  hasNextSpeech = false,
  awaitsAction = false,
  guidedAccountId = null,
  showHelpButton = true,
  onToggleHelp,
  onSpeechComplete,
  onSpeechAdvance,
}: PassWoGuideProps) {
  const progressPercent =
    progress === undefined || progress.total <= 0
      ? 0
      : Math.min(100, Math.max(0, (progress.current / progress.total) * 100));

  return (
    <aside
      className={styles.guide}
      data-guided-account={guidedAccountId ?? undefined}
      aria-label={`${guideName} Begleitung`}
    >
      <div className={styles.guideDock}>
        <div className={styles.guideToolbar}>
          {!helpOpen && showHelpButton ? (
            <button
              type="button"
              className={styles.infoButton}
              aria-expanded={false}
              aria-controls={helpId}
              aria-label={openHelpLabel}
              title={openHelpLabel}
              onClick={onToggleHelp}
            >
              <span aria-hidden="true">?</span>
            </button>
          ) : null}
          <div className={styles.guideStatus}>
            <strong>{taskLabel}</strong>
            {progress === undefined ? null : (
              <div className={styles.taskProgress} aria-live="polite">
                <span aria-hidden="true">
                  {progress.current}/{progress.total}
                </span>
                <span
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-label={progress.label}
                  aria-valuemin={0}
                  aria-valuemax={progress.total}
                  aria-valuenow={progress.current}
                >
                  <span
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </span>
              </div>
            )}
          </div>
        </div>
        <img
          className={styles.character}
          data-passwo-character
          data-pose={helpOpen ? 'speaking' : 'waiting'}
          src={helpOpen ? passWoDockAsset : passWoWaitingAsset}
          alt=""
        />
      </div>
      {helpOpen ? (
        <div id={helpId} className={styles.speechSlot}>
          <PassWoSpeechBubble
            speaker={guideName}
            paragraphs={speech}
            speechKey={speechKey}
            placement={speechPlacement}
            footer={speechFooter}
            hasNext={hasNextSpeech}
            awaitsAction={awaitsAction}
            {...(onSpeechComplete === undefined ? {} : { onComplete: onSpeechComplete })}
            {...(onSpeechAdvance === undefined ? {} : { onAdvance: onSpeechAdvance })}
          />
        </div>
      ) : null}
    </aside>
  );
}
