# Analytics & Conversion Tracking

## Purpose

Enviro Aqua is a headless Next.js storefront with Shopify checkout. Tracking therefore spans two surfaces:

1. **Next.js storefront** — page/product/cart behaviour.
2. **Shopify checkout** — payment, order completion and the authoritative purchase event.

Never fire a `purchase` event from the Next.js storefront. A cart or checkout redirect is not a completed order.

## Storefront implementation

The Next.js app loads Google Analytics through:

- `components/analytics/GoogleAnalytics.tsx`
- `lib/analytics/client.ts`

Production environment variables:

```
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
```

The Google Ads ID is optional until the account has a valid ecommerce conversion setup.

### Events currently emitted

- `page_view`
- `select_item`
- `view_item`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `begin_checkout`

Commerce events use live Shopify price, currency, SKU/handle and variant data where available.

## Cross-domain attribution

The storefront tag configures linker domains for:

- `www.enviroaqua.com.au`
- `enviroaqua.com.au`
- `checkout.enviroaqua.com.au`

This is intended to preserve Google attribution when the customer leaves the Next.js storefront for Shopify checkout.

## Purchase tracking

The authoritative `purchase` event must be generated from Shopify after checkout completion.

Use **Shopify Admin → Settings → Customer events** and configure a supported Google/GA4 integration or a Custom Pixel / GTM pixel that subscribes to Shopify's `checkout_completed` standard event.

At minimum, map:

- Shopify order ID → GA4 `transaction_id`
- checkout currency → `currency`
- checkout total → `value`
- tax → `tax`
- shipping → `shipping`
- checkout line items → `items`

Shopify's `checkout_completed` event is the only source in this architecture that should emit the browser-side purchase event.

### Deduplication rule

There must be exactly one GA4 purchase event per Shopify order ID.

If the Google & YouTube app, a custom pixel, GTM, or another analytics app already emits purchases, do not add a second purchase pixel.

## Google Ads

A Google Ads Purchase conversion should use the same confirmed Shopify order event. Enhanced conversions can be enabled on that conversion action where appropriate.

Do not optimize Smart Bidding toward add-to-cart or checkout events as if they were purchases.

## Validation checklist

After production variables and checkout purchase tracking are configured:

1. Open GA4 DebugView.
2. Visit a product page — confirm `page_view` and `view_item`.
3. Click a product from a grid — confirm `select_item`.
4. Add it to cart — confirm one `add_to_cart`.
5. Open cart — confirm `view_cart`.
6. Start checkout — confirm one `begin_checkout`.
7. Complete a test order — confirm one `purchase`, with the Shopify order ID as `transaction_id`.
8. Confirm the session/source is preserved from the storefront through checkout.
9. Confirm Google Ads records the test purchase only once.

## Historical Shopify analytics caveat

Shopify's Online Store session funnel is not a reliable measure of the full headless storefront journey. Use GA4 as the primary behavioural funnel and Shopify as the source of truth for orders/revenue.
