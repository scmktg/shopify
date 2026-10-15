import Image from 'next/image';

/**
 * Visual-only certification badge. The W is an image; all wording is real,
 * sharp HTML text. Neither badge nor text is baked into Shopify product photos.
 */
export function WaterMarkLeadFreeOverlay({
  licenceNumber,
  compact = false,
}: {
  licenceNumber: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-center text-center text-black ${compact ? 'w-[clamp(78px,34%,112px)]' : 'w-[clamp(94px,25%,136px)] sm:left-3 sm:top-3'}`}
      role="img"
      aria-label={`WaterMark Lead Free, licence ${licenceNumber}`}
    >
      <Image
        src="/watermark-icon.png"
        alt=""
        width={112}
        height={112}
        sizes={compact ? '112px' : '136px'}
        className={`h-auto object-contain ${compact ? 'w-12 sm:w-14' : 'w-14 sm:w-[72px]'}`}
      />
      <span aria-hidden="true" className={`mt-0.5 block font-extrabold tracking-tight ${compact ? 'text-[11px] leading-[1.1] sm:text-xs' : 'text-sm leading-tight sm:text-base'}`}>
        WaterMark
      </span>
      <span aria-hidden="true" className={`block font-extrabold tracking-tight ${compact ? 'text-[11px] leading-[1.1] sm:text-xs' : 'text-sm leading-tight sm:text-base'}`}>
        Lead Free
      </span>
      <span aria-hidden="true" className={`mt-1 block whitespace-nowrap rounded bg-white/95 px-1.5 py-1 font-semibold leading-none shadow-sm ${compact ? 'text-[10px] sm:text-[11px]' : 'text-xs sm:text-[13px]'}`}>
        Licence {licenceNumber}
      </span>
    </div>
  );
}
