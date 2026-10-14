# SM-003 — Australian measurement without a forced banner

## Behavior

- For storefront requests where Vercel's `x-vercel-ip-country` is exactly `AU`, Google Consent Mode v2 defaults to granted **only if the visitor has not explicitly rejected tracking**. The first-party GA4 ecommerce and SM-002 first/latest-touch attribution systems use the same effective decision.
- No consent banner is automatically shown for Australian visitors. The existing footer **Cookie preferences** action remains available for choosing reject or accept.
- For requests from outside Australia, or when geolocation is unknown, Google Consent Mode defaults to denied, and the consent banner continues to be available. Do not treat an unknown visitor as Australian.
- Stored `denied` takes priority over geography, across subsequent visits. Stored `granted` remains granted on return until changed; review this for any foreign-jurisdiction requirements and revisit geolocation/consent retention.
- No changes to GA4 event names, Google Shopping App Purchase, Shopify checkout pixels, attribution cart attributes or the SM-001/SM-002 tracking implementation.

## Privacy and operational review

Australian websites do not generally have the EU's blanket cookie opt-in rule. This is not a blanket exemption from the Privacy Act, APP 3/5/7, disclosure, marketing and opt-out requirements. Audit and update the site's Privacy Policy and the Shopify Checkout privacy configuration with qualified legal/privacy advice. Google also imposes end-user-consent requirements for the EEA, UK and Switzerland. Inaccurate/missing geolocation must remain opt-in, and geo determination should be tested at edge deployment and in development. Shopify checkout consent is configured separately; this commit does **not** change that configuration.

## Tests

Run `npm run test:analytics`, `npm run test:attribution`, `npm run type-check`, and `npm run build` on Vercel. Confirm the AU default, explicit rejection, non-AU banner, footer preferences, SM-002 cart attributes, and GA4/Ads Tag Assistant signals on a deployed preview before merging.
