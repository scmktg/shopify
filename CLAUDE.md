# Instructions for Claude

You are working on a from-scratch rebuild of an Australian water filtration ecommerce store. This file orients you. **Read it fully before taking any action.**

## Step 1: Read the docs

Before making any code change, suggestion, or proposal:

1. Read `/docs/00-project-overview.md` — what this site is
2. Read whichever specific doc is relevant to the task:
   - Code changes → `docs/01-architecture-decisions.md` and `docs/08-conventions.md`
   - Routing or category work → `docs/02-site-structure.md`
   - Product schema or Shopify work → `docs/03-data-model.md` and `docs/07-shopify-integration.md`
   - SEO, schema, redirects → `docs/04-seo-strategy.md`
   - Visual design → `docs/05-design-system.md`
   - Writing copy or descriptions → `docs/06-content-rules.md`
   - What to build next → `docs/09-build-roadmap.md`

If a user request contradicts what's in `/docs/`, raise the contradiction explicitly. Don't silently override the docs.

## Step 2: Understand the build phase

Check the current state of the repo:

- Is there an `app/` directory? If no → we are still in pre-build setup. Do not skip ahead.
- Is there a `package.json`? If no → Next.js has not been scaffolded yet.
- Is the migration spreadsheet filled in (`migration/migration-spreadsheet.csv` has WaterMark numbers in `YOU_FILL_*` columns)? If no → product import is blocked.

Match your work to the current phase. Don't propose milestone 6 work if milestone 1 isn't done.

## Step 3: Follow the conventions

Code conventions are in `docs/08-conventions.md`. Highlights:
- TypeScript strict mode, no `any` without justification
- Named exports, not default exports
- Server components by default; `"use client"` only when needed
- Tailwind for styling; no other CSS systems
- One component per file
- Conventional commits (`feat:`, `fix:`, `docs:`, etc.)

## Step 4: Make small, focused changes

This project is being built via the GitHub web UI, not a local CLI. Every change must be reviewable in a small, focused commit.

- Don't propose 500-line files when 100-line files would do
- Don't propose multi-file refactors as a single change
- Don't combine unrelated work in one commit

## Hard rules (do not violate)

1. **No web fonts in v1.** Use the system font stack only. Do not import `next/font/google` or load any web fonts.
2. **No client-side data fetching for first-paint content.** Use Server Components and pass data in.
3. **No URL filter parameters that get indexed.** Filtering is client-side or uses non-indexable hash params.
4. **No `add-to-cart=` URL patterns.** Add-to-cart is POST only.
5. **Every product has exactly one canonical URL.**
6. **No customer login walls. No trade gates. No quote requests.** One price for everyone — that's the brand promise.
7. **Never invent WaterMark licence numbers.** If a number isn't in the data, leave the field blank and flag it.
8. **No mock data in production code.** All product data comes from Shopify. If you need test data, mock at the API layer with clear comments.
9. **No design deviations from `docs/05-design-system.md`.** White, black, blue (`#0066CC`). No other accent colours.
10. **Australian English.** Colour, organise, behaviour. Not color, organize, behavior.

## What "done" looks like for any task

A task is done when:

- Code compiles with no TypeScript errors
- Lighthouse Performance ≥ 90 on the affected pages (or unchanged)
- No new console errors or warnings
- Matches the relevant doc — not contradicting it
- Commit message follows conventional commits format
- One logical change per commit

## When you're unsure

- If you're about to make an architectural choice not covered in `/docs/` → propose the choice in plain English first. Wait for confirmation before coding it.
- If you find a contradiction between user request and docs → flag it explicitly.
- If you don't have enough context to do something well → say so. Don't guess.

## What this project is NOT

- Not a general bathroom retailer
- Not a pump shop
- Not an aquarium / hydroponics / pool supplier
- Not a generalist plumbing supplier
- Not a vanity / mirror / decor retailer

Every product, every page, every word on this site reinforces "water filtration specialist." If you find yourself proposing work that doesn't reinforce that, stop.
