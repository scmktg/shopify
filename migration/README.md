# Migration Spreadsheet — How to Use

This is your single source of truth for the WordPress → Shopify product migration. Every product decision lives here. Don't make decisions outside this file.

## What's in it

One row per current product (191 rows). Sorted by action priority — your most important decisions are at the top, the CUT items are at the bottom.

## Column groups

The spreadsheet is divided into 6 column groups, left to right:

### 1. Identity (current state)
What the product currently is in WordPress.
- `current_id` — WordPress ID
- `current_name` — current product title
- `current_type` — simple or variable
- `current_price` — current regular price
- `current_stock` — stock count if set
- `current_categories` — current WordPress category

### 2. Decisions (the most important columns)
What we're doing with this product.
- `action` — KEEP / REWRITE / MERGE / SPLIT / CUT (see action types below)
- `new_category` — top-level: water-filters, cartridges, bubblers, pumps-and-tanks, plumbing
- `new_subcategory` — sub-category slug
- `new_handle` — URL slug for the product
- `new_url` — full new URL path
- `new_sku_suggested` — SKU in EA-CAT-DESCRIPTOR format
- `watermark_status` — certified / not_required / not_certified / unknown / pending

### 3. Tags
Tags drive the use-case and problem landing pages.
- `tags_use_case` — comma-separated `use:*` tags
- `tags_problem` — comma-separated `problem:*` tags

### 4. Reasoning
Why this decision was made.
- `reason` — one-line justification
- `notes` — caveats, things to watch out for, supplier follow-ups

### 5. YOU FILL IN (the work you need to do)
These columns are blank. You fill them in.
- `YOU_FILL_watermark_licence_number` — get from supplier for any product marked `certified` or `unknown`
- `YOU_FILL_watermark_certifier` — who issued the cert (IAPMO, SAI Global, etc.)
- `YOU_FILL_watermark_valid_until` — expiry date
- `YOU_FILL_gtin_or_ean` — barcode if supplier provides
- `YOU_FILL_supplier_name` — for your own tracking
- `YOU_FILL_decision_override` — if you disagree with my action call, write your override here
- `YOU_FILL_extra_notes` — anything else

### 6. Quality flags + reference
Information for prioritising rewrites and reviews.
- `qf_no_description` — flag (YES = empty description)
- `qf_thin_description` — flag (YES = under 300 chars)
- `qf_no_attributes` — flag (YES = no attributes set)
- `qf_low_images` — flag (YES = fewer than 3 images)
- `qf_no_sku` — always YES currently (no SKU set)
- `qf_no_gtin` — always YES currently
- `existing_watermark_signal` — was there any WaterMark mention in the existing product?
- `existing_wels_signal` — was there any WELS mention?
- `current_image_count`, `current_description_length`
- `old_url_pattern` — current URL (for redirect mapping)

## Action types

| Action | Meaning | What you do |
|---|---|---|
| **KEEP** | Migrate as-is, no changes needed beyond standardising | Import into Shopify with new category/SKU/metafields |
| **REWRITE** | Migrate but description/data needs rewriting before launch | Rewrite description per `/docs/06-content-rules.md`, then import |
| **MERGE** | Duplicate of another product — combine and delete this one | Manually merge images/best content into the canonical, then delete this row |
| **SPLIT** | Variable product that should become multiple products | Split into separate Shopify products by variant axis (size, finish, bunding, etc.) |
| **CUT** | Remove from catalogue entirely | Don't migrate. Delete from WordPress on cutover. Add 410 Gone or 301 redirect in `next.config.js` |

## Summary of decisions

- **191 current products → ~150 final products** after migration
- **154 KEEP**: migrate with standardisation
- **14 REWRITE**: migrate but rewrite descriptions first
- **2 MERGE**: duplicates to consolidate
- **1 SPLIT**: the dosing tank variable parent → 5 individual SKUs (50/100/200/300/500L)
- **20 CUT**: removed entirely (mirrors, cabinets, basins, decorative bathroom, aquarium, generic non-water-systems)

## What to do with this spreadsheet — in order

### Today
1. **Open the CSV** in Excel or Google Sheets
2. **Read the action column** — these are my recommendations. Use the `YOU_FILL_decision_override` column if you disagree with any
3. **Identify all rows where `watermark_status` is `certified` or `unknown`** — these are the supplier follow-ups
4. **Email suppliers** for WaterMark certificate numbers and PDFs (template below)
5. **Spot-check 10 KEEP rows** to confirm new categories look right

### This week
6. **Fill in `YOU_FILL_watermark_licence_number`, `_certifier`, `_valid_until`** as suppliers reply
7. **For products where supplier confirms NO WaterMark**: change `watermark_status` to `not_certified` (or change action to CUT if it's a toilet/tap that legally must be certified)
8. **Fill in `YOU_FILL_gtin_or_ean`** wherever supplier provides barcode

### Before product import
9. **For SPLIT (dosing tanks)**: decide on the 5 sizes × bunded/non-bunded matrix and add new rows manually (so you have one row per final product)
10. **For MERGE**: pick the canonical row, merge content, mark the duplicate as DELETE
11. **Final review**: sort by action and category — does the breakdown look right?

### At product import
12. **Convert the spreadsheet to Shopify import format** (column mapping per `/docs/03-data-model.md`)
13. **Import via Shopify Admin** → Products → Import
14. **Verify metafields** are populated correctly on every product

## Supplier email template (for WaterMark)

> **Subject:** WaterMark certification request — [Product name]
>
> Hi [Supplier],
>
> We're updating our product compliance documentation. For the following product:
>
> **[Product name]**  
> SKU/Reference: [their SKU]
>
> Could you please confirm:
>
> 1. Is this product WaterMark certified for the Australian plumbing supply?
> 2. If yes, please provide:
>    - WaterMark licence number (e.g. WMK12345)
>    - Certifying body (IAPMO, SAI Global, etc.)
>    - Valid-until date
>    - A copy of the certification certificate (PDF)
> 3. If no, please confirm so we can update our product information accordingly.
>
> Australian regulations require WaterMark certification for any product permanently connected to the mains water supply. We need this information to ensure our customers can buy with confidence.
>
> Many thanks,
> [Your name]
> Enviro Aqua

## What happens to products with `watermark_status: unknown`

These need supplier follow-up. After follow-up, one of three things happens:

1. **Supplier confirms certification + provides licence number** → status becomes `certified`, product KEEP
2. **Supplier confirms NOT certified** → status becomes `not_certified`. Product gets the off-mains warning banner. Stays on site but with clear legal warning.
3. **Supplier cannot or will not confirm** (or product is genuinely not certified for a fixture that legally requires it like a toilet or mains tap) → action changes to CUT. Don't sell legally-non-compliant products.

## Notes on specific decisions

### Dosing tanks (SPLIT — most important transformation)
The current single variable product "Chemical Dosing Tank with Bunding – Available in 50L, 100L, and 200L" needs to become a proper sub-category with individual SKUs. Per the strategy decision, you're expanding to a **full range**: 50L, 100L, 200L, 300L, 500L, each in bunded and non-bunded variants. That's potentially 10 SKUs from 1 current product. Add these new rows to the spreadsheet manually.

### Plumbing items marked REWRITE
14 products are flagged REWRITE because they're toilets, kitchen taps, or bathroom mixer taps where I couldn't detect a WaterMark signal in the existing data. You need to confirm certification status with suppliers. If certified, descriptions need to be rewritten to reflect compliance properly. If not certified, the product needs a clear warning OR cut entirely (depending on legal exposure).

### CUT items — final
20 products are CUT. These are non-negotiable:
- 5 mirrors, cabinets, basins
- 4 decorative bathroom (towel rings, hooks, paper holders, basin pop-up wastes)
- 4 aquarium-related items
- 1 HVAC boiler pump
- 1 floor drain
- 1 generic PVC hose
- 1 8L solar tank (too narrow)
- 3 vanity cabinets

Each removal directly improves topical authority for water filtration. Do not second-guess these.

### Filter system parts (Fittings & Parts breakdown)
The current 50-product "Fittings & Parts" category is broken up across the new structure:
- ~22 items → `/water-filters/parts/` (housings, fittings, valves, tubing, wrenches)
- ~5 items → `/cartridges/...` (RO membranes, cartridge sets that were misfiled)
- ~3 items → `/pumps-and-tanks/components/` (pressure switches, gauges)
- 1 item → `/bubblers/parts/` (drinking fountain tap)
- ~10 items → CUT
- Rest → moved to existing categories

## Common questions

**Q: Why are some KEEP items also flagged with `qf_thin_description: YES`?**  
Because they need their description rewritten before launch — but the migration action is still KEEP (not REWRITE). REWRITE is reserved for products where compliance/categorisation requires a deeper review (mostly plumbing items pending WaterMark confirmation). Thin descriptions are a quality issue but don't change the migration decision — they go on the post-import content rewrite list.

**Q: What if I want to change a CUT decision?**  
Use `YOU_FILL_decision_override` and write the new action. But review the reasoning first — every CUT decision is there for a topical-authority reason.

**Q: Can I add new products that aren't in the current catalogue?**  
Yes — add new rows. Particularly for the dosing tank expansion, you'll be adding 9 new products (50L bunded, 50L non-bunded, 100L bunded, 100L non-bunded, etc.). Use the same column structure.

**Q: How do I generate the redirect map from this?**  
A separate script will read this spreadsheet and produce the `next.config.js` redirects array. The `old_url_pattern` and `new_url` columns are what feeds it. Don't hand-write redirects.

**Q: When does this become a Shopify import?**  
After you've filled in WaterMark numbers and GTINs and resolved any overrides, we'll generate a Shopify-format CSV from this file. That CSV imports directly into Shopify Admin. Keep this file as your source of truth even after import — it remains useful for audits and edits.

## File sanity stats

- 191 rows + 1 header
- 36 columns
- ~94KB
- UTF-8 encoded
- Comma-delimited

Open with Excel, Google Sheets, Numbers, or any CSV editor. If you make edits in Google Sheets, export back to CSV before sharing.
