import type { Money } from '@/types/product';

interface PriceDisplayProps {
  money: Money;
  className?: string;
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

export function PriceDisplay({ money, className }: PriceDisplayProps) {
  const amount = Number.parseFloat(money.amount);
  const formatted = Number.isFinite(amount)
    ? formatterFor(money.currencyCode).format(amount)
    : money.amount;
  return (
    <span className={`tabular-nums ${className ?? ''}`}>
      {formatted} {money.currencyCode}
    </span>
  );
}
