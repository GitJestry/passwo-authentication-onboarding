import {
  s00Content,
  s01Content,
  s04Content,
  s07PassphraseSearchContent,
  type S01AccountId,
} from '@passwo/training-content';
import { useMachine } from '@xstate/react';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { useState } from 'react';
import blueShieldAsset from '../../../../assets/s05/password-factor-shield.png';
import greenShieldAsset from '../../../../assets/s06/comparison-path-shield.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { CampusgramIncidentNotice } from '../../CampusgramIncidentNotice.js';
import { CelebrationConfetti } from '../../CelebrationConfetti.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import {
  type S07AccountFeedback,
  s07PassphraseSearchMachine,
} from './S07PassphraseSearchMachine.js';
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

function SearchField({
  interactive = false,
  onSubmit,
}: {
  readonly interactive?: boolean;
  readonly onSubmit?: () => void;
}) {
  const searchPage = s07PassphraseSearchContent.browser.searchPage;

  return (
    <div className={styles.searchField} role="search" aria-label="Fiktive Suche">
      <span>{searchPage.query}</span>
      <span className={styles.clearQuery} aria-hidden="true">
        ×
      </span>
      {interactive ? (
        <button
          type="button"
          className={styles.searchSubmit}
          data-guided-highlight="true"
          aria-label={searchPage.submitLabel}
          onClick={onSubmit}
        >
          <SearchIcon />
        </button>
      ) : (
        <span className={styles.searchFieldIcon} aria-hidden="true">
          <SearchIcon />
        </span>
      )}
    </div>
  );
}

function SearchLandingPage({ onSubmit }: { readonly onSubmit: () => void }) {
  const searchPage = s07PassphraseSearchContent.browser.searchPage;

  return (
    <main className={styles.searchLandingPage} aria-label={searchPage.landingAriaLabel}>
      <div className={styles.searchLandingContent}>
        <span className={`${styles.searchBrand} ${styles.searchLandingBrand}`}>
          <SearchBrandIcon />
          <span className={styles.searchWordmark}>{searchPage.brand}</span>
        </span>
        <SearchField interactive onSubmit={onSubmit} />
      </div>
    </main>
  );
}

function SearchResultsLoading() {
  const searchPage = s07PassphraseSearchContent.browser.searchPage;

  return (
    <main
      className={`${styles.searchMain} ${styles.searchResultsLoading}`}
      aria-label={searchPage.resultsLoadingLabel}
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.searchLoadingIndicator} aria-hidden="true">
        <SearchIcon />
      </span>
      <span className={styles.visuallyHidden}>{searchPage.resultsLoadingLabel}</span>
    </main>
  );
}

function SearchPage({
  loading,
  onPrimaryResultSelect,
}: {
  readonly loading: boolean;
  readonly onPrimaryResultSelect: () => void;
}) {
  const searchPage = s07PassphraseSearchContent.browser.searchPage;

  return (
    <div className={styles.searchPage} aria-label={searchPage.ariaLabel}>
      <header className={styles.searchHeader}>
        <div className={styles.searchTopRow}>
          <span className={styles.searchBrand}>
            <SearchBrandIcon />
            <span className={styles.searchWordmark}>{searchPage.brand}</span>
          </span>
          <SearchField />
        </div>
        <nav className={styles.searchNavigation} aria-label="Suchkategorien">
          {searchPage.navigation.map((item, index) => (
            <span key={item} className={index === 0 ? styles.activeSearchNavigationItem : undefined}>
              {item}
            </span>
          ))}
        </nav>
      </header>

      {loading ? (
        <SearchResultsLoading />
      ) : (
        <main className={styles.searchMain}>
          <ol className={styles.resultsList}>
            {searchPage.results.map((result, index) => {
              const isPrimary = result.id === searchPage.primaryResultId;
              if (isPrimary) {
                return (
                  <li key={result.id} className={styles.primaryResultItem}>
                    <button
                      type="button"
                      className={styles.primaryResult}
                      data-guided-highlight="true"
                      onClick={onPrimaryResultSelect}
                    >
                      <div className={styles.resultSource}>
                        <span className={styles.resultFavicon} aria-hidden="true">
                          <GeneratorBrandMark />
                        </span>
                        <span>
                          <strong>{result.siteName}</strong>
                          <small>{result.domain}</small>
                        </span>
                        <span className={styles.resultMenu} aria-hidden="true">
                          ⋮
                        </span>
                      </div>
                      <span className={styles.primaryResultTitle}>{result.title}</span>
                      <p>{result.description}</p>
                    </button>
                  </li>
                );
              }

              return (
                <li key={result.id} className={styles.searchResult}>
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
                  <span className={styles.resultLink}>{result.title}</span>
                  <p>{result.description}</p>
                  {index === 2 ? (
                    <section
                      className={styles.peopleAlsoAsk}
                      aria-labelledby="people-also-ask-title"
                    >
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
      )}

      {!loading ? (
        <footer className={styles.searchFooter}>
          <div>{searchPage.footerLocation}</div>
          <nav aria-label="Informationen zur fiktiven Suche">
            {searchPage.footerLinks.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </nav>
        </footer>
      ) : null}
    </div>
  );
}

interface GeneratorPageProps {
  readonly allowCopy: boolean;
  readonly allowGenerate: boolean;
  readonly allowSeparatorChange: boolean;
  readonly copied: boolean;
  readonly generating: boolean;
  readonly generateHighlighted: boolean;
  readonly guideVisible: boolean;
  readonly onCopy: (
    passphrase: string,
    point: { readonly x: number; readonly y: number },
  ) => void;
  readonly onGenerate: () => void;
  readonly onSeparatorChange: (separator: string) => void;
  readonly passphraseIndex: number | null;
  readonly separator: string;
  readonly toastPoint: { readonly x: number; readonly y: number } | null;
}

function GeneratorPage({
  allowCopy,
  allowGenerate,
  allowSeparatorChange,
  copied,
  generating,
  generateHighlighted,
  guideVisible,
  onCopy,
  onGenerate,
  onSeparatorChange,
  passphraseIndex,
  separator,
  toastPoint,
}: GeneratorPageProps) {
  const page = s07PassphraseSearchContent.browser.generatorPage;
  const selectedPassphrase =
    passphraseIndex === null
      ? null
      : (page.passphrases[passphraseIndex] ?? page.passphrases[0]);
  const passphrase = selectedPassphrase?.words.join(separator) ?? '';

  return (
    <div
      className={styles.generatorPage}
      data-guide-visible={guideVisible || undefined}
      aria-label={page.ariaLabel}
    >
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
        <div className={styles.generatorWorkspace} data-passwo-speech-obstacle>
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
                      disabled={!allowSeparatorChange}
                      onChange={() => onSeparatorChange(option.value)}
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
              data-guided-highlight={generateHighlighted || undefined}
              disabled={!allowGenerate || generating}
              onClick={onGenerate}
            >
              <span aria-hidden="true">↻</span>
              {page.generate}
            </button>

            <div className={styles.generatorOutputGroup}>
              <output
                className={styles.generatorOutput}
                data-training-clipboard-sensitive
                aria-label={page.outputAriaLabel}
                aria-live="polite"
                aria-busy={generating}
              >
                {generating ? (
                  <span className={styles.generatorLoadingIndicator} aria-hidden="true" />
                ) : (
                  passphrase
                )}
              </output>
            </div>

            <button
              type="button"
              className={styles.copyButton}
              disabled={!allowCopy || passphrase.length === 0 || copied}
              onClick={(event) =>
                onCopy(passphrase, { x: event.clientX, y: event.clientY })
              }
            >
              <span className={styles.copyButtonIcon} aria-hidden="true" />
              {page.copy}
            </button>
            {copied && toastPoint !== null ? (
              <span
                className={styles.copyToast}
                role="status"
                style={{ left: toastPoint.x, top: toastPoint.y }}
              >
                <span aria-hidden="true">✓</span>
                {page.copied}
              </span>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

export interface S07PassphraseSearchTrainingProps {
  readonly displayName: string;
  readonly campusgramPassword: string;
  readonly accountFeedback?: readonly S07AccountFeedback[];
  readonly platform?: DesktopPlatform;
  readonly onComplete?: () => void;
}

function accountLabel(accountId: S01AccountId): string {
  return s01Content.browser.accounts.find(({ id }) => id === accountId)?.label ?? accountId;
}

function connectionLabel(accountIds: readonly S01AccountId[]): string {
  return accountIds
    .map((accountId) =>
      accountId === 'campusgram'
        ? 'deinem alten Campusgram-Passwort'
        : `dem Passwort von ${accountLabel(accountId)}`,
    )
    .join(' und ');
}

export function S07PassphraseSearchTraining({
  displayName,
  campusgramPassword,
  accountFeedback = [],
  platform = 'mac',
  onComplete = () => undefined,
}: S07PassphraseSearchTrainingProps) {
  const [activeTabId, setActiveTabId] = useState<S07TabId>('campusgram');
  const [copyToastPoint, setCopyToastPoint] = useState<{
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const [passphraseOrder] = useState(() =>
    s07PassphraseSearchContent.browser.generatorPage.passphrases.map((_, index) => index),
  );
  const [state, send] = useMachine(s07PassphraseSearchMachine, {
    input: {
      generationDelayMs: s07PassphraseSearchContent.browser.generatorPage.generationDelayMs,
      passphraseOrder,
      accountFeedback,
      resultsDelayMs: s07PassphraseSearchContent.browser.searchPage.resultsDelayMs,
    },
  });
  const activeAccount = s01Content.browser.accounts.find(({ id }) => id === activeTabId);
  const searchTab = s07PassphraseSearchContent.browser.searchTab;
  const generatorPage = s07PassphraseSearchContent.browser.generatorPage;
  const guide = s07PassphraseSearchContent.guide;
  const searchTabOpen = !(
    state.matches('incident') ||
    state.matches('campusgramMethodIntro') ||
    state.matches('campusgramRandomnessIntro') ||
    state.matches('campusgramSearchIntro')
  );
  const searchView = state.matches('searchLanding')
    ? 'landing'
    : state.matches('searchLoading')
      ? 'loading'
      : state.matches('searchResults')
        ? 'results'
        : 'generator';
  const campusgramChangeOpen =
    activeTabId === 'campusgram' &&
    (state.matches('campusgramMethodIntro') ||
      state.matches('campusgramRandomnessIntro') ||
      state.matches('campusgramSearchIntro') ||
      state.matches('pasteNewPassword') ||
      state.matches('pasteConfirmedPassword') ||
      state.matches('passwordChangeReady') ||
      state.matches('campusgramSuccess') ||
      state.matches('remainingRisk') ||
      state.matches('remainingPlan'));
  const generating = state.matches('generating') || state.matches('regenerating');
  const mnemonicVisible = state.matches('mnemonic');
  const copied = state.matches('copiedCampusgram');
  const allowGeneratorControls =
    state.matches('generatorReady') || state.matches('mnemonic');

  function tabEnabled(tabId: S07TabId): boolean {
    if (state.matches('copiedCampusgram')) return tabId === 'campusgram';
    return false;
  }

  let speech: readonly string[] | null = null;
  let speechId = '';
  let speechAction: { readonly kind: 'advance'; readonly onAction: () => void } | {
    readonly kind: 'perform';
    readonly label: string;
    readonly onAction: () => void;
  } | undefined;
  if (state.matches('campusgramMethodIntro')) {
    speech = [guide.methodIntro];
    speechId = 's07-method-intro';
  }
  if (state.matches('campusgramRandomnessIntro')) {
    speech = [guide.randomnessIntro];
    speechId = 's07-randomness-intro';
  }
  if (state.matches('campusgramSearchIntro')) {
    speech = [guide.searchIntro];
    speechId = 's07-search-intro';
  }
  if (generating) speech = [guide.generating];
  if (state.matches('mnemonicIntro')) speech = [guide.mnemonicIntro];
  if (state.matches('mnemonic')) {
    const selected =
      state.context.currentPassphraseIndex === null
        ? undefined
        : generatorPage.passphrases[state.context.currentPassphraseIndex];
    speech = selected === undefined ? null : [guide.mnemonic(selected.passWoMnemonic)];
    speechId = 's07-mnemonic';
  }
  if (state.matches('campusgramSuccess')) speech = [guide.campusgramSuccess];
  if (state.matches('remainingRisk')) {
    speech = state.context.accountFeedback.map((feedback) => {
      const label = accountLabel(feedback.accountId);
      const connection = connectionLabel(feedback.connectionAccountIds);
      if (feedback.kind === 'strong-similar') {
        return guide.accountFeedback.strongSimilar(label, connection);
      }
      if (feedback.kind === 'unique-guessable') {
        return guide.accountFeedback.uniqueGuessable(label);
      }
      return guide.accountFeedback.similarGuessable(label, connection);
    });
  }
  if (state.matches('remainingPlan')) {
    speech = [
      state.context.accountFeedback.length === 0
        ? guide.allAccountsProtected
        : guide.remainingPlan,
    ];
  }

  if (
    state.matches('campusgramMethodIntro') ||
    state.matches('campusgramRandomnessIntro') ||
    state.matches('mnemonicIntro') ||
    state.matches('campusgramSuccess') ||
    state.matches('remainingRisk')
  ) {
    speechAction = {
      kind: 'advance',
      onAction: () => send({ type: 'NEXT' }),
    };
  }
  if (state.matches('remainingPlan')) {
    speechAction = {
      kind: 'perform',
      label:
        state.context.accountFeedback.length === 0
          ? guide.finishAttack
          : guide.continueAttack,
      onAction: () => {
        send({ type: 'CONTINUE_ATTACK' });
        onComplete();
      },
    };
  }

  const snapshot: BrowserShellSnapshot = {
    tabs: [
      ...s01Content.browser.accounts.map((account) => ({
        id: account.id,
        label:
          account.id === 'campusgram' && campusgramChangeOpen
            ? `${account.label} · ${s04Content.notice.passwordChange.tabLabel}`
            : account.label,
        icon: <NetworkSymbol symbolId={account.symbolId} />,
        enabled: tabEnabled(account.id),
        ...(account.id === 'campusgram' && state.matches('incident')
          ? { status: 'danger' as const }
          : {}),
      })),
      ...(searchTabOpen
        ? [
            {
              id: searchTab.id,
              label: state.matches('searchLanding') ? searchTab.landingLabel : searchTab.label,
              icon: <SearchBrandIcon />,
              enabled: tabEnabled(searchTab.id),
            },
          ]
        : []),
    ],
    activeTabId,
    address:
      activeAccount?.id === 'campusgram' && campusgramChangeOpen
        ? s04Content.notice.passwordChange.address
        : activeAccount === undefined
        ? searchView === 'generator'
          ? generatorPage.address
          : searchView === 'landing'
            ? searchTab.homeAddress
            : searchTab.address
        : `${activeAccount.address}/dashboard`,
    scrollKey: `s07:${activeTabId}:${
      activeAccount?.id === 'campusgram' && campusgramChangeOpen
        ? 'password-change'
        : activeAccount === undefined
          ? searchView
          : 'dashboard'
    }`,
    dimmed:
      state.matches('campusgramMethodIntro') ||
      state.matches('campusgramRandomnessIntro') ||
      state.matches('campusgramSearchIntro'),
    allowTabInteractionWhenDimmed: state.matches('campusgramSearchIntro'),
    highlightNewTab: state.matches('campusgramSearchIntro'),
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
        windowOpen
        onTabSelect={(tabId) => {
          if (!isS07TabId(tabId)) return;
          setActiveTabId(tabId);
          send({ type: 'SELECT_TAB', tabId });
        }}
        layers={{
          passWo:
            speech === null ? undefined : (
              <PassWoGuide
                guideName={s00Content.narration.guideName}
                taskLabel={guide.taskLabel}
                helpOpen
                helpId="s07-passwo-speech"
                openHelpLabel={s00Content.narration.openGuideLabel}
                speech={speech}
                speechKey={`s07-${String(state.value)}-${String(state.context.currentPassphraseIndex)}`}
                speechEmphasis={passWoSpeechEmphasisFor(speechId)}
                {...(generating
                  ? {
                      speechFooter: (
                        <span className={styles.generationSpeechLoader} aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      ),
                    }
                  : {})}
                {...(speechAction === undefined ? {} : { speechAction })}
                placement="bottom-left"
                speechPlacement="right"
                showHelpButton={false}
              />
            ),
        }}
        {...(state.matches('campusgramSearchIntro')
          ? {
              onNewTab: () => {
                setActiveTabId(searchTab.id);
                send({ type: 'OPEN_SEARCH_TAB' });
              },
            }
          : {})}
      >
        {activeAccount === undefined ? (
          searchView === 'generator' ? (
            <GeneratorPage
              allowCopy={mnemonicVisible}
              allowGenerate={allowGeneratorControls && state.can({ type: 'GENERATE' })}
              allowSeparatorChange={allowGeneratorControls}
              copied={copied}
              generating={generating}
              generateHighlighted={state.matches('generatorReady')}
              guideVisible={speech !== null}
              onCopy={(passphrase, point) => {
                setCopyToastPoint(point);
                send({ type: 'COPY', passphrase });
              }}
              onGenerate={() => send({ type: 'GENERATE' })}
              onSeparatorChange={(separator) =>
                send({ type: 'CHANGE_SEPARATOR', separator })
              }
              passphraseIndex={generating ? null : state.context.currentPassphraseIndex}
              separator={state.context.separator}
              toastPoint={copyToastPoint}
            />
          ) : searchView === 'landing' ? (
            <SearchLandingPage onSubmit={() => send({ type: 'SUBMIT_SEARCH' })} />
          ) : (
            <SearchPage
              loading={searchView === 'loading'}
              onPrimaryResultSelect={() => send({ type: 'OPEN_GENERATOR' })}
            />
          )
        ) : (
          <div className={styles.accountPage}>
            <CampusWebsiteBackdrop
              accountId={activeAccount.id}
              interactionLabel={`${activeAccount.label}, angemeldet`}
              view="dashboard"
              displayName={displayName}
              dashboardNotice={
                activeAccount.id === 'campusgram' ? (
                  <CampusgramIncidentNotice
                    className={state.matches('incident') ? styles.incidentSpotlight : undefined}
                    currentPassword={campusgramPassword}
                    passwordChangeOpen={campusgramChangeOpen}
                    onPasswordChangeOpenChange={(open) => {
                      if (open) send({ type: 'OPEN_CAMPUSGRAM_CHANGE' });
                    }}
                    simulatedClipboardValue={state.context.copiedPassword}
                    simulatedPasteLabel={generatorPage.paste}
                    completedCopy={
                      s07PassphraseSearchContent.browser.campusgramPasswordChangeCompleted
                    }
                    passwordChangeTitle={
                      s07PassphraseSearchContent.browser.passwordChangeTitle
                    }
                    allowFreePasswordInput={false}
                    guidedPasteTarget={
                      state.matches('pasteNewPassword')
                        ? 'new'
                        : state.matches('pasteConfirmedPassword')
                          ? 'confirm'
                          : null
                    }
                    guidedSubmit={state.matches('passwordChangeReady')}
                    highlightGuidedActions={false}
                    centerSimulatedPaste
                    pasteOnPasswordFieldClick
                    completedVisual={
                      <>
                        <span className={styles.completedShields}>
                          <span className={styles.completedShield}>
                            <span className={styles.completedShieldLabelGreen}>
                              {
                                s07PassphraseSearchContent.browser
                                  .campusgramPasswordChangeCompleted.shieldLabels.green
                              }
                            </span>
                            <img src={greenShieldAsset} alt="" />
                          </span>
                          <span className={styles.completedShield}>
                            <span className={styles.completedShieldLabelBlue}>
                              {
                                s07PassphraseSearchContent.browser
                                  .campusgramPasswordChangeCompleted.shieldLabels.blue
                              }
                            </span>
                            <img src={blueShieldAsset} alt="" />
                          </span>
                        </span>
                        <CelebrationConfetti />
                      </>
                    }
                    completedVisualClassName={styles.completedShieldVisual}
                    showBackAction={false}
                    showCompletedAction={false}
                    onSimulatedPaste={(target) =>
                      send({ type: target === 'new' ? 'PASTE_NEW' : 'PASTE_CONFIRM' })
                    }
                    onPasswordChangeSubmitted={() =>
                      send({ type: 'SUBMIT_PASSWORD_CHANGE' })
                    }
                  />
                ) : undefined
              }
            />
          </div>
        )}
      </BrowserShell>
    </section>
  );
}
