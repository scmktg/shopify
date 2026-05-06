import { Check } from 'lucide-react';

interface ProductFeaturesProps {
  features?: ReadonlyArray<string>;
}

/**
 * Bullet list of feature lines from the products.json `features`
 * array. Rendered under the Overview block. Returns null when the
 * array is absent or empty so callers don't need a guard.
 */
export function ProductFeatures({ features }: ProductFeaturesProps) {
  if (!features || features.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-black tracking-tight">
        Key features
      </h2>
      <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {features.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-black">
            <Check
              className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-blue"
              aria-hidden="true"
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
