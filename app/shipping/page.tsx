import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadMarkdownPage } from '@/lib/content/markdown';
import { StaticContentPage } from '@/components/editorial/StaticContentPage';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
  type JsonLd,
} from '@/lib/seo/jsonld';

const PATH = '/shipping';

const TRANSIT_MILESTONES = [
  { label: 'Within 3 days', value: 63.1, detail: 'Nearly two in three verified deliveries' },
  { label: 'Within 5 days', value: 80.3, detail: 'More than four in five verified deliveries' },
  { label: 'Within 7 days', value: 90.3, detail: 'Nine in ten verified deliveries' },
] as const;

function DeliveryPerformance() {
  return (
    <section aria-labelledby="delivery-performance-heading" className="mt-8 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold tracking-wide text-sky-800">
          Based on real deliveries
        </span>
        <span className="text-xs font-medium text-slate-500">Dispatched from Wyong, NSW</span>
      </div>
      <h2 id="delivery-performance-heading" className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        Fast dispatch. Delivery times backed by data.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
        Order before <strong className="text-slate-900">12pm NSW time</strong> on a business day for
        same-day dispatch. After 12pm, we normally dispatch the next business day.
      </p>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {TRANSIT_MILESTONES.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className="text-3xl font-bold tabular-nums tracking-tight text-sky-800">
                {item.value.toFixed(1)}%
              </span>
            </div>
            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={item.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.value}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-700" style={{ width: `${item.value}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs leading-5 text-slate-500">
        From 279 verified Aramex parcel deliveries, 1 September–19 November 2026.
        Percentages are cumulative calendar days from the first carrier network scan,
        not from checkout. Other carriers, regional and bulky freight may take longer.
        Delivery windows are estimates, not guarantees.
      </p>
    </section>
  );
}


export async function generateMetadata(): Promise<Metadata> {
  const page = await loadMarkdownPage('shipping');
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: PATH },
  };
}

export default async function ShippingPage() {
  const page = await loadMarkdownPage('shipping');
  if (!page) notFound();
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Shipping & delivery', href: PATH },
  ];
  const ld: JsonLd[] = [
    breadcrumbSchema(
      breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
    ),
  ];
  if (page.faq.length > 0) ld.push(faqPageSchema(page.faq));
  return (
    <>
      <JsonLdScript data={ld} />
      <StaticContentPage page={page} breadcrumbs={breadcrumbs} beforeContent={<DeliveryPerformance />} />
    </>
  );
}
