import { BUSINESS_INFO } from '@/content/business-info';
import { ReviewSourceLogo } from './ReviewSourceLogo';

interface LeaveReviewLinksProps {
  className?: string;
}

/**
 * Two outbound CTAs — leave a Google review or a Facebook
 * recommendation. Both URLs are read from env vars
 * (`NEXT_PUBLIC_GOOGLE_REVIEW_URL`, `NEXT_PUBLIC_FACEBOOK_REVIEW_URL`)
 * so they can be swapped without a deploy.
 *
 * Fallbacks:
 *   - Google: Maps search seeded with business name + locality, which
 *     Google resolves to the right profile.
 *   - Facebook: the public reviews tab for the page.
 */
export function LeaveReviewLinks({ className = '' }: LeaveReviewLinksProps) {
  const googleUrl =
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${BUSINESS_INFO.name} ${BUSINESS_INFO.address.locality} ${BUSINESS_INFO.address.region}`,
    )}`;

  const facebookUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_REVIEW_URL ??
    'https://facebook.com/EnviroAqua.com.au/reviews';

  const linkClasses =
    'inline-flex items-center gap-2 rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue';

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        <ReviewSourceLogo source="google" className="h-4 w-4" />
        Leave a Google review
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        <ReviewSourceLogo source="facebook" className="h-4 w-4" />
        Recommend on Facebook
      </a>
    </div>
  );
}
