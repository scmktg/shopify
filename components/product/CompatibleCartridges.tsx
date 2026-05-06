import { getProducts } from '@/lib/shopify/queries/getProducts';
import type { ProductCardData } from '@/types/product';
import { ProductCard } from './ProductCard';

interface CompatibleCartridgesProps {
  /** The system's housing_size metafield, e.g. '20x4.5' or '10x2.5'. */
  housingSize: string | null;
  /** Hide the system itself if it shows up in the cartridges feed. */
  excludeHandle?: string;
  limit?: number;
}

export async function CompatibleCartridges({
  housingSize,
  excludeHandle,
  limit = 6,
}: CompatibleCartridgesProps) {
  if (!housingSize) return null;

  // Over-fetch then filter in code — Shopify Storefront API doesn't
  // expose a clean `metafield:` filter on `products()` in 2026-04
  // and we only have ~9–10 cartridges per housing size.
  const { products } = await getProducts({
    query: `tag:'primary-cat:cartridges'`,
    first: 50,
  });

  const matches = products
    .filter(
      (p): p is ProductCardData =>
        p.housingSize === housingSize && p.handle !== excludeHandle,
    )
    .slice(0, limit);

  if (matches.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-black">
        Replacement cartridges that fit this system
      </h2>
      <p className="mt-2 text-sm text-black/70">
        All {housingSize} compatible — same wholesale price for everyone.
      </p>
      <ul
        role="list"
        className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
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
