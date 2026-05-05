'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';
import type { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  title: string;
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

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded border border-gray-200 bg-white">
        <Image
          src={selected.url}
          alt={selected.altText ?? title}
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
            return (
              <li key={image.url} className="flex-shrink-0">
                <button
                  type="button"
                  aria-label={`Show image ${index + 1} of ${images.length}`}
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
                    alt=""
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
