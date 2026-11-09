'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ProductContent } from '@/lib/products/schema';
import { VariantSkuSpec } from './VariantSkuSpec';

export function ThreeWayTapSalesSections({ content, finishShowcase }: { content: ProductContent; finishShowcase?: ReactNode }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const tabsRef = useRef<HTMLDivElement>(null);

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
          <span className="block sm:whitespace-nowrap">Hot, Cold &amp; Filtered.</span> <span className="block font-semibold">All from one sleek tap.</span>
        </h2>
        <div className="mx-auto mt-7 max-w-3xl space-y-4 text-base leading-8 text-black/65">
          <p>
            A beautiful new kitchen deserves a tap that feels just as considered.
            With its sleek matte black finish and understated profile, this
            3-way mixer brings a sophisticated finishing touch to your sink.
          </p>
          <p>
            Enjoy hot, cold and filtered drinking water from one elegant tap.
            No separate drinking-water faucet competing for space or disrupting
            the clean lines of your benchtop.
          </p>
        </div>
      </section>

      <section
        className="mx-auto mt-14 grid max-w-5xl items-center gap-9 border-y border-black/10 py-12 md:mt-20 md:grid-cols-2 md:gap-16 md:py-16"
        aria-labelledby="three-way-tap-stone-title"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
            One tap. One clean benchtop.
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
            When you have invested in stone, porcelain or another premium
            benchtop material, the last thing you want is an unnecessary second
            tap and another hole drilled beside your sink.
          </p>
          <p>
            This 3-way mixer combines your everyday hot and cold water with a
            dedicated connection for filtered drinking water, so a compatible
            under-sink filtration system can use the same tap fixture.
          </p>
          <p className="font-medium text-black">
            A cleaner look, less clutter and one beautifully coordinated finish.
          </p>
        </div>
      </section>

      {finishShowcase}

      <section className="mx-auto mt-14 max-w-4xl text-center md:mt-20" aria-labelledby="three-way-tap-compatibility-title">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
          Easy filtration compatibility
        </p>
        <h3
          id="three-way-tap-compatibility-title"
          className="mx-auto mt-4 max-w-3xl text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-tight tracking-tight text-black"
        >
          Your filtration system. <span className="font-semibold">Your choice.</span>
        </h3>
        <div className="mx-auto mt-6 max-w-3xl space-y-4 text-base leading-8 text-black/65">
          <p>
            The dedicated filtered-water inlet uses a standard 1/4-inch connection,
            designed to work with compatible under-sink filtration and reverse osmosis systems.
          </p>
          <p>
            There is no need to purchase an Enviro Aqua filtration system.
            Whether you already have a compatible filter installed or are choosing
            one for your new kitchen, this tap gives you the freedom to use the system that suits you.
          </p>
          <p className="text-sm leading-7 text-black/55">
            A filtration system is required to supply filtered water. Have your licensed plumber
            confirm connection fittings and compatibility before installation.
          </p>
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
