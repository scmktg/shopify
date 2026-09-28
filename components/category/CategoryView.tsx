'use client';

import { useMemo, useState, useTransition } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  getProducts,
  type ProductSortKey,
} from '@/lib/shopify/queries/getProducts';
import type { ProductCardData } from '@/types/product';
import type { ShopifyPageInfo } from '@/types/shopify';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SizeFilter } from './SizeFilter';
import {
  getProductCartridgeSize,
  type CartridgeSize,
} from '@/lib/utils/cartridgeSize';
import {
  ActiveFilterChips,
  CatalogFilters,
} from './CatalogFilters';
import {
  buildCatalogQuery,
  getCatalogFilterGroups,
  type CatalogFilterState,
} from '@/lib/catalog/filters';

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
  categorySlug?: string | null;
  activeSubcategory?: string | null;
  initialFilters?: CatalogFilterState;
  pageSize?: number;
  enableSizeFilter?: boolean;
}

export function CategoryView({
  initialProducts,
  initialPageInfo,
  query,
  categorySlug = null,
  activeSubcategory = null,
  initialFilters = {},
  pageSize = 24,
  enableSizeFilter = false,
}: CategoryViewProps) {
  const groups = useMemo(
    () =>
      categorySlug
        ? getCatalogFilterGroups(categorySlug, activeSubcategory)
        : [],
    [categorySlug, activeSubcategory],
  );
  const [products, setProducts] = useState<ReadonlyArray<ProductCardData>>(
    initialProducts,
  );
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo>(initialPageInfo);
  const [filters, setFilters] = useState<CatalogFilterState>(initialFilters);
  const [sort, setSort] = useState<SortValue>('default');
  const [size, setSize] = useState<CartridgeSize | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentQuery = useMemo(
    () => buildCatalogQuery(query, groups, filters),
    [query, groups, filters],
  );

  const syncFilterUrl = (next: CatalogFilterState) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('after');

    for (const group of groups) {
      const selected = next[group.id] ?? [];
      if (selected.length > 0) {
        url.searchParams.set(group.param, selected.join(','));
      } else {
        url.searchParams.delete(group.param);
      }
    }

    window.history.replaceState(null, '', url.toString());
  };

  const fetchFirstPage = (
    nextFilters: CatalogFilterState,
    nextSort: SortValue = sort,
  ) => {
    const opt = SORT_OPTIONS.find((option) => option.value === nextSort);
    if (!opt) return;

    setError(null);
    startTransition(() => {
      void (async () => {
        try {
          const filteredQuery = buildCatalogQuery(query, groups, nextFilters);
          const page = await getProducts({
            query: filteredQuery,
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

  const handleFiltersChange = (next: CatalogFilterState) => {
    setFilters(next);
    setSize(null);
    syncFilterUrl(next);
    fetchFirstPage(next);
  };

  const handleSortChange = (value: SortValue) => {
    setSort(value);
    fetchFirstPage(filters, value);
  };

  const handleLoadMore = () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;
    const opt = SORT_OPTIONS.find((option) => option.value === sort);
    if (!opt) return;

    setError(null);
    startTransition(() => {
      void (async () => {
        try {
          const page = await getProducts({
            query: currentQuery,
            first: pageSize,
            after: pageInfo.endCursor,
            sortKey: opt.sortKey ?? undefined,
            reverse: opt.reverse,
          });
          setProducts((previous) => [...previous, ...page.products]);
          setPageInfo(page.pageInfo);
        } catch {
          setError('Could not load more products. Please try again.');
        }
      })();
    });
  };

  const sizeCounts = useMemo(() => {
    if (!enableSizeFilter) return undefined;
    const counts: Record<CartridgeSize, number> = {
      '10x2': 0,
      '10x2.5': 0,
      '10x4.5': 0,
      '20x2.5': 0,
      '20x4.5': 0,
    };
    for (const product of products) {
      const detected = getProductCartridgeSize(product);
      if (detected) counts[detected] += 1;
    }
    return counts;
  }, [enableSizeFilter, products]);

  const visibleProducts = useMemo(() => {
    if (!enableSizeFilter || !size) return products;
    return products.filter(
      (product) => getProductCartridgeSize(product) === size,
    );
  }, [enableSizeFilter, size, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4 md:mb-6">
        {enableSizeFilter ? (
          <SizeFilter
            value={size}
            onChange={setSize}
            counts={sizeCounts}
          />
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3 ml-auto">
          <p className="hidden text-xs text-black/60 tabular-nums whitespace-nowrap lg:block">
            {visibleProducts.length}
            {pageInfo.hasNextPage ? '+' : ''}{' '}
            {visibleProducts.length === 1 && !pageInfo.hasNextPage
              ? 'product'
              : 'products'}
          </p>
          <SortDropdown
            value={sort}
            onChange={handleSortChange}
            disabled={isPending}
          />
        </div>
      </div>

      <ActiveFilterChips
        groups={groups}
        value={filters}
        onChange={handleFiltersChange}
        disabled={isPending}
      />

      <div className="lg:flex lg:items-start lg:gap-8">
        <CatalogFilters
          groups={groups}
          value={filters}
          onChange={handleFiltersChange}
          resultCount={visibleProducts.length}
          hasMore={pageInfo.hasNextPage}
          disabled={isPending}
        />

        <div className="min-w-0 flex-1">
          <ProductGrid products={visibleProducts} />

          {visibleProducts.length === 0 && size !== null && (
            <p className="mt-8 text-center text-sm text-black/70">
              No products in this size on the current page.{' '}
              <button
                type="button"
                onClick={() => setSize(null)}
                className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
              >
                Clear size filter
              </button>
              .
            </p>
          )}

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
      </div>
    </div>
  );
}

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  disabled: boolean;
}

function SortDropdown({ value, onChange, disabled }: SortDropdownProps) {
  return (
    <div className="relative inline-flex items-center">
      <span
        id="sort-by-label"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-black/55 pointer-events-none"
      >
        Sort
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortValue)}
        disabled={disabled}
        aria-labelledby="sort-by-label"
        className="appearance-none bg-white border border-gray-300 hover:border-black focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded-full pl-12 pr-8 py-1 text-xs font-medium text-black cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-black/60"
        aria-hidden="true"
      />
    </div>
  );
}
