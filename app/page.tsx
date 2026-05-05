import Link from 'next/link';
import {
  Container,
  Droplets,
  Filter,
  GlassWater,
  ShieldCheck,
  Truck,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '@/content/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getProducts } from '@/lib/shopify/queries/getProducts';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'water-filters': Droplets,
  cartridges: Filter,
  bubblers: GlassWater,
  'pumps-and-tanks': Container,
  plumbing: Wrench,
};

const CATEGORY_BLURBS: Record<string, string> = {
  'water-filters':
    'Under-sink, whole-house, RO, UV, bench-top, inline, and commercial systems.',
  cartridges:
    'Sediment, carbon, RO membranes, alkaline, fluoride removal, and full sets.',
  bubblers: 'Commercial and residential drinking bubblers, plus parts.',
  'pumps-and-tanks':
    '12V pumps, RO booster pumps, pressure tanks, dosing tanks.',
  plumbing: 'Filter-friendly taps, showers, toilets, and bundles.',
};

async function loadFeatured() {
  const featured = await getProducts({
    query: 'tag:featured',
    first: 8,
    sortKey: 'BEST_SELLING',
  });
  if (featured.products.length > 0) return featured.products;
  // Fallback: most recently created products if no curated 'featured' tag.
  const fallback = await getProducts({
    first: 8,
    sortKey: 'CREATED_AT',
    reverse: true,
  });
  return fallback.products;
}

export default async function HomePage() {
  const featured = await loadFeatured();

  return (
    <>
      <Hero />
      <CategoryGrid />
      <TrustStrip />
      <FeaturedProducts products={featured} />
      <WhyDifferent />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-semibold text-black tracking-tight">
          Australia&apos;s water filtration specialist
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-black/80">
          Wholesale prices on water filters, cartridges, and filtration systems
          for every home, trade, and business. One price for everyone — no
          accounts, no quotes, just the best price upfront.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/water-filters/"
            className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Shop water filters
          </Link>
          <Link
            href="/cartridges/"
            className="inline-flex items-center justify-center bg-white border border-black text-black font-semibold px-6 py-3 rounded hover:bg-gray-50 transition-colors"
          >
            Shop cartridges
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">Shop by category</h2>
        </div>
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Droplets;
            return (
              <li key={category.slug}>
                <Link
                  href={`/${category.slug}/`}
                  className="block h-full p-5 border border-gray-200 hover:border-gray-400 rounded transition-colors"
                >
                  <Icon
                    size={28}
                    aria-hidden="true"
                    className="text-brand-blue"
                  />
                  <h3 className="mt-3 text-base font-semibold text-black">
                    {category.label}
                  </h3>
                  <p className="mt-1.5 text-sm text-black/70">
                    {CATEGORY_BLURBS[category.slug] ??
                      `${category.label} for every Australian home and trade.`}
                  </p>
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
      icon: Wallet,
      title: 'Wholesale pricing',
      body: 'Same price for everyone — homeowners, tradies, commercial.',
    },
    {
      icon: Truck,
      title: 'Free shipping over $200',
      body: 'Flat-rate Australia-wide delivery. No surprises at checkout.',
    },
    {
      icon: ShieldCheck,
      title: 'WaterMark certified options',
      body: 'Every certified product shows its licence number on the page.',
    },
    {
      icon: Droplets,
      title: 'Australian owned',
      body: 'Based on the Central Coast NSW. Real people on the phones.',
    },
  ];
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {items.map((item) => (
            <li key={item.title} className="flex gap-3">
              <item.icon
                size={24}
                aria-hidden="true"
                className="flex-shrink-0 text-brand-blue mt-0.5"
              />
              <div>
                <h3 className="text-sm font-semibold text-black">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-black/70">{item.body}</p>
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
  const points: Array<{ title: string; body: string }> = [
    {
      title: 'No quote-chasing',
      body: 'Every price is on the page. No phone calls to find out what something costs, no gated trade pricing, no surprise upsell at checkout.',
    },
    {
      title: 'Specialist knowledge',
      body: "We sell water filtration — that's it. Spec sheets, installation notes, and compatibility info on every product so you order the right thing first time.",
    },
    {
      title: 'Fast Australian dispatch',
      body: 'Orders placed before 1pm AEST ship the same business day from our Central Coast NSW warehouse. Tracked delivery on every order.',
    },
  ];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl font-semibold text-black">
          Why we&apos;re different
        </h2>
        <ul
          role="list"
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {points.map((point) => (
            <li key={point.title}>
              <h3 className="text-base font-semibold text-black">
                {point.title}
              </h3>
              <p className="mt-2 text-sm text-black/80">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
