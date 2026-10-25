'use client';

import { useVariantSelection } from './VariantSelectionProvider';

/** Keep the SKU in specifications in sync with the selected product variant. */
export function VariantSkuSpec() {
  const { selectedVariant } = useVariantSelection();
  if (!selectedVariant.sku) return null;

  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
      <dt className="font-medium text-black/70">SKU</dt>
      <dd className="text-right text-black">{selectedVariant.sku}</dd>
    </div>
  );
}
