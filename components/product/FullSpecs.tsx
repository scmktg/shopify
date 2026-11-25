import type { SpecRow } from '@/lib/products/schema';
import { VariantSkuSpec } from './VariantSkuSpec';

interface FullSpecsProps {
  specs?: ReadonlyArray<SpecRow>;
  grouped?: boolean;
}

/**
 * Full specifications table. Free-form {label, value} rows from the
 * products.json `fullSpecs` array  -  no typed metafield formatters.
 *
 * Per clarification #10, spec values are not tabular-nums; numeric
 * alignment in tables comes from layout, not from numeral metrics.
 */
export function FullSpecs({ specs, grouped = false }: FullSpecsProps) {
  const visibleSpecs = (specs ?? []).filter((row) => row.label.trim().toLowerCase() !== 'sku');
  if (grouped) {
    const groups = [
      { title: 'Product details', labels: ['Model', 'Type', 'Body material', 'Finish', 'Spout', 'Cartridge'] },
      { title: 'Installation', labels: ['Tap hole diameter', 'Water supply', 'Inlet hoses'] },
      { title: 'Water efficiency & certification', labels: ['WELS rating', 'WaterMark', 'WaterMark licence', 'WELS licence', 'WELS registration'] },
    ];
    const assigned = new Set(groups.flatMap((group) => group.labels));
    const remaining = visibleSpecs.filter((row) => !assigned.has(row.label));
    return (
      <section className="mt-12 border-t border-gray-100 pt-8" aria-label="Specifications">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Specifications</h2>
        <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {groups.filter((group) => visibleSpecs.some((row) => group.labels.includes(row.label))).map((group) => (
            <div key={group.title} className="overflow-hidden rounded-lg border border-gray-200">
              <h3 className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-black">{group.title}</h3>
              <dl className="divide-y divide-gray-100 px-5 text-sm">
                {visibleSpecs.filter((row) => group.labels.includes(row.label)).map((row) => (
                  <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 py-3">
                    <dt className="text-black/60">{row.label}</dt>
                    <dd className="break-words text-right font-medium text-black">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <div className="rounded-lg border border-gray-200 px-5">
            <dl className="divide-y divide-gray-100 text-sm">
              <VariantSkuSpec />
              {remaining.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-black/60">{row.label}</dt>
                  <dd className="text-right font-medium text-black">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-2xl font-semibold text-black tracking-tight">
        Specifications
      </h2>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <VariantSkuSpec />
        {visibleSpecs.map((row) => (
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
