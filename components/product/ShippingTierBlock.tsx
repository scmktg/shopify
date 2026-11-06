import Link from 'next/link';
import { MapPin, Truck } from 'lucide-react';
import type { ShippingTier } from '@/types/product';
import { VariantShippingEstimator } from './VariantShippingEstimator';
import { VariantDispatchCountdown } from './VariantDispatchCountdown';

interface ShippingTierBlockProps {
  tier: ShippingTier | null;
  productHandle: string;
  combinedBubblerShipping?: boolean;
}

interface TierCopy {
  lead: React.ReactNode;
  clickAndCollect: React.ReactNode;
  trailing: React.ReactNode;
}

const TIER_COPY: Record<ShippingTier, TierCopy> = {
  T1: {
    lead: (
      <>
        <strong className="font-semibold">Australia-wide delivery.</strong>{' '}
        Shipping is calculated at checkout based on the packed weight and delivery destination.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T2: {
    lead: (
      <>
        <strong className="font-semibold">Australia-wide delivery.</strong>{' '}
        Shipping is calculated at checkout based on the packed weight and delivery destination.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T3: {
    lead: (
      <>
        <strong className="font-semibold">Australia-wide delivery.</strong>{' '}
        Shipping is calculated at checkout based on the packed weight and delivery destination.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T4: {
    lead: (
      <>
        <strong className="font-semibold">Australia-wide delivery.</strong>{' '}
        Shipping is calculated at checkout based on the packed weight and delivery destination.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T5: {
    lead: (
      <>
        <strong className="font-semibold">Free delivery Australia-wide.</strong>
      </>
    ),
    clickAndCollect: (
      <>Free Click &amp; Collect from our Wyong NSW showroom.</>
    ),
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T6: {
    lead: (
      <>
        <strong className="font-semibold">Bulky freight delivery.</strong>
        <br />
        NSW and ACT $99. Victoria and Queensland $159. South Australia $179.
        WA and Tasmania $249. Northern Territory requires a freight quote.
      </>
    ),
    clickAndCollect: (
      <>
        Free Click &amp; Collect from our Wyong NSW showroom &mdash; no freight
        cost if you pick up.
      </>
    ),
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T7: {
    lead: (
      <>
        <strong className="font-semibold">
          Click &amp; Collect only from our Wyong NSW showroom.
        </strong>
        <br />
        This product isn&apos;t available for shipping. Pick up free from 6/45
        Amsterdam Cct, Wyong NSW 2259, Mon-Fri 9am-3pm AEST.
      </>
    ),
    clickAndCollect: (
      <>
        Same-day pickup on orders before 12pm AEST - we&apos;ll email or
        text you when it&apos;s ready.
      </>
    ),
    trailing: (
      <>
        Need it shipped? Call{' '}
        <a
          href="tel:+61287728162"
          className="font-semibold hover:text-brand-blue"
        >
          (02) 8772 8162
        </a>{' '}
        - we can sometimes arrange a courier for an additional fee, case
        by case.
      </>
    ),
  },
};

export function ShippingTierBlock({
  tier,
  productHandle,
  combinedBubblerShipping = false,
}: ShippingTierBlockProps) {
  const resolvedTier: ShippingTier | null = tier;
  if (resolvedTier === null) {
    console.error(
      `[ShippingTierBlock] Product "${productHandle}" has no shipping_tier metafield.`,
    );
  }
  const copy = resolvedTier
    ? TIER_COPY[resolvedTier]
    : {
        lead: (
          <>
            <strong className="font-semibold">Shipping calculated at checkout.</strong>
          </>
        ),
        clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
        trailing: <>Shopify checkout will show the available delivery options.</>,
      };

  if (combinedBubblerShipping && resolvedTier === 'T5') {
    return (
      <section
        aria-label="Delivery, availability and collection"
        className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3.5">
          <Truck aria-hidden="true" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-700" />
          <strong className="text-[15px] font-bold tracking-tight text-emerald-700">FREE SHIPPING</strong>
          <span className="text-[13px] text-neutral-500">Australia-wide</span>
        </div>
        <div className="space-y-3 border-t border-neutral-100 px-4 py-3">
          <VariantDispatchCountdown minimal />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-500" />
            <span className="font-medium">Free Click &amp; Collect</span>
            <span className="text-neutral-300" aria-hidden="true">/</span>
            <span className="text-neutral-600">Wyong NSW</span>
          </div>
        </div>
        <p className="border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-[11px] leading-relaxed text-neutral-500">
          Some remote areas may incur a shipping charge; we&apos;ll confirm any cost before fulfilment.
          {' '}<a href="tel:+61287728162" className="font-medium underline underline-offset-2 hover:text-neutral-900">Questions? (02) 8772 8162</a>
        </p>
      </section>
    );
  }

  // Free-delivery products do not need a postcode quote. Show the
  // benefit immediately instead of making customers open an estimator.
  if (resolvedTier === 'T5') {
    return (
      <div className="mt-4 overflow-hidden rounded border border-gray-200 bg-gray-50 text-sm text-black">
        <div className="flex min-h-11 items-center gap-2 px-4 py-2.5 font-semibold">
          <Truck
            className="h-4 w-4 flex-shrink-0 text-black/70"
            aria-hidden="true"
          />
          <span>Free Delivery Australia Wide</span>
        </div>
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex flex-col gap-1.5">
            <p>{copy.clickAndCollect}</p>
            <p className="text-black/80">{copy.trailing}</p>
            <p className="mt-1 text-xs text-black/60">
              <Link
                href="/shipping/"
                className="underline underline-offset-4 hover:text-brand-blue"
              >
                See full shipping details
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <details
      className="group mt-4 overflow-hidden rounded border border-gray-200 bg-gray-50 text-sm text-black"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 font-semibold hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <Truck
            className="h-4 w-4 flex-shrink-0 text-black/70"
            aria-hidden="true"
          />
          {resolvedTier === 'T7' ? 'Pickup information' : 'Check shipping price'}
        </span>
        <span
          aria-hidden="true"
          className="text-lg font-normal leading-none text-black/50 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <p>{copy.lead}</p>
          <p className="text-black/80">{copy.clickAndCollect}</p>
          <p className="text-black/80">{copy.trailing}</p>
          {resolvedTier && resolvedTier !== 'T7' && (
            <VariantShippingEstimator tier={resolvedTier} />
          )}
          <p className="mt-1 text-xs text-black/60">
            <Link
              href="/shipping/"
              className="underline underline-offset-4 hover:text-brand-blue"
            >
              See full shipping details
            </Link>
          </p>
        </div>
      </div>
    </details>
  );
}
