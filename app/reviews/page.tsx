import type { Metadata } from 'next';
import Link from 'next/link';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewsAggregate } from '@/components/reviews/ReviewsAggregate';
import { LeaveReviewLinks } from '@/components/reviews/LeaveReviewLinks';
import { getAllReviews, reviewStats } from '@/lib/reviews';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/reviews/';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description: `${reviewStats.total} five-star reviews on Google and Facebook from Australian homeowners, tradies, and builders who buy from Enviro Aqua.`,
  alternates: { canonical: PATH },
};

export default function ReviewsPage() {
  const all = getAllReviews();
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Customer reviews', path: PATH },
        ])}
      />
      <section className="border-b border-black/10 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black">
            Customer reviews
          </h1>
          <p className="mt-4 text-base text-black/80 leading-relaxed">
            We&apos;re a family-owned business that&apos;s been serving
            Australian homeowners, tradies, and builders since 2018. Over
            the years our customers have left us{' '}
            <strong>
              {reviewStats.total} five-star reviews on Google and Facebook
            </strong>{' '}
            — the most recent are shown below. We&apos;re proud of our
            track record, and we&apos;d love yours too.
          </p>
          <LeaveReviewLinks className="mt-6" />
          <ReviewsAggregate variant="homepage" className="mt-8" />
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {all.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
          {reviewStats.reviewsShown < reviewStats.total && (
            <p className="mt-8 text-center text-sm text-black/60">
              Showing {reviewStats.reviewsShown} of {reviewStats.total}{' '}
              total reviews. See the rest on{' '}
              <Link
                href="https://www.google.com/maps/search/?api=1&query=Enviro+Aqua+Wyong+NSW"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-blue hover:underline underline-offset-4"
              >
                Google
              </Link>{' '}
              or{' '}
              <Link
                href="https://www.facebook.com/EnviroAqua.com.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-blue hover:underline underline-offset-4"
              >
                Facebook
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
