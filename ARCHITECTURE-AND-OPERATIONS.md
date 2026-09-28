# Enviro Aqua — Architecture & Operations

This document is the **primary operational source of truth** for the Enviro Aqua headless commerce stack.

Anyone making changes to the storefront, Shopify catalogue, shipping, checkout, product content, or deployment should read this file first.

If another document conflicts with this one, treat this file as authoritative unless the live Shopify configuration or production checkout has been deliberately changed more recently.

---

## 1. System overview

Enviro Aqua uses a **headless Next.js storefront with Shopify as the commerce backend**.

The split is intentional:

### Shopify owns commerce data and transaction logic

Shopify is the source of truth for:

- product titles
- prices
- variants
- inventory / stock
- product images
- SKUs
- product shipping class
- packed variant weights
- shipping profiles
- shipping zones
- delivery rates
- local pickup eligibility
- cart
- checkout
- tax calculation
- payments
- orders
- fulfilment state

### Next.js owns presentation, content, and SEO

The GitHub / Next.js application is the source of truth for:

- product long-form descriptions
- product features
- specifications
- recommended uses
- category structure
- category editorial content
- certification explanations
- SEO titles and descriptions where managed in code
- structured data
- internal linking
- redirects
- product-page rendering
- shipping messaging shown before checkout
- static help, policy, and editorial pages

The storefront reads live Shopify commerce data through the Storefront API and combines it with code-managed content.

---

## 2. Repository and deployment

### GitHub

Repository:

`scmktg/shopify`

Production branch:

`main`

Production changes should be committed to `main` only after they are ready to deploy.

### Vercel

Vercel deploys from GitHub `main`.

A successful GitHub commit is **not** sufficient by itself. Always confirm the Vercel deployment status is green.

The build includes strict product validation before Next.js compiles. Product-data mismatches can intentionally fail deployment.

### Important environment variables

The app uses:

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`
- `SHOPIFY_API_VERSION`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN` where required
- `NEXT_PUBLIC_SITE_URL`
- analytics / webhook variables where configured

Current canonical Shopify store domain:

`m5crww-yc.myshopify.com`

Current Shopify API version:

`2026-04`

Do not commit private Storefront tokens or other secrets to GitHub.

---

## 3. Product data flow

The product page is assembled from two sources.

### Shopify data

Shopify provides the live transactional product data, including:

- title
- price
- stock
- variants
- images
- SKU
- metafields
- shipping metadata

### Code-managed product content

`data/products.json` contains structured editorial content keyed by Shopify product handle.

Typical fields include:

- categories
- tags
- short description
- long description
- features
- headline specifications
- full specifications
- recommended use cases
- compliance content
- upsells
- SEO content

### Strict product validation

The build runs:

`npm run validate:products`

This checks that:

- product handles in `data/products.json` exist in Shopify
- live Shopify products expected by the site have corresponding content entries
- internal product references such as `upsells.boughtTogether` point to valid handles
- product content has the expected shape

If these do not match, the production build can fail by design.

When products are added, removed, renamed, unpublished, or their handles change, update `data/products.json` and any cross-product references before expecting Vercel to build successfully.

---

## 4. Shopify storefront integration

The main integration layer is under:

`lib/shopify/`

Key files:

- `lib/shopify/client.ts` — Storefront API client
- `lib/shopify/fragments.ts` — shared GraphQL fragments
- `lib/shopify/transformers.ts` — transforms Shopify API responses into app-level product types
- `lib/shopify/cart.ts` — cart operations and checkout URL handling

The storefront uses Shopify for the cart and checkout rather than reimplementing commerce logic in Next.js.

---

## 5. Checkout flow

The customer shops on the Next.js storefront.

When products are added to cart:

1. Next.js uses the Shopify Storefront API to create or update a Shopify cart.
2. Shopify returns the cart state and checkout URL.
3. The storefront redirects the customer to Shopify checkout.
4. Shopify determines:
   - delivery methods
   - shipping price
   - local pickup options
   - tax
   - payment
   - order creation

The customer does **not** complete an independent Next.js checkout.

### Checkout source-of-truth rule

**Shopify checkout is authoritative.**

If frontend text, a markdown page, internal documentation, or assumptions ever disagree with Shopify checkout, verify the Shopify configuration first and update the frontend/documentation to match.

Do not create a second shipping calculator in the Next.js storefront.

---

## 6. Current shipping model

The current live model has **four shipping classes**.

Authoritative product metafield:

`enviroaqua.shipping_class`

Allowed values:

- `parcel`
- `free`
- `freight`
- `pickup_only`

Current catalogue distribution:

| Class | Products |
|---|---:|
| Parcel | 117 |
| Free Delivery | 21 |
| Bulky Freight | 8 |
| Pickup Only | 17 |

Total: 163 products.

### Parcel

Parcel products use packed weight plus delivery destination.

Current live rate table:

| Packed weight | NSW / ACT | VIC / QLD | SA | WA / TAS | NT |
|---|---:|---:|---:|---:|---:|
| Up to 0.5 kg | $12.95 | $12.95 | $12.95 | $12.95 | $12.95 |
| Over 0.5 kg to 1 kg | $17.95 | $17.95 | $17.95 | $17.95 | $17.95 |
| Over 1 kg to 3 kg | $22.95 | $22.95 | $22.95 | $22.95 | $22.95 |
| Over 3 kg to 5 kg | $27.95 | $27.95 | $27.95 | $27.95 | $27.95 |
| Over 5 kg to 10 kg | $34.95 | $44.95 | $49.95 | $69.95 | $99.95 |
| Over 10 kg to 22 kg | $39.95 | $49.95 | $54.95 | $79.95 | $129.95 |

There is no separate active express-rate model.

### Free Delivery

Products assigned to `free` receive a $0 Australia-wide delivery option in Shopify checkout.

Do not infer free delivery from product value, category, or weight. It is deliberately assigned product by product.

### Bulky Freight

Products assigned to `freight` use destination-based freight rates:

| Destination | Rate |
|---|---:|
| NSW / ACT | $99 |
| VIC / QLD | $159 |
| South Australia | $179 |
| WA / Tasmania | $249 |
| Northern Territory | Freight quote required |

Northern Territory bulky-freight orders intentionally have no automatic delivery method.

### Pickup Only

Products assigned to `pickup_only` have no normal shipping rate.

They are available for free local pickup from:

Enviro Aqua  
6/45 Amsterdam Cct  
Wyong NSW 2259

---

## 7. Shopify delivery profiles

The intended active profile structure is:

### Standard Parcel

Contains parcel products and the destination / weight rate bands.

### Free Delivery

Contains products intentionally offered with $0 delivery.

### Bulky Freight

Contains freight-class products and the state-based bulky rates.

### Pickup Only

Contains pickup-only products and no standard delivery methods.

### General profile

The Shopify General profile remains as a default safety bucket.

It should contain **no active catalogue products**.

Whenever new products are created, verify they are moved out of General and into the correct shipping profile.

---

## 8. Packed weights

Use realistic **packed shipping weight**, not synthetic tier proxy values.

Parcel pricing depends on accurate packed weights.

Current parcel ceiling:

**22 kg**

Products that are heavier, unusually bulky, fragile, or commercially freighted should be reviewed for `freight` or `pickup_only`.

Do not manipulate weights simply to force a shipping rate.

When a weight is uncertain, physically weigh the product where practical.

---

## 9. Product-page shipping messaging

The frontend explains the shipping class but does not calculate final checkout pricing.

Shared component:

`components/product/ShippingTierBlock.tsx`

Customer-facing intent:

### Parcel

“**Australia-wide delivery.** Shipping is calculated at checkout based on the packed weight and delivery destination.”

### Free Delivery

“**Free delivery Australia-wide.**”

### Bulky Freight

“**Bulky freight delivery.** NSW/ACT $99, VIC/QLD $159, SA $179, WA/TAS $249. Northern Territory requires a freight quote.”

### Pickup Only

“**Click & Collect only from our Wyong NSW showroom.**”

The public shipping page is:

`content/shipping.md`

Keep that page aligned with live Shopify rates.

---

## 10. Legacy shipping compatibility shim

The old T1–T7 shipping model is **retired**.

Do not use T1–T7 for:

- new shipping logic
- new product setup
- rate configuration
- customer-facing copy
- SEO
- documentation
- operational decisions

However, the current application still contains an **internal compatibility shim** using:

- `ShippingTier`
- `shipping_tier`
- T1–T7 mappings

This exists only because the existing product-page contract is stable and removing it previously caused build instability.

Important:

- the legacy tier field does **not** own shipping rates
- it does **not** determine checkout behavior
- it should be treated as an implementation adapter only
- Shopify's `shipping_class`, packed weights, delivery profiles, and checkout remain authoritative

Do not extend the legacy shim with new behavior.

If the shim is removed in the future, do it as a deliberate refactor with full build and checkout regression testing.

---

## 11. Public shipping content rules

Do not hard-code obsolete parcel prices into:

- product descriptions
- category SEO descriptions
- homepage marketing copy
- help content
- Merchant Center content
- static editorial pages

If rates are mentioned publicly, they must match the live Shopify configuration.

Prefer phrases such as:

- “Shipping calculated at checkout”
- “Based on packed weight and destination”
- “Free delivery Australia-wide”
- “Bulky freight by destination”
- “Free Click & Collect from Wyong NSW”

---

## 12. New product checklist

When adding a new product:

1. Create the product in Shopify.
2. Set title, price, SKU, variants, images, and inventory.
3. Set a realistic packed variant weight.
4. Set `enviroaqua.shipping_class`.
5. Assign the product to the correct Shopify delivery profile.
6. Confirm the product is not unintentionally in the General profile.
7. Add the corresponding entry to `data/products.json`.
8. Add category tags / category mapping.
9. Check any `boughtTogether` references.
10. Deploy and confirm Vercel succeeds.
11. Test the product page.
12. Test Shopify checkout for the relevant shipping destination(s).

---

## 13. Shipping-change checklist

For any change to shipping rates, product class, or packed weight:

1. Make the Shopify change first.
2. Verify the affected delivery profile.
3. Test Shopify calculated delivery options.
4. Test representative states:
   - NSW
   - VIC
   - WA
   - NT
5. Test relevant weight boundaries.
6. Test free-delivery behavior if involved.
7. Test bulky freight if involved.
8. Test pickup-only behavior if involved.
9. Test mixed carts where relevant.
10. Update `content/shipping.md` if public rates changed.
11. Update `shipping-strategy.md` if the operating model changed.
12. Deploy and confirm Vercel succeeds.

---

## 14. Mixed carts

Single-product shipping has been verified extensively.

Mixed carts require deliberate testing because Shopify can combine delivery groups in ways that are not obvious from profile configuration alone.

Important mixed-cart cases:

- Parcel + Parcel
- Parcel + Free Delivery
- Parcel + Bulky Freight
- Free Delivery + Bulky Freight
- Parcel + Pickup Only
- multiple parcel products crossing a weight boundary
- NT cart containing a bulky-freight product

Do not infer mixed-cart behavior from single-product rates. Test the actual calculated delivery options.

---

## 15. Local pickup

Primary pickup location:

Enviro Aqua  
6/45 Amsterdam Cct  
Wyong NSW 2259

Free Click & Collect is available where configured in Shopify.

The customer should rely on the pickup option shown at Shopify checkout and the ready-for-collection notification.

---

## 16. Build failures

When Vercel fails:

1. Read the exact Vercel build log.
2. Do not assume the last code change is the cause.
3. Identify the first fatal error, not warnings above it.
4. Fix only the concrete blocker first.
5. Redeploy.
6. Repeat until green.

A recent real example:

- Shopify and `data/products.json` became out of sync.
- strict product validation failed
- stale product handles were removed
- orphaned `boughtTogether` references then became the next blocker
- those references were cleaned up
- deployment succeeded

This strict behavior is desirable because it prevents broken product links from reaching production.

---

## 17. Merchant Center and advertising

The headless architecture does not prevent Google Merchant Center or Google Ads from working.

Key principle:

- Google sees the public Next.js product page
- Shopify remains the commerce backend
- checkout still flows through Shopify
- Merchant Center product URLs should resolve to the public canonical product URLs
- price, availability, shipping, and landing-page claims must remain consistent across Shopify, the storefront, and Merchant Center

Any Merchant Center feed work should respect the same source-of-truth split described in this document.

---

## 18. Operational source-of-truth hierarchy

When deciding what to trust, use this order:

### Commerce / checkout

1. Live Shopify checkout behavior
2. Shopify product / variant / delivery profile configuration
3. Shopify Storefront API data
4. Next.js storefront copy
5. Internal documentation

### Product editorial content / SEO

1. GitHub source on `main`
2. `data/products.json`
3. content files under `content/`
4. deployed Vercel output
5. cached search-engine copies

Search-engine cached snippets may lag behind a successful deployment.

---

## 19. Related documents

Read these for deeper detail:

- `shipping-strategy.md` — shipping operating model
- `shipping-class-mapping.csv` — class-level mapping guidance
- `docs/07-shopify-integration.md` — Storefront API and Shopify integration
- `docs/03-data-model.md` — product/metafield data model
- `docs/01-architecture-decisions.md` — broader technical decisions
- `docs/06-content-rules.md` — product/editorial writing rules
- `docs/09-build-roadmap.md` — implementation history and roadmap

---

## 20. Golden rules

1. **Shopify owns commerce.**
2. **Next.js owns presentation and editorial content.**
3. **Shopify checkout is authoritative for shipping.**
4. **The four shipping classes are the current model.**
5. **T1–T7 is compatibility-only and must not grow.**
6. **Packed weights must be realistic.**
7. **New products must be assigned out of the General delivery profile.**
8. **Product handles in Shopify and `data/products.json` must stay in sync.**
9. **Do not trust a deployment until Vercel is green.**
10. **When changing shipping, test the actual Shopify checkout result rather than inferring it.**
