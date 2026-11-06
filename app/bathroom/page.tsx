import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/jsonld';
import { getProductUrl } from '@/lib/utils/productUrl';
import type { ProductCardData } from '@/types/product';

export const metadata: Metadata = {
  title: 'Bathroom Packages, Toilets & Tapware at Wholesale Prices',
  description:
    'Create a beautifully coordinated bathroom for less. Shop bathroom packages, toilets, showers and tapware at wholesale-style prices, available to everyone.',
  alternates: { canonical: '/bathroom/' },
};

export const revalidate = 60;

const categories = [
  {
    title: 'Showers',
    subtitle: 'Make every day feel a little better.',
    href: '/search?q=bathroom%20shower',
    term: 'shower',
    number: '01',
  },
  {
    title: 'Toilets',
    subtitle: 'Clean lines. Everyday practicality.',
    href: '/plumbing/toilets/',
    term: 'toilets',
    number: '02',
  },
  {
    title: 'Bathroom Taps',
    subtitle: 'The finishing touch to your space.',
    href: '/plumbing/bathroom-taps/',
    term: 'bathroom-taps',
    number: '03',
  },
  {
    title: 'Complete Packages',
    subtitle: 'A matching look, made simple.',
    href: '/plumbing/bundles/',
    term: 'bundles',
    number: '04',
  },
] as const;

const finishes = [
  { name: 'Polished Chrome', search: '/search?q=bathroom%20chrome', swatch: 'bg-gradient-to-br from-white via-[#b2bac1] to-[#f3f4f5]' },
  { name: 'Matte Black', search: '/search?q=bathroom%20matte%20black', swatch: 'bg-[#292929]' },
  { name: 'Brushed Gold', search: '/search?q=bathroom%20brushed%20gold', swatch: 'bg-gradient-to-br from-[#f7e5af] to-[#b78c45]' },
] as const;

async function safeProducts(query: string, first: number): Promise<ReadonlyArray<ProductCardData>> {
  try {
    const result = await getProducts({ query, first });
    return result.products;
  } catch (error) {
    console.error('[bathroom] Unable to load Shopify products', error);
    return [];
  }
}

export default async function BathroomLandingPage() {
  const [packages, toilets, taps, showers] = await Promise.all([
    safeProducts("tag:'primary-cat:plumbing' AND tag:'sub-cat:bundles'", 6),
    safeProducts("tag:'primary-cat:plumbing' AND tag:'sub-cat:toilets'", 1),
    safeProducts("tag:'primary-cat:plumbing' AND tag:'sub-cat:bathroom-taps'", 1),
    safeProducts("tag:'primary-cat:plumbing' AND (title:*shower* OR tag:'sub-cat:showers')", 1),
  ]);

  const categoryImages = [showers[0], toilets[0], taps[0], packages[0]];
  const heroProduct = packages.find((product) => product.featuredImage) ?? packages[0];
  const featuredPackages = packages.slice(0, 3);

  return (
    <>
      <JsonLdScript data={[
        collectionSchema(
          'Bathroom Supplies',
          '/bathroom/',
          'Bathroom packages, shower fittings, toilets and tapware at accessible prices from Enviro Aqua.',
        ),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Bathroom Supplies', path: '/bathroom/' },
        ]),
      ]} />

      <header className="relative overflow-hidden bg-[#F3F0EB]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:gap-12 md:py-20 lg:min-h-[610px] lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div className="relative z-10 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Enviro Aqua Bathrooms</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#292929] lg:mx-0">
              A beautiful bathroom.
              <span className="mt-1 block text-[#81776e]">For less.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-stone-700 sm:text-lg lg:mx-0">
              Modern bathroom essentials and coordinated packages at wholesale-style prices, available to everyone.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/plumbing/bundles/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#292929] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#474747] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
                Shop bathroom packages 
              </Link>
              <Link href="#bathroom-collections" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-stone-400 px-6 py-3 text-sm font-semibold text-[#292929] transition-colors hover:border-stone-700 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
                Explore the range
              </Link>
            </div>
            <p className="mt-6 text-sm text-stone-600">Wholesale-style prices · No trade account required</p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-[#E7E1D8] shadow-[0_22px_70px_-44px_rgba(41,41,41,0.5)] sm:aspect-[6/5]">
              {heroProduct?.featuredImage ? (
                <Image
                  src={heroProduct.featuredImage.url}
                  alt={heroProduct.featuredImage.altText || heroProduct.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 44vw, 90vw"
                  className="object-contain p-7 sm:p-12"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-12 text-center text-2xl font-semibold tracking-tight text-stone-500">
                  Your bathroom. Your style.
                </div>
              )}
            </div>
            {heroProduct && (
              <Link href={getProductUrl(heroProduct.handle)} className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:bottom-6 sm:left-6 sm:right-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-stone-500">Explore the package range</p>
                  <p className="mt-1 truncate text-sm font-semibold text-gray-950">{heroProduct.title}</p>
                </div>
                
              </Link>
            )}
          </div>
        </div>
      </header>


      <section aria-labelledby="bathroom-packages-heading" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">The easy way to renovate</p>
              <h2 id="bathroom-packages-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#292929] sm:text-4xl md:text-5xl">
                A beautiful bathroom. <span className="text-stone-500">One simple package.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
                Take the guesswork out of mixing and matching. Discover coordinated bathroom essentials in finishes you love, all together in one place.
              </p>
            </div>
            <Link href="/plumbing/bundles/" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-950 underline-offset-4 hover:underline">
              View all packages 
            </Link>
          </div>
          {featuredPackages.length > 0 ? (
            <ProductGrid products={featuredPackages} editorial />
          ) : (
            <div className="rounded-2xl bg-[#F5F3F0] px-6 py-10 text-center">
              <p className="text-lg font-semibold text-gray-950">Explore our complete bathroom packages</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
                Shop matching fixtures and practical bathroom essentials for your next project.
              </p>
              <Link href="/plumbing/bundles/" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#292929] px-5 py-3 text-sm font-semibold text-white hover:bg-[#474747]">
                Shop packages 
              </Link>
            </div>
          )}
          <p className="mt-6 text-xs text-stone-500">Check each package for its inclusions, finishes and current pricing.</p>
        </div>
      </section>

      <section id="bathroom-collections" aria-labelledby="bathroom-shop-heading" className="bg-[#F8F7F5]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Find your fit</p>
            <h2 id="bathroom-shop-heading" className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Shop by category
            </h2>
            <p className="mt-3 text-base text-stone-600">From a simple refresh to an entire bathroom fit-out.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {categories.map((category, index) => {
              const image = categoryImages[index]?.featuredImage;
              return (
                <Link key={category.title} href={category.href} className="group flex flex-col overflow-hidden rounded-2xl bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
                  <div className="relative aspect-[4/4.2] overflow-hidden bg-[#EEEAE5]">
                    {image ? (
                      <Image src={image.url} alt={image.altText || category.title} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 50vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-5 text-center text-lg font-semibold text-stone-400">{category.title}</div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-stone-600">{category.number} / 04</span>
                  </div>
                  <div className="flex flex-1 items-end justify-between gap-2 p-4 sm:p-5">
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-gray-950 sm:text-xl">{category.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-stone-600 sm:text-sm">{category.subtitle}</p>
                    </div>
                    
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="bathroom-finishes-heading" className="border-t border-stone-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
          <h2 id="bathroom-finishes-heading" className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
            Shop by finish
          </h2>
          <p className="mt-3 text-base text-stone-600">Find the look that suits your bathroom.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {finishes.map((finish) => (
              <Link key={finish.name} href={finish.search} className="flex min-h-24 items-center gap-4 rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
                <span className={'h-12 w-12 shrink-0 rounded-full border border-stone-200 shadow-sm ' + finish.swatch} aria-hidden="true" />
                <span className="text-base font-semibold text-gray-950">{finish.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>




      <section className="border-t border-stone-200 bg-[#F8F7F5]">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-14 text-center sm:px-6 md:py-18 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">Your new bathroom starts here.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">Choose matching fixtures, check the product specifications and find the right fit for your space.</p>
          <Link href="/plumbing/bundles/" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#292929] px-6 py-3 text-sm font-semibold text-white hover:bg-[#474747]">
            Shop bathroom packages
          </Link>
          <p className="mt-5 text-xs text-stone-500">Questions about delivery or installation? Contact our Australian team before ordering.</p>
        </div>
      </section>
    </>
  );
}
