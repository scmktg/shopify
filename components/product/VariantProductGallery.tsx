'use client';

import type { ProductImage } from '@/types/product';
import { ProductGallery } from './ProductGallery';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  title: string;
  showLeadFreeBadge?: boolean;
  watermarkLicence?: string | null;
}

export function VariantProductGallery({
  images,
  title,
  showLeadFreeBadge = false,
  watermarkLicence = null,
}: VariantProductGalleryProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <ProductGallery
      images={images}
      title={title}
      showLeadFreeBadge={showLeadFreeBadge}
      watermarkLicence={watermarkLicence}
      preferredImage={selectedVariant.image}
    />
  );
}
