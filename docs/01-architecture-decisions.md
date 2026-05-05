# Architecture Decisions

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 15, App Router | Best-in-class SEO, edge rendering, Vercel-native |
| Hosting | Vercel | Zero-config CWV, ISR for product pages, instant deploys |
| Commerce | Shopify Storefront API | Mature checkout, inventory, payments — but headless |
| Styling | Tailwind CSS | Rapid build, no design-system overhead for v1 |
| Components | Custom + Radix UI primitives where needed | No bloat from full UI libraries |
| Forms | React Hook Form + Zod | Type-safe, minimal |
| Analytics | Vercel Analytics + GA4 | Standard duo |
| Search | Shopify Search & Discovery (built into Storefront API) | Free, sufficient for v1 |
| Image optimisation | Next.js `<Image>` + Vercel | Automatic, free |

## Why Next.js 15 App Router specifically

- Server components by default → better performance, less JS shipped to client
- Built-in metadata API → clean SEO without third-party libraries
- Route handlers for API needs (Shopify webhooks, etc.)
- Streaming + Suspense for fast TTFB on product pages

## Why Shopify Storefront API (not Admin API only)

- Storefront API is read-only and built for headless frontends — fast, cached, public
- Admin API is used only server-side for cart mutations and webhook handling
- All checkout happens on Shopify's hosted checkout (compliance, security, fraud handled by Shopify)

## Repo structure

```
/
├── app/                      # Next.js App Router
│   ├── (shop)/               # Public shopping routes
│   │   ├── water-filters/
│   │   ├── cartridges/
│   │   ├── bubblers/
│   │   ├── pumps-and-tanks/
│   │   ├── plumbing/
│   │   └── ...
│   ├── (content)/            # Editorial routes (use-cases, problems, locations)
│   │   ├── use/
│   │   ├── water-problems/
│   │   ├── locations/
│   │   └── help/
│   ├── api/                  # Route handlers (cart, webhooks)
│   ├── layout.tsx
│   ├── page.tsx              # Homepage
│   └── globals.css
├── components/
│   ├── ui/                   # Primitives (Button, Card, etc.)
│   ├── product/              # Product-specific (ProductCard, Gallery, etc.)
│   ├── layout/               # Header, Footer, Nav
│   └── content/              # ContentHero, FAQ, etc.
├── lib/
│   ├── shopify/              # Shopify Storefront API client + queries
│   ├── seo/                  # Metadata helpers, schema generators
│   ├── cart/                 # Cart state and persistence
│   └── utils/                # Generic helpers
├── content/                  # Markdown for use-cases, problems, locations, help
├── docs/                     # This documentation pack
├── public/                   # Static assets
├── types/                    # TypeScript types (Product, Cart, etc.)
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## Routing strategy

- **Catalogue routes** are Next.js dynamic segments backed by Shopify data:
  - `/[category]/[subcategory]/[product-slug]/`
  - `/[category]/[subcategory]/`
  - `/[category]/`
- **Editorial routes** are file-based markdown:
  - `/use/[slug]/` reads from `/content/use/`
  - `/water-problems/[slug]/` reads from `/content/water-problems/`
  - `/locations/[slug]/` reads from `/content/locations/`
  - `/help/[slug]/` reads from `/content/help/`

## Rendering strategy

- **Product pages**: ISR, revalidate every 60 seconds, on-demand revalidate via Shopify webhook
- **Category pages**: ISR, revalidate every 5 minutes
- **Editorial pages**: Static at build time
- **Cart**: Client-side state, persisted via Shopify cart token in cookie
- **Homepage**: ISR, revalidate every hour

## State management

- **Cart**: React Context + Shopify cart token in cookie
- **No global state library.** Server components fetch data; client components handle interaction. No Redux, no Zustand for v1.

## What we are deliberately NOT doing in v1

- No customer accounts on the site (Shopify checkout handles guest + account checkout)
- No reviews integration in v1 (add post-launch — Judge.me or similar)
- No live chat in v1
- No newsletter in v1 (add post-launch via Shopify)
- No multi-currency in v1 (AUD only)
- No A/B testing infrastructure in v1
- No internal admin panel — Shopify admin handles everything

## Performance budgets

- Lighthouse Performance score (mobile): 90+
- LCP: <2.0s
- INP: <200ms
- CLS: <0.1
- Total JS shipped to client (homepage): <200KB
- Total JS shipped to client (product page): <250KB

These are non-negotiable. If a feature breaks budget, it doesn't ship.
