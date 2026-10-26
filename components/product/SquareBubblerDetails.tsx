'use client';

import { useState } from 'react';
import type { ProductContent } from '@/lib/products/schema';
import { Download, FileText, ShieldCheck, Wrench } from 'lucide-react';

const DOCUMENTS = [
  {
    title: 'Product specification sheet',
    description: 'Technical details for purchasing, approvals and project planning.',
    file: 'Stainless Steel Fountain - Bubbler & Tap - Product Specifications.pdf',
  },
  {
    title: 'Technical installation guide',
    description: 'Connection and installation information for your licensed plumber.',
    file: 'Stainless Steel Fountain - Bubbler & Tap - Technical Installation.pdf',
  },
] as const;

const SPEC_GROUPS = [
  {
    heading: 'Performance & filtration',
    labels: ['Product type', 'Cooling capacity', 'Chilled water temperature', 'Filtration', 'Bottle / glass fill side tap'],
  },
  {
    heading: 'Construction & installation',
    labels: ['Cabinet material', 'Dimensions', 'Recommended location', 'Water connection'],
  },
  {
    heading: 'Product identification & compliance',
    labels: ['Brand name', 'Manufacturer model ID', 'WaterMark model name', 'WaterMark certificate'],
  },
] as const;

export function SquareBubblerDetails({ content }: { content: ProductContent }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'downloads'>('description');
  const specs = (content.fullSpecs ?? []).filter((item) => !['sku', 'product type', 'watermark model name'].includes(item.label.trim().toLowerCase()));
  const listed = new Set<string>(SPEC_GROUPS.flatMap((group) => [...group.labels]));
  const remaining = specs.filter((item) => !listed.has(item.label));

  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div role="tablist" aria-label="Product information" className="flex w-full items-center justify-center gap-8 overflow-x-auto border-b border-black/10 sm:gap-16">
        {(['description', 'specifications', 'downloads'] as const).map((value) => (
          <button key={value} type="button" role="tab"
            id={`square-bubbler-tab-${value}`}
            aria-controls={`square-bubbler-panel-${value}`}
            aria-selected={activeTab === value}
            onClick={() => setActiveTab(value)}
            className={`relative min-h-14 shrink-0 px-1 py-4 text-center text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:flex-none sm:px-0 ${activeTab === value ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}
          >{value}</button>
        ))}
      </div>
      <div id="square-bubbler-panel-description" role="tabpanel" aria-labelledby="square-bubbler-tab-description" hidden={activeTab !== 'description'} className="pt-10">
        <section className="text-center" aria-labelledby="square-bubbler-editorial-title">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.12em] text-black uppercase"><span aria-hidden="true" className="text-2xl leading-none">✦</span> Our most popular model</p>
          <h2 id="square-bubbler-editorial-title" className="mx-auto mt-6 max-w-5xl text-[clamp(2rem,4vw,3.8rem)] font-light leading-[1.13] tracking-tight text-black">
            Drink or refill... all from one<br className="hidden md:block" /> <strong className="font-semibold">Sleek <span className="ea-steel-shine">Stainless Steel</span> Fountain</strong>
          </h2>
        </section>
        <section className="mx-auto mt-9 max-w-3xl space-y-4 text-center" aria-label="Why stainless steel">
          <h3 className="text-xl font-semibold text-black">The timeless stainless steel design.</h3>
          <p className="text-base leading-7 text-black/65">There is a reason these units have remained a favourite in Australian gyms, schools and commercial facilities for decades. A classic appearance, dependable construction and straightforward cleaning make them a natural fit for most commercial environments.</p>
          <p className="text-base leading-7 text-black/65">With two convenient ways to enjoy chilled, filtered water, there&apos;s no compromise and no complexity.</p>
          <p className="text-base leading-7 text-black/65">Just one sleek, practical unit.</p>
        </section>
        <section className="mx-auto mt-11 grid max-w-4xl gap-8 md:grid-cols-2" aria-label="Bubbler and tap details">
          {[
            {image:'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/close-up-bubbler-tap.png?v=1793001350',alt:'Close-up of drinking bubbler',heading:'Rubber protection guard',detail:'Thoughtful protection around the drinking spout.'},
            {image:'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Polished_Chrome_Faucet_in_Modern_Sink.png?v=1793001452',alt:'Close-up of bottle-filling tap',heading:'360° swivel tap',detail:'Flexible access for filling bottles, glasses and jugs.'}
          ].map((item) => (
            <div key={item.image} className="group min-w-0">
              <div className="aspect-[5/4] overflow-hidden rounded-lg bg-[#ebeced]">
                <img src={item.image} alt={item.alt} loading="lazy" className="h-full w-full object-cover" onError={(event)=>{event.currentTarget.style.display='none';}} />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-black">{item.heading}</h4>
              <p className="mt-1 text-sm leading-6 text-black/60">{item.detail}</p>
            </div>
          ))}
        </section>
        <p className="mt-7 text-center text-sm text-black/55">Suitable for schools, gyms, offices and sheltered commercial facilities.</p>
        <section className="mt-16 border-t border-black/10 pt-12 sm:mt-20 sm:pt-16" aria-labelledby="square-bubbler-filtration">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/45">Integrated water filtration</p>
            <h3 id="square-bubbler-filtration" className="mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)] font-light leading-tight tracking-tight text-black">
              Built-in filtration for<br className="hidden sm:block" /> <span className="ea-water-shine font-semibold">cleaner, great tasting water.</span>
            </h3>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl items-center gap-8 md:grid-cols-[1.05fr_1.15fr] md:gap-12">
            <div className="flex min-h-[320px] items-center justify-center sm:min-h-[420px]">
              <img
                src="https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Untitled_design.png?v=1793006569"
                alt="Interior of the stainless steel water bubbler showing the integrated filtration cartridge and components"
                loading="lazy"
                className="max-h-[650px] h-auto w-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">One cartridge. Two filtration stages.</h4>
              <p className="mt-5 text-base leading-8 text-black/65">Enjoy better-tasting drinking water with a convenient 2-in-1 cartridge that combines sediment and activated-carbon filtration to help reduce unwanted particles, tastes and odours.</p>
              <p className="mt-4 text-base leading-8 text-black/65">With both filtration stages combined into a single replaceable cartridge, routine upkeep stays simple. Simply open the front panel to access the cartridge. No plumbing work or disconnection required for maintenance.</p>
              <p className="mt-5 text-base font-semibold leading-7 text-black">No separate filters to juggle. Just one convenient cartridge.</p>

            </div>
          </div>
        </section>

        <style jsx>{`
          .ea-steel-shine {
            color: #9b9fa3;
            background: linear-gradient(105deg, #868a8f 10%, #b9bdc1 38%, #f5f6f7 49%, #969ba1 60%, #72777b 88%);
            background-size: 240% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: ea-steel-sweep 6s ease-in-out infinite;
          }
          .ea-water-shine {
            color: #167bb7;
            background: linear-gradient(105deg, #085e9f 0%, #1788c6 24%, #75d1eb 46%, #168bc9 65%, #075b9b 100%);
            background-size: 240% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: ea-water-flow 7s ease-in-out infinite;
          }
          @keyframes ea-water-flow {
            0%, 15% { background-position: 100% 0; }
            65%, 100% { background-position: 0 0; }
          }
          @keyframes ea-steel-sweep { 0%, 18% { background-position: 100% 0; } 55%, 100% { background-position: 0 0; } }
          @media (prefers-reduced-motion: reduce) { .ea-steel-shine, .ea-water-shine { animation: none; background-position: 50% 0; } }
        `}</style>
      </div>
      <div id="square-bubbler-panel-specifications" role="tabpanel" aria-labelledby="square-bubbler-tab-specifications" hidden={activeTab !== 'specifications'} className="pt-9">
      <section aria-labelledby="square-bubbler-specs">
        <h2 id="square-bubbler-specs" className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Technical specifications</h2>
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
          {remaining.length > 0 && (
            <div className="border-t border-black/15">
              <h3 className="border-b border-black/10 py-4 text-sm font-semibold text-black">Additional details</h3>
              <dl className="py-1">
                {remaining.map((row) => (
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
      <div id="square-bubbler-panel-downloads" role="tabpanel" aria-labelledby="square-bubbler-tab-downloads" hidden={activeTab !== 'downloads'} className="pt-9">
      <section aria-labelledby="square-bubbler-documents">
        <h2 id="square-bubbler-documents" className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Product documents</h2>
        <p className="mt-2 text-sm leading-6 text-black/65">Download the documents for your plumber, facilities team or purchasing approval.</p>
        <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
          {DOCUMENTS.map((document) => (
            <a
              key={document.file}
              href={`/documents/bubblers/${encodeURIComponent(document.file)}`}
              download={document.file}
              type="application/pdf"
              className="group flex items-center gap-5 py-6 transition-colors hover:bg-black/[0.015] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-black/10 text-black/70"><FileText size={23} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-black">{document.title}</span>
                <span className="mt-1 block text-xs leading-5 text-black/60">{document.description}</span>
                <span className="mt-2 block text-xs font-medium text-black/70 underline underline-offset-4">Download PDF</span>
              </span>
              <Download size={20} className="shrink-0 text-black/65" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 border-t border-black/10 pt-8 md:grid-cols-2" aria-label="Installation and certification">
        <div className="">
          <div className="flex items-center gap-3"><Wrench className="text-black/65" size={19} aria-hidden="true" /><h2 className="text-base font-semibold text-black">Installation information</h2></div>
          <p className="mt-3 text-sm leading-6 text-black/70">Mains-water, drainage and electrical provisions must be confirmed for the installation site. Engage an appropriately licensed plumber and refer to the technical installation guide before installation.</p>
        </div>
        <div className="">
          <div className="flex items-center gap-3"><ShieldCheck className="text-black/65" size={19} aria-hidden="true" /><h2 className="text-base font-semibold text-black">WaterMark certification</h2></div>
          <p className="mt-3 text-sm leading-6 text-black/70">Enviro Aqua YL-600C · WaterMark model name: Water Bubbler Square · Certificate 023484. Confirm site-specific compliance with your licensed tradesperson.</p>
        </div>
      </section>
      </div>
    </div>
  );
}
