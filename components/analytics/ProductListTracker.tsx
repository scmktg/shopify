'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { ProductCardData } from '@/types/product';
import { trackViewItemList } from '@/lib/analytics/client';

export function ProductListTracker({
  products,
}: {
  products: ReadonlyArray<ProductCardData>;
}) {
  const pathname = usePathname();
  const signature = products.map((product) => product.id).join(',');
  useEffect(() => {
    const track = () => {
      if (products.length) {
        trackViewItemList(products, pathname, pathname === '/search' ? 'Search results' : 'Product list');
      }
    };
    track();
    window.addEventListener('enviroaqua:analytics-consent-changed', track);
    return () => window.removeEventListener('enviroaqua:analytics-consent-changed', track);
  }, [pathname, signature, products]);
  return null;
}

