import { reviewStats } from '@/data/reviews';
import { ReviewStars } from './ReviewStars';

type Variant = 'homepage' | 'pdp';

interface ReviewsAggregateProps {
  variant?: Variant;
  className?: string;
}

/**
 * Aggregate-rating header used on the homepage and PDPs. Two
 * variants:
 *   homepage — headline plus a per-platform breakdown line.
 *   pdp      — compact single-line for the trust strip.
 *
 * Numbers are sourced from data/reviews.ts so changing the source
 * data updates every display surface in one place.
 */
export function ReviewsAggregate({
  variant = 'homepage',
  className = '',
}: ReviewsAggregateProps) {
  const avg = reviewStats.averageRating.toFixed(1);

  if (variant === 'pdp') {
    return (
      <p
        className={`inline-flex items-center gap-2 text-sm text-black/75 ${className}`}
      >
        <ReviewStars value={reviewStats.averageRating} className="text-base" />
        <span>
          <span className="font-semibold text-black">{avg}</span> from{' '}
          {reviewStats.total} customer reviews
        </span>
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="flex items-center justify-center gap-3 text-lg sm:text-xl font-semibold text-black">
        <ReviewStars value={reviewStats.averageRating} className="text-2xl" />
        <span>
          <span>{avg}</span>
          <span className="font-normal text-black/70"> · </span>
          <span>
            {reviewStats.total} reviews across Google and Facebook
          </span>
        </span>
      </p>
      <p className="mt-1 text-center text-sm text-black/60">
        {reviewStats.totalGoogle} Google reviews ·{' '}
        {reviewStats.totalFacebook} Facebook recommendations
      </p>
    </div>
  );
}
