import type { Metadata } from 'next';
import { searchProducts } from '@/lib/shopify/queries/searchProducts';
import { ProductGrid } from '@/components/product/ProductGrid';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search products across the Enviro Aqua catalogue.',
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const trimmed = q.trim();
  const results = trimmed.length >= 2 ? await searchProducts(trimmed, 24) : [];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-black">
        {trimmed ? `Results for "${trimmed}"` : 'Search'}
      </h1>
      <p className="mt-2 text-sm text-black/70">
        {trimmed.length < 2
          ? 'Use the search bar at the top of the page to find products.'
          : `${results.length} ${results.length === 1 ? 'product' : 'products'} found.`}
      </p>

      {results.length > 0 && (
        <div className="mt-8">
          <ProductGrid products={results} />
        </div>
      )}
    </section>
  );
}
