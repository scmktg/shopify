import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/lib/content/markdown';

interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  if (items.length === 0) return null;
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
