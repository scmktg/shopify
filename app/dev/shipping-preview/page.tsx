import type { Metadata } from 'next';
import { ShippingTierBlock } from '@/components/product/ShippingTierBlock';
import type { ShippingTier } from '@/types/product';

export const metadata: Metadata = {
  title: 'Shipping tier preview (dev)',
  robots: { index: false, follow: false },
};

const TIERS: ReadonlyArray<ShippingTier> = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ShippingPreviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-black/60">
          Dev preview
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-black">
          Shipping tier copy blocks (T1&ndash;T7)
        </h1>
        <p className="mt-3 text-sm text-black/70">
          One block per tier, exactly as rendered on a PDP. This page is
          excluded from robots.txt and is removed before launch.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {TIERS.map((tier) => (
          <section key={tier}>
            <h2 className="text-lg font-semibold text-black">
              {tier} preview
            </h2>
            <ShippingTierBlock tier={tier} productHandle={`dev-${tier}`} />
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold text-black">
            Fallback preview (no tier set)
          </h2>
          <p className="text-sm text-black/70 mb-2">
            Renders T2 copy with a non-production console warning.
          </p>
          <ShippingTierBlock tier={null} productHandle="dev-null" />
        </section>
      </div>
    </main>
  );
}
