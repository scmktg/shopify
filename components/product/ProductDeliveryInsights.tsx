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
  name: string;
  typical: string;
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
                  : 'Order before 12pm on a business day for same-day dispatch.  After 12pm will be next business day.'}
            </p>
          </div>
        </div>
        {fountain && !pickupOnly && !quoteOnly && (
          <div className="mt-3 flex items-start gap-2.5 border-t border-slate-100 pt-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Truck aria-hidden="true" className="h-4 w-4 text-slate-700" />
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <strong className="text-[13px] font-bold tracking-tight text-slate-950">Free shipping</strong>
                <span className="text-[11px] text-slate-600">Metro &amp; regional Australia</span>
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                Remote postcodes incur an additional fee. Check yours below.
              </p>
            </div>
          </div>
        )}
      </div>

      {showPerformance && (
        <div className="border-t border-slate-100 px-3.5 py-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-slate-950">Delivery times after dispatch</h3>
              <p className="text-[11px] leading-4 text-slate-500">See results for your state</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/70 py-1 pl-2.5 pr-1">
              <label htmlFor="product-delivery-state" className="whitespace-nowrap text-[11px] font-semibold text-slate-700">
                Delivering to
              </label>
              <select id="product-delivery-state" value={state}
                onChange={(event) => setState(event.target.value as StateCode)}
                className="min-h-8 max-w-[136px] rounded-md border border-sky-200 bg-white px-2 text-xs font-semibold text-slate-950 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
                {(Object.keys(DELIVERY) as StateCode[]).map((code) => (
                  <option key={code} value={code}>{DELIVERY[code].name}</option>
                ))}
              </select>
            </div>
          </div>
          <p aria-live="polite" className="mt-2 text-[12px] font-semibold text-slate-800">
            {state === 'NT'
              ? 'Delivery guide for Northern Territory'
              : `Deliveries to ${selected.name}`}
          </p>
          {bulky && (
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              Parcel delivery history; large-item freight may take longer.
            </p>
          )}

          <div className={selected.milestones?.length === 2
              ? "mt-3 grid grid-cols-2 gap-3"
              : "mt-3 grid grid-cols-3 gap-2.5"}>
            {selected.milestones?.map(({ days, percent }) => (
              <div key={days} className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-1 gap-y-0">
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
