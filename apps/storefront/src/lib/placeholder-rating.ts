/**
 * There's no review system yet, so star ratings are a presentational placeholder — deterministic
 * per product (stable across renders/reloads, not random noise) rather than a single fixed
 * number for every card. Swap this out once real reviews exist; nothing else needs to change,
 * this is the only place that fabricates the numbers.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function placeholderRating(productId: string): { rating: number; reviewCount: number } {
  const hash = hashString(productId);
  const rating = Math.round((4 + (hash % 11) / 10) * 10) / 10; // 4.0 - 5.0
  const reviewCount = 8 + (hash % 140); // 8 - 147
  return { rating, reviewCount };
}
