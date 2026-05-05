# Project Overview

## What this is

A from-scratch rebuild of enviroaqua.com.au — an Australian water filtration ecommerce store. The site replaces a poorly-performing WordPress + WooCommerce build with a custom Next.js + Shopify Storefront API architecture.

## Brand positioning (do not deviate)

**Enviro Aqua is Australia's specialist water-filtration retailer — wholesale prices for everyone, no accounts, no quotes, just the best price upfront.**

Three things that are always true on this site:
1. **Water filtration is the primary topic.** Everything else supports this.
2. **One price for everyone.** No trade gating, no member tiers, no quotes. Tradies and homeowners see the same price.
3. **WaterMark certification matters.** When a product is certified, it's labelled clearly. When it's not, that's labelled too.

## Audience

- Australian retail customers buying water filters for their home
- Tradies and small installers buying at wholesale price (same price as retail)
- Commercial buyers (cafes, offices) buying bubblers and commercial systems
- Caravan/RV/off-grid customers buying portable filtration and 12V pumps
- Trade audience for chemical dosing tanks (industrial, agricultural)

## Geography

- Primary market: Australia, with strong local SEO focus on Central Coast NSW
- Secondary local targets (post-launch): Newcastle NSW, Sydney NSW
- International: not a focus

## Core priorities, in order

1. SEO authority for water filtration
2. Conversion of organic traffic into orders
3. Repeat purchase via cartridges and replacement parts
4. Trade/wholesale audience capture without gating
5. Local SEO for Central Coast NSW

## Tech stack (final)

- **Frontend**: Next.js 15 (App Router) on Vercel
- **Commerce backend**: Shopify (Storefront API) — standard plan
- **CMS for content**: Markdown files in repo (no separate CMS for v1)
- **Deployment**: Vercel, auto-deploy from GitHub `main` branch
- **Domain**: enviroaqua.com.au (DNS cutover post-staging)
- **Staging**: Vercel default subdomain (e.g. enviroaqua-staging.vercel.app) until launch

## Build philosophy

- **Ship working code fast, refine in iterations.** Don't over-engineer v1.
- **Real Shopify data from day one.** No mock data, no placeholders that need replacing later.
- **Documentation in the repo.** Every architectural decision lives in `/docs/` so context is never lost.
- **Mobile-first, performance-first.** Core Web Vitals matter for SEO.

## What this site is NOT

- A general bathroom retailer
- A pump shop
- An aquarium / hydroponics / pool supplier
- A general plumbing supplier
- A vanity / mirror / decor retailer
- An industrial chemicals/tanks supplier (the dosing tanks niche is the only exception)

When in doubt, the answer is "we are a water filtration specialist."
