# WordPress redirect audit

Source URLs analysed: 442
Redirect rules evaluated: 817

## Coverage by bucket

| Bucket | URLs | Clicks | Impressions |
|---|---:|---:|---:|
| covered_explicit | 363 | 1534 | 319246 |
| covered_fallback | 71 | 183 | 44210 |
| gone_410_middleware | 7 | 0 | 86 |
| no_redirect_needed | 1 | 487 | 31439 |

## Coverage by priority

| Priority | Total | Covered | Clicks at risk |
|---|---:|---:|---:|
| critical | 361 | 361 | 0 |
| high | 37 | 37 | 0 |
| medium | 36 | 36 | 0 |
| low | 8 | 8 | 0 |

## Broken rule destinations

_None — every existing rule lands on a real route._

## Not-covered URLs (top 30 by clicks)

_All URLs are covered by an existing rule or already resolve._

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
| `/colour/brushed-gold/` | 1 | `/colour/:slug*` -> `/water-filters` |
| `/product-category/bundles/` | 1 | `/product-category/bundles/:path*` -> `/plumbing/bundles` |
| `/product-category/fittings-parts/page/3/` | 1 | `/product-category/fittings-parts/:path*` -> `/water-filters/parts` |
| `/shop/page/2/` | 1 | `/shop/:path*` -> `/water-filters` |
| `/shop/page/9/` | 1 | `/shop/:path*` -> `/water-filters` |
| `/bathroom/` | 0 | `/bathroom/:path*` -> `/plumbing` |
| `/bathroom/elements/banner/` | 0 | `/bathroom/:path*` -> `/plumbing` |

