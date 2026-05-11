import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { ProductCompliance, SpecRow } from '@/lib/products/schema';

interface BadgeProps {
  className?: string;
}

/**
 * Twin compliance badges shown together in the buy box.
 *
 * Both are the same red rectangular pill, same height, same
 * typography — so when rendered side by side they read as a paired
 * trust set. Red comes from the scoped `--color-wmk-red` token,
 * which is the single permitted exception to the blue-only accent
 * rule (see `docs/05-design-system.md`).
 *
 * `WatermarkBadge` renders when the product is WaterMark certified.
 * `LeadFreeBadge` renders independently when the product's specs
 * declare it lead-free — see `isLeadFree`. They can appear together
 * or alone; nothing assumes one implies the other.
 *
 * The official WMK mark is served from `/public/watermark.png`.
 */

const BADGE_BASE_CLASSES =
  'inline-flex items-center gap-2 rounded-md bg-wmk-red px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-sm';

export function WatermarkBadge({ className }: BadgeProps) {
  return (
    <span
      role="img"
      aria-label="WaterMark certified"
      className={clsx(BADGE_BASE_CLASSES, className)}
    >
      <img
        src="/watermark.png"
        alt=""
        aria-hidden="true"
        className="h-7 w-7 object-contain"
      />
      WaterMark Certified
    </span>
  );
}

export function LeadFreeBadge({ className }: BadgeProps) {
  return (
    <span
      role="img"
      aria-label="Lead free"
      className={clsx(BADGE_BASE_CLASSES, className)}
    >
      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
      Lead Free
    </span>
  );
}

export function isWatermarkCertified(input: {
  compliance?: ProductCompliance;
  tags?: ReadonlyArray<string>;
}): boolean {
  if (input.compliance?.watermark?.status === 'certified') return true;
  const tags = input.tags;
  if (!tags) return false;
  return tags.includes('watermark') || tags.includes('cert:watermark');
}

/**
 * True when any spec row on the product declares lead-free
 * compliance. Matches loosely so authors can use either a dedicated
 * row (`{label: 'Lead free', value: 'Yes'}`) or a material /
 * compliance row that mentions it (`{label: 'Material', value:
 * 'Lead-free brass'}`).
 */
export function isLeadFree(input: {
  headlineSpecs?: readonly SpecRow[];
  fullSpecs?: readonly SpecRow[];
}): boolean {
  const rows: readonly SpecRow[] = [
    ...(input.headlineSpecs ?? []),
    ...(input.fullSpecs ?? []),
  ];
  const re = /lead[\s-]?free/i;
  return rows.some((row) => re.test(row.label) || re.test(row.value));
}
