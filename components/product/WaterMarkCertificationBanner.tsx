import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

/**
 * CSS-built certification banner, replacing the 2160px raster artwork.
 * Only rendered for WaterMark-certified bubbler PDPs.
 * Licence and lead-free statements are sourced from product compliance data.
 */
export function WaterMarkCertificationBanner({
  licenceNumber,
  leadFree,
}: {
  licenceNumber: string | null | undefined;
  leadFree: boolean;
}) {
  return (
    <div className="relative mx-auto mt-4 aspect-[2/1] w-full max-w-[70vh] overflow-hidden rounded border border-red-900/10 bg-gradient-to-br from-[#f0060d] via-[#d30009] to-[#940008] text-white" aria-label="WaterMark certified product">
      {/* One SVG coordinate system keeps every diagonal perfectly straight and aligned. */}
      <svg aria-hidden="true" viewBox="0 0 1000 500" preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full">
        <polygon points="715,0 810,0 405,500 290,500" fill="#a40009" />
        <polygon points="810,0 850,0 445,500 405,500" fill="#ff2738" />
        <polygon points="850,0 1000,0 1000,500 445,500" fill="#ffffff" />
        <polygon points="940,0 1000,0 1000,500 550,500" fill="#f5f5f5" opacity="0.65" />
      </svg>

      <div className="relative z-10 flex h-full w-[65%] flex-col justify-center px-[5%] py-3 sm:w-[61%] sm:py-4">
        <p className="text-[clamp(9px,1.6vw,16px)] font-semibold uppercase leading-tight tracking-wide">This product is</p>
        <p className="mt-[3%] text-[clamp(16px,3.4vw,42px)] font-extrabold uppercase leading-[1.13] tracking-tight">WaterMark<br />Certified</p>
        {licenceNumber && (
          <div className="mt-[7%] flex items-center gap-2 text-[clamp(9px,1.4vw,16px)]">
            <CheckCircle2 aria-hidden="true" className="h-[1.8em] w-[1.8em] shrink-0" strokeWidth={2.5} />
            <span>Licence: <strong>{licenceNumber}</strong></span>
          </div>
        )}
      </div>
      <div className="absolute bottom-[12%] right-[3%] z-10 flex w-[30%] flex-col items-center text-black sm:bottom-[10%] sm:right-[4%] sm:w-[28%]">
        <Image src="/watermark-icon.png" alt="" width={112} height={112} sizes="(min-width: 768px) 130px, 25vw" className="h-auto w-[72%] max-w-28 object-contain sm:w-[68%]" />
        {leadFree && <span className="mt-0.5 whitespace-nowrap text-[clamp(11px,1.75vw,21px)] font-bold leading-tight sm:mt-1">Lead Free</span>}
      </div>
    </div>
  );
}
