# Architecture Decisions

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 16, App Router | Best-in-class SEO, edge rendering, Vercel-native; current stable since Oct 2025 |
| Hosting | Vercel | Zero-config CWV, ISR for product pages, instant deploys |
| Commerce | Shopify (Storefront API via Headless channel) | Mature checkout, inventory, payments — but headless |
| Shopify client | `@shopify/storefront-api-client` (official) | Less custom code, better TypeScript, version-aware |
| Styling | Tailwind CSS v4 | CSS-first config via `@theme`, no JS config file, faster build |
| Components | Custom + Radix UI primitives where needed | No bloat from full UI libraries |
| Forms | React Hook Form + Zod | Type-safe, minimal |
| Analytics | Vercel Analytics + GA4 | Standard duo |
| Search | Shopify Storefront predictiveSearch | Free, sufficient for v1 |
| Image optimisation | Next.js `<Image>` + Vercel | Automatic, free |
| Icons | lucide-react | Clean, consistent, free |

## Why Next.js 16 App Router specifically

- Resolves Next.js 15 security CVEs (CVE-2025-66478 RCE, CVE-2025-55184, CVE-2025-55183)
- Stable since October 2025; production-ready for a 2026 build

- Server components by default → better performance, less JS shipped to client
- Built-in metadata API → clean SEO without third-party libraries
- Route handlers for API needs (Shopify webhooks, etc.)
- Streaming + Suspense for fast TTFB on product pages

## Why Shopify Headless channel (not legacy Custom Apps)

- Current, supported way (2026) to manage headless storefronts
- Auto-generates public + private access tokens
- Single-screen permissions management
- Token rotation built in
- Order attribution to the headless storefront (visible in Shopify Admin order list)

## Why the official `@shopify/storefront-api-client` package

- Maintained by Shopify, tracks API versions automatically
- Less custom code to maintain (no hand-rolled fetch wrapper)
- Built-in TypeScript types for client config
- Cleaner error surface
- Standard pattern across Shopify headless ecosystem

## Repo structure

```
/
├── app/                      # Next.js App Router
│   ├── (shop)/               # Public shopping routes
│   │   ├── water-filters/
│   │   ├── cartridges/
│   │   ├── bubblers-and-coolers/
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
│   ├── cart/                 # CartProvider, CartDrawer, etc.
│   └── content/              # ContentHero, FAQ, etc.
├── lib/
│   ├── shopify/              # Shopify Storefront API client + queries
│   │   ├── client.ts         # createStorefrontApiClient instance
│   │   ├── fragments.ts      # Shared GraphQL fragments
│   │   ├── queries/          # Read queries
│   │   └── mutations/        # Cart mutations
│   ├── seo/                  # Metadata helpers, schema generators
│   ├── cart/                 # Cart state and persistence
│   └── utils/                # Generic helpers
├── content/                  # Markdown for use-cases, problems, locations, help
│   ├── business-info.ts      # Single source for phone, address, ABN, ACN, hours, socials
├── docs/                     # This documentation pack
├── migration/                # Migration spreadsheet
├── public/                   # Static assets
├── types/                    # TypeScript types (Product, Cart, etc.)
├── postcss.config.js
├── next.config.js
└── package.json
```

Tailwind v4 is configured CSS-first inside `app/globals.css` via the `@theme` directive — there is no `tailwind.config.ts` file. See `docs/05-design-system.md` for the brand-token block.

## Business data — single source

`content/business-info.ts` exports `BUSINESS_INFO`, a `const`-typed
record holding every business-identity value the site renders: legal
name, ABN, ACN, phone (display + tel:), email, full street address,
showroom hours (plain English + schema.org format), order cutoff,
returns window/scope, and social URLs. Helpers `fullAddress()` and
`abnAcnLine()` produce the canonical formatted strings.

**When the phone number, address, ABN, ACN, hours, or any other
business identity field changes, edit `content/business-info.ts`
only.** Components that render these values import from here directly
(`components/layout/Footer.tsx`, `lib/seo/jsonld.ts`, etc.).

Markdown editorial content cannot import TypeScript at render time,
so `content/contact.md`, `content/about/index.md`, `content/shipping.md`,
`content/returns.md`, `content/terms.md`, `content/privacy.md`, and
`content/locations/central-coast-nsw.md` have business values baked
in by hand. When `BUSINESS_INFO` changes, run:

    grep -RIn "8772 8162\|Amsterdam\|24 638 197 734\|EnviroAqua.com.au\|enviro_aqua" content/

…to find the markdown sites that need a parallel update.

## Key dependencies

```json
{
  "dependencies": {
    "next": "^16.2.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@shopify/storefront-api-client": "^1.0.0",
    "lucide-react": "^0.469.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.2.0"
  }
}
```

Versions above are minimums — Claude should pin to current latest stable at the time of scaffolding. Note: Tailwind v4 replaces `autoprefixer` + raw `postcss` with the unified `@tailwindcss/postcss` plugin.

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

- **Product pages**: ISR via `unstable_cache` with `revalidate: 60`, on-demand revalidate via Shopify webhook
- **Category pages**: ISR with `revalidate: 300`
- **Editorial pages**: Static at build time (Markdown content rarely changes)
- **Cart**: Client-side state, persisted via Shopify cart token in HTTP-only cookie
- **Homepage**: ISR with `revalidate: 3600`

## State management

- **Cart**: React Context + Shopify cart token in cookie
- **No global state library.** Server components fetch data; client components handle interaction. No Redux, no Zustand for v1.

## Required environment variables

```
# Shopify (set in Vercel for all environments)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=<from Headless channel - SECRET>
NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN=<from Headless channel - public-safe>
SHOPIFY_API_VERSION=2026-04
SHOPIFY_WEBHOOK_SECRET=<set when configuring webhooks>

# Site
NEXT_PUBLIC_SITE_URL=https://staging.enviroaqua.com.au

# Lead-form email delivery (Resend — used by /api/lead-installation/)
RESEND_API_KEY=<from resend.com after verifying enviroaqua.com.au domain>
RESEND_FROM_EMAIL=quotes@enviroaqua.com.au

# Analytics (post-launch)
NEXT_PUBLIC_GA_ID=

# Vercel-injected (don't set manually)
VERCEL_URL=
VERCEL_ENV=
```

The `_PRIVATE_TOKEN` must NOT have a `NEXT_PUBLIC_` prefix — it's server-only. The `_PUBLIC_TOKEN` must have `NEXT_PUBLIC_` prefix to be readable in client components.

### Resend setup (one-time)

The `/api/lead-installation/` route uses [Resend](https://resend.com) for transactional email delivery (Whole House Install Package lead form → `info@enviroaqua.com.au`). Until both env vars are set, the route returns HTTP 503 with a clear "email us directly" message; the form surfaces that to the customer rather than silently dropping the lead.

To enable:

1. Sign up at <https://resend.com>. Free tier covers 3,000 emails/month — well above expected lead volume.
2. Add `enviroaqua.com.au` as a verified domain (DNS TXT record provided in the Resend dashboard).
3. Create an API key.
4. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (e.g. `quotes@enviroaqua.com.au`) to Vercel env vars for Production, Preview, and (optionally) Development.

The `from` address must be on the verified domain. `info@` works too if you'd rather route from a single mailbox.

## What we are deliberately NOT doing in v1

- No customer accounts on the site (Shopify checkout handles guest + account checkout)
- No reviews integration in v1 (add post-launch — Judge.me or similar)
- No live chat in v1
- No newsletter in v1 (add post-launch via Shopify)
- No multi-currency in v1 (AUD only)
- No A/B testing infrastructure in v1
- No internal admin panel — Shopify admin handles everything
- No trade login / wholesale gating — one price for everyone (brand promise)

## Performance budgets

- Lighthouse Performance score (mobile): 90+
- LCP: <2.0s
- INP: <200ms
- CLS: <0.1
- Total JS shipped to client (homepage): <200KB
- Total JS shipped to client (product page): <250KB

These are non-negotiable. If a feature breaks budget, it doesn't ship.

## API version policy

- Current: `2026-04` (latest stable as of build)
- Update quarterly when Shopify releases new versions
- Test against the new version on staging before bumping production env variable
- Old versions are supported for ~12 months as a fallback

## Caching policy

- Use `unstable_cache` from `next/cache` to wrap Shopify queries
- Tag caches consistently: `'products'`, `'collections'`, `'product:<handle>'`
- Webhooks call `revalidateTag()` for affected tags
- Never call Shopify on every request — fight the urge to add fresh data; ISR + on-demand revalidation is correct
