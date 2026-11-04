'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { ProductCardData } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortDropdown, type SortValue } from '@/components/category/CategoryView';
import { getCatalogFilterGroups, type CatalogFilterGroup, type CatalogFilterState } from '@/lib/catalog/filters';

const SIZES = [
  { key: '10-x-2-5', label: '10″ × 2.5″' },
  { key: '10-x-4-5', label: '10″ × 4.5″' },
  { key: '20-x-2-5', label: '20″ × 2.5″' },
  { key: '20-x-4-5', label: '20″ × 4.5″' },
] as const;

const groups = getCatalogFilterGroups('cartridges');
const typeGroup = groups.find((group) => group.id === 'system');

function matchesOption(product: ProductCardData, option: CatalogFilterGroup['options'][number]): boolean {
  const tags = option.query.match(/tag:'([^']+)'/g);
  if (tags?.length) {
    return tags.some((tagClause) => product.tags.includes(tagClause.slice(5, -1)));
  }
  if (option.value === 'under-100') return Number(product.price.amount) < 100;
  if (option.value === '100-250') return Number(product.price.amount) >= 100 && Number(product.price.amount) <= 250;
  if (option.value === '250-500') return Number(product.price.amount) > 250 && Number(product.price.amount) <= 500;
  if (option.value === '500-1000') return Number(product.price.amount) > 500 && Number(product.price.amount) <= 1000;
  if (option.value === '1000-plus') return Number(product.price.amount) > 1000;
  return false;
}

function matchesFilters(product: ProductCardData, filters: CatalogFilterState): boolean {
  return groups.every((group) => {
    const selected = filters[group.id] ?? [];
    if (!selected.length) return true;
    return selected.some((value) => {
      const option = group.options.find((candidate) => candidate.value === value);
      return option ? matchesOption(product, option) : false;
    });
  });
}

const triggerClass = 'inline-flex min-h-11 min-w-28 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30';
const menuClass = 'absolute left-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_48px_rgba(15,23,42,0.14)]';

export function CartridgeSizeResults({ products, dimension, truncated, loadFailed }: {
  products: ReadonlyArray<ProductCardData>;
  dimension: string;
  truncated: boolean;
  loadFailed: boolean;
}) {
  const [filters, setFilters] = useState<CatalogFilterState>({});
  const [sort, setSort] = useState<SortValue>('default');
  const typeRef = useRef<HTMLDetailsElement>(null);
  const sizeRef = useRef<HTMLDetailsElement>(null);

  const filtered = useMemo(() => {
    const list = products.filter((product) => matchesFilters(product, filters));
    if (sort === 'price-asc') return [...list].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    if (sort === 'price-desc') return [...list].sort((a, b) => Number(b.price.amount) - Number(a.price.amount));
    return list;
  }, [products, filters, sort]);
  const selectedType = typeGroup?.options.find((option) => (filters.system ?? []).includes(option.value));
  const selectedSize = SIZES.find((size) => size.key === dimension);

  return (
    <section aria-label="Browse cartridges">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500" aria-live="polite">
            <span className="font-semibold text-slate-900">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
          </p>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <details ref={typeRef} className="group/type relative">
            <summary className={`${triggerClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label={`Type: ${selectedType?.label ?? 'All types'}`}>
              <span>Type<span className="hidden text-gray-400 sm:inline">{selectedType ? `: ${selectedType.label}` : ''}</span></span>
              <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-gray-500 transition-transform group-open/type:rotate-180" />
            </summary>
            <div className={menuClass} role="group" aria-label="Cartridge type">
              <button type="button" onClick={() => { setFilters((previous) => ({ ...previous, system: [] })); if (typeRef.current) typeRef.current.open = false; }} className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50 ${!selectedType ? 'bg-gray-100 font-semibold' : ''}`}>
                All types {!selectedType && <Check size={16} aria-hidden="true" />}
              </button>
              {typeGroup?.options.map((option) => (
                <button key={option.value} type="button" onClick={() => { setFilters((previous) => ({ ...previous, system: [option.value] })); if (typeRef.current) typeRef.current.open = false; }} className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50 ${selectedType?.value === option.value ? 'bg-gray-100 font-semibold' : ''}`}>
                  {option.label} {selectedType?.value === option.value && <Check size={16} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </details>
          <details ref={sizeRef} className="group/size relative">
            <summary className={`${triggerClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label={`Size: ${selectedSize?.label ?? 'Choose size'}`}>
              <span>Size<span className="hidden text-gray-400 sm:inline">{selectedSize ? `: ${selectedSize.label}` : ''}</span></span>
              <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-gray-500 transition-transform group-open/size:rotate-180" />
            </summary>
            <nav className={menuClass} aria-label="Cartridge size">
              <Link href="/cartridges/" className="block rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">All sizes</Link>
              {SIZES.map((size) => (
                <Link key={size.key} href={`/cartridges/size/${size.key}/`} aria-current={size.key === dimension ? 'page' : undefined} className={`flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-gray-50 ${size.key === dimension ? 'bg-gray-100 font-semibold text-gray-950' : 'text-gray-700'}`}>
                  {size.label} {size.key === dimension && <Check size={16} aria-hidden="true" />}
                </Link>
              ))}
            </nav>
          </details>
          <SortDropdown value={sort} onChange={setSort} disabled={loadFailed} allowedValues={['default', 'price-asc', 'price-desc']} />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 md:pt-10 lg:px-8">
        {loadFailed ? (
          <p role="alert" className="rounded-lg bg-amber-50 p-5 text-sm text-amber-900">Products are temporarily unavailable. Please try again.</p>
        ) : (
          <>
            {filtered.length > 0 ? <ProductGrid products={filtered} editorial /> : (
              <div className="rounded-xl border border-gray-200 p-7">
                <h2 className="text-lg font-semibold text-gray-950">No matching cartridges found</h2>
                <p className="mt-2 text-sm text-gray-600">Try another cartridge type or size, or browse the full cartridge range.</p>
                <button type="button" onClick={() => setFilters({})} className="mt-4 text-sm font-semibold text-sky-700 hover:underline">Clear type</button>
                <Link href="/cartridges/" className="ml-5 text-sm font-semibold text-sky-700 hover:underline">View all cartridges</Link>
              </div>
            )}
            {truncated && <p className="mt-6 text-sm text-amber-800">Additional catalogue products may not be shown. Browse all cartridges if you cannot find your replacement.</p>}
          </>
        )}
      </div>
    </section>
  );
}
