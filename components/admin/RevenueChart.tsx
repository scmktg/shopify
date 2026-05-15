import type { DashboardSalesPoint } from '@/lib/admin/queries';
import { formatCurrency, formatShortDate } from '@/lib/admin/format';

interface RevenueChartProps {
  series: ReadonlyArray<DashboardSalesPoint>;
  currencyCode: string;
}

/**
 * Pure SVG sparkline-style bar chart. Server-rendered, no client JS,
 * no chart library. Good enough for an at-a-glance trend view; if we
 * later need interactivity, swap in a dedicated chart lib.
 */
export function RevenueChart({ series, currencyCode }: RevenueChartProps) {
  const width = 720;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxRevenue = series.reduce((acc, point) => Math.max(acc, point.revenue), 0);
  const safeMax = maxRevenue === 0 ? 1 : maxRevenue;
  const barCount = series.length;
  const barGap = 2;
  const barWidth = barCount > 0 ? (chartWidth - barGap * (barCount - 1)) / barCount : 0;

  const tickIndices = pickTickIndices(barCount);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-black">Daily revenue</h2>
        <p className="text-xs text-gray-500">
          Peak day: {formatCurrency(maxRevenue, currencyCode)}
        </p>
      </div>
      {barCount === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No order data in this window.</p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-4 w-full"
          role="img"
          aria-label="Daily revenue chart"
        >
          {series.map((point, index) => {
            const barHeight = (point.revenue / safeMax) * chartHeight;
            const x = padding.left + index * (barWidth + barGap);
            const y = padding.top + (chartHeight - barHeight);
            return (
              <rect
                key={point.date}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#0066CC"
                rx={1}
              >
                <title>
                  {formatShortDate(point.date)}: {formatCurrency(point.revenue, currencyCode)} ({point.orders} orders)
                </title>
              </rect>
            );
          })}
          {tickIndices.map((index) => {
            const point = series[index];
            if (!point) return null;
            const x = padding.left + index * (barWidth + barGap) + barWidth / 2;
            return (
              <text
                key={`tick-${point.date}`}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-gray-500"
                fontSize={11}
              >
                {formatShortDate(point.date)}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}

function pickTickIndices(count: number): number[] {
  if (count === 0) return [];
  if (count <= 6) return Array.from({ length: count }, (_, i) => i);
  const indices = new Set<number>();
  const step = Math.floor(count / 5);
  for (let i = 0; i < count; i += step) indices.add(i);
  indices.add(count - 1);
  return Array.from(indices).sort((a, b) => a - b);
}
