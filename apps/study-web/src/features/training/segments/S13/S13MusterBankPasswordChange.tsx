import { s13PasswordManagerPracticeContent } from '@passwo/training-content';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
} from '@passwo/ui';
import { deriveCampusIdentity } from '@passwo/training-engine';
import { useMachine } from '@xstate/react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { AccountSuccessOverlay } from '../../AccountSuccessOverlay.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { PasswordVisibilityIcon } from '../../PasswordVisibilityIcon.js';
import sharedStyles from './S13PasswordManagerPractice.module.css';
import {
  MyShopAppIcon,
  PasswordManagerKeyIcon,
} from './S13PasswordManagerPractice.js';
import {
  type S13BankAutofillEntryId,
  type S13BankNavigationPage,
  type S13BankPage,
  s13MusterBankPasswordChangeMachine,
} from './S13MusterBankPasswordChangeMachine.js';
import { usePasswordManagerAutofill } from './usePasswordManagerAutofill.js';
import styles from './S13MusterBankPasswordChange.module.css';

function MusterBankMark({ compact = false }: { readonly compact?: boolean }) {
  return (
    <span
      className={styles.bankMark}
      data-compact={compact || undefined}
      aria-hidden="true"
    >
      <NetworkSymbol symbolId="muster-bank" />
    </span>
  );
}

function MusterBankBrand({ compact = false }: { readonly compact?: boolean }) {
  const content = s13PasswordManagerPracticeContent.bank;
  return (
    <span className={styles.bankBrand} data-compact={compact || undefined}>
      <MusterBankMark compact={compact} />
      <strong>{content.website.name}</strong>
    </span>
  );
}

function MusterBankNavigationBrand() {
  const content = s13PasswordManagerPracticeContent.bank.website;
  return (
    <span className={styles.bankNavigationBrand} role="img" aria-label={content.name}>
      <MusterBankMark />
    </span>
  );
}

function BankNavigationIcon({ page }: { readonly page: S13BankNavigationPage }) {
  if (page === 'overview') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="m3.5 11 8.5-7 8.5 7M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />
      </svg>
    );
  }
  if (page === 'accounts') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="M3.5 9h17M7 14h4" />
      </svg>
    );
  }
  if (page === 'transfers') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" />
      </svg>
    );
  }
  if (page === 'cards') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 14h3" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M9.6 3.5h4.8l.5 2a7 7 0 0 1 1.5.9l2-.6 2.4 4.1-1.5 1.4a7 7 0 0 1 0 1.8l1.5 1.4-2.4 4.1-2-.6a7 7 0 0 1-1.5.9l-.5 2H9.6l-.5-2a7 7 0 0 1-1.5-.9l-2 .6-2.4-4.1 1.5-1.4a7 7 0 0 1 0-1.8L3.2 9.9l2.4-4.1 2 .6a7 7 0 0 1 1.5-.9l.5-2Z" />
      <circle cx="12" cy="12.2" r="3" />
    </svg>
  );
}

function PasswordControl({
  id,
  value,
  label,
  revealed,
  readOnly,
  assisted = false,
  onSelect,
  onChange,
  onToggle,
}: {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly revealed: boolean;
  readonly readOnly: boolean;
  readonly assisted?: boolean;
  readonly onSelect?: () => void;
  readonly onChange?: (value: string) => void;
  readonly onToggle: () => void;
}) {
  const visibilityContent = s13PasswordManagerPracticeContent.website;
  return (
    <span className={styles.passwordControl} data-assisted={assisted || undefined}>
      <input
        id={id}
        type={revealed ? 'text' : 'password'}
        value={value}
        autoComplete="off"
        spellCheck={false}
        readOnly={readOnly}
        aria-label={label}
        onClick={onSelect}
        onFocus={onSelect}
        onChange={(event) => onChange?.(event.currentTarget.value)}
      />
      <button
        type="button"
        aria-label={
          revealed
            ? visibilityContent.hidePasswordLabel
            : visibilityContent.showPasswordLabel
        }
        aria-pressed={revealed}
        onClick={onToggle}
      >
        <PasswordVisibilityIcon revealed={revealed} />
      </button>
    </span>
  );
}

interface BankAutofillEntry {
  readonly id: S13BankAutofillEntryId;
  readonly label: string;
  readonly identifier: string;
  readonly password: string;
}

type BankLoginField = 'username' | 'password';

function BankAutofillList({
  entries,
  onSelect,
}: {
  readonly entries: readonly BankAutofillEntry[];
  readonly onSelect: (entry: BankAutofillEntry) => void;
}) {
  const content = s13PasswordManagerPracticeContent.bank;
  return (
    <div
      className={`${sharedStyles.autofillList} ${styles.bankAutofillList}`}
      role="listbox"
      aria-label={content.passwordManager.autofillListLabel}
    >
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={`${sharedStyles.storedEntry} ${styles.bankStoredEntry}`}
          role="option"
          aria-label={`${entry.label}, ${entry.identifier}`}
          onClick={() => onSelect(entry)}
        >
          {entry.id === 'muster-bank' ? (
            <MusterBankMark />
          ) : (
            <span className={sharedStyles.storedEntryMark} aria-hidden="true">
              <NetworkSymbol symbolId={entry.id} />
            </span>
          )}
          <span>
            <strong>{entry.label}</strong>
            <small>{entry.identifier}</small>
            <code>{content.passwordManager.maskedPassword}</code>
          </span>
        </button>
      ))}
    </div>
  );
}

function BankAutofillPreview({ entry }: { readonly entry: BankAutofillEntry }) {
  const content = s13PasswordManagerPracticeContent.bank;
  return (
    <div
      className={`${sharedStyles.autofillList} ${styles.bankAutofillList}`}
      role="status"
      aria-label={content.passwordManager.storedEntryLabel}
    >
      <span className={`${sharedStyles.storedEntry} ${styles.bankStoredEntryPreview}`}>
        <MusterBankMark />
        <span>
          <strong>{entry.label}</strong>
          <small>{entry.identifier}</small>
          <code>{content.passwordManager.maskedPassword}</code>
        </span>
      </span>
    </div>
  );
}

function focusMovedOutside(container: HTMLElement, nextTarget: EventTarget | null): boolean {
  return !(nextTarget instanceof Node) || !container.contains(nextTarget);
}

function BankLogin({
  username,
  password,
  offerVisible,
  autofillAnchor,
  automaticEntry,
  entries,
  autofilling,
  ready,
  invalid,
  failedLoginAttempts,
  passwordRevealed,
  onLoginFieldSelect,
  onUsernameChange,
  onPasswordChange,
  onOfferDismiss,
  onStoredEntrySelect,
  onPasswordVisibilityToggle,
  onLogin,
}: {
  readonly username: string;
  readonly password: string;
  readonly offerVisible: boolean;
  readonly autofillAnchor: BankLoginField | null;
  readonly automaticEntry: BankAutofillEntry | null;
  readonly entries: readonly BankAutofillEntry[];
  readonly autofilling: boolean;
  readonly ready: boolean;
  readonly invalid: boolean;
  readonly failedLoginAttempts: number;
  readonly passwordRevealed: boolean;
  readonly onLoginFieldSelect: (field: BankLoginField) => void;
  readonly onUsernameChange: (value: string) => void;
  readonly onPasswordChange: (value: string) => void;
  readonly onOfferDismiss: () => void;
  readonly onStoredEntrySelect: (entry: BankAutofillEntry) => void;
  readonly onPasswordVisibilityToggle: () => void;
  readonly onLogin: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.bank;
  return (
    <main className={styles.bankLoginPage}>
      <section className={styles.bankLoginPanel}>
        <MusterBankBrand />
        <form
          className={styles.bankLoginCard}
          data-invalid={invalid || undefined}
          data-invalid-animation={invalid ? failedLoginAttempts % 2 : undefined}
          aria-label={content.website.loginTitle}
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) onLogin();
          }}
        >
          <h1>{content.website.loginTitle}</h1>
          <label htmlFor="s13-bank-login-username">{content.website.usernameLabel}</label>
          <div
            className={styles.bankLoginUsername}
            onBlur={(event) => {
              if (focusMovedOutside(event.currentTarget, event.relatedTarget)) {
                onOfferDismiss();
              }
            }}
          >
            <input
              id="s13-bank-login-username"
              type="text"
              autoComplete="off"
              value={username}
              readOnly={autofilling}
              data-assisted={username.length > 0 || undefined}
              onClick={() => onLoginFieldSelect('username')}
              onFocus={() => onLoginFieldSelect('username')}
              onChange={(event) => onUsernameChange(event.currentTarget.value)}
            />
            {offerVisible && autofillAnchor === 'username' ? (
              <BankAutofillList entries={entries} onSelect={onStoredEntrySelect} />
            ) : null}
          </div>
          <label htmlFor="s13-bank-login-password">{content.website.passwordLabel}</label>
          <div
            className={styles.bankLoginPassword}
            onBlur={(event) => {
              if (focusMovedOutside(event.currentTarget, event.relatedTarget)) {
                onOfferDismiss();
              }
            }}
          >
            <PasswordControl
              id="s13-bank-login-password"
              value={password}
              label={content.website.passwordLabel}
              revealed={passwordRevealed}
              readOnly={autofilling}
              assisted={password.length > 0}
              onSelect={() => onLoginFieldSelect('password')}
              onChange={onPasswordChange}
              onToggle={onPasswordVisibilityToggle}
            />
            {offerVisible && autofillAnchor === 'password' ? (
              <BankAutofillList entries={entries} onSelect={onStoredEntrySelect} />
            ) : automaticEntry === null ? null : (
              <BankAutofillPreview entry={automaticEntry} />
            )}
            {invalid ? (
              <p className={styles.loginError} role="alert">
                <span aria-hidden="true">!</span>
                {content.website.incorrectPassword}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className={styles.bankPrimaryAction}
            disabled={!ready || autofilling}
          >
            {content.website.loginAction}
          </button>
        </form>
      </section>
    </main>
  );
}

function PageHeading({ title, detail }: { readonly title: string; readonly detail?: string }) {
  return (
    <header className={styles.pageHeading}>
      <h1>{title}</h1>
      {detail === undefined ? null : <p>{detail}</p>}
    </header>
  );
}

function BankOverview({ username }: { readonly username: string }) {
  const content = s13PasswordManagerPracticeContent.bank.website;
  return (
    <>
      <PageHeading title={content.welcomeTitle(username)} detail={content.welcomeDetail} />
      <div className={styles.overviewGrid}>
        <article className={styles.bankSummaryCard}>
          <span>{content.overview.balanceTitle}</span>
          <strong>{content.hiddenValue}</strong>
          <small>{content.overview.allAccountsLabel}</small>
        </article>
        <article className={styles.bankSummaryCard}>
          <span>{content.overview.accountsTitle}</span>
          <strong>{content.overview.accountCountLabel}</strong>
          <small>{content.maskedAccountNumber}</small>
        </article>
        <article className={`${styles.bankSummaryCard} ${styles.activityCard}`}>
          <div className={styles.activityHeading}>
            <span>{content.overview.activityTitle}</span>
            <small>{content.overview.activityPlaceholder}</small>
          </div>
          <div className={styles.activityRows}>
            {content.overview.activityGroups.map((group) => (
              <span key={group}>
                <strong>{group}</strong>
                <i aria-hidden="true">••••••</i>
                <small>{content.hiddenValue}</small>
              </span>
            ))}
          </div>
        </article>
        <article className={`${styles.bankSummaryCard} ${styles.privacyCard}`}>
          <span className={styles.privacyIcon} aria-hidden="true">✓</span>
          <div>
            <strong>{content.overview.privacyTitle}</strong>
            <small>{content.overview.privacyDetail}</small>
          </div>
        </article>
      </div>
      <section className={styles.quickActions} aria-labelledby="s13-bank-quick-actions">
        <h2 id="s13-bank-quick-actions">{content.overview.quickActionsTitle}</h2>
        <div>
          {content.overview.quickActions.map((action, index) => (
            <article key={action.title}>
              <span aria-hidden="true">{index + 1}</span>
              <strong>{action.title}</strong>
              <small>{action.detail}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function BankAccounts() {
  const content = s13PasswordManagerPracticeContent.bank.website;
  return (
    <>
      <PageHeading title={content.accounts.title} detail={content.accounts.detail} />
      <div className={styles.accountList}>
        {content.accounts.items.map((item, index) => (
          <article key={item.title}>
            <span className={styles.accountItemIcon} data-tone={index} aria-hidden="true">
              <BankNavigationIcon page="accounts" />
            </span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
              <small>
                {content.accounts.accountNumberLabel}: {content.maskedAccountNumber}
              </small>
            </span>
            <span className={styles.maskedAmount}>
              <strong>{content.maskedBalance}</strong>
              <small>{content.accounts.availableLabel}</small>
              <i>{item.status}</i>
            </span>
          </article>
        ))}
      </div>
    </>
  );
}

function BankTransfers() {
  const content = s13PasswordManagerPracticeContent.bank.website;
  return (
    <>
      <PageHeading title={content.transfers.title} detail={content.transfers.detail} />
      <div className={styles.transferGrid}>
        <article>
          <h2>{content.transfers.sectionTitle}</h2>
          <div className={styles.maskedTransferFields} aria-label={content.transfers.placeholder}>
            <span>{content.transfers.sourceAccountLabel}</span>
            <strong>{content.maskedAccountNumber}</strong>
            <span>{content.transfers.recipientLabel}</span>
            <strong>{content.transfers.maskedRecipient}</strong>
            <span>{content.transfers.ibanLabel}</span><strong>{content.maskedAccountNumber}</strong>
            <span>{content.transfers.amountLabel}</span><strong>{content.maskedBalance}</strong>
            <span>{content.transfers.purposeLabel}</span>
            <strong>••••••••••••••••</strong>
          </div>
          <p>{content.transfers.placeholder}</p>
          <span className={styles.transferAction}>{content.transfers.reviewAction}</span>
        </article>
        <div className={styles.transferSideCards}>
          <article>
            <h2>{content.transfers.templatesTitle}</h2>
            <p>{content.transfers.templatesDetail}</p>
            <div className={styles.templateRows} aria-hidden="true">
              <span /><span /><span />
            </div>
          </article>
          <article>
            <h2>{content.transfers.scheduledTitle}</h2>
            <p>{content.transfers.scheduledDetail}</p>
            <strong className={styles.hiddenSchedule}>{content.hiddenValue}</strong>
          </article>
        </div>
      </div>
    </>
  );
}

function BankCards() {
  const content = s13PasswordManagerPracticeContent.bank.website;
  return (
    <>
      <PageHeading title={content.cards.title} detail={content.cards.detail} />
      <div className={styles.cardList}>
        {content.cards.items.map((item, index) => (
          <article key={item.title}>
            <div className={styles.bankCardVisual} data-tone={index}>
              <MusterBankBrand compact />
              <span
                className={styles.cleanCardMark}
                aria-label={content.cards.neutralLogoLabel}
              >
                MB
              </span>
              <code>{content.cards.cardNumber}</code>
            </div>
            <div className={styles.cardDetails}>
              <h2>{item.title}</h2>
              <span>{content.cards.limitLabel}</span>
              <strong>{content.hiddenValue}</strong>
              <small>{content.cards.hiddenDetails}</small>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function SettingsItem({
  title,
  detail,
  action,
  highlighted = false,
}: {
  readonly title: string;
  readonly detail: string;
  readonly action?: (() => void) | undefined;
  readonly highlighted?: boolean;
}) {
  const body = (
    <>
      <span className={styles.settingsIcon} aria-hidden="true">
        <NetworkSymbol symbolId="settings" />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <span aria-hidden="true">›</span>
    </>
  );
  return action === undefined ? (
    <div className={styles.settingsItem} data-highlighted={highlighted || undefined}>
      {body}
    </div>
  ) : (
    <button
      type="button"
      className={styles.settingsItem}
      data-highlighted={highlighted || undefined}
      onClick={action}
    >
      {body}
    </button>
  );
}

function BankSettings({ onOpenSecurity }: { readonly onOpenSecurity: () => void }) {
  const content = s13PasswordManagerPracticeContent.bank.website.settings;
  return (
    <>
      <PageHeading title={content.title} />
      <div className={styles.settingsList}>
        {content.items.map((item) => (
          <SettingsItem
            key={item.id}
            title={item.title}
            detail={item.detail}
            highlighted={item.id === 'security'}
            {...(item.id === 'security' ? { action: onOpenSecurity } : {})}
          />
        ))}
      </div>
    </>
  );
}

function BankSecurity({
  onOpenSettings,
  onOpenPassword,
}: {
  readonly onOpenSettings: () => void;
  readonly onOpenPassword: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.bank.website.settings;
  return (
    <>
      <nav
        className={styles.breadcrumbs}
        aria-label={`${content.title}: ${content.securityTitle}`}
      >
        <button type="button" onClick={onOpenSettings}>
          {content.title}
        </button>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{content.securityTitle}</span>
      </nav>
      <PageHeading title={content.securityTitle} />
      <div className={styles.settingsList}>
        {content.securityItems.map((item) => (
          <SettingsItem
            key={item.id}
            title={item.title}
            detail={item.detail}
            highlighted={item.id === 'password'}
            {...(item.id === 'password' ? { action: onOpenPassword } : {})}
          />
        ))}
      </div>
    </>
  );
}

function BankPasswordChange({
  newPassword,
  suggestionVisible,
  suggestionField,
  changing,
  currentPasswordRevealed,
  newPasswordRevealed,
  confirmedPasswordRevealed,
  onCurrentPasswordVisibilityToggle,
  onNewPasswordVisibilityToggle,
  onConfirmedPasswordVisibilityToggle,
  onSuggestionDismiss,
  onSuggestionSelect,
  onNewPasswordSelect,
  onOpenSettings,
  onOpenSecurity,
  onSubmit,
}: {
  readonly newPassword: string;
  readonly suggestionVisible: boolean;
  readonly suggestionField: 'new' | 'confirmation';
  readonly changing: boolean;
  readonly currentPasswordRevealed: boolean;
  readonly newPasswordRevealed: boolean;
  readonly confirmedPasswordRevealed: boolean;
  readonly onCurrentPasswordVisibilityToggle: () => void;
  readonly onNewPasswordVisibilityToggle: () => void;
  readonly onConfirmedPasswordVisibilityToggle: () => void;
  readonly onSuggestionDismiss: () => void;
  readonly onSuggestionSelect: () => void;
  readonly onNewPasswordSelect: (field: 'new' | 'confirmation') => void;
  readonly onOpenSettings: () => void;
  readonly onOpenSecurity: () => void;
  readonly onSubmit: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.bank;
  return (
    <>
      <nav
        className={styles.breadcrumbs}
        aria-label={`${content.website.settings.title}: ${content.website.settings.passwordTitle}`}
      >
        <button type="button" onClick={onOpenSettings}>
          {content.website.settings.title}
        </button>
        <span aria-hidden="true">›</span>
        <button type="button" onClick={onOpenSecurity}>
          {content.website.settings.securityTitle}
        </button>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{content.website.settings.passwordTitle}</span>
      </nav>
      <PageHeading title={content.website.settings.passwordTitle} />
      <div className={styles.passwordAdvice}>
        <p>{content.website.settings.passwordAdvice}</p>
        <details>
          <summary>
            {content.website.settings.passwordMoreInformationLabel}
            <span aria-hidden="true">?</span>
          </summary>
          <p>{content.website.settings.passwordMoreInformation}</p>
        </details>
      </div>
      <form
        className={styles.passwordChangeForm}
        onSubmit={(event) => {
          event.preventDefault();
          if (newPassword.length > 0 && !changing) onSubmit();
        }}
      >
        <label htmlFor="s13-bank-current-password">
          {content.website.settings.currentPasswordLabel}
        </label>
        <PasswordControl
          id="s13-bank-current-password"
          value={content.passwordManager.currentPassword}
          label={content.website.settings.currentPasswordLabel}
          revealed={currentPasswordRevealed}
          readOnly
          onToggle={onCurrentPasswordVisibilityToggle}
        />
        <div
          className={styles.newPasswordField}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
              onSuggestionDismiss();
            }
          }}
        >
          <label htmlFor="s13-bank-new-password">
            {content.website.settings.newPasswordLabel}
          </label>
          <PasswordControl
            id="s13-bank-new-password"
            value={newPassword}
            label={content.website.settings.newPasswordLabel}
            revealed={newPasswordRevealed}
            readOnly
            assisted={newPassword.length > 0}
            onSelect={() => onNewPasswordSelect('new')}
            onToggle={onNewPasswordVisibilityToggle}
          />
          {suggestionVisible && suggestionField === 'new' ? (
            <button
              type="button"
              className={`${sharedStyles.passwordSuggestion} ${styles.bankPasswordSuggestion}`}
              onClick={onSuggestionSelect}
            >
              <PasswordManagerKeyIcon />
              <span>{content.passwordManager.suggestAction}</span>
            </button>
          ) : null}
        </div>
        <div
          className={styles.newPasswordField}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
              onSuggestionDismiss();
            }
          }}
        >
          <label htmlFor="s13-bank-confirm-password">
            {content.website.settings.confirmNewPasswordLabel}
          </label>
          <PasswordControl
            id="s13-bank-confirm-password"
            value={newPassword}
            label={content.website.settings.confirmNewPasswordLabel}
            revealed={confirmedPasswordRevealed}
            readOnly
            assisted={newPassword.length > 0}
            onSelect={() => onNewPasswordSelect('confirmation')}
            onToggle={onConfirmedPasswordVisibilityToggle}
          />
          {suggestionVisible && suggestionField === 'confirmation' ? (
            <button
              type="button"
              className={`${sharedStyles.passwordSuggestion} ${styles.bankPasswordSuggestion}`}
              onClick={onSuggestionSelect}
            >
              <PasswordManagerKeyIcon />
              <span>{content.passwordManager.suggestAction}</span>
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className={styles.bankPrimaryAction}
          disabled={newPassword.length === 0 || changing}
        >
          {changing ? (
            <>
              <span className={styles.passwordChangeSpinner} aria-hidden="true" />
              {content.website.settings.changingPasswordLabel}
            </>
          ) : (
            content.website.settings.changePasswordAction
          )}
        </button>
      </form>
    </>
  );
}

function BankWorkspace({
  page,
  username,
  logoutEnabled,
  onNavigate,
  onOpenSecurity,
  onOpenPassword,
  onLogout,
  passwordView,
}: {
  readonly page: S13BankPage;
  readonly username: string;
  readonly logoutEnabled: boolean;
  readonly onNavigate: (page: S13BankNavigationPage) => void;
  readonly onOpenSecurity: () => void;
  readonly onOpenPassword: () => void;
  readonly onLogout: () => void;
  readonly passwordView: ReactNode;
}) {
  const content = s13PasswordManagerPracticeContent.bank.website;
  const activeNavigationPage =
    page === 'security' || page === 'password' ? 'settings' : page;
  return (
    <main className={styles.bankWorkspace}>
      <aside className={styles.bankSidebar}>
        <MusterBankNavigationBrand />
        <nav aria-label={content.navigationLabel}>
          {content.navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={activeNavigationPage === item.id ? 'page' : undefined}
              data-active={activeNavigationPage === item.id || undefined}
              onClick={() => onNavigate(item.id)}
            >
              <BankNavigationIcon page={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className={styles.logoutHint}
          disabled={!logoutEnabled}
          data-highlighted={logoutEnabled || undefined}
          onClick={onLogout}
        >
          <span aria-hidden="true">↪</span>
          {content.logoutLabel}
        </button>
      </aside>
      <section className={styles.bankMain}>
        <div className={styles.bankPageContent}>
          {page === 'overview' ? <BankOverview username={username} /> : null}
          {page === 'accounts' ? <BankAccounts /> : null}
          {page === 'transfers' ? <BankTransfers /> : null}
          {page === 'cards' ? <BankCards /> : null}
          {page === 'settings' ? <BankSettings onOpenSecurity={onOpenSecurity} /> : null}
          {page === 'security' ? (
            <BankSecurity
              onOpenSettings={() => onNavigate('settings')}
              onOpenPassword={onOpenPassword}
            />
          ) : null}
          {page === 'password' ? passwordView : null}
        </div>
      </section>
    </main>
  );
}

function LogoutConfirmationPrompt({
  onConfirm,
  onCancel,
}: {
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.bank.website.logoutConfirmation;
  return (
    <section
      className={styles.logoutConfirmation}
      role="dialog"
      aria-modal="true"
      aria-labelledby="s13-bank-logout-title"
    >
      <h2 id="s13-bank-logout-title">{content.title}</h2>
      <p>{content.detail}</p>
      <div>
        <button type="button" onClick={onCancel}>{content.cancelAction}</button>
        <button type="button" autoFocus onClick={onConfirm}>{content.confirmAction}</button>
      </div>
    </section>
  );
}

function PasswordChangedToast() {
  const content = s13PasswordManagerPracticeContent.bank.website.settings;
  return (
    <p className={styles.passwordChangedToast} role="status">
      <span aria-hidden="true">✓</span>
      {content.passwordChangedStatus}
    </p>
  );
}

function PasswordUpdatePrompt({
  username,
  password,
  passwordRevealed,
  onPasswordVisibilityToggle,
  onUpdate,
  onDismiss,
}: {
  readonly username: string;
  readonly password: string;
  readonly passwordRevealed: boolean;
  readonly onPasswordVisibilityToggle: () => void;
  readonly onUpdate: () => void;
  readonly onDismiss: () => void;
}) {
  const content = s13PasswordManagerPracticeContent.bank.passwordManager;
  return (
    <section
      className={`${sharedStyles.savePrompt} ${styles.updatePrompt}`}
      role="dialog"
      aria-labelledby="s13-bank-update-title"
    >
      <div className={styles.updatePromptTitle}>
        <PasswordManagerKeyIcon />
        <h2 id="s13-bank-update-title">{content.updateTitle}</h2>
      </div>
      <div className={sharedStyles.savePromptField}>
        <label htmlFor="s13-bank-update-username">{content.usernameLabel}</label>
        <input
          id="s13-bank-update-username"
          type="text"
          autoComplete="off"
          spellCheck={false}
          readOnly
          value={username}
        />
      </div>
      <div className={sharedStyles.savePromptField}>
        <label htmlFor="s13-bank-update-password">{content.passwordLabel}</label>
        <span className={sharedStyles.savePromptPasswordInput}>
          <input
            id="s13-bank-update-password"
            type={passwordRevealed ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            readOnly
            value={password}
          />
          <button
            type="button"
            className={sharedStyles.savePromptVisibility}
            aria-label={
              passwordRevealed
                ? s13PasswordManagerPracticeContent.website.hidePasswordLabel
                : s13PasswordManagerPracticeContent.website.showPasswordLabel
            }
            aria-pressed={passwordRevealed}
            onClick={onPasswordVisibilityToggle}
          >
            <PasswordVisibilityIcon revealed={passwordRevealed} />
          </button>
        </span>
      </div>
      <div className={sharedStyles.savePromptActions}>
        <button
          type="button"
          className={sharedStyles.savePromptDismiss}
          onClick={onDismiss}
        >
          {content.dismissUpdateAction}
        </button>
        <button type="button" autoFocus onClick={onUpdate}>
          {content.updateAction}
        </button>
      </div>
    </section>
  );
}

function autofillDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 250;
}

function passwordChangeDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 760;
}

export interface S13MusterBankPasswordChangeProps {
  readonly displayName?: string;
  readonly platform: DesktopPlatform;
  readonly onBrowserClosed: () => void;
}

export function S13MusterBankPasswordChange({
  displayName = '',
  platform,
  onBrowserClosed,
}: S13MusterBankPasswordChangeProps) {
  const content = s13PasswordManagerPracticeContent.bank;
  const identity = useMemo(() => deriveCampusIdentity(displayName), [displayName]);
  const username = identity.campusgram;
  const [state, send] = useMachine(s13MusterBankPasswordChangeMachine, {
    input: {
      autofillDurationMs: autofillDuration(),
      expectedCurrentPassword: content.passwordManager.currentPassword,
      expectedNewPassword: content.passwordManager.generatedPassword,
      expectedUsername: username,
      passwordChangeDurationMs: passwordChangeDuration(),
      passwordChangedToastDurationMs: window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? 900
        : 1800,
      passwordUpdatedStatusDurationMs: 2000,
    },
  });
  const [browserOpen, setBrowserOpen] = useState(false);
  const [guideHelpOpen, setGuideHelpOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [autofillAnchor, setAutofillAnchor] = useState<BankLoginField | null>(null);
  const [loginPasswordRevealed, setLoginPasswordRevealed] = useState(false);
  const [currentPasswordRevealed, setCurrentPasswordRevealed] = useState(false);
  const [newPasswordRevealed, setNewPasswordRevealed] = useState(true);
  const [confirmedPasswordRevealed, setConfirmedPasswordRevealed] = useState(true);
  const [updatePromptPasswordRevealed, setUpdatePromptPasswordRevealed] =
    useState(false);
  const [suggestionField, setSuggestionField] = useState<'new' | 'confirmation'>('new');
  const [successOverlayVisible, setSuccessOverlayVisible] = useState(false);
  const initialSignInOverlayShownRef = useRef(false);

  useEffect(() => setBrowserOpen(true), []);

  const autofillEntries = useMemo<readonly BankAutofillEntry[]>(
    () => [
      {
        id: content.passwordManager.autofillAccounts[0].id,
        label: content.passwordManager.autofillAccounts[0].label,
        identifier: username,
        password: content.passwordManager.currentPassword,
      },
      {
        id: content.passwordManager.autofillAccounts[1].id,
        label: content.passwordManager.autofillAccounts[1].label,
        identifier: identity.masterCampus,
        password: s13PasswordManagerPracticeContent.passwordManager.generatedPassword,
      },
      {
        id: content.passwordManager.autofillAccounts[2].id,
        label: content.passwordManager.autofillAccounts[2].label,
        identifier: identity.campusgram,
        password: content.passwordManager.generatedPassword,
      },
      {
        id: content.passwordManager.autofillAccounts[3].id,
        label: content.passwordManager.autofillAccounts[3].label,
        identifier: identity.masterCampus,
        password: content.passwordManager.generatedPassword,
      },
      {
        id: content.passwordManager.autofillAccounts[4].id,
        label: content.passwordManager.autofillAccounts[4].label,
        identifier: identity.campusEmail,
        password: content.passwordManager.generatedPassword,
      },
    ],
    [content.passwordManager, identity, username],
  );

  const initialLoginIdle = state.matches('initialLoginIdle');
  const initialLoginOffer = state.matches('initialLoginOffer');
  const initialLoginAutofilling = state.matches('initialLoginAutofilling');
  const initialLoginReady = state.matches('initialLoginReady');
  const initialLoginInvalid = state.matches('initialLoginInvalid');
  const returnLoginAutofilling = state.matches('returnLoginAutofilling');
  const returnLoginReady = state.matches('returnLoginReady');
  const returnLoginOffer = state.matches('returnLoginOffer');
  const returnLoginManualAutofilling = state.matches('returnLoginManualAutofilling');
  const returnLoginInvalid = state.matches('returnLoginInvalid');
  const loginVisible =
    initialLoginIdle ||
    initialLoginOffer ||
    initialLoginAutofilling ||
    initialLoginReady ||
    initialLoginInvalid ||
    returnLoginAutofilling ||
    returnLoginReady ||
    returnLoginOffer ||
    returnLoginManualAutofilling ||
    returnLoginInvalid;
  const loginAutofilling =
    initialLoginAutofilling ||
    returnLoginAutofilling ||
    returnLoginManualAutofilling;
  const loginReady =
    loginUsername.length > 0 && loginPassword.length > 0 && !loginAutofilling;
  const manualAutofillOfferAvailable =
    initialLoginIdle ||
    initialLoginOffer ||
    initialLoginReady ||
    initialLoginInvalid ||
    returnLoginReady ||
    returnLoginOffer ||
    returnLoginInvalid;
  const returnLoginEntry = useMemo<BankAutofillEntry>(
    () => ({
      id: 'muster-bank',
      label: content.website.name,
      identifier: username,
      password: content.passwordManager.generatedPassword,
    }),
    [content.passwordManager.generatedPassword, content.website.name, username],
  );
  const returnAutofillEntries = useMemo(
    () =>
      autofillEntries.map((entry) =>
        entry.id === 'muster-bank' ? returnLoginEntry : entry,
      ),
    [autofillEntries, returnLoginEntry],
  );
  const loginAutofillEntries =
    returnLoginReady ||
    returnLoginOffer ||
    returnLoginManualAutofilling ||
    returnLoginInvalid
      ? returnAutofillEntries
      : autofillEntries;
  const selectedAutofillEntry = loginAutofillEntries.find(
    ({ id }) => id === state.context.selectedAutofillEntryId,
  );
  const activeAutofillEntry = returnLoginAutofilling
    ? returnLoginEntry
    : selectedAutofillEntry;
  const completeAutofill = useCallback(
    () => send({ type: 'AUTOFILL_COMPLETE' }),
    [send],
  );

  usePasswordManagerAutofill({
    active: loginAutofilling && activeAutofillEntry !== undefined,
    durationMs: state.context.autofillDurationMs,
    identifier: activeAutofillEntry?.identifier ?? '',
    password: activeAutofillEntry?.password ?? '',
    onIdentifierChange: setLoginUsername,
    onPasswordChange: setLoginPassword,
    onComplete: completeAutofill,
  });

  const suggestionVisible = state.matches('passwordSuggestion');
  const passwordChanging = state.matches('passwordChanging');
  const passwordChangedToastVisible = state.matches('passwordChangedToast');
  const passwordGenerated =
    state.matches('passwordGenerated') || passwordChanging;
  const servicePasswordChanged =
    passwordChanging ||
    passwordChangedToastVisible ||
    state.matches('updatePrompt') ||
    state.matches('updateGuidanceFirst') ||
    state.matches('updateGuidanceSecond') ||
    state.matches('updateReminder') ||
    state.matches('updatePromptRetry') ||
    state.matches('updateConfirmation') ||
    state.matches('updateConfirmationStatusCleared') ||
    state.matches('awaitingLogout') ||
    state.matches('logoutConfirmation') ||
    returnLoginAutofilling ||
    returnLoginReady ||
    returnLoginOffer ||
    returnLoginManualAutofilling ||
    returnLoginInvalid ||
    state.matches('signedIn');
  const updatePromptInteractive =
    passwordChangedToastVisible ||
    state.matches('updatePrompt') ||
    state.matches('updatePromptRetry');
  const updatePromptVisible = updatePromptInteractive;
  const updateGuidanceFirst = state.matches('updateGuidanceFirst');
  const updateGuidanceSecond = state.matches('updateGuidanceSecond');
  const updateReminder = state.matches('updateReminder');
  const passwordUpdatedStatusVisible = state.matches('updateConfirmation');
  const updateConfirmation =
    passwordUpdatedStatusVisible || state.matches('updateConfirmationStatusCleared');
  const awaitingLogout = state.matches('awaitingLogout');
  const logoutConfirmation = state.matches('logoutConfirmation');
  const signedIn = state.matches('signedIn');
  const initialBanking = state.matches('banking');
  const dimmed =
    updatePromptVisible ||
    updateGuidanceFirst ||
    updateGuidanceSecond ||
    logoutConfirmation;

  useEffect(() => {
    if (!initialBanking || initialSignInOverlayShownRef.current) return;
    initialSignInOverlayShownRef.current = true;
    setSuccessOverlayVisible(true);
  }, [initialBanking]);

  useEffect(() => {
    if (signedIn) setSuccessOverlayVisible(true);
  }, [signedIn]);

  const progressCount = signedIn
    ? 3
    : updateConfirmation ||
        awaitingLogout ||
        logoutConfirmation ||
        returnLoginAutofilling ||
        returnLoginReady ||
        returnLoginOffer ||
        returnLoginManualAutofilling ||
        returnLoginInvalid
      ? 2
      : servicePasswordChanged
        ? 1
        : 0;
  const mandatoryGuideSpeech = updateGuidanceFirst
    ? {
        id: 's13-bank-update-declined-first',
        text: content.guide.updateDeclined.first,
        action: {
          kind: 'advance' as const,
          label: 'Weiter',
          onAction: () => send({ type: 'CONTINUE_UPDATE_GUIDANCE' }),
        },
      }
    : updateGuidanceSecond
      ? {
          id: 's13-bank-update-declined-second',
          text: content.guide.updateDeclined.second,
        }
      : updateConfirmation
        ? {
            id: 's13-bank-password-updated',
            text: content.guide.updated,
            action: {
              kind: 'advance' as const,
              label: 'Weiter',
              onAction: () => {
                send({ type: 'CONTINUE_TO_LOGOUT' });
              },
            },
          }
        : returnLoginAutofilling ||
            returnLoginReady ||
            returnLoginOffer ||
            returnLoginManualAutofilling ||
            returnLoginInvalid
          ? {
              id: 's13-bank-autofill-explanation',
              text: content.guide.autofill,
            }
          : signedIn
            ? {
                id: 's13-bank-practice-complete',
                text: content.guide.complete,
              }
            : null;
  const guideVisible = !awaitingLogout && !logoutConfirmation;
  const guideHint = updateReminder
    ? content.guide.updateDeclined.reminder
    : loginVisible
      ? content.guide.hints.login
      : state.context.page === 'password'
        ? content.guide.hints.password
        : content.guide.hints.navigate;
  const guideOpen = guideVisible && (mandatoryGuideSpeech !== null || guideHelpOpen);
  const guideSpeechAction =
    mandatoryGuideSpeech !== null && 'action' in mandatoryGuideSpeech
      ? mandatoryGuideSpeech.action
      : guideHelpOpen && mandatoryGuideSpeech === null
        ? {
            kind: 'dismiss' as const,
            onAction: () => setGuideHelpOpen(false),
          }
        : undefined;

  const address = loginVisible
    ? content.browser.addresses.login
    : content.browser.addresses[state.context.page];
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: [
      {
        id: s13PasswordManagerPracticeContent.browser.tabId,
        label: s13PasswordManagerPracticeContent.browser.tabLabel,
        icon: <MyShopAppIcon compact idSuffix="bank-browser-tab" />,
      },
      {
        id: content.browser.tabId,
        label: content.browser.tabLabel,
        icon: <MusterBankMark compact />,
      },
    ],
    activeTabId: content.browser.tabId,
    address,
    accountIdentifier: username,
    scrollKey: `s13-bank:${state.context.page}:${String(state.value)}`,
    dimmed,
    dimStrength: 'strong',
    passwordManager: {
      label: content.browser.passwordManagerLabel,
      active:
        initialLoginOffer ||
        loginAutofilling ||
        suggestionVisible ||
        updatePromptVisible ||
        updateConfirmation,
      highlighted: updateGuidanceFirst || updateGuidanceSecond || updateReminder,
      interactionEnabled: updateGuidanceSecond || updateReminder,
      allowInteractionWhenDimmed: updateGuidanceSecond,
      icon: passwordUpdatedStatusVisible ? 'saved' : 'key',
      ...(passwordUpdatedStatusVisible
        ? { statusLabel: content.passwordManager.updatedStatus }
        : {}),
    },
  };

  const passwordView = (
    <BankPasswordChange
      newPassword={passwordGenerated ? content.passwordManager.generatedPassword : ''}
      suggestionVisible={suggestionVisible}
      suggestionField={suggestionField}
      changing={passwordChanging}
      currentPasswordRevealed={currentPasswordRevealed}
      newPasswordRevealed={newPasswordRevealed}
      confirmedPasswordRevealed={confirmedPasswordRevealed}
      onCurrentPasswordVisibilityToggle={() =>
        setCurrentPasswordRevealed((revealed) => !revealed)
      }
      onNewPasswordVisibilityToggle={() =>
        setNewPasswordRevealed((revealed) => !revealed)
      }
      onConfirmedPasswordVisibilityToggle={() =>
        setConfirmedPasswordRevealed((revealed) => !revealed)
      }
      onSuggestionDismiss={() => send({ type: 'NEW_PASSWORD_FIELD_DESELECTED' })}
      onSuggestionSelect={() => {
        setGuideHelpOpen(false);
        setNewPasswordRevealed(true);
        setConfirmedPasswordRevealed(true);
        send({ type: 'PASSWORD_SUGGESTION_SELECTED' });
      }}
      onNewPasswordSelect={(field) => {
        setGuideHelpOpen(false);
        setSuggestionField(field);
        send({ type: 'NEW_PASSWORD_FIELD_SELECTED' });
      }}
      onOpenSettings={() => {
        setGuideHelpOpen(false);
        send({ type: 'NAVIGATE', page: 'settings' });
      }}
      onOpenSecurity={() => {
        setGuideHelpOpen(false);
        send({ type: 'OPEN_SECURITY' });
      }}
      onSubmit={() => {
        setGuideHelpOpen(false);
        send({ type: 'CHANGE_PASSWORD' });
      }}
    />
  );

  return (
    <section className={styles.training} aria-label={content.trainingAriaLabel}>
      <BrowserShell
        platform={platform}
        variant="artifact"
        snapshot={browserSnapshot}
        ariaLabel={content.browser.ariaLabel}
        windowOpen={browserOpen}
        windowCloseEnabled={signedIn}
        onWindowOpenChange={(open) => {
          if (open || signedIn) setBrowserOpen(open);
        }}
        onWindowTransitionEnd={(windowState) => {
          if (windowState === 'closed' && signedIn) onBrowserClosed();
        }}
        {...(updateGuidanceSecond || updateReminder
          ? {
              onPasswordManagerSelect: () => {
                setGuideHelpOpen(false);
                setUpdatePromptPasswordRevealed(false);
                send({ type: 'OPEN_UPDATE_PROMPT' });
              },
            }
          : {})}
        layers={{
          passWo: (
            <>
              {successOverlayVisible ? (
                <AccountSuccessOverlay
                  label={content.website.signedInStatus}
                  onComplete={() => setSuccessOverlayVisible(false)}
                />
              ) : null}
              {guideVisible ? (
                <PassWoGuide
                  guideName={s13PasswordManagerPracticeContent.guide.name}
                  taskLabel={content.guide.taskLabel}
                  taskComplete={signedIn}
                  progress={{
                    current: progressCount,
                    total: 3,
                    label: content.progressLabel(progressCount),
                  }}
                  helpOpen={guideOpen}
                  helpId="s13-bank-password-speech"
                  openHelpLabel={content.guide.helpLabel}
                  speech={[mandatoryGuideSpeech?.text ?? guideHint]}
                  speechKey={
                    mandatoryGuideSpeech?.id ??
                    `s13-bank-help-${String(state.value)}-${state.context.page}`
                  }
                  speechEmphasis={passWoSpeechEmphasisFor(
                    mandatoryGuideSpeech?.id ?? '',
                  )}
                  {...(guideSpeechAction === undefined
                    ? {}
                    : { speechAction: guideSpeechAction })}
                  placement={updateGuidanceFirst ? 'bottom-right' : 'bottom-left'}
                  speechPlacement={updateGuidanceFirst ? 'left' : 'right'}
                  showHelpButton={mandatoryGuideSpeech === null}
                  showTaskStatusWhenSpeaking
                  onToggleHelp={() => setGuideHelpOpen(true)}
                />
              ) : null}
            </>
          ),
          controls: (
            <>
              {updatePromptVisible ? (
                <PasswordUpdatePrompt
                  username={username}
                  password={content.passwordManager.generatedPassword}
                  passwordRevealed={updatePromptPasswordRevealed}
                  onPasswordVisibilityToggle={() =>
                    setUpdatePromptPasswordRevealed((revealed) => !revealed)
                  }
                  onUpdate={() => {
                    setUpdatePromptPasswordRevealed(false);
                    send({ type: 'UPDATE_PASSWORD' });
                  }}
                  onDismiss={() => {
                    setUpdatePromptPasswordRevealed(false);
                    send({ type: 'DISMISS_UPDATE_PROMPT' });
                  }}
                />
              ) : null}
              {passwordChangedToastVisible ? <PasswordChangedToast /> : null}
              {logoutConfirmation ? (
                <LogoutConfirmationPrompt
                  onCancel={() => send({ type: 'CANCEL_LOGOUT' })}
                  onConfirm={() => {
                    setLoginPasswordRevealed(false);
                    setLoginUsername('');
                    setLoginPassword('');
                    setAutofillAnchor(null);
                    send({ type: 'CONFIRM_LOGOUT' });
                  }}
                />
              ) : null}
            </>
          ),
        }}
      >
        {loginVisible ? (
          <BankLogin
            username={loginUsername}
            password={loginPassword}
            offerVisible={
              manualAutofillOfferAvailable && autofillAnchor !== null
            }
            autofillAnchor={autofillAnchor}
            automaticEntry={returnLoginAutofilling ? returnLoginEntry : null}
            entries={loginAutofillEntries}
            autofilling={loginAutofilling}
            ready={loginReady}
            invalid={initialLoginInvalid || returnLoginInvalid}
            failedLoginAttempts={state.context.failedLoginAttempts}
            passwordRevealed={loginPasswordRevealed}
            onLoginFieldSelect={(field) => {
              if (!manualAutofillOfferAvailable) return;
              setAutofillAnchor(field);
              send({ type: 'LOGIN_FIELD_SELECTED' });
            }}
            onUsernameChange={(value) => {
              setAutofillAnchor(null);
              setLoginUsername(value);
              send({ type: 'LOGIN_FIELD_EDITED' });
            }}
            onPasswordChange={(value) => {
              setAutofillAnchor(null);
              setLoginPassword(value);
              send({ type: 'LOGIN_FIELD_EDITED' });
            }}
            onOfferDismiss={() => {
              setAutofillAnchor(null);
              send({ type: 'LOGIN_FIELD_DESELECTED' });
            }}
            onStoredEntrySelect={(entry) => {
              setGuideHelpOpen(false);
              setAutofillAnchor(null);
              setLoginUsername('');
              setLoginPassword('');
              send({ type: 'STORED_ENTRY_SELECTED', entryId: entry.id });
            }}
            onPasswordVisibilityToggle={() =>
              setLoginPasswordRevealed((revealed) => !revealed)
            }
            onLogin={() => {
              setGuideHelpOpen(false);
              setAutofillAnchor(null);
              send({
                type: 'LOGIN',
                username: loginUsername,
                password: loginPassword,
              });
            }}
          />
        ) : (
          <BankWorkspace
            page={state.context.page}
            username={username}
            logoutEnabled={awaitingLogout}
            onNavigate={(page) => {
              setGuideHelpOpen(false);
              send({ type: 'NAVIGATE', page });
            }}
            onOpenSecurity={() => send({ type: 'OPEN_SECURITY' })}
            onOpenPassword={() => send({ type: 'OPEN_PASSWORD' })}
            onLogout={() => send({ type: 'REQUEST_LOGOUT' })}
            passwordView={passwordView}
          />
        )}
      </BrowserShell>
    </section>
  );
}
