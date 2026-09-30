import type { ProductContentMap } from './schema';

export interface ShopifyCategoryProduct {
  handle: string;
  tags: ReadonlyArray<string>;
}

export interface ShopifyCategoryMismatch {
  handle: string;
  expectedPrimary: string;
  expectedSubcategory: string;
  primaryTags: ReadonlyArray<string>;
  subcategoryTags: ReadonlyArray<string>;
  issues: ReadonlyArray<string>;
}

/**
 * Ensures Shopify's category tags cannot drift away from the canonical
 * code-side product categories that drive PDP URLs and breadcrumbs.
 *
 * A product must have exactly one primary-cat:* tag and it must match
 * categories[0]. Products may intentionally belong to multiple subcategory
 * PLPs, so extra sub-cat:* tags are allowed, but categories[1] must always be
 * present among them.
 */
export function validateShopifyCategoryTags(
  contentMap: ProductContentMap,
  shopifyProducts: ReadonlyArray<ShopifyCategoryProduct>,
): ReadonlyArray<ShopifyCategoryMismatch> {
  const mismatches: ShopifyCategoryMismatch[] = [];

  for (const product of shopifyProducts) {
    const content = contentMap[product.handle];
    if (!content) continue;

    const [expectedPrimary, expectedSubcategory] = content.categories;
    const primaryTags = product.tags
      .filter((tag) => tag.startsWith('primary-cat:'))
      .map((tag) => tag.slice('primary-cat:'.length));
    const subcategoryTags = product.tags
      .filter((tag) => tag.startsWith('sub-cat:'))
      .map((tag) => tag.slice('sub-cat:'.length));

    const issues: string[] = [];

    if (primaryTags.length !== 1) {
      issues.push(
        `expected exactly one primary-cat:* tag, found ${primaryTags.length}`,
      );
    }
    if (!primaryTags.includes(expectedPrimary)) {
      issues.push(`missing primary-cat:${expectedPrimary}`);
    }
    if (!subcategoryTags.includes(expectedSubcategory)) {
      issues.push(`missing sub-cat:${expectedSubcategory}`);
    }

    if (issues.length > 0) {
      mismatches.push({
        handle: product.handle,
        expectedPrimary,
        expectedSubcategory,
        primaryTags,
        subcategoryTags,
        issues,
      });
    }
  }

  return mismatches;
}
