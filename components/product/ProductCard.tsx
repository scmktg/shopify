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
import { ColourSwatch } from './ColourSwatch';
import { trackSelectItem } from '@/lib/analytics/client';

interface ProductCardProps {
  product: ProductCardData;
}

interface ColourChoice {
  value: string;
  variant: ProductCardVariant;
}

export function ProductCard({ product }: ProductCardProps) {
  const baseHref = getProductUrl(product.handle);
  const { addItem, buyNow, isMutating, isReady } = useCart();
  const [pendingAction, setPendingAction] = useState<'cart' | 'buy' | null>(null);

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

  const purchase = async (action: 'cart' | 'buy') => {
    if (!purchaseVariant?.availableForSale || !isReady || isMutating || pendingAction) return;
    setPendingAction(action);
    try {
      if (action === 'cart') await addItem(purchaseVariant.id, 1);
      else await buyNow(purchaseVariant.id, 1);
    } finally {
      setPendingAction(null);
    }
  };

  const trackSelection = () => {
    const price = Number.parseFloat(product.price.amount);
    trackSelectItem({
      item_id: product.handle,
      item_name: product.title,
      price: Number.isFinite(price) ? price : 0,
      quantity: 1,
      item_category: product.productType,
      item_brand: 'Enviro Aqua',
    });
  };

  return (
    <article className="group">
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
        </div>
      </Link>

      <div className="mt-3">
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

        <div className="mt-4 grid grid-cols-2 gap-2">
          {purchaseVariant?.availableForSale ? (
            <>
              <button type="button" onClick={() => void purchase('cart')}
                disabled={!isReady || isMutating || pendingAction !== null}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-black bg-white px-2 py-2.5 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50 sm:text-sm">
                <ShoppingCart size={16} aria-hidden="true" />
                {pendingAction === 'cart' ? 'Adding…' : 'Add to cart'}
              </button>
              <button type="button" onClick={() => void purchase('buy')}
                disabled={!isReady || isMutating || pendingAction !== null}
                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg bg-black px-2 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50 sm:text-sm">
                {pendingAction === 'buy' ? 'Redirecting…' : 'Buy now'}
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link href={href} onClick={trackSelection}
              className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-black bg-white px-3 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white">
              {purchaseVariant ? 'View availability' : 'Choose options'}
              <ArrowUpRight size={16} className="ml-1.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
