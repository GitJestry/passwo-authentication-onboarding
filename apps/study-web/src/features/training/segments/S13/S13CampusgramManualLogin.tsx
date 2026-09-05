import type { SupportiveS08ResumeState } from '@passwo/contracts';
import {
  resolvePredefinedPassphrase,
  s13PasswordManagerPracticeContent,
} from '@passwo/training-content';
import { deriveCampusIdentity } from '@passwo/training-engine';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { useMachine } from '@xstate/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { AccountSuccessOverlay } from '../../AccountSuccessOverlay.js';
import { CampusWebsiteBackdrop } from '../../CampusWebsiteBackdrop.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { PasswordVisibilityIcon } from '../../PasswordVisibilityIcon.js';
import { SimulatedPasteButton } from '../../SimulatedPasteButton.js';
import { SimulatedPasswordInput } from '../../SimulatedPasswordInput.js';
import { MyShopAppIcon, PasswordManagerKeyIcon } from './S13PasswordManagerPractice.js';
import {
  type S13CampusgramSettingsPage,
  type S13CampusgramTabId,
  s13CampusgramManualLoginMachine,
} from './S13CampusgramManualLoginMachine.js';
import styles from './S13CampusgramManualLogin.module.css';

interface PasswordManagerEntry {
  readonly id: string;
  readonly label: string;
  readonly password: string;
  readonly symbolId: string;
  readonly username: string;
}

interface CopyFeedback {
  readonly entryId: string;
  readonly sequence: number;
}

function isCampusgramTabId(tabId: string): tabId is S13CampusgramTabId {
  return (
    tabId === 'campusgram' ||
    tabId === 'browser-settings' ||
    tabId === 'browser-password-manager'
  );
}

type LineIconKind =
  | 'account'
  | 'alerts'
  | 'download'
  | 'folder'
  | 'globe'
  | 'help'
  | 'history'
  | 'monitor'
  | 'notes'
  | 'payment'
  | 'puzzle'
  | 'shield'
  | 'tab';

function LineIcon({ kind }: { readonly kind: LineIconKind }) {
  const paths = (() => {
    switch (kind) {
      case 'account':
        return <><circle cx="12" cy="8" r="3.2" /><path d="M5.4 20c.4-4.2 2.7-6.4 6.6-6.4s6.2 2.2 6.6 6.4" /></>;
      case 'alerts':
        return <><path d="M5.2 17.2h13.6l-2-2.8v-4.1a4.8 4.8 0 0 0-9.6 0v4.1l-2 2.8Z" /><path d="M10.2 19.2c.5.8 1.1 1.2 1.8 1.2s1.3-.4 1.8-1.2" /></>;
      case 'download':
        return <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M5 19h14" /></>;
      case 'folder':
        return <path d="M3.5 6.5h6l2 2H20.5v10h-17v-12Z" />;
      case 'globe':
        return <><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17M12 3c2.3 2.5 3.4 5.5 3.4 9S14.3 18.5 12 21M12 3C9.7 5.5 8.6 8.5 8.6 12S9.7 18.5 12 21" /></>;
      case 'help':
        return <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.6 2.6 0 1 1 3.3 2.5c-.7.3-.9.8-.9 1.6v.3M12 17.6h.01" /></>;
      case 'history':
        return <><path d="M4.5 7.5V3.8m0 0h3.7M4.5 3.8A9 9 0 1 1 3 14" /><path d="M12 7.2v5l3.2 1.8" /></>;
      case 'monitor':
        return <><rect x="3" y="4.5" width="18" height="12.5" rx="1.8" /><path d="M8.5 20h7M12 17v3" /></>;
      case 'notes':
        return <><path d="M5 3.5h14v17H5v-17Z" /><path d="M8 8h8M8 12h8M8 16h5" /></>;
      case 'payment':
        return <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 15h4" /></>;
      case 'puzzle':
        return <path d="M9.5 3.5h5v3a2.5 2.5 0 1 1 0 5v3h-3a2.5 2.5 0 1 1-5 0h-3v-5h3a2.5 2.5 0 1 1 5 0h3" />;
      case 'shield':
        return <path d="M12 3 19 6v5c0 4.2-2.8 7.7-7 10-4.2-2.3-7-5.8-7-10V6l7-3Zm-3 9 2 2 4-4" />;
      case 'tab':
        return <><path d="M4 5h16v14H4V5Z" /><path d="M4 9h16M7 7h.01" /></>;
    }
  })();
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}

function SettingsNavigationIcon({ id }: { readonly id: string }) {
  if (id === 'general') return <NetworkSymbol symbolId="settings" />;
  if (id === 'passwords') return <PasswordManagerKeyIcon />;
  if (id === 'privacy') return <LineIcon kind="shield" />;
  if (id === 'language') return <LineIcon kind="globe" />;
  if (id === 'appearance') return <LineIcon kind="monitor" />;
  if (id === 'extensions') return <LineIcon kind="puzzle" />;
  if (id === 'help') return <LineIcon kind="help" />;
  return <LineIcon kind="account" />;
}

function GeneralSettingIcon({ index }: { readonly index: number }) {
  if (index === 0) return <NetworkSymbol symbolId="campus-workspace" />;
  if (index === 1) return <LineIcon kind="tab" />;
  if (index === 2) return <LineIcon kind="download" />;
  if (index === 3) return <LineIcon kind="alerts" />;
  return <LineIcon kind="monitor" />;
}

function PasswordManagerNavigationIcon({ id }: { readonly id: string }) {
  if (id === 'all') return <PasswordManagerKeyIcon />;
  if (id === 'checkup') return <LineIcon kind="shield" />;
  if (id === 'alerts') return <LineIcon kind="alerts" />;
  if (id === 'notes') return <LineIcon kind="notes" />;
  if (id === 'payments') return <LineIcon kind="payment" />;
  if (id === 'folders') return <LineIcon kind="folder" />;
  return <NetworkSymbol symbolId="settings" />;
}

function BrowserMenuItemIcon({ id }: { readonly id: string }) {
  if (id === 'new-tab') return <LineIcon kind="tab" />;
  if (id === 'history') return <LineIcon kind="history" />;
  if (id === 'downloads') return <LineIcon kind="download" />;
  if (id === 'password-manager') return <PasswordManagerKeyIcon />;
  if (id === 'settings') return <NetworkSymbol symbolId="settings" />;
  return <LineIcon kind="help" />;
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="5.6" />
      <path d="m14.8 14.8 4.5 4.5" />
    </svg>
  );
}

function PasswordManagerEntryMark({ entry }: { readonly entry: PasswordManagerEntry }) {
  if (entry.symbolId !== 'account') return <NetworkSymbol symbolId={entry.symbolId} />;
  const initial = Array.from(entry.label)[0] ?? '•';
  const tone = (entry.label.codePointAt(0) ?? 0) % 6;
  return (
    <span className={styles.serviceMonogram} data-tone={tone} aria-hidden="true">
      {initial.toLocaleUpperCase('de-DE')}
    </span>
  );
}

function SettingsPage({
  page,
  onOpenPasswordManager,
  onPageSelect,
}: {
  readonly page: S13CampusgramSettingsPage;
  readonly onOpenPasswordManager: () => void;
  readonly onPageSelect: (page: S13CampusgramSettingsPage) => void;
}) {
  const content = s13PasswordManagerPracticeContent.campusgram.settings;
  return (
    <main className={styles.settingsPage}>
      <aside className={styles.settingsSidebar}>
        <nav aria-label={content.navigationLabel}>
          {content.navigation.map((item) => {
            const interactive = item.id === 'general' || item.id === 'passwords';
            const itemContent = (
              <>
                <span className={styles.settingsNavigationIcon} aria-hidden="true">
                  <SettingsNavigationIcon id={item.id} />
                </span>
                <span>{item.label}</span>
              </>
            );
            return interactive ? (
              <button
                key={item.id}
                type="button"
                data-active={page === item.id || undefined}
                aria-current={page === item.id ? 'page' : undefined}
                onClick={() => onPageSelect(item.id)}
              >
                {itemContent}
              </button>
            ) : (
              <div key={item.id}>{itemContent}</div>
            );
          })}
        </nav>
      </aside>
      <section className={styles.settingsMain}>
        {page === 'general' ? (
          <>
            <header className={styles.settingsHeading}>
              <span aria-hidden="true"><NetworkSymbol symbolId="settings" /></span>
              <h1>{content.general.title}</h1>
            </header>
            <div className={styles.generalSettingsList}>
              {content.general.items.map((item, index) => (
                <div key={item.title}>
                  <span className={styles.settingCardIcon} aria-hidden="true">
                    <GeneralSettingIcon index={index} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className={styles.settingValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <header className={styles.settingsHeading}>
              <span aria-hidden="true"><PasswordManagerKeyIcon /></span>
              <h1>{content.passwords.title}</h1>
            </header>
            <div className={styles.passwordSettingsList}>
              {content.passwords.options.map((option) => (
                <div key={option.title}>
                  <span>
                    <strong>{option.title}</strong>
                    <small>{option.detail}</small>
                  </span>
                  <span
                    className={styles.staticToggle}
                    role="img"
                    aria-label={content.activeStatus}
                  >
                    <span />
                  </span>
                </div>
              ))}
              <button
                type="button"
                className={styles.openPasswordManager}
                onClick={onOpenPasswordManager}
              >
                <span className={styles.settingCardIcon} aria-hidden="true">
                  <PasswordManagerKeyIcon />
                </span>
                <span>
                  <strong>{content.passwords.openManagerAction}</strong>
                  <small>{content.passwords.openManagerDetail}</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            </div>
            <section className={styles.passwordInformation}>
              <span aria-hidden="true"><NetworkSymbol symbolId="shield" /></span>
              <span>
                <strong>{content.passwords.informationTitle}</strong>
                <small>{content.passwords.informationDetail}</small>
              </span>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function PasswordManagerPage({
  entries,
  onPasswordCopy,
}: {
  readonly entries: readonly PasswordManagerEntry[];
  readonly onPasswordCopy: (entry: PasswordManagerEntry) => void;
}) {
  const content = s13PasswordManagerPracticeContent.campusgram.passwordManager;
  const [query, setQuery] = useState('');
  const [revealedEntryIds, setRevealedEntryIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('de-DE');
  const filteredEntries = entries.filter((entry) =>
    normalizedQuery.length === 0
      ? true
      : `${entry.label} ${entry.username}`.toLocaleLowerCase('de-DE').includes(normalizedQuery),
  );

  function toggleVisibility(entryId: string): void {
    setRevealedEntryIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  }

  function copyEntry(entry: PasswordManagerEntry): void {
    setCopyFeedback((current) => ({
      entryId: entry.id,
      sequence: (current?.sequence ?? 0) + 1,
    }));
    onPasswordCopy(entry);
  }

  return (
    <main className={styles.passwordManagerPage}>
      <aside className={styles.passwordManagerSidebar}>
        <nav aria-label={content.navigationLabel}>
          {content.navigation.map((item, index) => (
            <div key={item.label} data-active={index === 0 || undefined}>
              <span aria-hidden="true">
                <PasswordManagerNavigationIcon id={item.id} />
              </span>
              <span>{item.label}</span>
              {item.detail.length === 0 ? null : <small>{item.detail}</small>}
            </div>
          ))}
        </nav>
      </aside>
      <section className={styles.passwordManagerMain}>
        <header className={styles.passwordManagerHeading}>
          <div>
            <span aria-hidden="true"><PasswordManagerKeyIcon /></span>
            <h1>{content.title}</h1>
          </div>
          <label className={styles.passwordSearch}>
            <span className={styles.screenReaderOnly}>{content.searchLabel}</span>
            <SearchIcon />
            <input
              type="search"
              value={query}
              placeholder={content.searchPlaceholder}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
        </header>
        <div className={styles.passwordTableFrame}>
          <table>
            <thead>
              <tr>
                <th scope="col">{content.columns.account}</th>
                <th scope="col">{content.columns.username}</th>
                <th scope="col">{content.columns.password}</th>
                <th scope="col">{content.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const revealed = revealedEntryIds.has(entry.id);
                const copied = copyFeedback?.entryId === entry.id;
                const maskedPassword = '••••••••••••••';
                return (
                  <tr key={entry.id}>
                    <td>
                      <span className={styles.entryIdentity}>
                        <span aria-hidden="true"><PasswordManagerEntryMark entry={entry} /></span>
                        <strong>{entry.label}</strong>
                      </span>
                    </td>
                    <td><span className={styles.cellEllipsis} title={entry.username}>{entry.username}</span></td>
                    <td>
                      <span className={styles.passwordCell}>
                        <code
                          data-training-clipboard-sensitive
                          title={revealed ? entry.password : undefined}
                        >
                          {revealed ? entry.password : maskedPassword}
                        </code>
                        <button
                          type="button"
                          aria-pressed={revealed}
                          aria-label={
                            revealed
                              ? content.hidePassword(entry.label)
                              : content.showPassword(entry.label)
                          }
                          onClick={() => toggleVisibility(entry.id)}
                        >
                          <PasswordVisibilityIcon revealed={revealed} />
                        </button>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.copyEntryButton}
                        aria-label={
                          copied
                            ? `${content.copiedStatus}: ${entry.label}`
                            : content.copyPassword(entry.label)
                        }
                        data-copied={copied || undefined}
                        data-copy-animation={
                          copied ? copyFeedback.sequence % 2 : undefined
                        }
                        onAnimationEnd={(event) => {
                          if (event.target !== event.currentTarget) return;
                          setCopyFeedback((current) =>
                            current?.entryId === entry.id ? null : current,
                          );
                        }}
                        onClick={() => copyEntry(entry)}
                      >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        <span aria-live="polite">
                          {copied ? content.copiedStatus : content.copyAction}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function CampusgramLogin({
  clipboardAvailable,
  email,
  failedLoginAttempts,
  loginError,
  passwordValue,
  passwordRevealed,
  onInsert,
  onLogin,
  onPasswordChange,
  onPasswordFocus,
  onPasswordVisibilityToggle,
}: {
  readonly clipboardAvailable: boolean;
  readonly email: string;
  readonly failedLoginAttempts: number;
  readonly loginError: string | null;
  readonly passwordValue: string;
  readonly passwordRevealed: boolean;
  readonly onInsert: () => void;
  readonly onLogin: () => void;
  readonly onPasswordChange: (value: string) => void;
  readonly onPasswordFocus: () => void;
  readonly onPasswordVisibilityToggle: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.campusgram.website;
  const entryId = useId();
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  return (
    <CampusWebsiteBackdrop
      accountId="campusgram"
      interactionLabel={content.interactionLabel}
      view="authentication"
      authenticationTitle={content.loginTitle}
    >
      <form
        className={styles.campusgramLoginCard}
        autoComplete="off"
        data-form-type="other"
        data-invalid={loginError !== null || undefined}
        data-invalid-animation={
          loginError === null ? undefined : failedLoginAttempts % 2
        }
        onSubmit={(event) => {
          event.preventDefault();
          if (passwordValue.length > 0) onLogin();
        }}
      >
        <label htmlFor={`${entryId}-account`}>{content.emailLabel}</label>
        <input
          id={`${entryId}-account`}
          name="passwo-simulated-account"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          readOnly
          value={email}
        />
        <label htmlFor={entryId}>{content.passwordLabel}</label>
        <span className={styles.campusgramPasswordControl}>
          <SimulatedPasswordInput
            ref={passwordInputRef}
            id={entryId}
            masked={!passwordRevealed}
            value={passwordValue}
            placeholder={content.passwordPlaceholder}
            aria-invalid={loginError !== null || undefined}
            aria-describedby={loginError === null ? undefined : `${entryId}-error`}
            onFocus={onPasswordFocus}
            onClick={onPasswordFocus}
            onChange={(event) => onPasswordChange(event.currentTarget.value)}
          />
          <button
            type="button"
            className={styles.campusgramVisibility}
            disabled={passwordValue.length === 0}
            aria-pressed={passwordRevealed}
            aria-label={
              passwordRevealed ? content.hidePasswordLabel : content.showPasswordLabel
            }
            onClick={onPasswordVisibilityToggle}
          >
            <PasswordVisibilityIcon revealed={passwordRevealed} />
          </button>
          {clipboardAvailable ? (
            <SimulatedPasteButton
              centered
              label={content.insertAction}
              onClick={() => {
                onInsert();
                requestAnimationFrame(() => passwordInputRef.current?.focus());
              }}
            />
          ) : null}
        </span>
        {loginError === null ? null : (
          <p id={`${entryId}-error`} className={styles.loginError} role="alert">
            <span aria-hidden="true">!</span>
            {loginError}
          </p>
        )}
        <button
          type="submit"
          className={styles.campusgramLoginAction}
          disabled={passwordValue.length === 0}
        >
          {content.loginAction}
        </button>
      </form>
    </CampusWebsiteBackdrop>
  );
}

const defaultPassphraseIds = {
  campusgram: 'passphrase-01-hyphen',
  masterCampus: 'passphrase-02-hyphen',
  campusEmail: 'passphrase-03-hyphen',
} as const satisfies SupportiveS08ResumeState['passphraseIds'];

const fillUnavailableDelayMs = 3_000;

export function S13CampusgramManualLogin({
  displayName = '',
  passphraseIds = defaultPassphraseIds,
  platform,
  onComplete,
}: {
  readonly displayName?: string;
  readonly passphraseIds?: SupportiveS08ResumeState['passphraseIds'];
  readonly platform: DesktopPlatform;
  readonly onComplete: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.campusgram;
  const identity = useMemo(() => deriveCampusIdentity(displayName), [displayName]);
  const campusgramPassword = resolvePredefinedPassphrase(passphraseIds.campusgram);
  const [state, send] = useMachine(s13CampusgramManualLoginMachine, {
    input: {
      correctPassword: campusgramPassword,
      fillUnavailableDelayMs,
    },
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [successOverlayVisible, setSuccessOverlayVisible] = useState(false);
  const signedIn = state.matches('signedIn');
  const fillUnavailable = state.matches('fillUnavailable');
  const copyInstruction = state.matches('copyInstruction');
  const clipboardAvailable = state.context.clipboardPassword !== null;

  useEffect(() => {
    if (signedIn) setSuccessOverlayVisible(true);
  }, [signedIn]);

  const entries = useMemo<readonly PasswordManagerEntry[]>(() => {
    const knownValues = {
      campusgram: {
        username: identity.masterCampus,
        password: campusgramPassword,
      },
      'master-campus': {
        username: identity.masterCampus,
        password: resolvePredefinedPassphrase(passphraseIds.masterCampus),
      },
      'campus-email': {
        username: identity.campusEmail,
        password: resolvePredefinedPassphrase(passphraseIds.campusEmail),
      },
      'muster-bank': {
        username: identity.campusgram,
        password: s13PasswordManagerPracticeContent.bank.passwordManager.generatedPassword,
      },
      'my-shop': {
        username: identity.masterCampus,
        password: s13PasswordManagerPracticeContent.passwordManager.generatedPassword,
      },
    } satisfies Readonly<
      Record<
        (typeof content.passwordManager.knownAccounts)[number]['id'],
        Pick<PasswordManagerEntry, 'password' | 'username'>
      >
    >;
    const knownEntries = content.passwordManager.knownAccounts.map(
      (account): PasswordManagerEntry => ({ ...account, ...knownValues[account.id] }),
    );
    const neutralEntries = content.passwordManager.additionalAccounts.map(
      (label, index): PasswordManagerEntry => ({
        id: `example-account-${index + 1}`,
        label,
        username: content.passwordManager.additionalUsername(index),
        password: content.passwordManager.additionalPassword(index, label),
        symbolId: 'account',
      }),
    );
    return [...knownEntries, ...neutralEntries];
  }, [campusgramPassword, content.passwordManager.additionalAccounts, identity, passphraseIds]);

  const activeTabId = state.context.activeTabId;
  const tabs: BrowserShellSnapshot['tabs'] = [
    {
      id: s13PasswordManagerPracticeContent.browser.tabId,
      label: s13PasswordManagerPracticeContent.browser.tabLabel,
      icon: <MyShopAppIcon compact idSuffix="campusgram-browser-tab" />,
    },
    {
      id: s13PasswordManagerPracticeContent.bank.browser.tabId,
      label: s13PasswordManagerPracticeContent.bank.browser.tabLabel,
      icon: <NetworkSymbol symbolId="muster-bank" />,
    },
    {
      id: content.browser.tabs.campusgram.id,
      label: content.browser.tabs.campusgram.label,
      icon: <NetworkSymbol symbolId="campusgram" />,
      enabled: true,
    },
    ...(state.context.settingsTabOpen
      ? [
          {
            id: content.browser.tabs.settings.id,
            label: content.browser.tabs.settings.label,
            icon: <NetworkSymbol symbolId="settings" />,
            enabled: true,
          },
        ]
      : []),
    ...(state.context.passwordManagerTabOpen
      ? [
          {
            id: content.browser.tabs.passwordManager.id,
            label: content.browser.tabs.passwordManager.label,
            icon: <PasswordManagerKeyIcon />,
            enabled: true,
          },
        ]
      : []),
  ];
  const address =
    activeTabId === 'browser-password-manager'
      ? content.browser.addresses.passwordManager
      : activeTabId === 'browser-settings'
        ? state.context.settingsPage === 'general'
          ? content.browser.addresses.settingsGeneral
          : content.browser.addresses.settingsPasswords
        : signedIn
          ? content.browser.addresses.campusgramDashboard
          : content.browser.addresses.campusgram;
  const browserSnapshot: BrowserShellSnapshot = {
    tabs,
    activeTabId,
    address,
    accountIdentifier: identity.campusgram,
    scrollKey: `s13-campusgram:${activeTabId}:${state.context.settingsPage}`,
    menu: {
      label: content.browser.menu.label,
      open: menuOpen,
      highlighted: copyInstruction,
      interactionEnabled: (copyInstruction || state.matches('browsing')) && !signedIn,
      items: [
        {
          id: 'new-tab',
          label: content.browser.menu.newTabAction,
          icon: <BrowserMenuItemIcon id="new-tab" />,
          shortcut: content.browser.menu.newTabShortcut,
          separatorAfter: true,
        },
        {
          id: 'history',
          label: content.browser.menu.historyAction,
          icon: <BrowserMenuItemIcon id="history" />,
          trailingIndicator: 'arrow',
        },
        {
          id: 'downloads',
          label: content.browser.menu.downloadsAction,
          icon: <BrowserMenuItemIcon id="downloads" />,
          shortcut: content.browser.menu.downloadsShortcut,
        },
        {
          id: 'password-manager',
          label: content.browser.menu.passwordManagerAction,
          icon: <BrowserMenuItemIcon id="password-manager" />,
          interactionEnabled: true,
        },
        {
          id: 'settings',
          label: content.browser.menu.settingsAction,
          icon: <BrowserMenuItemIcon id="settings" />,
          interactionEnabled: true,
          separatorAfter: true,
        },
        {
          id: 'help',
          label: content.browser.menu.helpAction,
          icon: <BrowserMenuItemIcon id="help" />,
          trailingIndicator: 'arrow',
        },
      ],
    },
  };

  function selectTab(tabId: string): void {
    if (!isCampusgramTabId(tabId)) return;
    setMenuOpen(false);
    send({ type: 'SELECT_TAB', tabId });
  }

  return (
    <section className={styles.training} aria-label={content.trainingAriaLabel}>
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={content.browser.ariaLabel}
        windowOpen
        windowCloseEnabled={false}
        onTabSelect={selectTab}
        onMenuOpenChange={setMenuOpen}
        onMenuItemSelect={(itemId) => {
          setMenuOpen(false);
          if (itemId === 'settings') send({ type: 'OPEN_SETTINGS' });
          if (itemId === 'password-manager') send({ type: 'OPEN_PASSWORD_MANAGER' });
        }}
        layers={{
          passWo: fillUnavailable ? (
            <PassWoGuide
              guideName={s13PasswordManagerPracticeContent.guide.name}
              taskLabel={content.guide.taskLabel}
              helpOpen
              helpId="s13-campusgram-autofill-unavailable"
              openHelpLabel="PassWo-Hinweis öffnen"
              speech={[content.guide.fillUnavailable]}
              speechKey="s13-campusgram-autofill-unavailable"
              speechEmphasis={passWoSpeechEmphasisFor(
                's13-campusgram-autofill-unavailable',
              )}
              speechAction={{
                kind: 'advance',
                label: 'Weiter',
                onAction: () => send({ type: 'CONTINUE_FILL_EXPLANATION' }),
              }}
              placement="bottom-left"
              showHelpButton={false}
            />
          ) : copyInstruction ? (
            <PassWoGuide
              guideName={s13PasswordManagerPracticeContent.guide.name}
              taskLabel={content.guide.taskLabel}
              helpOpen
              helpId="s13-campusgram-copy-instruction"
              openHelpLabel="PassWo-Hinweis öffnen"
              speech={[content.guide.copyInstruction]}
              speechKey="s13-campusgram-copy-instruction"
              speechEmphasis={passWoSpeechEmphasisFor('s13-campusgram-copy-instruction')}
              placement="bottom-left"
              showHelpButton={false}
            />
          ) : signedIn ? (
            <>
              {successOverlayVisible ? (
                <AccountSuccessOverlay
                  label={content.website.signedInStatus}
                  onComplete={() => setSuccessOverlayVisible(false)}
                />
              ) : null}
              <PassWoGuide
                guideName={s13PasswordManagerPracticeContent.guide.name}
                taskLabel={content.guide.taskLabel}
                taskComplete
                helpOpen
                helpId="s13-campusgram-complete"
                openHelpLabel="PassWo-Hinweis öffnen"
                speech={[content.guide.complete]}
                speechKey="s13-campusgram-complete"
                speechEmphasis={passWoSpeechEmphasisFor('s13-campusgram-complete')}
                speechAction={{ kind: 'advance', label: 'Weiter', onAction: onComplete }}
                placement="bottom-left"
                showHelpButton={false}
              />
            </>
          ) : undefined,
        }}
      >
        {activeTabId === 'browser-settings' ? (
          <SettingsPage
            page={state.context.settingsPage}
            onPageSelect={(page) => send({ type: 'OPEN_SETTINGS_PAGE', page })}
            onOpenPasswordManager={() => send({ type: 'OPEN_PASSWORD_MANAGER' })}
          />
        ) : activeTabId === 'browser-password-manager' ? (
          <PasswordManagerPage
            entries={entries}
            onPasswordCopy={(entry) => send({ type: 'COPY_PASSWORD', value: entry.password })}
          />
        ) : signedIn ? (
          <CampusWebsiteBackdrop
            accountId="campusgram"
            interactionLabel={content.website.dashboardInteractionLabel}
            view="dashboard"
            displayName={displayName}
          />
        ) : (
          <CampusgramLogin
            clipboardAvailable={clipboardAvailable}
            email={identity.masterCampus}
            failedLoginAttempts={state.context.failedLoginAttempts}
            loginError={
              state.context.loginErrorVisible
                ? s13PasswordManagerPracticeContent.website.incorrectPassword
                : null
            }
            passwordValue={state.context.passwordValue}
            passwordRevealed={passwordRevealed}
            onPasswordFocus={() => send({ type: 'PASSWORD_FIELD_FOCUSED' })}
            onInsert={() => {
              setPasswordRevealed(false);
              send({ type: 'INSERT_PASSWORD' });
            }}
            onLogin={() => send({ type: 'LOGIN' })}
            onPasswordChange={(value) => {
              if (value.length === 0) setPasswordRevealed(false);
              send({ type: 'EDIT_PASSWORD', value });
            }}
            onPasswordVisibilityToggle={() =>
              setPasswordRevealed((revealed) => !revealed)
            }
          />
        )}
      </BrowserShell>
    </section>
  );
}
