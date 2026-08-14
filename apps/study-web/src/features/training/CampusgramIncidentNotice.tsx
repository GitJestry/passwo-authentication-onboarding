import { s04Content } from '@passwo/training-content';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
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
  readonly passwordChangeOpen?: boolean | undefined;
  readonly onPasswordChangeOpenChange?: ((open: boolean) => void) | undefined;
}

export function CampusgramIncidentNotice({
  passwordChangeOpen = false,
  onPasswordChangeOpenChange,
}: CampusgramIncidentNoticeProps) {
  const inputId = useId();
  const actionRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wasPasswordChangeOpen = useRef(passwordChangeOpen);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
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
    setCurrentPassword('');
    setNewPassword('');
    setConfirmedPassword('');
    setValidationError(null);
    setCompleted(false);
    onPasswordChangeOpenChange?.(false);
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

    setCurrentPassword('');
    setNewPassword('');
    setConfirmedPassword('');
    setValidationError(null);
    setCompleted(true);
  }

  if (passwordChangeOpen) {
    return (
      <section
        className={styles.passwordChangeLayer}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-title`}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          closePasswordChange();
        }}
      >
        <header className={styles.passwordChangeHeader}>
          <button type="button" onClick={closePasswordChange}>
            <span aria-hidden="true">←</span>
            {passwordChange.backLabel}
          </button>
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
              <span className={styles.successMark} aria-hidden="true">✓</span>
              <h2 id={`${inputId}-title`} ref={headingRef} tabIndex={-1}>
                {passwordChange.completedTitle}
              </h2>
              <p>{passwordChange.completedBody}</p>
              <button type="button" className={styles.submitButton} onClick={closePasswordChange}>
                {passwordChange.completedAction}
              </button>
            </section>
          ) : (
            <form className={styles.passwordChangeCard} onSubmit={submitPasswordChange}>
              <span className={styles.formIcon} aria-hidden="true">
                <LockIcon />
              </span>
              <h2 id={`${inputId}-title`} ref={headingRef} tabIndex={-1}>
                {passwordChange.title}
              </h2>
              <p className={styles.safetyNote}>{passwordChange.safetyNote}</p>
              <label htmlFor={`${inputId}-current`}>
                {passwordChange.currentPasswordLabel}
                <input
                  id={`${inputId}-current`}
                  type="password"
                  autoComplete="off"
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.currentTarget.value)}
                />
              </label>
              <label htmlFor={`${inputId}-new`}>
                {passwordChange.newPasswordLabel}
                <input
                  id={`${inputId}-new`}
                  type="password"
                  autoComplete="off"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.currentTarget.value)}
                />
              </label>
              <label htmlFor={`${inputId}-confirm`}>
                {passwordChange.confirmPasswordLabel}
                <input
                  id={`${inputId}-confirm`}
                  type="password"
                  autoComplete="off"
                  required
                  value={confirmedPassword}
                  onChange={(event) => setConfirmedPassword(event.currentTarget.value)}
                />
              </label>
              {validationError === null ? null : (
                <p className={styles.validationError} role="alert">
                  {validationError}
                </p>
              )}
              <button type="submit" className={styles.submitButton}>
                {passwordChange.submitLabel}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.serviceNotice} role="alert">
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
