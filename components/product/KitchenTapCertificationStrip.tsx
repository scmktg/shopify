import Image from 'next/image';
import { Check } from 'lucide-react';

/** Compact certification proof, replacing redundant graphics on the tap photo. */
export function KitchenTapCertificationStrip({ licenceNumber }: { licenceNumber: string | null | undefined }) {
  return (
    <div
      aria-label="WaterMark certified and Lead Free"
      className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800"
    >
      <Image src="/watermark-icon.png" alt="WaterMark" width={32} height={32} className="h-7 w-7 shrink-0 object-contain" />
      <span className="font-semibold">WaterMark certified</span>
      <span aria-hidden="true" className="h-4 w-px bg-neutral-200" />
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Check aria-hidden="true" className="h-4 w-4 text-emerald-700" strokeWidth={2} />
        Lead Free
      </span>
      {licenceNumber && <span className="ml-auto text-xs font-medium text-neutral-500">Licence {licenceNumber}</span>}
    </div>
  );
}
