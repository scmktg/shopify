/**
 * Shared site config surface for product-page trust signals.
 *
 * `content/business-info.ts` remains the single source of truth — this
 * module is a thin, named re-export so PDP components can pull
 * everything they need from one import without reaching into the
 * business-info shape directly. If you're adding a new piece of
 * config, add it to `business-info.ts` first, then surface it here.
 */
import { BUSINESS_INFO } from '@/content/business-info';

export const ORDER_CUTOFF = BUSINESS_INFO.orderCutoffTime;
export const ORDER_CUTOFF_DISPLAY = BUSINESS_INFO.orderCutoff;
export const SHIPPING_FREE_THRESHOLD_AUD =
  BUSINESS_INFO.shippingFreeThresholdAud;
export const SHIPPING_STANDARD_FROM_AUD =
  BUSINESS_INFO.shipping.standardFromAud;
export const SHIPPING_EXPRESS_FROM_AUD =
  BUSINESS_INFO.shipping.expressFromAud;
export const RETURNS_SUMMARY = BUSINESS_INFO.returnsSummary;
export const CLICK_AND_COLLECT_PICKUP_WINDOW =
  BUSINESS_INFO.clickAndCollectPickupWindow;
export const TRUST_STRIP = BUSINESS_INFO.trustStrip;
export const DEFAULT_LOW_STOCK_THRESHOLD =
  BUSINESS_INFO.defaultLowStockThreshold;
export const PHONE_SUPPORT_HOURS = BUSINESS_INFO.phoneSupportHours;
export const PHONE_DISPLAY = BUSINESS_INFO.phone.display;
export const PHONE_TEL = BUSINESS_INFO.phone.tel;
export const SHOWROOM_LOCALITY = BUSINESS_INFO.showroom.locality;

export const BACK_IN_STOCK_ENDPOINT = '/api/back-in-stock';

/**
 * Top promotional banner copy. Rendered by
 * `components/layout/PromoBanner.tsx` on every page above the
 * header. Edit the strings here — the merchant should never have
 * to touch component code to change a banner line.
 *
 * Static line is split into two parts so each gets its own visual
 * weight: `primary` is the brand-promise hook (semibold white),
 * `secondary` is the supporting clause (light grey). Both render
 * on the same line on desktop; both are hidden on mobile so the
 * strip stays single-line.
 *
 * The rotating items rotate every ~5s in both layouts.
 */
export const PROMO_STATIC = {
  primary: 'Same price retail or trade.',
  secondary: 'No accounts, no minimums.',
} as const;

export interface PromoRotatingItem {
  text: string;
  href: string;
}

export const PROMO_ROTATING_ITEMS: ReadonlyArray<PromoRotatingItem> = [
  {
    text: 'Same-day dispatch from Wyong NSW · order before 12pm',
    href: '/shipping/',
  },
  {
    text: 'Free Click & Collect from our Wyong showroom',
    href: '/about/',
  },
  {
    text: 'Australian-stocked · plumber-grade product',
    href: '/about/our-pricing/',
  },
  {
    text: 'Not sure which filter? 60-second filter finder',
    href: '/water-problems/',
  },
];

/** Auto-advance interval for the rotating side, in milliseconds. */
export const PROMO_ROTATION_MS = 5000;
