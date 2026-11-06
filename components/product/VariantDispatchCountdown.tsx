'use client';

import { DispatchCountdown } from './DispatchCountdown';
import { useVariantSelection } from './VariantSelectionProvider';

export function VariantDispatchCountdown({ compact = false, minimal = false, hasBackorder = false }: { compact?: boolean; minimal?: boolean; hasBackorder?: boolean }) {
  const { selectedVariant } = useVariantSelection();
  const quantity = selectedVariant.quantityAvailable;
  const backorder = hasBackorder || (selectedVariant.availableForSale && quantity !== null && quantity !== undefined && quantity <= 0);
  return (
    <DispatchCountdown
      compact={compact}
      minimal={minimal}
      inStock={selectedVariant.availableForSale && !backorder && quantity !== 0}
      backorder={backorder}
    />
  );
}
