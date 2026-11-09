'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ProductContent } from '@/lib/products/schema';
import { VariantSkuSpec } from './VariantSkuSpec';

const DIMENSION_IMAGES = [
  { name: 'Matte Black', src: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Matte_Black_Gooseneck_Tap_Dimensions.png?v=1794219288' },
  { name: 'Brushed Gold', src: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Brushed_Gold_Faucet_Measurement_Diagram.png?v=1794219466' },
  { name: 'Polished Chrome', src: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Chrome_Faucet_Dimensions_Infographic.png?v=1794219586' },
  { name: 'Brushed Nickel', src: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Brushed_Nickel_Faucet_Dimensions.png?v=1794219640' },
] as const;

export function ThreeWayTapSalesSections({ content, finishShowcase }: { content: ProductContent; finishShowcase?: ReactNode }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [dimensionFinish, setDimensionFinish] = useState<(typeof DIMENSION_IMAGES)[number]['name']>('Matte Black');
  const selectedDiagram = DIMENSION_IMAGES.find((image) => image.name === dimensionFinish) ?? DIMENSION_IMAGES[0];

  const showSpecifications = () => {
    setActiveTab('specifications');
    const top = tabsRef.current?.getBoundingClientRect().top;
    if (top !== undefined) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, window.scrollY + top - 150), behavior: reducedMotion ? 'instant' : 'smooth' });
    }
  };

  const specs = (content.fullSpecs ?? []).filter((row) => row.label.trim().toLowerCase() !== 'sku');
  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div ref={tabsRef} role="tablist" aria-label="Product information" className="flex items-center justify-center gap-8 border-b border-black/10 sm:gap-16">
        {(['description', 'specifications'] as const).map((tab) => (
          <button key={tab} type="button" role="tab" id={`matte-tap-tab-${tab}`}
            aria-controls={`matte-tap-panel-${tab}`} aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`relative min-h-14 px-1 py-4 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${activeTab === tab ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}
          >{tab}</button>
        ))}
      </div>
      <div id="matte-tap-panel-description" role="tabpanel" aria-labelledby="matte-tap-tab-description" hidden={activeTab !== 'description'} className="pt-12 sm:pt-16">
      <section className="mx-auto max-w-5xl text-center" aria-labelledby="three-way-tap-editorial-title">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
          Designed for beautiful kitchens
        </p>
        <h2
          id="three-way-tap-editorial-title"
          className="mx-auto mt-5 max-w-4xl text-[clamp(2.1rem,4.5vw,4rem)] font-light leading-[1.12] tracking-tight text-black"
        >
          <span className="block sm:whitespace-nowrap">Hot, Cold &amp; Filtered.</span>
          <span className="block font-semibold">All from one sleek tap.</span>
        </h2>
        <div className="mx-auto mt-7 max-w-3xl text-base leading-8 text-black/65">
          <p>
            Your kitchen deserves the best. Available in four sleek finishes,
            our 3 way mixer brings a sophisticated touch to your space.
            Enjoy hot, cold and filtered drinking water from one elegant tap.
          </p>
        </div>
      </section>

      <section
        className="mx-auto mt-14 grid max-w-5xl items-center gap-9 border-y border-black/10 py-12 md:mt-20 md:grid-cols-2 md:gap-16 md:py-16"
        aria-labelledby="three-way-tap-stone-title"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
            One Tap. One Clean Benchtop.
          </p>
          <h3
            id="three-way-tap-stone-title"
            className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-tight tracking-tight text-black"
          >
            Your new benchtop deserves <span className="font-semibold">a beautiful tap.</span>
          </h3>
        </div>
        <div className="space-y-4 text-base leading-8 text-black/65">
          <p>
            When you’ve invested in stone, porcelain, or another premium material,
            the last thing you want is another hole drilled into your bench.
          </p>
          <p>
            This 3 way tap combines your everyday hot and cold water with a
            dedicated connection for filtered drinking water.
            No standalone filter tap needed.
          </p>
          <p className="font-medium text-black">
            A cleaner look with less clutter.
          </p>
        </div>
      </section>

      {finishShowcase}

      <section className="mx-auto mt-14 max-w-5xl text-center md:mt-20" aria-labelledby="three-way-tap-compatibility-title">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
          Standard filtration compatability
        </p>
        <h3
          id="three-way-tap-compatibility-title"
          className="mx-auto mt-4 max-w-3xl text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-tight tracking-tight text-black"
        >
          A simple, standard connection <span className="font-semibold">for Australian homes.</span>
        </h3>
        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-8 text-left md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12">
          <div className="space-y-5 text-base leading-8 text-black/65">
            <p>
              Our 3 way tap uses a standard 1/4” connection, which means it will
              suit standard under-sink and reverse osmosis systems.
            </p>
            <p>
              You do not need to purchase an Enviro Aqua system, and you are not
              locked in to a peculiar size. This is a simple, straightforward
              connection which can be handled by any licensed plumber.
            </p>
          </div>
          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
              <img
                key={selectedDiagram.src}
                src={selectedDiagram.src}
                alt={`${selectedDiagram.name} three way filtered kitchen mixer tap technical dimension drawing`}
                loading="lazy"
                decoding="async"
                width={1080}
                height={1080}
                className="aspect-square h-auto w-full object-contain"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a tap finish for the dimension drawing">
              {DIMENSION_IMAGES.map((diagram) => (
                <button
                  key={diagram.name}
                  type="button"
                  aria-pressed={dimensionFinish === diagram.name}
                  onClick={() => setDimensionFinish(diagram.name)}
                  className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${dimensionFinish === diagram.name ? 'border-black bg-black text-white' : 'border-black/15 text-black/60 hover:border-black/50 hover:text-black'}`}
                >
                  {diagram.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

        <div className="mt-12 flex justify-center">
          <button type="button" onClick={showSpecifications}
            className="inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-black py-2 pl-7 pr-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
            <span>View Specifications</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 19 19 5M7 5h12v12" />
              </svg>
            </span>
          </button>
        </div>
      </div>
      <div id="matte-tap-panel-specifications" role="tabpanel" aria-labelledby="matte-tap-tab-specifications" hidden={activeTab !== 'specifications'} className="pt-9">
        <section className="mx-auto max-w-5xl" aria-labelledby="matte-tap-specifications-title">
          <h2 id="matte-tap-specifications-title" className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Technical specifications</h2>
          <p className="mt-2 text-sm leading-7 text-black/60">Product details, fittings and installation information for your kitchen.</p>
          <dl className="mt-8 grid gap-x-14 md:grid-cols-2">
            <VariantSkuSpec />
            {specs.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-5 border-b border-black/10 py-4 text-sm">
                <dt className="text-black/60">{row.label}</dt>
                <dd className="max-w-[60%] text-right font-medium text-black">{row.value}</dd>
              </div>
            ))}
          </dl>
          {content.compliance?.note && <p className="mt-8 text-sm leading-7 text-black/55">{content.compliance.note}</p>}
        </section>
      </div>
    </div>
  );
}
