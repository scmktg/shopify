# enviroaqua.com.au — WordPress → Shopify Headless (Next.js) Migration Checklist

**Built from your Google Search Console export.** Date range covered: 2024-12-29 → 2026-04-28 (~16 months). Total clicks in the period: ~2,143 | impressions: ~353,000. Primary market: **Australia (1,908 of 2,143 clicks, ~89%)**.

> See the accompanying `redirect_map.csv` for the full URL-by-URL mapping (442 unique URLs, with priority and suggested target).

---

## Executive summary — what matters most

1. **You have 326 unique product URLs in GSC**, 184 of which received clicks in the last 16 months. These plus the homepage account for ~85% of all organic clicks. **Every one needs a 301 redirect** from the WordPress URL to its new Shopify equivalent.
2. **Your single biggest existing SEO problem is duplicate canonical issues** — GSC flagged 10,797 pages as "Duplicate without user-selected canonical" plus 2,589 "Alternate page with proper canonical tag". The migration is your chance to fix this; do not carry the duplication forward.
3. **Australia is overwhelmingly your market** (89% of clicks). Geo-targeting in Shopify and Search Console for AU should be preserved.
4. **Your branded queries are healthy** ("enviro aqua", "enviro aqua filtration", "enviroaqua" account for ~13% of all clicks at ~22-26% CTR). Don't let the brand homepage drop in rankings during the cutover.

---

## 1. URL inventory — what was indexed and ranking

### Breakdown by URL type (from your top 1,000 pages)

| URL type | Unique URLs | Clicks | Impressions | Migration priority |
|---|---|---|---|---|
| `/product/<slug>/` | 274 | 1,372 | 276,880 | **Critical** |
| Homepage `/` | 1 | 487 | 31,439 | **Critical** |
| `/product-category/<slug>/` | 34 | 180 | 41,528 | **Critical** |
| Top-level info/landing pages | 36 | 78 | 20,407 | **High** |
| `/bathroom/product/<slug>/` (duplicate path) | 52 | 49 | 16,235 | **Critical** (canonicalise) |
| `/shop/*` archive variants | 18 | 32 | 6,169 | Medium |
| `/colour/<attr>/` (Woo attribute taxonomy) | 7 | 1 | 1,926 | Low |
| `/author/steve/` | 1 | 5 | 69 | Low (consider 410) |
| Blog landing `/blog/` | 1 | 0 | 134 | Low |
| Other / misc | 18 | 0 | 194 | Review |

### Query-string variants you can ignore at the redirect layer

There are **304 URLs in GSC with query parameters** — almost all of them WooCommerce filter combos like `?orderby=price&filter_filter=activated-carbon&shop_view=grid`. Together they got 24 clicks across 16 months. Don't write 301s for these individually; instead, the new site's `/collections/all` (or a redirect from `/shop` to it) catches them all. A handful contain odd parameters worth filtering at the server level:

- `?__im-EcMGwDST=...` — appears bot/scrape generated, safe to ignore
- `?gQT=1` — Google Shopping tracking parameter, will not be present on Shopify
- `?add-to-cart=<id>` — WooCommerce-specific cart-add URLs; not portable, fine to drop

---

## 2. The big one — WordPress vs Shopify URL structure

Shopify (headless or storefront) has a **fixed URL grammar** you cannot override at the path-prefix level without an edge proxy. Plan your Next.js routing around it:

| WordPress (current) | Shopify (new) | Notes |
|---|---|---|
| `/product/<slug>/` | `/products/<slug>` | Slugs should match where possible. Headless lets you serve at `/product/<slug>` but the canonical Shopify resource is `/products/`. **Pick one and 301 the other.** |
| `/product-category/<slug>/` | `/collections/<slug>` | Same: pick one canonical path. |
| `/product-tag/<slug>/` | No direct equivalent | Map to a collection if the tag is important, else 410 |
| `/shop/` | `/collections/all` | |
| `/<page-slug>/` (WP page) | `/pages/<slug>` (Shopify) or whatever Next.js routes you build | |
| `/blog/<slug>/` | `/blogs/news/<slug>` (Shopify default) or custom | |
| `/?p=<id>` etc | Server 404, or map known IDs | |

**Recommendation for headless Next.js**: because you control routing, you can keep WordPress-style paths (`/product/<slug>/`) and let Next.js fetch from Shopify's Storefront API behind the scenes. This **avoids ~300 redirects entirely** for products and is the lowest-risk option for SEO. If you do this, decide and **commit to one canonical path** before launch and configure `rel=canonical` accordingly.

---

## 3. Critical fixes to make during the migration (not after)

### 3a. The /bathroom/product/ duplicate problem

You have **52 product URLs at `/bathroom/product/<slug>/`** that are duplicates of `/product/<slug>/` URLs — same products, two paths. Many have `-2`, `-3`, `-4` suffixes on the slug (e.g. `toilet-rimless-...-wels` and `toilet-rimless-...-wels-2`), suggesting Woo created additional product records for the same items.

These are almost certainly a major chunk of your **13,026 "Crawled - currently not indexed"** and **10,797 "Duplicate without canonical"** errors.

**Action**: Before importing products to Shopify, deduplicate. Then 301 all 52 `/bathroom/product/...` URLs and any `-2`/`-3`/`-4` variants to the single canonical `/products/<slug>` on the new site.

### 3b. Canonical and indexing issues to fix on the new build

Your GSC critical-issues report shows:

| Issue | Count | What to do on the new build |
|---|---|---|
| Crawled – currently not indexed | 13,026 | Reduce by deduplicating products, removing thin filter/sort URL variants from sitemap |
| Duplicate without user-selected canonical | 10,797 | Set `rel=canonical` server-side in Next.js for every page; never leave it to Google to guess |
| Alternate page with proper canonical | 2,589 | Acceptable, but trim with `noindex` on faceted filter pages |
| Excluded by 'noindex' | 372 | Audit — make sure these are intentional |
| 404 not found | 105 | Confirm these don't appear in your sitemap; let them stay 404/410 |
| Page with redirect | 86 | Audit your existing redirects; consolidate redirect chains to single hops |
| Server error (5xx) | 79 | These will resolve at the new host |
| Soft 404 | 23 | Usually empty category pages — exclude empty collections from sitemap |
| Blocked by 403 | 1 | One-off, ignore |
| Discovered – not indexed | 16 | Low priority |

### 3c. Robots.txt and sitemap

- **Block faceted-filter URLs** in robots.txt: `Disallow: /*?filter_`, `Disallow: /*?orderby=`, `Disallow: /*?per_page=`, `Disallow: /*?shop_view=`, `Disallow: /*?add-to-cart=`, `Disallow: /*?per_row=`
- **Sitemap should contain only canonical URLs**: products, collections, top-level pages, blog posts. No filter/sort/pagination variants.
- Shopify auto-generates `/sitemap.xml`; on a headless build, you'll generate your own. Submit it to Search Console immediately after the DNS cutover.
- WooCommerce sitemap usually lived at `/sitemap_index.xml` or `/wp-sitemap.xml`. Note the old URLs so you can let Search Console retire them.

---

## 4. Pre-launch checklist (staging, before DNS change)

- [ ] Crawl the **staging site** with Screaming Frog or Sitebulb to confirm every URL in `redirect_map.csv` resolves with 200 or correct 301
- [ ] Verify the **homepage** renders identically and has matching/improved title and meta description (current homepage gets 487 clicks/month-equivalent — most valuable single page)
- [ ] Confirm **all 184 clicking product URLs** map to a live product on Shopify (see `redirect_map.csv`, priority=critical, sorted by clicks)
- [ ] Confirm **all 35 product-category URLs** map to a collection
- [ ] Verify **page titles and meta descriptions** on at least your top 50 products are populated (export them from WordPress before you decommission)
- [ ] Verify **structured data**: GSC shows you currently get "Merchant listings" appearances (238 clicks at 27% CTR — your highest CTR appearance type) and "Product snippets" (1,041 clicks). Make sure Shopify's JSON-LD `Product` schema is preserved on every product page. **This is critical revenue-driving SERP real estate.**
- [ ] Verify `rel=canonical` on every page points to the canonical URL of the new site
- [ ] Verify `hreflang` if you serve other regions (currently AU-only based on GSC)
- [ ] Confirm `robots.txt` blocks staging from indexation until cutover, then is updated at launch
- [ ] Confirm `noindex` is removed from production pages (a common cutover bug)
- [ ] Mobile rendering check: **51% of your clicks are mobile** (1,111 vs 984 desktop)
- [ ] Page speed: WordPress + WooCommerce was likely your slowest layer; verify Next.js + Shopify is faster on real-device tests (use PageSpeed Insights on your top 5 pages)
- [ ] Set up the new Google Search Console property for the Shopify/Next.js property **before launch** so verification is ready
- [ ] Set up 404 logging on the new site so you can catch missed redirects in the first 48 hours

---

## 5. Cutover day

- [ ] Lower DNS TTL to 5 minutes 24-48 hours before cutover
- [ ] Cut DNS over during low-traffic period (AU traffic — early morning AEST or late evening)
- [ ] Within 1 hour of cutover:
  - [ ] Submit new sitemap in Search Console
  - [ ] "Request indexing" on homepage and top 10 product pages
  - [ ] Test 20 random redirects from `redirect_map.csv` — every one should return 301 to a live 200 page
  - [ ] Test that staging-blocking robots.txt is gone
- [ ] Within 24 hours:
  - [ ] Check Search Console for crawl errors
  - [ ] Spot-check Google's index for old URLs (`site:enviroaqua.com.au/product/`)
  - [ ] Check Google Merchant Center if connected — feed URLs may need updating
- [ ] Within 1 week: pull a fresh GSC report and compare top pages list against `redirect_map.csv` — anything that's lost impressions sharply needs investigation

---

## 6. Post-launch monitoring (4-week window)

- [ ] **Don't panic if rankings dip for 1-3 weeks** — this is normal during a migration, especially with structural URL changes.
- [ ] Watch the **top 10 queries** in `redirect_map.csv`:
  - "enviro aqua" (209 clicks/16mo, position 2.15)
  - "enviro aqua filtration" (69 clicks, position 4.57)
  - "watermark toilet" (22 clicks, position 5.95)
  - "watermark toilet seat" (14 clicks, position 3.64)
  - "100l chemical tank" (13 clicks, position 7.54)
  - "typ 4000 booster pump" (9 clicks, position 5.79)
- [ ] Watch the **top 10 pages** by clicks — homepage and:
  - `/product/12v-self-priming-garden-caravan-electric-water-pump-faucet-tap-kit-5m-pipe/` (156 clicks)
  - `/product/rimless-watermark-back-to-wall-toilet-soft-close-wels/` (120)
  - `/product/100l-chemical-dosing-tank-water-tank-poly-tank-and-bund/` (112)
  - `/product/typ-4000-bypass-pressure-adjustable-diaphragm-booster-pump-24-vdc-400gpd/` (109)
  - `/product-category/water-filters/` (61)
- [ ] Compare **impressions** week-over-week. A drop in impressions before clicks suggests index loss; a drop in clicks at stable impressions suggests CTR/snippet regression.
- [ ] **Verify Shopify is connected to Search Console as a property** (it can be a separate Shopify-managed property if you use Shopify's domain). Keep submitting the same canonical sitemap.

---

## 7. Things specific to your setup worth flagging

- **Filter/facet URLs are eating crawl budget.** Whatever WooCommerce was doing with `?filter_*` parameters, replace it on Shopify with a faceting UI that updates state in the URL without producing crawlable links to thousands of permutations. Either use `noindex` on filter results or block them in `robots.txt`. Pick one and stick with it.
- **`/bathroom/` was a permalink experiment.** Looks like at some point part of the catalogue lived under `/bathroom/product/<slug>/` instead of `/product/<slug>/`. This is the source of most of your duplicate-canonical pain. Don't recreate this pattern on Shopify.
- **`/colour/<attr>/` URLs**: WooCommerce attribute archive pages. Almost no traffic (1 click, ~1,900 impressions across 7 URLs). Safe to 301 to `/collections/all` or relevant collections — or 410 them entirely.
- **`/author/steve/`** got 5 clicks at position 8.7 — likely someone searching for "Steve" by name. Decide if author pages are coming across; if not, 301 to homepage or your About page.
- **Tablet traffic is tiny but high-CTR** (48 clicks at 3.21% CTR vs desktop 0.37%). Worth confirming tablet rendering looks good post-launch.
- **Google Shopping (Merchant listings)** is your second-highest-impression search appearance and has by far the highest CTR (27.45%). If you're running Google Shopping ads or free listings, your product feed will need to be re-pointed at Shopify's product URLs. Check Merchant Center as part of cutover.

---

## 8. Search Console housekeeping

- [ ] Keep the existing `enviroaqua.com.au` GSC property active. **Do not delete it.** Google will continue to receive crawl/redirect signals through it.
- [ ] Add the new property version if needed (e.g. if you're moving to a `www.` or different protocol prefix).
- [ ] Use Search Console's **Change of Address tool** if you're moving between domains (you're not — same domain, just new platform — so this is **not** needed in your case).
- [ ] Resubmit the sitemap immediately after launch.
- [ ] Use the URL Inspection tool on your top 20 product URLs in week 1 to verify they're being recrawled and indexed.

---

## 9. What I haven't been able to determine from these files

You may want to dig into these yourself before launch:

- **Total number of products on the site.** GSC shows the top 1,000 URLs only; you may have more products than this.
- **WooCommerce custom permalink structure** — confirm whether you used `/product/` or some other prefix; the export suggests `/product/` was canonical but some products lived at `/bathroom/product/`.
- **Any custom landing pages or campaign URLs** not in this export (GSC only shows URLs Google has crawled and seen impressions for).
- **External backlinks** — pull the "Links" report from GSC separately; high-value backlinks to specific URLs may need their own redirect attention.
- **Internal search URLs** (`/?s=...`) — these weren't in your top-pages export but may exist; make sure they don't get indexed on the new site.

---

## Companion file

The `redirect_map.csv` file alongside this checklist contains all 442 unique URLs with:

- `clean_url` — the WordPress URL without query string
- `clicks` and `impressions` — 16-month totals
- `type` — URL category
- `priority` — critical / high / medium / low
- `suggested_redirect` — what to do with it on the new site

Sort by `clicks` descending and start at the top. The first 50 URLs cover ~80% of your organic traffic.
