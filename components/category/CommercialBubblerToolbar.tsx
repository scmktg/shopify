'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { CatalogFilters } from './CatalogFilters';
import { SortDropdown, TypeDropdown, type SortValue } from './CategoryView';
import type { CatalogFilterGroup, CatalogFilterState } from '@/lib/catalog/filters';

const CABINET_GROUP: CatalogFilterGroup = {
  id: 'cabinet',
  param: 'cabinet',
  label: 'Cabinet style',
  multiple: true,
  options: [
    { value: 'round', label: 'Round stainless steel', query: '' },
    { value: 'square', label: 'Square stainless steel', query: '' },
    { value: 'hdpe', label: 'HDPE design', query: '' },
  ],
};

export function CommercialBubblerToolbar({
  selectedCabinets,
  sort,
  count,
}: {
  selectedCabinets: ReadonlyArray<string>;
  sort: SortValue;
  count: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const change = (cabinet: ReadonlyArray<string>, nextSort: SortValue) => {
    const params = new URLSearchParams();
    if (cabinet.length) params.set('cabinet', cabinet.join(','));
    if (nextSort !== 'default') params.set('sort', nextSort);
    startTransition(() => {
      router.replace(`/commercial-water-bubblers/${params.size ? `?${params.toString()}` : ''}`, { scroll: false });
    });
  };
  const state: CatalogFilterState = selectedCabinets.length ? { cabinet: selectedCabinets } : {};

  return (
    <div className="border-b border-gray-200 bg-slate-50/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-sm font-medium tabular-nums text-gray-600">
          {count} {count === 1 ? 'product' : 'products'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <TypeDropdown categorySlug="bubblers-and-coolers" activeSubcategory="bubblers" />
          <CatalogFilters
            groups={[CABINET_GROUP]}
            value={state}
            onChange={(next) => change(next.cabinet ?? [], sort)}
            resultCount={count}
            disabled={pending}
          />
          <SortDropdown value={sort} onChange={(next) => change(selectedCabinets, next)} disabled={pending} allowedValues={['default', 'price-asc', 'price-desc']} />
        </div>
      </div>
    </div>
  );
}
