import type { ProductContent } from './schema';

/** Explicit initial rollout; expand only when certification evidence is verified. */
export const CHILLER_WATERMARK_HANDLE = 'stainless-steel-under-counter-drinking-water-chiller-plus-stainless-steel-tap';

const ELIGIBLE_BUBBLER_HANDLES = new Set([
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
  'commercial-rust-free-filtered-cold-water-bubbler-wm',
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
]);

/** Explicit product allowlist and authoritative WaterMark status, not overrideable prose. */
export function shouldShowWaterMarkLeadFreeBadge(
  handle: string,
  content: ProductContent,
): boolean {
  const watermark = content.compliance?.watermark;
  return (
    (ELIGIBLE_BUBBLER_HANDLES.has(handle) || handle === CHILLER_WATERMARK_HANDLE) &&
    watermark?.status === 'certified' &&
    Boolean(watermark.licenceNumber)
  );
}

/** Limited initial catalogue rollout for cards, which do not receive ProductContent. */
export function getInitialBubblerWaterMarkLicence(handle: string): string | null {
  return ELIGIBLE_BUBBLER_HANDLES.has(handle) || handle === CHILLER_WATERMARK_HANDLE ? '23484' : null;
}
