import type { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryView } from '@/components/category/CategoryView';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/jsonld';

// Shopify products are tagged with either `watermark` or
// `cert:watermark` (legacy spelling kept during the WordPress import).
// Filtering the listing on tag is the only option — the Storefront API
// doesn't expose metafield filters on the products query.
const WATERMARK_QUERY = 'tag:watermark OR tag:cert:watermark';
const PAGE_SIZE = 48;
const PATH = '/watermark-certified/';
const TITLE = 'WaterMark Certified Products';
const INTRO =
  'Every product on this page carries a current WaterMark licence — the certification Australian state plumbing law requires for any product fitted to mains water supply. Look for the red WaterMark Certified badge on the buy box and the licence number listed under Specifications.';

export const metadata: Metadata = {
  title: `${TITLE} | Australian Mains-Connected Water Filtration`,
  description:
    'Browse every WaterMark certified product we stock. Filters, taps, toilets, and fittings approved for connection to Australian mains water supply.',
  alternates: { canonical: PATH },
};

export default async function WatermarkCertifiedPage() {
  const page = await getProducts({ query: WATERMARK_QUERY, first: PAGE_SIZE });
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: TITLE, path: PATH },
  ];

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(TITLE, PATH, INTRO),
          breadcrumbSchema(breadcrumbs),
        ]}
      />
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {TITLE}
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-black/70">
            {INTRO}
          </p>
          <div
            role="note"
            className="mt-6 flex gap-3 rounded-md border border-black/15 bg-black/[0.03] p-4 text-sm text-black/75"
          >
            <Info
              className="h-5 w-5 shrink-0 text-[var(--color-wmk-red)]"
              aria-hidden="true"
            />
            <p>
              We stock both WaterMark certified and non-certified products.
              Non-certified products are legal for off-mains use (rainwater,
              bore water, caravans, off-grid systems) and are clearly labelled
              on the product page.{' '}
              <Link
                href="/help/watermark-certification-explained/"
                className="font-medium underline underline-offset-4 hover:text-black"
              >
                Read our full WaterMark policy
              </Link>{' '}
              to understand how to tell them apart.
            </p>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <CategoryView
          initialProducts={page.products}
          initialPageInfo={page.pageInfo}
          query={WATERMARK_QUERY}
          pageSize={PAGE_SIZE}
        />
      </div>
    </>
  );
}
