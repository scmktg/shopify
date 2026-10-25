import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

/** Compact, responsive certification artwork. All text stays crisp and accessible. */
export function WaterMarkCertificationBanner({
  licenceNumber,
  leadFree,
}: {
  licenceNumber: string | null | undefined;
  leadFree: boolean;
}) {
  return (
    <div
      className="relative mx-auto mt-4 flex aspect-[2.7/1] w-full max-w-[70vh] items-center overflow-hidden rounded-md bg-[#e00009] text-white sm:aspect-[2.8/1]"
      aria-label="WaterMark certified product"
    >
      {/* A shared SVG coordinate plane avoids gaps and jagged polygon joins. */}
      <svg aria-hidden="true" viewBox="0 0 1000 360" preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full">
        <polygon points="695,0 790,0 450,360 355,360" fill="#a0000a" />
        <polygon points="790,0 828,0 488,360 450,360" fill="#ff2738" />
        <polygon points="828,0 1000,0 1000,360 488,360" fill="#ffffff" />
        <polygon points="951,0 1000,0 1000,360 620,360" fill="#f7f7f7" />
      </svg>

      <div className="relative z-10 flex w-[61%] flex-col justify-center pl-[5%] pr-1">
        <p className="text-[clamp(10px,1.3vw,15px)] font-semibold uppercase leading-tight tracking-wide">
          This product is
        </p>
        <p className="mt-1.5 text-[clamp(17px,2.45vw,31px)] font-extrabold uppercase leading-[1.08] tracking-tight sm:mt-2">
          WaterMark<br />Certified
        </p>
        {licenceNumber && (
          <div className="mt-3 flex items-center gap-1.5 text-[clamp(10px,1.2vw,15px)] sm:mt-4 sm:gap-2">
            <CheckCircle2 aria-hidden="true" className="h-[1.5em] w-[1.5em] shrink-0" strokeWidth={2.5} />
            <span>Licence: <strong>{licenceNumber}</strong></span>
          </div>
        )}
      </div>

      <div className="absolute inset-y-0 right-[2%] z-10 flex w-[27%] flex-col items-center justify-center gap-1 text-black sm:right-[3%] sm:w-[26%] sm:gap-2">
        <Image src="/watermark-icon.png" alt="" width={112} height={112}
          sizes="(min-width: 768px) 130px, 24vw"
          className="h-auto w-[75%] max-w-[112px] object-contain" />
        {leadFree && <span className="whitespace-nowrap text-[clamp(11px,1.4vw,18px)] font-bold leading-tight">Lead Free</span>}
      </div>
    </div>
  );
}
