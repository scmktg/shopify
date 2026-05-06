'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';
import type { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  title: string;
}

/**
 * Shopify auto-generates placeholder alt text like "image 2" when a
 * merchant doesn't set one. We don't want that surfacing to the page
 * — it's worse than no alt at all because it carries no information.
 * Treat empty, whitespace-only, or "image N"-style alts as missing
 * and fall back to a generated label that names the product.
 */
function isPlaceholderAlt(alt: string | null | undefined): boolean {
  if (!alt) return true;
  const trimmed = alt.trim();
  if (!trimmed) return true;
  return /^image[\s_-]*\d*$/i.test(trimmed);
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
        <span className="text-sm text-gray-500">No image available</span>
      </div>
    );
  }

  const selected = images[selectedIndex] ?? images[0]!;
  const heroAlt = isPlaceholderAlt(selected.altText)
    ? `${title} — main product image`
    : selected.altText!;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded border border-gray-200 bg-white">
        <Image
          src={selected.url}
          alt={heroAlt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <ul
          className="mt-4 flex gap-2 overflow-x-auto sm:grid sm:grid-cols-5 sm:gap-2 sm:overflow-visible"
          role="list"
        >
          {images.map((image, index) => {
            const isSelected = index === selectedIndex;
            const thumbAlt = isPlaceholderAlt(image.altText)
              ? `${title} — view ${index + 1}`
              : image.altText!;
            return (
              <li key={image.url} className="flex-shrink-0">
                <button
                  type="button"
                  aria-label={`Show ${thumbAlt}`}
                  aria-current={isSelected}
                  onClick={() => setSelectedIndex(index)}
                  className={clsx(
                    'relative aspect-square w-20 sm:w-auto overflow-hidden rounded border transition-colors',
                    isSelected
                      ? 'ring-2 ring-brand-blue border-transparent'
                      : 'border-gray-200 hover:border-gray-400',
                  )}
                >
                  <Image
                    src={image.url}
                    alt={thumbAlt}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
