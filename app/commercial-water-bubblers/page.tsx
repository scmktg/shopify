import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Check,
  Droplet,
  Dumbbell,
  GraduationCap,
  Mail,
  Minus,
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business-info';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import { WatermarkBadge, LeadFreeBadge } from '@/components/product/WatermarkBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, faqPageSchema } from '@/lib/seo/jsonld';
import type { Product } from '@/types/product';

export const revalidate = 3600;

const PATH = '/commercial-water-bubblers/';

type CabinetKey = 'round' | 'square' | 'hdpe';

interface CabinetSpec {
  key: CabinetKey;
  handle: string;
  shortName: string;
  tagline: string;
  badge: string;
  highlights: ReadonlyArray<string>;
}

const CABINETS: ReadonlyArray<CabinetSpec> = [
  {
    key: 'round',
    handle: 'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
    shortName: 'Round Stainless',
    tagline: 'Cylindrical SUS304 cabinet — foyers and plazas.',
    badge: 'Entry model',
    highlights: ['20 L/hr · 8–12 °C', 'SUS304 cylindrical', 'Push-button'],
  },
  {
    key: 'square',
    handle:
      'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    shortName: 'Square Stainless',
    tagline:
      'Flush-fit square cabinet — corridors, kitchens, against-wall installs.',
    badge: 'Most popular',
    highlights: ['99 × 30 × 30 cm', 'R290 · 200 W', 'Spout + side tap'],
  },
  {
    key: 'hdpe',
    handle: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    shortName: 'HDPE Granite',
    tagline: 'Rust-free HDPE cabinet with granite finish — full outdoor.',
    badge: 'Outdoor',
    highlights: ['122 × 41 × 41 cm', 'Rust-free HDPE', 'UV stable'],
  },
];

interface SpecRow {
  label: string;
  values: Record<CabinetKey, string>;
  yes?: Partial<Record<CabinetKey, boolean>>;
}

const SPEC_ROWS: ReadonlyArray<SpecRow> = [
  {
    label: 'Cabinet material',
    values: {
      round: 'SUS304 stainless',
      square: 'SUS304 stainless',
      hdpe: 'HDPE polymer',
    },
  },
  {
    label: 'Profile',
    values: {
      round: 'Cylindrical',
      square: 'Square / flat-sided',
      hdpe: 'Tapered, granite-stone',
    },
  },
  {
    label: 'Height',
    values: { round: '~95 cm', square: '99 cm', hdpe: '122 cm' },
  },
  {
    label: 'Footprint',
    values: { round: 'Ø ~30 cm', square: '30 × 30 cm', hdpe: '41 × 41 cm' },
  },
  {
    label: 'Cooling capacity',
    values: { round: '20 L/hr', square: '20 L/hr', hdpe: '20 L/hr' },
  },
  {
    label: 'Water temperature',
    values: { round: '8–12 °C', square: '8–12 °C', hdpe: '8–12 °C' },
  },
  {
    label: 'Refrigerant',
    values: { round: 'R290', square: 'R290 · 60 g', hdpe: 'R290 · 60 g' },
  },
  {
    label: 'Filtration',
    values: {
      round: 'PP + Carbon',
      square: 'PP + Carbon',
      hdpe: 'PP + Carbon',
    },
  },
  {
    label: 'Side tap (bottle fill)',
    values: { round: '—', square: 'Yes', hdpe: 'Yes' },
    yes: { square: true, hdpe: true },
  },
  {
    label: 'WaterMark certified',
    values: {
      round: 'Yes · 23484',
      square: 'Yes · 23484',
      hdpe: 'Yes · 23484',
    },
    yes: { round: true, square: true, hdpe: true },
  },
  {
    label: 'Lead free',
    values: { round: 'Yes', square: 'Yes', hdpe: 'Yes' },
    yes: { round: true, square: true, hdpe: true },
  },
  {
    label: 'Outdoor rating',
    values: { round: 'Sheltered', square: 'Sheltered', hdpe: 'Full outdoor' },
    yes: { hdpe: true },
  },
  {
    label: 'Best for',
    values: {
      round: 'Foyers · plazas',
      square: 'Corridors · walls',
      hdpe: 'Schoolyards · gym entries',
    },
  },
];

const FAQ_ITEMS = [
  {
    q: 'Can my regular plumber install this?',
    a: 'Yes. All three units are WaterMark certified under WMTS-105:2016, licence 23484 — any licensed Australian plumber can install on a mains supply line and issue a Certificate of Compliance.',
  },
  {
    q: 'What does "lead-free" actually mean here?',
    a: 'Every wetted material that contacts the drinking water — internal fittings, valves, the bubbler nozzle, the side tap — is certified to Australian drinking-water lead limits. This matters most for schools, childcare, and healthcare installations.',
  },
  {
    q: 'Do you ship Australia-wide?',
    a: `Yes. Same-day dispatch from Wyong NSW on orders placed before ${BUSINESS_INFO.orderCutoff} on business days. Flat-rate freight, free over $${BUSINESS_INFO.shippingFreeThresholdAud}. Tracked Australia-wide.`,
  },
  {
    q: 'Are filter cartridges proprietary?',
    a: 'No. The units take standard 10″ Australian housings. Replacement carbon + sediment cartridges are stocked, or you can source the same housings from any Australian water-filter supplier.',
  },
  {
    q: 'What about outdoor installations?',
    a: 'The stainless units are fine in sheltered locations (covered courtyards, foyers). For full outdoor exposure — schoolyards, parks, pool decks — choose the HDPE granite model. The cabinet does not rust, does not weld-pit, and the granite finish is moulded through the material rather than painted on.',
  },
  {
    q: 'Is the price really the same retail or trade?',
    a: 'Yes. We do not run a trade portal, account application, or quote process. The price you see is the price for a homeowner, a plumber, a school P&C, or a national facilities manager. No accounts, no minimums, no surprises.',
  },
];

const USE_CASES = [
  {
    icon: GraduationCap,
    title: 'Schools & childcare',
    body: 'Lead-free wetted parts (WMTS-105:2016), low spout, easy push-button operation. NCC-compliant for installation in Australian education facilities.',
    points: [
      'Plumber-ready Certificate of Compliance',
      'HDPE granite model survives full outdoor yards',
      'Bottle-fill side tap reduces queue at break',
    ],
  },
  {
    icon: Building2,
    title: 'Offices & co-working',
    body: 'Square cabinet sits flush against walls in corridors and kitchens. Replaces bottled coolers — direct mains, no refills, no delivery slots.',
    points: [
      '99 cm square footprint fits foyers',
      'Side tap for jugs and bottles',
      'Low-GWP R290 refrigerant',
    ],
  },
  {
    icon: Dumbbell,
    title: 'Gyms & leisure',
    body: '20 L/hr keeps up with peak-class throughput. SUS304 panels survive sweat, towels, and daily wipe-downs.',
    points: [
      'Continuous-duty cooling block',
      'Integrated drip tray with drainage',
      'Push-button rated for thousands of cycles',
    ],
  },
];

const CERT_POINTS = [
  {
    n: '01',
    title: 'Your plumber can install it',
    body: 'Licensed plumbers will sign off and issue a Certificate of Compliance — required for facility audits, school approvals, and commercial fit-outs.',
  },
  {
    n: '02',
    title: 'Your insurance stays valid',
    body: 'Standard home and commercial cover applies to certified, plumber-installed fixtures. Non-WaterMark units can void cover on a leak claim.',
  },
  {
    n: '03',
    title: 'Lead-free is independently verified',
    body: 'Wetted parts — fittings, valves, nozzle, tap — are certified against Australian drinking-water lead limits. Matters most for schools and childcare.',
  },
];

export const metadata: Metadata = {
  title: 'Commercial Water Bubblers — WaterMark Certified | Schools, Offices & Gyms',
  description:
    'WaterMark certified, lead-free commercial water bubblers for Australian schools, offices and gyms. Three cabinets, one spec. Same price retail or trade. Same-day dispatch from Wyong NSW.',
  alternates: { canonical: PATH },
};

export default async function CommercialBubblersPage() {
  const products = await Promise.all(
    CABINETS.map((c) => getProductByHandle(c.handle)),
  );

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Commercial Water Bubblers', href: PATH },
  ];

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbSchema(
            breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
          ),
          faqPageSchema(FAQ_ITEMS),
        ]}
      />

      <article className="bg-white">
        <Hero products={products} breadcrumbs={breadcrumbs} />
        <CertSection />
        <RangeSection products={products} />
        <CompareSection />
        <UseCasesSection />
        <BulkContactSection />
        <FaqSection />
        <TrustStrip />
      </article>
    </>
  );
}

interface HeroProps {
  products: ReadonlyArray<Product | null>;
  breadcrumbs: ReadonlyArray<{ name: string; href: string }>;
}

function Hero({ products, breadcrumbs }: HeroProps) {
  const heroProduct = products[1] ?? products.find((p) => p);
  const heroImage = heroProduct?.featuredImage ?? null;
  const minPrice = lowestPrice(products);

  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <span className="inline-flex items-center bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
              The Commercial Range
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
              Commercial water bubblers — WaterMark certified, lead-free,
              ready for the plumber.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-black/70">
              Three cabinets, one spec. Stainless or HDPE granite — all
              WaterMark certified (WMTS-105:2016, licence 23484) and built for
              Australian schools, offices, and gyms.
            </p>
            {minPrice && (
              <p className="mt-4 text-base text-black/80">
                <span className="font-semibold text-black">From </span>
                <PriceDisplay money={minPrice} className="font-semibold text-black" />
                <span className="text-black/60"> inc GST · three cabinet options</span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <WatermarkBadge href="/watermark-certified/" />
              <LeadFreeBadge />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#range"
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
              >
                See the range
              </a>
              <a
                href={`tel:${BUSINESS_INFO.phone.tel}`}
                className="inline-flex items-center justify-center gap-2 bg-white border border-black hover:bg-gray-50 text-black font-semibold px-6 py-3 rounded transition-colors"
              >
                <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
                {BUSINESS_INFO.phone.display}
              </a>
            </div>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Same price retail or trade
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Same-day dispatch from Wyong NSW
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Plumber-ready Certificate of Compliance
              </li>
              <li className="flex items-start gap-2">
                <Check
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Standard 10″ AU filter housings
              </li>
            </ul>
          </div>
          <div className="relative aspect-square bg-white border border-gray-200 rounded overflow-hidden">
            {heroImage ? (
              <Image
                src={heroImage.url}
                alt={heroImage.altText ?? heroProduct?.title ?? ''}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-6"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center text-black/30"
              >
                <Droplet size={64} strokeWidth={1.25} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CertSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight leading-tight">
              WaterMark certified. Licence 23484. WMTS-105:2016.
            </h2>
            <p className="mt-4 text-base md:text-lg text-black/80">
              In Australia, any plumbing product connected to a mains
              drinking-water supply in a public building has to be WaterMark
              certified. Every model in this range is. Three practical
              consequences:
            </p>
            <ol className="mt-6 border-t border-gray-200">
              {CERT_POINTS.map((point) => (
                <li
                  key={point.n}
                  className="flex gap-4 py-5 border-b border-gray-200"
                >
                  <span className="font-mono text-sm text-black/50 mt-0.5 w-8 flex-shrink-0">
                    {point.n}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-black">
                      {point.title}
                    </p>
                    <p className="mt-1 text-sm text-black/70">{point.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="border border-gray-200 rounded p-6 md:p-8 bg-gray-50">
            <div className="flex items-center gap-4 pb-5 border-b border-gray-200">
              <WatermarkBadge />
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <CertRow label="Licence number" value="23484" mono />
              <CertRow label="Specification" value="WMTS-105:2016" mono />
              <CertRow label="Authority" value="ABCB · Standards Australia" />
              <CertRow label="Lead-free standard" value="AS/NZS 4020" mono />
              <CertRow label="Covers" value="All three commercial bubbler models" />
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CertRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3">
      <dt className="text-black/60">{label}</dt>
      <dd
        className={`text-black font-medium ${mono ? 'font-mono tracking-tight' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}

interface RangeSectionProps {
  products: ReadonlyArray<Product | null>;
}

function RangeSection({ products }: RangeSectionProps) {
  return (
    <section id="range" className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Pick your cabinet
            </h2>
            <p className="mt-2 text-base text-black/70 max-w-2xl">
              Cooling, filtration, and certification are identical across the
              three. The cabinet, footprint, and intended setting are what
              change.
            </p>
          </div>
          <a
            href="#compare"
            className="text-sm font-medium text-brand-blue hover:underline underline-offset-4"
          >
            Compare all three →
          </a>
        </div>
        <ul
          role="list"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {CABINETS.map((cabinet, i) => (
            <li key={cabinet.key}>
              <CabinetCard cabinet={cabinet} product={products[i]} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface CabinetCardProps {
  cabinet: CabinetSpec;
  product: Product | null;
}

function CabinetCard({ cabinet, product }: CabinetCardProps) {
  const href = product ? getProductUrl(product.handle) : `/${cabinet.handle}/`;
  const image = product?.featuredImage ?? null;
  const title = product?.title ?? cabinet.shortName;
  const price = product?.priceRange.minVariantPrice ?? null;

  return (
    <article className="h-full flex flex-col border border-gray-200 hover:border-gray-400 transition-colors rounded">
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-t"
      >
        <div className="relative aspect-square bg-gray-50 border-b border-gray-200 rounded-t overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-contain p-4"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center text-black/20"
            >
              <Droplet size={48} strokeWidth={1.25} />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-semibold text-black">
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full bg-wmk-red"
            />
            WaterMark
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center bg-black text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
            {cabinet.badge}
          </span>
        </div>
      </Link>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-black leading-snug">
          <Link
            href={href}
            className="hover:underline underline-offset-4"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-black/60">{cabinet.tagline}</p>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-black/70">
          {cabinet.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-200">
          {price ? (
            <PriceDisplay
              money={price}
              className="text-base font-semibold text-black"
            />
          ) : (
            <span className="text-sm text-black/60">See product page</span>
          )}
          <Link
            href={href}
            className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompareSection() {
  return (
    <section id="compare" className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Specifications · side-by-side
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-2xl">
          Same cooling block, same filtration, same certification. Cabinet
          and footprint vary by site.
        </p>
        <div className="mt-8 overflow-x-auto border border-gray-200 rounded bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th
                  scope="col"
                  className="text-left font-semibold text-black px-4 py-3 w-1/4 min-w-[10rem]"
                >
                  Spec
                </th>
                {CABINETS.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className="text-left font-semibold text-black px-4 py-3 min-w-[10rem]"
                  >
                    {c.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-gray-200 last:border-b-0">
                  <th
                    scope="row"
                    className="text-left font-medium text-black/70 px-4 py-3 align-top"
                  >
                    {row.label}
                  </th>
                  {CABINETS.map((c) => {
                    const value = row.values[c.key];
                    const isYes = row.yes?.[c.key];
                    const isDash = value === '—';
                    return (
                      <td
                        key={c.key}
                        className="px-4 py-3 text-black align-top"
                      >
                        {isDash ? (
                          <span aria-label="not available" className="text-black/40">
                            <Minus size={16} strokeWidth={2} aria-hidden="true" />
                          </span>
                        ) : isYes ? (
                          <span className="inline-flex items-center gap-1.5 text-brand-blue font-medium">
                            <Check size={16} strokeWidth={2.25} aria-hidden="true" />
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Specified into schools, offices, and gyms across NSW.
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-2xl">
          Same hardware. Different setting. Here&apos;s how the range fits each.
        </p>
        <ul role="list" className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {USE_CASES.map((use) => (
            <li
              key={use.title}
              className="p-6 border border-gray-200 rounded h-full"
            >
              <use.icon
                size={32}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-brand-blue"
              />
              <h3 className="mt-4 text-lg font-semibold text-black">
                {use.title}
              </h3>
              <p className="mt-2 text-sm text-black/80">{use.body}</p>
              <ul className="mt-4 space-y-2 text-sm text-black/80">
                {use.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="mt-0.5 flex-shrink-0 text-brand-blue"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BulkContactSection() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="border border-gray-200 rounded bg-white p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
              Specifying 3+ units?
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Talk to a human today.
            </h2>
            <p className="mt-3 text-base text-black/80">
              Prices are public — you don&apos;t need a quote. But for bulk
              orders we&apos;ll coordinate scheduled delivery, plumber-ready
              documentation, and a single point of contact. Architects,
              facilities managers, and project plumbers welcome.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-black/80">
              {[
                'Plumber-ready spec sheets on request',
                `Same-day dispatch on stocked SKUs — order before ${BUSINESS_INFO.orderCutoff}`,
                `Proper tax invoice · ABN ${BUSINESS_INFO.abn}`,
                'Australian-stocked · no proprietary cartridges',
              ].map((p) => (
                <li key={p} className="flex gap-2">
                  <Check
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="mt-0.5 flex-shrink-0 text-brand-blue"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <ContactRow
              icon={Phone}
              label="Call us"
              value={BUSINESS_INFO.phone.display}
              sub={`${BUSINESS_INFO.phoneSupportHours} AEST`}
              href={`tel:${BUSINESS_INFO.phone.tel}`}
            />
            <ContactRow
              icon={Mail}
              label="Email us"
              value={BUSINESS_INFO.email}
              sub="One reply from a real human in Wyong"
              href={`mailto:${BUSINESS_INFO.email}?subject=Commercial%20bubblers%20-%20bulk%20enquiry`}
            />
            <ContactRow
              icon={Wrench}
              label="Showroom"
              value={`${BUSINESS_INFO.address.street}, ${BUSINESS_INFO.address.locality} ${BUSINESS_INFO.address.region}`}
              sub={BUSINESS_INFO.showroom.hours}
              href="/showroom/"
            />
            <a
              href={`tel:${BUSINESS_INFO.phone.tel}`}
              className="mt-2 inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Call {BUSINESS_INFO.phone.display}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ContactRowProps {
  icon: typeof Phone;
  label: string;
  value: string;
  sub: string;
  href: string;
}

function ContactRow({ icon: Icon, label, value, sub, href }: ContactRowProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors"
    >
      <span className="flex-shrink-0 inline-grid place-items-center w-10 h-10 bg-gray-50 border border-gray-200 rounded">
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="text-brand-blue" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wider text-black/60">
          {label}
        </span>
        <span className="block text-base font-medium text-black truncate">
          {value}
        </span>
        <span className="block text-sm text-black/60">{sub}</span>
      </span>
    </Link>
  );
}

function FaqSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-10 md:gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Questions before you order.
            </h2>
            <p className="mt-3 text-base text-black/70">
              Still unsure? Call{' '}
              <a
                href={`tel:${BUSINESS_INFO.phone.tel}`}
                className="text-brand-blue hover:underline underline-offset-4 font-medium"
              >
                {BUSINESS_INFO.phone.display}
              </a>{' '}
              {BUSINESS_INFO.phoneSupportHours} AEST and we&apos;ll talk it
              through.
            </p>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items: Array<{
    icon: typeof Truck;
    title: string;
    body: string;
  }> = [
    {
      icon: ShieldCheck,
      title: 'WaterMark certified',
      body: 'Every cabinet covered by WMTS-105:2016, licence 23484. Plumber-ready.',
    },
    {
      icon: Truck,
      title: 'Same-day dispatch',
      body: `Orders placed before ${BUSINESS_INFO.orderCutoff} on a business day ship the same day from Wyong NSW.`,
    },
    {
      icon: Wrench,
      title: 'No proprietary lock-in',
      body: 'Standard 10″ Australian housings. Replacement cartridges from any supplier.',
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <li key={item.title}>
              <item.icon
                size={32}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-brand-blue"
              />
              <h3 className="mt-3 text-base font-semibold text-black">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-black/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function lowestPrice(products: ReadonlyArray<Product | null>) {
  const prices = products
    .map((p) => p?.priceRange.minVariantPrice)
    .filter((m): m is NonNullable<typeof m> => m !== null && m !== undefined);
  if (prices.length === 0) return null;
  return prices.reduce((lo, p) =>
    Number(p.amount) < Number(lo.amount) ? p : lo,
  );
}
