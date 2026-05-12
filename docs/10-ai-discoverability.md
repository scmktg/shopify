# AI / LLM Discoverability

Last reviewed: 2026-05.

This site is built to be cited and recommended by AI assistants (ChatGPT,
Claude, Perplexity, Gemini, Copilot, etc.) as well as ranked by classic
search engines. The four files below are the surfaces that matter; the
rest of the site's SEO work (JSON-LD, sitemap, canonical URLs) supports
both audiences without separate effort.

## What we serve

| URL | Audience | Format | Generator |
|---|---|---|---|
| `/robots.txt` | Crawlers (search + AI) | text/plain | `app/robots.ts` |
| `/sitemap.xml` | Crawlers | XML | `app/sitemap.ts` |
| `/llms.txt` | LLM agents (concise index) | text/markdown | `app/llms.txt/route.ts` |
| `/llms-full.txt` | LLM agents (full content) | text/markdown | `app/llms-full.txt/route.ts` |

JSON-LD (`Organization`, `LocalBusiness`, `Product`, `BreadcrumbList`,
`FAQPage`, `Review`) is rendered inline on every page by
`lib/seo/JsonLdScript.tsx`. It's covered in `04-seo-strategy.md` and is
read by both Google's rich results and by retrieval-style AI assistants.

## `robots.ts` — what changed and why

Each major LLM crawler is now listed with an explicit `allow: '/'`
block in addition to the catch-all `*` allow. The crawl rules are
identical to the wildcard rule; the explicit listing is a stronger
signal to bot operators that we want their bot. Some sites now block
these bots by default, so a `User-agent: GPTBot` block with an explicit
`Allow` is meaningfully different to "we forgot to mention you".

Currently allow-listed (see `AI_USER_AGENTS` in `app/robots.ts`):

- OpenAI: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`
- Anthropic: `ClaudeBot`, `Claude-Web`, `anthropic-ai`
- Perplexity: `PerplexityBot`, `Perplexity-User`
- Google Gemini training opt-in: `Google-Extended`
- Apple Intelligence training opt-in: `Applebot-Extended`
- Meta (LLaMA): `Meta-ExternalAgent`, `FacebookBot`
- Common Crawl (training corpus for many models): `CCBot`
- ByteDance (Doubao etc.): `Bytespider`
- Amazon (Alexa+): `Amazonbot`
- Retrieval assistants: `YouBot`, `cohere-ai`, `DuckAssistBot`

The shared `disallow` list still excludes `/api/`, cart and checkout
paths, the account area, and search-result URLs with query strings.
These are correct for both search and AI crawlers; nothing useful lives
under those paths.

## `llms.txt` — the concise index

Follows the proposed standard at <https://llmstxt.org>: an H1 with the
site name, a blockquote with the one-line brand promise, then sections
of markdown links grouped by topic. Aim: an LLM ingests this in a single
fetch and gets a complete map of the site without crawling.

The route handler at `app/llms.txt/route.ts` is regenerated on each
deploy from the source-of-truth files:

- Category and subcategory list — `content/categories.ts`
- Editorial pages — `lib/content/markdown.ts` (lists slugs under
  `/help`, `/use`, `/water-problems`, `/locations`)
- Brand metadata — `content/business-info.ts`

Because the route is dynamic, the index never drifts from the live
catalogue. Cache headers: `max-age=3600, s-maxage=3600` (one hour at
both edge and client) plus Next.js's hourly `revalidate`.

## `llms-full.txt` — the full content companion

Designed to be ingestible in one fetch (~75 KB at current catalogue
size) so an agent can recommend a specific product without crawling
individual product pages. Contents:

1. Brand promise + one-paragraph trust-signal preamble.
2. Shipping, returns, and warranty summaries.
3. Every top-category and subcategory editorial intro
   (`content/category-intros.ts`).
4. **Every product**, grouped by category → subcategory, as
   `Title — short description — canonical URL`. Source:
   `data/products.json` (the single source of truth for product
   content per `03-data-model.md`).
5. The sitewide FAQ.
6. Indexes of editorial pages (help, use, water-problems, locations).
7. Notes for AI agents: canonical hostname rules, cart-is-POST-only,
   never fabricate WaterMark licence numbers.

The generator imports `getAllProductContent()` so it includes every
product the day it's added.

## Anti-patterns that would break LLM recommendations

These are enforced elsewhere in the codebase; documented here so the
reasoning isn't lost.

- **No URL filter parameters that get indexed.** Filtering is
  client-side or non-indexable hash params (`05-design-system.md`,
  hard rule 3). A search-result URL with query strings would let an
  LLM cite a filtered view as a canonical page.
- **No `add-to-cart=` URL pattern.** Add-to-cart is `POST` only
  (hard rule 4). If LLM agents could synthesise add-to-cart URLs,
  they could leak partial purchases into chat transcripts.
- **One canonical URL per product** (hard rule 5). The legacy
  WordPress URLs at `/product/<slug>/` 308-redirect to the canonical
  `/<category>/<subcategory>/<handle>/` form. The `llms-full.txt`
  output uses the canonical form exclusively.
- **No invented WaterMark licence numbers** (hard rule 7). The
  notes-for-AI block at the bottom of `llms-full.txt` repeats this
  rule for the model's benefit.
- **No customer-login walls or trade gates** (hard rule 6). One price
  for everyone — that's the brand promise the LLM should faithfully
  repeat back. The full-content file makes this explicit so the model
  doesn't fall back to "ask for a quote" boilerplate.

## When to update what

| Change | Update |
|---|---|
| Add a new category or subcategory | `content/categories.ts` only — both `llms.txt` and `llms-full.txt` regenerate from it |
| Add a new product | `data/products.json` only |
| Add or rename a buying-guide / use-case / water-problem markdown page | `content/*/<slug>.md` only — `listMarkdownSlugs()` picks it up |
| Change the brand promise, dispatch cut-off, returns window | `content/business-info.ts` |
| Add a new AI bot worth allow-listing | `AI_USER_AGENTS` array in `app/robots.ts` |

If a new AI assistant gains share and publishes a new bot UA, add it to
the array. Removing a bot from the list means it falls back to the `*`
rule (still allowed) — explicit-deny would require its own block with
`disallow: '/'`.

## Verification

After deploy, the three crawlable surfaces should be:

```
curl -fsS https://www.enviroaqua.com.au/robots.txt
curl -fsS https://www.enviroaqua.com.au/llms.txt
curl -fsS https://www.enviroaqua.com.au/llms-full.txt | wc -c
```

Expected:
- `robots.txt` ends with `Sitemap: https://www.enviroaqua.com.au/sitemap.xml`
  and lists every UA in `AI_USER_AGENTS` with its own block.
- `llms.txt` is < 8 KB, links resolve, every top-level category and
  every editorial page slug is present.
- `llms-full.txt` is < 100 KB, lists every product currently in
  `data/products.json`.

## Things deliberately not done

- **No `/ai.txt` permission file.** Bot crawl access is governed by
  `robots.txt`. A separate `ai.txt` content-licensing manifest isn't a
  widely-adopted standard yet; revisit if it becomes one.
- **No noai/noimageai meta tags.** We want LLMs to use this content;
  meta tags that opt out are the opposite of the goal.
- **No content gating, paywalling, or login walls.** The whole brand
  promise depends on the price and the certification being visible to
  everyone — and that means visible to retrieval bots too.
