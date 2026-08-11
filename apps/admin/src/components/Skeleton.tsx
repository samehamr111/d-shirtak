export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink/10 ${className}`} />;
}

export function SkeletonRows({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded border border-ink/10">
      <div className="border-b border-ink/10 bg-ink/5 px-3 py-2">
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="divide-y divide-ink/10 bg-white">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-3 py-3">
            {Array.from({ length: columns }).map((__, j) => (
              <Skeleton key={j} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
