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
  watermarkLeadFree?: boolean;
  watermarkPosition?: 'left' | 'right';
  cinematicVideoOverlay?: boolean;
  showChilledFilteredBadges?: boolean;
  showFilteredBadge?: boolean;
}

export function VariantProductGallery({
  images,
  videos = [],
  title,
  showLeadFreeBadge = false,
  watermarkLicence = null,
  watermarkLeadFree = true,
  watermarkPosition = 'left',
  cinematicVideoOverlay = false,
  showChilledFilteredBadges = false,
  showFilteredBadge = true,
}: VariantProductGalleryProps) {
  const { selectedVariant } = useVariantSelection();
  return (
    <ProductGallery
      images={images}
      video={videos[0] ?? null}
      title={title}
      showLeadFreeBadge={showLeadFreeBadge}
      watermarkLicence={watermarkLicence}
      watermarkLeadFree={watermarkLeadFree}
      watermarkPosition={watermarkPosition}
      cinematicVideoOverlay={cinematicVideoOverlay}
      showChilledFilteredBadges={showChilledFilteredBadges}
      showFilteredBadge={showFilteredBadge}
      preferredImage={selectedVariant.image}
    />
  );
}
