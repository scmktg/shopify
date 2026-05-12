import Link from 'next/link';
import { getFeaturedReviews } from '@/lib/reviews';
import { ReviewCard } from './ReviewCard';
import { ReviewsAggregate } from './ReviewsAggregate';

/**
 * Homepage reviews section. Three featured reviews server-rendered
 * in a responsive grid — mobile shows the top one and scrolls the
 * rest into view; desktop fits all three side-by-side. No client JS,
 * no carousel library; the brief asked for the most recent featured
 * reviews to lead, which a date-sorted grid handles directly.
 */
export function HomeReviewsSection() {
  const featured = getFeaturedReviews(3);
  if (featured.length === 0) return null;
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <header>
          <h2 className="text-2xl font-semibold text-black text-center">
            What our customers say
          </h2>
          <ReviewsAggregate variant="homepage" className="mt-4" />
        </header>
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {featured.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm">
          <Link
            href="/reviews/"
            className="font-medium text-brand-blue hover:underline underline-offset-4"
          >
            Read all customer reviews →
          </Link>
        </p>
      </div>
    </section>
  );
}
