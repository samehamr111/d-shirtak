const SHIRT_PATH = "M9 2 L4 5 L1.6 9.2 L5 11.2 L5 22 L19 22 L19 11.2 L22.4 9.2 L20 5 L15 2 C14 4.2 10 4.2 9 2 Z";
const SPARKLE_PATH = "M12 2 l1.6 6.4 6.4 1.6 -6.4 1.6 -1.6 6.4 -1.6 -6.4 -6.4 -1.6 6.4 -1.6 z";

/** The brand's shirt-icon mark, drawn inline so it can be recolored/animated per-context
 *  instead of shipping a fixed-color PNG. */
export function ShirtMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={SHIRT_PATH} fill="currentColor" />
    </svg>
  );
}

/** A small four-point sparkle, used as a recurring accent (twinkle/trail animations live in
 *  tailwind.config.js as `animate-twinkle` / `animate-trail`). */
export function Sparkle({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={SPARKLE_PATH} fill="currentColor" />
    </svg>
  );
}
