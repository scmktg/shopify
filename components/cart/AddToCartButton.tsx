'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

interface AddToCartButtonProps {
  variantId: string;
  available: boolean;
  /**
   * Label override from `products.json[handle].ctas.primary`. Falls
   * back to "Add to cart" when undefined. The "Out of stock" /
   * "Adding…" states still take precedence over the override.
   */
  label?: string;
  /**
   * When true, renders a secondary "Buy now" button below the
   * primary Add-to-cart row. Buy-now adds the variant to the cart
   * (respecting the current quantity) and redirects to the Shopify
   * checkout URL — no drawer popup.
   */
  enableBuyNow?: boolean;
}

const MAX_QTY = 99;

export function AddToCartButton({
  variantId,
  available,
  label: labelOverride,
  enableBuyNow = false,
}: AddToCartButtonProps) {
  const { addItem, buyNow, isMutating } = useCart();
  const [busy, setBusy] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
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

  const onAdd = async () => {
    if (busy || buyingNow || isMutating) return;
    setBusy(true);
    try {
      await addItem(variantId, quantity);
    } finally {
      setBusy(false);
    }
  };

  const onBuyNow = async () => {
    if (busy || buyingNow || isMutating) return;
    setBuyingNow(true);
    try {
      await buyNow(variantId, quantity);
      // Successful buyNow navigates away; leave buyingNow=true so
      // the buttons stay disabled until the page unloads. The
      // catch block resets state on failure.
    } catch {
      setBuyingNow(false);
    }
  };

  const addLabel = !available
    ? 'Out of stock'
    : busy
      ? 'Adding…'
      : (labelOverride ?? 'Add to cart');

  const buyNowLabel = !available
    ? 'Out of stock'
    : buyingNow
      ? 'Redirecting…'
      : 'Buy now';

  const anyBusy = busy || buyingNow || isMutating;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {/*
          Mobile: stepper spans the full row, −/+ buttons grow to
          fill the gutters either side of the centered qty input,
          so the row visually balances with the Add-to-cart button
          below it.
          Desktop (sm+): stepper collapses to intrinsic width and
          sits next to the Add-to-cart button on a single row.
        */}
        <div
          className="flex sm:inline-flex w-full sm:w-auto items-stretch border border-black rounded overflow-hidden"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={dec}
            disabled={quantity <= 1 || !available || anyBusy}
            aria-label="Decrease quantity"
            className="flex-1 sm:flex-none sm:px-3 text-black hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
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
            className="w-12 flex-shrink-0 text-center text-black bg-white border-x border-black focus:outline-none focus:ring-2 focus:ring-brand-blue [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={inc}
            disabled={quantity >= MAX_QTY || !available || anyBusy}
            aria-label="Increase quantity"
            className="flex-1 sm:flex-none sm:px-3 text-black hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!available || anyBusy}
          className="flex-1 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded transition-colors"
        >
          {addLabel}
        </button>
      </div>

      {enableBuyNow && (
        <button
          type="button"
          onClick={onBuyNow}
          disabled={!available || anyBusy}
          className="w-full bg-black hover:bg-black/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded transition-colors"
        >
          {buyNowLabel}
        </button>
      )}
    </div>
  );
}
