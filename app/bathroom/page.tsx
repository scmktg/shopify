import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, ShieldCheck, Truck } from 'lucide-react';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/jsonld';
import type { ProductCardData } from '@/types/product';

export const metadata: Metadata = {
  title: 'Bathroom Packages, Toilets & Tapware Australia | Enviro Aqua',
  description: 'Create a beautiful bathroom for less. Explore coordinated bathroom packages, modern toilets and tapware at Enviro Aqua.',
  alternates: { canonical: '/bathroom/' },
};

export const revalidate = 60;

const categories = [
  { label: 'Bathroom Packages', description: 'The complete look, made simple.', href: '/plumbing/bundles/', tag: 'bundles' },
  { label: 'Toilets', description: 'Clean lines for modern spaces.', href: '/plumbing/toilets/', tag: 'toilets' },
  { label: 'Bathroom Tapware', description: 'The details that bring a room together.', href: '/plumbing/bathroom-taps/', tag: 'bathroom-taps' },
  { label: 'Kitchen Tapware', description: 'Everyday design, beautifully considered.', href: '/plumbing/kitchen-taps/', tag: 'kitchen-taps' },
] as const;

function ProductPhoto({ product, className, sizes, priority = false }: {
  product: ProductCardData | undefined;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return product?.featuredImage ? (
    <Image
      src={product.featuredImage.url}
      alt={product.featuredImage.altText || product.title}
      fill
      priority={priority}
      sizes={sizes}
      className={className || 'object-contain'}
    />
  ) : (
    <div className="absolute inset-0 bg-stone-100" aria-hidden="true" />
  );
}

export default async function BathroomLandingPage() {
  // The tiles, prices and products all originate in the live Shopify catalogue.
  const results = await Promise.all(
    categories.map(async (category) => {
      try {
        return (await getProducts({
          query: `tag:'primary-cat:plumbing' AND tag:'sub-cat:${category.tag}'`,
          first: 8,
        })).products;
      } catch (error) {
        console.error(`[bathroom] Unable to load ${category.tag} products`, error);
        return [] as ReadonlyArray<ProductCardData>;
      }
    }),
  );

  const [packages, toilets, bathroomTaps, kitchenTaps] = results;
  const categoryImages = [packages[0], toilets[0], bathroomTaps[0], kitchenTaps[0]];
  const featured = [...packages.slice(0, 6), ...toilets.slice(0, 2), ...bathroomTaps.slice(0, 2)];
  const packageStartingPrice = packages.length
    ? Math.min(...packages.map((product) => Number(product.price.amount)).filter(Number.isFinite))
    : null;
  const formattedStartingPrice = packageStartingPrice !== null && Number.isFinite(packageStartingPrice)
    ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(packageStartingPrice)
    : null;

  return (
    <>
      <JsonLdScript data={[
        collectionSchema('Bathroom Supplies', '/bathroom/', 'Bathroom packages, toilets and tapware from Enviro Aqua.'),
        breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Bathroom Supplies', path: '/bathroom/' }]),
      ]} />

      <main>
        <section className="bg-[#F7F5F1]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-12 lg:py-20">
            <div className="max-w-[630px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">Enviro Aqua / Bathrooms</p>
              <h1 className="mt-6 text-[clamp(2.8rem,5.2vw,5.8rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-[#292929]">
                Your dream bathroom. <span className="text-stone-500">Without the showroom price.</span>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-8 text-stone-700 sm:text-lg">
                Beautifully coordinated bathroom packages, contemporary tapware and toilets. Modern design and great value, all in one place.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link href="/plumbing/bundles/" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#292929] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
                  Shop bathroom packages <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
                <Link href="#bathroom-collections" className="inline-flex min-h-12 items-center gap-1 text-sm font-semibold text-stone-800 underline underline-offset-4 hover:text-brand-blue">
                  Explore the range <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
              {formattedStartingPrice && <p className="mt-7 text-sm text-stone-600">Bathroom packages from <strong className="text-stone-950">{formattedStartingPrice}</strong></p>}
            </div>
            <div className="grid min-h-[380px] grid-cols-[1.15fr_0.85fr] gap-3 sm:min-h-[540px] sm:gap-4" aria-label="Selected Enviro Aqua bathroom products">
              <div className="relative overflow-hidden rounded-[4px] bg-white">
                <ProductPhoto product={packages[0] || bathroomTaps[0]} priority sizes="(min-width:1024px) 33vw, 55vw" className="object-contain p-5 transition-transform duration-700 hover:scale-[1.025] sm:p-10" />
                <span className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 text-[11px] font-medium text-stone-700 backdrop-blur-sm sm:bottom-6 sm:left-6">Coordinated bathroom packages</span>
              </div>
              <div className="grid grid-rows-2 gap-3 sm:gap-4">
                <div className="relative overflow-hidden rounded-[4px] bg-[#E8E2D9]">
                  <ProductPhoto product={bathroomTaps[0] || packages[1]} sizes="(min-width:1024px) 18vw, 35vw" className="object-contain p-4 sm:p-8" />
                </div>
                <div className="relative overflow-hidden rounded-[4px] bg-[#EDEAE5]">
                  <ProductPhoto product={toilets[0] || packages[2]} sizes="(min-width:1024px) 18vw, 35vw" className="object-contain p-4 sm:p-8" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="bathroom-collections" aria-labelledby="bathroom-categories-title" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Explore the collection</p>
            <h2 id="bathroom-categories-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-stone-950 sm:text-5xl">Everything for a beautiful bathroom.</h2>
            <p className="mt-4 text-base text-stone-600">Discover your next bathroom upgrade, from a single finishing touch to a complete coordinated space.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-6">
            {categories.map((category, index) => (
              <Link key={category.href} href={category.href} className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F4F1ED]">
                  <ProductPhoto product={categoryImages[index]} sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 50vw" className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.045] sm:p-7" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-stone-950 sm:text-xl">{category.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{category.description}</p>
                  </div>
                  <ArrowUpRight size={19} className="mt-1 shrink-0 text-stone-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="bathroom-package-title" className="bg-[#F7F5F1]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-9 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-12">
            <div className="relative aspect-[5/4] overflow-hidden bg-white">
              <ProductPhoto product={packages[1] || packages[0]} sizes="(min-width:1024px) 46vw, 90vw" className="object-contain p-6 sm:p-12" />
            </div>
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">The smarter way to renovate</p>
              <h2 id="bathroom-package-title" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-stone-950 sm:text-5xl">A complete look. One simple price.</h2>
              <p className="mt-6 text-base leading-8 text-stone-700">Take the guesswork out of choosing fixtures. Explore coordinated bathroom packages that make it easier to create a considered, consistent look.</p>
              {formattedStartingPrice && <p className="mt-6 text-2xl font-semibold tracking-tight text-stone-950">Packages from {formattedStartingPrice}</p>}
              <Link href="/plumbing/bundles/" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#292929] px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
                Explore bathroom packages <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <p className="mt-4 text-xs text-stone-500">Delivery and collection options vary by product. See individual product pages for details.</p>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section aria-labelledby="bathroom-featured-heading" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Discover your favourites</p>
                <h2 id="bathroom-featured-heading" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-stone-950 sm:text-5xl">Shop the bathroom collection.</h2>
              </div>
              <Link href="/plumbing/bundles/" className="inline-flex items-center gap-1 text-sm font-semibold text-stone-800 underline underline-offset-4 hover:text-brand-blue">
                View bathroom packages <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ProductGrid products={featured} editorial />
          </section>
        )}

        <section aria-label="Shopping with Enviro Aqua" className="border-t border-stone-200 bg-[#FAF9F7]">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-10 text-sm text-stone-700 sm:grid-cols-3 sm:px-8 lg:px-12">
            <p className="flex items-center gap-3"><Check size={20} className="shrink-0 text-stone-900" aria-hidden="true" /> Straightforward product specifications</p>
            <p className="flex items-center gap-3"><Truck size={20} className="shrink-0 text-stone-900" aria-hidden="true" /> Delivery and collection options on product pages</p>
            <p className="flex items-center gap-3"><ShieldCheck size={20} className="shrink-0 text-stone-900" aria-hidden="true" /> Product compliance information where applicable</p>
          </div>
        </section>
      </main>
    </>
  );
}
