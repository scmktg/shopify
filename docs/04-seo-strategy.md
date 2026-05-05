# SEO Strategy

## Goals

1. Rank top-3 for water-filter category terms in Australia within 12 months
2. Rank top-5 for "water filters Central Coast" and related local terms within 6 months
3. Drive 75x improvement in CTR via Google Merchant Centre integration (current 0.36% organic snippet → target 25%+ on merchant listings)
4. Eliminate the 28,000+ junk URLs currently being crawled

## Canonical strategy

Every page has a `<link rel="canonical">` pointing to itself, except:
- Pagination beyond page 1: canonical points to page 1
- Filter combinations: not generated as URLs at all (client-side filtering only)
- Sort orders: not generated as URLs
- View modes: not generated as URLs

## Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /cart/
Disallow: /checkout/
Disallow: /account/
Disallow: /*?*           # any URL with query string

Sitemap: https://enviroaqua.com.au/sitemap.xml
```

The `Disallow: /*?*` rule kills all faceted-filter and sort URLs at the crawl level.

## XML sitemap

Generated at build time + on revalidation. Contains:
- Homepage
- All catalogue category and sub-category URLs
- All product URLs (in stock or out of stock — both indexed)
- All editorial pages (use-cases, problems, locations, help)
- Static pages (about, contact, etc.)

**Excluded** from sitemap:
- Pagination URLs (page 2+)
- Filter URLs
- Cart, checkout, account, API routes

## Schema.org markup

Every page type gets the appropriate schema:

| Page type | Schema |
|---|---|
| Homepage | `Organization` + `WebSite` with `SearchAction` |
| Category page | `CollectionPage` + `BreadcrumbList` |
| Product page | `Product` + `Offer` + `AggregateRating` (when reviews exist) + `BreadcrumbList` |
| Editorial (problem/use/help) | `Article` + `BreadcrumbList` + `FAQPage` (when FAQs present) |
| Location pages | `LocalBusiness` + `BreadcrumbList` |

## Product schema specifics

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "image": ["...", "...", "..."],
  "description": "...",
  "sku": "EA-WF-RO-6S",
  "gtin13": "...",          // when available
  "brand": {
    "@type": "Brand",
    "name": "Enviro Aqua"
  },
  "offers": {
    "@type": "Offer",
    "url": "...",
    "priceCurrency": "AUD",
    "price": "...",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "WaterMark Certification",
      "value": "Certified",
      "identifier": "WMK-12345"
    }
  ],
  "hasCertification": {                    // when WaterMark certified
    "@type": "Certification",
    "name": "WaterMark Certification Scheme (Australia)",
    "issuedBy": { "@type": "Organization", "name": "IAPMO" },
    "identifier": "WMK-12345",
    "validUntil": "2027-06-30"
  }
}
```

## Metadata patterns

### Homepage
- Title: `Enviro Aqua | Water Filters, Cartridges & Bubblers | Wholesale Prices`
- Description: `Australia's specialist water filtration store. Wholesale prices for everyone — no accounts, no quotes. Free shipping over $200.`

### Category page
- Title: `[Category Name] | Wholesale Prices | Enviro Aqua`
- Description: `Shop [category] at wholesale prices. [N] products with free shipping over $200. WaterMark certified options available.`

### Sub-category page
- Title: `[Sub-category] | [Category] | Enviro Aqua`
- Description: Editorial-driven, custom per page

### Product page
- Title: `[Product Title] | Enviro Aqua` (truncate if needed)
- Description: First 155 chars of overview, or custom SEO description

### Problem page
- Title: `[Problem] — How to Fix It | Enviro Aqua`
- Description: First 155 chars of intro

### Local page
- Title: `Water Filters Central Coast NSW | Enviro Aqua`
- Description: Custom, mentions Central Coast, includes a phone or contact prompt

## Internal linking rules

1. **Every product page links to its category and sub-category** (breadcrumbs + in-content)
2. **Every product page links to 1 problem page and 1 use-case page** (where relevant)
3. **Every category page has 300–500 words of editorial intro** above product grid
4. **Every problem page links to 4–8 specific products** + the parent category
5. **Every use-case page curates 6–12 products** from across categories
6. **Cartridge product pages link to compatible system pages** and vice versa

## Redirects (migration)

Every old WordPress URL redirects to its new home. Implementation: `next.config.js` redirects array, generated from migration spreadsheet. Status: 301 (permanent).

Categories of redirects:
- Old `/product-category/<slug>/` → new `/<category>/<sub>/`
- Old `/product/<slug>/` → new `/<category>/<sub>/<slug>/`
- All `?filter_*`, `?orderby=*`, `?per_page=*`, `?add-to-cart=*` → 301 to clean parent
- All paginated `/page/N/` URLs → 301 to clean parent

## Google Merchant Centre

- Shopify generates a Google Shopping feed natively
- Connect Shopify to Google Merchant Centre via Shopify Marketing app
- All products in feed must have:
  - GTIN (or correct identifier_exists=false marker)
  - Brand
  - Description ≥ 600 chars
  - 3+ images
  - Correct GPC category
- Target a 25%+ CTR on merchant listings (current site shows 27% on existing merchant listings — confirmed achievable)

## Local SEO

- Google Business Profile: fully populated for Central Coast NSW location
- LocalBusiness schema on `/locations/central-coast-nsw/` and sub-pages
- NAP (name, address, phone) consistency across site, GBP, and external citations
- Customer review collection via post-purchase email

## Analytics & monitoring

- Vercel Analytics for performance
- Google Analytics 4 for behaviour
- Google Search Console for indexing and queries
- Weekly check: indexed page count, Core Web Vitals, keyword position changes
