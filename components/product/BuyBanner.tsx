import Link from 'next/link';
import type { Money } from '@/types/product';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { PriceDisplay } from './PriceDisplay';
import {
  ORDER_CUTOFF_DISPLAY,
  SHIPPING_FREE_THRESHOLD_AUD,
} from '@/lib/site-config';

interface BuyBannerProps {
  variantId: string;
  available: boolean;
  price: Money;
  /** Label override from `products.json[handle].ctas.primary`. */
  ctaLabel?: string;
}

/**
 * Re-engagement CTA panel rendered after the long-form persuasion
 * sections (description, features, recommended-for). The buyer who
 * read all the way through has signalled intent — give them a way
 * to act without scrolling back to the top of the page.
 *
 * Reuses the same AddToCartButton component as the top buy box, so
 * the quantity stepper + Add to cart + Buy now treatment is
 * consistent. Each instance owns its own qty state — that's
 * intentional, the user is acting on what they see in this banner.
 */
export function BuyBanner({
  variantId,
  available,
  price,
  ctaLabel,
}: BuyBannerProps) {
  return (
    <section
      aria-label="Add to cart"
      className="mt-12 bg-brand-blue-light border border-brand-blue/20 rounded-lg p-6 md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
            Ready to order?
          </h2>
          <p className="mt-2 text-sm text-black/70">
            Order before {ORDER_CUTOFF_DISPLAY} on a business day for
            same-day dispatch from Wyong NSW. Free{' '}
            <Link
              href="/shipping/"
              className="underline underline-offset-4 hover:text-brand-blue"
            >
              shipping
            </Link>{' '}
            on Australian orders over ${SHIPPING_FREE_THRESHOLD_AUD}.
          </p>
          <div className="mt-4 flex items-baseline gap-2 flex-wrap">
            <PriceDisplay
              money={price}
              className="text-2xl md:text-3xl font-bold text-black tracking-tight"
            />
            <span className="text-sm text-black/50">inc GST</span>
            <span className="text-sm text-black/50">
              · Same price retail or trade
            </span>
          </div>
        </div>

        <div>
          <AddToCartButton
            variantId={variantId}
            available={available}
            label={ctaLabel}
            enableBuyNow
          />
        </div>
      </div>
    </section>
  );
}
