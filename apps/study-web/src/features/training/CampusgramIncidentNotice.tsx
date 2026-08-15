import { s04Content } from '@passwo/training-content';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { PasswordVisibilityIcon } from './PasswordVisibilityIcon.js';
import styles from './CampusgramIncidentNotice.module.css';

function IncidentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4.5c5.7 4.2 11.6 6.3 17.5 6.8v11.2c0 10.3-6.4 17.6-17.5 21-11.1-3.4-17.5-10.7-17.5-21V11.3C12.4 10.8 18.3 8.7 24 4.5Z"
        fill="currentColor"
        opacity=".14"
      />
      <path
        d="M24 4.5c5.7 4.2 11.6 6.3 17.5 6.8v11.2c0 10.3-6.4 17.6-17.5 21-11.1-3.4-17.5-10.7-17.5-21V11.3C12.4 10.8 18.3 8.7 24 4.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M24 14v13" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="34" r="2.2" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M7.5 10V7.8a4.5 4.5 0 0 1 9 0V10" stroke="currentColor" strokeWidth="1.9" />
      <path d="M5.5 10h13v10h-13z" fill="currentColor" opacity=".18" />
      <rect
        x="5.5"
        y="10"
        width="13"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path d="M12 14v2.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export interface CampusgramIncidentNoticeProps {
  readonly className?: string | undefined;
  readonly currentPassword: string;
  readonly passwordChangeOpen?: boolean | undefined;
  readonly onPasswordChangeOpenChange?: ((open: boolean) => void) | undefined;
  readonly simulatedClipboardValue?: string | null | undefined;
  readonly simulatedPasteLabel?: string | undefined;
  readonly onSimulatedClipboardConsumed?: (() => void) | undefined;
  readonly onSimulatedPasswordChangeCompleted?: (() => void) | undefined;
  readonly onPasswordChangeSubmitted?: (() => void) | undefined;
  readonly onSimulatedPaste?: ((target: 'new' | 'confirm') => void) | undefined;
  readonly allowFreePasswordInput?: boolean | undefined;
  readonly guidedPasteTarget?: 'new' | 'confirm' | null | undefined;
  readonly guidedSubmit?: boolean | undefined;
  readonly highlightGuidedActions?: boolean | undefined;
  readonly centerSimulatedPaste?: boolean | undefined;
  readonly pasteOnPasswordFieldClick?: boolean | undefined;
  readonly passwordChangeTitle?: string | undefined;
  readonly showBackAction?: boolean | undefined;
  readonly showCompletedAction?: boolean | undefined;
  readonly showPasswordVisibilityActions?: boolean | undefined;
  readonly completedCopy?:
    | {
        readonly title: string;
        readonly body: string;
      }
    | undefined;
  readonly completedVisual?: ReactNode;
  readonly completedVisualClassName?: string | undefined;
}

export function CampusgramIncidentNotice({
  className,
  currentPassword,
  passwordChangeOpen = false,
  onPasswordChangeOpenChange,
  simulatedClipboardValue = null,
  simulatedPasteLabel,
  onSimulatedClipboardConsumed,
  onSimulatedPasswordChangeCompleted,
  onPasswordChangeSubmitted,
  onSimulatedPaste,
  allowFreePasswordInput = true,
  guidedPasteTarget,
  guidedSubmit = false,
  highlightGuidedActions = true,
  centerSimulatedPaste = false,
  pasteOnPasswordFieldClick = false,
  passwordChangeTitle,
  showBackAction = true,
  showCompletedAction = true,
  showPasswordVisibilityActions = true,
  completedCopy,
  completedVisual,
  completedVisualClassName,
}: CampusgramIncidentNoticeProps) {
  const inputId = useId();
  const actionRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const confirmedPasswordInputRef = useRef<HTMLInputElement>(null);
  const wasPasswordChangeOpen = useRef(passwordChangeOpen);
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [currentPasswordRevealed, setCurrentPasswordRevealed] = useState(false);
  const [newPasswordRevealed, setNewPasswordRevealed] = useState(false);
  const [confirmedPasswordRevealed, setConfirmedPasswordRevealed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [usedSimulatedClipboard, setUsedSimulatedClipboard] = useState(false);
  const passwordChange = s04Content.notice.passwordChange;

  useEffect(() => {
    if (passwordChangeOpen) {
      headingRef.current?.focus();
    } else if (wasPasswordChangeOpen.current) {
      actionRef.current?.focus();
    }
    wasPasswordChangeOpen.current = passwordChangeOpen;
  }, [completed, passwordChangeOpen]);

  function closePasswordChange(): void {
    if (completed && usedSimulatedClipboard) {
      onSimulatedPasswordChangeCompleted?.();
    }
    setNewPassword('');
    setConfirmedPassword('');
    setCurrentPasswordRevealed(false);
    setNewPasswordRevealed(false);
    setConfirmedPasswordRevealed(false);
    setValidationError(null);
    setCompleted(false);
    setUsedSimulatedClipboard(false);
    onPasswordChangeOpenChange?.(false);
  }

  function pasteSimulatedPassword(target: 'new' | 'confirm'): void {
    if (simulatedClipboardValue === null) return;

    const nextNewPassword = target === 'new' ? simulatedClipboardValue : newPassword;
    const nextConfirmedPassword =
      target === 'confirm' ? simulatedClipboardValue : confirmedPassword;
    setNewPassword(nextNewPassword);
    setConfirmedPassword(nextConfirmedPassword);
    setValidationError(null);
    setUsedSimulatedClipboard(true);
    onSimulatedPaste?.(target);
    if (
      nextNewPassword === simulatedClipboardValue &&
      nextConfirmedPassword === simulatedClipboardValue
    ) {
      onSimulatedClipboardConsumed?.();
      requestAnimationFrame(() => {
        const input =
          target === 'new' ? newPasswordInputRef.current : confirmedPasswordInputRef.current;
        input?.focus();
      });
    }
  }

  function submitPasswordChange(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (newPassword !== confirmedPassword) {
      setValidationError(passwordChange.mismatchError);
      return;
    }
    if (currentPassword === newPassword) {
      setValidationError(passwordChange.unchangedError);
      return;
    }

    setNewPassword('');
    setConfirmedPassword('');
    setCurrentPasswordRevealed(false);
    setNewPasswordRevealed(false);
    setConfirmedPasswordRevealed(false);
    setValidationError(null);
    setCompleted(true);
    onPasswordChangeSubmitted?.();
  }

  if (passwordChangeOpen) {
    return (
      <section
        className={styles.passwordChangeLayer}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-title`}
        onKeyDown={(event) => {
          if (event.key !== 'Escape' || !showBackAction) return;
          event.preventDefault();
          closePasswordChange();
        }}
      >
        <header className={styles.passwordChangeHeader} data-back-action={showBackAction || undefined}>
          {showBackAction ? (
            <button type="button" onClick={closePasswordChange}>
              <span aria-hidden="true">←</span>
              {passwordChange.backLabel}
            </button>
          ) : null}
          <span className={styles.securityContext}>
            <LockIcon />
            {passwordChange.securityContext}
          </span>
        </header>
        <div className={styles.passwordChangeBody}>
          <aside aria-label={passwordChange.settingsAriaLabel}>
            <strong>{passwordChange.settingsTitle}</strong>
            {passwordChange.settingsNavigation.map((item, index) => (
              <span aria-current={index === 0 ? 'page' : undefined} key={item}>
                {item}
              </span>
            ))}
          </aside>
          {completed ? (
            <section className={styles.passwordChangeCard} role="status">
              {completedVisual === undefined ? (
                <span className={styles.successMark} aria-hidden="true">✓</span>
              ) : (
                <span
                  className={[styles.completedVisual, completedVisualClassName]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {completedVisual}
                </span>
              )}
              <h2 id={`${inputId}-title`} ref={headingRef} tabIndex={-1}>
                {completedCopy?.title ?? passwordChange.completedTitle}
              </h2>
              <p>{completedCopy?.body ?? passwordChange.completedBody}</p>
              {showCompletedAction ? (
                <button type="button" className={styles.submitButton} onClick={closePasswordChange}>
                  {passwordChange.completedAction}
                </button>
              ) : null}
            </section>
          ) : (
            <form className={styles.passwordChangeCard} onSubmit={submitPasswordChange}>
              <span className={styles.formIcon} aria-hidden="true">
                <LockIcon />
              </span>
              <h2 id={`${inputId}-title`} ref={headingRef} tabIndex={-1}>
                {passwordChangeTitle ?? passwordChange.title}
              </h2>
              <div className={styles.passwordFieldGroup}>
                <label htmlFor={`${inputId}-current`}>
                  {passwordChange.currentPasswordLabel}
                </label>
                <span className={styles.passwordField}>
                  <input
                    id={`${inputId}-current`}
                    type={currentPasswordRevealed ? 'text' : 'password'}
                    autoComplete="off"
                    readOnly
                    value={currentPassword}
                  />
                  <button
                    type="button"
                    className={styles.revealButton}
                    disabled={!showPasswordVisibilityActions}
                    aria-pressed={currentPasswordRevealed}
                    aria-label={`${
                      currentPasswordRevealed
                        ? passwordChange.hidePasswordLabel
                        : passwordChange.showPasswordLabel
                    }: ${passwordChange.currentPasswordLabel}`}
                    onClick={() => setCurrentPasswordRevealed((revealed) => !revealed)}
                  >
                    <PasswordVisibilityIcon revealed={currentPasswordRevealed} />
                  </button>
                </span>
              </div>
              <div className={styles.passwordFieldGroup}>
                <label htmlFor={`${inputId}-new`}>
                  {passwordChange.newPasswordLabel}
                </label>
                <span
                  className={`${styles.passwordField} ${
                    simulatedClipboardValue === null ? '' : styles.passwordFieldWithPaste
                  }`}
                >
                  <input
                    ref={newPasswordInputRef}
                    id={`${inputId}-new`}
                    type={newPasswordRevealed ? 'text' : 'password'}
                    autoComplete="off"
                    required
                    readOnly={!allowFreePasswordInput}
                    value={newPassword}
                    onClick={() => {
                      if (pasteOnPasswordFieldClick && guidedPasteTarget === 'new') {
                        pasteSimulatedPassword('new');
                      }
                    }}
                    onChange={(event) => {
                      if (allowFreePasswordInput) setNewPassword(event.currentTarget.value);
                    }}
                  />
                  {simulatedClipboardValue === null ||
                  simulatedPasteLabel === undefined ||
                  (guidedPasteTarget !== undefined && guidedPasteTarget !== 'new') ? null : (
                    <button
                      type="button"
                      className={styles.pasteButton}
                      data-centered={centerSimulatedPaste || undefined}
                      data-guided-highlight={
                        (highlightGuidedActions && guidedPasteTarget === 'new') || undefined
                      }
                      onClick={() => pasteSimulatedPassword('new')}
                    >
                      {simulatedPasteLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.revealButton}
                    disabled={!showPasswordVisibilityActions}
                    aria-pressed={newPasswordRevealed}
                    aria-label={`${
                      newPasswordRevealed
                        ? passwordChange.hidePasswordLabel
                        : passwordChange.showPasswordLabel
                    }: ${passwordChange.newPasswordLabel}`}
                    onClick={() => setNewPasswordRevealed((revealed) => !revealed)}
                  >
                    <PasswordVisibilityIcon revealed={newPasswordRevealed} />
                  </button>
                </span>
              </div>
              <div className={styles.passwordFieldGroup}>
                <label htmlFor={`${inputId}-confirm`}>
                  {passwordChange.confirmPasswordLabel}
                </label>
                <span
                  className={`${styles.passwordField} ${
                    simulatedClipboardValue === null ? '' : styles.passwordFieldWithPaste
                  }`}
                >
                  <input
                    ref={confirmedPasswordInputRef}
                    id={`${inputId}-confirm`}
                    type={confirmedPasswordRevealed ? 'text' : 'password'}
                    autoComplete="off"
                    required
                    readOnly={!allowFreePasswordInput}
                    value={confirmedPassword}
                    onClick={() => {
                      if (pasteOnPasswordFieldClick && guidedPasteTarget === 'confirm') {
                        pasteSimulatedPassword('confirm');
                      }
                    }}
                    onChange={(event) => {
                      if (allowFreePasswordInput) setConfirmedPassword(event.currentTarget.value);
                    }}
                  />
                  {simulatedClipboardValue === null ||
                  simulatedPasteLabel === undefined ||
                  (guidedPasteTarget !== undefined && guidedPasteTarget !== 'confirm') ? null : (
                    <button
                      type="button"
                      className={styles.pasteButton}
                      data-centered={centerSimulatedPaste || undefined}
                      data-guided-highlight={
                        (highlightGuidedActions && guidedPasteTarget === 'confirm') || undefined
                      }
                      onClick={() => pasteSimulatedPassword('confirm')}
                    >
                      {simulatedPasteLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.revealButton}
                    disabled={!showPasswordVisibilityActions}
                    aria-pressed={confirmedPasswordRevealed}
                    aria-label={`${
                      confirmedPasswordRevealed
                        ? passwordChange.hidePasswordLabel
                        : passwordChange.showPasswordLabel
                    }: ${passwordChange.confirmPasswordLabel}`}
                    onClick={() => setConfirmedPasswordRevealed((revealed) => !revealed)}
                  >
                    <PasswordVisibilityIcon revealed={confirmedPasswordRevealed} />
                  </button>
                </span>
              </div>
              {validationError === null ? null : (
                <p className={styles.validationError} role="alert">
                  {validationError}
                </p>
              )}
              <button
                type="submit"
                className={styles.submitButton}
                data-guided-highlight={(highlightGuidedActions && guidedSubmit) || undefined}
                disabled={guidedPasteTarget !== undefined && !guidedSubmit}
              >
                {passwordChange.submitLabel}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.serviceNotice} ${className ?? ''}`} role="alert">
      <span className={styles.incidentIcon} aria-hidden="true">
        <IncidentIcon />
      </span>
      <div>
        <h2>{s04Content.notice.title}</h2>
        <p>{s04Content.notice.paragraphs[0]}</p>
        {onPasswordChangeOpenChange === undefined ? null : (
          <p className={styles.advisory}>{s04Content.notice.advisory}</p>
        )}
      </div>
      {onPasswordChangeOpenChange === undefined ? null : (
        <button
          ref={actionRef}
          type="button"
          className={styles.passwordChangeAction}
          onClick={() => onPasswordChangeOpenChange(true)}
        >
          <LockIcon />
          {s04Content.notice.passwordChangeLabel}
        </button>
      )}
    </section>
  );
}
