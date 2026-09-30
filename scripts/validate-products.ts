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
 *   1. Synchronous shape + cross-handle validation. Always runs.
 *   2. Async cross-Shopify check (every content handle exists in Shopify,
 *      every Shopify handle has a content entry). Runs only when
 *      SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN
 *      + SHOPIFY_API_VERSION are set.
 */
import productData from '../data/products.json';
import productOverrides from '../data/product-overrides.json';
import productAdditions from '../data/product-additions.json';
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
};

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

  // Pass 1 — pure validation.
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
  const shopifyResult = await validateAgainstShopify(
    catalogData as unknown as Parameters<typeof validateAgainstShopify>[0],
    async () => {
      const handles = await getAllProductHandles();
      return handles.map((h) => h.handle);
    },
  );

  const strict = process.env['STRICT_PRODUCTS_VALIDATION'] === '1';
  const missingInShopify = shopifyResult.missingInShopify;
  const missingInProducts = shopifyResult.missingInProducts;

  if (missingInShopify.length === 0 && missingInProducts.length === 0) {
    console.log(
      `${GREEN}✓${RESET} every content handle resolves in Shopify; every Shopify handle has a content entry`,
    );
    process.exit(0);
  }

  if (missingInShopify.length > 0) {
    console.error('');
    console.error(
      `${RED}✖ product content references Shopify handles that don't exist:${RESET}`,
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
      `${colour}${symbol} Shopify products with no content entry (${missingInProducts.length}):${RESET}`,
    );
    for (const handle of missingInProducts) {
      stream(`    - ${handle}`);
    }
    stream('');
    if (strict) {
      stream(
        `  ${DIM}STRICT_PRODUCTS_VALIDATION is set — every Shopify product must have a content entry to ship.${RESET}`,
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
