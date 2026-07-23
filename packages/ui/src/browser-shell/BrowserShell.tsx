import type { ReactNode } from 'react';
import styles from './BrowserShell.module.css';

export interface BrowserTabModel {
  readonly id: string;
  readonly label: string;
  readonly status?: 'neutral' | 'complete' | 'attention';
}

export interface BrowserShellProps {
  readonly tabs: readonly BrowserTabModel[];
  readonly activeTabId: string;
  readonly address: string;
  readonly children: ReactNode;
  readonly overlay?: ReactNode;
  readonly dimmed?: boolean;
  readonly ariaLabel?: string;
  readonly onTabSelect?: (tabId: string) => void;
}

export function BrowserShell({
  tabs,
  activeTabId,
  address,
  children,
  overlay,
  dimmed = false,
  ariaLabel = 'Fiktive Browseranwendung',
  onTabSelect,
}: BrowserShellProps) {
  return (
    <section className={styles.window} aria-label={ariaLabel}>
      <header className={styles.chrome}>
        <div className={styles.windowControls} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div
          className={styles.tabs}
          role={onTabSelect ? 'tablist' : undefined}
          aria-label="Fiktive Konten"
        >
          {tabs.map((tab) => {
            const selected = tab.id === activeTabId;
            const marker = tab.status === 'complete' ? '✓' : tab.status === 'attention' ? '!' : '';
            return onTabSelect ? (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={selected ? styles.activeTab : styles.tab}
                onClick={() => onTabSelect(tab.id)}
              >
                <span>{tab.label}</span>
                {marker ? <span className={styles.tabMarker}>{marker}</span> : null}
              </button>
            ) : (
              <div
                key={tab.id}
                aria-current={selected ? 'page' : undefined}
                className={selected ? styles.activeTab : styles.tab}
              >
                <span>{tab.label}</span>
                {marker ? <span className={styles.tabMarker}>{marker}</span> : null}
              </div>
            );
          })}
        </div>
        <div className={styles.addressRow}>
          <span className={styles.navigationGlyphs} aria-hidden="true">‹ › ↻</span>
          <div className={styles.address} aria-label="Fiktive Adresse">
            <span aria-hidden="true">▣</span>
            {address}
          </div>
          <span className={styles.utilityGlyphs} aria-hidden="true">☆ ⋮</span>
        </div>
      </header>
      <div className={styles.viewport}>
        <div className={dimmed ? styles.dimmedContent : styles.content}>{children}</div>
        {dimmed ? <div className={styles.dimLayer} aria-hidden="true" /> : null}
        {overlay ? <div className={styles.overlay}>{overlay}</div> : null}
      </div>
    </section>
  );
}
