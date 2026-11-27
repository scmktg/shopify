'use client';

import Link from 'next/link';
import { PackageCheck, Truck } from 'lucide-react';
import type { ShippingTier } from '@/types/product';
import { useVariantSelection } from './VariantSelectionProvider';

interface ProductDeliveryInsightsProps {
  tier: ShippingTier;
  bulky?: boolean;
  fountain?: boolean;
  pickupOnly?: boolean;
  quoteOnly?: boolean;
  productHandle?: string;
}

export function ProductDeliveryInsights({
  fountain = false, pickupOnly = false, quoteOnly = false,
}: ProductDeliveryInsightsProps) {
  const { selectedVariant } = useVariantSelection();
  const inStock = selectedVariant.availableForSale &&
    (selectedVariant.quantityAvailable == null || selectedVariant.quantityAvailable > 0);

  return (
    <section aria-label="Dispatch and shipping"
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
                Shipping charges may apply for remote areas. We&apos;ll confirm any cost with you before fulfilment.
              </p>
            </div>
          </div>
        )}
      </div>

      {(pickupOnly || quoteOnly) && (
        <div className="border-t border-slate-100 px-3.5 py-3 sm:px-4">
          {pickupOnly ? (
            <p className="text-xs text-slate-600">
              Need delivery instead? <Link href="/contact/" className="font-semibold underline underline-offset-2">Contact us</Link> for options.
            </p>
          ) : (
            <p className="text-xs text-slate-600">
              Specialist freight is quoted separately. <Link href="/contact/" className="font-semibold underline underline-offset-2">Contact us</Link> for delivery pricing.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
