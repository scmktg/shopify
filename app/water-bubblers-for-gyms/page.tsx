import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Check,
  Clock3,
  Droplet,
  Dumbbell,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingDown,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business-info';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import {
  WatermarkBadge,
  LeadFreeBadge,
} from '@/components/product/WatermarkBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { getFeaturedReviews } from '@/lib/reviews';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
  faqPageSchema,
} from '@/lib/seo/jsonld';
import type { Product } from '@/types/product';

export const revalidate = 3600;

const PATH = '/water-bubblers-for-gyms/';

// Two cabinets recommended for gyms — both have the side-mounted
// bottle-fill tap, which round-cylindrical bubblers lack. Round
// model is still linked from the parent landing for sites that
// don't need bottle fill.
type Pick = 'square' | 'hdpe';

interface GymPick {
  key: Pick;
  handle: string;
  shortName: string;
  fit: string;
  tagline: string;
  bullets: ReadonlyArray<string>;
}

const PICKS: ReadonlyArray<GymPick> = [
  {
    key: 'square',
    handle:
      'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    shortName: 'Square Stainless',
    fit: 'Best for indoor gym floors',
    tagline:
      'Flush-fit SUS304 cabinet — sits against any wall or pillar, lines up cleanly in corridors.',
    bullets: [
      'SUS304 stainless — survives sweat, towels, daily wipe-downs',
      'Spout + side tap for bottle fill — ends the queue at break',
      '99 cm tall, 30 × 30 cm footprint — fits beside lockers and walls',
      '20 L/hr cooling at 8–12 °C — keeps up with peak class throughput',
    ],
  },
  {
    key: 'hdpe',
    handle: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    shortName: 'HDPE Granite',
    fit: 'Best for outdoor & poolside',
    tagline:
      'Rust-free HDPE cabinet with granite finish — built for outdoor zones, F45-style covered areas, and pool decks.',
    bullets: [
      'HDPE polymer — does not rust, does not pit at welds (there are no welds)',
      'UV-stable granite finish moulded through the cabinet, not painted',
      '122 cm tall on a 41 × 41 cm pad — freestanding, anchor-bolt ready',
      'Same 20 L/hr cooling and lead-free WMTS-105:2016 certification',
    ],
  },
];

const PAIN_POINTS = [
  {
    icon: TrendingDown,
    title: 'End the bottled-water bill',
    body: 'Direct mains, no consumables, no vending operator margins. Plumb it in once.',
  },
  {
    icon: Users,
    title: 'Keep up with peak class',
    body: '20 L/hr cooling = ~100 bottle refills/hour. Side tap fills bottles fast at the bell.',
  },
  {
    icon: Droplet,
    title: 'Survive sweat & wipe-downs',
    body: 'SUS304 stainless or rust-free HDPE. Push-button rated for thousands of cycles.',
  },
  {
    icon: Shield,
    title: 'Pass council compliance',
    body: 'WaterMark certified (WMTS-105:2016, lic. 23484). Plumber-ready Certificate of Compliance.',
  },
];

const GYM_TYPES = [
  {
    icon: Timer,
    title: 'F45, HIIT & CrossFit',
    body: '45-minute class formats produce a hard demand spike at the bell. The 20 L/hr cooling block and side tap clear a queue of bottle-fillers in minutes — not the 10+ minutes a single bubbler spout would take.',
    proof: 'Recommended: Square Stainless or HDPE Granite — both have bottle fill.',
  },
  {
    icon: Clock3,
    title: '24-hour & big-box gyms',
    body: 'Continuous-duty cooling rated for unattended overnight operation. SUS304 panels wipe clean in seconds, push-button activation is rated for thousands of cycles without service intervals.',
    proof: 'Recommended: Square Stainless — flush wall fit beside cardio rows.',
  },
  {
    icon: Sparkles,
    title: 'Boutique & yoga studios',
    body: 'Reception-area hydration station that looks like part of the fit-out, not bolted on. Square cabinet sits flush in foyers; HDPE granite reads as a permanent fixture in outdoor courtyards.',
    proof: 'Recommended: Square Stainless for indoor, HDPE for covered outdoor.',
  },
  {
    icon: Dumbbell,
    title: 'Council & community leisure centres',
    body: 'Lead-free wetted parts (AS/NZS 4020), WMTS-105:2016 certification, and Australian-stocked replacement cartridges meet procurement panels that ask for compliance documentation up front.',
    proof: 'Recommended: HDPE Granite for pool decks, Square Stainless for foyers.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What size bubbler do I need for my gym?',
    a: 'For most gyms — F45, HIIT, big-box, council — a single 20 L/hr unit covers up to about 100 bottle refills per hour. If your peak class size is over 40 and they all hit the bubbler at once, run two units. Call us and tell us your class size and we will recommend the right number.',
  },
  {
    q: 'Can a regular plumber install this in my gym?',
    a: 'Yes. All our commercial bubblers are WaterMark certified under WMTS-105:2016 (licence 23484), which is the Australian standard for plumbed-in drinking fountains. Any licensed Australian plumber can install on a mains supply line and issue a Certificate of Compliance — that document is what councils and gym-chain franchise inspectors typically ask to see.',
  },
  {
    q: 'Do you ship to gyms outside NSW?',
    a: `Yes. Tracked Australia-wide dispatch from Wyong NSW. Orders placed before ${BUSINESS_INFO.orderCutoff} on a business day ship the same day. Flat-rate freight, free over $${BUSINESS_INFO.shippingFreeThresholdAud}. We have shipped to gyms in QLD, VIC, WA, SA, and TAS.`,
  },
  {
    q: 'How much does the bubbler save us versus bottled water?',
    a: 'Depends on your current spend. As a rough benchmark — if you currently buy two cases of 600 ml bottles a week for staff and members (typical small gym), that is around $1,500–$2,000 a year at retail vending prices. A single unit pays for itself inside the first year, then you are running on mains-water cost (well under a cent per fill) for the next decade.',
  },
  {
    q: 'Is the side tap good enough for water bottles?',
    a: 'Yes — the Square Stainless and HDPE Granite both have a side-mounted dispensing tap at about 25 cm above the cabinet top, which clears the bottom of a standard 600 ml or 1 L bottle without tipping. The Round model has the spout only — choose Square or HDPE if bottle fill matters to you.',
  },
  {
    q: 'What about hygiene? Touchless options?',
    a: 'All three models use push-button activation rated for high-traffic public use. Push-button is hygienic when paired with the integrated drip-tray drainage (no standing water around the spout). We do not currently stock touchless sensor units in the certified range — push-button remains the most reliable mechanism for sustained gym throughput, in our experience.',
  },
  {
    q: 'What about filter changes — who does that?',
    a: 'Standard 10″ Australian housings, internal access via the cabinet. Most gyms do this in-house (5 minutes, no tools required for cartridge swap), or a sparkie/handyman during a normal site visit. Cartridges are not proprietary — Carbon CTO + Sediment sets are available from us or any AU water-filter supplier.',
  },
  {
    q: 'Is the price the same retail or trade?',
    a: 'Yes — that is the brand promise. Same wholesale price whether you are a single PT studio buying one or a national chain rolling out 40 units. No accounts, no minimums, no quote process. The price you see on the product page is the price you pay.',
  },
];

const QUICK_SPECS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Cooling capacity', value: '20 L/hr' },
  { label: 'Water temperature', value: '8–12 °C' },
  { label: 'Refrigerant', value: 'R290 · low GWP' },
  { label: 'Filtration', value: 'PP + Carbon · 10″ AU housings' },
  { label: 'Lead-free standard', value: 'AS/NZS 4020' },
  { label: 'WaterMark licence', value: 'WMTS-105:2016 · lic. 23484' },
];

export const metadata: Metadata = {
  title:
    'Water Bubblers for Gyms — Commercial, WaterMark Certified | Bottle-Fill',
  description:
    'Commercial water bubblers for Australian gyms — WaterMark certified, lead-free, with bottle-fill side tap. 20 L/hr cooling, plumber-ready. Same-day dispatch from Wyong NSW.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Water Bubblers for Gyms — Commercial, WaterMark Certified',
    description:
      'Commercial bubblers built for F45, HIIT, 24-hour gyms, and council leisure centres. Bottle-fill side tap, lead-free, plumber-ready.',
    url: PATH,
  },
};

export default async function GymBubblersPage() {
  const [productSquare, productHdpe, featuredReviews] = await Promise.all([
    getProductByHandle(PICKS[0].handle),
    getProductByHandle(PICKS[1].handle),
    Promise.resolve(getFeaturedReviews(3)),
  ]);
  const products: Record<Pick, Product | null> = {
    square: productSquare,
    hdpe: productHdpe,
  };

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    {
      name: 'Commercial Water Bubblers',
      href: '/commercial-water-bubblers/',
    },
    { name: 'For Gyms', href: PATH },
  ];

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbSchema(
            breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
          ),
          faqPageSchema(FAQ_ITEMS),
          collectionSchema(
            'Water Bubblers for Gyms',
            PATH,
            'Commercial water bubblers for Australian gyms — WaterMark certified, lead-free, with bottle-fill side tap. Recommended models for F45, 24-hour gyms, boutique studios, and council leisure centres.',
          ),
        ]}
      />

      <article className="bg-white">
        <Hero products={products} breadcrumbs={breadcrumbs} />
        <PainPointStrip />
        <PicksSection products={products} />
        <QuickSpecsSection />
        <GymTypesSection />
        <CertSection />
        <ReviewsSection reviews={featuredReviews} />
        <FaqSection />
        <FinalCta />
      </article>
    </>
  );
}

interface HeroProps {
  products: Record<Pick, Product | null>;
  breadcrumbs: ReadonlyArray<{ name: string; href: string }>;
}

function Hero({ products, breadcrumbs }: HeroProps) {
  const heroProduct = products.square ?? products.hdpe;
  const heroImage = heroProduct?.featuredImage ?? null;
  const minPrice = lowestPrice(Object.values(products));
  const heroHref = heroProduct
    ? getProductUrl(heroProduct.handle)
    : '#picks';

  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <span className="inline-flex items-center bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
              Built for Australian gyms
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
              Water bubblers for gyms — bottle-fill, WaterMark certified, ready
              for the plumber.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-black/70">
              Stop buying bottled water. End the queue at break. 20 L/hr
              cooling, lead-free wetted parts, and a side-mounted bottle-fill
              tap — built for F45, HIIT, 24-hour gyms, boutique studios, and
              council leisure centres.
            </p>
            {minPrice && (
              <p className="mt-4 text-base text-black/80">
                <span className="font-semibold text-black">From </span>
                <PriceDisplay
                  money={minPrice}
                  className="font-semibold text-black"
                />
                <span className="text-black/60">
                  {' '}
                  inc GST · same price retail or trade
                </span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <WatermarkBadge href="/watermark-certified/" />
              <LeadFreeBadge />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#picks"
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
              >
                See gym-ready models
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
              {[
                'Bottle-fill side tap on both gym picks',
                `Same-day dispatch (before ${BUSINESS_INFO.orderCutoff})`,
                'Plumber-ready Certificate of Compliance',
                'No proprietary cartridges, no lock-in',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="mt-0.5 flex-shrink-0 text-brand-blue"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={heroHref}
            aria-label={heroProduct?.title ?? 'View recommended gym bubbler'}
            className="relative aspect-square bg-white border border-gray-200 rounded overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            {heroImage ? (
              <Image
                src={heroImage.url}
                alt={
                  heroImage.altText ??
                  'Commercial water bubbler recommended for gyms'
                }
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-6"
              />
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center text-black/30"
              >
                <Droplet size={64} strokeWidth={1.25} />
              </span>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}

function PainPointStrip() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          What changes when you plumb one in.
        </h2>
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {PAIN_POINTS.map((point) => (
            <li key={point.title} className="p-5 border border-gray-200 rounded">
              <point.icon
                size={28}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-brand-blue"
              />
              <h3 className="mt-3 text-base font-semibold text-black">
                {point.title}
              </h3>
              <p className="mt-1 text-sm text-black/70">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface PicksSectionProps {
  products: Record<Pick, Product | null>;
}

function PicksSection({ products }: PicksSectionProps) {
  return (
    <section id="picks" className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Two models we recommend for gyms.
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-2xl">
          Both have the side-mounted bottle-fill tap that the round model
          lacks. Pick the cabinet that suits the site —
          {' '}
          <Link
            href="/commercial-water-bubblers/"
            className="text-brand-blue hover:underline underline-offset-4 font-medium"
          >
            see the full commercial range →
          </Link>
        </p>
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {PICKS.map((pick) => (
            <li key={pick.key}>
              <PickCard pick={pick} product={products[pick.key]} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface PickCardProps {
  pick: GymPick;
  product: Product | null;
}

function PickCard({ pick, product }: PickCardProps) {
  const href = product ? getProductUrl(product.handle) : `/${pick.handle}/`;
  const image = product?.featuredImage ?? null;
  const title = product?.title ?? pick.shortName;
  const price = product?.priceRange.minVariantPrice ?? null;

  return (
    <article className="h-full flex flex-col border border-gray-200 hover:border-gray-400 transition-colors rounded">
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-t"
      >
        <div className="relative aspect-[4/3] bg-gray-50 border-b border-gray-200 rounded-t overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-4"
            />
          ) : (
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center text-black/20"
            >
              <Droplet size={48} strokeWidth={1.25} />
            </span>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-semibold text-black">
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full bg-wmk-red"
            />
            WaterMark · lead-free
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center bg-brand-blue text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
            {pick.fit}
          </span>
        </div>
      </Link>
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-black leading-snug">
          <Link href={href} className="hover:underline underline-offset-4">
            {title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-black/70">{pick.tagline}</p>
        <ul className="mt-4 space-y-2 text-sm text-black/80">
          {pick.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <CheckCircle2
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="mt-0.5 flex-shrink-0 text-brand-blue"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5 flex items-center justify-between gap-3 border-t border-gray-200">
          {price ? (
            <PriceDisplay
              money={price}
              className="text-lg font-semibold text-black"
            />
          ) : (
            <span className="text-sm text-black/60">See product page</span>
          )}
          <Link
            href={href}
            className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors"
          >
            View &amp; order
          </Link>
        </div>
      </div>
    </article>
  );
}

function QuickSpecsSection() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          The numbers your facilities manager wants.
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-2xl">
          Both gym-ready models share the same cooling block, filtration, and
          certification. Cabinet, footprint, and outdoor rating are what change.
        </p>
        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden">
          {QUICK_SPECS.map((spec) => (
            <div key={spec.label} className="bg-white p-4 sm:p-5">
              <dt className="text-xs uppercase tracking-wider text-black/60 font-medium">
                {spec.label}
              </dt>
              <dd className="mt-1 text-base font-semibold text-black tabular-nums">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function GymTypesSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Specified into gyms across Australia.
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-2xl">
          Same hardware, different setting. Here&apos;s which model fits each
          kind of gym.
        </p>
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {GYM_TYPES.map((g) => (
            <li
              key={g.title}
              className="p-6 border border-gray-200 rounded h-full flex flex-col"
            >
              <g.icon
                size={32}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-brand-blue"
              />
              <h3 className="mt-4 text-lg font-semibold text-black">
                {g.title}
              </h3>
              <p className="mt-2 text-sm text-black/80">{g.body}</p>
              <p className="mt-4 text-sm font-medium text-black/70 border-t border-gray-200 pt-3">
                {g.proof}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CertSection() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 md:gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Plumber-ready. Council-ready. Insurance-ready.
            </h2>
            <p className="mt-3 text-base text-black/80">
              Every model on this page is WaterMark certified under{' '}
              <span className="font-semibold text-black">WMTS-105:2016</span>{' '}
              (licence{' '}
              <span className="font-mono text-black">23484</span>) — the
              Australian standard for plumbed-in drinking fountains. Lead-free
              wetted parts are independently verified against{' '}
              <span className="font-mono text-black">AS/NZS 4020</span>.
            </p>
            <p className="mt-3 text-base text-black/80">
              For gym chains and council leisure centres, that means a
              compliance pack your procurement panel can sign off in one pass
              — no follow-up questions about lead content, no surprises at
              install.
            </p>
            <p className="mt-4">
              <Link
                href="/watermark-certified/"
                className="text-brand-blue hover:underline underline-offset-4 font-medium"
              >
                See all WaterMark certified products →
              </Link>
            </p>
          </div>
          <aside className="border border-gray-200 rounded p-6 bg-white">
            <div className="flex items-center gap-3">
              <WatermarkBadge />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <CertRow
                label="Licence"
                value="23484"
                mono
              />
              <CertRow
                label="Specification"
                value="WMTS-105:2016"
                mono
              />
              <CertRow
                label="Authority"
                value="ABCB · Standards Australia"
              />
              <CertRow
                label="Lead-free"
                value="AS/NZS 4020"
                mono
              />
              <CertRow
                label="ABN"
                value={BUSINESS_INFO.abn}
                mono
              />
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
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="text-black/60">{label}</dt>
      <dd
        className={`text-black font-medium ${mono ? 'font-mono tracking-tight' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}

interface ReviewsSectionProps {
  reviews: ReturnType<typeof getFeaturedReviews>;
}

function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          What customers say.
        </h2>
        <ul role="list" className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link
            href="/reviews/"
            className="text-brand-blue hover:underline underline-offset-4 font-medium"
          >
            Read all customer reviews →
          </Link>
        </p>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-10 md:gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Gym owners, ask away.
            </h2>
            <p className="mt-3 text-base text-black/70">
              Still unsure? Call{' '}
              <a
                href={`tel:${BUSINESS_INFO.phone.tel}`}
                className="text-brand-blue hover:underline underline-offset-4 font-medium"
              >
                {BUSINESS_INFO.phone.display}
              </a>{' '}
              {BUSINESS_INFO.phoneSupportHours} AEST.
            </p>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="border border-gray-200 rounded p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Ready to plumb one in?
            </h2>
            <p className="mt-3 text-base text-black/80">
              Order online for same-day dispatch from Wyong NSW, or call us
              with your class size and we&apos;ll spec the right unit (or
              units) in a five-minute conversation.
            </p>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <Truck
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Tracked Australia-wide
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                WaterMark certified
              </li>
              <li className="flex items-start gap-2">
                <Wrench
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Standard 10″ AU housings
              </li>
              <li className="flex items-start gap-2">
                <Phone
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 text-brand-blue"
                />
                Real humans on the phones
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#picks"
              className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              See gym-ready models
            </a>
            <a
              href={`tel:${BUSINESS_INFO.phone.tel}`}
              className="inline-flex items-center justify-center gap-2 bg-white border border-black hover:bg-gray-50 text-black font-semibold px-6 py-3 rounded transition-colors"
            >
              <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
              {BUSINESS_INFO.phone.display}
            </a>
            <a
              href={`mailto:${BUSINESS_INFO.email}?subject=Gym%20bubbler%20enquiry`}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-brand-blue hover:underline underline-offset-4"
            >
              <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
              {BUSINESS_INFO.email}
            </a>
          </div>
        </div>
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
