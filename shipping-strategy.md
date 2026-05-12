# Enviro Aqua — shipping strategy

A per-product shipping framework for the ~150-SKU catalogue, designed for Shopify Basic with a headless storefront. Built from the ground up rather than retrofitting the existing four-tier published page.

## The six tiers

| Tier | Standard | Express | Service | What it carries |
|---|---|---|---|---|
| **T1 Small parcel** | $9.95 | $17.95 | AusPost small satchel | Inline cartridges, fittings, small parts |
| **T2 Standard parcel** | $14.95 | $22.95 | AusPost medium satchel / Aramex | Single 10" cartridges, twin packs, RO membranes, basin mixers, bench-tops |
| **T3 Large parcel** | $19.95 | $29.95 | Aramex / CouriersPlease | Big Blue cartridges, 5/6-stage RO sets, under-sink systems, tall mixers |
| **T4 Bulky parcel** | $29.95 | $41.95 | Aramex bulky | Under-sink RO with tank, bench-top coolers, single toilets |
| **T5 Free freight** | FREE | n/a | Allied / Aramex bulky | Whole-house Big Blue (single/twin/triple), freestanding coolers, large UV, 19L+ tanks, in-wall toilets |
| **T6 Freight quote** | quote | n/a | Pallet freight | Commercial RO plants, 50L+ tanks, dosing tanks, bathroom bundles |

**Express is offered on T1–T4 only.** Pallet freight has no overnight equivalent — promising "express" on T5/T6 would break the no-surprises rule.

**Free Click & Collect from Wyong applies to every tier including T6.** Already published, keep it front and centre — it is your single best differentiator for Central Coast and northern Sydney buyers.

## Why the tiers look this way

- **No "free over $X" threshold.** Removed as you instructed. The free-shipping benefit is built into T5 directly — applied to the products where it actually matters, not gated behind cart value. This is more honest and easier to communicate.
- **Whole-house systems ship free.** Every Australian competitor I checked (Filter Systems Australia, PureWater4Life, Shield, Healthy Habitats, AquaSafe, WestOz, Clarence, Purestream) ships Big Blue systems free. The real freight cost is roughly $30–45 via Aramex/Allied; at $500–$1500 sell price that's a 4–6% margin hit. Charging $79–$149 on these would lose you sales to seven competitors who don't.
- **T6 keeps you honest.** Commercial RO plants and 200L tanks are genuine pallet jobs — $150–$300 freight to Perth is realistic. "Freight quoted within one business day" is the trade norm and matches the buyer's expectation. Don't fake a flat rate here; you will lose money or surprise the buyer.
- **T1 starts at $9.95 instead of $10.95.** Below the psychological $10 threshold matters for the inline cartridge category where buyers are price-shopping individual $25–$60 items. Saving $1 here meaningfully shifts conversion.

## Shopify configuration (Basic plan)

You can't do carrier-calculated rates on Basic — that's Advanced+. The configuration uses **flat rates per shipping profile**, which is the same approach every competitor on Basic uses.

### Set up two profiles

**Profile A — General products (covers T1–T5)**

In *Settings → Shipping and delivery → Shipping*, create a profile called "Standard parcel" with these rate bands by weight:

| Condition | Rate name | Rate |
|---|---|---|
| 0–0.7 kg | Small parcel | $9.95 |
| 0.7–3 kg | Standard parcel | $14.95 |
| 3–8 kg | Large parcel | $19.95 |
| 8–15 kg | Bulky parcel | $29.95 |
| Over 15 kg | Free shipping | $0.00 |

Add a parallel express band for each except the over-15kg bucket (express is +$8 on T1–T3, +$12 on T4).

The over-15kg "free" band captures whole-house systems automatically by weight (a Big Blue triple with cabinet is ~22kg). For UV systems and freestanding coolers that fall under 15kg but should still be free, override at the product level by assigning them to a "Free shipping" profile instead.

**Profile B — Freight items (T6)**

Create a second profile called "Freight quoted" with a single rate:

| Condition | Rate name | Rate |
|---|---|---|
| Any | Freight quoted within 1 business day | $0.00 (with note) |

Assign the T6 SKUs to this profile. The $0 rate gets the order through checkout; you reach out within one business day with the actual freight cost via a draft order or quote email. This is unusual for Shopify but normal for plumbing trade — buyers expect it on items at this price point.

**Click & Collect.** Add as a local pickup option in both profiles. Available to all NSW postcodes, free, ~2 hour ready time during business hours.

### Per-product overrides

For products where weight doesn't map cleanly to the right tier (a UV chamber that weighs 6kg but is fragile and bulky), use Shopify's per-product shipping profile assignment to manually slot the product into the right tier. The tier-mapping.csv shipped with this document gives you the category-level rules; eyeball each product against them.

### Sydney + Central Coast metro override (optional, recommended)

Roughly half your audience based on the Wyong base will be Sydney metro or Central Coast. For these postcodes (2250–2263, 2000–2249), you can layer a discounted express option — $14.95 instead of $22.95 — because next-day to Sydney is genuinely cheap from Wyong. Add this as a postcode-restricted rate in Profile A.

## Product-page copy templates

The actual lever against checkout abandonment is showing the shipping expectation **on the product page, before checkout**. Buyers who learn shipping cost at checkout abandon at 2–3x the rate of buyers who knew it going in. Add a small shipping block to every PDP via a metafield.

Each product gets one of six metafield values matching its tier. Your headless storefront renders the matching copy.

### T1 — Small parcel ($9.95)

> **Ships:** Australia-wide for $9.95 standard, or $17.95 express.
> Free Click & Collect from our Wyong NSW showroom.
> Same-day dispatch on orders before 12pm AEST.

### T2 — Standard parcel ($14.95)

> **Ships:** Australia-wide for $14.95 standard, or $22.95 express.
> Free Click & Collect from our Wyong NSW showroom.
> Same-day dispatch on orders before 12pm AEST.

### T3 — Large parcel ($19.95)

> **Ships:** Australia-wide for $19.95 standard, or $29.95 express.
> Free Click & Collect from our Wyong NSW showroom.
> Same-day dispatch on orders before 12pm AEST.

### T4 — Bulky parcel ($29.95)

> **Ships:** Australia-wide for $29.95 standard, or $41.95 express.
> Free Click & Collect from our Wyong NSW showroom.
> Same-day dispatch on orders before 12pm AEST.

### T5 — Free freight

> **Ships free Australia-wide.** Delivered by Allied Express or Aramex bulky freight, 3–10 business days depending on state.
> Free Click & Collect from our Wyong NSW showroom (in stock for immediate pickup).
> Same-day dispatch on orders before 12pm AEST.

### T6 — Freight quote

> **Freight quoted within one business day.** This product ships by pallet — we'll email you the exact freight cost (typically $150–$400 depending on your state) within one business day of order. You can cancel for a full refund if the freight quote doesn't work.
> Free Click & Collect from our Wyong NSW showroom — no freight cost if you pick up.
> Or call (02) 8772 8162 for an instant freight quote before ordering.

The T6 copy is the longest because it has to be. A buyer spending $1,180 on a 3000 LPD RO plant deserves to know exactly how the freight works before they hit "Buy now". This copy also opens the door for the showroom pickup path, which is the highest-margin path for you.

## "No surprises at checkout" rule checks

The no-surprises promise on your shipping page applies to every tier. These are the edge cases I'd flag:

1. **Multi-item carts mixing T1 and T5.** A buyer who adds a $25 cartridge to their cart sees $9.95 shipping. If they then add a whole-house system, the cart should *drop* the shipping to $0 (the highest-priority free rate wins). Test this in Shopify before going live — depending on profile configuration, Shopify sometimes sums profiles instead of taking max. If it sums, you'll need to put the cartridges into the "Free shipping" profile when the cart contains a T5 product. Easiest fix: build a Shopify Function or use an app like Advanced Shipping Rules.

2. **Cart with mixed T6 and parcel items.** A buyer adds a $240 dosing tank (T6) plus a $19 cartridge (T2). Checkout shows $0 + $14.95 = $14.95. You then email a freight quote for the tank. The order total has changed mid-flow — this *is* a surprise. Fix: T6 products should display a banner at checkout: "This order includes a freight-quoted item. Final freight will be confirmed within one business day."

3. **Express on T5/T6.** Currently set to not offer. Make sure your storefront doesn't display an "Express" option on T5/T6 product pages — easy to miss if your headless code displays express universally.

4. **Remote postcode surcharges.** Aramex and Allied surcharge for remote WA, NT, far-north QLD. On T5 (you absorb it) this is fine. On T1–T4 you'd typically eat the difference — keep doing that to honour "no surprises", and budget ~2% of T1–T4 shipping revenue for remote-zone subsidy.

5. **Bundle pricing.** Bundles like 4G/4B/4C (T6) include taps (T2) and cabinet (T6). The bundle ships as one freight job; the taps don't get a separate $14.95. Make sure the bundle SKU itself is assigned to T6, not its components.

## Rollout sequence

1. **Stand up the new shipping page** with the six tiers shown clearly. Drop the "Free shipping over $200" headline from the homepage and footer.
2. **Configure Profile A + Profile B** in Shopify admin per above.
3. **Tag every product** with a `shipping_tier` metafield (T1–T6). The tier-mapping CSV gives you the category rule; your headless storefront reads the metafield to render the right PDP copy block.
4. **Test five representative carts**: single T1, single T5, T1+T5 mixed, single T6, T6+T2 mixed. Verify rates display as expected at every step.
5. **Soft launch for 2 weeks**, monitor checkout abandonment and post-purchase support tickets mentioning shipping.
6. **Tune T6 freight quoting**: build a quick internal sheet of typical freight costs by state for each T6 SKU, so you can respond with a quote in minutes rather than hours.

## What you'll need that I couldn't produce here

The `products.json` you uploaded in the prior session isn't accessible to me in this resumed conversation — only the category structure and live site survived. If you re-upload it, I can produce a per-SKU CSV with each product assigned its tier, weight, and metafield value, ready to import.

In the meantime the `tier-mapping.csv` shipped alongside this document gives you the category-level rules, which a quick pass through the catalogue can apply manually in an afternoon.
