import type { ProductContent, ProductContentMap } from './schema';

const catalogData = require('./catalog-data.cjs') as {
  canonicalProductHandle: (handle: string) => string;
  productCatalog: Record<string, ProductContent>;
};

export const canonicalProductHandle = catalogData.canonicalProductHandle;
const map = catalogData.productCatalog as ProductContentMap;

/**
 * Returns the content entry for `handle`, or `null` when none exists.
 */
export function getProductContent(handle: string): ProductContent | null {
  if (handle.startsWith('__')) return null;
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
