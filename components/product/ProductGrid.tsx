import type { ProductCardData } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ReadonlyArray<ProductCardData>;
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-black/70 py-8">
        No products to show in this category yet.
      </p>
    );
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
