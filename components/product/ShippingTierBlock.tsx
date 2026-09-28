import Link from 'next/link';
import { Truck } from 'lucide-react';
import type { ShippingClass, ShippingTier } from '@/types/product';

interface ShippingTierBlockProps {
  /**
   * Legacy prop retained during the Shopify metafield migration.
   * T1–T4 map to parcel, T5 to free, T6 to freight and T7 to pickup_only.
   */
  tier: ShippingTier | ShippingClass | null;
  productHandle: string;
}

function resolveShippingClass(
  value: ShippingTier | ShippingClass | null,
): ShippingClass | null {
  if (!value) return null;
  if (
    value === 'parcel' ||
    value === 'free' ||
    value === 'freight' ||
    value === 'pickup_only'
  ) {
    return value;
  }
  if (value === 'T5') return 'free';
  if (value === 'T6') return 'freight';
  if (value === 'T7') return 'pickup_only';
  return 'parcel';
}

export function ShippingTierBlock({
  tier,
  productHandle,
}: ShippingTierBlockProps) {
  const shippingClass = resolveShippingClass(tier);

  if (shippingClass === null) {
    console.error(
      `[ShippingTierBlock] Product "${productHandle}" has no shipping classification. Shopify checkout remains authoritative.`,
    );
  }

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
          {shippingClass === 'free' && (
            <>
              <p>
                <strong className="font-semibold">Free delivery Australia-wide.</strong>
              </p>
              <p className="text-black/80">
                Free Click &amp; Collect is also available from our Wyong NSW showroom.
              </p>
            </>
          )}

          {shippingClass === 'freight' && (
            <>
              <p>
                <strong className="font-semibold">Bulky freight delivery.</strong>{' '}
                The delivery charge is calculated by destination in Shopify checkout.
              </p>
              <p className="text-black/80">
                Free Click &amp; Collect is available from our Wyong NSW showroom.
              </p>
            </>
          )}

          {shippingClass === 'pickup_only' && (
            <>
              <p>
                <strong className="font-semibold">
                  Click &amp; Collect only — Wyong NSW.
                </strong>
              </p>
              <p className="text-black/80">
                This product is not available for standard delivery because of its
                size, fragility or handling requirements.
              </p>
            </>
          )}

          {shippingClass === 'parcel' && (
            <>
              <p>
                <strong className="font-semibold">Australia-wide delivery.</strong>{' '}
                Shipping is calculated at checkout from the packed size, weight and
                delivery destination.
              </p>
              <p className="text-black/80">
                Free Click &amp; Collect is available from our Wyong NSW showroom.
              </p>
            </>
          )}

          {shippingClass === null && (
            <>
              <p>
                <strong className="font-semibold">Shipping calculated at checkout.</strong>
              </p>
              <p className="text-black/80">
                Shopify checkout will show the available delivery or pickup options
                for this product.
              </p>
            </>
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
