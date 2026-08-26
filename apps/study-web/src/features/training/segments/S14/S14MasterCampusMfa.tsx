import { s14MfaContent } from '@passwo/training-content';
import type { DragEvent, KeyboardEvent, ReactNode, SVGProps } from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import {
  campusDisplayNameInitial,
  CampusWebsiteBackdrop,
  type CampusWebsiteDashboardNavigationItem,
} from '../../CampusWebsiteBackdrop.js';
import styles from './S14MasterCampusMfa.module.css';

export type S14MasterCampusPhase =
  | 'dashboard'
  | 'settings'
  | 'security'
  | 'setup-awaiting-scan'
  | 'setup-scanned'
  | 'setup-code-entered'
  | 'mfa-activated'
  | 'login-autofilling'
  | 'second-factor'
  | 'second-factor-code-entered'
  | 'login-success'
  | 'signed-in';

type MasterCampusCardIcon =
  | (typeof s14MfaContent.browser.masterCampus.settings.cards)[number]['icon']
  | (typeof s14MfaContent.browser.masterCampus.security.cards)[number]['icon'];

interface PortalIconProps extends SVGProps<SVGSVGElement> {
  readonly kind: MasterCampusCardIcon | 'chevron' | 'search' | 'bell';
}

function PortalIcon({ kind, ...props }: PortalIconProps) {
  const paths = (() => {
    switch (kind) {
      case 'shield':
        return <><path d="M12 3.4 19 6v5.3c0 4.4-2.4 7.4-7 9.3-4.6-1.9-7-4.9-7-9.3V6z" /><path d="m9.1 12 1.9 1.9 4-4.4" /></>;
      case 'shield-lock':
        return <><path d="M12 3.4 19 6v5.3c0 4.4-2.4 7.4-7 9.3-4.6-1.9-7-4.9-7-9.3V6z" /><rect x="9.1" y="10.8" width="5.8" height="4.7" rx="1" /><path d="M10.4 10.8V9.6a1.6 1.6 0 0 1 3.2 0v1.2" /></>;
      case 'profile':
        return <><circle cx="12" cy="8" r="3.2" /><path d="M5.2 20c.5-4.3 2.7-6.4 6.8-6.4s6.3 2.1 6.8 6.4" /></>;
      case 'notification':
      case 'bell':
        return <><path d="M6 17.2h12l-1.7-2.4v-4a4.3 4.3 0 0 0-8.6 0v4z" /><path d="M10 19.2c.5.7 1.2 1 2 1s1.5-.3 2-1" /></>;
      case 'lock':
        return <><rect x="5.2" y="9.6" width="13.6" height="10.2" rx="1.7" /><path d="M8.2 9.6V7.4a3.8 3.8 0 0 1 7.6 0v2.2M12 13.3v3" /></>;
      case 'devices':
        return <><rect x="3.6" y="5" width="11.8" height="9.1" rx="1.2" /><path d="M7.2 18.6h4.5M9.5 14.1v4.5" /><rect x="15.5" y="9.2" width="5" height="10.3" rx="1" /></>;
      case 'session':
        return <><circle cx="9.2" cy="8" r="3" /><path d="M3.8 19c.4-4 2.2-6 5.4-6 2.1 0 3.7.8 4.6 2.4" /><circle cx="17.1" cy="16.9" r="4" /><path d="M17.1 14.6v2.5l1.7 1" /></>;
      case 'recovery':
        return <><path d="M18.7 8.2A7.5 7.5 0 0 0 5.2 7l-1.4 2M5.3 15.8A7.5 7.5 0 0 0 18.8 17l1.4-2" /><path d="M3.8 5.3V9h3.7M20.2 18.7V15h-3.7" /></>;
      case 'chevron':
        return <path d="m9.5 6.8 5.2 5.2-5.2 5.2" />;
      case 'search':
        return <><circle cx="10.4" cy="10.4" r="5.3" /><path d="m14.5 14.5 4.6 4.6" /></>;
    }
  })();

  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths}
    </svg>
  );
}

function MasterCampusUtilityBar({ displayName }: { readonly displayName: string }) {
  const content = s14MfaContent.browser.masterCampus;
  return (
    <div className={styles.utilityBar} aria-hidden="true">
      <span className={styles.searchControl} aria-label={content.utilitySearchLabel}>
        <PortalIcon kind="search" />
        <i />
      </span>
      <span className={styles.utilityIcon}><PortalIcon kind="bell" /></span>
      <span className={styles.avatar}>{campusDisplayNameInitial(displayName)}</span>
    </div>
  );
}

function Breadcrumbs({ items }: { readonly items: readonly string[] }) {
  return (
    <nav
      className={styles.breadcrumbs}
      aria-label={s14MfaContent.browser.masterCampus.breadcrumbsAriaLabel}
    >
      {items.map((item, index) => (
        <span key={item}>
          {item}
          {index < items.length - 1 ? <PortalIcon kind="chevron" /> : null}
        </span>
      ))}
    </nav>
  );
}

function PortalHeading({
  breadcrumbs,
  description,
  displayName,
  title,
}: {
  readonly breadcrumbs?: readonly string[] | undefined;
  readonly description: string;
  readonly displayName: string;
  readonly title: string;
}) {
  return (
    <header className={styles.portalHeading}>
      <div>
        {breadcrumbs === undefined ? null : <Breadcrumbs items={breadcrumbs} />}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <MasterCampusUtilityBar displayName={displayName} />
    </header>
  );
}

function SettingsCardList({
  cards,
  onPrimaryAction,
}: {
  readonly cards: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly interactive: boolean;
    readonly icon: MasterCampusCardIcon;
  }[];
  readonly onPrimaryAction: () => void;
}) {
  return (
    <section
      className={styles.settingsCards}
      aria-label={s14MfaContent.browser.masterCampus.settings.cardsAriaLabel}
    >
      {cards.map((card) => {
        const content = (
          <>
            <span className={styles.cardIcon}><PortalIcon kind={card.icon} /></span>
            <span className={styles.cardCopy}>
              <strong>{card.title}</strong>
              <span>{card.description}</span>
            </span>
            <PortalIcon className={styles.cardChevron} kind="chevron" />
          </>
        );
        return card.interactive ? (
          <button
            type="button"
            className={styles.settingsCard}
            data-guided-highlight="true"
            key={card.id}
            onClick={onPrimaryAction}
          >
            {content}
          </button>
        ) : (
          <article className={styles.settingsCard} key={card.id}>
            {content}
          </article>
        );
      })}
    </section>
  );
}

function isFinderModule(x: number, y: number, originX: number, originY: number): boolean {
  const localX = x - originX;
  const localY = y - originY;
  if (localX < 0 || localX > 6 || localY < 0 || localY > 6) return false;
  return (
    localX === 0 || localX === 6 || localY === 0 || localY === 6 ||
    (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4)
  );
}

function isFinderArea(x: number, y: number): boolean {
  return (
    (x <= 7 && y <= 7) ||
    (x >= 21 && y <= 7) ||
    (x <= 7 && y >= 21)
  );
}

function FictionalQrCode({ compact = false }: { readonly compact?: boolean }) {
  const modules: ReactNode[] = [];
  for (let y = 0; y < 29; y += 1) {
    for (let x = 0; x < 29; x += 1) {
      const finder =
        isFinderModule(x, y, 0, 0) ||
        isFinderModule(x, y, 22, 0) ||
        isFinderModule(x, y, 0, 22);
      const dataModule =
        !isFinderArea(x, y) &&
        ((x * 7 + y * 11 + x * y * 3 + (x + y) % 5) % 13 < 6);
      if (!finder && !dataModule) continue;
      modules.push(<rect width="1" height="1" x={x} y={y} key={`${x}-${y}`} />);
    }
  }
  return (
    <svg
      className={compact ? styles.miniQrCode : styles.qrCode}
      viewBox="-2 -2 33 33"
      shapeRendering="crispEdges"
      role={compact ? undefined : 'img'}
      aria-label={compact ? undefined : s14MfaContent.browser.masterCampus.twoFactor.qrCodeLabel}
      aria-hidden={compact || undefined}
    >
      <rect width="33" height="33" x="-2" y="-2" fill="white" />
      <g fill="black">{modules}</g>
    </svg>
  );
}

function CodeBoxes({ code }: { readonly code: string | null }) {
  const content = s14MfaContent.browser.masterCampus.login;
  const digits = code === null ? Array.from({ length: 6 }, () => '') : Array.from(code);
  return (
    <output
      className={styles.codeBoxes}
      aria-label={code === null ? content.emptyCodeLabel : content.codeLabel(code)}
    >
      {digits.map((digit, index) => (
        <span data-filled={digit !== '' || undefined} key={index}>{digit}</span>
      ))}
    </output>
  );
}

function PhoneFrame({ children }: { readonly children: ReactNode }) {
  return (
    <div className={styles.phoneFrame}>
      <span className={styles.phoneSpeaker} aria-hidden="true" />
      <span className={styles.phoneStatus} aria-hidden="true">
        <b>9:41</b><i>● ● ▰</i>
      </span>
      <div className={styles.phoneScreen}>{children}</div>
      <span className={styles.phoneHome} aria-hidden="true" />
    </div>
  );
}

function ScannerScreen() {
  const content = s14MfaContent.browser.masterCampus.authenticator;
  return (
    <div className={styles.scannerScreen}>
      <strong>‹ <span>{content.scannerTitle}</span></strong>
      <small>{content.scannerInstruction}</small>
      <span className={styles.scannerFrame}><FictionalQrCode compact /></span>
    </div>
  );
}

function AuthenticatorScreen({
  code,
  onUseCode,
}: {
  readonly code: string;
  readonly onUseCode?: (() => void) | undefined;
}) {
  const content = s14MfaContent.browser.masterCampus.authenticator;
  const codeContent = (
    <>
      <span className={styles.authenticatorAccount}>
        <NetworkSymbol symbolId="master-campus" />
        <span><strong>{content.accountLabel}</strong><small>{content.accountIdentifier}</small></span>
      </span>
      <span className={styles.authenticatorCodeRow}>
        <strong key={code}>{code.slice(0, 3)} {code.slice(3)}</strong>
        <i aria-hidden="true">23</i>
      </span>
    </>
  );
  return (
    <div className={styles.authenticatorScreen}>
      <span className={styles.authenticatorTitle}>☰ <strong>{content.appTitle}</strong> ＋</span>
      {onUseCode === undefined ? (
        <div className={styles.authenticatorEntry}>{codeContent}</div>
      ) : (
        <button
          type="button"
          className={styles.authenticatorEntry}
          aria-label={content.useCodeAction}
          data-guided-highlight="true"
          onClick={onUseCode}
        >
          {codeContent}
        </button>
      )}
      <span className={styles.authenticatorNav} aria-hidden="true">▦　◷　⚙</span>
    </div>
  );
}

function AuthenticatorPhone({
  code,
  onScan,
  onUseCode,
  scanned,
}: {
  readonly code: string;
  readonly onScan?: (() => void) | undefined;
  readonly onUseCode?: (() => void) | undefined;
  readonly scanned: boolean;
}) {
  const content = s14MfaContent.browser.masterCampus.authenticator;
  if (!scanned && onScan !== undefined) {
    return (
      <div
        className={`${styles.phone} ${styles.scannablePhone}`}
        draggable
        role="button"
        tabIndex={0}
        aria-label={content.scanAction}
        title={content.scanAction}
        onClick={onScan}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onScan();
        }}
        onDragStart={(event: DragEvent<HTMLDivElement>) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', 's14-authenticator-phone');
        }}
      >
        <PhoneFrame><ScannerScreen /></PhoneFrame>
      </div>
    );
  }
  return (
    <section className={styles.phone} aria-label={content.phoneAriaLabel}>
      <PhoneFrame><AuthenticatorScreen code={code} onUseCode={onUseCode} /></PhoneFrame>
    </section>
  );
}

function TwoFactorSetup({
  activated,
  code,
  codeEntered,
  displayName,
  onActivate,
  onScan,
  onUseCode,
  scanned,
}: {
  readonly activated: boolean;
  readonly code: string;
  readonly codeEntered: boolean;
  readonly displayName: string;
  readonly onActivate: () => void;
  readonly onScan: () => void;
  readonly onUseCode: () => void;
  readonly scanned: boolean;
}) {
  const content = s14MfaContent.browser.masterCampus.twoFactor;
  return (
    <div className={styles.portalPage} data-phone-visible={!activated || undefined}>
      <PortalHeading
        breadcrumbs={content.breadcrumbs}
        title={content.title}
        description={content.description}
        displayName={displayName}
      />
      <section className={styles.statusBanner} data-active={activated || undefined}>
        <span><PortalIcon kind="shield-lock" /></span>
        <div>
          <strong>{activated ? content.activeStatus : content.inactiveStatus}</strong>
          <small>
            {activated
              ? content.statusDescription
              : content.inactiveStatusDescription}
          </small>
        </div>
        {activated ? <b aria-hidden="true">✓</b> : null}
      </section>
      {activated ? null : (
        <section className={styles.setupGrid}>
          <article className={styles.setupCard}>
            <h2>{content.setupTitle}</h2>
            <p>{content.setupDescription}</p>
            <div
              className={styles.qrDropZone}
              data-guided-highlight={!scanned || undefined}
              data-scanned={scanned || undefined}
              aria-label={content.qrDropLabel}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (event.dataTransfer.getData('text/plain') === 's14-authenticator-phone') onScan();
              }}
            >
              <FictionalQrCode />
              {scanned ? (
                <span className={styles.scannedMark} aria-label={content.qrScannedLabel}>
                  ✓
                </span>
              ) : null}
            </div>
          </article>
          <article className={styles.setupCard}>
            <h2>{content.codeTitle}</h2>
            <p>{content.codeDescription}</p>
            <CodeBoxes code={codeEntered ? code : null} />
            <button
              type="button"
              className={styles.primaryAction}
              disabled={!codeEntered}
              onClick={onActivate}
            >
              {content.activateAction}
            </button>
            <p className={styles.activationNotice}><PortalIcon kind="shield-lock" />{content.activatedNotice}</p>
          </article>
        </section>
      )}
      {activated ? null : (
        <div className={styles.phoneDock}>
          <AuthenticatorPhone
            code={code}
            scanned={scanned}
            onScan={onScan}
            {...(scanned && !codeEntered ? { onUseCode } : {})}
          />
        </div>
      )}
    </div>
  );
}

function MasterCampusPublicHeader() {
  const content = s14MfaContent.browser.masterCampus;
  return (
    <header className={styles.publicHeader}>
      <span>
        <NetworkSymbol symbolId="master-campus" />
        <strong>{s14MfaContent.browser.masterCampus.authenticator.accountLabel}</strong>
      </span>
      <nav aria-label={content.login.publicNavigationAriaLabel}>
        <span>{content.login.helpLabel}</span>
        <span>{content.login.languageLabel}</span>
      </nav>
    </header>
  );
}

function LoginAutofill({ displayName }: { readonly displayName: string }) {
  const content = s14MfaContent.browser.masterCampus.login;
  const username = displayName.trim() || content.usernameFallback;
  return (
    <div className={styles.publicPage}>
      <MasterCampusPublicHeader />
      <main className={styles.loginLayout}>
        <section className={styles.loginCard} data-autofilling="true" aria-label={content.title}>
          <span className={styles.loginShield}><PortalIcon kind="shield-lock" /></span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <label><span>{content.usernameLabel}</span><output>{username}</output></label>
          <label><span>{content.passwordLabel}</span><output>{content.maskedPassword}</output></label>
          <span className={styles.autofillStatus}><i aria-hidden="true">⌁</i>{content.automaticStatus}</span>
        </section>
      </main>
    </div>
  );
}

function SecondFactorLogin({
  code,
  codeEntered,
  onConfirm,
  onUseCode,
}: {
  readonly code: string;
  readonly codeEntered: boolean;
  readonly onConfirm: () => void;
  readonly onUseCode: () => void;
}) {
  const content = s14MfaContent.browser.masterCampus.login;
  return (
    <div className={styles.publicPage}>
      <MasterCampusPublicHeader />
      <main className={styles.secondFactorLayout}>
        <section className={styles.loginCard} aria-label={content.secondFactorTitle}>
          <span className={styles.loginShield}><PortalIcon kind="shield-lock" /></span>
          <h1>{content.secondFactorTitle}</h1>
          <p>{content.secondFactorDescription}</p>
          <CodeBoxes code={codeEntered ? code : null} />
          <button
            type="button"
            className={styles.primaryAction}
            disabled={!codeEntered}
            onClick={onConfirm}
          >
            {content.confirmAction}
          </button>
          <span className={styles.backHint}>← {content.backAction}</span>
        </section>
        <div className={styles.loginPhoneDock}>
          <AuthenticatorPhone
            code={code}
            scanned
            {...(!codeEntered ? { onUseCode } : {})}
          />
        </div>
      </main>
    </div>
  );
}

export function S14MasterCampusMfa({
  authenticatorCode,
  displayName,
  onActivateMfa,
  onConfirmSecondFactor,
  onOpenOverview,
  onOpenSecurity,
  onOpenSettings,
  onOpenTwoFactor,
  onScanQrCode,
  onUseAuthenticatorCode,
  phase,
}: {
  readonly authenticatorCode: string;
  readonly displayName: string;
  readonly onActivateMfa: () => void;
  readonly onConfirmSecondFactor: () => void;
  readonly onOpenOverview: () => void;
  readonly onOpenSecurity: () => void;
  readonly onOpenSettings: () => void;
  readonly onOpenTwoFactor: () => void;
  readonly onScanQrCode: () => void;
  readonly onUseAuthenticatorCode: () => void;
  readonly phase: S14MasterCampusPhase;
}) {
  const content = s14MfaContent.browser.masterCampus;
  if (phase === 'login-autofilling') return <LoginAutofill displayName={displayName} />;
  if (phase === 'second-factor' || phase === 'second-factor-code-entered') {
    return (
      <SecondFactorLogin
        code={authenticatorCode}
        codeEntered={phase === 'second-factor-code-entered'}
        onConfirm={onConfirmSecondFactor}
        onUseCode={onUseAuthenticatorCode}
      />
    );
  }

  const overviewActive = phase === 'dashboard' || phase === 'login-success' || phase === 'signed-in';
  const navigationItems: readonly CampusWebsiteDashboardNavigationItem[] = content.navigation.map(
    (item) => ({
      label: item.label,
      active: item.id === (overviewActive ? 'overview' : 'settings'),
      ...(item.interactive && item.id === 'overview'
        ? { onClick: onOpenOverview }
        : item.interactive && item.id === 'settings'
          ? { onClick: onOpenSettings }
          : {}),
    }),
  );

  const sharedBackdropProps = {
    accountId: 'master-campus' as const,
    dashboardNavigationItems: navigationItems,
    displayName,
    interactionLabel: content.interactionLabel,
    view: 'dashboard' as const,
  };

  if (overviewActive) return <CampusWebsiteBackdrop {...sharedBackdropProps} />;

  if (phase === 'settings') {
    return (
      <CampusWebsiteBackdrop {...sharedBackdropProps}>
        <div className={styles.portalPage}>
          <PortalHeading
            title={content.settings.title}
            description={content.settings.description}
            displayName={displayName}
          />
          <SettingsCardList cards={content.settings.cards} onPrimaryAction={onOpenSecurity} />
        </div>
      </CampusWebsiteBackdrop>
    );
  }

  if (phase === 'security') {
    return (
      <CampusWebsiteBackdrop {...sharedBackdropProps}>
        <div className={styles.portalPage}>
          <PortalHeading
            breadcrumbs={content.security.breadcrumbs}
            title={content.security.title}
            description={content.security.description}
            displayName={displayName}
          />
          <SettingsCardList cards={content.security.cards} onPrimaryAction={onOpenTwoFactor} />
        </div>
      </CampusWebsiteBackdrop>
    );
  }

  return (
    <CampusWebsiteBackdrop {...sharedBackdropProps}>
      <TwoFactorSetup
        activated={phase === 'mfa-activated'}
        code={authenticatorCode}
        codeEntered={phase === 'setup-code-entered' || phase === 'mfa-activated'}
        displayName={displayName}
        onActivate={onActivateMfa}
        onScan={onScanQrCode}
        onUseCode={onUseAuthenticatorCode}
        scanned={phase !== 'setup-awaiting-scan'}
      />
    </CampusWebsiteBackdrop>
  );
}
