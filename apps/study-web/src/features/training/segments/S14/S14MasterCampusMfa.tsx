import { s14MfaContent } from '@passwo/training-content';
import { deriveCampusIdentity } from '@passwo/training-engine';
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  type SVGProps,
} from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import {
  campusDisplayNameInitial,
  CampusWebsiteBackdrop,
  type CampusWebsiteDashboardNavigationItem,
} from '../../CampusWebsiteBackdrop.js';
import { PasswordVisibilityIcon } from '../../PasswordVisibilityIcon.js';
import { SimulatedPasswordInput } from '../../SimulatedPasswordInput.js';
import s03Styles from '../S03/S03RetrievalTraining.module.css';
import styles from './S14MasterCampusMfa.module.css';

export type S14MasterCampusPhase =
  | 'dashboard'
  | 'settings'
  | 'security'
  | 'setup-awaiting-scan'
  | 'setup-recognizing'
  | 'setup-scan-confirmed'
  | 'setup-scanned'
  | 'setup-code-entered'
  | 'mfa-activated'
  | 'login-autofilling'
  | 'login-ready'
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

function FictionalQrCode() {
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
      className={styles.qrCode}
      viewBox="-2 -2 33 33"
      shapeRendering="crispEdges"
      role="img"
      aria-label={s14MfaContent.browser.masterCampus.twoFactor.qrCodeLabel}
    >
      <rect width="33" height="33" x="-2" y="-2" fill="white" />
      <g fill="black">{modules}</g>
    </svg>
  );
}

function VerificationCodeInput({
  descriptionId,
  disabled = false,
  idPrefix,
  label,
  value,
  onChange,
}: {
  readonly descriptionId?: string;
  readonly disabled?: boolean;
  readonly idPrefix: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '');

  function focusDigit(index: number): void {
    inputRefs.current[Math.min(5, Math.max(0, index))]?.focus();
  }

  return (
    <div
      className={styles.codeBoxes}
      role="group"
      aria-label={label}
      aria-describedby={descriptionId}
      data-guided-highlight={!disabled || undefined}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          id={`${idPrefix}-${index + 1}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={1}
          value={digit}
          data-filled={digit !== '' || undefined}
          aria-label={s14MfaContent.browser.masterCampus.login.codeDigitLabel(index + 1)}
          aria-describedby={descriptionId}
          disabled={disabled}
          onFocus={(event) => {
            if (index > value.length) {
              focusDigit(value.length);
              return;
            }
            event.currentTarget.select();
          }}
          onPaste={(event) => event.preventDefault()}
          onDrop={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              focusDigit(index - 1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              focusDigit(index + 1);
            } else if (event.key === 'Backspace' && digit === '' && index > 0) {
              event.preventDefault();
              onChange(`${value.slice(0, index - 1)}${value.slice(index)}`);
              focusDigit(index - 1);
            }
          }}
          onChange={(event) => {
            const nextDigit = event.currentTarget.value.replace(/\D/gu, '').slice(-1);
            const nextValue = nextDigit === ''
              ? `${value.slice(0, index)}${value.slice(index + 1)}`
              : `${value.slice(0, index)}${nextDigit}${value.slice(index + 1)}`.slice(0, 6);
            onChange(nextValue);
            if (nextDigit !== '' && index < 5) focusDigit(index + 1);
          }}
        />
      ))}
    </div>
  );
}

function PhoneFrame({
  cameraActive,
  children,
}: {
  readonly cameraActive: boolean;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles.phoneFrame} data-camera-active={cameraActive || undefined}>
      <span className={styles.phoneSpeaker} aria-hidden="true" />
      <span className={styles.phoneStatus} aria-hidden="true">
        <b>9:41</b><i>● ● ▰</i>
      </span>
      <div className={styles.phoneScreen}>{children}</div>
      <span className={styles.phoneHome} aria-hidden="true" />
    </div>
  );
}

type ScannerStatus = 'scanner' | 'recognizing' | 'confirmed';

function ScannerScreen({ status }: { readonly status: ScannerStatus }) {
  const content = s14MfaContent.browser.masterCampus.authenticator;
  return (
    <div className={styles.scannerScreen} data-status={status}>
      <strong>‹ <span>{content.scannerTitle}</span></strong>
      <small>{content.scannerInstruction}</small>
      <span className={styles.scannerFrame} aria-hidden="true">
        {status === 'scanner' ? null : (
          <span className={styles.scannerFeedback} data-confirmed={status === 'confirmed' || undefined}>
            <i>{status === 'confirmed' ? '✓' : ''}</i>
            <b>
              {status === 'confirmed'
                ? content.scanConfirmedStatus
                : content.recognizingStatus}
            </b>
          </span>
        )}
      </span>
      {status === 'scanner' ? null : (
        <span className={styles.scannerLiveStatus} role="status">
          {status === 'confirmed'
            ? content.scanConfirmedStatus
            : content.recognizingStatus}
        </span>
      )}
    </div>
  );
}

function AuthenticatorScreen({
  code,
  countdownDuration,
  secondsRemaining,
}: {
  readonly code: string;
  readonly countdownDuration: number;
  readonly secondsRemaining: number;
}) {
  const content = s14MfaContent.browser.masterCampus.authenticator;
  const countdownCircumference = 2 * Math.PI * 8;
  const countdownProgress = countdownDuration === 0
    ? 0
    : secondsRemaining / countdownDuration;
  return (
    <div className={styles.authenticatorScreen}>
      <span className={styles.authenticatorTitle}>☰ <strong>{content.appTitle}</strong> ＋</span>
      <div className={styles.authenticatorEntry}>
        <span className={styles.authenticatorAccount}>
          <NetworkSymbol symbolId="master-campus" />
          <span>
            <strong>{content.accountLabel}</strong>
            <small>{content.accountIdentifier}</small>
          </span>
        </span>
        <span className={styles.authenticatorCodeRow}>
          <strong key={code}>{code.slice(0, 3)} {code.slice(3)}</strong>
          <output aria-label={content.countdownLabel(secondsRemaining)}>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <circle className={styles.countdownTrack} cx="10" cy="10" r="8" />
              <circle
                className={styles.countdownProgress}
                cx="10"
                cy="10"
                r="8"
                strokeDasharray={countdownCircumference}
                strokeDashoffset={countdownCircumference * (1 - countdownProgress)}
              />
            </svg>
            <span>{secondsRemaining}</span>
          </output>
        </span>
      </div>
      <span className={styles.authenticatorNav} aria-hidden="true">▦　◷　⚙</span>
    </div>
  );
}

interface PhoneOffset {
  readonly x: number;
  readonly y: number;
}

interface PhoneDragSession {
  readonly boundaryRect: DOMRect;
  readonly phoneRect: DOMRect;
  readonly pointerId: number;
  readonly pointerX: number;
  readonly pointerY: number;
  readonly startOffset: PhoneOffset;
}

function boundedDragOffset(
  session: PhoneDragSession,
  pointerX: number,
  pointerY: number,
): PhoneOffset {
  const horizontalDelta = Math.min(
    session.boundaryRect.right - session.phoneRect.right,
    Math.max(
      session.boundaryRect.left - session.phoneRect.left,
      pointerX - session.pointerX,
    ),
  );
  const verticalDelta = Math.min(
    session.boundaryRect.bottom - session.phoneRect.bottom,
    Math.max(
      session.boundaryRect.top - session.phoneRect.top,
      pointerY - session.pointerY,
    ),
  );
  return {
    x: session.startOffset.x + horizontalDelta,
    y: session.startOffset.y + verticalDelta,
  };
}

function phoneCameraIntersectsTarget(
  phoneRect: DOMRect,
  offsetDelta: PhoneOffset,
  target: HTMLElement,
): boolean {
  const targetRect = target.getBoundingClientRect();
  const cameraX = phoneRect.left + offsetDelta.x + phoneRect.width * 0.5;
  const cameraY = phoneRect.top + offsetDelta.y + phoneRect.height * 0.58;
  return (
    cameraX >= targetRect.left &&
    cameraX <= targetRect.right &&
    cameraY >= targetRect.top &&
    cameraY <= targetRect.bottom
  );
}

function PhoneMoveHandles() {
  return (
    <span className={styles.phoneMoveHandles} aria-hidden="true">
      <i data-side="left">☝</i>
      <i data-side="right">☝</i>
    </span>
  );
}

export function S14AuthenticatorPhone({
  code,
  countdownDuration,
  mode,
  onScan,
  qrTargetRef,
  secondsRemaining,
}: {
  readonly code: string;
  readonly countdownDuration: number;
  readonly mode: 'scanner' | 'recognizing' | 'confirmed' | 'codes';
  readonly onScan?: (() => void) | undefined;
  readonly qrTargetRef?: RefObject<HTMLDivElement | null> | undefined;
  readonly secondsRemaining: number;
}) {
  const content = s14MfaContent.browser.masterCampus.authenticator;
  const dragSessionRef = useRef<PhoneDragSession | null>(null);
  const scanTriggeredRef = useRef(false);
  const [offset, setOffset] = useState<PhoneOffset>({ x: 0, y: 0 });

  function scanAtOffset(phoneRect: DOMRect, offsetDelta: PhoneOffset): void {
    const target = qrTargetRef?.current;
    if (mode !== 'scanner' || scanTriggeredRef.current || target === null || target === undefined) {
      return;
    }
    if (!phoneCameraIntersectsTarget(phoneRect, offsetDelta, target)) return;
    scanTriggeredRef.current = true;
    onScan?.();
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>): void {
    const boundary = event.currentTarget.closest<HTMLElement>('[data-s14-phone-boundary]');
    if (boundary === null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragSessionRef.current = {
      boundaryRect: boundary.getBoundingClientRect(),
      phoneRect: event.currentTarget.getBoundingClientRect(),
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startOffset: offset,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>): void {
    const session = dragSessionRef.current;
    if (session === null || session.pointerId !== event.pointerId) return;
    const nextOffset = boundedDragOffset(session, event.clientX, event.clientY);
    setOffset(nextOffset);
    scanAtOffset(session.phoneRect, {
      x: nextOffset.x - session.startOffset.x,
      y: nextOffset.y - session.startOffset.y,
    });
  }

  function finishPointerMove(event: PointerEvent<HTMLElement>): void {
    if (dragSessionRef.current?.pointerId !== event.pointerId) return;
    dragSessionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyboardMove(event: KeyboardEvent<HTMLElement>): void {
    const step = event.shiftKey ? 48 : 24;
    const delta = event.key === 'ArrowLeft'
      ? { x: -step, y: 0 }
      : event.key === 'ArrowRight'
        ? { x: step, y: 0 }
        : event.key === 'ArrowUp'
          ? { x: 0, y: -step }
          : event.key === 'ArrowDown'
            ? { x: 0, y: step }
            : null;
    if (delta === null) return;
    const boundary = event.currentTarget.closest<HTMLElement>('[data-s14-phone-boundary]');
    if (boundary === null) return;
    event.preventDefault();
    const phoneRect = event.currentTarget.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const boundedDelta = {
      x: Math.min(
        boundaryRect.right - phoneRect.right,
        Math.max(boundaryRect.left - phoneRect.left, delta.x),
      ),
      y: Math.min(
        boundaryRect.bottom - phoneRect.bottom,
        Math.max(boundaryRect.top - phoneRect.top, delta.y),
      ),
    };
    setOffset((current) => ({
      x: current.x + boundedDelta.x,
      y: current.y + boundedDelta.y,
    }));
    scanAtOffset(phoneRect, boundedDelta);
  }

  return (
    <section
      className={`${styles.phone} ${styles.floatingPhone}`}
      role="group"
      tabIndex={0}
      aria-label={mode === 'scanner' ? content.scanAction : content.movePhoneAction}
      title={mode === 'scanner' ? content.scanAction : content.movePhoneAction}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      onKeyDown={handleKeyboardMove}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerMove}
      onPointerCancel={finishPointerMove}
    >
      <PhoneMoveHandles />
      <PhoneFrame cameraActive={mode !== 'codes'}>
        {mode === 'codes' ? (
          <AuthenticatorScreen
            code={code}
            countdownDuration={countdownDuration}
            secondsRemaining={secondsRemaining}
          />
        ) : (
          <ScannerScreen status={mode} />
        )}
      </PhoneFrame>
    </section>
  );
}

function TwoFactorSetup({
  activated,
  codeEntered,
  codeInput,
  displayName,
  onActivate,
  onCodeInputChange,
  qrTargetRef,
  scanMode,
}: {
  readonly activated: boolean;
  readonly codeEntered: boolean;
  readonly codeInput: string;
  readonly displayName: string;
  readonly onActivate: () => void;
  readonly onCodeInputChange: (value: string) => void;
  readonly qrTargetRef: RefObject<HTMLDivElement | null>;
  readonly scanMode: 'scanner' | 'recognizing' | 'confirmed' | 'codes';
}) {
  const content = s14MfaContent.browser.masterCampus.twoFactor;
  const scanned = scanMode === 'confirmed' || scanMode === 'codes';
  return (
    <div className={styles.portalPage}>
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
              ref={qrTargetRef}
              className={styles.qrDropZone}
              data-guided-highlight={scanMode === 'scanner' || undefined}
              data-recognizing={scanMode === 'recognizing' || undefined}
              data-scanned={scanned || undefined}
              aria-label={content.qrDropLabel}
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
            <p id="s14-setup-code-description">{content.codeDescription}</p>
            <VerificationCodeInput
              descriptionId="s14-setup-code-description"
              disabled={scanMode !== 'codes'}
              idPrefix="s14-setup-code"
              label={content.codeTitle}
              value={codeInput}
              onChange={onCodeInputChange}
            />
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
    </div>
  );
}

function LoginAutofill({
  autofilling,
  displayName,
  masterCampusPassword,
  onSubmit,
}: {
  readonly autofilling: boolean;
  readonly displayName: string;
  readonly masterCampusPassword: string;
  readonly onSubmit: () => void;
}) {
  const content = s14MfaContent.browser.masterCampus.login;
  const username = deriveCampusIdentity(displayName).masterCampus;
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  return (
    <CampusWebsiteBackdrop
      accountId="master-campus"
      interactionLabel={content.description}
      view="authentication"
      authenticationTitle={content.title}
    >
      <div className={`${s03Styles.relationshipStage} ${styles.authenticationStage}`}>
        <form
          className={s03Styles.authCard}
          data-assisted="true"
          onSubmit={(event) => {
            event.preventDefault();
            if (!autofilling) onSubmit();
          }}
        >
          <label className={s03Styles.usernameLabel} htmlFor="s14-login-username">
            {content.usernameLabel}
          </label>
          <input
            id="s14-login-username"
            className={`${s03Styles.usernameInput} ${styles.autofilledInput}`}
            type="text"
            autoComplete="off"
            value={username}
            readOnly
            aria-readonly="true"
          />
          <label className={s03Styles.passwordLabel} htmlFor="s14-login-password">
            {content.passwordLabel}
          </label>
          <span
            className={`${s03Styles.passwordInputGroup} ${styles.loginPasswordGroup}`}
            data-autofill={autofilling ? 'running' : 'ready'}
          >
            <SimulatedPasswordInput
              id="s14-login-password"
              masked={!passwordRevealed}
              value={masterCampusPassword}
              readOnly
              aria-readonly="true"
            />
            <button
              type="button"
              className={`${s03Styles.revealButton} ${styles.compactRevealButton}`}
              aria-label={
                passwordRevealed
                  ? content.hidePasswordLabel
                  : content.showPasswordLabel
              }
              aria-pressed={passwordRevealed}
              onClick={() => setPasswordRevealed((revealed) => !revealed)}
            >
              <PasswordVisibilityIcon
                className={styles.compactRevealIcon}
                revealed={passwordRevealed}
              />
            </button>
          </span>
          <div className={s03Styles.buttonRow}>
            <button
              type="submit"
              className={s03Styles.primaryButton}
              disabled={autofilling}
            >
              {content.title}
            </button>
          </div>
        </form>
      </div>
    </CampusWebsiteBackdrop>
  );
}

function MasterCampusPublicHeader() {
  const content = s14MfaContent.browser.masterCampus;
  return (
    <header className={styles.publicHeader}>
      <span>
        <NetworkSymbol symbolId="master-campus" />
        <strong>{content.authenticator.accountLabel}</strong>
      </span>
      <nav aria-label={content.login.publicNavigationAriaLabel}>
        <span>{content.login.helpLabel}</span>
        <span>{content.login.languageLabel}</span>
      </nav>
    </header>
  );
}

function SecondFactorLogin({
  codeEntered,
  codeInput,
  onConfirm,
  onCodeInputChange,
}: {
  readonly codeEntered: boolean;
  readonly codeInput: string;
  readonly onConfirm: () => void;
  readonly onCodeInputChange: (value: string) => void;
}) {
  const content = s14MfaContent.browser.masterCampus.login;
  return (
    <div className={styles.publicPage}>
      <MasterCampusPublicHeader />
      <main className={styles.secondFactorLayout}>
        <form
          className={styles.loginCard}
          aria-label={content.secondFactorTitle}
          onSubmit={(event) => {
            event.preventDefault();
            if (codeEntered) onConfirm();
          }}
        >
          <span className={styles.loginShield}><PortalIcon kind="shield-lock" /></span>
          <h1>{content.secondFactorTitle}</h1>
          <p id="s14-login-code-description" className={styles.secondFactorDescription}>
            {content.secondFactorDescription}
          </p>
          <VerificationCodeInput
            descriptionId="s14-login-code-description"
            idPrefix="s14-login-code"
            label={content.secondFactorTitle}
            value={codeInput}
            onChange={onCodeInputChange}
          />
          <button
            type="submit"
            className={styles.primaryAction}
            disabled={!codeEntered}
          >
            {content.confirmAction}
          </button>
        </form>
      </main>
    </div>
  );
}

export function S14MasterCampusMfa({
  authenticatorCodeInput,
  displayName,
  masterCampusPassword,
  onActivateMfa,
  onAuthenticatorCodeInputChange,
  onConfirmSecondFactor,
  onOpenOverview,
  onOpenSecurity,
  onOpenSettings,
  onOpenTwoFactor,
  onSubmitLogin,
  phase,
  qrTargetRef,
}: {
  readonly authenticatorCodeInput: string;
  readonly displayName: string;
  readonly masterCampusPassword: string;
  readonly onActivateMfa: () => void;
  readonly onAuthenticatorCodeInputChange: (value: string) => void;
  readonly onConfirmSecondFactor: () => void;
  readonly onOpenOverview: () => void;
  readonly onOpenSecurity: () => void;
  readonly onOpenSettings: () => void;
  readonly onOpenTwoFactor: () => void;
  readonly onSubmitLogin: () => void;
  readonly phase: S14MasterCampusPhase;
  readonly qrTargetRef: RefObject<HTMLDivElement | null>;
}) {
  const content = s14MfaContent.browser.masterCampus;
  if (phase === 'login-autofilling' || phase === 'login-ready') {
    return (
      <LoginAutofill
        autofilling={phase === 'login-autofilling'}
        displayName={displayName}
        masterCampusPassword={masterCampusPassword}
        onSubmit={onSubmitLogin}
      />
    );
  }
  if (phase === 'second-factor' || phase === 'second-factor-code-entered') {
    return (
      <SecondFactorLogin
        codeEntered={phase === 'second-factor-code-entered'}
        codeInput={authenticatorCodeInput}
        onConfirm={onConfirmSecondFactor}
        onCodeInputChange={onAuthenticatorCodeInputChange}
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
        codeEntered={phase === 'setup-code-entered' || phase === 'mfa-activated'}
        codeInput={authenticatorCodeInput}
        displayName={displayName}
        onActivate={onActivateMfa}
        onCodeInputChange={onAuthenticatorCodeInputChange}
        qrTargetRef={qrTargetRef}
        scanMode={
          phase === 'setup-awaiting-scan'
            ? 'scanner'
            : phase === 'setup-recognizing'
              ? 'recognizing'
              : phase === 'setup-scan-confirmed'
                ? 'confirmed'
                : 'codes'
        }
      />
    </CampusWebsiteBackdrop>
  );
}
