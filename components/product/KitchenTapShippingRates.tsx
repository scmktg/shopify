'use client';

import { Truck } from 'lucide-react';
import { VariantDispatchCountdown } from './VariantDispatchCountdown';

/** Elegant, lightweight stock and shipping information for kitchen taps. */
export function KitchenTapShippingRates() {
  return (
    <section
      aria-label="Availability and delivery"
      className="mt-5 border-y border-neutral-200 py-4 text-sm text-neutral-800"
    >
      <VariantDispatchCountdown compact />
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
        <Truck aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-500" />
        <span className="font-medium">Australia-wide delivery</span>
        <span aria-hidden="true" className="text-neutral-300">/</span>
        <span>Standard <strong className="font-semibold">$15</strong></span>
        <span aria-hidden="true" className="text-neutral-300">·</span>
        <span>Express <strong className="font-semibold">$25</strong></span>
      </div>
      <p className="mt-2 pl-6 text-xs leading-relaxed text-neutral-500">
        Tap-only shipping. Mixed orders calculated at checkout.
      </p>
    </section>
  );
}
