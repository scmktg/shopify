import Link from 'next/link';
import { Truck } from 'lucide-react';
import type { ShippingTier } from '@/types/product';
import { ShippingEstimator } from './ShippingEstimator';

interface ShippingTierBlockProps {
  tier: ShippingTier | null;
  productHandle: string;
  variantId: string | null;
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
        Amsterdam Cct, Wyong NSW 2259, Mon&ndash;Fri 9am&ndash;5pm AEST.
      </>
    ),
    clickAndCollect: (
      <>
        Same-day pickup on orders before 12pm AEST &mdash; we&apos;ll email or
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
        &mdash; we can sometimes arrange a courier for an additional fee, case
        by case.
      </>
    ),
  },
};

export function ShippingTierBlock({
  tier,
  productHandle,
  variantId,
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

  return (
    <section
      aria-label="Shipping for this product"
      className="mt-6 p-4 border border-gray-200 rounded bg-gray-50 text-sm text-black"
    >
      <div className="flex items-start gap-3">
        <Truck
          className="h-4 w-4 mt-1 flex-shrink-0 text-black/70"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1.5">
          <p>{copy.lead}</p>
          <p className="text-black/80">{copy.clickAndCollect}</p>
          <p className="text-black/80">{copy.trailing}</p>
          {resolvedTier && resolvedTier !== 'T7' && variantId && (
            <ShippingEstimator variantId={variantId} tier={resolvedTier} />
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
    </section>
  );
}
