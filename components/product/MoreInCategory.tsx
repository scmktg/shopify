import { findRelatedHandles } from '@/lib/products/getProductContent';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import type { ProductCardData } from '@/types/product';
import { ProductCard } from './ProductCard';

interface MoreInCategoryProps {
  /** Either 'auto' or an explicit list of handles. */
  source: 'auto' | ReadonlyArray<string>;
  category: string;
  subcategory: string;
  currentHandle: string;
  /** Shown above the rail. */
  subcategoryLabel?: string;
  limit?: number;
}

/**
 * "More in this category" rail. Each card is image + title + price +
 * link only — no Add to cart (that's the BoughtTogether rail's job).
 *
 * Two source modes:
 *   - 'auto'  → look up products.json for handles in the same
 *               [category, subcategory] tuple first, fall back to
 *               same-category-only matches if fewer than `limit`,
 *               cap at `limit`, exclude the current handle.
 *   - array   → use the explicit handles verbatim (still hydrates
 *               each from Shopify; missing handles are skipped).
 */
export async function MoreInCategory({
  source,
  category,
  subcategory,
  currentHandle,
  subcategoryLabel,
  limit = 4,
}: MoreInCategoryProps) {
  const handles =
    source === 'auto'
      ? findRelatedHandles(category, subcategory, currentHandle, limit)
      : source.filter((h) => h !== currentHandle).slice(0, limit);

  if (handles.length === 0) return null;

  const fetched = await Promise.all(
    handles.map(async (handle) => {
      try {
        const product = await getProductByHandle(handle);
        if (!product) return null;
        const card: ProductCardData = {
          id: product.id,
          handle: product.handle,
          title: product.title,
          productType: product.productType,
          tags: product.tags,
          featuredImage: product.featuredImage,
          price: product.priceRange.minVariantPrice,
          housingSize: product.metafields.housing_size,
        };
        return card;
      } catch {
        return null;
      }
    }),
  );

  const cards = fetched.filter((c): c is ProductCardData => c !== null);
  if (cards.length === 0) return null;

  const heading = subcategoryLabel
    ? `More ${subcategoryLabel.toLowerCase()}`
    : 'More in this category';

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-semibold text-black tracking-tight">
        {heading}
      </h2>
      <ul
        role="list"
        className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {cards.map((card) => (
          <li key={card.id}>
            <ProductCard product={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
