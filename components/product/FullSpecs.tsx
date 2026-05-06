import type { SpecRow } from '@/lib/products/schema';

interface FullSpecsProps {
  specs?: ReadonlyArray<SpecRow>;
}

/**
 * Full specifications table. Free-form {label, value} rows from the
 * products.json `fullSpecs` array — no typed metafield formatters.
 *
 * Per clarification #10, spec values are not tabular-nums; numeric
 * alignment in tables comes from layout, not from numeral metrics.
 */
export function FullSpecs({ specs }: FullSpecsProps) {
  if (!specs || specs.length === 0) return null;
  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-semibold text-black tracking-tight">
        Specifications
      </h2>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {specs.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 border-b border-gray-100 py-2"
          >
            <dt className="font-medium text-black/70">{row.label}</dt>
            <dd className="text-black text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
