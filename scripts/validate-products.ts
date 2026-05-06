/**
 * CLI entry point for the products.json validator.
 *
 * Usage:
 *
 *   npm run validate:products
 *
 * Exits 0 when the file is valid, 1 with a punch list otherwise.
 *
 * Two passes:
 *   1. Synchronous shape + cross-handle validation. Always runs.
 *   2. Async cross-Shopify check (every products.json handle exists
 *      in Shopify, every Shopify handle has an entry). Runs only
 *      when SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN
 *      + SHOPIFY_API_VERSION are set. The CLI prints a notice when
 *      the check is skipped so it's obvious nothing was verified.
 *
 * Wired to `prebuild` in package.json — a malformed entry fails the
 * production build with a clear error rather than rendering a broken
 * page in front of a customer.
 */
import productData from '../data/products.json';
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

function hasShopifyEnv(): boolean {
  return Boolean(
    process.env['SHOPIFY_STORE_DOMAIN'] &&
      process.env['SHOPIFY_STOREFRONT_PRIVATE_TOKEN'] &&
      process.env['SHOPIFY_API_VERSION'],
  );
}

async function main(): Promise<void> {
  const handleCount = Object.keys(productData).length;
  console.log(`[validate] data/products.json: ${handleCount} entries`);

  // Pass 1 — pure validation.
  const result = validateProducts(productData);

  for (const w of result.warnings) {
    console.warn(`  ${YELLOW}!${RESET} ${w.handle}`);
    console.warn(`      ${DIM}${w.path}${RESET}`);
    console.warn(`      ${w.message}`);
  }

  if (!result.ok) {
    console.error('');
    console.error(`${RED}✖ products.json failed validation${RESET}`);
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

  const scaffolding = Object.keys(productData).filter(isScaffoldingHandle);
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
    productData as unknown as Parameters<typeof validateAgainstShopify>[0],
    async () => {
      const handles = await getAllProductHandles();
      return handles.map((h) => h.handle);
    },
  );

  if (shopifyResult.ok) {
    console.log(
      `${GREEN}✓${RESET} every products.json handle resolves in Shopify; every Shopify handle has a content entry`,
    );
    process.exit(0);
  }

  console.error('');
  console.error(`${RED}✖ Shopify ↔ products.json mismatch${RESET}`);
  if (shopifyResult.missingInShopify.length > 0) {
    console.error('');
    console.error(
      `  ${RED}Handles in products.json with no matching Shopify product:${RESET}`,
    );
    for (const handle of shopifyResult.missingInShopify) {
      console.error(`    - ${handle}`);
    }
  }
  if (shopifyResult.missingInProducts.length > 0) {
    console.error('');
    console.error(
      `  ${RED}Shopify products with no entry in products.json:${RESET}`,
    );
    for (const handle of shopifyResult.missingInProducts) {
      console.error(`    - ${handle}`);
    }
    console.error('');
    console.error(
      `  ${DIM}(merchant must add product to Shopify first; engineer adds the products.json entry; both ship together — no silent fallback.)${RESET}`,
    );
  }
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(`${RED}[validate] unexpected error:${RESET}`, error);
  process.exit(1);
});
