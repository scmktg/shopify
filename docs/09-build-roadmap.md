# Build Roadmap

This roadmap sequences the build into milestones. Each milestone has a clear "done" criterion. Work top-to-bottom — don't skip ahead.

## Milestone 0 — Setup (Day 1, ~2 hours)

- [ ] Create GitHub repo `enviroaqua-web`
- [ ] Create Vercel project, connect to GitHub repo
- [ ] Create Shopify Storefront API access token
- [ ] Set Vercel environment variables (Shopify token, store domain)
- [ ] Add `/docs/` folder (this pack) to repo
- [ ] Initial Next.js 15 + Tailwind + TypeScript scaffold
- [ ] First deploy succeeds (blank "hello world" page on Vercel)

**Done when**: visiting the Vercel staging URL shows a Next.js placeholder page.

## Milestone 1 — Layout & navigation (Day 1, ~2 hours)

- [ ] Header component (top banner + main nav)
- [ ] Footer component
- [ ] Mobile menu (hamburger → full-screen overlay)
- [ ] Tailwind config with brand colours
- [ ] Root layout (`app/layout.tsx`)
- [ ] Homepage shell (hero + 5 category tiles + value prop)

**Done when**: site has correct nav structure, looks clean per design system, all top-level routes return 404 with consistent layout.

## Milestone 2 — Shopify connection (Day 1, ~2 hours)

- [ ] Storefront API client in `/lib/shopify/client.ts`
- [ ] Type definitions for Product, Collection, Cart in `/types/`
- [ ] First query: fetch a single product by handle
- [ ] Test with real Shopify product (one created manually in Admin)
- [ ] Cart context (`CartProvider`) with create/add/update/remove

**Done when**: a hard-coded product handle renders real data from Shopify on a test page.

## Milestone 3 — Product detail page (Day 2)

- [ ] Route: `/[category]/[sub]/[handle]/page.tsx`
- [ ] Fetch product by handle, validate it belongs to category/sub
- [ ] Render: gallery, title, price, variant selector, add-to-cart, description, spec table
- [ ] WaterMark badge component (reads `enviroaqua.watermark_status` metafield)
- [ ] WaterMark non-certified warning banner (when applicable)
- [ ] Breadcrumbs
- [ ] Cart drawer (slides in on add-to-cart)
- [ ] Schema.org Product JSON-LD
- [ ] Metadata (title, description, OG, canonical)

**Done when**: product page is fully functional with real Shopify data, schema validates, lighthouse 90+.

## Milestone 4 — Category pages (Day 3)

- [ ] Top-level category route: `/[category]/page.tsx`
- [ ] Sub-category route: `/[category]/[sub]/page.tsx`
- [ ] Editorial intro support (markdown blocks for category descriptions)
- [ ] Product grid with pagination (24 per page)
- [ ] Filter UI (client-side, no URL params): WaterMark certified, stages, micron, etc.
- [ ] FAQ section component
- [ ] BreadcrumbList + CollectionPage schema
- [ ] All 5 top-level category landing pages live with editorial content

**Done when**: all category and sub-category URLs return real product data with proper editorial framing.

## Milestone 5 — Cart & checkout (Day 4)

- [ ] Cart drawer component
- [ ] Cart line item: image, title, variant, quantity, price, remove
- [ ] Cart subtotal, free shipping progress bar
- [ ] "Checkout" button → Shopify-hosted checkout URL
- [ ] Cart persistence via cookie token
- [ ] Empty cart state
- [ ] Cart summary on `/cart` page (full-page version)

**Done when**: full add-to-cart → checkout → order flow works end-to-end with a real Shopify product.

## Milestone 6 — Editorial pages (Day 5–6)

- [ ] Markdown rendering setup (`@next/mdx` or `react-markdown`)
- [ ] Editorial layout component
- [ ] `/use/[slug]/page.tsx` reads from `content/use/`
- [ ] `/water-problems/[slug]/page.tsx` reads from `content/water-problems/`
- [ ] `/locations/[slug]/page.tsx` reads from `content/locations/`
- [ ] `/help/[slug]/page.tsx` reads from `content/help/`
- [ ] FAQ schema generation from frontmatter
- [ ] Internal linking modules (related products, related problems)
- [ ] Skeleton markdown files for all 9 problem pages, 6 use-cases, 4 locations

**Done when**: editorial routing works, all skeletons exist with placeholder content, real content can be filled in by editing markdown.

## Milestone 7 — Search & discovery (Day 7)

- [ ] Search input in header
- [ ] Search results page using Shopify predictive search
- [ ] Mobile search overlay
- [ ] Empty state
- [ ] Sitemap generation (`app/sitemap.ts`)
- [ ] robots.txt (`app/robots.ts`)

**Done when**: site search works, sitemap is generated and includes all expected URLs.

## Milestone 8 — Migration & content (Week 2)

- [ ] Final migration spreadsheet completed (with WaterMark numbers from suppliers)
- [ ] Shopify metafield definitions created
- [ ] Products imported into Shopify (CSV import)
- [ ] All product images uploaded
- [ ] All redirects added to `next.config.js` from migration spreadsheet
- [ ] All editorial pages have real content (problem pages, use-cases, locations)
- [ ] Homepage has real content (no Lorem Ipsum)
- [ ] About page, shipping page, returns page, contact page

**Done when**: site has 100% real content, all 145 products live, all redirects in place.

## Milestone 9 — Pre-launch (Week 3)

- [ ] Google Analytics 4 set up
- [ ] Vercel Analytics enabled
- [ ] Google Search Console set up for staging URL
- [ ] Google Merchant Centre feed validated
- [ ] All redirects tested (every URL from migration spreadsheet)
- [ ] Lighthouse audits: Performance 90+, SEO 100, Accessibility 95+
- [ ] Schema validator: all page types pass
- [ ] Cross-browser test (Chrome, Safari, Firefox, mobile Safari)
- [ ] Real test order placed end-to-end
- [ ] Email notifications validated (order confirmation, shipping notification)
- [ ] Privacy policy, terms, shipping policy, returns policy all in place

**Done when**: full launch checklist passes.

## Milestone 10 — Launch (Week 4)

- [ ] DNS cutover from old WordPress site to Vercel
- [ ] Submit XML sitemap to Google Search Console
- [ ] Verify redirects working live
- [ ] Monitor Search Console for crawl errors (daily for first week)
- [ ] Monitor Vercel Analytics + GA4 for traffic patterns
- [ ] Customer service ready for support inquiries

**Done when**: enviroaqua.com.au resolves to the new site, old URLs redirect, traffic is flowing.

## Post-launch priorities

1. Monitor and fix any 404s or broken redirects (week 1)
2. Begin content velocity: 1 new help guide per week
3. Customer reviews integration (Judge.me or similar)
4. Email marketing setup (welcome series, abandoned cart, post-purchase)
5. Newcastle and Sydney location hubs (once Central Coast ranks top-3)
6. Quarterly content refresh on top-performing problem pages
