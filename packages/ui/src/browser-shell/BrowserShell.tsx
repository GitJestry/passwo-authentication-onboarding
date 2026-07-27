import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import styles from './BrowserShell.module.css';

export interface BrowserTabModel {
  readonly id: string;
  readonly label: string;
  readonly status?: 'neutral' | 'complete' | 'attention';
  readonly enabled?: boolean;
  readonly disabledReason?: string;
}

export interface BrowserShellSnapshot {
  readonly tabs: readonly BrowserTabModel[];
  readonly activeTabId: string;
  readonly address: string;
  readonly dimmed?: boolean;
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
  readonly variant?: 'artifact' | 'framed';
  readonly ariaLabel?: string;
  readonly onTabSelect?: (tabId: string) => void;
}

export function BrowserShell({
  snapshot,
  children,
  layers,
  variant = 'framed',
  ariaLabel = 'Fiktive Browseranwendung',
  onTabSelect,
}: BrowserShellProps) {
  const idPrefix = useId().replaceAll(':', '');
  const tabElements = useRef(new Map<string, HTMLButtonElement>());
  const dimmed = snapshot.dimmed ?? false;
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
        onClick={() => selectTab(tab.id)}
        onKeyDown={(event) => handleTabKeyDown(event, tab.id, enabled)}
      >
        <span>{tab.label}</span>
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
    <section
      className={
        variant === 'artifact' ? `${styles.window} ${styles.artifactWindow}` : styles.window
      }
      aria-label={ariaLabel}
      data-dimmed={dimmed}
      data-browser-shell-variant={variant}
    >
      <header className={styles.chrome}>
        <div className={styles.tabRow}>
          <div className={styles.windowControls} aria-hidden="true">
            <span />
            <span />
            <span />
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
          inert={dimmed || undefined}
          tabIndex={dimmed ? -1 : 0}
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
  );
}
