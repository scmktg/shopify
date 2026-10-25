import type { Money } from '@/types/product';

interface PriceDisplayProps {
  money: Money;
  className?: string;
  hideWholeDollarCents?: boolean;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

export function PriceDisplay({ money, className, hideWholeDollarCents = false }: PriceDisplayProps) {
  const amount = Number.parseFloat(money.amount);
  const formatted = Number.isFinite(amount)
    ? (hideWholeDollarCents && Number.isInteger(amount)
        ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: money.currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
        : formatterFor(money.currencyCode).format(amount))
    : money.amount;
  return (
    <span className={`tabular-nums ${className ?? ''}`}>
      {formatted} {money.currencyCode}
    </span>
  );
}
