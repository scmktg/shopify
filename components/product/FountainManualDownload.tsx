import { Download, FileText } from 'lucide-react';

export const FOUNTAIN_MANUAL_URL =
  'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Installation_Manual_-_Water_Fountains.pdf?v=1794985405';

export function FountainManualDownload() {
  return (
    <section aria-label="Fountain manual download">
      <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">Product documents</h2>
      <p className="mt-2 text-sm leading-6 text-black/65">
        Download the official product specifications and installation guidance for your plumber, facilities team or purchasing approval.
      </p>
      <div className="mt-7 border-y border-black/10">
        <a
          href={FOUNTAIN_MANUAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          type="application/pdf"
          className="group flex items-center gap-5 py-6 transition-colors hover:bg-black/[0.015] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-black/10 text-black/70">
            <FileText size={23} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black">Product Specifications and Installation Manual</span>
            <span className="mt-1 block text-xs leading-5 text-black/60">Technical specifications, connection requirements and installation instructions (PDF).</span>
            <span className="mt-2 block text-xs font-medium text-black/70 underline underline-offset-4">Download PDF</span>
          </span>
          <Download size={20} className="shrink-0 text-black/65" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
