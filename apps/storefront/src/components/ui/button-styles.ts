type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-ink shadow-pop hover:bg-brand-400 active:scale-[0.97]",
  secondary: "bg-ink text-paper hover:bg-black active:scale-[0.97]",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-paper active:scale-[0.97]",
  ghost: "text-ink hover:bg-ink/5 active:scale-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-12 px-6 text-base rounded-full",
  lg: "h-14 px-8 text-lg rounded-full",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = ""): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

export type { Variant as ButtonVariant, Size as ButtonSize };
