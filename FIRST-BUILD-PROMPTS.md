# First Build Prompts

When you start the build with Claude (after Phases A–D of `SETUP-CHECKLIST.md` are done), use these prompts in sequence. Each one is a focused task that produces a small, reviewable commit.

**Before any prompt below**: ensure Claude has read `/CLAUDE.md` and the relevant docs file. The first prompt below handles this.

---

## Prompt 1 — Initialise the project

```
Read /CLAUDE.md and /docs/01-architecture-decisions.md in this repo first.

Then begin Milestone 0 from /docs/09-build-roadmap.md. Initialise a Next.js 15 + TypeScript + Tailwind project at the root of this repo by creating these files one at a time:

1. package.json (include @shopify/storefront-api-client, lucide-react, clsx; latest stable Next 15, React 19, TypeScript)
2. tsconfig.json
3. next.config.js
4. tailwind.config.ts
5. postcss.config.js
6. app/layout.tsx (minimal)
7. app/page.tsx (minimal "hello world")
8. app/globals.css (Tailwind directives + minimal base styles)

Use the conventions from /docs/08-conventions.md.

Don't install dependencies — Vercel will install them on deploy. Just create the files.

Show me each file before committing. Wait for my approval before moving to the next file.
```

**Verification after this**:
- Vercel deploy should succeed
- The staging URL should show "hello world" or similar minimal content
- No TypeScript errors in Vercel build logs

---

## Prompt 2 — Header, footer, and basic layout

```
Read /docs/05-design-system.md and /docs/02-site-structure.md.

Now build Milestone 1 from /docs/09-build-roadmap.md — the layout shell.

Create:
1. components/layout/Header.tsx — black header banner with the wholesale message, then the main nav with the 5 items (Water Filters, Cartridges, Bubblers, Pumps & Tanks, Plumbing) and a search + cart icon
2. components/layout/Footer.tsx — black footer with 4 columns (Shop, Learn, About, Contact)
3. components/layout/MobileMenu.tsx — hamburger menu for mobile
4. Update app/layout.tsx to use Header and Footer

Design rules:
- White page background
- Black banner and header
- Black footer
- #0066CC blue for any interactive element
- System font stack only — NO web fonts
- Use lucide-react for icons (search, cart, hamburger, close, X)

Show me each component before committing. Wait for my approval per file.
```

**Verification**:
- Header and footer render with correct colours
- Nav shows all 5 items
- Mobile menu works (hamburger opens, close button closes)
- Lighthouse Performance still ≥ 90

---

## Prompt 3 — Homepage shell

```
Read /docs/05-design-system.md and /docs/06-content-rules.md.

Build a clean homepage at app/page.tsx. Sections, top to bottom:

1. Hero section — H1 with the brand positioning, single CTA button to /water-filters/, brief value prop
2. Five category tiles in a grid — links to each top-level category
3. A trust strip — wholesale pricing message, free shipping over $200, AU-owned
4. A simple "How to choose" section pointing to a few water-problem pages (placeholder links for now since pages don't exist yet)

Keep copy minimal and direct per /docs/06-content-rules.md. No fluff.

Show me before committing.
```

**Verification**:
- Homepage looks clean and minimal
- All links use correct URL paths from /docs/02-site-structure.md
- Mobile responsive

---

## Prompt 4 — Shopify Storefront client (using official package)

```
Read /docs/07-shopify-integration.md and /docs/03-data-model.md fully before writing any code.

Begin Milestone 2 — Shopify connection.

Create:
1. lib/shopify/client.ts — instantiate the official @shopify/storefront-api-client using the createStorefrontApiClient factory, reading SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PRIVATE_TOKEN, SHOPIFY_API_VERSION env variables. Throw clear errors if env vars are missing.
2. lib/shopify/fragments.ts — shared GraphQL fragments for product data (image, variant, metafield)
3. lib/shopify/queries/getProductByHandle.ts — query function that takes a handle, returns a typed Product, including all the metafields specified in /docs/03-data-model.md
4. types/shopify.ts — raw Shopify response types (with edges/nodes etc.)
5. types/product.ts — clean app-level Product type that abstracts away the GraphQL shape (no edges/nodes; metafields as a flat object)
6. lib/shopify/transformers.ts — function transforming raw Shopify product into clean Product type

Use the official client per /docs/07-shopify-integration.md. Do NOT hand-roll fetch wrappers.
Use SHOPIFY_API_VERSION env var (currently 2026-04).

Don't render anything yet — just the data layer.

Show me each file before committing.
```

**Verification**:
- Build succeeds on Vercel
- TypeScript types are correct
- No env variable warnings (Vercel logs)
- The official package appears in package.json

---

## Prompt 5 — First product page (proof of concept)

```
Read /docs/05-design-system.md and /docs/03-data-model.md.

Now wire up the Shopify client to render a real product. Create:

1. app/(shop)/[category]/[subcategory]/[handle]/page.tsx — dynamic route for product detail. Use generateMetadata for SEO. Wrap getProductByHandle with unstable_cache from next/cache (revalidate: 60, tags: ['products', `product:${handle}`])
2. components/product/ProductDetail.tsx — the visual layout: image gallery, title, price, variant selector, add-to-cart button (placeholder — cart functionality is Milestone 5), description

For now, fetch a product I'll specify by handle. Don't worry about the cart functionality yet.

The goal: I should be able to visit /water-filters/under-sink/<some-handle>/ and see a real Shopify product render.

Show me each file before committing.
```

**Manual step before this prompt**: create one test product in Shopify Admin (any product — could be a test with name "Test Water Filter"). Note its handle (the auto-generated URL slug). Then in your prompt, replace `<some-handle>` with that real handle.

**Verification**:
- Visiting the URL renders the real product from Shopify
- Title, price, image all show correctly
- Lighthouse Performance ≥ 90
- Page metadata appears in the HTML head (view source)

---

## When to stop and check in with me

After Prompt 5, you'll have a working end-to-end skeleton: a homepage, navigation, and a real product rendering from Shopify. That's a major milestone.

**Stop here and message me back.** I'll review what's been built, look at the staging URL, and produce the next prompt sequence (category pages, cart, etc.) tailored to whatever the actual code looks like.

Don't run all 5 prompts back-to-back without checking the result of each one. Rushing produces compounding errors.

---

## If something goes wrong

**Claude proposes code that contradicts the docs**: stop and quote the relevant doc back to Claude. Don't accept the contradiction.

**Build fails on Vercel**: paste the Vercel error log into Claude. Ask Claude to fix only the specific error, not refactor anything else.

**Claude wants to add dependencies**: that's fine — package.json is meant to grow. But check that the dependency is mainstream and well-maintained.

**Claude wants to deviate from the design system** ("could we use a slightly different blue?"): don't allow it. The design system is locked at `#0066CC` blue + black + white. Deviation = scope creep.

**Claude proposes hand-rolling a Shopify fetch wrapper**: stop. We use the official `@shopify/storefront-api-client` package. The doc explicitly says so. Reject the proposal and ask Claude to re-read /docs/07-shopify-integration.md.

**Claude uses an old API version like 2024-10**: stop. Current is `2026-04`. The env var SHOPIFY_API_VERSION should be the source of truth, not a hardcoded fallback.

**You don't understand what Claude is proposing**: ask Claude to explain it in plain English first. Don't accept code you don't understand. The docs were written so this never has to happen — if Claude is making mysterious choices, it probably hasn't read the docs.
