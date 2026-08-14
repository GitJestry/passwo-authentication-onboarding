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
import { useEffect, useState, type MouseEvent } from 'react';
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

function GeneratorBrandMark() {
  return (
    <span className={styles.generatorBrandMark} aria-hidden="true">
      <span>W</span>
    </span>
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
                    {isPrimary ? <GeneratorBrandMark /> : result.siteName.slice(0, 1)}
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

function GeneratorPage({ onCopy }: { readonly onCopy: () => void }) {
  const page = s07PassphraseSearchContent.browser.generatorPage;
  const [separator, setSeparator] = useState<string>(page.separators[0].value);
  const [wordSetIndex, setWordSetIndex] = useState(0);
  const [copyToastPosition, setCopyToastPosition] = useState<{
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const passphrase = (page.wordSets[wordSetIndex] ?? page.wordSets[0]).join(separator);

  useEffect(() => {
    if (copyToastPosition === null) {
      return undefined;
    }

    const dismissTimeout = window.setTimeout(() => {
      setCopyToastPosition(null);
    }, 1800);

    return () => window.clearTimeout(dismissTimeout);
  }, [copyToastPosition]);

  const showCopyToast = (event: MouseEvent<HTMLButtonElement>) => {
    const buttonBounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? buttonBounds.left + buttonBounds.width / 2 : event.clientX;
    const y = event.detail === 0 ? buttonBounds.top + buttonBounds.height / 2 : event.clientY;

    setCopyToastPosition({ x, y });
    onCopy();
  };

  return (
    <div className={styles.generatorPage} aria-label={page.ariaLabel}>
      <header className={styles.generatorHeader}>
        <span className={styles.generatorBrand}>
          <GeneratorBrandMark />
          <strong>{page.siteName}</strong>
        </span>
        <nav aria-label="Seitennavigation">
          {page.navigation.map((item, index) => (
            <span key={item} className={index === 0 ? styles.activeGeneratorNavigation : undefined}>
              {item}
            </span>
          ))}
        </nav>
      </header>

      <main className={styles.generatorMain}>
        <div className={styles.generatorIntro}>
          <span>{page.eyebrow}</span>
          <p>{page.securityMessage}</p>
        </div>

        <div className={styles.generatorWorkspace}>
          <h1>{page.title}</h1>
          <section className={styles.generatorCard} aria-labelledby="generator-card-title">
            <div className={styles.generatorCardHeading}>
              <h2 id="generator-card-title">{page.wordCount}</h2>
            </div>

            <fieldset className={styles.separatorFieldset}>
              <legend>{page.separatorLegend}</legend>
              <div className={styles.separatorOptions}>
                {page.separators.map((option) => (
                  <label key={option.label}>
                    <input
                      type="radio"
                      name="passphrase-separator"
                      value={option.value}
                      checked={separator === option.value}
                      onChange={() => {
                        setSeparator(option.value);
                        setCopyToastPosition(null);
                      }}
                    />
                    <span className={styles.separatorSymbol} aria-hidden="true">
                      {option.value === ' ' ? '⌴' : option.value}
                    </span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              className={styles.generateButton}
              onClick={() => {
                setWordSetIndex((currentIndex) => (currentIndex + 1) % page.wordSets.length);
                setCopyToastPosition(null);
              }}
            >
              <span aria-hidden="true">↻</span>
              {page.generate}
            </button>

            <div className={styles.generatorOutputGroup}>
              <output
                className={styles.generatorOutput}
                aria-label={page.outputAriaLabel}
                aria-live="polite"
              >
                {passphrase}
              </output>
            </div>

            <button
              type="button"
              className={styles.copyButton}
              onClick={showCopyToast}
            >
              <span className={styles.copyButtonIcon} aria-hidden="true" />
              {page.copy}
            </button>
          </section>
        </div>
      </main>

      {copyToastPosition ? (
        <div
          className={styles.copyToast}
          role="status"
          style={{ left: copyToastPosition.x, top: copyToastPosition.y }}
        >
          <span aria-hidden="true">✓</span>
          {page.copied}
        </div>
      ) : null}
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
  const [searchView, setSearchView] = useState<'results' | 'generator'>('results');
  const activeAccount = s01Content.browser.accounts.find(({ id }) => id === activeTabId);
  const searchTab = s07PassphraseSearchContent.browser.searchTab;
  const generatorPage = s07PassphraseSearchContent.browser.generatorPage;
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
      activeAccount === undefined
        ? searchView === 'generator'
          ? generatorPage.address
          : searchTab.address
        : `${activeAccount.address}/dashboard`,
    scrollKey: `s07:${activeTabId}:${activeAccount === undefined ? searchView : 'dashboard'}`,
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
          searchView === 'results' ? (
            <SearchPage onPrimaryResultSelect={() => setSearchView('generator')} />
          ) : (
            <GeneratorPage onCopy={onPrimaryResultSelect} />
          )
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
