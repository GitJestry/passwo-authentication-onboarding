import { useEffect } from 'react';

export function usePasswordManagerAutofill({
  active,
  durationMs,
  identifier,
  password,
  onIdentifierChange,
  onPasswordChange,
}: {
  readonly active: boolean;
  readonly durationMs: number;
  readonly identifier: string;
  readonly password: string;
  readonly onIdentifierChange: (value: string) => void;
  readonly onPasswordChange: (value: string) => void;
}): void {
  useEffect(() => {
    if (!active) return;
    if (durationMs === 0) {
      onIdentifierChange(identifier);
      onPasswordChange(password);
      return;
    }

    const startedAt = performance.now();
    const characterAnimationDurationMs = durationMs * 0.85;
    let frame = 0;
    const enterNextCharacters = (now: number) => {
      const progress = Math.min(
        (now - startedAt) / characterAnimationDurationMs,
        1,
      );
      onIdentifierChange(
        identifier.slice(0, Math.floor(identifier.length * progress)),
      );
      onPasswordChange(
        password.slice(0, Math.floor(password.length * progress)),
      );
      if (progress < 1) frame = requestAnimationFrame(enterNextCharacters);
    };

    frame = requestAnimationFrame(enterNextCharacters);
    return () => cancelAnimationFrame(frame);
  }, [
    active,
    durationMs,
    identifier,
    onIdentifierChange,
    onPasswordChange,
    password,
  ]);
}
