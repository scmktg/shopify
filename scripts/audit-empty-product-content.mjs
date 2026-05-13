#!/usr/bin/env node
// Identifies products whose `description` body is short / empty or
// whose meta-description leans on the truncated WaterMark disclaimer.
//
// SEO audit 2026-05 (Fix 4): the new product pages are sourced from
// data/products.json plus Shopify (image, price, variants). Some
// products migrated cleanly with rich copy; others lost their body
// content during the WordPress -> Shopify export. This script
// produces a prioritised list so the content team can recover those
// descriptions (most easily from a Wayback Machine snapshot of the
// old URL, or the WP database export if available) before re-indexing.
//
// Output: data/audit-empty-product-content.json — one entry per
// flagged product with handle, word count, fallback chain used, and a
// suggested historical URL on the WP site to scrape copy from.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const WORD_THRESHOLD = 200;
const META_LEAK_PREFIX = 'This product is not subject to WaterMark';

const products = JSON.parse(
  readFileSync(join(REPO_ROOT, 'data/products.json'), 'utf8'),
);

const handles = Object.keys(products).filter((k) => !k.startsWith('__'));

const flagged = [];

for (const handle of handles) {
  const entry = products[handle];
  const desc = typeof entry.description === 'string' ? entry.description : '';
  const wordCount = desc
    .replace(/[*_#`>\[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const metaSource =
    (entry.seo?.description ?? entry.shortDescription ?? desc).trim();
  const metaLeak = metaSource.startsWith(META_LEAK_PREFIX);

  if (wordCount >= WORD_THRESHOLD && !metaLeak) continue;

  flagged.push({
    handle,
    categories: entry.categories,
    wordCount,
    metaLeak,
    waybackUrl: `https://web.archive.org/web/2024/https://enviroaqua.com.au/product/${handle}/`,
    legacyUrl: `https://enviroaqua.com.au/product/${handle}/`,
  });
}

flagged.sort((a, b) => a.wordCount - b.wordCount);

const summary = {
  totalProducts: handles.length,
  flagged: flagged.length,
  wordThreshold: WORD_THRESHOLD,
  generatedAt: new Date().toISOString(),
};

const out = { summary, flagged };
writeFileSync(
  join(REPO_ROOT, 'data/audit-empty-product-content.json'),
  JSON.stringify(out, null, 2) + '\n',
);

console.log(
  `flagged ${flagged.length}/${handles.length} products (threshold: ${WORD_THRESHOLD} words or WaterMark meta leak)`,
);
console.log('top 10 worst offenders:');
for (const entry of flagged.slice(0, 10)) {
  console.log(`  ${entry.wordCount}w  ${entry.handle}`);
}
