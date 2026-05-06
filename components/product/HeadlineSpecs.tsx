import { HEADLINE_SPECS_LIMIT, type SpecRow } from '@/lib/products/schema';

interface HeadlineSpecsProps {
  specs?: ReadonlyArray<SpecRow>;
}

/**
 * Up-to-4 "headline specs" rendered as a single-row 4-up grid. Sits
 * directly under the buy box / overview to close the sale: the
 * numbers a buyer needs to confirm before they reach for Add to cart.
 *
 * Entries beyond `HEADLINE_SPECS_LIMIT` are dropped with a dev-only
 * warning. The validator emits the same warning at build time so
 * the JSON ships clean.
 */
export function HeadlineSpecs({ specs }: HeadlineSpecsProps) {
  if (!specs || specs.length === 0) return null;
  if (process.env.NODE_ENV !== 'production' && specs.length > HEADLINE_SPECS_LIMIT) {
    console.warn(
      `[HeadlineSpecs] Got ${specs.length} specs; rendering the first ${HEADLINE_SPECS_LIMIT}.`,
    );
  }
  const visible = specs.slice(0, HEADLINE_SPECS_LIMIT);

  return (
    <section
      aria-label="Headline specifications"
      className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 border-y border-gray-200 py-6"
    >
      {visible.map((row) => (
        <div key={row.label} className="flex flex-col">
          <dt className="text-xs uppercase tracking-wide text-black/60">
            {row.label}
          </dt>
          <dd className="mt-1 text-base font-semibold text-black">
            {row.value}
          </dd>
        </div>
      ))}
    </section>
  );
}
