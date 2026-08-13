import {
  s01Content,
  s07PassphraseSearchContent,
  type S01AccountId,
} from '@passwo/training-content';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { useState } from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import styles from './S07PassphraseSearchTraining.module.css';

type S07TabId = S01AccountId | typeof s07PassphraseSearchContent.browser.searchTab.id;

function isS07TabId(tabId: string): tabId is S07TabId {
  return (
    tabId === s07PassphraseSearchContent.browser.searchTab.id ||
    s01Content.browser.accounts.some(({ id }) => id === tabId)
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="5.75" />
      <path d="m15 15 4.25 4.25" />
    </svg>
  );
}

export interface S07PassphraseSearchTrainingProps {
  readonly displayName: string;
  readonly platform?: DesktopPlatform;
}

export function S07PassphraseSearchTraining({
  displayName,
  platform = 'mac',
}: S07PassphraseSearchTrainingProps) {
  const [activeTabId, setActiveTabId] = useState<S07TabId>('campusgram');
  const activeAccount = s01Content.browser.accounts.find(({ id }) => id === activeTabId);
  const searchTab = s07PassphraseSearchContent.browser.searchTab;
  const snapshot: BrowserShellSnapshot = {
    tabs: [
      ...s01Content.browser.accounts.map((account) => ({
        id: account.id,
        label: account.label,
        icon: <NetworkSymbol symbolId={account.symbolId} />,
        enabled: true,
        status: 'complete' as const,
      })),
      {
        id: searchTab.id,
        label: searchTab.label,
        icon: <SearchIcon />,
        enabled: true,
      },
    ],
    activeTabId,
    address:
      activeAccount === undefined ? searchTab.address : `${activeAccount.address}/dashboard`,
    scrollKey: `s07:${activeTabId}`,
  };

  return (
    <section
      className={styles.training}
      aria-label={s07PassphraseSearchContent.trainingAriaLabel}
    >
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={snapshot}
        ariaLabel={s07PassphraseSearchContent.browser.ariaLabel}
        onTabSelect={(tabId) => {
          if (isS07TabId(tabId)) setActiveTabId(tabId);
        }}
      >
        {activeAccount === undefined ? (
          <div
            className={styles.emptySearchPage}
            aria-label={s07PassphraseSearchContent.browser.emptySearchPageAriaLabel}
          />
        ) : (
          <CampusWebsiteBackdrop
            accountId={activeAccount.id}
            interactionLabel={`${activeAccount.label}, angemeldet`}
            view="dashboard"
            displayName={displayName}
          />
        )}
      </BrowserShell>
    </section>
  );
}
