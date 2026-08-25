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
import { useEffect, useMemo, useState } from 'react';
import myShopSummerSaleAsset from '../../../../assets/s13/my-shop-summer-sale.png';
import { AccountSuccessOverlay } from '../../AccountSuccessOverlay.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { PasswordVisibilityIcon } from '../../PasswordVisibilityIcon.js';
import {
  type S13AutofillEntryId,
  s13PasswordManagerPracticeMachine,
} from './S13PasswordManagerPracticeMachine.js';
import styles from './S13PasswordManagerPractice.module.css';

function PasswordManagerKeyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="8.2" cy="10.2" r="4.2" />
      <path d="m11.4 13.1 8 8M15.2 16.9l2.2-2.2M17.8 19.5l2.2-2.2" />
    </svg>
  );
}

function MyShopMark({ idSuffix }: { readonly idSuffix: string }) {
  const gradientId = `s13-my-shop-${idSuffix}`;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="5" x2="20" y2="19">
          <stop stopColor="#ffad0d" />
          <stop offset="1" stopColor="#f42269" />
        </linearGradient>
      </defs>
      <path d="M3.2 4.5h2l1.8 10h10.4l2.2-7.2H6.2" stroke={`url(#${gradientId})`} />
      <circle cx="9" cy="18.7" r="1.2" fill="#f42269" stroke="none" />
      <circle cx="17" cy="18.7" r="1.2" fill="#f42269" stroke="none" />
    </svg>
  );
}

function MyShopAppIcon({
  compact = false,
  idSuffix,
}: {
  readonly compact?: boolean;
  readonly idSuffix: string;
}) {
  return (
    <span
      className={styles.myShopAppIcon}
      data-compact={compact || undefined}
      aria-hidden="true"
    >
      <MyShopMark idSuffix={idSuffix} />
    </span>
  );
}

function MyShopBrand({ idSuffix }: { readonly idSuffix: string }) {
  const content = s13PasswordManagerPracticeContent;
  const [firstWord = 'My', secondWord = 'Shop'] = content.website.name.split(' ', 2);
  return (
    <span className={styles.shopBrand} aria-label={content.website.name}>
      <span className={styles.shopBrandMark}>
        <MyShopMark idSuffix={idSuffix} />
      </span>
      <span className={styles.shopBrandText} aria-hidden="true">
        {firstWord}
        <strong>{secondWord}</strong>
      </span>
    </span>
  );
}

function ShopUtilityIcon({ kind }: { readonly kind: 'account' | 'heart' | 'cart' }) {
  if (kind === 'account') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5.4 20c.5-4 3.1-6.1 6.6-6.1s6.1 2.1 6.6 6.1" />
      </svg>
    );
  }
  if (kind === 'heart') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M20.2 5.7c-2.1-2.1-5.5-1.9-7.4.4L12 7l-.8-.9c-1.9-2.3-5.3-2.5-7.4-.4-2.2 2.2-2 5.8.3 7.9l7.9 7 7.9-7c2.3-2.1 2.5-5.7.3-7.9Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M3 4h2.2l1.9 10.6h10.7l2.3-7.5H6.2" />
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </svg>
  );
}

function PasswordField({
  id,
  value,
  placeholder,
  assisted = false,
  autofilling = false,
  ariaLabel,
  revealed,
  onSelect,
  onChange,
  onToggleVisibility,
}: {
  readonly id: string;
  readonly value: string;
  readonly placeholder: string;
  readonly assisted?: boolean;
  readonly autofilling?: boolean;
  readonly ariaLabel?: string | undefined;
  readonly revealed: boolean;
  readonly onSelect?: () => void;
  readonly onChange?: (value: string) => void;
  readonly onToggleVisibility: () => void;
}) {
  const content = s13PasswordManagerPracticeContent;

  return (
    <span
      className={styles.passwordField}
      data-filled={assisted || undefined}
      data-autofilling={autofilling || undefined}
    >
      <input
        id={id}
        type={revealed ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        readOnly={onChange === undefined}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        onClick={onSelect}
        onFocus={onSelect}
      />
      <button
        type="button"
        className={styles.visibilityButton}
        aria-pressed={revealed}
        aria-label={
          revealed ? content.website.hidePasswordLabel : content.website.showPasswordLabel
        }
        onClick={onToggleVisibility}
      >
        <PasswordVisibilityIcon revealed={revealed} />
      </button>
    </span>
  );
}

interface S13AutofillEntry {
  readonly id: S13AutofillEntryId;
  readonly label: string;
  readonly identifier: string;
  readonly password: string;
}

function AutofillList({
  entries,
  onSelect,
}: {
  readonly entries: readonly S13AutofillEntry[];
  readonly onSelect: (entry: S13AutofillEntry) => void;
}) {
  const content = s13PasswordManagerPracticeContent;
  return (
    <div
      className={styles.autofillList}
      role="listbox"
      aria-label={content.passwordManager.autofillListLabel}
    >
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={styles.storedEntry}
          role="option"
          aria-label={`${entry.label}, ${entry.identifier}`}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onSelect(entry)}
        >
          {entry.id === 'my-shop' ? (
            <MyShopAppIcon idSuffix="stored-entry" />
          ) : (
            <span className={styles.storedEntryMark} aria-hidden="true">
              {entry.label.slice(0, 1)}
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

function focusMovedOutside(container: HTMLElement, nextTarget: EventTarget | null): boolean {
  return !(nextTarget instanceof Node) || !container.contains(nextTarget);
}

function AuthBackdrop({
  mode,
  emailValue,
  passwordValue,
  passwordGenerated,
  suggestionVisible,
  storedEntryVisible,
  autofillAnchor,
  autofillEntries,
  emailAutofilled,
  passwordAutofilled,
  autofilling,
  loginReady,
  registering,
  passwordRevealed,
  onEmailFieldSelect,
  onPasswordFieldSelect,
  onEmailChange,
  onPasswordChange,
  onPasswordSuggestionDismiss,
  onPasswordSuggestionSelect,
  onPasswordVisibilityToggle,
  onRegister,
  onStoredEntrySelect,
  onStoredEntryDismiss,
  onLogin,
}: {
  readonly mode: 'register' | 'login';
  readonly emailValue: string;
  readonly passwordValue: string;
  readonly passwordGenerated: boolean;
  readonly suggestionVisible: boolean;
  readonly storedEntryVisible: boolean;
  readonly autofillAnchor: 'email' | 'password';
  readonly autofillEntries: readonly S13AutofillEntry[];
  readonly emailAutofilled: boolean;
  readonly passwordAutofilled: boolean;
  readonly autofilling: boolean;
  readonly loginReady: boolean;
  readonly registering: boolean;
  readonly passwordRevealed: boolean;
  readonly onEmailFieldSelect: () => void;
  readonly onPasswordFieldSelect: () => void;
  readonly onEmailChange: (value: string) => void;
  readonly onPasswordChange: (value: string) => void;
  readonly onPasswordSuggestionDismiss: () => void;
  readonly onPasswordSuggestionSelect: () => void;
  readonly onPasswordVisibilityToggle: () => void;
  readonly onRegister: () => void;
  readonly onStoredEntrySelect: (entry: S13AutofillEntry) => void;
  readonly onStoredEntryDismiss: () => void;
  readonly onLogin: () => void;
}) {
  const content = s13PasswordManagerPracticeContent;
  const login = mode === 'login';
  const canSubmitLogin =
    (loginReady || autofilling) && emailValue.length > 0 && passwordValue.length > 0;
  return (
    <main className={styles.authPage}>
      <div className={styles.authGlow} aria-hidden="true" />
      <section className={styles.authPanel}>
        <MyShopBrand idSuffix={`auth-${mode}`} />
        <form
          className={styles.authCard}
          aria-label={login ? content.website.loginTitle : content.website.registrationTitle}
          onSubmit={(event) => {
            event.preventDefault();
            if (login && canSubmitLogin) onLogin();
            if (!login && passwordGenerated && !registering) onRegister();
          }}
        >
          <h1>{login ? content.website.loginTitle : content.website.registrationTitle}</h1>
          <label htmlFor={`s13-email-${mode}`}>{content.website.emailLabel}</label>
          <div
            className={styles.emailControl}
            onBlur={(event) => {
              if (login && focusMovedOutside(event.currentTarget, event.relatedTarget)) {
                onStoredEntryDismiss();
              }
            }}
          >
            <input
              id={`s13-email-${mode}`}
              className={styles.emailField}
              type="email"
              autoComplete="off"
              readOnly={!login}
              value={emailValue}
              placeholder={content.website.emailPlaceholder}
              aria-label={
                emailAutofilled
                  ? `${content.website.emailLabel}, ${content.website.autofilledStatusLabel}`
                  : undefined
              }
              data-autofilling={autofilling || undefined}
              data-autofilled={emailAutofilled || undefined}
              onClick={login ? onEmailFieldSelect : undefined}
              onFocus={login ? onEmailFieldSelect : undefined}
              onChange={(event) => onEmailChange(event.currentTarget.value)}
            />
            {login && storedEntryVisible && autofillAnchor === 'email' ? (
              <AutofillList entries={autofillEntries} onSelect={onStoredEntrySelect} />
            ) : null}
          </div>
          <div
            className={styles.passwordControl}
            onBlur={(event) => {
              if (!focusMovedOutside(event.currentTarget, event.relatedTarget)) return;
              if (login) onStoredEntryDismiss();
              else onPasswordSuggestionDismiss();
            }}
          >
            <label htmlFor={`s13-password-${mode}`}>{content.website.passwordLabel}</label>
            <PasswordField
              id={`s13-password-${mode}`}
              value={passwordValue}
              placeholder={content.website.passwordPlaceholder}
              assisted={login ? passwordAutofilled : passwordGenerated}
              autofilling={autofilling}
              ariaLabel={
                passwordAutofilled
                  ? `${content.website.passwordLabel}, ${content.website.autofilledStatusLabel}`
                  : undefined
              }
              revealed={passwordRevealed}
              onToggleVisibility={onPasswordVisibilityToggle}
              onSelect={onPasswordFieldSelect}
              {...(login ? { onChange: onPasswordChange } : {})}
            />
            {!login && suggestionVisible ? (
              <button
                type="button"
                className={styles.passwordSuggestion}
                onPointerDown={(event) => event.preventDefault()}
                onClick={onPasswordSuggestionSelect}
              >
                <PasswordManagerKeyIcon />
                <span>{content.passwordManager.suggestAction}</span>
              </button>
            ) : null}
            {login && storedEntryVisible && autofillAnchor === 'password' ? (
              <AutofillList entries={autofillEntries} onSelect={onStoredEntrySelect} />
            ) : null}
          </div>
          <button
            type="submit"
            className={styles.authAction}
            disabled={registering || (login ? !canSubmitLogin : !passwordGenerated)}
            aria-label={registering ? content.website.registeringLabel : undefined}
          >
            {registering ? (
              <span className={styles.registrationSpinner} aria-hidden="true" />
            ) : login ? (
              content.website.loginAction
            ) : (
              content.website.registerAction
            )}
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordSavePrompt({
  email,
  password,
  passwordRevealed,
  onSave,
  onDismiss,
  onPasswordVisibilityToggle,
}: {
  readonly email: string;
  readonly password: string;
  readonly passwordRevealed: boolean;
  readonly onSave: () => void;
  readonly onDismiss: () => void;
  readonly onPasswordVisibilityToggle: () => void;
}) {
  const content = s13PasswordManagerPracticeContent;
  return (
    <section className={styles.savePrompt} role="dialog" aria-labelledby="s13-save-title">
      <h2 id="s13-save-title">{content.passwordManager.saveTitle}</h2>
      <div className={styles.savePromptField}>
        <label htmlFor="s13-save-username">{content.passwordManager.usernameLabel}</label>
        <input id="s13-save-username" type="text" readOnly value={email} />
      </div>
      <div className={styles.savePromptField}>
        <label htmlFor="s13-save-password">{content.passwordManager.passwordLabel}</label>
        <span className={styles.savePromptPasswordInput}>
          <input
            id="s13-save-password"
            type={passwordRevealed ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            readOnly
            value={password}
          />
          <button
            type="button"
            className={styles.savePromptVisibility}
            aria-pressed={passwordRevealed}
            aria-label={
              passwordRevealed
                ? content.website.hidePasswordLabel
                : content.website.showPasswordLabel
            }
            onClick={onPasswordVisibilityToggle}
          >
            <PasswordVisibilityIcon revealed={passwordRevealed} />
          </button>
        </span>
      </div>
      <div className={styles.savePromptActions}>
        <button type="button" className={styles.savePromptDismiss} onClick={onDismiss}>
          {content.passwordManager.dismissSaveAction}
        </button>
        <button type="button" autoFocus onClick={onSave}>
          {content.passwordManager.saveAction}
        </button>
      </div>
    </section>
  );
}

function SignedInBackdrop({ username }: { readonly username: string }) {
  const content = s13PasswordManagerPracticeContent;
  const shop = content.website.shop;
  return (
    <main className={styles.signedInPage}>
      <header className={styles.shopHeader}>
        <MyShopBrand idSuffix="header" />
        <div className={styles.shopSearch} role="search">
          <span>{shop.searchCategory}</span>
          <input
            type="search"
            readOnly
            value=""
            aria-label={shop.searchPlaceholder}
            placeholder={shop.searchPlaceholder}
          />
          <span className={styles.shopSearchIcon} aria-hidden="true">⌕</span>
        </div>
        <div className={styles.shopUtilities}>
          <span className={styles.shopUtility} aria-label={`${shop.accountLabel} ${username}`}>
            <ShopUtilityIcon kind="account" />
            <span>
              <strong>{username}</strong>
              <small>{shop.accountLabel}</small>
            </span>
          </span>
          <span className={styles.shopUtility}>
            <ShopUtilityIcon kind="heart" />
            <span>
              <strong>{shop.wishlistLabel}</strong>
              <small>{shop.wishlistDetail}</small>
            </span>
          </span>
          <span className={styles.shopUtility}>
            <ShopUtilityIcon kind="cart" />
            <span>
              <strong>{shop.cartLabel}</strong>
              <small>{shop.cartDetail}</small>
            </span>
          </span>
        </div>
      </header>
      <div className={styles.shopLayout}>
        <aside className={styles.shopSidebar}>
          <nav aria-label={shop.categoryHeading}>
            <h2>{shop.categoryHeading}</h2>
            <ul>
              {shop.categories.map((category, index) => (
                <li key={category}>
                  <span className={styles.categoryIcon} data-icon={index % 5} aria-hidden="true" />
                  <span>{category}</span>
                  <span aria-hidden="true">›</span>
                </li>
              ))}
            </ul>
          </nav>
          <section className={styles.weeklyOffer}>
            <h2>{shop.weeklyOffer.title}</h2>
            <p>{shop.weeklyOffer.detail}</p>
            <span>{shop.weeklyOffer.action}</span>
          </section>
        </aside>
        <div className={styles.shopContent}>
          <section className={styles.saleHero}>
            <div className={styles.saleHeroCopy}>
              <span>{shop.hero.eyebrow}</span>
              <h1>{shop.hero.title}</h1>
              <p>{shop.hero.detail}</p>
              <strong>{shop.hero.action}</strong>
            </div>
            <img
              src={myShopSummerSaleAsset}
              width={665}
              height={270}
              loading="eager"
              fetchPriority="high"
              alt=""
            />
          </section>
          <section
            className={styles.shopBenefits}
            aria-label={shop.serviceHighlights.map((item) => item.title).join(', ')}
          >
            {shop.serviceHighlights.map((item, index) => (
              <div key={item.title}>
                <span className={styles.benefitIcon} data-icon={index} aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
              </div>
            ))}
          </section>
          <section className={styles.shopCollection}>
            <header>
              <h2>{shop.popularHeading}</h2>
              <span>{shop.showAllAction} →</span>
            </header>
            <div className={styles.categoryCards}>
              {shop.popularCategories.map((category, index) => (
                <article key={category}>
                  <span className={styles.categoryPlaceholder} data-tone={index} aria-hidden="true">
                    <span />
                  </span>
                  <h3>{category}</h3>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.shopCollection}>
            <header>
              <h2>{shop.recommendedHeading}</h2>
              <span>{shop.showAllAction} →</span>
            </header>
            <div className={styles.productCards}>
              {shop.recommendedProducts.map((product, index) => (
                <article key={product.name}>
                  <span className={styles.productPlaceholder} data-tone={index} aria-hidden="true">
                    <span />
                  </span>
                  <h3>{product.name}</h3>
                  <p>{product.detail}</p>
                  <span className={styles.productRating}>
                    <span aria-hidden="true">★★★★★</span> ({product.rating})
                  </span>
                  <strong>{product.price}</strong>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function autofillDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900;
}

function registrationDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720;
}

const defaultPassphraseIds = {
  campusgram: 'passphrase-01-hyphen',
  masterCampus: 'passphrase-02-hyphen',
  campusEmail: 'passphrase-03-hyphen',
} as const satisfies SupportiveS08ResumeState['passphraseIds'];

export interface S13PasswordManagerPracticeProps {
  readonly displayName?: string;
  readonly passphraseIds?: SupportiveS08ResumeState['passphraseIds'];
  readonly platform: DesktopPlatform;
  readonly onBrowserClosed: () => void;
}

export function S13PasswordManagerPractice({
  displayName = '',
  passphraseIds = defaultPassphraseIds,
  platform,
  onBrowserClosed,
}: S13PasswordManagerPracticeProps) {
  const content = s13PasswordManagerPracticeContent;
  const identity = deriveCampusIdentity(displayName);
  const email = identity.masterCampus;
  const username = email.split('@', 1)[0] ?? 'benutzername';
  const [state, send] = useMachine(s13PasswordManagerPracticeMachine, {
    input: {
      autofillDurationMs: autofillDuration(),
      registrationDurationMs: registrationDuration(),
      saveConfirmationDurationMs: 2200,
      saveRestoreDurationMs: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 180,
    },
  });
  const [browserOpen, setBrowserOpen] = useState(false);
  const [passwordRevealed, setPasswordRevealed] = useState(true);
  const [savePromptPasswordRevealed, setSavePromptPasswordRevealed] = useState(false);
  const [guideHelpOpen, setGuideHelpOpen] = useState(false);
  const [successOverlayVisible, setSuccessOverlayVisible] = useState(false);
  const [autofillAnchor, setAutofillAnchor] = useState<'email' | 'password'>('email');
  const [loginEmailValue, setLoginEmailValue] = useState('');
  const [loginPasswordValue, setLoginPasswordValue] = useState('');
  const [emailAutofilled, setEmailAutofilled] = useState(false);
  const [passwordAutofilled, setPasswordAutofilled] = useState(false);

  const autofillEntries = useMemo<readonly S13AutofillEntry[]>(
    () => [
      {
        id: content.passwordManager.autofillAccounts[0].id,
        label: content.passwordManager.autofillAccounts[0].label,
        identifier: email,
        password: content.passwordManager.generatedPassword,
      },
      {
        id: content.passwordManager.autofillAccounts[1].id,
        label: content.passwordManager.autofillAccounts[1].label,
        identifier: identity.campusgram,
        password: resolvePredefinedPassphrase(passphraseIds.campusgram),
      },
      {
        id: content.passwordManager.autofillAccounts[2].id,
        label: content.passwordManager.autofillAccounts[2].label,
        identifier: identity.masterCampus,
        password: resolvePredefinedPassphrase(passphraseIds.masterCampus),
      },
      {
        id: content.passwordManager.autofillAccounts[3].id,
        label: content.passwordManager.autofillAccounts[3].label,
        identifier: identity.campusEmail,
        password: resolvePredefinedPassphrase(passphraseIds.campusEmail),
      },
    ],
    [content.passwordManager, email, identity, passphraseIds],
  );

  useEffect(() => {
    setBrowserOpen(true);
  }, []);

  const registration =
    state.matches('registration') ||
    state.matches('passwordSuggestion') ||
    state.matches('passwordGenerated') ||
    state.matches('registering');
  const suggestionVisible = state.matches('passwordSuggestion');
  const registering = state.matches('registering');
  const passwordGenerated = state.matches('passwordGenerated') || registering;
  const savePromptVisible = state.matches('savePrompt') || state.matches('savePromptRetry');
  const saveGuidanceFirst = state.matches('saveGuidanceFirst');
  const saveGuidanceSecond = state.matches('saveGuidanceSecond');
  const saveDeferred = state.matches('saveDeferred');
  const saveConfirmation = state.matches('saveConfirmation');
  const saveIconRestored = state.matches('saveIconRestored');
  const passwordSaved = state.matches('passwordSaved');
  const loginIdle = state.matches('loginIdle');
  const loginOffer = state.matches('loginOffer');
  const autofilling = state.matches('autofilling');
  const loginReady = state.matches('loginReady');
  const signedIn = state.matches('signedIn');
  const savePending =
    savePromptVisible || saveGuidanceFirst || saveGuidanceSecond || saveDeferred;
  const shopVisible =
    savePending || saveConfirmation || saveIconRestored || passwordSaved || signedIn;
  const passwordManagerReopenEnabled = saveGuidanceSecond || saveDeferred;

  useEffect(() => {
    if (signedIn) setSuccessOverlayVisible(true);
  }, [signedIn]);

  const completedCount = signedIn
    ? 3
    : loginReady
      ? 3
      : passwordSaved || loginIdle || loginOffer || autofilling
      ? 2
      : passwordGenerated || registering || savePending || saveConfirmation
        ? 1
        : 0;
  const progressStep = content.flow[Math.min(completedCount, content.flow.length - 1)];
  const progressTaskLabel = progressStep?.label ?? content.flow[0].label;
  const address = shopVisible
    ? content.browser.addresses.signedIn
    : registration
      ? content.browser.addresses.register
      : content.browser.addresses.login;
  const browserSnapshot: BrowserShellSnapshot = {
    tabs: [
      {
        id: content.browser.tabId,
        label: content.browser.tabLabel,
        icon: <MyShopAppIcon compact idSuffix="tab" />,
      },
    ],
    activeTabId: content.browser.tabId,
    address,
    accountIdentifier: email,
    scrollKey: `s13:${String(state.value)}`,
    dimmed: savePending,
    dimStrength: 'strong',
    passwordManager: {
      label: content.browser.passwordManagerLabel,
      active:
        suggestionVisible ||
        savePromptVisible ||
        loginOffer ||
        autofilling ||
        loginReady ||
        saveConfirmation,
      highlighted: saveGuidanceFirst || saveGuidanceSecond || saveDeferred,
      interactionEnabled: passwordManagerReopenEnabled,
      allowInteractionWhenDimmed: passwordManagerReopenEnabled,
      icon: saveConfirmation ? 'saved' : 'key',
      ...(saveConfirmation ? { statusLabel: content.passwordManager.savedStatus } : {}),
    },
  };

  const mandatoryGuideSpeech = saveGuidanceFirst
    ? {
        id: 's13-save-declined-first',
        text: content.guide.saveDeclined.first,
        action: {
          kind: 'advance' as const,
          label: 'Weiter',
          onAction: () => send({ type: 'CONTINUE_SAVE_GUIDANCE' }),
        },
      }
    : saveGuidanceSecond
      ? {
          id: 's13-save-declined-second',
          text: content.guide.saveDeclined.second,
        }
      : passwordSaved
        ? {
            id: 's13-password-saved',
            text: content.guide.saved,
            action: {
              kind: 'advance' as const,
              label: 'Weiter',
              onAction: () => {
                setPasswordRevealed(false);
                send({ type: 'CONTINUE_TO_LOGIN' });
              },
            },
          }
        : signedIn
          ? {
              id: 's13-practice-complete',
              text: content.guide.complete,
            }
          : null;
  const guideHint =
    completedCount === 0
      ? content.guide.hints.generate
      : completedCount === 1
        ? content.guide.hints.store
        : content.guide.hints.fill;
  const guideOpen = mandatoryGuideSpeech !== null || guideHelpOpen;
  const guideSpeechAction =
    mandatoryGuideSpeech !== null && 'action' in mandatoryGuideSpeech
      ? mandatoryGuideSpeech.action
      : guideHelpOpen && mandatoryGuideSpeech === null
        ? {
            kind: 'dismiss' as const,
            onAction: () => setGuideHelpOpen(false),
          }
        : undefined;

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
        {...(passwordManagerReopenEnabled
          ? {
              onPasswordManagerSelect: () => {
                setSavePromptPasswordRevealed(false);
                send({ type: 'OPEN_SAVE_PROMPT' });
              },
            }
          : {})}
        layers={{
          passWo: (
            <>
              {signedIn && successOverlayVisible ? (
                <AccountSuccessOverlay
                  label={content.website.signedInStatus}
                  onComplete={() => setSuccessOverlayVisible(false)}
                />
              ) : null}
              <PassWoGuide
                guideName={content.guide.name}
                taskLabel={progressTaskLabel}
                taskComplete={signedIn}
                progress={{
                  current: completedCount,
                  total: content.flow.length,
                  label: content.progressLabel(completedCount),
                }}
                helpOpen={guideOpen}
                helpId="s13-password-manager-speech"
                openHelpLabel={content.guide.helpLabel}
                speech={[mandatoryGuideSpeech?.text ?? guideHint]}
                speechKey={
                  mandatoryGuideSpeech?.id ?? `s13-help-${String(state.value)}-${completedCount}`
                }
                speechEmphasis={passWoSpeechEmphasisFor(mandatoryGuideSpeech?.id ?? '')}
                {...(guideSpeechAction === undefined ? {} : { speechAction: guideSpeechAction })}
                placement="bottom-left"
                showHelpButton={mandatoryGuideSpeech === null}
                showTaskStatusWhenSpeaking
                onToggleHelp={() => setGuideHelpOpen(true)}
              />
            </>
          ),
          controls: savePromptVisible ? (
            <PasswordSavePrompt
              email={email}
              password={content.passwordManager.generatedPassword}
              passwordRevealed={savePromptPasswordRevealed}
              onPasswordVisibilityToggle={() =>
                setSavePromptPasswordRevealed((revealed) => !revealed)
              }
              onSave={() => send({ type: 'SAVE_PASSWORD' })}
              onDismiss={() => {
                setSavePromptPasswordRevealed(false);
                send({ type: 'DISMISS_SAVE_PROMPT' });
              }}
            />
          ) : null,
        }}
      >
        {shopVisible ? (
          <SignedInBackdrop username={username} />
        ) : (
          <AuthBackdrop
            mode={registration ? 'register' : 'login'}
            emailValue={registration ? email : loginEmailValue}
            passwordValue={
              registration && passwordGenerated
                ? content.passwordManager.generatedPassword
                : loginPasswordValue
            }
            passwordGenerated={passwordGenerated}
            suggestionVisible={suggestionVisible}
            storedEntryVisible={
              loginOffer && loginEmailValue === '' && loginPasswordValue === ''
            }
            autofillAnchor={autofillAnchor}
            autofillEntries={autofillEntries}
            emailAutofilled={emailAutofilled}
            passwordAutofilled={passwordAutofilled}
            autofilling={autofilling}
            loginReady={loginReady}
            registering={registering}
            passwordRevealed={passwordRevealed}
            onEmailFieldSelect={() => {
              if (
                (!loginIdle && !loginOffer && !loginReady) ||
                loginEmailValue !== '' ||
                loginPasswordValue !== ''
              ) {
                return;
              }
              setAutofillAnchor('email');
              send({ type: 'LOGIN_FIELD_SELECTED' });
            }}
            onPasswordFieldSelect={() => {
              setGuideHelpOpen(false);
              if (registration) {
                send({ type: 'PASSWORD_FIELD_SELECTED' });
                return;
              }
              if (
                (!loginIdle && !loginOffer && !loginReady) ||
                loginEmailValue !== '' ||
                loginPasswordValue !== ''
              ) {
                return;
              }
              setAutofillAnchor('password');
              send({ type: 'LOGIN_FIELD_SELECTED' });
            }}
            onEmailChange={(value) => {
              setLoginEmailValue(value);
              setEmailAutofilled(false);
              send({ type: 'LOGIN_FIELD_EDITED' });
            }}
            onPasswordChange={(value) => {
              setLoginPasswordValue(value);
              setPasswordAutofilled(false);
              send({ type: 'LOGIN_FIELD_EDITED' });
            }}
            onPasswordSuggestionDismiss={() =>
              send({ type: 'PASSWORD_FIELD_DESELECTED' })
            }
            onPasswordSuggestionSelect={() => {
              setGuideHelpOpen(false);
              setPasswordRevealed(true);
              send({ type: 'PASSWORD_SUGGESTION_SELECTED' });
            }}
            onPasswordVisibilityToggle={() => setPasswordRevealed((revealed) => !revealed)}
            onRegister={() => {
              setGuideHelpOpen(false);
              send({ type: 'REGISTER' });
            }}
            onStoredEntrySelect={(entry) => {
              setGuideHelpOpen(false);
              setPasswordRevealed(false);
              setLoginEmailValue(entry.identifier);
              setLoginPasswordValue(entry.password);
              setEmailAutofilled(true);
              setPasswordAutofilled(true);
              send({ type: 'STORED_ENTRY_SELECTED', entryId: entry.id });
            }}
            onStoredEntryDismiss={() => send({ type: 'LOGIN_FIELD_DESELECTED' })}
            onLogin={() => {
              setGuideHelpOpen(false);
              send({ type: 'LOGIN' });
            }}
          />
        )}
      </BrowserShell>
    </section>
  );
}
