import type { ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import passWoWarningAsset from '../../assets/passwo/passwo-warning.png';
import passWoWaitingAsset from '../../assets/passwo/passwo-waiting.png';
import {
  PassWoSpeechBubble,
  type PassWoSpeechPlacement,
} from './PassWoSpeechBubble.js';
import type { PassWoSpeechEmphasis } from './PassWoSpeechEmphasis.js';
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
  readonly speechEmphasis?: readonly PassWoSpeechEmphasis[];
  readonly speechFooter?: ReactNode;
  readonly speechPlacement?: PassWoSpeechPlacement;
  readonly hasNextSpeech?: boolean;
  readonly awaitsAction?: boolean;
  readonly placement?: 'bottom-left' | 'center';
  readonly pose?: 'default' | 'warning';
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
  speechEmphasis,
  speechFooter,
  speechPlacement = 'right',
  hasNextSpeech = false,
  awaitsAction = false,
  placement = 'bottom-left',
  pose = 'default',
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
      data-placement={placement}
      data-guided-account={guidedAccountId ?? undefined}
      aria-label={`${guideName} Begleitung`}
    >
      <div className={styles.guideDock}>
        {!helpOpen ? (
          <div className={styles.guideToolbar}>
            {showHelpButton ? (
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
        ) : null}
        <img
          className={styles.character}
          data-passwo-character
          data-pose={pose === 'warning' ? 'warning' : helpOpen ? 'speaking' : 'waiting'}
          src={
            pose === 'warning'
              ? passWoWarningAsset
              : helpOpen
                ? passWoDockAsset
                : passWoWaitingAsset
          }
          alt=""
        />
      </div>
      {helpOpen ? (
        <div id={helpId} className={styles.speechSlot}>
          <PassWoSpeechBubble
            speaker={guideName}
            paragraphs={speech}
            speechKey={speechKey}
            {...(speechEmphasis === undefined ? {} : { emphasis: speechEmphasis })}
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
