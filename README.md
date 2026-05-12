# Enviro Aqua Web

Custom Next.js + Shopify rebuild of [enviroaqua.com.au](https://enviroaqua.com.au) — Australia's specialist water filtration retailer.

## For Claude / AI assistants reading this repo

**Read `/docs/` before doing anything.** That folder contains every architectural and strategic decision made for this project. The files are numbered in reading order:

1. `docs/00-project-overview.md` — what this site is and what it isn't
2. `docs/01-architecture-decisions.md` — tech stack and repo structure
3. `docs/02-site-structure.md` — nav, URL hierarchy, internal linking
4. `docs/03-data-model.md` — Shopify schema, metafields, tags, SKUs
5. `docs/04-seo-strategy.md` — canonical rules, schema, redirects
6. `docs/05-design-system.md` — minimalist black/white/blue, typography, layout
7. `docs/06-content-rules.md` — tone, structure, what every page needs
8. `docs/07-shopify-integration.md` — Storefront API, caching, webhooks
9. `docs/08-conventions.md` — code style, file naming, commits
10. `docs/09-build-roadmap.md` — milestone-by-milestone build plan

If you are about to make a code change without having read the relevant docs file, **stop and read it first.** The docs are the source of truth. Code that contradicts the docs is wrong.

## Tech stack

- **Frontend**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Commerce**: Shopify (Storefront API)
- **Hosting**: Vercel (auto-deploy from `main`)
- **Domain**: enviroaqua.com.au (DNS cutover post-staging)

## Status

Pre-build. Repo currently contains documentation and migration spreadsheet only. Next.js scaffold not yet initialised.

## Build phases

| Phase | Status |
|---|---|
| 1. Analysis | Done |
| 2. Strategy | Done |
| 3. Site structure | Done |
| 4. Documentation pack | Done (this repo) |
| 5. Migration spreadsheet | Done (`/migration/`) |
| 6. Build skeleton | Not started |
| 7. Migrate products | Not started |
| 8. Content production | Not started |
| 9. Pre-launch QA | Not started |
| 10. Launch | Not started |

See `docs/09-build-roadmap.md` for the milestone breakdown.

## Repo structure (target — not yet built)

```
/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Shopify client, helpers
├── content/                # Markdown for editorial pages
├── docs/                   # Documentation (read first)
├── migration/              # Product migration spreadsheet + README
├── public/                 # Static assets
├── types/                  # TypeScript types
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

## Environment variables (set in Vercel, not committed)

```
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_API_VERSION=2024-10
NEXT_PUBLIC_SITE_URL=https://staging.enviroaqua.com.au
# Forces cart `checkoutUrl` onto the Shopify-served checkout subdomain.
# Required because the storefront primary domain is the headless apex
# (served by Vercel), so Shopify's returned URL would 404 on our side.
SHOPIFY_CHECKOUT_DOMAIN=checkout.enviroaqua.com.au
```

See `docs/07-shopify-integration.md` for full integration setup.

## Branding (locked, do not deviate)

- **Positioning**: Wholesale prices for everyone — no accounts, no quotes, just the best price upfront
- **Colours**: White background, black header/footer, `#0066CC` blue for buttons/CTAs
- **Typography**: System font stack (no web fonts in v1)
- **Tone**: Direct, knowledgeable, honest, Australian English

Full design system in `docs/05-design-system.md`. Content rules in `docs/06-content-rules.md`.
