import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

/**
 * Large red trust banner shown directly below the product image +
 * buy box on the product detail page. Pairs the two key compliance
 * signals — WaterMark certification and lead-free drinking-water
 * safety — into a single full-width strip.
 *
 * Rendered only when `compliance.watermark.status === 'certified'`.
 * In Australia, WaterMark certification under the current AS/NZS
 * regime requires compliance with AS/NZS 4020 (suitable for contact
 * with drinking water) and AS/NZS 5200.000 (low-lead plumbing),
 * which makes the paired claim accurate for any genuinely WMK-
 * certified product. If a specific certified product is an
 * exception, gate this banner with a per-product flag at the call
 * site.
 *
 * Uses the scoped `--color-wmk-red` token — the single permitted
 * exception to the blue-only accent rule (see
 * `docs/05-design-system.md`).
 */
export function CertificationBanner() {
  return (
    <section
      aria-label="Compliance and safety certifications"
      className="mt-8 md:mt-10 overflow-hidden rounded-lg bg-wmk-red text-white shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-white/15 sm:divide-y-0 sm:divide-x">
        <BannerCell
          eyebrow="Australian plumbing certification"
          title="WaterMark Certified"
          caption="Approved for plumbed-in installation under AS/NZS 3497."
          icon={<WmkMark />}
        />
        <BannerCell
          eyebrow="Drinking-water safe"
          title="Lead Free"
          caption="Complies with the Australian low-lead plumbing standard (AS/NZS 5200.000)."
          icon={
            <Check
              className="h-7 w-7"
              strokeWidth={3}
              aria-hidden="true"
            />
          }
        />
      </div>
    </section>
  );
}

interface BannerCellProps {
  eyebrow: string;
  title: string;
  caption: string;
  icon: ReactNode;
}

function BannerCell({ eyebrow, title, caption, icon }: BannerCellProps) {
  return (
    <div className="flex items-center gap-4 p-5 sm:p-6">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-white/10 ring-1 ring-white/25">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
          {eyebrow}
        </p>
        <p className="mt-0.5 text-lg md:text-xl font-bold leading-tight">
          {title}
        </p>
        <p className="mt-1 text-sm text-white/85">{caption}</p>
      </div>
    </div>
  );
}

/**
 * White WMK mark layered above a "WMK" text fallback. Same approach
 * as `WatermarkBadge` — once `/public/wmk-logo.svg` is supplied the
 * SVG covers the text; until then the cell still reads as a WMK
 * tile.
 */
function WmkMark() {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center">
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-[0.7rem] font-bold tracking-tight"
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
