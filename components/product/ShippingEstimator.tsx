'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  estimateProductShippingFromEngine,
  type ShippingEstimateOption,
} from '@/lib/shopify/cart';
import type { ShippingTier } from '@/types/product';

const STORAGE_KEY = 'enviroaqua:delivery-postcode';

interface ShippingEstimatorProps {
  variantId: string;
  tier: ShippingTier;
  onQuoteProvince?: (provinceCode: string | null) => void;
  compact?: boolean;
  freeShipping?: boolean;
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
  onQuoteProvince,
  compact = false,
  freeShipping = false,
}: ShippingEstimatorProps) {
  const [postcode, setPostcode] = useState('');
  const [resultPostcode, setResultPostcode] = useState<string | null>(null);
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [options, setOptions] = useState<ReadonlyArray<ShippingEstimateOption>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suburb, setSuburb] = useState('');
  const [availableSuburbs, setAvailableSuburbs] = useState<ReadonlyArray<string>>([]);

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
      const result = await estimateProductShippingFromEngine(variantId, clean, suburb);
      if (!result.ok) {
        if (result.needsSuburb) {
          setAvailableSuburbs(result.suburbs ?? []);
          setError(null);
        } else {
          setAvailableSuburbs([]);
          setError(result.error ?? 'Could not calculate delivery right now.');
        }
        return;
      }
      setAvailableSuburbs([]);
      setError(null);

      setResultPostcode(result.postcode);
      setProvinceCode(result.provinceCode);
      onQuoteProvince?.(result.provinceCode);
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
        : 'We couldn’t confirm a shipping price for this postcode. Please check at checkout.';

  return (
    <div className={compact ? "mt-2" : "mt-2 border-t border-gray-200 pt-3"}>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className={compact ? "text-[11px] font-medium text-slate-500" : "text-xs font-semibold text-black/70"}>
            {compact ? "Delivery postcode" : "Check delivery to your postcode"}
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{4}"
            maxLength={4}
            value={postcode}
            onChange={(event) =>
              { setPostcode(event.target.value.replace(/\D/g, '').slice(0, 4)); setSuburb(''); setAvailableSuburbs([]); setResultPostcode(null); setOptions([]); }
            }
            placeholder="2259"
            className={compact
              ? "h-9 w-28 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-sky-700 focus:ring-1 focus:ring-sky-200"
              : "w-28 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"}
            aria-label="Australian postcode"
          />
        </label>
        <button
          type="submit"
          disabled={isChecking}
          className={compact
            ? "h-9 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"}
        >
          {isChecking ? 'Checking…' : 'Check'}
        </button>
      </form>

      {availableSuburbs.length > 0 && (
        <div className="mt-3">
          <label htmlFor="shipping-quote-suburb" className="block text-xs font-semibold text-black/70">
            This postcode covers different delivery zones. Select your suburb.
          </label>
          <select
            id="shipping-quote-suburb"
            value={suburb}
            onChange={(event) => { setSuburb(event.target.value); setOptions([]); setResultPostcode(null); }}
            className="mt-1 w-full max-w-xs rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
          >
            <option value="">Select suburb</option>
            {availableSuburbs.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <p className="mt-1 text-xs text-black/60">Then press Check to see your shipping price.</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultPostcode && cheapest && (
        <div className="mt-3 text-sm text-black">
          <p>
            <strong className="font-semibold">
              {freeShipping && Number(cheapest.estimatedCost.amount) === 0
                ? `Free shipping to ${resultPostcode}`
                : freeShipping
                  ? `Remote delivery to ${resultPostcode}: ${formatMoney(cheapest)}`
                  : `Delivery to ${resultPostcode}: ${formatMoney(cheapest)}`}
            </strong>
            {provinceCode ? ` - ${provinceCode}` : ''}
          </p>
          {cheapest.title && !compact && (
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
