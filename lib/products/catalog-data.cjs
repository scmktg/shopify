const productData = require('../../data/products.json');
const productOverrides = require('../../data/product-overrides.json');
const productAdditions = require('../../data/product-additions.json');
const squareTankAdditions = require('../../data/product-square-tanks.json');
const dosingPackageAdditions = require('../../data/product-dosing-packages.json');
const bundSeoOverrides = require('../../data/product-bund-seo-overrides.json');
const productCategoryOverrides = require('../../data/product-category-overrides.json');
const productRankingOverrides = require('../../data/product-ranking-overrides.json');
const uvLampOverrides = require('../../data/product-uv-lamp-overrides.json');
const bubblerAiOverrides = require('../../data/product-bubbler-ai-overrides.json');
const bladderOverrides = require('../../data/product-bladder-overrides.json');
const productComplianceCorrections = require('../../data/product-compliance-corrections.json');

function isFileMetaKey(key) {
  return key.startsWith('__');
}

const LEGACY_TO_CANONICAL_PRODUCT_HANDLES = Object.freeze({
  'chemical-dosing-tank-bunded-50l': 'chemical-dosing-tank-50l',
  'chemical-dosing-tank-bunded-100l': 'chemical-dosing-tank-100l',
  'chemical-dosing-tank-bunded-200l': 'chemical-dosing-tank-200l',
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system-dup2':
    'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
  'uv-water-filter-ultraviolet-sterilisation-2700lph-55w-220v-240v':
    'ultraviolet-water-sterilizer-stainless-steel-unit-55w-2700lph-phillip-lamp',
});

function canonicalProductHandle(handle) {
  return LEGACY_TO_CANONICAL_PRODUCT_HANDLES[handle] || handle;
}

function applyCategoryOverrides(catalog) {
  const patched = { ...catalog };
  for (const [handle, categories] of Object.entries(productCategoryOverrides)) {
    if (!Array.isArray(categories) || categories.length < 2) continue;
    const canonicalHandle = canonicalProductHandle(handle);
    const current = patched[canonicalHandle] || patched[handle];
    if (!current) continue;
    patched[canonicalHandle] = {
      ...current,
      categories: [...categories],
    };
    if (canonicalHandle !== handle) delete patched[handle];
  }
  return patched;
}

function applyProductPatches(catalog, patches) {
  const patched = { ...catalog };

  for (const [handle, patch] of Object.entries(patches)) {
    const canonicalHandle = canonicalProductHandle(handle);
    const current = patched[canonicalHandle] || patched[handle];
    if (!current || !patch || typeof patch !== 'object') continue;

    patched[canonicalHandle] = {
      ...current,
      ...patch,
      ...(patch.seo
        ? { seo: { ...(current.seo || {}), ...patch.seo } }
        : {}),
      ...(patch.upsells
        ? { upsells: { ...(current.upsells || {}), ...patch.upsells } }
        : {}),
      ...(patch.compliance
        ? { compliance: { ...(current.compliance || {}), ...patch.compliance } }
        : {}),
    };

    if (canonicalHandle !== handle) delete patched[handle];
  }

  return patched;
}

// This is the single catalogue merge order used by storefront product content,
// sitemap/internal URL resolution and build-time Shopify integrity validation.
// Later full catalogue layers intentionally win when the same handle appears
// more than once. Search Console ranking and AI-search content patches are then
// applied field-by-field so focused SEO improvements do not duplicate entire
// product records or overwrite unrelated commerce content. Product-specific
// bladder corrections are applied before the final compliance layer so known
// certification corrections always remain authoritative.
const mergedProductCatalog = Object.freeze(
  applyCategoryOverrides(
    applyProductPatches(
      applyProductPatches(
        applyProductPatches(
          applyProductPatches(
            applyProductPatches(
              {
                ...productData,
                ...productOverrides,
                ...productAdditions,
                ...squareTankAdditions,
                ...dosingPackageAdditions,
                ...bundSeoOverrides,
              },
              productRankingOverrides,
            ),
            uvLampOverrides,
          ),
          bubblerAiOverrides,
        ),
        bladderOverrides,
      ),
      productComplianceCorrections,
    ),
  ),
);

const canonicalCatalog = { ...mergedProductCatalog };
for (const [legacyHandle, canonicalHandle] of Object.entries(
  LEGACY_TO_CANONICAL_PRODUCT_HANDLES,
)) {
  const legacyContent = canonicalCatalog[legacyHandle];
  if (!legacyContent) continue;
  canonicalCatalog[canonicalHandle] = legacyContent;
  delete canonicalCatalog[legacyHandle];
}

const productCatalog = Object.freeze(
  Object.fromEntries(
    Object.entries(canonicalCatalog).filter(([key]) => !isFileMetaKey(key)),
  ),
);

const baseProductCatalog = Object.freeze(
  Object.fromEntries(
    Object.entries(
      applyCategoryOverrides(productData),
    )
      .filter(([key]) => !isFileMetaKey(key))
      .map(([handle, content]) => [canonicalProductHandle(handle), content]),
  ),
);

function productPathForSlug(slug) {
  const canonicalHandle = canonicalProductHandle(slug);
  const entry = productCatalog[canonicalHandle];
  if (!entry || !Array.isArray(entry.categories)) return null;
  const [category, subcategory] = entry.categories;
  if (!category || !subcategory) return null;
  return `/${category}/${subcategory}/${canonicalHandle}`;
}

module.exports = {
  LEGACY_TO_CANONICAL_PRODUCT_HANDLES,
  baseProductCatalog,
  canonicalProductHandle,
  isFileMetaKey,
  mergedProductCatalog,
  productCatalog,
  productPathForSlug,
};
