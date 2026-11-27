import type { Review } from '@/types/review';
import { ReviewSourceLogo } from './ReviewSourceLogo';
import { ReviewStars } from './ReviewStars';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

const SOURCE_LABEL: Record<Review['source'], string> = {
  google: 'Google',
  facebook: 'Facebook',
};

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-lg border border-black/10 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {review.rating !== undefined ? <ReviewStars value={review.rating} className="text-lg" /> : <span />}
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium text-black/55"
          aria-label={`Source: ${SOURCE_LABEL[review.source]}`}
        >
          <ReviewSourceLogo source={review.source} className="h-4 w-4" />
          <span>{SOURCE_LABEL[review.source]}</span>
        </span>
      </div>
      <blockquote className="mt-3 flex-1 text-sm text-black/80 leading-relaxed">
        “{review.text}”
      </blockquote>
      <footer className="mt-4 text-xs text-black/55">
        <span className="font-medium text-black/80">{review.authorName}</span>
        {review.isLocalGuide && (
          <>
            <span aria-hidden="true"> · </span>
            <span className="text-black/50">Local Guide</span>
          </>
        )}
      </footer>
    </article>
  );
}
