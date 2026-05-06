import { getProductContent } from '@/lib/products/getProductContent';

/**
 * Derives the canonical product URL from a product handle by looking
 * up its `categories` tuple in `data/products.json` (the single
 * source of truth for category routing). When the handle has no
 * entry we fall back to a top-level handle URL — that path will 404,
 * which surfaces the data-quality issue rather than hiding it.
 *
 * Pre-refactor this helper read Shopify tags; that path is gone with
 * the universal Shopify boundary (Shopify owns commerce primitives
 * only).
 */
export function getProductUrl(handle: string): string {
  const content = getProductContent(handle);
  if (content) {
    const [category, subcategory] = content.categories;
    return `/${category}/${subcategory}/${handle}/`;
  }
  return `/${handle}/`;
}

export interface ProductCategoryPair {
  category: string | null;
  subcategory: string | null;
}

/**
 * Returns the [category, subcategory] pair for a handle, or nulls
 * when the handle is unknown to `products.json`. Used by the route
 * to validate URL → product alignment, and by the Compatible /
 * BoughtTogether rails to filter by category.
 */
export function getProductCategories(handle: string): ProductCategoryPair {
  const content = getProductContent(handle);
  if (!content) return { category: null, subcategory: null };
  return {
    category: content.categories[0],
    subcategory: content.categories[1],
  };
}
