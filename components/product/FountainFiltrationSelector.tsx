import Link from 'next/link';
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
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {options.map(option => {
          const selected = option.handle === currentHandle;
          const styling = clsx(
            'flex min-h-[70px] flex-col justify-center rounded-lg border px-3 py-3 text-left transition-colors',
            selected
              ? 'border-neutral-900 bg-neutral-50 ring-1 ring-inset ring-neutral-900'
              : 'border-neutral-200 bg-white hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
          );
          const content = (
            <>
              <span className="text-sm font-semibold text-neutral-900">{option.label}</span>
              <span className="mt-0.5 text-xs text-neutral-500">{option.detail}</span>
            </>
          );
          return selected
            ? <span key={option.handle} className={styling} aria-current="page">{content}</span>
            : <Link key={option.handle} className={styling}
                href={`/bubblers-and-coolers/bubblers/${option.handle}`}
                aria-label={`View ${option.label.toLowerCase()} configuration`}>{content}</Link>;
        })}
      </div>
    </fieldset>
  );
}
