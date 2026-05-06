import Link from 'next/link';
import clsx from 'clsx';
import { Phone, Store, Truck } from 'lucide-react';
import {
  PHONE_DISPLAY,
  PHONE_SUPPORT_HOURS,
  PHONE_TEL,
  SHIPPING_FREE_THRESHOLD_AUD,
  SHOWROOM_LOCALITY,
} from '@/lib/site-config';
import { DispatchCountdown } from './DispatchCountdown';
import { BackInStockNotify } from './BackInStockNotify';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface ProductTrustBlockProps {
  productId: string;
  sku: string | null;
  stockStatus: StockStatus;
  stockCount?: number;
}

export function ProductTrustBlock({
  productId,
  sku,
  stockStatus,
  stockCount,
}: ProductTrustBlockProps) {
  const inStock = stockStatus !== 'out_of_stock';

  return (
    <section
      aria-label="Availability and shipping"
      className="mt-6 flex flex-col gap-2.5 text-sm text-black font-medium"
    >
      <StockLine stockStatus={stockStatus} stockCount={stockCount} />

      {!inStock && (
        <BackInStockNotify productId={productId} sku={sku} />
      )}

      {inStock && (
        <p className="flex items-start gap-2">
          <Truck
            className="h-4 w-4 mt-0.5 flex-shrink-0 text-black/70"
            aria-hidden="true"
          />
          <span>
            <DispatchCountdown />
          </span>
        </p>
      )}

      <p className="flex items-start gap-2">
        <Truck
          className="h-4 w-4 mt-0.5 flex-shrink-0 text-black/70"
          aria-hidden="true"
        />
        <span>
          Tracked Australia-wide{' '}
          <Link
            href="/shipping/"
            className="underline underline-offset-4 hover:text-brand-blue"
          >
            shipping
          </Link>{' '}
          · free over ${SHIPPING_FREE_THRESHOLD_AUD}
        </span>
      </p>

      {inStock && (
        <p className="flex items-start gap-2">
          <Store
            className="h-4 w-4 mt-0.5 flex-shrink-0 text-black/70"
            aria-hidden="true"
          />
          <span>
            Free Click &amp; Collect from our{' '}
            <Link
              href="/showroom/"
              className="underline underline-offset-4 hover:text-brand-blue"
            >
              {SHOWROOM_LOCALITY.split(',')[0]} showroom
            </Link>
            {' '}— usually ready in 2 hours
          </span>
        </p>
      )}

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
          {PHONE_SUPPORT_HOURS}
        </span>
      </p>
    </section>
  );
}

interface StockLineProps {
  stockStatus: StockStatus;
  stockCount?: number;
}

function StockLine({ stockStatus, stockCount }: StockLineProps) {
  const dotClass = clsx(
    'inline-block h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0',
    stockStatus === 'in_stock' && 'bg-green-600',
    stockStatus === 'low_stock' && 'bg-amber-500',
    stockStatus === 'out_of_stock' && 'bg-gray-400',
  );

  const srLabel =
    stockStatus === 'in_stock'
      ? 'In stock'
      : stockStatus === 'low_stock'
        ? 'Low stock'
        : 'Out of stock';

  let body: React.ReactNode;
  if (stockStatus === 'in_stock') {
    body = (
      <>
        In stock · ships from {SHOWROOM_LOCALITY}
      </>
    );
  } else if (stockStatus === 'low_stock') {
    const n = stockCount ?? 0;
    body = <>Only {n} left in stock</>;
  } else {
    body = <>Currently out of stock</>;
  }

  return (
    <p className="flex items-start gap-2">
      <span className={dotClass} aria-hidden="true" />
      <span className="sr-only">{srLabel}.</span>
      <span>{body}</span>
    </p>
  );
}
