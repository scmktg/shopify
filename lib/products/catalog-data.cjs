const productData = require('../../data/products.json');
const productOverrides = require('../../data/product-overrides.json');
const productAdditions = require('../../data/product-additions.json');
const squareTankAdditions = require('../../data/product-square-tanks.json');
const dosingPackageAdditions = require('../../data/product-dosing-packages.json');
const bundSeoOverrides = require('../../data/product-bund-seo-overrides.json');

function isFileMetaKey(key) {
  return key.startsWith('__');
}

const LEGACY_TO_CANONICAL_PRODUCT_HANDLES = Object.freeze({
  'chemical-dosing-tank-bunded-50l': 'chemical-dosing-tank-50l',
  'chemical-dosing-tank-bunded-100l': 'chemical-dosing-tank-100l',
  'chemical-dosing-tank-bunded-200l': 'chemical-dosing-tank-200l',
});

function canonicalProductHandle(handle) {
  return LEGACY_TO_CANONICAL_PRODUCT_HANDLES[handle] || handle;
}

// This is the single catalogue merge order used by storefront product content,
// SEO redirect resolution and build-time Shopify integrity validation.
// Later layers intentionally win when the same handle appears more than once.
const rawCatalog = {
  ...productData,
  ...productOverrides,
  ...productAdditions,
  ...squareTankAdditions,
  ...dosingPackageAdditions,
  ...bundSeoOverrides,
};

const canonicalCatalog = { ...rawCatalog };
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
    Object.entries(productData)
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
  productCatalog,
  productPathForSlug,
};
