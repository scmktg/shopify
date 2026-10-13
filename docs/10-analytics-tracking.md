# Enviro Aqua — SM-001 measurement activation

## Implemented in Next.js

GA4 events are emitted for initial page views, client-side navigation, query changes, product lists, product selections, selected-variant product views, successful cart additions/removals and quantity deltas, cart drawer/page views, Buy Now and ordinary checkout initiation, submitted searches and desktop promotional banner impressions/clicks. Events use the **Shopify variant GID** as item_id, with optional SKU, handle and product GID as supplemental fields. Merchant Center offer IDs must be mapped separately where necessary. Shopify money fields supply values and currency.

The event dispatcher uses an early Google dataLayer bootstrap and a bounded ephemeral fallback queue (40 events, 30s TTL), and suppresses rapid duplicate page/list/cart/checkout events. There is no guarantee of delivery under network/ad blockers.

**Consent defaults denied** for analytics_storage, ad_storage, ad_user_data, ad_personalization. A banner offers accept/reject optional Google analytics and advertising tracking, and the footer lets visitors change their choice. No optional ecommerce analytics event is sent without a locally stored affirmative choice. Verify legal language, regional policy and Shopify checkout privacy settings before claiming compliance. A choice on Next.js does **not** automatically set Shopify Checkout consent.

### Production settings

- NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-BPEY3T2B9Q (code default)
- NEXT_PUBLIC_GOOGLE_ADS_ID=AW-... (optional; only the actual existing tag ID)
- NEXT_PUBLIC_ANALYTICS_DEBUG=true (optional **development-only** diagnostics; off by default)

No private credentials may be placed in NEXT_PUBLIC values.

## Shopify Checkout purchase ownership — EXTERNAL ACTIVATION REQUIRED

The Next.js storefront cannot confirm a completed payment. **No purchase or refund events are emitted by this code**, and no new Google Ads purchase conversion has been created.

1. **Shopify Admin → Sales channels → Google & YouTube:** verify the currently active Google Ads purchase integration and whether it sends GA4 purchases. Preserve the existing Google Shopping App Purchase source unless order-level reconciliation demonstrates a defect.
2. **Shopify Admin → Settings → Customer events:** enumerate installed app and custom pixels. Identify which emits checkout_started, checkout_shipping_info_submitted, payment_info_submitted and checkout_completed. These events may vary by payment flow.
3. If no existing checkout integration sends a GA4 purchase, configure a **single supported Shopify checkout-side app/Web Pixel** subscribing to checkout_completed. Map the actual Shopify order ID to GA4 transaction_id, actual currency, purchased line items and discounts. GA4 purchase value is the sum of item prices times quantities **excluding separate shipping and tax**; provide shipping and tax fields separately. Repeated reporting must reuse the exact same transaction_id. Validate this pixel before activation to avoid overlapping purchase events.
4. **Google Ads → Goals → Conversions:** inspect primary/secondary purchase actions, account-default/campaign goals, value and count settings, transaction ID diagnostics and Enhanced Conversions. Do not add another primary Google Ads purchase signal without a controlled decision.
5. **GA4 → Admin → Data streams** and DebugView: verify G-BPEY3T2B9Q, cross-domain measurement, unwanted referrals, duplicate automatic page views and storefront-to-checkout attribution.
6. **Shopify Admin → Settings → Customer privacy:** reconcile the consent configuration with the new Next.js consent interface. The headless banner does not automatically configure Shopify Customer Privacy API state.
7. Refund reporting is **not active**. A tested pure refund payload helper exists, but the required secure Shopify webhook installation, persistent idempotency store, GA4 Measurement Protocol identity and authorised configuration cannot safely be inferred or deployed through GitHub alone. Do not send synthetic refund/purchase events.

Shopify custom pixels execute in a sandbox, so do not assume headless storefront window.gtag or cookies are available inside checkout. Prefer verified app pixels over an additional unsupported custom Google implementation.

References:
- https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels
- https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/gtm-tutorial
- https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed
- https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

## Verification

Run npm run type-check; npm run test:analytics; npm run build. The build preflight depends on live Shopify; do not disable existing validators. Afterwards validate production GA4 DebugView and Google Tag Assistant on desktop/mobile, both consent states, all checkout paths, at least one authorised test order, and Google Ads ↔ Shopify transaction and revenue reconciliation.

Never create live orders without prior approval, and never alter Google Ads budgets, bidding or conversion-goal settings in the storefront release.
