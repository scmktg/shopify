'use client';

import { useRef, useState } from 'react';
import type { ProductContent } from '@/lib/products/schema';

const SPEC_GROUPS = [
  { heading: 'Performance & filtration', labels: ['Cooling capacity', 'Chilled water temperature', 'Filtration', 'Bottle / glass fill side tap'] },
  { heading: 'Construction & installation', labels: ['Cabinet material', 'Cabinet profile', 'Recommended location', 'Water connection'] },
  { heading: 'Product identification & compliance', labels: ['Brand name', 'Manufacturer model ID', 'WaterMark certificate'] },
] as const;

export function RoundBubblerDetails({ content }: { content: ProductContent }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const tabsRef = useRef<HTMLDivElement>(null);
  const specs = (content.fullSpecs ?? []).filter((item) => !['sku', 'product type', 'watermark model name'].includes(item.label.trim().toLowerCase()));
  const groupedLabels = new Set<string>(SPEC_GROUPS.flatMap((group) => [...group.labels]));
  const additional = specs.filter((row) => !groupedLabels.has(row.label));
  const showSpecifications = () => {
    setActiveTab('specifications');
    const top = tabsRef.current?.getBoundingClientRect().top;
    if (top !== undefined) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, window.scrollY + top - 150), behavior: reduced ? 'instant' : 'smooth' });
    }
  };

  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div ref={tabsRef} role="tablist" aria-label="Product information" className="flex w-full items-center justify-center gap-8 border-b border-black/10 sm:gap-16">
        {(['description', 'specifications'] as const).map((tab) => (
          <button key={tab} type="button" role="tab" id={`round-bubbler-tab-${tab}`}
            aria-controls={`round-bubbler-panel-${tab}`} aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`relative min-h-14 px-1 py-4 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${activeTab === tab ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div id="round-bubbler-panel-description" role="tabpanel" aria-labelledby="round-bubbler-tab-description" hidden={activeTab !== 'description'} className="pt-10">
        <section className="mx-auto max-w-5xl text-center" aria-labelledby="round-bubbler-editorial-title">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black"><span aria-hidden="true" className="text-2xl leading-none">✦</span> Classic round fountain</p>
          <h2 id="round-bubbler-editorial-title" className="mx-auto mt-6 max-w-5xl text-[clamp(2rem,4vw,3.8rem)] font-light leading-[1.13] tracking-tight text-black">
            Timeless design.<br className="hidden sm:block" /> <strong className="font-semibold">Refreshing <span className="ea-round-steel">Stainless Steel.</span></strong>
          </h2>
          <h3 className="mt-8 text-xl font-semibold text-black">A classic drinking fountain, made for everyday use.</h3>
          <div className="mx-auto mt-5 max-w-3xl space-y-4 text-base leading-7 text-black/65">
            <p>Clean lines, a familiar round profile and durable stainless-steel construction make this freestanding fountain an easy fit for workplaces, staff areas and sheltered commercial spaces.</p>
            <p>Enjoy chilled, filtered water straight from the bubbler. A dedicated drinking point, without the need for a separate bottle-filling tap.</p>
            <p className="font-medium text-black/75">Simple form. Reliable refreshment. Everyday convenience.</p>
          </div>
        </section>
        <section className="mt-14 border-t border-black/10 pt-12 sm:mt-16 sm:pt-16" aria-labelledby="round-bubbler-filtration">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/45">Integrated water filtration</p>
            <h3 id="round-bubbler-filtration" className="mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)] font-light leading-tight tracking-tight text-black">
              Built-In Filtration.<br className="hidden sm:block" /> <span className="ea-round-water font-semibold">Refreshingly Simple.</span>
            </h3>
            <h4 className="mt-8 text-xl font-semibold text-black">Filtered drinking water, without the fuss.</h4>
            <div className="mx-auto mt-5 max-w-3xl space-y-5 text-base leading-8 text-black/65">
              <p>Enjoy refreshing, better-tasting drinking water with an integrated filtration system conveniently housed within the fountain.</p>
              <p>Designed to make everyday hydration straightforward, the built-in filter helps improve drinking-water quality while keeping the fountain&apos;s exterior clean and uncluttered.</p>
              <p>And when it&apos;s time for routine maintenance, the replaceable cartridge makes ongoing filter servicing straightforward.</p>
              <p className="font-semibold text-black">Integrated filtration. Simple upkeep. Everyday refreshment.</p>
            </div>
            <button type="button" onClick={showSpecifications} className="mt-10 inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-black py-2 pl-7 pr-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
              <span>View Specifications</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 19 19 5M7 5h12v12" /></svg>
              </span>
            </button>
          </div>
        </section>
        <style jsx>{`
          .ea-round-steel {
            color: #92979b;
            background: linear-gradient(105deg, #676e73 5%, #a9afb3 30%, #e9edef 48%, #8a9298 68%, #626b70 100%);
            background-size: 240% 100%; -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent; animation: ea-round-shine 7s ease-in-out infinite;
          }
          .ea-round-water {
            color: #167bb7;
            background: linear-gradient(105deg, #085e9f, #1788c6 24%, #75d1eb 46%, #168bc9 65%, #075b9b);
            background-size: 240% 100%; -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent; animation: ea-round-shine 7s ease-in-out infinite;
          }
          @keyframes ea-round-shine { 0%, 15% { background-position: 100% 0; } 65%, 100% { background-position: 0 0; } }
          @media (prefers-reduced-motion: reduce) { .ea-round-steel, .ea-round-water { animation: none; background-position: 50% 0; } }
        `}</style>
      </div>

      <div id="round-bubbler-panel-specifications" role="tabpanel" aria-labelledby="round-bubbler-tab-specifications" hidden={activeTab !== 'specifications'} className="pt-9">
        <section aria-labelledby="round-bubbler-specs-title">
          <h2 id="round-bubbler-specs-title" className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Technical specifications</h2>
          <p className="mt-2 text-sm text-black/60">Key product details organised for easy comparison and purchasing approval.</p>
          <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
            {SPEC_GROUPS.map((group) => {
              const rows = specs.filter((item) => group.labels.some((label) => label === item.label));
              if (!rows.length) return null;
              return (
                <div key={group.heading} className="border-t border-black/10">
                  <h3 className="border-b border-black/10 py-4 text-sm font-semibold text-black">{group.heading}</h3>
                  <dl className="py-1">
                    {rows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 border-b border-black/[0.07] py-3.5 text-sm last:border-0">
                        <dt className="text-black/60">{row.label}</dt>
                        <dd className="text-right font-medium text-black">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
            {additional.length > 0 && (
              <div className="border-t border-black/15">
                <h3 className="border-b border-black/10 py-4 text-sm font-semibold text-black">Additional details</h3>
                <dl className="py-1">
                  {additional.map((row) => (
                    <div key={row.label} className="grid grid-cols-2 gap-4 border-b border-black/[0.07] py-3.5 text-sm last:border-0">
                      <dt className="text-black/60">{row.label}</dt>
                      <dd className="text-right font-medium text-black">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
