import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/admin/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { StatCard } from '@/components/admin/StatCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { TopProducts } from '@/components/admin/TopProducts';
import { InventoryAlerts } from '@/components/admin/InventoryAlerts';
import {
  getInventoryAlerts,
  getRecentOrders,
  getSalesSummary,
  getShopInfo,
  getTopProducts,
} from '@/lib/admin/queries';
import {
  formatCurrency,
  formatNumber,
  formatPercentChange,
} from '@/lib/admin/format';
import { AdminApiConfigError } from '@/lib/admin/shopify-admin-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WINDOW_DAYS = 30;
const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  if (!(await hasValidSession())) {
    redirect('/admin/login');
  }

  let payload:
    | {
        shop: Awaited<ReturnType<typeof getShopInfo>>;
        sales: Awaited<ReturnType<typeof getSalesSummary>>;
        recentOrders: Awaited<ReturnType<typeof getRecentOrders>>;
        topProducts: Awaited<ReturnType<typeof getTopProducts>>;
        alerts: Awaited<ReturnType<typeof getInventoryAlerts>>;
      }
    | null = null;
  let loadError: string | null = null;

  try {
    const [shop, sales, recentOrders, topProducts, alerts] = await Promise.all([
      getShopInfo(),
      getSalesSummary(WINDOW_DAYS),
      getRecentOrders(10),
      getTopProducts(WINDOW_DAYS, 5),
      getInventoryAlerts(LOW_STOCK_THRESHOLD, 10),
    ]);
    payload = { shop, sales, recentOrders, topProducts, alerts };
  } catch (err) {
    if (err instanceof AdminApiConfigError) {
      loadError = err.message;
    } else {
      loadError =
        err instanceof Error
          ? `Could not load Shopify data: ${err.message}`
          : 'Could not load Shopify data.';
    }
  }

  if (!payload) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-900">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-red-800">{loadError}</p>
          <p className="mt-3 text-sm text-red-800">
            Set <code className="rounded bg-white px-1">SHOPIFY_ADMIN_TOKEN</code> and the related
            Shopify env vars, then reload.
          </p>
        </div>
      </AdminShell>
    );
  }

  const { shop, sales, recentOrders, topProducts, alerts } = payload;
  const revenueChange = formatPercentChange(sales.totalRevenue, sales.previousWindowRevenue);
  const orderChange = formatPercentChange(sales.orderCount, sales.previousWindowOrderCount);

  return (
    <AdminShell shopName={shop.name}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Last {WINDOW_DAYS} days · {shop.currencyCode}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(sales.totalRevenue, sales.currencyCode)}
          change={revenueChange}
          changeContext="vs previous period"
        />
        <StatCard
          label="Orders"
          value={formatNumber(sales.orderCount)}
          change={orderChange}
          changeContext="vs previous period"
        />
        <StatCard
          label="Average order value"
          value={formatCurrency(sales.averageOrderValue, sales.currencyCode)}
          sublabel={`Across ${formatNumber(sales.orderCount)} orders`}
        />
        <StatCard
          label="Low stock variants"
          value={formatNumber(alerts.length)}
          sublabel={`≤ ${LOW_STOCK_THRESHOLD} units on hand`}
        />
      </div>

      <div className="mt-6">
        <RevenueChart series={sales.series} currencyCode={sales.currencyCode} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders} shopAdminUrl={shop.primaryDomainUrl} />
        </div>
        <div className="space-y-6">
          <TopProducts products={topProducts} windowDays={WINDOW_DAYS} />
          <InventoryAlerts alerts={alerts} threshold={LOW_STOCK_THRESHOLD} />
        </div>
      </div>
    </AdminShell>
  );
}
