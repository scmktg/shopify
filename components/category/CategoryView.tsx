'use client';

import { useState, useTransition } from 'react';
import {
  getProducts,
  type ProductSortKey,
} from '@/lib/shopify/queries/getProducts';
import type { ProductCardData } from '@/types/product';
import type { ShopifyPageInfo } from '@/types/shopify';
import { ProductGrid } from '@/components/product/ProductGrid';

type SortValue =
  | 'default'
  | 'newest'
  | 'best-selling'
  | 'price-asc'
  | 'price-desc';

interface SortDef {
  value: SortValue;
  label: string;
  sortKey: ProductSortKey | null;
  reverse: boolean;
}

const SORT_OPTIONS: ReadonlyArray<SortDef> = [
  { value: 'default', label: 'Featured', sortKey: null, reverse: false },
  { value: 'newest', label: 'Newest', sortKey: 'CREATED_AT', reverse: true },
  {
    value: 'best-selling',
    label: 'Best selling',
    sortKey: 'BEST_SELLING',
    reverse: false,
  },
  {
    value: 'price-asc',
    label: 'Price: low to high',
    sortKey: 'PRICE',
    reverse: false,
  },
  {
    value: 'price-desc',
    label: 'Price: high to low',
    sortKey: 'PRICE',
    reverse: true,
  },
];

interface CategoryViewProps {
  initialProducts: ReadonlyArray<ProductCardData>;
  initialPageInfo: ShopifyPageInfo;
  query: string;
  pageSize?: number;
}

export function CategoryView({
  initialProducts,
  initialPageInfo,
  query,
  pageSize = 24,
}: CategoryViewProps) {
  const [products, setProducts] = useState<ReadonlyArray<ProductCardData>>(
    initialProducts,
  );
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo>(initialPageInfo);
  const [sort, setSort] = useState<SortValue>('default');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSortChange = (value: SortValue) => {
    setSort(value);
    setError(null);
    const opt = SORT_OPTIONS.find((o) => o.value === value);
    if (!opt) return;
    startTransition(() => {
      void (async () => {
        try {
          const page = await getProducts({
            query,
            first: pageSize,
            sortKey: opt.sortKey ?? undefined,
            reverse: opt.reverse,
          });
          setProducts(page.products);
          setPageInfo(page.pageInfo);
        } catch {
          setError('Could not update results. Please try again.');
        }
      })();
    });
  };

  const handleLoadMore = () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;
    setError(null);
    const opt = SORT_OPTIONS.find((o) => o.value === sort);
    if (!opt) return;
    startTransition(() => {
      void (async () => {
        try {
          const page = await getProducts({
            query,
            first: pageSize,
            after: pageInfo.endCursor,
            sortKey: opt.sortKey ?? undefined,
            reverse: opt.reverse,
          });
          setProducts((prev) => [...prev, ...page.products]);
          setPageInfo(page.pageInfo);
        } catch {
          setError('Could not load more products. Please try again.');
        }
      })();
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="text-sm text-black/70">
          {products.length}{' '}
          {products.length === 1 ? 'product' : 'products'} shown
        </p>
        <label className="text-sm text-black inline-flex items-center gap-2">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortValue)}
            disabled={isPending}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ProductGrid products={products} />

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {error}
        </p>
      )}

      {pageInfo.hasNextPage && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="inline-flex items-center justify-center bg-white border border-black text-black font-semibold px-6 py-3 rounded hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
