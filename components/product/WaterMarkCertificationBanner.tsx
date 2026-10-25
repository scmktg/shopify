import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

/**
 * Responsive WaterMark certification banner.
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
      className="relative mx-auto mt-4 aspect-[2.5/1] w-full max-w-[70vh] overflow-hidden rounded-md bg-[#e4000b] text-white sm:aspect-[2.8/1]"
      aria-label="WaterMark certified product"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 360"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {/* Adjacent, parallel polygons: no seams or detached triangles. */}
        <polygon points="700,0 756,0 510,360 454,360" fill="#a9000b" />
        <polygon points="756,0 780,0 534,360 510,360" fill="#ff293a" />
        <polygon points="780,0 1000,0 1000,360 534,360" fill="#fff" />
      </svg>

      <div className="absolute inset-y-0 left-[5%] z-10 flex w-[49%] flex-col justify-center">
        <p className="text-[clamp(10px,1.35vw,16px)] font-semibold uppercase leading-tight tracking-wide">
          This product is
        </p>
        <p className="mt-1.5 text-[clamp(19px,2.55vw,37px)] font-extrabold uppercase leading-[1.05] tracking-[-0.035em] sm:mt-2">
          WaterMark<br />Certified
        </p>
        {licenceNumber && (
          <div className="mt-3 flex items-center gap-1.5 text-[clamp(10px,1.25vw,17px)] sm:mt-4 sm:gap-2">
            <CheckCircle2 aria-hidden="true" className="h-[1.55em] w-[1.55em] shrink-0" strokeWidth={2.5} />
            <span>Licence: <strong>{licenceNumber}</strong></span>
          </div>
        )}
      </div>

      {/* The logo and its caption are one centred unit, not separately positioned. */}
      <div className="absolute inset-y-0 right-[3%] z-10 flex w-[26%] flex-col items-center justify-center text-black">
        <Image
          src="/watermark-icon.png"
          alt=""
          width={112}
          height={112}
          sizes="(min-width: 768px) 140px, 24vw"
          className="block h-auto w-[82%] max-w-[112px] object-contain"
        />
        {leadFree && (
          <span className="-mt-1 block whitespace-nowrap text-[clamp(12px,1.6vw,21px)] font-bold leading-tight">
            Lead Free
          </span>
        )}
      </div>
    </div>
  );
}
