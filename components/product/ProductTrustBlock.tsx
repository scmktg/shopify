import Link from 'next/link';
import { Phone, RefreshCcw } from 'lucide-react';
import {
  PHONE_DISPLAY,
  PHONE_SUPPORT_HOURS,
  PHONE_TEL,
} from '@/lib/site-config';
import { BackInStockNotify } from './BackInStockNotify';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface ProductTrustBlockProps {
  productId: string;
  sku: string | null;
  stockStatus: StockStatus;
  stockCount?: number;
  className?: string;
}

export function ProductTrustBlock({
  productId,
  sku,
  stockStatus,
  stockCount,
  className = '',
}: ProductTrustBlockProps) {
  const inStock = stockStatus !== 'out_of_stock';

  return (
    <section
      aria-label="Availability and shipping"
      className={`mt-6 flex flex-col gap-2.5 text-sm text-black font-medium ${className}`}
    >
      {!inStock && (
        <BackInStockNotify productId={productId} sku={sku} />
      )}

      <p className="flex items-start gap-2">
        <RefreshCcw
          className="h-4 w-4 mt-0.5 flex-shrink-0 text-black/70"
          aria-hidden="true"
        />
        <span>
          12 month warranty on all units -{' '}
          <Link
            href="/returns/#warranty"
            className="underline underline-offset-4 hover:text-brand-blue"
          >
            warranty policy
          </Link>
        </span>
      </p>

      <p className="flex items-start gap-2">
        <Phone
          className="h-4 w-4 mt-0.5 flex-shrink-0 text-black/70"
          aria-hidden="true"
        />
        <span>
          Questions? Call{' '}
          <a
            href={`tel:${PHONE_TEL}`}
            className="font-semibold hover:text-brand-blue"
          >
            {PHONE_DISPLAY}
          </a>{' '}
          {PHONE_SUPPORT_HOURS.replace(/\s*·\s*Closed weekends\s*$/i, '')}
        </span>
      </p>
    </section>
  );
}

