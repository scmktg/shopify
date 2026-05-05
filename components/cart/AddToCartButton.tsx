'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

interface AddToCartButtonProps {
  variantId: string;
  available: boolean;
}

export function AddToCartButton({ variantId, available }: AddToCartButtonProps) {
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
      className="mt-6 w-full bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded transition-colors"
    >
      {label}
    </button>
  );
}
