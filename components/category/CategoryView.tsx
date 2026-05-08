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
  CARTRIDGE_SIZE_OPTIONS,
  getCartridgeSize,
  type CartridgeSize,
} from '@/lib/utils/cartridgeSize';

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
  /**
   * When the visitor is browsing the cartridges category, surface
   * a size-pill filter (10"/20" length × 2.5"/4.5" diameter). The
   * filter is in-memory and reflects only what's currently loaded
   * — paired with a generous pageSize on cartridge routes, all
   * sizes are visible without further fetches.
   */
  enableSizeFilter?: boolean;
}

export function CategoryView({
  initialProducts,
  initialPageInfo,
  query,
  pageSize = 24,
  enableSizeFilter = false,
}: CategoryViewProps) {
  const [products, setProducts] = useState<ReadonlyArray<ProductCardData>>(
    initialProducts,
  );
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo>(initialPageInfo);
  const [sort, setSort] = useState<SortValue>('default');
  const [size, setSize] = useState<CartridgeSize | null>(null);
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

  // Derive size-bucket counts from the currently-loaded products
  // so the filter shows realistic numbers, and dim sizes that have
  // zero matches in the current set.
  const sizeCounts = useMemo(() => {
    if (!enableSizeFilter) return undefined;
    const counts: Record<CartridgeSize, number> = {
      '10x2.5': 0,
      '10x4.5': 0,
      '20x2.5': 0,
      '20x4.5': 0,
    };
    for (const product of products) {
      const detected = getCartridgeSize(product.handle);
      if (detected) counts[detected] += 1;
    }
    return counts;
  }, [enableSizeFilter, products]);

  const visibleProducts = useMemo(() => {
    if (!enableSizeFilter || !size) return products;
    return products.filter(
      (product) => getCartridgeSize(product.handle) === size,
    );
  }, [enableSizeFilter, size, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/*
        Single compact filter strip. On sm+ everything sits on one
        row: size pills (cartridges only) on the left, count + sort
        on the right. Mobile stacks naturally via flex-wrap.
        Result: only ~40px of vertical space above the grid instead
        of three separate ~40px rows.
      */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4 md:mb-6">
        {enableSizeFilter ? (
          <SizeFilter
            value={size}
            onChange={setSize}
            counts={sizeCounts}
          />
        ) : (
          // Spacer keeps the count + sort pinned to the right when
          // the size filter isn't rendered (water-filters, plumbing,
          // pumps, bubblers).
          <span />
        )}

        <div className="flex items-center gap-3 ml-auto">
          <p className="text-xs text-black/60 tabular-nums whitespace-nowrap">
            {visibleProducts.length}{' '}
            {visibleProducts.length === 1 ? 'product' : 'products'}
            {enableSizeFilter && size && ' · filtered'}
          </p>
          <SortDropdown
            value={sort}
            onChange={handleSortChange}
            disabled={isPending}
          />
        </div>
      </div>

      <ProductGrid products={visibleProducts} />

      {visibleProducts.length === 0 && size !== null && (
        <p className="mt-8 text-center text-sm text-black/70">
          No products in this size on the current page.{' '}
          <button
            type="button"
            onClick={() => setSize(null)}
            className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
          >
            Clear filter
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
  );
}

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  disabled: boolean;
}

/**
 * Modern sort dropdown — styled native <select>.
 *
 * Uses `appearance-none` to strip native chrome, layered behind a
 * Lucide ChevronDown for the affordance. Keeps the real <select>
 * underneath so we get keyboard nav, screen-reader labelling, and
 * the native iOS/Android picker on mobile for free.
 */
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
        onChange={(e) => onChange(e.target.value as SortValue)}
        disabled={disabled}
        aria-labelledby="sort-by-label"
        className="appearance-none bg-white border border-gray-300 hover:border-black focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded-full pl-12 pr-8 py-1 text-xs font-medium text-black cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
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
