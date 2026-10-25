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
  return (
    <span className={`tabular-nums ${className ?? ''}`}>
      {formatted.includes('    </span>
  );
}
) ? (
        <>
          {formatted.slice(0, formatted.indexOf('    </span>
  );
}
))}
          <span className="text-[0.75em]">$</span>
          {formatted.slice(formatted.indexOf('    </span>
  );
}
) + 1)}
        </>
      ) : formatted}
    </span>
  );
}
