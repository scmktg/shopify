'use client';

import type { ProductImage, ProductVideo } from '@/types/product';
import { ProductGallery } from './ProductGallery';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  videos?: ReadonlyArray<ProductVideo>;
  title: string;
  showLeadFreeBadge?: boolean;
  watermarkLicence?: string | null;
}

export function VariantProductGallery({
  images,
  videos = [],
  title,
  showLeadFreeBadge = false,
  watermarkLicence = null,
}: VariantProductGalleryProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <ProductGallery
      images={images}
      video={videos[0] ?? null}
      title={title}
      showLeadFreeBadge={showLeadFreeBadge}
      watermarkLicence={watermarkLicence}
      preferredImage={selectedVariant.image}
    />
  );
}
