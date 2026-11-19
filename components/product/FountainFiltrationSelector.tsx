'use client';

import Link from 'next/link';
import { useState } from 'react';
import { clsx } from 'clsx';

export const FOUNTAIN_FILTRATION_PAIRS = [
  {
    filtered: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    nonFiltered: 'hdpe-drinking-fountain-water-bubbler-with-tap-chilled-non-filtered-20l-hr',
  },
  {
    filtered: 'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
    nonFiltered: 'round-stainless-steel-drinking-fountain-water-bubbler-chilled-non-filtered-20l-hr',
  },
  {
    filtered: 'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    nonFiltered: 'stainless-steel-drinking-fountain-water-bubbler-with-tap-chilled-non-filtered-20l-hr',
  },
] as const;

/** Links independently purchasable fountain configurations without
 * breaking Google Shopping's dedicated product landing pages. */
export function FountainFiltrationSelector({ currentHandle }: { currentHandle: string }) {
  const [showNonFilteredInfo, setShowNonFilteredInfo] = useState(false);
  // Flip only after the corresponding Shopify products are active, published,
  // mapped to checkout shipping and connected to shared physical stock.
  const nonFilteredOrderingEnabled = true;
  const pair = FOUNTAIN_FILTRATION_PAIRS.find(item =>
    item.filtered === currentHandle || item.nonFiltered === currentHandle,
  );
  if (!pair) return null;
  const options = [
    { handle: pair.filtered, label: 'Filtered', detail: 'Includes filter cartridge' },
    { handle: pair.nonFiltered, label: 'Non-filtered', detail: 'Without filter cartridge' },
  ];
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-neutral-900">
        Water filtration
      </legend>
      <p className="mt-1 text-xs leading-5 text-neutral-500">
        The same fountain, with or without the filter cartridge.
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        {options.map(option => {
          const selected = option.handle === currentHandle;
          const styling = clsx(
            'relative flex min-h-[82px] flex-col justify-center rounded-lg border px-3 py-3 text-left transition-colors',
            selected
              ? 'border-neutral-900 bg-neutral-50 ring-1 ring-inset ring-neutral-900'
              : 'border-neutral-200 bg-white hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
          );
          const content = (
            <>
              {option.handle === pair.nonFiltered && (
                <span className="absolute -right-1.5 -top-2 rounded-md bg-brand-blue px-2 py-1 text-[11px] font-bold leading-none tracking-tight text-white shadow-sm">
                  Save $100
                </span>
              )}
              <span className="text-sm font-semibold text-neutral-900">{option.label}</span>
              <span className="mt-0.5 text-xs text-neutral-500">{option.detail}</span>
            </>
          );
          return selected
            ? <span key={option.handle} className={styling} aria-current="page">{content}</span>
            : option.handle === pair.nonFiltered && !nonFilteredOrderingEnabled
              ? <button
                  key={option.handle}
                  type="button"
                  onClick={() => setShowNonFilteredInfo(value => !value)}
                  aria-expanded={showNonFilteredInfo}
                  className={styling}
                  aria-label="Learn about the non-filtered fountain, save $100"
                >{content}</button>
              : <Link key={option.handle} className={styling}
                  href={`/bubblers-and-coolers/bubblers/${option.handle}`}
                  aria-label={`View ${option.label.toLowerCase()} configuration`}>{content}</Link>;
        })}
      </div>
      {showNonFilteredInfo && !nonFilteredOrderingEnabled && (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm leading-6 text-neutral-700">
          <p><strong className="text-neutral-900">Same fountain, $100 less.</strong> The non-filtered version is supplied without the filter cartridge.</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">Online ordering for this configuration is being prepared.</p>
          <a className="mt-2 inline-block text-sm font-semibold text-brand-blue underline underline-offset-2" href="mailto:info@enviroaqua.com.au?subject=Non-filtered%20water%20fountain%20enquiry">Enquire about the non-filtered version</a>
        </div>
      )}
    </fieldset>
  );
}
