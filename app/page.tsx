import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '@/content/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { faqPageSchema } from '@/lib/seo/jsonld';
import { HomeReviewsSection } from '@/components/reviews/HomeReviewsSection';
import type { Product, ProductCardData } from '@/types/product';

const INSTALL_PACKAGE_HANDLE =
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system';

// Re-render the homepage at most once a minute so featured-product
// curation in Shopify shows up promptly on the live site.
export const revalidate = 60;

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

// Curated featured grid. Order here is the order shown on the
// homepage. Handles must exist in data/products.json and Shopify —
// the loader silently drops any that are missing.
const FEATURED_HANDLES: ReadonlyArray<string> = [
  'deluxe-stainless-steel-lockable-three-stage-big-blue-whole-house-water-filter-sy',
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
  'commercial-rust-free-filtered-cold-water-bubbler-wm',
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
  'under-sink-water-filter-3-stage-sediment-carbon-alkaline',
  'pull-down-spray-tap-kitchen-mixer-in-brushed-nickel',
  '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
  'premium-pair-of-water-filter-cartridges-carbon-and-sediment-10-x-2-5-5-mic',
];

function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    productType: product.productType,
    tags: product.tags,
    featuredImage: product.featuredImage,
    price: product.priceRange.minVariantPrice,
    housingSize: product.metafields.housing_size,
  };
}

async function loadFeatured(): Promise<ReadonlyArray<ProductCardData>> {
  // Per-handle fetch (the established pattern for curated product
  // rails in this codebase — see commercial-water-bubblers and
  // water-bubblers-for-gyms). Shopify's product-search `query` field
  // is unreliable for bare hyphenated handles, so we look up each
  // handle individually and project to ProductCardData. Missing
  // handles (archived / unpublished) are silently dropped.
  const products = await Promise.all(
    FEATURED_HANDLES.map((handle) => getProductByHandle(handle)),
  );
  return products
    .filter((p): p is Product => p !== null)
    .map(toCardData);
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
  return (
    <section>
      <JsonLdScript data={faqPageSchema(FAQ_ITEMS)} />
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
        <div className="max-w-2xl mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
            Shop by category
          </h2>
          <p className="mt-2 text-base text-black/70">
            Every filtration product we sell, organised the way Australian
            tradies and homeowners actually shop.
          </p>
        </div>
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden"
        >
          {CATEGORIES.map((category) => {
            return (
              <li key={category.slug} className="bg-white">
                <Link
                  href={`/${category.slug}/`}
                  className="group flex flex-col h-full p-6 md:p-7 hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-blue"
                >
                  <h3 className="text-lg font-semibold text-black">
                    {category.label}
                  </h3>
                  <p className="mt-2 text-sm text-black/70 flex-1">
                    {CATEGORY_BLURBS[category.slug] ??
                      `${category.label} for every Australian home and trade.`}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                    Shop {category.label.toLowerCase()}
                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </span>
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden"
        >
          {items.map((item) => (
            <li key={item.title} className="bg-white flex gap-4 p-6">
              <item.icon
                size={28}
                strokeWidth={1.75}
                aria-hidden="true"
                className="flex-shrink-0 text-brand-blue mt-0.5"
              />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-black">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-black/70">{item.body}</p>
              </div>
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
