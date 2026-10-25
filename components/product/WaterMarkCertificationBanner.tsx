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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(136deg,transparent_55%,rgba(103,0,0,.5)_55%,rgba(103,0,0,.5)_66%,transparent_66%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[49%] bg-white [clip-path:polygon(69%_0,100%_0,100%_100%,0_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[55%] bg-[#fa1c2a] [clip-path:polygon(95%_0,100%_0,18%_100%,9%_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[50%] bg-gradient-to-br from-white to-gray-100 [clip-path:polygon(70%_0,100%_0,100%_100%,0_100%)]" />

      <div className="relative z-10 flex h-full w-[61%] flex-col justify-center px-[5%] py-4">
        <p className="text-[clamp(9px,1.5vw,16px)] font-semibold uppercase leading-tight tracking-wide">This product is</p>
        <p className="mt-[3%] text-[clamp(18px,3.4vw,42px)] font-extrabold uppercase leading-[1.13] tracking-tight">WaterMark<br />Certified</p>
        {licenceNumber && (
          <div className="mt-[7%] flex items-center gap-2 text-[clamp(9px,1.4vw,16px)]">
            <CheckCircle2 aria-hidden="true" className="h-[1.8em] w-[1.8em] shrink-0" strokeWidth={2.5} />
            <span>Licence: <strong>{licenceNumber}</strong></span>
          </div>
        )}
      </div>
      <div className="absolute bottom-[10%] right-[4%] z-10 flex w-[28%] flex-col items-center text-black">
        <Image src="/watermark-icon.png" alt="" width={112} height={112} sizes="(min-width: 768px) 150px, 28vw" className="h-auto w-[68%] object-contain" />
        {leadFree && <span className="mt-1 whitespace-nowrap text-[clamp(10px,1.75vw,21px)] font-bold">Lead Free</span>}
      </div>
    </div>
  );
}
