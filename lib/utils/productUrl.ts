import {
  canonicalProductHandle,
  getProductContent,
} from '@/lib/products/getProductContent';

/**
 * Derives the canonical product URL from a product handle by looking
 * up its `categories` tuple in the product-content map (the single
 * source of truth for category routing). Legacy handles are normalized
 * first so internal recommendations never link through a redirect.
 *
 * Canonical site URLs are slashless. Keeping the internal-link helper
 * slashless prevents every product card / cross-sell / family link from
 * first hitting Next's trailing-slash redirect before reaching the PDP.
 *
 * When a product has no custom content entry, link to the Shopify-backed
 * product route. This lets newly published products work immediately without
 * waiting for a matching GitHub page.
 */
export function getProductUrl(handle: string): string {
  const canonicalHandle = canonicalProductHandle(handle);
  const content = getProductContent(canonicalHandle);
  if (content) {
    const [category, subcategory] = content.categories;
    return `/${category}/${subcategory}/${canonicalHandle}`;
  }
  return `/products/${canonicalHandle}`;
}

export interface ProductCategoryPair {
  category: string | null;
  subcategory: string | null;
}

/**
 * Returns the [category, subcategory] pair for a handle, or nulls
 * when the handle is unknown to the product-content map. Used by the route
 * to validate URL → product alignment, and by the Compatible /
 * BoughtTogether rails to filter by category.
 */
export function getProductCategories(handle: string): ProductCategoryPair {
  const content = getProductContent(canonicalProductHandle(handle));
  if (!content) return { category: null, subcategory: null };
  return {
    category: content.categories[0],
    subcategory: content.categories[1],
  };
}
