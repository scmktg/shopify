# Setup Checklist

This is your sequenced to-do list for going from "files uploaded to GitHub" to "skeleton site deployed to Vercel staging URL." Work top to bottom.

## Phase A — GitHub setup (5 minutes)

- [ ] Confirm all files from this starter package are uploaded to your GitHub repo
- [ ] Confirm folder structure looks correct:
  - `/docs/` contains 10 numbered `.md` files
  - `/migration/` contains `migration-spreadsheet.csv` and `README.md`
  - Root contains `README.md`, `CLAUDE.md`, `.gitignore`, `SETUP-CHECKLIST.md` (this file)
- [ ] Verify the GitHub repo homepage now shows the project README (not the placeholder)

## Phase B — Vercel project (10 minutes)

- [ ] Go to vercel.com → Add New → Project
- [ ] Import your `enviroaqua-web` GitHub repo
- [ ] When asked about framework: select **Next.js**
- [ ] Don't worry about build errors at this point — there's nothing to build yet
- [ ] Skip environment variables for now (you'll add them later)
- [ ] Click Deploy. It will deploy a placeholder. That's expected.
- [ ] Note your Vercel-assigned staging URL (e.g. `enviroaqua-web.vercel.app`)
- [ ] In Vercel project → Settings → Environment Variables, prepare to add (don't paste yet — wait until Phase D):
  - `SHOPIFY_STORE_DOMAIN`
  - `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
  - `SHOPIFY_API_VERSION` = `2024-10`
  - `NEXT_PUBLIC_SITE_URL` = your Vercel staging URL

## Phase C — Shopify setup (15 minutes)

This produces the credentials you'll add to Vercel in Phase D.

- [ ] Log into Shopify Admin
- [ ] Settings → Apps and sales channels → Develop apps → Allow custom app development (if not already enabled)
- [ ] Create an app called "Enviro Aqua Headless"
- [ ] Configure → Storefront API access:
  - Read products
  - Read product listings
  - Read collections
  - Read product tags
  - Read product metafields
  - Read inventory
  - Read locations
  - Manage customer cart (cart create/update/delete)
- [ ] Save → Install app
- [ ] Copy the **Storefront API access token** somewhere secure (this is what goes in Vercel as `SHOPIFY_STOREFRONT_ACCESS_TOKEN`)
- [ ] Note your store domain in the form `your-store.myshopify.com` (this is `SHOPIFY_STORE_DOMAIN`)

## Phase D — Connect Vercel to Shopify (5 minutes)

- [ ] In Vercel → your project → Settings → Environment Variables
- [ ] Add the 4 environment variables from Phase B with values from Phase C
- [ ] Important: select all three environments (Production, Preview, Development) for each variable
- [ ] Click Save

## Phase E — Begin the build (next session with Claude)

- [ ] Open a new Claude session (chat or via GitHub connector if you have it)
- [ ] Start with this opening message:

> Read `/CLAUDE.md` and `/docs/09-build-roadmap.md` in this repo. Then begin Milestone 0 (Setup) — initialise the Next.js 15 + TypeScript + Tailwind project at the root of this repo. Follow `/docs/01-architecture-decisions.md` for the file structure. Produce one file at a time so I can review each before committing. Start with `package.json`.

This puts Claude on the build roadmap and makes sure it reads the docs before doing anything.

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

**"Shopify token not working"** — Check that you copied the Storefront API token, not the Admin API token. They look similar but are different.

**"Claude doesn't know what to do"** — Make sure your prompt directs Claude to read `/CLAUDE.md` and the relevant `/docs/` file first. Without that, Claude is working blind.

**"GitHub web UI is slow for many file edits"** — Yes. For the build phase, consider using GitHub Desktop (free, mac-friendly, no terminal needed) which lets you sync the repo locally without you ever editing code yourself. Claude commits, GitHub Desktop pulls, you review changes visually. You never touch a code file. If you're committed to browser-only, that's fine — just slower per-iteration.

## When this checklist is done

You should have:
- ✅ A GitHub repo with all docs and migration data
- ✅ A Vercel project deploying from `main`
- ✅ A Shopify Storefront API token in Vercel env vars
- ✅ A staging URL where you can see deployments

You're then ready for Phase E — starting the actual build with Claude.
