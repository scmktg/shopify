'use client';

import type { Money } from '@/types/product';
import { BuyBanner } from './BuyBanner';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantBuyBannerProps {
  fallbackPrice: Money;
  ctaLabel?: string;
  minimal?: boolean;
}

export function VariantBuyBanner({
  fallbackPrice,
  ctaLabel,
  minimal = false,
}: VariantBuyBannerProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <BuyBanner
      variantId={selectedVariant.id}
      available={selectedVariant.availableForSale}
      price={selectedVariant.price ?? fallbackPrice}
      ctaLabel={ctaLabel}
      minimal={minimal}
    />
  );
}
