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
      className="relative mx-auto mt-4 flex aspect-[2.6/1] w-full max-w-[70vh] items-center overflow-hidden rounded-md bg-[#e00009] text-white sm:aspect-[2.8/1]"
      aria-label="WaterMark certified product"
    >
      {/* A shared SVG coordinate plane avoids gaps and jagged polygon joins. */}
      <svg aria-hidden="true" viewBox="0 0 1000 360" preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full">
        <polygon points="650,0 720,0 460,360 390,360" fill="#a0000a" />
        <polygon points="720,0 750,0 490,360 460,360" fill="#ff2738" />
        <polygon points="750,0 1000,0 1000,360 490,360" fill="#ffffff" />
        <polygon points="925,0 1000,0 1000,360 665,360" fill="#f7f7f7" />
      </svg>

      <div className="relative z-10 flex w-[55%] flex-col justify-center pl-[5%] pr-1">
        <p className="text-[clamp(11px,1.5vw,18px)] font-semibold uppercase leading-tight tracking-wide">
          This product is
        </p>
        <p className="mt-1.5 text-[clamp(20px,3.1vw,40px)] font-extrabold uppercase leading-[1.08] tracking-tight sm:mt-2">
          WaterMark<br />Certified
        </p>
        {licenceNumber && (
          <div className="mt-3 flex items-center gap-1.5 text-[clamp(11px,1.4vw,18px)] sm:mt-4 sm:gap-2">
            <CheckCircle2 aria-hidden="true" className="h-[1.5em] w-[1.5em] shrink-0" strokeWidth={2.5} />
            <span>Licence: <strong>{licenceNumber}</strong></span>
          </div>
        )}
      </div>

      <div className="absolute inset-y-0 right-[3%] z-10 flex w-[26%] flex-col items-center justify-center text-black sm:right-[4%] sm:w-[25%]">
        <Image src="/watermark-icon.png" alt="" width={112} height={112}
          sizes="(min-width: 768px) 130px, 24vw"
          className="block h-auto w-[78%] max-w-[108px] object-contain" />
        {leadFree && <span className="-mt-1 block whitespace-nowrap text-[clamp(12px,1.8vw,22px)] font-bold leading-none sm:-mt-1.5">Lead Free</span>}
      </div>
    </div>
  );
}
