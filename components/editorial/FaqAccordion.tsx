import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/lib/content/markdown';

interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
  variant?: 'default' | 'minimal';
}

export function FaqAccordion({ items, variant = 'default' }: FaqAccordionProps) {
  if (items.length === 0) return null;
  if (variant === 'minimal') {
    return (
      <div className="border-t border-black/10">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-black/10">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
              <h3 className="text-base font-medium leading-7 tracking-tight text-black sm:text-lg">{item.q}</h3>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/70 transition-colors group-open:bg-black group-open:text-white">
                <ChevronDown size={17} aria-hidden="true" className="transition-transform duration-200 group-open:rotate-180" />
              </span>
            </summary>
            <p className="max-w-3xl pb-6 pr-12 text-sm leading-7 text-black/65 sm:text-base">{item.a}</p>
          </details>
        ))}
      </div>
    );
  }
  return (
    <div className="border-t border-gray-200">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-gray-200">
          <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h3 className="text-base font-semibold text-black">{item.q}</h3>
            <ChevronDown
              size={20}
              aria-hidden="true"
              className="flex-shrink-0 mt-0.5 text-black/60 transition-transform duration-150 group-open:rotate-180"
            />
          </summary>
          <p className="pb-5 text-base text-black/80">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
