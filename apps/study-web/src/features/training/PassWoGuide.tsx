import { useMemo, useRef, type ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.webp';
import passWoWarningAsset from '../../assets/passwo/passwo-warning.webp';
import passWoWaitingAsset from '../../assets/passwo/passwo-waiting.webp';
import {
  PassWoSpeechBubble,
  type PassWoSpeechAction,
  type PassWoSpeechPlacement,
  type PassWoSpeechTone,
} from './PassWoSpeechBubble.js';
import type { PassWoSpeechEmphasis } from './PassWoSpeechEmphasis.js';
import {
  passWoSpeechPositionStyle,
  usePassWoSpeechPosition,
  type PassWoSpeechSide,
} from './PassWoSpeechPosition.js';
import styles from './PassWoGuide.module.css';

const defaultSpeechObstacleSelector =
  'button, input, select, textarea, [role="button"], [role="tab"], [data-passwo-speech-obstacle]';

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
  readonly mutedSpeechParagraphIndexes?: readonly number[];
  readonly speechFooter?: ReactNode;
  readonly speechPlacement?: PassWoSpeechPlacement;
  readonly speechTone?: PassWoSpeechTone;
  readonly speechObstacleSelector?: string;
  readonly speechAction?: PassWoSpeechAction;
  readonly placement?: 'bottom-left' | 'bottom-right' | 'center' | 'incident';
  readonly pose?: 'default' | 'warning';
  /** Keeps the guide aligned with a currently explained browser tab. */
  readonly guidedAccountId?: string | null;
  /** Shows the task status alongside a currently visible speech bubble. */
  readonly showTaskStatusWhenSpeaking?: boolean;
  /** Marks the task status as complete and replaces its progress indicator. */
  readonly taskComplete?: boolean;
  readonly showHelpButton?: boolean;
  readonly onToggleHelp?: () => void;
}

function preferredSides(placement: PassWoSpeechPlacement): readonly PassWoSpeechSide[] {
  switch (placement) {
    case 'left':
      return ['left', 'right', 'above', 'below'];
    case 'above':
      return ['above', 'right', 'left', 'below'];
    case 'below':
      return ['below', 'right', 'left', 'above'];
    default:
      return ['right', 'left', 'above', 'below'];
  }
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
  mutedSpeechParagraphIndexes,
  speechFooter,
  speechPlacement = 'right',
  speechTone = 'light',
  speechObstacleSelector,
  speechAction,
  placement = 'bottom-left',
  pose = 'default',
  guidedAccountId = null,
  showTaskStatusWhenSpeaking = false,
  taskComplete = false,
  showHelpButton = true,
  onToggleHelp,
}: PassWoGuideProps) {
  const guideRef = useRef<HTMLElement | null>(null);
  const characterRef = useRef<HTMLImageElement | null>(null);
  const speechSlotRef = useRef<HTMLDivElement | null>(null);
  const sides = useMemo(() => preferredSides(speechPlacement), [speechPlacement]);
  const resolvedSpeechObstacleSelector =
    speechObstacleSelector === undefined
      ? defaultSpeechObstacleSelector
      : `${defaultSpeechObstacleSelector}, ${speechObstacleSelector}`;
  const speechPosition = usePassWoSpeechPosition({
    ownerRef: guideRef,
    characterRef,
    speechRef: speechSlotRef,
    enabled: helpOpen,
    positionKey: `${speechKey}-${placement}-${pose}`,
    preferredSides: sides,
    obstacleSelector: resolvedSpeechObstacleSelector,
  });
  const progressPercent =
    progress === undefined || progress.total <= 0
      ? 0
      : Math.min(100, Math.max(0, (progress.current / progress.total) * 100));
  const showTaskStatus = !helpOpen || showTaskStatusWhenSpeaking;
  const characterAsset =
    pose === 'warning'
      ? { src: passWoWarningAsset, width: 360, height: 540 }
      : helpOpen
        ? { src: passWoDockAsset, width: 360, height: 540 }
        : { src: passWoWaitingAsset, width: 360, height: 435 };

  return (
    <aside
      ref={guideRef}
      className={styles.guide}
      data-placement={placement}
      data-guided-account={guidedAccountId ?? undefined}
      data-speaking={helpOpen || undefined}
      aria-label={`${guideName} Begleitung`}
    >
      <div className={styles.guideDock}>
        {showTaskStatus ? (
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
              <strong>
                {taskLabel}
                {taskComplete ? (
                  <span className={styles.completeMark} role="img" aria-label="Abgeschlossen">
                    ✓
                  </span>
                ) : null}
              </strong>
              {progress === undefined || taskComplete ? null : (
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
          ref={characterRef}
          className={styles.character}
          data-speaking={helpOpen || undefined}
          data-passwo-character
          data-pose={pose === 'warning' ? 'warning' : helpOpen ? 'speaking' : 'waiting'}
          src={characterAsset.src}
          width={characterAsset.width}
          height={characterAsset.height}
          alt=""
        />
      </div>
      {helpOpen ? (
        <div
          ref={speechSlotRef}
          id={helpId}
          className={styles.speechSlot}
          data-positioned={speechPosition !== null}
          style={passWoSpeechPositionStyle(speechPosition)}
        >
          <PassWoSpeechBubble
            speaker={guideName}
            paragraphs={speech}
            {...(speechEmphasis === undefined ? {} : { emphasis: speechEmphasis })}
            {...(mutedSpeechParagraphIndexes === undefined
              ? {}
              : { mutedParagraphIndexes: mutedSpeechParagraphIndexes })}
            footer={speechFooter}
            placement={speechPosition?.side ?? speechPlacement}
            tone={speechTone}
            {...(speechPosition === null ? {} : { arrowOffset: speechPosition.arrowOffset })}
            {...(speechAction === undefined ? {} : { action: speechAction })}
          />
        </div>
      ) : null}
    </aside>
  );
}
