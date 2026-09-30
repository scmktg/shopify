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
 *
 * Production safety:
 *   - Vercel production builds must have the Shopify Storefront env vars.
 *   - Production always runs the Shopify/content checks strictly.
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
    console.log(`${GREEN}✓${RESET} production build: strict Shopify validation enforced`);
  }

  // Preserve validation of the merged source before legacy-handle canonicalisation,
  // so malformed staging/override entries cannot be hidden by the canonical layer.
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

  if (!hasShopifyEnv()) {
    if (production) {
      console.error('');
      console.error(
        `${RED}✖ production product validation cannot run because Shopify env vars are missing.${RESET}`,
      );
      console.error(
        `${DIM}  Required: SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN + SHOPIFY_API_VERSION${RESET}`,
      );
      console.error(
        `${DIM}  Production builds must never skip the Shopify ↔ storefront catalogue integrity check.${RESET}`,
      );
      process.exit(1);
    }

    console.log(
      `${YELLOW}!${RESET} Shopify env not set — skipping cross-Shopify checks outside production.`,
    );
    console.log(
      `${DIM}  (set SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN + SHOPIFY_API_VERSION to enable)${RESET}`,
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
        `  ${DIM}Strict product validation is active — every live Shopify product must have a storefront content entry to ship.${RESET}`,
      );
    } else {
      stream(
        `  ${DIM}Migration backlog: warning only outside production. Set STRICT_PRODUCTS_VALIDATION=1 to escalate locally.${RESET}`,
      );
    }
  }

  if (categoryMismatches.length > 0) {
    console.error('');
    console.error(
      `${RED}✖ Shopify category tags disagree with canonical storefront categories (${categoryMismatches.length}):${RESET}`,
    );
    for (const mismatch of categoryMismatches) {
      console.error(`    - ${mismatch.handle}`);
      console.error(
        `      expected: primary-cat:${mismatch.expectedPrimary}, sub-cat:${mismatch.expectedSubcategory}`,
      );
      console.error(
        `      actual primary: ${mismatch.primaryTags.length > 0 ? mismatch.primaryTags.join(', ') : '(none)'}`,
      );
      console.error(
        `      actual subcategories: ${mismatch.subcategoryTags.length > 0 ? mismatch.subcategoryTags.join(', ') : '(none)'}`,
      );
      for (const issue of mismatch.issues) {
        console.error(`      ${RED}✖${RESET} ${issue}`);
      }
    }
    console.error('');
    console.error(
      `  ${DIM}Category tags drive Shopify PLP membership; canonical code categories drive PDP URLs. These must agree before shipping.${RESET}`,
    );
  }

  const handleChecksOk =
    missingInShopify.length === 0 &&
    (missingInProducts.length === 0 || !strict);
  const categoriesOk = categoryMismatches.length === 0;

  if (handleChecksOk && categoriesOk) {
    console.log(
      `${GREEN}✓${RESET} Shopify handles and category tags match the canonical storefront catalogue`,
    );
    process.exit(0);
  }

  if (missingInShopify.length > 0) process.exit(1);
  if (missingInProducts.length > 0 && strict) process.exit(1);
  if (categoryMismatches.length > 0) process.exit(1);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(`${RED}[validate] unexpected error:${RESET}`, error);
  process.exit(1);
});
