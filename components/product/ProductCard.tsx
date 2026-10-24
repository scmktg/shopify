'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ShoppingCart, ArrowUpRight } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import type { ProductCardData, ProductCardVariant } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';
import { isColourOptionName } from '@/lib/products/colourSwatches';
import { PriceDisplay } from './PriceDisplay';
import { WaterMarkLeadFreeOverlay } from './WaterMarkLeadFreeOverlay';
import { getInitialBubblerWaterMarkLicence } from '@/lib/products/watermarkLeadFreeBadge';
import { ColourSwatch } from './ColourSwatch';
import { cardToAnalyticsItem, trackSelectItem } from '@/lib/analytics/client';

interface ProductCardProps {
  product: ProductCardData;
}

interface ColourChoice {
  value: string;
  variant: ProductCardVariant;
}

export function ProductCard({ product }: ProductCardProps) {
  const baseHref = getProductUrl(product.handle);
  const watermarkLicence = getInitialBubblerWaterMarkLicence(product.handle);
  const { addItem, isMutating, isReady } = useCart();
  const [pendingAction, setPendingAction] = useState<'cart' | null>(null);

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
  // Direct checkout only when a colour swatch fully specifies the variant.
  const direct = product.variants.length === 1 || (
    selectedVariant !== null &&
    colourChoices.length === product.variants.length &&
    product.variants.every((variant) => variant.selectedOptions.every(
      (option) => isColourOptionName(option.name) || option.name.toLowerCase() === 'title',
    ))
  );
  const purchaseVariant = direct ? (selectedVariant ?? product.variants[0]) : null;
  const image = selectedVariant?.image ?? product.featuredImage;
  const href = selectedVariant
    ? `${baseHref}?variant=${encodeURIComponent(selectedVariant.id)}`
    : baseHref;
  const imageAlt = selectedChoice
    ? `${product.title} - ${selectedChoice.value}`
    : product.title;

  const purchase = async () => {
    if (!purchaseVariant?.availableForSale || !isReady || isMutating || pendingAction) return;
    setPendingAction('cart');
    try {
      await addItem(purchaseVariant.id, 1);
    } finally {
      setPendingAction(null);
    }
  };

  const trackSelection = () => {
    trackSelectItem(cardToAnalyticsItem(product, selectedVariant?.id));
  };

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={href}
        onClick={trackSelection}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
      >
        <div className="relative aspect-square overflow-hidden rounded border border-gray-200 bg-white">
          {image ? (
            <Image
              key={image.url}
              src={image.url}
              alt={imageAlt}
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
          {image && watermarkLicence && (
            <WaterMarkLeadFreeOverlay licenceNumber={watermarkLicence} compact showLicence={false} />
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link
          href={href}
          onClick={trackSelection}
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

        <div className="mt-auto pt-4">
          {purchaseVariant?.availableForSale ? (
            <button type="button" onClick={() => void purchase()}
              disabled={!isReady || isMutating || pendingAction !== null}
              className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-brand-blue px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
              <ShoppingCart size={17} aria-hidden="true" />
              {pendingAction === 'cart' ? 'Adding…' : 'Add to cart'}
            </button>
          ) : (
            <Link href={href} onClick={trackSelection}
              className="inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-black transition-colors hover:border-gray-500 hover:bg-gray-50">
              {purchaseVariant ? 'View availability' : 'Choose options'}
              <ArrowUpRight size={16} className="ml-1.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
