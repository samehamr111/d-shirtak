import type { HTMLAttributes } from "react";

type Tone = "neutral" | "brand" | "pop" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/8 text-ink",
  brand: "bg-brand-500/10 text-brand-700",
  pop: "bg-pop-500/10 text-pop-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
