'use client';

import type { Money, ProductImage } from '@/types/product';
import { MobileStickyBuyBar } from '@/components/cart/MobileStickyBuyBar';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantMobileStickyBuyBarProps {
  fallbackPrice: Money;
  title: string;
  fallbackThumbnail: ProductImage | null;
}

export function VariantMobileStickyBuyBar({
  fallbackPrice,
  title,
  fallbackThumbnail,
}: VariantMobileStickyBuyBarProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <MobileStickyBuyBar
      variantId={selectedVariant.id}
      available={selectedVariant.availableForSale}
      price={selectedVariant.price ?? fallbackPrice}
      title={title}
      thumbnail={selectedVariant.image ?? fallbackThumbnail}
    />
  );
}
