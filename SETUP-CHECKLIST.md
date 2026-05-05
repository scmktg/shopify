# Setup Checklist

This is your sequenced to-do list for going from "files uploaded to GitHub" to "skeleton site deployed to Vercel staging URL." Work top to bottom.

## Phase A — GitHub setup ✅

(You've done this — files uploaded.)

## Phase B — Vercel project ✅

(You've done this — `shopify-eight-lemon.vercel.app` deployed.)

## Phase C — Shopify (current 2026 flow via Headless channel)

Important: this uses the **Headless sales channel** (Shopify's current recommended way), NOT the legacy "Custom apps via Develop apps" path.

### Step 1 — Install the Headless channel (~3 min)

- [ ] Log into Shopify admin
- [ ] Apps → Shopify App Store
- [ ] Search "Headless" (the official one by Shopify)
- [ ] Or direct link: https://apps.shopify.com/headless
- [ ] Click "Add app" → "Add sales channel"

After installing, "Headless" appears in your Shopify sidebar under Sales channels.

### Step 2 — Create a storefront (~2 min)

- [ ] Sales channels → Headless
- [ ] Click "Add storefront"
- [ ] Name: `Enviro Aqua Web`
- [ ] Click Create

### Step 3 — Configure permissions (~3 min)

In your new storefront's settings, find the "Storefront API permissions" card → Edit.

Enable these:
- [ ] Read products
- [ ] Read product inventory
- [ ] Read product tags
- [ ] Read product metafields
- [ ] Read collections
- [ ] Read collection metafields
- [ ] Read prices
- [ ] Read locations
- [ ] Manage carts (read + write)
- [ ] Read pages
- [ ] Read content (articles, blogs)

Save.

### Step 4 — Get the tokens (~2 min)

In the storefront page, find "Storefront API tokens" card. Two tokens:

- [ ] **Private access token** — copy and store securely (password manager). This is `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`.
- [ ] **Public access token** — note this too. This is `NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN`.

### Step 5 — Get your store domain (~1 min)

- [ ] Settings → Domains in Shopify admin
- [ ] Find the `your-store.myshopify.com` URL (NOT your custom domain)
- [ ] Note this — without `https://`, no trailing slash. This is `SHOPIFY_STORE_DOMAIN`.

## Phase D — Connect Vercel to Shopify (~5 min)

In Vercel project → Settings → Environment Variables:

For each, **select all three environments** (Production, Preview, Development) before saving:

- [ ] `SHOPIFY_STORE_DOMAIN` = `your-store.myshopify.com` (no https, no slash)
- [ ] `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` = the private token from Step 4 (mark as "Sensitive")
- [ ] `NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN` = the public token from Step 4
- [ ] `SHOPIFY_API_VERSION` = `2026-04`
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://shopify-eight-lemon.vercel.app`

Click Save for each.

## Phase E — Begin the build

- [ ] Open a new Claude session
- [ ] Use this opening message:

> Read `/CLAUDE.md` and `/docs/09-build-roadmap.md` in this repo. Then begin Milestone 0 (Setup) — initialise the Next.js 15 + TypeScript + Tailwind project at the root of this repo. Follow `/docs/01-architecture-decisions.md` for the file structure and dependencies (we use the official `@shopify/storefront-api-client` package). Produce one file at a time so I can review each before committing. Start with `package.json`.

This puts Claude on the build roadmap and makes sure it reads the docs before doing anything.

Then follow the prompts in `FIRST-BUILD-PROMPTS.md` in order.

## Phase F — Iterate through milestones

Following `docs/09-build-roadmap.md`:

- Milestone 0 — Setup → ~30 min with Claude
- Milestone 1 — Layout & navigation → ~1 hour
- Milestone 2 — Shopify connection → ~30 min
- Milestone 3 — Product detail page → ~1 hour
- Milestone 4 — Category pages → ~1 hour
- Milestone 5 — Cart & checkout → ~1 hour

Total to a working skeleton: **~5 hours of focused work over 1–2 sessions.**

## What you can start in parallel

While building the skeleton, you can work on these independently:

### Supplier outreach (start today)
- [ ] Sort `migration/migration-spreadsheet.csv` by `watermark_status`
- [ ] Identify the ~33 products marked `certified` or `unknown`
- [ ] Email suppliers using the template in `migration/README.md`
- [ ] Track responses in the `YOU_FILL_*` columns

### Decision overrides
- [ ] Review the spreadsheet, especially the 20 CUT items
- [ ] Use `YOU_FILL_decision_override` if you want to change any

### Dosing tank expansion
- [ ] Decide final SKU range (sizes × bunded/non-bunded matrix)
- [ ] Add new rows to the spreadsheet for each new SKU

## Common issues

**"Vercel deployment fails"** — Expected at this stage if `package.json` doesn't exist yet. The deploy will start succeeding once Claude scaffolds the Next.js project in Milestone 0.

**"Headless channel asks me to choose Hydrogen or Custom"** — Choose Custom (or "Build your own storefront"). Hydrogen is Shopify's React framework that locks you into Oxygen hosting; we're using Next.js + Vercel for full control.

**"My Shopify token starts with `shpat_` not `shpaa_`"** — Both are valid token formats. The Headless channel may issue tokens with different prefixes. As long as you copied from the "Storefront API tokens" card on your headless storefront, it's correct.

**"Claude doesn't know what to do"** — Make sure your prompt directs Claude to read `/CLAUDE.md` and the relevant `/docs/` file first. Without that, Claude is working blind.

**"I'm getting errors about metafield types not having storefront access"** — Storefront access must be enabled per metafield definition: Settings → Custom data → Products → [definition] → "Storefront access" toggle. Easy to miss.

**"GitHub web UI is slow for many file edits"** — Yes. Consider GitHub Desktop (free, mac-friendly, no terminal needed) which lets you sync the repo locally without you ever editing code yourself.

## When this checklist is done

You should have:
- ✅ A GitHub repo with all docs and migration data
- ✅ A Vercel project deploying from `main`
- ✅ A Shopify Headless storefront with private + public tokens
- ✅ All env vars set in Vercel
- ✅ A staging URL where you can see deployments

You're then ready for Phase E — starting the actual build with Claude.
