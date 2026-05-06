/**
 * Build-time validator for `data/products.json`.
 *
 * The CLI script `scripts/validate-products.ts` runs this and exits
 * non-zero on any error. The same module is wired into `prebuild`
 * via `package.json` so a malformed entry fails the production
 * build rather than crashing in front of a customer.
 *
 * Two passes:
 *   1. `validateProducts()` — synchronous, pure. Checks the JSON
 *      shape, the cross-references between handles (boughtTogether,
 *      explicit moreInCategory), and the [category, subcategory]
 *      tuple against `content/categories.ts`. Always runs.
 *   2. `validateAgainstShopify()` — async, optional. Calls the
 *      Shopify Storefront API to confirm every handle in
 *      `products.json` resolves to a real product, and that every
 *      Shopify product has a corresponding products.json entry.
 *      Skipped when SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_*
 *      env vars are absent.
 */

import { findSubcategory } from '@/content/categories';
import type {
  ProductCompliance,
  ProductContent,
  ProductContentMap,
  ProductCtas,
  ProductSeoOverrides,
  ProductUpsells,
  SpecRow,
  WatermarkInfo,
  WatermarkStatus,
} from './schema';
import { HEADLINE_SPECS_LIMIT } from './schema';

export interface ValidationError {
  /** Product handle the error applies to, or `'(root)'` for top-level issues. */
  handle: string;
  /** Dotted path inside the entry, e.g. `categories[1]` or `compliance.watermark.licenceNumber`. */
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ReadonlyArray<ValidationError>;
}

const VALID_WATERMARK_STATUS: ReadonlySet<WatermarkStatus> = new Set<WatermarkStatus>([
  'certified',
  'pending',
  'not_required',
  'not_certified',
]);

export function validateProducts(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    errors.push({
      handle: '(root)',
      path: '(root)',
      message: 'products.json must be an object keyed by product handle.',
    });
    return { ok: false, errors };
  }

  const map = input as Record<string, unknown>;
  // Top-level keys prefixed with `__` are file metadata (e.g.
  // `__placeholders`), not product entries. Skip them entirely —
  // shape, cross-reference, and cross-Shopify checks all ignore them.
  const handles = Object.keys(map).filter((k) => !isFileMetaKey(k));

  for (const handle of handles) {
    const entry = map[handle];
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      errors.push({
        handle,
        path: '(root)',
        message: 'Entry must be an object.',
      });
      continue;
    }
    validateEntry(handle, entry as Record<string, unknown>, errors);
  }

  // Cross-handle pass — only run when the per-entry shape passed for
  // the handles we'd be referencing.
  for (const handle of handles) {
    const entry = map[handle];
    if (typeof entry !== 'object' || entry === null) continue;
    validateCrossReferences(
      handle,
      entry as { upsells?: unknown },
      handles,
      errors,
    );
  }

  return { ok: errors.length === 0, errors };
}

export function isFileMetaKey(key: string): boolean {
  return key.startsWith('__');
}

function validateEntry(
  handle: string,
  entry: Record<string, unknown>,
  errors: ValidationError[],
): void {
  const push = (path: string, message: string): void => {
    errors.push({ handle, path, message });
  };

  // categories — required, exactly 2 strings, both must resolve.
  const categories = entry['categories'];
  if (!Array.isArray(categories) || categories.length !== 2) {
    push(
      'categories',
      'Required. Must be a 2-element tuple [primaryCategory, subcategory].',
    );
  } else if (
    typeof categories[0] !== 'string' ||
    typeof categories[1] !== 'string'
  ) {
    push('categories', 'Both slots must be strings.');
  } else {
    const [cat, sub] = categories as [string, string];
    if (!findSubcategory(cat, sub)) {
      push(
        'categories',
        `Pair ['${cat}', '${sub}'] is not in content/categories.ts. Add the slugs to the category tree first, or fix the typo.`,
      );
    }
  }

  validateOptionalString(entry, 'shortDescription', push);
  validateOptionalString(entry, 'description', push);
  validateOptionalStringArray(entry, 'tags', push);
  validateOptionalStringArray(entry, 'features', push);
  validateOptionalStringArray(entry, 'recommendedFor', push);

  if ('headlineSpecs' in entry) {
    validateSpecRows(entry['headlineSpecs'], 'headlineSpecs', push);
    if (
      Array.isArray(entry['headlineSpecs']) &&
      entry['headlineSpecs'].length > HEADLINE_SPECS_LIMIT
    ) {
      push(
        'headlineSpecs',
        `Capped at ${HEADLINE_SPECS_LIMIT} — got ${entry['headlineSpecs'].length}. The renderer will drop the extras; trim the JSON to silence this warning.`,
      );
    }
  }
  if ('fullSpecs' in entry) {
    validateSpecRows(entry['fullSpecs'], 'fullSpecs', push);
  }

  if ('compliance' in entry) {
    validateCompliance(entry['compliance'] as ProductCompliance, push);
  }
  if ('ctas' in entry) {
    validateCtas(entry['ctas'] as ProductCtas, push);
  }
  if ('upsells' in entry) {
    validateUpsells(entry['upsells'] as ProductUpsells, push);
  }
  if ('seo' in entry) {
    validateSeo(entry['seo'] as ProductSeoOverrides, push);
  }
}

function validateOptionalString(
  entry: Record<string, unknown>,
  key: string,
  push: (path: string, message: string) => void,
): void {
  if (!(key in entry)) return;
  if (typeof entry[key] !== 'string') {
    push(key, `Must be a string when present.`);
  }
}

function validateOptionalStringArray(
  entry: Record<string, unknown>,
  key: string,
  push: (path: string, message: string) => void,
): void {
  if (!(key in entry)) return;
  const value = entry[key];
  if (!Array.isArray(value)) {
    push(key, 'Must be an array of strings when present.');
    return;
  }
  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      push(`${key}[${index}]`, 'Must be a string.');
    }
  });
}

function validateSpecRows(
  value: unknown,
  key: string,
  push: (path: string, message: string) => void,
): void {
  if (!Array.isArray(value)) {
    push(key, 'Must be an array of {label, value} objects when present.');
    return;
  }
  value.forEach((row, index) => {
    if (typeof row !== 'object' || row === null) {
      push(`${key}[${index}]`, 'Must be an object.');
      return;
    }
    const r = row as Partial<SpecRow>;
    if (typeof r.label !== 'string' || !r.label.trim()) {
      push(`${key}[${index}].label`, 'Must be a non-empty string.');
    }
    if (typeof r.value !== 'string' || !r.value.trim()) {
      push(`${key}[${index}].value`, 'Must be a non-empty string.');
    }
  });
}

function validateCompliance(
  value: unknown,
  push: (path: string, message: string) => void,
): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    push('compliance', 'Must be an object when present.');
    return;
  }
  const compliance = value as Record<string, unknown>;

  if ('watermark' in compliance && compliance['watermark'] !== null) {
    validateWatermark(compliance['watermark'] as WatermarkInfo, push);
  }
  if ('wels' in compliance && compliance['wels'] !== null) {
    push(
      'compliance.wels',
      'Reserved for future use — must be null today (the WELS shape will be widened when rendering lands).',
    );
  }
  if (
    'note' in compliance &&
    compliance['note'] !== null &&
    typeof compliance['note'] !== 'string'
  ) {
    push('compliance.note', 'Must be a string or null.');
  }
}

function validateWatermark(
  value: unknown,
  push: (path: string, message: string) => void,
): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    push('compliance.watermark', 'Must be an object or null.');
    return;
  }
  const wm = value as Record<string, unknown>;

  const status = wm['status'];
  if (typeof status !== 'string' || !VALID_WATERMARK_STATUS.has(status as WatermarkStatus)) {
    push(
      'compliance.watermark.status',
      `Must be one of: 'certified', 'pending', 'not_required', 'not_certified'.`,
    );
  }

  for (const field of ['licenceNumber', 'certifier', 'validUntil'] as const) {
    if (field in wm && wm[field] !== null && typeof wm[field] !== 'string') {
      push(
        `compliance.watermark.${field}`,
        'Must be a string or null.',
      );
    }
  }

  if (
    typeof wm['validUntil'] === 'string' &&
    !/^\d{4}-\d{2}-\d{2}$/.test(wm['validUntil'])
  ) {
    push(
      'compliance.watermark.validUntil',
      `Must be ISO date 'YYYY-MM-DD'.`,
    );
  }

  // Launch-blocker: certified + null licence is the hand-off check
  // called out in the brief (clarification #11).
  if (status === 'certified' && wm['licenceNumber'] == null) {
    push(
      'compliance.watermark.licenceNumber',
      `Required when status is 'certified'. Add the licence number from the WaterMark certificate or change status to 'pending' until it lands.`,
    );
  }
}

function validateCtas(
  value: unknown,
  push: (path: string, message: string) => void,
): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    push('ctas', 'Must be an object when present.');
    return;
  }
  const ctas = value as Record<string, unknown>;
  for (const field of ['primary', 'secondary'] as const) {
    if (field in ctas && ctas[field] !== null && typeof ctas[field] !== 'string') {
      push(`ctas.${field}`, 'Must be a string or null.');
    }
  }
}

function validateUpsells(
  value: unknown,
  push: (path: string, message: string) => void,
): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    push('upsells', 'Must be an object when present.');
    return;
  }
  const upsells = value as Record<string, unknown>;

  if ('boughtTogether' in upsells) {
    const arr = upsells['boughtTogether'];
    if (!Array.isArray(arr)) {
      push('upsells.boughtTogether', 'Must be an array of handles.');
    } else {
      arr.forEach((h, i) => {
        if (typeof h !== 'string' || !h.trim()) {
          push(`upsells.boughtTogether[${i}]`, 'Must be a non-empty handle string.');
        }
      });
    }
  }

  if ('moreInCategory' in upsells) {
    const more = upsells['moreInCategory'];
    if (more === 'auto') {
      // ok
    } else if (Array.isArray(more)) {
      more.forEach((h, i) => {
        if (typeof h !== 'string' || !h.trim()) {
          push(`upsells.moreInCategory[${i}]`, 'Must be a non-empty handle string.');
        }
      });
    } else {
      push(
        'upsells.moreInCategory',
        `Must be the string 'auto' or an array of handles.`,
      );
    }
  }
}

function validateSeo(
  value: unknown,
  push: (path: string, message: string) => void,
): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    push('seo', 'Must be an object when present.');
    return;
  }
  const seo = value as Record<string, unknown>;
  for (const field of ['title', 'description'] as const) {
    if (field in seo && typeof seo[field] !== 'string') {
      push(`seo.${field}`, 'Must be a string when present.');
    }
  }
  if (
    'ogImage' in seo &&
    seo['ogImage'] !== null &&
    typeof seo['ogImage'] !== 'string'
  ) {
    push('seo.ogImage', 'Must be a string URL or null.');
  }
}

function validateCrossReferences(
  handle: string,
  entry: { upsells?: unknown },
  knownHandles: ReadonlyArray<string>,
  errors: ValidationError[],
): void {
  const known = new Set(knownHandles);
  const upsells = entry.upsells;
  if (typeof upsells !== 'object' || upsells === null) return;
  const u = upsells as Record<string, unknown>;

  if (Array.isArray(u['boughtTogether'])) {
    u['boughtTogether'].forEach((h, i) => {
      if (typeof h !== 'string') return;
      if (h === handle) {
        errors.push({
          handle,
          path: `upsells.boughtTogether[${i}]`,
          message: 'A product cannot recommend itself.',
        });
      } else if (!known.has(h)) {
        errors.push({
          handle,
          path: `upsells.boughtTogether[${i}]`,
          message: `Unknown handle '${h}' — no entry in products.json.`,
        });
      }
    });
  }

  if (Array.isArray(u['moreInCategory'])) {
    u['moreInCategory'].forEach((h, i) => {
      if (typeof h !== 'string') return;
      if (h === handle) {
        errors.push({
          handle,
          path: `upsells.moreInCategory[${i}]`,
          message: 'A product cannot recommend itself.',
        });
      } else if (!known.has(h)) {
        errors.push({
          handle,
          path: `upsells.moreInCategory[${i}]`,
          message: `Unknown handle '${h}' — no entry in products.json.`,
        });
      }
    });
  }
}

/**
 * Async cross-Shopify check. Confirms every handle in
 * `products.json` resolves to a Shopify product, and every Shopify
 * handle has a corresponding `products.json` entry.
 *
 * Skipped when Shopify env vars are absent — the CLI prints a
 * notice in that case so it's obvious nothing was checked.
 *
 * Handles prefixed with `_` are treated as schema scaffolding
 * (e.g. `_seed-minimal-example`) and excluded from the bidirectional
 * comparison. They still go through the synchronous shape validator.
 */
export interface ShopifyCheckResult {
  ok: boolean;
  /** Handles in products.json that don't exist in Shopify. */
  missingInShopify: ReadonlyArray<string>;
  /** Handles in Shopify that don't have a products.json entry. */
  missingInProducts: ReadonlyArray<string>;
}

export function isScaffoldingHandle(handle: string): boolean {
  return handle.startsWith('_');
}

export async function validateAgainstShopify(
  contentMap: ProductContentMap,
  fetchShopifyHandles: () => Promise<ReadonlyArray<string>>,
): Promise<ShopifyCheckResult> {
  const shopifyHandles = await fetchShopifyHandles();
  const shopifySet = new Set(shopifyHandles);
  const contentHandles = Object.keys(contentMap).filter(
    (h) => !isScaffoldingHandle(h) && !isFileMetaKey(h),
  );
  const contentSet = new Set(contentHandles);

  const missingInShopify = contentHandles.filter((h) => !shopifySet.has(h));
  const missingInProducts = [...shopifySet].filter((h) => !contentSet.has(h));

  return {
    ok: missingInShopify.length === 0 && missingInProducts.length === 0,
    missingInShopify,
    missingInProducts,
  };
}
