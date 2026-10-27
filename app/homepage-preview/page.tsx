import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { HomeReviewsSection } from '@/components/reviews/HomeReviewsSection';
import type { Product } from '@/types/product';

export const metadata: Metadata = {
  title: 'Homepage Design Preview | Enviro Aqua',
  robots: { index: false, follow: false },
};
export const revalidate = 60;

const PRODUCTS = {
  wholeHouse: 'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
  bubbler: 'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
  tap: '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
  underSink: 'under-sink-water-filter-2-stage-sediment-carbon',
  cartridges: 'twin-pair-of-water-filter-cartridges-premium-carbon-cto-plus-sediment-pp-10-x-2',
} as const;

function ProductImage({ product, className = '', eager = false }: { product: Product | null; className?: string; eager?: boolean }) {
  const image = product?.featuredImage ?? product?.images?.[0];
  if (!image) return <div aria-hidden="true" className={'bg-[#eceeef] ' + className} />;
  return <img src={image.url} alt={image.altText || product?.title || 'Enviro Aqua product'} loading={eager ? 'eager' : 'lazy'} className={'h-full w-full object-contain ' + className} />;
}

function ArrowLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={'group inline-flex min-h-12 items-center justify-center gap-4 rounded-full py-2 pl-6 pr-2 text-xs font-semibold uppercase tracking-[0.09em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 ' + (dark ? 'bg-white text-[#292929] hover:bg-white/90' : 'bg-[#292929] text-white hover:bg-[#444]')}>
      <span>{children}</span><span aria-hidden="true" className={'flex h-9 w-9 items-center justify-center rounded-full ' + (dark ? 'bg-[#292929] text-white' : 'bg-white text-[#292929]')}><ArrowUpRight size={17}/></span>
    </Link>
  );
}

function Eyebrow({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return <p className={'text-[11px] font-semibold uppercase tracking-[0.18em] ' + (inverse ? 'text-white/55' : 'text-[#292929]/50')}>{children}</p>;
}

function ProductTile({ product, fallback, label, description, featured = false }: { product: Product | null; fallback: string; label: string; description: string; featured?: boolean }) {
  const href = product ? getProductUrl(product.handle) : fallback;
  return (
    <Link href={href} className={'group flex flex-col ' + (featured ? 'md:col-span-2' : '')}>
      <div className={'relative flex items-center justify-center overflow-hidden rounded-xl bg-[#f0f1f1] ' + (featured ? 'aspect-[16/9] sm:aspect-[16/7]' : 'aspect-[4/3]')}>
        <ProductImage product={product} className="p-8 transition-transform duration-500 group-hover:scale-[1.035] sm:p-12" />
        <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#292929] shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true"><ArrowUpRight size={18}/></span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div><h3 className="text-xl font-medium tracking-tight text-[#292929] sm:text-2xl">{label}</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#292929]/60">{description}</p></div>
      </div>
    </Link>
  );
}

export default async function HomePagePreview() {
  const [wholeHouse, bubbler, tap, underSink, cartridges] = await Promise.all([
    getProductByHandle(PRODUCTS.wholeHouse),
    getProductByHandle(PRODUCTS.bubbler),
    getProductByHandle(PRODUCTS.tap),
    getProductByHandle(PRODUCTS.underSink),
    getProductByHandle(PRODUCTS.cartridges),
  ]);
  return (
    <main className="overflow-hidden bg-white text-[#292929]">
      <div className="border-b border-black/10 bg-[#f5f5f4] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-[#292929]/65">
        DESIGN PREVIEW · The live homepage is unchanged
      </div>

      <section aria-labelledby="preview-hero-heading" className="bg-[#f6f6f5]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-12 lg:py-20">
          <div className="max-w-2xl">
            <Eyebrow>Enviro Aqua Australia</Eyebrow>
            <h1 id="preview-hero-heading" className="mt-6 text-[clamp(3rem,6vw,6.5rem)] font-light leading-[1.03] tracking-[-0.055em]">
              Better water.<br/><span className="font-semibold">Beautifully simple.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#292929]/65 sm:text-lg">
              Thoughtfully selected water filtration solutions for Australian homes, workplaces and commercial spaces.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <ArrowLink href="/water-filters/">Explore water filtration</ArrowLink>
              <Link className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:text-[#2200CC]" href="/use/">Find the right solution <ArrowRight size={16}/></Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#e8e9e9] aspect-[5/4]">
            <ProductImage product={bubbler} eager className="p-6 sm:p-12 lg:p-10"/>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 rounded-xl bg-white/95 px-5 py-4 shadow-sm backdrop-blur-sm">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#292929]/45">Featured commercial solution</p><p className="mt-1 text-sm font-semibold">Stainless-steel water bubbler</p></div>
              <Link href={bubbler ? getProductUrl(bubbler.handle) : '/commercial-water-bubblers/'} aria-label="View stainless steel commercial water bubbler" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#292929] text-white"><ArrowUpRight size={17}/></Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Reasons to choose Enviro Aqua" className="border-y border-black/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            { Icon: MapPin, title: 'Australian owned', subtitle: 'Based in Wyong, NSW' },
            { Icon: ShieldCheck, title: 'Clear product specifications', subtitle: 'Compliance information where applicable' },
            { Icon: Truck, title: 'Australia-wide delivery', subtitle: 'Shipping options shown at checkout' },
          ].map(({ Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3 sm:justify-center"><Icon size={21} strokeWidth={1.5} className="shrink-0 text-[#292929]/70" aria-hidden="true"/><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-[#292929]/55">{subtitle}</p></div></div>
          ))}
        </div>
      </section>

      <section aria-labelledby="collections-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:mb-16 md:flex-row md:items-end">
          <div><Eyebrow>Discover our collection</Eyebrow><h2 id="collections-heading" className="mt-4 max-w-3xl text-[clamp(2.3rem,4.5vw,4.5rem)] font-light leading-[1.1] tracking-[-0.035em]">Find your perfect <span className="font-semibold">water solution.</span></h2></div>
          <Link href="/water-filters/" className="inline-flex items-center gap-2 self-start text-sm font-semibold underline underline-offset-4 hover:text-[#2200CC]">Browse water filters <ArrowUpRight size={16}/></Link>
        </div>
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
          <ProductTile product={wholeHouse} fallback="/water-filters/whole-house/" label="Whole-house filtration" description="Filtration solutions for water throughout your home." />
          <ProductTile product={bubbler} fallback="/commercial-water-bubblers/" label="Commercial water bubblers" description="Chilled, filtered water for spaces that work hard." />
          <ProductTile product={tap} fallback="/plumbing/ro-filter-taps/" label="Filtered-water kitchen taps" description="Beautiful everyday design, with a dedicated filtered-water supply." />
          <ProductTile product={underSink} fallback="/water-filters/under-sink/" label="Under-sink filtration" description="Convenient drinking-water filtration, right where you need it." />
        </div>
      </section>

      <section aria-labelledby="feature-heading" className="bg-[#f3f3f2]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-28">
          <div className="aspect-[5/4] overflow-hidden rounded-xl bg-[#e5e6e6]"><ProductImage product={bubbler} className="p-8 sm:p-12"/></div>
          <div><Eyebrow>Designed for everyday use</Eyebrow><h2 id="feature-heading" className="mt-5 text-[clamp(2.4rem,4.6vw,4.7rem)] font-light leading-[1.1] tracking-[-0.04em]">One beautiful unit.<br/><span className="font-semibold">Two ways to refresh.</span></h2><p className="mt-6 max-w-lg text-base leading-8 text-[#292929]/65">Our square stainless-steel commercial water bubbler combines a convenient drinking fountain and bottle-filling tap with integrated chilled-water filtration.</p><ul className="mt-6 space-y-3 text-sm text-[#292929]/75">{['Classic stainless-steel styling', 'Chilled, filtered drinking water', 'Practical for shared commercial spaces'].map(item=><li key={item} className="flex items-center gap-3"><Check size={16} aria-hidden="true"/>{item}</li>)}</ul><div className="mt-9"><ArrowLink href={bubbler ? getProductUrl(bubbler.handle) : '/commercial-water-bubblers/'}>Discover the bubbler</ArrowLink></div></div>
        </div>
      </section>

      <section aria-labelledby="essentials-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mb-10"><Eyebrow>For everyday maintenance</Eyebrow><h2 id="essentials-heading" className="mt-4 text-[clamp(2rem,4vw,3.6rem)] font-light leading-tight tracking-[-0.035em]">Keep your water flowing <span className="font-semibold">beautifully.</span></h2></div>
        <div className="grid items-center gap-8 rounded-2xl bg-[#f5f5f4] p-6 md:grid-cols-2 md:p-10">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white"><ProductImage product={cartridges} className="p-8 sm:p-12"/></div>
          <div><Eyebrow>Replacement filters</Eyebrow><h3 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">A simpler way to stay on top of filtration.</h3><p className="mt-5 max-w-md text-base leading-7 text-[#292929]/65">Find compatible replacement cartridges and keep your filtration system ready for everyday use.</p><Link href="/cartridges/" className="mt-7 inline-flex min-h-12 items-center gap-2 font-semibold text-[#292929] underline underline-offset-4 hover:text-[#2200CC]">Explore replacement filters <ArrowUpRight size={17}/></Link></div>
        </div>
      </section>

      <section aria-labelledby="confidence-heading" className="bg-[#292929] text-white">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Eyebrow inverse>Why Enviro Aqua</Eyebrow>
          <h2 id="confidence-heading" className="mx-auto mt-5 text-[clamp(2.5rem,5vw,5.4rem)] font-light leading-[1.12] tracking-[-0.04em]">Confidence in <span className="font-semibold">every drop.</span></h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/65">Clear specifications, practical filtration solutions and local specialist support when you need help making the right choice.</p>
          <div className="mt-9"><ArrowLink href="/about/" dark>About Enviro Aqua</ArrowLink></div>
        </div>
      </section>

      <HomeReviewsSection />
      <section className="border-t border-black/10 px-5 py-20 text-center sm:py-24">
        <Eyebrow>We're here to help</Eyebrow><h2 className="mt-4 text-3xl font-light tracking-tight sm:text-5xl">Not sure where to start?</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#292929]/65">Explore filtration by application, or speak with our team about your water needs.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4"><ArrowLink href="/use/">Find your solution</ArrowLink><Link href="/contact/" className="inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Contact our team</Link></div>
      </section>
    </main>
  );
}
