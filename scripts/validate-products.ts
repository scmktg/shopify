/**
 * CLI entry point for the product-content validator.
 *
 * Usage:
 *
 *   npm run validate:products
 *
 * Exits 0 when the catalogue content is valid, 1 with a punch list otherwise.
 *
 * Two passes:
 *   1. Synchronous shape + cross-handle validation. Always runs against the
 *      merged catalogue used by the storefront.
 *   2. Async cross-Shopify check. Base products.json entries must resolve in
 *      the live Storefront API, while override/addition entries may be staged
 *      before publication. Conversely, every live Shopify product must have a
 *      content entry somewhere in the merged catalogue.
 */
import productData from '../data/products.json';
import productOverrides from '../data/product-overrides.json';
import productAdditions from '../data/product-additions.json';
import squareTankAdditions from '../data/product-square-tanks.json';
import {
  canonicalProductHandle,
} from '../lib/products/getProductContent';
import {
  isScaffoldingHandle,
  validateProducts,
  validateAgainstShopify,
} from '../lib/products/validator';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const catalogData = {
  ...productData,
  ...productOverrides,
  ...productAdditions,
  ...squareTankAdditions,
};

function canonicalizeCatalogHandles<T>(
  catalog: Readonly<Record<string, T>>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(catalog).map(([handle, entry]) => [
      canonicalProductHandle(handle),
      entry,
    ]),
  );
}

function hasShopifyEnv(): boolean {
  return Boolean(
    process.env['SHOPIFY_STORE_DOMAIN'] &&
      process.env['SHOPIFY_STOREFRONT_PRIVATE_TOKEN'] &&
      process.env['SHOPIFY_API_VERSION'],
  );
}

async function main(): Promise<void> {
  const handleCount = Object.keys(catalogData).length;
  console.log(`[validate] merged product content: ${handleCount} entries`);

  // Pass 1 — pure validation over exactly what the storefront loader can see.
  // Keep this pass on the authored/raw keys so historical sibling references
  // remain internally self-consistent while the loader aliases them at runtime.
  const result = validateProducts(catalogData);

  for (const w of result.warnings) {
    console.warn(`  ${YELLOW}!${RESET} ${w.handle}`);
    console.warn(`      ${DIM}${w.path}${RESET}`);
    console.warn(`      ${w.message}`);
  }

  if (!result.ok) {
    console.error('');
    console.error(`${RED}✖ product content failed validation${RESET}`);
    console.error('');
    for (const err of result.errors) {
      console.error(`  ${RED}✖${RESET} ${err.handle}`);
      console.error(`      ${DIM}${err.path}${RESET}`);
      console.error(`      ${err.message}`);
    }
    console.error('');
    console.error(
      `${RED}${result.errors.length} error(s). Fix the above and re-run.${RESET}`,
    );
    process.exit(1);
  }
  console.log(`${GREEN}✓${RESET} shape + cross-handle references valid`);
  if (result.warnings.length > 0) {
    console.log(
      `${YELLOW}!${RESET} ${result.warnings.length} warning(s) — non-blocking; the audit script enforces the launch gate.`,
    );
  }

  const scaffolding = Object.keys(catalogData).filter(isScaffoldingHandle);
  if (scaffolding.length > 0) {
    console.log(
      `${YELLOW}!${RESET} ${scaffolding.length} scaffolding entries skipped from Shopify check: ${scaffolding.join(', ')}`,
    );
  }

  // Pass 2 — Shopify cross-check (gated on env).
  if (!hasShopifyEnv()) {
    console.log(
      `${YELLOW}!${RESET} Shopify env not set — skipping cross-Shopify handle check.`,
    );
    console.log(
      `${DIM}  (set SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN + SHOPIFY_API_VERSION to enable)${RESET}`,
    );
    process.exit(0);
  }

  const { getAllProductHandles } = await import(
    '../lib/shopify/queries/getAllProductHandles'
  );
  const fetchLiveHandles = async () => {
    const handles = await getAllProductHandles();
    return handles.map((h) => h.handle);
  };

  // A few products retain historical content keys for migration/backlink
  // compatibility even though their Shopify handles have been cleaned up.
  // Compare canonical handles to Shopify so those aliases do not make a valid
  // rename look like a deleted product (or a newly-published product with no
  // content) during Vercel's prebuild gate.
  const canonicalBaseData = canonicalizeCatalogHandles(
    productData as unknown as Record<string, unknown>,
  );
  const canonicalCatalogData = canonicalizeCatalogHandles(
    catalogData as unknown as Record<string, unknown>,
  );

  // Direction A: long-lived base catalogue entries must resolve live in Shopify.
  // Draft/future products are deliberately kept in overrides/additions and are
  // allowed to exist before publication.
  const baseResult = await validateAgainstShopify(
    canonicalBaseData as unknown as Parameters<typeof validateAgainstShopify>[0],
    fetchLiveHandles,
  );

  // Direction B: every product that is live in Shopify must have storefront
  // content somewhere in the merged catalogue. This catches newly-published
  // products such as a bund before they can ship without a working PDP.
  const mergedResult = await validateAgainstShopify(
    canonicalCatalogData as unknown as Parameters<typeof validateAgainstShopify>[0],
    fetchLiveHandles,
  );

  const strict = process.env['STRICT_PRODUCTS_VALIDATION'] === '1';
  const missingInShopify = baseResult.missingInShopify;
  const missingInProducts = mergedResult.missingInProducts;

  if (missingInShopify.length === 0 && missingInProducts.length === 0) {
    console.log(
      `${GREEN}✓${RESET} base catalogue resolves in Shopify; every live Shopify product has storefront content`,
    );
    process.exit(0);
  }

  if (missingInShopify.length > 0) {
    console.error('');
    console.error(
      `${RED}✖ base product content references Shopify handles that don't exist:${RESET}`,
    );
    for (const handle of missingInShopify) {
      console.error(`    - ${handle}`);
    }
    console.error('');
    console.error(
      `  ${DIM}(check for typos, or remove the stale entry if the product was unpublished in Shopify)${RESET}`,
    );
  }

  if (missingInProducts.length > 0) {
    const stream = strict ? console.error : console.warn;
    const colour = strict ? RED : YELLOW;
    const symbol = strict ? '✖' : '!';
    stream('');
    stream(
      `${colour}${symbol} Shopify products with no storefront content entry (${missingInProducts.length}):${RESET}`,
    );
    for (const handle of missingInProducts) {
      stream(`    - ${handle}`);
    }
    stream('');
    if (strict) {
      stream(
        `  ${DIM}STRICT_PRODUCTS_VALIDATION is set — every live Shopify product must have a content entry to ship.${RESET}`,
      );
    } else {
      stream(
        `  ${DIM}Migration backlog: warning only. Set STRICT_PRODUCTS_VALIDATION=1 to escalate this to a build failure.${RESET}`,
      );
    }
  }

  if (missingInShopify.length > 0) process.exit(1);
  if (missingInProducts.length > 0 && strict) process.exit(1);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(`${RED}[validate] unexpected error:${RESET}`, error);
  process.exit(1);
});
