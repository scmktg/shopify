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
          'relative z-10 flex items-center justify-center bg-wmk-red text-white rounded-sm shadow-md ring-1 ring-black/10 h-11 w-11',
          className,
        )}
      >
        <BadgeMark className="h-7 w-7" />
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
      <BadgeMark className="h-5 w-5" />
      WaterMark certified
    </div>
  );
}

/**
 * The visible mark inside the red tile. Renders the supplied SVG at
 * `/public/wmk-logo.svg` layered above a "WMK" text fallback, so
 * the badge is still recognisable when the official asset hasn't
 * been dropped in yet. Once the SVG is present (transparent or
 * red-tinted background, white foreground) it covers the text.
 */
function BadgeMark({ className }: { className?: string }) {
  return (
    <span className={clsx('relative inline-flex items-center justify-center', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center font-bold leading-none tracking-tight text-[0.65rem]"
      >
        WMK
      </span>
      <img
        src="/wmk-logo.svg"
        alt=""
        aria-hidden="true"
        className="relative h-full w-full object-contain"
      />
    </span>
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
  // Accept both the documented `cert:watermark` form (per
  // docs/03-data-model.md tag taxonomy) and the bare `watermark`
  // form used in the offline migration data. Live Shopify product
  // tags currently use a mix.
  const tags = input.tags;
  if (!tags) return false;
  return tags.includes('watermark') || tags.includes('cert:watermark');
}
