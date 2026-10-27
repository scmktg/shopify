'use client';

import { useRef, useState } from 'react';
import type { ProductContent } from '@/lib/products/schema';

const GROUPS = [
  { title: 'Performance & filtration', labels: ['Cooling capacity', 'Water temperature', 'Filtration', 'Dispensing', 'Refrigerant'] },
  { title: 'Cabinet & installation', labels: ['Cabinet material', 'Cabinet finish', 'Dimensions', 'Installation type', 'Cooling power'] },
  { title: 'Product details & compliance', labels: ['Model', 'Product type', 'Certification', 'Lead-free wetted components'] },
] as const;

export function HdpeBubblerDetails({ content }: { content: ProductContent }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const tabsRef = useRef<HTMLDivElement>(null);
  const specs = content.fullSpecs ?? [];
  const groupedLabels = new Set<string>(GROUPS.flatMap((group) => [...group.labels]));
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
          <button key={tab} type="button" role="tab" id={`hdpe-bubbler-tab-${tab}`}
            aria-controls={`hdpe-bubbler-panel-${tab}`} aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`relative min-h-14 px-1 py-4 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${activeTab === tab ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div id="hdpe-bubbler-panel-description" role="tabpanel" aria-labelledby="hdpe-bubbler-tab-description" hidden={activeTab !== 'description'} className="pt-10">
        <section className="mx-auto max-w-5xl text-center" aria-labelledby="hdpe-bubbler-editorial-title">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black">
            <span aria-hidden="true" className="text-2xl leading-none">✦</span> Our contemporary fountain
          </p>
          <h2 id="hdpe-bubbler-editorial-title" className="mx-auto mt-6 max-w-4xl text-[clamp(2rem,4vw,3.8rem)] font-light leading-[1.13] tracking-tight text-black">
            A modern design with a<br className="hidden sm:block" /> <strong className="font-semibold"><span className="ea-granite-text">Granite-Inspired Finish.</span></strong>
          </h2>
          <h3 className="mt-7 text-lg font-semibold text-black/75 sm:text-xl">A fresh take on the traditional drinking fountain.</h3>
          <div className="mx-auto mt-5 max-w-3xl space-y-5 text-base leading-7 text-black/65">
            <p>With its distinctive granite-look finish, clean lines and stone-inspired design, this fountain brings a refined, contemporary feel to everyday drinking water.</p>
            <p>Its sleek profile and understated grey tones make it a natural fit for modern schools, gyms, workplaces and commercial interiors.</p>
            <p className="font-medium text-black/70">Sophisticated styling. Everyday practicality. Refreshingly different.</p>
          </div>
        </section>

        <section className="mt-14 border-t border-black/10 pt-12 sm:mt-16 sm:pt-16" aria-labelledby="hdpe-bubbler-benefits">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/45">Designed for everyday use</p>
            <h3 id="hdpe-bubbler-benefits" className="mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)] font-light leading-tight tracking-tight text-black">
              Stone-inspired style.<br className="hidden sm:block" /> <strong className="font-semibold">Practical drinking water.</strong>
            </h3>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-3">
            <div className="border-t border-black/10 pt-5">
              <h4 className="text-base font-semibold text-black">Rust-free HDPE cabinet</h4>
              <p className="mt-3 text-sm leading-7 text-black/65">A corrosion-resistant exterior with a distinctive granite-stone appearance.</p>
            </div>
            <div className="border-t border-black/10 pt-5">
              <h4 className="text-base font-semibold text-black">Drink or refill</h4>
              <p className="mt-3 text-sm leading-7 text-black/65">A built-in bubbler and separate side tap for filling bottles, glasses and jugs.</p>
            </div>
            <div className="border-t border-black/10 pt-5">
              <h4 className="text-base font-semibold text-black">Chilled, filtered water</h4>
              <p className="mt-3 text-sm leading-7 text-black/65">20 L/hr rated cooling capacity with two-stage sediment and activated-carbon filtration.</p>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-black/10 pt-12 sm:mt-16 sm:pt-16" aria-labelledby="hdpe-bubbler-filtration">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/45">Integrated water filtration</p>
            <h3 id="hdpe-bubbler-filtration" className="mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)] font-light leading-tight tracking-tight text-black">
              Chilled water, with <span className="ea-water-shine font-semibold">filtration built in.</span>
            </h3>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-black/65">Two-stage filtration combines PP sediment and activated carbon to help reduce particles, unwanted tastes and odours. The mains-connected fountain offers convenient drinking and bottle filling in one unit.</p>
            <p className="mt-4 text-sm text-black/55">Suitable for schools, gyms, offices and sheltered commercial facilities.</p>
            <button type="button" onClick={showSpecifications}
              className="mt-9 inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-black py-2 pl-7 pr-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
              <span>View Specifications</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 19 19 5M7 5h12v12" /></svg>
              </span>
            </button>
          </div>
        </section>
        <style jsx>{`
          .ea-granite-text {
            color: #596167;
            background-image:
              radial-gradient(circle at 18% 22%, rgba(230,234,234,.28) 0 1px, transparent 1.4px),
              radial-gradient(circle at 74% 36%, rgba(190,199,200,.28) 0 1.2px, transparent 1.5px),
              radial-gradient(circle at 42% 78%, rgba(222,229,230,.20) 0 1.5px, transparent 1.8px),
              radial-gradient(circle at 63% 68%, rgba(14,20,22,.30) 0 1.5px, transparent 1.9px),
              radial-gradient(circle at 30% 55%, rgba(28,35,38,.28) 0 1px, transparent 1.4px),
              linear-gradient(115deg, #353c40 0%, #596267 19%, #757f83 35%, #414b50 53%, #687377 69%, #3c454a 86%, #30393d 100%);
            background-size: 120px 120px, 140px 140px, 160px 160px, 150px 150px, 130px 130px, 220% 100%;
            background-position: 0 0, 20px 30px, 40px 10px, 60px 50px, 10px 70px, 100% 0;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: ea-granite-sweep 10s ease-in-out infinite;
          }
          .ea-water-shine {
            color: #167bb7;
            background: linear-gradient(105deg, #085e9f, #1788c6 24%, #75d1eb 46%, #168bc9 65%, #075b9b);
            background-size: 240% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: ea-water-sweep 7s ease-in-out infinite;
          }
          @keyframes ea-granite-sweep {
            0%, 18% { background-position: 0 0, 20px 30px, 40px 10px, 60px 50px, 10px 70px, 100% 0; }
            60%, 100% { background-position: 0 0, 20px 30px, 40px 10px, 60px 50px, 10px 70px, 0 0; }
          }
          @keyframes ea-water-sweep {
            0%, 15% { background-position: 100% 0; }
            65%, 100% { background-position: 0 0; }
          }
          @media (prefers-reduced-motion: reduce) { .ea-granite-text, .ea-water-shine { animation: none; } .ea-granite-text { background-position: 0 0, 20px 30px, 40px 10px, 60px 50px, 10px 70px, 50% 0; } .ea-water-shine { background-position: 50% 0; } }
        `}</style>
      </div>

      <div id="hdpe-bubbler-panel-specifications" role="tabpanel" aria-labelledby="hdpe-bubbler-tab-specifications" hidden={activeTab !== 'specifications'} className="pt-9">
        <section aria-labelledby="hdpe-bubbler-specs-title">
          <h2 id="hdpe-bubbler-specs-title" className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Technical specifications</h2>
          <p className="mt-2 text-sm text-black/60">Key product details organised for easy comparison and purchasing approval.</p>
          <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
            {GROUPS.map((group) => {
              const rows = specs.filter((row) => group.labels.some((label) => label === row.label));
              if (!rows.length) return null;
              return <div key={group.title} className="border-t border-black/10">
                <h3 className="border-b border-black/10 py-4 text-sm font-semibold text-black">{group.title}</h3>
                <dl className="py-1">{rows.map((row) => <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 border-b border-black/[0.07] py-3.5 text-sm last:border-0"><dt className="text-black/60">{row.label}</dt><dd className="text-right font-medium text-black">{row.value}</dd></div>)}</dl>
              </div>;
            })}
            {additional.length > 0 && <div className="border-t border-black/10">
              <h3 className="border-b border-black/10 py-4 text-sm font-semibold text-black">Additional details</h3>
              <dl className="py-1">{additional.map((row) => <div key={row.label} className="grid grid-cols-2 gap-4 border-b border-black/[0.07] py-3.5 text-sm last:border-0"><dt className="text-black/60">{row.label}</dt><dd className="text-right font-medium text-black">{row.value}</dd></div>)}</dl>
            </div>}
          </div>
        </section>
      </div>
    </div>
  );
}
