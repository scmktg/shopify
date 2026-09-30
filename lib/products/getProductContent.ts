import productData from '@/data/products.json';
import productOverrides from '@/data/product-overrides.json';
import productAdditions from '@/data/product-additions.json';
import squareTankAdditions from '@/data/product-square-tanks.json';
import type { ProductContent, ProductContentMap } from './schema';

function isFileMetaKey(key: string): boolean {
  return key.startsWith('__');
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

const rawMap: Record<string, ProductContent> = {
  ...baseMap,
  ...overrideMap,
  ...additionMap,
  ...squareTankMap,
};

// Strip top-level metadata keys (e.g. `__placeholders`) so loader callers
// never see them as products.
const map: ProductContentMap = Object.fromEntries(
  Object.entries(rawMap).filter(([key]) => !isFileMetaKey(key)),
) as ProductContentMap;

/**
 * Returns the content entry for `handle`, or `null` when none exists.
 */
export function getProductContent(handle: string): ProductContent | null {
  if (isFileMetaKey(handle)) return null;
  return map[handle] ?? null;
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
  const excludePrefix = `${excludeHandle}-`;
  for (const [handle, content] of Object.entries(map)) {
    if (handle === excludeHandle) continue;
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
