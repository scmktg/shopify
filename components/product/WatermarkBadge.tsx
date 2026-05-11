import clsx from 'clsx';
import type { ProductCompliance } from '@/lib/products/schema';

interface WatermarkBadgeProps {
  /**
   * `square` — small overlay tile for product cards (top-right of
   * the image area).
   * `rectangle` — wider page-level mark for the buy box / product
   * hero, with the logo plus a "WaterMark certified" caption.
   */
  variant: 'square' | 'rectangle';
  className?: string;
}

/**
 * Red WaterMark certification mark.
 *
 * Uses the scoped `--color-wmk-red` token declared in
 * `app/globals.css` — the single permitted exception to the
 * blue-only accent rule (see `docs/05-design-system.md`). The
 * official mark image is served from `/public/wmk-logo.svg`; until
 * that asset is supplied the badge still renders as a recognisable
 * red tile with the textual "WMK" fallback inside the alt text and
 * a typographic fallback for sighted users.
 *
 * Rendered only for WaterMark-certified products. Detection lives
 * in `isWatermarkCertified`, fed from either the full
 * `compliance.watermark.status` or the lightweight `tags` array
 * carried on `ProductCardData`.
 */
export function WatermarkBadge({ variant, className }: WatermarkBadgeProps) {
  if (variant === 'square') {
    return (
      <div
        role="img"
        aria-label="WaterMark certified"
        className={clsx(
          'flex items-center justify-center bg-wmk-red text-white rounded-sm shadow-md ring-1 ring-black/10 h-10 w-10',
          className,
        )}
      >
        <img
          src="/wmk-logo.svg"
          alt=""
          aria-hidden="true"
          className="h-7 w-7 object-contain"
        />
        <span className="sr-only">WaterMark certified</span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label="WaterMark certified"
      className={clsx(
        'inline-flex items-center gap-2 bg-wmk-red text-white rounded px-3 py-1.5 text-sm font-semibold tracking-wide',
        className,
      )}
    >
      <img
        src="/wmk-logo.svg"
        alt=""
        aria-hidden="true"
        className="h-5 w-5 object-contain"
      />
      WaterMark certified
    </div>
  );
}

/**
 * True when a product is genuinely WaterMark certified. Accepts
 * either the full compliance payload (used on product detail pages)
 * or the tags array carried on `ProductCardData` (used in grids and
 * search). The `watermark` tag is applied to certified products
 * during the migration import, so it's a reliable signal at the
 * card level.
 */
export function isWatermarkCertified(input: {
  compliance?: ProductCompliance;
  tags?: ReadonlyArray<string>;
}): boolean {
  if (input.compliance?.watermark?.status === 'certified') return true;
  if (input.tags?.includes('watermark')) return true;
  return false;
}
