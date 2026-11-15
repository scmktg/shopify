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

/** Preview rollout for two kitchen mixer taps: WaterMark + Lead Free, licence 032200. */
const WATERMARK_TAP_HANDLES = new Set([
  '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
  'sembowell-pull-out-3way-kitchen-mixer-wels-rated-watermark-certified-aus',
  '3-way-filtered-kitchen-mixer-tap-matte-black-watermark-wels',
  '3-way-filtered-kitchen-mixer-tap-stainless-steel-watermark-wels',
  '3-way-filtered-kitchen-mixer-tap-polished-chrome-watermark-wels',
  '3-way-filtered-kitchen-mixer-tap-brushed-gold-watermark-wels',
]);

export function shouldShowWaterMarkTapBadge(handle: string): boolean {
  return WATERMARK_TAP_HANDLES.has(handle);
}

/**
 * Toilet suites explicitly identified as WaterMark certified in the
 * storefront catalogue. Excludes flush-button accessories.
 * Their gallery badges say WaterMark only (not Lead Free).
 */
const WATERMARK_TOILET_HANDLES = new Set([
  'rimless-watermark-back-to-wall-toilet-soft-close-seat-wels-rated-local-pickup-ce',
  'rimless-watermark-wash-down-toilet-soft-close-seat-wels-rated-local-pickup-centr',
  'toilet-rimless-modern-watermark-ceramic-p-trap-commode-modern-2piece-toilet-wels',
  'back-to-wall-rimless-dual-flush-ceramic-toilet-suite-soft-close-seat-p-trap-wels',
  'in-wall-concealed-cistern-toilet-rimless-floor-mount-pan-chrome-buttons-wels',
]);

export function shouldShowWaterMarkToiletBadge(handle: string): boolean {
  return WATERMARK_TOILET_HANDLES.has(handle);
}
