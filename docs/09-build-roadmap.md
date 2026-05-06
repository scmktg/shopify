# Build Roadmap

This roadmap sequences the build into milestones. Each milestone has a clear "done" criterion. Work top-to-bottom — don't skip ahead.

## Milestone 0 — Setup ✅ COMPLETE

- [x] Create GitHub repo `enviroaqua-web`
- [x] Create Vercel project, connect to GitHub repo
- [x] Create Shopify Storefront API access token
- [x] Set Vercel environment variables (Shopify token, store domain)
- [x] Add `/docs/` folder (this pack) to repo
- [x] Initial Next.js 16 + Tailwind v4 + TypeScript scaffold
- [x] First deploy succeeds

## Milestone 1 — Layout & navigation ✅ COMPLETE

- [x] Top banner component (sitewide wholesale message)
- [x] Header component with sticky black nav
- [x] Megamenu dropdown on hover/focus (CSS-only, server component)
- [x] Footer component (4 columns)
- [x] Mobile menu (hamburger → full-screen overlay)
- [x] Brand tokens via Tailwind v4 `@theme` directive
- [x] Root layout (`app/layout.tsx`)

## Milestone 2 — Shopify connection ✅ COMPLETE

- [x] Storefront API client in `/lib/shopify/client.ts`
- [x] Type definitions for Product, Cart in `/types/`
- [x] First query: `getProductByHandle` with full metafield set
- [x] Tested with real Shopify product
- [x] List query (`getProducts`) and search query (`searchProducts`)
- [x] Cart Server Actions (`createCart`, `addToCart`, `updateCartLine`,
  `removeCartLine`, `getCart`)

## Milestone 3 — Product detail page ✅ COMPLETE

- [x] Route: `app/(shop)/[category]/[subcategory]/[handle]/page.tsx`
- [x] Fetches product by handle, validates it belongs to category/sub
  via `primary-cat:` / `sub-cat:` tags (404 on mismatch)
- [x] Gallery, title, price, stock indicator, description
- [x] Specifications panel rendering each non-null metafield with
  formatted labels and units
- [x] Breadcrumbs
- [x] Add to Cart wired through CartProvider
- [x] Schema.org Product JSON-LD with hasCertification when WaterMark
  certified
- [x] Metadata (title, description, OG, canonical)
- [ ] Variant selector for multi-variant products (currently always
  adds the first variant)
- [ ] WaterMark non-certified warning banner

## Milestone 4 — Category pages ✅ COMPLETE

- [x] Top-level category route: `app/(shop)/[category]/page.tsx`
- [x] Sub-category route: `app/(shop)/[category]/[subcategory]/page.tsx`
- [x] Editorial intros for top-level categories (`content/category-intros.ts`)
- [x] Single source of truth for the catalogue tree
  (`content/categories.ts`)
- [x] Product grid (4 cols desktop, 2 cols mobile) via ProductCard
- [x] Sort dropdown (Featured, Newest, Best selling, Price asc/desc)
- [x] Load more button (cursor-paginated via Server Action)
- [x] CollectionPage + BreadcrumbList JSON-LD
- [ ] FAQ section component (deferred)
- [ ] Filter UI (WaterMark certified, stages, micron, etc.) — deferred

## Milestone 5 — Cart & checkout ✅ COMPLETE

- [x] CartProvider with localStorage persistence and single-flight
  cart creation
- [x] Cart drawer with line items, quantity stepper, free-shipping
  progress bar, subtotal, checkout link
- [x] Empty state in drawer + on `/cart`
- [x] Full-page `/cart` route
- [x] Cart token rehydration on mount; expired tokens silently cleared
- [x] Checkout button → Shopify-hosted `cart.checkoutUrl`

## Milestone 6 — Editorial pages — NOT BUILT

The editorial markdown surfaces (`/use`, `/water-problems`, `/locations`,
`/help`) are intentionally not built yet. The site-wide infrastructure
(footer links, sitemap entries) treats them as future routes. Pick this
up when ready to write content.

- [ ] Markdown rendering setup
- [ ] `/use/[slug]/page.tsx`
- [ ] `/water-problems/[slug]/page.tsx`
- [ ] `/locations/[slug]/page.tsx`
- [ ] `/help/[slug]/page.tsx`
- [ ] Skeleton markdown for 9 problem pages, 6 use-cases, 4 locations
- [ ] FAQ schema generation from frontmatter

## Milestone 7 — Search & discovery ✅ MOSTLY COMPLETE

- [x] Search input in header with overlay
- [x] Live suggestions (debounced 300 ms) via `predictiveSearch`
- [x] Search results page (`/search?q=`)
- [x] Sitemap generation (`app/sitemap.ts`) with categories,
  subcategories, and products (editorial pages excluded until built)
- [x] robots.txt (`app/robots.ts`)

## Milestone 8 — Migration & content — NOT STARTED

- [ ] Final migration spreadsheet completed (with WaterMark numbers)
- [ ] Shopify metafield definitions verified across all products
- [ ] Products imported into Shopify (CSV import)
- [ ] All product images uploaded
- [ ] All redirects added to `next.config.js`
- [ ] All editorial pages have real content
- [ ] About / shipping / returns / contact pages populated

## Milestone 9 — Pre-launch — NOT STARTED

- [ ] Google Analytics 4 set up
- [ ] Vercel Analytics enabled
- [ ] Google Search Console set up
- [ ] Google Merchant Centre feed validated
- [ ] All redirects tested
- [ ] Lighthouse audits: Performance 90+, SEO 100, Accessibility 95+
- [ ] Schema validator: all page types pass
- [ ] Cross-browser test
- [ ] Real test order placed end-to-end
- [ ] Email notifications validated

## Milestone 10 — Launch — NOT STARTED

- [ ] DNS cutover from old WordPress site to Vercel
- [ ] Submit XML sitemap to Google Search Console
- [ ] Verify redirects working live
- [ ] Monitor Search Console for crawl errors
- [ ] Customer service ready for support inquiries

## Post-launch priorities

1. Monitor and fix any 404s or broken redirects (week 1)
2. Begin content velocity: 1 new help guide per week
3. Customer reviews integration (Judge.me or similar)
4. Email marketing setup
5. Newcastle and Sydney location hubs
6. Quarterly content refresh on top-performing problem pages

## Outstanding placeholder items (cross-milestone)

These need attention before launch:

- Logo asset: `/logo.svg` referenced by LocalBusiness / Organization
  schema but not uploaded. Upload to `/public/logo.svg`.
- Variant selector on the product page (multi-variant products
  currently always add the first variant).
- WaterMark non-certified warning banner on product pages.
- Webhook handlers (`/api/webhooks/products|collections|inventory`)
  for on-demand revalidation. `SHOPIFY_WEBHOOK_SECRET` is documented
  in `docs/01` but no route handler consumes it yet.
- Contact form on `/contact/` — intentionally removed because the
  previous implementation was a stub that simulated success without
  actually sending. Reinstate once a backend is wired (Formspree,
  Vercel function, or direct email integration). The page currently
  exposes phone, email, showroom address, and social links.
- `NEXT_PUBLIC_GA_ID` not yet configured — flagged in
  `content/privacy.md` and required before launch for analytics.

### Resolved 2026-05

- Real business data wired sitewide via `content/business-info.ts`:
  phone (02) 8772 8162, email info@enviroaqua.com.au, address
  6/45 Amsterdam Cct Wyong NSW 2259, ABN 24 638 197 734, ACN
  638 197 734, Facebook + Instagram socials. Footer, /contact/,
  /shipping/, /returns/, /about/, /terms/, /privacy/, and
  /locations/central-coast-nsw/ all render the real values.
- Returns policy corrected to 14 days from delivery, damaged or
  faulty only (was incorrectly listed as 30-day change-of-mind).
- Shipping rates updated from a single placeholder to the real
  tiered Standard / Express structure plus free Click & Collect
  from the Wyong showroom.
- Same-day dispatch cutoff corrected from 1pm AEST → 12pm AEST.
- LocalBusiness JSON-LD now emitted sitewide from `app/layout.tsx`
  with the real address, phone, openingHours, and social sameAs
  links — boosts local SEO ranking.
- All `/about/`, `/about/our-pricing/`, `/contact/`, `/shipping/`,
  `/returns/`, `/privacy/`, `/terms/` pages now resolve with real
  content.
