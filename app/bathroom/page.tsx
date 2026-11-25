import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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

  const categoryProducts = await Promise.all(collections.map(async (item) => {
    try {
      const tag = item.href.split('/')[2];
      const result = await getProducts({ query: `tag:'primary-cat:plumbing' AND tag:'sub-cat:${tag}'`, first: 8 });
      return result.products.find((product) => product.featuredImage)?.featuredImage ?? null;
    } catch { return null; }
  }));

  return (
    <>
      <JsonLdScript data={[
        collectionSchema('Bathroom Supplies', '/bathroom/', 'Toilets, tapware, kitchen mixers and bathroom packages from Enviro Aqua.'),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Bathroom Supplies', path: '/bathroom/' },
        ]),
      ]} />

      <header className="bg-white text-black">
        <div className="mx-auto grid max-w-[1568px] items-center gap-8 px-6 py-8 sm:px-10 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-[3.4%]">
          <div className="py-5 lg:pl-[8%] lg:pr-[5%]">
            <h1 className="text-[clamp(2.5rem,4vw,4rem)] font-normal leading-[1.2] tracking-[-0.045em]">Create a bathroom<span className="mt-2 block font-bold italic">you&apos;ll love.</span></h1>
            <div className="mt-9 max-w-[540px] space-y-6 text-[clamp(1.05rem,1.85vw,1.8rem)] leading-[1.4] tracking-[0.005em] lg:mt-16 lg:space-y-9">
              <p>Explore beautiful, high-quality products without the expensive retail price tag.</p>
              <p>Sourced directly from the manufacturer and sold straight to you.</p>
            </div>
            <a href="#bathroom-collections" className="mt-9 inline-flex min-h-14 w-full max-w-[306px] items-center justify-center rounded-[22px] bg-black px-8 py-4 text-xl font-bold tracking-tight text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:text-2xl lg:mt-14 lg:min-h-20">Shop Now</a>
          </div>
          <div className="relative aspect-[732/773] overflow-hidden bg-[#f5f4f1]">
            <Image src="https://cdn.shopify.com/s/files/1/0984/4693/4337/files/165727ab5cbb_bathroom-hero-reference.jpg?v=1795566375" alt="Contemporary bathroom with a backlit arched mirror, white vanity and black tapware" fill sizes="(min-width: 1024px) 48vw, 92vw" className="object-cover" preload />
          </div>
        </div>
      </header>
      <div className="border-b border-[#dedbd3] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-8 gap-y-3 px-6 py-5 text-xs font-medium text-stone-600 sm:text-sm">
          <span>Direct manufacturer sourcing</span><span>Fair everyday prices</span><span>Australia-wide delivery</span>
        </div>
      </div>

      <section id="bathroom-collections" aria-labelledby="bathroom-shop-heading" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14 sm:px-8 lg:py-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <h2 id="bathroom-shop-heading" className="text-4xl font-normal tracking-tight text-stone-900 sm:text-5xl">Make it yours.</h2>
          <p className="max-w-sm text-sm leading-6 text-stone-600">From a small refresh to a complete upgrade, find the pieces that make your space feel like home.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {collections.map((item, index) => (
            <Link key={item.href} href={item.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f1eee8]">
                {categoryProducts[index] ? <Image src={categoryProducts[index]!.url} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105 sm:p-8" /> : <span className="absolute inset-0 flex items-center justify-center px-3 text-center font-serif text-xl italic text-stone-600">{item.label}</span>}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <h3 className="text-base font-medium text-stone-900 sm:text-lg">{item.label}</h3><ArrowUpRight size={18} className="shrink-0 text-stone-600" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600 sm:text-sm">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {products.length > 0 && (
        <section aria-labelledby="bathroom-featured-heading" className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <h2 id="bathroom-featured-heading" className="mb-9 text-4xl font-normal tracking-tight text-stone-900 sm:text-5xl">
              Discover your next upgrade
            </h2>
            <ProductGrid products={products} editorial />
          </div>
        </section>
      )}

      <section id="why-buy-direct" aria-labelledby="bathroom-direct-heading" className="scroll-mt-24 bg-[#303b32] text-[#f7f4ed]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d2d8cc]">A smarter way to buy</p>
            <h2 id="bathroom-direct-heading" className="mt-5 text-4xl font-normal leading-tight tracking-tight sm:text-6xl">Beautiful bathrooms shouldn&apos;t <span className="font-serif italic">cost a fortune.</span></h2>
          </div>
          <div className="self-center">
            <p className="text-lg leading-8 text-[#e5e8df]">We source directly from manufacturers and sell directly to you, without expensive retail storefronts. Less unnecessary cost. More room in your budget for the things you love.</p>
            <div className="mt-8 grid gap-3 border-t border-[#647064] pt-6 text-sm text-[#e5e8df]">
              <p>01 / Find your style</p><p>02 / Shop direct</p><p>03 / Love your space</p>
            </div>
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
        <a href="#bathroom-collections" className="mt-6 inline-flex min-h-12 items-center gap-2 bg-[#303b32] px-6 py-3 text-sm font-medium text-white hover:bg-[#465348]">Shop bathroom <ArrowUpRight size={17} aria-hidden="true" /></a>
      </section>
    </>
  );
}
