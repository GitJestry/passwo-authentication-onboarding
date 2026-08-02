import { type AnimationEvent, type ReactNode, type Ref, useEffect, useState } from 'react';
import styles from './DesktopSurface.module.css';

export interface DesktopBrowserDockModel {
  readonly active: boolean;
  readonly enabled: boolean;
  readonly label: string;
  readonly onClick?: () => void;
}

export type DesktopPlatform = 'mac' | 'windows' | 'linux';

export interface DesktopSurfaceProps {
  readonly browserDock: DesktopBrowserDockModel;
  readonly browserLaunching?: boolean;
  readonly children?: ReactNode;
  readonly overlay?: ReactNode;
  readonly platform?: DesktopPlatform;
  readonly sceneRef?: Ref<HTMLDivElement>;
  readonly onBrowserLaunchAnimationEnd?: () => void;
}

function formatDesktopTime(date: Date): string {
  const parts = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = new Map(parts.map(({ type, value }) => [type, value]));
  const weekday = values.get('weekday') ?? '';
  const day = values.get('day') ?? '';
  const month = values.get('month') ?? '';
  const hour = values.get('hour') ?? '';
  const minute = values.get('minute') ?? '';
  return `${weekday} ${day}. ${month} ${hour}:${minute}`;
}

function useDesktopTime(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return now;
}

function PassWoOsMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="passwo-os-mark" x1="6" y1="5" x2="27" y2="28">
          <stop stopColor="#55d1dc" />
          <stop offset="0.55" stopColor="#317fdb" />
          <stop offset="1" stopColor="#7655dc" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#passwo-os-mark)" />
      <path
        d="M8.5 11.2c2.4 0 3.2 2.4 5 2.4s2.6-2.4 5-2.4 3.2 2.4 5 2.4"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="2.3"
      />
      <path
        d="M8.5 16.5c2.4 0 3.2 2.4 5 2.4s2.6-2.4 5-2.4 3.2 2.4 5 2.4"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="2.3"
      />
    </svg>
  );
}

function WindowsStartMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z"
        fill="currentColor"
        stroke="rgb(255 255 255 / 62%)"
      />
      <path d="m12 4.9 6.7 3.4v2.8H12V4.9Zm0 8h6.7v2.8L12 19.1v-6.2ZM5.3 8.3 10 5.9v5.2H5.3V8.3Zm0 4.6H10v5.2l-4.7-2.4v-2.8Z" fill="#fff" />
    </svg>
  );
}

function NetworkStatusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 16" fill="none">
      <path
        d="M2 5.7a11.6 11.6 0 0 1 16 0M4.8 8.7a7.4 7.4 0 0 1 10.4 0M7.7 11.6a3.4 3.4 0 0 1 4.6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <circle cx="10" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

function BatteryStatusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 16" fill="none">
      <rect
        x="1"
        y="3"
        width="22"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M25 6v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <rect x="3.5" y="5.5" width="16" height="5" rx="1" fill="currentColor" />
    </svg>
  );
}

function FinderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="5" width="40" height="38" rx="10" fill="#72c4ed" />
      <path d="M8 16h13l4 4h15v18H8V16Z" fill="#e9f7ff" />
      <path d="M8 20h32M14 27h13M14 32h18" stroke="#24658b" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="11" fill="#43b86e" />
      <path
        d="M13 15.5h22v15H22l-6.5 5v-5H13v-15Z"
        fill="#fff"
        stroke="#fff"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M18 21h12M18 25.5h8" stroke="#43b86e" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function FolderIcon({ platform }: { readonly platform: 'windows' | 'linux' }) {
  const bodyColor = platform === 'windows' ? '#f5c94f' : '#e8a34b';
  const topColor = platform === 'windows' ? '#ffdc72' : '#f3bd70';
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path d="M5 12.5h14l4 4H43v23H5v-27Z" fill={topColor} />
      <path d="M5 17h38l-3 23H8L5 17Z" fill={bodyColor} />
      <path d="M8 20h32" stroke="rgb(255 255 255 / 65%)" strokeWidth="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="5" width="40" height="38" rx="7" fill="#1679c5" />
      <path d="M10 14h28v21H10V14Z" fill="#fff" />
      <path d="m11 16 13 10 13-10M11 34l9-10M37 34l-9-10" stroke="#78bce8" strokeWidth="2" />
    </svg>
  );
}

function DocumentAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="5" y="5" width="38" height="38" rx="7" fill="#2457a6" />
      <path d="M13 10h18l6 6v22H13V10Z" fill="#fff" />
      <path d="M31 10v7h6" fill="#b7d1ed" />
      <path d="M18 21h14M18 26h14M18 31h10" stroke="#6e9aca" strokeLinecap="round" strokeWidth="2.2" />
      <rect x="8" y="16" width="7" height="17" rx="2" fill="#3a82cc" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="5" width="40" height="38" rx="9" fill="#28242b" />
      <circle cx="10" cy="11" r="1.4" fill="#ef6a5b" />
      <circle cx="15" cy="11" r="1.4" fill="#e9bd55" />
      <circle cx="20" cy="11" r="1.4" fill="#66b970" />
      <path
        d="m11 21 5 4-5 4M20 30h9"
        stroke="#f4f1f5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="11" fill="#f1edf2" />
      {[15, 24, 33].flatMap((x) =>
        [15, 24, 33].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.3" fill="#655c69" />
        )),
      )}
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" fill="url(#desktop-browser-gradient)" />
      <path d="M9 24h30" stroke="#fff" strokeWidth="2.8" />
      <path d="M24 4c8 8.2 8 31.8 0 40M24 4c-8 8.2-8 31.8 0 40" stroke="#fff" strokeWidth="2.5" />
      <defs>
        <linearGradient id="desktop-browser-gradient" x1="9" y1="6" x2="39" y2="43">
          <stop stopColor="#55d1dc" />
          <stop offset="0.52" stopColor="#317fdb" />
          <stop offset="1" stopColor="#6555c7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="11" fill="#edf1f5" />
      <path
        d="m24 10 3 3.2 4.4-.8 1.2 4.3 4 2-.9 4.4 2.3 3.8-3.3 3-.1 4.5-4.4.9-2.5 3.7-4.2-1.7-4.2 1.7-2.5-3.7-4.4-.9-.1-4.5-3.3-3 2.3-3.8-.9-4.4 4-2 1.2-4.3 4.4.8L24 10Z"
        fill="#8091a1"
      />
      <circle cx="24" cy="24" r="6.2" fill="#edf1f5" />
      <circle cx="24" cy="24" r="3.1" fill="#8091a1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path d="M13 14h22l-2 29H15l-2-29Z" fill="#e9f1f5" stroke="#6f8798" strokeWidth="2" />
      <path d="M11 14h26M19 10h10l2 4H17l2-4Z" stroke="#6f8798" strokeWidth="2" />
      <path d="M19 20v16M24 20v16M29 20v16" stroke="#9baeba" strokeWidth="1.8" />
    </svg>
  );
}

function DecorativeDockIcon({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <span className={styles.decorativeDockIcon} title={label} aria-hidden="true">
      {children}
    </span>
  );
}

export function DesktopSurface({
  browserDock,
  browserLaunching = false,
  children,
  overlay,
  platform = 'mac',
  sceneRef,
  onBrowserLaunchAnimationEnd,
}: DesktopSurfaceProps) {
  const now = useDesktopTime();

  function handleLaunchAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) onBrowserLaunchAnimationEnd?.();
  }

  return (
    <div ref={sceneRef} className={styles.desktopScene} data-platform={platform}>
      <div className={styles.desktopMenuBar}>
        <div className={styles.desktopMenuStart} aria-hidden="true">
          <span className={styles.desktopMark}>
            {platform === 'windows' ? <WindowsStartMark /> : <PassWoOsMark />}
          </span>
          {platform === 'mac' ? (
            <>
              <span className={styles.desktopMenuItem}>Datei</span>
              <span className={styles.desktopMenuItem}>Bearbeiten</span>
              <span className={styles.desktopMenuItem}>Ansicht</span>
              <span className={styles.desktopMenuItem}>Fenster</span>
              <span className={styles.desktopMenuItem}>Hilfe</span>
            </>
          ) : platform === 'linux' ? (
            <>
              <span className={styles.desktopMenuItem}>Aktivitäten</span>
              <span className={styles.desktopMenuItem}>Browser</span>
            </>
          ) : null}
        </div>
        <span className={styles.desktopMenuSpacer} />
        <div className={styles.desktopMenuEnd}>
          <span className={styles.desktopMenuStatus} aria-hidden="true">
            <NetworkStatusIcon />
          </span>
          <span className={styles.desktopMenuStatus} aria-hidden="true">
            <BatteryStatusIcon />
          </span>
          <time className={styles.desktopMenuTime} dateTime={now.toISOString()}>
            {formatDesktopTime(now)}
          </time>
        </div>
      </div>

      <div className={styles.desktopContent}>{children}</div>

      {browserLaunching ? (
        <div
          className={styles.browserLaunchSurface}
          aria-hidden="true"
          onAnimationEnd={handleLaunchAnimationEnd}
        >
          <span />
          <span />
          <span />
        </div>
      ) : null}

      <nav className={styles.desktopDock} aria-label="Desktop-Apps">
        <DecorativeDockIcon label={platform === 'mac' ? 'Finder' : 'Dateien'}>
          {platform === 'mac' ? <FinderIcon /> : <FolderIcon platform={platform} />}
        </DecorativeDockIcon>
        <DecorativeDockIcon
          label={
            platform === 'windows'
              ? 'E-Mail'
              : platform === 'linux'
                ? 'Terminal'
                : 'Nachrichten'
          }
        >
          {platform === 'windows' ? (
            <MailIcon />
          ) : platform === 'linux' ? (
            <TerminalIcon />
          ) : (
            <MessengerIcon />
          )}
        </DecorativeDockIcon>
        <button
          type="button"
          className={styles.browserDockButton}
          disabled={!browserDock.enabled}
          aria-label={browserDock.label}
          title={browserDock.label}
          onClick={browserDock.onClick}
        >
          <BrowserIcon />
          {browserDock.active ? <i aria-hidden="true" /> : null}
        </button>
        <DecorativeDockIcon
          label={
            platform === 'windows'
              ? 'Dokumente'
              : platform === 'linux'
                ? 'Anwendungen'
                : 'Einstellungen'
          }
        >
          {platform === 'windows' ? (
            <DocumentAppIcon />
          ) : platform === 'linux' ? (
            <AppsIcon />
          ) : (
            <SettingsIcon />
          )}
        </DecorativeDockIcon>
        {platform === 'windows' ? null : (
          <DecorativeDockIcon label="Papierkorb">
            <TrashIcon />
          </DecorativeDockIcon>
        )}
      </nav>
      {overlay ? <div className={styles.screenOverlay}>{overlay}</div> : null}
    </div>
  );
}
