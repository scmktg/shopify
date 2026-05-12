# WordPress redirect audit

Source URLs analysed: 442
Redirect rules evaluated: 814

## Coverage by bucket

| Bucket | URLs | Clicks | Impressions |
|---|---:|---:|---:|
| covered_explicit | 362 | 1529 | 319177 |
| covered_fallback | 64 | 182 | 42284 |
| no_redirect_needed | 1 | 487 | 31439 |
| not_covered | 15 | 6 | 2081 |

## Coverage by priority

| Priority | Total | Covered | Clicks at risk |
|---|---:|---:|---:|
| critical | 361 | 361 | 0 |
| high | 37 | 37 | 0 |
| medium | 36 | 29 | 0 |
| low | 8 | 0 | 6 |

## Broken rule destinations

_None — every existing rule lands on a real route._

## Not-covered URLs (top 30 by clicks)

| Path | Type | Priority | Clicks | Impressions | Suggested |
|---|---|---|---:|---:|---|
| `/author/steve/` | author archive | low | 5 | 69 | 301 → homepage or 410 Gone |
| `/colour/brushed-gold/` | colour taxonomy (Woo attribute) | low | 1 | 1154 | 301 → /collections/ filtered by colour (or 410) |
| `/2024/10/` | other | medium | 0 | 2 | Review manually |
| `/brand/best-tank/` | other | medium | 0 | 47 | Review manually |
| `/category/whole-house/` | other | medium | 0 | 17 | Review manually |
| `/colour/brushed-nickel/` | colour taxonomy (Woo attribute) | low | 0 | 428 | 301 → /collections/ filtered by colour (or 410) |
| `/colour/matte-black/` | colour taxonomy (Woo attribute) | low | 0 | 228 | 301 → /collections/ filtered by colour (or 410) |
| `/colour/polished-chrome/` | colour taxonomy (Woo attribute) | low | 0 | 87 | 301 → /collections/ filtered by colour (or 410) |
| `/colour/polished-chrome/page/1/` | colour taxonomy (Woo attribute) | low | 0 | 15 | 301 → /collections/ filtered by colour (or 410) |
| `/colour/polished-chrome/page/2/` | colour taxonomy (Woo attribute) | low | 0 | 12 | 301 → /collections/ filtered by colour (or 410) |
| `/colour/shiny-gold/` | colour taxonomy (Woo attribute) | low | 0 | 2 | 301 → /collections/ filtered by colour (or 410) |
| `/wp-content/uploads/2020/07/s-l1600-1-54.jpg` | other | medium | 0 | 2 | Review manually |
| `/wp-content/uploads/2021/03/12V-Pump_5.png` | other | medium | 0 | 13 | Review manually |
| `/wp-content/uploads/2021/03/pump_kit-600x600.jpg` | other | medium | 0 | 2 | Review manually |
| `/wp-content/uploads/2024/10/vanity_cabinet_1.png` | other | medium | 0 | 3 | Review manually |

## Covered-by-fallback URLs (top 20 by clicks)

These resolve via a wildcard rule (e.g. `/product/:slug*` -> `/water-filters`). Worth reviewing high-traffic ones for a more specific rule.

| Path | Clicks | Falls through to |
|---|---:|---|
| `/product-category/water-filters/` | 63 | `/product-category/water-filters/:path*` -> `/water-filters` |
| `/product-category/fittings-parts/` | 22 | `/product-category/fittings-parts/:path*` -> `/water-filters/parts` |
| `/product-category/filter-cartridges/` | 20 | `/product-category/filter-cartridges/:path*` -> `/cartridges` |
| `/product-category/whole-house/` | 18 | `/product-category/whole-house/:path*` -> `/water-filters/whole-house` |
| `/product-category/kitchen-taps/` | 15 | `/product-category/kitchen-taps/:path*` -> `/plumbing/kitchen-taps` |
| `/product-category/bubblers-coolers/` | 12 | `/product-category/bubblers-coolers/:path*` -> `/bubblers-and-coolers` |
| `/product-category/water-pumps/` | 10 | `/product-category/water-pumps/:path*` -> `/pumps-and-tanks/pumps` |
| `/product-category/tanks-bladders/` | 4 | `/product-category/tanks-bladders/:path*` -> `/pumps-and-tanks` |
| `/product-category/toilets/` | 4 | `/product-category/toilets/:path*` -> `/plumbing/toilets` |
| `/product-category/fittings-parts/page/4/` | 3 | `/product-category/fittings-parts/:path*` -> `/water-filters/parts` |
| `/product-category/installation-packages/` | 3 | `/product-category/installation-packages/:path*` -> `/whole-house-installation-package` |
| `/product-category/bathroom-taps/` | 2 | `/product-category/bathroom-taps/:path*` -> `/plumbing/bathroom-taps` |
| `/product-category/taps/` | 2 | `/product-category/taps/:path*` -> `/plumbing` |
| `/product-category/bundles/` | 1 | `/product-category/bundles/:path*` -> `/plumbing/bundles` |
| `/product-category/fittings-parts/page/3/` | 1 | `/product-category/fittings-parts/:path*` -> `/water-filters/parts` |
| `/shop/page/2/` | 1 | `/shop/:path*` -> `/water-filters` |
| `/shop/page/9/` | 1 | `/shop/:path*` -> `/water-filters` |
| `/bathroom/` | 0 | `/bathroom/:path*` -> `/plumbing` |
| `/bathroom/elements/banner/` | 0 | `/bathroom/:path*` -> `/plumbing` |
| `/bathroom/elements/images/` | 0 | `/bathroom/:path*` -> `/plumbing` |

