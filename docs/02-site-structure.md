# Site Structure

## Top-level navigation (final, locked)

5 items only. In this order, left to right:

```
WATER FILTERS    CARTRIDGES    BUBBLERS & COOLERS    PUMPS & TANKS    PLUMBING
```

Plus utility nav (right side): Search, Cart.

Sitewide top banner above the nav: **"Wholesale prices for everyone — no accounts, no quotes, just the best price upfront."**

## Full URL hierarchy

### Catalogue (driven by Shopify products)

```
/water-filters/
├── /water-filters/under-sink/
├── /water-filters/whole-house/
├── /water-filters/reverse-osmosis/
├── /water-filters/uv-sterilisation/
├── /water-filters/bench-top/
├── /water-filters/commercial/
└── /water-filters/parts/

/cartridges/
├── /cartridges/sediment/
├── /cartridges/carbon/
├── /cartridges/reverse-osmosis-membranes/
├── /cartridges/specialty-cartridges/   # alkaline, fluoride, T33, UF, pleated
└── /cartridges/cartridge-sets/

/bubblers-and-coolers/
├── /bubblers-and-coolers/bubblers/
├── /bubblers-and-coolers/coolers-and-chillers/
└── /bubblers-and-coolers/parts/

/pumps-and-tanks/
├── /pumps-and-tanks/pumps/             # 12V, RO booster, pressure, solar, submersible
├── /pumps-and-tanks/pressure-tanks/    # includes replacement bladders
├── /pumps-and-tanks/dosing-tanks/
└── /pumps-and-tanks/components/

/plumbing/
├── /plumbing/kitchen-taps/
├── /plumbing/bathroom-taps/
├── /plumbing/ro-filter-taps/
├── /plumbing/toilets/
└── /plumbing/bundles/
```

The `/pumps-and-tanks/pumps/` page exposes a `?type=` filter pill row
(All / 12V / RO Booster / Pressure / Solar / Submersible) that narrows
on the secondary `tech:<slug>` tag. Filter URLs are noindex.

## Migration notes (2026-05 restructure)

The previous 30-subcategory map was consolidated to 24. Old URLs are
permanently redirected (308) in `next.config.js`:

| Old URL | New URL | Reason |
|---|---|---|
| `/water-filters/inline/` | (none yet) | Inline filters folded into the catalogue elsewhere; no redirect — relisted as needed |
| `/cartridges/post-carbon-t33/` | `/cartridges/specialty-cartridges/` | Consolidated specialty range |
| `/cartridges/alkaline/` | `/cartridges/specialty-cartridges/` | Consolidated specialty range |
| `/cartridges/fluoride-removal/` | `/cartridges/specialty-cartridges/` | Consolidated specialty range |
| `/cartridges/pleated-washable/` | `/cartridges/specialty-cartridges/` | Consolidated specialty range |
| `/pumps-and-tanks/12v-pumps/` | `/pumps-and-tanks/pumps/` | Pumps consolidated; sub-filter via `?type=12v` |
| `/pumps-and-tanks/ro-booster-pumps/` | `/pumps-and-tanks/pumps/` | Pumps consolidated; sub-filter via `?type=ro-booster` |
| `/pumps-and-tanks/pressure-pumps/` | `/pumps-and-tanks/pumps/` | Pumps consolidated; sub-filter via `?type=pressure` |
| `/pumps-and-tanks/replacement-bladders/` | `/pumps-and-tanks/pressure-tanks/` | Bladders folded into pressure-tanks |
| `/plumbing/showers/` | `/plumbing/bathroom-taps/` | Showers absorbed into bathroom range |
| `/bubblers/` | `/bubblers-and-coolers/` | Category renamed to include coolers/chillers |
| `/bubblers/commercial/:handle` | `/bubblers-and-coolers/bubblers/:handle` | Commercial = stainless-steel drinking bubblers |
| `/bubblers/residential/:handle` | `/bubblers-and-coolers/coolers-and-chillers/:handle` | "Residential" units were all hot/cold/chilled coolers |
| `/bubblers/parts/:handle` | `/bubblers-and-coolers/parts/:handle` | Parts subcategory unchanged, only parent path |
| `/bubblers/commercial/stainless-steel-under-counter-drinking-water-chiller-plus-stainless-steel-tap/` | `/bubblers-and-coolers/coolers-and-chillers/<same>/` | Under-counter chiller moved out of commercial bubblers (per-product override) |

Products affected by the consolidation must be re-tagged in Shopify
(`primary-cat:` / `sub-cat:`). Products in the new `pumps` subcategory
should also carry a `tech:<type>` tag so the filter pills work.

### Editorial (driven by markdown in /content/)

```
/water-problems/
├── /water-problems/chlorine-and-taste/
├── /water-problems/sediment-and-rust/
├── /water-problems/fluoride-removal/
├── /water-problems/hard-water-and-scale/
├── /water-problems/bacteria-and-pathogens/
├── /water-problems/heavy-metals/
├── /water-problems/cloudy-or-discoloured-water/
├── /water-problems/odour-removal/
└── /water-problems/tank-water-quality/

/use/
├── /use/home-drinking-water/
├── /use/whole-home-filtration/
├── /use/caravan-and-rv/
├── /use/commercial-and-cafe/
├── /use/rural-tank-water/
└── /use/rental-friendly/

/locations/
├── /locations/central-coast-nsw/
├── /locations/central-coast/under-sink-water-filters/
├── /locations/central-coast/whole-house-water-filters/
└── /locations/central-coast/water-filter-installation/

/help/
├── /help/how-to-choose-a-water-filter/
├── /help/how-to-replace-a-cartridge/
├── /help/watermark-certification-explained/
└── ... (ongoing)

/wholesale-water-filters/      ← single SEO landing page for wholesale intent
/about/                        ← brand story, why one price
/about/our-pricing/            ← explainer for one-price-for-everyone
/contact/
/shipping/
/returns/
/privacy/
/terms/
```

## URL rules (enforced)

1. **All lowercase, hyphenated. Always trailing slash.**
2. **No `/product-category/` or `/product/` prefixes.** WooCommerce-isms — gone.
3. **Every product has exactly one canonical URL.** No duplicates.
4. **No filter parameters in URLs.** Filters are client-side or use non-indexable hash params.
5. **No `add-to-cart=` URLs.** Add-to-cart is POST only.
6. **Pagination beyond page 1: `noindex`.** First page is canonical.
7. **Maximum 3 levels deep for products** (`/category/subcategory/product-slug/`).

## Internal linking patterns

- Every product page → links up to its sub-category and category
- Every product page → links to relevant problem page (e.g. RO products link to `/water-problems/fluoride-removal/`)
- Every category page → links to relevant use-case pages
- Every problem page → links to 4-8 specific products + the relevant category
- Every use-case page → curates 6-12 products from across categories
- Cartridges link to compatible systems; systems link to compatible cartridges

## Mega menu structure

When a user hovers a top-level nav item, dropdown shows:
- All sub-categories of that section
- A "Shop all [section]" link at the bottom
- For Water Filters specifically: an "Featured guides" mini-section linking to the top 3 water-problem pages

Maximum 8 sub-items per dropdown. If a section has more, group them.
