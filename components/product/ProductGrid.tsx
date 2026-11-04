import type { ProductCardData } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ProductListTracker } from '@/components/analytics/ProductListTracker';

interface ProductGridProps {
  products: ReadonlyArray<ProductCardData>;
  editorial?: boolean;
}

export function ProductGrid({ products, editorial = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-black/70 py-8">
        No products to show in this category yet.
      </p>
    );
  }

  return (
    <>
    <ProductListTracker products={products} />
    <ul
      role="list"
      className={editorial ? "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:gap-x-8" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"}
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} editorial={editorial} />
        </li>
      ))}
    </ul>
    </>
  );
}
