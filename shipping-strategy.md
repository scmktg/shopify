# Enviro Aqua — shipping strategy

This document describes the **current live shipping model** for the headless Next.js + Shopify storefront.

Shopify checkout is authoritative for delivery eligibility and final shipping charges. The storefront should explain the shipping class clearly, but it must not duplicate or calculate final checkout rates independently.

## Shipping classes

Every product is assigned one of four values in the Shopify product metafield:

`enviroaqua.shipping_class`

Allowed values:

- `parcel`
- `free`
- `freight`
- `pickup_only`

Current catalogue distribution:

| Shipping class | Products | Purpose |
|---|---:|---|
| Parcel | 117 | Normal shippable products priced by packed weight and destination |
| Free delivery | 21 | Products with a $0 delivery option Australia-wide |
| Bulky freight | 8 | Large/heavy items with state-based freight rates |
| Pickup only | 17 | Fragile or difficult-to-transport products collected from Wyong |

The old T1–T7 tier model is retired and must not be used for new products, customer-facing copy, SEO metadata, or shipping configuration.

## Parcel rates

Parcel products use packed shipping weight and destination.

| Packed weight | NSW / ACT | VIC / QLD | SA | WA / TAS | NT |
|---|---:|---:|---:|---:|---:|
| Up to 0.5 kg | $12.95 | $12.95 | $12.95 | $12.95 | $12.95 |
| Over 0.5 kg to 3 kg | $16.95 | $16.95 | $16.95 | $16.95 | $16.95 |
| Over 3 kg to 5 kg | $22.95 | $22.95 | $22.95 | $22.95 | $22.95 |
| Over 5 kg to 10 kg | $34.95 | $44.95 | $49.95 | $69.95 | $99.95 |
| Over 10 kg to 22 kg | $39.95 | $49.95 | $54.95 | $79.95 | $129.95 |

There is no separate express-rate table in the current model.

## Free delivery

Products assigned to `free` receive a $0 Australia-wide delivery option at Shopify checkout.

This class is deliberate and product-specific. Do not infer free delivery from weight, price, or category.

## Bulky freight

Products assigned to `freight` use these destination rates:

| Destination | Rate |
|---|---:|
| NSW / ACT | $99 |
| VIC / QLD | $159 |
| South Australia | $179 |
| WA / Tasmania | $249 |
| Northern Territory | Quote required |

Northern Territory bulky-freight orders intentionally have no automatic checkout delivery rate.

## Pickup only

Products assigned to `pickup_only` have no standard delivery method.

They are collected from:

**Enviro Aqua**  
6/45 Amsterdam Cct  
Wyong NSW 2259

Local pickup is free.

## Product-page messaging

The product page must describe the class without inventing a different shipping calculation.

### Parcel

> **Australia-wide delivery.** Shipping is calculated at checkout based on the packed weight and delivery destination.  
> Free Click & Collect from Wyong NSW.

### Free delivery

> **Free delivery Australia-wide.**  
> Free Click & Collect from Wyong NSW.

### Bulky freight

> **Bulky freight delivery.** NSW/ACT $99, VIC/QLD $159, SA $179, WA/TAS $249. Northern Territory requires a freight quote.  
> Free Click & Collect from Wyong NSW.

### Pickup only

> **Click & Collect only from Wyong NSW.**  
> This product is not available for standard delivery because of size, fragility, or handling requirements.

## Shopify configuration

The active delivery profiles are:

- **Standard Parcel** — parcel products and weight/destination rate bands
- **Free Delivery** — selected $0-delivery products
- **Bulky Freight** — state-based freight rates
- **Pickup Only** — no delivery rates; local pickup only
- **General profile** — retained as the default Shopify safety bucket and should contain no active catalogue products

New products should never be left unintentionally in the General profile.

## Packed weights

Parcel eligibility depends on realistic packed weights.

Use packed shipping weight rather than a synthetic tier proxy. If a product cannot be confidently weighed or estimated, flag it for physical measurement rather than assigning an arbitrary tier weight.

Parcel products should not exceed 22 kg under the current rate table. Larger or awkward items should be reviewed for `freight` or `pickup_only`.

## Source of truth

For shipping:

- **Shopify owns:** product shipping class, packed weights, delivery profiles, destination zones, rates, local pickup, checkout eligibility.
- **Next.js owns:** explanatory shipping copy shown before checkout.
- **Shopify checkout remains authoritative** if frontend copy and checkout ever disagree.

## Testing

For any shipping change, test at least:

- one parcel product in each weight band
- NSW, VIC, WA, and NT destinations
- one free-delivery product
- one bulky-freight product
- one pickup-only product
- mixed carts involving parcel + free
- parcel + freight
- parcel + pickup-only
- multiple parcel items that cross a weight boundary

Use Shopify's calculated delivery options rather than inferring results from configuration.

## Maintenance rules

1. Do not add new T1–T7 logic.
2. Do not hard-code parcel prices into product descriptions or SEO metadata.
3. Do not promise express delivery unless a live Shopify rate exists.
4. Do not assume a whole category is free delivery; check the product's `shipping_class`.
5. Keep the public `/shipping/` page aligned with live Shopify rates.
6. Audit the General profile whenever new products are created.
