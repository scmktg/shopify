/**
 * Shared facts for the Whole House Water Filter Installation Package.
 *
 * Sourced from the on-page contract in
 * `app/whole-house-installation-package/page.tsx`. Pulled out so the
 * package's price, product handle, and path live in one place — the
 * homepage hero card, the dedicated landing page, and the
 * `/water-filters/whole-house/` subcategory editorial body all read
 * from here.
 *
 * Edit values here and rebuild — no editorial content needs touching
 * when the price moves.
 */
export const INSTALL_PACKAGE = {
  /** Public path of the dedicated landing page. */
  path: '/whole-house-installation-package/',
  /** Shopify handle for the underlying WaterMark-certified system. */
  productHandle:
    'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
  /** Canonical path of the underlying product page. */
  productPath:
    '/water-filters/whole-house/wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system/',
  /** Bundled price (system + install), AUD, inc. GST. */
  priceAud: 2299,
  /** Standalone product price, AUD, inc. GST. */
  productPriceAud: 1199.95,
  /** Install component, AUD, inc. GST. */
  installPriceAud: 1099.05,
  /** Service area for the fixed-price offer. */
  areaServed: 'Central Coast NSW',
} as const;
