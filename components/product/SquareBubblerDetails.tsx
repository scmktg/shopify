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
  const specs = (content.fullSpecs ?? []).filter((item) => item.label.toLowerCase() !== 'sku');
  const listed = new Set<string>(SPEC_GROUPS.flatMap((group) => [...group.labels]));
  const remaining = specs.filter((item) => !listed.has(item.label));

  return (
    <div className="mt-12 border-t border-black/10 pt-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">Commercial drinking water</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black md:text-3xl">
          Chilled, filtered water for busy shared spaces
        </h2>
        <p className="mt-4 text-base leading-7 text-black/70">
          The Enviro Aqua YL-600C combines a direct-drinking fountain with a separate side tap
          for filling bottles, cups and jugs. Its stainless-steel cabinet and integrated
          sediment and activated-carbon filtration make it a practical choice for schools,
          offices, gyms and sheltered commercial areas.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Product highlights">
        {[
          ['20 L/hr', 'Rated cooling capacity'],
          ['Approx. 8–12 °C', 'Chilled water output'],
          ['2 outlets', 'Bubbler and bottle-filling tap'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-black/10 bg-[#fafafa] p-5">
            <p className="text-xl font-semibold tracking-tight text-black">{value}</p>
            <p className="mt-1 text-sm text-black/60">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-12" aria-labelledby="square-bubbler-specs">
        <h2 id="square-bubbler-specs" className="text-2xl font-semibold tracking-tight text-black">Technical specifications</h2>
        <p className="mt-2 text-sm text-black/60">Key product details organised for easy comparison and purchasing approval.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {SPEC_GROUPS.map((group) => {
            const rows = specs.filter((item) => group.labels.some((label) => label === item.label));
            if (!rows.length) return null;
            return (
              <div key={group.heading} className="overflow-hidden rounded-xl border border-black/10">
                <h3 className="border-b border-black/10 bg-[#f7f8fa] px-5 py-4 text-sm font-semibold text-black">{group.heading}</h3>
                <dl className="px-5 py-1">
                  {rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 border-b border-black/5 py-3 text-sm last:border-0">
                      <dt className="text-black/60">{row.label}</dt>
                      <dd className="text-right font-medium text-black">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
          {remaining.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-black/10">
              <h3 className="border-b border-black/10 bg-[#f7f8fa] px-5 py-4 text-sm font-semibold text-black">Additional details</h3>
              <dl className="px-5 py-1">
                {remaining.map((row) => (
                  <div key={row.label} className="grid grid-cols-2 gap-4 border-b border-black/5 py-3 text-sm last:border-0">
                    <dt className="text-black/60">{row.label}</dt>
                    <dd className="text-right font-medium text-black">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="square-bubbler-documents">
        <h2 id="square-bubbler-documents" className="text-2xl font-semibold tracking-tight text-black">Product documents</h2>
        <p className="mt-2 text-sm leading-6 text-black/65">Download the documents for your plumber, facilities team or purchasing approval.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {DOCUMENTS.map((document) => (
            <a
              key={document.file}
              href={`/documents/bubblers/${encodeURIComponent(document.file)}`}
              download={document.file}
              type="application/pdf"
              className="group flex items-center gap-4 rounded-xl border border-black/10 bg-white p-5 transition-colors hover:border-brand-blue/60 hover:bg-brand-blue-light/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f3f5f7] text-brand-blue"><FileText size={23} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-black">{document.title}</span>
                <span className="mt-1 block text-xs leading-5 text-black/60">{document.description}</span>
                <span className="mt-2 block text-xs font-semibold text-brand-blue">Download PDF</span>
              </span>
              <Download size={20} className="shrink-0 text-brand-blue" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2" aria-label="Installation and certification">
        <div className="rounded-xl border border-black/10 p-6">
          <div className="flex items-center gap-3"><Wrench className="text-brand-blue" size={22} aria-hidden="true" /><h2 className="text-lg font-semibold text-black">Installation information</h2></div>
          <p className="mt-3 text-sm leading-6 text-black/70">Mains-water, drainage and electrical provisions must be confirmed for the installation site. Engage an appropriately licensed plumber and refer to the technical installation guide before installation.</p>
        </div>
        <div className="rounded-xl border border-black/10 p-6">
          <div className="flex items-center gap-3"><ShieldCheck className="text-brand-blue" size={22} aria-hidden="true" /><h2 className="text-lg font-semibold text-black">WaterMark certification</h2></div>
          <p className="mt-3 text-sm leading-6 text-black/70">Enviro Aqua YL-600C · WaterMark model name: Water Bubbler Square · Certificate 023484. Confirm site-specific compliance with your licensed tradesperson.</p>
        </div>
      </section>
    </div>
  );
}
