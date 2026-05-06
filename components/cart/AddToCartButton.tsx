'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

interface AddToCartButtonProps {
  variantId: string;
  available: boolean;
}

const MAX_QTY = 99;

export function AddToCartButton({ variantId, available }: AddToCartButtonProps) {
  const { addItem, isMutating } = useCart();
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, n));
  const dec = () => setQuantity((q) => clamp(q - 1));
  const inc = () => setQuantity((q) => clamp(q + 1));
  const onTyped = (raw: string) => {
    if (raw === '') {
      setQuantity(1);
      return;
    }
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) setQuantity(clamp(n));
  };

  const onClick = async () => {
    if (busy || isMutating) return;
    setBusy(true);
    try {
      await addItem(variantId, quantity);
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
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div
        className="inline-flex items-stretch border border-black rounded overflow-hidden"
        aria-label="Quantity"
      >
        <button
          type="button"
          onClick={dec}
          disabled={quantity <= 1 || !available || busy}
          aria-label="Decrease quantity"
          className="px-3 text-black hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_QTY}
          value={quantity}
          onChange={(e) => onTyped(e.target.value)}
          aria-label="Quantity"
          className="w-12 text-center text-black bg-white border-x border-black focus:outline-none focus:ring-2 focus:ring-brand-blue [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={inc}
          disabled={quantity >= MAX_QTY || !available || busy}
          aria-label="Increase quantity"
          className="px-3 text-black hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={!available || busy}
        className="flex-1 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
