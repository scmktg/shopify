'use client';

import type { Money } from '@/types/product';
import {
  AddToCartButton,
  type CompanionPurchaseItem,
} from '@/components/cart/AddToCartButton';
import { PriceDisplay } from './PriceDisplay';
import { useVariantSelection } from './VariantSelectionProvider';
import { ColourSwatch } from './ColourSwatch';
import { isColourOptionName } from '@/lib/products/colourSwatches';
import { DispatchCountdown } from './DispatchCountdown';

interface VariantPurchaseControlsProps {
  fallbackPrice: Money;
  ctaLabel?: string;
  companion?: CompanionPurchaseItem | null;
}

export function VariantPurchaseControls({
  fallbackPrice,
  ctaLabel,
  companion = null,
}: VariantPurchaseControlsProps) {
  const {
    variants,
    selectedVariant,
    optionNames,
    selectedOptions,
    selectOption,
  } = useVariantSelection();

  const price = selectedVariant.price ?? fallbackPrice;
  const compareAt = selectedVariant.compareAtPrice;
  const savings = computeSavings(price, compareAt);

  return (
    <>
      {selectedVariant.sku && (
        <p className="mt-2 text-sm text-black/60">
          SKU: <span className="font-mono">{selectedVariant.sku}</span>
        </p>
      )}

      <div className="mt-4 flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-2 flex-wrap">
          <PriceDisplay
            money={price}
            className="text-3xl md:text-4xl font-bold text-black tracking-tight"
          />
          <span className="text-sm text-black/50">inc GST</span>
          {compareAt && (
            <s className="ml-2 text-base text-black/60">
              <PriceDisplay money={compareAt} />
            </s>
          )}
          {savings && (
            <span className="text-sm font-semibold text-brand-blue">
              Save {savings.amount} ({savings.percent}%)
            </span>
          )}
        </div>
        <span className="text-sm text-black/50">
          Same price retail or trade
        </span>
      </div>

      {variants.length > 1 && optionNames.length > 0 && (
        <div className="mt-6 space-y-4" aria-label="Product options">
          {optionNames.map((name) => {
            const values = Array.from(
              new Set(
                variants
                  .map(
                    (variant) =>
                      variant.selectedOptions.find(
                        (option) => option.name === name,
                      )?.value,
                  )
                  .filter((value): value is string => Boolean(value)),
              ),
            );

            return (
              <fieldset key={name}>
                <legend className="text-sm font-semibold text-black">
                  {normaliseOptionName(name)}:{' '}
                  <span className="font-normal text-black/70">
                    {selectedOptions.get(name)}
                  </span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {values.map((value) => {
                    const selected = selectedOptions.get(name) === value;
                    const candidates = variants.filter((variant) =>
                      variant.selectedOptions.some(
                        (option) =>
                          option.name === name && option.value === value,
                      ),
                    );
                    const available = candidates.some(
                      (variant) => variant.availableForSale,
                    );

                    const colourOption = isColourOptionName(name);

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectOption(name, value)}
                        aria-pressed={selected}
                        aria-label={`${normaliseOptionName(name)}: ${value}`}
                        className={
                          colourOption
                            ? selected
                              ? 'inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black cursor-pointer'
                              : 'inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black hover:border-black cursor-pointer transition-colors'
                            : selected
                              ? 'min-h-11 rounded-md border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white cursor-pointer'
                              : available
                                ? 'min-h-11 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black hover:border-black cursor-pointer transition-colors'
                                : 'min-h-11 rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-black/45 line-through cursor-pointer'
                        }
                      >
                        {colourOption && (
                          <ColourSwatch
                            value={value}
                            selected={selected}
                            unavailable={!available}
                          />
                        )}
                        <span className={!available && !colourOption ? 'line-through' : ''}>
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <AddToCartButton
          variantId={selectedVariant.id}
          available={selectedVariant.availableForSale}
          unitPrice={price}
          companion={companion}
          label={ctaLabel}
          enableBuyNow
        />
        {selectedVariant.availableForSale && <DispatchCountdown />}
      </div>
    </>
  );
}

function normaliseOptionName(name: string): string {
  if (name.toLowerCase() === 'color') return 'Colour';
  return name;
}

function computeSavings(
  current: Money,
  compareAt: Money | null,
): { amount: string; percent: number } | null {
  if (!compareAt || compareAt.currencyCode !== current.currencyCode) return null;
  const currentValue = Number.parseFloat(current.amount);
  const compareValue = Number.parseFloat(compareAt.amount);
  if (!Number.isFinite(currentValue) || !Number.isFinite(compareValue)) {
    return null;
  }
  const diff = compareValue - currentValue;
  if (diff <= 0) return null;
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: current.currencyCode,
  }).format(diff);
  return {
    amount: formatted,
    percent: Math.round((diff / compareValue) * 100),
  };
}
