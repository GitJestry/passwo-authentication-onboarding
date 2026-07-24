import type { ReactNode } from 'react';
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
  const dimmed = snapshot.dimmed ?? false;
  const tabItems = snapshot.tabs.map((tab) => {
    const selected = tab.id === snapshot.activeTabId;
    const enabled = tab.enabled === true && onTabSelect !== undefined;
    const status =
      tab.status === 'complete'
        ? { label: 'Abgeschlossen', marker: '✓', style: styles.completeMarker }
        : tab.status === 'attention'
          ? { label: 'Hinweis', marker: '!', style: styles.attentionMarker }
          : null;
    const disabledReason =
      tab.disabledReason ??
      (tab.enabled === true
        ? 'Für diese Ansicht ist keine Tab-Auswahl verfügbar.'
        : 'Dieser Tab ist in der aktuellen Szene nicht freigegeben.');

    return (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={selected}
        aria-label={enabled ? tab.label : `${tab.label}. ${disabledReason}`}
        disabled={!enabled}
        title={enabled ? undefined : disabledReason}
        className={selected ? styles.activeTab : styles.tab}
        onClick={enabled ? () => onTabSelect(tab.id) : undefined}
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
          className={dimmed ? styles.dimmedContent : styles.content}
          aria-hidden={dimmed || undefined}
          inert={dimmed || undefined}
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
