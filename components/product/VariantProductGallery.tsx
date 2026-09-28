'use client';

import type { ProductImage } from '@/types/product';
import { ProductGallery } from './ProductGallery';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  title: string;
}

export function VariantProductGallery({
  images,
  title,
}: VariantProductGalleryProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <ProductGallery
      images={images}
      title={title}
      preferredImage={selectedVariant.image}
    />
  );
}
