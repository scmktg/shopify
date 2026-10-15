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
      className={`pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-center text-center text-black ${compact ? 'w-[clamp(58px,26%,82px)]' : 'w-[clamp(94px,25%,136px)] sm:left-3 sm:top-3'}`}
      role="img"
      aria-label={`WaterMark Lead Free, licence ${licenceNumber}`}
    >
      <Image
        src="/watermark-icon.png"
        alt=""
        width={112}
        height={112}
        sizes={compact ? '112px' : '136px'}
        className={`h-auto object-contain ${compact ? 'w-10 sm:w-12' : 'w-20 sm:w-24'}`}
      />
      <span aria-hidden="true" className={`-mt-2 block font-bold tracking-normal antialiased ${compact ? 'text-[9px] leading-[1.1] sm:text-[10px]' : 'text-sm leading-tight sm:text-base'}`}>
        WaterMark
      </span>
      <span aria-hidden="true" className={`block font-bold tracking-normal antialiased ${compact ? 'text-xs leading-tight sm:text-[13px]' : 'text-sm leading-tight sm:text-base'}`}>
        Lead Free
      </span>
      <span aria-hidden="true" className={`mt-1 block whitespace-nowrap rounded bg-white px-1 py-0.5 font-medium leading-tight ${compact ? 'text-[8px] sm:text-[9px]' : 'text-[10px] sm:text-[11px]'}`}>
        Licence {licenceNumber}
      </span>
    </div>
  );
}
