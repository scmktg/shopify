import { NextResponse } from 'next/server';
import { getAllProductContent } from '@/lib/products/getProductContent';
import { validateShopifyCategoryTags } from '@/lib/products/shopifyCategoryValidator';
import { getAllProductHandles } from '@/lib/shopify/queries/getAllProductHandles';

export const dynamic = 'force-dynamic';

/**
 * Temporary P1 migration diagnostic. Returns only product handles and category
 * tags so the Shopify catalogue can be aligned to the canonical storefront
 * taxonomy. Remove once the mismatch list reaches zero and CI is blocking.
 */
export async function GET() {
  const shopifyProducts = await getAllProductHandles();
  const mismatches = validateShopifyCategoryTags(
    getAllProductContent(),
    shopifyProducts,
  );

  return NextResponse.json({
    checked: shopifyProducts.length,
    mismatchCount: mismatches.length,
    mismatches,
  });
}
