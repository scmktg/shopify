import Link from 'next/link';
import { clsx } from 'clsx';
import { canonicalProductHandle } from '@/lib/products/getProductContent';
import type { ProductFamily } from '@/lib/products/schema';

interface FamilySelectorProps {
  /** Family block from the current product's content entry. */
  family: ProductFamily;
  /** Shopify handle of the product currently being rendered. */
  currentHandle: string;
  /**
   * Map of sibling handle → canonical pathname, built by the caller
   * from products.json. Decoupling the path lookup from this component
   * keeps it framework-agnostic and avoids pulling the full products
   * map through to the client bundle.
   */
  paths: ReadonlyMap<string, string>;
  sleek?: boolean;
}

export function FamilySelector({
  family,
  currentHandle,
  paths,
  sleek = false,
}: FamilySelectorProps) {
  return (
    <fieldset className={sleek ? "mt-7" : "mt-6"}>
      <legend className={sleek ? "text-xs font-semibold uppercase tracking-[0.11em] text-neutral-600" : "text-sm font-semibold text-black"}>
        {family.label}
      </legend>
      <div className={sleek ? "mt-3 flex flex-wrap gap-2" : "mt-2 flex flex-wrap gap-2"}>
        {family.siblings.map((sibling) => {
          const isActive =
            canonicalProductHandle(sibling.handle) === currentHandle;
          const href = paths.get(sibling.handle);
          const swatch = sleek ? kitchenTapFinishSwatch(sibling.label) : null;
          if (isActive || !href) {
            return (
              <span
                key={sibling.handle}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  sleek
                    ? 'inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm font-medium'
                    : 'inline-flex items-center justify-center px-4 py-2 rounded border text-sm font-semibold tabular-nums',
                  isActive
                    ? sleek ? 'border-neutral-900 bg-neutral-900 text-white' : 'bg-black text-white border-black'
                    : 'bg-gray-100 text-black/40 border-gray-200 cursor-not-allowed',
                )}
              >
                {swatch && <span aria-hidden="true" className={clsx('h-3.5 w-3.5 rounded-full border', swatch)} />}
                {sibling.label}
              </span>
            );
          }
          return (
            <Link
              key={sibling.handle}
              href={href}
              className={sleek
                ? "inline-flex min-h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                : "inline-flex items-center justify-center px-4 py-2 rounded border border-black/20 bg-white text-black text-sm font-semibold tabular-nums hover:border-brand-blue hover:text-brand-blue transition-colors"}
            >
              {swatch && <span aria-hidden="true" className={clsx('h-3.5 w-3.5 rounded-full border', swatch)} />}
              {sibling.label}
            </Link>
          );
        })}
      </div>
    </fieldset>
  );
}

function kitchenTapFinishSwatch(finish: string): string | null {
  switch (finish.toLowerCase()) {
    case 'matte black':
      return 'border-neutral-800 bg-neutral-950';
    case 'stainless steel':
      return 'border-neutral-400 bg-[#a7afb4]';
    case 'polished chrome':
      return 'border-neutral-300 bg-[#e1e6e9]';
    case 'brushed gold':
      return 'border-[#b89452] bg-[#c9a468]';
    default:
      return null;
  }
}
