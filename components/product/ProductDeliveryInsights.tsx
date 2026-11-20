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
// Display observed percentages for small samples too; do not infer NT data from WA.
const DELIVERY: Record<StateCode, StateDelivery> = {
  NSW: { name: 'New South Wales', typical: '1–3 days', milestones: [{ days: 1, percent: 63 }, { days: 2, percent: 76 }, { days: 3, percent: 92 }] },
  VIC: { name: 'Victoria', typical: '2–4 days', milestones: [{ days: 2, percent: 53 }, { days: 4, percent: 81 }, { days: 6, percent: 97 }] },
  QLD: { name: 'Queensland', typical: '2–5 days', milestones: [{ days: 2, percent: 48 }, { days: 4, percent: 78 }, { days: 6, percent: 91 }] },
  ACT: { name: 'Australian Capital Territory', typical: '2–4 days', milestones: [{ days: 2, percent: 33 }, { days: 3, percent: 67 }, { days: 4, percent: 100 }] },
  SA: { name: 'South Australia', typical: '3–6 days', milestones: [{ days: 3, percent: 18 }, { days: 5, percent: 59 }, { days: 7, percent: 88 }] },
  TAS: { name: 'Tasmania', typical: '4–7 days', milestones: [{ days: 5, percent: 22 }, { days: 7, percent: 89 }, { days: 9, percent: 100 }] },
  WA: { name: 'Western Australia', typical: '5–9 days', milestones: [{ days: 7, percent: 10 }, { days: 9, percent: 81 }, { days: 10, percent: 90 }] },
  NT: { name: 'Northern Territory', typical: '5–9 days' },
};

interface ProductDeliveryInsightsProps {
  tier: ShippingTier;
}

export function ProductDeliveryInsights({ tier }: ProductDeliveryInsightsProps) {
  const [state, setState] = useState<StateCode>('NSW');
  const { selectedVariant } = useVariantSelection();
  const selected = DELIVERY[state];

  return (
    <section aria-label="Delivery times and shipping costs" className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-800">
      <div className="border-b border-slate-100 bg-sky-50/60 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <PackageCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sky-800" />
          <div>
            <h2 className="font-semibold text-slate-950">Fast dispatch from Wyong, NSW</h2>
            <p className="mt-1 leading-6">
              <strong>Before 12pm on business days:</strong> normally dispatched the same day.
              <br />
              <strong>After 12pm:</strong> normally dispatched the next business day.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-950">Delivery times after dispatch</h3>
            <p className="mt-0.5 text-xs text-slate-500">Select your state to see recent delivery performance.</p>
          </div>
          <label className="sr-only" htmlFor="product-delivery-state">Delivery state</label>
          <select
            id="product-delivery-state"
            value={state}
            onChange={(event) => setState(event.target.value as StateCode)}
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            {(Object.keys(DELIVERY) as StateCode[]).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        {selected.milestones ? (
          <div className="mt-5 space-y-3">
            {selected.milestones.map(({ days, percent }) => (
              <div key={days}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700">Within {days} {days === 1 ? 'day' : 'days'}</span>
                  <span className="text-base font-semibold tabular-nums text-sky-800">{percent}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`Delivered within ${days} days`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <div className="h-full rounded-full bg-sky-700" style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="font-semibold text-slate-900">Typical delivery: {selected.typical} after dispatch</p>
            <p className="mt-1 text-xs text-slate-600">
              {state === 'NT'
                ? 'Planning estimate based on WA transit times.'
                : 'Not enough recent delivered parcels to show reliable percentages.'}
            </p>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">Data is calculated from the last 90 days of orders.{state === 'ACT' ? ' Based on 3 verified deliveries.' : state === 'TAS' ? ' Based on 9 verified deliveries.' : ''}</p>
      </div>

      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
        <h3 className="flex items-center gap-2 font-semibold text-slate-950">
          <Truck aria-hidden="true" className="h-4 w-4 text-sky-800" />
          Check shipping cost
        </h3>
        <p className="mt-1 text-xs text-slate-600">Enter your postcode for this product's available delivery rates.</p>
        <ShippingEstimator
          variantId={selectedVariant.id}
          tier={tier}
          onQuoteProvince={(province) => {
            if (province && Object.prototype.hasOwnProperty.call(DELIVERY, province)) {
              setState(province as StateCode);
            }
          }}
        />
        <p className="mt-3 text-xs text-slate-500">
          <Link href="/shipping/" className="underline underline-offset-2 hover:text-sky-800">Shipping details</Link>
          {' · '}Final delivery charge confirmed at checkout.
        </p>
      </div>
    </section>
  );
}
