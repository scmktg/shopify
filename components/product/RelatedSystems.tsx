import { getProducts } from '@/lib/shopify/queries/getProducts';
import { ProductCard } from './ProductCard';

interface RelatedSystemsProps {
  category: string;
  subcategory: string;
  /** Display label for the sub-category (e.g. 'Whole House'). */
  subcategoryLabel: string;
  /** Current product handle to exclude from the list. */
  currentHandle: string;
  limit?: number;
}

export async function RelatedSystems({
  category,
  subcategory,
  subcategoryLabel,
  currentHandle,
  limit = 4,
}: RelatedSystemsProps) {
  const { products } = await getProducts({
    query: `tag:'primary-cat:${category}' AND tag:'sub-cat:${subcategory}'`,
    first: 12,
    sortKey: 'BEST_SELLING',
  });

  const matches = products
    .filter((p) => p.handle !== currentHandle)
    .slice(0, limit);

  if (matches.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-black">
        More {subcategoryLabel.toLowerCase()} systems
      </h2>
      <ul
        role="list"
        className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {matches.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
