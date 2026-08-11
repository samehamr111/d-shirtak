function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.2">
      <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} filled={i < fullStars} />
        ))}
      </div>
      <span className="text-xs text-ink/40">({reviewCount})</span>
    </div>
  );
}
