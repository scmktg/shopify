import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

/**
 * Responsive WaterMark certification banner with deep navy panel.
 * The straight parallel diagonals divide two dedicated content zones.
 */
export function WaterMarkCertificationBanner({
  licenceNumber,
  leadFree,
}: {
  licenceNumber: string | null | undefined;
  leadFree: boolean;
}) {
  return (
    <div
      className="relative mx-auto mt-4 aspect-[3/1] w-full max-w-[70vh] overflow-hidden rounded-md border border-gray-200 bg-[#456A92] text-white sm:aspect-[2.8/1]"
      aria-label="WaterMark certified product"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 360"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {/* Adjacent, parallel polygons: no seams or detached triangles. */}
        <polygon points="700,0 752,0 506,360 454,360" fill="#719BCC" />
        <polygon points="752,0 1000,0 1000,360 506,360" fill="#faf9f7" />
      </svg>

      <div className="absolute inset-y-0 left-[4%] z-10 flex w-[51%] flex-col justify-center sm:left-[5%] sm:w-[49%]">
        <p className="text-[clamp(11px,1.35vw,16px)] font-semibold uppercase leading-tight tracking-wide">
          This product is
        </p>
        <p className="mt-1.5 text-[clamp(23px,2.45vw,35px)] font-bold uppercase leading-[1.05] tracking-[-0.035em] sm:mt-2">
          WaterMark<br />Certified
        </p>
        {licenceNumber && (
          <div className="mt-3 flex items-center gap-1.5 text-[clamp(11px,1.25vw,17px)] sm:mt-4 sm:gap-2">
            <CheckCircle2 aria-hidden="true" className="h-[1.55em] w-[1.55em] shrink-0" strokeWidth={2.5} />
            <span>Licence: <strong>{licenceNumber}</strong></span>
          </div>
        )}
      </div>

      {/* The logo and its caption are one centred unit, not separately positioned. */}
      <div className="absolute inset-y-0 right-[2%] z-10 flex w-[28%] flex-col items-center justify-center text-black sm:right-[3%] sm:w-[26%]">
        <Image
          src="/watermark-icon-banner.png"
          alt=""
          width={112}
          height={112}
          sizes="(min-width: 768px) 110px, 22vw"
          className="block h-auto w-[66%] max-w-[90px] object-contain sm:w-[70%] sm:max-w-[96px]"
        />
        {leadFree && (
          <span className="mt-0.5 block whitespace-nowrap text-[clamp(13px,1.6vw,21px)] font-bold leading-none sm:mt-1">
            Lead Free
          </span>
        )}
      </div>
    </div>
  );
}
