/**
 * One-shot backfill for `data/products.json`.
 *
 * Run once after Phase B merges. For every Shopify product that
 * doesn't already have a `products.json` entry, this script appends
 * a minimal entry containing:
 *
 *   - categories — derived from the product's `primary-cat:<slug>`
 *     and `sub-cat:<slug>` Shopify tags. Both must resolve in
 *     `content/categories.ts`. If either is missing or doesn't
 *     resolve, the entry gets `["__unmapped", "__unmapped"]` so the
 *     validator fails loudly and the engineer fixes it manually
 *     before deploy.
 *
 *   - shortDescription — first sentence of the sanitised Shopify
 *     descriptionHtml, capped at ~120 chars.
 *
 *   - seo.description — the same first sentence, expanded with the
 *     next sentence(s) when the first was shorter than ~155 chars.
 *
 * Every other field is omitted; the live page renders only the
 * sections whose data is present (per Phase B). The engineer will
 * enrich the top ~30 products manually over the following weeks.
 *
 * Existing entries (the bubbler, the Big Blue, the cartridge stubs,
 * `_seed-minimal-example`, and the `__placeholders` metadata block)
 * are preserved verbatim.
 *
 * Don't put this on a cron. `data/products.json` is engineer-edited
 * from this point forward; this is a one-time backfill.
 *
 * Usage (from repo root with Shopify env vars in scope):
 *
 *   SHOPIFY_STORE_DOMAIN=... \
 *   SHOPIFY_STOREFRONT_PRIVATE_TOKEN=... \
 *   SHOPIFY_API_VERSION=2026-04 \
 *   npm run bootstrap:products
 *
 * After it runs:
 *   1. `git diff data/products.json` to inspect the new entries.
 *   2. Search for `"__unmapped"` and assign the right
 *      [category, subcategory] tuple by hand.
 *   3. `npm run validate:products` to confirm.
 *   4. Commit + push.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getAllProductHandles } from '@/lib/shopify/queries/getAllProductHandles';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { findSubcategory } from '@/content/categories';
import {
  metaDescriptionFromHtml,
  sanitiseProductDescriptionHtml,
} from '@/lib/content/productHtml';

const TARGET_PATH = path.resolve(process.cwd(), 'data/products.json');
const SHORT_DESC_MAX = 120;
const SEO_DESC_TARGET = 155;
const PRIMARY_PREFIX = 'primary-cat:';
const SUB_PREFIX = 'sub-cat:';
const UNMAPPED: readonly [string, string] = ['__unmapped', '__unmapped'];

interface MinimalEntry {
  categories: readonly [string, string];
  shortDescription?: string;
  seo?: { description: string };
}

function tagValue(
  tags: ReadonlyArray<string>,
  prefix: string,
): string | null {
  const t = tags.find((tag) => tag.startsWith(prefix));
  return t ? t.slice(prefix.length).trim() : null;
}

function deriveCategories(
  tags: ReadonlyArray<string>,
): readonly [string, string] {
  const primary = tagValue(tags, PRIMARY_PREFIX);
  const sub = tagValue(tags, SUB_PREFIX);
  if (primary && sub && findSubcategory(primary, sub)) {
    return [primary, sub] as const;
  }
  return UNMAPPED;
}

/**
 * Slice the input at the first sentence terminator (`.`, `!`, `?`)
 * followed by whitespace or end-of-string. Falls back to a hard
 * char cap with an ellipsis if no terminator appears within the cap.
 */
function firstSentence(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/[.!?](?=\s|$)/);
  let candidate = match ? trimmed.slice(0, match.index! + 1) : trimmed;
  if (candidate.length > maxChars) {
    candidate = candidate.slice(0, maxChars - 1).trimEnd() + '…';
  }
  return candidate;
}

/**
 * Expand `seed` toward `target` chars by appending more sentences
 * from `source`. Prefers sentence-boundary cuts; if no terminator
 * lands close to `target`, hard-caps and appends an ellipsis.
 */
function expandToward(
  seed: string,
  source: string,
  target: number,
): string {
  if (seed.length >= target) return seed;
  const trimmedSource = source.trim();
  if (trimmedSource.length <= seed.length) return seed;

  const window = trimmedSource.slice(0, Math.floor(target * 1.2));
  const re = /[.!?](?=\s|$)/g;
  let bestEnd = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(window)) !== null) {
    const end = m.index + 1;
    if (end <= target) {
      bestEnd = end;
    } else {
      break;
    }
  }

  if (bestEnd > seed.length - 5) {
    return trimmedSource.slice(0, bestEnd).trimEnd();
  }

  const hard = trimmedSource.slice(0, target).trimEnd();
  return /[.!?]$/.test(hard) ? hard : `${hard}…`;
}

interface BootstrapStats {
  scanned: number;
  added: number;
  unmapped: number;
  alreadyPresent: number;
  shopifyMisses: number;
}

async function main(): Promise<void> {
  const handlesResp = await getAllProductHandles();
  const handles = handlesResp.map((h) => h.handle);
  console.log(`[bootstrap] ${handles.length} Shopify products to consider`);

  const raw = await fs.readFile(TARGET_PATH, 'utf8');
  const existing = JSON.parse(raw) as Record<string, unknown>;

  const stats: BootstrapStats = {
    scanned: 0,
    added: 0,
    unmapped: 0,
    alreadyPresent: 0,
    shopifyMisses: 0,
  };
  const unmappedHandles: string[] = [];

  for (const handle of handles) {
    stats.scanned += 1;
    if (stats.scanned % 25 === 0) {
      console.log(
        `[bootstrap] ${stats.scanned}/${handles.length} scanned (added ${stats.added})`,
      );
    }
    if (handle in existing) {
      stats.alreadyPresent += 1;
      continue;
    }

    const product = await getProductByHandle(handle);
    if (!product) {
      stats.shopifyMisses += 1;
      console.warn(
        `[bootstrap] Shopify returned null for handle '${handle}' — skipping`,
      );
      continue;
    }

    const categories = deriveCategories(product.tags);
    if (categories[0] === '__unmapped') {
      stats.unmapped += 1;
      unmappedHandles.push(handle);
    }

    const sanitised = sanitiseProductDescriptionHtml(product.descriptionHtml);
    // metaDescriptionFromHtml caps at the second arg; use a generous
    // cap so we have enough text to derive both shortDescription and
    // (potentially expanded) seo.description from one source.
    const fullPlain = metaDescriptionFromHtml(sanitised, 1000);

    const shortDescription = firstSentence(fullPlain, SHORT_DESC_MAX);
    const seoDescription = expandToward(
      shortDescription,
      fullPlain,
      SEO_DESC_TARGET,
    );

    const entry: MinimalEntry = { categories };
    if (shortDescription) entry.shortDescription = shortDescription;
    if (seoDescription) entry.seo = { description: seoDescription };

    existing[handle] = entry;
    stats.added += 1;
  }

  // Re-serialise with two-space indent; this matches the existing
  // file's style. Object key order is insertion order, so the
  // existing entries (and the `__placeholders` metadata block) stay
  // at the top, and bootstrap-added entries land at the bottom in
  // Shopify's iteration order.
  const out = `${JSON.stringify(existing, null, 2)}\n`;
  await fs.writeFile(TARGET_PATH, out, 'utf8');

  console.log('');
  console.log(`[bootstrap] Done.`);
  console.log(`[bootstrap]   scanned:         ${stats.scanned}`);
  console.log(`[bootstrap]   already present: ${stats.alreadyPresent}`);
  console.log(`[bootstrap]   added:           ${stats.added}`);
  console.log(`[bootstrap]   unmapped:        ${stats.unmapped}`);
  console.log(`[bootstrap]   Shopify misses:  ${stats.shopifyMisses}`);
  console.log('');
  console.log(`[bootstrap] Wrote ${TARGET_PATH}`);

  if (stats.unmapped > 0) {
    console.log('');
    console.log(
      `[bootstrap] ${stats.unmapped} entries have categories=["__unmapped","__unmapped"]:`,
    );
    for (const handle of unmappedHandles) {
      console.log(`            - ${handle}`);
    }
    console.log('');
    console.log(
      `[bootstrap] Search products.json for "__unmapped" and replace each pair`,
    );
    console.log(
      `[bootstrap] with the correct [category, subcategory] tuple from`,
    );
    console.log(`[bootstrap] content/categories.ts. Then run:`);
    console.log('');
    console.log(`              npm run validate:products`);
    console.log('');
  } else {
    console.log('');
    console.log(`[bootstrap] No __unmapped categories. Run:`);
    console.log('');
    console.log(`              npm run validate:products`);
    console.log('');
    console.log(`[bootstrap] then commit and push.`);
  }
}

main().catch((err: unknown) => {
  console.error('[bootstrap] failed:', err);
  process.exit(1);
});
