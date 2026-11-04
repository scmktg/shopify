'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import type { ProductCardData } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortDropdown, type SortValue } from '@/components/category/CategoryView';
import {
  KITCHEN_TAP_GROUPS,
  KITCHEN_TAP_GROUP_HANDLES,
  isKitchenTapGroup,
} from '@/content/kitchen-tap-groups';

const MENU_CLASS =
  'absolute left-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_48px_rgba(15,23,42,0.14)]';
const TRIGGER_CLASS =
  'inline-flex min-h-11 min-w-32 cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 [&::-webkit-details-marker]:hidden';

interface Props {
  products: ReadonlyArray<ProductCardData>;
  selectedType?: string;
}

export function KitchenTapResults({ products, selectedType }: Props) {
  const chosen = isKitchenTapGroup(selectedType) ? selectedType : null;
  const [sort, setSort] = useState<SortValue>('default');
  const typeRef = useRef<HTMLDetailsElement>(null);

  const displayed = useMemo(() => {
    const handles = chosen ? new Set(KITCHEN_TAP_GROUP_HANDLES[chosen]) : null;
    const list = handles ? products.filter((product) => handles.has(product.handle)) : [...products];

    if (sort === 'price-asc') return list.sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    if (sort === 'price-desc') return list.sort((a, b) => Number(b.price.amount) - Number(a.price.amount));
    return list;
  }, [products, chosen, sort]);

  const selectedLabel = KITCHEN_TAP_GROUPS.find((group) => group.value === chosen)?.label;

  return (
    <section aria-label="Browse kitchen taps">
      <div className="relative z-20 border-b border-slate-200 bg-white xl:-mt-[88px] xl:h-[88px] xl:border-b-0 xl:bg-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:h-full xl:justify-end xl:py-0">
          <div className="flex flex-wrap items-center gap-2">
            <details ref={typeRef} className="group/type relative">
              <summary className={TRIGGER_CLASS} aria-label={`Type: ${selectedLabel ?? 'All Kitchen Taps'}`}>
                <span>Type<span className="hidden text-slate-400 sm:inline">{selectedLabel ? `: ${selectedLabel}` : ''}</span></span>
                <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-slate-500 transition-transform group-open/type:rotate-180" />
              </summary>
              <nav aria-label="Kitchen tap types" className={MENU_CLASS}>
                <Link href="/plumbing/kitchen-taps/" aria-current={!chosen ? 'page' : undefined}
                  className={`flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-slate-50 ${!chosen ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-700'}`}>
                  All Kitchen Taps {!chosen && <Check size={16} aria-hidden="true" />}
                </Link>
                {KITCHEN_TAP_GROUPS.map((group) => (
                  <Link key={group.value} href={`/plumbing/kitchen-taps/?type=${group.value}`}
                    aria-current={chosen === group.value ? 'page' : undefined}
                    className={`flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 ${chosen === group.value ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-700'}`}>
                    {group.label} {chosen === group.value && <Check size={16} aria-hidden="true" />}
                  </Link>
                ))}
              </nav>
            </details>
            <SortDropdown
              value={sort}
              onChange={setSort}
              disabled={false}
              allowedValues={['default', 'price-asc', 'price-desc']}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 md:pt-10 lg:px-8">
        <ProductGrid products={displayed} editorial />
        {displayed.length === 0 && (
          <div className="rounded-xl border border-gray-200 p-6 text-sm text-slate-700">
            No products found in this type. <Link href="/plumbing/kitchen-taps/" className="font-semibold text-sky-700 hover:underline">Browse all Kitchen Taps</Link>.
          </div>
        )}
      </div>
    </section>
  );
}
