export interface PasswordVisibilityIconProps {
  readonly revealed: boolean;
  readonly className?: string | undefined;
}

export function PasswordVisibilityIcon({
  revealed,
  className,
}: PasswordVisibilityIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? ''}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {revealed ? <path d="M4 4 20 20" /> : null}
    </svg>
  );
}
