'use client';

import type { ProductImage } from '@/types/product';
import { ProductGallery } from './ProductGallery';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  title: string;
  showLeadFreeBadge?: boolean;
}

export function VariantProductGallery({
  images,
  title,
  showLeadFreeBadge = false,
}: VariantProductGalleryProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <ProductGallery
      images={images}
      title={title}
      showLeadFreeBadge={showLeadFreeBadge}
      preferredImage={selectedVariant.image}
    />
  );
}
