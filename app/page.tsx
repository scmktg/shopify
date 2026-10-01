import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  MapPin,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '@/content/categories';
import { ProductCard } from '@/components/product/ProductCard';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { faqPageSchema } from '@/lib/seo/jsonld';
import { HomeReviewsSection } from '@/components/reviews/HomeReviewsSection';
import type { Product, ProductCardData } from '@/types/product';

const FEATURED = {
  wholeHouse: 'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
  bubbler:
    'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
  threeWayTap:
    '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
  underSink: 'under-sink-water-filter-2-stage-sediment-carbon',
  premiumPair:
    'twin-pair-of-water-filter-cartridges-premium-carbon-cto-plus-sediment-pp-10-x-2',
} as const;

export const metadata: Metadata = {
  title: 'Water Filters & Water Filtration Systems Australia | EnviroAqua',
  description:
    'Shop whole-house, under-sink and commercial water filtration, filtered-water taps and replacement cartridges from EnviroAqua Australia.',
  alternates: { canonical: '/' },
  verification: {
    google: 'Uu1dcLCaDuZb3l3dynm2aRNtOacQjYyX1bToX93xCH4',
  },
};

export const revalidate = 60;

const CATEGORY_BLURBS: Record<string, string> = {
  'water-filters':
    'Under-sink, whole-house, reverse osmosis, UV, bench-top and commercial systems.',
  cartridges:
    'Sediment, carbon, RO membranes, alkaline and complete replacement sets.',
  'bubblers-and-coolers':
    'Commercial drinking bubblers, water coolers, chillers and replacement parts.',
  'pumps-and-tanks':
    '12V pumps, booster pumps, pressure tanks, dosing tanks and components.',
  plumbing: 'Filtered-water taps, kitchen taps, bathroom fittings and bundles.',
};

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
    variants: product.variants,
  };
}

async function loadFeaturedProduct(handle: string): Promise<ProductCardData | null> {
  const product = await getProductByHandle(handle);
  return product ? toCardData(product) : null;
}

export default async function HomePage() {
  const [wholeHouse, bubbler, threeWayTap, underSink, premiumPair] =
    await Promise.all([
      loadFeaturedProduct(FEATURED.wholeHouse),
      loadFeaturedProduct(FEATURED.bubbler),
      loadFeaturedProduct(FEATURED.threeWayTap),
      loadFeaturedProduct(FEATURED.underSink),
      loadFeaturedProduct(FEATURED.premiumPair),
    ]);

  return (
    <>
      <Hero />
      <TrustStrip />

      <ProductSpotlight
        product={wholeHouse}
        eyebrow="Whole-house filtration"
        title="Stainless-steel whole-house water filtration"
        body="Our stainless-steel whole-house system is the premium starting point for customers who want filtration across the property rather than at a single tap. It is designed for mains-connected whole-home filtration and gives buyers a clear path into the wider whole-house range if they need a different size, stage configuration or installation option."
        bullets={[
          'Premium stainless-steel whole-house configuration',
          'Designed for filtration before water is distributed through the home',
          'A strong fit for customers comparing higher-spec whole-house systems',
        ]}
        rangeHref="/water-filters/whole-house/"
        rangeLabel="Explore all whole-house water filters"
        tone="light"
      />

      <ProductSpotlight
        product={bubbler}
        eyebrow="Commercial drinking water"
        title="Square stainless-steel commercial water bubbler"
        body="This square stainless-steel design is the commercial bubbler we want customers to see first: a clean, durable option for schools, workplaces, factories, gyms and other high-use environments. Customers can go straight to this model or compare the wider bubbler range if they need a different footprint or format."
        bullets={[
          'Commercial stainless-steel construction',
          'Filtered chilled drinking-water solution',
          'Suitable for high-use commercial and institutional settings',
        ]}
        rangeHref="/commercial-water-bubblers/"
        rangeLabel="Explore all commercial water bubblers"
        tone="white"
      />

      <ProductSpotlight
        product={threeWayTap}
        eyebrow="Filtered-water kitchen tap"
        title="3-way filtered kitchen mixer tap"
        body="Replace a separate drinking-water faucet with one streamlined kitchen mixer. This 3-way tap keeps filtered drinking water separate from normal hot and cold supply while giving customers a choice of finishes from the same product. Use the colour swatches on the product card to preview the available variants before opening the product page."
        bullets={[
          'Hot, cold and filtered water from one mixer',
          'Colour variants available from the same product',
          'Designed to pair with compatible under-sink and reverse-osmosis systems',
        ]}
        rangeHref="/plumbing/ro-filter-taps/"
        rangeLabel="Explore all filtered-water taps"
        tone="dark"
      />

      <ProductSpotlight
        product={underSink}
        eyebrow="Simple drinking-water filtration"
        title="2-stage under-sink water filter"
        body="For customers who want a straightforward drinking-water system without moving immediately to reverse osmosis, this 2-stage under-sink system is the clearest entry point. It keeps the decision simple while still giving buyers an easy route to compare more advanced under-sink systems."
        bullets={[
          'Compact point-of-use filtration under the kitchen sink',
          'A simple step up from unfiltered mains drinking water',
          'Easy comparison point before considering more advanced systems',
        ]}
        rangeHref="/water-filters/under-sink/"
        rangeLabel="Explore all under-sink water filters"
        tone="light"
      />

      <ProductSpotlight
        product={premiumPair}
        eyebrow="Replacement cartridges"
        title="Premium carbon + sediment cartridge pair"
        body="For repeat customers and anyone maintaining a standard two-stage system, the premium carbon and sediment pair is the replacement set to make easiest to find. It gives customers one obvious maintenance purchase while keeping the wider cartridge catalogue one click away for other sizes, stages and media types."
        bullets={[
          'Premium sediment + carbon replacement pair',
          'Ideal as a clear recurring-purchase pathway',
          'Wider cartridge range available for other housings and systems',
        ]}
        rangeHref="/cartridges/"
        rangeLabel="Explore all replacement cartridges"
        tone="white"
      />

      <CategoryGrid />
      <WhyEnviroAqua />
      <HomeReviewsSection />
      <Faq />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
          EnviroAqua Australia
        </p>
        <h1 className="mt-3 mx-auto max-w-5xl text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight leading-tight">
          Water Filters &amp; Water Filtration Systems Australia
        </h1>
        <p className="mt-5 mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-black/70">
          Start with one of our key filtration products below, or explore the
          wider range when you need a different system, format or application.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/water-filters/"
            className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Shop water filters
          </Link>
          <Link
            href="/use/"
            className="inline-flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-black font-semibold px-6 py-3 rounded transition-colors"
          >
            Find the right filter
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items: Array<{ icon: LucideIcon; title: string; body: string }> = [
    {
      icon: DollarSign,
      title: 'Wholesale-style pricing',
      body: 'The same public pricing for homeowners, tradies and commercial customers.',
    },
    {
      icon: Truck,
      title: 'Australian stock',
      body: 'Most stocked parcel orders placed before 12pm AEST dispatch the same business day.',
    },
    {
      icon: ShieldCheck,
      title: 'Compliance made clear',
      body: 'WaterMark, WELS and other compliance information is shown where applicable.',
    },
    {
      icon: MapPin,
      title: 'Filtration specialists',
      body: 'Australian owned and based in Wyong on the Central Coast NSW.',
    },
  ];

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
          {items.map((item) => (
            <li key={item.title} className="flex gap-3">
              <item.icon
                size={24}
                strokeWidth={1.75}
                aria-hidden="true"
                className="flex-shrink-0 text-brand-blue mt-0.5"
              />
              <div>
                <h2 className="font-semibold text-black">{item.title}</h2>
                <p className="mt-1 text-sm text-black/70">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type SpotlightTone = 'light' | 'white' | 'dark';

interface ProductSpotlightProps {
  product: ProductCardData | null;
  eyebrow: string;
  title: string;
  body: string;
  bullets: ReadonlyArray<string>;
  rangeHref: string;
  rangeLabel: string;
  tone: SpotlightTone;
}

function ProductSpotlight({
  product,
  eyebrow,
  title,
  body,
  bullets,
  rangeHref,
  rangeLabel,
  tone,
}: ProductSpotlightProps) {
  const dark = tone === 'dark';
  const sectionClass = dark
    ? 'bg-gray-950 text-white border-b border-gray-800'
    : tone === 'light'
      ? 'bg-gray-50 border-b border-gray-200'
      : 'bg-white border-b border-gray-200';

  const bodyClass = dark ? 'text-white/70' : 'text-black/70';
  const headingClass = dark ? 'text-white' : 'text-black';

  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          <div className={dark ? 'lg:order-2' : ''}>
            <p
              className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-white/60' : 'text-brand-blue'}`}
            >
              {eyebrow}
            </p>
            <h2 className={`mt-2 text-3xl md:text-4xl font-semibold tracking-tight ${headingClass}`}>
              {title}
            </h2>
            <p className={`mt-4 text-base md:text-lg leading-relaxed ${bodyClass}`}>
              {body}
            </p>
            <ul className={`mt-6 space-y-3 text-sm md:text-base ${bodyClass}`}>
              {bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dark ? 'bg-white' : 'bg-brand-blue'}`}
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {product ? (
                <Link
                  href={getProductUrl(product.handle)}
                  className={`inline-flex items-center justify-center font-semibold px-5 py-3 rounded transition-colors ${
                    dark
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-brand-blue text-white hover:bg-brand-blue-hover'
                  }`}
                >
                  View this product
                </Link>
              ) : null}
              <Link
                href={rangeHref}
                className={`inline-flex items-center justify-center gap-1 font-semibold px-5 py-3 rounded border transition-colors ${
                  dark
                    ? 'border-white/25 text-white hover:border-white/60'
                    : 'border-gray-300 text-black hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {rangeLabel}
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={dark ? 'lg:order-1' : ''}>
            {product ? (
              <div className={`mx-auto max-w-md rounded-lg p-5 sm:p-7 ${dark ? 'bg-white' : 'bg-white border border-gray-200'}`}>
                <ProductCard product={product} />
              </div>
            ) : (
              <div className="rounded border border-dashed border-gray-300 p-8 text-sm text-black/60">
                This featured product is temporarily unavailable.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-2xl mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
            Explore the full range
          </h2>
          <p className="mt-2 text-base text-black/70">
            The spotlights above are our clearest starting points. Browse the
            full catalogue when you need a different configuration, application
            or replacement part.
          </p>
        </div>
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden"
        >
          {CATEGORIES.map((category) => (
            <li key={category.slug} className="bg-white">
              <Link
                href={`/${category.slug}/`}
                className="group flex flex-col h-full p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-black">
                  {category.label}
                </h3>
                <p className="mt-2 text-sm text-black/70 flex-1">
                  {CATEGORY_BLURBS[category.slug] ?? category.label}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                  Shop {category.label.toLowerCase()}
                  <ChevronRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WhyEnviroAqua() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
              Why EnviroAqua
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Water filtration without the guesswork
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-black/70">
            <div>
              <h3 className="font-semibold text-black">Clear product facts</h3>
              <p className="mt-2">
                Product pages separate filtration performance, compatibility,
                installation requirements and compliance information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black">Specialist range</h3>
              <p className="mt-2">
                From replacement cartridges to whole-house and commercial
                systems, the range is organised around the job being solved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black">Australia-wide supply</h3>
              <p className="mt-2">
                Most products ship Australia-wide, with freight or pickup
                requirements shown where special handling is needed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black">Local help when needed</h3>
              <p className="mt-2">
                Our Wyong NSW team can help identify the right system,
                replacement filter or installation pathway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Which water filter should I choose for my home?',
    a: 'Start with where you want filtered water and what you want to reduce. Under-sink systems treat drinking water at one tap, while whole-house systems treat water before it is distributed around the property. Reverse osmosis is another drinking-water option for customers seeking more comprehensive filtration.',
  },
  {
    q: 'What is the difference between whole-house and under-sink filtration?',
    a: 'Whole-house systems are installed on the incoming water line and filter water for multiple fixtures. Under-sink systems are point-of-use products designed mainly for kitchen drinking and cooking water.',
  },
  {
    q: 'Can a 3-way tap work with a water filter system?',
    a: 'A compatible 3-way tap combines normal hot and cold water with a separate filtered-water pathway in one mixer. Check the connection and installation requirements on the individual tap and filter product pages before ordering.',
  },
  {
    q: 'How often should water-filter cartridges be replaced?',
    a: 'Replacement timing depends on cartridge type, water quality and usage. Use the interval stated for the specific cartridge or system and replace earlier if performance changes indicate the filters are exhausted.',
  },
  {
    q: 'Do you sell commercial water bubblers for schools and workplaces?',
    a: 'Yes. EnviroAqua sells commercial filtered and chilled water bubblers for schools, offices, gyms, factories, warehouses and other workplaces. The commercial water bubbler range lets you compare the available designs.',
  },
  {
    q: 'Do you ship Australia-wide?',
    a: 'Yes. Most products ship Australia-wide. Parcel delivery is calculated at checkout from packed weight and destination, while bulky or fragile products may use special freight or Click & Collect arrangements.',
  },
];

function Faq() {
  return (
    <section className="bg-white">
      <JsonLdScript data={faqPageSchema(FAQ_ITEMS)} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Water filtration buying questions
        </h2>
        <div className="mt-6 border-t border-gray-200">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group border-b border-gray-200">
              <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold text-black">{item.q}</h3>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className="flex-shrink-0 mt-0.5 text-black/60 transition-transform group-open:rotate-180"
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
