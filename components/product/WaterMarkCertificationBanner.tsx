import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

/** Understated, responsive certification panel for verified bubbler products. */
export function WaterMarkCertificationBanner({
  licenceNumber,
  leadFree,
}: {
  licenceNumber: string | null | undefined;
  leadFree: boolean;
}) {
  return (
    <div
      className="mx-auto mt-4 flex min-h-[126px] w-full max-w-[70vh] items-center rounded-lg border border-gray-200 bg-[#f8f9fa] px-4 py-4 text-[#222222] sm:min-h-[168px] sm:px-6 sm:py-5"
      aria-label="WaterMark certified product"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center pr-3 sm:pr-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.09em] text-gray-500 sm:text-xs">
          This product is
        </p>
        <p className="mt-1 text-[clamp(19px,4.5vw,29px)] font-semibold leading-[1.12] tracking-tight">
          WaterMark<br />Certified
        </p>
        {licenceNumber && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-600 sm:mt-3 sm:text-sm">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
            <span>Licence {licenceNumber}</span>
          </div>
        )}
      </div>

      <div aria-hidden="true" className="h-[86px] w-[2px] shrink-0 rounded-full bg-brand-blue sm:h-[112px]" />

      <div className="flex w-[36%] shrink-0 flex-col items-center justify-center pl-3 text-center sm:w-[34%] sm:pl-5">
        <Image
          src="/watermark-icon.png"
          alt="WaterMark"
          width={112}
          height={112}
          sizes="(min-width: 640px) 100px, 25vw"
          className="block h-auto w-[76%] max-w-[92px] object-contain"
        />
        {leadFree && (
          <span className="mt-1 block whitespace-nowrap text-[clamp(12px,2.9vw,18px)] font-semibold leading-tight text-[#222222]">
            Lead Free
          </span>
        )}
      </div>
    </div>
  );
}
