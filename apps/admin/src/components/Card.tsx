import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-xl border border-ink/10 bg-white p-4 shadow-card ${className ?? ""}`}
    />
  );
}
