import type { DashboardInventoryAlert } from '@/lib/admin/queries';
import { AlertTriangle } from 'lucide-react';

interface InventoryAlertsProps {
  alerts: ReadonlyArray<DashboardInventoryAlert>;
  threshold: number;
}

export function InventoryAlerts({ alerts, threshold }: InventoryAlertsProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-semibold text-black">Low stock</h2>
        <p className="text-xs text-gray-500">Variants with ≤ {threshold} units on hand</p>
      </div>
      {alerts.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-500">All variants above threshold.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <li key={alert.variantId} className="flex items-center gap-3 px-5 py-3">
              <AlertTriangle
                className={`h-4 w-4 shrink-0 ${alert.quantity <= 0 ? 'text-red-600' : 'text-amber-600'}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-black">{alert.productTitle}</p>
                <p className="truncate text-xs text-gray-500">
                  {alert.variantTitle ? `${alert.variantTitle} · ` : ''}
                  {alert.sku ?? 'No SKU'}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold tabular-nums ${
                  alert.quantity <= 0 ? 'text-red-700' : 'text-amber-700'
                }`}
              >
                {alert.quantity}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
