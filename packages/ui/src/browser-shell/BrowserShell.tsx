import {
  type AnimationEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  DesktopSurface,
  type DesktopPlatform,
} from '../desktop-shell/DesktopSurface.js';
import styles from './BrowserShell.module.css';

export interface BrowserTabModel {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly status?: 'neutral' | 'complete' | 'attention' | 'danger';
  readonly enabled?: boolean;
  readonly disabledReason?: string;
}

function BugStatusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 9.5h8v5.2a4 4 0 0 1-8 0V9.5Z" />
      <path d="M9.5 9.5V8a2.5 2.5 0 0 1 5 0v1.5M12 10v8M5 11h3M16 11h3M5.5 16H8M16 16h2.5M7 6l2 2M17 6l-2 2" />
    </svg>
  );
}

export interface BrowserShellSnapshot {
  readonly tabs: readonly BrowserTabModel[];
  readonly activeTabId: string;
  readonly address: string;
  readonly dimmed?: boolean;
  readonly dimStrength?: 'soft' | 'standard';
  readonly highlightedTabId?: string;
  readonly locked?: boolean;
}

export interface BrowserShellLayers {
  readonly passWo?: ReactNode;
  readonly speech?: ReactNode;
  readonly controls?: ReactNode;
}

export interface BrowserShellProps {
  readonly snapshot: BrowserShellSnapshot;
  readonly children: ReactNode;
  readonly layers?: BrowserShellLayers;
  readonly platform?: DesktopPlatform;
  readonly variant?: 'artifact' | 'framed';
  readonly ariaLabel?: string;
  readonly windowOpen?: boolean;
  readonly onTabSelect?: (tabId: string) => void;
  readonly onWindowClose?: () => void;
  readonly onWindowOpenChange?: (open: boolean) => void;
  readonly onWindowTransitionEnd?: (state: 'open' | 'closed') => void;
}

type BrowserWindowState = 'open' | 'opening' | 'closing' | 'closed';

export function BrowserShell({
  snapshot,
  children,
  layers,
  platform = 'mac',
  variant = 'framed',
  ariaLabel = 'Fiktive Browseranwendung',
  windowOpen,
  onTabSelect,
  onWindowClose,
  onWindowOpenChange,
  onWindowTransitionEnd,
}: BrowserShellProps) {
  const idPrefix = useId().replaceAll(':', '');
  const tabElements = useRef(new Map<string, HTMLButtonElement>());
  const [uncontrolledOpen, setUncontrolledOpen] = useState(true);
  const desiredWindowOpen = windowOpen ?? uncontrolledOpen;
  const [windowState, setWindowState] = useState<BrowserWindowState>(
    desiredWindowOpen ? 'open' : 'closed',
  );
  const dimmed = snapshot.dimmed ?? false;
  const locked = snapshot.locked ?? false;
  const dimStrength = snapshot.dimStrength ?? 'standard';
  const panelId = `${idPrefix}-tabpanel`;
  const selectedTabIndex = snapshot.tabs.findIndex((tab) => tab.id === snapshot.activeTabId);
  const [focusedTabId, setFocusedTabId] = useState(
    () => snapshot.tabs[selectedTabIndex]?.id ?? snapshot.tabs[0]?.id,
  );
  const tabStates = snapshot.tabs.map((tab, index) => {
    const enabled = tab.enabled === true && onTabSelect !== undefined;
    const disabledReason =
      tab.disabledReason ??
      (tab.enabled === true
        ? 'Für diese Ansicht ist keine Tab-Auswahl verfügbar.'
        : 'Dieser Tab ist in der aktuellen Szene nicht freigegeben.');

    return {
      tab,
      index,
      enabled,
      disabledReason,
      tabId: `${idPrefix}-tab-${index}`,
      reasonId: `${idPrefix}-tab-reason-${index}`,
    };
  });
  const tabStopIndex = tabStates.findIndex(({ tab }) => tab.id === focusedTabId);
  const resolvedTabStopIndex = tabStopIndex >= 0 ? tabStopIndex : 0;
  const labelledByTabId = tabStates[selectedTabIndex >= 0 ? selectedTabIndex : 0]?.tabId;

  useEffect(() => {
    setWindowState((currentState) => {
      if (desiredWindowOpen && (currentState === 'closed' || currentState === 'closing')) {
        return 'opening';
      }
      if (!desiredWindowOpen && (currentState === 'open' || currentState === 'opening')) {
        return 'closing';
      }
      return currentState;
    });
  }, [desiredWindowOpen]);

  function setWindowOpen(open: boolean): void {
    if (windowOpen === undefined) setUncontrolledOpen(open);
    onWindowOpenChange?.(open);
  }

  function handleWindowAnimationEnd(event: AnimationEvent<HTMLElement>): void {
    if (event.target !== event.currentTarget) return;

    if (windowState === 'closing') {
      setWindowState('closed');
      onWindowTransitionEnd?.('closed');
    } else if (windowState === 'opening') {
      setWindowState('open');
      onWindowTransitionEnd?.('open');
    }
  }

  function selectTab(tabId: string): void {
    const tabState = tabStates.find(({ tab, enabled }) => tab.id === tabId && enabled);
    if (tabState === undefined) return;

    setFocusedTabId(tabState.tab.id);
    onTabSelect?.(tabState.tab.id);
    tabElements.current.get(tabState.tab.id)?.focus();
  }

  function focusTab(tabId: string): void {
    setFocusedTabId(tabId);
    tabElements.current.get(tabId)?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    tabId: string,
    enabled: boolean,
  ): void {
    if (!enabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }

    if (tabStates.length === 0) return;

    const currentIndex = tabStates.findIndex(({ tab }) => tab.id === tabId);
    let targetIndex: number | undefined;

    switch (event.key) {
      case 'ArrowLeft':
        targetIndex = currentIndex <= 0 ? tabStates.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        targetIndex =
          currentIndex < 0 || currentIndex === tabStates.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = tabStates.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const targetTab = tabStates[targetIndex];
    if (targetTab === undefined) return;

    if (targetTab.enabled) {
      selectTab(targetTab.tab.id);
    } else {
      focusTab(targetTab.tab.id);
    }
  }

  const tabItems = tabStates.map(({ tab, index, enabled, tabId, reasonId }) => {
    const selected = index === selectedTabIndex;
    const status =
      tab.status === 'complete'
        ? { label: 'Abgeschlossen', marker: '✓', style: styles.completeMarker }
        : tab.status === 'attention'
          ? { label: 'Hinweis', marker: '!', style: styles.attentionMarker }
          : tab.status === 'danger'
            ? { label: 'Warnung', marker: <BugStatusIcon />, style: styles.dangerMarker }
            : null;

    return (
      <button
        key={tab.id}
        id={tabId}
        ref={(element) => {
          if (element === null) {
            tabElements.current.delete(tab.id);
          } else {
            tabElements.current.set(tab.id, element);
          }
        }}
        type="button"
        role="tab"
        aria-selected={selected}
        aria-label={tab.label}
        aria-controls={panelId}
        aria-disabled={enabled ? undefined : true}
        aria-describedby={enabled ? undefined : reasonId}
        tabIndex={index === resolvedTabStopIndex ? 0 : -1}
        className={selected ? styles.activeTab : styles.tab}
        data-guided-highlight={snapshot.highlightedTabId === tab.id || undefined}
        onClick={() => selectTab(tab.id)}
        onKeyDown={(event) => handleTabKeyDown(event, tab.id, enabled)}
      >
        <span className={styles.tabIdentity}>
          {tab.icon ? <span className={styles.tabIcon}>{tab.icon}</span> : null}
          <span>{tab.label}</span>
        </span>
        {status ? (
          <span
            className={`${styles.tabMarker} ${status.style}`}
            role="img"
            aria-label={status.label}
            title={status.label}
          >
            {status.marker}
          </span>
        ) : null}
      </button>
    );
  });

  return (
    <DesktopSurface
      platform={platform}
      browserDock={{
        active: windowState !== 'closed',
        enabled: !dimmed && !locked,
        label:
          windowState === 'closed'
            ? 'Browserfenster vom Dock öffnen'
            : 'Browserfenster im Dock ablegen',
        onClick: () => setWindowOpen(windowState === 'closed' || windowState === 'closing'),
      }}
    >
      <section
        className={
          variant === 'artifact' ? `${styles.window} ${styles.artifactWindow}` : styles.window
        }
        aria-label={ariaLabel}
        aria-hidden={windowState === 'closed' || undefined}
        inert={windowState === 'closed' || undefined}
        data-dimmed={dimmed}
        data-dim-strength={dimStrength}
        data-browser-shell-variant={variant}
        data-platform={platform}
        data-window-state={windowState}
        onAnimationEnd={handleWindowAnimationEnd}
      >
        <header className={styles.chrome} inert={dimmed || locked || undefined}>
          <div className={styles.tabRow}>
            <div className={styles.windowControls}>
              <button
                type="button"
                className={styles.closeControl}
                aria-label="Browserfenster schließen"
                title="Schließen"
                onClick={() => {
                  onWindowClose?.();
                  setWindowOpen(false);
                }}
              >
                <svg className={styles.closeIcon} viewBox="0 0 10 10" aria-hidden="true">
                  <path d="m2 2 6 6M8 2 2 8" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.minimizeControl}
                aria-label="Browserfenster im Dock ablegen"
                title="Im Dock ablegen"
                onClick={() => setWindowOpen(false)}
              >
                <svg className={styles.minimizeIcon} viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2 5h6" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.expandControl}
                aria-label="Browserfenster ist maximiert"
                title="Maximiert"
                disabled
              >
                <svg className={styles.expandIcon} viewBox="0 0 10 10" aria-hidden="true">
                  <rect x="2" y="2" width="6" height="6" rx="0.5" />
                </svg>
              </button>
            </div>
            <div className={styles.tabs} role="tablist" aria-label="Fiktive Seitentabs">
              {tabItems}
            </div>
          </div>
          {tabStates.some(({ enabled }) => !enabled) ? (
            <div className={styles.disabledReasons} aria-live="polite">
              {tabStates.map(({ tab, enabled, disabledReason, reasonId }) =>
                enabled ? null : (
                  <p key={tab.id} id={reasonId}>
                    <strong>{tab.label}:</strong> {disabledReason}
                  </p>
                ),
              )}
            </div>
          ) : null}
          <div className={styles.addressRow}>
            <output className={styles.address} aria-label="Adresszeile">
              <span className={styles.addressIndicator} aria-hidden="true">
                <span />
              </span>
              <span className={styles.addressText}>{snapshot.address}</span>
            </output>
          </div>
        </header>
        <div className={styles.viewport}>
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={labelledByTabId}
            className={dimmed ? styles.dimmedContent : styles.content}
            aria-hidden={dimmed || undefined}
            inert={dimmed || locked || undefined}
            tabIndex={dimmed || locked ? -1 : 0}
          >
            {children}
          </div>
          {dimmed ? (
            <div className={styles.dimLayer} data-browser-layer="dimming" aria-hidden="true" />
          ) : null}
          {layers?.passWo ? (
            <div className={styles.passWoLayer} data-browser-layer="passwo">
              {layers.passWo}
            </div>
          ) : null}
          {layers?.speech ? (
            <div className={styles.speechLayer} data-browser-layer="speech">
              {layers.speech}
            </div>
          ) : null}
          {layers?.controls ? (
            <div className={styles.controlsLayer} data-browser-layer="controls">
              {layers.controls}
            </div>
          ) : null}
        </div>
      </section>
    </DesktopSurface>
  );
}
