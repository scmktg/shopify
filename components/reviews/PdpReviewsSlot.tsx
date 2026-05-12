import Link from 'next/link';
import { getReviewsForProduct } from '@/lib/reviews';
import { ReviewCard } from './ReviewCard';
import { ReviewsAggregate } from './ReviewsAggregate';

interface PdpReviewsSlotProps {
  productHandle: string;
}

/**
 * Two reviews shown on every PDP, bucketed by product handle so
 * the pair is stable per product but varies across the catalogue.
 * Sits below the trust strip — designed to live alongside the
 * BoughtTogether / MoreInCategory rails without competing for
 * attention.
 */
export function PdpReviewsSlot({ productHandle }: PdpReviewsSlotProps) {
  const picks = getReviewsForProduct(productHandle, 2);
  if (picks.length === 0) return null;
  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold text-black tracking-tight">
          What customers say
        </h2>
        <ReviewsAggregate variant="pdp" />
      </header>
      <ul role="list" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {picks.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link
          href="/reviews/"
          className="font-medium text-brand-blue hover:underline underline-offset-4"
        >
          Read all customer reviews →
        </Link>
      </p>
    </section>
  );
}
