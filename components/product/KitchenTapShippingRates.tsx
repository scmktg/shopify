import { Truck, Zap } from 'lucide-react';

/**
 * Flat Australian shipping rates for the dedicated Kitchen 3-Way Taps
 * Shopify delivery profile. Displayed only on the eligible tap PDPs.
 */
export function KitchenTapShippingRates() {
  return (
    <section aria-label="Shipping options" className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-sm text-black">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold">Australia-wide delivery</h2>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Truck aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-blue" />
          <div>
            <p className="text-xs text-black/65">Standard delivery</p>
            <p className="text-lg font-semibold tabular-nums">$15</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Zap aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-blue" />
          <div>
            <p className="text-xs text-black/65">Express delivery</p>
            <p className="text-lg font-semibold tabular-nums">$25</p>
          </div>
        </div>
      </div>
      <p className="border-t border-gray-200 px-4 py-2.5 text-xs leading-relaxed text-black/60">
        Rates apply to tap-only orders within Australia. Shipping for orders with other products may differ and is confirmed at checkout.
      </p>
    </section>
  );
}
