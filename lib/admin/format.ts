const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currencyCode = 'AUD'): string {
  let formatter = currencyFormatters.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    });
    currencyFormatters.set(currencyCode, formatter);
  }
  return formatter.format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AU').format(value);
}

export function formatPercentChange(current: number, previous: number): {
  text: string;
  direction: 'up' | 'down' | 'flat';
} {
  if (previous === 0) {
    if (current === 0) return { text: 'No change', direction: 'flat' };
    return { text: 'New', direction: 'up' };
  }
  const ratio = (current - previous) / previous;
  const pct = ratio * 100;
  if (Math.abs(pct) < 0.5) return { text: '0%', direction: 'flat' };
  const direction: 'up' | 'down' = pct > 0 ? 'up' : 'down';
  const sign = pct > 0 ? '+' : '';
  return { text: `${sign}${pct.toFixed(1)}%`, direction };
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
