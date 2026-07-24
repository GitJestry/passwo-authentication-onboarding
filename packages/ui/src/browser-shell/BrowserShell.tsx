import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
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
  readonly ariaLabel?: string;
  readonly onTabSelect?: (tabId: string) => void;
}

export function BrowserShell({
  snapshot,
  children,
  layers,
  ariaLabel = 'Fiktive Browseranwendung',
  onTabSelect,
}: BrowserShellProps) {
  const idPrefix = useId().replaceAll(':', '');
  const tabElements = useRef(new Map<string, HTMLButtonElement>());
  const dimmed = snapshot.dimmed ?? false;
  const panelId = `${idPrefix}-tabpanel`;
  const selectedTabIndex = snapshot.tabs.findIndex((tab) => tab.id === snapshot.activeTabId);
  const tabStopIndex = selectedTabIndex >= 0 ? selectedTabIndex : 0;
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
  const enabledTabStates = tabStates.filter(({ enabled }) => enabled);
  const labelledByTabId = tabStates[tabStopIndex]?.tabId;

  function selectTab(tabId: string): void {
    const tabState = enabledTabStates.find(({ tab }) => tab.id === tabId);
    if (tabState === undefined) return;

    onTabSelect?.(tabState.tab.id);
    tabElements.current.get(tabState.tab.id)?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tabId: string): void {
    if (enabledTabStates.length === 0) return;

    const currentIndex = enabledTabStates.findIndex(({ tab }) => tab.id === tabId);
    let targetIndex: number | undefined;

    switch (event.key) {
      case 'ArrowLeft':
        targetIndex = currentIndex <= 0 ? enabledTabStates.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        targetIndex =
          currentIndex < 0 || currentIndex === enabledTabStates.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = enabledTabStates.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const targetTab = enabledTabStates[targetIndex];
    if (targetTab !== undefined) selectTab(targetTab.tab.id);
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
        tabIndex={index === tabStopIndex ? 0 : -1}
        className={selected ? styles.activeTab : styles.tab}
        onClick={() => selectTab(tab.id)}
        onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
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
    <section className={styles.window} aria-label={ariaLabel} data-dimmed={dimmed}>
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
          <span className={styles.utilityArea}>Lernbühne</span>
        </div>
        {tabStates.some(({ enabled }) => !enabled) ? (
          <div className={styles.disabledReasons}>
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
          <span className={styles.addressLabel}>Fiktive Adresse</span>
          <output className={styles.address} aria-label="Fiktive Adresse">
            <span className={styles.addressIndicator} aria-hidden="true" />
            <span className={styles.addressText}>{snapshot.address}</span>
          </output>
          <span className={styles.previewNotice}>Nur Vorschau</span>
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
