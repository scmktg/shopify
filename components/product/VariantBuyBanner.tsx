'use client';

import type { Money } from '@/types/product';
import { BuyBanner } from './BuyBanner';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantBuyBannerProps {
  fallbackPrice: Money;
  ctaLabel?: string;
}

export function VariantBuyBanner({
  fallbackPrice,
  ctaLabel,
}: VariantBuyBannerProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <BuyBanner
      variantId={selectedVariant.id}
      available={selectedVariant.availableForSale}
      price={selectedVariant.price ?? fallbackPrice}
      ctaLabel={ctaLabel}
    />
  );
}
