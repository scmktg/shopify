import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import {
  ChevronDown,
  DollarSign,
  Droplet,
  Filter,
  Gauge,
  GlassWater,
  GraduationCap,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '@/content/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { HomeReviewsSection } from '@/components/reviews/HomeReviewsSection';

const INSTALL_PACKAGE_HANDLE =
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system';

// Re-render the homepage at most once a minute so featured-product
// curation in Shopify shows up promptly on the live site.
export const revalidate = 60;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'water-filters': Droplet,
  cartridges: Filter,
  'bubblers-and-coolers': GlassWater,
  'pumps-and-tanks': Gauge,
  plumbing: Wrench,
};

const CATEGORY_BLURBS: Record<string, string> = {
  'water-filters':
    'Under-sink, whole-house, RO, UV, bench-top, inline, and commercial systems.',
  cartridges:
    'Sediment, carbon, RO membranes, alkaline, fluoride removal, and full sets.',
  'bubblers-and-coolers':
    'Drinking bubblers, water coolers and chillers, plus parts.',
  'pumps-and-tanks':
    '12V pumps, RO booster pumps, pressure tanks, dosing tanks.',
  plumbing: 'Filter-friendly taps, showers, toilets, and bundles.',
};

const FEATURED_TARGET = 8;

function isValidFeatured(product: {
  handle: string;
  tags: ReadonlyArray<string>;
  price: { amount: string };
}): boolean {
  // Cast via Number() so partial-numeric strings ('0.00 AUD' etc.)
  // resolve to NaN rather than parseFloat's leading-digit fallback.
  const price = Number(product.price.amount);
  if (!Number.isFinite(price) || price <= 0) return false;
  if (product.handle.includes('-dup')) return false;
  if (product.tags.includes('cut') || product.tags.includes('draft')) {
    return false;
  }
  return true;
}

async function loadFeatured() {
  // Fetch more than needed so post-filter we still have headroom.
  const featured = await getProducts({
    query: 'tag:featured',
    first: 24,
    sortKey: 'BEST_SELLING',
  });
  const valid = featured.products.filter(isValidFeatured);
  if (valid.length >= FEATURED_TARGET) {
    return valid.slice(0, FEATURED_TARGET);
  }

  // Pad with newest valid products until we hit the target.
  const padded: typeof valid = [...valid];
  const seen = new Set(padded.map((p) => p.id));
  const fallback = await getProducts({
    first: 24,
    sortKey: 'CREATED_AT',
    reverse: true,
  });
  for (const product of fallback.products) {
    if (padded.length >= FEATURED_TARGET) break;
    if (seen.has(product.id)) continue;
    if (!isValidFeatured(product)) continue;
    padded.push(product);
    seen.add(product.id);
  }
  return padded.slice(0, FEATURED_TARGET);
}

async function loadInstallHeroImage(): Promise<{
  url: string;
  alt: string;
} | null> {
  const product = await getProductByHandle(INSTALL_PACKAGE_HANDLE);
  if (!product?.featuredImage) return null;
  return {
    url: product.featuredImage.url,
    alt: product.featuredImage.altText ?? product.title,
  };
}

export default async function HomePage() {
  const [featured, installHeroImage] = await Promise.all([
    loadFeatured(),
    loadInstallHeroImage(),
  ]);

  return (
    <>
      <Hero installHeroImage={installHeroImage} />
      <CategoryGrid />
      <TrustStrip />
      <FeaturedProducts products={featured} />
      <WhyDifferent />
      <HomeReviewsSection />
      <Faq />
    </>
  );
}

const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Do you sell to trade/wholesale customers?',
    a: 'Yes — and at the same price as everyone else. There is no separate trade portal, no account application, and no minimum order. Tradies and homeowners pay the same wholesale price up front.',
  },
  {
    q: 'What is WaterMark certification and why does it matter?',
    a: 'WaterMark is the Australian certification scheme for plumbing products that connect to mains water. Every certified product on this site shows its licence number; non-certified products are clearly labelled as off-mains use only. Council inspectors require certified products on every mains-pressure install.',
  },
  {
    q: 'How do I know which water filter is right for my home?',
    a: 'Start with what you want to filter. Chlorine and taste — a carbon under-sink filter does the job. Sediment from rainwater — a whole-house pre-filter. Fluoride — reverse osmosis. Each product page lists what the system reduces; the help guides break it down by water source if you are not sure.',
  },
  {
    q: 'Do you ship Australia-wide?',
    a: 'Yes. Tracked delivery on every order, with standard tiered rates Australia-wide from $9.95. Whole-house systems, UV systems, and freestanding coolers ship free Australia-wide. Commercial RO plants and large tanks are freight-quoted within one business day. Orders placed before 12pm AEST ship the same business day from our Central Coast NSW warehouse.',
  },
  {
    q: "What's your returns policy?",
    a: 'Thirty-day returns on unopened products with no restocking fee. Faulty products are covered separately under Australian Consumer Law. Full details are on the Returns page.',
  },
  {
    q: 'Can I install these myself, or do I need a plumber?',
    a: 'Under-sink and bench-top filters are usually DIY — they tap into the existing cold-water line with the included push-fit fittings. Whole-house systems and anything cutting into mains plumbing must be installed by a licensed plumber. Each product page lists the install requirements.',
  },
];

function Faq() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <section>
      <JsonLdScript data={faqSchema} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl font-semibold text-black">
          Frequently asked questions
        </h2>
        <div className="mt-6 border-t border-gray-200">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group border-b border-gray-200"
            >
              <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold text-black">
                  {item.q}
                </h3>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className="flex-shrink-0 mt-0.5 text-black/60 transition-transform duration-150 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 text-base text-black/80">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

interface HeroProps {
  installHeroImage: { url: string; alt: string } | null;
}

function Hero({ installHeroImage }: HeroProps) {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight leading-tight">
              Australia&apos;s water filtration specialist
            </h1>
            <p className="mt-4 sm:mt-5 max-w-2xl mx-auto md:mx-0 text-base sm:text-lg md:text-xl text-black/70">
              Wholesale prices on water filters, cartridges, and filtration
              systems. One price for everyone — no accounts, no quotes, just
              the best price upfront.
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center md:justify-start">
              <Link
                href="/water-filters/"
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
              >
                Shop water filters
              </Link>
            </div>
            <p
              className="mt-4 sm:mt-5 text-sm text-black/60"
              aria-label="Trusted by tradies and homeowners across Australia"
            >
              <span aria-hidden="true" className="text-brand-blue mr-2">
                ★★★★★
              </span>
              Trusted by tradies and homeowners across Australia
            </p>
          </div>

          <InstallHeroCard image={installHeroImage} />
        </div>
      </div>
    </section>
  );
}

interface InstallHeroCardProps {
  image: { url: string; alt: string } | null;
}

function InstallHeroCard({ image }: InstallHeroCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-5 md:p-6 flex flex-col gap-4">
      <span className="self-start inline-flex items-center bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
        Local offer — Central Coast NSW
      </span>
      <div className="flex gap-4 items-start">
        <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-white border border-gray-200 rounded overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 112px, 96px"
              className="object-contain p-2"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-black leading-snug">
            Whole House Water Filter — Installed for $2,299
          </h3>
          <p className="mt-2 text-sm text-black/70">
            WaterMark certified system + local plumber. Filtered water at every
            tap.
          </p>
        </div>
      </div>
      <Link
        href="/whole-house-installation-package/"
        className="self-start inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-5 py-2.5 rounded transition-colors text-sm"
      >
        Get a quote
      </Link>
    </div>
  );
}

function CategoryGrid() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-semibold text-black">Shop by category</h2>
        </div>
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Droplet;
            return (
              <li key={category.slug}>
                <Link
                  href={`/${category.slug}/`}
                  className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center h-full gap-4 sm:gap-0 p-4 sm:p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded transition-colors"
                >
                  <Icon
                    size={36}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="flex-shrink-0 text-brand-blue sm:h-12 sm:w-12"
                  />
                  <div className="min-w-0">
                    <h3 className="sm:mt-4 text-lg sm:text-xl font-semibold text-black">
                      {category.label}
                    </h3>
                    <p className="mt-1 sm:mt-2 text-sm text-black/70">
                      {CATEGORY_BLURBS[category.slug] ??
                        `${category.label} for every Australian home and trade.`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items: Array<{ icon: LucideIcon; title: string; body: string }> = [
    {
      icon: DollarSign,
      title: 'Wholesale pricing',
      body: 'Same price for everyone — homeowners, tradies, commercial.',
    },
    {
      icon: Truck,
      title: 'Free freight on systems',
      body: 'Whole-house filters, UV systems, and freestanding coolers ship free Australia-wide.',
    },
    {
      icon: ShieldCheck,
      title: 'WaterMark certified options',
      body: 'Every certified product shows its licence number on the page.',
    },
    {
      icon: MapPin,
      title: 'Australian owned',
      body: 'Based on the Central Coast NSW. Real people on the phones.',
    },
  ];
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <ul
          role="list"
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-8"
        >
          {items.map((item) => (
            <li key={item.title} className="text-center">
              <item.icon
                size={32}
                strokeWidth={1.75}
                aria-hidden="true"
                className="mx-auto text-brand-blue"
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

interface FeaturedProductsProps {
  products: Awaited<ReturnType<typeof loadFeatured>>;
}

function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">
            Featured products
          </h2>
          <Link
            href="/water-filters/"
            className="text-sm font-medium text-brand-blue hover:underline underline-offset-4"
          >
            See more
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

function WhyDifferent() {
  const points: Array<{ icon: LucideIcon; title: string; body: string }> = [
    {
      icon: Lightbulb,
      title: 'No quote-chasing',
      body: 'Every price is on the page. No phone calls to find out what something costs, no gated trade pricing, no surprise upsell at checkout.',
    },
    {
      icon: GraduationCap,
      title: 'Specialist knowledge',
      body: "We sell water filtration — that's it. Spec sheets, installation notes, and compatibility info on every product so you order the right thing first time.",
    },
    {
      icon: Zap,
      title: 'Fast Australian dispatch',
      body: 'Orders placed before 12pm AEST ship the same business day from our Central Coast NSW warehouse. Tracked delivery on every order.',
    },
  ];
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl font-semibold text-black">
          Why we&apos;re different
        </h2>
        <ul role="list" className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3">
          {points.map((point, index) => (
            <li
              key={point.title}
              className={clsx(
                'py-6 md:py-2 md:px-8 first:md:pl-0 last:md:pr-0',
                index > 0 && 'border-t border-gray-200 md:border-t-0 md:border-l',
              )}
            >
              <point.icon
                size={32}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-brand-blue"
              />
              <h3 className="mt-4 text-xl font-semibold text-black">
                {point.title}
              </h3>
              <p className="mt-2 text-base text-black/80">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
