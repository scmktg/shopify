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
      useGrouping: false,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

export function PriceDisplay({ money, className, hideWholeDollarCents = false }: PriceDisplayProps) {
  const amount = Number.parseFloat(money.amount);
  const formatted = Number.isFinite(amount)
    ? (hideWholeDollarCents && Number.isInteger(amount)
        ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: money.currencyCode, useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
        : formatterFor(money.currencyCode).format(amount))
    : money.amount;
  const symbolPosition = formatted.indexOf('$');
  return (
    <span className={`tabular-nums ${className ?? ''}`}>
      {symbolPosition >= 0 ? (
        <>
          {formatted.slice(0, symbolPosition)}
          <span className="relative -top-[0.35em] mr-[0.08em] align-baseline text-[0.6em] font-normal text-gray-500">$</span>
          {formatted.slice(symbolPosition + 1)}
        </>
      ) : formatted}
    </span>
  );
}
