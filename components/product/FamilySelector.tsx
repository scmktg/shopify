import Link from 'next/link';
import { clsx } from 'clsx';
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
}

export function FamilySelector({
  family,
  currentHandle,
  paths,
}: FamilySelectorProps) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold text-black">
        {family.label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {family.siblings.map((sibling) => {
          const isActive = sibling.handle === currentHandle;
          const href = paths.get(sibling.handle);
          if (isActive || !href) {
            return (
              <span
                key={sibling.handle}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'inline-flex items-center justify-center px-4 py-2 rounded border text-sm font-semibold tabular-nums',
                  isActive
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-100 text-black/40 border-gray-200 cursor-not-allowed',
                )}
              >
                {sibling.label}
              </span>
            );
          }
          return (
            <Link
              key={sibling.handle}
              href={href}
              className="inline-flex items-center justify-center px-4 py-2 rounded border border-black/20 bg-white text-black text-sm font-semibold tabular-nums hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              {sibling.label}
            </Link>
          );
        })}
      </div>
    </fieldset>
  );
}
