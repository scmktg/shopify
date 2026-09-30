import type { Metadata } from 'next';
import { getAllProductContent } from '@/lib/products/getProductContent';
import { validateShopifyCategoryTags } from '@/lib/products/shopifyCategoryValidator';
import { getAllProductHandles } from '@/lib/shopify/queries/getAllProductHandles';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SEO Category Integrity',
  robots: { index: false, follow: false },
};

export default async function SeoCategoryIntegrityPage() {
  const shopifyProducts = await getAllProductHandles();
  const mismatches = validateShopifyCategoryTags(
    getAllProductContent(),
    shopifyProducts,
  );

  return (
    <main style={{ padding: 24, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h1>SEO Category Integrity</h1>
      <p>Checked: {shopifyProducts.length}</p>
      <p>Mismatch count: {mismatches.length}</p>
      {mismatches.map((mismatch) => (
        <section key={mismatch.handle} style={{ marginBottom: 24 }}>
          <h2>{mismatch.handle}</h2>
          <p>
            Expected: primary-cat:{mismatch.expectedPrimary} | sub-cat:{mismatch.expectedSubcategory}
          </p>
          <p>
            Actual primary: {mismatch.primaryTags.length ? mismatch.primaryTags.join(', ') : '(none)'}
          </p>
          <p>
            Actual subcategories: {mismatch.subcategoryTags.length ? mismatch.subcategoryTags.join(', ') : '(none)'}
          </p>
          <p>Issues: {mismatch.issues.join(' | ')}</p>
        </section>
      ))}
    </main>
  );
}
