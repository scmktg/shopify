import { ShieldAlert } from 'lucide-react';
import type { ProductContent, ProductCompliance } from '@/lib/products/schema';
import {
  WatermarkBadge,
  LeadFreeBadge,
  isLeadFree,
} from './WatermarkBadge';

interface CertificationSlotProps {
  content: ProductContent;
}

/**
 * Buy-box badge slot. Renders the WaterMark and Lead Free badges as
 * an inline pair when they apply, with the WaterMark licence
 * caption underneath when set.
 *
 *   - watermark.status === 'certified' → red WaterMark Certified pill
 *   - lead-free declared in specs       → red Lead Free pill
 *   - watermark.status === 'pending'   → amber WaterMark pending pill
 *                                        (replaces the certified pill)
 *
 * Both compliance signals are independent — a product may carry
 * either, both, or neither. Nothing here implies that WMK
 * certification means lead-free, or vice versa.
 */
export function CertificationSlot({ content }: CertificationSlotProps) {
  const wm = content.compliance?.watermark ?? null;
  const wmkCertified = wm?.status === 'certified';
  const wmkPending = wm?.status === 'pending';
  const leadFree = isLeadFree(content);

  if (!wmkCertified && !wmkPending && !leadFree) return null;

  const caption = wmkCertified && wm ? formatCaption(wm) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {wmkCertified && <WatermarkBadge />}
        {wmkPending && (
          <span
            role="img"
            aria-label="WaterMark certification pending"
            className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900"
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            WaterMark Pending
          </span>
        )}
        {leadFree && <LeadFreeBadge />}
      </div>
      {caption && <p className="text-xs text-black/60">{caption}</p>}
    </div>
  );
}

function formatCaption(
  wm: NonNullable<ProductCompliance['watermark']>,
): string | null {
  const parts: string[] = [];
  if (wm.licenceNumber) parts.push(`Licence ${wm.licenceNumber}`);
  if (wm.certifier) parts.push(wm.certifier);
  if (wm.validUntil) {
    const formatted = new Intl.DateTimeFormat('en-AU', {
      dateStyle: 'long',
    }).format(new Date(wm.validUntil));
    parts.push(`valid until ${formatted}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}
