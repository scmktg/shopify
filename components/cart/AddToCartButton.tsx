'use client';

import { useMemo, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import type { Money } from '@/types/product';
import { useCart } from './CartProvider';

export interface CompanionPurchaseItem {
  title: string;
  variantId: string;
  price: Money;
  /** Automatic Shopify saving applied when this matching item is bought with the primary item. */
  bundleDiscount?: Money | null;
  available: boolean;
  /** Live Shopify quantity. Zero can still be orderable when inventory policy is CONTINUE. */
  quantityAvailable?: number | null;
}

interface AddToCartButtonProps {
  variantId: string;
  available: boolean;
  /** Live Shopify quantity for low-stock/backorder messaging. */
  inventoryQuantity?: number | null;
  /** Current selected-variant price. Used to show the live combined total. */
  unitPrice?: Money;
  /** Optional matching tank/bund sold as a separate Shopify line item. */
  companion?: CompanionPurchaseItem | null;
  /**
   * Label override from `products.json[handle].ctas.primary`. Falls
   * back to "Add to cart" when undefined. The unavailable / loading
   * states still take precedence over the override.
   */
  label?: string;
  /**
   * When true, renders a secondary "Buy now" button below the
   * primary Add-to-cart row. Buy-now adds the variant to the cart
   * (respecting the current quantity) and redirects to the Shopify
   * checkout URL - no drawer popup.
   */
  enableBuyNow?: boolean;
}

const MAX_QTY = 99;
const LOW_STOCK_THRESHOLD = 2;

export function AddToCartButton({
  variantId,
  available,
  inventoryQuantity = null,
  unitPrice,
  companion = null,
  label: labelOverride,
  enableBuyNow = false,
}: AddToCartButtonProps) {
  const { addItem, addItems, buyNow, buyNowItems, isMutating } = useCart();
  const [busy, setBusy] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [includeCompanion, setIncludeCompanion] = useState(false);

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

  const pairSelected = Boolean(
    includeCompanion && companion?.available && companion.variantId,
  );

  const primaryBackorder = Boolean(
    available && inventoryQuantity !== null && inventoryQuantity <= 0,
  );
  const companionBackorder = Boolean(
    pairSelected &&
      companion?.available &&
      companion.quantityAvailable !== null &&
      companion.quantityAvailable !== undefined &&
      companion.quantityAvailable <= 0,
  );
  const orderContainsBackorder = primaryBackorder || companionBackorder;

  const bundleDiscount = useMemo(() => {
    if (!companion?.bundleDiscount) return 0;
    if (companion.bundleDiscount.currencyCode !== companion.price.currencyCode) return 0;
    const value = Number.parseFloat(companion.bundleDiscount.amount);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [companion]);

  const companionEffectivePrice = useMemo(() => {
    if (!companion) return null;
    const value = Number.parseFloat(companion.price.amount);
    if (!Number.isFinite(value)) return null;
    return Math.max(0, value - bundleDiscount);
  }, [companion, bundleDiscount]);

  const displayedTotal = useMemo(() => {
    if (!unitPrice) return null;
    const primary = Number.parseFloat(unitPrice.amount);
    if (!Number.isFinite(primary)) return null;
    let perSet = primary;
    if (pairSelected && companion) {
      const extra = Number.parseFloat(companion.price.amount);
      if (Number.isFinite(extra)) perSet += extra - bundleDiscount;
    }
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: unitPrice.currencyCode,
    }).format(perSet * quantity);
  }, [unitPrice, pairSelected, companion, bundleDiscount, quantity]);

  const onAdd = async () => {
    if (busy || buyingNow || isMutating) return;
    setBusy(true);
    try {
      if (pairSelected && companion) {
        await addItems([
          { variantId, quantity },
          { variantId: companion.variantId, quantity },
        ]);
      } else {
        await addItem(variantId, quantity);
      }
    } finally {
      setBusy(false);
    }
  };

  const onBuyNow = async () => {
    if (busy || buyingNow || isMutating) return;
    setBuyingNow(true);
    try {
      if (pairSelected && companion) {
        await buyNowItems([
          { variantId, quantity },
          { variantId: companion.variantId, quantity },
        ]);
      } else {
        await buyNow(variantId, quantity);
      }
      // Successful buy-now navigates away. Keep the button disabled
      // until the page unloads; catch resets state on failure.
    } catch {
      setBuyingNow(false);
    }
  };

  const addLabel = !available
    ? 'Out of stock'
    : busy
      ? 'Adding…'
      : pairSelected
        ? orderContainsBackorder
          ? 'Add bundle to cart - backorder'
          : 'Add bundle to cart'
        : primaryBackorder
          ? 'Add to cart - backorder'
          : (labelOverride ?? 'Add to cart');

  const buyNowLabel = !available
    ? 'Out of stock'
    : buyingNow
      ? 'Redirecting…'
      : pairSelected
        ? orderContainsBackorder
          ? 'Buy bundle now - backorder'
          : 'Buy bundle now'
        : primaryBackorder
          ? 'Buy now - backorder'
          : 'Buy now';

  const anyBusy = busy || buyingNow || isMutating;
  const primaryStockMessage = getStockMessage(inventoryQuantity, available);
  const companionStockMessage = companion
    ? getStockMessage(companion.quantityAvailable ?? null, companion.available)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {primaryStockMessage && (
        <div
          className={`rounded-md px-4 py-3 text-sm font-semibold ${
            primaryStockMessage.kind === 'backorder'
              ? 'bg-amber-50 text-amber-900'
              : 'bg-orange-50 text-orange-800'
          }`}
          role="status"
        >
          {primaryStockMessage.text}
        </div>
      )}

      {companion && (
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
            includeCompanion
              ? 'border-brand-blue bg-brand-blue-light/60'
              : 'border-gray-300 bg-white hover:border-black/40'
          } ${!companion.available ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <span
            className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded border ${
              includeCompanion
                ? 'border-brand-blue bg-brand-blue text-white'
                : 'border-gray-400 bg-white'
            }`}
            aria-hidden="true"
          >
            {includeCompanion && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            checked={includeCompanion}
            onChange={(event) => setIncludeCompanion(event.target.checked)}
            disabled={!companion.available || anyBusy}
            className="sr-only"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black">
              Add matching {companion.title}
            </span>
            {bundleDiscount > 0 ? (
              <span className="mt-0.5 block text-sm font-medium text-brand-blue">
                Save {formatMoneyValue(bundleDiscount, companion.price.currencyCode)} when purchased together
              </span>
            ) : (
              <span className="mt-0.5 block text-sm text-black/65">
                Sold separately. Add it to this order in one click.
              </span>
            )}
            {companionStockMessage && (
              <span
                className={`mt-1 block text-xs font-semibold ${
                  companionStockMessage.kind === 'backorder'
                    ? 'text-amber-800'
                    : 'text-orange-700'
                }`}
              >
                {companionStockMessage.text}
              </span>
            )}
          </span>
          <span className="flex-none text-right text-sm text-black">
            {bundleDiscount > 0 && companionEffectivePrice !== null ? (
              <>
                <span className="block text-xs text-black/50 line-through">
                  +{formatMoney(companion.price)}
                </span>
                <span className="block font-semibold">
                  +{formatMoneyValue(companionEffectivePrice, companion.price.currencyCode)}
                </span>
              </>
            ) : (
              <span className="font-semibold">+{formatMoney(companion.price)}</span>
            )}
          </span>
        </label>
      )}

      {displayedTotal && (
        <div className="flex items-baseline justify-between gap-3 rounded-md bg-black/[0.04] px-4 py-3">
          <span className="text-sm font-medium text-black/70">
            {pairSelected ? 'Bundle total' : quantity > 1 ? 'Order total' : 'Current total'}
          </span>
          <span className="text-xl font-bold text-black">{displayedTotal}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div
          className="flex sm:inline-flex w-full sm:w-auto items-stretch h-12 border border-gray-300 rounded-md bg-white overflow-hidden"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={dec}
            disabled={quantity <= 1 || !available || anyBusy}
            aria-label="Decrease quantity"
            className="flex-1 sm:flex-none sm:w-11 inline-flex items-center justify-center text-black/70 hover:text-black hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" aria-hidden="true" strokeWidth={2.25} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QTY}
            value={quantity}
            onChange={(e) => onTyped(e.target.value)}
            aria-label="Quantity"
            className="w-14 flex-shrink-0 text-center text-black font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={inc}
            disabled={quantity >= MAX_QTY || !available || anyBusy}
            aria-label="Increase quantity"
            className="flex-1 sm:flex-none sm:w-11 inline-flex items-center justify-center text-black/70 hover:text-black hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={2.25} />
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

function getStockMessage(
  quantity: number | null,
  available: boolean,
): { kind: 'low' | 'backorder'; text: string } | null {
  if (!available || quantity === null) return null;
  if (quantity <= 0) {
    return {
      kind: 'backorder',
      text: 'Available on backorder - delivery up to 4 weeks.',
    };
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return {
      kind: 'low',
      text: `Only ${quantity} left in stock - order now.`,
    };
  }
  return null;
}

function formatMoney(money: Money): string {
  const amount = Number.parseFloat(money.amount);
  if (!Number.isFinite(amount)) return `${money.amount} ${money.currencyCode}`;
  return formatMoneyValue(amount, money.currencyCode);
}

function formatMoneyValue(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}
