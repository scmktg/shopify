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
  const initials = review.authorName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  return (
    <article className={`flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 ${className}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{initials}</span>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold leading-5 text-neutral-900">{review.authorName}</p>
            {review.isLocalGuide && <p className="mt-0.5 text-xs text-neutral-500">Local Guide</p>}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-500" aria-label={`Source: ${SOURCE_LABEL[review.source]}`}>
          <ReviewSourceLogo source={review.source} className="h-4 w-4 text-neutral-700" />
          <span>{SOURCE_LABEL[review.source]}</span>
        </span>
      </header>
      {review.rating !== undefined && (
        <div className="mt-4" aria-label={`${review.rating} out of 5 stars`}>
          <ReviewStars value={review.rating} className="text-lg" />
        </div>
      )}
      <blockquote className={`flex-1 text-sm leading-7 text-neutral-700 ${review.rating === undefined ? 'mt-5' : 'mt-3'}`}>
        “{review.text}”
      </blockquote>
    </article>
  );
}
