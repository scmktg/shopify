# products.json — schema, conventions, and authoring guide

This file is the canonical reference for `data/products.json`. It tells
you which fields exist, what they drive, and how to add or edit an
entry without breaking the build.

## Source-of-truth split

The storefront splits product data across two systems. The boundary
is non-negotiable — read both columns before authoring.

| Lives in **Shopify** (synced) | Lives in **`data/products.json`** (this file) |
|---|---|
| `title` (product name) | `categories` (drives URL routing) |
| `price`, `compareAtPrice`, currency | `tags` (free-form, not category routing) |
| `availableForSale`, `quantityAvailable` | `shortDescription`, `description` (markdown) |
| Variants, SKU | `features`, `recommendedFor` |
| Images | `headlineSpecs`, `fullSpecs` |
| Shipping rates / zones | `compliance.watermark` (status + licence + certifier + validUntil) |
| Handle (the join key) | `compliance.note` (markdown) |
|  | `ctas.primary`, `ctas.secondary` |
|  | `upsells.boughtTogether`, `upsells.moreInCategory` |
|  | `seo.title`, `seo.description`, `seo.ogImage` |

If a field isn't in the Shopify column, the storefront reads it from
`products.json` even when Shopify has a value. There's no fallback.

## File location

`data/products.json`. A flat object keyed by Shopify product handle.

```jsonc
{
  "__placeholders": { /* file-level metadata, see below */ },
  "<shopify-handle>": { /* ProductContent — see schema */ },
  "<another-handle>":  { /* ... */ }
}
```

## Conventions

| Key shape | Meaning |
|---|---|
| `<normal-handle>` | A real Shopify product. Must validate against the schema. Must exist on the Shopify side too — the bidirectional check fails the build otherwise. |
| `_<scaffold-handle>` | A scaffolding entry used to demonstrate schema shapes (e.g. `_seed-minimal-example`). Validated as `ProductContent`, but exempt from the cross-Shopify check. Won't render at any URL. |
| `__<key>` | File metadata, **not** a product entry. Skipped by the validator and the loader. Today the only key is `__placeholders`, which lists handles that contain placeholder content awaiting real data. |

## Schema

Defined in `lib/products/schema.ts`. Every field is optional except
`categories`. Sections render conditionally on data presence — no
empty headers, no skeleton blocks.

```ts
interface ProductContent {
  categories: readonly [string, string];   // [primaryCategory, subcategory]
  tags?: readonly string[];                 // free-form labels (e.g. "watermark", "stainless-steel")
  shortDescription?: string;                // one-line tagline; meta-description fallback #2
  description?: string;                     // markdown body; see allowlist below
  features?: readonly string[];             // bullet list
  headlineSpecs?: readonly { label: string; value: string }[]; // ≤ 4
  fullSpecs?:     readonly { label: string; value: string }[]; // unlimited
  recommendedFor?: readonly string[];       // bullet list
  compliance?: {
    watermark?: {
      status: 'certified' | 'pending' | 'not_required' | 'not_certified';
      licenceNumber: string | null;
      certifier: string | null;
      validUntil: string | null;            // ISO 'YYYY-MM-DD'
    } | null;
    wels?: null;                            // reserved
    note?: string | null;                   // markdown
  };
  ctas?: {
    primary?: string | null;                // null/missing → "Add to cart"
    secondary?: string | null;              // null/missing → no second CTA
  };
  upsells?: {
    boughtTogether?: readonly string[];     // explicit handles for the rail
    moreInCategory?: 'auto' | readonly string[];
  };
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string | null;
  };
}
```

### `categories` rules

- Exactly **two** slugs: `[primaryCategory, subcategory]`.
- Both slugs must exist in `content/categories.ts` (the canonical
  category tree). The validator reports typos with a "did you mean…"
  hint.
- The pair drives the URL: `/[category]/[subcategory]/[handle]/`.

### `description` markdown subset

The renderer (`lib/products/markdown.ts`) is **server-only**. The
allowlist is:

- `p`, `strong`, `em`, `ul`, `ol`, `li`
- `h2`, `h3`, `h4`
- `a` (links)

Anything outside the allowlist is stripped after parsing. No tables,
no inline HTML, no images, no code blocks. The same renderer is used
for `compliance.note` so a merchant can drop a link to the ABCB
database or AS/NZS standard reference inline.

### `headlineSpecs` cap

Capped at four rows. Extras are dropped at render time with a dev
warning, and the validator emits a non-blocking warning at build time
so the JSON ships clean.

### `compliance.watermark` rendering

| `status` | What renders in the buy box |
|---|---|
| `'certified'` | Blue ShieldCheck badge + caption (licence / certifier / valid until — each shown only when set) |
| `'pending'` | Amber ShieldAlert badge with "Certification pending" |
| `'not_required'` / `'not_certified'` / null | Nothing |

The validator emits a **warning** (not an error) when `status` is
`'certified'` and `licenceNumber` is `null`. The launch gate is the
audit script: `npm run audit:watermark` reports those entries and is
the pre-launch hand-off check.

If a product genuinely needs "not required" messaging (e.g. it's not
a plumbing product), put the explanation in `compliance.note` rather
than relying on the `not_required` status — the badge slot is silent.

### `upsells.moreInCategory: "auto"` rule

Two-step search in `lib/products/getProductContent.ts`:

1. Match products where **both** `categories[0]` and `categories[1]`
   equal the current product's tuple.
2. If fewer than 4, widen to **any product sharing `categories[0]`**
   (same primary category, any subcategory).

Capped at 4. Excludes the current handle. Override with an explicit
handle array when the merchant wants curated rather than auto.

### `ctas`

Both fields default to "render the standard CTA":

- `primary: null` or missing → button label is "Add to cart".
- `secondary: null` or missing → no second button rendered.

When a string is supplied for `primary`, the in-stock label changes;
the "Out of stock" and "Adding…" states still take precedence.

### `seo` fallback chain

Meta description resolution, in order:

1. `content.seo.description`
2. `content.shortDescription`
3. First ~155 chars of plain-text `content.description` (markdown
   stripped via the same renderer).

`og:image` resolves to `content.seo.ogImage` when set, otherwise
the Shopify featured image URL.

## Validation

Run before committing edits:

```sh
npm run validate:products
```

Wired to `prebuild` so a malformed file fails the production build
with a punch list rather than crashing in front of a customer. The
script does two passes:

1. **Synchronous shape + cross-handle pass.** Always runs. Checks the
   JSON shape; that `categories` resolves in `content/categories.ts`;
   that `headlineSpecs` ≤ 4; that every `boughtTogether` and explicit
   `moreInCategory` handle exists in this file. Errors are blocking.
2. **Async cross-Shopify pass.** Skipped when Shopify env vars
   (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`,
   `SHOPIFY_API_VERSION`) are absent. When set, runs two checks:
   - **products.json → Shopify** (typo / stale entry guard). Every
     handle in this file must resolve to a real Shopify product.
     **Always blocks the build.**
   - **Shopify → products.json** (migration backlog). Every Shopify
     product should have a corresponding entry. Reports missing
     handles as a **warning by default** during the staged rollout,
     so partially-populated catalogues don't fail every preview
     deploy. Set `STRICT_PRODUCTS_VALIDATION=1` in the production
     build env to escalate this to a hard error before launch.

Sample valid run:

```
[validate] data/products.json: 7 entries
✓ shape + cross-handle references valid
! 1 warning(s) — non-blocking; the audit script enforces the launch gate.
! 2 scaffolding entries skipped from Shopify check: __placeholders, _seed-minimal-example
! Shopify env not set — skipping cross-Shopify handle check.
```

Sample failure (intentional typo in `categories`):

```
✖ products.json failed validation

  ✖ commercial-stainless-steel-filtered-cold-water-bubbler-round-wm
      categories
      Pair ['plumbing', 'commerical'] is not in content/categories.ts.
      Add the slugs to the category tree first, or fix the typo.

1 error(s). Fix the above and re-run.
```

## Worked example — minimal entry

```json
"my-new-cartridge-handle": {
  "categories": ["cartridges", "sediment"]
}
```

That's enough to render: Shopify provides title, price, stock,
images; the page renders breadcrumb + price + buy box + brand trust
strip + auto "More in this category" rail. No content sections,
no overview, no specs.

## Worked example — full entry

See `data/products.json` for two real examples:

- `commercial-stainless-steel-filtered-cold-water-bubbler-round-wm`
  — all sections populated, certified WaterMark with licence + caption.
- `wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system`
  — long-form description with sub-section headings and an ABCB link
  in `compliance.note`, three explicit `boughtTogether` handles.

## When to add a new entry

The merchant adds the product in Shopify first (so a real handle
exists). The engineer then drops an entry in `products.json` keyed by
that handle. Both should ship in the same deploy — the cross-Shopify
check fails the build until both sides are populated.

## When to remove an entry

When the merchant unpublishes / deletes a product in Shopify, remove
its entry from this file in the same change. Otherwise the validator
reports it as "in products.json but not in Shopify" and fails the
build.

## Related files

- `lib/products/schema.ts` — TypeScript types.
- `lib/products/validator.ts` — validation rules (mirrors this doc).
- `lib/products/getProductContent.ts` — runtime accessors.
- `lib/products/markdown.ts` — server-only markdown renderer.
- `scripts/validate-products.ts` — CLI (`npm run validate:products`).
- `scripts/audit-watermark-status.ts` — pre-launch certification
  audit (`npm run audit:watermark`).
- `content/categories.ts` — category tree authority.
