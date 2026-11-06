import Image from 'next/image';

/** Editorial certification panel with a restrained accent and compact proof badge. */
export function KitchenTapCertificationStrip({ licenceNumber }: { licenceNumber: string | null | undefined }) {
  return (
    <div
      aria-label="WaterMark Certified and Lead Free"
      className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 pl-5 text-[13px] text-neutral-900"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-neutral-800" />
      <Image src="/watermark-icon.png" alt="WaterMark" width={30} height={30} className="h-7 w-7 shrink-0 object-contain" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold leading-tight tracking-tight">WaterMark Certified</span>
        {licenceNumber && <span className="text-[11px] text-neutral-500">Licence {licenceNumber}</span>}
      </div>
      <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-800">
        Lead Free
      </span>
    </div>
  );
}
