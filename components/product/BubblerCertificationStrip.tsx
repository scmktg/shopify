import Image from 'next/image';

/** Under-gallery certification panel for WaterMark-certified drinking fountains. */
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
      className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] text-neutral-800"
    >
      <Image src="/watermark-icon.png" alt="WaterMark" width={28} height={28} className="h-6 w-6 shrink-0 object-contain" />
      <span className="font-semibold">WaterMark Certified</span>
      {leadFree && (
        <>
          <span aria-hidden="true" className="mx-0.5 h-3.5 w-px bg-neutral-200" />
          <span className="font-semibold">Lead Free</span>
        </>
      )}
      {licenceNumber && <span className="ml-auto text-xs text-neutral-500">Licence {licenceNumber}</span>}
    </div>
  );
}
