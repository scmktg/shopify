import Link from 'next/link';

interface ZipPaymentBadgeProps {
  className?: string;
  location?: 'header' | 'footer';
}

const ZIP_PAYMENT_BADGE_URL =
  'https://static.zip.co/developers/assets/default/footer-tile/footer-tile-new.png';

export function ZipPaymentBadge({
  className = '',
  location = 'footer',
}: ZipPaymentBadgeProps) {
  const isHeader = location === 'header';

  return (
    <Link
      href="/zip/"
      aria-label="Pay with Zip - learn more"
      className={`inline-flex items-center rounded transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${className}`}
    >
      <img
        src={ZIP_PAYMENT_BADGE_URL}
        alt="Zip"
        width={isHeader ? 48 : 55}
        height={24}
        loading={isHeader ? 'eager' : 'lazy'}
        className="h-6 w-auto"
      />
    </Link>
  );
}
