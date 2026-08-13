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
import { CampusgramIncidentNotice } from '../../CampusgramIncidentNotice.js';
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

function SearchBrandIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.searchBrandMark}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect width="22" height="22" x="1" y="1" rx="7" fill="currentColor" />
      <circle
        className={styles.searchBrandLens}
        cx="10.25"
        cy="10.25"
        r="4.25"
        strokeWidth="2.15"
      />
      <path
        className={styles.searchBrandLens}
        d="m13.55 13.55 4.7 4.7"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        className={styles.searchBrandSpark}
        d="M17.65 4.25c.18 1.08.83 1.73 1.9 1.9-1.07.18-1.72.83-1.9 1.9-.18-1.07-.83-1.72-1.9-1.9 1.07-.17 1.72-.82 1.9-1.9Z"
      />
    </svg>
  );
}

function SearchPage({ onPrimaryResultSelect }: { readonly onPrimaryResultSelect: () => void }) {
  const searchPage = s07PassphraseSearchContent.browser.searchPage;

  return (
    <div className={styles.searchPage} aria-label={searchPage.ariaLabel}>
      <header className={styles.searchHeader}>
        <div className={styles.searchTopRow}>
          <span className={styles.searchBrand}>
            <SearchBrandIcon />
            <span className={styles.searchWordmark}>{searchPage.brand}</span>
          </span>
          <div className={styles.searchField} role="search" aria-label="Fiktive Suche">
            <span>{searchPage.query}</span>
            <span className={styles.clearQuery} aria-hidden="true">
              ×
            </span>
            <span className={styles.searchFieldIcon}>
              <SearchIcon />
            </span>
          </div>
        </div>
        <nav className={styles.searchNavigation} aria-label="Suchkategorien">
          {searchPage.navigation.map((item, index) => (
            <span key={item} className={index === 0 ? styles.activeSearchNavigationItem : undefined}>
              {item}
            </span>
          ))}
        </nav>
      </header>

      <main className={styles.searchMain}>
        <ol className={styles.resultsList}>
          {searchPage.results.map((result, index) => {
            const isPrimary = result.id === searchPage.primaryResultId;
            return (
              <li key={result.id} className={isPrimary ? styles.primaryResult : styles.searchResult}>
                <div className={styles.resultSource}>
                  <span className={styles.resultFavicon} aria-hidden="true">
                    {result.siteName.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{result.siteName}</strong>
                    <small>{result.domain}</small>
                  </span>
                  <span className={styles.resultMenu} aria-hidden="true">
                    ⋮
                  </span>
                </div>
                {isPrimary ? (
                  <button
                    type="button"
                    className={styles.primaryResultLink}
                    onClick={onPrimaryResultSelect}
                  >
                    {result.title}
                  </button>
                ) : (
                  <span className={styles.resultLink}>{result.title}</span>
                )}
                <p>{result.description}</p>
                {index === 2 ? (
                  <section className={styles.peopleAlsoAsk} aria-labelledby="people-also-ask-title">
                    <h2 id="people-also-ask-title">Andere suchten auch</h2>
                    {searchPage.questions.map((question) => (
                      <div key={question}>
                        <span>{question}</span>
                        <span aria-hidden="true">⌄</span>
                      </div>
                    ))}
                  </section>
                ) : null}
              </li>
            );
          })}
        </ol>

        <section className={styles.relatedSearches} aria-labelledby="related-searches-title">
          <h2 id="related-searches-title">Verwandte Suchanfragen</h2>
          <div>
            {searchPage.relatedSearches.map((query) => (
              <span key={query}>
                <SearchIcon />
                {query}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.resultCollectionSummary}>
          <span className={styles.resultCollectionIcon} aria-hidden="true">
            <SearchIcon />
          </span>
          <div>
            <h2>{searchPage.resultCollectionSummary.title}</h2>
            <p>{searchPage.resultCollectionSummary.description}</p>
          </div>
          <ul aria-label="Enthaltene Themen">
            {searchPage.resultCollectionSummary.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.searchFooter}>
        <div>{searchPage.footerLocation}</div>
        <nav aria-label="Informationen zur fiktiven Suche">
          {searchPage.footerLinks.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </nav>
      </footer>
    </div>
  );
}

export interface S07PassphraseSearchTrainingProps {
  readonly displayName: string;
  readonly platform?: DesktopPlatform;
  readonly onPrimaryResultSelect?: () => void;
}

export function S07PassphraseSearchTraining({
  displayName,
  platform = 'mac',
  onPrimaryResultSelect = () => undefined,
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
      })),
      {
        id: searchTab.id,
        label: searchTab.label,
        icon: <SearchBrandIcon />,
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
          <SearchPage onPrimaryResultSelect={onPrimaryResultSelect} />
        ) : (
          <CampusWebsiteBackdrop
            accountId={activeAccount.id}
            interactionLabel={`${activeAccount.label}, angemeldet`}
            view="dashboard"
            displayName={displayName}
            dashboardNotice={
              activeAccount.id === 'campusgram' ? <CampusgramIncidentNotice /> : undefined
            }
          />
        )}
      </BrowserShell>
    </section>
  );
}
