# Site Structure

## Top-level navigation (final, locked)

5 items only. In this order, left to right:

```
WATER FILTERS    CARTRIDGES    BUBBLERS    PUMPS & TANKS    PLUMBING
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
├── /water-filters/inline/
├── /water-filters/commercial/
└── /water-filters/parts/

/cartridges/
├── /cartridges/sediment/
├── /cartridges/carbon/
├── /cartridges/reverse-osmosis-membranes/
├── /cartridges/alkaline/
├── /cartridges/fluoride-removal/
├── /cartridges/post-carbon-t33/
├── /cartridges/pleated-washable/
└── /cartridges/cartridge-sets/

/bubblers/
├── /bubblers/commercial/
├── /bubblers/residential/
└── /bubblers/parts/

/pumps-and-tanks/
├── /pumps-and-tanks/12v-pumps/
├── /pumps-and-tanks/ro-booster-pumps/
├── /pumps-and-tanks/pressure-pumps/
├── /pumps-and-tanks/pressure-tanks/
├── /pumps-and-tanks/dosing-tanks/
├── /pumps-and-tanks/replacement-bladders/
└── /pumps-and-tanks/components/

/plumbing/
├── /plumbing/toilets/
├── /plumbing/kitchen-taps/
├── /plumbing/bathroom-taps/
├── /plumbing/showers/
└── /plumbing/bundles/
```

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
