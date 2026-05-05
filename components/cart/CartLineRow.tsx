'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { useCart } from './CartProvider';
import { getProductUrl } from '@/lib/utils/productUrl';
import type { CartLine } from '@/types/cart';

interface CartLineRowProps {
  line: CartLine;
  onNavigate?: () => void;
}

export function CartLineRow({ line, onNavigate }: CartLineRowProps) {
  const { updateItem, removeItem, isMutating } = useCart();
  const variantLabel = line.merchandise.selectedOptions
    .filter((opt) => opt.value !== 'Default Title')
    .map((opt) => `${opt.name}: ${opt.value}`)
    .join(' · ');

  const href = getProductUrl(
    line.merchandise.product.tags,
    line.merchandise.product.handle,
  );
  const image = line.merchandise.image;

  return (
    <li className="flex gap-3 py-4 border-b border-gray-200">
      <Link
        href={href}
        onClick={onNavigate}
        className="relative flex-shrink-0 w-20 h-20 bg-white border border-gray-200 rounded overflow-hidden"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? line.merchandise.product.title}
            fill
            sizes="80px"
            className="object-contain p-1"
          />
        ) : null}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={href}
          onClick={onNavigate}
          className="block text-sm font-medium text-black line-clamp-2 hover:underline underline-offset-4"
        >
          {line.merchandise.product.title}
        </Link>
        {variantLabel && (
          <p className="mt-0.5 text-xs text-black/60">{variantLabel}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-gray-300 rounded">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateItem(line.id, line.quantity - 1)}
              disabled={isMutating}
              className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-100 disabled:opacity-50"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="px-2 min-w-8 text-center text-sm" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => updateItem(line.id, line.quantity + 1)}
              disabled={isMutating}
              className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-100 disabled:opacity-50"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
          <PriceDisplay
            money={line.totalAmount}
            className="text-sm font-semibold text-black"
          />
        </div>
      </div>

      <button
        type="button"
        aria-label={`Remove ${line.merchandise.product.title}`}
        onClick={() => removeItem(line.id)}
        disabled={isMutating}
        className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 text-black/60 hover:text-black disabled:opacity-50"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  );
}
