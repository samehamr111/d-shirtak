import { ShirtMark } from "./ShirtMark";

export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-ink/15 border-t-brand-500" />
      <ShirtMark className="h-[55%] w-[55%] text-brand-500 animate-twinkle" />
    </span>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-14 w-14" />
    </div>
  );
}

/** For inside a button/inline text (e.g. "Signing in…") -- uses currentColor throughout instead
 *  of the fixed brand green, so it always matches whatever text color it's sitting in (button
 *  variants span ink-on-brand, paper-on-ink, ink-on-outline, etc). */
export function InlineSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} role="status" aria-label="Loading">
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-current/25 border-t-current" />
      <ShirtMark className="h-[55%] w-[55%] animate-twinkle" />
    </span>
  );
}
