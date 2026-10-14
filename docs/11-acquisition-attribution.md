# SM-002 — Headless storefront first-party acquisition attribution

Status: implementation branch, **not production-verified**. Complements SM-001; does not replace GA4 or Shopify Google & YouTube purchase attribution.

## Capture and consent

- On initial headless storefront load, capture the arrival URL and browser referrer **in memory only**. No localStorage attribution is written before optional tracking is accepted.
- On affirmative consent, derive and persist a first-observed and most-recent identifiable touch in localStorage key `enviroaqua:acquisition:v1`.
- Fields: observed source, medium, UTM campaign/content/term, referring **hostname only**, first landing **pathname only**, timestamp.
- `gclid`, `gbraid`, and `wbraid` presence can infer paid Google traffic but their raw values are **never written** to custom Shopify cart/order attributes or the first-party attribution record. Leave actual ad click attribution to the existing Google tag / Shopify Google & YouTube integration.
- UTM source and medium override inferred channel labels. If no external referrer, paid click marker or UTMs exist, report direct/unknown. Do not infer ChatGPT without evidence.
- First touch is the earliest *observed on this browser within retention*, not necessarily the customer's true first interaction. Later identifiable arrivals update latest touch; direct visits do not overwrite an identified latest touch.
- Current implementation expires both touches 30 days after the first observed visit; subsequent visits do not extend that window. Storage is browser-specific and can be blocked/cleared.
- On consent denial/withdrawal, delete the localStorage attribution and attempt removal of our attribution namespace from an existing cart. A user may already have completed checkout before withdrawal; order erasure is not performed by this frontend.
- No email address, raw referrer URL, full landing query string, user identity or click ID is included.

## Shopify cart and checkout

- `lib/shopify/cart.ts` now reads `Cart.attributes` and offers a guarded `cartAttributesUpdate` mutation that merges our attributes with all other cart attributes.
- The cart provider attempts synchronization when a cart is restored/created, when consent changes, before Buy Now redirects, and before ordinary checkout links. All checkout buttons call the same provider `checkout` function.
- The two checkout flows allow at most 2.5 seconds for optional attribution sync before redirecting; failure does not block commerce. Therefore some checkouts can legitimately lack first-party attribution.
- Shopify should carry cart attributes into order **Additional details / note attributes** in the Shopify admin, dependent on supported checkout behavior and order configuration. Test before asserting this in production.
- Each field is prefixed `_ea_first_` or `_ea_latest_`, with `_ea_attribution_version=1`. Leading underscore fields may be hidden from some Shopify admin displays; inspect order note attributes via Admin API for definitive validation.
- No changes to GA4 page views, checkout and purchase event emitters, Google Ads conversion goals, Google & YouTube channel, Consent Mode bootstrapping or Shopify pixel configuration.

## Test and deployment gate

Run locally or through CI:
```
npm ci
npm run type-check
npm run test:analytics
npm run test:attribution
npm run build
```
Production verification still requires:
1. Authorised consented arrival with `utm_source=chatgpt&utm_medium=referral&utm_campaign=sm002-test`.
2. Add a test product to cart, check the Storefront API `Cart.attributes` for the expected first/latest fields, confirming existing attributes remain untouched.
3. Navigate through *each* checkout entry point (drawer, full cart, Buy Now) with a test checkout and, **only with approval**, a non-chargeable test order.
4. Inspect resulting order note attributes in Shopify Admin API. Reconcile order ID with Shopify GA4 purchase transaction ID and the existing Google Shopping App Purchase; ensure no duplicate purchase events.
5. Test return visit and direct visit behavior, rejection, withdrawal, and mobile browsers.
6. Verify Google Ads click parameters and cross-domain measurement continue to work in Tag Assistant. **No new offline Ads upload is implemented.**

## Limitations

This is descriptive first-party attribution, not causal attribution or Google Ads conversion attribution. Visitors who decline optional tracking, navigate privately, block storage, use different devices, or complete payment after synchronization failure may have no order attributes. Referrer policies, ad blockers and attribution windows can hide original sources. Google Ads offline click ID matching, identity stitching and order dashboards are **not** implemented here. Separate merchant approval and privacy review are required before adding any further collection of advertising identifiers or expanding retention.
