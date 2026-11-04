import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, Truck, ShieldCheck } from 'lucide-react';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'Bathroom Supplies, Toilets & Tapware Australia',
  description: 'Explore toilets, bathroom tapware, kitchen mixers and bathroom packages at Enviro Aqua. Browse the bathroom range online.',
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
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-stone-500">Enviro Aqua / Bathroom</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-6xl md:text-7xl">
            A better space
            <span className="block text-stone-500">starts here.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Explore our bathroom collection, from considered everyday tapware to practical toilets and complete packages.
          </p>
          <Link
            href="#bathroom-collections"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Explore the bathroom range <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section id="bathroom-collections" aria-labelledby="bathroom-shop-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Find your fit</p>
            <h2 id="bathroom-shop-heading" className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Shop by category
            </h2>
          </div>
          <p className="max-w-sm text-sm text-stone-500">Four straightforward ways to explore our bathroom and tapware range.</p>
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
              Explore the collection
            </h2>
            <ProductGrid products={products} editorial />
          </div>
        </section>
      )}

      <section aria-label="Why shop with Enviro Aqua" className="border-t border-stone-100 bg-[#FAF9F7]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 text-sm text-stone-600 sm:grid-cols-3 sm:px-6 lg:px-8">
          <p className="flex items-center gap-3"><Check size={20} className="shrink-0 text-gray-900" /> Clear product specifications</p>
          <p className="flex items-center gap-3"><Truck size={20} className="shrink-0 text-gray-900" /> Australia-wide delivery options</p>
          <p className="flex items-center gap-3"><ShieldCheck size={20} className="shrink-0 text-gray-900" /> Compliance details where applicable</p>
        </div>
      </section>
    </>
  );
}
