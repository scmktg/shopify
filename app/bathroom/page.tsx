import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, Truck, ShieldCheck } from 'lucide-react';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'Bathroom Supplies, Toilets & Tapware Australia',
  description: 'Create a bathroom you love with toilets, bathroom tapware, kitchen mixers and coordinated packages at fair direct prices from Enviro Aqua.',
  alternates: { canonical: '/bathroom/' },
};

export const revalidate = 60;

const collections = [
  {
    label: 'Toilets',
    description: 'Modern ceramic toilets and suites for contemporary bathrooms.',
    href: '/plumbing/toilets/',
    number: '01',
  },
  {
    label: 'Bathroom Tapware',
    description: 'Basin mixers, bath taps and practical bathroom fittings.',
    href: '/plumbing/bathroom-taps/',
    number: '02',
  },
  {
    label: 'Kitchen Tapware',
    description: 'Refined kitchen mixers, taps and matching finishes.',
    href: '/plumbing/kitchen-taps/',
    number: '03',
  },
  {
    label: 'Bathroom Packages',
    description: 'Coordinated tapware and bathroom combinations.',
    href: '/plumbing/bundles/',
    number: '04',
  },
] as const;

export default async function BathroomLandingPage() {
  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  try {
    const result = await getProducts({
      query: "tag:'primary-cat:plumbing' AND (tag:'sub-cat:toilets' OR tag:'sub-cat:bathroom-taps' OR tag:'sub-cat:kitchen-taps' OR tag:'sub-cat:bundles')",
      first: 6,
    });
    products = result.products;
  } catch (error) {
    console.error('[bathroom] Unable to load featured bathroom products', error);
  }

  return (
    <>
      <JsonLdScript data={[
        collectionSchema('Bathroom Supplies', '/bathroom/', 'Toilets, tapware, kitchen mixers and bathroom packages from Enviro Aqua.'),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Bathroom Supplies', path: '/bathroom/' },
        ]),
      ]} />

      <header className="border-b border-stone-200 bg-[#F7F5F2]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-stone-500">Bathroom &amp; tapware / A smarter way to buy</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-6xl md:text-7xl">
            Create a bathroom
            <span className="block text-stone-500">you love.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Beautiful bathroom products at fair prices. Sourced directly from manufacturers and sold directly to you, so you can create a space you love without spending a fortune.
          </p>
          <Link
            href="#bathroom-collections"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Shop bathroom <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <a href="#why-buy-direct" className="mt-4 ml-0 inline-flex min-h-12 items-center px-5 text-sm font-semibold text-stone-700 underline underline-offset-4 sm:ml-3">Why buy direct?</a>
          <p className="mt-8 text-sm text-stone-600">Direct sourcing · Fair everyday prices · Genuine support</p>
        </div>
      </header>

      <section id="bathroom-collections" aria-labelledby="bathroom-shop-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Make it yours</p>
            <h2 id="bathroom-shop-heading" className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Shop by category
            </h2>
          </div>
          <p className="max-w-sm text-sm text-stone-500">From a simple refresh to a coordinated upgrade, find the right pieces for your home.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {collections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-[#FAF9F7] p-6 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-medium tabular-nums text-stone-400">{item.number} / 04</span>
                <ArrowUpRight size={20} className="text-stone-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">{item.label}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-stone-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {products.length > 0 && (
        <section aria-labelledby="bathroom-featured-heading" className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <h2 id="bathroom-featured-heading" className="mb-7 text-3xl font-semibold tracking-tight text-gray-950">
              Discover your next upgrade
            </h2>
            <ProductGrid products={products} editorial />
          </div>
        </section>
      )}

      <section id="why-buy-direct" aria-labelledby="bathroom-direct-heading" className="border-t border-stone-200 bg-[#EDE9E2]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">A smarter way to buy</p>
            <h2 id="bathroom-direct-heading" className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-5xl">Beautiful bathrooms shouldn&apos;t cost a fortune.</h2>
            <p className="mt-5 max-w-xl leading-7 text-stone-700">We source directly from manufacturers and sell directly to you, without expensive retail storefronts. We reduce unnecessary costs, not our commitment to quality. So you can feel as good about what you paid as you do about your bathroom.</p>
          </div>
          <div className="grid gap-3">
            {[
              ['01', 'Find your style', 'Choose the products and finishes that feel right for your home.'],
              ['02', 'Shop direct', 'Enjoy fair everyday prices and clear product information.'],
              ['03', 'Love your space', 'Create a bathroom you look forward to using every day.'],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-4 rounded-xl border border-stone-300 bg-white/50 p-5">
                <span className="text-sm font-semibold text-stone-500">{number}</span>
                <div><h3 className="font-semibold text-stone-900">{title}</h3><p className="mt-1 text-sm leading-6 text-stone-700">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Why shop with Enviro Aqua" className="border-t border-stone-100 bg-[#FAF9F7]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 text-sm text-stone-600 sm:grid-cols-3 sm:px-6 lg:px-8">
          <p className="flex items-center gap-3"><Check size={20} className="shrink-0 text-gray-900" /> Clear product specifications</p>
          <p className="flex items-center gap-3"><Truck size={20} className="shrink-0 text-gray-900" /> Australia-wide delivery options</p>
          <p className="flex items-center gap-3"><ShieldCheck size={20} className="shrink-0 text-gray-900" /> Compliance details where applicable</p>
        </div>
      </section>
      <section className="bg-[#F7F5F2] px-4 py-14 text-center sm:px-6 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Your bathroom. Your style. A fair price.</h2>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-stone-600">Discover quality products that make everyday life a little better.</p>
        <a href="#bathroom-collections" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800">Shop bathroom <ArrowUpRight size={17} aria-hidden="true" /></a>
      </section>
    </>
  );
}
