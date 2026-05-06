import { MapPin, Package, Settings } from 'lucide-react';
import { TRUST_STRIP } from '@/lib/site-config';

const ICONS = [MapPin, Package, Settings] as const;

/**
 * Compact three-item brand trust strip rendered below product detail
 * sections. One horizontal row on desktop, stacked on mobile. Single
 * line of body text per item — not card-boxed paragraph blocks.
 *
 * Copy lives in site-config (BUSINESS_INFO.trustStrip). The three
 * fixed slots map to MapPin / Package / Settings icons in order.
 * Reorder the array in business-info.ts to reorder the strip.
 *
 * Rendered on every product page; the homepage trust strip handles
 * the same messaging at full size — this is the smaller PDP variant.
 */
export function BrandTrustStrip() {
  return (
    <section
      aria-label="About Enviro Aqua"
      className="mt-12 border-t border-gray-200 pt-6"
    >
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
        {TRUST_STRIP.map((item, index) => {
          const Icon = ICONS[index] ?? MapPin;
          return (
            <li key={item.heading} className="flex items-start gap-3 text-sm">
              <Icon
                className="h-4 w-4 mt-1 flex-shrink-0 text-brand-blue"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-black">{item.heading}</p>
                <p className="mt-0.5 text-black/70 leading-snug">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
