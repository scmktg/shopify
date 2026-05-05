const PRIMARY_PREFIX = 'primary-cat:';
const SUB_PREFIX = 'sub-cat:';

/**
 * Derives the canonical product URL from a product's tags. Every product
 * is expected to carry exactly one `primary-cat:<slug>` and one
 * `sub-cat:<slug>` tag (per docs/03-data-model.md). When a tag is
 * missing we fall back to a top-level handle URL — that path will 404,
 * which surfaces the data-quality issue rather than hiding it.
 */
export function getProductUrl(
  tags: ReadonlyArray<string>,
  handle: string,
): string {
  const category = findTagValue(tags, PRIMARY_PREFIX);
  const subcategory = findTagValue(tags, SUB_PREFIX);
  if (category && subcategory) {
    return `/${category}/${subcategory}/${handle}/`;
  }
  return `/${handle}/`;
}

export function getProductCategoryTags(
  tags: ReadonlyArray<string>,
): { category: string | null; subcategory: string | null } {
  return {
    category: findTagValue(tags, PRIMARY_PREFIX),
    subcategory: findTagValue(tags, SUB_PREFIX),
  };
}

export function isWatermarkCertified(tags: ReadonlyArray<string>): boolean {
  return tags.includes('cert:watermark');
}

function findTagValue(
  tags: ReadonlyArray<string>,
  prefix: string,
): string | null {
  const match = tags.find((tag) => tag.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}
