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


// Recognise finishes from variant options first, then fall back to product metadata.
const COLOURS = [
  { value: 'matte-black', label: 'Matte Black', pattern: /\b(?:matte\s+black|black)\b/i },
  { value: 'brushed-nickel', label: 'Brushed Nickel', pattern: /\b(?:brushed\s+nickel|nickel)\b/i },
  { value: 'polished-chrome', label: 'Polished Chrome', pattern: /\b(?:polished\s+chrome|chrome)\b/i },
  { value: 'brushed-gold', label: 'Brushed Gold', pattern: /\b(?:brushed\s+gold|gold)\b/i },
  { value: 'stainless-steel', label: 'Stainless Steel', pattern: /\b(?:stainless[\s-]+steel|silver)\b/i },
  { value: 'white', label: 'White', pattern: /\bwhite\b/i },
] as const;

function productColours(product: ProductCardData): string[] {
  const finishOptions = product.variants.flatMap((variant) =>
    variant.selectedOptions
      .filter((option) => /^(?:colou?r|finish)$/i.test(option.name))
      .map((option) => option.value),
  );
  const sources = finishOptions.length > 0
    ? finishOptions
    : product.variants
        .map((variant) => variant.title)
        .filter((title) => title && title !== 'Default Title');
  const descriptors = sources.length > 0
    ? sources
    : [product.title, ...product.tags, product.handle];
  return COLOURS.filter((colour) => descriptors.some((value) => colour.pattern.test(value)))
    .map((colour) => colour.value);
}

interface Props {
  products: ReadonlyArray<ProductCardData>;
  selectedType?: string;
}

export function KitchenTapResults({ products, selectedType }: Props) {
  const chosen = isKitchenTapGroup(selectedType) ? selectedType : null;
  const [sort, setSort] = useState<SortValue>('default');
  const [colour, setColour] = useState<string | null>(null);
  const typeRef = useRef<HTMLDetailsElement>(null);
  const colourRef = useRef<HTMLDetailsElement>(null);

  const availableColours = useMemo(() =>
    COLOURS.filter((option) => products.some((product) => productColours(product).includes(option.value))),
    [products],
  );

  const displayed = useMemo(() => {
    const handles = chosen ? new Set(KITCHEN_TAP_GROUP_HANDLES[chosen]) : null;
    const byType = handles ? products.filter((product) => handles.has(product.handle)) : [...products];
    const list = colour ? byType.filter((product) => productColours(product).includes(colour)) : byType;

    if (sort === 'price-asc') return list.sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
    if (sort === 'price-desc') return list.sort((a, b) => Number(b.price.amount) - Number(a.price.amount));
    return list;
  }, [products, chosen, colour, sort]);

  const selectedLabel = KITCHEN_TAP_GROUPS.find((group) => group.value === chosen)?.label;

  return (
    <section aria-label="Browse kitchen taps">
      <div className="relative z-20 border-b border-slate-200 bg-white xl:-mt-[88px] xl:h-[88px] xl:border-b-0 xl:bg-transparent xl:pointer-events-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:h-full xl:justify-end xl:py-0">
          <div className="flex flex-wrap items-center gap-2 xl:pointer-events-auto">
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
            {availableColours.length > 0 && (
              <details ref={colourRef} className="group/colour relative">
                <summary className={TRIGGER_CLASS} aria-label={`Colour: ${COLOURS.find((option) => option.value === colour)?.label ?? 'All colours'}`}>
                  <span>Colour<span className="hidden text-slate-400 sm:inline">{colour ? `: ${COLOURS.find((option) => option.value === colour)?.label}` : ''}</span></span>
                  <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-slate-500 transition-transform group-open/colour:rotate-180" />
                </summary>
                <div role="group" aria-label="Filter by tap colour" className={MENU_CLASS}>
                  {[{ value: null, label: 'All colours' }, ...availableColours].map((option) => (
                    <button key={option.value ?? 'all'} type="button" aria-pressed={colour === option.value}
                      onClick={() => { setColour(option.value); if (colourRef.current) colourRef.current.open = false; }}
                      className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 ${colour === option.value ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-700'}`}>
                      {option.label}
                      {colour === option.value && <Check size={16} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </details>
            )}
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
            No kitchen taps match these filters. <Link href="/plumbing/kitchen-taps/" className="font-semibold text-sky-700 hover:underline">Browse all Kitchen Taps</Link>.
          </div>
        )}
      </div>
    </section>
  );
}
