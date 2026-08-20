import {
  forwardRef,
  type InputHTMLAttributes,
} from 'react';

import styles from './SimulatedPasswordInput.module.css';

export interface SimulatedPasswordInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'autoComplete' | 'name' | 'type'
  > {
  readonly masked: boolean;
}

export const SimulatedPasswordInput = forwardRef<
  HTMLInputElement,
  SimulatedPasswordInputProps
>(function SimulatedPasswordInput(
  { masked, value, defaultValue, className, ...props },
  ref,
) {
  const displayedValue = String(value ?? defaultValue ?? '');

  return (
    <span className={styles.root}>
      <input
        {...props}
        ref={ref}
        type="text"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        autoComplete="off"
        name="passwo-simulated-entry"
        data-form-type="other"
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        className={[
          styles.input,
          masked ? styles.maskedInput : undefined,
          className,
        ]
          .filter((entry): entry is string => entry !== undefined)
          .join(' ')}
      />
      {masked && displayedValue.length > 0 ? (
        <span className={styles.mask} aria-hidden="true">
          {'•'.repeat(Array.from(displayedValue).length)}
        </span>
      ) : null}
    </span>
  );
});
