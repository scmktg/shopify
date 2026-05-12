import Link from 'next/link';
import { Truck } from 'lucide-react';
import type { ShippingTier } from '@/types/product';

interface ShippingTierBlockProps {
  tier: ShippingTier | null;
  productHandle: string;
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
        <strong className="font-semibold">Ships:</strong> Australia-wide for
        $9.95 standard, or $17.95 express.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T2: {
    lead: (
      <>
        <strong className="font-semibold">Ships:</strong> Australia-wide for
        $14.95 standard, or $22.95 express.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T3: {
    lead: (
      <>
        <strong className="font-semibold">Ships:</strong> Australia-wide for
        $19.95 standard, or $29.95 express.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T4: {
    lead: (
      <>
        <strong className="font-semibold">Ships:</strong> Australia-wide for
        $29.95 standard, or $41.95 express.
      </>
    ),
    clickAndCollect: <>Free Click &amp; Collect from our Wyong NSW showroom.</>,
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T5: {
    lead: (
      <>
        <strong className="font-semibold">Ships free Australia-wide.</strong>{' '}
        Delivered by Allied Express or Aramex bulky freight, 3&ndash;10 business
        days depending on state.
      </>
    ),
    clickAndCollect: (
      <>
        Free Click &amp; Collect from our Wyong NSW showroom (in stock for
        immediate pickup).
      </>
    ),
    trailing: <>Same-day dispatch on orders before 12pm AEST.</>,
  },
  T6: {
    lead: (
      <>
        <strong className="font-semibold">
          Ships for $99&ndash;$249 depending on your state.
        </strong>
        <br />
        Sydney, Central Coast, Newcastle and ACT $99. Other capital cities
        $179. Regional and remote $249.
        <br />
        Delivered by pallet freight, 5&ndash;14 business days.
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
}: ShippingTierBlockProps) {
  const resolvedTier: ShippingTier = tier ?? 'T2';
  if (tier === null && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[ShippingTierBlock] Product "${productHandle}" has no shipping_tier metafield; defaulting to T2.`,
    );
  }
  const copy = TIER_COPY[resolvedTier];

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
