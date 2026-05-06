/**
 * One-shot audit: lists every product where the title or description
 * mentions "WaterMark" but the enviroaqua.watermark_status metafield
 * is `not_required`. Surfaces data conflicts like the Big Blue
 * product (title says "WaterMark", metafield says "not_required" —
 * Bug 4 from the 2026-05 product-page bug sweep).
 *
 * Now also extended (post products.json refactor) to flag every
 * data/products.json entry where compliance.watermark.status is
 * `'certified'` but `licenceNumber` is null. That's the launch-
 * blocker hand-off check called out in clarification #11.
 *
 * Usage (from repo root with env vars in scope):
 *
 *   SHOPIFY_STORE_DOMAIN=... \
 *   SHOPIFY_STOREFRONT_PRIVATE_TOKEN=... \
 *   SHOPIFY_API_VERSION=2026-04 \
 *   npx tsx scripts/audit-watermark-status.ts
 *
 * Output: writes audit-watermark-mismatches.json next to the
 * working directory and prints a human-readable summary to stdout.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getAllProductHandles } from '@/lib/shopify/queries/getAllProductHandles';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import productData from '@/data/products.json';
import type { ProductContentMap } from '@/lib/products/schema';

interface Mismatch {
  handle: string;
  title: string;
  watermarkStatus: string | null;
  hint: string;
}

interface ContentMismatch {
  handle: string;
  hint: string;
}

const TEXT_RE = /\bwatermark\b/i;

function classify(
  status: string | null,
  mentionsInText: boolean,
): Mismatch['hint'] | null {
  if (mentionsInText && status === 'not_required') {
    return 'Mentions WaterMark in copy but metafield says not_required.';
  }
  if (mentionsInText && status === null) {
    return 'Mentions WaterMark in copy but no watermark_status metafield set.';
  }
  if (mentionsInText && status === 'not_certified') {
    return 'Copy says WaterMark but metafield says not_certified — verify which is correct.';
  }
  return null;
}

async function main(): Promise<void> {
  const handles = await getAllProductHandles();
  console.log(`[audit] Scanning ${handles.length} products...`);

  const mismatches: Mismatch[] = [];
  let scanned = 0;
  for (const { handle } of handles) {
    scanned += 1;
    if (scanned % 25 === 0) {
      console.log(`[audit] Scanned ${scanned}/${handles.length}...`);
    }
    const product = await getProductByHandle(handle);
    if (!product) continue;
    const text = `${product.title} ${product.description}`;
    const mentions = TEXT_RE.test(text);
    const status = product.metafields.watermark_status;
    const hint = classify(status, mentions);
    if (hint) {
      mismatches.push({
        handle,
        title: product.title,
        watermarkStatus: status,
        hint,
      });
    }
  }

  // Pass 2 — products.json launch-blocker check.
  const contentMismatches = auditProductContent(
    productData as unknown as ProductContentMap,
  );

  const outputPath = path.resolve(
    process.cwd(),
    'audit-watermark-mismatches.json',
  );
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      { shopify: mismatches, productsJson: contentMismatches },
      null,
      2,
    ),
  );

  console.log('');
  console.log(`[audit] Shopify mismatches: ${mismatches.length}`);
  console.log(`[audit] products.json mismatches: ${contentMismatches.length}`);
  console.log(`[audit] Written to ${outputPath}`);
  for (const m of mismatches) {
    console.log(`  - ${m.handle}`);
    console.log(`      title:  ${m.title}`);
    console.log(`      status: ${m.watermarkStatus ?? '(unset)'}`);
    console.log(`      hint:   ${m.hint}`);
  }
  for (const m of contentMismatches) {
    console.log(`  - ${m.handle}`);
    console.log(`      hint:   ${m.hint}`);
  }
}

/**
 * Launch-blocker check: any products.json entry with
 * compliance.watermark.status === 'certified' must carry a non-null
 * licenceNumber. The synchronous validator already enforces this at
 * build time; auditing here surfaces it alongside the Shopify
 * mismatches in a single human-readable report.
 */
function auditProductContent(
  map: ProductContentMap,
): ReadonlyArray<ContentMismatch> {
  const out: ContentMismatch[] = [];
  for (const [handle, content] of Object.entries(map)) {
    const wm = content.compliance?.watermark;
    if (!wm) continue;
    if (wm.status === 'certified' && !wm.licenceNumber) {
      out.push({
        handle,
        hint: `compliance.watermark.status='certified' but licenceNumber is null. Add the licence number from the WaterMark certificate before launch, or change status to 'pending'.`,
      });
    }
  }
  return out;
}

main().catch((error: unknown) => {
  console.error('[audit] Failed:', error);
  process.exit(1);
});
