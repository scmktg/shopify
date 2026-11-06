'use client';

import { Truck } from 'lucide-react';
import { VariantDispatchCountdown } from './VariantDispatchCountdown';

/** Compact availability and flat-rate shipping summary for 3-way kitchen taps. */
export function KitchenTapShippingRates() {
  return (
    <section
      aria-label="Stock and delivery information"
      className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-black"
    >
      <VariantDispatchCountdown compact />
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-200 pt-3">
        <Truck aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-blue" />
        <span className="font-semibold">Australia-wide shipping</span>
        <span className="text-black/40" aria-hidden="true">·</span>
        <span>Standard <strong>$15</strong></span>
        <span className="text-black/40" aria-hidden="true">·</span>
        <span>Express <strong>$25</strong></span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-black/60">
        Tap-only orders. Mixed-cart shipping is confirmed at checkout.
      </p>
    </section>
  );
}
