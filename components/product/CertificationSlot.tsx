import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { ProductCompliance } from '@/lib/products/schema';

interface CertificationSlotProps {
  compliance?: ProductCompliance;
}

/**
 * Buy-box badge slot driven by `products.json[handle].compliance`.
 * Render rules:
 *   - watermark.status === 'certified' → blue ShieldCheck badge plus
 *     a small caption listing licence / certifier / validUntil for
 *     fields that are set.
 *   - watermark.status === 'pending'   → amber ShieldAlert badge,
 *     no caption.
 *   - watermark.status === 'not_required' / 'not_certified' / null
 *     → render nothing. Don't surface a "not required" message by
 *     default; if a product genuinely needs that messaging it goes
 *     in compliance.note (rendered by ComplianceSection).
 */
export function CertificationSlot({ compliance }: CertificationSlotProps) {
  const wm = compliance?.watermark;
  if (!wm) return null;
  if (wm.status !== 'certified' && wm.status !== 'pending') return null;

  if (wm.status === 'pending') {
    return (
      <div
        className="inline-flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900"
        role="img"
        aria-label="WaterMark certification pending"
      >
        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        WaterMark certification pending
      </div>
    );
  }

  // status === 'certified' — caption fields render only when set.
  const caption = formatCaption(wm);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="inline-flex w-fit items-center gap-2 rounded border border-brand-blue/40 bg-brand-blue-light px-3 py-1.5 text-sm font-semibold text-brand-blue"
        role="img"
        aria-label="WaterMark certified"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        WaterMark certified
      </div>
      {caption && (
        <p className="text-xs text-black/60">{caption}</p>
      )}
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
