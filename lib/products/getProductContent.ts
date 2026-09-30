import productData from '@/data/products.json';
import productOverrides from '@/data/product-overrides.json';
import productAdditions from '@/data/product-additions.json';
import squareTankAdditions from '@/data/product-square-tanks.json';
import dosingPackageAdditions from '@/data/product-dosing-packages.json';
import type { ProductContent, ProductContentMap } from './schema';

function isFileMetaKey(key: string): boolean {
  return key.startsWith('__');
}

const LEGACY_TO_CANONICAL_PRODUCT_HANDLES: Readonly<Record<string, string>> = {
  'chemical-dosing-tank-bunded-50l': 'chemical-dosing-tank-50l',
  'chemical-dosing-tank-bunded-100l': 'chemical-dosing-tank-100l',
  'chemical-dosing-tank-bunded-200l': 'chemical-dosing-tank-200l',
};

export function canonicalProductHandle(handle: string): string {
  return LEGACY_TO_CANONICAL_PRODUCT_HANDLES[handle] ?? handle;
}

/**
 * In-memory accessors over the main product-content map plus small
 * explicit staging layers used while catalogue families are being
 * restructured. Overrides win on handle collision; additions provide
 * content for newly-created Shopify products before they are folded
 * back into the main products.json file.
 */
const baseMap = productData as unknown as Record<string, ProductContent>;
const overrideMap = productOverrides as unknown as Record<string, ProductContent>;
const additionMap = productAdditions as unknown as Record<string, ProductContent>;
const squareTankMap = squareTankAdditions as unknown as Record<string, ProductContent>;
const dosingPackageMap = dosingPackageAdditions as unknown as Record<string, ProductContent>;

const rawMap: Record<string, ProductContent> = {
  ...baseMap,
  ...overrideMap,
  ...additionMap,
  ...squareTankMap,
  ...dosingPackageMap,
};

// The 50L/100L/200L dosing tanks were originally created with `bunded-*`
// handles even though the bunds are now separate products. Keep the content
// source keyed as-is, but expose only the clean Shopify handles to storefront
// callers so canonicals, related-product links and sitemap generation do not
// perpetuate the legacy naming.
const canonicalRawMap: Record<string, ProductContent> = { ...rawMap };
for (const [legacyHandle, canonicalHandle] of Object.entries(
  LEGACY_TO_CANONICAL_PRODUCT_HANDLES,
)) {
  const legacyContent = canonicalRawMap[legacyHandle];
  if (!legacyContent) continue;
  canonicalRawMap[canonicalHandle] = legacyContent;
  delete canonicalRawMap[legacyHandle];
}

// Strip top-level metadata keys (e.g. `__placeholders`) so loader callers
// never see them as products.
const map: ProductContentMap = Object.fromEntries(
  Object.entries(canonicalRawMap).filter(([key]) => !isFileMetaKey(key)),
) as ProductContentMap;

/**
 * Returns the content entry for `handle`, or `null` when none exists.
 */
export function getProductContent(handle: string): ProductContent | null {
  if (isFileMetaKey(handle)) return null;
  return map[canonicalProductHandle(handle)] ?? null;
}

export function getAllProductContent(): ProductContentMap {
  return map;
}

/**
 * Two-step "more in this category" search per the brief:
 *   1. Exact subcategory match (categories[0] AND categories[1]).
 *   2. If fewer than `limit` results, widen to category-only match
 *      (categories[0] only) and dedupe.
 *
 * Excludes `excludeHandle` exactly AND any handle that starts with
 * `${excludeHandle}-` — this catches Shopify-side legacy duplicates
 * like `<handle>-dup2` / `<handle>-old` that share the canonical stem.
 *
 * Returns at most `limit` handles.
 */
export function findRelatedHandles(
  category: string,
  subcategory: string,
  excludeHandle: string,
  limit = 4,
): ReadonlyArray<string> {
  const exact: string[] = [];
  const wider: string[] = [];
  const canonicalExcludeHandle = canonicalProductHandle(excludeHandle);
  const excludePrefix = `${canonicalExcludeHandle}-`;
  for (const [handle, content] of Object.entries(map)) {
    if (handle === canonicalExcludeHandle) continue;
    if (handle.startsWith(excludePrefix)) continue;
    const [c, s] = content.categories;
    if (c !== category) continue;
    if (s === subcategory) {
      exact.push(handle);
    } else {
      wider.push(handle);
    }
  }
  if (exact.length >= limit) return exact.slice(0, limit);
  return [...exact, ...wider].slice(0, limit);
}
