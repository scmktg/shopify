import Image from 'next/image';

/** Visual-only overlay: the product's underlying photo and Shopify feed image are untouched. */
export function WaterMarkLeadFreeOverlay({ licenceNumber, compact = false }: { licenceNumber: string; compact?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute left-2 top-2 z-10 flex flex-col items-center ${compact ? "w-[clamp(52px,28%,88px)]" : "w-[clamp(64px,20%,112px)] sm:left-3 sm:top-3"}`}
      role="img"
      aria-label={`WaterMark certified, licence ${licenceNumber}`}
    >
      <Image
        src="/WaterMark-Certified.png"
        alt=""
        width={112}
        height={112}
        sizes="(min-width: 640px) 112px, 20vw"
        className="h-auto w-full object-contain"
      />
      <span className="mt-0.5 rounded bg-white/95 px-1 py-0.5 text-center text-[9px] font-semibold leading-tight text-black shadow-sm sm:text-[10px]">
        Licence {licenceNumber}
      </span>
    </div>
  );
}
