/**
 * Deliberate storefront merchandising order.
 *
 * Product handles are stable Shopify identifiers; this order applies to the
 * combined Fountains & Coolers range and each of its subcategories.
 * Unlisted products follow after these models in their existing order.
 */
export const FOUNTAINS_AND_COOLERS_ORDER = [
  // Drinking fountains
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
  'commercial-rust-free-filtered-cold-water-bubbler-wm',
  // Coolers and chillers
  'stainless-steel-under-counter-drinking-water-chiller-plus-stainless-steel-tap',
  'bench-top-room-temperature-hot-and-cold-water-cooler-direct-connect',
  'direct-connect-water-cooler-dispenser-3stages-filter-hot-cold-and-room-temperatu',
] as const;
