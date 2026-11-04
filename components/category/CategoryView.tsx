'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { CATEGORIES, findCategory } from '@/content/categories';
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

export type SortValue =
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


  return (
    <section aria-label="Browse products">
      <div className="border-b border-gray-200 bg-slate-50/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {categorySlug && <TypeDropdown categorySlug={categorySlug} activeSubcategory={activeSubcategory} />}
          {groups.length > 0 && (
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

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 md:pt-10 lg:px-8">
      <ActiveFilterChips
        groups={groups}
        value={filters}
        onChange={handleFiltersChange}
        disabled={isPending}
      />

      <div className="min-w-0">

          <ProductGrid products={products} editorial />


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

const menuTriggerClass = 'inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30';

function useCloseDropdown(ref: React.RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref]);
}

export function TypeDropdown({ categorySlug, activeSubcategory }: {
  categorySlug: string;
  activeSubcategory: string | null;
}) {
  const category = findCategory(categorySlug);
  const menuRef = useRef<HTMLDetailsElement>(null);
  useCloseDropdown(menuRef);
  const options = category?.subcategories.map((sub) => ({
    ...sub,
    href: `/${categorySlug}/${sub.slug}/`,
  })) ?? (categorySlug === 'pumps-and-tanks'
    ? [
        { slug: 'pumps', label: 'Pumps', href: '/pumps-and-tanks/pumps/' },
        { slug: 'dosing-tanks', label: 'Dosing Tanks', href: '/pumps-and-tanks/dosing-tanks/' },
        { slug: 'chemical-dosing-tanks', label: 'Chemical Dosing Tanks', href: '/tanks-and-bunds/chemical-dosing-tanks/' },
      ]
    : categorySlug === 'watermark-certified'
      ? CATEGORIES.map((item) => ({ slug: item.slug, label: item.label, href: `/${item.slug}/` }))
      : []);
  if (options.length === 0) return null;
  const baseHref = categorySlug === 'pumps-and-tanks' ? '/tanks-and-bunds/' : `/${categorySlug}/`;
  const selected = options.find((sub) => sub.slug === activeSubcategory);
  return (
    <details ref={menuRef} className="group/type relative">
      <summary className={`${menuTriggerClass} min-w-32 cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
        aria-label={`Type: ${selected?.label ?? 'All products'}`}>
        <span>Type<span className="hidden text-gray-400 sm:inline">{selected ? `: ${selected.label}` : ''}</span></span>
        <ChevronDown size={16} className="shrink-0 text-gray-500 transition-transform group-open/type:rotate-180" aria-hidden="true" />
      </summary>
      <nav aria-label="Choose product type" className="absolute left-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_48px_rgba(15,23,42,0.14)]">
        <Link href={baseHref} aria-current={!selected ? 'page' : undefined}
          className={`flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${!selected ? 'bg-gray-100 font-semibold text-gray-950' : 'text-gray-700 hover:bg-gray-50'}`}>
          All products
          {!selected && <Check size={16} aria-hidden="true" />}
        </Link>
        {options.map((sub) => (
          <Link key={sub.slug} href={sub.href}
            aria-current={sub.slug === activeSubcategory ? 'page' : undefined}
            className={`flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${sub.slug === activeSubcategory ? 'bg-gray-100 font-semibold text-gray-950' : 'text-gray-700 hover:bg-gray-50'}`}>
            {sub.label}
            {sub.slug === activeSubcategory && <Check size={16} aria-hidden="true" />}
          </Link>
        ))}
      </nav>
    </details>
  );
}

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  disabled: boolean;
  allowedValues?: ReadonlyArray<SortValue>;
}

export function SortDropdown({ value, onChange, disabled, allowedValues }: SortDropdownProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  useCloseDropdown(menuRef);
  const selected = SORT_OPTIONS.find((option) => option.value === value);
  return (
    <details ref={menuRef} className="group/sort relative">
      <summary aria-label={`Sort by: ${selected?.label ?? 'Featured'}`}
        className={`${menuTriggerClass} min-w-32 cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        <span>Sort <span className="hidden text-gray-400 sm:inline">· {selected?.label}</span></span>
        <ChevronDown size={16} className="shrink-0 text-gray-500 transition-transform group-open/sort:rotate-180" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_48px_rgba(15,23,42,0.14)]" role="group" aria-label="Sort products">
        {SORT_OPTIONS.filter((option) => !allowedValues || allowedValues.includes(option.value)).map((option) => (
          <button key={option.value} type="button" disabled={disabled}
            onClick={() => { onChange(option.value); if (menuRef.current) menuRef.current.open = false; }}
            aria-pressed={value === option.value}
            className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${value === option.value ? 'bg-gray-100 font-semibold text-gray-950' : 'text-gray-700 hover:bg-gray-50'}`}>
            {option.label}
            {value === option.value && <Check size={16} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </details>
  );
}
