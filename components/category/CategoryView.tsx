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
  defaultProductOrder?: ReadonlyArray<string>;
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
  defaultProductOrder = [],
}: CategoryViewProps) {
  const groups = useMemo(
    () =>
      categorySlug
        ? getCatalogFilterGroups(categorySlug, activeSubcategory)
        : [],
    [categorySlug, activeSubcategory],
  );
  const defaultOrder = useMemo(
    () => new Map(defaultProductOrder.map((handle, index) => [handle, index])),
    [defaultProductOrder],
  );
  // Under-sink products default to increasing filtration stage count.
  // Products without a clear stage count follow the staged products.
  const isUnderSink = categorySlug === 'water-filters' && activeSubcategory === 'under-sink';
  const getStageCount = (product: ProductCardData): number => {
    const match = product.title.match(/\\b(\\d{1,2})[\\s-]*stages?\\b/i)
      ?? product.title.match(/\\b(\\d{1,2})[\\s-]*stage\\b/i);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };

  const applyDefaultOrder = (
    items: ReadonlyArray<ProductCardData>,
    nextSort: SortValue,
  ): ReadonlyArray<ProductCardData> => {
    if (nextSort !== 'default') return items;
    if (isUnderSink) {
      return [...items].sort((a, b) =>
        getStageCount(a) - getStageCount(b) || a.title.localeCompare(b.title),
      );
    }
    if (defaultOrder.size === 0) return items;
    return [...items].sort((a, b) => {
      const aRank = defaultOrder.get(a.handle) ?? Number.MAX_SAFE_INTEGER;
      const bRank = defaultOrder.get(b.handle) ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
  };

  const [products, setProducts] = useState<ReadonlyArray<ProductCardData>>(
    applyDefaultOrder(initialProducts, 'default'),
  );
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo>(initialPageInfo);
  const [filters, setFilters] = useState<CatalogFilterState>(initialFilters);
  const [sort, setSort] = useState<SortValue>('default');
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
          setProducts(applyDefaultOrder(page.products, nextSort));
          setPageInfo(page.pageInfo);
        } catch {
          setError('Could not update results. Please try again.');
        }
      })();
    });
  };

  const handleFiltersChange = (next: CatalogFilterState) => {
    setFilters(next);
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
          setProducts((previous) =>
            applyDefaultOrder([...previous, ...page.products], sort),
          );
          setPageInfo(page.pageInfo);
        } catch {
          setError('Could not load more products. Please try again.');
        }
      })();
    });
  };

  // Keep the catalogue focused: on-demand filters for larger collections,
  // simple category navigation and sorting for small ranges.
  const showAdvancedFilters = groups.length > 0 && (
    initialPageInfo.hasNextPage ||
    initialProducts.length > pageSize ||
    Object.values(filters).some((selected) => selected.length > 0)
  );


  return (
    <section aria-label="Browse products">
      <div className="border-b border-gray-200 bg-slate-50/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-sm font-medium tabular-nums text-gray-600">
          {products.length}{pageInfo.hasNextPage ? '+' : ''} {products.length === 1 && !pageInfo.hasNextPage ? 'product' : 'products'}
        </p>
        <div className="flex items-center gap-3">
          {showAdvancedFilters && (
            <CatalogFilters
              groups={groups}
              value={filters}
              onChange={handleFiltersChange}
              resultCount={products.length}
              hasMore={pageInfo.hasNextPage}
              disabled={isPending}
            />
          )}
          <SortDropdown value={sort} onChange={handleSortChange} disabled={isPending} />
        </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <ActiveFilterChips
        groups={groups}
        value={filters}
        onChange={handleFiltersChange}
        disabled={isPending}
      />

      <div className="min-w-0">

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
      </div>
    </section>
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
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-gray-500"
      >
        Sort
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortValue)}
        disabled={disabled}
        aria-labelledby="sort-by-label"
        className="min-h-10 appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-12 pr-9 text-sm font-medium text-gray-900 transition-colors hover:border-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
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
