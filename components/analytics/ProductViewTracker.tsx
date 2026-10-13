'use client';

import { useEffect, useRef } from 'react';
import { useVariantSelection } from '@/components/product/VariantSelectionProvider';
import { trackViewItem } from '@/lib/analytics/client';

interface ProductViewTrackerProps {
  productId: string;
  productHandle: string;
  itemName: string;
  category?: string;
  brand?: string;
}

export function ProductViewTracker({
  productId,
  productHandle,
  itemName,
  category,
  brand = 'Enviro Aqua',
}: ProductViewTrackerProps) {
  const { selectedVariant } = useVariantSelection();
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (tracked.current.has(selectedVariant.id)) return;
    tracked.current.add(selectedVariant.id);
    const price = Number.parseFloat(selectedVariant.price.amount);
    trackViewItem({
      item_id: selectedVariant.id,
      item_name: itemName,
      price: Number.isFinite(price) ? price : 0,
      quantity: 1,
      item_category: category,
      item_brand: brand,
      item_variant: selectedVariant.title,
      ...(selectedVariant.sku ? { item_sku: selectedVariant.sku } : {}),
      item_handle: productHandle,
      shopify_product_id: productId,
    }, selectedVariant.price.currencyCode);
  }, [brand, category, itemName, productHandle, productId, selectedVariant]);
  return null;
}

