'use client';

import { useState } from 'react';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import type { Money } from '@/types/product';
import { useCart } from './CartProvider';

interface MobileStickyBuyBarProps {
  variantId: string;
  available: boolean;
  price: Money;
}

export function MobileStickyBuyBar({
  variantId,
  available,
  price,
}: MobileStickyBuyBarProps) {
  const { addItem, isMutating } = useCart();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy || isMutating) return;
    setBusy(true);
    try {
      await addItem(variantId, 1);
    } finally {
      setBusy(false);
    }
  };

  const label = !available
    ? 'Out of stock'
    : busy
      ? 'Adding…'
      : 'Add to cart';

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3"
      role="region"
      aria-label="Add to cart"
    >
      <PriceDisplay
        money={price}
        className="text-lg font-semibold text-black flex-shrink-0"
      />
      <button
        type="button"
        onClick={onClick}
        disabled={!available || busy}
        className="flex-1 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
