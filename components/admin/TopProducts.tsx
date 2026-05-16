import type { DashboardTopProduct } from '@/lib/admin/queries';
import { formatCurrency, formatNumber } from '@/lib/admin/format';

interface TopProductsProps {
  products: ReadonlyArray<DashboardTopProduct>;
  windowDays: number;
}

export function TopProducts({ products, windowDays }: TopProductsProps) {
  const maxRevenue = products.reduce((acc, p) => Math.max(acc, p.revenue), 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-black">Top products</h2>
        <p className="text-xs text-gray-500">By revenue, last {windowDays} days</p>
      </div>
      {products.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-500">Not enough order data yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {products.map((product) => {
            const pct = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
            return (
              <li key={product.productId} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-sm font-medium text-black">{product.title}</p>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-black">
                    {formatCurrency(product.revenue, product.currencyCode)}
                  </p>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-1.5 w-full rounded bg-gray-100">
                      <div
                        className="h-1.5 rounded bg-brand-blue"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="shrink-0 text-xs tabular-nums text-gray-500">
                    {formatNumber(product.unitsSold)} sold
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
