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
 *
 * Production safety:
 *   - Vercel production builds must have the Shopify Storefront env vars.
 *   - Production always runs the bidirectional Shopify/content check strictly;
 *     a live Shopify product without storefront content fails the build.
 */
import productData from '../data/products.json';
import productOverrides from '../data/product-overrides.json';
import productAdditions from '../data/product-additions.json';
import squareTankAdditions from '../data/product-square-tanks.json';
import dosingPackageAdditions from '../data/product-dosing-packages.json';
import bundSeoOverrides from '../data/product-bund-seo-overrides.json';
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
  ...dosingPackageAdditions,
  ...bundSeoOverrides,
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

function isProductionBuild(): boolean {
  return process.env['VERCEL_ENV'] === 'production';
}

async function main(): Promise<void> {
  const handleCount = Object.keys(catalogData).length;
  const production = isProductionBuild();
  const strict = production || process.env['STRICT_PRODUCTS_VALIDATION'] === '1';

  console.log(`[validate] merged product content: ${handleCount} entries`);
  if (production) {
    console.log(`${GREEN}✓${RESET} production build: strict Shopify validation enforced`);
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
      `${YELLOW}!${RESET} Shopify env not set — skipping cross-Shopify handle check outside production.`,
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

  const canonicalBaseData = canonicalizeCatalogHandles(
    productData as unknown as Record<string, unknown>,
  );
  const canonicalCatalogData = canonicalizeCatalogHandles(
    catalogData as unknown as Record<string, unknown>,
  );

  const baseResult = await validateAgainstShopify(
    canonicalBaseData as unknown as Parameters<typeof validateAgainstShopify>[0],
    fetchLiveHandles,
  );

  const mergedResult = await validateAgainstShopify(
    canonicalCatalogData as unknown as Parameters<typeof validateAgainstShopify>[0],
    fetchLiveHandles,
  );

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
        `  ${DIM}Strict product validation is active — every live Shopify product must have a storefront content entry to ship.${RESET}`,
      );
    } else {
      stream(
        `  ${DIM}Migration backlog: warning only outside production. Set STRICT_PRODUCTS_VALIDATION=1 to escalate locally.${RESET}`,
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
