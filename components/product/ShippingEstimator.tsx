'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  estimateProductShipping,
  type ShippingEstimateOption,
} from '@/lib/shopify/cart';
import type { ShippingTier } from '@/types/product';

const STORAGE_KEY = 'enviroaqua:delivery-postcode';

interface ShippingEstimatorProps {
  variantId: string;
  tier: ShippingTier;
}

function formatMoney(option: ShippingEstimateOption): string {
  const amount = Number.parseFloat(option.estimatedCost.amount);
  if (!Number.isFinite(amount)) return option.estimatedCost.amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: option.estimatedCost.currencyCode,
  }).format(amount);
}

export function ShippingEstimator({
  variantId,
  tier,
}: ShippingEstimatorProps) {
  const [postcode, setPostcode] = useState('');
  const [resultPostcode, setResultPostcode] = useState<string | null>(null);
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [options, setOptions] = useState<ReadonlyArray<ShippingEstimateOption>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && /^\d{4}$/.test(saved)) setPostcode(saved);
    } catch {
      // localStorage may be unavailable in privacy mode.
    }
  }, []);

  const cheapest = useMemo(() => {
    return [...options].sort(
      (a, b) =>
        Number.parseFloat(a.estimatedCost.amount) -
        Number.parseFloat(b.estimatedCost.amount),
    )[0] ?? null;
  }, [options]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOptions([]);
    setResultPostcode(null);
    setProvinceCode(null);

    const clean = postcode.trim();
    if (!/^\d{4}$/.test(clean)) {
      setError('Enter a valid 4-digit Australian postcode.');
      return;
    }

    setIsChecking(true);
    try {
      const result = await estimateProductShipping(variantId, clean);
      if (!result.ok) {
        setError(result.error ?? 'Could not calculate delivery right now.');
        return;
      }

      setResultPostcode(result.postcode);
      setProvinceCode(result.provinceCode);
      setOptions(result.options);
      try {
        window.localStorage.setItem(STORAGE_KEY, result.postcode);
      } catch {
        // Ignore storage errors; the quote itself still works.
      }
    } finally {
      setIsChecking(false);
    }
  }

  const noRateMessage =
    tier === 'T6' && provinceCode === 'NT'
      ? 'Bulky freight to the Northern Territory requires a freight quote.'
      : tier === 'T7'
        ? 'This product is available for Click & Collect only.'
        : 'No delivery option is available for this product to that postcode.';

  return (
    <div className="mt-2 pt-3 border-t border-gray-200">
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-black/70">
            Check delivery to your postcode
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{4}"
            maxLength={4}
            value={postcode}
            onChange={(event) =>
              setPostcode(event.target.value.replace(/\D/g, '').slice(0, 4))
            }
            placeholder="2259"
            className="w-28 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            aria-label="Australian postcode"
          />
        </label>
        <button
          type="submit"
          disabled={isChecking}
          className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? 'Checking…' : 'Check'}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultPostcode && cheapest && (
        <div className="mt-3 text-sm text-black">
          <p>
            <strong className="font-semibold">
              Delivery to {resultPostcode}: {formatMoney(cheapest)}
            </strong>
            {provinceCode ? ` - ${provinceCode}` : ''}
          </p>
          {cheapest.title && (
            <p className="mt-0.5 text-xs text-black/60">{cheapest.title}</p>
          )}
        </div>
      )}

      {resultPostcode && !cheapest && !error && (
        <p className="mt-3 text-sm text-black">
          <strong className="font-semibold">{noRateMessage}</strong>
        </p>
      )}
    </div>
  );
}
