'use client';

import { DispatchCountdown } from './DispatchCountdown';
import { useVariantSelection } from './VariantSelectionProvider';

export function VariantDispatchCountdown({ compact = false, hasBackorder = false }: { compact?: boolean; hasBackorder?: boolean }) {
  const { selectedVariant } = useVariantSelection();
  const quantity = selectedVariant.quantityAvailable;
  const backorder = hasBackorder || (selectedVariant.availableForSale && quantity !== null && quantity !== undefined && quantity <= 0);
  return (
    <DispatchCountdown
      compact={compact}
      inStock={selectedVariant.availableForSale && !backorder && quantity !== 0}
      backorder={backorder}
    />
  );
}
