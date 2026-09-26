export function MoonIcon({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none' }}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
