import Image from 'next/image';

/** Minimal, unboxed certification proof for WaterMark-certified drinking fountains. */
export function BubblerCertificationStrip({
  licenceNumber,
  leadFree,
}: {
  licenceNumber: string | null | undefined;
  leadFree: boolean;
}) {
  return (
    <div
      aria-label="WaterMark certification details"
      className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-neutral-200 py-3 text-[13px] text-neutral-800"
    >
      <Image src="/watermark-icon.png" alt="WaterMark" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
      <span className="font-semibold tracking-tight">WaterMark Certified</span>
      {leadFree && (
        <>
          <span aria-hidden="true" className="h-4 w-px bg-neutral-200" />
          <span className="font-medium text-neutral-700">Lead Free</span>
        </>
      )}
      {licenceNumber && <span className="ml-auto text-xs text-neutral-500">Licence {licenceNumber}</span>}
    </div>
  );
}
