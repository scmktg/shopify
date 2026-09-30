/**
 * CLI entry point for the product-content validator.
 *
 * Usage:
 *
 *   npm run validate:products
 *
 * Exits 0 when the catalogue content is valid, 1 with a punch list otherwise.
 *
 * Three passes:
 *   1. Synchronous shape + cross-handle validation against the exact merged
 *      catalogue used by the storefront.
 *   2. Bidirectional Shopify/content handle validation.
 *   3. Shopify category-tag validation against the canonical code categories
 *      that drive PDP URLs and breadcrumbs.
 */
import type { ProductContent, ProductContentMap } from '../lib/products/schema';
import {
  isScaffoldingHandle,
  validateProducts,
  validateAgainstShopify,
} from '../lib/products/validator';
import { validateShopifyCategoryTags } from '../lib/products/shopifyCategoryValidator';

const catalogDataModule = require('../lib/products/catalog-data.cjs') as {
  baseProductCatalog: Record<string, ProductContent>;
  mergedProductCatalog: Record<string, ProductContent>;
  productCatalog: Record<string, ProductContent>;
};

const catalogData = catalogDataModule.mergedProductCatalog as ProductContentMap;
const canonicalBaseData = catalogDataModule.baseProductCatalog as ProductContentMap;
const canonicalCatalogData = catalogDataModule.productCatalog as ProductContentMap;

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

function isProductionBuild(): boolean {
  return process.env['VERCEL_ENV'] === 'production';
}

async function main(): Promise<void> {
  const handleCount = Object.keys(canonicalCatalogData).length;
  const production = isProductionBuild();
  const strict = production || process.env['STRICT_PRODUCTS_VALIDATION'] === '1';

  console.log(`[validate] canonical product content: ${handleCount} entries`);
  if (production) {
    console.log(`${GREEN}✓${RESET} production build: strict Shopify handle validation enforced`);
  }

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

  const scaffolding = Object.keys(catalogData).filter(isScaffoldingHandle);
  if (scaffolding.length > 0) {
    console.log(
      `${YELLOW}!${RESET} ${scaffolding.length} scaffolding entries skipped from Shopify check: ${scaffolding.join(', ')}`,
    );
  }

  if (!hasShopifyEnv()) {
    if (production) {
      console.error('');
      console.error(
        `${RED}✖ production product validation cannot run because Shopify env vars are missing.${RESET}`,
      );
      console.error(
        `${DIM}  Required: SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN + SHOPIFY_API_VERSION${RESET}`,
      );
      process.exit(1);
    }

    console.log(
      `${YELLOW}!${RESET} Shopify env not set — skipping cross-Shopify checks outside production.`,
    );
    process.exit(0);
  }

  const { getAllProductHandles } = await import(
    '../lib/shopify/queries/getAllProductHandles'
  );
  const shopifyProducts = await getAllProductHandles();
  const fetchLiveHandles = async () => shopifyProducts.map((product) => product.handle);

  const baseResult = await validateAgainstShopify(
    canonicalBaseData,
    fetchLiveHandles,
  );
  const mergedResult = await validateAgainstShopify(
    canonicalCatalogData,
    fetchLiveHandles,
  );

  const missingInShopify = baseResult.missingInShopify;
  const missingInProducts = mergedResult.missingInProducts;
  const categoryMismatches = validateShopifyCategoryTags(
    canonicalCatalogData,
    shopifyProducts,
  );

  if (missingInShopify.length > 0) {
    console.error('');
    console.error(
      `${RED}✖ base product content references Shopify handles that don't exist:${RESET}`,
    );
    for (const handle of missingInShopify) console.error(`    - ${handle}`);
  }

  if (missingInProducts.length > 0) {
    const stream = strict ? console.error : console.warn;
    const colour = strict ? RED : YELLOW;
    const symbol = strict ? '✖' : '!';
    stream('');
    stream(
      `${colour}${symbol} Shopify products with no storefront content entry (${missingInProducts.length}):${RESET}`,
    );
    for (const handle of missingInProducts) stream(`    - ${handle}`);
  }

  // During the one-time P1 catalogue cleanup this is deliberately reporting
  // rather than blocking. The temporary integrity endpoint exposes the exact
  // mismatch list so Shopify can be corrected; the gate is switched back to
  // blocking immediately after that cleanup.
  if (categoryMismatches.length > 0) {
    console.warn('');
    console.warn(
      `${YELLOW}! Shopify category-tag mismatches to clean up (${categoryMismatches.length}):${RESET}`,
    );
    for (const mismatch of categoryMismatches) {
      console.warn(`    - ${mismatch.handle}`);
      console.warn(
        `      expected: primary-cat:${mismatch.expectedPrimary}, sub-cat:${mismatch.expectedSubcategory}`,
      );
      console.warn(
        `      actual primary: ${mismatch.primaryTags.length > 0 ? mismatch.primaryTags.join(', ') : '(none)'}`,
      );
      console.warn(
        `      actual subcategories: ${mismatch.subcategoryTags.length > 0 ? mismatch.subcategoryTags.join(', ') : '(none)'}`,
      );
    }
  }

  if (missingInShopify.length > 0) process.exit(1);
  if (missingInProducts.length > 0 && strict) process.exit(1);

  console.log(
    categoryMismatches.length === 0
      ? `${GREEN}✓${RESET} Shopify handles and category tags match the canonical storefront catalogue`
      : `${YELLOW}!${RESET} handle integrity passed; category mismatches are temporarily non-blocking for P1 cleanup`,
  );
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(`${RED}[validate] unexpected error:${RESET}`, error);
  process.exit(1);
});
