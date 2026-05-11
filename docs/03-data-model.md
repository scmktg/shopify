# Product Data Model

## Source of truth

**Shopify is the source of truth for products.** All product data lives in Shopify. Next.js fetches via Storefront API and renders. Editorial content (use-cases, problems, locations, help) lives in markdown in the repo.

## Product fields (Shopify schema mapping)

### Standard Shopify fields

| Field | Source | Required | Notes |
|---|---|---|---|
| Title | Shopify product title | Yes | Max 70 chars, follow naming convention |
| Handle (slug) | Shopify | Yes | Auto from title, manually editable |
| Vendor (Brand) | Shopify | Yes | Default: "Enviro Aqua" |
| Product Type | Shopify | Yes | Maps to primary category |
| Tags | Shopify | Yes | Used for cross-listing in use-case/problem pages |
| Description (HTML) | Shopify | Yes | Min 600 chars, structured sections |
| Images | Shopify | Yes | Min 3 per product, alt text required |
| Variants | Shopify | Yes | Even single-variant products use the variant for SKU/price/stock |
| SKU | Shopify variant | Yes | Format: `EA-<CAT>-<SHORT>-<SIZE>` |
| Barcode (GTIN) | Shopify variant | Optional | UPC/EAN where supplier provides — drives Google Merchant |
| Price | Shopify variant | Yes | AUD, single price for all customers |
| Compare-at price | Shopify variant | Optional | For sale pricing |
| Inventory | Shopify variant | Yes | Real stock count |
| Weight | Shopify variant | Yes | For shipping |
| SEO Title | Shopify `seo.title` | Optional override | Defaults to product title |
| SEO Description | Shopify `seo.description` | Optional override | Max 155 chars |

### Metafields (Shopify custom fields — set in Admin)

These extend the Shopify schema for our specific data model. **Every metafield uses namespace `enviroaqua` and an explicit type.**

| Metafield key | Type | Required | Description |
|---|---|---|---|
| `enviroaqua.watermark_status` | Single line text (with enum validation) | Yes | One of: `certified`, `not_required`, `not_certified`, `pending` |
| `enviroaqua.watermark_licence_number` | Single line text | Yes if certified | The WMK licence number |
| `enviroaqua.watermark_certifier` | Single line text | Yes if certified | "IAPMO", "SAI Global", etc. |
| `enviroaqua.watermark_valid_until` | Date | Yes if certified | |
| `enviroaqua.watermark_certificate_pdf` | File reference | Optional | Linked downloadable certificate |
| `enviroaqua.wels_rating_stars` | Integer | Optional | 0–6 |
| `enviroaqua.wels_registration_number` | Single line text | Optional | |
| `enviroaqua.installation_type` | Single line text (with enum validation) | For filter products | `under-sink`, `whole-house`, `bench-top`, `inline`, `countertop`, `commercial` |
| `enviroaqua.stages` | Integer | For filter products | 1–6 |
| `enviroaqua.cartridge_type` | Single line text (with enum validation) | For cartridges | `sediment`, `carbon-cto`, `carbon-gac`, `ro-membrane`, `alkaline`, `fluoride`, `t33`, `pleated`, `uf` |
| `enviroaqua.micron_rating` | Decimal | For cartridges | |
| `enviroaqua.housing_size` | Single line text | Where applicable | `10x2.5`, `20x4.5`, etc. |
| `enviroaqua.connection_size` | Single line text | Where applicable | `1/4"`, `3/8"`, `1/2"`, `3/4"`, `1"` |
| `enviroaqua.flow_rate_lpm` | Decimal | Optional | |
| `enviroaqua.voltage` | Single line text | For pumps/UV | `12V`, `24V`, `240V`, `mains`, `none` |
| `enviroaqua.capacity_l` | Decimal | For tanks | |
| `enviroaqua.bunded` | Boolean | For dosing tanks | |
| `enviroaqua.compatible_with_systems` | List of single line text | For cartridges | Free-text references to system SKUs |
| `enviroaqua.key_benefits` | List of single line text | Optional | 3-5 benefits, used for snippets and schema |
| `enviroaqua.country_of_origin` | Single line text | Optional | |
| `enviroaqua.warranty_months` | Integer | Optional | |

**Storefront access MUST be enabled** on every metafield definition, otherwise queries return null silently. Settings → Custom data → Products → [definition] → "Storefront access" toggle.

## Querying metafields via Storefront API

Use the `metafields(identifiers: [...])` query pattern (current Storefront API approach):

```graphql
metafields(identifiers: [
  {namespace: "enviroaqua", key: "watermark_status"}
  {namespace: "enviroaqua", key: "watermark_licence_number"}
  # ... etc
]) {
  key
  value
  type
}
```

Returns an array in the same order as requested. Null values for unset metafields. Parse on the client/server based on `type`:

- `single_line_text_field` → use `value` directly
- `boolean` → `value === 'true'`
- `integer` → `parseInt(value)`
- `number_decimal` → `parseFloat(value)`
- `date` → `new Date(value)`
- `list.single_line_text_field` → `JSON.parse(value)` (returns string array)
- `file_reference` → `value` is a GID; resolve via separate query if needed

## Category structure (Shopify Collections)

Every URL category is a Shopify Collection. Products are assigned to collections via:

- **Manual collection** for primary category (drives canonical URL)
- **Smart collections** based on tags for use-case and problem pages

### Smart collection rules

| Collection | Rule |
|---|---|
| `/use/caravan-and-rv/` | Tag includes `use:caravan-rv` |
| `/use/home-drinking-water/` | Tag includes `use:home-drinking` |
| `/water-problems/fluoride-removal/` | Tag includes `problem:fluoride` |
| `/water-problems/bacteria-and-pathogens/` | Tag includes `problem:bacteria` |
| ... etc | Tag includes `problem:<slug>` or `use:<slug>` |

This means every product can be tagged with multiple `use:*` and `problem:*` tags to surface in multiple landing pages without needing duplicate product records.

## Tag taxonomy (enforced)

```
Primary category tags:    primary-cat:water-filters, primary-cat:cartridges, etc.
Sub-category tags:        sub-cat:under-sink, sub-cat:reverse-osmosis, etc.
Use-case tags:            use:caravan-rv, use:home-drinking, use:commercial-cafe, etc.
Problem tags:             problem:chlorine-taste, problem:fluoride, problem:sediment-rust, etc.
Certification tags:       cert:watermark, cert:wels-3-star, cert:wels-4-star, etc.
Special tags:             featured, on-sale, new, best-seller
```

Tags are lowercase, hyphenated, prefix-namespaced. **Always use these exact prefixes — never freelance new ones.**

## Title naming convention (enforced)

```
[Product Type] | [Key Spec 1] | [Key Spec 2] | [Differentiator]
```

Max 70 characters. Title Case. No ALL CAPS. No model codes unless they're searched.

Examples:
- ✓ `Under Sink RO Water Filter | 6 Stage | Alkaline | WaterMark Certified`
- ✓ `Whole House Water Filter | 3 Stage | 20" × 4.5" | UV Sterilisation`
- ✗ `COMMERCIAL REVERSE OSMOSIS RO DESALINATION PLANT RO 1500 LPD / 400GPD`

## Description structure (enforced)

Every product description has these sections, in this order, as HTML headings (h2/h3):

1. **Overview** (1–2 paragraphs)
2. **Key Features** (bulleted list, 4–8 points)
3. **Technical Specifications** (definition list or table)
4. **What's Included** (bulleted list)
5. **Installation Notes** (1–2 paragraphs, optional for non-installable products)
6. **Compliance & Certification** (mandatory — even if just "This product is not subject to WaterMark certification")

**Minimum 600 characters. No duplicate descriptions across products.**

## SKU convention

```
EA-<CATEGORY-CODE>-<DESCRIPTOR>-<SIZE-OR-STAGE>
```

Examples:
- `EA-WF-RO-6S` — Water Filter, RO, 6 Stage
- `EA-CART-SED-10x2.5` — Cartridge, Sediment, 10x2.5"
- `EA-PUMP-12V-KIT` — Pump, 12V, Kit
- `EA-DT-100L-BUND` — Dosing Tank, 100L, Bunded

Category codes: `WF` (water filters), `CART` (cartridges), `BUB` (bubblers & coolers), `PUMP`, `TANK`, `DT` (dosing tank), `PLB` (plumbing), `PARTS`.

## Image standards

- Minimum 3 images per product
- First image: hero shot (white background or transparent)
- Second image: in-context (installed, in use)
- Third image: spec sheet, dimensions, or close-up of key feature
- All images: WebP format (Shopify auto-converts), max 2000px on long edge
- Alt text: required, descriptive, includes product type and key feature

## Variants

- Single-variant products still use a variant for SKU/price/stock
- Multi-variant products: variants by size, capacity, or finish
- Variant titles follow same convention as product titles
- All variants must have price, SKU, weight set
