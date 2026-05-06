/**
 * Schema for entries in `data/products.json`.
 *
 * Source-of-truth split (locked): Shopify owns commerce primitives —
 * title, price/compareAtPrice, stock, shipping, images, variants, sku,
 * handle. Everything else (description, categories, specs, compliance,
 * upsells, SEO) lives in `data/products.json` and is rendered through
 * the `getProductContent(handle)` helper. The storefront does not
 * read content fields from Shopify even when populated — see
 * `lib/products/getProductContent.ts`.
 *
 * Edits to product copy or specifications go in `data/products.json`,
 * never in component files. The validator (`lib/products/validator.ts`)
 * enforces the schema at build time via `npm run validate:products`.
 */

/** A `[label, value]` row used in headlineSpecs and fullSpecs. */
export interface SpecRow {
  label: string;
  value: string;
}

/**
 * WaterMark certification block. Render rules (enforced in the
 * component layer, not the schema):
 *   - status === 'certified'   → blue badge + caption (licence,
 *                                  certifier, validUntil — each shown
 *                                  only when set)
 *   - status === 'pending'     → amber badge, no caption
 *   - status === 'not_required'/'not_certified' → render nothing
 *
 * The validator flags `status: 'certified'` with `licenceNumber: null`
 * as an error — a launch-blocker check before publishing.
 */
export type WatermarkStatus =
  | 'certified'
  | 'pending'
  | 'not_required'
  | 'not_certified';

export interface WatermarkInfo {
  status: WatermarkStatus;
  licenceNumber: string | null;
  certifier: string | null;
  /** ISO date `YYYY-MM-DD`. */
  validUntil: string | null;
}

export interface ProductCompliance {
  watermark?: WatermarkInfo | null;
  /**
   * Reserved for a future WELS shape mirroring WatermarkInfo. Kept as
   * an explicit `null` placeholder so existing entries don't need to
   * change when WELS is added — the validator accepts only `null`
   * today and will be widened when the rendering work happens.
   */
  wels?: null;
  /**
   * Markdown — same subset and renderer as `description`
   * (paragraphs, bold, italic, unordered lists). Kept short:
   * one or two sentences of human-authored compliance context.
   */
  note?: string | null;
}

export interface ProductCtas {
  /** Defaults to "Add to cart" when null/missing. */
  primary?: string | null;
  /** Renders as a less-prominent button when set; null/missing → no second CTA. */
  secondary?: string | null;
}

export interface ProductUpsells {
  /**
   * Explicit list of related-product handles. Empty array or missing
   * field hides the "Frequently bought together" rail entirely.
   */
  boughtTogether?: readonly string[];
  /**
   * `'auto'` populates from category overlap (exact subcategory match
   * preferred, then fall back to category-only match, capped at 4,
   * excluding the current product). An explicit array of handles
   * overrides the auto behaviour.
   */
  moreInCategory?: 'auto' | readonly string[];
}

export interface ProductSeoOverrides {
  title?: string;
  description?: string;
  /** Absolute URL or null to fall back to the product's first image. */
  ogImage?: string | null;
}

/**
 * Full content payload for a single product, keyed by Shopify handle
 * in `data/products.json`. All fields except `categories` are
 * optional; sections render conditionally on presence.
 */
export interface ProductContent {
  /**
   * Required tuple `[primaryCategory, subcategory]` matching the URL
   * `/[category]/[subcategory]/[handle]/`. Both slugs must exist in
   * `content/categories.ts` (validated at build time).
   */
  categories: readonly [string, string];
  tags?: readonly string[];
  shortDescription?: string;
  /**
   * Markdown body. Subset enforced by `lib/products/markdown.ts`:
   * paragraphs, bold, italic, and unordered lists only.
   */
  description?: string;
  features?: readonly string[];
  /** Hard cap of 4 — entries beyond the fourth are dropped with a dev warning. */
  headlineSpecs?: readonly SpecRow[];
  /** Unlimited; renders as a two-column table. */
  fullSpecs?: readonly SpecRow[];
  recommendedFor?: readonly string[];
  compliance?: ProductCompliance;
  ctas?: ProductCtas;
  upsells?: ProductUpsells;
  seo?: ProductSeoOverrides;
}

export type ProductContentMap = Readonly<Record<string, ProductContent>>;

export const HEADLINE_SPECS_LIMIT = 4 as const;
