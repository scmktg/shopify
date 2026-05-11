import type { ProductCardRating } from '@/types/product';

interface StarRatingProps {
  rating: ProductCardRating | undefined;
}

/**
 * Compact star row for product cards. Renders nothing when rating
 * data is absent — no fake stars, no "No reviews yet" placeholder.
 *
 * The full 5-star bar is rendered with `aria-hidden`; the textual
 * "4.6 out of 5 (12 reviews)" label is screen-reader-only, so the
 * card stays readable without colour and accurate to assistive tech.
 */
export function ProductCardStars({ rating }: StarRatingProps) {
  if (!rating) return null;
  const value = Math.max(0, Math.min(5, rating.value));
  const pct = (value / 5) * 100;
  return (
    <div className="mt-1 flex items-center gap-1 text-xs">
      <span
        aria-hidden="true"
        className="relative inline-block leading-none"
        style={{ width: '5em' }}
      >
        <span className="text-black/15">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden text-amber-500"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="text-black/60 tabular-nums">({rating.count})</span>
      <span className="sr-only">
        {value.toFixed(1)} out of 5 stars from {rating.count} review
        {rating.count === 1 ? '' : 's'}
      </span>
    </div>
  );
}
