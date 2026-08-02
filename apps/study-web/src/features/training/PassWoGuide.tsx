import { useMemo, useRef, type ReactNode } from 'react';
import passWoDockAsset from '../../assets/passwo/passwo-dock.png';
import passWoWarningAsset from '../../assets/passwo/passwo-warning.png';
import passWoWaitingAsset from '../../assets/passwo/passwo-waiting.png';
import {
  PassWoSpeechBubble,
  type PassWoSpeechPlacement,
} from './PassWoSpeechBubble.js';
import type { PassWoSpeechEmphasis } from './PassWoSpeechEmphasis.js';
import {
  passWoSpeechPositionStyle,
  usePassWoSpeechPosition,
  type PassWoSpeechSide,
} from './PassWoSpeechPosition.js';
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
  readonly speechAction?: 'advance' | 'dismiss';
  readonly placement?: 'bottom-left' | 'center' | 'incident';
  readonly pose?: 'default' | 'warning';
  readonly showHelpButton?: boolean;
  readonly onToggleHelp?: () => void;
  readonly onSpeechAction?: () => void;
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
  speechFooter,
  speechPlacement = 'right',
  speechAction,
  placement = 'bottom-left',
  pose = 'default',
  showHelpButton = true,
  onToggleHelp,
  onSpeechAction,
}: PassWoGuideProps) {
  const guideRef = useRef<HTMLElement | null>(null);
  const characterRef = useRef<HTMLImageElement | null>(null);
  const speechSlotRef = useRef<HTMLDivElement | null>(null);
  const sides = useMemo(() => preferredSides(speechPlacement), [speechPlacement]);
  const speechPosition = usePassWoSpeechPosition({
    ownerRef: guideRef,
    characterRef,
    speechRef: speechSlotRef,
    enabled: helpOpen,
    positionKey: `${speechKey}-${placement}-${pose}`,
    preferredSides: sides,
  });
  const progressPercent =
    progress === undefined || progress.total <= 0
      ? 0
      : Math.min(100, Math.max(0, (progress.current / progress.total) * 100));

  return (
    <aside
      ref={guideRef}
      className={styles.guide}
      data-placement={placement}
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
          ref={characterRef}
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
            speechKey={speechKey}
            {...(speechEmphasis === undefined ? {} : { emphasis: speechEmphasis })}
            footer={speechFooter}
            placement={speechPosition?.side ?? speechPlacement}
            {...(speechPosition === null ? {} : { arrowOffset: speechPosition.arrowOffset })}
            {...(speechAction === undefined || onSpeechAction === undefined
              ? {}
              : { action: { kind: speechAction, onAction: onSpeechAction } })}
          />
        </div>
      ) : null}
    </aside>
  );
}
