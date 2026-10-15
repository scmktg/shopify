import Image from 'next/image';

/** Visual-only overlay: the product's underlying photo and Shopify feed image are untouched. */
export function WaterMarkLeadFreeOverlay() {
  return (
    <div
      className="pointer-events-none absolute left-2 top-2 z-10 w-[clamp(64px,20%,112px)] sm:left-3 sm:top-3"
      role="img"
      aria-label="WaterMark Lead Free certification"
    >
      <Image
        src="/watermark-lead-free.png"
        alt=""
        width={112}
        height={112}
        sizes="(min-width: 640px) 112px, 20vw"
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
