import type { ReactNode, Ref } from 'react';
import styles from './S02AccountExplorationTraining.module.css';

interface BrowserDockProps {
  readonly active: boolean;
  readonly enabled: boolean;
  readonly label: string;
  readonly onClick?: () => void;
}

export interface S02DesktopSurfaceProps {
  readonly browserDock: BrowserDockProps;
  readonly children?: ReactNode;
  readonly sceneRef?: Ref<HTMLDivElement>;
}

function BrowserDockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" fill="url(#browser-dock-gradient)" />
      <path d="M7.5 20h25" stroke="#fff" strokeWidth="2.6" />
      <path d="M20 3a24 24 0 0 1 0 34M20 3a24 24 0 0 0 0 34" stroke="#fff" strokeWidth="2.2" />
      <defs>
        <linearGradient id="browser-dock-gradient" x1="8" y1="5" x2="33" y2="36">
          <stop stopColor="#67d7ff" />
          <stop offset="0.54" stopColor="#3b84f6" />
          <stop offset="1" stopColor="#6b4de6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function S02DesktopSurface({
  browserDock,
  children,
  sceneRef,
}: S02DesktopSurfaceProps) {
  return (
    <div ref={sceneRef} className={styles.desktopScene}>
      <div className={styles.desktopMenuBar} aria-hidden="true">
        <span className={styles.desktopMark}>PW</span>
        <span className={styles.desktopMenuWord}>PassWo</span>
        <span className={styles.desktopMenuSpacer} />
        <span className={styles.desktopMenuStatus} />
        <span className={styles.desktopMenuStatus} />
      </div>
      {children}
      <nav className={styles.desktopDock} aria-label="Desktop-Apps">
        <span className={`${styles.dockPlaceholder} ${styles.finderDock}`} aria-hidden="true" />
        <span className={`${styles.dockPlaceholder} ${styles.notesDock}`} aria-hidden="true" />
        <button
          type="button"
          className={styles.browserDockButton}
          disabled={!browserDock.enabled}
          aria-label={browserDock.label}
          onClick={browserDock.onClick}
        >
          <BrowserDockIcon />
          <span>Browser</span>
          {browserDock.active ? <i aria-hidden="true" /> : null}
        </button>
        <span className={`${styles.dockPlaceholder} ${styles.settingsDock}`} aria-hidden="true" />
      </nav>
    </div>
  );
}

export function S02DesktopHandoff() {
  return (
    <div className={styles.handoff} aria-hidden="true" inert>
      <S02DesktopSurface
        browserDock={{
          active: false,
          enabled: false,
          label: 'Browser ist im nächsten Trainingsschritt verfügbar.',
        }}
      />
    </div>
  );
}
