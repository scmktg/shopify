'use client';

import type { ShippingTier } from '@/types/product';
import { ShippingEstimator } from './ShippingEstimator';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantShippingEstimatorProps {
  tier: ShippingTier;
}

export function VariantShippingEstimator({
  tier,
}: VariantShippingEstimatorProps) {
  const { selectedVariant } = useVariantSelection();
  return <ShippingEstimator variantId={selectedVariant.id} tier={tier} />;
}
