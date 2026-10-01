import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
import { ProductGrid } from '@/components/product/ProductGrid';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { faqPageSchema } from '@/lib/seo/jsonld';
import { HomeReviewsSection } from '@/components/reviews/HomeReviewsSection';
import type { Product, ProductCardData } from '@/types/product';

const INSTALL_PACKAGE_HANDLE =
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system';

const WHOLE_HOUSE_HANDLES = [
  'premium-three-stage-big-blue-whole-house-water-filter-system',
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
] as const;

const BUBBLER_HANDLES = [
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
  'commercial-rust-free-filtered-cold-water-bubbler-wm',
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
] as const;

const DRINKING_WATER_HANDLES = [
  'under-sink-water-filter-2-stage-sediment-carbon',
  'under-sink-water-filter-5-stage-reverse-osmosis-system',
  'under-sink-water-filter-6-stage-reverse-osmosis-system',
  '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
] as const;

const REPLACEMENT_HANDLES = [
  'twin-pair-of-water-filter-cartridges-premium-carbon-cto-plus-sediment-pp-10-x-2',
  'whole-house-water-filter-replacement-set-3-stage-5-micron-20-x-4-5',
  '20-x-2-5-whole-house-water-filter-replacement-sediment-carbon-gac-cartridges',
] as const;

export const metadata: Metadata = {
  title: 'Water Filters & Water Filtration Systems Australia | EnviroAqua',
  description:
    'Shop whole-house, under-sink, reverse osmosis and commercial water filtration systems in Australia. Australian stock, specialist support and Australia-wide delivery.',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'Uu1dcLCaDuZb3l3dynm2aRNtOacQjYyX1bToX93xCH4',
  },
};

export const revalidate = 60;

const CATEGORY_BLURBS: Record<string, string> = {
  'water-filters':
    'Under-sink, whole-house, reverse osmosis, UV, bench-top and commercial systems.',
  cartridges:
    'Sediment, carbon, RO membranes, alkaline, fluoride-removal and complete replacement sets.',
  'bubblers-and-coolers':
    'Commercial drinking bubblers, water coolers, chillers and replacement parts.',
  'pumps-and-tanks':
    '12V pumps, booster pumps, pressure tanks, dosing tanks and water-system components.',
  plumbing: 'Filter-friendly kitchen taps, bathroom fittings, toilets and bundles.',
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

async function loadProducts(
  handles: ReadonlyArray<string>,
): Promise<ReadonlyArray<ProductCardData>> {
  const products = await Promise.all(
    handles.map((handle) => getProductByHandle(handle)),
  );
  return products
    .filter((product): product is Product => product !== null)
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
  const [wholeHouse, bubblers, drinkingWater, replacements, installHeroImage] =
    await Promise.all([
      loadProducts(WHOLE_HOUSE_HANDLES),
      loadProducts(BUBBLER_HANDLES),
      loadProducts(DRINKING_WATER_HANDLES),
      loadProducts(REPLACEMENT_HANDLES),
      loadInstallHeroImage(),
    ]);

  return (
    <>
      <Hero installHeroImage={installHeroImage} />
      <PrimaryJourneys />
      <TrustStrip />
      <WholeHouseSection products={wholeHouse} />
      <BubblersSection products={bubblers} />
      <DrinkingWaterSection products={drinkingWater} />
      <ReplacementSection products={replacements} />
      <CommercialFiltration />
      <CategoryGrid />
      <WhyEnviroAqua />
      <HomeReviewsSection />
      <ExploreByApplication />
      <Faq />
    </>
  );
}

interface HeroProps {
  installHeroImage: { url: string; alt: string } | null;
}

function Hero({ installHeroImage }: HeroProps) {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
              EnviroAqua Australia
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight leading-tight">
              Water Filters &amp; Water Filtration Systems Australia
            </h1>
            <p className="mt-5 max-w-2xl mx-auto md:mx-0 text-base sm:text-lg md:text-xl text-black/70">
              Whole-house, under-sink, reverse osmosis and commercial water
              filtration. Australian stock, wholesale-style pricing and
              specialist help choosing the right system.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center md:justify-start gap-3">
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
            <p className="mt-5 text-sm text-black/60">
              For Australian homes, tradies, schools, workplaces and commercial
              water-treatment applications.
            </p>
          </div>

          <InstallHeroCard image={installHeroImage} />
        </div>
      </div>
    </section>
  );
}

function InstallHeroCard({ image }: HeroProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-5 md:p-6 flex flex-col gap-4">
      <span className="self-start inline-flex items-center bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
        Central Coast NSW installation
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
          <h2 className="text-lg md:text-xl font-semibold text-black leading-snug">
            Whole-house filtration, supplied and installed
          </h2>
          <p className="mt-2 text-sm text-black/70">
            Our local package combines a WaterMark-certified whole-house system
            with licensed-plumber installation for eligible Central Coast homes.
          </p>
        </div>
      </div>
      <Link
        href="/whole-house-installation-package/"
        className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
      >
        View the installed package
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

const PRIMARY_JOURNEYS = [
  {
    title: 'Whole-house filtration',
    body: 'Filter water before it reaches taps, showers and appliances throughout the home.',
    href: '/water-filters/whole-house/',
    link: 'Shop whole-house water filters',
  },
  {
    title: 'Under-sink drinking water',
    body: 'Compact kitchen filtration for drinking and cooking water at the point of use.',
    href: '/water-filters/under-sink/',
    link: 'Shop under-sink water filters',
  },
  {
    title: 'Reverse osmosis systems',
    body: 'Multi-stage RO systems for customers who want high-level drinking-water filtration.',
    href: '/water-filters/reverse-osmosis/',
    link: 'Shop reverse osmosis systems',
  },
  {
    title: 'Commercial water bubblers',
    body: 'Chilled drinking-water solutions for schools, factories, offices, gyms and workplaces.',
    href: '/commercial-water-bubblers/',
    link: 'Compare commercial water bubblers',
  },
] as const;

function PrimaryJourneys() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-3xl mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
            Shop by what you need
          </h2>
          <p className="mt-2 text-base text-black/70">
            Start with the outcome you want, then compare the systems designed
            for that job.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRIMARY_JOURNEYS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group border border-gray-200 rounded p-6 hover:border-brand-blue hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-black">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70">{item.body}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                {item.link}
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/cartridges/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
          >
            Already own a system? Shop replacement water-filter cartridges
            <ChevronRight size={16} aria-hidden="true" />
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
      body: 'WaterMark, WELS and other product compliance information is shown where applicable.',
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
                <h3 className="font-semibold text-black">{item.title}</h3>
                <p className="mt-1 text-sm text-black/70">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface ProductSectionProps {
  products: ReadonlyArray<ProductCardData>;
}

function WholeHouseSection({ products }: ProductSectionProps) {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          eyebrow="High-value home filtration"
          title="Whole-house water filtration"
          body="Filter water at the point it enters the property so showers, taps and appliances receive filtered water. Compare standard systems, WaterMark-certified options and our Central Coast installed package."
          href="/water-filters/whole-house/"
          link="Compare whole-house water filters"
        />
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
        <div className="mt-6 border border-gray-200 rounded bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-black">
              Want the system supplied and installed?
            </h3>
            <p className="mt-1 text-sm text-black/70">
              See the complete local installation package for eligible Central
              Coast NSW properties.
            </p>
          </div>
          <Link
            href="/whole-house-installation-package/"
            className="inline-flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
          >
            View installation package
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BubblersSection({ products }: ProductSectionProps) {
  const applications = [
    ['Schools', '/use/commercial-and-cafe/schools/'],
    ['Factories & warehouses', '/use/commercial-and-cafe/factories-and-warehouses/'],
    ['Offices', '/use/commercial-and-cafe/offices/'],
    ['Gyms', '/use/commercial-and-cafe/gyms-and-fitness/'],
  ] as const;

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          eyebrow="Commercial drinking water"
          title="Commercial water bubblers"
          body="Filtered chilled-water bubblers for high-use Australian workplaces and facilities. Compare the main stainless-steel designs, then use the application guides to choose for your site."
          href="/commercial-water-bubblers/"
          link="Compare all commercial water bubblers"
        />
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
        <nav className="mt-7 flex flex-wrap gap-2" aria-label="Water bubbler applications">
          {applications.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              Water bubblers for {label.toLowerCase()}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

function DrinkingWaterSection({ products }: ProductSectionProps) {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          eyebrow="Kitchen drinking water"
          title="Under-sink & reverse osmosis water filters"
          body="Choose simple under-sink filtration for everyday taste and sediment concerns, or compare reverse osmosis systems for customers seeking more comprehensive drinking-water filtration."
          href="/use/home-drinking-water/"
          link="Compare home drinking-water options"
        />
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href="/water-filters/under-sink/" className="text-brand-blue hover:underline">
            Shop under-sink water filters
          </Link>
          <Link href="/water-filters/reverse-osmosis/" className="text-brand-blue hover:underline">
            Shop reverse osmosis systems
          </Link>
          <Link href="/plumbing/ro-filter-taps/" className="text-brand-blue hover:underline">
            Shop filtered-water taps
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReplacementSection({ products }: ProductSectionProps) {
  const sizes = ['10 × 2.5 inch', '10 × 4.5 inch', '20 × 2.5 inch', '20 × 4.5 inch'];

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          eyebrow="Repeat-purchase essentials"
          title="Replacement water-filter cartridges"
          body="Keep an existing system performing with sediment, carbon, RO and complete replacement cartridge sets. Match the cartridge to your housing size and system stages before ordering."
          href="/cartridges/"
          link="Find replacement water-filter cartridges"
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Link
              key={size}
              href="/cartridges/"
              className="rounded border border-gray-200 px-4 py-2 text-sm text-black hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              {size}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}

function CommercialFiltration() {
  const items = [
    {
      title: 'Commercial reverse osmosis',
      body: 'Higher-capacity RO systems for commercial and industrial water-treatment applications.',
      href: '/water-filters/commercial/',
    },
    {
      title: 'UV water sterilisation',
      body: 'UV treatment options for water systems where microbiological treatment is part of the required solution.',
      href: '/water-filters/uv-sterilisation/',
    },
    {
      title: 'Commercial application guidance',
      body: 'Start with the water source, required output and application before selecting equipment.',
      href: '/use/commercial-and-cafe/',
    },
  ] as const;

  return (
    <section className="bg-gray-950 text-white border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Higher-capacity systems
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            Commercial &amp; industrial water filtration
          </h2>
          <p className="mt-3 text-white/70">
            Reverse osmosis, UV and high-capacity filtration for commercial
            water treatment, hospitality, manufacturing and other demanding
            applications.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded border border-white/15 p-6 hover:border-white/40 transition-colors"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70">{item.body}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Explore
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
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
            Shop all categories
          </h2>
          <p className="mt-2 text-base text-black/70">
            Browse the full EnviroAqua range after the main filtration journeys
            above.
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
                installation requirements and compliance information so buyers
                can compare systems on the facts that matter.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black">Specialist range</h3>
              <p className="mt-2">
                From a single replacement cartridge to whole-house and
                commercial systems, the range is organised around water source,
                application and treatment goal.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black">Australia-wide supply</h3>
              <p className="mt-2">
                Most products ship Australia-wide, with freight or pickup
                requirements shown where bulky or fragile products need special
                handling.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black">Local help when needed</h3>
              <p className="mt-2">
                Our Wyong NSW team can help customers identify the appropriate
                system, replacement filters or installation pathway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExploreByApplication() {
  const links = [
    ['Home drinking water', '/use/home-drinking-water/'],
    ['Whole-home filtration', '/use/whole-home-filtration/'],
    ['Bore water treatment', '/use/bore-water-treatment/'],
    ['Water problems', '/water-problems/'],
    ['Commercial water bubblers', '/commercial-water-bubblers/'],
    ['Water bubbler vs water cooler', '/help/bubblers-vs-coolers/'],
  ] as const;

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Explore water filtration by application
        </h2>
        <p className="mt-2 max-w-3xl text-base text-black/70">
          Not ready to choose a product? Start with the water source, building
          or problem you are trying to solve.
        </p>
        <nav className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Water filtration applications">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="group flex items-center justify-between gap-4 border border-gray-200 rounded px-5 py-4 font-semibold text-black hover:border-brand-blue transition-colors"
            >
              {label}
              <ChevronRight
                size={17}
                aria-hidden="true"
                className="text-brand-blue transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  link: string;
}

function SectionHeading({ eyebrow, title, body, href, link }: SectionHeadingProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-black tracking-tight">
          {title}
        </h2>
        <p className="mt-3 text-base text-black/70">{body}</p>
      </div>
      <Link
        href={href}
        className="inline-flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        {link}
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Which water filter should I choose for my home?',
    a: 'Start with where you want filtered water and what you want to reduce. Under-sink systems treat drinking water at one tap, while whole-house systems treat water before it is distributed around the property. Reverse osmosis is a separate drinking-water option for customers seeking more comprehensive filtration. Each product page lists its stages, intended use and installation requirements.',
  },
  {
    q: 'What is the difference between whole-house and under-sink filtration?',
    a: 'Whole-house systems are installed on the incoming water line and filter water for multiple fixtures. Under-sink systems are point-of-use products designed mainly for kitchen drinking and cooking water. The right choice depends on whether you want filtration at one tap or across the property.',
  },
  {
    q: 'What does reverse osmosis filter?',
    a: 'Reverse osmosis uses a membrane alongside pre- and post-filtration stages. The exact reduction claims depend on the specific system and membrane, so use the performance and specification information on the relevant product page rather than assuming every RO system has identical performance.',
  },
  {
    q: 'How often should water-filter cartridges be replaced?',
    a: 'Replacement timing depends on the cartridge type, water quality and usage. Use the replacement interval stated for your specific cartridge or system, and replace earlier if flow, taste, odour or sediment loading indicates the filters are exhausted.',
  },
  {
    q: 'Do I need a plumber to install a water filter?',
    a: 'Some bench-top and under-sink products are designed for straightforward installation, while whole-house systems and work that alters mains plumbing should be completed by an appropriately licensed plumber. Check the installation requirements shown on the individual product page.',
  },
  {
    q: 'Do you sell commercial water bubblers for schools and workplaces?',
    a: 'Yes. EnviroAqua sells commercial filtered and chilled water bubblers for applications including schools, offices, gyms, factories and warehouses. The commercial water bubbler hub compares the main models and links to application-specific guidance.',
  },
  {
    q: 'Do you ship Australia-wide?',
    a: 'Yes. Most products ship Australia-wide. Parcel delivery is calculated at checkout from packed weight and destination, selected products include free delivery, bulky items use destination-based freight rates, and selected fragile products are Click & Collect only. Stocked parcel orders placed before 12pm AEST normally dispatch the same business day.',
  },
];

function Faq() {
  return (
    <section className="bg-gray-50">
      <JsonLdScript data={faqPageSchema(FAQ_ITEMS)} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Water filtration buying questions
        </h2>
        <p className="mt-2 text-base text-black/70">
          Straight answers to the questions customers most often need resolved
          before choosing a system.
        </p>
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
