'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { ProductContent } from '@/lib/products/schema';

const PACKAGE_URL = '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-and-bund-100l';
const SPECS = [
  ['Capacity', '100 litres'],
  ['Material', 'Linear low-density polyethylene (PE)'],
  ['Diameter', '460 mm'],
  ['Body height', '730 mm'],
  ['Overall height', '820 mm'],
  ['Top port', '150 mm'],
  ['Bund included', 'No — sold separately'],
] as const;
const FAQS = [
  { question: 'Is the bund included with this 100L tank?', answer: 'No. This is the 100L chemical dosing tank only. A matching 100L bund or tank-and-bund package is available separately.' },
  { question: 'What is the tank made from?', answer: 'The tank is rotationally moulded from linear low-density polyethylene with a seamless body and a 150 mm top port.' },
  { question: 'Can this tank hold any chemical?', answer: 'No. Confirm that the exact chemical, concentration and operating conditions are compatible with polyethylene and the tank before use. Follow your chemical supplier’s safety guidance.' },
  { question: 'What size is the tank?', answer: 'The tank has a 460 mm diameter, 730 mm body height and 820 mm overall height, with a nominal 100 litre capacity.' },
  { question: 'Do I need a chemical bund?', answer: 'Secondary containment requirements depend on the chemical, quantity, location and applicable workplace or environmental rules. Confirm your site requirements before ordering.' },
] as const;

export function ChemicalTank100Details({ content }: { content: ProductContent }) {
  const [tab, setTab] = useState<'description' | 'specifications'>('description');
  const tabsRef = useRef<HTMLDivElement>(null);
  const showSpecs = () => {
    setTab('specifications');
    const top = tabsRef.current?.getBoundingClientRect().top;
    if (top !== undefined) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, window.scrollY + top - 150), behavior: reduced ? 'instant' : 'smooth' });
    }
  };
  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div ref={tabsRef} role="tablist" aria-label="100L dosing tank information" className="flex w-full justify-center gap-10 border-b border-black/10 sm:gap-16">
        {(['description', 'specifications'] as const).map(value => (
          <button key={value} type="button" role="tab"
            id={`tank-100-tab-${value}`} aria-controls={`tank-100-panel-${value}`}
            aria-selected={tab === value} onClick={() => setTab(value)}
            className={`relative min-h-14 px-1 py-4 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${tab === value ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}>
            {value}
          </button>
        ))}
      </div>

      <div id="tank-100-panel-description" role="tabpanel" aria-labelledby="tank-100-tab-description" hidden={tab !== 'description'} className="pt-12">
        <section className="mx-auto mt-14 max-w-4xl text-center sm:mt-20" aria-labelledby="tank-100-construction">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">Purpose-built construction</p>
          <h3 id="tank-100-construction" className="mt-4 text-[clamp(1.8rem,3.4vw,3.1rem)] font-light leading-tight tracking-tight text-black">
            Seamless Construction.<br className="hidden sm:block" /> <strong className="font-semibold">Practical Chemical Storage.</strong>
          </h3>
          <div className="mx-auto mt-7 max-w-3xl space-y-5 text-base leading-8 text-black/65">
            <p>Rotationally moulded from linear low-density polyethylene, the tank features a seamless body and a 150mm top port.</p>
            <p>Designed for compatible chemical storage and dosing applications where a dependable, purpose-built vessel is required.</p>
          </div>
        </section>

        <section className="mt-16 border-t border-black/10 pt-12 sm:mt-20 sm:pt-16" aria-labelledby="tank-100-bund-title">
          <div className="mx-auto grid max-w-5xl items-center gap-8 rounded-xl bg-[#f3f4f4] px-6 py-9 sm:px-10 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/50">Optional secondary containment</p>
              <h3 id="tank-100-bund-title" className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Need Secondary Containment?</h3>
              <p className="mt-5 text-base leading-8 text-black/65">Pair your 100L tank with a matching chemical bund to help contain spills or leaks. Check the secondary-containment requirements for your chemical and installation site.</p>
            </div>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <p className="text-lg font-semibold text-black">100L Tank + Bund Package</p>
              <p className="text-sm text-black/55 md:text-right">View the current package price and availability before ordering.</p>
              <Link href={PACKAGE_URL} className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
                View Tank + Bund Package <span className="ml-3" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-14 flex justify-center">
          <button type="button" onClick={showSpecs} className="inline-flex min-h-12 items-center gap-4 rounded-full bg-black py-2 pl-7 pr-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
            <span>View Specifications</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">↗</span>
          </button>
        </div>
        <style jsx>{`
          .ea-poly-shine {
            color: #67747b;
            background: linear-gradient(108deg,#46565e 5%,#7c8b92 30%,#b8c1c4 49%,#6d7d85 66%,#4c5b63 100%);
            background-size: 240% 100%;
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
            animation: ea-poly-sweep 9s ease-in-out infinite;
          }
          @keyframes ea-poly-sweep { 0%, 18% { background-position: 100% 0; } 65%, 100% { background-position: 0 0; } }
          @media (prefers-reduced-motion: reduce) { .ea-poly-shine { animation: none; background-position: 50% 0; } }
        `}</style>
      </div>

      <div id="tank-100-panel-specifications" role="tabpanel" aria-labelledby="tank-100-tab-specifications" hidden={tab !== 'specifications'} className="pt-9">
        <section aria-labelledby="tank-100-specs-title">
          <h2 id="tank-100-specs-title" className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Technical specifications</h2>
          <p className="mt-2 text-sm text-black/60">Dimensions and construction details for installation planning.</p>
          <dl className="mt-8 grid gap-x-14 lg:grid-cols-2">
            {SPECS.map(([label,value]) => (
              <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 border-t border-black/10 py-4 text-sm">
                <dt className="text-black/60">{label}</dt><dd className="text-right font-medium text-black">{value}</dd>
              </div>
            ))}
          </dl>
          {content.fullSpecs?.some(item => item.label === 'Construction') && <p className="mt-5 text-sm text-black/55">Rotationally moulded, seamless body.</p>}
        </section>
      </div>

      <section className="mt-16 border-t border-black/10 pt-12 sm:mt-20 sm:pt-16" aria-labelledby="tank-100-final-title">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/45">Before you order</p>
          <h2 id="tank-100-final-title" className="mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)] font-light leading-tight tracking-tight text-black">The Right Tank for <strong className="font-semibold">Your Installation.</strong></h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/65">Confirm your capacity, chemical compatibility and containment requirements before ordering.</p>
          <a href="#tank-100-purchase" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">Choose Your 100L Tank ↗</a>
        </div>
        <div className="mx-auto mt-14 max-w-4xl border-t border-black/10 pt-10">
          <h3 className="text-center text-2xl font-semibold tracking-tight text-black">Frequently Asked Questions</h3>
          <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
            {FAQS.map(item => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none justify-between gap-5 text-left text-sm font-semibold text-black marker:hidden">
                  {item.question}<span aria-hidden="true" className="text-xl font-light text-black/50 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
