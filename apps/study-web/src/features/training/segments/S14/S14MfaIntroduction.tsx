import {
  s01Content,
  s14MfaContent,
  type S14FactorIconId,
  type S14FactorId,
} from '@passwo/training-content';
import { useMachine } from '@xstate/react';
import type { SVGProps } from 'react';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
  DesktopSurface,
} from '@passwo/ui';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { AccountSuccessOverlay } from '../../AccountSuccessOverlay.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import searchStyles from '../S07/S07PassphraseSearchTraining.module.css';
import {
  type S14BrowserTabId,
  s14MfaIntroductionMachine,
} from './S14MfaIntroductionMachine.js';
import {
  S14MasterCampusMfa,
  type S14MasterCampusPhase,
} from './S14MasterCampusMfa.js';
import styles from './S14MfaIntroduction.module.css';

function FactorIcon({ iconId }: { readonly iconId: S14FactorIconId }) {
  const sharedProps: SVGProps<SVGSVGElement> = {
    'aria-hidden': true,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (iconId) {
    case 'password':
      return (
        <svg {...sharedProps}>
          <circle cx="17" cy="23" r="8" />
          <path d="m23 29 13 13M30 36l4-4M34 40l4-4" />
        </svg>
      );
    case 'security-question':
      return (
        <svg {...sharedProps}>
          <path d="M8 10h32v23H23l-9 7v-7H8V10Z" />
          <path d="M19 19.2a5.3 5.3 0 1 1 8.3 4.4c-2 1.4-3.3 2.1-3.3 4.4M24 32.7h.01" />
        </svg>
      );
    case 'authenticator-app':
      return (
        <svg {...sharedProps}>
          <rect x="13" y="4" width="22" height="40" rx="5" />
          <path d="M20 9h8M21 38h6" />
          <path d="m19 24 3.3 3.3L29.5 20" />
        </svg>
      );
    case 'security-key':
      return (
        <svg {...sharedProps}>
          <path d="M10 15h25v18H10a6 6 0 0 1-6-6v-6a6 6 0 0 1 6-6Z" />
          <path d="M35 19h9v10h-9M40 19v-4M40 33v-4M15 24h.01" />
        </svg>
      );
    case 'fingerprint':
      return (
        <svg {...sharedProps}>
          <path d="M8 24a16 16 0 0 1 32 0c0 6.1-1.2 11.9-3.6 17.2" />
          <path d="M8.2 29.7c.3-1.9.5-3.8.5-5.7" />
          <path d="M10 33.5c1.2-3 1.8-6.2 1.8-9.5a12.2 12.2 0 0 1 24.4 0c0 7.1-1.7 13.6-5.1 19.5" />
          <path d="M15 40.6c1.9-5.2 2.9-10.7 2.9-16.6a6.1 6.1 0 0 1 12.2 0c0 6.8-1.3 13.2-4 19" />
          <path d="M21.2 42.5C23.1 36.5 24 30.4 24 24" />
        </svg>
      );
    case 'face-recognition':
      return (
        <svg {...sharedProps}>
          <path d="M15 5H8a3 3 0 0 0-3 3v7M33 5h7a3 3 0 0 1 3 3v7M43 33v7a3 3 0 0 1-3 3h-7M15 43H8a3 3 0 0 1-3-3v-7" />
          <path d="M17 20v3M31 20v3M17.5 31c4.3 3.4 8.7 3.4 13 0M24 21v7h3" />
        </svg>
      );
  }
}

function SearchBrandIcon() {
  return (
    <svg
      aria-hidden="true"
      className={searchStyles.searchBrandMark}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect width="22" height="22" x="1" y="1" rx="7" fill="currentColor" />
      <circle
        className={searchStyles.searchBrandLens}
        cx="10.25"
        cy="10.25"
        r="4.25"
        strokeWidth="2.15"
      />
      <path
        className={searchStyles.searchBrandLens}
        d="m13.55 13.55 4.7 4.7"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        className={searchStyles.searchBrandSpark}
        d="M17.65 4.25c.18 1.08.83 1.73 1.9 1.9-1.07.18-1.72.83-1.9 1.9-.18-1.07-.83-1.72-1.9-1.9 1.07-.17 1.72-.82 1.9-1.9Z"
      />
    </svg>
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

function HelpPageIcon({
  kind,
}: {
  readonly kind:
    | 'arrow-right'
    | 'chevron-down'
    | 'chevron-right'
    | 'chevron-up'
    | 'home'
    | 'profile'
    | 'services'
    | 'thumb-down'
    | 'thumb-up';
}) {
  const sharedProps: SVGProps<SVGSVGElement> = {
    'aria-hidden': true,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (kind) {
    case 'arrow-right':
      return (
        <svg {...sharedProps}>
          <path d="M4 12h16M15 7l5 5-5 5" />
        </svg>
      );
    case 'home':
      return (
        <svg {...sharedProps}>
          <path d="m3.5 10.8 8.5-7 8.5 7" />
          <path d="M5.8 9v11h4.1v-6.1h4.2V20h4.1V9" />
        </svg>
      );
    case 'services':
      return (
        <svg {...sharedProps}>
          <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
          <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
          <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
          <rect x="14" y="14" width="6.5" height="6.5" rx="1" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.8 19.5c.7-3.4 2.8-5.2 6.2-5.2s5.5 1.8 6.2 5.2" />
        </svg>
      );
    case 'chevron-up':
      return (
        <svg {...sharedProps}>
          <path d="m7 14.5 5-5 5 5" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...sharedProps}>
          <path d="m7 9.5 5 5 5-5" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...sharedProps}>
          <path d="m9.5 7 5 5-5 5" />
        </svg>
      );
    case 'thumb-up':
      return (
        <svg {...sharedProps}>
          <path d="M8.2 20H5.1a1.6 1.6 0 0 1-1.6-1.6v-7.1a1.6 1.6 0 0 1 1.6-1.6h3.1V20Z" />
          <path d="M8.2 10.1 11.4 4c.5-1 2-1.1 2.5-.1.3.5.4 1.1.2 1.7l-.8 3h5.1a2.1 2.1 0 0 1 2 2.7l-2 7.1A2.2 2.2 0 0 1 16.3 20H8.2" />
        </svg>
      );
    case 'thumb-down':
      return (
        <svg {...sharedProps}>
          <path d="M15.8 4h3.1a1.6 1.6 0 0 1 1.6 1.6v7.1a1.6 1.6 0 0 1-1.6 1.6h-3.1V4Z" />
          <path d="m15.8 13.9-3.2 6.1c-.5 1-2 1.1-2.5.1-.3-.5-.4-1.1-.2-1.7l.8-3H5.6a2.1 2.1 0 0 1-2-2.7l2-7.1A2.2 2.2 0 0 1 7.7 4h8.1" />
        </svg>
      );
  }
}

function SearchField({
  interactive,
  queryVisible,
  onSubmit,
}: {
  readonly interactive: boolean;
  readonly queryVisible: boolean;
  readonly onSubmit: () => void;
}) {
  const content = s14MfaContent.browser.searchPage;

  return (
    <div
      className={`${searchStyles.searchField} ${styles.searchField}`}
      role="search"
      aria-label={queryVisible ? 'Fiktive Suche' : 'Leere fiktive Suche'}
      aria-disabled={!interactive || undefined}
    >
      {queryVisible ? (
        <span
          className={interactive ? styles.autofilledQuery : undefined}
          data-autofilled={interactive || undefined}
        >
          {content.query}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      {queryVisible ? (
        <span className={searchStyles.clearQuery} aria-hidden="true">
          ×
        </span>
      ) : null}
      {interactive ? (
        <button
          type="button"
          className={searchStyles.searchSubmit}
          data-guided-highlight="true"
          aria-label={content.submitLabel}
          onClick={onSubmit}
        >
          <SearchIcon />
        </button>
      ) : queryVisible ? (
        <span className={searchStyles.searchFieldIcon} aria-hidden="true">
          <SearchIcon />
        </span>
      ) : (
        <span
          className={`${searchStyles.searchSubmit} ${styles.lockedSearchAction}`}
          aria-hidden="true"
        >
          <SearchIcon />
        </span>
      )}
    </div>
  );
}

function SearchStartPage({
  queryVisible,
  onSubmit,
}: {
  readonly queryVisible: boolean;
  readonly onSubmit: () => void;
}) {
  const content = s14MfaContent.browser.searchPage;
  return (
    <main
      className={searchStyles.searchLandingPage}
      aria-label={content.landingAriaLabel}
    >
      <div className={searchStyles.searchLandingContent}>
        <span
          className={`${searchStyles.searchBrand} ${searchStyles.searchLandingBrand}`}
        >
          <SearchBrandIcon />
          <span className={searchStyles.searchWordmark}>{content.brand}</span>
        </span>
        <SearchField
          interactive={queryVisible}
          queryVisible={queryVisible}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}

function SearchResultsLoading() {
  const content = s14MfaContent.browser.searchPage;

  return (
    <main
      className={`${searchStyles.searchMain} ${searchStyles.searchResultsLoading}`}
      aria-label={content.resultsLoadingLabel}
      aria-live="polite"
      aria-busy="true"
    >
      <span className={searchStyles.searchLoadingIndicator} aria-hidden="true">
        <SearchIcon />
      </span>
      <span className={searchStyles.visuallyHidden}>
        {content.resultsLoadingLabel}
      </span>
    </main>
  );
}

function SearchResultsPage({
  loading,
  onPrimaryResultSelect,
}: {
  readonly loading: boolean;
  readonly onPrimaryResultSelect: () => void;
}) {
  const content = s14MfaContent.browser.searchPage;

  return (
    <div
      className={`${searchStyles.searchPage} ${styles.searchResultsPage}`}
      aria-label={content.resultsAriaLabel}
    >
      <header
        className={`${searchStyles.searchHeader} ${styles.searchResultsHeader}`}
      >
        <div
          className={`${searchStyles.searchTopRow} ${styles.searchResultsTopRow}`}
        >
          <span
            className={`${searchStyles.searchBrand} ${styles.searchResultsBrand}`}
          >
            <SearchBrandIcon />
            <span className={searchStyles.searchWordmark}>{content.brand}</span>
          </span>
          <SearchField
            interactive={false}
            queryVisible
            onSubmit={() => undefined}
          />
        </div>
        <nav
          className={`${searchStyles.searchNavigation} ${styles.searchResultsNavigation}`}
          aria-label="Suchkategorien"
        >
          {content.navigation.map((item, index) => (
            <span
              key={item}
              className={
                index === 0
                  ? searchStyles.activeSearchNavigationItem
                  : undefined
              }
            >
              {item}
            </span>
          ))}
        </nav>
      </header>
      {loading ? (
        <SearchResultsLoading />
      ) : (
        <main className={`${searchStyles.searchMain} ${styles.searchResultsMain}`}>
          <ol
            className={`${searchStyles.resultsList} ${styles.searchResultsList}`}
          >
            {content.results.map((result, index) => {
              const primary = result.id === content.primaryResultId;
              if (primary) {
                return (
                  <li
                    key={result.id}
                    className={`${searchStyles.primaryResultItem} ${styles.primaryResultItem}`}
                  >
                    <button
                      type="button"
                      className={`${searchStyles.primaryResult} ${styles.primarySearchResult}`}
                      data-guided-highlight="true"
                      onClick={onPrimaryResultSelect}
                    >
                      <div
                        className={`${searchStyles.resultSource} ${styles.resultSource}`}
                      >
                        <span
                          className={`${searchStyles.resultFavicon} ${styles.masterCampusFavicon}`}
                          aria-hidden="true"
                        >
                          <NetworkSymbol symbolId="master-campus" />
                        </span>
                        <span>
                          <strong>{result.siteName}</strong>
                          <small>{result.domain}</small>
                        </span>
                        <span className={searchStyles.resultMenu} aria-hidden="true">
                          ⋮
                        </span>
                      </div>
                      <span
                        className={`${searchStyles.primaryResultTitle} ${styles.searchResultTitle}`}
                      >
                        {result.title}
                      </span>
                      <p>{result.description}</p>
                    </button>
                  </li>
                );
              }

              return (
                <li
                  key={result.id}
                  className={`${searchStyles.searchResult} ${styles.secondarySearchResult}`}
                >
                  <div
                    className={`${searchStyles.resultSource} ${styles.resultSource}`}
                  >
                    <span
                      className={`${searchStyles.resultFavicon} ${styles.secondaryFavicon}`}
                      data-result-index={index}
                      aria-hidden="true"
                    >
                      {result.siteName.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{result.siteName}</strong>
                      <small>{result.domain}</small>
                    </span>
                    <span className={searchStyles.resultMenu} aria-hidden="true">
                      ⋮
                    </span>
                  </div>
                  <span
                    className={`${searchStyles.resultLink} ${styles.searchResultTitle}`}
                  >
                    {result.title}
                  </span>
                  <p>{result.description}</p>
                </li>
              );
            })}
          </ol>
        </main>
      )}
    </div>
  );
}

function HelpPage({ guideVisible }: { readonly guideVisible: boolean }) {
  const content = s14MfaContent.browser.helpPage;

  return (
    <article
      className={styles.helpPage}
      data-guide-visible={guideVisible || undefined}
      aria-label={content.ariaLabel}
    >
      <header className={styles.helpHeader}>
        <span className={styles.helpIdentity}>
          <NetworkSymbol symbolId="master-campus" />
          <strong>{content.siteName}</strong>
        </span>
        <span className={styles.helpSearch} aria-label={content.searchPlaceholder}>
          <SearchIcon />
          <span>{content.searchPlaceholder}</span>
        </span>
        <nav className={styles.helpNavigation} aria-label="Hilfenavigation">
          <span>
            <i aria-hidden="true">
              <HelpPageIcon kind="home" />
            </i>
            {content.navigation[0]}
          </span>
          <span>
            <i aria-hidden="true">
              <HelpPageIcon kind="services" />
            </i>
            {content.navigation[1]}
            <i className={styles.helpNavigationChevron} aria-hidden="true">
              <HelpPageIcon kind="chevron-down" />
            </i>
          </span>
          <span className={styles.helpProfile} aria-label="Profil">
            <HelpPageIcon kind="profile" />
            <i aria-hidden="true">
              <HelpPageIcon kind="chevron-down" />
            </i>
          </span>
        </nav>
      </header>
      <main className={styles.helpMain}>
        <nav className={styles.breadcrumbs} aria-label="Brotkrümelnavigation">
          {content.breadcrumbs.map((item, index) => (
            <span key={item}>
              {item}
              {index < content.breadcrumbs.length - 1 ? (
                <i aria-hidden="true">
                  <HelpPageIcon kind="chevron-right" />
                </i>
              ) : null}
            </span>
          ))}
        </nav>
        <h1>{content.title}</h1>
        <section className={styles.faqCard} aria-label="Fragen und Antworten">
          <div className={styles.faqOpenItem}>
            <div className={styles.faqHeading}>
              <span className={styles.questionMark} aria-hidden="true">
                ?
              </span>
              <h2>{content.locationQuestion}</h2>
              <span className={styles.faqChevron} aria-hidden="true">
                <HelpPageIcon kind="chevron-up" />
              </span>
            </div>
            <div className={styles.faqAnswer}>
              <p className={styles.locationPath}>
                {content.locationPath.map((item, index) => (
                  <span key={item}>
                    {item}
                    {index < content.locationPath.length - 1 ? (
                      <i aria-hidden="true">
                        <HelpPageIcon kind="arrow-right" />
                      </i>
                    ) : null}
                  </span>
                ))}
              </p>
              <p>{content.locationAnswer}</p>
            </div>
          </div>
          <div className={styles.faqClosedItem}>
            <span className={styles.questionMark} aria-hidden="true">
              ?
            </span>
            <div>
              <h2>{content.requirementsQuestion}</h2>
              <p>{content.requirementsAnswer}</p>
            </div>
            <span className={styles.faqChevron} aria-hidden="true">
              <HelpPageIcon kind="chevron-down" />
            </span>
          </div>
        </section>
        <div className={styles.helpFeedback}>
          <span>{content.feedbackQuestion}</span>
          <span>
            <HelpPageIcon kind="thumb-up" />
            {content.positiveFeedback}
          </span>
          <span>
            <HelpPageIcon kind="thumb-down" />
            {content.negativeFeedback}
          </span>
        </div>
      </main>
    </article>
  );
}

type S14BrowserPhase =
  | 'service-variation'
  | 'search-task'
  | 'search-loading'
  | 'search-results'
  | 'help-found'
  | 'free-navigation'
  | Exclude<S14MasterCampusPhase, 'dashboard'>;

function masterCampusPhaseFor(
  phase: S14BrowserPhase,
): S14MasterCampusPhase | null {
  switch (phase) {
    case 'free-navigation':
      return 'dashboard';
    case 'settings':
    case 'security':
    case 'setup-awaiting-scan':
    case 'setup-scanned':
    case 'setup-code-entered':
    case 'mfa-activated':
    case 'login-autofilling':
    case 'second-factor':
    case 'second-factor-code-entered':
    case 'login-success':
    case 'signed-in':
      return phase;
    case 'service-variation':
    case 'search-task':
    case 'search-loading':
    case 'search-results':
    case 'help-found':
      return null;
  }
}

function masterCampusAddress(phase: S14MasterCampusPhase, dashboardAddress: string): string {
  const content = s14MfaContent.browser.masterCampus;
  switch (phase) {
    case 'dashboard':
    case 'login-success':
    case 'signed-in':
      return `${dashboardAddress}/dashboard`;
    case 'settings':
      return `${dashboardAddress}/settings`;
    case 'security':
      return `${dashboardAddress}/settings/security`;
    case 'setup-awaiting-scan':
    case 'setup-scanned':
    case 'setup-code-entered':
    case 'mfa-activated':
      return `${dashboardAddress}/settings/security/2fa`;
    case 'login-autofilling':
      return content.login.address;
    case 'second-factor':
    case 'second-factor-code-entered':
      return content.login.secondFactorAddress;
  }
}

function BrowserLesson({
  activeTabId,
  authenticatorCode,
  displayName,
  onActivateMfa,
  onBrowserClosed,
  onConfirmSecondFactor,
  onNext,
  onOpenHelp,
  onOpenOverview,
  onOpenSecurity,
  onOpenSettings,
  onOpenTwoFactor,
  onScanQrCode,
  onSubmitSearch,
  onTabSelect,
  onUseAuthenticatorCode,
  onSuccessOverlayComplete,
  phase,
  platform,
}: {
  readonly activeTabId: S14BrowserTabId;
  readonly authenticatorCode: string;
  readonly displayName: string;
  readonly onActivateMfa: () => void;
  readonly onBrowserClosed: () => void;
  readonly onConfirmSecondFactor: () => void;
  readonly onNext: () => void;
  readonly onOpenHelp: () => void;
  readonly onOpenOverview: () => void;
  readonly onOpenSecurity: () => void;
  readonly onOpenSettings: () => void;
  readonly onOpenTwoFactor: () => void;
  readonly onScanQrCode: () => void;
  readonly onSubmitSearch: () => void;
  readonly onTabSelect: (tabId: S14BrowserTabId) => void;
  readonly onUseAuthenticatorCode: () => void;
  readonly onSuccessOverlayComplete: () => void;
  readonly phase: S14BrowserPhase;
  readonly platform: DesktopPlatform;
}) {
  const browser = s14MfaContent.browser;
  const masterCampusContent = browser.masterCampus;
  const masterCampus = s01Content.browser.accounts.find(
    ({ id }) => id === browser.masterCampusTab.id,
  );
  if (masterCampus === undefined) return null;

  const masterCampusPhase = masterCampusPhaseFor(phase);
  const navigationFree = phase === 'help-found' || masterCampusPhase !== null;
  const helpVisible = navigationFree;
  const queryVisible = phase !== 'service-variation';
  const searchTabLabel = helpVisible
    ? browser.searchTab.helpLabel
    : queryVisible
      ? browser.searchTab.queryLabel
      : browser.searchTab.label;
  const speech = phase === 'service-variation'
    ? {
        id: 's14-service-variation',
        paragraphs: [s14MfaContent.guide.serviceVariation],
        action: { kind: 'advance' as const, onAction: onNext },
      }
    : phase === 'search-task'
      ? {
          id: 's14-find-availability',
          paragraphs: [s14MfaContent.guide.findAvailability],
        }
      : phase === 'help-found'
        ? { id: 's14-help-found', paragraphs: [s14MfaContent.guide.helpFound] }
        : phase === 'mfa-activated'
          ? {
              id: 's14-mfa-configured',
              paragraphs: s14MfaContent.guide.configured,
              action: { kind: 'advance' as const, onAction: onNext },
            }
          : phase === 'signed-in'
            ? {
                id: 's14-close-after-login',
                paragraphs: [s14MfaContent.guide.closeAfterLogin],
              }
            : null;
  const loginPhase =
    masterCampusPhase === 'login-autofilling' ||
    masterCampusPhase === 'second-factor' ||
    masterCampusPhase === 'second-factor-code-entered' ||
    masterCampusPhase === 'login-success' ||
    masterCampusPhase === 'signed-in';
  const progressCurrent = masterCampusPhase === null
    ? null
    : masterCampusPhase === 'dashboard'
      ? 0
      : masterCampusPhase === 'settings' || masterCampusPhase === 'login-autofilling'
        ? 1
        : masterCampusPhase === 'security' ||
            masterCampusPhase === 'second-factor' ||
            masterCampusPhase === 'second-factor-code-entered'
          ? 2
          : 3;
  const taskComplete =
    masterCampusPhase === 'mfa-activated' ||
    masterCampusPhase === 'login-success' ||
    masterCampusPhase === 'signed-in';
  const guideVisible = speech !== null || masterCampusPhase !== null;
  const dimmed =
    phase === 'service-variation' ||
    phase === 'mfa-activated' ||
    phase === 'signed-in';
  const snapshot: BrowserShellSnapshot = {
    tabs: [
      {
        id: browser.masterCampusTab.id,
        label: browser.masterCampusTab.label,
        icon: <NetworkSymbol symbolId="master-campus" />,
        enabled: navigationFree,
        ...(navigationFree
          ? {}
          : { disabledReason: browser.masterCampusTab.disabledReason }),
      },
      {
        id: browser.searchTab.id,
        label: searchTabLabel,
        icon: <SearchBrandIcon />,
        enabled: navigationFree,
      },
    ],
    activeTabId,
    address:
      activeTabId === browser.masterCampusTab.id
        ? masterCampusPhase === null
          ? `${masterCampus.address}/dashboard`
          : masterCampusAddress(masterCampusPhase, masterCampus.address)
        : helpVisible
          ? browser.searchTab.helpAddress
          : phase === 'search-loading' || phase === 'search-results'
            ? browser.searchTab.resultsAddress
            : browser.searchTab.homeAddress,
    scrollKey:
      activeTabId === browser.masterCampusTab.id
        ? `s14:${activeTabId}:${phase}`
        : `s14:${activeTabId}:${helpVisible ? 'help' : phase}`,
    dimmed,
    ...(phase === 'signed-in'
      ? { allowWindowInteractionWhenDimmed: true }
      : {}),
    ...(phase === 'help-found'
      ? { highlightedTabId: browser.masterCampusTab.id }
      : {}),
    ...(displayName.trim() === '' ? {} : { accountIdentifier: displayName }),
    ...(phase === 'login-autofilling'
      ? {
          passwordManager: {
            label: masterCampusContent.login.automaticStatus,
            active: true,
            interactionEnabled: false,
            icon: 'key' as const,
            statusLabel: masterCampusContent.login.filledStatus,
          },
        }
      : {}),
  };

  return (
    <BrowserShell
      platform={platform}
      variant="artifact"
      snapshot={snapshot}
      ariaLabel={browser.ariaLabel}
      windowCloseEnabled={phase === 'signed-in'}
      onWindowTransitionEnd={(windowState) => {
        if (windowState === 'closed' && phase === 'signed-in') onBrowserClosed();
      }}
      onTabSelect={(tabId) => {
        if (tabId !== 'master-campus' && tabId !== 'mfa-search') return;
        onTabSelect(tabId);
      }}
      layers={{
        passWo: !guideVisible && phase !== 'login-success' ? undefined : (
          <>
            {phase === 'login-success' ? (
              <AccountSuccessOverlay
                label={masterCampusContent.login.successStatus}
                onComplete={onSuccessOverlayComplete}
              />
            ) : null}
            {!guideVisible ? null : (
              <PassWoGuide
                guideName={s14MfaContent.guide.name}
                taskLabel={
                  masterCampusPhase === null
                    ? s14MfaContent.guide.taskLabel
                    : loginPhase
                      ? masterCampusContent.tasks.loginLabel
                      : masterCampusContent.tasks.setupLabel
                }
                {...(progressCurrent === null
                  ? {}
                  : {
                      progress: {
                        current: progressCurrent,
                        total: 3,
                        label: masterCampusContent.tasks.progressLabel(
                          progressCurrent,
                          3,
                        ),
                      },
                    })}
                taskComplete={taskComplete}
                helpOpen={speech !== null}
                helpId="s14-browser-passwo-speech"
                openHelpLabel={s14MfaContent.guide.openHelpLabel}
                speech={speech?.paragraphs ?? []}
                speechKey={speech?.id ?? `s14-${phase}-waiting`}
                speechEmphasis={passWoSpeechEmphasisFor(speech?.id ?? '')}
                {...(speech !== null && 'action' in speech
                  ? { speechAction: speech.action }
                  : {})}
                placement="bottom-left"
                speechPlacement="right"
                showTaskStatusWhenSpeaking={masterCampusPhase !== null}
                showHelpButton={false}
              />
            )}
          </>
        ),
      }}
    >
      {activeTabId === browser.masterCampusTab.id ? (
        masterCampusPhase === null ? null : (
          <S14MasterCampusMfa
            authenticatorCode={authenticatorCode}
            displayName={displayName}
            phase={masterCampusPhase}
            onActivateMfa={onActivateMfa}
            onConfirmSecondFactor={onConfirmSecondFactor}
            onOpenOverview={onOpenOverview}
            onOpenSecurity={onOpenSecurity}
            onOpenSettings={onOpenSettings}
            onOpenTwoFactor={onOpenTwoFactor}
            onScanQrCode={onScanQrCode}
            onUseAuthenticatorCode={onUseAuthenticatorCode}
          />
        )
      ) : helpVisible ? (
        <HelpPage guideVisible={phase === 'help-found'} />
      ) : phase === 'search-loading' || phase === 'search-results' ? (
        <SearchResultsPage
          loading={phase === 'search-loading'}
          onPrimaryResultSelect={onOpenHelp}
        />
      ) : (
        <SearchStartPage
          queryVisible={queryVisible}
          onSubmit={onSubmitSearch}
        />
      )}
    </BrowserShell>
  );
}

function ConceptLabel({
  title,
  abbreviation,
  emphasized = false,
}: {
  readonly title: string;
  readonly abbreviation: string;
  readonly emphasized?: boolean;
}) {
  return (
    <div className={styles.conceptLabel} data-emphasized={emphasized || undefined}>
      <span>{title}</span>
      <strong>{abbreviation}</strong>
    </div>
  );
}

type FactorConceptId = keyof typeof s14MfaContent.concepts;
type FactorConnectionMode = 'all' | 'pairs';

function FactorConnections({ mode }: { readonly mode: FactorConnectionMode }) {
  return (
    <svg
      aria-hidden="true"
      className={styles.factorConnections}
      data-mode={mode}
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
    >
      <g data-factor-id="knowledge">
        <path
          d="M166.67 0 V66 H500 V100"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="166.67" cy="3" r="7" vectorEffect="non-scaling-stroke" />
      </g>
      <g data-factor-id="possession">
        <path
          d="M500 0 V100"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="500" cy="3" r="7" vectorEffect="non-scaling-stroke" />
      </g>
      <g data-factor-id="biometrics">
        <path
          d="M833.33 0 V66 H500 V100"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="833.33" cy="3" r="7" vectorEffect="non-scaling-stroke" />
      </g>
      <circle
        className={styles.factorConnectionHub}
        cx="500"
        cy="97"
        r="8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function FactorBoard({
  activeFactorId,
  combinationCount,
  conceptId,
  connectionMode,
}: {
  readonly activeFactorId: S14FactorId | null;
  readonly combinationCount: number;
  readonly conceptId: FactorConceptId | null;
  readonly connectionMode: FactorConnectionMode | null;
}) {
  const concept = conceptId === null ? null : s14MfaContent.concepts[conceptId];

  return (
    <div
      className={styles.factorArea}
      data-combinations-visible={combinationCount > 0 || undefined}
      data-concept-visible={concept !== null || undefined}
    >
      <div className={styles.factorGrid} data-s14-factors>
        {s14MfaContent.factors.map((factor) => (
          <section
            className={styles.factorCard}
            data-active={activeFactorId === factor.id || undefined}
            aria-current={activeFactorId === factor.id ? 'step' : undefined}
            key={factor.id}
          >
            <h2>{factor.title}</h2>
            <ul>
              {factor.items.map((item) => (
                <li key={item.id}>
                  <span className={styles.factorIcon}>
                    <FactorIcon iconId={item.iconId} />
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className={styles.factorConnectionSlot}>
        {connectionMode === null ? null : (
          <FactorConnections mode={connectionMode} />
        )}
      </div>
      <div className={styles.factorConceptSlot}>
        {concept === null ? null : (
          <div
            key={conceptId}
            className={styles.factorConcept}
            data-concept-id={conceptId}
            data-s14-concepts
          >
            <ConceptLabel
              title={concept.title}
              abbreviation={concept.abbreviation}
              emphasized={conceptId === 'twoFactor'}
            />
          </div>
        )}
        {combinationCount > 0 ? (
          <ol
            className={styles.combinations}
            data-s14-combinations
            aria-label="Beispiele für Faktor-Kombinationen"
            aria-live="polite"
          >
            {s14MfaContent.combinations
              .slice(0, combinationCount)
              .map((combination) => (
                <li data-valid={combination.valid} key={combination.id}>
                  <span>{combination.label}</span>
                  <strong
                    role="img"
                    aria-label={
                      combination.valid
                        ? 'gültige Kombination: unterschiedliche Faktoren'
                        : 'ungültige Kombination: derselbe Faktor'
                    }
                  >
                    {combination.valid ? '✓' : '✗'}
                  </strong>
                </li>
              ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}

function motionDurations() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    ...s14MfaContent.timings,
    authenticatorCodeCount:
      s14MfaContent.browser.masterCampus.authenticator.codes.length,
    ...(reducedMotion
      ? {
          cleanDesktopDurationMs: 0,
          combinationRevealDurationMs: 0,
          loginAutofillDurationMs: 0,
          searchResultsDelayMs: 0,
        }
      : {}),
  };
}

export function S14MfaIntroduction({
  displayName = '',
  onComplete,
  platform = 'mac',
}: {
  readonly displayName?: string;
  readonly onComplete?: (() => void) | undefined;
  readonly platform?: DesktopPlatform;
}) {
  const [state, send] = useMachine(s14MfaIntroductionMachine, {
    input: motionDurations(),
  });
  const browserPhase: S14BrowserPhase | null = state.matches(
    'browserServiceVariation',
  )
    ? 'service-variation'
    : state.matches('browserSearchTask')
      ? 'search-task'
      : state.matches('searchLoading')
        ? 'search-loading'
        : state.matches('searchResults')
          ? 'search-results'
          : state.matches('helpFound')
            ? 'help-found'
            : state.matches('freeNavigation')
              ? 'free-navigation'
              : state.matches('settings')
                ? 'settings'
                : state.matches('security')
                  ? 'security'
                  : state.matches('mfaSetupAwaitingScan')
                    ? 'setup-awaiting-scan'
                    : state.matches('mfaSetupScanned')
                      ? 'setup-scanned'
                      : state.matches('mfaSetupCodeEntered')
                        ? 'setup-code-entered'
                        : state.matches('mfaActivated')
                          ? 'mfa-activated'
                          : state.matches('loginAutofilling')
                            ? 'login-autofilling'
                            : state.matches('secondFactor')
                              ? 'second-factor'
                              : state.matches('secondFactorCodeEntered')
                                ? 'second-factor-code-entered'
                                : state.matches('loginSuccess')
                                  ? 'login-success'
                                  : state.matches('signedIn')
                                    ? 'signed-in'
                                    : null;
  const browserVisible = browserPhase !== null;
  const mfaVisible =
    state.matches('mfa') ||
    state.matches('twoFactor') ||
    state.matches('knowledge') ||
    state.matches('possession') ||
    state.matches('biometrics') ||
    state.matches('firstCombination') ||
    state.matches('secondCombination') ||
    state.matches('thirdCombination') ||
    state.matches('distinctFactors');
  const conceptId: FactorConceptId | null = state.matches('mfa')
    ? 'mfa'
    : state.matches('twoFactor')
      ? 'twoFactor'
      : null;
  const connectionMode: FactorConnectionMode | null = state.matches('mfa')
    ? 'all'
    : state.matches('twoFactor')
      ? 'pairs'
      : null;
  const activeFactorId: S14FactorId | null = state.matches('knowledge')
    ? 'knowledge'
    : state.matches('possession')
      ? 'possession'
      : state.matches('biometrics')
      ? 'biometrics'
      : null;
  const combinationCount = state.matches('firstCombination')
    ? 1
    : state.matches('secondCombination')
      ? 2
      : state.matches('thirdCombination') || state.matches('distinctFactors')
        ? 3
        : 0;
  const speech = state.matches('mfa')
    ? { id: 's14-mfa', text: s14MfaContent.guide.mfa }
    : state.matches('twoFactor')
      ? { id: 's14-two-factor', text: s14MfaContent.guide.twoFactor }
      : state.matches('knowledge')
        ? { id: 's14-factor-knowledge', text: s14MfaContent.guide.factors.knowledge }
        : state.matches('possession')
          ? { id: 's14-factor-possession', text: s14MfaContent.guide.factors.possession }
          : state.matches('biometrics')
            ? { id: 's14-factor-biometrics', text: s14MfaContent.guide.factors.biometrics }
            : state.matches('distinctFactors')
              ? { id: 's14-distinct-factors', text: s14MfaContent.guide.distinct }
              : null;
  const authenticatorCodes = s14MfaContent.browser.masterCampus.authenticator.codes;
  const authenticatorCode =
    authenticatorCodes[state.context.authenticatorCodeIndex] ??
    authenticatorCodes[0] ??
    '000000';

  if (browserVisible) {
    return (
      <section
        className={styles.training}
        data-awaiting-browser-close={browserPhase === 'signed-in' || undefined}
        aria-label={s14MfaContent.trainingAriaLabel}
      >
        <BrowserLesson
          activeTabId={state.context.activeTabId}
          authenticatorCode={authenticatorCode}
          displayName={displayName}
          phase={browserPhase}
          platform={platform}
          onNext={() => send({ type: 'NEXT' })}
          onOpenHelp={() => send({ type: 'OPEN_HELP' })}
          onOpenOverview={() => send({ type: 'OPEN_OVERVIEW' })}
          onOpenSettings={() => send({ type: 'OPEN_SETTINGS' })}
          onOpenSecurity={() => send({ type: 'OPEN_SECURITY' })}
          onOpenTwoFactor={() => send({ type: 'OPEN_TWO_FACTOR' })}
          onScanQrCode={() => send({ type: 'SCAN_QR_CODE' })}
          onUseAuthenticatorCode={() => send({ type: 'USE_AUTHENTICATOR_CODE' })}
          onActivateMfa={() => send({ type: 'ACTIVATE_MFA' })}
          onConfirmSecondFactor={() => send({ type: 'CONFIRM_SECOND_FACTOR' })}
          onSuccessOverlayComplete={() => send({ type: 'SUCCESS_OVERLAY_COMPLETE' })}
          onBrowserClosed={() => {
            send({ type: 'BROWSER_CLOSED' });
            onComplete?.();
          }}
          onSubmitSearch={() => send({ type: 'SUBMIT_SEARCH' })}
          onTabSelect={(tabId) => send({ type: 'SELECT_TAB', tabId })}
        />
      </section>
    );
  }

  return (
    <section className={styles.training} aria-label={s14MfaContent.trainingAriaLabel}>
      <DesktopSurface
        platform={platform}
        browserDock={{
          active: false,
          enabled: false,
          label: 'Browser geschlossen',
        }}
      >
        {mfaVisible ? (
          <div className={styles.lessonViewport}>
            <section
              className={styles.conceptBoard}
              data-factors-visible="true"
              aria-label="MFA und Faktorarten"
            >
              <FactorBoard
                activeFactorId={activeFactorId}
                combinationCount={combinationCount}
                conceptId={conceptId}
                connectionMode={connectionMode}
              />
            </section>
          </div>
        ) : null}
        {speech === null ? null : (
          <div className={styles.guideLayer}>
            <PassWoGuide
              guideName={s14MfaContent.guide.name}
              taskLabel={s14MfaContent.guide.taskLabel}
              helpOpen
              helpId="s14-passwo-speech"
              openHelpLabel={s14MfaContent.guide.openHelpLabel}
              speech={[speech.text]}
              speechKey={speech.id}
              speechEmphasis={passWoSpeechEmphasisFor(speech.id)}
              speechObstacleSelector="[data-s14-concepts], [data-s14-factors], [data-s14-combinations]"
              speechAction={{
                kind: 'advance',
                onAction: () => send({ type: 'NEXT' }),
              }}
              placement="bottom-left"
              showHelpButton={false}
            />
          </div>
        )}
      </DesktopSurface>
    </section>
  );
}
