import type { DashboardOrderSummary } from '@/lib/admin/queries';
import { formatCurrency, formatRelativeDate } from '@/lib/admin/format';

interface RecentOrdersProps {
  orders: ReadonlyArray<DashboardOrderSummary>;
  shopAdminUrl: string;
}

export function RecentOrders({ orders, shopAdminUrl }: RecentOrdersProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-black">Recent orders</h2>
        <a
          href={`${shopAdminUrl}/admin/orders`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-brand-blue hover:text-brand-blue-hover"
        >
          View all in Shopify →
        </a>
      </div>
      {orders.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-500">No orders yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-2 font-medium">Order</th>
              <th className="px-5 py-2 font-medium">Customer</th>
              <th className="px-5 py-2 font-medium">Placed</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100">
                <td className="px-5 py-3 font-medium text-black">{order.name}</td>
                <td className="px-5 py-3 text-gray-700">
                  {order.customer ?? <span className="text-gray-400">Guest</span>}
                </td>
                <td className="px-5 py-3 text-gray-700 tabular-nums">
                  {formatRelativeDate(order.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <OrderStatusPills
                    financial={order.displayFinancialStatus}
                    fulfilment={order.displayFulfillmentStatus}
                  />
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-black">
                  {formatCurrency(
                    Number.parseFloat(order.total.amount),
                    order.total.currencyCode,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrderStatusPills({
  financial,
  fulfilment,
}: {
  financial: string | null;
  fulfilment: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {financial ? <Pill tone={pillTone(financial)}>{prettify(financial)}</Pill> : null}
      {fulfilment ? <Pill tone={pillTone(fulfilment)}>{prettify(fulfilment)}</Pill> : null}
    </div>
  );
}

function Pill({ tone, children }: { tone: 'green' | 'amber' | 'gray'; children: React.ReactNode }) {
  const palette =
    tone === 'green'
      ? 'bg-green-50 text-green-800 border-green-200'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-[11px] font-medium ${palette}`}>
      {children}
    </span>
  );
}

function pillTone(status: string): 'green' | 'amber' | 'gray' {
  const upper = status.toUpperCase();
  if (upper === 'PAID' || upper === 'FULFILLED') return 'green';
  if (upper === 'PENDING' || upper === 'PARTIALLY_PAID' || upper === 'PARTIALLY_FULFILLED' || upper === 'UNFULFILLED') return 'amber';
  return 'gray';
}

function prettify(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
