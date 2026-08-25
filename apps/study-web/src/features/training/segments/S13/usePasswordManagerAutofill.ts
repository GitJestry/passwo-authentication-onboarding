import { useEffect } from 'react';

export function usePasswordManagerAutofill({
  active,
  durationMs,
  identifier,
  password,
  onIdentifierChange,
  onPasswordChange,
  onComplete,
}: {
  readonly active: boolean;
  readonly durationMs: number;
  readonly identifier: string;
  readonly password: string;
  readonly onIdentifierChange: (value: string) => void;
  readonly onPasswordChange: (value: string) => void;
  readonly onComplete: () => void;
}): void {
  useEffect(() => {
    if (!active) return;
    if (durationMs === 0) {
      onIdentifierChange(identifier);
      onPasswordChange(password);
      onComplete();
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    let completed = false;
    const completeAutofill = () => {
      if (completed) return;
      completed = true;
      onIdentifierChange(identifier);
      onPasswordChange(password);
      onComplete();
    };
    const enterNextCharacters = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      onIdentifierChange(
        identifier.slice(0, Math.floor(identifier.length * progress)),
      );
      onPasswordChange(
        password.slice(0, Math.floor(password.length * progress)),
      );
      if (progress < 1) {
        frame = requestAnimationFrame(enterNextCharacters);
        return;
      }
      completeAutofill();
    };

    frame = requestAnimationFrame(enterNextCharacters);
    return () => cancelAnimationFrame(frame);
  }, [
    active,
    durationMs,
    identifier,
    onComplete,
    onIdentifierChange,
    onPasswordChange,
    password,
  ]);
}
