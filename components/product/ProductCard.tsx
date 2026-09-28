'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ProductCardData, ProductCardVariant } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';
import { isColourOptionName } from '@/lib/products/colourSwatches';
import { PriceDisplay } from './PriceDisplay';
import { ColourSwatch } from './ColourSwatch';

interface ProductCardProps {
  product: ProductCardData;
}

interface ColourChoice {
  value: string;
  variant: ProductCardVariant;
}

export function ProductCard({ product }: ProductCardProps) {
  const baseHref = getProductUrl(product.handle);

  const colourChoices = useMemo<ReadonlyArray<ColourChoice>>(() => {
    const seen = new Set<string>();
    const choices: ColourChoice[] = [];

    for (const variant of product.variants) {
      const colourOption = variant.selectedOptions.find((option) =>
        isColourOptionName(option.name),
      );
      if (!colourOption || seen.has(colourOption.value)) continue;
      seen.add(colourOption.value);
      choices.push({ value: colourOption.value, variant });
    }

    return choices;
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    colourChoices[0]?.variant.id ?? null,
  );

  const selectedChoice =
    colourChoices.find((choice) => choice.variant.id === selectedVariantId) ??
    colourChoices[0] ??
    null;
  const selectedVariant = selectedChoice?.variant ?? null;
  const image = selectedVariant?.image ?? product.featuredImage;
  const href = selectedVariant
    ? `${baseHref}?variant=${encodeURIComponent(selectedVariant.id)}`
    : baseHref;

  return (
    <article className="group">
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
      >
        <div className="relative aspect-square overflow-hidden rounded border border-gray-200 bg-white">
          {image ? (
            <Image
              key={image.url}
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-2 transition-opacity group-hover:opacity-90"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gray-100"
            />
          )}
        </div>
      </Link>

      <div className="mt-3">
        <Link
          href={href}
          className="block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          <h3 className="text-sm font-medium text-black line-clamp-2 group-hover:underline underline-offset-4">
            {product.title}
          </h3>
        </Link>

        <PriceDisplay
          money={product.price}
          className="mt-1 block text-sm font-semibold text-black"
        />

        {colourChoices.length > 1 && (
          <div className="mt-2.5">
            <p className="sr-only">Available colours</p>
            <div className="flex flex-wrap items-center gap-2">
              {colourChoices.map(({ value, variant }) => {
                const selected = variant.id === selectedVariant?.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    aria-label={`Preview ${value}`}
                    aria-pressed={selected}
                    title={value}
                    className="inline-flex cursor-pointer rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    <ColourSwatch
                      value={value}
                      selected={selected}
                      unavailable={!variant.availableForSale}
                      size="sm"
                    />
                  </button>
                );
              })}
            </div>
            {selectedChoice && (
              <p className="mt-1.5 text-xs text-black/60">
                {selectedChoice.value}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
