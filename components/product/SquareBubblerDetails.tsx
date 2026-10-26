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
  const specs = (content.fullSpecs ?? []).filter((item) => item.label.toLowerCase() !== 'sku');
  const listed = new Set<string>(SPEC_GROUPS.flatMap((group) => [...group.labels]));
  const remaining = specs.filter((item) => !listed.has(item.label));

  return (
    <div className="mt-14 border-t border-black/10 pt-5">
      <div role="tablist" aria-label="Product information" className="flex w-full gap-4 overflow-x-auto border-b border-black/10 sm:gap-10">
        {(['description', 'specifications', 'downloads'] as const).map((value) => (
          <button key={value} type="button" role="tab"
            id={`square-bubbler-tab-${value}`}
            aria-controls={`square-bubbler-panel-${value}`}
            aria-selected={activeTab === value}
            onClick={() => setActiveTab(value)}
            className={`relative min-h-12 shrink-0 px-0 py-3 text-left text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:flex-none sm:px-5 ${activeTab === value ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}
          >{value}</button>
        ))}
      </div>
      <div id="square-bubbler-panel-description" role="tabpanel" aria-labelledby="square-bubbler-tab-description" hidden={activeTab !== 'description'} className="pt-10">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">Commercial drinking fountains</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-black md:text-3xl">
            Commercial Stainless Steel Water Bubbler with Bottle-Filling Tap
          </h2>
          <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-black/85">
            Chilled, filtered drinking water for your workplace, school or gym — with a convenient side tap for refilling bottles and glasses.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
            Give staff, students and visitors two easy ways to stay hydrated, all from one durable stainless-steel drinking fountain.
          </p>
          <ul className="mt-7 grid gap-x-10 gap-y-3 text-sm leading-7 text-black/75 md:grid-cols-2">
            {[
              ['Drink or refill', 'Built-in drinking fountain and separate bottle-filling tap.'],
              ['Enjoy chilled water', '20 L/hr rated cooling capacity and approximately 8–12°C water output.'],
              ['Filtered drinking water', 'Sediment and activated-carbon filtration.'],
              ['Built for commercial spaces', 'SUS304 stainless-steel cabinet.'],
              ['WaterMark certified', 'Certificate 023484.'],
            ].map(([title, detail]) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" aria-hidden="true" />
                <span><strong className="font-semibold text-black">{title}:</strong> {detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <section className="mt-12 border-t border-black/10 pt-10" aria-labelledby="square-bubbler-benefits">
          <h3 id="square-bubbler-benefits" className="text-xl font-semibold tracking-tight text-black md:text-2xl">
            Two Ways to Drink. One Convenient Water Fountain.
          </h3>
          <div className="mt-7 grid gap-8 md:grid-cols-3">
            {[
              {
                heading: 'Refreshing Drinking Water, Whenever You Need It',
                body: 'Give people easy access to chilled, filtered water throughout the day. The mains-connected fountain provides a dedicated place to drink without relying on bottled drinking water.',
              },
              {
                heading: 'Refill Bottles, Cups and Jugs with Ease',
                body: 'The separate side tap makes it easy to fill reusable bottles, cups and glasses — ideal for shared spaces where people prefer different ways to drink.',
              },
              {
                heading: 'Made for Everyday Commercial Use',
                body: 'Its SUS304 stainless-steel cabinet offers a practical, professional finish for indoor and sheltered commercial environments.',
              },
            ].map((item) => (
              <div key={item.heading}>
                <h4 className="text-base font-semibold leading-6 text-black">{item.heading}</h4>
                <p className="mt-3 text-sm leading-7 text-black/65">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-black/10 pt-10" aria-labelledby="square-bubbler-places">
          <h3 id="square-bubbler-places" className="text-xl font-semibold tracking-tight text-black md:text-2xl">A Practical Addition to Your Facility</h3>
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            {[
              ['Schools and campuses', 'Provide a convenient drinking and bottle-refilling station for students and staff.'],
              ['Gyms and recreation centres', 'Give members somewhere to refill water bottles or enjoy a quick drink.'],
              ['Offices and workplaces', 'Make drinking water easily available to employees and visitors throughout the day.'],
            ].map(([heading, body]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold text-black">{heading}</h4>
                <p className="mt-2 text-sm leading-7 text-black/65">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-black/10 pt-10" aria-labelledby="square-bubbler-included">
          <h3 id="square-bubbler-included" className="text-xl font-semibold tracking-tight text-black md:text-2xl">What’s Included in This Model?</h3>
          <ul className="mt-5 grid gap-x-10 gap-y-2 text-sm leading-7 text-black/70 md:grid-cols-2">
            {[
              'Built-in drinking fountain',
              'Separate side tap for filling bottles and glasses',
              'Chilled-water system rated at 20 litres per hour',
              'Sediment and activated-carbon water filtration',
              'SUS304 stainless-steel cabinet',
              'WaterMark-certified model',
            ].map((feature) => <li key={feature} className="flex items-start gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" aria-hidden="true" />{feature}</li>)}
          </ul>
        </section>

        <section className="mt-12 border-t border-black/10 pt-10" aria-labelledby="square-bubbler-installation">
          <h3 id="square-bubbler-installation" className="text-xl font-semibold tracking-tight text-black md:text-2xl">Installation Made Easier</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-black/70">
            This mains-connected bubbler requires appropriate plumbing and drainage. Installation must be completed by an appropriately licensed plumbing practitioner.
          </p>
          <h4 className="mt-5 text-sm font-semibold text-black">Need help finding an installer?</h4>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-black/70">
            Select installation assistance when ordering and Enviro Aqua can help you locate a local licensed plumber. Installation charges and site-specific requirements are confirmed separately.
          </p>
        </section>
        <div className="mt-12 border-t border-black/10 pt-8">
          <p className="text-lg font-semibold text-black">Convenient access to chilled, filtered water for your facility.</p>
          <p className="mt-2 text-sm leading-7 text-black/65">
            A stainless-steel drinking fountain and separate bottle-filling tap in one practical unit. Questions before ordering? Call <a href="tel:+61287728162" className="font-semibold text-black underline underline-offset-4">(02) 8772 8162</a>.
          </p>
        </div>
      </div>
      <div id="square-bubbler-panel-specifications" role="tabpanel" aria-labelledby="square-bubbler-tab-specifications" hidden={activeTab !== 'specifications'} className="pt-9">
      <section aria-labelledby="square-bubbler-specs">
        <h2 id="square-bubbler-specs" className="text-2xl font-semibold tracking-tight text-black">Technical specifications</h2>
        <p className="mt-2 text-sm text-black/60">Key product details organised for easy comparison and purchasing approval.</p>
        <div className="mt-8 grid gap-x-14 gap-y-10 lg:grid-cols-2">
          {SPEC_GROUPS.map((group) => {
            const rows = specs.filter((item) => group.labels.some((label) => label === item.label));
            if (!rows.length) return null;
            return (
              <div key={group.heading} className="border-t border-black/15">
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
        <h2 id="square-bubbler-documents" className="text-2xl font-semibold tracking-tight text-black">Product documents</h2>
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
