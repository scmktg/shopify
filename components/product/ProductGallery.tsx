'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const showArrows = images.length > 1;
  const selected = images[selectedIndex] ?? images[0]!;
  const heroAlt = isPlaceholderAlt(selected.altText)
    ? `${title} — image ${selectedIndex + 1} of ${images.length}`
    : selected.altText!;

  const goPrev = () =>
    setSelectedIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () =>
    setSelectedIndex((i) => (i + 1) % images.length);

  // Keyboard navigation when the gallery wrapper has focus.
  useEffect(() => {
    if (!showArrows) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev();
      else if (event.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showArrows, images.length]);

  return (
    <div
      className="relative w-full max-w-[70vh] aspect-square mx-auto overflow-hidden rounded border border-gray-200 bg-white"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} images`}
    >
      <Image
        key={selected.url}
        src={selected.url}
        alt={heroAlt}
        fill
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-contain"
      />

      {showArrows && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-black shadow-none focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            Image {selectedIndex + 1} of {images.length}
          </div>
        </>
      )}
    </div>
  );
}
