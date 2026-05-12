import { reviews, reviewStats } from '@/data/reviews';
import type { Review } from '@/types/review';

export { reviews, reviewStats };

/** Most recent first. Stable for equal dates (preserves array order). */
export function sortByDateDesc(input: ReadonlyArray<Review>): ReadonlyArray<Review> {
  return [...input].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * Reviews marked `featured: true`, sorted most-recent-first. Used on
 * the homepage carousel and the PDP slot. Falls back to all reviews
 * (still date-sorted) if curation hasn't been done — guards against
 * an empty section on a fresh deploy.
 */
export function getFeaturedReviews(limit?: number): ReadonlyArray<Review> {
  const featured = sortByDateDesc(reviews.filter((r) => r.featured));
  const pool = featured.length > 0 ? featured : sortByDateDesc(reviews);
  return typeof limit === 'number' ? pool.slice(0, limit) : pool;
}

export function getAllReviews(): ReadonlyArray<Review> {
  return sortByDateDesc(reviews);
}

/**
 * Cheap, deterministic hash so each product page surfaces the same
 * two reviews on every render without needing per-product editorial
 * curation. Not cryptographic; collision-rate doesn't matter.
 */
function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Two featured reviews bucketed by the product handle. Same product
 * shows the same pair on every visit, but different products show
 * different pairs — so a shopper browsing several PDPs sees variety
 * across the catalogue without us having to curate per product.
 *
 * If fewer than `count` featured reviews exist, returns whatever is
 * available (no padding).
 */
export function getReviewsForProduct(
  handle: string,
  count = 2,
): ReadonlyArray<Review> {
  const pool = getFeaturedReviews();
  if (pool.length === 0) return [];
  if (pool.length <= count) return pool;
  const start = hashString(handle) % pool.length;
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(start + i) % pool.length]);
  }
  return out;
}
