import type { ProductContent } from './schema';

/** Explicit initial rollout; expand only when certification evidence is verified. */
const ELIGIBLE_BUBBLER_HANDLES = new Set([
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
  'commercial-rust-free-filtered-cold-water-bubbler-wm',
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
]);

/** Require both the allowlist and existing catalogue compliance evidence. */
export function shouldShowWaterMarkLeadFreeBadge(
  handle: string,
  content: ProductContent,
): boolean {
  const watermark = content.compliance?.watermark;
  return (
    ELIGIBLE_BUBBLER_HANDLES.has(handle) &&
    watermark?.status === 'certified' &&
    Boolean(watermark.licenceNumber) &&
    /\\blead[ -]?free\\b/i.test(content.compliance?.note ?? '')
  );
}
