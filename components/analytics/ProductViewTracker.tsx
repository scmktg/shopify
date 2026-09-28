'use client';

import { useEffect, useRef } from 'react';
import { trackViewItem } from '@/lib/analytics/client';

interface ProductViewTrackerProps {
  itemId: string;
  itemName: string;
  price: number;
  currency: string;
  category?: string;
  brand?: string;
}

export function ProductViewTracker({
  itemId,
  itemName,
  price,
  currency,
  category,
  brand = 'Enviro Aqua',
}: ProductViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackViewItem(
      {
        item_id: itemId,
        item_name: itemName,
        price,
        quantity: 1,
        item_category: category,
        item_brand: brand,
      },
      currency,
    );
  }, [brand, category, currency, itemId, itemName, price]);

  return null;
}
