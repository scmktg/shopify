import type { Money } from '@/types/product';

const ZIP_MERCHANT_PUBLIC_KEY = 'bb5be3cd-da3b-4a78-8e40-6a979eb021a0';

interface ZipMessagingProps {
  money: Money;
  className?: string;
}

export function ZipMessaging({ money, className = '' }: ZipMessagingProps) {
  const amount = Number.parseFloat(money.amount);

  if (!Number.isFinite(amount) || amount <= 0 || money.currencyCode !== 'AUD') {
    return null;
  }

  return (
    <div
      key={money.amount}
      className={className}
      style={{ cursor: 'pointer' }}
      data-zm-widget="popup"
      data-zm-region="au"
      data-env="production"
      data-zm-merchant={ZIP_MERCHANT_PUBLIC_KEY}
      data-zm-price={amount.toFixed(2)}
      data-zm-asset="productwidget"
      data-zm-popup-asset="termsdialog"
    />
  );
}
