import type { ReviewSource } from '@/types/review';

interface ReviewSourceLogoProps {
  source: ReviewSource;
  className?: string;
}

/**
 * Inline-SVG source attribution for a review. Monochrome at the
 * card level so the Google G and Facebook F read as a paired label
 * (the brief calls this out — attribution, not advertising). The
 * /reviews list reuses these at the same size, so accuracy of the
 * silhouettes matters more than colour.
 *
 * Accessible: `role="img"` + `aria-label` per Google's structured-
 * data review-snippet recommendation. Decorative <svg> attributes
 * are mirrored on both shapes for consistent rendering.
 */
export function ReviewSourceLogo({
  source,
  className = 'h-4 w-4',
}: ReviewSourceLogoProps) {
  if (source === 'google') {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label="Review from Google"
        className={className}
        fill="currentColor"
      >
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.84 3.18-1.74 4.16-1.1 1.18-2.82 2.48-5.84 2.48-4.66 0-8.31-3.76-8.31-8.42S8.08 3.99 12.74 3.99c2.52 0 4.36.99 5.71 2.26l2.3-2.3C18.74 2.02 16.22 1 12.74 1 6.4 1 1.07 6.16 1.07 12.5S6.4 24 12.74 24c3.42 0 5.99-1.12 8.01-3.22 2.06-2.06 2.7-4.96 2.7-7.3 0-.72-.06-1.39-.16-1.95H12.48z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="Review from Facebook"
      className={className}
      fill="currentColor"
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}
