import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useState,
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
  const [maskFontReady, setMaskFontReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void document.fonts.load('16px "PassWo Simulation Mask"').then(
      (fonts) => {
        if (mounted) setMaskFontReady(fonts.length > 0);
      },
      () => {
        // Keep masked text hidden if the asset fails; the reveal control still works.
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <span className={styles.root}>
      <input
        {...props}
        ref={ref}
        type="text"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        name="passwo-simulated-entry"
        data-mask-font-ready={maskFontReady || undefined}
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
    </span>
  );
});
