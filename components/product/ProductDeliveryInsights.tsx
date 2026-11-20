'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PackageCheck, Truck } from 'lucide-react';
import type { ShippingTier } from '@/types/product';
import { ShippingEstimator } from './ShippingEstimator';
import { useVariantSelection } from './VariantSelectionProvider';

type StateCode = 'NSW' | 'VIC' | 'QLD' | 'ACT' | 'SA' | 'TAS' | 'WA' | 'NT';
type DeliveryMilestone = { days: number; percent: number };
type StateDelivery = {
  milestones?: readonly DeliveryMilestone[];
};

// Calculated from verified Aramex deliveries within the 90-day export window.
// Choose observed milestones below 100%; NT uses WA as a clearly labelled proxy.
const DELIVERY: Record<StateCode, StateDelivery> = {
  NSW: { name: 'New South Wales', typical: '1–3 days', milestones: [{ days: 1, percent: 63 }, { days: 2, percent: 76 }, { days: 3, percent: 92 }] },
  VIC: { name: 'Victoria', typical: '2–4 days', milestones: [{ days: 2, percent: 53 }, { days: 4, percent: 81 }] },
  QLD: { name: 'Queensland', typical: '2–5 days', milestones: [{ days: 2, percent: 48 }, { days: 4, percent: 78 }, { days: 6, percent: 91 }] },
  ACT: { name: 'Australian Capital Territory', typical: '2–4 days', milestones: [{ days: 2, percent: 33 }, { days: 3, percent: 67 }] },
  SA: { name: 'South Australia', typical: '3–6 days', milestones: [{ days: 3, percent: 18 }, { days: 5, percent: 59 }, { days: 7, percent: 88 }] },
  TAS: { name: 'Tasmania', typical: '4–7 days', milestones: [{ days: 5, percent: 22 }, { days: 7, percent: 89 }] },
  WA: { name: 'Western Australia', typical: '5–9 days', milestones: [{ days: 7, percent: 10 }, { days: 9, percent: 81 }, { days: 10, percent: 90 }] },
  NT: { name: 'Northern Territory', typical: '5–9 days', milestones: [{ days: 7, percent: 10 }, { days: 9, percent: 81 }, { days: 10, percent: 90 }] },
};


interface ProductDeliveryInsightsProps {
  tier: ShippingTier;
  bulky?: boolean;
  fountain?: boolean;
  pickupOnly?: boolean;
  quoteOnly?: boolean;
  productHandle?: string;
}

export function ProductDeliveryInsights({
  tier, bulky = false, fountain = false, pickupOnly = false,
  quoteOnly = false, productHandle,
}: ProductDeliveryInsightsProps) {
  const [state, setState] = useState<StateCode>('NSW');
  const { selectedVariant } = useVariantSelection();
  const selected = DELIVERY[state];
  const inStock = selectedVariant.availableForSale &&
    (selectedVariant.quantityAvailable == null || selectedVariant.quantityAvailable > 0);
  const isTank = productHandle ? /chemical-dosing-tank/i.test(productHandle) : false;
  const showPerformance = !pickupOnly && !quoteOnly;

  return (
    <section aria-label="Dispatch, delivery times and shipping cost"
      className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-[13px] leading-5 text-slate-800">
      <div className="px-3.5 py-3 sm:px-4">
        <div className="flex items-start gap-2.5">
          <PackageCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sky-800" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-semibold text-slate-950">Fast dispatch from Wyong, NSW</h2>
            <p className="mt-0.5 text-[12px] leading-[18px] text-slate-600">
              {pickupOnly
                ? 'Free collection from Wyong, NSW. We’ll notify you when ready.'
                : !inStock
                  ? 'Dispatch timing confirmed when stock is available.'
                  : 'Order before 12pm on a business day for same-day dispatch; otherwise next business day.'}
            </p>
          </div>
        </div>
        {fountain && !pickupOnly && !quoteOnly && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2">
            <div className="flex items-center gap-2">
              <Truck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
              <strong className="text-[13px] font-semibold text-emerald-800">FREE SHIPPING</strong>
              <span className="text-[11px] text-emerald-900">Metro &amp; regional Australia</span>
            </div>
            <p className="mt-0.5 pl-6 text-[11px] leading-4 text-slate-600">
              Remote postcodes incur an additional fee. Check your postcode below.
            </p>
          </div>
        )}
      </div>

      {showPerformance && (
        <div className="border-t border-slate-100 px-3.5 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-slate-950">Delivery times after dispatch</h3>
              {bulky && (
                <p className="text-[11px] leading-4 text-slate-500">
                  Parcel delivery history; large-item freight may take longer.
                </p>
              )}
            </div>
            <label htmlFor="product-delivery-state" className="sr-only">Delivery state</label>
            <select id="product-delivery-state" value={state}
              onChange={(event) => setState(event.target.value as StateCode)}
              className="min-h-9 w-[82px] shrink-0 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
              {(Object.keys(DELIVERY) as StateCode[]).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid gap-x-3 gap-y-2 sm:grid-cols-3">
            {selected.milestones?.map(({ days, percent }) => (
              <div key={days} className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="whitespace-nowrap text-[11px] text-slate-600">Within {days} {days === 1 ? 'day' : 'days'}</span>
                  <span className="text-xs font-semibold tabular-nums text-sky-800">{percent}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar" aria-label={`Delivered within ${days} days`}
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                  <div className="h-full rounded-full bg-sky-700" style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[10px] leading-4 text-slate-500">
            {state === 'NT'
              ? 'NT uses WA delivery data as a guide.'
              : 'Data is calculated from the last 90 days of orders.'}
          </p>
        </div>
      )}

      <div className="border-t border-slate-100 px-3.5 py-3 sm:px-4">
        {pickupOnly ? (
          <p className="text-xs text-slate-600">
            Need delivery instead? <Link href="/contact/" className="font-semibold underline underline-offset-2">Contact us</Link> for options.
          </p>
        ) : quoteOnly ? (
          <p className="text-xs text-slate-600">
            Specialist freight is quoted separately. <Link href="/contact/" className="font-semibold underline underline-offset-2">Contact us</Link> for delivery pricing.
          </p>
        ) : (
          <>
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-slate-950">
              <Truck aria-hidden="true" className="h-4 w-4 text-sky-800" />
              {fountain ? 'Check your postcode for remote fees' : 'Check shipping cost'}
            </h3>
            <ShippingEstimator
              variantId={selectedVariant.id}
              tier={tier}
              compact
              freeShipping={fountain}
              onQuoteProvince={(province) => {
                if (province && Object.prototype.hasOwnProperty.call(DELIVERY, province)) {
                  setState(province as StateCode);
                }
              }}
            />
          </>
        )}
        <p className="mt-2 text-[10px] text-slate-500">
          <Link href="/shipping/" className="underline underline-offset-2 hover:text-sky-800">Shipping details</Link>
          {' · '}Final shipping cost confirmed at checkout.
        </p>
      </div>
    </section>
  );
}
