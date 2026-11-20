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
  { label: '3 days', value: 63 },
  { label: '5 days', value: 80 },
  { label: '7 days', value: 90 },
] as const;

function DeliveryPerformance() {
  return (
    <section aria-labelledby="delivery-performance-heading" className="mt-7 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-5 py-7 shadow-sm sm:px-8 sm:py-9">
      <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
        Fast Dispatch from Wyong, NSW
      </span>
      <h2 id="delivery-performance-heading" className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        Our shipping times for the last 90 days.
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
        <strong>Order before 12pm</strong> on a business day for same-day dispatch.
        After 12pm, we normally ship the next business day.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {TRANSIT_MILESTONES.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-3xl font-bold tabular-nums tracking-tight text-sky-800">{value}%</span>
              <span className="text-sm font-medium text-slate-700">within {label}</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`Delivered within ${label}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-700"
                style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
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
