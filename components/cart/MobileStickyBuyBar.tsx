'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import type { Money, ProductImage } from '@/types/product';
import { useCart } from './CartProvider';

interface MobileStickyBuyBarProps {
  variantId: string;
  available: boolean;
  price: Money;
  title: string;
  thumbnail: ProductImage | null;
}

export function MobileStickyBuyBar({
  variantId,
  available,
  price,
  title,
  thumbnail,
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
      className="md:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-3 shadow-[0_-1px_0_rgba(0,0,0,0.04)]"
      role="region"
      aria-label="Add to cart"
    >
      {thumbnail && (
        <div className="relative w-12 h-12 flex-shrink-0 bg-white border border-gray-200 rounded overflow-hidden">
          <Image
            src={thumbnail.url}
            alt=""
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-xs font-medium text-black truncate">{title}</p>
        <PriceDisplay
          money={price}
          className="text-sm font-semibold text-black"
        />
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={!available || busy}
        className="flex-shrink-0 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 px-4 rounded transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
