import productData from '@/data/products.json';
import type { ProductContent, ProductContentMap } from './schema';

function isFileMetaKey(key: string): boolean {
  return key.startsWith('__');
}

/**
 * In-memory accessors over `data/products.json`.
 *
 * The JSON is bundled into the module graph at build time via the
 * static import above — there is no runtime fs read, no async work,
 * and no cache to invalidate. If the file changes you ship a new
 * build (which is the same workflow as updating any other file in
 * the repo). Build-time validation lives in `lib/products/validator.ts`
 * and is wired to `npm run validate:products` + `prebuild`.
 *
 * Usage rule: this is the only sanctioned entry point for product
 * content (description, categories, specs, compliance, upsells,
 * SEO). The Shopify GraphQL fragment still ships content fields
 * for legacy reasons, but the storefront does not read them — see
 * the boundary documented in `lib/products/schema.ts`.
 */

const rawMap = productData as unknown as Record<string, ProductContent>;
// Strip top-level metadata keys (e.g. `__placeholders`) so loader
// callers never see them as products. The validator already skips
// them; this keeps the runtime shape consistent.
const map: ProductContentMap = Object.fromEntries(
  Object.entries(rawMap).filter(([key]) => !isFileMetaKey(key)),
) as ProductContentMap;

/**
 * Returns the content entry for `handle`, or `null` when none
 * exists. Pages should call `notFound()` when the entry is missing
 * — a Shopify product without a corresponding products.json entry
 * is a build-failure case, not a render-with-blanks case.
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
 * Always excludes `excludeHandle`. Returns at most `limit` handles.
 */
export function findRelatedHandles(
  category: string,
  subcategory: string,
  excludeHandle: string,
  limit = 4,
): ReadonlyArray<string> {
  const exact: string[] = [];
  const wider: string[] = [];
  for (const [handle, content] of Object.entries(map)) {
    if (handle === excludeHandle) continue;
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
