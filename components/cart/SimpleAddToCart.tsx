'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

interface SimpleAddToCartProps {
  variantId: string;
  available: boolean;
}

/**
 * Compact one-click "Add to cart" button used inside the
 * Frequently-Bought-Together rail. No quantity stepper — the rail
 * is a basket-builder, the assumption is one of each. The full
 * AddToCartButton with stepper stays on the main product page.
 */
export function SimpleAddToCart({ variantId, available }: SimpleAddToCartProps) {
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
    <button
      type="button"
      onClick={onClick}
      disabled={!available || busy}
      className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
    >
      {label}
    </button>
  );
}
